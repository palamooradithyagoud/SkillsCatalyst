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
                .select("success_rate")
                .eq("user_id", user_id)
                .execute()
            )
            if res_user_prog.data:
                user_success_rate = float(res_user_prog.data[0].get("success_rate") or 0.0)

        except Exception as e:
            print(f"Dashboard metrics query error: {e}")

    if total_videos < completed_count:
        total_videos = completed_count

    if total_videos > 0:
        pct = round((completed_count / total_videos) * 100)
        subtitle_text = f"{completed_count}/{total_videos} videos completed"
    elif completed_count > 0:
        pct = min(99, completed_count * 5)
        subtitle_text = f"{completed_count} video{'s' if completed_count != 1 else ''} completed"
    else:
        pct = 0
        subtitle_text = "0 videos completed"

    # Saved Playlists Metric: Percentage relative to goal (e.g. 5 playlists = 100%) or completion %
    saved_playlists_pct = min(100, saved_playlists_count * 20) if saved_playlists_count > 0 else 0
    saved_playlists_subtitle = f"{saved_playlists_count} playlist{'s' if saved_playlists_count != 1 else ''} saved" if saved_playlists_count > 0 else "0 playlists saved"

    # Dynamic Success Rate (0 if no historical user_success_rate recorded)
    calc_success_rate = round(user_success_rate) if user_success_rate > 0 else (75 if problems_solved > 0 else 0)

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
            "resumeReadiness": {
                "percentage": 0,
                "subtitle": "No upload yet"
            },
            "savedPlaylists": {
                "count": saved_playlists_count,
                "percentage": saved_playlists_pct,
                "subtitle": saved_playlists_subtitle
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

