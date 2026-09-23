"""
backend/services/skillbits_service.py
Service layer for SkillBits: handling creation, updates, publish validation,
lifecycle transitions (draft/published/archived), and relational skill links.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.skillbits import (
    CreateSkillBitRequest,
    UpdateSkillBitRequest,
    SkillBitStatus,
    SkillBitDifficulty,
    VideoProvider,
)

logger = logging.getLogger("skillscatalyst.skillbits")


def _get_enum_val(val: Any) -> Optional[str]:
    if val is None:
        return None
    raw = getattr(val, "value", val)
    return str(raw).strip().lower() if raw is not None else None


def _format_datetime(dt: Any) -> Optional[str]:
    if not dt:
        return None
    if isinstance(dt, str):
        return dt.strip()
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return str(dt)


def validate_publish_readiness(record: Dict[str, Any]) -> None:
    """
    Enforces strict publish validation rules:
    A SkillBit MUST NOT be publishable unless:
    1. Title is present and non-empty.
    2. Difficulty is valid (beginner, intermediate, advanced).
    3. Video reference is present: video_provider is set and valid ('mux')
       AND playback_id (or video_asset_id) is non-empty.
    """
    missing = []

    title = str(record.get("title") or "").strip()
    if not title:
        missing.append("title")

    difficulty = _get_enum_val(record.get("difficulty"))
    if not difficulty or difficulty not in ("beginner", "intermediate", "advanced"):
        missing.append("valid difficulty (beginner, intermediate, advanced)")

    video_provider = _get_enum_val(record.get("video_provider"))
    if not video_provider or video_provider not in ("mux",):
        missing.append("valid video_provider ('mux')")

    playback_id = str(record.get("playback_id") or "").strip()
    video_asset_id = str(record.get("video_asset_id") or "").strip()
    if not playback_id and not video_asset_id:
        missing.append("video reference (playback_id or video_asset_id)")

    video_status = (record.get("video_status") or "").strip().upper()
    if video_status in ("ERROR", "UPLOADING"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot publish SkillBit: video is currently in '{video_status}' state.",
        )

    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot publish SkillBit: missing required fields: {', '.join(missing)}.",
        )


def _hydrate_associations(sb: Any, skillbit_ids: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Hydrates relational skills from public.skillbit_skills and public.skills_cache.
    Returns mapping of skillbit_id -> list of skill objects.
    """
    if not sb or not skillbit_ids:
        return {}

    skills_by_bit: Dict[str, List[Dict[str, Any]]] = {bid: [] for bid in skillbit_ids}
    try:
        rel_res = (
            sb.from_("skillbit_skills")
            .select("skillbit_id, skill_id")
            .in_("skillbit_id", skillbit_ids)
            .execute()
        )
        rel_rows = rel_res.data or []
        if not rel_rows:
            return skills_by_bit

        skill_ids = list({str(r["skill_id"]) for r in rel_rows if r.get("skill_id")})
        if not skill_ids:
            return skills_by_bit

        sc_res = (
            sb.from_("skills_cache")
            .select("id, skill_key, skill_name")
            .in_("id", skill_ids)
            .execute()
        )
        skills_lookup = {str(s["id"]): s for s in (sc_res.data or [])}

        for r in rel_rows:
            bid = str(r["skillbit_id"])
            sid = str(r["skill_id"])
            skill_info = skills_lookup.get(sid, {"id": sid, "skill_key": sid})
            if bid in skills_by_bit:
                skills_by_bit[bid].append(skill_info)

    except Exception as e:
        logger.warning(f"Notice: could not hydrate skillbit_skills associations: {e}")

    return skills_by_bit


def _enrich_admin_record(
    record: Dict[str, Any],
    skills_map: Optional[Dict[str, List[Dict[str, Any]]]] = None,
) -> Dict[str, Any]:
    """Enriches database row with formatted timestamps and normalized learning relationships."""
    bid = str(record.get("id"))
    skills = []
    if skills_map and bid in skills_map:
        skills = skills_map[bid]

    return {
        "id": bid,
        "title": record.get("title", ""),
        "description": record.get("description"),
        "topic": record.get("topic"),
        "difficulty": _get_enum_val(record.get("difficulty")) or "beginner",
        "duration_seconds": record.get("duration_seconds"),
        "thumbnail_url": record.get("thumbnail_url"),
        "video_provider": _get_enum_val(record.get("video_provider")),
        "video_asset_id": record.get("video_asset_id"),
        "playback_id": record.get("playback_id"),
        "status": _get_enum_val(record.get("status")) or "draft",
        "video_status": (record.get("video_status") or "NOT_UPLOADED").upper(),
        "mux_upload_id": record.get("mux_upload_id"),
        "published_at": _format_datetime(record.get("published_at")),
        "created_by": str(record.get("created_by") or ""),
        "created_at": _format_datetime(record.get("created_at")),
        "updated_at": _format_datetime(record.get("updated_at")),
        "skills": skills,
        "courses": [],  # Relational courses table deferred
        "lessons": [],  # Relational lessons table deferred
        "roadmaps": [], # Relational roadmaps table deferred
    }


def _enrich_student_record(
    record: Dict[str, Any],
    skills_map: Optional[Dict[str, List[Dict[str, Any]]]] = None,
) -> Dict[str, Any]:
    """Projects public student-facing view for Reels video player without internal credentials."""
    bid = str(record.get("id"))
    skills = []
    if skills_map and bid in skills_map:
        skills = skills_map[bid]

    return {
        "id": bid,
        "title": record.get("title", ""),
        "description": record.get("description"),
        "topic": record.get("topic"),
        "difficulty": _get_enum_val(record.get("difficulty")) or "beginner",
        "duration_seconds": record.get("duration_seconds"),
        "thumbnail_url": record.get("thumbnail_url"),
        "video_provider": _get_enum_val(record.get("video_provider")),
        "playback_id": record.get("playback_id"),
        "skills": skills,
        "courses": [],  # Relational courses table deferred
        "lessons": [],  # Relational lessons table deferred
        "roadmaps": [], # Relational roadmaps table deferred
        "published_at": _format_datetime(record.get("published_at")),
    }


def create_skillbit(data: CreateSkillBitRequest, user_id: str) -> Dict[str, Any]:
    """
    Creates a new SkillBit in draft or published status.
    If status is published, validates publish readiness first.
    Persists skill relations into public.skillbit_skills.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    status_val = _get_enum_val(data.status) or SkillBitStatus.DRAFT.value
    difficulty_val = _get_enum_val(data.difficulty)
    provider_val = _get_enum_val(data.video_provider)

    candidate = {
        "title": data.title,
        "description": data.description,
        "topic": data.topic,
        "difficulty": difficulty_val,
        "duration_seconds": data.duration_seconds,
        "thumbnail_url": data.thumbnail_url,
        "video_provider": provider_val,
        "video_asset_id": data.video_asset_id,
        "playback_id": data.playback_id,
        "status": status_val,
    }

    published_at = None
    if status_val == SkillBitStatus.PUBLISHED.value:
        validate_publish_readiness(candidate)
        published_at = datetime.now(timezone.utc).isoformat()

    insert_payload = {
        **candidate,
        "published_at": published_at,
        "created_by": user_id,
    }

    try:
        res = sb.from_("skillbits").insert(insert_payload).execute()
        rows = res.data or []
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create SkillBit record.",
            )
        created = rows[0]
        skillbit_id = str(created["id"])

        # Insert skill relationships if provided
        if data.skill_ids:
            try:
                rel_inserts = [
                    {"skillbit_id": skillbit_id, "skill_id": sid}
                    for sid in data.skill_ids
                ]
                sb.from_("skillbit_skills").insert(rel_inserts).execute()
            except Exception as e:
                logger.warning(f"Could not link skillbit_skills on creation: {e}")

        skills_map = _hydrate_associations(sb, [skillbit_id])
        return _enrich_admin_record(created, skills_map)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating SkillBit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create SkillBit: {str(e)}",
        )


def update_skillbit(skillbit_id: str, data: UpdateSkillBitRequest) -> Dict[str, Any]:
    """
    Partially updates an existing SkillBit.
    If status transitions to published, enforces publish validation.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    # 1. Fetch current record
    existing = get_admin_skillbit_by_id(skillbit_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )

    # 2. Build candidate merged dict for validation
    merged = dict(existing)
    update_payload: Dict[str, Any] = {}

    if data.title is not None:
        update_payload["title"] = data.title
        merged["title"] = data.title

    if data.description is not None:
        update_payload["description"] = data.description
        merged["description"] = data.description

    if data.topic is not None:
        update_payload["topic"] = data.topic
        merged["topic"] = data.topic

    if data.difficulty is not None:
        diff_val = _get_enum_val(data.difficulty)
        update_payload["difficulty"] = diff_val
        merged["difficulty"] = diff_val

    if data.duration_seconds is not None:
        update_payload["duration_seconds"] = data.duration_seconds
        merged["duration_seconds"] = data.duration_seconds

    if data.thumbnail_url is not None:
        update_payload["thumbnail_url"] = data.thumbnail_url
        merged["thumbnail_url"] = data.thumbnail_url

    if data.video_provider is not None:
        vp_val = _get_enum_val(data.video_provider)
        update_payload["video_provider"] = vp_val
        merged["video_provider"] = vp_val

    if data.video_asset_id is not None:
        update_payload["video_asset_id"] = data.video_asset_id
        merged["video_asset_id"] = data.video_asset_id

    if data.playback_id is not None:
        update_payload["playback_id"] = data.playback_id
        merged["playback_id"] = data.playback_id

    if data.status is not None:
        st_val = _get_enum_val(data.status)
        update_payload["status"] = st_val
        merged["status"] = st_val

        if st_val == SkillBitStatus.PUBLISHED.value:
            validate_publish_readiness(merged)
            if not existing.get("published_at"):
                update_payload["published_at"] = datetime.now(timezone.utc).isoformat()

    # If already published and updating content, verify it remains valid
    if merged.get("status") == SkillBitStatus.PUBLISHED.value:
        validate_publish_readiness(merged)

    if update_payload:
        try:
            res = (
                sb.from_("skillbits")
                .update(update_payload)
                .eq("id", skillbit_id)
                .execute()
            )
            rows = res.data or []
            if rows:
                existing = rows[0]
        except Exception as e:
            logger.error(f"Error updating SkillBit {skillbit_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update SkillBit: {str(e)}",
            )

    # 3. Handle skill_ids replacement if explicitly provided
    if data.skill_ids is not None:
        try:
            sb.from_("skillbit_skills").delete().eq("skillbit_id", skillbit_id).execute()
            if data.skill_ids:
                rel_inserts = [
                    {"skillbit_id": skillbit_id, "skill_id": sid}
                    for sid in data.skill_ids
                ]
                sb.from_("skillbit_skills").insert(rel_inserts).execute()
        except Exception as e:
            logger.warning(f"Error syncing skillbit_skills for {skillbit_id}: {e}")

    skills_map = _hydrate_associations(sb, [skillbit_id])
    return _enrich_admin_record(existing, skills_map)


def publish_skillbit(skillbit_id: str) -> Dict[str, Any]:
    """
    Validates publication readiness and transitions a SkillBit from draft/archived to published.
    Sets published_at timestamp.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_skillbit_by_id(skillbit_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )

    # Validate readiness
    validate_publish_readiness(existing)

    published_at = existing.get("published_at") or datetime.now(timezone.utc).isoformat()

    try:
        res = (
            sb.from_("skillbits")
            .update({
                "status": SkillBitStatus.PUBLISHED.value,
                "published_at": published_at,
            })
            .eq("id", skillbit_id)
            .execute()
        )
        rows = res.data or []
        updated = rows[0] if rows else {**existing, "status": SkillBitStatus.PUBLISHED.value, "published_at": published_at}
        skills_map = _hydrate_associations(sb, [skillbit_id])
        return _enrich_admin_record(updated, skills_map)
    except Exception as e:
        logger.error(f"Error publishing SkillBit {skillbit_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish SkillBit: {str(e)}",
        )


def archive_skillbit(skillbit_id: str) -> Dict[str, Any]:
    """
    Transitions a SkillBit to archived status, immediately hiding it from the student feed
    while preserving records and associations for audit history.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_skillbit_by_id(skillbit_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )

    try:
        res = (
            sb.from_("skillbits")
            .update({"status": SkillBitStatus.ARCHIVED.value})
            .eq("id", skillbit_id)
            .execute()
        )
        rows = res.data or []
        updated = rows[0] if rows else {**existing, "status": SkillBitStatus.ARCHIVED.value}
        skills_map = _hydrate_associations(sb, [skillbit_id])
        return _enrich_admin_record(updated, skills_map)
    except Exception as e:
        logger.error(f"Error archiving SkillBit {skillbit_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to archive SkillBit: {str(e)}",
        )


def get_admin_skillbit_by_id(skillbit_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a single SkillBit for CMS management (any status)."""
    if not skillbit_id:
        return None
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    try:
        res = sb.from_("skillbits").select("*").eq("id", str(skillbit_id).strip()).execute()
        rows = res.data or []
        if not rows:
            return None
        skills_map = _hydrate_associations(sb, [str(rows[0]["id"])])
        return _enrich_admin_record(rows[0], skills_map)
    except Exception as e:
        logger.error(f"Failed to fetch admin SkillBit {skillbit_id}: {e}")
        return None


def get_admin_skillbits(
    status_filter: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """Retrieves all SkillBits for CMS admin directory with optional filters."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    try:
        query = sb.from_("skillbits").select("*").order("created_at", desc=True)

        if status_filter and status_filter.strip():
            query = query.eq("status", status_filter.strip().lower())
        if topic and topic.strip():
            query = query.eq("topic", topic.strip())
        if difficulty and difficulty.strip():
            query = query.eq("difficulty", difficulty.strip().lower())
        if search and search.strip():
            query = query.ilike("title", f"%{search.strip()}%")

        query = query.range(offset, offset + limit - 1)
        res = query.execute()
        rows = res.data or []

        bids = [str(r["id"]) for r in rows]
        skills_map = _hydrate_associations(sb, bids)

        return [_enrich_admin_record(r, skills_map) for r in rows]
    except Exception as e:
        logger.error(f"Failed to list admin SkillBits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve SkillBits: {str(e)}",
        )


def get_student_skillbits(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    Retrieves published SkillBits for student learning feed.
    Strictly filters out draft and archived records.
    Ordered by published_at DESC.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    try:
        query = (
            sb.from_("skillbits")
            .select("*")
            .eq("status", SkillBitStatus.PUBLISHED.value)
            .order("published_at", desc=True)
        )

        if topic and topic.strip():
            query = query.eq("topic", topic.strip())
        if difficulty and difficulty.strip():
            query = query.eq("difficulty", difficulty.strip().lower())
        if search and search.strip():
            query = query.ilike("title", f"%{search.strip()}%")

        query = query.range(offset, offset + limit - 1)
        res = query.execute()
        rows = res.data or []

        bids = [str(r["id"]) for r in rows]
        skills_map = _hydrate_associations(sb, bids)

        return [_enrich_student_record(r, skills_map) for r in rows]
    except Exception as e:
        logger.error(f"Failed to list student SkillBits: {e}")
        return []


def get_student_skillbit_by_id(skillbit_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single published SkillBit for a student.
    Returns None if the SkillBit does not exist, or is in draft/archived status.
    """
    if not skillbit_id:
        return None
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    try:
        res = (
            sb.from_("skillbits")
            .select("*")
            .eq("id", str(skillbit_id).strip())
            .eq("status", SkillBitStatus.PUBLISHED.value)
            .execute()
        )
        rows = res.data or []
        if not rows:
            return None
        skills_map = _hydrate_associations(sb, [str(rows[0]["id"])])
        return _enrich_student_record(rows[0], skills_map)
    except Exception as e:
        logger.error(f"Failed to fetch student SkillBit {skillbit_id}: {e}")
        return None


# ── MUX DIRECT UPLOAD & VIDEO PIPELINE (STEP 2) ──────────────────────────────

async def request_direct_upload(skillbit_id: str, cors_origin: Optional[str] = None) -> Dict[str, Any]:
    """
    Creates a direct upload session with Mux and persists the upload ID on the SkillBit record.
    Video status is transitioned to 'UPLOADING'.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_skillbit_by_id(skillbit_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )

    from backend.services import video_service
    upload_data = await video_service.create_direct_upload(skillbit_id=skillbit_id, cors_origin=cors_origin)
    upload_id = upload_data["upload_id"]
    upload_url = upload_data["upload_url"]

    update_payload = {
        "mux_upload_id": upload_id,
        "video_status": "UPLOADING",
        "video_provider": "mux",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        sb.from_("skillbits").update(update_payload).eq("id", skillbit_id).execute()
    except Exception as e:
        logger.error(f"Failed to save upload session for SkillBit {skillbit_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record upload session in database.",
        )

    return {
        "upload_id": upload_id,
        "upload_url": upload_url,
        "status": upload_data.get("status", "waiting"),
    }


async def sync_video_status(skillbit_id: str) -> Dict[str, Any]:
    """
    Polls/synchronizes video ingestion status from Mux.
    If the asset is ready, updates playback_id, duration_seconds, and marks video_status as 'READY'.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    existing = get_admin_skillbit_by_id(skillbit_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )

    curr_status = (existing.get("video_status") or "NOT_UPLOADED").upper()
    upload_id = existing.get("mux_upload_id")
    asset_id = existing.get("video_asset_id")
    playback_id = existing.get("playback_id")
    duration = existing.get("duration_seconds")

    # If already marked READY with playback ID, return immediately
    if curr_status == "READY" and playback_id:
        return {
            "video_status": "READY",
            "video_provider": existing.get("video_provider") or "mux",
            "video_asset_id": asset_id,
            "playback_id": playback_id,
            "duration_seconds": duration,
        }

    from backend.services import video_service

    # Step A: If we have upload_id and need asset_id
    if upload_id and not asset_id:
        try:
            upload_info = await video_service.get_upload_status(upload_id)
            new_asset_id = upload_info.get("asset_id")
            upload_status_val = upload_info.get("status")

            if upload_status_val == "errored":
                curr_status = "ERROR"
                sb.from_("skillbits").update({"video_status": "ERROR"}).eq("id", skillbit_id).execute()
            elif new_asset_id:
                asset_id = new_asset_id
                curr_status = "PROCESSING"
                sb.from_("skillbits").update({
                    "video_asset_id": asset_id,
                    "video_status": "PROCESSING",
                }).eq("id", skillbit_id).execute()
        except Exception as e:
            logger.warning(f"Error querying Mux upload {upload_id}: {e}")

    # Step B: If we have asset_id, inspect asset status and details
    if asset_id:
        try:
            asset_info = await video_service.get_asset_details(asset_id)
            asset_status = asset_info.get("status")

            if asset_status == "ready":
                curr_status = "READY"
                p_id = video_service.extract_playback_id(asset_info)
                if p_id:
                    playback_id = p_id
                dur_raw = asset_info.get("duration")
                if dur_raw is not None:
                    try:
                        duration = int(round(float(dur_raw)))
                    except (ValueError, TypeError):
                        pass

                sb.from_("skillbits").update({
                    "video_status": "READY",
                    "playback_id": playback_id,
                    "duration_seconds": duration,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", skillbit_id).execute()

            elif asset_status == "errored":
                curr_status = "ERROR"
                sb.from_("skillbits").update({"video_status": "ERROR"}).eq("id", skillbit_id).execute()
            elif asset_status == "preparing":
                curr_status = "PROCESSING"
                sb.from_("skillbits").update({"video_status": "PROCESSING"}).eq("id", skillbit_id).execute()
        except Exception as e:
            logger.warning(f"Error querying Mux asset {asset_id}: {e}")

    return {
        "video_status": curr_status,
        "video_provider": existing.get("video_provider") or "mux",
        "video_asset_id": asset_id,
        "playback_id": playback_id,
        "duration_seconds": duration,
    }


async def process_mux_webhook(raw_body: bytes, signature_header: Optional[str]) -> Dict[str, Any]:
    """
    Authoritative handler for Mux S2S Webhooks.
    1. Validates HMAC-SHA256 signature against MUX_WEBHOOK_SECRET.
    2. Enforces idempotency via public.mux_webhook_events.
    3. Handles video.upload.asset_created, video.asset.ready, video.asset.errored.
    """
    from backend.services import video_service
    import json

    # 1. Cryptographic signature check
    is_valid = video_service.verify_webhook_authenticity(raw_body, signature_header)
    if not is_valid:
        logger.warning("Rejected Mux webhook: invalid signature or expired timestamp.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature.",
        )

    # 2. Parse payload
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        logger.error(f"Failed to parse Mux webhook JSON payload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload.",
        )

    event_id = payload.get("id")
    event_type = payload.get("type", "")
    event_data = payload.get("data", {})

    if not event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing event id in webhook payload.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable.")

    # 3. Idempotency Check
    try:
        existing_evt = sb.from_("mux_webhook_events").select("id, processing_status").eq("event_id", event_id).execute()
        if existing_evt.data and len(existing_evt.data) > 0:
            status_val = existing_evt.data[0].get("processing_status")
            if status_val == "processed":
                logger.info(f"Mux webhook event {event_id} already processed. Skipping idempotently.")
                return {"success": True, "status": "already_processed", "event_id": event_id}
    except Exception as e:
        logger.warning(f"Error querying mux_webhook_events: {e}")

    passthrough = event_data.get("passthrough") or ""
    skillbit_id = None
    if passthrough:
        skillbit_id = str(passthrough).strip()

    if not skillbit_id and event_type.startswith("video.upload."):
        upload_id = event_data.get("id")
        if upload_id:
            try:
                sb_res = sb.from_("skillbits").select("id").eq("mux_upload_id", upload_id).execute()
                if sb_res.data and len(sb_res.data) > 0:
                    skillbit_id = str(sb_res.data[0]["id"])
            except Exception:
                pass

    # Record event in processing state
    try:
        sb.from_("mux_webhook_events").upsert({
            "event_id": event_id,
            "event_type": event_type,
            "skillbit_id": skillbit_id,
            "processing_status": "processing",
            "payload_summary": {
                "type": event_type,
                "asset_id": event_data.get("asset_id") or event_data.get("id"),
            },
        }, on_conflict="event_id").execute()
    except Exception as e:
        logger.warning(f"Could not insert mux_webhook_events: {e}")

    # 4. Handle Lifecycle
    try:
        if event_type == "video.upload.asset_created":
            asset_id = event_data.get("asset_id")
            upload_id = event_data.get("id")
            if asset_id:
                query = sb.from_("skillbits").update({
                    "video_asset_id": asset_id,
                    "video_status": "PROCESSING",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                })
                if skillbit_id:
                    query.eq("id", skillbit_id).execute()
                elif upload_id:
                    query.eq("mux_upload_id", upload_id).execute()

        elif event_type == "video.asset.ready":
            asset_id = event_data.get("id")
            playback_id = video_service.extract_playback_id(event_data)
            duration_raw = event_data.get("duration")
            duration_seconds = None
            if duration_raw is not None:
                try:
                    duration_seconds = int(round(float(duration_raw)))
                except (ValueError, TypeError):
                    pass

            update_dict: Dict[str, Any] = {
                "video_status": "READY",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            if playback_id:
                update_dict["playback_id"] = playback_id
            if duration_seconds is not None:
                update_dict["duration_seconds"] = duration_seconds
            if asset_id:
                update_dict["video_asset_id"] = asset_id

            query = sb.from_("skillbits").update(update_dict)
            if skillbit_id:
                query.eq("id", skillbit_id).execute()
            elif asset_id:
                query.eq("video_asset_id", asset_id).execute()

        elif event_type in ("video.asset.errored", "video.upload.errored", "video.upload.cancelled"):
            asset_id = event_data.get("id") or event_data.get("asset_id")
            upload_id = event_data.get("id")
            update_dict = {
                "video_status": "ERROR",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            query = sb.from_("skillbits").update(update_dict)
            if skillbit_id:
                query.eq("id", skillbit_id).execute()
            elif asset_id:
                query.eq("video_asset_id", asset_id).execute()
            elif upload_id:
                query.eq("mux_upload_id", upload_id).execute()

        # Mark completed
        try:
            sb.from_("mux_webhook_events").update({
                "processing_status": "processed",
                "processed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("event_id", event_id).execute()
        except Exception as e:
            logger.warning(f"Could not mark mux_webhook_events as processed: {e}")

        return {"success": True, "event_id": event_id, "type": event_type}

    except Exception as e:
        logger.error(f"Error handling Mux webhook {event_id}: {e}")
        try:
            sb.from_("mux_webhook_events").update({
                "processing_status": "failed",
            }).eq("event_id", event_id).execute()
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing error: {str(e)}",
        )
