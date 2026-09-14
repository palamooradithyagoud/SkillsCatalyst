import logging
import asyncio
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import httpx
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])

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


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """
    Fetch current user's complete Unified Profile across all normalized entities,
    with extracted coding platform stats and backward-compatible fallbacks.
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
    personal_data = {
        "id": user_id,
        "full_name": "",
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

    if sb:
        # 1. Academic profile (backward compatibility)
        try:
            res_acad = sb.from_("user_academic_profile").select("*").eq("user_id", user_id).execute()
            if res_acad.data:
                academic_data.update(res_acad.data[0])
                if academic_data.get("full_name"):
                    personal_data["full_name"] = academic_data["full_name"]
                if academic_data.get("target_role") and not career_prefs_data["target_roles"]:
                    career_prefs_data["target_roles"] = [academic_data["target_role"]]
        except Exception as e:
            logger.warning(f"Failed to fetch user_academic_profile: {e}")


        # 2. Personal profile
        try:
            res_prof = sb.from_("profiles").select("*").eq("id", user_id).execute()
            if res_prof.data and len(res_prof.data) > 0:
                p_row = res_prof.data[0]
                personal_data.update({
                    k: v for k, v in p_row.items() 
                    if k in personal_data and v is not None
                })
        except Exception as e:
            logger.debug(f"Profiles table query notice: {e}")

        # 3. Coding profiles & extracted stats
        try:
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
            logger.warning(f"Failed to fetch user_coding_profiles: {e}")

        # 4. Normalized skills
        try:
            res_skills = sb.from_("user_skills").select("*").eq("user_id", user_id).order("created_at").execute()
            if res_skills.data:
                skills_data = res_skills.data
        except Exception as e:
            logger.debug(f"User skills query notice: {e}")

        # 5. Normalized experiences
        try:
            res_exp = sb.from_("experiences").select("*").eq("user_id", user_id).order("start_date", desc=True).execute()
            if res_exp.data:
                experiences_data = res_exp.data
        except Exception as e:
            logger.debug(f"Experiences query notice: {e}")

        # 6. Normalized education
        try:
            res_edu = sb.from_("education").select("*").eq("user_id", user_id).order("start_date", desc=True).execute()
            if res_edu.data:
                education_data = res_edu.data
            elif academic_data.get("college"):
                # Fallback synthesized education record from academic profile if table empty
                education_data = [{
                    "id": f"legacy_edu_{user_id}",
                    "user_id": user_id,
                    "college": academic_data.get("college", ""),
                    "field_of_study": academic_data.get("department", ""),
                    "degree_type": academic_data.get("academic_year", ""),
                    "currently_studying": True,
                }]
        except Exception as e:
            logger.debug(f"Education query notice: {e}")

        # 7. Normalized projects
        try:
            res_proj = sb.from_("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if res_proj.data:
                projects_data = res_proj.data
        except Exception as e:
            logger.debug(f"Projects query notice: {e}")

        # 8. Normalized certifications
        try:
            res_certs = sb.from_("certifications").select("*").eq("user_id", user_id).order("issue_date", desc=True).execute()
            if res_certs.data:
                certifications_data = res_certs.data
        except Exception as e:
            logger.debug(f"Certifications query notice: {e}")

        # 9. Normalized achievements
        try:
            res_ach = sb.from_("achievements").select("*").eq("user_id", user_id).order("achievement_date", desc=True).execute()
            if res_ach.data:
                achievements_data = res_ach.data
        except Exception as e:
            logger.debug(f"Achievements query notice: {e}")

        # 10. Career preferences
        try:
            res_cp = sb.from_("career_preferences").select("*").eq("user_id", user_id).execute()
            if res_cp.data and len(res_cp.data) > 0:
                cp_row = res_cp.data[0]
                career_prefs_data["target_roles"] = cp_row.get("target_roles") or ([cp_row.get("target_role")] if cp_row.get("target_role") else [])
                career_prefs_data["preferred_industries"] = cp_row.get("preferred_industries") or ([cp_row.get("target_industry")] if cp_row.get("target_industry") else [])
                career_prefs_data["target_companies"] = cp_row.get("target_companies") or []
                career_prefs_data["preferred_locations"] = cp_row.get("preferred_locations") or ([cp_row.get("preferred_work_location")] if cp_row.get("preferred_work_location") else [])
                career_prefs_data["work_arrangements"] = cp_row.get("work_arrangements") or ([cp_row.get("preferred_work_type")] if cp_row.get("preferred_work_type") else [])
        except Exception as e:
            logger.debug(f"Career preferences query notice: {e}")


        # 11. Latest resume review
        try:
            res_res = sb.from_("resume_scores").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
            if res_res.data and len(res_res.data) > 0:
                resume_data = res_res.data[0]
        except Exception as e:
            logger.debug(f"Resume scores query notice: {e}")

        # 12. User progress summary
        try:
            res_prog = sb.from_("user_progress").select("*").eq("user_id", user_id).execute()
            if res_prog.data and len(res_prog.data) > 0:
                progress_data = res_prog.data[0]
        except Exception as e:
            logger.debug(f"User progress query notice: {e}")

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


@router.post("/personal")
async def save_personal_profile(
    body: PersonalProfileModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save personal details (headline, location, phone, bio, avatar) into profiles table,
    and synchronizes full_name with user_academic_profile for 100% backward compatibility.
    """
    user_id = current_user_id
    sb = get_supabase()

    prof_data = {
        "id": user_id,
        "full_name": body.full_name,
        "headline": body.headline or "",
        "avatar_url": body.avatar_url or "",
        "country": body.country or "",
        "state": body.state or "",
        "city": body.city or "",
        "phone": body.phone or "",
        "gender": body.gender or "",
        "about": body.about or "",
    }

    if sb:
        try:
            sb.from_("profiles").upsert(prof_data, on_conflict="id").execute()
            # Synchronize full_name to user_academic_profile for backward compatibility
            if body.full_name:
                sb.from_("user_academic_profile").upsert({
                    "user_id": user_id,
                    "full_name": body.full_name,
                }, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to save personal profile: {e}")
            raise HTTPException(status_code=500, detail="Failed to save personal profile.")

    return {"success": True, "message": "Personal profile saved successfully", "personal": prof_data}


@router.post("/career-preferences")
async def save_career_preferences(
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
async def save_academic_profile(
    body: AcademicProfileModel,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Save academic profile info into Supabase.
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
            if body.full_name:
                sb.from_("profiles").upsert({
                    "id": user_id,
                    "full_name": body.full_name,
                }, on_conflict="id").execute()
        except Exception as e:
            logger.error(f"Failed to save academic profile: {e}")

    return {"success": True, "message": "Academic profile saved successfully", "academic": data}



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
            result = sb.from_("user_coding_profiles").upsert(db_data, on_conflict="user_id").execute()
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
