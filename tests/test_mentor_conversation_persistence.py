"""
tests/test_mentor_conversation_persistence.py
Phase 2 Dedicated Tests: Message Persistence, Bounded History & Multi-Turn Context.
Covers:
- Auto-creation of conversation and message persistence
- Existing conversation continuation and message appending
- Bounded history limiting (count & character caps)
- Deterministic chronological ordering (oldest to newest)
- Zero duplication of current message in LLM context
- Full multi-turn conversational context delivery
"""

import uuid
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_session_or_user_id
import backend.routers.ai_mentor as router_module
import backend.services.ai_mentor.conversation_service as conv_service
from backend.services.ai_mentor.prompt_builder import (
    build_mentor_llm_messages,
    MAX_HISTORY_MESSAGES,
    MAX_HISTORY_CHARS,
)

client = TestClient(app)

USER_A_ID = "11111111-1111-1111-1111-111111111111"


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_session_or_user_id] = lambda: USER_A_ID
    yield
    app.dependency_overrides.pop(get_session_or_user_id, None)


def test_01_chat_auto_creates_conversation_and_persists_messages(monkeypatch):
    """
    Test 1: When no conversation_id is provided, chat auto-creates a conversation,
    persists user message, invokes LLM, and persists assistant response.
    """
    saved_conversations = []
    saved_messages = []

    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                def mock_insert(rec):
                    saved_conversations.append(rec)
                    inst = MagicMock()
                    inst.execute.return_value = MagicMock(data=[rec])
                    return inst
                tbl.insert.side_effect = mock_insert
                tbl.update.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.execute.return_value = MagicMock(data=[])
            elif table_name == "mentor_messages":
                def mock_insert(rec):
                    saved_messages.append(rec)
                    inst = MagicMock()
                    inst.execute.return_value = MagicMock(data=[rec])
                    return inst
                tbl.insert.side_effect = mock_insert
                tbl.select.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.order.return_value = tbl
                tbl.limit.return_value = tbl
                tbl.execute.return_value = MagicMock(data=[])
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)
    monkeypatch.setattr(router_module, "chat_with_groq", lambda **kwargs: "Python uses indentation for blocks.")

    resp = client.post("/api/ai-mentor/chat", json={"prompt": "How does Python syntax work?"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["reply"] == "Python uses indentation for blocks."
    assert data["conversation_id"] is not None
    assert data["message_id"] is not None

    # Verify conversation was created
    assert len(saved_conversations) == 1
    assert saved_conversations[0]["user_id"] == USER_A_ID

    # Verify user message and assistant message were persisted
    assert len(saved_messages) == 2
    assert saved_messages[0]["role"] == "user"
    assert "How does Python syntax work?" in saved_messages[0]["content"]
    assert saved_messages[1]["role"] == "assistant"
    assert "Python uses indentation" in saved_messages[1]["content"]


def test_02_chat_with_existing_conversation(monkeypatch):
    """
    Test 2: Providing an existing conversation_id appends user & assistant messages
    to the specified conversation.
    """
    conv_id = str(uuid.uuid4())
    fake_conv = {"id": conv_id, "user_id": USER_A_ID, "title": "Existing Thread"}
    saved_messages = []

    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                tbl.select.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.execute.return_value = MagicMock(data=[fake_conv])
                tbl.update.return_value = tbl
            elif table_name == "mentor_messages":
                def mock_insert(rec):
                    saved_messages.append(rec)
                    inst = MagicMock()
                    inst.execute.return_value = MagicMock(data=[rec])
                    return inst
                tbl.insert.side_effect = mock_insert
                tbl.select.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.order.return_value = tbl
                tbl.limit.return_value = tbl
                tbl.execute.return_value = MagicMock(data=[])
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)
    monkeypatch.setattr(router_module, "chat_with_groq", lambda **kwargs: "Dynamic programming uses memoization.")

    resp = client.post(
        "/api/ai-mentor/chat",
        json={"conversation_id": conv_id, "message": "Explain dynamic programming memoization"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["conversation_id"] == conv_id
    assert data["reply"] == "Dynamic programming uses memoization."
    assert len(saved_messages) == 2
    assert all(m["conversation_id"] == conv_id for m in saved_messages)


def test_03_bounded_history_message_count_limit():
    """
    Test 3: Prompt builder truncates history to MAX_HISTORY_MESSAGES.
    """
    history = [
        {"id": f"msg-{i}", "role": "user" if i % 2 == 0 else "assistant", "content": f"Turn {i}"}
        for i in range(30)
    ]
    llm_msgs = build_mentor_llm_messages(
        system_prompt="System",
        history_messages=history,
        current_user_message="Current query",
    )
    # Message turns: 1 system + <= MAX_HISTORY_MESSAGES history turns + 1 current user turn
    history_turns = [m for m in llm_msgs if m["role"] in ("user", "assistant") and m["content"] != "Current query"]
    assert len(history_turns) <= MAX_HISTORY_MESSAGES


def test_04_bounded_history_character_budget():
    """
    Test 4: Prompt builder bounds total history characters to MAX_HISTORY_CHARS.
    """
    history = [
        {"id": f"msg-{i}", "role": "user" if i % 2 == 0 else "assistant", "content": "A" * 500}
        for i in range(20)
    ]
    llm_msgs = build_mentor_llm_messages(
        system_prompt="System",
        history_messages=history,
        current_user_message="Current query",
        max_history_chars=1200,
    )
    history_turns = [m for m in llm_msgs if m["content"] != "Current query" and m["role"] != "system"]
    total_history_chars = sum(len(m["content"]) for m in history_turns)
    assert total_history_chars <= 1200


def test_05_deterministic_chronological_ordering():
    """
    Test 5: Prompt builder strictly orders history from oldest to newest.
    """
    history = [
        {"id": "1", "role": "user", "content": "Step 1: First question"},
        {"id": "2", "role": "assistant", "content": "Step 2: First answer"},
        {"id": "3", "role": "user", "content": "Step 3: Followup question"},
        {"id": "4", "role": "assistant", "content": "Step 4: Followup answer"},
    ]
    llm_msgs = build_mentor_llm_messages(
        system_prompt="System",
        history_messages=history,
        current_user_message="Step 5: Final question",
    )
    # Check sequence
    contents = [m["content"] for m in llm_msgs[1:]]
    assert contents[0].startswith("Step 1")
    assert contents[1].startswith("Step 2")
    assert contents[2].startswith("Step 3")
    assert contents[3].startswith("Step 4")
    assert contents[4].startswith("Step 5")


def test_06_current_user_message_not_duplicated():
    """
    Test 6: If current message is already in history, it must NOT be duplicated.
    """
    history = [
        {"id": "prev-1", "role": "assistant", "content": "How can I help you today?"},
        {"id": "curr-1", "role": "user", "content": "Explain binary search trees"},
    ]
    llm_msgs = build_mentor_llm_messages(
        system_prompt="System",
        history_messages=history,
        current_user_message="Explain binary search trees",
        current_message_id="curr-1",
    )
    user_turns = [m for m in llm_msgs if m["role"] == "user"]
    # Must only appear ONCE as the active prompt turn
    assert len(user_turns) == 1
    assert user_turns[0]["content"] == "Explain binary search trees"
