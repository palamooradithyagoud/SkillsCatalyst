import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def _make_mock_user(user_id: str, email: str):
    mock_u = MagicMock()
    mock_u.id = user_id
    mock_u.email = email
    mock_u.user_metadata = {"full_name": "Test Dedup User"}
    mock_res = MagicMock()
    mock_res.user = mock_u
    return mock_res


def test_welcome_email_authentication_required():
    """Verify that requests without a Bearer token are rejected with 401."""
    resp = client.post("/api/auth/welcome-email", json={"is_signup": True})
    assert resp.status_code == 401
    assert "Bearer" in resp.headers.get("WWW-Authenticate", "")


def test_welcome_email_deduplication():
    """Verify that duplicate welcome email calls for the same user are safely deduplicated."""
    user_id = str(uuid.uuid4())
    test_email = f"user_{user_id[:8]}@example.com"

    mock_sb = MagicMock()
    mock_sb.auth.get_user.return_value = _make_mock_user(user_id, test_email)

    with patch("backend.routers.auth.get_supabase", return_value=mock_sb), \
         patch("backend.routers.auth.send_welcome_email") as mock_send:
        mock_send.return_value = {"success": True, "id": "re_dedup_test_123"}

        # 1. First signup request queues email
        resp1 = client.post(
            "/api/auth/welcome-email",
            json={"is_signup": True},
            headers={"Authorization": "Bearer valid_token_123"},
        )
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert data1.get("success") is True
        assert data1.get("status") in ("queued", "processing")

        # 2. Second request for same user returns processing or already_sent, never queued again
        resp2 = client.post(
            "/api/auth/welcome-email",
            json={"is_signup": True},
            headers={"Authorization": "Bearer valid_token_123"},
        )
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2.get("success") is True
        assert data2.get("status") in ("processing", "already_sent")

        # 3. Request with a different user is allowed
        diff_uid = str(uuid.uuid4())
        diff_email = f"user_{diff_uid[:8]}@example.com"
        mock_sb.auth.get_user.return_value = _make_mock_user(diff_uid, diff_email)

        resp3 = client.post(
            "/api/auth/welcome-email",
            json={"is_signup": True},
            headers={"Authorization": "Bearer valid_token_456"},
        )
        assert resp3.status_code == 200
        data3 = resp3.json()
        assert data3.get("success") is True
        assert data3.get("status") in ("queued", "processing")
