"""
backend/services/event_service.py
Service layer handling database operations, visibility conditions,
and storage uploads for the SkillsCatalyst Events & Hackathons CMS.
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import UploadFile, HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.event import (
    CreateEventRequest,
    UpdateEventRequest,
    EventStatus,
    EventCategory,
)

logger = logging.getLogger("skillscatalyst.events")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _format_datetime(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def _is_event_visible_now(event: Dict[str, Any], now_dt: datetime) -> bool:
    """Evaluates whether an event satisfies the student-visible criteria."""
    if event.get("status") != EventStatus.PUBLISHED.value:
        return False

    v_from_raw = event.get("visible_from")
    if v_from_raw:
        try:
            v_from = datetime.fromisoformat(v_from_raw.replace("Z", "+00:00"))
            if v_from > now_dt:
                return False
        except Exception:
            pass

    v_until_raw = event.get("visible_until")
    if v_until_raw:
        try:
            v_until = datetime.fromisoformat(v_until_raw.replace("Z", "+00:00"))
            if v_until <= now_dt:
                return False
        except Exception:
            pass

    return True


# ── STUDENT OPERATIONS ────────────────────────────────────────────────────────

def get_student_events(
    category: Optional[str] = None,
    is_hackathon: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetches events visible to students:
    - status = 'published'
    - visible_from <= NOW() (or NULL)
    - visible_until > NOW() (or NULL)
    """
    sb = get_supabase()
    if not sb:
        logger.warning("Supabase client unavailable when fetching student events")
        return []

    now_iso = datetime.now(timezone.utc).isoformat()
    now_dt = datetime.now(timezone.utc)

    try:
        query = sb.from_("events").select("*").eq("status", EventStatus.PUBLISHED.value)

        if category:
            query = query.eq("category", category.lower())
        if is_hackathon is not None:
            query = query.eq("is_hackathon", is_hackathon)

        query = query.order("start_date", desc=False)
        res = query.execute()

        raw_events = res.data or []
        visible_events: List[Dict[str, Any]] = []

        for ev in raw_events:
            if _is_event_visible_now(ev, now_dt):
                if search:
                    s = search.lower().strip()
                    name = (ev.get("event_name") or "").lower()
                    college = (ev.get("conducted_by_college") or "").lower()
                    desc = (ev.get("description") or "").lower()
                    if s not in name and s not in college and s not in desc:
                        continue
                visible_events.append(ev)

        return visible_events

    except Exception as e:
        err_msg = str(e)
        if "PGRST205" in err_msg or "schema cache" in err_msg:
            logger.info("Events table pending migration in Supabase. Returning empty student list.")
        else:
            logger.error(f"Error fetching student events: {e}")
        return []


def get_student_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a single published visible event by UUID."""
    sb = get_supabase()
    if not sb:
        return None

    now_dt = datetime.now(timezone.utc)
    try:
        res = sb.from_("events").select("*").eq("id", event_id).eq("status", EventStatus.PUBLISHED.value).execute()
        if not res.data:
            return None

        event = res.data[0]
        if _is_event_visible_now(event, now_dt):
            return event
        return None
    except Exception as e:
        logger.error(f"Error fetching student event {event_id}: {e}")
        return None


# ── ADMIN OPERATIONS ──────────────────────────────────────────────────────────

def get_admin_events(
    status_filter: Optional[str] = None,
    is_hackathon: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Owner directory: returns all events with optional status and search filters."""
    sb = get_supabase()
    if not sb:
        return []

    try:
        query = sb.from_("events").select("*")

        if status_filter and status_filter.lower() != "all":
            query = query.eq("status", status_filter.lower())
        if is_hackathon is not None:
            query = query.eq("is_hackathon", is_hackathon)

        query = query.order("created_at", desc=True)
        res = query.execute()

        events = res.data or []
        if search:
            s = search.lower().strip()
            events = [
                ev for ev in events
                if s in (ev.get("event_name") or "").lower()
                or s in (ev.get("conducted_by_college") or "").lower()
                or s in (ev.get("location") or "").lower()
            ]

        return events
    except Exception as e:
        err_msg = str(e)
        if "PGRST205" in err_msg or "schema cache" in err_msg:
            logger.info("Events table not yet created in Supabase.")
        else:
            logger.error(f"Error fetching admin events: {e}")
        return []


def get_admin_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Owner endpoint to fetch any event regardless of status."""
    sb = get_supabase()
    if not sb:
        return None

    try:
        res = sb.from_("events").select("*").eq("id", event_id).execute()
        if res.data:
            return res.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching admin event {event_id}: {e}")
        return None


def create_event(data: CreateEventRequest, user_id: str) -> Dict[str, Any]:
    """Inserts a new event record with authoritative created_by = user_id."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "event_name": data.event_name.strip(),
        "conducted_by_college": data.conducted_by_college.strip(),
        "event_link": data.event_link.strip(),
        "registration_deadline": _format_datetime(data.registration_deadline),
        "start_date": _format_datetime(data.start_date),
        "end_date": _format_datetime(data.end_date),
        "location": data.location.strip() if data.location else None,
        "category": data.category.value,
        "banner_url": data.banner_url.strip(),
        "description": data.description.strip() if data.description else None,
        "is_hackathon": data.is_hackathon,
        "prize_pool": data.prize_pool.strip() if (data.is_hackathon and data.prize_pool) else None,
        "team_size": data.team_size.strip() if (data.is_hackathon and data.team_size) else None,
        "mode": data.mode.value if (data.is_hackathon and data.mode) else None,
        "status": data.status.value,
        "visible_from": _format_datetime(data.visible_from),
        "visible_until": _format_datetime(data.visible_until),
        "created_by": user_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        res = sb.from_("events").insert(record).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return record
    except Exception as e:
        logger.error(f"Failed to insert event into database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event in database: {str(e)}",
        )


def update_event(event_id: str, data: UpdateEventRequest) -> Dict[str, Any]:
    """Updates an existing event with provided fields."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_event_by_id(event_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found.",
        )

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if data.event_name is not None:
        update_payload["event_name"] = data.event_name.strip()
    if data.conducted_by_college is not None:
        update_payload["conducted_by_college"] = data.conducted_by_college.strip()
    if data.event_link is not None:
        update_payload["event_link"] = data.event_link.strip()
    if data.registration_deadline is not None:
        update_payload["registration_deadline"] = _format_datetime(data.registration_deadline)
    if data.start_date is not None:
        update_payload["start_date"] = _format_datetime(data.start_date)
    if data.end_date is not None:
        update_payload["end_date"] = _format_datetime(data.end_date)
    if data.location is not None:
        update_payload["location"] = data.location.strip() if data.location else None
    if data.category is not None:
        update_payload["category"] = data.category.value
    if data.banner_url is not None:
        update_payload["banner_url"] = data.banner_url.strip()
    if data.description is not None:
        update_payload["description"] = data.description.strip() if data.description else None

    # Handle is_hackathon logic
    if data.is_hackathon is not None:
        update_payload["is_hackathon"] = data.is_hackathon
        if not data.is_hackathon:
            update_payload["prize_pool"] = None
            update_payload["team_size"] = None
            update_payload["mode"] = None
        else:
            if data.prize_pool is not None:
                update_payload["prize_pool"] = data.prize_pool.strip() if data.prize_pool else None
            if data.team_size is not None:
                update_payload["team_size"] = data.team_size.strip() if data.team_size else None
            if data.mode is not None:
                update_payload["mode"] = data.mode.value
    else:
        # If is_hackathon wasn't altered, check fields if current is a hackathon
        if existing.get("is_hackathon"):
            if data.prize_pool is not None:
                update_payload["prize_pool"] = data.prize_pool.strip() if data.prize_pool else None
            if data.team_size is not None:
                update_payload["team_size"] = data.team_size.strip() if data.team_size else None
            if data.mode is not None:
                update_payload["mode"] = data.mode.value

    if data.status is not None:
        update_payload["status"] = data.status.value
    if data.visible_from is not None:
        update_payload["visible_from"] = _format_datetime(data.visible_from)
    if data.visible_until is not None:
        update_payload["visible_until"] = _format_datetime(data.visible_until)

    try:
        res = sb.from_("events").update(update_payload).eq("id", event_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return {**existing, **update_payload}
    except Exception as e:
        logger.error(f"Failed to update event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}",
        )


def set_event_status(event_id: str, new_status: EventStatus) -> Dict[str, Any]:
    """Transitions an event to published or archived."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        res = sb.from_("events").update({
            "status": new_status.value,
            "updated_at": now_iso,
        }).eq("id", event_id).execute()

        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event '{event_id}' not found.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to set status on event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}",
        )


def delete_event(event_id: str) -> bool:
    """Deletes an event record from the database."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        res = sb.from_("events").delete().eq("id", event_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}",
        )


def get_active_events_count() -> int:
    """
    Returns the count of active published events for the Admin Overview telemetry.
    Replaces the previously hardcoded 12 with a live database query.
    """
    sb = get_supabase()
    if not sb:
        return 0

    try:
        res = sb.from_("events").select("id", count="exact").eq("status", EventStatus.PUBLISHED.value).execute()
        if res and res.count is not None:
            return res.count
        return len(res.data or [])
    except Exception:
        return 0


# ── BANNER IMAGE UPLOAD ───────────────────────────────────────────────────────

async def upload_banner_image(file: UploadFile, user_id: str) -> str:
    """
    Validates and stores an event poster/banner:
    - Validates file extension and content type
    - Validates 5MB size limit
    - Uploads to Supabase Storage 'event-banners' bucket
    - Falls back to server static directory if storage bucket is not configured
    - Returns a public, accessible URL
    """
    if not file or not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    filename = file.filename
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_IMAGE_EXTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: JPG, PNG, WebP, GIF",
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type '{content_type}'. Must be JPEG, PNG, WebP, or GIF.",
        )

    content = await file.read()
    if len(content) > MAX_BANNER_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the maximum allowed size of 5 MB.",
        )

    if len(content) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Corrupt or empty image file.")

    # Unique sanitized storage filename
    unique_filename = f"event_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    sb = get_supabase()

    # Attempt Supabase Storage upload
    if sb:
        try:
            bucket_name = "event-banners"
            storage_res = sb.storage.from_(bucket_name).upload(
                path=unique_filename,
                file=content,
                file_options={"content-type": content_type or "image/jpeg", "upsert": "true"},
            )
            public_url = sb.storage.from_(bucket_name).get_public_url(unique_filename)
            if public_url:
                return public_url
        except Exception as e:
            logger.warning(f"Supabase Storage bucket upload attempt note: {e}. Utilizing static local fallback.")

    # Fallback to local static directory inside frontend/public/images/events/uploaded
    try:
        workspace_root = Path(__file__).resolve().parent.parent.parent
        upload_dir = workspace_root / "frontend" / "public" / "images" / "events" / "uploaded"
        upload_dir.mkdir(parents=True, exist_ok=True)

        dest_file = upload_dir / unique_filename
        with open(dest_file, "wb") as f:
            f.write(content)

        return f"/images/events/uploaded/{unique_filename}"
    except Exception as e:
        logger.error(f"Static upload fallback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save banner image.",
        )
