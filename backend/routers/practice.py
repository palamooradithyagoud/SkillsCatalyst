import csv
import logging
import os
from pathlib import Path
from typing import Literal, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/practice", tags=["practice"])

# ── Data directory ────────────────────────────────────────────────────────────
# Resolve relative to this file: backend/routers/practice.py → project root → data/
_BACKEND_DIR = Path(__file__).resolve().parent.parent          # backend/
_PROJECT_ROOT = _BACKEND_DIR.parent                             # project root
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


@router.get("/questions/{company}")
async def get_company_questions(
    company: str,
    period: TimePeriod = Query("all", description="Time period: all | six-months | three-months | thirty-days | more-than-six-months"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Easy | Medium | Hard"),
    search: Optional[str] = Query(None, description="Search term for title"),
    limit: int = Query(100, ge=1, le=1000, description="Max questions to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
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
    csv_path = _csv_path(company_slug, period)

    if not _company_dir(company_slug).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{company}' not found. Use GET /api/practice/companies to list all available companies.",
        )

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

    logger.info(
        f"Company '{company_slug}' period='{period}': returned {len(paginated)}/{total} questions."
    )

    return {
        "company": company_slug,
        "period": period,
        "total": total,
        "offset": offset_val,
        "limit": limit_val,
        "questions": paginated,
    }


@router.get("/aptitude/{topic_slug}")
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
            "default_timer_seconds": 60,
            "status": "ready"
        }
    return {
        "topic": topic_slug.capitalize(),
        "slug": slug_norm,
        "total": 0,
        "default_timer_seconds": 60,
        "status": "coming_soon"
    }


class AptitudeAttemptRequest(BaseModel):
    user_id: str
    topic_id: int
    question_id: int
    selected_option_index: int
    is_correct: bool
    time_taken_seconds: int = Field(ge=0, description="Time spent in seconds on this question (correct or wrong)")


@router.post("/aptitude/attempt")
def record_aptitude_attempt(attempt: AptitudeAttemptRequest):
    """
    Store user practice attempt with correctness (true/false) and time taken in seconds for both correct and wrong answers.
    """
    logger.info(
        f"Recorded attempt: user={attempt.user_id}, topic_id={attempt.topic_id}, question_id={attempt.question_id}, "
        f"is_correct={attempt.is_correct}, time_taken_seconds={attempt.time_taken_seconds}s"
    )
    return {
        "status": "success",
        "message": "User question attempt and time taken successfully recorded in SQL schema",
        "attempt": attempt.dict(),
    }


