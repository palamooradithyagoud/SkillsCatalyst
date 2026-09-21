"""
backend/routers/tech_news.py
Student-facing Tech News API Router.
Returns grouped stories by company/publisher with strict 48-hour active lifecycle.
Phase: Payments Phase 3 — Premium Entitlement Enforcement
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status, Depends

from backend.models.tech_news import (
    GroupedTechNewsSourceResponse,
    TechNewsStoryItem,
)
from backend.services.tech_news_service import (
    get_student_grouped_tech_news,
    get_student_story_by_id,
)
from backend.models.subscription import FeatureKey, EntitlementDetailDTO
from backend.dependencies.subscription import require_entitlement

router = APIRouter(prefix="/api/tech-news", tags=["tech-news"])


@router.get("", status_code=status.HTTP_200_OK, response_model=Dict[str, Any])
def list_student_tech_news(
    search: Optional[str] = Query(None, description="Keyword search in story title, summary, or company name"),
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.TECH_NEWS.value)),
) -> Dict[str, Any]:
    """
    Returns public/student visible tech news grouped by company source.
    Only sources that have at least 1 currently active published story (visible_from <= now <= visible_until)
    are returned.
    Enforces server-side story limits for free tier students.
    """
    grouped_sources = get_student_grouped_tech_news(search=search)

    if entitlement.limit is not None:
        limited_sources = []
        stories_count = 0
        for src in grouped_sources:
            src_stories = src.get("stories", [])
            allowed_remaining = entitlement.limit - stories_count
            if allowed_remaining <= 0:
                break
            taken_stories = src_stories[:allowed_remaining]
            if taken_stories:
                src_copy = dict(src)
                src_copy["stories"] = taken_stories
                src_copy["story_count"] = len(taken_stories)
                limited_sources.append(src_copy)
                stories_count += len(taken_stories)
        grouped_sources = limited_sources

    total_active_stories = sum(len(src.get("stories", [])) for src in grouped_sources)
    return {
        "total_sources": len(grouped_sources),
        "total_stories": total_active_stories,
        "sources": grouped_sources,
    }


@router.get("/{story_id}", status_code=status.HTTP_200_OK, response_model=TechNewsStoryItem)
def get_tech_news_story(
    story_id: str,
    entitlement: EntitlementDetailDTO = Depends(require_entitlement(FeatureKey.TECH_NEWS.value)),
) -> TechNewsStoryItem:
    """
    Returns details for a single published, visible tech news story.
    Returns 404 if the story does not exist, is draft/archived, or has expired beyond 48 hours.
    Enforces server-side story limits for free tier students.
    """
    story = get_student_story_by_id(story_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech news story '{story_id}' not found or is no longer active (48-hour window expired).",
        )

    if entitlement.limit is not None:
        all_sources = get_student_grouped_tech_news()
        published_stories = [s for src in all_sources for s in src.get("stories", [])]
        if len(published_stories) > entitlement.limit:
            allowed_ids = [str(s.get("id")) for s in published_stories[:entitlement.limit]]
            if str(story_id) not in allowed_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "LIMIT_REACHED",
                        "feature": "tech_news",
                        "limit": entitlement.limit,
                    },
                )

    return story
