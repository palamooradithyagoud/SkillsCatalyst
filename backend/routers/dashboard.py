import re
from fastapi import APIRouter
from backend.services.supabase_service import get_supabase

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(user_id: str = "default_user"):
    sb = get_supabase()
    completed_count = 0
    total_videos = 0

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
        except Exception as e:
            print(f"Dashboard metrics query error: {e}")

    if total_videos < completed_count:
        total_videos = completed_count

    pct = round((completed_count / total_videos) * 100) if total_videos > 0 else 0
    subtitle_text = f"{completed_count}/{total_videos} videos completed" if total_videos > 0 else f"{completed_count} videos completed"

    return {
        "user": {
            "name": "Palamoor",
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
                "percentage": 23,
                "subtitle": "Progressing well"
            },
            "interviewReadiness": {
                "isLocked": True,
                "subtitle": "Currently Locked"
            }
        },
        "upcoming": [
            {
                "id": "1",
                "title": "Mock Interview",
                "subtitle": "Behavioral Round",
                "date": "May 24, 5:00 PM",
                "type": "calendar"
            },
            {
                "id": "2",
                "title": "System Design",
                "subtitle": "Rate Limiter Design",
                "date": "May 26, 7:00 PM",
                "type": "system"
            },
            {
                "id": "3",
                "title": "DSA Practice",
                "subtitle": "Arrays & Hashing",
                "date": "May 26, 6:00 PM",
                "type": "code"
            }
        ],
        "practiceOverview": {
            "problemsSolved": 117,
            "successRate": 91,
            "contests": 0,
            "chartData": [
                {"day": "Mon", "solved": 12},
                {"day": "Tue", "solved": 19},
                {"day": "Wed", "solved": 15},
                {"day": "Thu", "solved": 28},
                {"day": "Fri", "solved": 22},
                {"day": "Sat", "solved": 31},
                {"day": "Sun", "solved": 25}
            ]
        }
    }
