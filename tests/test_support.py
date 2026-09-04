import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

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
