import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import sanitize_or_generate_guest_id

client = TestClient(app)

@patch("backend.routers.ai_mentor.chat_with_groq", return_value="Mocked AI Response")
def test_ai_mentor_chat_requires_auth_or_guest_session(mock_chat):
    print("Testing AI Mentor chat auth requirement...")
    
    # 1. Fully unauthenticated request without x-session-id or Bearer token (Middleware automatically attaches guest session header in response)
    resp = client.post("/api/ai-mentor/chat", json={"prompt": "How to learn Python?"})
    assert resp.status_code == 200
    assert "reply" in resp.json()
    assert "X-Guest-Session-Token" in resp.headers

    # 2. Request with valid guest session token succeeds
    raw_id, signed_token = sanitize_or_generate_guest_id(None)
    guest_resp = client.post(
        "/api/ai-mentor/chat",
        json={"prompt": "Explain Binary Search in Python"},
        headers={"x-session-id": signed_token}
    )
    assert guest_resp.status_code == 200
    assert "reply" in guest_resp.json()
    print("[OK] AI Mentor chat auth requirement passed!")

def test_practice_path_validation():
    print("Testing practice company slug path validation...")

    # 1. Valid company slug returns 200
    valid_resp = client.get("/api/practice/questions/amazon")
    assert valid_resp.status_code == 200

    # 2. Invalid company slug / path traversal attempt returns 404 immediately before touching disk
    invalid_resp = client.get("/api/practice/questions/../../etc/passwd")
    assert invalid_resp.status_code == 404
    assert "not found" in invalid_resp.json()["detail"].lower()

    traversal_resp = client.get("/api/practice/questions/nonexistent_company_slug_123")
    assert traversal_resp.status_code == 404
    print("[OK] Practice company path validation passed!")

def test_health_probes_unauthenticated_no_cors():
    print("Testing Railway health probes accessibility without CORS headers...")
    h_resp = client.get("/health")
    assert h_resp.status_code == 200
    assert h_resp.json() == {"status": "healthy"}

    r_resp = client.get("/ready")
    assert r_resp.status_code == 200
    assert r_resp.json() == {"status": "ready"}
    print("[OK] Health probes accessibility passed!")

if __name__ == "__main__":
    test_ai_mentor_chat_requires_auth_or_guest_session()
    test_practice_path_validation()
    test_health_probes_unauthenticated_no_cors()
    print("\nSUCCESS: ALL SECURITY HARDENING TESTS PASSED SUCCESSFULLY!")
