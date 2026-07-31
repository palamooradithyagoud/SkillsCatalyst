import logging
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator
from backend.services.groq_service import chat_with_groq

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-mentor", tags=["ai-mentor"])


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
    "🎯 I'm **SkillPath AI Mentor** — I'm built exclusively to help you with:\n\n"
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


# ---------------------------------------------------------------------------
# Strict skills-only system prompt for general chat
# ---------------------------------------------------------------------------

_SKILLS_SYSTEM_PROMPT = (
    "You are SkillPath AI Mentor — an expert career coach, DSA instructor, and tech interviewer. "
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

@router.post("/chat")
async def chat_mentor(req: PromptRequest):
    """
    Skills-only AI mentor chat endpoint.
    Guards against off-topic queries before hitting the LLM.
    """
    logger.info(f"AI mentor chat request (prompt length={len(req.prompt)}).")

    # Off-topic guard: fast-path check before calling the LLM (saves API cost)
    if _is_offtopic(req.prompt):
        logger.info(f"Off-topic prompt detected, returning redirect message. Prompt: '{req.prompt[:80]}'")
        return {"reply": _OFFTOPIC_REPLY}

    response = chat_with_groq(req.prompt, system_prompt=_SKILLS_SYSTEM_PROMPT)

    # Secondary guard: if LLM somehow wandered off-topic, check its reply
    # (very rare with a strict system prompt, but good defence-in-depth)
    if response and _is_offtopic(response) and not _SKILL_PATTERNS.search(response):
        logger.warning("LLM replied with potentially off-topic content — overriding with redirect.")
        return {"reply": _OFFTOPIC_REPLY}

    return {"reply": response}


@router.post("/review-resume")
async def review_resume(req: ResumeReviewRequest):
    """
    Performs a full AI-powered resume review using Groq LLM.

    Accepts clean plain text (extracted by /api/resume/extract), plus
    context about the target role, experience level, and company type.
    Never receives or processes binary file data.
    """
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
        f"Resume review requested: role='{target_role}', company='{company_type}', "
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

    review_text = chat_with_groq(user_prompt, system_prompt=system_prompt)

    if not review_text or review_text.startswith("AI Mentor error:"):
        logger.error(f"Groq returned an error response: {review_text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "success": False,
                "message": "AI evaluator is temporarily unavailable. Please try again.",
            },
        )

    logger.info(f"Resume review completed ({len(review_text)} chars returned).")
    return {"review": review_text}
