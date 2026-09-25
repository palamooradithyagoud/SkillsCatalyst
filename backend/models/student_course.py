"""
backend/models/student_course.py
Strict Pydantic response models for student-facing course experience (Phase 4).
Excludes admin audit fields, creator IDs, draft statuses, and quiz answer keys.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class StudentCourseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    difficulty: str
    estimated_duration_minutes: Optional[int] = None
    status: str
    published_at: Optional[str] = None
    modules_count: int = 0
    lessons_count: int = 0


class StudentCourseListResponse(BaseModel):
    total: int
    items: List[StudentCourseSummary]
    page: int
    page_size: int
    total_pages: int


class StudentLessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    title: str
    slug: Optional[str] = None
    short_description: Optional[str] = None
    position: int
    estimated_duration_minutes: Optional[int] = None


class StudentQuizSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    title: str
    description: Optional[str] = None


class StudentModuleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    position: int
    lessons: List[StudentLessonSummary] = Field(default_factory=list)
    quiz: Optional[StudentQuizSummary] = None


class StudentCourseDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    difficulty: str
    estimated_duration_minutes: Optional[int] = None
    status: str
    published_at: Optional[str] = None
    modules_count: int = 0
    lessons_count: int = 0
    modules: List[StudentModuleSummary] = Field(default_factory=list)


class StudentLessonNavigationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    module_id: str
    module_title: Optional[str] = None


class StudentLessonContent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    schema_version: int = 1
    blocks: List[Dict[str, Any]] = Field(default_factory=list)


class StudentLessonDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course: Dict[str, Any]
    module: Dict[str, Any]
    lesson: StudentLessonSummary
    content: StudentLessonContent
    prev_lesson: Optional[StudentLessonNavigationItem] = None
    next_lesson: Optional[StudentLessonNavigationItem] = None
