import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import require_authenticated_user
from backend.services.welcome_email_store import _init_sqlite_fallback

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_auth_overrides_and_store():
    """Ensure clean dependency overrides and store before and after each test."""
    _init_sqlite_fallback()
    app.dependency_overrides.pop(require_authenticated_user, None)
    yield
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_welcome_email_authentication_required():
    """Verify that requests without a Bearer token are rejected with 401."""
    resp = client.post("/api/auth/welcome-email", json={"is_signup": True})
    assert resp.status_code == 401
    assert "Bearer" in resp.headers.get("WWW-Authenticate", "")


def test_welcome_email_deduplication():
    """Verify that duplicate welcome email calls for the same user are safely deduplicated."""
    user_id = str(uuid.uuid4())
    test_email = f"user_{user_id[:8]}@example.com"

    mock_user_data = {
        "user_id": user_id,
        "email": test_email,
        "name": "Test Dedup User",
        "role": "student",
        "is_owner": False,
    }

    app.dependency_overrides[require_authenticated_user] = lambda: mock_user_data

    try:
        with patch("backend.routers.auth.send_welcome_email") as mock_send:
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
            mock_user_data["user_id"] = diff_uid
            mock_user_data["email"] = diff_email

            resp3 = client.post(
                "/api/auth/welcome-email",
                json={"is_signup": True},
                headers={"Authorization": "Bearer valid_token_456"},
            )
            assert resp3.status_code == 200
            data3 = resp3.json()
            assert data3.get("success") is True
            assert data3.get("status") in ("queued", "processing")
    finally:
        app.dependency_overrides.pop(require_authenticated_user, None)
