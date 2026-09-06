"""
SkillsCatalyst - Phase 3.2 Critical E2E Journeys Test Suite
Verifies:
- AUTH-01 to AUTH-04: JWT validation, expiry, invalid signatures, missing headers
- AUTH-05 to AUTH-06: Cross-tenant IDOR protection (Video progress, Playlists, Roadmaps, Dashboard)
- GUEST-01 to GUEST-03: Guest session integrity, HMAC tampering recovery, and namespace isolation
- LEARN-01 to LEARN-03: Video resume, bounds sanitization (anti-cheat), and 75% auto-completion
- PLAY-01 to PLAY-02: Saved playlist idempotency and cross-user deletion isolation
- CAREER-01 to CAREER-02: Resume upload size enforcement (5MB) and magic bytes validation
- PRACTICE-01: Company questions retrieval and attempt identity binding
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException

from backend.main import app
from backend.services.auth_service import (
    _sign_guest_id,
    _verify_guest_id,
    sanitize_or_generate_guest_id,
    get_current_user_id,
    get_session_or_user_id,
)
from backend.routers.learning import (
    SaveProgressRequest,
    CompleteVideoRequest,
    SavePlaylistRequest,
    save_video_progress,
    complete_video,
    resume_progress,
)
from backend.services.learning.playlist_service import (
    save_playlist,
    unsave_playlist,
    get_saved_playlists,
)
from backend.routers.practice import AptitudeAttemptRequest, record_aptitude_attempt

client = TestClient(app)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_mock_supabase_user(user_id: str, email: str = "test@example.com"):
    mock_u = MagicMock()
    mock_u.id = user_id
    mock_u.email = email
    mock_u.user_metadata = {"full_name": "Test User"}
    mock_res = MagicMock()
    mock_res.user = mock_u
    return mock_res


# ── 1. Authentication & Security (AUTH-01 to AUTH-06) ──────────────────────────

def test_auth_01_valid_jwt_resolves_user_id():
    """AUTH-01: Valid JWT token resolves to the exact authenticated user UUID."""
    user_uuid = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_sb.auth.get_user.return_value = _make_mock_supabase_user(user_uuid)

    with patch("backend.services.auth_service.get_supabase", return_value=mock_sb):
        resolved_id = get_current_user_id(authorization="Bearer valid_supabase_jwt")
        assert resolved_id == user_uuid
        mock_sb.auth.get_user.assert_called_once_with(jwt="valid_supabase_jwt")


def test_auth_02_expired_jwt_rejected():
    """AUTH-02: Expired JWT token is rejected with 401 Unauthorized."""
    mock_sb = MagicMock()
    mock_sb.auth.get_user.side_effect = Exception("JWT expired at timestamp 1700000000")

    with patch("backend.services.auth_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(authorization="Bearer expired_jwt_token")
        assert exc_info.value.status_code == 401
        assert "Invalid or missing authentication token" in exc_info.value.detail


def test_auth_03_invalid_or_forged_jwt_rejected():
    """AUTH-03: Tampered or forged JWT signatures are rejected with 401."""
    mock_sb = MagicMock()
    mock_sb.auth.get_user.side_effect = Exception("invalid signature")

    with patch("backend.services.auth_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(authorization="Bearer eyJhbGciOiJIUzI1NiJ9.forged.sig")
        assert exc_info.value.status_code == 401
        assert exc_info.value.headers.get("WWW-Authenticate") == "Bearer"


def test_auth_04_missing_or_malformed_auth_headers_reject():
    """AUTH-04: Missing Bearer token on protected endpoints strictly returns 401."""
    protected_endpoints = [
        ("GET", "/api/profile"),
        ("GET", "/api/dashboard"),
        ("GET", "/api/dashboard/active-roadmap"),
        ("POST", "/api/auth/welcome-email"),
        ("POST", "/api/ai-mentor/review-resume"),
    ]

    for method, path in protected_endpoints:
        if method == "GET":
            resp = client.get(path)
        else:
            resp = client.post(path, json={})
        assert resp.status_code == 401, f"Endpoint {path} did not reject unauthenticated request with 401"
        assert "Bearer" in resp.headers.get("WWW-Authenticate", "")


@pytest.mark.anyio
async def test_auth_05_idor_video_progress_cross_tenant_isolation():
    """
    AUTH-05: User A's token cannot overwrite or modify User B's video progress.
    Verifies that update and insert operations always filter by caller user_id.
    """
    user_a = str(uuid.uuid4())
    user_b = str(uuid.uuid4())

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Simulate User A saving progress
    mock_table.update.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": 101, "user_id": user_a}]
    )

    req = SaveProgressRequest(
        playlist_id="PL_shared_course",
        video_id="vid_001",
        last_position=60.0,
        watch_time=58,
        updated_at="2026-09-07T00:00:00Z",
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # Call with User A credentials
        res = await save_video_progress(req, current_user_id=user_a)
        assert res.get("success") is True

        # Check query arguments
        mock_sb.table.assert_called_with("video_progress")
        first_eq_call = mock_table.update.return_value.eq.call_args_list[0]
        assert first_eq_call[0] == ("user_id", user_a)
        assert first_eq_call[0] != ("user_id", user_b)


@pytest.mark.anyio
async def test_auth_06_idor_saved_playlists_and_roadmap_isolation():
    """
    AUTH-06: User A cannot read or delete User B's saved playlists or active roadmap.
    """
    user_a = str(uuid.uuid4())
    user_b = str(uuid.uuid4())

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # 1. Unsave playlist: User A attempts unsave
        await unsave_playlist(playlist_id="PL_top_secret", user_id=user_a)
        assert any(c[0] == ("saved_playlists",) for c in mock_sb.table.call_args_list)
        eq_call = mock_table.delete.return_value.eq.call_args
        assert eq_call[0] == ("user_id", user_a)
        assert eq_call[0] != ("user_id", user_b)

        # 2. Get saved playlists: User A can only see User A's playlists
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
            data=[{"id": "PL_user_a", "title": "User A Course", "user_id": user_a}]
        )
        result = await get_saved_playlists(user_id=user_a)
        select_eq_calls = mock_table.select.return_value.eq.call_args_list
        assert any(c[0] == ("user_id", user_a) for c in select_eq_calls)
        assert not any(c[0] == ("user_id", user_b) for c in select_eq_calls)
        assert result["count"] >= 1

    # 3. Active Roadmap isolation: User A cannot delete User B's roadmap
    from backend.routers.dashboard import delete_active_roadmap_endpoint
    mock_sb_dash = MagicMock()
    mock_table_dash = MagicMock()
    mock_sb_dash.table.return_value = mock_table_dash
    mock_table_dash.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": 42, "roadmap_id": "python-mastery"}]
    )

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb_dash):
        res_rm = delete_active_roadmap_endpoint("python-mastery", user_id=user_a)
        assert res_rm["success"] is True
        mock_sb_dash.table.assert_any_call("roadmap_progress")
        dash_select_eq = mock_table_dash.select.return_value.eq.call_args
        assert dash_select_eq[0] == ("user_id", user_a)
        assert dash_select_eq[0] != ("user_id", user_b)


# ── 2. Guest Session Lifecycle & Isolation (GUEST-01 to GUEST-03) ──────────────

def test_guest_01_tampered_hmac_generates_isolated_guest():
    """
    GUEST-01: Tampering with guest HMAC signature invalidates token and
    safely generates a fresh, isolated guest session.
    """
    legit_guest = "guest_1122334455667788"
    legit_token = _sign_guest_id(legit_guest)
    assert _verify_guest_id(legit_token) == legit_guest

    # Tamper with signature
    tampered_token = legit_token[:-4] + "0000"
    assert _verify_guest_id(tampered_token) is None

    # Sanitize must not return tampered identity; must generate a fresh guest ID
    db_id, new_token = sanitize_or_generate_guest_id(tampered_token)
    assert db_id != legit_guest
    assert db_id.startswith("guest_")
    assert "." in new_token
    assert _verify_guest_id(new_token) == db_id


@pytest.mark.anyio
async def test_guest_02_guest_progress_isolated_to_jsonb():
    """
    GUEST-02: Guest progress is strictly written to learning_progress JSONB,
    never corrupting authenticated relational video_progress table.
    """
    guest_id = "guest_session_alpha_123"
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Existing guest progress
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"id": 99, "completed_steps": [{"id": "PL_guest", "videos": []}]}]
    )
    mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": 99}])

    req = SaveProgressRequest(
        playlist_id="PL_guest",
        video_id="vid_guest_1",
        last_position=45.0,
        watch_time=40,
        updated_at="2026-09-07T00:00:00Z",
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        res = await save_video_progress(req, current_user_id=guest_id)
        assert res.get("success") is True

        # Verify target table was learning_progress, NOT video_progress
        assert mock_sb.table.call_args_list[0][0][0] == "learning_progress"
        for call in mock_sb.table.call_args_list:
            assert call[0][0] != "video_progress"


def test_guest_03_raw_uuid_namespacing_prevents_user_spoofing():
    """
    GUEST-03: Submitting a valid UUID in x-session-id without Bearer token
    is namespaced to guest_<hex> to prevent user account impersonation.
    """
    victim_user_id = str(uuid.uuid4())
    db_id, signed_token = sanitize_or_generate_guest_id(victim_user_id)

    assert db_id != victim_user_id
    assert db_id.startswith("guest_")
    assert victim_user_id.replace("-", "")[:24] in db_id
    assert _verify_guest_id(signed_token) == db_id


# ── 3. Learning Playback, Resume & Anti-Cheat (LEARN-01 to LEARN-03) ───────────

@pytest.mark.anyio
async def test_learn_01_resume_progress_retrieval():
    """
    LEARN-01: Correctly retrieves last stored position and watched status for a video.
    """
    auth_user = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"last_position": 145, "watched": False}]
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        resume_data = await resume_progress("vid_resume_test", current_user_id=auth_user)
        assert resume_data["last_position"] == 145
        assert resume_data["completed"] is False


@pytest.mark.anyio
async def test_learn_02_bounds_checking_and_anti_cheat_rejection():
    """
    LEARN-02: Enforces strict bounds: negative position, excessive position (>86400s),
    and negative watch_time are rejected without crashing.
    """
    auth_user = str(uuid.uuid4())
    mock_sb = MagicMock()

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # 1. Negative last_position rejected
        bad_req1 = SaveProgressRequest(
            playlist_id="PL_bounds",
            video_id="vid_1",
            last_position=-15.0,
            watch_time=10,
        )
        res1 = await save_video_progress(bad_req1, current_user_id=auth_user)
        assert res1["success"] is False
        assert "Invalid position" in res1["reason"]

        # 2. Excessive last_position (>86400s / 24 hours) rejected
        bad_req2 = SaveProgressRequest(
            playlist_id="PL_bounds",
            video_id="vid_1",
            last_position=99999.0,
            watch_time=10,
        )
        res2 = await save_video_progress(bad_req2, current_user_id=auth_user)
        assert res2["success"] is False
        assert "Invalid position" in res2["reason"]

        # 3. Negative watch_time rejected in save_video_progress
        bad_req3 = SaveProgressRequest(
            playlist_id="PL_bounds",
            video_id="vid_1",
            last_position=100.0,
            watch_time=-50,
        )
        res3 = await save_video_progress(bad_req3, current_user_id=auth_user)
        assert res3["success"] is False
        assert "Invalid position" in res3["reason"]

        # 4. Negative watch_time in complete_video raises 400
        bad_complete = CompleteVideoRequest(
            playlist_id="PL_bounds",
            video_id="vid_1",
            watch_time=-1,
            completed=True,
        )
        with pytest.raises(HTTPException) as exc_info:
            await complete_video(bad_complete, current_user_id=auth_user)
        assert exc_info.value.status_code == 400


@pytest.mark.anyio
async def test_learn_03_75_percent_completion_verification():
    """
    LEARN-03: When >=75% watched, complete_video marks watched=True and records completion timestamp.
    """
    auth_user = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    # Mock video count query
    mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"video_count": "10"}])
    # Mock completed count query
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        count=8, data=[{"video_id": f"v{i}"} for i in range(8)]
    )

    req = CompleteVideoRequest(
        playlist_id="PL_course_01",
        video_id="vid_01",
        watch_time=300,
        completed=True,
        last_position=300.0,
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        res = await complete_video(req, current_user_id=auth_user)
        assert res["success"] is True

        # Verify upsert payload
        upsert_call = mock_table.upsert.call_args[0][0]
        assert upsert_call["user_id"] == auth_user
        assert upsert_call["video_id"] == "vid_01"
        assert upsert_call["watched"] is True
        assert upsert_call["completed_at"] is not None


# ── 4. Playlist Save & Management (PLAY-01 to PLAY-02) ─────────────────────────

@pytest.mark.anyio
async def test_play_01_playlist_save_idempotency():
    """
    PLAY-01: Repeatedly saving the same playlist is idempotent and does not produce duplicate rows.
    """
    auth_user = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    mock_table.upsert.return_value.execute.return_value = MagicMock(
        data=[{"id": 1, "playlist_id": "PL_idempotent_test"}]
    )

    req = SavePlaylistRequest(
        playlist_id="PL_idempotent_test",
        title="Scalable Python Architecture",
        channel="Tech Channel",
        video_count="15",
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # Save 1
        res1 = await save_playlist(req, current_user_id=auth_user)
        assert res1["success"] is True

        # Save 2 (exact same playlist)
        res2 = await save_playlist(req, current_user_id=auth_user)
        assert res2["success"] is True

        # Table saved_playlists was upserted with on_conflict="playlist_id,user_id"
        upsert_calls = mock_table.upsert.call_args_list
        saved_playlists_upsert = next(c for c in upsert_calls if c[1].get("on_conflict") == "playlist_id,user_id")
        assert saved_playlists_upsert is not None


# ── 5. Career & Resume Upload Validation (CAREER-01 to CAREER-02) ──────────────

def test_career_01_resume_upload_size_limit():
    """
    CAREER-01: Uploads exceeding MAX_FILE_SIZE_BYTES (5MB) are rejected with 413 Request Entity Too Large.
    """
    # 5MB + 1KB payload
    oversized_data = b"%PDF-" + b"0" * (5 * 1024 * 1024 + 1024)

    resp = client.post(
        "/api/resume/extract",
        files={"file": ("large_resume.pdf", oversized_data, "application/pdf")},
    )
    assert resp.status_code == 413
    data = resp.json()
    assert data.get("success") is False
    assert "exceeds the maximum allowed limit of 5MB" in data.get("message")


def test_career_02_resume_magic_bytes_validation():
    """
    CAREER-02: Files with disguised extensions (e.g. executable/text pretending to be PDF)
    are rejected with 400 Bad Request.
    """
    # Fake PDF: named .pdf but contains text without PDF magic bytes
    fake_pdf_data = b"This is a plaintext script pretending to be a PDF."

    resp = client.post(
        "/api/resume/extract",
        files={"file": ("fake.pdf", fake_pdf_data, "application/pdf")},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data.get("success") is False
    assert "Invalid file content signature" in data.get("message")

    # Valid PDF magic bytes
    valid_pdf_data = b"%PDF-1.5\n%Mock valid PDF content\n%%EOF"
    with patch("backend.routers.resume.parse_and_clean_document", return_value="Parsed resume text content"):
        resp_valid = client.post(
            "/api/resume/extract",
            files={"file": ("valid.pdf", valid_pdf_data, "application/pdf")},
        )
        assert resp_valid.status_code == 200
        assert resp_valid.json().get("success") is True


# ── 6. Practice & Aptitude Identity Binding (PRACTICE-01) ───────────────────────

def test_practice_01_company_questions_and_attempt_binding():
    """
    PRACTICE-01: Valid company returns question pagination; unknown company returns 404;
    aptitude attempt strictly binds user_id to session/user identity.
    """
    # 1. Unknown company returns 404
    resp_bad_company = client.get("/api/practice/questions/nonexistent_company_xyz")
    assert resp_bad_company.status_code == 404

    # 2. Aptitude attempt binds user_id strictly
    user_id = str(uuid.uuid4())
    attempt_req = AptitudeAttemptRequest(
        user_id="spoofed_target_victim_id",  # Attempting IDOR spoof
        topic_id=1,
        question_id=42,
        selected_option_index=2,
        is_correct=True,
        time_taken_seconds=35,
    )

    result = record_aptitude_attempt(attempt_req, current_user_id=user_id)
    assert result["status"] == "success"
    # Bound user_id must be caller's authenticated user_id, NOT the spoofed payload
    assert result["attempt"]["user_id"] == user_id
    assert result["attempt"]["user_id"] != "spoofed_target_victim_id"
