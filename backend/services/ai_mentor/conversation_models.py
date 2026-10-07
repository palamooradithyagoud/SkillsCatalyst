"""
backend/services/ai_mentor/conversation_models.py
Pydantic contracts for Phase 2: Persistent Conversation Memory.
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = None

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        if not stripped:
            return None
        return stripped[:120]


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: MessageRole
    content: str
    created_at: str


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    last_message_at: str


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int
    limit: int
    offset: int


class ConversationDetailResponse(BaseModel):
    conversation: ConversationResponse
    messages: List[MessageResponse]


class MentorChatRequest(BaseModel):
    message: Optional[str] = Field(None, description="The user's chat message")
    prompt: Optional[str] = Field(None, description="Legacy parameter for backward compatibility with Phase 1")
    conversation_id: Optional[str] = Field(None, description="Optional existing conversation UUID")

    @field_validator("message", "prompt")
    @classmethod
    def clean_text_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return v.strip()

    @model_validator(mode="after")
    def validate_content(self) -> "MentorChatRequest":
        text = self.message or self.prompt or ""
        text = text.strip()
        if not text or len(text) < 3:
            raise ValueError("Prompt is too short. Please ask a meaningful question about skills or your career (min 3 characters).")
        if len(text) > 3000:
            raise ValueError(f"Prompt is too long ({len(text)} chars). Please keep it under 3000 characters.")
        return self

    def get_text(self) -> str:
        """Returns the active message or legacy prompt text."""
        text = self.message or self.prompt or ""
        return text.strip()


class MentorChatResponse(BaseModel):
    reply: str
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None

