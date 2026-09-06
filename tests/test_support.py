import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_support_rate_limits():
    """Reset rate limiter state before each test so tests are isolated."""
    from backend.services.rate_limiter import rate_limiter
    from backend.services.cache_service import get_redis_client
    if hasattr(rate_limiter, "_fallback_limiter"):
        rate_limiter._fallback_limiter._requests.clear()
    if hasattr(rate_limiter, "_requests"):
        rate_limiter._requests.clear()
    try:
        r = get_redis_client()
        if r:
            keys = r.keys("rate:*:/api/support/ticket*")
            if keys:
                r.delete(*keys)
    except Exception:
        pass
    yield

def test_get_support_info():
    """Verify official contact info endpoint returns correct founder and support details."""
    response = client.get("/api/support/info")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "support_desk" in data
    desk = data["support_desk"]
    assert desk["name"] == "Palamoor Adithya Goud"
    assert "7330602101" in desk["phone"]
    assert desk["email"] == "palamooradithyagoud@gmail.com"
    assert len(data["applicable_policies"]) >= 4

def test_submit_support_ticket_success():
    """Verify that submitting a valid support ticket returns 200 OK and a ticket ID."""
    response = client.post(
        "/api/support/ticket",
        json={
            "name": "Alex Student",
            "email": "student@example.com",
            "phone": "+91 9876543210",
            "category": "Roadmaps & Content",
            "subject": "Question regarding Python roadmap chapter 3",
            "message": "I found a problem in the intermediate exercise description. Please clarify the expected output."
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "ticket_id" in data
    assert data["ticket_id"].startswith("SC-")
    assert "Palamoor Adithya Goud" in data["message"]

def test_submit_support_ticket_validation_error():
    """Verify invalid payloads (e.g. invalid email or missing message) fail with 422."""
    response = client.post(
        "/api/support/ticket",
        json={
            "name": "Alex",
            "email": "not-an-email",
            "subject": "Hi",
            "message": "Too short"
        }
    )
    assert response.status_code == 422


def test_submit_support_ticket_rate_limiting(monkeypatch):
    """Verify that after 5 tickets within the 300s window, the 6th request is throttled with 429."""
    from unittest.mock import MagicMock
    import backend.routers.support as support_module

    # Mock email sending to make test fast and deterministic
    mock_send = MagicMock(return_value=True)
    monkeypatch.setattr(support_module, "send_email", mock_send)

    payload = {
        "name": "Rate Limit Test User",
        "email": "ratelimit@example.com",
        "category": "Technical Issue",
        "subject": "Rate limiting automated test ticket",
        "message": "Testing that rate limiting throttles excessive support requests."
    }

    # Send requests until 429 is received (max 5 allowed per 300s window)
    statuses = []
    for _ in range(6):
        res = client.post("/api/support/ticket", json=payload)
        statuses.append(res.status_code)

    # At least the last request should be HTTP 429
    assert 429 in statuses, f"Expected 429 in responses, got: {statuses}"
    last_res = client.post("/api/support/ticket", json=payload)
    assert last_res.status_code == 429
    assert "Retry-After" in last_res.headers
    data = last_res.json()
    assert data.get("success") is False or "message" in data

