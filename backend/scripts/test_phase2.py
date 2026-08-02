import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import sanitize_or_generate_guest_id, _verify_guest_id, _sign_guest_id
from backend.config import validate_startup_config, _is_placeholder_secret, ENVIRONMENT

client = TestClient(app)

def test_startup_validation():
    print("Testing startup validation...")
    assert _is_placeholder_secret("changeme") == True
    assert _is_placeholder_secret("your_secret_key") == True
    assert _is_placeholder_secret("gsk_placeholder_123") == True
    assert _is_placeholder_secret("a_strong_production_secret_32chars_long") == False
    print("[OK] Startup validation logic passed!")

def test_secure_guest_sessions():
    print("Testing secure guest session architecture...")
    
    # 1. Fresh signed guest ID generation
    signed_id, is_new = sanitize_or_generate_guest_id(None)
    assert is_new == True
    assert signed_id.startswith("guest_")
    assert "." in signed_id
    assert _verify_guest_id(signed_id) == signed_id

    # 2. Re-verification of valid signed guest ID
    verified_id, is_new_2 = sanitize_or_generate_guest_id(signed_id)
    assert is_new_2 == False
    assert verified_id == signed_id

    # 3. Tampered signature rejection & new token issuance
    tampered_id = signed_id[:-4] + "0000"
    reissued_id, is_new_3 = sanitize_or_generate_guest_id(tampered_id)
    assert is_new_3 == True
    assert reissued_id != tampered_id
    assert _verify_guest_id(reissued_id) == reissued_id

    # 4. Raw UUID namespacing (prevents unauthenticated UUID spoofing)
    raw_uuid = "123e4567-e89b-12d3-a456-426614174000"
    namespaced_id, is_new_4 = sanitize_or_generate_guest_id(raw_uuid)
    assert is_new_4 == True
    assert raw_uuid not in namespaced_id
    assert namespaced_id.startswith("guest_")

    print("[OK] Guest session security & HMAC signing passed!")

def test_security_headers_and_cors():
    print("Testing CORS and modern security headers...")
    
    resp = client.get("/health")
    assert resp.status_code == 200
    headers = resp.headers
    
    # Security headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Permissions-Policy") == "camera=(), microphone=(), geolocation=(), payment=()"
    assert headers.get("Cross-Origin-Opener-Policy") == "same-origin-allow-popups"
    assert headers.get("Cross-Origin-Resource-Policy") == "cross-origin"
    assert "X-Request-ID" in headers
    assert "X-Guest-Session-Token" in headers
    
    # CORS Origin validation
    cors_resp = client.options(
        "/health",
        headers={
            "Origin": "https://skills-catalyst-git-main.vercel.app",
            "Access-Control-Request-Method": "GET",
        }
    )
    assert cors_resp.status_code == 200
    assert cors_resp.headers.get("access-control-allow-origin") == "https://skills-catalyst-git-main.vercel.app"

    print("[OK] CORS & Security Headers tests passed!")

def test_aptitude_attempt_optional_user_id():
    print("Testing aptitude attempt authorization consistency...")
    
    # Send attempt without client user_id in body
    payload = {
        "topic_id": 1,
        "question_id": 10,
        "selected_option_index": 2,
        "is_correct": True,
        "time_taken_seconds": 15
    }
    resp = client.post("/api/practice/aptitude/attempt", json=payload)
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["status"] == "success"
    assert res_json["attempt"]["user_id"].startswith("guest_")

    print("[OK] Authorization consistency test passed!")

if __name__ == "__main__":
    test_startup_validation()
    test_secure_guest_sessions()
    test_security_headers_and_cors()
    test_aptitude_attempt_optional_user_id()
    print("\nSUCCESS: ALL PHASE 2 AUTOMATED TESTS PASSED SUCCESSFULLY!")
