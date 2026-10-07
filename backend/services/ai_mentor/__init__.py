"""
SkillsCatalyst AI Mentor Services Package
Phase 1: Production-Grade Student Context Aggregator
Phase 2: Persistent Conversation Memory
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
from backend.services.ai_mentor.conversation_models import (
    MessageRole,
    MessageResponse,
    ConversationResponse,
    ConversationListResponse,
    ConversationDetailResponse,
    ConversationCreateRequest,
    MentorChatRequest,
    MentorChatResponse,
)
from backend.services.ai_mentor.conversation_service import (
    derive_conversation_title,
    create_conversation,
    get_conversation,
    list_conversations,
    delete_conversation,
    save_message,
    get_recent_messages,
)
from backend.services.ai_mentor.prompt_builder import (
    build_mentor_llm_messages,
)

__all__ = [
    # Phase 1: Context Aggregator
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
    # Phase 2: Persistent Conversation Memory
    "MessageRole",
    "MessageResponse",
    "ConversationResponse",
    "ConversationListResponse",
    "ConversationDetailResponse",
    "ConversationCreateRequest",
    "MentorChatRequest",
    "MentorChatResponse",
    "derive_conversation_title",
    "create_conversation",
    "get_conversation",
    "list_conversations",
    "delete_conversation",
    "save_message",
    "get_recent_messages",
    "build_mentor_llm_messages",
]
