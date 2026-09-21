"""
backend/routers/scholarships.py
Student-facing Scholarships API Router.
Returns only scholarships that are currently published and within their visibility window.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status, Depends

from backend.services.scholarship_service import (
    get_student_scholarships,
    get_student_scholarship_by_id,
)
from backend.models.subscription import FeatureKey, EntitlementDetailDTO
from backend.dependencies.subscription import require_entitlement

router = APIRouter(prefix="/api/scholarships", tags=["scholarships"])


@router.get("", status_code=status.HTTP_200_OK)
def list_student_scholarships(
    search: Optional[str] = Query(None, description="Keyword search in scholarship name, provider, or qualification"),
    limit: int = Query(50, ge=1, le=100, description="Page limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.SCHOLARSHIPS.value)),
) -> Dict[str, Any]:
    """
    Returns public/student visible scholarships:
    - Status must be 'published'
    - Current time must be within [visible_from, visible_until]
    - Default sorting: newest/most recently published first
    - Slices by plan limit if configured
    """
    scholarships = get_student_scholarships(
        search=search,
        limit=limit,
        offset=offset,
    )
    if entitlement.limit is not None and len(scholarships) > entitlement.limit:
        scholarships = scholarships[:entitlement.limit]

    return {
        "total": len(scholarships),
        "scholarships": scholarships,
    }


@router.get("/{scholarship_id}", status_code=status.HTTP_200_OK)
def get_scholarship_detail(
    scholarship_id: str,
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.SCHOLARSHIPS.value)),
) -> Dict[str, Any]:
    """
    Returns details for a single published, visible scholarship.
    Returns 404 if scholarship does not exist, is in draft/archived status, or is outside visibility window.
    """
    scholarship = get_student_scholarship_by_id(scholarship_id)
    if not scholarship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scholarship '{scholarship_id}' not found or is currently not available.",
        )
    return scholarship
