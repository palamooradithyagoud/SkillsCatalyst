"""
backend/routers/events.py
Student-facing Events & Hackathons API Router.
Returns only events that are currently published and within their visibility window.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from backend.services.event_service import (
    get_student_events,
    get_student_event_by_id,
)

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", status_code=status.HTTP_200_OK)
def list_student_events(
    category: Optional[str] = Query(None, description="Filter by category: 'online' or 'offline'"),
    is_hackathon: Optional[bool] = Query(None, description="Filter by hackathons only"),
    search: Optional[str] = Query(None, description="Keyword search in event name, college, or description"),
) -> Dict[str, Any]:
    """
    Returns public/student visible events:
    - Status must be 'published'
    - Current time must be within [visible_from, visible_until]
    """
    events = get_student_events(
        category=category,
        is_hackathon=is_hackathon,
        search=search,
    )
    return {
        "total": len(events),
        "events": events,
    }


@router.get("/{event_id}", status_code=status.HTTP_200_OK)
def get_event_detail(event_id: str) -> Dict[str, Any]:
    """
    Returns details for a single published, visible event.
    Returns 404 if event does not exist, is in draft/archived status, or is outside visibility window.
    """
    event = get_student_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found or is currently not available.",
        )
    return event
