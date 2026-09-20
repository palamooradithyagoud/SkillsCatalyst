"""
backend/services/event_service.py
Service layer handling database operations, visibility conditions,
and storage uploads for the SkillsCatalyst Events & Hackathons CMS.
"""

import os
import uuid
import base64
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
    EventMode,
)

logger = logging.getLogger("skillscatalyst.events")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_enum_val(val: Any) -> Any:
    """Extracts primitive string value from Enum or returns val directly."""
    if val is None:
        return None
    return getattr(val, "value", val)


def _parse_iso_utc(val: Any) -> Optional[datetime]:
    """Safely parses a datetime or ISO string into an offset-aware UTC datetime."""
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo is not None else val.replace(tzinfo=timezone.utc)
    try:
        s = str(val).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _format_datetime(dt: Any) -> Optional[str]:
    """Formats a datetime or ISO string into a normalized ISO 8601 UTC string."""
    if not dt:
        return None
    if isinstance(dt, str):
        parsed = _parse_iso_utc(dt)
        return parsed.isoformat() if parsed else dt.strip()
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return str(dt)


def _is_event_visible_now(event: Dict[str, Any], now_dt: datetime) -> bool:
    """Evaluates whether an event satisfies the student-visible criteria."""
    if not event or not isinstance(event, dict):
        return False

    status_val = str(_get_enum_val(event.get("status")) or "").strip().lower()
    if status_val != EventStatus.PUBLISHED.value:
        return False

    v_from = _parse_iso_utc(event.get("visible_from"))
    if v_from and v_from > now_dt:
        return False

    v_until = _parse_iso_utc(event.get("visible_until"))
    if v_until and v_until <= now_dt:
        return False

    return True


# ── STUDENT OPERATIONS ────────────────────────────────────────────────────────

def get_student_events(
    category: Optional[str] = None,
    is_hackathon: Optional[Any] = None,
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

    now_dt = datetime.now(timezone.utc)

    try:
        query = sb.from_("events").select("*").eq("status", EventStatus.PUBLISHED.value)

        if category:
            cat_clean = str(_get_enum_val(category)).strip().lower()
            if cat_clean and cat_clean != "all":
                query = query.eq("category", cat_clean)

        if is_hackathon is not None:
            if isinstance(is_hackathon, str):
                is_hackathon_bool = is_hackathon.strip().lower() in ("true", "1", "yes")
            else:
                is_hackathon_bool = bool(is_hackathon)
            query = query.eq("is_hackathon", is_hackathon_bool)

        query = query.order("start_date", desc=False)
        res = query.execute()

        raw_events = res.data or []
        visible_events: List[Dict[str, Any]] = []

        tokens: List[str] = []
        if search:
            tokens = [t.lower().strip() for t in search.split() if t.strip()]

        for ev in raw_events:
            if _is_event_visible_now(ev, now_dt):
                if tokens:
                    name = (ev.get("event_name") or "").lower()
                    college = (ev.get("conducted_by_college") or "").lower()
                    desc = (ev.get("description") or "").lower()
                    loc = (ev.get("location") or "").lower()
                    searchable = f"{name} {college} {desc} {loc}"
                    if not all(t in searchable for t in tokens):
                        continue
                visible_events.append(ev)

        return visible_events

    except Exception as e:
        err_msg = str(e)
        if any(k in err_msg for k in ("PGRST205", "PGRST204", "42P01", "schema cache", "does not exist")):
            logger.info("Events table pending migration in Supabase. Returning empty student list.")
        else:
            logger.error(f"Error fetching student events: {e}")
        return []


def get_student_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a single published visible event by ID/UUID."""
    if not event_id:
        return None

    clean_id = str(event_id).strip()
    sb = get_supabase()
    if not sb:
        return None

    now_dt = datetime.now(timezone.utc)
    try:
        res = sb.from_("events").select("*").eq("id", clean_id).eq("status", EventStatus.PUBLISHED.value).execute()
        if not res.data:
            return None

        event = res.data[0]
        if _is_event_visible_now(event, now_dt):
            return event
        return None
    except Exception as e:
        err_msg = str(e)
        if "22P02" in err_msg or "invalid input syntax for type uuid" in err_msg:
            return None
        if any(k in err_msg for k in ("PGRST205", "PGRST204", "42P01", "schema cache", "does not exist")):
            logger.info(f"Events table pending migration when querying {clean_id}.")
        else:
            logger.error(f"Error fetching student event {clean_id}: {e}")
        return None


# ── ADMIN OPERATIONS ──────────────────────────────────────────────────────────

def get_admin_events(
    status_filter: Optional[str] = None,
    is_hackathon: Optional[Any] = None,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Owner directory: returns all events with optional status and search filters."""
    sb = get_supabase()
    if not sb:
        return []

    try:
        query = sb.from_("events").select("*")

        if status_filter:
            status_clean = str(_get_enum_val(status_filter)).strip().lower()
            if status_clean and status_clean != "all":
                query = query.eq("status", status_clean)

        if is_hackathon is not None:
            if isinstance(is_hackathon, str):
                is_hackathon_bool = is_hackathon.strip().lower() in ("true", "1", "yes")
            else:
                is_hackathon_bool = bool(is_hackathon)
            query = query.eq("is_hackathon", is_hackathon_bool)

        query = query.order("created_at", desc=True)
        res = query.execute()

        events = res.data or []
        if search:
            tokens = [t.lower().strip() for t in search.split() if t.strip()]
            if tokens:
                filtered_events = []
                for ev in events:
                    name = (ev.get("event_name") or "").lower()
                    college = (ev.get("conducted_by_college") or "").lower()
                    desc = (ev.get("description") or "").lower()
                    loc = (ev.get("location") or "").lower()
                    searchable = f"{name} {college} {desc} {loc}"
                    if all(t in searchable for t in tokens):
                        filtered_events.append(ev)
                events = filtered_events

        return events
    except Exception as e:
        err_msg = str(e)
        if any(k in err_msg for k in ("PGRST205", "PGRST204", "42P01", "schema cache", "does not exist")):
            logger.info("Events table not yet created in Supabase.")
        else:
            logger.error(f"Error fetching admin events: {e}")
        return []


def get_admin_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Owner endpoint to fetch any event regardless of status."""
    if not event_id:
        return None

    clean_id = str(event_id).strip()
    sb = get_supabase()
    if not sb:
        return None

    try:
        res = sb.from_("events").select("*").eq("id", clean_id).execute()
        if res.data:
            return res.data[0]
        return None
    except Exception as e:
        err_msg = str(e)
        if "22P02" in err_msg or "invalid input syntax for type uuid" in err_msg:
            return None
        if any(k in err_msg for k in ("PGRST205", "PGRST204", "42P01", "schema cache", "does not exist")):
            logger.info(f"Events table not yet created when querying admin event {clean_id}.")
        else:
            logger.error(f"Error fetching admin event {clean_id}: {e}")
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
        "category": _get_enum_val(data.category),
        "banner_url": data.banner_url.strip(),
        "description": data.description.strip() if data.description else None,
        "is_hackathon": data.is_hackathon,
        "prize_pool": data.prize_pool.strip() if (data.is_hackathon and data.prize_pool) else None,
        "team_size": data.team_size.strip() if (data.is_hackathon and data.team_size) else None,
        "mode": _get_enum_val(data.mode) if (data.is_hackathon and data.mode) else None,
        "status": _get_enum_val(data.status),
        "visible_from": _format_datetime(data.visible_from),
        "visible_until": _format_datetime(data.visible_until),
        "created_by": user_id if user_id else None,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        res = sb.from_("events").insert(record).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return record
    except Exception as e:
        err_msg = str(e)
        logger.error(f"Failed to insert event into database: {e}")
        if "foreign key" in err_msg.lower() or "created_by" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid creator user ID.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event in database: {str(e)}",
        )


def update_event(event_id: str, data: UpdateEventRequest) -> Dict[str, Any]:
    """Updates an existing event with provided fields."""
    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event ID is required.",
        )

    clean_id = str(event_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_event_by_id(clean_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{clean_id}' not found.",
        )

    # Date order cross-check with existing values
    eff_start = _parse_iso_utc(data.start_date if data.start_date is not None else existing.get("start_date"))
    eff_end = _parse_iso_utc(data.end_date if data.end_date is not None else existing.get("end_date"))
    if eff_start and eff_end and eff_end < eff_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be on or after the start date.",
        )

    # Visibility window cross-check with existing values
    eff_vfrom = _parse_iso_utc(data.visible_from if data.visible_from is not None else existing.get("visible_from"))
    eff_vuntil = _parse_iso_utc(data.visible_until if data.visible_until is not None else existing.get("visible_until"))
    if eff_vfrom and eff_vuntil and eff_vuntil <= eff_vfrom:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Visibility end date (visible_until) must be after visibility start date (visible_from).",
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
    if "registration_deadline" in data.model_fields_set:
        update_payload["registration_deadline"] = _format_datetime(data.registration_deadline)
    if data.start_date is not None:
        update_payload["start_date"] = _format_datetime(data.start_date)
    if data.end_date is not None:
        update_payload["end_date"] = _format_datetime(data.end_date)
    if "location" in data.model_fields_set:
        update_payload["location"] = data.location.strip() if data.location else None
    if data.category is not None:
        update_payload["category"] = _get_enum_val(data.category)
    if data.banner_url is not None:
        update_payload["banner_url"] = data.banner_url.strip()
    if "description" in data.model_fields_set:
        update_payload["description"] = data.description.strip() if data.description else None

    # Handle is_hackathon logic
    if data.is_hackathon is not None:
        update_payload["is_hackathon"] = data.is_hackathon
        if not data.is_hackathon:
            update_payload["prize_pool"] = None
            update_payload["team_size"] = None
            update_payload["mode"] = None
        else:
            if "prize_pool" in data.model_fields_set:
                update_payload["prize_pool"] = data.prize_pool.strip() if data.prize_pool else None
            if "team_size" in data.model_fields_set:
                update_payload["team_size"] = data.team_size.strip() if data.team_size else None
            if data.mode is not None:
                update_payload["mode"] = _get_enum_val(data.mode)
    else:
        # If is_hackathon wasn't altered, check fields if current is a hackathon
        if existing.get("is_hackathon"):
            if "prize_pool" in data.model_fields_set:
                update_payload["prize_pool"] = data.prize_pool.strip() if data.prize_pool else None
            if "team_size" in data.model_fields_set:
                update_payload["team_size"] = data.team_size.strip() if data.team_size else None
            if data.mode is not None:
                update_payload["mode"] = _get_enum_val(data.mode)

    if data.status is not None:
        update_payload["status"] = _get_enum_val(data.status)
    if "visible_from" in data.model_fields_set:
        update_payload["visible_from"] = _format_datetime(data.visible_from)
    if "visible_until" in data.model_fields_set:
        update_payload["visible_until"] = _format_datetime(data.visible_until)

    try:
        res = sb.from_("events").update(update_payload).eq("id", clean_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return {**existing, **update_payload}
    except Exception as e:
        err_msg = str(e)
        logger.error(f"Failed to update event {clean_id}: {e}")
        if "chk_events_date_order" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be on or after start date.",
            )
        if "chk_events_visibility_window" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visibility end date must be after visibility start date.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}",
        )


def set_event_status(event_id: str, new_status: Any) -> Dict[str, Any]:
    """Transitions an event to published or archived."""
    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event ID is required.",
        )

    clean_id = str(event_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    status_str = _get_enum_val(new_status)

    try:
        res = sb.from_("events").update({
            "status": status_str,
            "updated_at": now_iso,
        }).eq("id", clean_id).execute()

        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event '{clean_id}' not found.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e)
        if "22P02" in err_msg or "invalid input syntax for type uuid" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event '{clean_id}' not found.",
            )
        logger.error(f"Failed to set status on event {clean_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}",
        )


def delete_event(event_id: str) -> bool:
    """Deletes an event record from the database."""
    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event ID is required.",
        )

    clean_id = str(event_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        res = sb.from_("events").delete().eq("id", clean_id).execute()
        return True
    except Exception as e:
        err_msg = str(e)
        if "22P02" in err_msg or "invalid input syntax for type uuid" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event '{clean_id}' not found.",
            )
        logger.error(f"Failed to delete event {clean_id}: {e}")
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
        now_dt = datetime.now(timezone.utc)
        res = sb.from_("events").select("*").eq("status", EventStatus.PUBLISHED.value).execute()
        raw_events = res.data or []
        return sum(1 for ev in raw_events if _is_event_visible_now(ev, now_dt))
    except Exception:
        return 0


# ── BANNER IMAGE UPLOAD ───────────────────────────────────────────────────────

async def upload_banner_image(file: UploadFile, user_id: str) -> str:
    """
    Validates and stores an event poster/banner:
    - Validates file extension and content type
    - Validates 5MB size limit
    - Uploads to Supabase Storage 'event-banners' bucket (auto-creates bucket if needed)
    - Falls back to server static directory or base64 data URI if bucket is unavailable
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

    raw_content_type = (file.content_type or "").split(";")[0].strip().lower()
    if raw_content_type and raw_content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type '{raw_content_type}'. Must be JPEG, PNG, WebP, or GIF.",
        )

    content = await file.read()
    if len(content) > MAX_BANNER_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
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
            try:
                sb.storage.from_(bucket_name).upload(
                    path=unique_filename,
                    file=content,
                    file_options={"content-type": raw_content_type or "image/jpeg", "upsert": "true"},
                )
            except Exception as up_err:
                if "Bucket not found" in str(up_err) or "404" in str(up_err):
                    try:
                        sb.storage.create_bucket(bucket_name, options={"public": True})
                        sb.storage.from_(bucket_name).upload(
                            path=unique_filename,
                            file=content,
                            file_options={"content-type": raw_content_type or "image/jpeg", "upsert": "true"},
                        )
                    except Exception:
                        raise up_err
                else:
                    raise up_err

            public_url = sb.storage.from_(bucket_name).get_public_url(unique_filename)
            if public_url:
                return public_url
        except Exception as e:
            logger.warning(f"Supabase Storage bucket upload note: {e}. Utilizing fallback.")

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
        logger.warning(f"Static upload fallback note: {e}. Generating base64 data URI.")
        b64_data = base64.b64encode(content).decode("utf-8")
        mime = raw_content_type or "image/jpeg"
        return f"data:{mime};base64,{b64_data}"
