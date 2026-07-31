import re
from fastapi import APIRouter, Depends
from backend.services.supabase_service import get_supabase
from backend.services.auth_service import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    completed_count = 0
    total_videos = 0
    problems_solved = 0
    user_success_rate = 0.0
    display_name = user_id.split("@")[0] if "@" in user_id else (
        "Learner" if user_id == "default_user" else user_id
    )

    if sb and user_id != "default_user":
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

            # 2. Get total videos from saved playlists
            res_saved = (
                sb.table("saved_playlists")
                .select("video_count")
                .eq("user_id", user_id)
                .execute()
            )
            if res_saved.data:
                for row in res_saved.data:
                    vc_str = str(row.get("video_count", "0"))
                    match = re.search(r'\d+', vc_str)
                    if match:
                        total_videos += int(match.group())

            # 3. Get problems solved count for this specific user
            res_problems = (
                sb.table("leetcode_progress")
                .select("question_id", count="exact")
                .eq("user_id", user_id)
                .eq("status", "solved")
                .execute()
            )
            problems_solved = res_problems.count or (len(res_problems.data) if res_problems.data else 0)

            # 4. Fetch user name from academic profile if exists
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

            # 5. Fetch user_progress stats if present
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

    pct = round((completed_count / total_videos) * 100) if total_videos > 0 else 0
    subtitle_text = f"{completed_count}/{total_videos} videos completed" if total_videos > 0 else "0 videos completed"

    # Dynamic AI Career Health computation: 40% Learning + 60% Practice
    health_score = min(100, round((pct * 0.4) + (min(problems_solved * 4, 100) * 0.6)))

    if health_score == 0:
        health_subtitle = "Start learning to build health"
    elif health_score < 40:
        health_subtitle = "Getting started"
    elif health_score < 75:
        health_subtitle = "Progressing well"
    else:
        health_subtitle = "Strong career readiness"

    # Dynamic Success Rate (0 if no historical user_success_rate recorded)
    calc_success_rate = round(user_success_rate) if user_success_rate > 0 else 0

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
            "aiCareerHealth": {
                "percentage": health_score,
                "subtitle": health_subtitle
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

