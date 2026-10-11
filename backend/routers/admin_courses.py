"""
backend/routers/admin_courses.py
Course Administration CMS Endpoints (DEACTIVATED).

Safely isolated from backend/routers/admin.py during Courses feature deactivation.
Preserves complete implementation and database contracts without exposing
active endpoints to production HTTP traffic.
"""

import logging
from typing import Any, Dict, List, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)

from backend.services.auth_service import require_admin
from backend.services.supabase_service import get_supabase
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
from backend.models.certificate import (
    CourseCertificateConfigUpdate,
    CourseCertificateConfigResponse,
    CertificatePreviewData,
)
from backend.services.certificate_service import (
    list_certificate_templates,
    get_certificate_template,
    get_course_certificate_config,
    set_course_certificate_config,
)

logger = logging.getLogger("skillscatalyst.admin_courses")

router = APIRouter(prefix="/api/admin", tags=["admin-courses"])


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


# ── Course Certificate Configuration ─────────────────────────────────────────

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
