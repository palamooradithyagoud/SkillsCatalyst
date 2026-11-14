"""
backend/services/resume_history_service.py

Core Cloud Storage & Analysis History Service for SkillsCatalyst Resume Analyzer (Phase 3).
Handles:
  - Private Supabase Storage object management (bucket: 'resumes')
  - Strict user-isolated storage paths: {user_id}/{resume_id}/{sanitized_filename}
  - Short-lived signed download URL generation (15-minute expiration)
  - PostgreSQL persistence into public.resume_analyses with score validations
  - Lightweight paginated history querying (excluding heavy JSONB payloads)
  - Full single-analysis retrieval with complete evaluation artifacts
  - Compensation / rollback mechanisms to prevent orphaned storage objects
  - Strict tenant authorization and cascade deletions
"""

import logging
import uuid
import re
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import is_valid_uuid
from backend.services.resume_scoring import sanitize_resume_filename

logger = logging.getLogger("skillscatalyst.resume.history")

# Authoritative Supabase Storage Bucket for user resumes
RESUMES_BUCKET = "resumes"
DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 900  # 15 minutes


def build_storage_path(user_id: str, resume_id: str, filename: str) -> str:
    """
    Constructs a collision-safe, strictly scoped storage path:
    {user_id}/{resume_id}/{sanitized_filename}
    Neutralizes path traversal attempts and directory separators.
    """
    clean_user = re.sub(r"[^a-zA-Z0-9_-]", "", user_id)
    clean_resume = re.sub(r"[^a-zA-Z0-9_-]", "", resume_id)
    clean_name = sanitize_resume_filename(filename, default="resume.pdf")

    return f"{clean_user}/{clean_resume}/{clean_name}"


def upload_resume_to_storage(
    user_id: str,
    resume_id: str,
    filename: str,
    content: bytes,
    mime_type: str = "application/pdf",
) -> str:
    """
    Uploads raw resume binary bytes to the private 'resumes' Supabase Storage bucket.
    Returns the authoritative storage path.
    Raises HTTPException(502) if upload fails.
    """
    sb = get_supabase()
    if not sb:
        logger.error("Supabase client unavailable for resume storage upload.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Storage service unavailable. Please try again shortly.",
        )

    storage_path = build_storage_path(user_id, resume_id, filename)

    try:
        sb.storage.from_(RESUMES_BUCKET).upload(
            path=storage_path,
            file=content,
            file_options={"content-type": mime_type, "upsert": "false"},
        )
        logger.info(f"Uploaded resume to storage: {storage_path} ({len(content)} bytes)")
        return storage_path
    except Exception as exc:
        logger.error(f"Failed to upload resume to storage path '{storage_path}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload resume file to cloud storage. Please try again.",
        )


def delete_resume_from_storage(storage_path: str) -> bool:
    """
    Removes a resume file from the private 'resumes' Supabase Storage bucket.
    Safe failure handling: does not raise, returns True if deleted, False otherwise.
    """
    sb = get_supabase()
    if not sb or not storage_path:
        return False

    try:
        sb.storage.from_(RESUMES_BUCKET).remove([storage_path])
        logger.info(f"Removed resume storage object: {storage_path}")
        return True
    except Exception as exc:
        logger.warning(f"Error removing resume storage object '{storage_path}': {exc}")
        return False


def generate_signed_download_url(
    user_id: str,
    storage_path: str,
    expires_in: int = DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
) -> str:
    """
    Generates a secure, temporary signed download URL for an authorized resume object.
    Verifies that the path belongs to the requesting user_id before calling Supabase.
    """
    # Strict path prefix ownership validation
    expected_prefix = f"{user_id}/"
    if not storage_path.startswith(expected_prefix):
        logger.warning(f"Unauthorized signed URL request: user {user_id} requested path '{storage_path}'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resume file.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Storage service unavailable.",
        )

    try:
        res = sb.storage.from_(RESUMES_BUCKET).create_signed_url(
            path=storage_path,
            expires_in=expires_in,
        )
        signed_url = None
        if isinstance(res, dict):
            signed_url = res.get("signedURL") or res.get("signedUrl")
        elif hasattr(res, "get"):
            signed_url = res.get("signedURL") or res.get("signedUrl")
        else:
            signed_url = str(res)

        if not signed_url:
            raise ValueError("Empty signed URL response from storage provider.")

        return signed_url
    except Exception as exc:
        logger.error(f"Failed to generate signed URL for path '{storage_path}': {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate secure download link for resume.",
        )


def persist_resume_analysis(
    analysis_id: str,
    user_id: str,
    original_filename: str,
    storage_path: str,
    file_type: str,
    file_size: int,
    ats_score: Optional[float],
    content_score: Optional[float],
    skills_score: Optional[float],
    structure_score: Optional[float],
    overall_score: Optional[float],
    analysis_result: Dict[str, Any],
    job_description: Optional[str] = None,
    resume_series_id: Optional[str] = None,
    version_number: Optional[int] = None,
    previous_analysis_id: Optional[str] = None,
    scoring_engine_version: str = "2.2",
    ai_evaluator_version: str = "2.2",
    job_description_hash: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Persists analysis metadata and full JSONB artifact into public.resume_analyses.
    Implements compensation: if database insertion fails, removes the uploaded storage object.
    Supports Phase 4 versioning and series tracking.
    """
    sb = get_supabase()
    if not sb:
        # Compensation: clean up storage object
        delete_resume_from_storage(storage_path)
        logger.error("Supabase client unavailable. Cleaned up storage object.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable. Could not save analysis.",
        )

    row = {
        "id": analysis_id,
        "user_id": user_id,
        "original_filename": original_filename,
        "storage_path": storage_path,
        "file_type": file_type,
        "file_size": file_size,
        "ats_score": round(ats_score, 2) if ats_score is not None else None,
        "content_score": round(content_score, 2) if content_score is not None else None,
        "skills_score": round(skills_score, 2) if skills_score is not None else None,
        "structure_score": round(structure_score, 2) if structure_score is not None else None,
        "overall_score": round(overall_score, 2) if overall_score is not None else None,
        "analysis_result": analysis_result,
        "job_description": job_description,
    }

    if resume_series_id:
        row["resume_series_id"] = resume_series_id
    if version_number is not None:
        row["version_number"] = version_number
    if previous_analysis_id:
        row["previous_analysis_id"] = previous_analysis_id
    if scoring_engine_version:
        row["scoring_engine_version"] = scoring_engine_version
    if ai_evaluator_version:
        row["ai_evaluator_version"] = ai_evaluator_version
    if job_description_hash:
        row["job_description_hash"] = job_description_hash

    try:
        res = sb.table("resume_analyses").insert(row).execute()
        if not res.data:
            raise RuntimeError("Database returned empty confirmation on insert.")
        logger.info(f"Persisted resume analysis {analysis_id} for user {user_id}")
        return res.data[0]
    except Exception as exc:
        # Compensation: rollback uploaded storage file to prevent orphaned objects
        logger.error(f"Failed to persist resume analysis row in DB: {exc}. Rolling back storage file '{storage_path}'.", exc_info=True)
        delete_resume_from_storage(storage_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save analysis results to database. Operation rolled back.",
        )


def get_user_resume_history(
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
) -> Dict[str, Any]:
    """
    Fetches lightweight paginated resume history records for a user.
    Excludes the heavy analysis_result JSONB column to optimize list performance.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    # Sanitize sort fields to prevent SQL injection / invalid column requests
    allowed_sort_fields = {"created_at", "overall_score", "ats_score"}
    field = sort_by if sort_by in allowed_sort_fields else "created_at"
    descending = (order.lower() == "desc")

    offset = (page - 1) * page_size
    limit = page_size

    # Lightweight projection
    select_fields = (
        "id, user_id, original_filename, storage_path, file_type, file_size, "
        "ats_score, content_score, skills_score, structure_score, overall_score, "
        "job_description, resume_series_id, version_number, previous_analysis_id, "
        "scoring_engine_version, ai_evaluator_version, created_at, updated_at"
    )

    try:
        # Count total rows for user
        count_res = sb.table("resume_analyses").select("id", count="exact").eq("user_id", user_id).execute()
        total_count = count_res.count if count_res.count is not None else 0

        # Query paginated slice
        query = (
            sb.table("resume_analyses")
            .select(select_fields)
            .eq("user_id", user_id)
            .order(field, desc=descending)
            .range(offset, offset + limit - 1)
        )
        res = query.execute()
        items = res.data or []

        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

        return {
            "items": items,
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
    except Exception as exc:
        logger.error(f"Error fetching resume history for user {user_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load resume analysis history.",
        )


def get_resume_analysis_by_id(user_id: str, analysis_id: str) -> Dict[str, Any]:
    """
    Retrieves the complete historical analysis record including full JSONB artifact.
    Strictly verifies ownership: user_id must match.
    """
    if not is_valid_uuid(analysis_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format. Must be a valid UUID.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    try:
        res = (
            sb.table("resume_analyses")
            .select("*")
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume analysis not found or access denied.",
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error retrieving analysis {analysis_id} for user {user_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve resume analysis details.",
        )


def delete_resume_analysis(user_id: str, analysis_id: str) -> bool:
    """
    Deletes a resume analysis and removes its associated storage object.
    Verifies ownership before deleting.
    """
    if not is_valid_uuid(analysis_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid analysis ID format.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    # 1. Fetch record to get storage_path and verify ownership
    try:
        check_res = (
            sb.table("resume_analyses")
            .select("id, storage_path, user_id")
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not check_res.data or len(check_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume analysis not found or access denied.",
            )
        record = check_res.data[0]
        storage_path = record.get("storage_path")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error verifying analysis {analysis_id} ownership: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify resume record.",
        )

    # 2. Delete database record first
    try:
        sb.table("resume_analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        logger.info(f"Deleted resume analysis record {analysis_id} for user {user_id}")
    except Exception as exc:
        logger.error(f"Failed to delete DB record {analysis_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete resume analysis from database.",
        )

    # 3. Clean up storage object (non-blocking for user, but logged)
    if storage_path:
        delete_resume_from_storage(storage_path)

    return True

