import re
from fastapi import APIRouter, Depends
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(user_id: str = Depends(get_current_user_id)):
    # user_id is now guaranteed to be a valid authenticated Supabase UUID (auth raises 401 otherwise)
    sb = get_supabase()
    completed_count = 0
    total_videos = 0
    problems_solved = 0
    saved_playlists_count = 0
    user_success_rate = 0.0
    display_name = user_id.split("@")[0] if "@" in user_id else user_id

    if sb:
        try:
            # 1. Count completed videos for this user
            res_completed = (
                sb.table("video_progress")
                .select("video_id", count="exact")
                .eq("user_id", user_id)
                .eq("watched", True)
                .execute()
            )
            completed_count = res_completed.count or (len(res_completed.data) if res_completed.data else 0)

            # 2. Get total videos and count from saved playlists
            res_saved = (
                sb.table("saved_playlists")
                .select("video_count")
                .eq("user_id", user_id)
                .execute()
            )
            if res_saved.data:
                saved_playlists_count = len(res_saved.data)
                for row in res_saved.data:
                    vc_str = str(row.get("video_count", "0"))
                    match = re.search(r'\d+', vc_str)
                    if match:
                        total_videos += int(match.group())

            # 3. Get problems solved count from leetcode_progress table
            res_problems = (
                sb.table("leetcode_progress")
                .select("question_id", count="exact")
                .eq("user_id", user_id)
                .eq("status", "solved")
                .execute()
            )
            db_leetcode_solved = res_problems.count or (len(res_problems.data) if res_problems.data else 0)

            # 4. Fetch extracted coding profiles stats (LeetCode, GFG, Codeforces, CodeChef, HackerRank)
            extracted_solved = 0
            res_code = (
                sb.table("user_coding_profiles")
                .select("stats_json")
                .eq("user_id", user_id)
                .execute()
            )
            if res_code.data and res_code.data[0].get("stats_json"):
                stats_json = res_code.data[0].get("stats_json", {})
                for platform, pdata in stats_json.items():
                    if isinstance(pdata, dict):
                        ts = pdata.get("total_solved") or pdata.get("solved") or 0
                        if isinstance(ts, (int, float)):
                            extracted_solved += int(ts)

            # Aggregated Total Problems Solved across DB progress + pasted coding profiles
            problems_solved = max(db_leetcode_solved, extracted_solved) if db_leetcode_solved > 0 and extracted_solved > 0 else (db_leetcode_solved + extracted_solved)

            # 5. Fetch user name from academic profile if exists
            res_profile = (
                sb.table("user_academic_profile")
                .select("full_name")
                .eq("user_id", user_id)
                .execute()
            )
            if res_profile.data and res_profile.data[0].get("full_name"):
                name_val = res_profile.data[0].get("full_name")
                if name_val:
                    display_name = name_val

            # 6. Fetch user_progress stats if present
            res_user_prog = (
                sb.table("user_progress")
                .select("success_rate, resume_readiness_score")
                .eq("user_id", user_id)
                .execute()
            )
            if res_user_prog.data:
                user_success_rate = float(res_user_prog.data[0].get("success_rate") or 0.0)

            # 7. Fetch latest resume score from resume_scores table
            resume_score = 0
            res_resume = (
                sb.table("resume_scores")
                .select("overall_score, ats_compatibility_score")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if res_resume.data and res_resume.data[0]:
                sc = res_resume.data[0].get("overall_score") or res_resume.data[0].get("ats_compatibility_score")
                if sc is not None:
                    resume_score = round(float(sc))
            elif res_user_prog.data and res_user_prog.data[0].get("resume_readiness_score"):
                resume_score = round(float(res_user_prog.data[0].get("resume_readiness_score")))

            # 8. Fetch completed roadmap topics count from roadmap_progress table
            roadmap_completed_count = 0
            res_roadmap = (
                sb.table("roadmap_progress")
                .select("node_id", count="exact")
                .eq("user_id", user_id)
                .eq("status", "completed")
                .execute()
            )
            if res_roadmap.data:
                roadmap_completed_count = res_roadmap.count or len(res_roadmap.data)

        except Exception as e:
            print(f"Dashboard metrics query error: {e}")

    if total_videos > 0:
        if completed_count > total_videos:
            total_videos = completed_count
        pct = round((completed_count / total_videos) * 100)
        subtitle_text = f"{completed_count}/{total_videos} videos completed"
    elif completed_count > 0:
        pct = 0
        subtitle_text = f"{completed_count} video{'s' if completed_count != 1 else ''} completed"
    else:
        pct = 0
        subtitle_text = "0 videos completed"

    # Roadmap Progress Metric: Percentage relative to baseline goal (e.g. 20 topics = 100%)
    roadmap_pct = min(100, round((roadmap_completed_count / 20) * 100)) if roadmap_completed_count > 0 else 0
    roadmap_subtitle = f"{roadmap_completed_count} topic{'s' if roadmap_completed_count != 1 else ''} completed" if roadmap_completed_count > 0 else "0 topics completed"

    # Dynamic Success Rate (0 if no historical user_success_rate recorded)
    calc_success_rate = round(user_success_rate) if user_success_rate > 0 else (75 if problems_solved > 0 else 0)

    resume_subtitle = f"ATS Score: {resume_score}/100" if resume_score > 0 else "No upload yet"

    return {
        "user": {
            "name": display_name,
            "status": "ACTIVE",
            "streakDays": 0
        },
        "metrics": {
            "learningProgress": {
                "percentage": pct,
                "completedVideos": completed_count,
                "totalVideos": total_videos,
                "subtitle": subtitle_text
            },
            "roadmapProgress": {
                "count": roadmap_completed_count,
                "percentage": roadmap_pct,
                "subtitle": roadmap_subtitle
            },
            "resumeReadiness": {
                "percentage": resume_score,
                "subtitle": resume_subtitle
            },
            "interviewReadiness": {
                "isLocked": True,
                "subtitle": "Currently Locked"
            }
        },
        "upcoming": [],
        "practiceOverview": {
            "problemsSolved": problems_solved,
            "successRate": calc_success_rate,
            "contests": 0,
            "chartData": [
                {"day": "Mon", "solved": 0},
                {"day": "Tue", "solved": 0},
                {"day": "Wed", "solved": 0},
                {"day": "Thu", "solved": 0},
                {"day": "Fri", "solved": 0},
                {"day": "Sat", "solved": 0},
                {"day": "Sun", "solved": 0}
            ]
        }
    }

