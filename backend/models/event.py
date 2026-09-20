"""
backend/models/event.py
Pydantic schemas and validation rules for SkillsCatalyst Events & Hackathons CMS.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
import re
from pydantic import BaseModel, Field, field_validator, model_validator


class EventCategory(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"


class EventMode(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    HYBRID = "hybrid"


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


URL_REGEX = re.compile(
    r"^(https?://)?"  # http:// or https:// (optional if relative path or domain)
    r"(([A-Za-z0-9-]+\.)+[A-Za-z]{2,}|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # domain...
    r"(:\d+)?"  # optional port
    r"(/.*)?$",
    re.IGNORECASE,
)


def is_valid_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    # Allow data URIs or local uploaded image paths
    if u.startswith("/") or u.startswith("data:image/"):
        return True
    return bool(URL_REGEX.match(u))


class CreateEventRequest(BaseModel):
    event_name: str = Field(..., min_length=2, max_length=255, description="Name of the event/hackathon")
    conducted_by_college: str = Field(..., min_length=2, max_length=255, description="Host college or organization")
    event_link: str = Field(..., description="External registration or portal link")
    registration_deadline: datetime = Field(..., description="Last date for registration")
    start_date: datetime = Field(..., description="Event start date and time")
    end_date: datetime = Field(..., description="Event end date and time")
    category: EventCategory = Field(..., description="Event category: 'online' or 'offline'")
    banner_url: str = Field(..., description="URL or path to event poster / banner image")
    location: Optional[str] = Field(None, max_length=255, description="Physical venue / city (optional for online)")
    description: Optional[str] = Field(None, max_length=5000, description="Detailed event synopsis")

    # Hackathon-specific fields
    is_hackathon: bool = Field(default=False, description="Flag indicating whether event is a hackathon")
    prize_pool: Optional[str] = Field(None, max_length=100, description="Prize pool amount or rewards")
    team_size: Optional[str] = Field(None, max_length=50, description="Allowed team size (e.g. '2-4')")
    mode: Optional[EventMode] = Field(None, description="Hackathon format: online, offline, or hybrid")

    # Visibility controls
    status: EventStatus = Field(default=EventStatus.DRAFT, description="Initial publication status")
    visible_from: Optional[datetime] = Field(None, description="Start date for public visibility")
    visible_until: Optional[datetime] = Field(None, description="End date for public visibility")

    @field_validator("event_link")
    @classmethod
    def validate_event_link(cls, v: str) -> str:
        v = v.strip()
        if not is_valid_url(v):
            raise ValueError("Event link must be a valid URL (e.g., https://example.com/register)")
        return v

    @field_validator("banner_url")
    @classmethod
    def validate_banner_url(cls, v: str) -> str:
        v = v.strip()
        if not is_valid_url(v):
            raise ValueError("Banner URL must be a valid URL or path")
        return v

    @model_validator(mode="after")
    def validate_dates_and_hackathon_rules(self):
        # 1. Date order: end_date >= start_date
        if self.end_date < self.start_date:
            raise ValueError("End date must be on or after the start date")

        # 2. Visibility window: visible_until > visible_from
        if self.visible_from and self.visible_until:
            if self.visible_until <= self.visible_from:
                raise ValueError("Visibility end date (visible_until) must be after visibility start date (visible_from)")

        # 3. Hackathon fields cleanup when is_hackathon is False
        if not self.is_hackathon:
            self.prize_pool = None
            self.team_size = None
            self.mode = None
        else:
            # If mode is not set on hackathon, default to matching category if available
            if not self.mode:
                if self.category == EventCategory.ONLINE:
                    self.mode = EventMode.ONLINE
                else:
                    self.mode = EventMode.OFFLINE

        return self


class UpdateEventRequest(BaseModel):
    event_name: Optional[str] = Field(None, min_length=2, max_length=255)
    conducted_by_college: Optional[str] = Field(None, min_length=2, max_length=255)
    event_link: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    category: Optional[EventCategory] = None
    banner_url: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

    # Hackathon fields
    is_hackathon: Optional[bool] = None
    prize_pool: Optional[str] = None
    team_size: Optional[str] = None
    mode: Optional[EventMode] = None

    # Visibility fields
    status: Optional[EventStatus] = None
    visible_from: Optional[datetime] = None
    visible_until: Optional[datetime] = None

    @field_validator("event_link")
    @classmethod
    def validate_event_link_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not is_valid_url(v):
                raise ValueError("Event link must be a valid URL")
        return v

    @field_validator("banner_url")
    @classmethod
    def validate_banner_url_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not is_valid_url(v):
                raise ValueError("Banner URL must be a valid URL or path")
        return v

    @model_validator(mode="after")
    def validate_date_coherence(self):
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("End date must be on or after start date")
        if self.visible_from and self.visible_until:
            if self.visible_until <= self.visible_from:
                raise ValueError("visible_until must be after visible_from")
        return self


class EventResponse(BaseModel):
    id: str
    event_name: str
    conducted_by_college: str
    event_link: str
    registration_deadline: str
    start_date: str
    end_date: str
    location: Optional[str] = None
    category: str
    banner_url: str
    description: Optional[str] = None
    is_hackathon: bool = False
    prize_pool: Optional[str] = None
    team_size: Optional[str] = None
    mode: Optional[str] = None
    status: str
    visible_from: Optional[str] = None
    visible_until: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class EventListResponse(BaseModel):
    total: int
    events: List[EventResponse]
