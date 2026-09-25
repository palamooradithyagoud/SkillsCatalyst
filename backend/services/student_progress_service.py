"""
backend/services/student_progress_service.py
Dedicated Student Progress Service (Phase 5).
Manages persistent learning progress, lesson completion, resume position,
and module lesson requirements.

Strict Security & Data Isolation:
- Derives user identity strictly from authenticated Supabase context.
- Validates course/module/lesson hierarchy: lessons from other courses or draft courses return 404.
- Deterministic completion semantics: explicit completion only; repeated calls are idempotent.
- Lesson completion does NOT trigger full module completion (quiz pending Phase 6)
  or course certification (Phase 7).
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.course import CourseStatus

logger = logging.getLogger("skillscatalyst.courses.progress")


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


def _resolve_published_course(sb, course_id_or_slug: str) -> Dict[str, Any]:
    """
    Fetches and verifies that the course exists and is PUBLISHED.
    Draft, in-review, and archived courses strictly return 404.
    """
    if _is_uuid(course_id_or_slug):
        c_res = sb.from_("courses").select("id, title, slug, status").eq("id", course_id_or_slug).execute()
    else:
        c_res = sb.from_("courses").select("id, title, slug, status").eq("slug", course_id_or_slug).execute()

    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    course = c_res.data[0]
    if course.get("status") != CourseStatus.PUBLISHED.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or unavailable.")

    return course


def get_student_course_progress(user_id: str, course_id_or_slug: str) -> Dict[str, Any]:
    """
    Retrieves the authenticated student's authoritative progress for a published course.
    Calculates completed lesson count, progress percentage, module breakdown,
    and valid resume lesson pointer.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    # 1. Fetch all published modules ordered by position
    m_res = (
        sb.from_("course_modules")
        .select("id, position")
        .eq("course_id", course_id)
        .order("position", desc=False)
        .execute()
    )
    raw_modules = m_res.data or []

    # Map of module_id -> list of lesson_ids
    module_lessons_map: Dict[str, List[str]] = {}
    all_published_lesson_ids: List[str] = []
    first_published_lesson_id: Optional[str] = None

    for m in raw_modules:
        mod_id = str(m["id"])
        l_res = (
            sb.from_("course_lessons")
            .select("id, position")
            .eq("module_id", mod_id)
            .order("position", desc=False)
            .execute()
        )
        mod_lesson_ids = [str(les["id"]) for les in (l_res.data or [])]
        module_lessons_map[mod_id] = mod_lesson_ids
        for lid in mod_lesson_ids:
            all_published_lesson_ids.append(lid)
            if first_published_lesson_id is None:
                first_published_lesson_id = lid

    total_lessons = len(all_published_lesson_ids)

    # 2. Fetch student's completed lessons for this course
    # Filter strictly to lessons that are part of the current published course
    lp_res = (
        sb.from_("student_lesson_progress")
        .select("lesson_id, completed, completed_at, last_viewed_at")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .eq("completed", True)
        .execute()
    )
    raw_completed = lp_res.data or []
    completed_lesson_set = {
        str(r["lesson_id"])
        for r in raw_completed
        if r.get("lesson_id") and str(r["lesson_id"]) in all_published_lesson_ids
    }
    completed_lessons_count = len(completed_lesson_set)

    # Calculate overall course progress percentage (rounded integer 0-100)
    progress_percentage = (
        round((completed_lessons_count / total_lessons) * 100) if total_lessons > 0 else 0
    )

    # 3. Calculate module-level progress
    module_summaries: List[Dict[str, Any]] = []
    for m in raw_modules:
        mod_id = str(m["id"])
        mod_lids = module_lessons_map.get(mod_id, [])
        mod_total = len(mod_lids)
        mod_completed = sum(1 for lid in mod_lids if lid in completed_lesson_set)
        mod_pct = round((mod_completed / mod_total) * 100) if mod_total > 0 else 0
        lessons_complete = (mod_completed == mod_total and mod_total > 0)

        module_summaries.append({
            "module_id": mod_id,
            "completed_lessons": mod_completed,
            "total_lessons": mod_total,
            "progress_percentage": mod_pct,
            "lessons_complete": lessons_complete,
        })

    # 4. Fetch student's course progress row to determine last viewed / resume lesson
    cp_res = (
        sb.from_("student_course_progress")
        .select("last_lesson_id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .limit(1)
        .execute()
    )

    last_lesson_id: Optional[str] = None
    if cp_res.data:
        saved_last = cp_res.data[0].get("last_lesson_id")
        if saved_last and str(saved_last) in all_published_lesson_ids:
            last_lesson_id = str(saved_last)

    # If student has progress but last_lesson_id was invalid or removed, fall back safely
    if not last_lesson_id and completed_lessons_count > 0:
        last_lesson_id = first_published_lesson_id

    return {
        "course_id": course_id,
        "completed_lesson_ids": sorted(list(completed_lesson_set)),
        "last_lesson_id": last_lesson_id,
        "completed_lessons": completed_lessons_count,
        "total_lessons": total_lessons,
        "progress_percentage": progress_percentage,
        "modules": module_summaries,
    }


def record_student_lesson_progress(
    user_id: str,
    course_id_or_slug: str,
    lesson_id: str,
    completed: Optional[bool] = None,
) -> Dict[str, Any]:
    """
    Records student activity and/or completion for a specific lesson.
    - Strictly validates course/module/lesson hierarchy.
    - Derives user identity strictly from authenticated JWT context.
    - Idempotent: repeated completions preserve the original completed_at timestamp.
    - Updates student_course_progress.last_lesson_id for seamless resume navigation.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    # 1. Verify lesson exists and retrieve its module_id
    if not _is_uuid(lesson_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid lesson identifier.")

    les_res = sb.from_("course_lessons").select("id, module_id").eq("id", lesson_id).limit(1).execute()
    if not les_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")

    lesson_row = les_res.data[0]
    module_id = str(lesson_row["module_id"])

    # 2. Verify module belongs to this course
    mod_res = sb.from_("course_modules").select("id, course_id").eq("id", module_id).limit(1).execute()
    if not mod_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

    mod_row = mod_res.data[0]
    if str(mod_row["course_id"]) != course_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson does not belong to the specified course."
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    # 3. Check existing lesson progress row
    existing_lp = (
        sb.from_("student_lesson_progress")
        .select("id, completed, completed_at")
        .eq("user_id", user_id)
        .eq("lesson_id", lesson_id)
        .limit(1)
        .execute()
    )

    is_currently_completed = False
    existing_completed_at = None

    if existing_lp.data:
        row = existing_lp.data[0]
        is_currently_completed = bool(row.get("completed", False))
        existing_completed_at = row.get("completed_at")

    # Determine target completion state
    if completed is True:
        target_completed = True
        target_completed_at = existing_completed_at or now_iso
    elif completed is False:
        target_completed = False
        target_completed_at = None
    else:
        # None: keep existing completion state; just update last_viewed_at
        target_completed = is_currently_completed
        target_completed_at = existing_completed_at

    # Upsert lesson progress
    upsert_lp_payload = {
        "user_id": user_id,
        "course_id": course_id,
        "module_id": module_id,
        "lesson_id": lesson_id,
        "completed": target_completed,
        "completed_at": target_completed_at,
        "last_viewed_at": now_iso,
        "updated_at": now_iso,
    }

    if existing_lp.data:
        lp_id = existing_lp.data[0]["id"]
        sb.from_("student_lesson_progress").update(upsert_lp_payload).eq("id", lp_id).execute()
    else:
        upsert_lp_payload["created_at"] = now_iso
        sb.from_("student_lesson_progress").insert(upsert_lp_payload).execute()

    # 4. Upsert student course progress (update last_lesson_id for resume)
    existing_cp = (
        sb.from_("student_course_progress")
        .select("id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .limit(1)
        .execute()
    )

    upsert_cp_payload = {
        "user_id": user_id,
        "course_id": course_id,
        "last_lesson_id": lesson_id,
        "last_activity_at": now_iso,
        "updated_at": now_iso,
    }

    if existing_cp.data:
        cp_id = existing_cp.data[0]["id"]
        sb.from_("student_course_progress").update(upsert_cp_payload).eq("id", cp_id).execute()
    else:
        upsert_cp_payload["created_at"] = now_iso
        sb.from_("student_course_progress").insert(upsert_cp_payload).execute()

    # 5. Fetch updated course progress summary
    updated_course_progress = get_student_course_progress(user_id=user_id, course_id_or_slug=course_id)

    lesson_item = {
        "lesson_id": lesson_id,
        "course_id": course_id,
        "module_id": module_id,
        "completed": target_completed,
        "completed_at": _format_datetime(target_completed_at),
        "last_viewed_at": _format_datetime(now_iso),
    }

    return {
        "lesson": lesson_item,
        "course_progress": updated_course_progress,
    }
