"""
backend/services/student_course_service.py
Dedicated Student-Facing Course Service (Phase 4).
Strictly read-only access to published courses, modules, lessons, and content.
Enforces content visibility rules: draft/archived courses/lessons are strictly inaccessible.
Omits internal admin metadata, audit logs, and quiz answer keys.
"""

import uuid
import logging
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.course import CourseStatus

logger = logging.getLogger("skillscatalyst.courses.student")


def _is_uuid(val: str) -> bool:
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False


def _format_datetime(dt_val: Any) -> Optional[str]:
    if not dt_val:
        return None
    if hasattr(dt_val, "isoformat"):
        return dt_val.isoformat()
    return str(dt_val)


def get_published_courses(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Retrieves published courses for student discovery.
    Draft, in-review, and archived courses are strictly excluded.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    page = max(1, page)
    page_size = max(1, min(100, page_size))
    offset = (page - 1) * page_size

    query = (
        sb.from_("courses")
        .select("*, course_modules(id, course_lessons(id))", count="exact")
        .eq("status", CourseStatus.PUBLISHED.value)
    )

    if category and category.strip():
        query = query.eq("category", category.strip())

    if difficulty and difficulty.strip():
        query = query.eq("difficulty", difficulty.strip().lower())

    if search and search.strip():
        clean_search = search.strip()
        query = query.or_(f"title.ilike.%{clean_search}%,short_description.ilike.%{clean_search}%")

    query = query.order("created_at", desc=True)
    res = query.range(offset, offset + page_size - 1).execute()

    total = res.count if res.count is not None else len(res.data or [])
    rows = res.data or []

    items: List[Dict[str, Any]] = []
    for r in rows:
        mods = r.get("course_modules") or []
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
            "published_at": _format_datetime(r.get("published_at")),
            "modules_count": len(mods),
            "lessons_count": l_count,
        })

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return {
        "total": total,
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_published_course_detail(course_id_or_slug: str) -> Dict[str, Any]:
    """
    Fetches full student-safe hierarchy for a published course.
    Returns 404 if the course is not found or not in PUBLISHED status.
    Quizzes only expose id and title (questions/options/answer keys strictly omitted).
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # 1. Fetch course by UUID or slug
    if _is_uuid(course_id_or_slug):
        c_res = sb.from_("courses").select("*").eq("id", course_id_or_slug).execute()
    else:
        c_res = sb.from_("courses").select("*").eq("slug", course_id_or_slug).execute()

    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    course = c_res.data[0]
    if course.get("status") != CourseStatus.PUBLISHED.value:
        # Strictly hide draft/in-review/archived courses from students
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or unavailable.")

    course_id = str(course["id"])

    # 2. Fetch modules ordered by position
    m_res = (
        sb.from_("course_modules")
        .select("*")
        .eq("course_id", course_id)
        .order("position", desc=False)
        .execute()
    )
    raw_modules = m_res.data or []

    modules: List[Dict[str, Any]] = []
    total_lessons = 0

    for m in raw_modules:
        mod_id = str(m["id"])

        # Fetch lessons for this module ordered by position
        l_res = (
            sb.from_("course_lessons")
            .select("*")
            .eq("module_id", mod_id)
            .order("position", desc=False)
            .execute()
        )
        raw_lessons = l_res.data or []
        total_lessons += len(raw_lessons)

        lessons = [
            {
                "id": str(les["id"]),
                "module_id": mod_id,
                "title": les.get("title"),
                "slug": les.get("slug"),
                "short_description": les.get("short_description"),
                "position": les.get("position"),
                "estimated_duration_minutes": les.get("estimated_duration_minutes"),
            }
            for les in raw_lessons
        ]

        # Fetch quiz outline (display-only title and id, NO questions, NO options, NO answer keys)
        q_res = sb.from_("course_quizzes").select("id, module_id, title, description, status").eq("module_id", mod_id).execute()
        quiz_data = None
        if q_res.data:
            q_row = q_res.data[0]
            quiz_data = {
                "id": str(q_row["id"]),
                "module_id": str(q_row["module_id"]),
                "title": q_row.get("title"),
                "description": q_row.get("description"),
            }

        modules.append({
            "id": mod_id,
            "course_id": course_id,
            "title": m.get("title"),
            "description": m.get("description"),
            "position": m.get("position"),
            "lessons": lessons,
            "quiz": quiz_data,
        })

    return {
        "id": course_id,
        "title": course.get("title"),
        "slug": course.get("slug"),
        "short_description": course.get("short_description"),
        "description": course.get("description"),
        "thumbnail_url": course.get("thumbnail_url"),
        "category": course.get("category"),
        "difficulty": course.get("difficulty"),
        "estimated_duration_minutes": course.get("estimated_duration_minutes"),
        "status": course.get("status"),
        "published_at": _format_datetime(course.get("published_at")),
        "modules_count": len(modules),
        "lessons_count": total_lessons,
        "modules": modules,
    }


def get_published_lesson_content(course_id_or_slug: str, lesson_id: str) -> Dict[str, Any]:
    """
    Retrieves student-safe lesson content with boundary-aware sequential navigation.
    Enforces course is in PUBLISHED status and lesson belongs to course hierarchy.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # 1. Resolve published course
    if _is_uuid(course_id_or_slug):
        c_res = sb.from_("courses").select("id, title, slug, status").eq("id", course_id_or_slug).execute()
    else:
        c_res = sb.from_("courses").select("id, title, slug, status").eq("slug", course_id_or_slug).execute()

    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    course = c_res.data[0]
    if course.get("status") != CourseStatus.PUBLISHED.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or unavailable.")

    course_id = str(course["id"])

    # 2. Fetch full course outline to verify hierarchy and compute module-boundary navigation
    m_res = (
        sb.from_("course_modules")
        .select("id, title, position")
        .eq("course_id", course_id)
        .order("position", desc=False)
        .execute()
    )
    raw_modules = m_res.data or []
    if not raw_modules:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found in course.")

    # Flatten ordered lessons across all modules
    flat_lessons: List[Dict[str, Any]] = []
    current_lesson_record = None
    current_module_record = None

    for m in raw_modules:
        mod_id = str(m["id"])
        l_res = (
            sb.from_("course_lessons")
            .select("id, module_id, title, slug, short_description, position, estimated_duration_minutes")
            .eq("module_id", mod_id)
            .order("position", desc=False)
            .execute()
        )
        for les in (l_res.data or []):
            les_id = str(les["id"])
            item = {
                "id": les_id,
                "module_id": mod_id,
                "module_title": m.get("title"),
                "title": les.get("title"),
                "slug": les.get("slug"),
                "short_description": les.get("short_description"),
                "position": les.get("position"),
                "estimated_duration_minutes": les.get("estimated_duration_minutes"),
            }
            flat_lessons.append(item)
            if les_id == str(lesson_id):
                current_lesson_record = item
                current_module_record = {
                    "id": mod_id,
                    "title": m.get("title"),
                    "position": m.get("position"),
                }

    if not current_lesson_record or not current_module_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found or does not belong to the specified published course."
        )

    # 3. Find navigation targets across module boundaries
    curr_idx = next(i for i, l in enumerate(flat_lessons) if l["id"] == str(lesson_id))

    prev_lesson = None
    if curr_idx > 0:
        p = flat_lessons[curr_idx - 1]
        prev_lesson = {
            "id": p["id"],
            "title": p["title"],
            "module_id": p["module_id"],
            "module_title": p["module_title"],
        }

    next_lesson = None
    if curr_idx < len(flat_lessons) - 1:
        n = flat_lessons[curr_idx + 1]
        next_lesson = {
            "id": n["id"],
            "title": n["title"],
            "module_id": n["module_id"],
            "module_title": n["module_title"],
        }

    # 4. Fetch structured content blocks from course_lesson_contents
    cnt_res = (
        sb.from_("course_lesson_contents")
        .select("schema_version, blocks")
        .eq("lesson_id", str(lesson_id))
        .limit(1)
        .execute()
    )

    blocks = []
    schema_version = 1
    if cnt_res.data:
        row = cnt_res.data[0]
        blocks = row.get("blocks", [])
        schema_version = row.get("schema_version", 1)

    return {
        "course": {
            "id": course_id,
            "title": course.get("title"),
            "slug": course.get("slug"),
        },
        "module": current_module_record,
        "lesson": {
            "id": current_lesson_record["id"],
            "module_id": current_lesson_record["module_id"],
            "title": current_lesson_record["title"],
            "slug": current_lesson_record["slug"],
            "short_description": current_lesson_record["short_description"],
            "position": current_lesson_record["position"],
            "estimated_duration_minutes": current_lesson_record["estimated_duration_minutes"],
        },
        "content": {
            "schema_version": schema_version,
            "blocks": blocks,
        },
        "prev_lesson": prev_lesson,
        "next_lesson": next_lesson,
    }
