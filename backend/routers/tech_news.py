"""
backend/routers/tech_news.py
Student-facing Tech News API Router.
Returns grouped stories by company/publisher with strict 48-hour active lifecycle.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from backend.models.tech_news import (
    GroupedTechNewsSourceResponse,
    TechNewsStoryItem,
)
from backend.services.tech_news_service import (
    get_student_grouped_tech_news,
    get_student_story_by_id,
)

router = APIRouter(prefix="/api/tech-news", tags=["tech-news"])


@router.get("", status_code=status.HTTP_200_OK, response_model=Dict[str, Any])
def list_student_tech_news(
    search: Optional[str] = Query(None, description="Keyword search in story title, summary, or company name"),
) -> Dict[str, Any]:
    """
    Returns public/student visible tech news grouped by company source.
    Only sources that have at least 1 currently active published story (visible_from <= now <= visible_until)
    are returned.
    """
    grouped_sources = get_student_grouped_tech_news(search=search)
    total_active_stories = sum(len(src.get("stories", [])) for src in grouped_sources)
    return {
        "total_sources": len(grouped_sources),
        "total_stories": total_active_stories,
        "sources": grouped_sources,
    }


@router.get("/{story_id}", status_code=status.HTTP_200_OK, response_model=TechNewsStoryItem)
def get_tech_news_story(story_id: str) -> TechNewsStoryItem:
    """
    Returns details for a single published, visible tech news story.
    Returns 404 if the story does not exist, is draft/archived, or has expired beyond 48 hours.
    """
    story = get_student_story_by_id(story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech news story '{story_id}' not found or is no longer active (48-hour window expired).",
        )
    return story
