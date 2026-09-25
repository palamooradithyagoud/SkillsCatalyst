"""
backend/services/course_service.py
Core Service Layer for SkillsCatalyst Course System (Phase 1).
Manages: Courses, Modules, Lessons (Metadata Only), Quizzes, Questions, Options,
Server-Side Publication Validation, and Structured Administrative Audit Logging.
"""

import re
import math
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.course import (
    CourseCreate,
    CourseUpdate,
    CourseStatus,
    CourseDifficulty,
    CourseModuleCreate,
    CourseModuleUpdate,
    CourseLessonCreate,
    CourseLessonUpdate,
    CourseQuizCreate,
    CourseQuizUpdate,
    QuizQuestionCreate,
    QuizQuestionUpdate,
    QuizOptionCreate,
    QuizOptionUpdate,
    QuestionType,
    ReorderItem,
)

logger = logging.getLogger("skillscatalyst.courses")
audit_logger = logging.getLogger("skillscatalyst.courses.audit")

VALID_SORT_OPTIONS = {
    "newest": ("created_at", True),
    "oldest": ("created_at", False),
    "title_asc": ("title", False),
    "title_desc": ("title", True),
    "updated_at": ("updated_at", True),
}


# ── Audit Logging Helper ──────────────────────────────────────────────────────

def log_course_audit(
    action: str,
    entity_type: str,
    entity_id: str,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Records an administrative action to both structured logger and the central audit_logs table.
    """
    clean_details = details or {}
    audit_logger.info(
        f"[COURSE_AUDIT] action={action} entity_type={entity_type} entity_id={entity_id} "
        f"user_id={user_id} details={clean_details}"
    )

    sb = get_supabase()
    if sb:
        try:
            sb.from_("audit_logs").insert({
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "user_id": user_id,
                "details": clean_details,
            }).execute()
        except Exception as e:
            logger.debug(f"Audit log database insert skipped: {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_enum_val(val: Any) -> Any:
    if val is None:
        return None
    return getattr(val, "value", val)


def _format_datetime(val: Any) -> Optional[str]:
    if not val:
        return None
    if isinstance(val, datetime):
        if val.tzinfo is None:
            val = val.replace(tzinfo=timezone.utc)
        return val.isoformat()
    return str(val)


def slugify(title: str) -> str:
    """Converts a title into a URL-safe, lowercase slug."""
    s = title.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "course"


def generate_course_slug(title: str, existing_id: Optional[str] = None) -> str:
    """
    Generates a unique, stable slug for a Course.
    Appends numeric suffixes if a collision exists with another course.
    """
    base_slug = slugify(title)
    sb = get_supabase()
    if not sb:
        return base_slug

    try:
        # Check if base_slug is taken by another course
        query = sb.from_("courses").select("id, slug").ilike("slug", f"{base_slug}%")
        res = query.execute()
        existing_slugs = set()
        for row in res.data or []:
            if existing_id and str(row.get("id")) == str(existing_id):
                continue
            existing_slugs.add(row.get("slug"))

        if base_slug not in existing_slugs:
            return base_slug

        suffix = 2
        while f"{base_slug}-{suffix}" in existing_slugs:
            suffix += 1
        return f"{base_slug}-{suffix}"
    except Exception as e:
        logger.warning(f"Error checking slug uniqueness: {e}")
        return base_slug


# ── Publication Readiness Validation ──────────────────────────────────────────

def validate_course_publish_readiness(course_id: str) -> Dict[str, Any]:
    """
    Authoritative server-side validation for Course publication.
    A Course must NOT be published unless:
    - required title exists and is valid
    - required description / metadata is valid
    - difficulty exists and is valid
    - course has at least one module
    - every module has a valid title
    - module ordering is valid
    - every module has exactly one quiz
    - every quiz has at least one valid question
    - every question has valid options (at least two options)
    - SINGLE_SELECT questions have exactly one correct option
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # 1. Fetch Course
    c_res = sb.from_("courses").select("*").eq("id", course_id).execute()
    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")
    course = c_res.data[0]

    errors: List[str] = []

    # Validate Course metadata
    title = (course.get("title") or "").strip()
    if not title:
        errors.append("Course title is required.")

    difficulty = (course.get("difficulty") or "").strip().lower()
    if difficulty not in ("beginner", "intermediate", "advanced"):
        errors.append(f"Course difficulty '{difficulty}' is invalid. Must be beginner, intermediate, or advanced.")

    # 2. Fetch Modules
    m_res = sb.from_("course_modules").select("*").eq("course_id", course_id).order("position", desc=False).execute()
    modules = m_res.data or []
    if not modules:
        errors.append("Course must have at least one module before it can be published.")

    # Check module ordering
    positions = [m.get("position") for m in modules if m.get("position") is not None]
    if len(positions) != len(set(positions)):
        errors.append("Module ordering contains duplicate positions.")

    # 3. For each module, validate title, lessons metadata, and exactly one quiz
    for idx, mod in enumerate(modules, start=1):
        mod_id = str(mod["id"])
        mod_title = (mod.get("title") or "").strip()
        if not mod_title:
            errors.append(f"Module #{idx} is missing a title.")

        # Check Module Quiz
        q_res = sb.from_("course_quizzes").select("*").eq("module_id", mod_id).execute()
        quizzes = q_res.data or []
        if len(quizzes) == 0:
            errors.append(f"Module '{mod_title or f'#{idx}'}' is missing a required quiz.")
            continue
        elif len(quizzes) > 1:
            errors.append(f"Module '{mod_title}' has {len(quizzes)} quizzes. Exactly one quiz per module is allowed.")
            continue

        quiz = quizzes[0]
        quiz_id = str(quiz["id"])
        quiz_title = (quiz.get("title") or "").strip()
        if not quiz_title:
            errors.append(f"Quiz for module '{mod_title}' is missing a title.")

        # Check Quiz Questions
        qq_res = sb.from_("quiz_questions").select("*").eq("quiz_id", quiz_id).order("position", desc=False).execute()
        questions = qq_res.data or []
        if not questions:
            errors.append(f"Quiz for module '{mod_title}' must contain at least one question.")
            continue

        for q_idx, q in enumerate(questions, start=1):
            q_id = str(q["id"])
            q_text = (q.get("question_text") or "").strip()
            q_type = q.get("question_type") or QuestionType.SINGLE_SELECT.value

            if not q_text:
                errors.append(f"Module '{mod_title}' -> Question #{q_idx} text cannot be empty.")

            # Check Options
            opt_res = sb.from_("quiz_options").select("*").eq("question_id", q_id).order("position", desc=False).execute()
            options = opt_res.data or []
            if len(options) < 2:
                errors.append(f"Module '{mod_title}' -> Question #{q_idx} ('{q_text[:30]}...') must have at least 2 options.")
                continue

            for opt_idx, opt in enumerate(options, start=1):
                opt_text = (opt.get("option_text") or "").strip()
                if not opt_text:
                    errors.append(f"Module '{mod_title}' -> Question #{q_idx} -> Option #{opt_idx} cannot be empty.")

            if q_type == QuestionType.SINGLE_SELECT.value:
                correct_count = sum(1 for opt in options if opt.get("is_correct") is True)
                if correct_count == 0:
                    errors.append(
                        f"Module '{mod_title}' -> Question #{q_idx} (SINGLE_SELECT) has zero correct options. Exactly one correct option is required."
                    )
                elif correct_count > 1:
                    errors.append(
                        f"Module '{mod_title}' -> Question #{q_idx} (SINGLE_SELECT) has {correct_count} correct options. Exactly one correct option is permitted."
                    )

    if errors:
        error_msg = "Course publication validation failed:\n" + "\n".join(f"• {e}" for e in errors)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    return {
        "valid": True,
        "course_id": course_id,
        "modules_count": len(modules),
    }


# ── Course Management ─────────────────────────────────────────────────────────

def get_admin_courses(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Lists courses for admin CMS with server-side search, filtering, pagination, and whitelisted sorting.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    page = max(1, page)
    page_size = max(1, min(100, page_size))
    offset = (page - 1) * page_size

    # Sort validation
    sort_key = (sort or "newest").lower().strip()
    if sort_key not in VALID_SORT_OPTIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid sort option '{sort}'. Allowed: {', '.join(VALID_SORT_OPTIONS.keys())}",
        )

    col_name, is_desc = VALID_SORT_OPTIONS[sort_key]

    query = sb.from_("courses").select("*, course_modules(id, course_lessons(id))", count="exact")

    if status_filter:
        s_val = status_filter.strip().upper()
        if s_val in (CourseStatus.DRAFT.value, CourseStatus.IN_REVIEW.value, CourseStatus.PUBLISHED.value, CourseStatus.ARCHIVED.value):
            query = query.eq("status", s_val)

    if difficulty:
        d_val = difficulty.strip().lower()
        if d_val in ("beginner", "intermediate", "advanced"):
            query = query.eq("difficulty", d_val)

    if category:
        query = query.ilike("category", f"%{category.strip()}%")

    if search:
        query = query.ilike("title", f"%{search.strip()}%")

    query = query.order(col_name, desc=is_desc).range(offset, offset + page_size - 1)

    res = query.execute()
    total = res.count if res.count is not None else len(res.data or [])
    rows = res.data or []

    # Map response items with aggregate modules_count & lessons_count
    items = []
    for r in rows:
        mods = r.get("course_modules") or []
        m_count = len(mods)
        l_count = sum(len(m.get("course_lessons") or []) for m in mods)
        items.append({
            "id": str(r["id"]),
            "title": r.get("title"),
            "slug": r.get("slug"),
            "short_description": r.get("short_description"),
            "description": r.get("description"),
            "thumbnail_url": r.get("thumbnail_url"),
            "category": r.get("category"),
            "difficulty": r.get("difficulty"),
            "estimated_duration_minutes": r.get("estimated_duration_minutes"),
            "status": r.get("status"),
            "created_by": str(r.get("created_by")),
            "created_at": _format_datetime(r.get("created_at")),
            "updated_at": _format_datetime(r.get("updated_at")),
            "published_at": _format_datetime(r.get("published_at")),
            "archived_at": _format_datetime(r.get("archived_at")),
            "modules_count": m_count,
            "lessons_count": l_count,
        })

    total_pages = max(1, math.ceil(total / page_size))

    return {
        "total": total,
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_admin_course_by_id(course_id: str) -> Dict[str, Any]:
    """
    Fetches a full Course hierarchy:
    Course -> Modules -> Lessons (metadata) & Quiz -> Questions -> Options.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    c_res = sb.from_("courses").select("*").eq("id", course_id).execute()
    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    course = c_res.data[0]

    # Fetch Modules
    m_res = sb.from_("course_modules").select("*").eq("course_id", course_id).order("position", desc=False).execute()
    modules_data = m_res.data or []

    module_list = []
    for mod in modules_data:
        mod_id = str(mod["id"])

        # Fetch Lessons for module
        l_res = sb.from_("course_lessons").select("*").eq("module_id", mod_id).order("position", desc=False).execute()
        lessons = [
            {
                "id": str(l["id"]),
                "module_id": mod_id,
                "title": l.get("title"),
                "slug": l.get("slug"),
                "short_description": l.get("short_description"),
                "position": l.get("position"),
                "estimated_duration_minutes": l.get("estimated_duration_minutes"),
                "created_at": _format_datetime(l.get("created_at")),
                "updated_at": _format_datetime(l.get("updated_at")),
            }
            for l in (l_res.data or [])
        ]

        # Fetch Quiz for module
        q_res = sb.from_("course_quizzes").select("*").eq("module_id", mod_id).execute()
        quiz_obj = None
        if q_res.data:
            q_row = q_res.data[0]
            quiz_id = str(q_row["id"])

            # Fetch Questions for quiz
            qq_res = sb.from_("quiz_questions").select("*").eq("quiz_id", quiz_id).order("position", desc=False).execute()
            questions = []
            for qq in (qq_res.data or []):
                q_id = str(qq["id"])

                # Fetch Options for question
                opt_res = sb.from_("quiz_options").select("*").eq("question_id", q_id).order("position", desc=False).execute()
                options = [
                    {
                        "id": str(o["id"]),
                        "question_id": q_id,
                        "option_text": o.get("option_text"),
                        "is_correct": bool(o.get("is_correct")),
                        "position": o.get("position"),
                        "created_at": _format_datetime(o.get("created_at")),
                        "updated_at": _format_datetime(o.get("updated_at")),
                    }
                    for o in (opt_res.data or [])
                ]

                questions.append({
                    "id": q_id,
                    "quiz_id": quiz_id,
                    "question_text": qq.get("question_text"),
                    "question_type": qq.get("question_type"),
                    "position": qq.get("position"),
                    "explanation": qq.get("explanation"),
                    "options": options,
                    "created_at": _format_datetime(qq.get("created_at")),
                    "updated_at": _format_datetime(qq.get("updated_at")),
                })

            quiz_obj = {
                "id": quiz_id,
                "module_id": mod_id,
                "title": q_row.get("title"),
                "description": q_row.get("description"),
                "status": q_row.get("status"),
                "questions": questions,
                "created_at": _format_datetime(q_row.get("created_at")),
                "updated_at": _format_datetime(q_row.get("updated_at")),
            }

        module_list.append({
            "id": mod_id,
            "course_id": course_id,
            "title": mod.get("title"),
            "description": mod.get("description"),
            "position": mod.get("position"),
            "lessons": lessons,
            "quiz": quiz_obj,
            "created_at": _format_datetime(mod.get("created_at")),
            "updated_at": _format_datetime(mod.get("updated_at")),
        })

    return {
        "id": str(course["id"]),
        "title": course.get("title"),
        "slug": course.get("slug"),
        "short_description": course.get("short_description"),
        "description": course.get("description"),
        "thumbnail_url": course.get("thumbnail_url"),
        "category": course.get("category"),
        "difficulty": course.get("difficulty"),
        "estimated_duration_minutes": course.get("estimated_duration_minutes"),
        "status": course.get("status"),
        "created_by": str(course.get("created_by")),
        "created_at": _format_datetime(course.get("created_at")),
        "updated_at": _format_datetime(course.get("updated_at")),
        "published_at": _format_datetime(course.get("published_at")),
        "archived_at": _format_datetime(course.get("archived_at")),
        "modules": module_list,
    }


def create_course(data: CourseCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new Course with generated unique slug and audit logging."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    status_val = _get_enum_val(data.status) or CourseStatus.DRAFT.value
    difficulty_val = _get_enum_val(data.difficulty) or CourseDifficulty.BEGINNER.value

    # If created as published, validate publish readiness
    if status_val == CourseStatus.PUBLISHED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A new course cannot be created directly in PUBLISHED status. Create in DRAFT and populate modules and quizzes first."
        )

    slug = generate_course_slug(data.title)

    payload = {
        "title": data.title.strip(),
        "slug": slug,
        "short_description": data.short_description,
        "description": data.description,
        "thumbnail_url": data.thumbnail_url,
        "category": data.category,
        "difficulty": difficulty_val,
        "estimated_duration_minutes": data.estimated_duration_minutes,
        "status": status_val,
        "created_by": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    res = sb.from_("courses").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create course record.")

    created = res.data[0]
    c_id = str(created["id"])

    log_course_audit(
        action="course_created",
        entity_type="course",
        entity_id=c_id,
        user_id=user_id,
        details={"title": payload["title"], "slug": slug, "status": status_val},
    )

    return {
        "id": c_id,
        "title": created.get("title"),
        "slug": created.get("slug"),
        "short_description": created.get("short_description"),
        "description": created.get("description"),
        "thumbnail_url": created.get("thumbnail_url"),
        "category": created.get("category"),
        "difficulty": created.get("difficulty"),
        "estimated_duration_minutes": created.get("estimated_duration_minutes"),
        "status": created.get("status"),
        "created_by": str(created.get("created_by")),
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
        "published_at": None,
        "archived_at": None,
        "modules_count": 0,
        "lessons_count": 0,
    }


def update_course(course_id: str, data: CourseUpdate, user_id: str) -> Dict[str, Any]:
    """Partially updates a Course record."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    existing_res = sb.from_("courses").select("*").eq("id", course_id).execute()
    if not existing_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")
    existing = existing_res.data[0]

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if data.title is not None:
        new_title = data.title.strip()
        update_payload["title"] = new_title
        if slugify(new_title) != slugify(existing.get("title", "")):
            update_payload["slug"] = generate_course_slug(new_title, existing_id=course_id)

    if data.short_description is not None:
        update_payload["short_description"] = data.short_description
    if data.description is not None:
        update_payload["description"] = data.description
    if data.thumbnail_url is not None:
        update_payload["thumbnail_url"] = data.thumbnail_url
    if data.category is not None:
        update_payload["category"] = data.category
    if data.difficulty is not None:
        update_payload["difficulty"] = _get_enum_val(data.difficulty)
    if data.estimated_duration_minutes is not None:
        update_payload["estimated_duration_minutes"] = data.estimated_duration_minutes

    if data.status is not None:
        target_status = _get_enum_val(data.status)
        if target_status == CourseStatus.PUBLISHED.value and existing.get("status") != CourseStatus.PUBLISHED.value:
            validate_course_publish_readiness(course_id)
            update_payload["published_at"] = datetime.now(timezone.utc).isoformat()
        elif target_status == CourseStatus.ARCHIVED.value:
            update_payload["archived_at"] = datetime.now(timezone.utc).isoformat()
        update_payload["status"] = target_status

    res = sb.from_("courses").update(update_payload).eq("id", course_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update course.")

    updated = res.data[0]

    log_course_audit(
        action="course_updated",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return {
        "id": str(updated["id"]),
        "title": updated.get("title"),
        "slug": updated.get("slug"),
        "short_description": updated.get("short_description"),
        "description": updated.get("description"),
        "thumbnail_url": updated.get("thumbnail_url"),
        "category": updated.get("category"),
        "difficulty": updated.get("difficulty"),
        "estimated_duration_minutes": updated.get("estimated_duration_minutes"),
        "status": updated.get("status"),
        "created_by": str(updated.get("created_by")),
        "created_at": _format_datetime(updated.get("created_at")),
        "updated_at": _format_datetime(updated.get("updated_at")),
        "published_at": _format_datetime(updated.get("published_at")),
        "archived_at": _format_datetime(updated.get("archived_at")),
    }


def publish_course(course_id: str, user_id: str) -> Dict[str, Any]:
    """Validates publication readiness and transitions course to PUBLISHED."""
    validate_course_publish_readiness(course_id)

    sb = get_supabase()
    now_iso = datetime.now(timezone.utc).isoformat()

    res = sb.from_("courses").update({
        "status": CourseStatus.PUBLISHED.value,
        "published_at": now_iso,
        "updated_at": now_iso,
    }).eq("id", course_id).execute()

    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to publish course.")

    log_course_audit(
        action="course_published",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
    )

    return get_admin_course_by_id(course_id)


def unpublish_course(course_id: str, user_id: str) -> Dict[str, Any]:
    """Transitions a published course back to DRAFT."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    res = sb.from_("courses").update({
        "status": CourseStatus.DRAFT.value,
        "updated_at": now_iso,
    }).eq("id", course_id).execute()

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    log_course_audit(
        action="course_unpublished",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
    )

    return get_admin_course_by_id(course_id)


def archive_course(course_id: str, user_id: str) -> Dict[str, Any]:
    """Archives a course."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    res = sb.from_("courses").update({
        "status": CourseStatus.ARCHIVED.value,
        "archived_at": now_iso,
        "updated_at": now_iso,
    }).eq("id", course_id).execute()

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    log_course_audit(
        action="course_archived",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
    )

    return get_admin_course_by_id(course_id)


def delete_course(course_id: str, user_id: str) -> bool:
    """Deletes a course and cascades to modules, lessons, quizzes, questions, and options."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("courses").delete().eq("id", course_id).execute()
    log_course_audit(
        action="course_deleted",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
    )
    return True


# ── Course Modules ────────────────────────────────────────────────────────────

def create_course_module(course_id: str, data: CourseModuleCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new Module within a Course."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Verify course exists
    c_res = sb.from_("courses").select("id").eq("id", course_id).execute()
    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found.")

    pos = data.position
    if pos is None:
        # Compute max position + 1
        pos_res = sb.from_("course_modules").select("position").eq("course_id", course_id).order("position", desc=True).limit(1).execute()
        max_pos = pos_res.data[0]["position"] if pos_res.data else 0
        pos = max_pos + 1

    payload = {
        "course_id": course_id,
        "title": data.title.strip(),
        "description": data.description,
        "position": pos,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    res = sb.from_("course_modules").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create module.")

    created = res.data[0]
    mod_id = str(created["id"])

    log_course_audit(
        action="module_created",
        entity_type="module",
        entity_id=mod_id,
        user_id=user_id,
        details={"course_id": course_id, "title": payload["title"], "position": pos},
    )

    return {
        "id": mod_id,
        "course_id": course_id,
        "title": created.get("title"),
        "description": created.get("description"),
        "position": created.get("position"),
        "lessons": [],
        "quiz": None,
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
    }


def get_course_modules(course_id: str) -> List[Dict[str, Any]]:
    """Lists all modules for a course in position order."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_modules").select("*").eq("course_id", course_id).order("position", desc=False).execute()
    return [
        {
            "id": str(m["id"]),
            "course_id": str(m["course_id"]),
            "title": m.get("title"),
            "description": m.get("description"),
            "position": m.get("position"),
            "created_at": _format_datetime(m.get("created_at")),
            "updated_at": _format_datetime(m.get("updated_at")),
        }
        for m in (res.data or [])
    ]


def get_course_module_by_id(module_id: str) -> Dict[str, Any]:
    """Fetches a single module."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_modules").select("*").eq("id", module_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not found.")
    m = res.data[0]
    return {
        "id": str(m["id"]),
        "course_id": str(m["course_id"]),
        "title": m.get("title"),
        "description": m.get("description"),
        "position": m.get("position"),
        "created_at": _format_datetime(m.get("created_at")),
        "updated_at": _format_datetime(m.get("updated_at")),
    }


def update_course_module(module_id: str, data: CourseModuleUpdate, user_id: str) -> Dict[str, Any]:
    """Updates module metadata."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.title is not None:
        update_payload["title"] = data.title.strip()
    if data.description is not None:
        update_payload["description"] = data.description
    if data.position is not None:
        update_payload["position"] = data.position

    res = sb.from_("course_modules").update(update_payload).eq("id", module_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not found.")

    m = res.data[0]
    log_course_audit(
        action="module_updated",
        entity_type="module",
        entity_id=module_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return {
        "id": str(m["id"]),
        "course_id": str(m["course_id"]),
        "title": m.get("title"),
        "description": m.get("description"),
        "position": m.get("position"),
        "created_at": _format_datetime(m.get("created_at")),
        "updated_at": _format_datetime(m.get("updated_at")),
    }


def delete_course_module(module_id: str, user_id: str) -> bool:
    """Deletes a module, safely cascading to lessons and quiz."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    sb.from_("course_modules").delete().eq("id", module_id).execute()
    log_course_audit(
        action="module_deleted",
        entity_type="module",
        entity_id=module_id,
        user_id=user_id,
    )
    return True


def reorder_course_modules(course_id: str, items: List[ReorderItem], user_id: str) -> List[Dict[str, Any]]:
    """
    Safely reorders modules using two-phase offset update to avoid UNIQUE(course_id, position) collisions.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Phase 1: Set temporary negative positions
    for idx, item in enumerate(items, start=1):
        sb.from_("course_modules").update({"position": -(1000 + idx)}).eq("id", item.id).eq("course_id", course_id).execute()

    # Phase 2: Set target positions
    for item in items:
        sb.from_("course_modules").update({"position": item.position}).eq("id", item.id).eq("course_id", course_id).execute()

    log_course_audit(
        action="modules_reordered",
        entity_type="course",
        entity_id=course_id,
        user_id=user_id,
        details={"reordered_count": len(items)},
    )

    return get_course_modules(course_id)


# ── Course Lessons (Metadata Only) ───────────────────────────────────────────

def create_course_lesson(module_id: str, data: CourseLessonCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new Lesson metadata record."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Verify module exists
    m_res = sb.from_("course_modules").select("id").eq("id", module_id).execute()
    if not m_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not found.")

    pos = data.position
    if pos is None:
        pos_res = sb.from_("course_lessons").select("position").eq("module_id", module_id).order("position", desc=True).limit(1).execute()
        max_pos = pos_res.data[0]["position"] if pos_res.data else 0
        pos = max_pos + 1

    lesson_slug = data.slug or slugify(data.title)

    payload = {
        "module_id": module_id,
        "title": data.title.strip(),
        "slug": lesson_slug,
        "short_description": data.short_description,
        "position": pos,
        "estimated_duration_minutes": data.estimated_duration_minutes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    res = sb.from_("course_lessons").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create lesson.")

    created = res.data[0]
    l_id = str(created["id"])

    log_course_audit(
        action="lesson_created",
        entity_type="lesson",
        entity_id=l_id,
        user_id=user_id,
        details={"module_id": module_id, "title": payload["title"], "position": pos},
    )

    return {
        "id": l_id,
        "module_id": module_id,
        "title": created.get("title"),
        "slug": created.get("slug"),
        "short_description": created.get("short_description"),
        "position": created.get("position"),
        "estimated_duration_minutes": created.get("estimated_duration_minutes"),
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
    }


def get_course_lessons(module_id: str) -> List[Dict[str, Any]]:
    """Lists all lessons in position order for a module."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_lessons").select("*").eq("module_id", module_id).order("position", desc=False).execute()
    return [
        {
            "id": str(l["id"]),
            "module_id": str(l["module_id"]),
            "title": l.get("title"),
            "slug": l.get("slug"),
            "short_description": l.get("short_description"),
            "position": l.get("position"),
            "estimated_duration_minutes": l.get("estimated_duration_minutes"),
            "created_at": _format_datetime(l.get("created_at")),
            "updated_at": _format_datetime(l.get("updated_at")),
        }
        for l in (res.data or [])
    ]


def get_course_lesson_by_id(lesson_id: str) -> Dict[str, Any]:
    """Fetches a single lesson by ID."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_lessons").select("*").eq("id", lesson_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Lesson '{lesson_id}' not found.")
    l = res.data[0]
    return {
        "id": str(l["id"]),
        "module_id": str(l["module_id"]),
        "title": l.get("title"),
        "slug": l.get("slug"),
        "short_description": l.get("short_description"),
        "position": l.get("position"),
        "estimated_duration_minutes": l.get("estimated_duration_minutes"),
        "created_at": _format_datetime(l.get("created_at")),
        "updated_at": _format_datetime(l.get("updated_at")),
    }


def update_course_lesson(lesson_id: str, data: CourseLessonUpdate, user_id: str) -> Dict[str, Any]:
    """Updates lesson metadata."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.title is not None:
        update_payload["title"] = data.title.strip()
    if data.slug is not None:
        update_payload["slug"] = data.slug
    if data.short_description is not None:
        update_payload["short_description"] = data.short_description
    if data.position is not None:
        update_payload["position"] = data.position
    if data.estimated_duration_minutes is not None:
        update_payload["estimated_duration_minutes"] = data.estimated_duration_minutes

    res = sb.from_("course_lessons").update(update_payload).eq("id", lesson_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Lesson '{lesson_id}' not found.")

    l = res.data[0]
    log_course_audit(
        action="lesson_updated",
        entity_type="lesson",
        entity_id=lesson_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return {
        "id": str(l["id"]),
        "module_id": str(l["module_id"]),
        "title": l.get("title"),
        "slug": l.get("slug"),
        "short_description": l.get("short_description"),
        "position": l.get("position"),
        "estimated_duration_minutes": l.get("estimated_duration_minutes"),
        "created_at": _format_datetime(l.get("created_at")),
        "updated_at": _format_datetime(l.get("updated_at")),
    }


def delete_course_lesson(lesson_id: str, user_id: str) -> bool:
    """Deletes a lesson."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    sb.from_("course_lessons").delete().eq("id", lesson_id).execute()
    log_course_audit(
        action="lesson_deleted",
        entity_type="lesson",
        entity_id=lesson_id,
        user_id=user_id,
    )
    return True


def reorder_course_lessons(module_id: str, items: List[ReorderItem], user_id: str) -> List[Dict[str, Any]]:
    """Safely reorders lessons using two-phase offset update."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    for idx, item in enumerate(items, start=1):
        sb.from_("course_lessons").update({"position": -(1000 + idx)}).eq("id", item.id).eq("module_id", module_id).execute()

    for item in items:
        sb.from_("course_lessons").update({"position": item.position}).eq("id", item.id).eq("module_id", module_id).execute()

    log_course_audit(
        action="lessons_reordered",
        entity_type="module",
        entity_id=module_id,
        user_id=user_id,
        details={"reordered_count": len(items)},
    )

    return get_course_lessons(module_id)


# ── Module Quiz Foundation ───────────────────────────────────────────────────

def create_course_quiz(module_id: str, data: CourseQuizCreate, user_id: str) -> Dict[str, Any]:
    """
    Creates a Quiz for a Module.
    CRITICAL DATABASE RULE: Exactly ONE quiz per module!
    Rejects with 409 Conflict if a quiz already exists for module_id.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Verify module exists
    m_res = sb.from_("course_modules").select("id").eq("id", module_id).execute()
    if not m_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not found.")

    # Check for existing quiz
    existing_res = sb.from_("course_quizzes").select("id").eq("module_id", module_id).execute()
    if existing_res.data and len(existing_res.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A quiz already exists for this module. A module cannot have more than one quiz."
        )

    payload = {
        "module_id": module_id,
        "title": data.title.strip(),
        "description": data.description,
        "status": data.status or "DRAFT",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        res = sb.from_("course_quizzes").insert(payload).execute()
    except Exception as e:
        if "uq_course_quizzes_module_id" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A quiz already exists for this module (unique constraint violated)."
            )
        raise e

    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create quiz.")

    created = res.data[0]
    q_id = str(created["id"])

    log_course_audit(
        action="quiz_created",
        entity_type="quiz",
        entity_id=q_id,
        user_id=user_id,
        details={"module_id": module_id, "title": payload["title"]},
    )

    return {
        "id": q_id,
        "module_id": module_id,
        "title": created.get("title"),
        "description": created.get("description"),
        "status": created.get("status"),
        "questions": [],
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
    }


def get_course_quiz(module_id: str) -> Optional[Dict[str, Any]]:
    """Fetches the quiz for a module with all questions and options."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_quizzes").select("*").eq("module_id", module_id).execute()
    if not res.data:
        return None

    quiz = res.data[0]
    quiz_id = str(quiz["id"])

    # Fetch questions
    qq_res = sb.from_("quiz_questions").select("*").eq("quiz_id", quiz_id).order("position", desc=False).execute()
    questions = []
    for qq in (qq_res.data or []):
        q_id = str(qq["id"])
        opt_res = sb.from_("quiz_options").select("*").eq("question_id", q_id).order("position", desc=False).execute()
        options = [
            {
                "id": str(o["id"]),
                "question_id": q_id,
                "option_text": o.get("option_text"),
                "is_correct": bool(o.get("is_correct")),
                "position": o.get("position"),
                "created_at": _format_datetime(o.get("created_at")),
                "updated_at": _format_datetime(o.get("updated_at")),
            }
            for o in (opt_res.data or [])
        ]
        questions.append({
            "id": q_id,
            "quiz_id": quiz_id,
            "question_text": qq.get("question_text"),
            "question_type": qq.get("question_type"),
            "position": qq.get("position"),
            "explanation": qq.get("explanation"),
            "options": options,
            "created_at": _format_datetime(qq.get("created_at")),
            "updated_at": _format_datetime(qq.get("updated_at")),
        })

    return {
        "id": quiz_id,
        "module_id": module_id,
        "title": quiz.get("title"),
        "description": quiz.get("description"),
        "status": quiz.get("status"),
        "questions": questions,
        "created_at": _format_datetime(quiz.get("created_at")),
        "updated_at": _format_datetime(quiz.get("updated_at")),
    }


def get_quiz_by_id(quiz_id: str) -> Dict[str, Any]:
    """Fetches a quiz by quiz UUID."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_quizzes").select("*").eq("id", quiz_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quiz '{quiz_id}' not found.")
    quiz = res.data[0]
    return get_course_quiz(str(quiz["module_id"])) or quiz


def update_course_quiz(quiz_id: str, data: CourseQuizUpdate, user_id: str) -> Dict[str, Any]:
    """Updates quiz metadata."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.title is not None:
        update_payload["title"] = data.title.strip()
    if data.description is not None:
        update_payload["description"] = data.description
    if data.status is not None:
        update_payload["status"] = data.status

    res = sb.from_("course_quizzes").update(update_payload).eq("id", quiz_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quiz '{quiz_id}' not found.")

    log_course_audit(
        action="quiz_updated",
        entity_type="quiz",
        entity_id=quiz_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return get_quiz_by_id(quiz_id)


# ── Quiz Questions ────────────────────────────────────────────────────────────

def create_quiz_question(quiz_id: str, data: QuizQuestionCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new Question within a Quiz."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Verify quiz exists
    q_res = sb.from_("course_quizzes").select("id").eq("id", quiz_id).execute()
    if not q_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quiz '{quiz_id}' not found.")

    pos = data.position
    if pos is None:
        pos_res = sb.from_("quiz_questions").select("position").eq("quiz_id", quiz_id).order("position", desc=True).limit(1).execute()
        max_pos = pos_res.data[0]["position"] if pos_res.data else 0
        pos = max_pos + 1

    q_type = _get_enum_val(data.question_type) or QuestionType.SINGLE_SELECT.value

    payload = {
        "quiz_id": quiz_id,
        "question_text": data.question_text.strip(),
        "question_type": q_type,
        "position": pos,
        "explanation": data.explanation,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    res = sb.from_("quiz_questions").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create question.")

    created = res.data[0]
    question_id = str(created["id"])

    # If options passed nested in creation
    options_list = []
    if data.options:
        for opt_idx, opt_data in enumerate(data.options, start=1):
            opt_payload = {
                "question_id": question_id,
                "option_text": opt_data.option_text.strip(),
                "is_correct": bool(opt_data.is_correct),
                "position": opt_data.position or opt_idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            opt_res = sb.from_("quiz_options").insert(opt_payload).execute()
            if opt_res.data:
                o = opt_res.data[0]
                options_list.append({
                    "id": str(o["id"]),
                    "question_id": question_id,
                    "option_text": o.get("option_text"),
                    "is_correct": bool(o.get("is_correct")),
                    "position": o.get("position"),
                    "created_at": _format_datetime(o.get("created_at")),
                    "updated_at": _format_datetime(o.get("updated_at")),
                })

    log_course_audit(
        action="question_created",
        entity_type="question",
        entity_id=question_id,
        user_id=user_id,
        details={"quiz_id": quiz_id, "position": pos, "question_type": q_type},
    )

    return {
        "id": question_id,
        "quiz_id": quiz_id,
        "question_text": created.get("question_text"),
        "question_type": created.get("question_type"),
        "position": created.get("position"),
        "explanation": created.get("explanation"),
        "options": options_list,
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
    }


def get_quiz_question_by_id(question_id: str) -> Dict[str, Any]:
    """Fetches a single question with its options."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("quiz_questions").select("*").eq("id", question_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question '{question_id}' not found.")

    qq = res.data[0]
    opt_res = sb.from_("quiz_options").select("*").eq("question_id", question_id).order("position", desc=False).execute()
    options = [
        {
            "id": str(o["id"]),
            "question_id": question_id,
            "option_text": o.get("option_text"),
            "is_correct": bool(o.get("is_correct")),
            "position": o.get("position"),
            "created_at": _format_datetime(o.get("created_at")),
            "updated_at": _format_datetime(o.get("updated_at")),
        }
        for o in (opt_res.data or [])
    ]

    return {
        "id": str(qq["id"]),
        "quiz_id": str(qq["quiz_id"]),
        "question_text": qq.get("question_text"),
        "question_type": qq.get("question_type"),
        "position": qq.get("position"),
        "explanation": qq.get("explanation"),
        "options": options,
        "created_at": _format_datetime(qq.get("created_at")),
        "updated_at": _format_datetime(qq.get("updated_at")),
    }


def update_quiz_question(question_id: str, data: QuizQuestionUpdate, user_id: str) -> Dict[str, Any]:
    """Updates question prompt or metadata."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.question_text is not None:
        update_payload["question_text"] = data.question_text.strip()
    if data.question_type is not None:
        update_payload["question_type"] = _get_enum_val(data.question_type)
    if data.position is not None:
        update_payload["position"] = data.position
    if data.explanation is not None:
        update_payload["explanation"] = data.explanation

    res = sb.from_("quiz_questions").update(update_payload).eq("id", question_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question '{question_id}' not found.")

    log_course_audit(
        action="question_updated",
        entity_type="question",
        entity_id=question_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return get_quiz_question_by_id(question_id)


def delete_quiz_question(question_id: str, user_id: str) -> bool:
    """Deletes a question and its options."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    sb.from_("quiz_questions").delete().eq("id", question_id).execute()
    log_course_audit(
        action="question_deleted",
        entity_type="question",
        entity_id=question_id,
        user_id=user_id,
    )
    return True


def reorder_quiz_questions(quiz_id: str, items: List[ReorderItem], user_id: str) -> List[Dict[str, Any]]:
    """Safely reorders questions."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    for idx, item in enumerate(items, start=1):
        sb.from_("quiz_questions").update({"position": -(1000 + idx)}).eq("id", item.id).eq("quiz_id", quiz_id).execute()

    for item in items:
        sb.from_("quiz_questions").update({"position": item.position}).eq("id", item.id).eq("quiz_id", quiz_id).execute()

    log_course_audit(
        action="questions_reordered",
        entity_type="quiz",
        entity_id=quiz_id,
        user_id=user_id,
        details={"reordered_count": len(items)},
    )

    # Return ordered questions
    qq_res = sb.from_("quiz_questions").select("*").eq("quiz_id", quiz_id).order("position", desc=False).execute()
    return [get_quiz_question_by_id(str(q["id"])) for q in (qq_res.data or [])]


# ── Quiz Options ──────────────────────────────────────────────────────────────

def create_quiz_option(question_id: str, data: QuizOptionCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new Option for a Question."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Verify question exists
    q_res = sb.from_("quiz_questions").select("id, question_type").eq("id", question_id).execute()
    if not q_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Question '{question_id}' not found.")

    pos = data.position
    if pos is None:
        pos_res = sb.from_("quiz_options").select("position").eq("question_id", question_id).order("position", desc=True).limit(1).execute()
        max_pos = pos_res.data[0]["position"] if pos_res.data else 0
        pos = max_pos + 1

    payload = {
        "question_id": question_id,
        "option_text": data.option_text.strip(),
        "is_correct": bool(data.is_correct),
        "position": pos,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    res = sb.from_("quiz_options").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create option.")

    created = res.data[0]
    opt_id = str(created["id"])

    log_course_audit(
        action="option_created",
        entity_type="option",
        entity_id=opt_id,
        user_id=user_id,
        details={"question_id": question_id, "is_correct": payload["is_correct"], "position": pos},
    )

    return {
        "id": opt_id,
        "question_id": question_id,
        "option_text": created.get("option_text"),
        "is_correct": bool(created.get("is_correct")),
        "position": created.get("position"),
        "created_at": _format_datetime(created.get("created_at")),
        "updated_at": _format_datetime(created.get("updated_at")),
    }


def get_quiz_option_by_id(option_id: str) -> Dict[str, Any]:
    """Fetches a single option."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("quiz_options").select("*").eq("id", option_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Option '{option_id}' not found.")
    o = res.data[0]
    return {
        "id": str(o["id"]),
        "question_id": str(o["question_id"]),
        "option_text": o.get("option_text"),
        "is_correct": bool(o.get("is_correct")),
        "position": o.get("position"),
        "created_at": _format_datetime(o.get("created_at")),
        "updated_at": _format_datetime(o.get("updated_at")),
    }


def update_quiz_option(option_id: str, data: QuizOptionUpdate, user_id: str) -> Dict[str, Any]:
    """Updates an option text or correctness flag."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    update_payload: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if data.option_text is not None:
        update_payload["option_text"] = data.option_text.strip()
    if data.is_correct is not None:
        update_payload["is_correct"] = bool(data.is_correct)
    if data.position is not None:
        update_payload["position"] = data.position

    res = sb.from_("quiz_options").update(update_payload).eq("id", option_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Option '{option_id}' not found.")

    o = res.data[0]
    log_course_audit(
        action="option_updated",
        entity_type="option",
        entity_id=option_id,
        user_id=user_id,
        details={"updated_fields": list(update_payload.keys())},
    )

    return {
        "id": str(o["id"]),
        "question_id": str(o["question_id"]),
        "option_text": o.get("option_text"),
        "is_correct": bool(o.get("is_correct")),
        "position": o.get("position"),
        "created_at": _format_datetime(o.get("created_at")),
        "updated_at": _format_datetime(o.get("updated_at")),
    }


def delete_quiz_option(option_id: str, user_id: str) -> bool:
    """Deletes an option."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    sb.from_("quiz_options").delete().eq("id", option_id).execute()
    log_course_audit(
        action="option_deleted",
        entity_type="option",
        entity_id=option_id,
        user_id=user_id,
    )
    return True


def reorder_quiz_options(question_id: str, items: List[ReorderItem], user_id: str) -> List[Dict[str, Any]]:
    """Safely reorders options within a question."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    for idx, item in enumerate(items, start=1):
        sb.from_("quiz_options").update({"position": -(1000 + idx)}).eq("id", item.id).eq("question_id", question_id).execute()

    for item in items:
        sb.from_("quiz_options").update({"position": item.position}).eq("id", item.id).eq("question_id", question_id).execute()

    log_course_audit(
        action="options_reordered",
        entity_type="question",
        entity_id=question_id,
        user_id=user_id,
        details={"reordered_count": len(items)},
    )

    opt_res = sb.from_("quiz_options").select("*").eq("question_id", question_id).order("position", desc=False).execute()
    return [
        {
            "id": str(o["id"]),
            "question_id": question_id,
            "option_text": o.get("option_text"),
            "is_correct": bool(o.get("is_correct")),
            "position": o.get("position"),
            "created_at": _format_datetime(o.get("created_at")),
            "updated_at": _format_datetime(o.get("updated_at")),
        }
        for o in (opt_res.data or [])
    ]


# ── Lesson Content Service Methods (Phase 2A) ─────────────────────────────────

def verify_lesson_hierarchy(course_id: str, module_id: str, lesson_id: str) -> None:
    """
    Authoritatively validates the relational integrity of:
      course -> module -> lesson
    Rejects cross-course, cross-module, or non-existent entity access with 404.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # 1. Verify module belongs to course
    mod_res = sb.from_("course_modules").select("id, course_id").eq("id", module_id).limit(1).execute()
    if not mod_res.data or str(mod_res.data[0].get("course_id")) != course_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found or does not belong to the specified course."
        )

    # 2. Verify lesson belongs to module
    les_res = sb.from_("course_lessons").select("id, module_id").eq("id", lesson_id).limit(1).execute()
    if not les_res.data or str(les_res.data[0].get("module_id")) != module_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found or does not belong to the specified module."
        )

    return mod_res.data[0], les_res.data[0]


def get_lesson_content(course_id: str, module_id: str, lesson_id: str) -> Dict[str, Any]:
    """
    Retrieves structured lesson content blocks.
    Returns empty blocks list if no content has been saved yet (valid initial state).
    """
    verify_lesson_hierarchy(course_id, module_id, lesson_id)

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    res = sb.from_("course_lesson_contents").select("*").eq("lesson_id", lesson_id).limit(1).execute()
    if not res.data:
        # Initial empty state is completely valid in Phase 2A
        return {
            "id": None,
            "lesson_id": lesson_id,
            "schema_version": 1,
            "blocks": [],
            "created_at": None,
            "updated_at": None,
        }

    row = res.data[0]
    return {
        "id": str(row["id"]),
        "lesson_id": str(row["lesson_id"]),
        "schema_version": row.get("schema_version", 1),
        "blocks": row.get("blocks", []),
        "created_at": _format_datetime(row.get("created_at")),
        "updated_at": _format_datetime(row.get("updated_at")),
    }


def save_lesson_content(
    course_id: str,
    module_id: str,
    lesson_id: str,
    payload_dict: Dict[str, Any],
    user_id: str
) -> Dict[str, Any]:
    """
    Persists validated and normalized structured content blocks for a lesson.
    Atomically upserts into course_lesson_contents and records audit history.
    """
    from backend.models.lesson_content import LessonContentPayload

    verify_lesson_hierarchy(course_id, module_id, lesson_id)

    # Authoritative backend validation
    validated_payload = LessonContentPayload.model_validate(payload_dict)

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    blocks_data = [b.model_dump() for b in validated_payload.blocks]

    content_record = {
        "lesson_id": lesson_id,
        "schema_version": 1,
        "blocks": blocks_data,
        "updated_at": now_iso,
    }

    # Upsert on conflict (lesson_id)
    upsert_res = sb.from_("course_lesson_contents").upsert(
        content_record,
        on_conflict="lesson_id"
    ).execute()

    if not upsert_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist lesson content."
        )

    saved_row = upsert_res.data[0]
    content_id = str(saved_row["id"])

    log_course_audit(
        action="lesson_content_updated",
        entity_type="lesson_content",
        entity_id=content_id,
        user_id=user_id,
        details={
            "course_id": course_id,
            "module_id": module_id,
            "lesson_id": lesson_id,
            "block_count": len(blocks_data),
            "block_types": [b["type"] for b in blocks_data],
        },
    )

    return {
        "id": content_id,
        "lesson_id": lesson_id,
        "schema_version": saved_row.get("schema_version", 1),
        "blocks": saved_row.get("blocks", []),
        "created_at": _format_datetime(saved_row.get("created_at")),
        "updated_at": _format_datetime(saved_row.get("updated_at")),
    }
