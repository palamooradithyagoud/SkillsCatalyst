import asyncio
import logging
import re
from collections import defaultdict
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, field_validator
from backend.services.auth_service import get_current_user_id, get_session_or_user_id, is_valid_uuid
from backend.services.groq_service import (
    chat_with_groq,
    _AI_UNAVAILABLE_MSG,
    get_ai_semaphore,
    acquire_ai_slot,
    run_bounded_ai_call,
)
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_AI_RPM
from backend.models.subscription import FeatureKey, EntitlementDetailDTO
from backend.dependencies.subscription import require_entitlement
from backend.services.ai_mentor import (
    MentorContext,
    build_student_mentor_context,
    get_formatted_student_context_for_mentor,
    ConversationResponse,
    ConversationListResponse,
    ConversationDetailResponse,
    ConversationCreateRequest,
    MentorChatRequest,
    MentorChatResponse,
    create_conversation,
    get_conversation,
    list_conversations,
    delete_conversation,
    save_message,
    get_recent_messages,
    derive_conversation_title,
    build_mentor_llm_messages,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-mentor", tags=["ai-mentor"])

# Persistent, thread-safe, and distributed quota tracking for AI mentor usage (BUG-E-1)
from backend.services.ai_mentor_quota_service import (
    get_ai_mentor_usage,
    reserve_ai_mentor_slot,
    commit_ai_mentor_reservation,
    release_ai_mentor_slot,
    increment_ai_mentor_usage,
    decrement_ai_mentor_usage,
    reset_ai_mentor_usage,
    QuotaStorageUnavailableError,
    QuotaReservationResult,
)



# ---------------------------------------------------------------------------
# Off-topic detection helpers
# ---------------------------------------------------------------------------

# Keywords that strongly indicate a non-skill, non-career query
_OFFTOPIC_PATTERNS = re.compile(
    r"\b("
    # Entertainment
    r"movie|movies|film|films|series|web.?series|netflix|amazon.?prime|disney|hotstar|ott|"
    r"song|songs|music|album|band|singer|actor|actress|celebrity|bollywood|hollywood|"
    r"cricket|ipl|football|soccer|nfl|nba|sports|match|tournament|team|player|"
    r"recipe|food|cook|cooking|restaurant|dish|eat|meal|"
    # Personal / life
    r"girlfriend|boyfriend|relationship|marriage|wedding|love|date|dating|breakup|"
    r"joke|meme|funny|laugh|entertainment|prank|"
    # News / politics
    r"politics|election|president|prime.?minister|government|modi|trump|biden|parliament|"
    r"news|headline|current.?affairs|weather|forecast|"
    # Other off-topic
    r"astrology|horoscope|zodiac|religion|god|prayer|"
    r"stock|crypto|bitcoin|forex|invest(?!ment|ing in tech)"  # allow "investing in tech"
    r")\b",
    re.IGNORECASE,
)

# Safe-list: if any of these skill/career words appear, allow even if an off-topic
# keyword also appears (e.g. "how do I use Python to analyse cricket data?" is OK)
_SKILL_PATTERNS = re.compile(
    r"\b("
    r"python|java|javascript|typescript|react|vue|angular|node|django|flask|fastapi|"
    r"machine.?learning|deep.?learning|ai|ml|data.?science|nlp|llm|neural|"
    r"dsa|algorithm|data.?structure|leetcode|competitive.?programming|"
    r"system.?design|cloud|aws|azure|gcp|devops|docker|kubernetes|"
    r"sql|database|mongodb|postgres|redis|"
    r"interview|resume|career|job|internship|salary|roadmap|skill|course|"
    r"html|css|frontend|backend|fullstack|api|rest|graphql|"
    r"git|github|ci.?cd|linux|bash|shell|"
    r"c\+\+|golang|rust|kotlin|swift|flutter|dart|"
    r"cybersecurity|networking|os|operating.?system|"
    r"project|portfolio|startup|tech|software|engineer|developer|programmer"
    r")\b",
    re.IGNORECASE,
)

MAX_PROMPT_LENGTH = 3000
MIN_PROMPT_LENGTH = 3


def _is_offtopic(prompt: str) -> bool:
    """
    Returns True if the prompt looks off-topic (not about skills/career/tech).
    A prompt is off-topic when:
      - It matches known off-topic patterns, AND
      - It does NOT contain any recognisable skill/career keyword.
    """
    has_offtopic = bool(_OFFTOPIC_PATTERNS.search(prompt))
    if not has_offtopic:
        return False
    # If the user also mentioned a skill, allow it (context: "cricket data analysis in Python")
    has_skill = bool(_SKILL_PATTERNS.search(prompt))
    return not has_skill


_OFFTOPIC_REPLY = (
    "🎯 I'm **SkillsCatalyst AI Mentor** — I'm built exclusively to help you with:\n\n"
    "• **Programming & DSA** (Python, Java, C++, Data Structures, Algorithms)\n"
    "• **System Design** (architecture, scalability, databases)\n"
    "• **Interview Prep** (FAANG, product companies, coding rounds)\n"
    "• **Career Guidance** (roadmaps, resume, job hunting, salary negotiation)\n"
    "• **Tech Tools & Frameworks** (React, Node, Docker, AWS, etc.)\n\n"
    "Please ask me something about skills, tech, or your career path! 🚀"
)


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class PromptRequest(BaseModel):
    prompt: str

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        stripped = v.strip() if v else ""
        if not stripped or len(stripped) < MIN_PROMPT_LENGTH:
            raise ValueError(
                f"Prompt is too short. Please ask a meaningful question about skills or your career (min {MIN_PROMPT_LENGTH} characters)."
            )
        if len(stripped) > MAX_PROMPT_LENGTH:
            raise ValueError(
                f"Prompt is too long ({len(stripped)} chars). Please keep it under {MAX_PROMPT_LENGTH} characters."
            )
        return stripped


class ResumeReviewRequest(BaseModel):
    resume_text: str
    target_role: str
    years_experience: Optional[str] = "1-3 years"
    company_type: Optional[str] = "Product-Based"
    job_description: Optional[str] = None

    @field_validator("resume_text")
    @classmethod
    def resume_text_must_be_meaningful(cls, v: str) -> str:
        if not v or len(v.strip()) < 50:
            raise ValueError(
                "resume_text is too short. Please provide at least 50 characters of resume content."
            )
        return v.strip()

    @field_validator("target_role")
    @classmethod
    def target_role_required(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("target_role cannot be empty.")
        return v.strip()


class ResumeReviewResponse(BaseModel):
    review: str
    overall_score: Optional[float] = None
    scoring_status: str = "scored"  # "scored" | "unscored"


def extract_and_validate_resume_score(review_text: str) -> Optional[float]:
    """
    Extracts and normalizes the overall ATS score (0.00 - 100.00) from AI review markdown.

    Precedence & Conflict Resolution Rules:
    1. Tier 1 Authoritative Labels: 'Final Score', 'Overall Score'.
       Tier 2 Secondary / Alias Labels: 'ATS Score', 'Total Score', 'Score'.
    2. Tier 1 always takes precedence over Tier 2, regardless of document order:
       - 'ATS Score: 92/100 followed by Final Score: 65/100' -> evaluates to 65.0.
       - 'Final Score: 65/100 followed by ATS Score: 92/100' -> evaluates to 65.0.
    3. Conflicting values under the same label tier:
       - Duplicate 'Final Score' or conflicting Tier 1 scores (e.g. 65 vs 80) -> returns None (ambiguous).
    4. Invalid explicit overall scores fail closed:
       - If an explicit overall score is present but out-of-bounds (e.g. 'Final Score: 15/10')
         or malformed (e.g. 'Final Score: 8/20'), it returns None.
       - It does NOT fall back to section scores.
    5. Section-score fallback is permitted ONLY when NO explicit overall score was attempted:
       - Requires at least 3 valid section scores ('ATS Compatibility', 'Role Alignment', 'Impact', 'Structure').
       - If any found section score is invalid or out-of-bounds, returns None.
    6. If neither a valid explicit score nor sufficient valid section scores exists:
       - Returns None (strictly no fabricated default scores).
    """
    if not review_text or not isinstance(review_text, str):
        return None

    def _normalize_match(val_str: str, denom_str: str) -> Optional[float]:
        try:
            val = float(val_str)
            denom = float(denom_str)
        except (ValueError, TypeError):
            return None

        if denom == 10.0:
            if 0.0 <= val <= 10.0:
                return round(val * 10.0, 2)
            return None
        elif denom == 100.0:
            if 0.0 <= val <= 100.0:
                return round(val, 2)
            return None
        return None

    clean_text = review_text.replace("**", " ").replace("*", " ").replace("`", "")

    # 1. Search for all explicit overall score patterns
    explicit_pattern = re.compile(
        r"\b(Final\s*Score|Overall\s*Score|ATS\s*Score|Total\s*Score|Score)\s*[:=\-]*\s*(-?\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\b",
        re.IGNORECASE,
    )
    raw_matches = explicit_pattern.findall(clean_text)

    tier1_scores = []
    tier1_has_invalid = False
    tier2_scores = []
    tier2_has_invalid = False

    for label, val_str, denom_str in raw_matches:
        norm = _normalize_match(val_str, denom_str)
        is_tier1 = bool(re.match(r"^(Final|Overall)\s*Score$", label.strip(), re.IGNORECASE))
        if is_tier1:
            if norm is None:
                tier1_has_invalid = True
            else:
                tier1_scores.append(norm)
        else:
            if norm is None:
                tier2_has_invalid = True
            else:
                tier2_scores.append(norm)

    # If Tier 1 explicit score existed:
    if raw_matches and any(re.match(r"^(Final|Overall)\s*Score$", m[0].strip(), re.IGNORECASE) for m in raw_matches):
        if tier1_has_invalid:
            # Out-of-bounds or malformed Tier 1 score: fail closed, do not fall back
            return None
        # Check for conflicting duplicate Tier 1 values
        if len(set(tier1_scores)) > 1:
            return None  # Conflicting explicit scores
        if tier1_scores:
            return tier1_scores[0]

    # If Tier 2 explicit score existed (no Tier 1):
    if raw_matches:
        if tier2_has_invalid:
            return None
        if len(set(tier2_scores)) > 1:
            return None  # Conflicting Tier 2 scores
        if tier2_scores:
            return tier2_scores[0]

    # 2. Check if an explicit overall score label was attempted with non-numeric/corrupted formatting
    explicit_attempt = re.search(
        r"\b(Final\s*Score|Overall\s*Score|ATS\s*Score|Total\s*Score|Score)\s*[:=\-]*\s*([^\n\r]+)",
        clean_text,
        re.IGNORECASE,
    )
    if explicit_attempt:
        # An explicit overall score was attempted but couldn't be parsed as a valid fraction
        return None

    # 3. Section scores fallback (only when no explicit overall score was present)
    section_matches = re.findall(
        r"(?:ATS\s*Compatibility|Role\s*Alignment|Impact|Structure)\s*[:=\-]*\s*(-?\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\b",
        clean_text,
        re.IGNORECASE,
    )
    if section_matches:
        scores = []
        for s_val_str, s_denom_str in section_matches:
            norm = _normalize_match(s_val_str, s_denom_str)
            if norm is None:
                return None  # Out-of-bounds section score rejects entire fallback
            scores.append(norm)

        if len(scores) >= 3:
            return round(sum(scores) / len(scores), 2)

    return None


# ---------------------------------------------------------------------------
# Strict skills-only system prompt for general chat
# ---------------------------------------------------------------------------

_SKILLS_SYSTEM_PROMPT = (
    "You are SkillsCatalyst AI Mentor — an expert career coach, DSA instructor, and tech interviewer. "
    "Your ONLY purpose is to help users with:\n"
    "1. Programming languages and concepts (Python, Java, C++, JavaScript, etc.)\n"
    "2. Data Structures & Algorithms (DSA), LeetCode, competitive programming\n"
    "3. System Design (architecture, scalability, databases, APIs)\n"
    "4. Interview preparation (FAANG, product companies, coding interviews, HR rounds)\n"
    "5. Career guidance (roadmaps, resume tips, job hunting, salary, promotions)\n"
    "6. Tech tools & frameworks (React, Node.js, Django, Docker, AWS, Git, etc.)\n"
    "7. Computer Science fundamentals (OS, Networking, DBMS, OOP, etc.)\n\n"
    "STRICT RULES:\n"
    "- If a user asks about anything NOT related to skills, tech, programming, or careers, "
    "politely decline and redirect them to ask a skill/career question.\n"
    "- Never answer questions about movies, entertainment, sports, politics, relationships, "
    "food, astrology, or any non-tech topic.\n"
    "- Always be helpful, direct, and technically accurate.\n"
    "- Use markdown formatting for code, lists, and explanations.\n"
    "- When giving code examples, always specify the language."
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/context", response_model=MentorContext)
async def get_mentor_context_endpoint(
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Returns the structured, sanitized AI Mentor context for the authenticated user.
    Strictly isolated to the authenticated user ID (JWT sub).
    """
    return await build_student_mentor_context(current_user_id)


# ---------------------------------------------------------------------------
# Phase 2: Persistent Conversation Management Endpoints
# ---------------------------------------------------------------------------

@router.get("/conversations", response_model=ConversationListResponse)
def list_user_conversations(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Lists conversations owned by the authenticated student.
    Strictly isolated by authenticated JWT identity with pagination.
    """
    items, total = list_conversations(current_user_id, limit=limit, offset=offset)
    return {
        "conversations": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_new_conversation(
    req: ConversationCreateRequest = ConversationCreateRequest(),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Creates a new conversation record owned by the authenticated student.
    """
    conv = create_conversation(current_user_id, title=req.title)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create conversation.",
        )
    return conv


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_detail(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves a conversation and its recent messages.
    Strictly enforces ownership; returns 404 if not found or unauthorized (IDOR defense).
    """
    if not is_valid_uuid(conversation_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    conv = get_conversation(current_user_id, conversation_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    messages = get_recent_messages(current_user_id, conversation_id, limit=50)
    return {
        "conversation": conv,
        "messages": messages,
    }


@router.delete("/conversations/{conversation_id}")
def delete_conversation_endpoint(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Deletes a conversation and cascades all messages.
    Strictly enforces ownership; returns 404 if not found or unauthorized.
    """
    if not is_valid_uuid(conversation_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    deleted = delete_conversation(current_user_id, conversation_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied.")

    return {"success": True, "message": "Conversation deleted successfully."}


# ---------------------------------------------------------------------------
# AI Mentor Chat Endpoint (Phase 1 + Phase 2 Persistent Memory)
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=MentorChatResponse, dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_AI_RPM))])
async def chat_mentor(
    req: MentorChatRequest,
    current_user_id: str = Depends(get_session_or_user_id),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.AI_MENTOR.value)),
):
    """
    Skills-only AI mentor chat endpoint with persistent conversation memory.
    - Authenticated users: persist user & assistant messages in Supabase, load bounded multi-turn context.
    - Unauthenticated guests: fall back to stateless chat without database persistence.
    - Guards against quota exhaustion and off-topic queries before hitting the LLM.
    - Enriches system prompt with aggregated student background when authenticated.
    """
    if entitlement.limit is not None:
        try:
            usage = get_ai_mentor_usage(current_user_id)
            if usage >= entitlement.limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "ai_mentor",
                        "limit": entitlement.limit,
                    },
                )
        except QuotaStorageUnavailableError:
            logger.error(f"Quota storage unavailable during pre-check for user {current_user_id}.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "QUOTA_UNAVAILABLE",
                    "message": "Usage limit verification is temporarily unavailable. Please try again shortly.",
                    "feature": "ai_mentor",
                },
            )

    prompt_text = req.get_text()
    logger.info(f"AI mentor chat request (prompt length={len(prompt_text)}, conv={req.conversation_id}).")

    # Off-topic guard: fast-path check before calling the LLM (saves API cost and zero quota consumed)
    if _is_offtopic(prompt_text):
        logger.info(f"Off-topic prompt detected, returning redirect message. Prompt: '{prompt_text[:80]}'")
        return MentorChatResponse(reply=_OFFTOPIC_REPLY, conversation_id=req.conversation_id, message_id=None)

    # Atomic quota reservation before invoking LLM provider under concurrency
    reservation_id = None
    if entitlement.limit is not None:
        try:
            res = reserve_ai_mentor_slot(current_user_id, limit=entitlement.limit)
            if not res.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "ai_mentor",
                        "limit": entitlement.limit,
                    },
                )
            reservation_id = res.reservation_id
        except QuotaStorageUnavailableError:
            logger.error(f"Quota storage unavailable during reservation for user {current_user_id}.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "QUOTA_UNAVAILABLE",
                    "message": "Usage limit verification is temporarily unavailable. Please try again shortly.",
                    "feature": "ai_mentor",
                },
            )

    # -----------------------------------------------------------------------
    # Authenticated Student Path: Persistent Conversation Memory & Multi-Turn
    # -----------------------------------------------------------------------
    if is_valid_uuid(current_user_id):
        conv_id = req.conversation_id
        if conv_id:
            if not is_valid_uuid(conv_id):
                if reservation_id:
                    release_ai_mentor_slot(current_user_id, reservation_id)
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
            existing_conv = await asyncio.to_thread(get_conversation, current_user_id, conv_id)
            if not existing_conv:
                if reservation_id:
                    release_ai_mentor_slot(current_user_id, reservation_id)
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        else:
            # Auto-create conversation with clean deterministic title from first message
            auto_title = derive_conversation_title(prompt_text)
            new_conv = await asyncio.to_thread(create_conversation, current_user_id, title=auto_title)
            conv_id = new_conv["id"] if new_conv else None

        # 1. Persist user message to database (safeguard against LLM failure)
        user_msg = None
        prior_messages = []
        if conv_id:
            user_msg = await asyncio.to_thread(save_message, current_user_id, conv_id, "user", prompt_text)
            # Retrieve bounded recent history (excluding the current user message just inserted)
            prior_messages = await asyncio.to_thread(get_recent_messages, current_user_id, conv_id, limit=15)

        # 2. Enrich system prompt with Phase 1 authenticated student context
        effective_system_prompt = _SKILLS_SYSTEM_PROMPT
        try:
            formatted_context = await get_formatted_student_context_for_mentor(current_user_id)
            if formatted_context:
                effective_system_prompt = f"{_SKILLS_SYSTEM_PROMPT}\n\n{formatted_context}"
        except Exception as ctx_err:
            logger.warning(f"Error fetching student context for mentor chat: {ctx_err}")

        # 3. Assemble bounded multi-turn LLM message structure
        current_msg_id = user_msg.get("id") if user_msg else None
        llm_messages = build_mentor_llm_messages(
            system_prompt=effective_system_prompt,
            history_messages=prior_messages,
            current_user_message=prompt_text,
            current_message_id=current_msg_id,
        )

        # 4. Invoke LLM provider with bounded deadline watchdog and slot retention
        response = None
        try:
            try:
                response = await run_bounded_ai_call(
                    chat_with_groq,
                    prompt=prompt_text,
                    system_prompt=effective_system_prompt,
                    messages=llm_messages,
                )
            except TypeError:
                response = await run_bounded_ai_call(
                    chat_with_groq,
                    prompt_text,
                    system_prompt=effective_system_prompt,
                )
        except HTTPException as http_exc:
            detail_str = str(http_exc.detail)
            # If acquire timeout: semaphore was full, prompt never reached Groq -> safe to refund
            # If hard deadline timeout: prompt was in flight with Groq -> uncertain outcome, do not blindly refund!
            if "hard deadline" in detail_str.lower():
                logger.warning(f"AI provider hard deadline exceeded (uncertain outcome). User={current_user_id}, res={reservation_id}.")
            else:
                if reservation_id:
                    release_ai_mentor_slot(current_user_id, reservation_id)
            raise
        except Exception:
            if reservation_id:
                release_ai_mentor_slot(current_user_id, reservation_id)
            raise

        # 5. Handle LLM failure: User message preserved, NO fake assistant message written
        if not response or response == _AI_UNAVAILABLE_MSG:
            logger.warning("Groq call failed or returned unavailable message; user message preserved, no assistant response saved.")
            if reservation_id:
                release_ai_mentor_slot(current_user_id, reservation_id)
            return MentorChatResponse(reply=_AI_UNAVAILABLE_MSG, conversation_id=conv_id, message_id=None)

        # Provider succeeded: commit reservation so it can never be refunded
        if reservation_id:
            commit_ai_mentor_reservation(current_user_id, reservation_id)

        # 6. Secondary guard: check LLM reply
        if response and isinstance(response, str) and _is_offtopic(response) and not _SKILL_PATTERNS.search(response):
            logger.warning("LLM replied with potentially off-topic content — overriding with redirect.")
            response = _OFFTOPIC_REPLY

        # 7. Persist assistant response to database
        asst_msg_id = None
        if conv_id and response != _OFFTOPIC_REPLY:
            asst_msg = await asyncio.to_thread(save_message, current_user_id, conv_id, "assistant", response)
            asst_msg_id = asst_msg.get("id") if asst_msg else None

        return MentorChatResponse(reply=response, conversation_id=conv_id, message_id=asst_msg_id)

    # -----------------------------------------------------------------------
    # Guest Path: Stateless fallback without persistence
    # -----------------------------------------------------------------------
    response = None
    try:
        response = await run_bounded_ai_call(
            chat_with_groq,
            prompt=prompt_text,
            system_prompt=_SKILLS_SYSTEM_PROMPT,
        )
    except HTTPException as http_exc:
        detail_str = str(http_exc.detail)
        if "hard deadline" in detail_str.lower():
            logger.warning(f"AI provider hard deadline exceeded in guest path. User={current_user_id}, res={reservation_id}.")
        else:
            if reservation_id:
                release_ai_mentor_slot(current_user_id, reservation_id)
        raise
    except Exception:
        if reservation_id:
            release_ai_mentor_slot(current_user_id, reservation_id)
        raise

    if not response or response == _AI_UNAVAILABLE_MSG:
        logger.warning("Groq call failed or returned unavailable message; guest path.")
        if reservation_id:
            release_ai_mentor_slot(current_user_id, reservation_id)
        return MentorChatResponse(reply=_AI_UNAVAILABLE_MSG, conversation_id=None, message_id=None)

    if reservation_id:
        commit_ai_mentor_reservation(current_user_id, reservation_id)

    if response and isinstance(response, str) and _is_offtopic(response) and not _SKILL_PATTERNS.search(response):
        logger.warning("LLM replied with potentially off-topic content — overriding with redirect.")
        return MentorChatResponse(reply=_OFFTOPIC_REPLY, conversation_id=None, message_id=None)

    return MentorChatResponse(reply=response, conversation_id=None, message_id=None)


@router.post(
    "/review-resume",
    response_model=ResumeReviewResponse,
    dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_AI_RPM))],
)
async def review_resume(
    req: ResumeReviewRequest,
    current_user_id: str = Depends(get_current_user_id),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.AI_MENTOR.value)),
):
    """
    Performs a full AI-powered resume review using Groq LLM and persists score into Supabase.
    """
    if entitlement.limit is not None:
        try:
            usage = get_ai_mentor_usage(current_user_id)
            if usage >= entitlement.limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "ai_mentor",
                        "limit": entitlement.limit,
                    },
                )
        except QuotaStorageUnavailableError:
            logger.error(f"Quota storage unavailable during pre-check for user {current_user_id}.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "QUOTA_UNAVAILABLE",
                    "message": "Usage limit verification is temporarily unavailable. Please try again shortly.",
                    "feature": "ai_mentor",
                },
            )

    # Atomic quota reservation before invoking LLM provider under concurrency
    reservation_id = None
    if entitlement.limit is not None:
        try:
            res = reserve_ai_mentor_slot(current_user_id, limit=entitlement.limit)
            if not res.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "ai_mentor",
                        "limit": entitlement.limit,
                    },
                )
            reservation_id = res.reservation_id
        except QuotaStorageUnavailableError:
            logger.error(f"Quota storage unavailable during reservation for user {current_user_id}.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "code": "QUOTA_UNAVAILABLE",
                    "message": "Usage limit verification is temporarily unavailable. Please try again shortly.",
                    "feature": "ai_mentor",
                },
            )
    target_role = req.target_role
    years_exp = req.years_experience or "1-3 years"
    company_type = req.company_type or "Product-Based"
    job_desc = (
        f"\nJob Description:\n{req.job_description.strip()}"
        if req.job_description and req.job_description.strip()
        else ""
    )
    resume_text = req.resume_text

    logger.info(
        f"Resume review requested: user='{current_user_id}', role='{target_role}', company='{company_type}', "
        f"exp='{years_exp}', resume_chars={len(resume_text)}."
    )

    system_prompt = (
        "You are an expert ATS Resume Reviewer and Hiring Manager "
        "with 15+ years of experience across tech roles."
    )

    user_prompt = f"""Your task is to analyze a candidate's resume against a TARGET ROLE and provide a brutally honest, high-quality, actionable review.

INPUTS:
1. Resume Content (clean plain text extracted from candidate's document):
{resume_text}

2. Target Role (Job Title + optional Job Description):
Job Title: {target_role}{job_desc}
Claimed Seniority: {years_exp}
Target Company Type: {company_type}

---

EVALUATION FRAMEWORK:

1. ATS COMPATIBILITY
- Check keyword optimization for the target role
- Identify missing critical keywords
- Evaluate formatting issues that may break ATS
- Score ATS compatibility (0–10)

2. ROLE ALIGNMENT
- How well does the resume match the target role?
- Identify irrelevant content
- Highlight missing role-specific skills
- Score alignment (0–10)

3. IMPACT & ACHIEVEMENTS
- Are bullet points result-driven or task-based?
- Check for quantification (metrics, numbers, outcomes)
- Rewrite 3–5 weak bullets into strong impact statements
- Score impact (0–10)

4. STRUCTURE & CLARITY
- Evaluate readability and flow
- Section ordering effectiveness
- Conciseness and clarity
- Score structure (0–10)

5. SKILLS & PROJECTS ANALYSIS
- Are skills relevant and properly categorized?
- Are projects strong enough for the target role?
- Suggest improvements or missing projects

---

OUTPUT FORMAT:

## 🧠 Overall Verdict
- Short, direct evaluation (2–3 lines)
- Final Score: X/10
- Hire / No Hire / Borderline

## 📊 Section-wise Scores
- ATS Compatibility: X/10
- Role Alignment: X/10
- Impact: X/10
- Structure: X/10

## ❌ Critical Issues (Top 5)
- List major problems clearly

## 🔧 Bullet Fixes (Before → After)
- Rewrite at least 3 weak bullet points into strong, quantified versions

## 📈 Missing Keywords
- List important keywords missing for the target role

## 🚀 Improvement Plan
- Step-by-step actions to improve the resume

## ✨ Optional Advanced Suggestions
- Portfolio / GitHub / certifications / projects to add

---

STRICT RULES:
- Be brutally honest, avoid generic praise
- Give specific rewrites, not vague suggestions
- Focus on impact, metrics, and role relevance
- Assume this resume is competing at a top 10% level"""

    try:
        review_text = await run_bounded_ai_call(chat_with_groq, user_prompt, system_prompt=system_prompt)
    except HTTPException as http_exc:
        detail_str = str(http_exc.detail)
        if "hard deadline" in detail_str.lower():
            logger.warning(f"AI provider hard deadline exceeded in review_resume. User={current_user_id}, res={reservation_id}.")
        else:
            if reservation_id:
                release_ai_mentor_slot(current_user_id, reservation_id)
        raise
    except Exception:
        if reservation_id:
            release_ai_mentor_slot(current_user_id, reservation_id)
        raise

    if not review_text or review_text == _AI_UNAVAILABLE_MSG:
        logger.error(f"Groq returned an error response: {review_text}")
        if reservation_id:
            release_ai_mentor_slot(current_user_id, reservation_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "success": False,
                "message": "AI evaluator is temporarily unavailable. Please try again.",
            },
        )

    # Provider succeeded: commit reservation so it can never be refunded
    if reservation_id:
        commit_ai_mentor_reservation(current_user_id, reservation_id)

    # 1. Authoritative score extraction and validation
    overall_score = extract_and_validate_resume_score(review_text)
    scoring_status = "scored" if overall_score is not None else "unscored"

    # 2. Persist resume score and review into Supabase ONLY if a valid score exists
    if overall_score is not None:
        try:
            from backend.services.supabase_service import get_supabase
            import datetime

            sb = get_supabase()
            if sb:
                user_id = current_user_id
                score_record = {
                    "user_id": user_id,
                    "filename": "resume.pdf",
                    "target_role": target_role,
                    "company_type": company_type,
                    "overall_score": overall_score,
                    "ats_compatibility_score": overall_score,
                    "skills_match_score": overall_score,
                    "experience_score": overall_score,
                    "full_review_json": {"review": review_text},
                }
                def _persist_resume_score():
                    sb.table("resume_scores").insert(score_record).execute()
                    sb.table("user_progress").upsert(
                        {
                            "user_id": user_id,
                            "resume_readiness_score": overall_score,
                            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        },
                        on_conflict="user_id"
                    ).execute()

                await asyncio.to_thread(_persist_resume_score)
        except Exception as save_err:
            logger.warning(f"Failed to persist resume score to Supabase: {save_err}")

    logger.info(f"Resume review completed ({len(review_text)} chars returned, score={overall_score}, status={scoring_status}).")
    return ResumeReviewResponse(
        review=review_text,
        overall_score=overall_score,
        scoring_status=scoring_status,
    )
