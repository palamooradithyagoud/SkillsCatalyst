import csv
import logging
import os
import sys
from pathlib import Path

# Ensure root and backend directories are in sys.path for standalone execution
_BACKEND_DIR = Path(__file__).resolve().parent.parent          # backend/
_PROJECT_ROOT = _BACKEND_DIR.parent                             # project root
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from typing import Literal, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from backend.services.auth_service import get_session_or_user_id, require_authenticated_user
from backend.models.subscription import FeatureKey
from backend.dependencies.subscription import require_entitlement
from backend.services.supabase_service import get_supabase
from backend.services.rate_limiter import enforce_rate_limit

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/practice", tags=["practice"])

# ── Data directory ────────────────────────────────────────────────────────────
DATA_DIR = _PROJECT_ROOT / "data" / "leetcode-companywise-interview-questions-master"

TimePeriod = Literal["all", "six-months", "three-months", "thirty-days", "more-than-six-months"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _company_dir(company: str) -> Path:
    """Return the company folder path (normalised to lowercase, hyphens)."""
    return DATA_DIR / company.lower()


def _csv_path(company: str, period: TimePeriod) -> Path:
    filename = "all.csv" if period == "all" else f"{period}.csv"
    return _company_dir(company) / filename


def _parse_csv(path: Path) -> list[dict]:
    """Parse a company CSV into a list of question dicts."""
    rows = []
    try:
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_id = row.get("ID", "").strip()
                try:
                    q_id = int(raw_id)
                except ValueError:
                    q_id = 0
                rows.append({
                    "id": q_id,
                    "title": row.get("Title", "").strip(),
                    "url": row.get("URL", "").strip(),
                    "difficulty": row.get("Difficulty", "").strip(),
                    "acceptance": row.get("Acceptance %", "").strip(),
                    "frequency": row.get("Frequency %", "").strip(),
                })
    except FileNotFoundError:
        logger.warning(f"CSV not found: {path}")
    except Exception as e:
        logger.error(f"Error parsing CSV {path}: {e}", exc_info=True)
    return rows


def _list_companies() -> list[str]:
    """Return all valid company directory names sorted alphabetically."""
    if not DATA_DIR.exists():
        logger.error(f"Data directory not found: {DATA_DIR}")
        return []
    companies = []
    for d in DATA_DIR.iterdir():
        if d.is_dir() and (d / "all.csv").exists():
            companies.append(d.name)
    return sorted(companies, key=str.lower)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/companies")
async def list_companies():
    """
    Returns a sorted list of all available company slugs.
    Each slug maps directly to a subdirectory in the data folder.
    """
    companies = _list_companies()
    if not companies:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Company data directory not found. Check DATA_DIR configuration.",
        )
    logger.info(f"Listed {len(companies)} companies.")
    return {"count": len(companies), "companies": companies}


@router.get(
    "/questions/{company}",
)
async def get_company_questions(
    company: str,
    period: TimePeriod = Query("all", description="Time period: all | six-months | three-months | thirty-days | more-than-six-months"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Easy | Medium | Hard"),
    search: Optional[str] = Query(None, description="Search term for title"),
    limit: int = Query(100, ge=1, le=1000, description="Max questions to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    user_id: str = Depends(get_session_or_user_id),
):
    """
    Returns questions for a specific company from the CSV dataset.

    - **company**: slug matching a data directory (e.g. `amazon`, `google`, `deloitte`)
    - **period**: `all`, `six-months`, `three-months`, `thirty-days`, or `more-than-six-months`
    - **difficulty**: optional filter for Easy / Medium / Hard
    - **search**: optional title substring search
    - **limit** / **offset**: pagination
    """
    company_slug = company.lower().strip()
    valid_companies = set(c.lower() for c in _list_companies())
    if company_slug not in valid_companies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{company}' not found. Use GET /api/practice/companies to list all available companies.",
        )

    # Entitlement evaluation for company_interview_questions:
    # Free users can preview the first 3 questions per company; PRO users have unlimited access.
    from backend.services.subscription_service import SubscriptionService
    from backend.models.subscription import AccessLevel
    entitlements = SubscriptionService.get_user_entitlements(user_id)
    ent = entitlements.get(FeatureKey.COMPANY_INTERVIEW_QUESTIONS.value)
    is_premium = bool(ent and ent.access != AccessLevel.NONE)
    FREE_PREVIEW_LIMIT = 3

    csv_path = _csv_path(company_slug, period)

    if not csv_path.exists():
        # Fallback to all.csv if requested period file doesn't exist
        fallback = _csv_path(company_slug, "all")
        if fallback.exists():
            logger.info(f"Period '{period}' not found for '{company_slug}', falling back to all.csv")
            csv_path = fallback
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No CSV data found for company '{company}' (period: {period}).",
            )

    questions = _parse_csv(csv_path)

    # Apply filters safely
    if isinstance(difficulty, str) and difficulty.strip():
        diff_str = difficulty.strip().lower()
        questions = [q for q in questions if q.get("difficulty", "").lower() == diff_str]

    if isinstance(search, str) and search.strip():
        term = search.strip().lower()
        questions = [q for q in questions if term in q.get("title", "").lower()]

    total = len(questions)
    offset_val = offset if isinstance(offset, int) else 0
    limit_val = limit if isinstance(limit, int) else 100
    paginated = questions[offset_val: offset_val + limit_val]

    formatted_questions = []
    for idx, q in enumerate(paginated):
        is_locked = not is_premium and (offset_val + idx >= FREE_PREVIEW_LIMIT)
        q_copy = dict(q)
        q_copy["is_locked"] = is_locked
        if is_locked:
            q_copy["url"] = ""  # Redact direct solver URL for locked questions
        formatted_questions.append(q_copy)

    logger.info(
        f"Company '{company_slug}' period='{period}': returned {len(formatted_questions)}/{total} questions (is_premium={is_premium})."
    )

    return {
        "company": company_slug,
        "period": period,
        "total": total,
        "offset": offset_val,
        "limit": limit_val,
        "is_premium": is_premium,
        "free_preview_limit": FREE_PREVIEW_LIMIT,
        "questions": formatted_questions,
    }


@router.get(
    "/aptitude/{topic_slug}",
)
def get_aptitude_questions(topic_slug: str):
    """Return placement prep questions for a specific quantitative aptitude topic."""
    slug_norm = topic_slug.lower().strip()
    TOPICS_META = {
        # Quantitative Aptitude
        "percentages": {"topic": "Percentages", "total": 41},
        "percentage": {"topic": "Percentages", "total": 41},
        "profit-loss": {"topic": "Profit & Loss", "total": 38},
        "time-work": {"topic": "Time & Work", "total": 42},
        "time-speed-distance": {"topic": "Time, Speed & Distance", "total": 50},
        "probability": {"topic": "Probability", "total": 30},
        "permutations-combinations": {"topic": "Permutations & Combinations", "total": 35},

        # Logical Reasoning
        "blood-relations": {"topic": "Blood Relations", "total": 28},
        "seating-arrangement": {"topic": "Seating Arrangement", "total": 34},
        "coding-decoding": {"topic": "Coding-Decoding", "total": 40},
        "syllogisms": {"topic": "Syllogisms", "total": 25},
        "puzzles": {"topic": "Puzzles", "total": 32},

        # Verbal Ability
        "grammar": {"topic": "Grammar", "total": 60},
        "reading-comprehension": {"topic": "Reading Comprehension", "total": 20},
        "vocabulary": {"topic": "Vocabulary", "total": 100},
        "sentence-correction": {"topic": "Sentence Correction", "total": 45},
    }
    if slug_norm in TOPICS_META:
        meta = TOPICS_META[slug_norm]
        return {
            "topic": meta["topic"],
            "slug": slug_norm,
            "total": meta["total"],
            "free_preview_limit": 3,
            "default_timer_seconds": 60,
            "status": "ready"
        }
    return {
        "topic": topic_slug.capitalize(),
        "slug": slug_norm,
        "total": 0,
        "free_preview_limit": 0,
        "default_timer_seconds": 60,
        "status": "coming_soon"
    }


class AptitudeAttemptRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="Optional client user ID (must match authenticated identity)")
    topic_id: int = Field(..., ge=1, description="Aptitude topic ID")
    question_id: int = Field(..., ge=1, description="Aptitude question ID")
    selected_option_index: int = Field(..., ge=0, description="Selected option index (0-based)")
    is_correct: Optional[bool] = Field(None, description="Ignored by server; correctness is evaluated server-side")
    time_taken_seconds: int = Field(0, ge=0, description="Time spent in seconds on this question")


@router.post(
    "/aptitude/attempt",
    dependencies=[
        Depends(enforce_rate_limit(max_requests=120, window_seconds=60)),
        Depends(require_authenticated_user),
    ],
)
def record_aptitude_attempt(
    attempt: AptitudeAttemptRequest,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """
    Store user practice attempt with server-verified correctness and time taken.
    - Validates question existence against authoritative `aptitude_questions` table.
    - Determines correctness server-side by comparing selected_option_index to correct_index.
    - Enforces ownership: attempt is strictly bound to authenticated user's ID.
    - Persists attempt metadata into `user_aptitude_attempts`.
    - Protected by rate limiting, authentication, and freemium preview limits.
    """
    authenticated_user_id = str(current_user.get("user_id") or "").strip()
    if not authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token."
        )

    # Enforce attempt ownership: reject attempt if client tries to forge another user's attempt
    if attempt.user_id and str(attempt.user_id).strip() != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot record attempt for another user."
        )

    # Entitlement evaluation: Freemium model allows attempts on preview questions (<= 3).
    # Questions beyond 3 require active PLACEMENT_PREP entitlement.
    from backend.services.subscription_service import SubscriptionService
    from backend.models.subscription import AccessLevel
    entitlements = SubscriptionService.get_user_entitlements(authenticated_user_id)
    ent = entitlements.get(FeatureKey.PLACEMENT_PREP.value)
    is_premium = bool(ent and ent.access != AccessLevel.NONE)
    FREE_PREVIEW_LIMIT = 3
    if not is_premium and attempt.question_id > FREE_PREVIEW_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "PREMIUM_REQUIRED",
                "feature": FeatureKey.PLACEMENT_PREP.value,
                "message": "Premium subscription required to attempt questions beyond the free preview.",
            },
        )

    # Validate question identifier
    if attempt.question_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question ID {attempt.question_id} is invalid."
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable."
        )

    # 1. Fetch authoritative question details from database
    try:
        q_res = (
            sb.table("aptitude_questions")
            .select("id, topic_id, correct_index, options")
            .eq("id", attempt.question_id)
            .execute()
        )
    except Exception as fetch_err:
        logger.error(f"Error querying aptitude_questions for ID {attempt.question_id}: {fetch_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query question from database."
        )

    if not q_res or not q_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {attempt.question_id} not found."
        )

    question_row = q_res.data[0]
    authoritative_correct_index = int(question_row["correct_index"])
    topic_id = question_row.get("topic_id") or attempt.topic_id

    # Validate option index bounds if options list is present
    options = question_row.get("options")
    if isinstance(options, list) and len(options) > 0:
        if attempt.selected_option_index >= len(options):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Selected option index {attempt.selected_option_index} out of range (total options: {len(options)})."
            )

    # 2. Authoritative server-side evaluation (NEVER trust client's is_correct)
    server_computed_is_correct = (attempt.selected_option_index == authoritative_correct_index)

    # 3. Persist attempt to user_aptitude_attempts table
    attempt_record = {
        "user_id": authenticated_user_id,
        "topic_id": topic_id,
        "question_id": attempt.question_id,
        "selected_option_index": attempt.selected_option_index,
        "is_correct": server_computed_is_correct,
        "time_taken_seconds": attempt.time_taken_seconds,
    }

    try:
        sb.table("user_aptitude_attempts").upsert(
            attempt_record,
            on_conflict="user_id,question_id"
        ).execute()
        logger.info(
            f"Persisted aptitude attempt: user={authenticated_user_id}, question_id={attempt.question_id}, "
            f"is_correct={server_computed_is_correct}, time={attempt.time_taken_seconds}s"
        )
    except Exception as db_err:
        logger.warning(f"Could not persist attempt to user_aptitude_attempts: {db_err}")

    # 4. Construct response adhering to existing API contract without leaking solution details
    attempt_response_data = {
        "user_id": authenticated_user_id,
        "topic_id": topic_id,
        "question_id": attempt.question_id,
        "selected_option_index": attempt.selected_option_index,
        "is_correct": server_computed_is_correct,
        "time_taken_seconds": attempt.time_taken_seconds,
    }

    return {
        "status": "success",
        "message": "User question attempt and time taken successfully recorded in SQL schema",
        "attempt": attempt_response_data,
    }


if __name__ == "__main__":
    print(f"SkillsCatalyst Practice router initialized successfully. DATA_DIR={DATA_DIR}")



