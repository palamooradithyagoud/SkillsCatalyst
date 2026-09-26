"""
backend/services/certificate_service.py
Phase 7 — Server-Authoritative Certificate Issuance, Template Management,
Identity Lock Enforcement, Immutable Snapshots, and Public Verification.

Security & Invariant Rules:
  1. User identity is ALWAYS derived from verified JWT.
  2. Issuance is 100% server-authoritative; client scores/names/flags ignored.
  3. All required published lessons + module quizzes + module completions verified.
  4. Permanent identity lock: name + college permanently locked after first certificate.
  5. Immutable snapshot: certificates snapshot student name, college, course title,
     score, template design theme, and background asset at issuance.
  6. Idempotent & race-safe: concurrent issuance requests resolve to exactly one certificate.
  7. Public verification: exposes safe fields only via verification_id.
"""

import os
import uuid
import secrets
import string
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, UploadFile

from backend.services.supabase_service import get_supabase
from backend.models.course import CourseStatus
from backend.models.certificate import (
    CertificateTemplateCreate,
    CertificateTemplateUpdate,
)

logger = logging.getLogger("skillscatalyst.certificates")

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://www.skillscatalyst.in").strip().rstrip("/")


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


def _generate_certificate_number() -> str:
    """Generates globally unique certificate number: SC-CERT-2026-XXXXXXXX."""
    random_chars = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return f"SC-CERT-2026-{random_chars}"


def _generate_verification_id() -> str:
    """Generates cryptographically random url-safe verification ID: sc-v-..."""
    token = secrets.token_urlsafe(16).replace("-", "").replace("_", "")[:16]
    return f"sc-v-{token}"


def _resolve_published_course(sb, course_id_or_slug: str) -> Dict[str, Any]:
    """Fetches and verifies that the course exists and is PUBLISHED."""
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


# ── Certificate Template Management ──────────────────────────────────────────

def list_certificate_templates(include_inactive: bool = False) -> List[Dict[str, Any]]:
    """Lists certificate templates. By default lists active templates."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    query = sb.from_("certificate_templates").select("*")
    if not include_inactive:
        query = query.eq("is_active", True)
    res = query.order("created_at", desc=False).execute()

    items = res.data or []
    # Place official SkillsCatalyst template at the top
    items = sorted(items, key=lambda t: 0 if t.get("design_theme") == "skillscatalyst_official" else 1)
    return [
        {
            "id": str(t["id"]),
            "name": t["name"],
            "description": t.get("description"),
            "background_media_url": t["background_media_url"],
            "design_theme": t.get("design_theme", "skillscatalyst_official"),
            "is_active": bool(t.get("is_active", True)),
            "created_at": _format_datetime(t.get("created_at")),
            "updated_at": _format_datetime(t.get("updated_at")),
        }
        for t in items
    ]


def get_certificate_template(template_id: str) -> Dict[str, Any]:
    """Fetches a certificate template by UUID."""
    if not _is_uuid(template_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate template not found.")

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    res = sb.from_("certificate_templates").select("*").eq("id", template_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate template not found.")

    t = res.data[0]
    return {
        "id": str(t["id"]),
        "name": t["name"],
        "description": t.get("description"),
        "background_media_url": t["background_media_url"],
        "design_theme": t.get("design_theme", "skillscatalyst_official"),
        "is_active": bool(t.get("is_active", True)),
        "created_at": _format_datetime(t.get("created_at")),
        "updated_at": _format_datetime(t.get("updated_at")),
    }


def create_certificate_template(data: CertificateTemplateCreate, user_id: str) -> Dict[str, Any]:
    """Creates a new certificate template record."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    # Name uniqueness check
    existing = sb.from_("certificate_templates").select("id").eq("name", data.name.strip()).execute()
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Template with name '{data.name}' already exists.")

    payload = {
        "name": data.name.strip(),
        "description": data.description.strip() if data.description else None,
        "background_media_url": data.background_media_url.strip(),
        "design_theme": data.design_theme.strip().lower(),
        "is_active": data.is_active,
    }
    res = sb.from_("certificate_templates").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create certificate template.")

    created = res.data[0]
    logger.info(f"Certificate template created: id={created['id']} name='{created['name']}' by={user_id}")
    return get_certificate_template(str(created["id"]))


def update_certificate_template(template_id: str, data: CertificateTemplateUpdate, user_id: str) -> Dict[str, Any]:
    """Updates an existing certificate template."""
    current = get_certificate_template(template_id)
    sb = get_supabase()

    update_payload = {}
    if data.name is not None and data.name.strip() != current["name"]:
        # Check name conflict
        existing = sb.from_("certificate_templates").select("id").eq("name", data.name.strip()).neq("id", template_id).execute()
        if existing.data:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Template with name '{data.name}' already exists.")
        update_payload["name"] = data.name.strip()

    if data.description is not None:
        update_payload["description"] = data.description.strip() if data.description else None

    if data.background_media_url is not None:
        update_payload["background_media_url"] = data.background_media_url.strip()

    if data.design_theme is not None:
        update_payload["design_theme"] = data.design_theme.strip().lower()

    if data.is_active is not None:
        update_payload["is_active"] = data.is_active

    if update_payload:
        sb.from_("certificate_templates").update(update_payload).eq("id", template_id).execute()

    logger.info(f"Certificate template updated: id={template_id} by={user_id}")
    return get_certificate_template(template_id)


def delete_certificate_template(template_id: str, user_id: str) -> Dict[str, Any]:
    """
    Safely archives or deletes a template.
    If template is referenced by issued certificates or active course configs,
    it is safely deactivated rather than destroyed to prevent asset breakage.
    """
    get_certificate_template(template_id)
    sb = get_supabase()

    # Check if used in course configs
    cfg_res = sb.from_("course_certificate_configs").select("course_id").eq("certificate_template_id", template_id).execute()
    # Check if snapshot exists in issued certificates
    cert_res = sb.from_("certificates").select("id").eq("certificate_template_id_snapshot", template_id).execute()

    if (cfg_res.data and len(cfg_res.data) > 0) or (cert_res.data and len(cert_res.data) > 0):
        # Soft-deactivate to protect historical consistency
        sb.from_("certificate_templates").update({"is_active": False}).eq("id", template_id).execute()
        return {
            "success": True,
            "archived": True,
            "message": "Template is referenced by existing courses or issued certificates. It has been deactivated.",
        }

    sb.from_("certificate_templates").delete().eq("id", template_id).execute()
    return {"success": True, "archived": False, "message": "Certificate template deleted permanently."}


async def upload_certificate_background(file: UploadFile, user_id: str) -> str:
    """
    Validates and uploads a certificate background image to Supabase Storage.
    Validates MIME type, extension, size, and magic bytes.
    Allowed formats: PNG, JPEG, WEBP.
    """
    ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
    MAX_SIZE = 10 * 1024 * 1024  # 10 MB

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file missing filename.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File extension '{ext}' not allowed. Use PNG, JPEG, or WEBP.")

    mime = (file.content_type or "").lower()
    if mime not in ALLOWED_MIMES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"MIME type '{mime}' not supported. Allowed: PNG, JPEG, WEBP.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File size exceeds 10MB limit.")

    # Magic bytes verification
    is_valid_magic = False
    if ext == ".png" and contents.startswith(b"\x89PNG\r\n\x1a\n"):
        is_valid_magic = True
    elif ext in (".jpg", ".jpeg") and contents.startswith(b"\xff\xd8\xff"):
        is_valid_magic = True
    elif ext == ".webp" and contents[:4] == b"RIFF" and contents[8:12] == b"WEBP":
        is_valid_magic = True

    if not is_valid_magic:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="File contents do not match expected image signature.")

    sb = get_supabase()
    file_id = str(uuid.uuid4())
    storage_path = f"backgrounds/{file_id}{ext}"

    try:
        sb.storage.from_("certificate-templates").upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": mime, "cache-control": "31536000"}
        )
    except Exception as e:
        logger.error(f"Failed to upload certificate background: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to store background asset.")

    public_url = sb.storage.from_("certificate-templates").get_public_url(storage_path)
    logger.info(f"Certificate background uploaded: path={storage_path} by={user_id}")
    return public_url


# ── Course Certificate Configuration ─────────────────────────────────────────

def get_course_certificate_config(course_id: str) -> Dict[str, Any]:
    """Retrieves certificate configuration for a course."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    res = (
        sb.from_("course_certificate_configs")
        .select("course_id, enabled, certificate_template_id, created_at, updated_at")
        .eq("course_id", course_id)
        .execute()
    )
    if not res.data:
        # Default unconfigured state
        return {
            "course_id": course_id,
            "enabled": False,
            "certificate_template_id": None,
            "template_name": None,
            "design_theme": None,
            "background_media_url": None,
            "created_at": None,
            "updated_at": None,
        }

    cfg = res.data[0]
    template_info = None
    if cfg.get("certificate_template_id"):
        try:
            template_info = get_certificate_template(str(cfg["certificate_template_id"]))
        except HTTPException:
            pass

    return {
        "course_id": str(cfg["course_id"]),
        "enabled": bool(cfg.get("enabled", False)),
        "certificate_template_id": str(cfg["certificate_template_id"]) if cfg.get("certificate_template_id") else None,
        "template_name": template_info["name"] if template_info else None,
        "design_theme": template_info["design_theme"] if template_info else None,
        "background_media_url": template_info["background_media_url"] if template_info else None,
        "created_at": _format_datetime(cfg.get("created_at")),
        "updated_at": _format_datetime(cfg.get("updated_at")),
    }


def set_course_certificate_config(
    course_id: str,
    enabled: bool,
    template_id: Optional[str],
    user_id: str,
) -> Dict[str, Any]:
    """Sets or updates certificate configuration for a course."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    # Verify course exists
    c_res = sb.from_("courses").select("id, title").eq("id", course_id).execute()
    if not c_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if enabled:
        if not template_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A certificate template must be selected when certificates are enabled.")
        template = get_certificate_template(template_id)
        if not template.get("is_active"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected certificate template is inactive.")

    payload = {
        "course_id": course_id,
        "enabled": enabled,
        "certificate_template_id": template_id if enabled else None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    sb.from_("course_certificate_configs").upsert(payload, on_conflict="course_id").execute()
    logger.info(f"Course certificate config updated: course_id={course_id} enabled={enabled} template={template_id} by={user_id}")
    return get_course_certificate_config(course_id)


def validate_course_certificate_readiness(course_id: str) -> None:
    """
    Validates certificate configuration before course publication.
    If certificates are enabled, a valid active template must be present.
    """
    config = get_course_certificate_config(course_id)
    if config["enabled"]:
        template_id = config.get("certificate_template_id")
        if not template_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course publication validation failed: Certificate is enabled for this course, but no valid active certificate template is configured.",
            )
        try:
            template = get_certificate_template(template_id)
            if not template.get("is_active"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Course publication validation failed: Configured certificate template is inactive.",
                )
        except HTTPException:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course publication validation failed: Configured certificate template does not exist.",
            )


# ── Student Identity & Identity Lock Architecture ────────────────────────────

def is_user_identity_locked(user_id: str) -> bool:
    """
    Authoritative Server-Side Rule:
    IF ANY issued certificate exists for this user across any course,
    THEN user's certificate identity (name + college) is permanently locked.
    """
    sb = get_supabase()
    if not sb:
        return False
    res = (
        sb.from_("certificates")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "issued")
        .limit(1)
        .execute()
    )
    return bool(res.data and len(res.data) > 0)


def get_authoritative_user_identity(user_id: str) -> Dict[str, Any]:
    """Retrieves full_name and college from authoritative profile records."""
    sb = get_supabase()
    full_name = ""
    college = ""

    if sb:
        # Check profiles table
        p_res = sb.from_("profiles").select("full_name, college").eq("id", user_id).execute()
        if p_res.data and len(p_res.data) > 0:
            row = p_res.data[0]
            full_name = (row.get("full_name") or "").strip()
            college = (row.get("college") or "").strip()

        # Check user_academic_profile table as secondary authoritative source
        acad_res = sb.from_("user_academic_profile").select("full_name, college").eq("user_id", user_id).execute()
        if acad_res.data and len(acad_res.data) > 0:
            arow = acad_res.data[0]
            if not full_name:
                full_name = (arow.get("full_name") or "").strip()
            if not college:
                college = (arow.get("college") or "").strip()

        # Fallback to education table if college not yet set
        if not college:
            edu_res = sb.from_("education").select("college").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
            if edu_res.data and len(edu_res.data) > 0:
                college = (edu_res.data[0].get("college") or "").strip()

    locked = is_user_identity_locked(user_id)
    return {
        "user_id": user_id,
        "full_name": full_name,
        "college": college,
        "is_identity_locked": locked,
    }


def update_student_certificate_identity(user_id: str, full_name: Optional[str] = "", college: Optional[str] = "") -> Dict[str, Any]:
    """
    Updates student's authoritative full name and college before their first certificate.
    College is optional. If any certificate has already been issued, this is strictly rejected with HTTP 403.
    """
    clean_name = (full_name or "").strip()
    clean_college = (college or "").strip()

    if not clean_name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Full Name cannot be empty.")

    # 1. Authoritative check: Is identity locked?
    if is_user_identity_locked(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your name and college are locked because a SkillsCatalyst certificate has already been issued.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    # 2. Persist to profiles
    sb.from_("profiles").upsert({
        "id": user_id,
        "full_name": clean_name,
        "college": clean_college,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="id").execute()

    # 3. Synchronize with user_academic_profile for platform compatibility
    sb.from_("user_academic_profile").upsert({
        "user_id": user_id,
        "full_name": clean_name,
        "college": clean_college,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="user_id").execute()

    logger.info(f"Student identity updated: user_id={user_id} name='{clean_name}' college='{clean_college}'")
    return {
        "user_id": user_id,
        "full_name": clean_name,
        "college": clean_college,
        "is_identity_locked": False,
    }


# ── Course Completion & Eligibility Evaluation ───────────────────────────────

def check_course_completion_and_eligibility(user_id: str, course_id_or_slug: str) -> Dict[str, Any]:
    """
    Authoritative backend check determining if student has completed all requirements
    and is eligible for certificate issuance.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])
    course_title = course["title"]

    # 1. Check certificate configuration for course
    cert_cfg = get_course_certificate_config(course_id)
    certificate_enabled = cert_cfg["enabled"]

    # 2. Check if certificate is already issued
    cert_res = (
        sb.from_("certificates")
        .select("id, certificate_number")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    certificate_already_issued = bool(cert_res.data and len(cert_res.data) > 0)
    existing_cert_id = str(cert_res.data[0]["id"]) if certificate_already_issued else None
    existing_cert_num = str(cert_res.data[0]["certificate_number"]) if certificate_already_issued else None

    # 3. Fetch all course modules
    m_res = (
        sb.from_("course_modules")
        .select("id, title, position")
        .eq("course_id", course_id)
        .order("position", desc=False)
        .execute()
    )
    modules = m_res.data or []
    module_ids = [str(m["id"]) for m in modules]

    if not module_ids:
        # Empty course cannot be completed
        identity = get_authoritative_user_identity(user_id)
        return {
            "course_id": course_id,
            "course_title": course_title,
            "certificate_enabled": certificate_enabled,
            "all_lessons_completed": False,
            "all_quizzes_passed": False,
            "all_modules_completed": False,
            "course_completed": False,
            "course_score": None,
            "can_issue_certificate": False,
            "certificate_already_issued": certificate_already_issued,
            "existing_certificate_id": existing_cert_id,
            "existing_certificate_number": existing_cert_num,
            "student_full_name": identity["full_name"],
            "student_college": identity["college"],
            "is_identity_locked": identity["is_identity_locked"],
            "reason_ineligible": "Course has no modules.",
        }

    # 4. Check all lessons completion (Phase 5)
    all_lesson_ids = []
    for mid in module_ids:
        l_res = sb.from_("course_lessons").select("id").eq("module_id", mid).execute()
        for row in (l_res.data or []):
            all_lesson_ids.append(str(row["id"]))

    lp_res = (
        sb.from_("student_lesson_progress")
        .select("lesson_id")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .eq("completed", True)
        .execute()
    )
    completed_lesson_ids = {str(r["lesson_id"]) for r in (lp_res.data or [])}
    all_lessons_completed = len(all_lesson_ids) > 0 and all(lid in completed_lesson_ids for lid in all_lesson_ids)

    # 5. Check all module quizzes passed & module progress (Phase 6)
    quiz_scores: List[int] = []
    all_quizzes_passed = True
    all_modules_completed = True

    for mid in module_ids:
        # Check if module has a published quiz
        q_res = sb.from_("course_quizzes").select("id, status").eq("module_id", mid).execute()
        quizzes = q_res.data or []
        has_quiz = len(quizzes) > 0 and quizzes[0].get("status") == "PUBLISHED"

        mp_res = (
            sb.from_("student_module_progress")
            .select("lessons_complete, quiz_passed, best_score, completed")
            .eq("user_id", user_id)
            .eq("module_id", mid)
            .limit(1)
            .execute()
        )
        mp_row = mp_res.data[0] if (mp_res.data and len(mp_res.data) > 0) else None

        if has_quiz:
            if not mp_row or not mp_row.get("quiz_passed"):
                all_quizzes_passed = False
            if mp_row and mp_row.get("best_score") is not None:
                quiz_scores.append(int(mp_row["best_score"]))
            else:
                quiz_scores.append(0)

        # Check module completed
        if not mp_row or not mp_row.get("completed"):
            # Check if lessons complete in module
            mod_lessons = [str(r["id"]) for r in (sb.from_("course_lessons").select("id").eq("module_id", mid).execute().data or [])]
            mod_lessons_complete = all(lid in completed_lesson_ids for lid in mod_lessons)
            if has_quiz:
                if not (mod_lessons_complete and mp_row and mp_row.get("quiz_passed")):
                    all_modules_completed = False
            else:
                if not mod_lessons_complete:
                    all_modules_completed = False

    course_completed = all_lessons_completed and all_quizzes_passed and all_modules_completed

    # Compute deterministic course score:
    # Average of student's module quiz scores, or 100 if no quizzes
    if quiz_scores:
        course_score = round(sum(quiz_scores) / len(quiz_scores))
    else:
        course_score = 100

    identity = get_authoritative_user_identity(user_id)
    has_name = bool(identity["full_name"].strip())
    has_college = bool(identity["college"].strip())

    can_issue = (
        course_completed
        and certificate_enabled
        and not certificate_already_issued
        and has_name
        and has_college
    )

    reason = None
    if not certificate_enabled:
        reason = "This course does not issue a certificate."
    elif certificate_already_issued:
        reason = "Your certificate has already been issued."
    elif not course_completed:
        reason = "You have not completed all required course requirements yet."
    elif not has_name or not has_college:
        reason = "Please confirm your full legal name and college name before issuing your certificate."

    return {
        "course_id": course_id,
        "course_title": course_title,
        "certificate_enabled": certificate_enabled,
        "all_lessons_completed": all_lessons_completed,
        "all_quizzes_passed": all_quizzes_passed,
        "all_modules_completed": all_modules_completed,
        "course_completed": course_completed,
        "course_score": course_score if course_completed else None,
        "can_issue_certificate": can_issue,
        "certificate_already_issued": certificate_already_issued,
        "existing_certificate_id": existing_cert_id,
        "existing_certificate_number": existing_cert_num,
        "student_full_name": identity["full_name"],
        "student_college": identity["college"],
        "is_identity_locked": identity["is_identity_locked"],
        "reason_ineligible": reason,
    }


# ── Server-Authoritative Certificate Issuance ────────────────────────────────

def issue_course_certificate(user_id: str, course_id_or_slug: str) -> Dict[str, Any]:
    """
    Issues an official, immutable course certificate.
    Validates completion, course status, certificate configuration, student identity.
    Enforces idempotency and race condition safety.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])
    course_title = course["title"]

    # 1. Idempotency Check: Does certificate already exist?
    existing_res = (
        sb.from_("certificates")
        .select("*")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    if existing_res.data and len(existing_res.data) > 0:
        logger.info(f"Certificate already issued: user={user_id} course={course_id}. Returning existing certificate.")
        return _format_certificate_response(existing_res.data[0])

    # 2. Validate course certificate configuration
    cert_cfg = get_course_certificate_config(course_id)
    if not cert_cfg["enabled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This course does not issue a certificate.",
        )

    template_id = cert_cfg.get("certificate_template_id")
    if not template_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This course does not have a valid certificate template configured.",
        )

    template = get_certificate_template(template_id)
    if not template.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Configured certificate template is inactive.",
        )

    # 3. Server-Authoritative Course Completion Validation
    eligibility = check_course_completion_and_eligibility(user_id, course_id)
    if not eligibility["course_completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have not completed all required course requirements yet.",
        )

    # 4. Authoritative Student Identity
    identity = get_authoritative_user_identity(user_id)
    student_name = (identity.get("full_name") or "").strip()
    college_name = (identity.get("college") or "").strip()

    if not student_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide your full legal name before your certificate can be issued.",
        )

    score = eligibility["course_score"] or 100
    certificate_number = _generate_certificate_number()
    verification_id = _generate_verification_id()
    now_iso = datetime.now(timezone.utc).isoformat()

    # 5. Atomic Immutable Certificate Snapshot Creation
    cert_payload = {
        "certificate_number": certificate_number,
        "verification_id": verification_id,
        "user_id": user_id,
        "course_id": course_id,
        "student_name_snapshot": student_name,
        "college_name_snapshot": college_name,
        "course_title_snapshot": course_title,
        "score_snapshot": score,
        "certificate_template_id_snapshot": template["id"],
        "certificate_background_snapshot": template["background_media_url"],
        "design_theme_snapshot": template.get("design_theme", "skillscatalyst_official"),
        "issued_at": now_iso,
        "status": "issued",
    }

    try:
        insert_res = sb.from_("certificates").insert(cert_payload).execute()
        if not insert_res.data:
            raise Exception("No data returned from certificate insert.")
        created_cert = insert_res.data[0]
        logger.info(
            f"Certificate issued successfully: cert_num={certificate_number} "
            f"user={user_id} course={course_id} score={score}%"
        )
        return _format_certificate_response(created_cert)

    except Exception as e:
        # Race condition safety: if another concurrent request created the record,
        # fetch and return the created record rather than erroring out
        logger.warning(f"Certificate creation conflict or race detected: {e}. Checking existing record.")
        check_again = (
            sb.from_("certificates")
            .select("*")
            .eq("user_id", user_id)
            .eq("course_id", course_id)
            .execute()
        )
        if check_again.data and len(check_again.data) > 0:
            return _format_certificate_response(check_again.data[0])
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to issue certificate.")


def _format_certificate_response(cert_row: Dict[str, Any]) -> Dict[str, Any]:
    verification_id = cert_row["verification_id"]
    verification_url = f"{FRONTEND_URL}/verify/certificate/{verification_id}"
    return {
        "id": str(cert_row["id"]),
        "certificate_number": cert_row["certificate_number"],
        "verification_id": verification_id,
        "course_id": str(cert_row["course_id"]),
        "course_title": cert_row["course_title_snapshot"],
        "student_name": cert_row["student_name_snapshot"],
        "college_name": cert_row["college_name_snapshot"],
        "score": cert_row["score_snapshot"],
        "issued_at": _format_datetime(cert_row["issued_at"]),
        "status": cert_row.get("status", "issued"),
        "design_theme": cert_row.get("design_theme_snapshot", "skillscatalyst_official"),
        "background_media_url": cert_row.get("certificate_background_snapshot", ""),
        "verification_url": verification_url,
        "created_at": _format_datetime(cert_row.get("created_at")),
    }


# ── Student Certificate Queries ──────────────────────────────────────────────

def get_student_certificates(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves all certificates earned by the authenticated student."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    res = (
        sb.from_("certificates")
        .select("*")
        .eq("user_id", user_id)
        .order("issued_at", desc=True)
        .execute()
    )
    items = res.data or []
    return [_format_certificate_response(c) for c in items]


def get_student_certificate_by_course(user_id: str, course_id_or_slug: str) -> Dict[str, Any]:
    """Retrieves the authenticated student's certificate for a specific course."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    course = _resolve_published_course(sb, course_id_or_slug)
    course_id = str(course["id"])

    res = (
        sb.from_("certificates")
        .select("*")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found for this course.")

    return _format_certificate_response(res.data[0])


def get_student_certificate_by_id(user_id: str, certificate_id: str) -> Dict[str, Any]:
    """Retrieves a specific certificate owned by the authenticated student."""
    if not _is_uuid(certificate_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found.")

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    res = (
        sb.from_("certificates")
        .select("*")
        .eq("id", certificate_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found.")

    return _format_certificate_response(res.data[0])


# ── Public Certificate Verification ──────────────────────────────────────────

def verify_certificate_public(verification_id: str) -> Dict[str, Any]:
    """
    Publicly verifies an issued certificate without authentication.
    Returns safe public verification payload.
    Never exposes auth user IDs, email, answers, or private profile info.
    """
    clean_vid = (verification_id or "").strip()
    if not clean_vid:
        return {
            "is_valid": False,
            "message": "This certificate could not be verified.",
        }

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Verification service unavailable")

    # Use database function verify_certificate_public or direct query on verification_id
    try:
        rpc_res = sb.rpc("verify_certificate_public", {"p_verification_id": clean_vid}).execute()
        if rpc_res.data and len(rpc_res.data) > 0:
            row = rpc_res.data[0]
            if row.get("is_valid"):
                return {
                    "is_valid": True,
                    "message": "Valid SkillsCatalyst Certificate of Course Completion",
                    "certificate_number": row["certificate_number"],
                    "verification_id": row["verification_id"],
                    "student_name": row["student_name"],
                    "college_name": row["college_name"],
                    "course_title": row["course_title"],
                    "score": row["score"],
                    "issued_at": _format_datetime(row["issued_at"]),
                    "status": row.get("status", "issued"),
                    "design_theme": row.get("design_theme", "skillscatalyst_official"),
                    "background_media_url": row.get("certificate_background", ""),
                    "verification_url": f"{FRONTEND_URL}/verify/certificate/{row['verification_id']}",
                }
    except Exception as e:
        logger.debug(f"RPC verify notice: {e}, falling back to direct service query")

    # Fallback direct service query with strict safe field projection
    res = (
        sb.from_("certificates")
        .select("certificate_number, verification_id, student_name_snapshot, college_name_snapshot, course_title_snapshot, score_snapshot, issued_at, status, design_theme_snapshot, certificate_background_snapshot")
        .eq("verification_id", clean_vid)
        .eq("status", "issued")
        .limit(1)
        .execute()
    )

    if not res.data:
        return {
            "is_valid": False,
            "message": "This certificate could not be verified.",
        }

    c = res.data[0]
    return {
        "is_valid": True,
        "message": "Valid SkillsCatalyst Certificate of Course Completion",
        "certificate_number": c["certificate_number"],
        "verification_id": c["verification_id"],
        "student_name": c["student_name_snapshot"],
        "college_name": c["college_name_snapshot"],
        "course_title": c["course_title_snapshot"],
        "score": c["score_snapshot"],
        "issued_at": _format_datetime(c["issued_at"]),
        "status": c.get("status", "issued"),
        "design_theme": c.get("design_theme_snapshot", "skillscatalyst_official"),
        "background_media_url": c.get("certificate_background_snapshot", ""),
        "verification_url": f"{FRONTEND_URL}/verify/certificate/{c['verification_id']}",
    }
