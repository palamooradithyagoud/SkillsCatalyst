"""
backend/routers/courses.py
Student-Facing Course Router (Phase 4 + Phase 5 + Phase 6).
Provides read-only access to published courses, modules, lessons, and content.
Phase 6 adds server-authoritative quiz attempts, scoring, and module completion.

Security contract:
  - Quiz GET endpoints NEVER return is_correct or correct answers.
  - Scoring, pass/fail, and attempt_number are computed server-side only.
  - User identity is always derived from the authenticated Supabase JWT.
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
from backend.models.quiz_attempt import (
    StudentQuizResponse,
    QuizSubmissionPayload,
    QuizAttemptResult,
    QuizAttemptHistoryResponse,
    StudentModuleProgressResponse,
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
from backend.services.quiz_attempt_service import (
    get_student_quiz,
    submit_quiz_attempt,
    get_quiz_attempt_history,
    get_student_module_progress,
)
from backend.models.certificate import (
    CertificateResponse,
    CertificateEligibilityResponse,
)
from backend.services.certificate_service import (
    check_course_completion_and_eligibility,
    issue_course_certificate,
    get_student_certificate_by_course,
)

router = APIRouter(prefix="/api/courses", tags=["courses"])


# ── Phase 4: Course Listing & Detail ─────────────────────────────────────────

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


# ── Phase 5: Student Progress & Resume ───────────────────────────────────────

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


# ── Phase 6: Quiz Attempts, Scoring, and Module Completion ───────────────────

@router.get(
    "/{course_id_or_slug}/modules/{module_id}/quiz",
    status_code=status.HTTP_200_OK,
    response_model=StudentQuizResponse,
)
def get_module_quiz(
    course_id_or_slug: str,
    module_id: str,
    user_id: str = Depends(get_current_user_id),
) -> StudentQuizResponse:
    """
    Returns the quiz for the specified module.
    NEVER returns is_correct or any answer key.
    Requires authenticated student. Course must be PUBLISHED.
    """
    res = get_student_quiz(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
        module_id=module_id,
    )
    return StudentQuizResponse(**res)


@router.post(
    "/{course_id_or_slug}/modules/{module_id}/quiz/attempts",
    status_code=status.HTTP_200_OK,
    response_model=QuizAttemptResult,
)
def submit_module_quiz(
    course_id_or_slug: str,
    module_id: str,
    payload: QuizSubmissionPayload,
    user_id: str = Depends(get_current_user_id),
) -> QuizAttemptResult:
    """
    Submits a quiz attempt for server-authoritative scoring.

    Security contract:
      - User identity from JWT only; never from request body.
      - Score, passed, correct_count are calculated server-side.
      - Lesson prerequisites are enforced server-side.
      - Each answer's question/option hierarchy is validated.
      - Module completion is evaluated and persisted atomically.
    """
    answers = [
        {"question_id": a.question_id, "selected_option_id": a.selected_option_id}
        for a in payload.answers
    ]
    res = submit_quiz_attempt(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
        module_id=module_id,
        answers=answers,
    )
    return QuizAttemptResult(**res)


@router.get(
    "/{course_id_or_slug}/modules/{module_id}/quiz/attempts",
    status_code=status.HTTP_200_OK,
    response_model=QuizAttemptHistoryResponse,
)
def get_module_quiz_attempts(
    course_id_or_slug: str,
    module_id: str,
    user_id: str = Depends(get_current_user_id),
) -> QuizAttemptHistoryResponse:
    """
    Returns the authenticated student's quiz attempt history for this module.
    Only own attempts are returned. No answer keys included.
    """
    res = get_quiz_attempt_history(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
        module_id=module_id,
    )
    return QuizAttemptHistoryResponse(**res)


@router.get(
    "/{course_id_or_slug}/modules/{module_id}/progress",
    status_code=status.HTTP_200_OK,
    response_model=StudentModuleProgressResponse,
)
def get_module_progress(
    course_id_or_slug: str,
    module_id: str,
    user_id: str = Depends(get_current_user_id),
) -> StudentModuleProgressResponse:
    """
    Returns the authoritative module completion state for the authenticated student.
    Module is complete only when ALL required lessons are complete AND quiz is passed.
    """
    res = get_student_module_progress(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
        module_id=module_id,
    )
    return StudentModuleProgressResponse(**res)


# ── Phase 7: Course Certificates & Completion ────────────────────────────────

@router.get(
    "/{course_id_or_slug}/certificate/eligibility",
    status_code=status.HTTP_200_OK,
    response_model=CertificateEligibilityResponse,
)
def get_course_certificate_eligibility(
    course_id_or_slug: str,
    user_id: str = Depends(get_current_user_id),
) -> CertificateEligibilityResponse:
    """
    Evaluates backend-authoritative course completion, quiz passes,
    certificate enablement, and identity lock status for the authenticated student.
    """
    res = check_course_completion_and_eligibility(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
    )
    return CertificateEligibilityResponse(**res)


@router.post(
    "/{course_id_or_slug}/certificate/issue",
    status_code=status.HTTP_200_OK,
    response_model=CertificateResponse,
)
def issue_course_certificate_endpoint(
    course_id_or_slug: str,
    user_id: str = Depends(get_current_user_id),
) -> CertificateResponse:
    """
    Issues an official, immutable course certificate for the student.
    Server validates full course completion, module quizzes, certificate config,
    and authoritative identity. Idempotent and race condition safe.
    """
    res = issue_course_certificate(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
    )
    return CertificateResponse(**res)


@router.get(
    "/{course_id_or_slug}/certificate",
    status_code=status.HTTP_200_OK,
    response_model=CertificateResponse,
)
def get_course_certificate_endpoint(
    course_id_or_slug: str,
    user_id: str = Depends(get_current_user_id),
) -> CertificateResponse:
    """
    Retrieves the issued certificate for the authenticated student for this course.
    If no certificate has been issued, returns 404.
    """
    res = get_student_certificate_by_course(
        user_id=user_id,
        course_id_or_slug=course_id_or_slug,
    )
    return CertificateResponse(**res)


