"""
backend/models/skillbits.py
Pydantic v2 domain schemas for SkillBits (short-form educational video learning units).
Phase: Step 1 (Foundation)
"""

from enum import Enum
from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator


class SkillBitDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

    @classmethod
    def _missing_(cls, value: object) -> Optional["SkillBitDifficulty"]:
        if isinstance(value, str):
            val_lower = value.strip().lower()
            for member in cls:
                if member.value == val_lower:
                    return member
        return None


class SkillBitStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

    @classmethod
    def _missing_(cls, value: object) -> Optional["SkillBitStatus"]:
        if isinstance(value, str):
            val_lower = value.strip().lower()
            for member in cls:
                if member.value == val_lower:
                    return member
        return None


class VideoProvider(str, Enum):
    MUX = "mux"

    @classmethod
    def _missing_(cls, value: object) -> Optional["VideoProvider"]:
        if isinstance(value, str):
            val_lower = value.strip().lower()
            for member in cls:
                if member.value == val_lower:
                    return member
        return None


# ── REQUEST SCHEMAS ───────────────────────────────────────────────────────────

class CreateSkillBitRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="SkillBit title")
    description: Optional[str] = Field(None, max_length=2000, description="Educational overview")
    topic: Optional[str] = Field(None, max_length=100, description="Topic or category e.g. React, Python")
    difficulty: SkillBitDifficulty = Field(..., description="Target learner level: beginner, intermediate, advanced")
    duration_seconds: Optional[int] = Field(None, description="Video duration in seconds (> 0)")
    thumbnail_url: Optional[str] = Field(None, max_length=1000, description="Video thumbnail URL")

    # Video provider abstraction (Mux supported now, expandable)
    video_provider: Optional[VideoProvider] = Field(None, description="Hosting provider ('mux')")
    video_asset_id: Optional[str] = Field(None, max_length=255, description="Provider internal asset ID")
    playback_id: Optional[str] = Field(None, max_length=255, description="Provider public playback ID")

    # Lifecycle & status
    status: SkillBitStatus = Field(default=SkillBitStatus.DRAFT, description="Initial publication status")

    # Normalized relational associations (UUIDs from skills_cache)
    skill_ids: Optional[List[str]] = Field(default_factory=list, description="Associated skills from skills_cache")

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v: Any) -> str:
        s = str(v or "").strip()
        if not s:
            raise ValueError("Title is required and cannot be empty.")
        if len(s) > 255:
            raise ValueError("Title cannot exceed 255 characters.")
        return s

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if len(s) > 2000:
            raise ValueError("Description cannot exceed 2000 characters.")
        return s if s else None

    @field_validator("topic", mode="before")
    @classmethod
    def validate_topic(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if len(s) > 100:
            raise ValueError("Topic cannot exceed 100 characters.")
        return s if s else None

    @field_validator("duration_seconds", mode="before")
    @classmethod
    def validate_duration(cls, v: Any) -> Optional[int]:
        if v is None or v == "":
            return None
        try:
            val = int(v)
        except (ValueError, TypeError):
            raise ValueError("Duration seconds must be a positive integer.")
        if val <= 0:
            raise ValueError("Duration seconds must be greater than 0.")
        return val

    @field_validator("thumbnail_url", mode="before")
    @classmethod
    def validate_thumbnail(cls, v: Any) -> Optional[str]:
        if not v:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Thumbnail URL must be a valid HTTP or HTTPS URL.")
        return s

    @field_validator("video_asset_id", "playback_id", mode="before")
    @classmethod
    def sanitize_video_identifiers(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None

    @field_validator("skill_ids", mode="before")
    @classmethod
    def validate_skill_ids(cls, v: Any) -> List[str]:
        if not v:
            return []
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return []


class UpdateSkillBitRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    topic: Optional[str] = Field(None, max_length=100)
    difficulty: Optional[SkillBitDifficulty] = None
    duration_seconds: Optional[int] = None
    thumbnail_url: Optional[str] = Field(None, max_length=1000)
    video_provider: Optional[VideoProvider] = None
    video_asset_id: Optional[str] = Field(None, max_length=255)
    playback_id: Optional[str] = Field(None, max_length=255)
    status: Optional[SkillBitStatus] = None
    skill_ids: Optional[List[str]] = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            raise ValueError("Title cannot be empty.")
        if len(s) > 255:
            raise ValueError("Title cannot exceed 255 characters.")
        return s

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if len(s) > 2000:
            raise ValueError("Description cannot exceed 2000 characters.")
        return s

    @field_validator("topic", mode="before")
    @classmethod
    def validate_topic(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if len(s) > 100:
            raise ValueError("Topic cannot exceed 100 characters.")
        return s

    @field_validator("duration_seconds", mode="before")
    @classmethod
    def validate_duration(cls, v: Any) -> Optional[int]:
        if v is None:
            return None
        try:
            val = int(v)
        except (ValueError, TypeError):
            raise ValueError("Duration seconds must be a positive integer.")
        if val <= 0:
            raise ValueError("Duration seconds must be greater than 0.")
        return val

    @field_validator("thumbnail_url", mode="before")
    @classmethod
    def validate_thumbnail(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        if not s.startswith("http://") and not s.startswith("https://"):
            raise ValueError("Thumbnail URL must be a valid HTTP or HTTPS URL.")
        return s

    @field_validator("video_asset_id", "playback_id", mode="before")
    @classmethod
    def sanitize_video_identifiers(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None

    @field_validator("skill_ids", mode="before")
    @classmethod
    def validate_skill_ids(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return None
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return []


# ── RESPONSE SCHEMAS ──────────────────────────────────────────────────────────

class StudentSkillBitResponse(BaseModel):
    """
    Sanitized projection for the student-facing full-screen Reels learning player.
    Excludes internal audit attributes and administrative provider credentials.
    """
    id: str
    title: str
    description: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    duration_seconds: Optional[int] = None
    thumbnail_url: Optional[str] = None
    video_provider: Optional[str] = None
    playback_id: Optional[str] = None
    skills: List[Dict[str, Any]] = Field(default_factory=list)
    courses: List[Dict[str, Any]] = Field(default_factory=list)
    lessons: List[Dict[str, Any]] = Field(default_factory=list)
    roadmaps: List[Dict[str, Any]] = Field(default_factory=list)
    published_at: Optional[str] = None


class AdminSkillBitResponse(BaseModel):
    """
    Full administrative model for CMS content management and auditing.
    """
    id: str
    title: str
    description: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    duration_seconds: Optional[int] = None
    thumbnail_url: Optional[str] = None
    video_provider: Optional[str] = None
    video_asset_id: Optional[str] = None
    playback_id: Optional[str] = None
    status: str
    published_at: Optional[str] = None
    created_by: str
    created_at: str
    updated_at: str
    skills: List[Dict[str, Any]] = Field(default_factory=list)
    courses: List[Dict[str, Any]] = Field(default_factory=list)
    lessons: List[Dict[str, Any]] = Field(default_factory=list)
    roadmaps: List[Dict[str, Any]] = Field(default_factory=list)


class SkillBitsListResponse(BaseModel):
    total: int
    items: List[StudentSkillBitResponse]


class AdminSkillBitsListResponse(BaseModel):
    total: int
    items: List[AdminSkillBitResponse]
