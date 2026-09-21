"""
backend/services/tech_news_service.py
Service layer handling Tech News Sources, Stories, 48-Hour Visibility Windows,
and Supabase Storage asset uploads.
"""

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import UploadFile, HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.models.tech_news import (
    CreateTechNewsSourceRequest,
    UpdateTechNewsSourceRequest,
    CreateTechNewsRequest,
    UpdateTechNewsRequest,
    TechNewsStatus,
)

logger = logging.getLogger("skillscatalyst.tech_news")

ALLOWED_LOGO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}
ALLOWED_LOGO_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}

ALLOWED_COVER_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_COVER_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
LOGO_STORAGE_BUCKET = "tech-news-logos"
COVER_STORAGE_BUCKET = "tech-news-covers"


def _get_enum_val(val: Any) -> Any:
    if val is None:
        return None
    return getattr(val, "value", val)


def _parse_iso_utc(val: Any) -> Optional[datetime]:
    if not val:
        return None
    if isinstance(val, datetime):
        return val if val.tzinfo is not None else val.replace(tzinfo=timezone.utc)
    try:
        s = str(val).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _format_datetime(dt: Any) -> Optional[str]:
    if not dt:
        return None
    if isinstance(dt, str):
        parsed = _parse_iso_utc(dt)
        return parsed.isoformat() if parsed else dt.strip()
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return str(dt)


def _is_story_visible_now(story: Dict[str, Any], now_dt: datetime) -> bool:
    """
    Authoritative student visibility rule:
    1. status == 'published'
    2. visible_from <= now_dt (or NULL)
    3. visible_until > now_dt (or NULL)
    """
    if not story or not isinstance(story, dict):
        return False

    status_val = str(_get_enum_val(story.get("status")) or "").strip().lower()
    if status_val != TechNewsStatus.PUBLISHED.value:
        return False

    v_from = _parse_iso_utc(story.get("visible_from"))
    if v_from and v_from > now_dt:
        return False

    v_until = _parse_iso_utc(story.get("visible_until"))
    if v_until and v_until <= now_dt:
        return False

    return True


def _enrich_story_dict(story: Dict[str, Any], src: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Enriches story dictionary with aliases for seamless frontend and backend compatibility."""
    if not story or not isinstance(story, dict):
        return story
    hl = story.get("headline") or story.get("title")
    if hl:
        story["headline"] = str(hl)
        story["title"] = str(hl)
    cnt = story.get("why_it_matters") or story.get("content")
    if cnt:
        story["why_it_matters"] = str(cnt)
        story["content"] = str(cnt)
    if src and isinstance(src, dict):
        story.setdefault("source_name", src.get("name"))
        story.setdefault("source_logo_url", src.get("logo_url"))
    return story


# ── SOURCES OPERATIONS ────────────────────────────────────────────────────────

def get_student_grouped_tech_news(search: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches active tech news sources with their published active stories,
    formatted as Instagram-Stories style groups.
    Omit any source that currently has zero active stories.
    Optional search keyword matches company name, story title, or story summary.
    """
    sb = get_supabase()
    if not sb:
        logger.warning("Supabase client unavailable when fetching tech news feed")
        return []

    now_dt = datetime.now(timezone.utc)
    search_term = (search or "").strip().lower()

    try:
        # 1. Fetch active sources sorted by display_order ASC
        sources_res = (
            sb.from_("tech_news_sources")
            .select("*")
            .eq("is_active", True)
            .order("display_order", desc=False)
            .execute()
        )
        sources = sources_res.data or []
        if not sources:
            return []

        # 2. Fetch published stories sorted by display_order ASC, published_at DESC
        stories_res = (
            sb.from_("tech_news")
            .select("*")
            .eq("status", TechNewsStatus.PUBLISHED.value)
            .order("display_order", desc=False)
            .order("published_at", desc=True)
            .execute()
        )
        raw_stories = stories_res.data or []

        # Filter active stories within 48h visibility
        active_stories = [s for s in raw_stories if _is_story_visible_now(s, now_dt)]

        # Map stories to sources
        stories_by_source: Dict[str, List[Dict[str, Any]]] = {}
        for s in active_stories:
            s_id = str(s.get("source_id"))
            s["visible_from"] = _format_datetime(s.get("visible_from"))
            s["visible_until"] = _format_datetime(s.get("visible_until"))
            s["published_at"] = _format_datetime(s.get("published_at"))
            s["created_at"] = _format_datetime(s.get("created_at"))
            s["updated_at"] = _format_datetime(s.get("updated_at"))
            _enrich_story_dict(s)
            stories_by_source.setdefault(s_id, []).append(s)

        # Build response: only sources that have >= 1 active story
        grouped: List[Dict[str, Any]] = []
        for src in sources:
            src_id = str(src.get("id"))
            src_name = (src.get("name") or "").lower()
            src_stories = stories_by_source.get(src_id, [])

            if search_term:
                # If search term provided, filter stories or include if source matches
                if search_term in src_name:
                    matching_stories = src_stories
                else:
                    matching_stories = [
                        st for st in src_stories
                        if search_term in (st.get("headline") or st.get("title") or "").lower()
                        or search_term in (st.get("summary") or "").lower()
                    ]
            else:
                matching_stories = src_stories

            if matching_stories:
                src_copy = dict(src)
                src_copy["created_at"] = _format_datetime(src.get("created_at"))
                src_copy["updated_at"] = _format_datetime(src.get("updated_at"))
                for st in matching_stories:
                    _enrich_story_dict(st, src)
                src_copy["stories"] = matching_stories
                grouped.append(src_copy)

        return grouped
    except Exception as e:
        logger.error(f"Failed to fetch grouped student tech news: {e}")
        return []


def get_admin_sources(search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches all sources for Admin management with optional search filter and active count."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    try:
        query = sb.from_("tech_news_sources").select("*").order("display_order", desc=False)
        if search and search.strip():
            query = query.ilike("name", f"%{search.strip()}%")
        res = query.execute()
        items = res.data or []

        # Compute active stories count per source
        now_dt = datetime.now(timezone.utc)
        try:
            stories_res = (
                sb.from_("tech_news")
                .select("id, source_id, status, visible_from, visible_until")
                .eq("status", TechNewsStatus.PUBLISHED.value)
                .execute()
            )
            all_published = stories_res.data or []
            counts: Dict[str, int] = {}
            for st in all_published:
                if _is_story_visible_now(st, now_dt):
                    sid = str(st.get("source_id"))
                    counts[sid] = counts.get(sid, 0) + 1
        except Exception:
            counts = {}

        for item in items:
            item["created_at"] = _format_datetime(item.get("created_at"))
            item["updated_at"] = _format_datetime(item.get("updated_at"))
            item["active_stories_count"] = counts.get(str(item.get("id")), 0)
        return items
    except Exception as e:
        logger.error(f"Failed to fetch admin sources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sources: {str(e)}",
        )


def get_admin_source_by_id(source_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a single source by ID."""
    if not source_id:
        return None
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")
    try:
        res = sb.from_("tech_news_sources").select("*").eq("id", str(source_id).strip()).execute()
        items = res.data or []
        if not items:
            return None
        src = items[0]
        src["created_at"] = _format_datetime(src.get("created_at"))
        src["updated_at"] = _format_datetime(src.get("updated_at"))
        return src
    except Exception as e:
        logger.error(f"Failed to fetch source {source_id}: {e}")
        return None


def create_source(data: CreateTechNewsSourceRequest) -> Dict[str, Any]:
    """Creates a new tech news source/company."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")

    now_iso = datetime.now(timezone.utc).isoformat()
    row = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "logo_url": data.logo_url.strip(),
        "website_url": data.website_url.strip() if data.website_url else None,
        "is_active": data.is_active,
        "display_order": data.display_order,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        res = sb.from_("tech_news_sources").insert(row).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert source.")
        created = res.data[0]
        created["created_at"] = _format_datetime(created.get("created_at"))
        created["updated_at"] = _format_datetime(created.get("updated_at"))
        return created
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create tech news source: {e}")
        raise HTTPException(status_code=500, detail=f"Database error while creating source: {str(e)}")


def update_source(source_id: str, data: UpdateTechNewsSourceRequest) -> Dict[str, Any]:
    """Partially updates an existing source."""
    if not source_id:
        raise HTTPException(status_code=404, detail="Source ID is required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    clean_id = str(source_id).strip()
    payload: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.name is not None:
        payload["name"] = data.name.strip()
    if data.logo_url is not None:
        payload["logo_url"] = data.logo_url.strip()
    if data.website_url is not None:
        payload["website_url"] = data.website_url.strip() if data.website_url else None
    if data.is_active is not None:
        payload["is_active"] = data.is_active
    if data.display_order is not None:
        payload["display_order"] = data.display_order

    try:
        res = sb.from_("tech_news_sources").update(payload).eq("id", clean_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail=f"Source '{clean_id}' not found.")
        updated = res.data[0]
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update source {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error updating source: {str(e)}")


def delete_source(source_id: str) -> bool:
    """Deletes a tech news source and cascades deletion to its stories."""
    if not source_id:
        raise HTTPException(status_code=404, detail="Source ID required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")
    clean_id = str(source_id).strip()
    try:
        sb.from_("tech_news_sources").delete().eq("id", clean_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete source {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error deleting source: {str(e)}")


# ── STORIES OPERATIONS ────────────────────────────────────────────────────────

def get_student_story_by_id(story_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a single story for student detail viewing.
    Enforces that the story is published and within active 48h visibility window.
    Joins parent source details.
    """
    if not story_id:
        return None
    sb = get_supabase()
    if not sb:
        return None

    clean_id = str(story_id).strip()
    now_dt = datetime.now(timezone.utc)

    try:
        res = sb.from_("tech_news").select("*, tech_news_sources(*)").eq("id", clean_id).execute()
        items = res.data or []
        if not items:
            return None

        story = items[0]
        if not _is_story_visible_now(story, now_dt):
            return None

        # Clean joined source
        src = story.pop("tech_news_sources", None)
        if src and isinstance(src, dict):
            src["created_at"] = _format_datetime(src.get("created_at"))
            src["updated_at"] = _format_datetime(src.get("updated_at"))
            story["source"] = src
        else:
            story["source"] = None

        story["visible_from"] = _format_datetime(story.get("visible_from"))
        story["visible_until"] = _format_datetime(story.get("visible_until"))
        story["published_at"] = _format_datetime(story.get("published_at"))
        story["created_at"] = _format_datetime(story.get("created_at"))
        story["updated_at"] = _format_datetime(story.get("updated_at"))
        _enrich_story_dict(story, src)
        return story
    except Exception as e:
        logger.error(f"Failed to fetch student story {clean_id}: {e}")
        return None


def get_admin_stories(
    source_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """Fetches stories for platform owner with optional source and status filters."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        query = sb.from_("tech_news").select("*, tech_news_sources(*)").order("created_at", desc=True)

        if source_id and source_id.strip():
            query = query.eq("source_id", source_id.strip())

        if status_filter:
            sf = status_filter.strip().lower()
            if sf in {TechNewsStatus.DRAFT.value, TechNewsStatus.PUBLISHED.value, TechNewsStatus.ARCHIVED.value}:
                query = query.eq("status", sf)

        res = query.execute()
        raw_items = res.data or []

        # Server-side keyword search
        if search and search.strip():
            kw = search.strip().lower()
            raw_items = [
                item for item in raw_items
                if kw in (item.get("headline") or "").lower()
                or kw in (item.get("summary") or "").lower()
                or kw in (item.get("why_it_matters") or "").lower()
                or (item.get("tech_news_sources") and kw in (item["tech_news_sources"].get("name") or "").lower())
            ]

        paginated = raw_items[offset : offset + limit]

        now_dt = datetime.now(timezone.utc)
        for s in paginated:
            src = s.pop("tech_news_sources", None)
            if src and isinstance(src, dict):
                src["created_at"] = _format_datetime(src.get("created_at"))
                src["updated_at"] = _format_datetime(src.get("updated_at"))
                s["source"] = src
            else:
                s["source"] = None

            # Mark expired flag for admin UI
            v_until = _parse_iso_utc(s.get("visible_until"))
            s["is_expired"] = bool(s.get("status") == TechNewsStatus.PUBLISHED.value and v_until and v_until <= now_dt)

            s["visible_from"] = _format_datetime(s.get("visible_from"))
            s["visible_until"] = _format_datetime(s.get("visible_until"))
            s["published_at"] = _format_datetime(s.get("published_at"))
            s["created_at"] = _format_datetime(s.get("created_at"))
            s["updated_at"] = _format_datetime(s.get("updated_at"))
            _enrich_story_dict(s, src)

        return paginated
    except Exception as e:
        logger.error(f"Failed to fetch admin tech news: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_admin_story_by_id(story_id: str) -> Optional[Dict[str, Any]]:
    """Fetches any single story by ID for admin inspection/editing."""
    if not story_id:
        return None
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    clean_id = str(story_id).strip()
    try:
        res = sb.from_("tech_news").select("*, tech_news_sources(*)").eq("id", clean_id).execute()
        items = res.data or []
        if not items:
            return None
        s = items[0]
        src = s.pop("tech_news_sources", None)
        s["source"] = src if isinstance(src, dict) else None

        now_dt = datetime.now(timezone.utc)
        v_until = _parse_iso_utc(s.get("visible_until"))
        s["is_expired"] = bool(s.get("status") == TechNewsStatus.PUBLISHED.value and v_until and v_until <= now_dt)

        s["visible_from"] = _format_datetime(s.get("visible_from"))
        s["visible_until"] = _format_datetime(s.get("visible_until"))
        s["published_at"] = _format_datetime(s.get("published_at"))
        s["created_at"] = _format_datetime(s.get("created_at"))
        s["updated_at"] = _format_datetime(s.get("updated_at"))
        _enrich_story_dict(s, src)
        return s
    except Exception as e:
        logger.error(f"Failed to fetch admin story {clean_id}: {e}")
        return None


def create_story(data: CreateTechNewsRequest, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new tech news story."""
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Safely validate creator UUID
    creator_uuid = None
    if user_id:
        try:
            uuid.UUID(str(user_id))
            creator_uuid = str(user_id)
        except (ValueError, AttributeError):
            creator_uuid = None

    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()

    # If created directly as published, apply 48-hour visibility window
    status_val = _get_enum_val(data.status) or TechNewsStatus.DRAFT.value
    published_at_iso = None
    visible_from_iso = _format_datetime(data.visible_from)
    visible_until_iso = _format_datetime(data.visible_until)

    if status_val == TechNewsStatus.PUBLISHED.value:
        published_at_iso = now_iso
        if not visible_from_iso:
            visible_from_iso = now_iso
        if not visible_until_iso:
            visible_until_iso = (now_dt + timedelta(hours=48)).isoformat()

    headline_val = (data.headline or data.title or "").strip()
    content_val = (data.why_it_matters or data.content or "").strip() or None

    row = {
        "id": str(uuid.uuid4()),
        "source_id": str(data.source_id).strip(),
        "headline": headline_val,
        "summary": data.summary.strip(),
        "why_it_matters": content_val,
        "cover_image_url": data.cover_image_url.strip() if data.cover_image_url else None,
        "source_url": data.source_url.strip(),
        "category": data.category.strip() if data.category else "General",
        "tags": data.tags or [],
        "status": status_val,
        "visible_from": visible_from_iso,
        "visible_until": visible_until_iso,
        "published_at": published_at_iso,
        "display_order": data.display_order,
        "created_by": creator_uuid,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        res = sb.from_("tech_news").insert(row).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert tech news story.")
        created = res.data[0]
        created["visible_from"] = _format_datetime(created.get("visible_from"))
        created["visible_until"] = _format_datetime(created.get("visible_until"))
        created["published_at"] = _format_datetime(created.get("published_at"))
        created["created_at"] = _format_datetime(created.get("created_at"))
        created["updated_at"] = _format_datetime(created.get("updated_at"))
        _enrich_story_dict(created)
        return created
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create tech news story: {e}")
        raise HTTPException(status_code=500, detail=f"Database error creating story: {str(e)}")


def update_story(story_id: str, data: UpdateTechNewsRequest) -> Dict[str, Any]:
    """Partially updates an existing tech news story."""
    if not story_id:
        raise HTTPException(status_code=404, detail="Story ID required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    clean_id = str(story_id).strip()
    payload: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}

    if data.source_id is not None:
        payload["source_id"] = str(data.source_id).strip()
    if data.headline is not None or data.title is not None:
        payload["headline"] = (data.headline or data.title or "").strip()
    if data.summary is not None:
        payload["summary"] = data.summary.strip()
    if data.why_it_matters is not None or data.content is not None:
        content_val = (data.why_it_matters or data.content or "").strip()
        payload["why_it_matters"] = content_val if content_val else None
    if data.cover_image_url is not None:
        payload["cover_image_url"] = data.cover_image_url.strip() if data.cover_image_url else None
    if data.source_url is not None:
        payload["source_url"] = data.source_url.strip()
    if data.category is not None:
        payload["category"] = data.category.strip()
    if data.tags is not None:
        payload["tags"] = data.tags
    if data.status is not None:
        payload["status"] = _get_enum_val(data.status)
    if data.display_order is not None:
        payload["display_order"] = data.display_order
    if data.visible_from is not None:
        payload["visible_from"] = _format_datetime(data.visible_from)
    if data.visible_until is not None:
        payload["visible_until"] = _format_datetime(data.visible_until)

    try:
        res = sb.from_("tech_news").update(payload).eq("id", clean_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail=f"Story '{clean_id}' not found.")
        updated = res.data[0]
        updated["visible_from"] = _format_datetime(updated.get("visible_from"))
        updated["visible_until"] = _format_datetime(updated.get("visible_until"))
        updated["published_at"] = _format_datetime(updated.get("published_at"))
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        _enrich_story_dict(updated)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update story {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def publish_story(story_id: str) -> Dict[str, Any]:
    """
    Publishes a story with authoritative 48-Hour visibility window:
    - visible_from = now()
    - visible_until = now() + 48 hours
    - published_at = now()
    - status = 'published'
    """
    if not story_id:
        raise HTTPException(status_code=404, detail="Story ID required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    clean_id = str(story_id).strip()
    now_dt = datetime.now(timezone.utc)
    until_dt = now_dt + timedelta(hours=48)

    payload = {
        "status": TechNewsStatus.PUBLISHED.value,
        "published_at": now_dt.isoformat(),
        "visible_from": now_dt.isoformat(),
        "visible_until": until_dt.isoformat(),
        "updated_at": now_dt.isoformat(),
    }

    try:
        res = sb.from_("tech_news").update(payload).eq("id", clean_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail=f"Story '{clean_id}' not found.")
        updated = res.data[0]
        updated["visible_from"] = _format_datetime(updated.get("visible_from"))
        updated["visible_until"] = _format_datetime(updated.get("visible_until"))
        updated["published_at"] = _format_datetime(updated.get("published_at"))
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        _enrich_story_dict(updated)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to publish story {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def archive_story(story_id: str) -> Dict[str, Any]:
    """Archives a story, hiding it from students while preserving records."""
    if not story_id:
        raise HTTPException(status_code=404, detail="Story ID required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")

    clean_id = str(story_id).strip()
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        res = sb.from_("tech_news").update({
            "status": TechNewsStatus.ARCHIVED.value,
            "updated_at": now_iso,
        }).eq("id", clean_id).execute()

        if not res.data:
            raise HTTPException(status_code=404, detail=f"Story '{clean_id}' not found.")
        updated = res.data[0]
        updated["visible_from"] = _format_datetime(updated.get("visible_from"))
        updated["visible_until"] = _format_datetime(updated.get("visible_until"))
        updated["published_at"] = _format_datetime(updated.get("published_at"))
        updated["created_at"] = _format_datetime(updated.get("created_at"))
        updated["updated_at"] = _format_datetime(updated.get("updated_at"))
        _enrich_story_dict(updated)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to archive story {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def delete_story(story_id: str) -> bool:
    """Permanently deletes a story."""
    if not story_id:
        raise HTTPException(status_code=404, detail="Story ID required.")
    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Database unavailable")
    clean_id = str(story_id).strip()
    try:
        sb.from_("tech_news").delete().eq("id", clean_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete story {clean_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_active_stories_count() -> int:
    """Returns real count of published active stories within 48h visibility window."""
    sb = get_supabase()
    if not sb:
        return 0
    now_dt = datetime.now(timezone.utc)
    try:
        res = sb.from_("tech_news").select("*").eq("status", TechNewsStatus.PUBLISHED.value).execute()
        raw = res.data or []
        return sum(1 for s in raw if _is_story_visible_now(s, now_dt))
    except Exception:
        return 0


def get_active_sources_count() -> int:
    """Returns real count of active sources that currently have >= 1 active story."""
    grouped = get_student_grouped_tech_news()
    return len(grouped)


# ── STORAGE UPLOADS ───────────────────────────────────────────────────────────

async def upload_source_logo(file: UploadFile, user_id: str) -> str:
    """Uploads a company/source logo to Supabase Storage 'tech-news-logos'."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No logo file provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_LOGO_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_LOGO_EXTS))}",
        )

    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_LOGO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type '{content_type}'. Allowed: {', '.join(sorted(ALLOWED_LOGO_TYPES))}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 5 MB ({len(contents)} bytes received).",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Storage service unavailable.")

    storage_path = f"logo_{uuid.uuid4().hex[:12]}{ext}"
    try:
        res = sb.storage.from_(LOGO_STORAGE_BUCKET).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": content_type, "cache-control": "3600"},
        )
        if hasattr(res, "error") and res.error:
            raise Exception(str(res.error))

        public_url = sb.storage.from_(LOGO_STORAGE_BUCKET).get_public_url(storage_path)
        logger.info(f"Successfully uploaded logo to {public_url} by {user_id}")
        return public_url
    except Exception as e:
        logger.error(f"Logo upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage upload to Supabase failed: {str(e)}",
        )


async def upload_story_cover(file: UploadFile, user_id: str) -> str:
    """Uploads a story cover banner to Supabase Storage 'tech-news-covers'."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No cover image file provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_COVER_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_COVER_EXTS))}",
        )

    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_COVER_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type '{content_type}'. Allowed: {', '.join(sorted(ALLOWED_COVER_TYPES))}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 5 MB ({len(contents)} bytes received).",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(status_code=503, detail="Storage service unavailable.")

    storage_path = f"cover_{uuid.uuid4().hex[:12]}{ext}"
    try:
        res = sb.storage.from_(COVER_STORAGE_BUCKET).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": content_type, "cache-control": "3600"},
        )
        if hasattr(res, "error") and res.error:
            raise Exception(str(res.error))

        public_url = sb.storage.from_(COVER_STORAGE_BUCKET).get_public_url(storage_path)
        logger.info(f"Successfully uploaded story cover to {public_url} by {user_id}")
        return public_url
    except Exception as e:
        logger.error(f"Story cover upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage upload to Supabase failed: {str(e)}",
        )
