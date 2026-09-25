"""
backend/models/student_progress.py
Pydantic schemas and models for student progress tracking, resume learning,
and module lesson progress (Phase 5).
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class StudentModuleProgressSummary(BaseModel):
    module_id: str = Field(..., description="UUID of the module")
    completed_lessons: int = Field(..., ge=0, description="Count of completed lessons in this module")
    total_lessons: int = Field(..., ge=0, description="Total published lessons in this module")
    progress_percentage: int = Field(..., ge=0, le=100, description="Rounded percentage (0-100)")
    lessons_complete: bool = Field(
        ...,
        description="True if all lessons in the module are completed. NOTE: Module is not fully complete until quiz passes in Phase 6."
    )


class StudentCourseProgressResponse(BaseModel):
    course_id: str = Field(..., description="UUID of the course")
    completed_lesson_ids: List[str] = Field(default_factory=list, description="List of completed lesson UUIDs")
    last_lesson_id: Optional[str] = Field(None, description="UUID of the student's last active lesson for resume")
    completed_lessons: int = Field(..., ge=0, description="Total completed lessons in the course")
    total_lessons: int = Field(..., ge=0, description="Total published lessons in the course")
    progress_percentage: int = Field(..., ge=0, le=100, description="Authoritative rounded progress percentage (0-100)")
    modules: List[StudentModuleProgressSummary] = Field(default_factory=list, description="Per-module lesson progress breakdown")


class StudentLessonProgressPayload(BaseModel):
    completed: Optional[bool] = Field(
        None,
        description="True to mark complete, False to mark incomplete, None to record view/resume without changing completion"
    )


class StudentLessonProgressItem(BaseModel):
    lesson_id: str
    course_id: str
    module_id: str
    completed: bool
    completed_at: Optional[str] = None
    last_viewed_at: Optional[str] = None


class StudentProgressMutationResponse(BaseModel):
    lesson: StudentLessonProgressItem
    course_progress: StudentCourseProgressResponse
