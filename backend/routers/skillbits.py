"""
backend/routers/skillbits.py
Student-facing SkillBits API Router.
Returns published educational short-form videos for the future Reels player.
Phase: Step 1 (Foundation)
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, status, Request, Header, Depends

from backend.services.auth_service import get_current_user_id
from backend.models.skillbits import (
    StudentSkillBitResponse,
    SkillBitsListResponse,
    UpdateSkillBitProgressRequest,
    SkillBitProgressResponse,
)
from backend.services.skillbits_service import (
    get_student_skillbits,
    get_student_skillbit_by_id,
    process_mux_webhook,
    get_user_skillbit_progress,
    update_user_skillbit_progress,
)

router = APIRouter(prefix="/api/skillbits", tags=["skillbits"])


@router.get("", status_code=status.HTTP_200_OK, response_model=SkillBitsListResponse)
def list_student_skillbits(
    topic: Optional[str] = Query(None, description="Filter by topic (e.g. React, Python)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner, intermediate, advanced)"),
    search: Optional[str] = Query(None, description="Search keyword in title"),
    page: Optional[int] = Query(None, ge=1, description="Page number"),
    page_size: Optional[int] = Query(None, ge=1, le=100, description="Page size"),
    limit: int = Query(20, ge=1, le=100, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
) -> SkillBitsListResponse:
    """
    Returns published SkillBits ready for student learning.
    Draft and archived SkillBits are strictly omitted.
    """
    items = get_student_skillbits(
        topic=topic,
        difficulty=difficulty,
        search=search,
        page=page,
        page_size=page_size,
        limit=limit,
        offset=offset,
    )
    return SkillBitsListResponse(
        total=len(items),
        items=[StudentSkillBitResponse(**item) for item in items],
        page=page,
        page_size=page_size or limit,
    )


@router.get("/{skillbit_id}", status_code=status.HTTP_200_OK, response_model=StudentSkillBitResponse)
def get_student_skillbit(
    skillbit_id: str,
) -> StudentSkillBitResponse:
    """
    Returns a single published SkillBit by UUID.
    Returns 404 Not Found if the SkillBit does not exist, or is in draft/archived status.
    """
    record = get_student_skillbit_by_id(skillbit_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SkillBit '{skillbit_id}' not found or not published.",
        )
    return StudentSkillBitResponse(**record)


@router.post("/webhook/mux", status_code=status.HTTP_200_OK)
async def mux_webhook(
    request: Request,
    mux_signature: Optional[str] = Header(None, alias="Mux-Signature"),
) -> Dict[str, Any]:
    """
    Authoritative Webhook Receiver for Mux Video transcoding and ingestion notifications.
    Validates HMAC-SHA256 signature using Mux-Signature header and MUX_WEBHOOK_SECRET.
    Guarantees idempotency via public.mux_webhook_events.
    """
    raw_body = await request.body()
    return await process_mux_webhook(raw_body=raw_body, signature_header=mux_signature)


# ── Step 4: Video Learning Progress Endpoints ─────────────────────────────────

@router.get(
    "/{skillbit_id}/progress",
    status_code=status.HTTP_200_OK,
    response_model=SkillBitProgressResponse,
)
def get_skillbit_progress_endpoint(
    skillbit_id: str,
    user_id: str = Depends(get_current_user_id),
) -> SkillBitProgressResponse:
    """
    Authenticated student endpoint: Retrieves personal video learning progress.
    User ID is extracted strictly from the validated session JWT.
    Returns 401 if unauthenticated, 404 if SkillBit does not exist or is unpublished.
    """
    record = get_user_skillbit_progress(skillbit_id=skillbit_id, user_id=user_id)
    return SkillBitProgressResponse(**record)


@router.patch(
    "/{skillbit_id}/progress",
    status_code=status.HTTP_200_OK,
    response_model=SkillBitProgressResponse,
)
def update_skillbit_progress_endpoint(
    skillbit_id: str,
    payload: UpdateSkillBitProgressRequest,
    user_id: str = Depends(get_current_user_id),
) -> SkillBitProgressResponse:
    """
    Authenticated student endpoint: Updates personal video learning progress.
    Atomic upsert with monotonic watched_seconds, position tracking, and server-side completion validation (>= 90%).
    Returns 401 if unauthenticated, 404 if SkillBit does not exist or is unpublished,
    and 400 if last_position_seconds exceeds video duration.
    """
    record = update_user_skillbit_progress(
        skillbit_id=skillbit_id,
        user_id=user_id,
        payload=payload,
    )
    return SkillBitProgressResponse(**record)


