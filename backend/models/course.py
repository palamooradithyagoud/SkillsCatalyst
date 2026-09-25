"""
backend/models/course.py
Strict Pydantic Models for SkillsCatalyst Course System (Phase 1).
Phase 1 Scope: Foundation + Module Quiz Foundation.
Excludes: student quiz attempts, progress, lesson blocks, certificates, XP, gamification.
"""

from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ── Canonical Enums ────────────────────────────────────────────────────────────

class CourseStatus(str, Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class CourseDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class QuestionType(str, Enum):
    SINGLE_SELECT = "SINGLE_SELECT"
    MULTI_SELECT = "MULTI_SELECT"
    TRUE_FALSE = "TRUE_FALSE"


class CourseSortOption(str, Enum):
    NEWEST = "newest"
    OLDEST = "oldest"
    TITLE_ASC = "title_asc"
    TITLE_DESC = "title_desc"
    UPDATED_AT = "updated_at"


# ── Generic Reorder Models ─────────────────────────────────────────────────────

class ReorderItem(BaseModel):
    id: str = Field(..., description="Entity UUID")
    position: int = Field(..., ge=1, description="1-indexed target position")


class ReorderRequest(BaseModel):
    items: List[ReorderItem] = Field(..., min_length=1, description="Ordered list of items")


# ── Quiz Option Models ────────────────────────────────────────────────────────

class QuizOptionCreate(BaseModel):
    option_text: str = Field(..., min_length=1, max_length=1000, description="Option text")
    is_correct: bool = Field(default=False, description="Server-side correctness flag")
    position: Optional[int] = Field(default=None, ge=1, description="1-indexed position")

    @field_validator("option_text")
    @classmethod
    def validate_option_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Option text cannot be empty or whitespace only.")
        return clean


class QuizOptionUpdate(BaseModel):
    option_text: Optional[str] = Field(default=None, min_length=1, max_length=1000)
    is_correct: Optional[bool] = Field(default=None)
    position: Optional[int] = Field(default=None, ge=1)

    @field_validator("option_text")
    @classmethod
    def validate_option_text(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Option text cannot be empty or whitespace only.")
            return clean
        return None


class QuizOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    option_text: str
    is_correct: bool
    position: int
    created_at: str
    updated_at: str


# ── Quiz Question Models ──────────────────────────────────────────────────────

class QuizQuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=1, max_length=2000, description="Question prompt")
    question_type: QuestionType = Field(default=QuestionType.SINGLE_SELECT, description="Question format")
    position: Optional[int] = Field(default=None, ge=1, description="1-indexed position")
    explanation: Optional[str] = Field(default=None, max_length=2000, description="Post-answer rationale")
    options: Optional[List[QuizOptionCreate]] = Field(default=None, description="Optional nested options for creation")

    @field_validator("question_text")
    @classmethod
    def validate_question_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Question text cannot be empty or whitespace only.")
        return clean


class QuizQuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    question_type: Optional[QuestionType] = Field(default=None)
    position: Optional[int] = Field(default=None, ge=1)
    explanation: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("question_text")
    @classmethod
    def validate_question_text(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Question text cannot be empty or whitespace only.")
            return clean
        return None


class QuizQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    quiz_id: str
    question_text: str
    question_type: str
    position: int
    explanation: Optional[str] = None
    options: List[QuizOptionResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str


# ── Module Quiz Models ────────────────────────────────────────────────────────

class CourseQuizCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Quiz title")
    description: Optional[str] = Field(default=None, max_length=1000, description="Quiz instructions")
    status: Optional[str] = Field(default="DRAFT", description="Quiz status: DRAFT, PUBLISHED, ARCHIVED")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Quiz title cannot be empty.")
        return clean


class CourseQuizUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[str] = Field(default=None)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Quiz title cannot be empty.")
            return clean
        return None


class CourseQuizResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    title: str
    description: Optional[str] = None
    status: str
    questions: List[QuizQuestionResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str


# ── Course Lesson Models (Metadata Only) ──────────────────────────────────────

class CourseLessonCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Lesson title")
    slug: Optional[str] = Field(default=None, max_length=255, description="Lesson URL slug")
    short_description: Optional[str] = Field(default=None, max_length=1000, description="Summary")
    position: Optional[int] = Field(default=None, ge=1, description="1-indexed position in module")
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=0, description="Estimated minutes")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Lesson title cannot be empty.")
        return clean


class CourseLessonUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)
    short_description: Optional[str] = Field(default=None, max_length=1000)
    position: Optional[int] = Field(default=None, ge=1)
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=0)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Lesson title cannot be empty.")
            return clean
        return None


class CourseLessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    title: str
    slug: Optional[str] = None
    short_description: Optional[str] = None
    position: int
    estimated_duration_minutes: Optional[int] = None
    created_at: str
    updated_at: str


# ── Course Module Models ──────────────────────────────────────────────────────

class CourseModuleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Module title")
    description: Optional[str] = Field(default=None, max_length=2000, description="Module overview")
    position: Optional[int] = Field(default=None, ge=1, description="1-indexed position in course")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Module title cannot be empty.")
        return clean


class CourseModuleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    position: Optional[int] = Field(default=None, ge=1)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Module title cannot be empty.")
            return clean
        return None


class CourseModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    position: int
    lessons: List[CourseLessonResponse] = Field(default_factory=list)
    quiz: Optional[CourseQuizResponse] = None
    created_at: str
    updated_at: str


# ── Course Models ─────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Course title")
    short_description: Optional[str] = Field(default=None, max_length=1000, description="Brief summary")
    description: Optional[str] = Field(default=None, description="Detailed syllabus or overview")
    thumbnail_url: Optional[str] = Field(default=None, description="Cover image URL")
    category: Optional[str] = Field(default=None, max_length=100, description="Category classification")
    difficulty: CourseDifficulty = Field(default=CourseDifficulty.BEGINNER, description="Skill level")
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=0, description="Total minutes")
    status: Optional[CourseStatus] = Field(default=CourseStatus.DRAFT, description="Initial status")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Course title cannot be empty.")
        return clean


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    short_description: Optional[str] = Field(default=None, max_length=1000)
    description: Optional[str] = Field(default=None)
    thumbnail_url: Optional[str] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)
    difficulty: Optional[CourseDifficulty] = Field(default=None)
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=0)
    status: Optional[CourseStatus] = Field(default=None)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Course title cannot be empty.")
            return clean
        return None


class CourseResponse(BaseModel):
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
    created_by: str
    created_at: str
    updated_at: str
    published_at: Optional[str] = None
    archived_at: Optional[str] = None
    modules_count: Optional[int] = 0
    lessons_count: Optional[int] = 0


class CourseDetailResponse(BaseModel):
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
    created_by: str
    created_at: str
    updated_at: str
    published_at: Optional[str] = None
    archived_at: Optional[str] = None
    modules: List[CourseModuleResponse] = Field(default_factory=list)


class CourseListResponse(BaseModel):
    total: int
    items: List[CourseResponse]
    page: int
    page_size: int
    total_pages: int
