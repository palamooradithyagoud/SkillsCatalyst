"""
backend/models/scholarship.py
Pydantic schemas and validation rules for SkillsCatalyst Scholarships CMS.
Enforces the 7 core content fields + visibility lifecycle fields.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
import re
from pydantic import BaseModel, Field, field_validator, model_validator


class ScholarshipStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


URL_REGEX = re.compile(
    r"^(https?://)"  # http:// or https:// required for external application links
    r"(([A-Za-z0-9-]+\.)+[A-Za-z]{2,}|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"
    r"(:\d+)?"
    r"(/.*)?$",
    re.IGNORECASE,
)

IMAGE_URL_REGEX = re.compile(
    r"^(https?://|data:image/|/)"
    r".*$",
    re.IGNORECASE,
)


def is_valid_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    return bool(URL_REGEX.match(u))


def is_valid_image_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    return bool(IMAGE_URL_REGEX.match(u))


class CreateScholarshipRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Scholarship Name")
    provided_by: str = Field(..., min_length=2, max_length=255, description="Scholarship Provided By organization/foundation")
    qualification_required: str = Field(..., min_length=2, max_length=255, description="Required education or qualification")
    eligibility: str = Field(..., min_length=5, max_length=5000, description="Detailed eligibility criteria")
    requirements: str = Field(..., min_length=5, max_length=10000, description="Submission documents and requirements")
    application_url: str = Field(..., description="Official portal/application external URL")
    image_url: Optional[str] = Field(None, description="Banner or poster image URL")

    # Lifecycle & visibility
    status: ScholarshipStatus = Field(default=ScholarshipStatus.DRAFT, description="Publication status")
    visible_from: Optional[datetime] = Field(None, description="Start date for student visibility")
    visible_until: Optional[datetime] = Field(None, description="End date for student visibility")

    @field_validator("name", "provided_by", "qualification_required", "eligibility", "requirements")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return v.strip()

    @field_validator("application_url")
    @classmethod
    def validate_application_url(cls, v: str) -> str:
        v = v.strip()
        if not is_valid_url(v):
            raise ValueError("Application URL must be a valid external URL starting with http:// or https://")
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v and not is_valid_image_url(v):
                raise ValueError("Image URL must be a valid storage URL or path")
        return v or None

    @model_validator(mode="after")
    def validate_visibility_window(self):
        if self.visible_from and self.visible_until:
            if self.visible_until <= self.visible_from:
                raise ValueError("Visibility end date (visible_until) must be after visibility start date (visible_from)")
        return self


class UpdateScholarshipRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    provided_by: Optional[str] = Field(None, min_length=2, max_length=255)
    qualification_required: Optional[str] = Field(None, min_length=2, max_length=255)
    eligibility: Optional[str] = Field(None, min_length=5, max_length=5000)
    requirements: Optional[str] = Field(None, min_length=5, max_length=10000)
    application_url: Optional[str] = None
    image_url: Optional[str] = None

    status: Optional[ScholarshipStatus] = None
    visible_from: Optional[datetime] = None
    visible_until: Optional[datetime] = None

    @field_validator("name", "provided_by", "qualification_required", "eligibility", "requirements")
    @classmethod
    def validate_non_empty_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Field cannot be empty or whitespace only")
            return v.strip()
        return v

    @field_validator("application_url")
    @classmethod
    def validate_application_url_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not is_valid_url(v):
                raise ValueError("Application URL must be a valid external URL starting with http:// or https://")
            return v
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v and not is_valid_image_url(v):
                raise ValueError("Image URL must be a valid storage URL or path")
            return v or None
        return v

    @model_validator(mode="after")
    def validate_visibility_window(self):
        if self.visible_from and self.visible_until:
            if self.visible_until <= self.visible_from:
                raise ValueError("Visibility end date (visible_until) must be after visibility start date (visible_from)")
        return self


class ScholarshipResponse(BaseModel):
    id: str
    name: str
    provided_by: str
    qualification_required: str
    eligibility: str
    requirements: str
    application_url: str
    image_url: Optional[str] = None
    status: str
    visible_from: Optional[str] = None
    visible_until: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ScholarshipListResponse(BaseModel):
    total: int
    scholarships: List[ScholarshipResponse]
