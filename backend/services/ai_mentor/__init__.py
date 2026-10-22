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
from backend.services.ai_mentor.task_service import (
    fetch_authenticated_user_tasks,
    format_tasks_for_mentor_prompt,
    find_matching_tasks,
    extract_and_validate_proposals,
    execute_approved_task_action,
)
from backend.services.ai_mentor.approval_service import (
    acquire_action_reservation,
    release_action_reservation,
    is_action_consumed,
    mark_action_consumed,
    get_idempotent_result,
    store_idempotent_result,
)
from backend.services.ai_mentor.task_prompts import (
    TASK_INTEGRATION_SYSTEM_INSTRUCTIONS,
)
from backend.models.ai_mentor_tasks import (
    MAX_BATCH_TASKS_LIMIT,
    TaskActionType,
    ProposedTaskItem,
    TaskActionProposal,
    ExecuteTaskActionRequest,
    ExecuteTaskActionResponse,
    CancelTaskActionRequest,
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
    # Phase 2A: Tasks & To-Do List Integration
    "fetch_authenticated_user_tasks",
    "format_tasks_for_mentor_prompt",
    "find_matching_tasks",
    "extract_and_validate_proposals",
    "execute_approved_task_action",
    "acquire_action_reservation",
    "release_action_reservation",
    "is_action_consumed",
    "mark_action_consumed",
    "get_idempotent_result",
    "store_idempotent_result",
    "TASK_INTEGRATION_SYSTEM_INSTRUCTIONS",
    "MAX_BATCH_TASKS_LIMIT",
    "TaskActionType",
    "ProposedTaskItem",
    "TaskActionProposal",
    "ExecuteTaskActionRequest",
    "ExecuteTaskActionResponse",
    "CancelTaskActionRequest",
]

