"""
backend/models/ai_mentor_personalization.py
Pydantic contracts for Phase 2C: Personalized AI Mentor.
Defines:
- Student Learning Profile
- Learning Roadmaps & Milestones
- Skill Gap Analysis
- Weekly Progress Reviews
- Adaptive Learning Recommendations
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class ExperienceLevel(str, Enum):
    Beginner = "Beginner"
    Intermediate = "Intermediate"
    Advanced = "Advanced"
    Student = "Student"


class RoadmapStatus(str, Enum):
    active = "active"
    archived = "archived"
    completed = "completed"


class MilestoneStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class SkillStatus(str, Enum):
    verified = "verified"
    self_reported = "self_reported"
    target_desired = "target_desired"
    confirmed_gap = "confirmed_gap"
    unevaluated = "unevaluated"


# ---------------------------------------------------------------------------
# Student Learning Profile Models
# ---------------------------------------------------------------------------

class StudentLearningProfile(BaseModel):
    user_id: str
    career_goal: str = Field(default="", max_length=255)
    experience_level: ExperienceLevel = ExperienceLevel.Beginner
    existing_skills: List[str] = Field(default_factory=list)
    target_skills: List[str] = Field(default_factory=list)
    learning_preferences: List[str] = Field(default_factory=list)
    preferred_daily_minutes: int = Field(default=60, ge=0, le=1440)
    short_term_objective: str = Field(default="", max_length=500)
    long_term_objective: str = Field(default="", max_length=1000)
    target_date: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @field_validator("existing_skills", "target_skills", "learning_preferences", mode="before")
    @classmethod
    def sanitize_string_lists(cls, v: Any) -> List[str]:
        if not v or not isinstance(v, list):
            return []
        cleaned = []
        for item in v:
            if item and str(item).strip():
                cleaned.append(str(item).strip()[:100])
        return cleaned[:50]


class UpdateLearningProfileRequest(BaseModel):
    career_goal: Optional[str] = Field(default=None, max_length=255)
    experience_level: Optional[ExperienceLevel] = None
    existing_skills: Optional[List[str]] = None
    target_skills: Optional[List[str]] = None
    learning_preferences: Optional[List[str]] = None
    preferred_daily_minutes: Optional[int] = Field(default=None, ge=0, le=1440)
    short_term_objective: Optional[str] = Field(default=None, max_length=500)
    long_term_objective: Optional[str] = Field(default=None, max_length=1000)
    target_date: Optional[str] = None


# ---------------------------------------------------------------------------
# Roadmap Models
# ---------------------------------------------------------------------------

class RoadmapMilestone(BaseModel):
    id: str = Field(..., max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=1000)
    stage_index: int = Field(default=1, ge=1)
    suggested_duration_minutes: Optional[int] = Field(default=60, ge=0, le=10080)
    skills_covered: List[str] = Field(default_factory=list)
    status: MilestoneStatus = MilestoneStatus.not_started
    prerequisites: List[str] = Field(default_factory=list)
    target_date: Optional[str] = None


class RoadmapStage(BaseModel):
    stage_index: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=1000)
    milestones: List[RoadmapMilestone] = Field(default_factory=list)


class StudentLearningRoadmap(BaseModel):
    id: str
    user_id: str
    title: str = Field(..., max_length=255)
    career_goal: str = Field(..., max_length=255)
    starting_level: ExperienceLevel = ExperienceLevel.Beginner
    stages: List[RoadmapStage] = Field(default_factory=list)
    milestones: List[RoadmapMilestone] = Field(default_factory=list)
    status: RoadmapStatus = RoadmapStatus.active
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class GenerateRoadmapRequest(BaseModel):
    career_goal: str = Field(..., min_length=2, max_length=255)
    starting_level: Optional[ExperienceLevel] = ExperienceLevel.Beginner
    focus_areas: Optional[List[str]] = Field(default_factory=list)
    target_months: Optional[int] = Field(default=3, ge=1, le=24)


class ConvertMilestonesToTasksRequest(BaseModel):
    roadmap_id: str
    milestone_ids: List[str] = Field(..., min_length=1, max_length=20)


# ---------------------------------------------------------------------------
# Skill Gap Analysis Models
# ---------------------------------------------------------------------------

class SkillGapItem(BaseModel):
    skill_name: str
    status: SkillStatus
    importance: str = "critical"  # "critical" | "recommended" | "optional"
    reason: str = ""
    recommended_action: str = ""


class SkillGapAnalysisResult(BaseModel):
    target_role: str
    current_level: str
    confirmed_skills: List[str] = Field(default_factory=list)
    missing_critical_skills: List[str] = Field(default_factory=list)
    skills_in_progress: List[str] = Field(default_factory=list)
    gaps: List[SkillGapItem] = Field(default_factory=list)
    recommended_next_steps: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Progress Insights & Weekly Review Models
# ---------------------------------------------------------------------------

class WeeklyProgressReviewResult(BaseModel):
    start_date: str
    end_date: str
    timezone: str
    tasks_completed_count: int = 0
    completed_tasks: List[Dict[str, Any]] = Field(default_factory=list)
    pending_tasks_count: int = 0
    overdue_tasks_count: int = 0
    overdue_tasks: List[Dict[str, Any]] = Field(default_factory=list)
    active_goals: List[str] = Field(default_factory=list)
    milestones_progressed: List[str] = Field(default_factory=list)
    bottlenecks: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    suggested_priorities_next_week: List[str] = Field(default_factory=list)
