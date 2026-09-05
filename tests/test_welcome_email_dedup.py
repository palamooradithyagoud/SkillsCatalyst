import uuid
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_welcome_email_deduplication():
    """Verify that duplicate welcome email calls for the same email are blocked."""
    uid = uuid.uuid4().hex[:8]
    test_email = f"user_{uid}@example.com"
    payload = {
        "email": test_email,
        "full_name": "Test User",
    }

    with patch("backend.routers.auth.send_welcome_email") as mock_send:
        mock_send.return_value = {"success": True}

        # 1. First request should succeed and queue email
        resp1 = client.post("/api/auth/welcome-email", json=payload)
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert data1.get("success") is True
        assert data1.get("skipped") is not True

        # 2. Second request with same email (even with mixed casing or whitespace) must be skipped
        payload_dup = {
            "email": f"  {test_email.upper()}  ",
            "full_name": "Test User",
        }
        resp2 = client.post("/api/auth/welcome-email", json=payload_dup)
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2.get("success") is True
        assert data2.get("skipped") is True

        # 3. Request with a different email should NOT be skipped
        diff_email = f"different_user_{uuid.uuid4().hex[:8]}@example.com"
        diff_payload = {
            "email": diff_email,
            "full_name": "Another User",
        }
        resp3 = client.post("/api/auth/welcome-email", json=diff_payload)
        assert resp3.status_code == 200
        data3 = resp3.json()
        assert data3.get("success") is True
        assert data3.get("skipped") is not True
