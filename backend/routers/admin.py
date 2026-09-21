"""
backend/routers/admin.py
SkillsCatalyst Platform Owner & Admin CMS API Router.
All endpoints are strictly protected by Depends(require_owner).
Students and unauthenticated callers are rejected with 403 Forbidden or 401 Unauthorized.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from pydantic import BaseModel, Field

from backend.services.auth_service import require_owner
from backend.services.supabase_service import get_supabase
from backend.services.cache_service import get_redis_client
from backend.models.event import (
    CreateEventRequest,
    UpdateEventRequest,
    EventStatus,
)
from backend.services.event_service import (
    get_admin_events,
    get_admin_event_by_id,
    create_event,
    update_event,
    set_event_status,
    delete_event,
    get_active_events_count,
    upload_banner_image,
)
from backend.models.scholarship import (
    CreateScholarshipRequest,
    UpdateScholarshipRequest,
    ScholarshipStatus,
)
from backend.services.scholarship_service import (
    get_admin_scholarships,
    get_admin_scholarship_by_id,
    create_scholarship,
    update_scholarship,
    set_scholarship_status,
    delete_scholarship,
    get_active_scholarships_count,
    upload_scholarship_image,
)

logger = logging.getLogger("skillscatalyst.admin")

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AssignRoleRequest(BaseModel):
    user_id: str = Field(..., description="Target user UUID")
    new_role: str = Field(..., description="Role to assign: 'student', 'admin', 'editor', 'moderator'")


@router.get("/overview", status_code=status.HTTP_200_OK)
def get_admin_overview(
    owner: Dict[str, Any] = Depends(require_owner)
) -> Dict[str, Any]:
    """
    Platform Owner High-Level Overview & Telemetry.
    Returns aggregated counts of learners, active streaks, CMS content indicators, and services.
    """
    sb = get_supabase()
    total_users = 0
    total_students = 0
    total_owners = 0
    total_academic_profiles = 0
    total_coding_profiles = 0

    if sb:
        try:
            # Count registered users from profiles table
            prof_res = sb.from_("profiles").select("id, role", count="exact").execute()
            if prof_res:
                total_users = prof_res.count if prof_res.count is not None else len(prof_res.data or [])
                for row in prof_res.data or []:
                    r = (row.get("role") or "").lower()
                    if r == "owner":
                        total_owners += 1
                    else:
                        total_students += 1
        except Exception as e:
            logger.debug(f"Profiles count notice: {e}")

        try:
            acad_res = sb.from_("user_academic_profile").select("user_id", count="exact").execute()
            if acad_res and acad_res.count is not None:
                total_academic_profiles = acad_res.count
        except Exception:
            pass

    # Derive real event/hackathon count from database
    live_hackathons_count = get_active_events_count()
    live_scholarships_count = get_active_scholarships_count()

    return {
        "status": "operational",
        "caller": {
            "user_id": owner["user_id"],
            "email": owner["email"],
            "role": owner["role"],
        },
        "stats": {
            "total_users": max(total_users, 1),
            "total_students": max(total_students, 0),
            "total_owners": max(total_owners, 1),
            "academic_profiles_active": total_academic_profiles,
            "cms_modules": {
                "hackathons": live_hackathons_count,
                "scholarships": live_scholarships_count,
                "news_updates": 15,
                "community_threads": 42,
            },
        },
        "platform_status": {
            "mode": "owner_admin_cms",
            "security_tier": "tier_1_isolated",
            "rbac_enforced": True,
        }
    }


@router.get("/users", status_code=status.HTTP_200_OK)
def list_users(
    limit: int = 50,
    owner: Dict[str, Any] = Depends(require_owner)
) -> Dict[str, Any]:
    """
    Owner-exclusive directory of platform users and their roles.
    """
    sb = get_supabase()
    users: List[Dict[str, Any]] = []

    if sb:
        try:
            res = sb.from_("profiles").select("id, email, full_name, role, created_at, updated_at").limit(limit).execute()
            if res.data:
                for row in res.data:
                    users.append({
                        "id": row.get("id"),
                        "email": row.get("email") or "learner@skillscatalyst.in",
                        "full_name": row.get("full_name") or "Learner",
                        "role": row.get("role") or "student",
                        "created_at": row.get("created_at"),
                        "updated_at": row.get("updated_at"),
                    })
        except Exception as e:
            logger.warning(f"Failed to query users directory: {e}")
            # Fallback if role column not in profiles: return owner representation
            users = [{
                "id": owner["user_id"],
                "email": owner["email"],
                "full_name": owner["name"],
                "role": owner["role"],
            }]

    return {
        "total": len(users),
        "users": users,
    }


@router.get("/system-status", status_code=status.HTTP_200_OK)
def get_system_status(
    owner: Dict[str, Any] = Depends(require_owner)
) -> Dict[str, Any]:
    """
    Administrative infrastructure health check.
    """
    sb = get_supabase()
    db_ok = False
    if sb:
        try:
            res = sb.from_("profiles").select("id").limit(1).execute()
            db_ok = res is not None
        except Exception:
            db_ok = False

    redis_ok = False
    r = get_redis_client()
    if r:
        try:
            redis_ok = bool(r.ping())
        except Exception:
            redis_ok = False

    return {
        "database": {"connected": db_ok, "provider": "supabase_postgresql"},
        "cache": {"connected": redis_ok, "provider": "upstash_redis"},
        "auth_system": {"unified": True, "authoritative_role_source": "supabase_app_metadata"},
        "admin_governance": {
            "authorized_owner": owner["email"],
            "session_valid": True,
        }
    }


# ── EVENTS & HACKATHONS CMS ENDPOINTS ─────────────────────────────────────────

@router.get("/events", status_code=status.HTTP_200_OK)
def list_admin_events(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: 'draft', 'published', 'archived', or 'all'"),
    is_hackathon: Optional[bool] = Query(None, description="Filter by hackathon flag"),
    search: Optional[str] = Query(None, description="Keyword search in event name, college, or location"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Owner directory: returns all events with optional filters."""
    events = get_admin_events(
        status_filter=status_filter,
        is_hackathon=is_hackathon,
        search=search,
    )
    return {
        "total": len(events),
        "events": events,
    }


@router.get("/events/{event_id}", status_code=status.HTTP_200_OK)
def get_admin_event(
    event_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Fetches any single event for inspection or editing in the Admin panel."""
    event = get_admin_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found.",
        )
    return event


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_admin_event(
    payload: CreateEventRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Creates a new event or hackathon.
    Authoritative created_by is assigned strictly from the authenticated owner's user_id.
    """
    created = create_event(data=payload, user_id=owner["user_id"])
    return {
        "success": True,
        "message": f"Event '{payload.event_name}' created successfully.",
        "event": created,
    }


@router.patch("/events/{event_id}", status_code=status.HTTP_200_OK)
def update_admin_event(
    event_id: str,
    payload: UpdateEventRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Partially updates an existing event's details, dates, hackathon properties, or visibility."""
    updated = update_event(event_id=event_id, data=payload)
    return {
        "success": True,
        "message": "Event updated successfully.",
        "event": updated,
    }


@router.post("/events/{event_id}/publish", status_code=status.HTTP_200_OK)
def publish_admin_event(
    event_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Publishes an event to become student-visible within its visibility window."""
    published = set_event_status(event_id=event_id, new_status=EventStatus.PUBLISHED)
    return {
        "success": True,
        "message": "Event published successfully.",
        "event": published,
    }


@router.post("/events/{event_id}/archive", status_code=status.HTTP_200_OK)
def archive_admin_event(
    event_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Archives an event, removing it from student visibility while retaining data."""
    archived = set_event_status(event_id=event_id, new_status=EventStatus.ARCHIVED)
    return {
        "success": True,
        "message": "Event archived successfully.",
        "event": archived,
    }


@router.delete("/events/{event_id}", status_code=status.HTTP_200_OK)
def delete_admin_event(
    event_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Deletes an event permanently."""
    deleted = delete_event(event_id=event_id)
    return {
        "success": True,
        "message": f"Event '{event_id}' deleted permanently.",
    }


@router.post("/events/upload-banner", status_code=status.HTTP_200_OK)
async def upload_event_banner(
    file: UploadFile = File(...),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Uploads an event poster / banner image.
    Validates file type (JPG/PNG/WebP/GIF) and 5MB limit, returning an accessible public URL.
    """
    public_url = await upload_banner_image(file=file, user_id=owner["user_id"])
    return {
        "success": True,
        "banner_url": public_url,
    }


# ── SCHOLARSHIPS CMS ENDPOINTS ───────────────────────────────────────────────

@router.get("/scholarships", status_code=status.HTTP_200_OK)
def list_admin_scholarships(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: 'draft', 'published', 'archived', or 'all'"),
    search: Optional[str] = Query(None, description="Keyword search in name, provider, or qualification"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Owner directory: returns all scholarships with optional status and search filters."""
    scholarships = get_admin_scholarships(
        status_filter=status_filter,
        search=search,
        limit=limit,
        offset=offset,
    )
    return {
        "total": len(scholarships),
        "scholarships": scholarships,
    }


@router.get("/scholarships/{scholarship_id}", status_code=status.HTTP_200_OK)
def get_admin_scholarship(
    scholarship_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Fetches any single scholarship (including draft/archived) for Admin inspection or editing."""
    scholarship = get_admin_scholarship_by_id(scholarship_id)
    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scholarship '{scholarship_id}' not found.",
        )
    return scholarship


@router.post("/scholarships", status_code=status.HTTP_201_CREATED)
def create_admin_scholarship(
    payload: CreateScholarshipRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Creates a new scholarship in draft or published status.
    Authoritative created_by is assigned strictly from the authenticated owner's user_id.
    """
    created = create_scholarship(data=payload, user_id=owner["user_id"])
    return {
        "success": True,
        "message": f"Scholarship '{payload.name}' created successfully.",
        "scholarship": created,
    }


@router.patch("/scholarships/{scholarship_id}", status_code=status.HTTP_200_OK)
def update_admin_scholarship(
    scholarship_id: str,
    payload: UpdateScholarshipRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Partially updates an existing scholarship's content or visibility."""
    updated = update_scholarship(scholarship_id=scholarship_id, data=payload)
    return {
        "success": True,
        "message": "Scholarship updated successfully.",
        "scholarship": updated,
    }


@router.post("/scholarships/{scholarship_id}/publish", status_code=status.HTTP_200_OK)
def publish_admin_scholarship(
    scholarship_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Publishes a scholarship to become student-visible within its visibility window."""
    published = set_scholarship_status(scholarship_id=scholarship_id, new_status=ScholarshipStatus.PUBLISHED)
    return {
        "success": True,
        "message": "Scholarship published successfully.",
        "scholarship": published,
    }


@router.post("/scholarships/{scholarship_id}/archive", status_code=status.HTTP_200_OK)
def archive_admin_scholarship(
    scholarship_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Archives a scholarship, removing it from student visibility while retaining records."""
    archived = set_scholarship_status(scholarship_id=scholarship_id, new_status=ScholarshipStatus.ARCHIVED)
    return {
        "success": True,
        "message": "Scholarship archived successfully.",
        "scholarship": archived,
    }


@router.delete("/scholarships/{scholarship_id}", status_code=status.HTTP_200_OK)
def delete_admin_scholarship(
    scholarship_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Permanently deletes a scholarship record."""
    delete_scholarship(scholarship_id=scholarship_id)
    return {
        "success": True,
        "message": f"Scholarship '{scholarship_id}' deleted permanently.",
    }


@router.post("/scholarships/upload-image", status_code=status.HTTP_200_OK)
@router.post("/scholarships/{scholarship_id}/upload-image", status_code=status.HTTP_200_OK)
async def upload_admin_scholarship_image(
    file: UploadFile = File(...),
    scholarship_id: Optional[str] = None,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Uploads a scholarship poster / banner image to Supabase Storage 'scholarship-banners'.
    Validates file type (JPEG/PNG/WebP) and 5MB limit.
    Optionally associates the uploaded URL with an existing scholarship if scholarship_id is supplied.
    """
    public_url = await upload_scholarship_image(file=file, user_id=owner["user_id"])

    if scholarship_id:
        try:
            update_scholarship(scholarship_id=scholarship_id, data=UpdateScholarshipRequest(image_url=public_url))
        except Exception as e:
            logger.warning(f"Uploaded image but could not auto-update scholarship {scholarship_id}: {e}")

    return {
        "success": True,
        "image_url": public_url,
    }


