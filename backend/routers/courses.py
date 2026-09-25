"""
backend/routers/courses.py
Student-Facing Course Router (Phase 4).
Provides read-only access to published courses, modules, lessons, and content.
Enforces content visibility rules: draft/archived courses/lessons return 404.
Omits administrative fields, audit logs, and quiz answer keys.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from backend.services.auth_service import get_current_user_id
from backend.models.student_course import (
    StudentCourseListResponse,
    StudentCourseDetailResponse,
    StudentLessonDetailResponse,
)
from backend.models.student_progress import (
    StudentCourseProgressResponse,
    StudentLessonProgressPayload,
    StudentProgressMutationResponse,
)
from backend.services.student_course_service import (
    get_published_courses,
    get_published_course_detail,
    get_published_lesson_content,
)
from backend.services.student_progress_service import (
    get_student_course_progress,
    record_student_lesson_progress,
)

router = APIRouter(prefix="/api/courses", tags=["courses"])



@router.get("", status_code=status.HTTP_200_OK, response_model=StudentCourseListResponse)
def list_student_courses(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner, intermediate, advanced)"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
) -> StudentCourseListResponse:
    """
    Returns published courses for student discovery.
    Draft, in-review, and archived courses are strictly omitted.
    """
    res = get_published_courses(
        category=category,
        difficulty=difficulty,
        search=search,
        page=page,
        page_size=page_size,
    )
    return StudentCourseListResponse(**res)


@router.get("/{course_id_or_slug}", status_code=status.HTTP_200_OK, response_model=StudentCourseDetailResponse)
def get_student_course(
    course_id_or_slug: str,
) -> StudentCourseDetailResponse:
    """
    Returns syllabus structure of a published course.
    If the course is not published or does not exist, returns 404.
    """
    res = get_published_course_detail(course_id_or_slug=course_id_or_slug)
    return StudentCourseDetailResponse(**res)


@router.get(
    "/{course_id_or_slug}/lessons/{lesson_id}",
    status_code=status.HTTP_200_OK,
    response_model=StudentLessonDetailResponse,
)
def get_student_lesson(
    course_id_or_slug: str,
    lesson_id: str,
) -> StudentLessonDetailResponse:
    """
    Retrieves lesson content blocks and boundary-aware navigation for a published course.
    """
    res = get_published_lesson_content(
        course_id_or_slug=course_id_or_slug,
        lesson_id=lesson_id,
    )
    return StudentLessonDetailResponse(**res)


# ── Student Progress & Resume (Phase 5) ──────────────────────────────────────

@router.get(
    "/{course_id_or_slug}/progress",
    status_code=status.HTTP_200_OK,
    response_model=StudentCourseProgressResponse,
)
def get_course_progress(
    course_id_or_slug: str,
    user_id: str = Depends(get_current_user_id),
) -> StudentCourseProgressResponse:
    """
    Retrieves authoritative progress and resume position for the authenticated student.
    Unauthenticated guest requests strictly receive 401 Unauthorized.
    """
    res = get_student_course_progress(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
    )
    return StudentCourseProgressResponse(**res)


@router.post(
    "/{course_id_or_slug}/lessons/{lesson_id}/progress",
    status_code=status.HTTP_200_OK,
    response_model=StudentProgressMutationResponse,
)
def record_lesson_progress(
    course_id_or_slug: str,
    lesson_id: str,
    payload: Optional[StudentLessonProgressPayload] = None,
    user_id: str = Depends(get_current_user_id),
) -> StudentProgressMutationResponse:
    """
    Records lesson activity or completion for the authenticated student.
    - User identity is strictly derived from the verified Supabase JWT (never trusted from body).
    - Hierarchy is verified: lesson must belong to course, course must be PUBLISHED.
    - Idempotent: repeated completions do not overwrite original completion timestamp.
    """
    completed = payload.completed if payload else None
    res = record_student_lesson_progress(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
        lesson_id=lesson_id,
        completed=completed,
    )
    return StudentProgressMutationResponse(**res)

