"""
backend/services/scholarship_service.py
Service layer handling database operations, server-side visibility conditions,
and Supabase Storage banner uploads for the SkillsCatalyst Scholarships CMS.
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import UploadFile, HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.scholarship import (
    CreateScholarshipRequest,
    UpdateScholarshipRequest,
    ScholarshipStatus,
)

logger = logging.getLogger("skillscatalyst.scholarships")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BANNER_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
STORAGE_BUCKET = "scholarship-banners"


def _get_enum_val(val: Any) -> Any:
    if val is None:
        return None
    return getattr(val, "value", val)


def _parse_iso_utc(val: Any) -> Optional[datetime]:
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


def _is_scholarship_visible_now(scholarship: Dict[str, Any], now_dt: datetime) -> bool:
    """
    Evaluates whether a scholarship satisfies student-visible criteria:
    1. status == 'published'
    2. visible_from <= now_dt (or NULL)
    3. visible_until > now_dt (or NULL)
    """
    if not scholarship or not isinstance(scholarship, dict):
        return False

    status_val = str(_get_enum_val(scholarship.get("status")) or "").strip().lower()
    if status_val != ScholarshipStatus.PUBLISHED.value:
        return False

    v_from = _parse_iso_utc(scholarship.get("visible_from"))
    if v_from and v_from > now_dt:
        return False

    v_until = _parse_iso_utc(scholarship.get("visible_until"))
    if v_until and v_until <= now_dt:
        return False

    return True


# ── STUDENT OPERATIONS ────────────────────────────────────────────────────────

def get_student_scholarships(
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    Fetches scholarships visible to students:
    - status = 'published'
    - visible_from <= NOW()
    - visible_until > NOW() (or NULL)
    """
    sb = get_supabase()
    if not sb:
        logger.warning("Supabase client unavailable when fetching student scholarships")
        return []

    now_dt = datetime.now(timezone.utc)

    try:
        query = (
            sb.from_("scholarships")
            .select("*")
            .eq("status", ScholarshipStatus.PUBLISHED.value)
            .order("created_at", desc=True)
        )

        res = query.execute()
        raw_items = res.data or []

        # Server-side visibility filtering
        visible_items = [s for s in raw_items if _is_scholarship_visible_now(s, now_dt)]

        if search and search.strip():
            kw = search.strip().lower()
            visible_items = [
                s for s in visible_items
                if kw in (s.get("name") or "").lower()
                or kw in (s.get("provided_by") or "").lower()
                or kw in (s.get("qualification_required") or "").lower()
                or kw in (s.get("eligibility") or "").lower()
            ]

        # Apply pagination
        paginated = visible_items[offset : offset + limit]

        # Format datetimes
        for s in paginated:
            s["visible_from"] = _format_datetime(s.get("visible_from"))
            s["visible_until"] = _format_datetime(s.get("visible_until"))
            s["created_at"] = _format_datetime(s.get("created_at"))
            s["updated_at"] = _format_datetime(s.get("updated_at"))

        return paginated
    except Exception as e:
        logger.error(f"Failed to fetch student scholarships: {e}")
        return []


def get_student_scholarship_by_id(scholarship_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a single scholarship for student consumption.
    Enforces that the scholarship is published and within its visibility window.
    Returns None (causing 404) if draft, archived, or outside visibility dates.
    """
    if not scholarship_id:
        return None

    clean_id = str(scholarship_id).strip()
    sb = get_supabase()
    if not sb:
        return None

    now_dt = datetime.now(timezone.utc)

    try:
        res = sb.from_("scholarships").select("*").eq("id", clean_id).execute()
        items = res.data or []
        if not items:
            return None

        scholarship = items[0]
        if not _is_scholarship_visible_now(scholarship, now_dt):
            return None

        scholarship["visible_from"] = _format_datetime(scholarship.get("visible_from"))
        scholarship["visible_until"] = _format_datetime(scholarship.get("visible_until"))
        scholarship["created_at"] = _format_datetime(scholarship.get("created_at"))
        scholarship["updated_at"] = _format_datetime(scholarship.get("updated_at"))
        return scholarship
    except Exception as e:
        logger.error(f"Error fetching student scholarship {clean_id}: {e}")
        return None


# ── ADMIN OPERATIONS ──────────────────────────────────────────────────────────

def get_admin_scholarships(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    Fetches all scholarships for the platform owner with optional status filtering and search.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        query = sb.from_("scholarships").select("*").order("created_at", desc=True)

        if status_filter:
            sf = status_filter.strip().lower()
            if sf in {ScholarshipStatus.DRAFT.value, ScholarshipStatus.PUBLISHED.value, ScholarshipStatus.ARCHIVED.value}:
                query = query.eq("status", sf)

        res = query.execute()
        items = res.data or []

        if search and search.strip():
            kw = search.strip().lower()
            items = [
                s for s in items
                if kw in (s.get("name") or "").lower()
                or kw in (s.get("provided_by") or "").lower()
                or kw in (s.get("qualification_required") or "").lower()
            ]

        paginated = items[offset : offset + limit]

        for s in paginated:
            s["visible_from"] = _format_datetime(s.get("visible_from"))
            s["visible_until"] = _format_datetime(s.get("visible_until"))
            s["created_at"] = _format_datetime(s.get("created_at"))
            s["updated_at"] = _format_datetime(s.get("updated_at"))

        return paginated
    except Exception as e:
        logger.error(f"Failed to fetch admin scholarships: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve scholarships: {str(e)}",
        )


def get_admin_scholarship_by_id(scholarship_id: str) -> Optional[Dict[str, Any]]:
    """Fetches any single scholarship (including draft/archived) for Admin inspection/editing."""
    if not scholarship_id:
        return None

    clean_id = str(scholarship_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        res = sb.from_("scholarships").select("*").eq("id", clean_id).execute()
        items = res.data or []
        if not items:
            return None

        s = items[0]
        s["visible_from"] = _format_datetime(s.get("visible_from"))
        s["visible_until"] = _format_datetime(s.get("visible_until"))
        s["created_at"] = _format_datetime(s.get("created_at"))
        s["updated_at"] = _format_datetime(s.get("updated_at"))
        return s
    except Exception as e:
        logger.error(f"Failed to fetch admin scholarship {clean_id}: {e}")
        return None


def create_scholarship(data: CreateScholarshipRequest, user_id: str) -> Dict[str, Any]:
    """Creates a new scholarship record. Authoritative created_by comes strictly from authenticated user."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    visible_from_iso = _format_datetime(data.visible_from) or now_iso
    visible_until_iso = _format_datetime(data.visible_until)

    row = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "provided_by": data.provided_by.strip(),
        "qualification_required": data.qualification_required.strip(),
        "eligibility": data.eligibility.strip(),
        "requirements": data.requirements.strip(),
        "application_url": data.application_url.strip(),
        "image_url": data.image_url.strip() if data.image_url else None,
        "status": _get_enum_val(data.status) or ScholarshipStatus.DRAFT.value,
        "visible_from": visible_from_iso,
        "visible_until": visible_until_iso,
        "created_by": user_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        res = sb.from_("scholarships").insert(row).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Insert succeeded but returned no data.",
            )
        created = res.data[0]
        created["visible_from"] = _format_datetime(created.get("visible_from"))
        created["visible_until"] = _format_datetime(created.get("visible_until"))
        created["created_at"] = _format_datetime(created.get("created_at"))
        created["updated_at"] = _format_datetime(created.get("updated_at"))
        return created
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create scholarship: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while creating scholarship: {str(e)}",
        )


def update_scholarship(scholarship_id: str, data: UpdateScholarshipRequest) -> Dict[str, Any]:
    """Partially updates an existing scholarship record."""
    if not scholarship_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship ID is required.",
        )

    clean_id = str(scholarship_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    payload: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}

    if data.name is not None:
        payload["name"] = data.name.strip()
    if data.provided_by is not None:
        payload["provided_by"] = data.provided_by.strip()
    if data.qualification_required is not None:
        payload["qualification_required"] = data.qualification_required.strip()
    if data.eligibility is not None:
        payload["eligibility"] = data.eligibility.strip()
    if data.requirements is not None:
        payload["requirements"] = data.requirements.strip()
    if data.application_url is not None:
        payload["application_url"] = data.application_url.strip()
    if data.image_url is not None:
        payload["image_url"] = data.image_url.strip() if data.image_url else None
    if data.status is not None:
        payload["status"] = _get_enum_val(data.status)
    if data.visible_from is not None:
        payload["visible_from"] = _format_datetime(data.visible_from)
    if data.visible_until is not None:
        payload["visible_until"] = _format_datetime(data.visible_until)

    try:
        res = sb.from_("scholarships").update(payload).eq("id", clean_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scholarship '{clean_id}' not found.",
            )
        updated = res.data[0]
        updated["visible_from"] = _format_datetime(updated.get("visible_from"))
        updated["visible_until"] = _format_datetime(updated.get("visible_until"))
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update scholarship {clean_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while updating scholarship: {str(e)}",
        )


def set_scholarship_status(scholarship_id: str, new_status: ScholarshipStatus) -> Dict[str, Any]:
    """Transitions a scholarship status to draft, published, or archived."""
    if not scholarship_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship ID is required.",
        )

    clean_id = str(scholarship_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    status_str = _get_enum_val(new_status)

    try:
        res = sb.from_("scholarships").update({
            "status": status_str,
            "updated_at": now_iso,
        }).eq("id", clean_id).execute()

        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scholarship '{clean_id}' not found.",
            )
        updated = res.data[0]
        updated["visible_from"] = _format_datetime(updated.get("visible_from"))
        updated["visible_until"] = _format_datetime(updated.get("visible_until"))
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to set status on scholarship {clean_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update scholarship status: {str(e)}",
        )


def delete_scholarship(scholarship_id: str) -> bool:
    """Deletes a scholarship record from the database."""
    if not scholarship_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship ID is required.",
        )

    clean_id = str(scholarship_id).strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        res = sb.from_("scholarships").delete().eq("id", clean_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete scholarship {clean_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete scholarship: {str(e)}",
        )


def get_active_scholarships_count() -> int:
    """
    Returns the real count of active published scholarships currently visible to students.
    Replaces previously hardcoded fake 8 in Admin Overview telemetry.
    """
    sb = get_supabase()
    if not sb:
        return 0

    try:
        now_dt = datetime.now(timezone.utc)
        res = sb.from_("scholarships").select("*").eq("status", ScholarshipStatus.PUBLISHED.value).execute()
        raw_items = res.data or []
        return sum(1 for s in raw_items if _is_scholarship_visible_now(s, now_dt))
    except Exception:
        return 0


# ── STORAGE UPLOAD ────────────────────────────────────────────────────────────

async def upload_scholarship_image(file: UploadFile, user_id: str) -> str:
    """
    Validates and stores a scholarship poster/banner image:
    - Validates MIME type and file extension (JPEG, PNG, WebP)
    - Validates 5MB size limit
    - Uploads directly to Supabase Storage bucket 'scholarship-banners'
    - Returns accessible public URL
    - Returns clear error on failure without filesystem fallback
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided.",
        )

    # 1. Validate extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{file_ext}'. Allowed types: {', '.join(sorted(ALLOWED_IMAGE_EXTS))}",
        )

    # 2. Validate MIME content type
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type '{content_type}'. Allowed types: image/jpeg, image/png, image/webp",
        )

    # 3. Read content & validate file size
    contents = await file.read()
    if len(contents) > MAX_BANNER_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 5 MB ({len(contents)} bytes received).",
        )

    # 4. Upload to Supabase Storage
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase storage service unavailable.",
        )

    storage_path = f"scholarship_{uuid.uuid4().hex[:12]}{file_ext}"

    try:
        # Upload via Supabase storage client
        res = sb.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": content_type, "cache-control": "3600"},
        )
        # Verify success or raise
        if hasattr(res, "error") and res.error:
            raise Exception(str(res.error))

        public_url = sb.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)
        logger.info(f"Successfully uploaded scholarship image to {public_url} by {user_id}")
        return public_url
    except Exception as e:
        logger.error(f"Supabase Storage upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage upload to Supabase failed: {str(e)}",
        )
