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


def _make_token(
    user_id: str,
    role: str = "student",
    expired: bool = False,
    bad_secret: bool = False,
    app_metadata: dict = None,
    user_metadata: dict = None,
) -> str:
    now = int(time.time())
    secret = "wrong-secret-key-attacker-32bytes-len" if bad_secret else TEST_SECRET
    payload = {
        "sub": user_id,
        "aud": "authenticated",
        "email": f"{role}@skillscatalyst.internal",
        "role": role,
        "app_metadata": app_metadata if app_metadata is not None else {"role": role},
        "user_metadata": user_metadata or {},
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


# ── 7. Alternative Route Protection & Defense in Depth ─────────────────────────

def test_alternative_routes_do_not_expose_unprotected_metrics():
    """I. Verify /api/admin/system-status requires owner auth and does not allow unauthenticated access."""
    r_admin_status = client.get("/api/admin/system-status")
    assert r_admin_status.status_code in (401, 403)


def test_alternative_admin_routes_reject_unauthenticated_and_student_access():
    """Verify alternative administrative endpoints reject unauthenticated and student users."""
    for route in ["/api/admin/system-status", "/api/admin/users"]:
        # Unauthenticated rejected
        resp_unauth = client.get(route)
        assert resp_unauth.status_code in (401, 403)

        # Student user rejected
        student_id = str(uuid.uuid4())
        student_token = _make_token(student_id, role="student")
        resp_student = client.get(route, headers={"Authorization": f"Bearer {student_token}"})
        assert resp_student.status_code == 403


# ── 8. Adversarial Role & Metadata Tampering Verification ──────────────────────

def test_user_metadata_role_tampering_rejected_403():
    """
    Verify that user-controlled claims (e.g. user_metadata: {"role": "owner"})
    cannot escalate privileges when authoritative app_metadata indicates student.
    """
    user_id = str(uuid.uuid4())
    # Attacker sets role to "owner" in user_metadata, but server app_metadata is "student"
    tampered_token = _make_token(
        user_id,
        role="student",
        app_metadata={"role": "student"},
        user_metadata={"role": "owner", "role_name": "admin"},
    )
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 403
    assert "Forbidden" in resp.json().get("detail", "")


def test_tampered_role_with_forged_signature_fails_closed_401():
    """
    Verify that an attacker attempting to forge an owner JWT signed with an untrusted
    key is rejected at the signature verification step with HTTP 401.
    """
    attacker_id = str(uuid.uuid4())
    forged_token = _make_token(attacker_id, role="owner", bad_secret=True)
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {forged_token}"})
    assert resp.status_code == 401


def test_invalid_uuid_subject_in_token_rejected_401():
    """Verify that a token with a non-UUID subject fails closed with HTTP 401."""
    invalid_sub_token = _make_token("not-a-valid-uuid", role="admin")
    resp = client.get("/api/metrics", headers={"Authorization": f"Bearer {invalid_sub_token}"})
    assert resp.status_code == 401


# ── 9. Conflicting & Non-Standard Authentication Headers ────────────────────────

def test_conflicting_headers_invalid_monitoring_key_fails_closed():
    """
    When conflicting credentials are supplied (invalid X-Monitoring-Key with a valid
    Admin Bearer token), the system must fail closed and reject with HTTP 401.
    """
    admin_id = str(uuid.uuid4())
    admin_token = _make_token(admin_id, role="admin")
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get(
            "/api/metrics",
            headers={
                "X-Monitoring-Key": "invalid-attacker-key",
                "Authorization": f"Bearer {admin_token}",
            },
        )
        assert resp.status_code == 401


def test_conflicting_headers_valid_monitoring_key_authorizes_monitoring_probe():
    """
    When a valid X-Monitoring-Key is provided alongside a malformed Bearer token,
    the legitimate monitoring identity is securely authorized.
    """
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get(
            "/api/metrics",
            headers={
                "X-Monitoring-Key": MONITORING_KEY,
                "Authorization": "Bearer malformed-unrelated-token",
            },
        )
        assert resp.status_code == 200
        assert "uptime_seconds" in resp.json()


def test_conflicting_headers_both_invalid_rejected_401():
    """When both X-Monitoring-Key and Bearer credentials are bad, returns HTTP 401."""
    with patch("backend.services.auth_service.METRICS_SECRET_KEY", MONITORING_KEY):
        resp = client.get(
            "/api/metrics",
            headers={
                "X-Monitoring-Key": "wrong-key",
                "Authorization": "Bearer wrong-token",
            },
        )
        assert resp.status_code == 401


def test_non_bearer_authorization_scheme_rejected_401():
    """Verify non-Bearer schemes (e.g. Basic, Digest, Token) are rejected with HTTP 401."""
    for scheme in ["Basic dXNlcjpwYXNz", "Token my-api-token", "Digest something"]:
        resp = client.get("/api/metrics", headers={"Authorization": scheme})
        assert resp.status_code == 401


# ── 10. Dependency Exception Handling & Fail-Closed Behavior ───────────────────

def test_auth_dependency_exception_fails_closed():
    """
    Verify that unexpected exceptions during authentication dependency execution
    fail closed and never authorize an unverified request.
    """
    with patch("backend.services.auth_service.verify_jwt_token", side_effect=Exception("Unexpected crypto failure")):
        resp = client.get("/api/metrics", headers={"Authorization": "Bearer some-token"})
        assert resp.status_code in (401, 500)
        assert resp.status_code != 200


# ── 11. Health Check Information Disclosure Prevention ────────────────────────

def test_health_checks_do_not_disclose_sensitive_metrics():
    """
    Verify that public deployment probes (/health, /api/health, /ready) disclose
    only high-level service status and DO NOT expose internal AI model usage,
    latencies, detailed error breakdowns, or search source analytics.
    """
    for endpoint in ["/health", "/api/health", "/ready"]:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        raw_text = resp.text

        # 1. No external AI model details
        assert "llama" not in raw_text.lower()
        assert "ai_metrics" not in raw_text
        assert "ai_errors" not in raw_text
        assert "timeouts" not in raw_text

        # 2. No internal latency percentiles
        assert "latency_ms" not in raw_text
        assert "p95" not in raw_text
        assert "p99" not in raw_text

        # 3. No search breakdown analytics
        assert "learning_search_breakdown" not in raw_text

        # 4. No sensitive configuration secrets
        assert "ey" not in raw_text  # No JWT headers
        assert "gsk_" not in raw_text
        assert "rediss://" not in raw_text

