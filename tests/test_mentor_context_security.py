"""
tests/test_mentor_context_security.py
Adversarial Security Test Suite for SkillsCatalyst AI Mentor Context Aggregator.
Covers:
- P0: Authentication Security (Tests 1 - 5)
- P0: IDOR & Cross-User Security (Tests 6 - 9)
- P0: Sensitive Data & Secret Leakage Scans (Tests 26 - 28)
"""

import jwt
import time
import json
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import SUPABASE_JWT_SECRET, SUPABASE_SERVICE_KEY, GROQ_API_KEY
from backend.services.auth_service import get_current_user_id, get_session_or_user_id
import backend.services.ai_mentor.context_aggregator as aggregator_module
import backend.routers.ai_mentor as router_module
from backend.services.ai_mentor import build_student_mentor_context

client = TestClient(app)

USER_A_ID = "11111111-1111-1111-1111-111111111111"
USER_B_ID = "22222222-2222-2222-2222-222222222222"

MOCK_SECRET = SUPABASE_JWT_SECRET or "test-jwt-secret-for-adversarial-tests-32b"


def _create_jwt(payload: dict, secret: str = MOCK_SECRET, algorithm: str = "HS256") -> str:
    return jwt.encode(payload, secret, algorithm=algorithm)


# ==============================================================================
# P0: Authentication Security (Tests 1 - 5)
# ==============================================================================

def test_01_missing_authorization_header():
    """Test 1: GET /api/ai-mentor/context without Authorization header returns 401."""
    resp = client.get("/api/ai-mentor/context")
    assert resp.status_code == 401
    assert "Invalid or missing" in resp.text or "Not authenticated" in resp.text


@pytest.mark.parametrize("header_value", [
    "Bearer",
    "Bearer ",
    "Bearer null",
    "Bearer undefined",
    "Bearer abc",
    "Basic abc",
    "Token xyz",
    "bearer 123",
    "",
])
def test_02_malformed_authorization_headers(header_value):
    """Test 2: Malformed Authorization tokens return 401, NEVER 500."""
    headers = {"Authorization": header_value} if header_value else {}
    resp = client.get("/api/ai-mentor/context", headers=headers)
    assert resp.status_code == 401
    assert resp.status_code != 500


def test_03_expired_jwt(monkeypatch):
    """Test 3: Expired JWT token returns 401 with expiration notice, no context generated."""
    monkeypatch.setattr("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET)

    expired_payload = {
        "sub": USER_A_ID,
        "email": "alice@example.com",
        "exp": int(time.time()) - 3600,  # 1 hour ago
    }
    expired_token = _create_jwt(expired_payload)

    resp = client.get("/api/ai-mentor/context", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert "expired" in resp.text.lower()


def test_04_invalid_jwt_signature(monkeypatch):
    """Test 4: Token signed with untrusted/wrong secret returns 401."""
    monkeypatch.setattr("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET)

    valid_looking_payload = {
        "sub": USER_A_ID,
        "email": "alice@example.com",
        "exp": int(time.time()) + 3600,
    }
    wrong_secret_token = _create_jwt(valid_looking_payload, secret="attacker-malicious-secret")

    resp = client.get("/api/ai-mentor/context", headers={"Authorization": f"Bearer {wrong_secret_token}"})
    assert resp.status_code == 401


def test_05_invalid_uuid_sub_in_jwt(monkeypatch):
    """
    Test 5: JWT with non-UUID sub (e.g. SQL injection payload or string)
    must fail closed without executing arbitrary DB queries or crashing with 500.
    """
    monkeypatch.setattr("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET)

    malicious_payload = {
        "sub": "not-a-valid-user-id'; DROP TABLE profiles;--",
        "email": "hacker@example.com",
        "exp": int(time.time()) + 3600,
    }
    malicious_token = _create_jwt(malicious_payload)

    mock_sb = MagicMock()
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)

    resp = client.get("/api/ai-mentor/context", headers={"Authorization": f"Bearer {malicious_token}"})
    assert resp.status_code in (200, 400, 401, 403)
    if resp.status_code == 200:
        data = resp.json()
        assert data["metadata"]["user_id_hash"] == "anonymous"
        assert data["student"]["name"] == "Learner"
    # Verify no database queries were triggered with the malicious sub
    assert mock_sb.table.call_count == 0


# ==============================================================================
# P0: IDOR & Cross-User Security (Tests 6 - 9)
# ==============================================================================

def test_06_cross_user_body_parameter_in_chat(monkeypatch):
    """
    Test 6: Authenticated as User A, sending body with user_id=USER_B must NOT
    load or expose User B's context.
    """
    captured_prompts = []

    def mock_chat_with_groq(prompt, system_prompt=None):
        captured_prompts.append(system_prompt)
        return "Advice for User A."

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)

    # Mock User A returning context for User A
    async def mock_get_context(uid, force_refresh=False):
        assert uid == USER_A_ID, f"CRITICAL IDOR: Requested context for {uid} instead of authenticated {USER_A_ID}!"
        return f"<student_context><profile name=\"User A Data Only\" uid=\"{uid}\" /></student_context>"

    monkeypatch.setattr(router_module, "get_formatted_student_context_for_mentor", mock_get_context)
    app.dependency_overrides[get_session_or_user_id] = lambda: USER_A_ID

    try:
        resp = client.post(
            "/api/ai-mentor/chat",
            json={
                "prompt": "What should I focus on?",
                "user_id": USER_B_ID,  # Attacker tries to inject User B's ID
            },
        )
        assert resp.status_code == 200
        assert len(captured_prompts) == 1
        assert "User A Data Only" in captured_prompts[0]
        assert USER_B_ID not in captured_prompts[0]
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_07_cross_user_query_parameter_in_context(monkeypatch):
    """
    Test 7: Authenticated as User A, requesting GET /api/ai-mentor/context?user_id=USER_B
    must return ONLY User A context.
    """
    app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID

    async def mock_build_context(uid, force_refresh=False):
        assert uid == USER_A_ID, f"CRITICAL IDOR: Context built for {uid} instead of authenticated {USER_A_ID}!"
        ctx = aggregator_module.MentorContext(
            student=aggregator_module.StudentProfileContext(name="Alice User A"),
            metadata=aggregator_module.ContextMetadata(
                generated_at="2026-10-07T00:00:00Z",
                user_id_hash="user_a_hash",
                duration_ms=1.0,
            ),
        )
        return ctx

    monkeypatch.setattr(router_module, "build_student_mentor_context", mock_build_context)

    try:
        resp = client.get(f"/api/ai-mentor/context?user_id={USER_B_ID}&target_user={USER_B_ID}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["student"]["name"] == "Alice User A"
        assert data["metadata"]["user_id_hash"] == "user_a_hash"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)


def test_08_cross_user_header_spoofing(monkeypatch):
    """
    Test 8: Authenticated as User A, spoofing headers like X-User-ID or X-Authenticated-User
    has zero effect on context isolation.
    """
    app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID

    async def mock_build_context(uid, force_refresh=False):
        assert uid == USER_A_ID, f"CRITICAL IDOR: Header spoof caused context lookup for {uid}!"
        return aggregator_module.MentorContext(
            student=aggregator_module.StudentProfileContext(name="Alice User A"),
            metadata=aggregator_module.ContextMetadata(
                generated_at="2026-10-07T00:00:00Z",
                user_id_hash="user_a_hash",
                duration_ms=1.0,
            ),
        )

    monkeypatch.setattr(router_module, "build_student_mentor_context", mock_build_context)

    try:
        spoofed_headers = {
            "X-User-ID": USER_B_ID,
            "X-Authenticated-User": USER_B_ID,
            "X-Forwarded-User": USER_B_ID,
            "X-On-Behalf-Of": USER_B_ID,
        }
        resp = client.get("/api/ai-mentor/context", headers=spoofed_headers)
        assert resp.status_code == 200
        assert resp.json()["student"]["name"] == "Alice User A"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)


def test_09_alternate_path_idor_probe():
    """
    Test 9: Verify that alternate un-namespaced context routes do not exist or return 404.
    """
    for route in [
        f"/api/ai-mentor/context/{USER_B_ID}",
        f"/api/ai-mentor/{USER_B_ID}/context",
        f"/api/ai-mentor/users/{USER_B_ID}/context",
        f"/api/context/{USER_B_ID}",
    ]:
        resp = client.get(route)
        assert resp.status_code in (404, 401, 405), f"Unexpected route accessible: {route} returned {resp.status_code}"


# ==============================================================================
# P0: Sensitive Data & Secret Leakage Scans (Tests 26 - 28)
# ==============================================================================

_FORBIDDEN_SECRET_KEYS = [
    "password",
    "secret",
    "jwt",
    "access_token",
    "refresh_token",
    "service_key",
    "api_key",
    "groq_api_key",
    "email",
    "phone",
    "session_cookie",
]


def _recursive_key_search(data, forbidden_keys):
    found = []
    if isinstance(data, dict):
        for k, v in data.items():
            for forbidden in forbidden_keys:
                if forbidden.lower() in k.lower():
                    found.append((k, str(v)[:20]))
            found.extend(_recursive_key_search(v, forbidden_keys))
    elif isinstance(data, list):
        for item in data:
            found.extend(_recursive_key_search(item, forbidden_keys))
    return found


def test_26_automated_sensitive_key_scan_on_serialized_context():
    """
    Test 26: Serialized MentorContext must NOT contain sensitive PII or system secret fields.
    """
    ctx = aggregator_module.MentorContext(
        student=aggregator_module.StudentProfileContext(
            name="Alice",
            college="MIT",
            department="CS",
            headline="Dev",
        ),
        metadata=aggregator_module.ContextMetadata(
            generated_at="2026-10-07T00:00:00Z",
            user_id_hash="123456789abc",
            duration_ms=2.5,
        ),
    )
    raw_json = ctx.model_dump()
    leaks = _recursive_key_search(raw_json, _FORBIDDEN_SECRET_KEYS)
    assert not leaks, f"Sensitive keys detected in serialized context: {leaks}"


def test_27_llm_prompt_secret_scan(monkeypatch):
    """
    Test 27: System prompt delivered to Groq LLM must NOT contain service secrets or API keys.
    """
    captured_prompts = []

    def mock_chat_with_groq(prompt, system_prompt=None):
        captured_prompts.append(system_prompt)
        return "Safe reply"

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)
    app.dependency_overrides[get_session_or_user_id] = lambda: USER_A_ID

    try:
        resp = client.post(
            "/api/ai-mentor/chat",
            json={"prompt": "Review my skills for backend engineer"},
        )
        assert resp.status_code == 200
        assert len(captured_prompts) == 1
        prompt_text = captured_prompts[0] or ""

        # Assert no environment secrets leaked into prompt
        if SUPABASE_SERVICE_KEY:
            assert SUPABASE_SERVICE_KEY not in prompt_text
        if GROQ_API_KEY:
            assert GROQ_API_KEY not in prompt_text
        assert "password" not in prompt_text.lower()
        assert "bearer " not in prompt_text.lower()
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_28_api_response_secret_scan(monkeypatch):
    """
    Test 28: Response body of GET /api/ai-mentor/context must NOT leak PII outside explicit contract.
    """
    app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID

    try:
        resp = client.get("/api/ai-mentor/context")
        assert resp.status_code == 200
        body = resp.json()

        leaks = _recursive_key_search(body, _FORBIDDEN_SECRET_KEYS)
        assert not leaks, f"Sensitive keys leaked in GET /context API response: {leaks}"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)
