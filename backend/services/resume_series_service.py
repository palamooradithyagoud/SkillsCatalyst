"""
backend/services/resume_series_service.py
Phase 4.1: Logical Resume Series & Version Management Service.

Enforces:
1. Strict user-scoped isolation on resume series and versions.
2. Safe version numbering (monotonically increasing per series).
3. Cascading cleanup of analyses and Supabase storage files when series are deleted.
4. Summary aggregations (total versions, latest score, best score).
"""

import logging
import uuid
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from backend.services.supabase_service import get_supabase
from backend.services.resume_history_service import (
    RESUMES_BUCKET,
    delete_resume_from_storage,
)

logger = logging.getLogger("skillscatalyst.resume_series")


def create_resume_series(
    user_id: str,
    title: str,
    target_role: Optional[str] = None,
    description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new logical resume series for the authenticated user.
    """
    clean_title = (title or "").strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume series title cannot be empty.",
        )

    sb = get_supabase()
    series_data = {
        "user_id": user_id,
        "title": clean_title,
        "target_role": (target_role or "").strip() or None,
        "description": (description or "").strip() or None,
    }

    try:
        res = sb.table("resume_series").insert(series_data).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create resume series.",
            )
        return res.data[0]
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        logger.error(f"Error creating resume series for user {user_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while creating resume series: {str(exc)}",
        )


def list_user_resume_series(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all resume series owned by the user, augmented with
    aggregated metrics: version count, latest score, best score, and latest version number.
    """
    sb = get_supabase()

    try:
        series_res = (
            sb.table("resume_series")
            .select("id, user_id, title, target_role, description, created_at, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        series_list = series_res.data or []

        if not series_list:
            return []

        # Retrieve analyses for these series to compute metrics efficiently
        series_ids = [s["id"] for s in series_list]
        analyses_res = (
            sb.table("resume_analyses")
            .select("id, resume_series_id, version_number, overall_score, created_at, original_filename")
            .in_("resume_series_id", series_ids)
            .order("version_number", desc=False)
            .execute()
        )
        analyses_data = analyses_res.data or []

        # Group analyses by series_id
        analyses_by_series: Dict[str, List[Dict[str, Any]]] = {sid: [] for sid in series_ids}
        for item in analyses_data:
            sid = item.get("resume_series_id")
            if sid in analyses_by_series:
                analyses_by_series[sid].append(item)

        result = []
        for s in series_list:
            sid = s["id"]
            versions = analyses_by_series.get(sid, [])
            v_count = len(versions)

            latest_version = None
            latest_score = None
            best_score = None
            latest_analysis_id = None
            latest_filename = None

            if v_count > 0:
                # Latest version by version_number
                sorted_by_v = sorted(versions, key=lambda x: x.get("version_number", 0))
                latest_item = sorted_by_v[-1]
                latest_version = latest_item.get("version_number")
                latest_score = latest_item.get("overall_score")
                latest_analysis_id = latest_item.get("id")
                latest_filename = latest_item.get("original_filename")

                # Best overall score
                valid_scores = [v.get("overall_score") for v in versions if v.get("overall_score") is not None]
                if valid_scores:
                    best_score = max(valid_scores)

            result.append({
                **s,
                "versions_count": v_count,
                "latest_version": latest_version,
                "latest_score": latest_score,
                "best_score": best_score,
                "latest_analysis_id": latest_analysis_id,
                "latest_filename": latest_filename,
            })

        return result

    except Exception as exc:
        logger.error(f"Error fetching resume series for user {user_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while listing resume series: {str(exc)}",
        )


def get_resume_series_detail(user_id: str, series_id: str) -> Dict[str, Any]:
    """
    Retrieves complete metadata for a single series along with all its version iterations.
    Enforces tenant ownership.
    """
    sb = get_supabase()

    try:
        series_res = (
            sb.table("resume_series")
            .select("*")
            .eq("id", series_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not series_res.data or len(series_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume series not found or access denied.",
            )

        series = series_res.data[0]

        # Fetch all versions for this series
        versions_res = (
            sb.table("resume_analyses")
            .select(
                "id, resume_series_id, version_number, original_filename, "
                "file_type, file_size, overall_score, ats_score, content_score, "
                "skills_score, structure_score, created_at, previous_analysis_id, "
                "scoring_engine_version, ai_evaluator_version, job_description_hash"
            )
            .eq("resume_series_id", series_id)
            .order("version_number", desc=False)
            .execute()
        )
        versions = versions_res.data or []

        return {
            **series,
            "versions": versions,
            "versions_count": len(versions),
        }

    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        logger.error(f"Error fetching series detail {series_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while retrieving series: {str(exc)}",
        )


def update_resume_series(
    user_id: str,
    series_id: str,
    title: Optional[str] = None,
    target_role: Optional[str] = None,
    description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates resume series title, target role, or description.
    """
    sb = get_supabase()

    # Verify ownership
    check_res = sb.table("resume_series").select("id").eq("id", series_id).eq("user_id", user_id).execute()
    if not check_res.data or len(check_res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume series not found or access denied.",
        )

    updates: Dict[str, Any] = {}
    if title is not None:
        clean_title = title.strip()
        if not clean_title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty.",
            )
        updates["title"] = clean_title
    if target_role is not None:
        updates["target_role"] = target_role.strip() or None
    if description is not None:
        updates["description"] = description.strip() or None

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update.",
        )

    try:
        res = sb.table("resume_series").update(updates).eq("id", series_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update resume series.",
            )
        return res.data[0]
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        logger.error(f"Error updating series {series_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while updating resume series: {str(exc)}",
        )


def delete_resume_series(user_id: str, series_id: str) -> bool:
    """
    Permanently deletes a resume series, all its child analyses, and all associated
    storage objects in the Supabase Storage resumes bucket.
    """
    sb = get_supabase()

    # Verify ownership
    check_res = sb.table("resume_series").select("id").eq("id", series_id).eq("user_id", user_id).execute()
    if not check_res.data or len(check_res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume series not found or access denied.",
        )

    # Fetch all storage paths associated with analyses in this series
    analyses_res = (
        sb.table("resume_analyses")
        .select("storage_path")
        .eq("resume_series_id", series_id)
        .execute()
    )
    storage_paths = [r["storage_path"] for r in (analyses_res.data or []) if r.get("storage_path")]

    # Delete storage files safely
    for sp in storage_paths:
        try:
            delete_resume_from_storage(sp)
        except Exception as exc:
            logger.warning(f"Non-fatal error removing storage object '{sp}' during series deletion: {exc}")

    # Delete series record (PostgreSQL cascades delete to resume_analyses)
    try:
        sb.table("resume_series").delete().eq("id", series_id).eq("user_id", user_id).execute()
        return True
    except Exception as exc:
        logger.error(f"Error deleting resume series {series_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while deleting resume series: {str(exc)}",
        )


def get_next_version_number(series_id: str) -> int:
    """
    Calculates the next version number monotonically for a series.
    """
    sb = get_supabase()
    res = (
        sb.table("resume_analyses")
        .select("version_number")
        .eq("resume_series_id", series_id)
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    if res.data and len(res.data) > 0:
        return int(res.data[0].get("version_number", 0)) + 1
    return 1


def get_latest_analysis_id_for_series(series_id: str) -> Optional[str]:
    """
    Retrieves the ID of the most recent analysis in a series to link as previous_analysis_id.
    """
    sb = get_supabase()
    res = (
        sb.table("resume_analyses")
        .select("id")
        .eq("resume_series_id", series_id)
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    if res.data and len(res.data) > 0:
        return str(res.data[0]["id"])
    return None

