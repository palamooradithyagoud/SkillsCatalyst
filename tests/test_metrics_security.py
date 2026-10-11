"""
tests/test_metrics_security.py
Comprehensive Security Verification Suite for SEC-C-7: Metrics Endpoint Protection.

Verifies:
  A. Unauthenticated requests to /api/metrics receive HTTP 401 Unauthorized.
  B. Invalid, malformed, or tampered credentials receive HTTP 401 Unauthorized.
  C. Authenticated students receive HTTP 403 Forbidden (no access to operational telemetry).
  D. Authorized administrative identities (owner, admin) receive HTTP 200 OK.
  E. Authorized monitoring identities (via X-Monitoring-Key or Bearer METRICS_SECRET_KEY) receive HTTP 200 OK.
  F. Insufficiently privileged authenticated identities receive HTTP 403 Forbidden.
  G. Error responses never leak stack traces, database details, or secret keys.
  H. Public health-check (/health, /api/health, /ready) remains accessible without credentials.
  I. No alternative routes expose sensitive operational metrics without authentication.
"""

import time
import uuid
import jwt
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import SUPABASE_JWT_SECRET, SUPABASE_URL

client = TestClient(app)

TEST_SECRET = SUPABASE_JWT_SECRET or "test-secret-key-that-is-at-least-thirty-two-bytes-long"
MONITORING_KEY = "test-prod-monitoring-secret-key-32chars"


def _make_token(user_id: str, role: str = "student", expired: bool = False, bad_secret: bool = False) -> str:
    now = int(time.time())
    secret = "wrong-secret-key-attacker" if bad_secret else TEST_SECRET
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "email": f"{role}@skillscatalyst.internal",
        "role": role,
        "app_metadata": {"role": role},
        "exp": (now - 60) if expired else (now + 3600),
        "iss": f"{SUPABASE_URL}/auth/v1",
    }
    return jwt.encode(payload, secret, algorithm="HS256")


# ── 1. Unauthenticated Access Protection ───────────────────────────────────────

def test_unauthenticated_request_rejected_401():
    """A. Missing credentials on /api/metrics must strictly return HTTP 401."""
    resp = client.get("/api/metrics")
    assert resp.status_code == 401
    assert "WWW-Authenticate" in resp.headers


def test_empty_or_whitespace_bearer_rejected_401():
    """A. Blank or whitespace Bearer header rejected with HTTP 401."""
    for header in ["Bearer ", "Bearer", "Bearer    ", "Bearer undefined", "Bearer null"]:
        resp = client.get("/api/metrics", headers={"Authorization": header})
        assert resp.status_code == 401


# ── 2. Invalid / Malformed Credential Protection ───────────────────────────────

def test_malformed_token_rejected_401():
    """B. Malformed non-JWT tokens rejected with HTTP 401."""
    for malformed in ["Bearer not-a-jwt", "Bearer abc.def", "Bearer 12345"]:
        resp = client.get("/api/metrics", headers={"Authorization": malformed})
        assert resp.status_code == 401


def test_invalid_signature_token_rejected_401():
    """B. Token signed with wrong secret rejected with HTTP 401."""
    tampered_token = _make_token(str(uuid.uuid4()), role="admin", bad_secret=True)
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 401


def test_expired_token_rejected_401():
    """B. Expired token rejected with HTTP 401."""
    expired_token = _make_token(str(uuid.uuid4()), role="admin", expired=True)
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401


def test_invalid_monitoring_key_rejected_401():
    """B. Invalid X-Monitoring-Key rejected with HTTP 401."""
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get("/api/metrics", headers={"X-Monitoring-Key": "invalid-wrong-secret"})
        assert resp.status_code == 401
        assert "monitoring credential" in resp.json().get("detail", "").lower()


# ── 3. Role-Based Authorization Enforcement ───────────────────────────────────

def test_student_user_forbidden_403():
    """C. Authenticated student account must receive HTTP 403 Forbidden."""
    student_id = str(uuid.uuid4())
    student_token = _make_token(student_id, role="student")
    
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 403
    assert "Forbidden" in resp.json().get("detail", "")


def test_unprivileged_editor_role_forbidden_403():
    """E. An editor or non-admin role receives HTTP 403 Forbidden."""
    editor_id = str(uuid.uuid4())
    editor_token = _make_token(editor_id, role="editor")
    
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {editor_token}"})
    assert resp.status_code == 403


def test_admin_user_allowed_200():
    """D. Authenticated admin user receives HTTP 200 OK with metrics payload."""
    admin_id = str(uuid.uuid4())
    admin_token = _make_token(admin_id, role="admin")
    
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "uptime_seconds" in data
    assert "requests" in data
    assert "redis_cache" in data


def test_owner_user_allowed_200():
    """D. Authenticated owner user receives HTTP 200 OK with metrics payload."""
    owner_id = str(uuid.uuid4())
    owner_token = _make_token(owner_id, role="owner")
    
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {owner_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "uptime_seconds" in data
    assert "ai_metrics" in data


# ── 4. Server-Side Monitoring Identity Protection ─────────────────────────────

def test_monitoring_key_via_header_allowed_200():
    """E. Authorized monitoring system using X-Monitoring-Key receives HTTP 200."""
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get("/api/metrics", headers={"X-Monitoring-Key": MONITORING_KEY})
        assert resp.status_code == 200
        data = resp.json()
        assert "uptime_seconds" in data
        assert "requests" in data


def test_monitoring_key_via_bearer_allowed_200():
    """E. Authorized monitoring system using Authorization: Bearer <KEY> receives HTTP 200."""
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {MONITORING_KEY}"})
        assert resp.status_code == 200
        assert "uptime_seconds" in resp.json()


def test_unset_monitoring_key_never_allows_empty_match():
    """
    Fail-Safe: When METRICS_SECRET_KEY is empty/unset, sending an empty or arbitrary
    key must NEVER match and must be strictly rejected with HTTP 401.
    """
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", ""):
        resp1 = client.get("/api/metrics", headers={"X-Monitoring-Key": ""})
        assert resp1.status_code == 401
        
        resp2 = client.get("/api/metrics", headers={"X-Monitoring-Key": "some-random-key"})
        assert resp2.status_code == 401


# ── 5. Error Response Privacy & Secret Non-Leakage ─────────────────────────────

def test_error_responses_do_not_leak_secrets_or_stack_traces():
    """F. Authentication failure error responses never leak secrets or stack traces."""
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get("/api/metrics", headers={"X-Monitoring-Key": "wrong-secret"})
        assert resp.status_code == 401
        
        raw_text = resp.text
        assert MONITORING_KEY not in raw_text
        assert "Traceback" not in raw_text
        assert "File " not in raw_text
        assert "SUPABASE" not in raw_text


# ── 6. Public Health Probes Integrity ──────────────────────────────────────────

def test_public_health_and_ready_endpoints_remain_accessible_without_auth():
    """G. Deployment probes (/health, /api/health, /ready) remain public and unauthenticated."""
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"
    assert "services" in r_health.json()

    r_api_health = client.get("/api/health")
    assert r_api_health.status_code == 200
    assert r_api_health.json()["status"] == "healthy"

    r_ready = client.get("/ready")
    assert r_ready.status_code == 200
    assert r_ready.json()["status"] == "ready"


# ── 7. Alternative Route Protection ───────────────────────────────────────────

def test_alternative_routes_do_not_expose_unprotected_metrics():
    """I. Verify /api/admin/system-status requires owner auth and does not allow unauthenticated access."""
    r_admin_status = client.get("/api/admin/system-status")
    assert r_admin_status.status_code in (401, 403)
