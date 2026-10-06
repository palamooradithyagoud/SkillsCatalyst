"""
backend/services/ai_mentor/context_models.py
Strongly typed Pydantic data models for the AI Mentor Student Context Aggregator.
Represents a minimal, structured, permission-safe contract of the student's actual state.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class StudentProfileContext(BaseModel):
    """Core academic and biographical profile summary."""
    name: str = Field(default="Learner", description="Student display name")
    college: Optional[str] = Field(default=None, description="College or university name")
    department: Optional[str] = Field(default=None, description="Academic department or branch")
    academic_year: Optional[str] = Field(default=None, description="Academic year or graduation class")
    headline: Optional[str] = Field(default=None, description="Professional headline or bio snippet")


class CareerContext(BaseModel):
    """Target roles, preferred industries, and target companies."""
    target_roles: List[str] = Field(default_factory=list, description="Target career roles e.g. Full Stack Developer")
    preferred_industries: List[str] = Field(default_factory=list, description="Preferred industries")
    target_companies: List[str] = Field(default_factory=list, description="Dream or target companies")
    preferred_locations: List[str] = Field(default_factory=list, description="Target work locations")
    work_arrangements: List[str] = Field(default_factory=list, description="Remote, Hybrid, On-site")


class SkillItem(BaseModel):
    skill_name: str
    category: str = "Programming"
    proficiency: str = "Intermediate"


class SkillsContext(BaseModel):
    """Normalized technical skills."""
    technical_skills: List[SkillItem] = Field(default_factory=list, description="Verified or listed student skills (max 20)")


class ProjectItem(BaseModel):
    project_name: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    currently_working: bool = False


class ProjectsContext(BaseModel):
    """Highlighted recent student projects (max 3)."""
    top_projects: List[ProjectItem] = Field(default_factory=list, description="Top 3 active or completed projects")


class ExperienceItem(BaseModel):
    company_name: str
    role: str
    work_type: str = "Remote"
    currently_working: bool = False
    description: Optional[str] = None


class ExperienceContext(BaseModel):
    """Recent work/internship experience (max 3)."""
    experiences: List[ExperienceItem] = Field(default_factory=list, description="Top 3 recent experiences")


class RoadmapContext(BaseModel):
    """Active AI learning roadmap and milestone progress."""
    has_active_roadmap: bool = False
    roadmap_id: Optional[str] = None
    roadmap_title: Optional[str] = None
    progress_percent: int = 0
    completed_milestones: int = 0
    total_milestones: int = 0
    current_module: Optional[str] = None
    next_module: Optional[str] = None


class LearningContext(BaseModel):
    """Video learning and course progression."""
    completed_videos: int = 0
    total_videos: int = 0
    completion_percent: int = 0
    saved_playlists_count: int = 0


class CodingDSAContext(BaseModel):
    """External coding platform metrics (LeetCode, GFG, etc.) and problem count."""
    total_problems_solved: int = 0
    leetcode_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    leetcode_username: Optional[str] = None
    leetcode_ranking: Optional[int] = None
    recent_solved_titles: List[str] = Field(default_factory=list, description="Top 3 recently solved question titles")


class ResumeContext(BaseModel):
    """Latest ATS resume evaluation summary."""
    has_resume_review: bool = False
    overall_score: Optional[float] = None
    ats_compatibility_score: Optional[float] = None
    skills_match_score: Optional[float] = None
    experience_score: Optional[float] = None
    target_role: Optional[str] = None
    top_improvements: List[str] = Field(default_factory=list, description="Top 3 bullet fixes or suggestions")


class GamificationContext(BaseModel):
    """Active streak, level, XP, and platform engagement."""
    streak_days: int = 0
    level: int = 0
    total_xp: int = 0
    success_rate: float = 0.0


class ReadinessContext(BaseModel):
    """Personal Readiness Index (PRI) comprehensive career readiness rating."""
    personal_readiness_index: float = 0.0
    learning_weight_pct: int = 15
    resume_weight_pct: int = 35
    coding_weight_pct: int = 35
    roadmap_weight_pct: int = 15


class ContextMetadata(BaseModel):
    """Observability metadata without exposing sensitive credentials."""
    generated_at: str
    user_id_hash: str
    duration_ms: float
    cached: bool = False


class MentorContext(BaseModel):
    """
    Master Aggregated Student Context for SkillsCatalyst AI Mentor.
    Immutable, safe, minimal representation injected into LLM system prompts.
    """
    student: StudentProfileContext = Field(default_factory=StudentProfileContext)
    career: CareerContext = Field(default_factory=CareerContext)
    skills: SkillsContext = Field(default_factory=SkillsContext)
    projects: ProjectsContext = Field(default_factory=ProjectsContext)
    experience: ExperienceContext = Field(default_factory=ExperienceContext)
    roadmap: RoadmapContext = Field(default_factory=RoadmapContext)
    learning: LearningContext = Field(default_factory=LearningContext)
    dsa: CodingDSAContext = Field(default_factory=CodingDSAContext)
    resume: ResumeContext = Field(default_factory=ResumeContext)
    gamification: GamificationContext = Field(default_factory=GamificationContext)
    readiness: ReadinessContext = Field(default_factory=ReadinessContext)
    metadata: ContextMetadata
