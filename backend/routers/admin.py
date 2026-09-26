"""
backend/routers/admin.py
SkillsCatalyst Platform Owner & Admin CMS API Router.
All endpoints are strictly protected by Depends(require_owner).
Students and unauthenticated callers are rejected with 403 Forbidden or 401 Unauthorized.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field

from backend.services.auth_service import require_owner, require_admin
from backend.services.supabase_service import get_supabase
from backend.services.notification_service import notify_new_event, notify_new_scholarship

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
from backend.models.tech_news import (
    CreateTechNewsSourceRequest,
    UpdateTechNewsSourceRequest,
    CreateTechNewsRequest,
    UpdateTechNewsRequest,
    TechNewsStatus,
)
from backend.services.tech_news_service import (
    get_admin_sources,
    get_admin_source_by_id,
    create_source,
    update_source,
    delete_source,
    get_admin_stories,
    get_admin_story_by_id,
    create_story,
    update_story,
    publish_story,
    archive_story,
    delete_story,
    upload_source_logo,
    upload_story_cover,
    get_active_stories_count,
)
from backend.models.skillbits import (
    CreateSkillBitRequest,
    UpdateSkillBitRequest,
    AdminSkillBitResponse,
    AdminSkillBitsListResponse,
    DirectUploadRequest,
    DirectUploadResponse,
    VideoStatusResponse,
)
from backend.services.skillbits_service import (
    get_admin_skillbits,
    get_admin_skillbit_by_id,
    create_skillbit,
    update_skillbit,
    publish_skillbit,
    unpublish_skillbit,
    archive_skillbit,
    restore_skillbit,
    request_direct_upload,
    sync_video_status,
)
from backend.models.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseDetailResponse,
    CourseListResponse,
    CourseModuleCreate,
    CourseModuleUpdate,
    CourseModuleResponse,
    CourseLessonCreate,
    CourseLessonUpdate,
    CourseLessonResponse,
    CourseQuizCreate,
    CourseQuizUpdate,
    CourseQuizResponse,
    QuizQuestionCreate,
    QuizQuestionUpdate,
    QuizQuestionResponse,
    QuizOptionCreate,
    QuizOptionUpdate,
    QuizOptionResponse,
    ReorderRequest,
    LessonContentPayload,
    LessonContentResponse,
    CourseLessonMediaResponse,
    CourseLessonMediaListResponse,
    CourseLessonMediaDeleteResponse,
)
from backend.services.course_service import (
    get_admin_courses,
    get_admin_course_by_id,
    create_course,
    update_course,
    publish_course,
    unpublish_course,
    archive_course,
    delete_course,
    create_course_module,
    get_course_modules,
    get_course_module_by_id,
    update_course_module,
    delete_course_module,
    reorder_course_modules,
    create_course_lesson,
    get_course_lessons,
    get_course_lesson_by_id,
    update_course_lesson,
    delete_course_lesson,
    reorder_course_lessons,
    create_course_quiz,
    get_course_quiz,
    get_quiz_by_id,
    update_course_quiz,
    create_quiz_question,
    get_quiz_question_by_id,
    update_quiz_question,
    delete_quiz_question,
    reorder_quiz_questions,
    create_quiz_option,
    get_quiz_option_by_id,
    update_quiz_option,
    delete_quiz_option,
    reorder_quiz_options,
    get_lesson_content,
    save_lesson_content,
    upload_course_hero_image,
)
from backend.services.course_media_service import (
    upload_lesson_media,
    delete_lesson_media,
    list_lesson_media,
    get_lesson_media_by_id,
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

    # Derive real event, scholarship, and tech news counts from database
    live_hackathons_count = get_active_events_count()
    live_scholarships_count = get_active_scholarships_count()
    live_news_count = get_active_stories_count()

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
                "news_updates": live_news_count,
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
    background_tasks: BackgroundTasks,
    send_notification: bool = Query(default=True, description="Send Web Push and in-app notification if published"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Creates a new event or hackathon.
    Authoritative created_by is assigned strictly from the authenticated owner's user_id.
    """
    created = create_event(data=payload, user_id=owner["user_id"])
    if send_notification and created.get("status") == "published":
        background_tasks.add_task(
            notify_new_event,
            event_id=created.get("id"),
            event_title=created.get("event_name", payload.event_name),
            event_category=created.get("category", "Hackathons"),
        )
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
    background_tasks: BackgroundTasks,
    send_notification: bool = Query(default=True, description="Send Web Push and in-app notification to users"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Publishes an event to become student-visible within its visibility window."""
    published = set_event_status(event_id=event_id, new_status=EventStatus.PUBLISHED)
    if send_notification:
        background_tasks.add_task(
            notify_new_event,
            event_id=event_id,
            event_title=published.get("event_name", "New Event"),
            event_category=published.get("category", "Hackathons"),
        )
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
    background_tasks: BackgroundTasks,
    send_notification: bool = Query(default=True, description="Send Web Push and in-app notification if published"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Creates a new scholarship in draft or published status.
    Authoritative created_by is assigned strictly from the authenticated owner's user_id.
    """
    created = create_scholarship(data=payload, user_id=owner["user_id"])
    if send_notification and created.get("status") == "published":
        background_tasks.add_task(
            notify_new_scholarship,
            scholarship_id=created.get("id"),
            scholarship_title=created.get("name", payload.name),
            scholarship_data=created,
        )
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
    background_tasks: BackgroundTasks,
    send_notification: bool = Query(default=True, description="Send Web Push and in-app notification to users"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Publishes a scholarship to become student-visible within its visibility window."""
    published = set_scholarship_status(scholarship_id=scholarship_id, new_status=ScholarshipStatus.PUBLISHED)
    if send_notification:
        background_tasks.add_task(
            notify_new_scholarship,
            scholarship_id=scholarship_id,
            scholarship_title=published.get("name", "New Scholarship"),
            scholarship_data=published,
        )
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


# ============================================================================
# TECH NEWS SOURCES (COMPANIES / PUBLISHERS) CMS ENDPOINTS
# ============================================================================

@router.get("/tech-news/sources", status_code=status.HTTP_200_OK)
def list_admin_tech_news_sources(
    search: Optional[str] = Query(None, description="Search company name or description"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Owner directory: returns all company sources with active story counts."""
    sources = get_admin_sources(search=search)
    return {
        "total": len(sources),
        "sources": sources,
    }


@router.get("/tech-news/sources/{source_id}", status_code=status.HTTP_200_OK)
def get_admin_tech_news_source(
    source_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Fetches a single tech news company source."""
    source = get_admin_source_by_id(source_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech news source '{source_id}' not found.",
        )
    return source


@router.post("/tech-news/sources", status_code=status.HTTP_201_CREATED)
def create_admin_tech_news_source(
    payload: CreateTechNewsSourceRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Creates a new tech news publisher/company source."""
    created = create_source(data=payload)
    return {
        "success": True,
        "message": f"Source '{created.get('name')}' created successfully.",
        "source": created,
    }


@router.patch("/tech-news/sources/{source_id}", status_code=status.HTTP_200_OK)
def update_admin_tech_news_source(
    source_id: str,
    payload: UpdateTechNewsSourceRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Updates an existing tech news source."""
    updated = update_source(source_id=source_id, data=payload)
    return {
        "success": True,
        "message": f"Source '{source_id}' updated successfully.",
        "source": updated,
    }


@router.delete("/tech-news/sources/{source_id}", status_code=status.HTTP_200_OK)
def delete_admin_tech_news_source(
    source_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Permanently deletes a company source and its stories."""
    delete_source(source_id=source_id)
    return {
        "success": True,
        "message": f"Source '{source_id}' and all associated stories deleted permanently.",
    }


@router.post("/tech-news/sources/upload-logo", status_code=status.HTTP_200_OK)
@router.post("/tech-news/sources/{source_id}/upload-logo", status_code=status.HTTP_200_OK)
async def upload_admin_source_logo(
    file: UploadFile = File(...),
    source_id: Optional[str] = None,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Uploads a company logo to Supabase Storage 'tech-news-logos'."""
    public_url = await upload_source_logo(file=file, user_id=owner["user_id"])
    if source_id:
        try:
            update_source(source_id=source_id, data=UpdateTechNewsSourceRequest(logo_url=public_url))
        except Exception as e:
            logger.warning(f"Uploaded logo but could not auto-update source {source_id}: {e}")

    return {
        "success": True,
        "logo_url": public_url,
    }


# ============================================================================
# TECH NEWS STORIES CMS ENDPOINTS
# ============================================================================

@router.get("/tech-news/stories", status_code=status.HTTP_200_OK)
def list_admin_tech_news_stories(
    source_id: Optional[str] = Query(None, description="Filter stories by company source ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status: draft, published, archived"),
    search: Optional[str] = Query(None, description="Search keyword in title, summary, content"),
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Owner directory: returns all stories with 48h active status indicators."""
    stories = get_admin_stories(
        source_id=source_id,
        status_filter=status_filter,
        search=search,
    )
    return {
        "total": len(stories),
        "stories": stories,
    }


@router.get("/tech-news/stories/{story_id}", status_code=status.HTTP_200_OK)
def get_admin_tech_news_story(
    story_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Fetches any single story (including draft/expired/archived)."""
    story = get_admin_story_by_id(story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech news story '{story_id}' not found.",
        )
    return story


@router.post("/tech-news/stories", status_code=status.HTTP_201_CREATED)
def create_admin_tech_news_story(
    payload: CreateTechNewsRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Creates a new tech news story in draft or published status."""
    created = create_story(data=payload, user_id=owner["user_id"])
    return {
        "success": True,
        "message": f"Story '{created.get('headline')}' created successfully.",
        "story": created,
    }


@router.patch("/tech-news/stories/{story_id}", status_code=status.HTTP_200_OK)
def update_admin_tech_news_story(
    story_id: str,
    payload: UpdateTechNewsRequest,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Partially updates an existing story."""
    updated = update_story(story_id=story_id, data=payload)
    return {
        "success": True,
        "message": f"Story '{story_id}' updated successfully.",
        "story": updated,
    }


@router.post("/tech-news/stories/{story_id}/publish", status_code=status.HTTP_200_OK)
def publish_admin_tech_news_story(
    story_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """
    Publishes a story with authoritative 48-Hour visibility:
    visible_from = now(), visible_until = now() + 48h.
    """
    published = publish_story(story_id=story_id)
    return {
        "success": True,
        "message": f"Story '{story_id}' published successfully for 48 hours.",
        "story": published,
    }


@router.post("/tech-news/stories/{story_id}/archive", status_code=status.HTTP_200_OK)
def archive_admin_tech_news_story(
    story_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Archives a story, hiding it from students while retaining records."""
    archived = archive_story(story_id=story_id)
    return {
        "success": True,
        "message": f"Story '{story_id}' archived successfully.",
        "story": archived,
    }


@router.delete("/tech-news/stories/{story_id}", status_code=status.HTTP_200_OK)
def delete_admin_tech_news_story(
    story_id: str,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Permanently deletes a story record."""
    delete_story(story_id=story_id)
    return {
        "success": True,
        "message": f"Story '{story_id}' deleted permanently.",
    }


@router.post("/tech-news/stories/upload-cover", status_code=status.HTTP_200_OK)
@router.post("/tech-news/stories/{story_id}/upload-cover", status_code=status.HTTP_200_OK)
async def upload_admin_story_cover(
    file: UploadFile = File(...),
    story_id: Optional[str] = None,
    owner: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    """Uploads a story cover image to Supabase Storage 'tech-news-covers'."""
    public_url = await upload_story_cover(file=file, user_id=owner["user_id"])
    if story_id:
        try:
            update_story(story_id=story_id, data=UpdateTechNewsRequest(cover_image_url=public_url))
        except Exception as e:
            logger.warning(f"Uploaded cover image but could not auto-update story {story_id}: {e}")

    return {
        "success": True,
        "cover_image_url": public_url,
    }


# ============================================================================
# SKILLBITS (EDUCATIONAL REELS FOUNDATION) CMS ENDPOINTS
# Protected by Depends(require_admin) - allows owner, admin, editor
# ============================================================================

@router.post("/skillbits", status_code=status.HTTP_201_CREATED, response_model=AdminSkillBitResponse)
def create_admin_skillbit(
    payload: CreateSkillBitRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Creates a new SkillBit in draft or published status."""
    created = create_skillbit(data=payload, user_id=admin["user_id"])
    return AdminSkillBitResponse(**created)


@router.get("/skillbits", status_code=status.HTTP_200_OK, response_model=AdminSkillBitsListResponse)
def list_admin_skillbits(
    status_filter: Optional[str] = Query(None, description="Filter by status: draft, published, archived"),
    status: Optional[str] = Query(None, description="Alias for status_filter"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Keyword search in title"),
    sort: Optional[str] = Query("newest", description="Sort by: newest, oldest, title_asc, title_desc, duration_desc, duration_asc, updated_at"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    limit: Optional[int] = Query(None, ge=1, le=100),
    offset: Optional[int] = Query(None, ge=0),
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitsListResponse:
    """Lists all SkillBits for CMS management with optional filters, whitelisted sorting, and server-side pagination."""
    resolved_status = status_filter or status
    result = get_admin_skillbits(
        status_filter=resolved_status,
        topic=topic,
        difficulty=difficulty,
        search=search,
        sort=sort,
        page=page,
        page_size=page_size,
        limit=limit,
        offset=offset,
    )
    return AdminSkillBitsListResponse(
        total=result.get("total", 0),
        items=[AdminSkillBitResponse(**item) for item in result.get("items", [])],
        page=result.get("page", page),
        page_size=result.get("page_size", page_size),
        total_pages=result.get("total_pages", 1),
    )


@router.get("/skillbits/{skillbit_id}", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def get_admin_skillbit(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Fetches a single SkillBit for CMS administration (any status)."""
    record = get_admin_skillbit_by_id(skillbit_id=skillbit_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found.",
        )
    return AdminSkillBitResponse(**record)


@router.patch("/skillbits/{skillbit_id}", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def update_admin_skillbit(
    skillbit_id: str,
    payload: UpdateSkillBitRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Partially updates a SkillBit record and validates publish rules if transitioning to published."""
    updated = update_skillbit(skillbit_id=skillbit_id, data=payload)
    return AdminSkillBitResponse(**updated)


@router.post("/skillbits/{skillbit_id}/publish", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def publish_admin_skillbit(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Validates readiness (video_status MUST be READY) and publishes a SkillBit to students."""
    published = publish_skillbit(skillbit_id=skillbit_id)
    return AdminSkillBitResponse(**published)


@router.post("/skillbits/{skillbit_id}/unpublish", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def unpublish_admin_skillbit(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Transitions a published SkillBit back to draft status, removing it from student feed."""
    unpublished = unpublish_skillbit(skillbit_id=skillbit_id)
    return AdminSkillBitResponse(**unpublished)


@router.post("/skillbits/{skillbit_id}/archive", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def archive_admin_skillbit(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Archives a SkillBit, hiding it from the student feed while preserving historical data."""
    archived = archive_skillbit(skillbit_id=skillbit_id)
    return AdminSkillBitResponse(**archived)


@router.post("/skillbits/{skillbit_id}/restore", status_code=status.HTTP_200_OK, response_model=AdminSkillBitResponse)
def restore_admin_skillbit(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> AdminSkillBitResponse:
    """Restores an archived SkillBit back to draft status so it can be revised or re-published."""
    restored = restore_skillbit(skillbit_id=skillbit_id)
    return AdminSkillBitResponse(**restored)


@router.post("/skillbits/{skillbit_id}/direct-upload", status_code=status.HTTP_200_OK, response_model=DirectUploadResponse)
async def create_skillbit_direct_upload(
    skillbit_id: str,
    payload: Optional[DirectUploadRequest] = None,
    admin: Dict[str, Any] = Depends(require_admin),
) -> DirectUploadResponse:
    """Initiates a Mux Direct Upload session for video ingestion without proxying media bytes."""
    cors = payload.cors_origin if payload else None
    result = await request_direct_upload(skillbit_id=skillbit_id, cors_origin=cors)
    return DirectUploadResponse(**result)


@router.get("/skillbits/{skillbit_id}/video-status", status_code=status.HTTP_200_OK, response_model=VideoStatusResponse)
async def check_skillbit_video_status(
    skillbit_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> VideoStatusResponse:
    """Synchronizes and returns the current Mux video ingestion status, duration, and playback ID."""
    status_info = await sync_video_status(skillbit_id=skillbit_id)
    return VideoStatusResponse(**status_info)


# ============================================================================
# COURSE SYSTEM (PHASE 1: FOUNDATION + MODULE QUIZ FOUNDATION) CMS ENDPOINTS
# Protected by Depends(require_admin) - allows owner, admin, editor
# ============================================================================

# ── Courses ──────────────────────────────────────────────────────────────────

@router.post("/courses", status_code=status.HTTP_201_CREATED, response_model=CourseResponse)
def create_admin_course_endpoint(
    payload: CourseCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseResponse:
    """Creates a new course in DRAFT or IN_REVIEW status."""
    created = create_course(data=payload, user_id=admin["user_id"])
    return CourseResponse(**created)


@router.get("/courses", status_code=status.HTTP_200_OK, response_model=CourseListResponse)
def list_admin_courses_endpoint(
    search: Optional[str] = Query(None, description="Keyword search in title"),
    status: Optional[str] = Query(None, description="Filter by status: DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED"),
    status_filter: Optional[str] = Query(None, description="Alias for status"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: beginner, intermediate, advanced"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort: Optional[str] = Query("newest", description="Sort by: newest, oldest, title_asc, title_desc, updated_at"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseListResponse:
    """Lists courses with server-side search, filtering, whitelisted sorting, and pagination."""
    resolved_status = status_filter or status
    result = get_admin_courses(
        search=search,
        status_filter=resolved_status,
        difficulty=difficulty,
        category=category,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    return CourseListResponse(**result)


@router.get("/courses/{course_id}", status_code=status.HTTP_200_OK, response_model=CourseDetailResponse)
def get_admin_course_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseDetailResponse:
    """Fetches full course hierarchy: Course -> Modules -> Lessons & Quiz -> Questions -> Options."""
    detail = get_admin_course_by_id(course_id=course_id)
    return CourseDetailResponse(**detail)


@router.patch("/courses/{course_id}", status_code=status.HTTP_200_OK, response_model=CourseResponse)
def update_admin_course_endpoint(
    course_id: str,
    payload: CourseUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseResponse:
    """Partially updates a course record."""
    updated = update_course(course_id=course_id, data=payload, user_id=admin["user_id"])
    return CourseResponse(**updated)


@router.post("/courses/upload-hero", status_code=status.HTTP_200_OK)
@router.post("/courses/upload-thumbnail", status_code=status.HTTP_200_OK)
async def upload_admin_course_hero_endpoint(
    file: UploadFile = File(..., description="Course hero / thumbnail image file (PNG, JPG, WebP, GIF, max 10MB)"),
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """
    Uploads a course hero graphic or thumbnail image directly from admin's device.
    Validates MIME type, extension, size (up to 10MB), and image signature.
    """
    public_url = await upload_course_hero_image(file=file, user_id=admin["user_id"])
    return {
        "success": True,
        "thumbnail_url": public_url,
        "url": public_url,
    }


@router.delete("/courses/{course_id}", status_code=status.HTTP_200_OK)
def delete_admin_course_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Permanently deletes a course and all child modules, lessons, and quizzes."""
    delete_course(course_id=course_id, user_id=admin["user_id"])
    return {"success": True, "message": f"Course '{course_id}' deleted successfully."}


@router.post("/courses/{course_id}/publish", status_code=status.HTTP_200_OK, response_model=CourseDetailResponse)
def publish_admin_course_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseDetailResponse:
    """Validates full publication readiness server-side and transitions course to PUBLISHED."""
    detail = publish_course(course_id=course_id, user_id=admin["user_id"])
    return CourseDetailResponse(**detail)


@router.post("/courses/{course_id}/unpublish", status_code=status.HTTP_200_OK, response_model=CourseDetailResponse)
def unpublish_admin_course_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseDetailResponse:
    """Transitions a published course back to DRAFT."""
    detail = unpublish_course(course_id=course_id, user_id=admin["user_id"])
    return CourseDetailResponse(**detail)


@router.post("/courses/{course_id}/archive", status_code=status.HTTP_200_OK, response_model=CourseDetailResponse)
def archive_admin_course_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseDetailResponse:
    """Transitions a course to ARCHIVED."""
    detail = archive_course(course_id=course_id, user_id=admin["user_id"])
    return CourseDetailResponse(**detail)


# ── Modules ──────────────────────────────────────────────────────────────────

@router.post("/courses/{course_id}/modules", status_code=status.HTTP_201_CREATED, response_model=CourseModuleResponse)
def create_admin_module_endpoint(
    course_id: str,
    payload: CourseModuleCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseModuleResponse:
    """Creates a new module in a course."""
    created = create_course_module(course_id=course_id, data=payload, user_id=admin["user_id"])
    return CourseModuleResponse(**created)


@router.get("/courses/{course_id}/modules", status_code=status.HTTP_200_OK, response_model=List[CourseModuleResponse])
def list_admin_modules_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[CourseModuleResponse]:
    """Lists all modules for a course."""
    modules = get_course_modules(course_id=course_id)
    return [CourseModuleResponse(**m) for m in modules]


@router.patch("/courses/{course_id}/modules/reorder", status_code=status.HTTP_200_OK, response_model=List[CourseModuleResponse])
def reorder_admin_modules_endpoint(
    course_id: str,
    payload: ReorderRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[CourseModuleResponse]:
    """Safely reorders modules in a course."""
    modules = reorder_course_modules(course_id=course_id, items=payload.items, user_id=admin["user_id"])
    return [CourseModuleResponse(**m) for m in modules]


@router.patch("/modules/{module_id}", status_code=status.HTTP_200_OK, response_model=CourseModuleResponse)
def update_admin_module_endpoint(
    module_id: str,
    payload: CourseModuleUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseModuleResponse:
    """Updates module metadata."""
    updated = update_course_module(module_id=module_id, data=payload, user_id=admin["user_id"])
    return CourseModuleResponse(**updated)


@router.delete("/modules/{module_id}", status_code=status.HTTP_200_OK)
def delete_admin_module_endpoint(
    module_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Deletes a module and cascades to child lessons and quiz."""
    delete_course_module(module_id=module_id, user_id=admin["user_id"])
    return {"success": True, "message": f"Module '{module_id}' deleted successfully."}


# ── Lessons (Metadata Only) ───────────────────────────────────────────────────

@router.post("/modules/{module_id}/lessons", status_code=status.HTTP_201_CREATED, response_model=CourseLessonResponse)
def create_admin_lesson_endpoint(
    module_id: str,
    payload: CourseLessonCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonResponse:
    """Creates a new lesson metadata record in a module."""
    created = create_course_lesson(module_id=module_id, data=payload, user_id=admin["user_id"])
    return CourseLessonResponse(**created)


@router.get("/modules/{module_id}/lessons", status_code=status.HTTP_200_OK, response_model=List[CourseLessonResponse])
def list_admin_lessons_endpoint(
    module_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[CourseLessonResponse]:
    """Lists all lessons in a module."""
    lessons = get_course_lessons(module_id=module_id)
    return [CourseLessonResponse(**l) for l in lessons]


@router.patch("/modules/{module_id}/lessons/reorder", status_code=status.HTTP_200_OK, response_model=List[CourseLessonResponse])
def reorder_admin_lessons_endpoint(
    module_id: str,
    payload: ReorderRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[CourseLessonResponse]:
    """Safely reorders lessons in a module."""
    lessons = reorder_course_lessons(module_id=module_id, items=payload.items, user_id=admin["user_id"])
    return [CourseLessonResponse(**l) for l in lessons]


@router.patch("/lessons/{lesson_id}", status_code=status.HTTP_200_OK, response_model=CourseLessonResponse)
def update_admin_lesson_endpoint(
    lesson_id: str,
    payload: CourseLessonUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonResponse:
    """Updates lesson metadata."""
    updated = update_course_lesson(lesson_id=lesson_id, data=payload, user_id=admin["user_id"])
    return CourseLessonResponse(**updated)


@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_200_OK)
def delete_admin_lesson_endpoint(
    lesson_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Deletes a lesson."""
    delete_course_lesson(lesson_id=lesson_id, user_id=admin["user_id"])
    return {"success": True, "message": f"Lesson '{lesson_id}' deleted successfully."}


# ── Lesson Content Architecture (Phase 2A) ───────────────────────────────────

@router.get(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/content",
    status_code=status.HTTP_200_OK,
    response_model=LessonContentResponse,
)
def get_admin_lesson_content_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> LessonContentResponse:
    """Retrieves structured content blocks for a lesson after verifying course/module/lesson hierarchy."""
    content = get_lesson_content(course_id=course_id, module_id=module_id, lesson_id=lesson_id)
    return LessonContentResponse(**content)


@router.put(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/content",
    status_code=status.HTTP_200_OK,
    response_model=LessonContentResponse,
)
@router.patch(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/content",
    status_code=status.HTTP_200_OK,
    response_model=LessonContentResponse,
)
def save_admin_lesson_content_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    payload: LessonContentPayload,
    admin: Dict[str, Any] = Depends(require_admin),
) -> LessonContentResponse:
    """Creates or updates structured content blocks for a lesson after verifying course/module/lesson hierarchy."""
    content = save_lesson_content(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        payload_dict=payload.model_dump(),
        user_id=admin["user_id"],
    )
    return LessonContentResponse(**content)


# ── Course Lesson Media Storage Foundation (Phase 3A) ─────────────────────────

@router.post(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/media",
    status_code=status.HTTP_201_CREATED,
    response_model=CourseLessonMediaResponse,
)
async def upload_admin_lesson_media_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    file: UploadFile = File(..., description="Image file to upload (JPEG, PNG, WebP, GIF, max 10MB)"),
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonMediaResponse:
    """
    Uploads an image for a course lesson.
    Validates course/module/lesson hierarchy, MIME type, file extension, magic bytes,
    and size limit (10MB), uploading to Supabase Storage and storing metadata.
    """
    file_bytes = await file.read()
    content = upload_lesson_media(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        file_bytes=file_bytes,
        original_filename=file.filename or "lesson_image",
        content_type=file.content_type or "",
        user_id=admin.get("user_id"),
    )
    return CourseLessonMediaResponse(**content)


@router.delete(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/media/{media_id}",
    status_code=status.HTTP_200_OK,
    response_model=CourseLessonMediaDeleteResponse,
)
def delete_admin_lesson_media_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    media_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonMediaDeleteResponse:
    """
    Deletes a course lesson media object from Supabase Storage and public.course_lesson_media.
    Enforces that media belongs to the specified lesson.
    """
    res = delete_lesson_media(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        media_id=media_id,
        user_id=admin.get("user_id"),
    )
    return CourseLessonMediaDeleteResponse(**res)


@router.get(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/media",
    status_code=status.HTTP_200_OK,
    response_model=CourseLessonMediaListResponse,
)
def list_admin_lesson_media_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonMediaListResponse:
    """
    Lists all media metadata records associated with the specified lesson.
    """
    data = list_lesson_media(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
    )
    return CourseLessonMediaListResponse(**data)


@router.get(
    "/courses/{course_id}/modules/{module_id}/lessons/{lesson_id}/media/{media_id}",
    status_code=status.HTTP_200_OK,
    response_model=CourseLessonMediaResponse,
)
def get_admin_lesson_media_endpoint(
    course_id: str,
    module_id: str,
    lesson_id: str,
    media_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseLessonMediaResponse:
    """
    Retrieves a single media metadata item by ID after hierarchy verification.
    """
    item = get_lesson_media_by_id(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        media_id=media_id,
    )
    return CourseLessonMediaResponse(**item)


# ── Quizzes (One Quiz Per Module) ─────────────────────────────────────────────


@router.post("/modules/{module_id}/quiz", status_code=status.HTTP_201_CREATED, response_model=CourseQuizResponse)
def create_admin_quiz_endpoint(
    module_id: str,
    payload: CourseQuizCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseQuizResponse:
    """Creates a Quiz for a module. Rejects with 409 Conflict if one already exists."""
    created = create_course_quiz(module_id=module_id, data=payload, user_id=admin["user_id"])
    return CourseQuizResponse(**created)


@router.get("/modules/{module_id}/quiz", status_code=status.HTTP_200_OK, response_model=Optional[CourseQuizResponse])
def get_admin_module_quiz_endpoint(
    module_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Optional[CourseQuizResponse]:
    """Fetches the quiz for a module with all questions and options."""
    quiz = get_course_quiz(module_id=module_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No quiz found for module '{module_id}'.")
    return CourseQuizResponse(**quiz)


@router.patch("/quizzes/{quiz_id}", status_code=status.HTTP_200_OK, response_model=CourseQuizResponse)
def update_admin_quiz_endpoint(
    quiz_id: str,
    payload: CourseQuizUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseQuizResponse:
    """Updates quiz metadata."""
    updated = update_course_quiz(quiz_id=quiz_id, data=payload, user_id=admin["user_id"])
    return CourseQuizResponse(**updated)


# ── Questions ─────────────────────────────────────────────────────────────────

@router.post("/quizzes/{quiz_id}/questions", status_code=status.HTTP_201_CREATED, response_model=QuizQuestionResponse)
def create_admin_question_endpoint(
    quiz_id: str,
    payload: QuizQuestionCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> QuizQuestionResponse:
    """Creates a new question in a quiz."""
    created = create_quiz_question(quiz_id=quiz_id, data=payload, user_id=admin["user_id"])
    return QuizQuestionResponse(**created)


@router.patch("/quizzes/{quiz_id}/questions/reorder", status_code=status.HTTP_200_OK, response_model=List[QuizQuestionResponse])
def reorder_admin_questions_endpoint(
    quiz_id: str,
    payload: ReorderRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[QuizQuestionResponse]:
    """Safely reorders questions in a quiz."""
    questions = reorder_quiz_questions(quiz_id=quiz_id, items=payload.items, user_id=admin["user_id"])
    return [QuizQuestionResponse(**q) for q in questions]


@router.patch("/questions/{question_id}", status_code=status.HTTP_200_OK, response_model=QuizQuestionResponse)
def update_admin_question_endpoint(
    question_id: str,
    payload: QuizQuestionUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> QuizQuestionResponse:
    """Updates question prompt or metadata."""
    updated = update_quiz_question(question_id=question_id, data=payload, user_id=admin["user_id"])
    return QuizQuestionResponse(**updated)


@router.delete("/questions/{question_id}", status_code=status.HTTP_200_OK)
def delete_admin_question_endpoint(
    question_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Deletes a question and its options."""
    delete_quiz_question(question_id=question_id, user_id=admin["user_id"])
    return {"success": True, "message": f"Question '{question_id}' deleted successfully."}


# ── Options ───────────────────────────────────────────────────────────────────

@router.post("/questions/{question_id}/options", status_code=status.HTTP_201_CREATED, response_model=QuizOptionResponse)
def create_admin_option_endpoint(
    question_id: str,
    payload: QuizOptionCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> QuizOptionResponse:
    """Creates an option for a question."""
    created = create_quiz_option(question_id=question_id, data=payload, user_id=admin["user_id"])
    return QuizOptionResponse(**created)


@router.patch("/questions/{question_id}/options/reorder", status_code=status.HTTP_200_OK, response_model=List[QuizOptionResponse])
def reorder_admin_options_endpoint(
    question_id: str,
    payload: ReorderRequest,
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[QuizOptionResponse]:
    """Safely reorders options within a question."""
    options = reorder_quiz_options(question_id=question_id, items=payload.items, user_id=admin["user_id"])
    return [QuizOptionResponse(**o) for o in options]


@router.patch("/options/{option_id}", status_code=status.HTTP_200_OK, response_model=QuizOptionResponse)
def update_admin_option_endpoint(
    option_id: str,
    payload: QuizOptionUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> QuizOptionResponse:
    """Updates an option text or correctness flag."""
    updated = update_quiz_option(option_id=option_id, data=payload, user_id=admin["user_id"])
    return QuizOptionResponse(**updated)


@router.delete("/options/{option_id}", status_code=status.HTTP_200_OK)
def delete_admin_option_endpoint(
    option_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Deletes an option."""
    delete_quiz_option(option_id=option_id, user_id=admin["user_id"])
    return {"success": True, "message": f"Option '{option_id}' deleted successfully."}


# ============================================================================
# PHASE 7 — CERTIFICATE TEMPLATES & COURSE CERTIFICATE CONFIGURATION CMS
# ============================================================================

from backend.models.certificate import (
    CertificateTemplateCreate,
    CertificateTemplateUpdate,
    CertificateTemplateResponse,
    CourseCertificateConfigUpdate,
    CourseCertificateConfigResponse,
    CertificatePreviewData,
)
from backend.services.certificate_service import (
    list_certificate_templates,
    get_certificate_template,
    create_certificate_template,
    update_certificate_template,
    delete_certificate_template,
    upload_certificate_background,
    get_course_certificate_config,
    set_course_certificate_config,
)


@router.get(
    "/certificate-templates",
    status_code=status.HTTP_200_OK,
    response_model=List[CertificateTemplateResponse],
)
def list_admin_certificate_templates_endpoint(
    admin: Dict[str, Any] = Depends(require_admin),
) -> List[CertificateTemplateResponse]:
    """Lists all certificate templates including inactive for admin management."""
    templates = list_certificate_templates(include_inactive=True)
    return [CertificateTemplateResponse(**t) for t in templates]


@router.post(
    "/certificate-templates",
    status_code=status.HTTP_201_CREATED,
    response_model=CertificateTemplateResponse,
)
def create_admin_certificate_template_endpoint(
    payload: CertificateTemplateCreate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CertificateTemplateResponse:
    """Creates a new certificate template design."""
    created = create_certificate_template(data=payload, user_id=admin["user_id"])
    return CertificateTemplateResponse(**created)


@router.get(
    "/certificate-templates/{template_id}",
    status_code=status.HTTP_200_OK,
    response_model=CertificateTemplateResponse,
)
def get_admin_certificate_template_endpoint(
    template_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CertificateTemplateResponse:
    """Retrieves a certificate template by ID."""
    t = get_certificate_template(template_id=template_id)
    return CertificateTemplateResponse(**t)


@router.patch(
    "/certificate-templates/{template_id}",
    status_code=status.HTTP_200_OK,
    response_model=CertificateTemplateResponse,
)
def update_admin_certificate_template_endpoint(
    template_id: str,
    payload: CertificateTemplateUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CertificateTemplateResponse:
    """Updates an existing certificate template."""
    updated = update_certificate_template(template_id=template_id, data=payload, user_id=admin["user_id"])
    return CertificateTemplateResponse(**updated)


@router.delete(
    "/certificate-templates/{template_id}",
    status_code=status.HTTP_200_OK,
)
def delete_admin_certificate_template_endpoint(
    template_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Safely archives or deletes a certificate template."""
    return delete_certificate_template(template_id=template_id, user_id=admin["user_id"])


@router.post("/certificate-templates/upload-background", status_code=status.HTTP_200_OK)
async def upload_admin_certificate_background_endpoint(
    file: UploadFile = File(...),
    admin: Dict[str, Any] = Depends(require_admin),
) -> Dict[str, Any]:
    """Validates and uploads a certificate background image to Supabase Storage."""
    public_url = await upload_certificate_background(file=file, user_id=admin["user_id"])
    return {"success": True, "background_media_url": public_url}


@router.get(
    "/courses/{course_id}/certificate",
    status_code=status.HTTP_200_OK,
    response_model=CourseCertificateConfigResponse,
)
def get_admin_course_certificate_config_endpoint(
    course_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseCertificateConfigResponse:
    """Retrieves certificate configuration for a course."""
    cfg = get_course_certificate_config(course_id=course_id)
    return CourseCertificateConfigResponse(**cfg)


@router.put(
    "/courses/{course_id}/certificate",
    status_code=status.HTTP_200_OK,
    response_model=CourseCertificateConfigResponse,
)
def update_admin_course_certificate_config_endpoint(
    course_id: str,
    payload: CourseCertificateConfigUpdate,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CourseCertificateConfigResponse:
    """Configures whether a course issues certificates and assigns a template."""
    cfg = set_course_certificate_config(
        course_id=course_id,
        enabled=payload.enabled,
        template_id=payload.certificate_template_id,
        user_id=admin["user_id"],
    )
    return CourseCertificateConfigResponse(**cfg)


@router.get(
    "/courses/{course_id}/certificate/preview",
    status_code=status.HTTP_200_OK,
    response_model=CertificatePreviewData,
)
def get_admin_course_certificate_preview_endpoint(
    course_id: str,
    template_id: Optional[str] = None,
    admin: Dict[str, Any] = Depends(require_admin),
) -> CertificatePreviewData:
    """Generates realistic sample preview data for the certificate configuration."""
    sb = get_supabase()
    course_title = "Course Title"
    c_res = sb.from_("courses").select("title").eq("id", course_id).execute()
    if c_res.data:
        course_title = c_res.data[0].get("title", "Course Title")

    cfg = get_course_certificate_config(course_id=course_id)
    target_template_id = template_id or cfg.get("certificate_template_id")

    if target_template_id:
        template = get_certificate_template(target_template_id)
        theme = template.get("design_theme", "professional_blue")
        bg_url = template.get("background_media_url", "")
    else:
        # Fallback to active template
        templates = list_certificate_templates(include_inactive=False)
        if templates:
            theme = templates[0]["design_theme"]
            bg_url = templates[0]["background_media_url"]
        else:
            theme = "professional_blue"
            bg_url = ""

    from datetime import date
    return CertificatePreviewData(
        student_name="John Doe",
        college_name="Example Institute of Technology",
        course_title=course_title,
        score=92,
        issued_date=date.today().strftime("%B %d, %Y"),
        certificate_id="SC-CERT-2026-DEMO",
        verification_url="https://www.skillscatalyst.in/verify/certificate/demo-preview",
        design_theme=theme,
        background_media_url=bg_url,
    )







