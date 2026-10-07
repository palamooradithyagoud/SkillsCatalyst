"""
tests/test_mentor_conversation_lifecycle.py
Phase 2 Dedicated Tests: Conversation Lifecycle & CRUD.
Covers:
- Create conversation (default title, custom title, title truncation at 120 chars)
- Get conversation detail & messages
- List conversations with pagination (limit, offset)
- Delete conversation & cascading messages
- 404 on nonexistent or invalid conversation IDs
"""

import uuid
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_current_user_id
import backend.routers.ai_mentor as router_module
import backend.services.ai_mentor.conversation_service as conv_service

client = TestClient(app)

USER_A_ID = "11111111-1111-1111-1111-111111111111"
USER_B_ID = "22222222-2222-2222-2222-222222222222"


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
    yield
    app.dependency_overrides.pop(get_current_user_id, None)


def test_01_create_conversation_default_title(monkeypatch):
    """Test 1: Creating conversation without title uses DEFAULT_TITLE."""
    mock_db = {}

    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                def mock_insert(record):
                    inst = MagicMock()
                    mock_db[record["id"]] = record
                    inst.execute.return_value = MagicMock(data=[record])
                    return inst
                tbl.insert.side_effect = mock_insert
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.post("/api/ai-mentor/conversations", json={})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "New Mentorship Session"
    assert data["user_id"] == USER_A_ID
    assert "id" in data


def test_02_create_conversation_custom_title(monkeypatch):
    """Test 2: Creating conversation with custom title saves provided title."""
    mock_db = {}

    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                def mock_insert(record):
                    inst = MagicMock()
                    mock_db[record["id"]] = record
                    inst.execute.return_value = MagicMock(data=[record])
                    return inst
                tbl.insert.side_effect = mock_insert
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.post("/api/ai-mentor/conversations", json={"title": "Python & DSA Mastery"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Python & DSA Mastery"
    assert data["user_id"] == USER_A_ID


def test_03_create_conversation_title_clamped_at_120_chars(monkeypatch):
    """Test 3: Overly long title is safely bounded to 120 characters."""
    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                def mock_insert(record):
                    inst = MagicMock()
                    inst.execute.return_value = MagicMock(data=[record])
                    return inst
                tbl.insert.side_effect = mock_insert
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    long_title = "A" * 200
    resp = client.post("/api/ai-mentor/conversations", json={"title": long_title})
    assert resp.status_code == 201
    data = resp.json()
    assert len(data["title"]) <= 120


def test_04_list_conversations_with_pagination(monkeypatch):
    """Test 4: Listing conversations returns paginated results and total count."""
    fake_items = [
        {"id": str(uuid.uuid4()), "user_id": USER_A_ID, "title": f"Session {i}", "created_at": "2026-10-07T00:00:00Z", "updated_at": "2026-10-07T00:00:00Z", "last_message_at": "2026-10-07T00:00:00Z"}
        for i in range(5)
    ]

    def mock_get_supabase():
        sb = MagicMock()
        tbl = MagicMock()
        sb.table.return_value = tbl
        tbl.select.return_value = tbl
        tbl.eq.return_value = tbl
        tbl.order.return_value = tbl
        tbl.range.return_value = tbl
        tbl.execute.return_value = MagicMock(data=fake_items, count=15)
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.get("/api/ai-mentor/conversations?limit=5&offset=0")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["conversations"]) == 5
    assert data["total"] == 15
    assert data["limit"] == 5
    assert data["offset"] == 0


def test_05_get_conversation_detail_success(monkeypatch):
    """Test 5: Getting conversation returns metadata and messages."""
    conv_id = str(uuid.uuid4())
    fake_conv = {"id": conv_id, "user_id": USER_A_ID, "title": "System Design Prep", "created_at": "2026-10-07T00:00:00Z", "updated_at": "2026-10-07T00:00:00Z", "last_message_at": "2026-10-07T00:00:00Z"}
    fake_msgs = [
        {"id": str(uuid.uuid4()), "conversation_id": conv_id, "user_id": USER_A_ID, "role": "user", "content": "How does sharding work?", "created_at": "2026-10-07T00:01:00Z"},
        {"id": str(uuid.uuid4()), "conversation_id": conv_id, "user_id": USER_A_ID, "role": "assistant", "content": "Sharding partitions data horizontally.", "created_at": "2026-10-07T00:01:05Z"},
    ]

    def mock_get_supabase():
        sb = MagicMock()
        def mock_table(table_name):
            tbl = MagicMock()
            if table_name == "mentor_conversations":
                tbl.select.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.execute.return_value = MagicMock(data=[fake_conv])
            elif table_name == "mentor_messages":
                tbl.select.return_value = tbl
                tbl.eq.return_value = tbl
                tbl.order.return_value = tbl
                tbl.limit.return_value = tbl
                tbl.execute.return_value = MagicMock(data=list(reversed(fake_msgs)))
            return tbl
        sb.table.side_effect = mock_table
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.get(f"/api/ai-mentor/conversations/{conv_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["conversation"]["id"] == conv_id
    assert len(data["messages"]) == 2
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "assistant"


def test_06_get_conversation_not_found(monkeypatch):
    """Test 6: Nonexistent conversation returns 404."""
    conv_id = str(uuid.uuid4())

    def mock_get_supabase():
        sb = MagicMock()
        tbl = MagicMock()
        sb.table.return_value = tbl
        tbl.select.return_value = tbl
        tbl.eq.return_value = tbl
        tbl.execute.return_value = MagicMock(data=[])
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.get(f"/api/ai-mentor/conversations/{conv_id}")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_07_get_conversation_invalid_uuid():
    """Test 7: Malformed conversation ID returns 404, never 500."""
    resp = client.get("/api/ai-mentor/conversations/invalid-not-a-uuid")
    assert resp.status_code == 404


def test_08_delete_conversation_success(monkeypatch):
    """Test 8: Deleting a conversation returns success."""
    conv_id = str(uuid.uuid4())
    fake_conv = {"id": conv_id, "user_id": USER_A_ID, "title": "To Delete"}

    def mock_get_supabase():
        sb = MagicMock()
        tbl = MagicMock()
        sb.table.return_value = tbl
        tbl.select.return_value = tbl
        tbl.eq.return_value = tbl
        tbl.delete.return_value = tbl
        tbl.execute.return_value = MagicMock(data=[fake_conv])
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.delete(f"/api/ai-mentor/conversations/{conv_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_09_delete_conversation_not_found(monkeypatch):
    """Test 9: Deleting a nonexistent conversation returns 404."""
    conv_id = str(uuid.uuid4())

    def mock_get_supabase():
        sb = MagicMock()
        tbl = MagicMock()
        sb.table.return_value = tbl
        tbl.select.return_value = tbl
        tbl.eq.return_value = tbl
        tbl.execute.return_value = MagicMock(data=[])
        return sb

    monkeypatch.setattr(conv_service, "get_supabase", mock_get_supabase)

    resp = client.delete(f"/api/ai-mentor/conversations/{conv_id}")
    assert resp.status_code == 404
