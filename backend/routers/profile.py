import logging
import asyncio
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import httpx
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])

# ── Models ────────────────────────────────────────────────--------------------

class AcademicProfileModel(BaseModel):
    user_id: Optional[str] = "default_user"
    full_name: str = ""
    college: str = ""
    department: str = ""
    academic_year: str = ""
    target_role: str = ""

class CodingProfilesInputModel(BaseModel):
    user_id: Optional[str] = "default_user"
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
    text = url_or_handle.strip().rstrip("/")
    if "://" in text:
        parts = text.split("/")
        return parts[-1] if parts[-1] else (parts[-2] if len(parts) > 1 else text)
    return text


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
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                url,
                json={"query": query, "variables": {"username": handle}},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
                    return {
                        "configured": True,
                        "username": handle,
                        "url": f"https://leetcode.com/{handle}",
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


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
async def get_profile(user_id: str = "default_user"):
    """
    Fetch current user's Academic Profile and Coding Profiles with extracted stats.
    """
    sb = get_supabase()
    academic_data = {
        "user_id": user_id,
        "full_name": "",
        "college": "",
        "department": "",
        "academic_year": "",
        "target_role": "",
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

    if sb:
        try:
            res_acad = sb.from_("user_academic_profile").select("*").eq("user_id", user_id).execute()
            if res_acad.data:
                academic_data.update(res_acad.data[0])

            res_code = sb.from_("user_coding_profiles").select("*").eq("user_id", user_id).execute()
            if res_code.data:
                c_row = res_code.data[0]
                coding_inputs["leetcode"] = c_row.get("leetcode_url", "")
                coding_inputs["github"] = c_row.get("github_url", "")
                coding_inputs["hackerrank"] = c_row.get("hackerrank_url", "")
                coding_inputs["codechef"] = c_row.get("codechef_url", "")
                coding_inputs["geeksforgeeks"] = c_row.get("geeksforgeeks_url", "")
                coding_inputs["codeforces"] = c_row.get("codeforces_url", "")
                coding_stats = c_row.get("stats_json", {})
        except Exception as e:
            logger.warning(f"Failed to fetch profile from Supabase: {e}")

    return {
        "academic": academic_data,
        "coding_inputs": coding_inputs,
        "coding_stats": coding_stats,
    }


@router.post("/academic")
async def save_academic_profile(body: AcademicProfileModel):
    """
    Save academic profile info into Supabase.
    """
    user_id = body.user_id or "default_user"
    sb = get_supabase()
    
    data = {
        "user_id": user_id,
        "full_name": body.full_name,
        "college": body.college,
        "department": body.department,
        "academic_year": body.academic_year,
        "target_role": body.target_role,
    }

    if sb:
        try:
            sb.from_("user_academic_profile").upsert(data, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to save academic profile in Supabase: {e}")

    return {"success": True, "message": "Academic profile saved successfully", "academic": data}


@router.post("/coding")
async def save_coding_profiles(body: CodingProfilesInputModel):
    """
    Save coding profile URLs/handles, automatically extract live stats from public APIs, and update DB.
    """
    user_id = body.user_id or "default_user"
    
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
    }

    sb = get_supabase()
    if sb:
        try:
            sb.from_("user_coding_profiles").upsert(db_data, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to save coding profiles in Supabase: {e}")

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
