import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import (
    _sign_guest_id,
    _verify_guest_id,
    sanitize_or_generate_guest_id,
    get_current_user_id,
)

client = TestClient(app)


def test_guest_token_signing_and_verification():
    raw_guest = "guest_1234567890abcdef"
    signed_token = _sign_guest_id(raw_guest)

    assert "." in signed_token
    assert signed_token.startswith("guest_1234567890abcdef.")

    # Verification must extract the original raw guest ID
    verified_id = _verify_guest_id(signed_token)
    assert verified_id == raw_guest


def test_tampered_guest_token_rejection():
    raw_guest = "guest_1234567890abcdef"
    signed_token = _sign_guest_id(raw_guest)

    # Tamper with signature
    tampered_sig = signed_token[:-4] + "dead"
    assert _verify_guest_id(tampered_sig) is None

    # Tamper with payload
    tampered_payload = "guest_9999999999abcdef." + signed_token.split(".")[1]
    assert _verify_guest_id(tampered_payload) is None


def test_raw_uuid_namespacing_to_prevent_idor():
    """Verify unauthenticated raw UUID is safely namespaced to prevent user spoofing."""
    raw_uuid = "12345678-1234-1234-1234-123456789abc"
    db_id, signed_token = sanitize_or_generate_guest_id(raw_uuid)

    assert db_id.startswith("guest_")
    assert db_id != raw_uuid
    assert "." in signed_token


def test_authenticated_route_rejects_missing_or_invalid_jwt():
    """Protected endpoints must reject invalid JWTs with 401 Unauthorized."""
    resp = client.get("/api/profile", headers={"Authorization": "Bearer invalid_token"})
    assert resp.status_code == 401
