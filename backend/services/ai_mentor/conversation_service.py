"""
backend/services/ai_mentor/conversation_service.py
Service layer for AI Mentor persistent conversations and message history.
Enforces UUID validation, user-scoping, deterministic ordering, and error resilience.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import is_valid_uuid

logger = logging.getLogger(__name__)

MAX_TITLE_LENGTH = 120
DEFAULT_TITLE = "New Mentorship Session"
MAX_MESSAGE_CONTENT_LENGTH = 8000
MIN_MESSAGE_CONTENT_LENGTH = 1


def derive_conversation_title(text: str) -> str:
    """
    Derives a clean, concise, deterministic conversation title from the first message.
    Truncates at a word boundary within 60 characters, with fallback to DEFAULT_TITLE.
    """
    if not text:
        return DEFAULT_TITLE
    cleaned = " ".join(text.strip().split())
    if not cleaned:
        return DEFAULT_TITLE
    if len(cleaned) <= 60:
        return cleaned[:MAX_TITLE_LENGTH]
    
    # Truncate at word boundary
    truncated = cleaned[:60]
    last_space = truncated.rfind(" ")
    if last_space > 20:
        truncated = truncated[:last_space]
    return f"{truncated}..."[:MAX_TITLE_LENGTH]


def create_conversation(user_id: str, title: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Creates a new conversation record owned by the authenticated user.
    """
    if not is_valid_uuid(user_id):
        logger.warning(f"create_conversation rejected invalid user_id: '{user_id}'")
        return None

    sb = get_supabase()
    if not sb:
        logger.error("Supabase client unavailable in create_conversation.")
        return None

    clean_title = (title.strip()[:MAX_TITLE_LENGTH] if title and title.strip() else DEFAULT_TITLE)
    now_iso = datetime.now(timezone.utc).isoformat()
    conv_id = str(uuid.uuid4())

    record = {
        "id": conv_id,
        "user_id": user_id,
        "title": clean_title,
        "created_at": now_iso,
        "updated_at": now_iso,
        "last_message_at": now_iso,
    }

    try:
        res = sb.table("mentor_conversations").insert(record).execute()
        if res.data and len(res.data) > 0:
            logger.info(f"Created mentor conversation '{conv_id}' for user '{user_id}'.")
            return res.data[0]
        return record
    except Exception as e:
        logger.error(f"Failed to create mentor conversation for user '{user_id}': {e}")
        return None


def get_conversation(user_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a conversation strictly verified to belong to the authenticated user.
    Returns None if conversation does not exist or user is unauthorized (IDOR defense).
    """
    if not is_valid_uuid(user_id) or not is_valid_uuid(conversation_id):
        return None

    sb = get_supabase()
    if not sb:
        return None

    try:
        res = (
            sb.table("mentor_conversations")
            .select("*")
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching conversation '{conversation_id}' for user '{user_id}': {e}")
        return None


def list_conversations(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Lists conversations for the authenticated user ordered by last_message_at DESC.
    Returns (conversations_list, total_count).
    """
    if not is_valid_uuid(user_id):
        return [], 0

    sb = get_supabase()
    if not sb:
        return [], 0

    safe_limit = max(1, min(limit, 50))
    safe_offset = max(0, offset)

    try:
        res = (
            sb.table("mentor_conversations")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .order("last_message_at", desc=True)
            .range(safe_offset, safe_offset + safe_limit - 1)
            .execute()
        )
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total
    except Exception as e:
        logger.error(f"Error listing conversations for user '{user_id}': {e}")
        return [], 0


def delete_conversation(user_id: str, conversation_id: str) -> bool:
    """
    Deletes a conversation owned by the authenticated user.
    Foreign key ON DELETE CASCADE guarantees messages are automatically deleted.
    """
    if not is_valid_uuid(user_id) or not is_valid_uuid(conversation_id):
        return False

    sb = get_supabase()
    if not sb:
        return False

    # IDOR check: verify ownership first
    existing = get_conversation(user_id, conversation_id)
    if not existing:
        return False

    try:
        sb.table("mentor_conversations").delete().eq("id", conversation_id).eq("user_id", user_id).execute()
        logger.info(f"Deleted conversation '{conversation_id}' for user '{user_id}'.")
        return True
    except Exception as e:
        logger.error(f"Error deleting conversation '{conversation_id}' for user '{user_id}': {e}")
        return False


def save_message(
    user_id: str,
    conversation_id: str,
    role: str,
    content: str,
) -> Optional[Dict[str, Any]]:
    """
    Saves a message (user or assistant) associated with the conversation and user.
    Updates the conversation's last_message_at and updated_at timestamps.
    """
    if not is_valid_uuid(user_id) or not is_valid_uuid(conversation_id):
        return None

    if role not in ("user", "assistant"):
        logger.warning(f"Invalid message role '{role}' rejected.")
        return None

    cleaned_content = content.strip() if content else ""
    if len(cleaned_content) < MIN_MESSAGE_CONTENT_LENGTH:
        return None
    if len(cleaned_content) > MAX_MESSAGE_CONTENT_LENGTH:
        cleaned_content = cleaned_content[:MAX_MESSAGE_CONTENT_LENGTH]

    sb = get_supabase()
    if not sb:
        return None

    msg_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": role,
        "content": cleaned_content,
        "created_at": now_iso,
    }

    try:
        res = sb.table("mentor_messages").insert(record).execute()
        # Update parent conversation timestamps
        sb.table("mentor_conversations").update({
            "updated_at": now_iso,
            "last_message_at": now_iso,
        }).eq("id", conversation_id).eq("user_id", user_id).execute()

        if res.data and len(res.data) > 0:
            return res.data[0]
        return record
    except Exception as e:
        logger.error(f"Error saving message in conversation '{conversation_id}': {e}")
        return None


def get_recent_messages(
    user_id: str,
    conversation_id: str,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """
    Fetches the most recent `limit` messages for a conversation,
    returned in strict chronological order (oldest to newest) with deterministic tie-breakers.
    """
    if not is_valid_uuid(user_id) or not is_valid_uuid(conversation_id):
        return []

    sb = get_supabase()
    if not sb:
        return []

    safe_limit = max(1, min(limit, 50))

    try:
        # Fetch descending from DB for efficiency
        res = (
            sb.table("mentor_messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .order("id", desc=True)
            .limit(safe_limit)
            .execute()
        )
        records = res.data or []
        # Reverse in memory so messages are chronologically ordered for LLM prompt
        records.reverse()
        return records
    except Exception as e:
        logger.error(f"Error retrieving recent messages for conversation '{conversation_id}': {e}")
        return []
