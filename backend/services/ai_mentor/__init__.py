"""
SkillsCatalyst AI Mentor Services Package
Phase 1: Production-Grade Student Context Aggregator
"""

from backend.services.ai_mentor.context_models import (
    MentorContext,
    StudentProfileContext,
    CareerContext,
    SkillsContext,
    ProjectsContext,
    ExperienceContext,
    RoadmapContext,
    LearningContext,
    CodingDSAContext,
    ResumeContext,
    GamificationContext,
    ReadinessContext,
    ContextMetadata,
)
from backend.services.ai_mentor.context_sanitizer import (
    sanitize_text,
    format_context_for_prompt,
)
from backend.services.ai_mentor.context_aggregator import (
    build_student_mentor_context,
    get_formatted_student_context_for_mentor,
)

__all__ = [
    "MentorContext",
    "StudentProfileContext",
    "CareerContext",
    "SkillsContext",
    "ProjectsContext",
    "ExperienceContext",
    "RoadmapContext",
    "LearningContext",
    "CodingDSAContext",
    "ResumeContext",
    "GamificationContext",
    "ReadinessContext",
    "ContextMetadata",
    "sanitize_text",
    "format_context_for_prompt",
    "build_student_mentor_context",
    "get_formatted_student_context_for_mentor",
]
