"""
backend/routers/moods.py
Production-grade FastAPI endpoints for Daily Mood Tracking & Calendar Analytics.
Enforces strict tenant isolation, input validation, and real-time monthly aggregation.
"""

import calendar
import logging
from datetime import date, datetime, timezone
from typing import Optional, Dict
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.services.auth_service import get_current_user_id
from backend.services.supabase_service import get_supabase
from backend.models.mood import (
    LogMoodRequest,
    MoodLogResponse,
    MonthlyMoodSummaryResponse,
    MoodType,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/moods", tags=["moods"])


def _get_supabase_or_503():
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is currently unavailable.",
        )
    return sb


@router.get("", response_model=MonthlyMoodSummaryResponse)
async def get_monthly_moods(
    year: Optional[int] = Query(None, description="Year (e.g. 2026)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (1-12)"),
    user_id: str = Depends(get_current_user_id),
):
    """
    Fetches all daily mood check-ins for the authenticated user for a specific month/year.
    Calculates dominant mood and statistical counts for the monthly summary card.
    """
    sb = _get_supabase_or_503()

    now = datetime.now(timezone.utc)
    target_year = year if year is not None else now.year
    target_month = month if month is not None else now.month

    _, last_day = calendar.monthrange(target_year, target_month)
    start_date = f"{target_year:04d}-{target_month:02d}-01"
    end_date = f"{target_year:04d}-{target_month:02d}-{last_day:02d}"

    try:
        res = (
            sb.from_("user_daily_mood_logs")
            .select("id, user_id, log_date, mood, note, created_at, updated_at")
            .eq("user_id", user_id)
            .gte("log_date", start_date)
            .lte("log_date", end_date)
            .order("log_date", desc=False)
            .execute()
        )

        raw_logs = res.data or []
        logs = []
        counts: Dict[str, int] = {}

        for item in raw_logs:
            mood_val = item.get("mood")
            if mood_val:
                counts[mood_val] = counts.get(mood_val, 0) + 1

            logs.append(
                MoodLogResponse(
                    id=str(item["id"]),
                    user_id=str(item["user_id"]),
                    log_date=str(item["log_date"]),
                    mood=item["mood"],
                    note=item.get("note"),
                    created_at=str(item.get("created_at")) if item.get("created_at") else None,
                    updated_at=str(item.get("updated_at")) if item.get("updated_at") else None,
                )
            )

        # Determine dominant/predominant mood for the month
        predominant_mood = None
        if counts:
            predominant_mood = max(counts.items(), key=lambda x: x[1])[0]

        return MonthlyMoodSummaryResponse(
            year=target_year,
            month=target_month,
            logs=logs,
            predominant_mood=predominant_mood,
            total_logged=len(logs),
            mood_counts=counts,
        )

    except Exception as e:
        logger.error(f"Error fetching monthly moods for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch mood logs: {str(e)}",
        )


@router.post("", response_model=MoodLogResponse, status_code=status.HTTP_200_OK)
async def log_daily_mood(
    payload: LogMoodRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Logs or updates (upserts) the authenticated user's mood for a given date.
    Defaults to today's date if log_date is not specified.
    """
    sb = _get_supabase_or_503()

    target_date = payload.log_date or date.today().isoformat()
    now_iso = datetime.now(timezone.utc).isoformat()

    row = {
        "user_id": user_id,
        "log_date": target_date,
        "mood": payload.mood.value,
        "note": payload.note.strip() if payload.note else None,
        "updated_at": now_iso,
    }

    try:
        # Upsert with conflict resolution on (user_id, log_date)
        res = (
            sb.from_("user_daily_mood_logs")
            .upsert(row, on_conflict="user_id,log_date")
            .execute()
        )

        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record mood log.",
            )

        saved = res.data[0]
        return MoodLogResponse(
            id=str(saved["id"]),
            user_id=str(saved["user_id"]),
            log_date=str(saved["log_date"]),
            mood=saved["mood"],
            note=saved.get("note"),
            created_at=str(saved.get("created_at")),
            updated_at=str(saved.get("updated_at")),
        )

    except Exception as e:
        logger.error(f"Error saving mood log for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save mood log: {str(e)}",
        )


@router.delete("/{log_date}")
async def delete_mood_log(
    log_date: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Deletes the user's mood log for a specified date (YYYY-MM-DD).
    """
    sb = _get_supabase_or_503()

    try:
        res = (
            sb.from_("user_daily_mood_logs")
            .delete()
            .eq("user_id", user_id)
            .eq("log_date", log_date)
            .execute()
        )
        return {"success": True, "message": f"Mood log for {log_date} deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting mood log for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete mood log: {str(e)}",
        )
