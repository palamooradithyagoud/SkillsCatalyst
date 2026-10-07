"""
tests/test_mentor_conversation_failure_semantics.py
Phase 2 Dedicated Tests: Failure Semantics & Resilience.
Covers:
- LLM failure: user message preserved in DB, NO fake assistant message persisted
- LLM timeout / exception resilience
- Supabase database lookup failure resilience
- Guest chat resilience (stateless, zero DB 22P02 errors)
"""

import uuid
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_session_or_user_id
from backend.services.groq_service import _AI_UNAVAILABLE_MSG
import backend.routers.ai_mentor as router_module
import backend.services.ai_mentor.conversation_service as conv_service

client = TestClient(app)

USER_A_ID = "11111111-1111-1111-1111-111111111111"


def test_01_llm_failure_preserves_user_message_no_fake_assistant(monkeypatch):
    """
    Test 1: When Groq returns _AI_UNAVAILABLE_MSG, the user message is preserved in DB,
    and NO fake assistant message is written.
    """
    app.dependency_overrides[get_session_or_user_id] = lambda: USER_A_ID
    conv_id = str(uuid.uuid4())
    fake_conv = {"id": conv_id, "user_id": USER_A_ID, "title": "Failure Resilience"}
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
    # Simulate LLM provider returning unavailable message
    monkeypatch.setattr(router_module, "chat_with_groq", lambda **kwargs: _AI_UNAVAILABLE_MSG)

    try:
        resp = client.post(
            "/api/ai-mentor/chat",
            json={"conversation_id": conv_id, "message": "My critical interview question"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["reply"] == _AI_UNAVAILABLE_MSG
        assert data["conversation_id"] == conv_id
        assert data["message_id"] is None

        # Verify: User message was saved, BUT NO assistant message was saved!
        assert len(saved_messages) == 1
        assert saved_messages[0]["role"] == "user"
        assert saved_messages[0]["content"] == "My critical interview question"
        assert not any(m["role"] == "assistant" for m in saved_messages)
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_02_guest_chat_stateless_no_db_persistence(monkeypatch):
    """
    Test 2: Unauthenticated guest requests execute statelessly without touching
    the database or triggering UUID errors.
    """
    guest_id = "guest_1234567890abcdef"
    app.dependency_overrides[get_session_or_user_id] = lambda: guest_id

    mock_sb = MagicMock()
    monkeypatch.setattr(conv_service, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(router_module, "chat_with_groq", lambda **kwargs: "Guest answer about Java.")

    try:
        resp = client.post(
            "/api/ai-mentor/chat",
            json={"prompt": "What is Java JVM architecture?"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["reply"] == "Guest answer about Java."
        assert data["conversation_id"] is None
        assert data["message_id"] is None

        # Ensure no DB insert operations were executed for guest
        assert mock_sb.table.call_count == 0
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_03_db_outage_during_conversation_lookup(monkeypatch):
    """
    Test 3: If Supabase throws an exception during conversation lookup,
    returns 404 rather than crashing with 500.
    """
    app.dependency_overrides[get_session_or_user_id] = lambda: USER_A_ID
    conv_id = str(uuid.uuid4())

    def mock_get_supabase():
        sb = MagicMock()
        tbl = MagicMock()
        sb.table.return_value = tbl
        tbl.select.side_effect = Exception("Supabase connection terminated")
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    try:
        resp = client.post(
            "/api/ai-mentor/chat",
            json={"conversation_id": conv_id, "message": "Test question during outage"},
        )
        assert resp.status_code == 404
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)
