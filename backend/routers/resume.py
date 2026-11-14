import logging
import uuid
import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Depends, Form, Query
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

from backend.services.resume_extractor import (
    extract_document,
    parse_and_clean_document,
    MAX_FILE_SIZE_BYTES,
)
from backend.services.resume_scoring import (
    sanitize_resume_filename,
    calculate_unified_resume_score,
)
from backend.services.ats_engine import evaluate_resume_ats
from backend.services.keyword_matcher import match_keywords
from backend.services.resume_ai_evaluator import evaluate_resume_content
from backend.services.project_evaluator import evaluate_projects
from backend.services.education_evaluator import evaluate_education_and_certifications
from backend.services.content_quality_engine import evaluate_content_quality
from backend.services.skill_evidence_engine import verify_skill_evidence
from backend.services.recruiter_engine import evaluate_recruiter_lens
from backend.services.job_matching_engine import evaluate_job_match
from backend.services.auth_service import get_current_user_id, is_valid_uuid
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_RESUME_RPM
from backend.models.subscription import FeatureKey, EntitlementDetailDTO
from backend.dependencies.subscription import require_entitlement
from backend.services.ai_mentor_quota_service import (
    get_ai_mentor_usage,
    reserve_ai_mentor_slot,
    commit_ai_mentor_reservation,
    release_ai_mentor_slot,
    QuotaStorageUnavailableError,
)
from backend.services.groq_service import (
    AIProviderError,
    AIProviderRateLimitError,
)
from backend.services.resume_history_service import (
    upload_resume_to_storage,
    delete_resume_from_storage,
    generate_signed_download_url,
    persist_resume_analysis,
    get_user_resume_history,
    get_resume_analysis_by_id,
    delete_resume_analysis,
)
from backend.services.resume_series_service import (
    create_resume_series,
    list_user_resume_series,
    get_resume_series_detail,
    update_resume_series,
    delete_resume_series,
    get_next_version_number,
    get_latest_analysis_id_for_series,
)
from backend.services.resume_comparison_service import (
    compare_resume_versions,
    compute_jd_hash,
)
from backend.services.resume_progress_service import (
    get_resume_series_progress,
)
from backend.services.resume_report_service import (
    generate_resume_pdf_report,
)
from backend.services.resume_builder_service import (
    create_builder_document,
    get_builder_document,
    list_user_builder_documents,
    update_builder_document,
    delete_builder_document,
    import_resume_from_analysis,
    save_builder_version,
    list_builder_versions,
    serialize_resume_data_to_text,
)
from backend.services.resume_ai_writer_service import (
    improve_bullet_point,
    improve_summary,
    improve_project_description,
    analyze_writing_feedback,
)
from backend.services.job_optimizer_service import (
    extract_job_description_requirements,
    analyze_resume_job_alignment,
    generate_grounded_job_suggestions,
    create_job_optimization_session,
    get_job_optimization_session,
)
from backend.services.resume_docx_service import (
    generate_resume_docx,
)
from backend.services.resume_pdf_service import (
    generate_resume_pdf,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB Strict Limit


class CreateSeriesRequest(BaseModel):
    title: str
    target_role: Optional[str] = None
    description: Optional[str] = None


class UpdateSeriesRequest(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    description: Optional[str] = None


# ── Phase 5 Request Models ───────────────────────────────────────────────────

class CreateBuilderDocRequest(BaseModel):
    title: str = "Untitled Resume"
    selected_template: str = "sb2nov"
    structured_resume_data: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = None
    resume_series_id: Optional[str] = None


class UpdateBuilderDocRequest(BaseModel):
    title: Optional[str] = None
    selected_template: Optional[str] = None
    structured_resume_data: Optional[Dict[str, Any]] = None
    target_role: Optional[str] = None
    resume_series_id: Optional[str] = None


class ImportResumeRequest(BaseModel):
    selected_template: str = "sb2nov"


class SaveVersionRequest(BaseModel):
    change_summary: Optional[str] = None
    run_ats_eval: bool = True
    job_description: Optional[str] = None


class ImproveBulletRequest(BaseModel):
    bullet: str
    action: str = "improve"
    role_context: Optional[str] = None


class ImproveSummaryRequest(BaseModel):
    summary: str
    target_role: Optional[str] = None
    experience_level: Optional[str] = None


class ImproveProjectRequest(BaseModel):
    project_name: str
    description: str
    technologies: str = ""


class WritingFeedbackRequest(BaseModel):
    bullet: str


class AnalyzeJDRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = None
    experience_level: Optional[str] = None


class CreateOptSessionRequest(BaseModel):
    job_description: str
    document_id: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    experience_level: Optional[str] = None
    resume_data: Optional[Dict[str, Any]] = None


class ExportDocxRequest(BaseModel):
    structured_resume_data: Dict[str, Any]
    template_id: str = "sb2nov"
    filename: Optional[str] = None


class ExportPdfRequest(BaseModel):
    structured_resume_data: Dict[str, Any]
    template_id: str = "sb2nov"
    filename: Optional[str] = None


def validate_magic_bytes(content: bytes, ext: str) -> bool:
    """
    Validates file magic bytes against the declared file extension.
    Scans initial 1024 bytes to tolerate leading comments/BOMs in valid files.
    """
    if not content:
        return False

    header_sample = content[:1024]

    if ext == ".pdf":
        return b"%PDF-" in header_sample
    elif ext in (".docx", ".doc"):
        # DOCX is an OpenXML ZIP container (PK\x03\x04). Legacy DOC starts with \xD0\xCF\x11\xE0
        return header_sample.startswith(b"PK\x03\x04") or header_sample.startswith(b"\xd0\xcf\x11\xe0")
    elif ext in (".txt", ".md"):
        # Text/MD files must not contain binary null bytes
        return b"\x00" not in header_sample

    return False


def get_file_mime_type(ext: str) -> str:
    ext_lower = ext.lower()
    if ext_lower == ".pdf":
        return "application/pdf"
    elif ext_lower == ".docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif ext_lower == ".doc":
        return "application/msword"
    elif ext_lower == ".txt":
        return "text/plain"
    elif ext_lower == ".md":
        return "text/markdown"
    return "application/octet-stream"


def format_resume_review_markdown(
    overall_score: Optional[float],
    ats_rep: Any,
    ai_rep: Any,
    kw_rep: Any,
    skill_ev_rep: Optional[Any] = None,
    proj_rep: Optional[Any] = None,
    edu_rep: Optional[Any] = None,
    content_qual_rep: Optional[Any] = None,
    recruiter_rep: Optional[Any] = None,
    job_match_rep: Optional[Any] = None,
) -> str:
    """Constructs rich markdown review text with 7-dimensional breakdown and recruiter feedback."""
    stage = (
        ai_rep.career_stage.capitalize()
        if (ai_rep and hasattr(ai_rep, "career_stage") and ai_rep.career_stage)
        else getattr(ats_rep, "career_stage_detected", "fresher").capitalize()
    )
    verdict = (
        ai_rep.summary_verdict
        if (ai_rep and hasattr(ai_rep, "summary_verdict") and ai_rep.summary_verdict)
        else (
            recruiter_rep.overall_qualitative_verdict
            if (recruiter_rep and hasattr(recruiter_rep, "overall_qualitative_verdict"))
            else "Comprehensive deterministic evaluation complete."
        )
    )

    review_lines = [
        "## 🧠 Overall Verdict",
        f"- Final Score: {int(overall_score) if overall_score is not None else 0}/100",
        f"- **Career Stage Evaluated:** {stage}",
        f"- {verdict}",
        "",
        "## 📊 7-Dimensional Enterprise Scoring",
        f"- ATS Compatibility (15%): {int(ats_rep.ats_compatibility_score)}/100",
        f"- Keyword Match / Coverage (15%): {int(kw_rep.keyword_match_percentage)}/100",
    ]

    if skill_ev_rep:
        review_lines.append(f"- Technical Skills Assessment (15%): {int(getattr(skill_ev_rep, 'technical_skills_score', 0))}/100")
    if proj_rep:
        review_lines.append(f"- Projects & Practical Experience (20%): {int(getattr(proj_rep, 'projects_experience_score', 0))}/100")
    if edu_rep:
        review_lines.append(f"- Education & Certifications (10%): {int(getattr(edu_rep, 'education_certifications_score', 0))}/100")
    if content_qual_rep:
        review_lines.append(f"- Content Quality & Achievements (15%): {int(getattr(content_qual_rep, 'content_quality_score', 0))}/100")
    elif ai_rep and hasattr(ai_rep, "content_quality_score") and ai_rep.content_quality_score is not None:
        review_lines.append(f"- Content Quality (15%): {int(ai_rep.content_quality_score)}/100")

    review_lines.append(f"- Structure, Formatting & Completeness (10%): {int(ats_rep.structure_score)}/100")

    if job_match_rep and getattr(job_match_rep, "job_match_status", "") == "evaluated":
        review_lines.append(f"- **Target Job Match (Independent):** {int(getattr(job_match_rep, 'job_match_score', 0))}/100")

    review_lines.append("")
    review_lines.append("## ❌ Critical Issues (Top Findings)")
    for finding in getattr(ats_rep, "findings", []):
        if finding.severity in ("critical", "warning"):
            review_lines.append(f"- **[{finding.severity.upper()}] {finding.issue}:** {finding.impact} *Fix:* {finding.recommended_fix}")
    if not any(f.severity in ("critical", "warning") for f in getattr(ats_rep, "findings", [])):
        review_lines.append("- No critical ATS formatting issues detected.")

    if recruiter_rep and getattr(recruiter_rep, "recruiter_concerns", None):
        review_lines.append("")
        review_lines.append("## 👔 Recruiter Lens")
        review_lines.append(f"- **First 10-Second Impression:** {recruiter_rep.first_10_second_impression}")
        for concern in recruiter_rep.recruiter_concerns[:3]:
            review_lines.append(f"- **Recruiter Note:** {concern}")

    if ai_rep and hasattr(ai_rep, "rewritten_bullets") and ai_rep.rewritten_bullets:
        review_lines.append("")
        review_lines.append("## 🔧 Bullet Fixes (Before → After)")
        for b in ai_rep.rewritten_bullets[:4]:
            review_lines.append(f"- **Before:** {b.original}")
            review_lines.append(f"- **After:** {b.improved}")
            if b.reason:
                review_lines.append(f"  *{b.reason}*")

    review_lines.append("")
    review_lines.append("## 📈 Missing Keywords")
    missing_kw_names = [m.name for m in getattr(kw_rep, "missing", [])[:8]]
    if missing_kw_names:
        review_lines.append(f"- Missing role keywords: {', '.join(missing_kw_names)}")
    else:
        review_lines.append("- All core target keywords detected.")

    if ai_rep and hasattr(ai_rep, "improvements") and ai_rep.improvements:
        review_lines.append("")
        review_lines.append("## 🚀 Improvement Plan")
        for imp in ai_rep.improvements[:5]:
            review_lines.append(f"- **{imp.section}:** {imp.action} ({imp.issue})")

    return "\n".join(review_lines)


# ---------------------------------------------------------------------------
# 1. Existing Extract Endpoint (Maintained for Backward Compatibility)
# ---------------------------------------------------------------------------
@router.post("/extract", dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_RESUME_RPM))])
async def extract_resume(file: UploadFile = File(...)):
    """
    Hardened resume extraction endpoint with stream size enforcement and magic bytes validation.
    Extracts plain text from PDF, DOCX, TXT, MD documents without reading oversized payloads into memory.
    """
    if not file or not file.filename:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "message": "No file uploaded."}
        )

    filename = sanitize_resume_filename(file.filename)
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": f"Unsupported file type '{ext}'. Supported formats: PDF, DOCX, TXT, MD."
            }
        )

    content_length_header = file.headers.get("content-length")
    if content_length_header and content_length_header.isdigit():
        if int(content_length_header) > MAX_FILE_SIZE_BYTES:
            logger.warning(f"Rejected oversized upload by Content-Length ({content_length_header} bytes): {filename}")
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "success": False,
                    "message": "File size exceeds the maximum allowed limit of 5MB."
                }
            )

    chunks = []
    total_bytes = 0
    chunk_size = 64 * 1024

    try:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE_BYTES:
                logger.warning(f"Aborted oversized upload stream (> 5MB): {filename}")
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "success": False,
                        "message": "File size exceeds the maximum allowed limit of 5MB."
                    }
                )
            chunks.append(chunk)

        content = b"".join(chunks)

        if not content:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "message": "Uploaded file is empty (0 bytes)."}
            )

        if not validate_magic_bytes(content, ext):
            logger.warning(f"File magic bytes mismatch for '{filename}' (extension '{ext}').")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "message": f"Invalid file content signature. File headers do not match extension '{ext}'."
                }
            )

        report = extract_document(content, filename)

        return {
            "success": True,
            "filename": report.filename,
            "text": report.extracted_text,
            "char_count": report.char_count,
            "file_type": report.file_type,
            "is_scanned": report.is_scanned,
            "detected_columns": report.detected_columns,
            "page_count": report.page_count,
            "extraction_quality": report.extraction_quality,
            "warnings": report.warnings,
            "extraction_report": report.model_dump(),
        }

    except ValueError as ve:
        logger.warning(f"Resume extraction validation error for {filename}: {str(ve)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "message": str(ve)}
        )
    except Exception as e:
        logger.error(f"Unexpected error parsing resume {filename}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": "Server error while processing resume document."}
        )


# ---------------------------------------------------------------------------
# 2. Phase 3 & 4: Upload, Cloud Storage, Unified Analysis & Persistence Pipeline
# ---------------------------------------------------------------------------
async def _execute_resume_analysis_pipeline(
    file: UploadFile,
    job_description: Optional[str],
    target_role: Optional[str],
    years_experience: Optional[str],
    company_type: Optional[str],
    current_user_id: str,
    entitlement: EntitlementDetailDTO,
    resume_series_id: Optional[str] = None,
    edited_text: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Unified multi-stage evaluation and cloud storage pipeline:
    1. Validates JWT, file size (5MB ceiling), format, and magic byte signatures.
    2. Enforces quota limits and slot reservations.
    3. Resolves series membership or creates a new logical resume series.
    4. Uploads original document to private Supabase Storage 'resumes' bucket.
    5. Performs deterministic extraction (or prioritizes user-edited text from the editor).
    6. Executes the 7-Dimensional Enterprise Evaluation and 3 Supporting Engines:
       - Dim 1: ATS Compatibility (15%)
       - Dim 2: Keyword Coverage (15%)
       - Dim 3: Technical Skills Assessment (15%)
       - Dim 4: Projects & Experience (20%)
       - Dim 5: Education & Certifications (10%)
       - Dim 6: Content Quality & Achievements (15%)
       - Dim 7: Structure & Flow (10%)
       - Supporting Engine 1: Skill Evidence Verification
       - Supporting Engine 2: Recruiter Lens Evaluation
       - Supporting Engine 3: Decoupled Job Matching
    7. Persists structured record with versioning metadata in PostgreSQL.
    8. Implements compensation rollback on storage/DB errors.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to analyze and store resumes.",
        )

    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded.",
        )

    clean_filename = sanitize_resume_filename(file.filename, default="resume.pdf")
    ext = "." + clean_filename.split(".")[-1].lower() if "." in clean_filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: PDF, DOCX, TXT, MD.",
        )

    # 1. Stream file with size ceiling
    content_length_header = file.headers.get("content-length")
    if content_length_header and content_length_header.isdigit():
        if int(content_length_header) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the 5MB limit.",
            )

    chunks = []
    total_bytes = 0
    chunk_size = 64 * 1024
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the 5MB limit.",
            )
        chunks.append(chunk)

    content = b"".join(chunks)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # 2. Magic bytes validation
    if not validate_magic_bytes(content, ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file content signature for '{clean_filename}'. File headers do not match '{ext}'.",
        )

    # 3. Quota check & slot reservation
    reservation_id: Optional[str] = None
    if entitlement.limit is not None:
        try:
            usage = get_ai_mentor_usage(current_user_id)
            if usage >= entitlement.limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "ai_mentor",
                        "limit": entitlement.limit,
                        "message": "Free tier limit reached. Please upgrade to Pro for unlimited reviews.",
                    },
                )
            res = reserve_ai_mentor_slot(current_user_id, entitlement.limit)
            if not res.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"code": "LIMIT_REACHED", "feature": "ai_mentor", "limit": entitlement.limit},
                )
            reservation_id = res.reservation_id
        except QuotaStorageUnavailableError:
            logger.error(f"Quota store unavailable for user {current_user_id}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "QUOTA_UNAVAILABLE", "message": "Usage verification temporarily unavailable."},
            )

    resume_id = str(uuid.uuid4())
    mime_type = get_file_mime_type(ext)
    storage_path: Optional[str] = None

    # 4. Logical Series & Version Resolution (Phase 4.1)
    if resume_series_id:
        # Validate series ownership
        get_resume_series_detail(user_id=current_user_id, series_id=resume_series_id)
        series_id = resume_series_id
        version_number = get_next_version_number(series_id)
        previous_analysis_id = get_latest_analysis_id_for_series(series_id)
    else:
        # Auto-create series for standalone uploads
        series_title = clean_filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
        if not series_title:
            series_title = "General Resume"
        created_series = create_resume_series(
            user_id=current_user_id,
            title=series_title,
            target_role=target_role,
        )
        series_id = created_series["id"]
        version_number = 1
        previous_analysis_id = None

    jd_hash = compute_jd_hash(job_description)

    try:
        # 5. Upload original file to private Supabase Storage
        storage_path = upload_resume_to_storage(
            user_id=current_user_id,
            resume_id=resume_id,
            filename=clean_filename,
            content=content,
            mime_type=mime_type,
        )

        # 6. Document text extraction
        try:
            report = extract_document(content, clean_filename)
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve),
            )

        # Bug 4 Fix: If edited_text is provided by frontend editor, prioritize it over raw OCR
        used_edited_text = bool(edited_text and edited_text.strip())
        eval_text = edited_text.strip() if used_edited_text else report.extracted_text

        # 7. Dimension 1 (ATS Compatibility, 15%) & Dimension 7 (Structure, 10%)
        ats_rep = evaluate_resume_ats(
            eval_text,
            years_experience=years_experience or "1-3 years",
            detected_columns=report.detected_columns,
            extraction_quality=report.extraction_quality,
        )

        # 8. Dimension 2: Keyword Matcher (15%)
        kw_rep = match_keywords(
            eval_text,
            job_description=job_description or "",
            target_role=target_role or "Fullstack Software Engineer",
        )

        # 9. Dimension 3 & Supporting Engine 1: Skill Evidence Engine (15%)
        skill_ev_rep = verify_skill_evidence(eval_text)

        # 10. Dimension 4: Projects & Experience Evaluator (20%)
        proj_rep = evaluate_projects(
            eval_text,
            career_stage=ats_rep.career_stage_detected,
        )

        # 11. Dimension 5: Education & Certifications Evaluator (10%)
        edu_rep = evaluate_education_and_certifications(eval_text)

        # 12. Dimension 6: AI Evaluator & Content Quality Engine (15%)
        ai_rep = None
        raw_ai_score = None
        try:
            ai_rep = await evaluate_resume_content(
                resume_text=eval_text,
                target_role=target_role or "Fullstack Software Engineer",
                years_experience=years_experience or "1-3 years",
                company_type=company_type or "Product-Based",
                job_description=job_description or "",
            )
            raw_ai_score = ai_rep.content_quality_score
        except AIProviderError as prov_err:
            headers = {}
            if isinstance(prov_err, AIProviderRateLimitError) and prov_err.retry_after:
                headers["Retry-After"] = str(prov_err.retry_after)
            raise HTTPException(
                status_code=prov_err.status_code,
                detail={"code": prov_err.code, "message": prov_err.message},
                headers=headers if headers else None,
            )
        except Exception as ai_err:
            logger.warning(f"AI content evaluation non-fatal issue: {ai_err}")

        content_qual_rep = evaluate_content_quality(eval_text, ai_content_score=raw_ai_score)

        # 13. Supporting Engine 2: Recruiter Lens Evaluation
        recruiter_rep = evaluate_recruiter_lens(
            resume_text=eval_text,
            target_role=target_role or "Fullstack Software Engineer",
            years_experience=years_experience or "1-3 years",
            ats_score=ats_rep.ats_compatibility_score,
            demonstration_rate=skill_ev_rep.demonstration_rate,
        )

        # 14. Supporting Engine 3: Decoupled Job Matching
        job_match_rep = evaluate_job_match(
            resume_text=eval_text,
            job_description=job_description,
            target_role=target_role,
        )

        # Commit quota reservation
        if reservation_id:
            commit_ai_mentor_reservation(current_user_id, reservation_id)
            reservation_id = None

        # 15. Unified 7-Dimensional Scoring (100% total)
        overall_score, score_breakdown, score_status = calculate_unified_resume_score(
            ats_compatibility_score=ats_rep.ats_compatibility_score,
            keyword_coverage_score=kw_rep.keyword_match_percentage,
            technical_skills_score=skill_ev_rep.technical_skills_score,
            projects_experience_score=proj_rep.projects_experience_score,
            education_certifications_score=edu_rep.education_certifications_score,
            content_quality_score=content_qual_rep.content_quality_score,
            structure_score=ats_rep.structure_score,
            skills_match_score=kw_rep.keyword_match_percentage,
        )

        review_markdown = format_resume_review_markdown(
            overall_score=overall_score,
            ats_rep=ats_rep,
            ai_rep=ai_rep,
            kw_rep=kw_rep,
            skill_ev_rep=skill_ev_rep,
            proj_rep=proj_rep,
            edu_rep=edu_rep,
            content_qual_rep=content_qual_rep,
            recruiter_rep=recruiter_rep,
            job_match_rep=job_match_rep,
        )

        # Full structured payload
        analysis_result = {
            "review": review_markdown,
            "overall_score": overall_score,
            "scoring_status": "scored" if overall_score is not None else "unscored",
            # 7 Enterprise Dimensions
            "ats_compatibility_score": ats_rep.ats_compatibility_score,
            "keyword_coverage_score": kw_rep.keyword_match_percentage,
            "technical_skills_score": skill_ev_rep.technical_skills_score,
            "projects_experience_score": proj_rep.projects_experience_score,
            "education_certifications_score": edu_rep.education_certifications_score,
            "content_quality_score": content_qual_rep.content_quality_score,
            "structure_score": ats_rep.structure_score,
            # Backward-compatible fields
            "skills_match_score": kw_rep.keyword_match_percentage,
            "experience_score": proj_rep.projects_experience_score,
            "score_status": score_status,
            "filename": clean_filename,
            "career_stage": ats_rep.career_stage_detected,
            "used_edited_text": used_edited_text,
            # Detailed Sub-Reports
            "ats_analysis": ats_rep.model_dump(),
            "keyword_analysis": kw_rep.model_dump(),
            "skill_evidence": skill_ev_rep.model_dump(),
            "projects_evaluation": proj_rep.model_dump(),
            "education_evaluation": edu_rep.model_dump(),
            "content_quality": content_qual_rep.model_dump(),
            "recruiter_evaluation": recruiter_rep.model_dump(),
            "job_matching": job_match_rep.model_dump(),
            "ai_evaluation": ai_rep.model_dump() if ai_rep else None,
            "score_breakdown": score_breakdown.model_dump(),
            "extraction": report.model_dump(),
            "target_role": target_role,
        }

        # 16. Persist in database
        saved_record = persist_resume_analysis(
            analysis_id=resume_id,
            user_id=current_user_id,
            original_filename=clean_filename,
            storage_path=storage_path,
            file_type=report.file_type,
            file_size=len(content),
            ats_score=ats_rep.ats_compatibility_score,
            content_score=content_qual_rep.content_quality_score,
            skills_score=kw_rep.keyword_match_percentage,
            structure_score=ats_rep.structure_score,
            overall_score=overall_score,
            analysis_result=analysis_result,
            job_description=job_description,
            resume_series_id=series_id,
            version_number=version_number,
            previous_analysis_id=previous_analysis_id,
            scoring_engine_version="3.0",
            ai_evaluator_version="3.0",
            job_description_hash=jd_hash,
        )

        return {
            "success": True,
            "id": resume_id,
            "resume_series_id": series_id,
            "version_number": version_number,
            "previous_analysis_id": previous_analysis_id,
            "original_filename": clean_filename,
            "storage_path": storage_path,
            "overall_score": overall_score,
            "ats_score": ats_rep.ats_compatibility_score,
            "content_score": content_qual_rep.content_quality_score,
            "skills_score": kw_rep.keyword_match_percentage,
            "structure_score": ats_rep.structure_score,
            "technical_skills_score": skill_ev_rep.technical_skills_score,
            "projects_score": proj_rep.projects_experience_score,
            "education_score": edu_rep.education_certifications_score,
            "created_at": saved_record.get("created_at") or datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "persisted": True,
            "analysis_result": analysis_result,
        }

    except Exception as exc:
        if reservation_id:
            release_ai_mentor_slot(current_user_id, reservation_id)
        if storage_path:
            delete_resume_from_storage(storage_path)

        if isinstance(exc, HTTPException):
            raise exc
        logger.error(f"Error in resume analyze & store workflow: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing and storing the resume: {str(exc)}",
        )


@router.post("/analyze", dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_RESUME_RPM))])
async def analyze_and_store_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form("Fullstack Software Engineer"),
    years_experience: Optional[str] = Form("1-3 years"),
    company_type: Optional[str] = Form("Product-Based"),
    resume_series_id: Optional[str] = Form(None),
    edited_text: Optional[str] = Form(None),
    current_user_id: str = Depends(get_current_user_id),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.AI_MENTOR.value)),
):
    """
    Phase 3 & 4 Unified Resume Analysis Entry Point.
    Accepts an optional resume_series_id to append revisions to a logical series.
    Accepts optional edited_text to evaluate user's manual adjustments/edits without data loss.
    """
    return await _execute_resume_analysis_pipeline(
        file=file,
        job_description=job_description,
        target_role=target_role,
        years_experience=years_experience,
        company_type=company_type,
        current_user_id=current_user_id,
        entitlement=entitlement,
        resume_series_id=resume_series_id,
        edited_text=edited_text,
    )


# ---------------------------------------------------------------------------
# 3. Phase 3: Resume History Retrieval (Paginated & Lightweight)
# ---------------------------------------------------------------------------
@router.get("/history")
async def get_resume_history(
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    sort_by: str = Query("created_at", pattern="^(created_at|overall_score|ats_score)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves lightweight paginated resume analysis history for the authenticated user.
    Excludes large JSONB payloads to ensure snappy client performance.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view resume history.",
        )

    history_data = get_user_resume_history(
        user_id=current_user_id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        order=order,
    )
    return {
        "success": True,
        **history_data,
    }


# ---------------------------------------------------------------------------
# 4. Phase 3: Individual Saved Analysis Detail
# ---------------------------------------------------------------------------
@router.get("/history/{analysis_id}")
async def get_single_analysis(
    analysis_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves the complete historical analysis record including full structured JSONB evaluation.
    Enforces strict user ownership: User A cannot read User B's record.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    record = get_resume_analysis_by_id(current_user_id, analysis_id)
    return {
        "success": True,
        "data": record,
    }


# ---------------------------------------------------------------------------
# 5. Phase 3: Secure Resume Download (Signed URL)
# ---------------------------------------------------------------------------
@router.get("/history/{analysis_id}/download")
async def download_resume_file(
    analysis_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Generates a short-lived (15-minute) signed URL for the user to download their original resume.
    Verifies user ownership before generating the signed URL.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to download resumes.",
        )

    record = get_resume_analysis_by_id(current_user_id, analysis_id)
    storage_path = record.get("storage_path")
    if not storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storage path not found for this resume.",
        )

    signed_url = generate_signed_download_url(
        user_id=current_user_id,
        storage_path=storage_path,
        expires_in=900,
    )

    return {
        "success": True,
        "signed_url": signed_url,
        "filename": record.get("original_filename", "resume.pdf"),
        "expires_in": 900,
    }


# ---------------------------------------------------------------------------
# 6. Phase 3: Delete Analysis & Storage File
# ---------------------------------------------------------------------------
@router.delete("/history/{analysis_id}")
async def delete_resume_analysis_endpoint(
    analysis_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Permanently deletes a resume analysis record from PostgreSQL and removes
    the corresponding object from Supabase Storage.
    Strictly verifies ownership.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to delete records.",
        )

    deleted = delete_resume_analysis(user_id=current_user_id, analysis_id=analysis_id)
    return {
        "success": True,
        "message": "Resume and analysis deleted successfully.",
    }


# ---------------------------------------------------------------------------
# 7. Phase 4: Resume Series Management
# ---------------------------------------------------------------------------
@router.post("/series", status_code=status.HTTP_201_CREATED)
async def create_series_endpoint(
    payload: CreateSeriesRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Creates a new logical resume series (e.g. Software Developer Resume, AI/ML Resume).
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    series = create_resume_series(
        user_id=current_user_id,
        title=payload.title,
        target_role=payload.target_role,
        description=payload.description,
    )
    return {"success": True, "series": series}


@router.get("/series")
async def list_series_endpoint(
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Lists all resume series belonging to the user with aggregated version metrics.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    series_list = list_user_resume_series(user_id=current_user_id)
    return {"success": True, "items": series_list, "total": len(series_list)}


@router.get("/series/{series_id}")
async def get_series_detail_endpoint(
    series_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves full details of a resume series, including all version records.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    detail = get_resume_series_detail(user_id=current_user_id, series_id=series_id)
    return {"success": True, "data": detail}


@router.patch("/series/{series_id}")
async def update_series_endpoint(
    series_id: str,
    payload: UpdateSeriesRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Updates title, target role, or description of a resume series.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    updated = update_resume_series(
        user_id=current_user_id,
        series_id=series_id,
        title=payload.title,
        target_role=payload.target_role,
        description=payload.description,
    )
    return {"success": True, "series": updated}


@router.delete("/series/{series_id}")
async def delete_series_endpoint(
    series_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Permanently deletes a series, all its child analyses, and associated storage files.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    delete_resume_series(user_id=current_user_id, series_id=series_id)
    return {"success": True, "message": "Resume series and all versions deleted successfully."}


# ---------------------------------------------------------------------------
# 8. Phase 4: Series Version Upload & Retrieval
# ---------------------------------------------------------------------------
@router.post("/series/{series_id}/versions", dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_RESUME_RPM))])
async def upload_series_version_endpoint(
    series_id: str,
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    years_experience: Optional[str] = Form("1-3 years"),
    company_type: Optional[str] = Form("Product-Based"),
    current_user_id: str = Depends(get_current_user_id),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.AI_MENTOR.value)),
):
    """
    Uploads and evaluates a new iteration/version under an existing resume series.
    Preserves previous versions and sets previous_analysis_id.
    """
    # Verify series exists and belongs to user
    series_detail = get_resume_series_detail(user_id=current_user_id, series_id=series_id)
    effective_role = target_role or series_detail.get("target_role") or "Fullstack Software Engineer"

    return await _execute_resume_analysis_pipeline(
        file=file,
        job_description=job_description,
        target_role=effective_role,
        years_experience=years_experience,
        company_type=company_type,
        current_user_id=current_user_id,
        entitlement=entitlement,
        resume_series_id=series_id,
    )


@router.get("/series/{series_id}/versions")
async def list_series_versions_endpoint(
    series_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves all version iterations under a specific resume series.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    detail = get_resume_series_detail(user_id=current_user_id, series_id=series_id)
    return {
        "success": True,
        "series_id": series_id,
        "title": detail.get("title"),
        "versions": detail.get("versions", []),
        "total": detail.get("versions_count", 0),
    }


# ---------------------------------------------------------------------------
# 9. Phase 4: Intelligent Resume Version Comparison
# ---------------------------------------------------------------------------
@router.get("/compare")
async def compare_versions_endpoint(
    older_id: str = Query(..., description="UUID of baseline / older version"),
    newer_id: str = Query(..., description="UUID of current / newer version"),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Compares two saved resume versions within the same logical series.
    Returns:
    - Score differences with calculated deltas and indicators
    - Structured content changes (sections, skills, projects, certs)
    - Keyword matching changes & divergence warning
    - Grounded, anti-hallucinatory AI comparison summary
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to compare versions.",
        )

    return compare_resume_versions(
        user_id=current_user_id,
        older_analysis_id=older_id,
        newer_analysis_id=newer_id,
    )


# ---------------------------------------------------------------------------
# 10. Phase 4: Career Progress & Score Improvement Tracking
# ---------------------------------------------------------------------------
@router.get("/series/{series_id}/progress")
async def get_series_progress_endpoint(
    series_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Returns long-term career growth analytics for a series:
    - Overall, ATS, Content, Skills, Structure score timelines
    - Improvement indicators per category
    - Evidence-backed achievement milestones
    - Recurring weakness tracking across versions
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to track progress.",
        )

    return get_resume_series_progress(user_id=current_user_id, series_id=series_id)


# ---------------------------------------------------------------------------
# 11. Phase 4: Professional Downloadable Analysis Report (PDF)
# ---------------------------------------------------------------------------
@router.get("/history/{analysis_id}/report")
async def download_analysis_pdf_report(
    analysis_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Generates and downloads a 5-page vector-sharp PDF diagnostic report
    incorporating SkillsCatalyst executive summary, ATS analysis, section evaluations,
    and prioritized action plans.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to download reports.",
        )

    pdf_bytes = generate_resume_pdf_report(user_id=current_user_id, analysis_id=analysis_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="SkillsCatalyst_Resume_Report_{analysis_id[:8]}.pdf"',
            "Content-Type": "application/pdf",
        },
    )


# ===========================================================================
# PHASE 5: AI RESUME BUILDER & JOB-SPECIFIC OPTIMIZATION ENDPOINTS
# ===========================================================================

# ---------------------------------------------------------------------------
# 12. Phase 5: Template Catalog
# ---------------------------------------------------------------------------
@router.get("/builder/templates")
async def get_builder_templates():
    """
    Returns available ATS-optimized resume rendering templates.
    """
    return {
        "success": True,
        "templates": [
            {
                "id": "sb2nov",
                "name": "SB2Nov",
                "tagline": "The FAANG SWE gold-standard with LaTeX compatibility and maximum density.",
                "badge": "FAANG Standard",
                "ats_score": 100,
                "best_for": "Software Engineers, Full-Stack Devs, CS Students",
            },
            {
                "id": "modern-cv",
                "name": "Modern CV",
                "tagline": "Sleek typographic hierarchy with structured skill chips & accent styling.",
                "badge": "Tech & Startups",
                "ats_score": 96,
                "best_for": "Full-Stack Devs, Tech Startups, Product & Creative Tech",
            },
            {
                "id": "simple-classic",
                "name": "Simple Classic",
                "tagline": "Timeless, clean single-column format for enterprise, consulting & finance.",
                "badge": "Recruiter Classic",
                "ats_score": 98,
                "best_for": "Enterprise, Finance, Core Engineering & Traditional Tech",
            },
            {
                "id": "academic",
                "name": "Academic & Research",
                "tagline": "Education and achievements emphasized for students and research positions.",
                "badge": "Academic & Freshers",
                "ats_score": 97,
                "best_for": "Students, Freshers, Researchers, Academic Opportunities",
            },
            {
                "id": "ultra-minimal",
                "name": "Ultra Minimal",
                "tagline": "High density single page impact with sleek sans-serif typography.",
                "badge": "One Page Impact",
                "ats_score": 99,
                "best_for": "Frontend Devs, Designers, Fast Recruiter Scanning",
            },
        ],
    }


# ---------------------------------------------------------------------------
# 13. Phase 5: Resume Builder Document CRUD & Drafts
# ---------------------------------------------------------------------------
@router.post("/builder/documents")
async def create_builder_document_endpoint(
    payload: CreateBuilderDocRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to create resume drafts.",
        )

    doc = create_builder_document(
        user_id=current_user_id,
        title=payload.title,
        selected_template=payload.selected_template,
        structured_resume_data=payload.structured_resume_data or {},
        target_role=payload.target_role,
        resume_series_id=payload.resume_series_id,
    )
    return {"success": True, "data": doc}


@router.get("/builder/documents")
async def list_builder_documents_endpoint(
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view resume drafts.",
        )

    items = list_user_builder_documents(user_id=current_user_id)
    return {"success": True, "items": items}


@router.get("/builder/documents/{document_id}")
async def get_builder_document_endpoint(
    document_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view resume draft.",
        )

    doc = get_builder_document(document_id=document_id, user_id=current_user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume builder document not found or access denied.",
        )
    return {"success": True, "data": doc}


@router.patch("/builder/documents/{document_id}")
async def update_builder_document_endpoint(
    document_id: str,
    payload: UpdateBuilderDocRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to update resume drafts.",
        )

    updated = update_builder_document(
        document_id=document_id,
        user_id=current_user_id,
        title=payload.title,
        selected_template=payload.selected_template,
        structured_resume_data=payload.structured_resume_data,
        target_role=payload.target_role,
        resume_series_id=payload.resume_series_id,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume builder document not found or update failed.",
        )
    return {"success": True, "data": updated}


@router.delete("/builder/documents/{document_id}")
async def delete_builder_document_endpoint(
    document_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to delete resume drafts.",
        )

    deleted = delete_builder_document(document_id=document_id, user_id=current_user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume builder document not found or already deleted.",
        )
    return {"success": True, "message": "Resume builder document deleted successfully."}


@router.post("/builder/import/{analysis_id}")
async def import_resume_from_analysis_endpoint(
    analysis_id: str,
    payload: ImportResumeRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Imports a previously analyzed resume into a structured Resume Builder draft document.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to import resume analysis.",
        )

    analysis_record = get_resume_analysis_by_id(analysis_id=analysis_id, user_id=current_user_id)
    if not analysis_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Historical resume analysis not found or access denied.",
        )

    imported_doc = import_resume_from_analysis(
        analysis_record=analysis_record,
        user_id=current_user_id,
        selected_template=payload.selected_template,
    )
    return {"success": True, "data": imported_doc}


# ---------------------------------------------------------------------------
# 14. Phase 5: Version Saving & ATS Re-Evaluation Integration
# ---------------------------------------------------------------------------
@router.post("/builder/documents/{document_id}/save-version")
async def save_builder_version_endpoint(
    document_id: str,
    payload: SaveVersionRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Saves an immutable version snapshot from a builder document and runs ATS re-evaluation.
    Connects to the resume series with monotonic versioning.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to save resume version.",
        )

    try:
        ver = save_builder_version(
            document_id=document_id,
            user_id=current_user_id,
            change_summary=payload.change_summary,
            run_ats_eval=payload.run_ats_eval,
            job_description=payload.job_description,
        )
        return {"success": True, "data": ver}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error(f"Error saving builder version: {exc}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save resume version.")


@router.get("/builder/documents/{document_id}/versions")
async def list_builder_versions_endpoint(
    document_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view versions.",
        )

    versions = list_builder_versions(document_id=document_id, user_id=current_user_id)
    return {"success": True, "items": versions}


# ---------------------------------------------------------------------------
# 15. Phase 5: AI Writing Assistant
# ---------------------------------------------------------------------------
@router.post("/builder/ai/improve-bullet")
async def ai_improve_bullet_endpoint(
    payload: ImproveBulletRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for AI writing assistant.",
        )

    res = improve_bullet_point(
        original_bullet=payload.bullet,
        action=payload.action,
        role_context=payload.role_context,
    )
    return {"success": True, "data": res}


@router.post("/builder/ai/improve-summary")
async def ai_improve_summary_endpoint(
    payload: ImproveSummaryRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for AI writing assistant.",
        )

    res = improve_summary(
        original_summary=payload.summary,
        target_role=payload.target_role,
        experience_level=payload.experience_level,
    )
    return {"success": True, "data": res}


@router.post("/builder/ai/improve-project")
async def ai_improve_project_endpoint(
    payload: ImproveProjectRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for AI writing assistant.",
        )

    res = improve_project_description(
        project_name=payload.project_name,
        original_description=payload.description,
        technologies=payload.technologies,
    )
    return {"success": True, "data": res}


@router.post("/builder/ai/writing-feedback")
async def ai_writing_feedback_endpoint(
    payload: WritingFeedbackRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for writing feedback.",
        )

    res = analyze_writing_feedback(bullet=payload.bullet)
    return {"success": True, "data": res}


# ---------------------------------------------------------------------------
# 16. Phase 5: Job-Specific Resume Optimization
# ---------------------------------------------------------------------------
@router.post("/builder/optimize/analyze-jd")
async def analyze_jd_endpoint(
    payload: AnalyzeJDRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for job optimization.",
        )

    extracted = extract_job_description_requirements(
        job_description_text=payload.job_description,
        target_role=payload.target_role,
        experience_level=payload.experience_level,
    )
    return {"success": True, "data": extracted}


@router.post("/builder/optimize/session")
async def create_optimization_session_endpoint(
    payload: CreateOptSessionRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to create optimization session.",
        )

    session = create_job_optimization_session(
        user_id=current_user_id,
        job_description=payload.job_description,
        document_id=payload.document_id,
        job_title=payload.job_title,
        company_name=payload.company_name,
        experience_level=payload.experience_level,
        resume_data=payload.resume_data,
    )
    return {"success": True, "data": session}


@router.get("/builder/optimize/session/{session_id}")
async def get_optimization_session_endpoint(
    session_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view optimization session.",
        )

    session = get_job_optimization_session(session_id=session_id, user_id=current_user_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job optimization session not found or access denied.",
        )
    return {"success": True, "data": session}


# ---------------------------------------------------------------------------
# 17. Phase 5: Document Export (DOCX & PDF)
# ---------------------------------------------------------------------------
@router.post("/builder/export/docx")
async def export_resume_docx_endpoint(
    payload: ExportDocxRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Exports a structured resume as an editable, ATS-compatible Microsoft Word (.docx) document.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to export documents.",
        )

    buffer = generate_resume_docx(
        resume_data=payload.structured_resume_data,
        template_id=payload.template_id,
    )
    docx_bytes = buffer.read()
    raw_name = payload.filename or payload.structured_resume_data.get("fullName") or "Resume"
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_name)

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}.docx"',
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    )


@router.post("/builder/export/pdf")
async def export_resume_pdf_endpoint(
    payload: ExportPdfRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Exports a structured resume as a vector-sharp, ATS-compatible PDF document.
    """
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to export documents.",
        )

    buffer = generate_resume_pdf(
        resume_data=payload.structured_resume_data,
        template_id=payload.template_id,
    )
    pdf_bytes = buffer.read()
    raw_name = payload.filename or payload.structured_resume_data.get("fullName") or "Resume"
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_name)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}.pdf"',
            "Content-Type": "application/pdf",
        },
    )

