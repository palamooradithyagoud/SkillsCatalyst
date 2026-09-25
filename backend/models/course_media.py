"""
backend/models/course_media.py
Strict Pydantic Models for Course Lesson Media Foundation (Phase 3A).
Scope: Backend models for media uploads, metadata records, listing, and deletion.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CourseLessonMediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique media UUID")
    course_id: str = Field(..., description="Parent course UUID")
    module_id: str = Field(..., description="Parent module UUID")
    lesson_id: str = Field(..., description="Parent lesson UUID")
    storage_path: str = Field(..., description="Authoritative Supabase storage path")
    original_filename: str = Field(..., description="Sanitized client filename")
    mime_type: str = Field(..., description="Validated MIME type (e.g. image/jpeg, image/png, image/webp, image/gif)")
    size_bytes: int = Field(..., ge=1, le=10485760, description="File size in bytes (max 10MB)")
    public_url: str = Field(..., description="CDN/Public URL for the uploaded media")
    created_by: Optional[str] = Field(default=None, description="User ID of uploader")
    created_at: str = Field(..., description="UTC creation timestamp")
    updated_at: str = Field(..., description="UTC update timestamp")


class CourseLessonMediaListResponse(BaseModel):
    total: int = Field(..., ge=0, description="Total media items for the lesson")
    items: List[CourseLessonMediaResponse] = Field(default_factory=list, description="Media items")


class CourseLessonMediaDeleteResponse(BaseModel):
    message: str = Field(default="Media deleted successfully", description="Status message")
    id: str = Field(..., description="Deleted media UUID")
    storage_path: str = Field(..., description="Storage path deleted")
