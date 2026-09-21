"""
backend/models/tech_news.py
Pydantic v2 domain schemas for Tech News Sources, Stories, and Grouped Student Feeds.
"""

from enum import Enum
from typing import Optional, List, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator, model_validator


class TechNewsStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# ── SOURCE SCHEMAS ────────────────────────────────────────────────────────────

class CreateTechNewsSourceRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Company or publisher name")
    logo_url: str = Field(..., min_length=5, description="Public CDN logo URL")
    website_url: Optional[str] = Field(None, description="Optional official website URL")
    is_active: bool = Field(True, description="Whether the source is active")
    display_order: int = Field(0, description="Ordering priority (ascending)")

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v: Any) -> str:
        s = str(v or "").strip()
        if not s:
            raise ValueError("Source name cannot be empty.")
        return s

    @field_validator("logo_url", mode="before")
    @classmethod
    def validate_logo_url(cls, v: Any) -> str:
        s = str(v or "").strip()
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Logo URL must be a valid HTTP/HTTPS URL.")
        return s

    @field_validator("website_url", mode="before")
    @classmethod
    def validate_website_url(cls, v: Any) -> Optional[str]:
        if not v:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Website URL must start with http:// or https://")
        return s


class UpdateTechNewsSourceRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    logo_url: Optional[str] = Field(None, min_length=5)
    website_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            raise ValueError("Source name cannot be empty.")
        return s

    @field_validator("logo_url", mode="before")
    @classmethod
    def validate_logo_url(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Logo URL must be a valid HTTP/HTTPS URL.")
        return s

    @field_validator("website_url", mode="before")
    @classmethod
    def validate_website_url(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Website URL must start with http:// or https://")
        return s


class TechNewsSourceItem(BaseModel):
    id: str
    name: str
    logo_url: str
    website_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ── STORY SCHEMAS ─────────────────────────────────────────────────────────────

class CreateTechNewsRequest(BaseModel):
    source_id: str = Field(..., description="UUID of the parent tech news source")
    headline: str = Field("", max_length=300, description="Short, punchy news headline")
    title: Optional[str] = Field(None, max_length=300, description="Alias for headline")
    summary: str = Field(..., min_length=5, description="Executive summary of the news story")
    why_it_matters: Optional[str] = Field(None, description="Industry significance or interview relevance")
    content: Optional[str] = Field(None, description="Alias for why_it_matters / full detail content")
    cover_image_url: Optional[str] = Field(None, description="Optional high-res cover image URL")
    source_url: str = Field(..., min_length=5, description="Mandatory authoritative source URL")
    category: Optional[str] = Field("General", description="Topic category (e.g. AI & ML, Cloud, Open Source)")
    tags: List[str] = Field(default_factory=list, description="Relevant tech tags")
    status: TechNewsStatus = Field(TechNewsStatus.DRAFT, description="Story publication status")
    display_order: int = Field(0, description="Ordering within this source")
    visible_from: Optional[datetime] = None
    visible_until: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync headline and title
            headline_val = data.get("headline") or data.get("title")
            if headline_val:
                data["headline"] = str(headline_val).strip()
                data["title"] = str(headline_val).strip()
            # Sync why_it_matters and content
            content_val = data.get("why_it_matters") or data.get("content")
            if content_val:
                data["why_it_matters"] = str(content_val).strip()
                data["content"] = str(content_val).strip()
        return data

    @field_validator("headline", "summary", mode="before")
    @classmethod
    def validate_non_empty(cls, v: Any) -> str:
        s = str(v or "").strip()
        if not s:
            raise ValueError("Headline/Title and Summary cannot be empty.")
        return s

    @field_validator("source_url", mode="before")
    @classmethod
    def validate_source_url(cls, v: Any) -> str:
        s = str(v or "").strip()
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Original Source URL must start with http:// or https://")
        return s

    @field_validator("cover_image_url", mode="before")
    @classmethod
    def validate_cover_image_url(cls, v: Any) -> Optional[str]:
        if not v:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Cover image URL must start with http:// or https://")
        return s

    @field_validator("tags", mode="before")
    @classmethod
    def validate_tags(cls, v: Any) -> List[str]:
        if not v:
            return []
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return []


class UpdateTechNewsRequest(BaseModel):
    source_id: Optional[str] = None
    headline: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    why_it_matters: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    source_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[TechNewsStatus] = None
    display_order: Optional[int] = None
    visible_from: Optional[datetime] = None
    visible_until: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            headline_val = data.get("headline") or data.get("title")
            if headline_val is not None:
                data["headline"] = str(headline_val).strip()
                data["title"] = str(headline_val).strip()
            content_val = data.get("why_it_matters") or data.get("content")
            if content_val is not None:
                data["why_it_matters"] = str(content_val).strip()
                data["content"] = str(content_val).strip()
        return data

    @field_validator("headline", "summary", mode="before")
    @classmethod
    def validate_non_empty(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            raise ValueError("Field cannot be empty.")
        return s

    @field_validator("source_url", mode="before")
    @classmethod
    def validate_source_url(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Original Source URL must start with http:// or https://")
        return s

    @field_validator("cover_image_url", mode="before")
    @classmethod
    def validate_cover_image_url(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Cover image URL must start with http:// or https://")
        return s

    @field_validator("tags", mode="before")
    @classmethod
    def validate_tags(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return None
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return []


class TechNewsStoryItem(BaseModel):
    id: str
    source_id: str
    headline: str
    title: Optional[str] = None
    summary: str
    why_it_matters: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    source_url: str
    category: Optional[str] = None
    tags: List[str] = []
    status: str = TechNewsStatus.DRAFT.value
    visible_from: Optional[str] = None
    visible_until: Optional[str] = None
    published_at: Optional[str] = None
    display_order: int = 0
    created_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    # Joined source details
    source: Optional[TechNewsSourceItem] = None
    source_name: Optional[str] = None
    source_logo_url: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_story_item(cls, data: Any) -> Any:
        if isinstance(data, dict):
            hl = data.get("headline") or data.get("title")
            if hl:
                data["headline"] = str(hl)
                data["title"] = str(hl)
            cnt = data.get("why_it_matters") or data.get("content")
            if cnt:
                data["why_it_matters"] = str(cnt)
                data["content"] = str(cnt)
            src = data.get("source")
            if isinstance(src, dict):
                data.setdefault("source_name", src.get("name"))
                data.setdefault("source_logo_url", src.get("logo_url"))
            elif src and hasattr(src, "name"):
                data.setdefault("source_name", getattr(src, "name", None))
                data.setdefault("source_logo_url", getattr(src, "logo_url", None))
        return data


# ── STUDENT FEED SCHEMAS ──────────────────────────────────────────────────────

class GroupedTechNewsSourceResponse(BaseModel):
    id: str
    name: str
    logo_url: str
    website_url: Optional[str] = None
    display_order: int = 0
    stories: List[TechNewsStoryItem] = []
