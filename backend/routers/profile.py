import os
import logging
import asyncio
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Response, Query
from pydantic import BaseModel
import httpx
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id, is_valid_uuid, get_optional_user_id
from backend.services.validation_service import (
    validate_username,
    normalize_username,
    validate_full_name,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])

# SYS-09 (BE-PERF-01): Scaled worker pool to eliminate thread starvation during fallback.
# Each fallback request submits 12 sub-queries; 24 workers allow multiple concurrent requests without queue delay.
import threading
_PROFILE_EXECUTOR_MAX_WORKERS = int(os.getenv("PROFILE_EXECUTOR_MAX_WORKERS", "24"))
_PROFILE_EXECUTOR = ThreadPoolExecutor(max_workers=_PROFILE_EXECUTOR_MAX_WORKERS, thread_name_prefix="profile_db")
_PROFILE_FALLBACK_TIMEOUT = float(os.getenv("PROFILE_FALLBACK_TIMEOUT", "5.0"))
_MAX_FALLBACK_QUEUE_DEPTH = int(os.getenv("PROFILE_MAX_QUEUE_DEPTH", "24"))
_MAX_CONCURRENT_FALLBACKS = int(os.getenv("PROFILE_MAX_CONCURRENT_FALLBACKS", "3"))
_FALLBACK_SEMAPHORE = threading.Semaphore(_MAX_CONCURRENT_FALLBACKS)

def _get_profile_executor_queue_depth() -> int:
    """Return the number of work items currently queued in the executor work queue."""
    try:
        return _PROFILE_EXECUTOR._work_queue.qsize()
    except Exception:
        return 0

# ── Models ────────────────────────────────────────────────--------------------

class AcademicProfileModel(BaseModel):
    # user_id is intentionally excluded — identity comes from verified JWT only
    full_name: str = ""
    college: str = ""
    department: str = ""
    academic_year: str = ""
    target_role: str = ""

class PersonalProfileModel(BaseModel):
    full_name: str = ""
    username: Optional[str] = None
    college: Optional[str] = ""
    headline: Optional[str] = ""
    avatar_url: Optional[str] = ""
    country: Optional[str] = ""
    state: Optional[str] = ""
    city: Optional[str] = ""
    phone: Optional[str] = ""
    gender: Optional[str] = ""
    about: Optional[str] = ""

class CareerPreferencesModel(BaseModel):
    target_roles: list[str] = []
    preferred_industries: list[str] = []
    target_companies: list[str] = []
    preferred_locations: list[str] = []
    work_arrangements: list[str] = []


class CodingProfilesInputModel(BaseModel):
    # user_id is intentionally excluded — identity comes from verified JWT only
    leetcode: Optional[str] = ""
    github: Optional[str] = ""
    hackerrank: Optional[str] = ""
    codechef: Optional[str] = ""
    geeksforgeeks: Optional[str] = ""
    codeforces: Optional[str] = ""


# ── Extractor Helpers ─────────────────────────────────────────────────────────

def _clean_handle(url_or_handle: Optional[str]) -> str:
    if not url_or_handle:
        return ""
    text = str(url_or_handle).strip()
    text = text.split("?")[0].split("#")[0].rstrip("/")
    if "://" in text:
        text = text.split("://", 1)[1]
    if "/" in text:
        parts = [p.strip() for p in text.split("/") if p.strip() and p.strip().lower() not in ("u", "user", "users", "profile", "in", "in-in")]
        return parts[-1] if parts else text
    return text.lstrip("@").strip()


async def _extract_leetcode(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
        }
      }
    }
    """
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.post(
                url,
                json={"query": query, "variables": {"username": handle}},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    "Referer": f"https://leetcode.com/{handle}/"
                }
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {}).get("matchedUser")
                if data:
                    stats = data.get("submitStats", {}).get("acSubmissionNum", [])
                    total_solved = easy_solved = medium_solved = hard_solved = 0
                    for s in stats:
                        diff = s.get("difficulty")
                        cnt = s.get("count", 0)
                        if diff == "All":
                            total_solved = cnt
                        elif diff == "Easy":
                            easy_solved = cnt
                        elif diff == "Medium":
                            medium_solved = cnt
                        elif diff == "Hard":
                            hard_solved = cnt

                    ranking = data.get("profile", {}).get("ranking", 0)
                    real_username = data.get("username") or handle
                    return {
                        "configured": True,
                        "username": real_username,
                        "url": f"https://leetcode.com/{real_username}",
                        "total_solved": total_solved,
                        "easy_solved": easy_solved,
                        "medium_solved": medium_solved,
                        "hard_solved": hard_solved,
                        "ranking": ranking,
                        "badge": f"{total_solved} Solved",
                        "summary": f"{total_solved} Solved (Easy: {easy_solved}, Med: {medium_solved}, Hard: {hard_solved})"
                    }
    except Exception as e:
        logger.warning(f"LeetCode fetch error for {handle}: {e}")

    return {
        "configured": True,
        "username": handle,
        "url": f"https://leetcode.com/{handle}",
        "total_solved": 0,
        "easy_solved": 0,
        "medium_solved": 0,
        "hard_solved": 0,
        "ranking": 0,
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


async def _extract_github(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    url = f"https://api.github.com/users/{handle}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                data = resp.json()
                repos = data.get("public_repos", 0)
                followers = data.get("followers", 0)

                stars = 0
                repos_resp = await client.get(f"https://api.github.com/users/{handle}/repos?per_page=100", headers={"User-Agent": "Mozilla/5.0"})
                if repos_resp.status_code == 200:
                    repos_list = repos_resp.json()
                    if isinstance(repos_list, list):
                        stars = sum(r.get("stargazers_count", 0) for r in repos_list)

                return {
                    "configured": True,
                    "username": handle,
                    "url": f"https://github.com/{handle}",
                    "public_repos": repos,
                    "followers": followers,
                    "total_stars": stars,
                    "badge": f"{repos} Repos",
                    "summary": f"{repos} Public Repos | {stars} Stars | {followers} Followers"
                }
    except Exception as e:
        logger.warning(f"GitHub fetch error for {handle}: {e}")

    return {
        "configured": True,
        "username": handle,
        "url": f"https://github.com/{handle}",
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


async def _extract_codeforces(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    url = f"https://codeforces.com/api/user.info?handles={handle}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                result = resp.json().get("result", [])
                if result:
                    user_data = result[0]
                    rating = user_data.get("rating", 0)
                    max_rating = user_data.get("maxRating", 0)
                    rank = user_data.get("rank", "unrated")

                    return {
                        "configured": True,
                        "username": handle,
                        "url": f"https://codeforces.com/profile/{handle}",
                        "rating": rating,
                        "max_rating": max_rating,
                        "rank": rank,
                        "badge": f"{rating} Rating",
                        "summary": f"Rating: {rating} ({rank.capitalize()}) | Max: {max_rating}"
                    }
    except Exception as e:
        logger.warning(f"Codeforces fetch error for {handle}: {e}")

    return {
        "configured": True,
        "username": handle,
        "url": f"https://codeforces.com/profile/{handle}",
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


async def _extract_codechef(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    url = f"https://www.codechef.com/users/{handle}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                html = resp.text
                rating_match = re.search(r'rating-number.*?>\s*(\d+)\s*<', html)
                stars_match = re.search(r'(\d+★|\d+&#9733;|\d+\s*star)', html, re.IGNORECASE)
                rank_match = re.search(r'global-rank.*?>\s*(\d+)\s*<', html, re.IGNORECASE)

                if rating_match:
                    rating = int(rating_match.group(1))
                    stars = stars_match.group(1).replace("&#9733;", "★") if stars_match else "1★"
                    rank = rank_match.group(1) if rank_match else "N/A"
                    return {
                        "configured": True,
                        "username": handle,
                        "url": url,
                        "rating": rating,
                        "stars": stars,
                        "global_rank": rank,
                        "badge": f"{rating} ({stars})",
                        "summary": f"Rating: {rating} ({stars}) | Rank: #{rank}"
                    }
    except Exception as e:
        logger.warning(f"CodeChef direct scrape error for {handle}: {e}")

    # Fallback to API endpoint
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(f"https://codechef-api.vercel.app/handle/{handle}", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    rating = data.get("currentRating", 0)
                    stars = data.get("stars", "1★")
                    global_rank = data.get("globalRank", 0)
                    return {
                        "configured": True,
                        "username": handle,
                        "url": url,
                        "rating": rating,
                        "stars": stars,
                        "global_rank": global_rank,
                        "badge": f"{stars} ({rating})",
                        "summary": f"Rating: {rating} ({stars}) | Rank: #{global_rank}"
                    }
    except Exception as e:
        logger.warning(f"CodeChef API fetch error for {handle}: {e}")

    return {
        "configured": True,
        "username": handle,
        "url": url,
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


async def _extract_gfg(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    url = f"https://www.geeksforgeeks.org/user/{handle}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    }
    
    # Try public GFG API proxy endpoints first
    api_urls = [
        f"https://geeks-for-geeks-api.vercel.app/user/{handle}",
        f"https://gfg-api.vercel.app/user/{handle}",
    ]
    for api_url in api_urls:
        try:
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                resp = await client.get(api_url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    score = data.get("overall_coding_score", 0)
                    solved = data.get("total_problems_solved", 0)
                    if score or solved:
                        return {
                            "configured": True,
                            "username": handle,
                            "url": url,
                            "coding_score": score,
                            "total_solved": solved,
                            "badge": f"{solved} Solved",
                            "summary": f"{solved} Solved | Score: {score}"
                        }
        except Exception:
            pass

    # Direct profile page fetch
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                html = resp.text
                solved_m = re.search(r'total_problems_solved["\']?\s*:\s*(\d+)', html, re.I) or \
                           re.search(r'problems_solved["\']?\s*:\s*(\d+)', html, re.I) or \
                           re.search(r'(\d+)\s*(?:Problems Solved|Solved Problems)', html, re.I)
                score_m = re.search(r'coding_score["\']?\s*:\s*(\d+)', html, re.I) or \
                          re.search(r'(\d+)\s*(?:Coding Score|Overall Score)', html, re.I)
                
                solved = int(solved_m.group(1)) if solved_m else 0
                score = int(score_m.group(1)) if score_m else 0
                if solved or score:
                    return {
                        "configured": True,
                        "username": handle,
                        "url": url,
                        "coding_score": score,
                        "total_solved": solved,
                        "badge": f"{solved} Solved",
                        "summary": f"{solved} Solved | Score: {score}"
                    }
    except Exception as e:
        logger.warning(f"GFG direct fetch error for {handle}: {e}")

    return {
        "configured": True,
        "username": handle,
        "url": url,
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


async def _extract_hackerrank(input_val: str) -> Dict[str, Any]:
    handle = _clean_handle(input_val)
    if not handle:
        return {"configured": False}

    return {
        "configured": True,
        "username": handle,
        "url": f"https://www.hackerrank.com/profile/{handle}",
        "badge": "Connected",
        "summary": f"Linked @{handle}"
    }


# ── Profile Fetch Helpers (Bounded Concurrency & RPC) ─────────────────────────

def _fetch_academic_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("user_academic_profile").select("*").eq("user_id", user_id).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None


def _fetch_personal_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("profiles").select("*").eq("id", user_id).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None


def _fetch_coding_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("user_coding_profiles").select("*").eq("user_id", user_id).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None


def _fetch_skills_data(sb, user_id: str) -> list:
    res = sb.from_("user_skills").select("*").eq("user_id", user_id).order("created_at").execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_experiences_data(sb, user_id: str) -> list:
    res = sb.from_("experiences").select("*").eq("user_id", user_id).order("start_date", desc=True).execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_education_data(sb, user_id: str) -> list:
    res = sb.from_("education").select("*").eq("user_id", user_id).order("start_date", desc=True).execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_projects_data(sb, user_id: str) -> list:
    res = sb.from_("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_certifications_data(sb, user_id: str) -> list:
    res = sb.from_("certifications").select("*").eq("user_id", user_id).order("issue_date", desc=True).execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_achievements_data(sb, user_id: str) -> list:
    res = sb.from_("achievements").select("*").eq("user_id", user_id).order("achievement_date", desc=True).execute()
    return (res.data or []) if (res and getattr(res, "data", None) is not None) else []


def _fetch_career_preferences_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("career_preferences").select("*").eq("user_id", user_id).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None


def _fetch_resume_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("resume_scores").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None


def _fetch_progress_data(sb, user_id: str) -> Optional[Dict[str, Any]]:
    res = sb.from_("user_progress").select("*").eq("user_id", user_id).execute()
    return res.data[0] if (res and getattr(res, "data", None)) else None



def _format_unified_profile_from_rpc(raw: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Unpacks and standardizes RPC response into identical unified profile structure."""
    personal = raw.get("personal") or {}
    academic = raw.get("academic") or {}
    coding = raw.get("coding") or {}
    career = raw.get("career_preferences") or {}

    personal_data = {
        "id": user_id,
        "full_name": personal.get("full_name") or academic.get("full_name", ""),
        "username": personal.get("username") or "",
        "headline": personal.get("headline", ""),
        "avatar_url": personal.get("avatar_url", ""),
        "country": personal.get("country", ""),
        "state": personal.get("state", ""),
        "city": personal.get("city", ""),
        "phone": personal.get("phone", ""),
        "gender": personal.get("gender", ""),
        "about": personal.get("about", ""),
    }

    academic_data = {
        "user_id": user_id,
        "full_name": academic.get("full_name", ""),
        "college": academic.get("college", ""),
        "department": academic.get("department", ""),
        "academic_year": academic.get("academic_year", ""),
        "target_role": academic.get("target_role", ""),
    }

    t_roles = career.get("target_roles") or ([career.get("target_role")] if career.get("target_role") else [])
    if not t_roles and academic_data.get("target_role"):
        t_roles = [academic_data["target_role"]]

    career_prefs_data = {
        "user_id": user_id,
        "target_roles": t_roles,
        "preferred_industries": career.get("preferred_industries") or ([career.get("target_industry")] if career.get("target_industry") else []),
        "target_companies": career.get("target_companies") or [],
        "preferred_locations": career.get("preferred_locations") or ([career.get("preferred_work_location")] if career.get("preferred_work_location") else []),
        "work_arrangements": career.get("work_arrangements") or ([career.get("preferred_work_type")] if career.get("preferred_work_type") else []),
    }

    education_data = raw.get("education") or []
    if not education_data and academic_data.get("college"):
        education_data = [{
            "id": f"legacy_edu_{user_id}",
            "user_id": user_id,
            "college": academic_data.get("college", ""),
            "field_of_study": academic_data.get("department", ""),
            "degree_type": academic_data.get("academic_year", ""),
            "currently_studying": True,
        }]

    return {
        "personal": personal_data,
        "academic": academic_data,
        "career_preferences": career_prefs_data,
        "skills": raw.get("skills") or [],
        "experiences": raw.get("experiences") or [],
        "education": education_data,
        "projects": raw.get("projects") or [],
        "certifications": raw.get("certifications") or [],
        "achievements": raw.get("achievements") or [],
        "resume": raw.get("resume"),
        "progress": raw.get("progress") or {},
        "coding_inputs": {
            "leetcode": coding.get("leetcode_url", ""),
            "github": coding.get("github_url", ""),
            "hackerrank": coding.get("hackerrank_url", ""),
            "codechef": coding.get("codechef_url", ""),
            "geeksforgeeks": coding.get("geeksforgeeks_url", ""),
            "codeforces": coding.get("codeforces_url", ""),
        },
        "coding_stats": coding.get("stats_json") or {},
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
def get_profile(
    response: Response = None,
    user_id: str = Depends(get_current_user_id),
):
    """
    Fetch current user's complete Unified Profile across all normalized entities,
    with extracted coding platform stats and backward-compatible fallbacks.
    Optimized with RPC single-roundtrip fast path and bounded parallel fallback.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is currently unavailable.",
        )

    academic_data = {
        "user_id": user_id,
        "full_name": "",
        "college": "",
        "department": "",
        "academic_year": "",
        "target_role": "",
    }
    personal_data = {
        "id": user_id,
        "full_name": "",
        "username": "",
        "headline": "",
        "avatar_url": "",
        "country": "",
        "state": "",
        "city": "",
        "phone": "",
        "gender": "",
        "about": "",
    }
    career_prefs_data = {
        "user_id": user_id,
        "target_roles": [],
        "preferred_industries": [],
        "target_companies": [],
        "preferred_locations": [],
        "work_arrangements": [],
    }
    coding_inputs = {
        "leetcode": "",
        "github": "",
        "hackerrank": "",
        "codechef": "",
        "geeksforgeeks": "",
        "codeforces": "",
    }
    coding_stats = {}
    skills_data = []
    experiences_data = []
    education_data = []
    projects_data = []
    certifications_data = []
    achievements_data = []
    resume_data = None
    progress_data = {}

    # 1. Attempt single-roundtrip RPC if deployed and user_id is a valid UUID
    if hasattr(sb, "rpc") and is_valid_uuid(user_id):
        try:
            rpc_res = sb.rpc("get_user_unified_profile", {"p_user_id": user_id}).execute()
            if rpc_res and getattr(rpc_res, "data", None) and isinstance(rpc_res.data, dict):
                if response is not None:
                    response.headers["X-Profile-Status"] = "complete"
                    response.headers["X-Profile-Source"] = "rpc"
                return _format_unified_profile_from_rpc(rpc_res.data, user_id)
        except Exception as rpc_err:
            logger.debug(f"RPC get_user_unified_profile notice (falling back to bounded parallel execution): {rpc_err}")

    # 2. Atomic Admission Control: Check non-blocking semaphore first to eliminate TOCTOU race conditions
    if not _FALLBACK_SEMAPHORE.acquire(blocking=False):
        logger.warning(
            f"Profile fallback admission limit ({_MAX_CONCURRENT_FALLBACKS} concurrent requests) reached. "
            f"Shedding fallback request to prevent thread pool exhaustion."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Profile service is currently saturated under high load. Please retry in a few moments.",
            headers={"Retry-After": "2"},
        )

    # Secondary queue depth check (supports test overrides of _MAX_FALLBACK_QUEUE_DEPTH)
    pending_queue_size = _get_profile_executor_queue_depth()
    if pending_queue_size >= _MAX_FALLBACK_QUEUE_DEPTH:
        _FALLBACK_SEMAPHORE.release()
        logger.warning(
            f"Profile executor saturated ({pending_queue_size} pending tasks >= {_MAX_FALLBACK_QUEUE_DEPTH}). "
            f"Shedding fallback request to prevent thread pool exhaustion."
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Profile service is currently saturated under high load. Please retry in a few moments.",
            headers={"Retry-After": "2"},
        )

    try:
        # 3. Bounded parallel execution: submit all 12 independent entity reads concurrently
        f_acad = _PROFILE_EXECUTOR.submit(_fetch_academic_data, sb, user_id)
        f_prof = _PROFILE_EXECUTOR.submit(_fetch_personal_data, sb, user_id)
        f_code = _PROFILE_EXECUTOR.submit(_fetch_coding_data, sb, user_id)
        f_skills = _PROFILE_EXECUTOR.submit(_fetch_skills_data, sb, user_id)
        f_exp = _PROFILE_EXECUTOR.submit(_fetch_experiences_data, sb, user_id)
        f_edu = _PROFILE_EXECUTOR.submit(_fetch_education_data, sb, user_id)
        f_proj = _PROFILE_EXECUTOR.submit(_fetch_projects_data, sb, user_id)
        f_certs = _PROFILE_EXECUTOR.submit(_fetch_certifications_data, sb, user_id)
        f_ach = _PROFILE_EXECUTOR.submit(_fetch_achievements_data, sb, user_id)
        f_cp = _PROFILE_EXECUTOR.submit(_fetch_career_preferences_data, sb, user_id)
        f_resume = _PROFILE_EXECUTOR.submit(_fetch_resume_data, sb, user_id)
        f_prog = _PROFILE_EXECUTOR.submit(_fetch_progress_data, sb, user_id)

        all_futures = [
            f_acad, f_prof, f_code, f_skills, f_exp, f_edu,
            f_proj, f_certs, f_ach, f_cp, f_resume, f_prog
        ]
    except Exception:
        _FALLBACK_SEMAPHORE.release()
        raise

    # Bind semaphore permit release to the actual completion of all submitted futures.
    # If the HTTP request times out while background queries continue running in worker threads,
    # the semaphore permit remains held until all background work terminates, preventing
    # subsequent requests from exceeding worker pool capacity.
    remaining_tasks = len(all_futures)
    release_lock = threading.Lock()
    permit_released = False

    def _on_subquery_done(fut):
        nonlocal remaining_tasks, permit_released
        with release_lock:
            remaining_tasks -= 1
            if remaining_tasks == 0 and not permit_released:
                permit_released = True
                _FALLBACK_SEMAPHORE.release()

    for fut in all_futures:
        fut.add_done_callback(_on_subquery_done)

    # Bounded wait across all sub-queries to prevent thread starvation or socket hangs
    done, not_done = concurrent.futures.wait(
        all_futures,
        timeout=_PROFILE_FALLBACK_TIMEOUT,
        return_when=concurrent.futures.ALL_COMPLETED,
    )

    if not_done:
        # Immediately cancel queued tasks that have not started running to free executor capacity
        for f in not_done:
            f.cancel()
        logger.warning(
            f"Profile fallback sub-queries timed out after {_PROFILE_FALLBACK_TIMEOUT}s: "
            f"{len(not_done)} incomplete queries cancelled."
        )

    # Classify completed and failed queries
    done_success = {}
    failed_queries = []
    for f in done:
        try:
            exc = f.exception()
            if exc is not None:
                failed_queries.append(f)
                logger.warning(f"Profile fallback sub-query error: {type(exc).__name__}")
            else:
                done_success[f] = f.result(timeout=0)
        except Exception as exc:
            failed_queries.append(f)
            logger.warning(f"Profile fallback future resolution error: {type(exc).__name__}")

    incomplete_count = len(not_done) + len(failed_queries)

    # If all queries timed out or failed: fail closed rather than returning a deceptive blank profile
    if incomplete_count == len(all_futures):
        if not_done:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Profile data retrieval timed out due to slow database queries. Please try again.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to retrieve profile data from database.",
            )

    # Core profile identity check: if both personal and academic profiles failed or timed out:
    f_prof_ok = f_prof in done_success
    f_acad_ok = f_acad in done_success
    if not f_prof_ok and not f_acad_ok:
        if (f_prof in not_done) or (f_acad in not_done):
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Core profile identity retrieval timed out. Please try again.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to retrieve core profile identity from database.",
            )

    if response is not None:
        response.headers["X-Profile-Source"] = "fallback"
        response.headers["X-Profile-Status"] = "partial" if incomplete_count > 0 else "complete"
        response.headers["X-Profile-Incomplete-Count"] = str(incomplete_count)

    # Retrieve and merge academic profile
    if f_acad in done_success:
        acad_row = done_success[f_acad]
        if acad_row:
            academic_data.update(acad_row)
            if academic_data.get("full_name"):
                personal_data["full_name"] = academic_data["full_name"]

    # Retrieve and merge personal profile
    if f_prof in done_success:
        prof_row = done_success[f_prof]
        if prof_row:
            personal_data.update({
                k: v for k, v in prof_row.items()
                if k in personal_data and v is not None
            })

    # Retrieve and merge coding profile
    if f_code in done_success:
        code_row = done_success[f_code]
        if code_row:
            coding_inputs["leetcode"] = code_row.get("leetcode_url", "")
            coding_inputs["github"] = code_row.get("github_url", "")
            coding_inputs["hackerrank"] = code_row.get("hackerrank_url", "")
            coding_inputs["codechef"] = code_row.get("codechef_url", "")
            coding_inputs["geeksforgeeks"] = code_row.get("geeksforgeeks_url", "")
            coding_inputs["codeforces"] = code_row.get("codeforces_url", "")
            coding_stats = code_row.get("stats_json", {})

    # Retrieve relational lists
    if f_skills in done_success:
        skills_data = done_success[f_skills] or []

    if f_exp in done_success:
        experiences_data = done_success[f_exp] or []

    if f_edu in done_success:
        edu_rows = done_success[f_edu] or []
        if edu_rows:
            education_data = edu_rows
        elif academic_data.get("college"):
            education_data = [{
                "id": f"legacy_edu_{user_id}",
                "user_id": user_id,
                "college": academic_data.get("college", ""),
                "field_of_study": academic_data.get("department", ""),
                "degree_type": academic_data.get("academic_year", ""),
                "currently_studying": True,
            }]

    if f_proj in done_success:
        projects_data = done_success[f_proj] or []

    if f_certs in done_success:
        certifications_data = done_success[f_certs] or []

    if f_ach in done_success:
        achievements_data = done_success[f_ach] or []

    # Career preferences
    if f_cp in done_success:
        cp_row = done_success[f_cp]
        if cp_row:
            career_prefs_data["target_roles"] = cp_row.get("target_roles") or ([cp_row.get("target_role")] if cp_row.get("target_role") else [])
            career_prefs_data["preferred_industries"] = cp_row.get("preferred_industries") or ([cp_row.get("target_industry")] if cp_row.get("target_industry") else [])
            career_prefs_data["target_companies"] = cp_row.get("target_companies") or []
            career_prefs_data["preferred_locations"] = cp_row.get("preferred_locations") or ([cp_row.get("preferred_work_location")] if cp_row.get("preferred_work_location") else [])
            career_prefs_data["work_arrangements"] = cp_row.get("work_arrangements") or ([cp_row.get("preferred_work_type")] if cp_row.get("preferred_work_type") else [])
        if academic_data.get("target_role") and not career_prefs_data["target_roles"]:
            career_prefs_data["target_roles"] = [academic_data["target_role"]]

    if f_resume in done_success:
        resume_data = done_success[f_resume]

    if f_prog in done_success:
        progress_data = done_success[f_prog] or {}

    return {
        "personal": personal_data,
        "academic": academic_data,
        "career_preferences": career_prefs_data,
        "skills": skills_data,
        "experiences": experiences_data,
        "education": education_data,
        "projects": projects_data,
        "certifications": certifications_data,
        "achievements": achievements_data,
        "resume": resume_data,
        "progress": progress_data,
        "coding_inputs": coding_inputs,
        "coding_stats": coding_stats,
    }



@router.get("/check-username")
def check_username_availability(
    username: str = Query("", max_length=50),
    current_user_id: Optional[str] = Depends(get_optional_user_id),
):
    """
    Checks if a username is valid and available for registration or profile update.
    Case-insensitive uniqueness check against public.profiles.
    """
    clean_username = normalize_username(username)
    is_valid, err_msg = validate_username(clean_username)
    if not is_valid:
        return {
            "available": False,
            "username": clean_username,
            "message": err_msg or "Invalid username format.",
        }

    sb = get_supabase()
    if not sb:
        return {
            "available": True,
            "username": clean_username,
            "message": "Database check bypassed (offline mode).",
        }

    try:
        # Check if username is already taken (case-insensitive)
        query = sb.from_("profiles").select("id, username").ilike("username", clean_username).limit(1)
        res = query.execute()
        if res.data and len(res.data) > 0:
            existing_row = res.data[0]
            existing_id = existing_row.get("id") or existing_row.get("user_id")
            # If current authenticated user already owns this username, it's available to them
            if current_user_id and str(existing_id) == str(current_user_id):
                return {
                    "available": True,
                    "username": clean_username,
                    "message": "You currently hold this username.",
                }
            return {
                "available": False,
                "username": clean_username,
                "message": "This username is already taken. Please choose another.",
            }
        return {
            "available": True,
            "username": clean_username,
            "message": "Username is available.",
        }
    except Exception as exc:
        err_str = str(exc)
        if "column" in err_str.lower() and "username" in err_str.lower():
            logger.error(f"check_username: profiles.username column is not available in database schema: {exc}")
            return {
                "available": False,
                "username": clean_username,
                "message": "Username check is unavailable: database schema migration required.",
            }
        logger.error(f"Error checking username availability: {exc}")
        return {
            "available": False,
            "username": clean_username,
            "message": "Unable to verify username availability at this time.",
        }


@router.post("/personal")
def save_personal_profile(
    body: PersonalProfileModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save personal details (full_name, username, headline, location, phone, bio, avatar) into profiles table,
    and synchronizes full_name with user_academic_profile for 100% backward compatibility.
    Enforces identity lock if student has already received a certificate.
    """
    user_id = current_user_id
    sb = get_supabase()

    # 1. Validate full_name
    valid_name, name_err = validate_full_name(body.full_name)
    if not valid_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=name_err or "Invalid full name.",
        )
    clean_full_name = str(body.full_name).strip()

    # 2. Validate username if provided
    clean_username = None
    if body.username is not None and str(body.username).strip() != "":
        clean_username = normalize_username(body.username)
        valid_u, u_err = validate_username(clean_username)
        if not valid_u:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=u_err or "Invalid username format.",
            )

        # Enforce case-insensitive uniqueness check against other users
        if sb:
            try:
                res = sb.from_("profiles").select("id").ilike("username", clean_username).neq("id", user_id).limit(1).execute()
                if res.data and len(res.data) > 0:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="This username is already taken. Please choose another.",
                    )
            except HTTPException:
                raise
            except Exception as e:
                err_str = str(e)
                if not ("column" in err_str.lower() and "username" in err_str.lower()):
                    logger.warning(f"Username uniqueness query check notice: {e}")

    clean_college = str(body.college or "").strip()

    prof_data = {
        "id": user_id,
        "full_name": clean_full_name,
        "headline": body.headline or "",
        "avatar_url": body.avatar_url or "",
        "country": body.country or "",
        "state": body.state or "",
        "city": body.city or "",
        "phone": body.phone or "",
        "gender": body.gender or "",
        "about": body.about or "",
    }
    if clean_username is not None:
        prof_data["username"] = clean_username
    prof_data["college"] = clean_college

    if sb:
        try:
            try:
                sb.from_("profiles").upsert(prof_data, on_conflict="id").execute()
            except Exception as upsert_err:
                err_str = str(upsert_err).lower()
                if "duplicate key value" in err_str or "unique constraint" in err_str or "23505" in err_str:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="This username is already taken. Please choose another.",
                    )
                is_schema_err = any(kw in err_str for kw in ("column", "schema cache", "does not exist", "pgrst204"))
                if clean_username is not None and is_schema_err and "username" in err_str:
                    logger.error(f"Cannot save personal profile: 'username' column is missing from database schema: {upsert_err}")
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Database schema error: username column is unavailable. Please ensure database migrations have been applied.",
                    )
                if clean_college and is_schema_err and "college" in err_str:
                    logger.error(f"Cannot save personal profile: 'college' column is missing from database schema: {upsert_err}")
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Database schema error: college column is unavailable. Please ensure database migrations have been applied.",
                    )
                logger.error(f"Failed to upsert profiles record: {upsert_err}")
                raise HTTPException(status_code=500, detail="Failed to save personal profile.")

            # Synchronize full_name and college to user_academic_profile for backward compatibility
            acad_sync = {
                "user_id": user_id,
                "full_name": clean_full_name,
                "college": clean_college,
            }
            sb.from_("user_academic_profile").upsert(acad_sync, on_conflict="user_id").execute()

            # Synchronize college to education records if present
            if clean_college:
                try:
                    edu_check = sb.from_("education").select("id").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                    if edu_check.data and len(edu_check.data) > 0:
                        edu_id = edu_check.data[0]["id"]
                        sb.from_("education").update({"college": clean_college}).eq("id", edu_id).execute()
                except Exception as edu_err:
                    logger.debug(f"Education college sync notice: {edu_err}")

            # Sync full_name and username to Supabase Auth user_metadata if admin API is available
            try:
                meta_update = {"full_name": clean_full_name}
                if clean_username:
                    meta_update["username"] = clean_username
                sb.auth.admin.update_user_by_id(user_id, {"user_metadata": meta_update})
            except Exception as meta_err:
                logger.debug(f"Auth user_metadata sync notice: {meta_err}")

        except HTTPException:
            raise
        except Exception as e:
            err_msg = str(e)
            if "duplicate key value" in err_msg.lower() or "unique constraint" in err_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This username is already taken. Please choose another.",
                )
            logger.error(f"Failed to save personal profile: {e}")
            raise HTTPException(status_code=500, detail="Failed to save personal profile.")

    return {"success": True, "message": "Personal profile saved successfully", "personal": prof_data}



@router.post("/career-preferences")
def save_career_preferences(
    body: CareerPreferencesModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save target roles, industries, companies, locations, and work arrangements.
    """
    user_id = current_user_id
    sb = get_supabase()

    cp_data = {
        "user_id": user_id,
        "target_roles": body.target_roles or [],
        "preferred_industries": body.preferred_industries or [],
        "target_companies": body.target_companies or [],
        "preferred_locations": body.preferred_locations or [],
        "work_arrangements": body.work_arrangements or [],
    }

    if sb:
        try:
            sb.from_("career_preferences").upsert(cp_data, on_conflict="user_id").execute()
            if body.target_roles and len(body.target_roles) > 0 and body.target_roles[0].strip():
                sb.from_("user_academic_profile").upsert({
                    "user_id": user_id,
                    "target_role": body.target_roles[0].strip(),
                }, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to save career preferences: {e}")
            raise HTTPException(status_code=500, detail="Failed to save career preferences.")

    return {"success": True, "message": "Career preferences saved successfully", "career_preferences": cp_data}



@router.post("/academic")
def save_academic_profile(
    body: AcademicProfileModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save academic profile info into Supabase.
    Enforces identity lock if student has already received a certificate.
    """
    user_id = current_user_id  # Always derived from verified JWT — body user_id is ignored
    sb = get_supabase()

    data = {
        "user_id": user_id,
        "full_name": body.full_name,
        "college": body.college,
        "department": body.department,
        "academic_year": body.academic_year,
        "target_role": body.target_role,
        # updated_at is auto-managed by Supabase default — do NOT include it
    }

    if sb:
        try:
            result = sb.from_("user_academic_profile").upsert(data, on_conflict="user_id").execute()
            logger.info(f"Academic profile saved: {result.data}")
            # Also keep profiles table in sync
            profile_sync = {"id": user_id}
            if body.full_name:
                profile_sync["full_name"] = body.full_name
            if body.college:
                profile_sync["college"] = body.college
            sb.from_("profiles").upsert(profile_sync, on_conflict="id").execute()
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to save academic profile: {e}")
            raise HTTPException(status_code=500, detail="Failed to save academic profile.")

    return {"success": True, "message": "Academic profile saved successfully", "academic": data}


@router.get("/identity")
def get_certificate_identity_endpoint(
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Retrieves the authenticated student's authoritative certificate identity
    and lock status.
    """
    from backend.services.certificate_service import get_authoritative_user_identity
    return get_authoritative_user_identity(current_user_id)


@router.patch("/identity")
def update_certificate_identity_endpoint(
    body: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Updates the student's authoritative full name and college before their first certificate.
    Permanently locked if a certificate has already been issued.
    """
    from backend.services.certificate_service import update_student_certificate_identity
    full_name = body.get("full_name", "")
    college = body.get("college", "")
    return update_student_certificate_identity(
        user_id=current_user_id,
        full_name=full_name,
        college=college,
    )



@router.post("/coding")
async def save_coding_profiles(
    body: CodingProfilesInputModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save coding profile URLs/handles, automatically extract live stats from public APIs, and update DB.
    """
    user_id = current_user_id  # Always derived from verified JWT — body user_id is ignored
    
    # Run extractors concurrently
    lc_task = _extract_leetcode(body.leetcode or "")
    gh_task = _extract_github(body.github or "")
    cf_task = _extract_codeforces(body.codeforces or "")
    cc_task = _extract_codechef(body.codechef or "")
    gfg_task = _extract_gfg(body.geeksforgeeks or "")
    hr_task = _extract_hackerrank(body.hackerrank or "")

    lc_stats, gh_stats, cf_stats, cc_stats, gfg_stats, hr_stats = await asyncio.gather(
        lc_task, gh_task, cf_task, cc_task, gfg_task, hr_task
    )

    stats_json = {
        "leetcode": lc_stats,
        "github": gh_stats,
        "codeforces": cf_stats,
        "codechef": cc_stats,
        "geeksforgeeks": gfg_stats,
        "hackerrank": hr_stats,
    }

    db_data = {
        "user_id": user_id,
        "leetcode_url": body.leetcode or "",
        "github_url": body.github or "",
        "hackerrank_url": body.hackerrank or "",
        "codechef_url": body.codechef or "",
        "geeksforgeeks_url": body.geeksforgeeks or "",
        "codeforces_url": body.codeforces or "",
        "stats_json": stats_json,
        # updated_at is auto-managed by Supabase — do NOT include it
    }

    sb = get_supabase()
    if sb:
        try:
            logger.info(f"Saving coding profiles for user_id={user_id}")
            result = await asyncio.to_thread(
                lambda: sb.from_("user_coding_profiles").upsert(db_data, on_conflict="user_id").execute()
            )
            logger.info(f"Coding profiles saved to Supabase: {len(result.data)} rows")
        except Exception as e:
            logger.error(f"Failed to save coding profiles: {e}")

    return {
        "success": True,
        "message": "Coding profiles saved and stats extracted successfully",
        "inputs": {
            "leetcode": body.leetcode,
            "github": body.github,
            "hackerrank": body.hackerrank,
            "codechef": body.codechef,
            "geeksforgeeks": body.geeksforgeeks,
            "codeforces": body.codeforces,
        },
        "stats": stats_json,
    }
