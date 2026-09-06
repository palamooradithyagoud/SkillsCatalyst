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


def test_validate_startup_config_fails_fast_in_production_without_secret(monkeypatch):
    """Production must immediately abort startup if SECRET_KEY is missing."""
    import os
    from backend.config import validate_startup_config

    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.setenv("SECRET_KEY", "")

    with pytest.raises(RuntimeError, match="CRITICAL SECURITY ERROR"):
        validate_startup_config()


def test_validate_startup_config_fails_fast_in_production_with_insecure_secret(monkeypatch):
    """Production must immediately abort startup if SECRET_KEY is an insecure default or too short."""
    import os
    from backend.config import validate_startup_config

    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.setenv("SECRET_KEY", "skills-catalyst-prod-sec-key-8f4b9c1d2e3f4a5b6c7d8e9f")

    with pytest.raises(RuntimeError, match="CRITICAL SECURITY ERROR"):
        validate_startup_config()


def test_validate_startup_config_passes_in_production_with_strong_secret(monkeypatch):
    """Production startup succeeds when a strong 32+ char SECRET_KEY is configured."""
    from backend.config import validate_startup_config

    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.setenv("SECRET_KEY", "a" * 64)

    # Should complete without raising RuntimeError
    validate_startup_config()


def test_validate_startup_config_safe_fallback_in_development(monkeypatch):
    """Development/testing allows safe fallback without raising fatal RuntimeError."""
    from backend.config import validate_startup_config

    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)
    monkeypatch.setenv("SECRET_KEY", "")

    # Non-production environment must not abort
    validate_startup_config()

