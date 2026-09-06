"""
SkillsCatalyst - Learning Router Characterization / Contract Tests
Phase 2.1 Pre-Refactor Baseline Verification Suite

Captures EXACT existing runtime behavior for:
1. Video progress verification & resume (authenticated vs guest)
2. Bounds checking & anti-cheat validation
3. Complete video completion thresholds and timestamps
4. Dual persistence (relational tables + learning_progress JSONB)
5. Legacy JSONB saved playlists endpoint (/api/learning/get-saved-playlists)
6. Fallback playlist video generation (_generate_fallback_playlist_videos)
7. Beacon unload sync contract (/api/learning/save-progress)
"""

import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.routers.learning import (
    SaveProgressRequest,
    CompleteVideoRequest,
    VideoProgressRequest,
    MarkAllWatchedRequest,
    SavePlaylistRequest,
    _generate_fallback_playlist_videos,
    FALLBACK_EDUCATIONAL_VIDEO_IDS,
)

client = TestClient(app)


# ── 1. Video Progress: Authenticated vs Guest ──────────────────────────────────

@pytest.mark.anyio
async def test_char_save_progress_authenticated():
    """Characterizes save-progress for authenticated user (UUID): writes to video_progress."""
    from backend.routers.learning import save_video_progress

    auth_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    mock_table.update.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": 1}]
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = SaveProgressRequest(
            playlist_id="PL_char_test",
            video_id="vid_char_01",
            last_position=120.4,
            watch_time=115,
            updated_at="2026-09-06T12:00:00Z",
        )
        res = await save_video_progress(req, current_user_id=auth_id)
        assert res.get("success") is True
        assert res.get("updated_at") == "2026-09-06T12:00:00Z"

        # Relational table video_progress must be targeted
        mock_sb.table.assert_called_with("video_progress")
        update_args = mock_table.update.call_args[0][0]
        assert update_args["last_position"] == 120
        assert update_args["watch_time"] == 115
        assert update_args["updated_at"] == "2026-09-06T12:00:00Z"


@pytest.mark.anyio
async def test_char_save_progress_guest_jsonb():
    """Characterizes save-progress for guest user: writes to learning_progress JSONB."""
    from backend.routers.learning import save_video_progress

    guest_id = "guest_char_session_999"
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Existing guest row in learning_progress
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{
            "id": 42,
            "completed_steps": [{
                "id": "PL_char_test",
                "videos": []
            }]
        }]
    )
    mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": 42}])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = SaveProgressRequest(
            playlist_id="PL_char_test",
            video_id="vid_guest_01",
            last_position=88.7,
            watch_time=80,
            updated_at="2026-09-06T12:00:00Z",
        )
        res = await save_video_progress(req, current_user_id=guest_id)
        assert res.get("success") is True
        assert res.get("updated_at") == "2026-09-06T12:00:00Z"

        mock_sb.table.assert_called_with("learning_progress")
        update_args = mock_table.update.call_args[0][0]
        assert "completed_steps" in update_args
        v = update_args["completed_steps"][0]["videos"][0]
        assert v["videoId"] == "vid_guest_01"
        assert v["last_position"] == 89
        assert v["watch_time"] == 80


@pytest.mark.anyio
async def test_char_resume_progress_endpoint():
    """Characterizes /api/learning/resume-progress/{video_id} for authenticated and guest users."""
    from backend.routers.learning import resume_progress

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Authenticated UUID user with stored progress
    auth_id = str(uuid.uuid4())
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"last_position": 345.5, "watched": True}]
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        res = await resume_progress("vid_test_100", current_user_id=auth_id)
        assert res == {"last_position": 345.5, "completed": True}

    # Guest user returns default position 0.0, completed False
    res_guest = await resume_progress("vid_test_100", current_user_id="guest_12345")
    assert res_guest == {"last_position": 0.0, "completed": False}


# ── 2. Bounds & Anti-Cheat Validation ──────────────────────────────────────────

def test_char_save_progress_bounds_validation():
    """
    Negative positions, negative watch times, or positions > 86400 must return
    HTTP 200 with {"success": False, "reason": "Invalid position or watch time bounds"}.
    Existing status behavior must NOT be changed to 400.
    """
    # Negative last_position
    r1 = client.post(
        "/api/learning/save-progress",
        json={"playlist_id": "PL1", "video_id": "v1", "last_position": -5.0, "watch_time": 10},
        headers={"x-session-id": "guest_bounds_test"}
    )
    assert r1.status_code == 200
    assert r1.json() == {"success": False, "reason": "Invalid position or watch time bounds"}

    # Negative watch_time
    r2 = client.post(
        "/api/learning/save-progress",
        json={"playlist_id": "PL1", "video_id": "v1", "last_position": 10.0, "watch_time": -1},
        headers={"x-session-id": "guest_bounds_test"}
    )
    assert r2.status_code == 200
    assert r2.json() == {"success": False, "reason": "Invalid position or watch time bounds"}

    # Position exceeding 24 hours (86400s)
    r3 = client.post(
        "/api/learning/save-progress",
        json={"playlist_id": "PL1", "video_id": "v1", "last_position": 90000.0, "watch_time": 10},
        headers={"x-session-id": "guest_bounds_test"}
    )
    assert r3.status_code == 200
    assert r3.json() == {"success": False, "reason": "Invalid position or watch time bounds"}


def test_char_complete_video_negative_bounds():
    """
    complete-video with negative watch_time or last_position returns HTTP 400.
    """
    r1 = client.post(
        "/api/learning/complete-video",
        json={"playlist_id": "PL1", "video_id": "v1", "watch_time": -5, "completed": True},
        headers={"x-session-id": "guest_bounds_test"}
    )
    assert r1.status_code == 400
    msg1 = r1.json().get("detail", "") or r1.json().get("message", "")
    assert "Invalid watch_time or last_position" in msg1

    r2 = client.post(
        "/api/learning/complete-video",
        json={"playlist_id": "PL1", "video_id": "v1", "watch_time": 100, "last_position": -1.0, "completed": True},
        headers={"x-session-id": "guest_bounds_test"}
    )
    assert r2.status_code == 400
    msg2 = r2.json().get("detail", "") or r2.json().get("message", "")
    assert "Invalid watch_time or last_position" in msg2


# ── 3. Complete Video Thresholds & Responses ───────────────────────────────────

@pytest.mark.anyio
async def test_char_complete_video_completed_states():
    """Characterizes completed=True vs completed=False in complete_video."""
    from backend.routers.learning import complete_video

    auth_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Mock JSONB fetch
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # Case A: completed = True
        req_true = CompleteVideoRequest(
            playlist_id="PL_char_comp",
            video_id="vid_comp_1",
            watch_time=300,
            completed=True,
            last_position=300.0,
        )
        res_true = await complete_video(req_true, current_user_id=auth_id)
        assert res_true["success"] is True
        assert res_true["completed_at"] is not None
        assert res_true["playlist_stats"]["completed_videos"] == 1

        # Check upsert payload to video_progress
        upsert_call = mock_table.upsert.call_args[0][0]
        assert upsert_call["watched"] is True
        assert upsert_call["completed_at"] is not None

        # Case B: completed = False
        req_false = CompleteVideoRequest(
            playlist_id="PL_char_comp",
            video_id="vid_comp_1",
            watch_time=10,
            completed=False,
            last_position=10.0,
        )
        res_false = await complete_video(req_false, current_user_id=auth_id)
        assert res_false["success"] is True
        assert res_false["playlist_stats"]["completed_videos"] == 0


# ── 4. Dual Persistence Invariance ─────────────────────────────────────────────

@pytest.mark.anyio
async def test_char_dual_persistence_save_playlist():
    """
    Authenticated user saving a playlist writes to:
    1. saved_playlists table
    2. learning_progress JSONB table (completed_steps)
    3. user_feedback table (action: save)
    """
    from backend.routers.learning import save_playlist

    auth_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Mock saved_playlists upsert
    mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    # Mock learning_progress select & upsert
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = SavePlaylistRequest(
            playlist_id="PL_dual_test",
            title="Dual Persistence Playlist",
            channel="Test Channel",
            playlist_url="https://youtube.com/playlist?list=PL_dual_test",
        )
        res = await save_playlist(req, current_user_id=auth_id)
        assert res.get("success") is True

        # Verify all 3 tables were accessed in order
        calls = [c[0][0] for c in mock_sb.table.call_args_list]
        assert "saved_playlists" in calls
        assert "learning_progress" in calls
        assert "user_feedback" in calls


# ── 5. Legacy JSONB Saved Playlists (/api/learning/get-saved-playlists) ────────

def test_char_get_saved_playlists_jsonb_empty():
    """Characterizes empty state for /api/learning/get-saved-playlists."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        r = client.get("/api/learning/get-saved-playlists", headers={"x-session-id": "guest_empty_test"})
        assert r.status_code == 200
        data = r.json()
        assert data == {"success": True, "playlists": [], "completion_pct": 0.0}


def test_char_get_saved_playlists_jsonb_populated():
    """Characterizes populated state for /api/learning/get-saved-playlists."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{
            "completed_steps": [{"id": "PL1", "title": "Saved 1"}],
            "completion_pct": 50.0,
        }]
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        r = client.get("/api/learning/get-saved-playlists", headers={"x-session-id": "guest_pop_test"})
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert len(data["playlists"]) == 1
        assert data["completion_pct"] == 50.0


# ── 6. Fallback Playlist Video Generation ──────────────────────────────────────

def test_char_generate_fallback_playlist_videos():
    """
    Characterizes _generate_fallback_playlist_videos contract:
    Returns exactly 10 videos with rotation over FALLBACK_EDUCATIONAL_VIDEO_IDS.
    """
    videos = _generate_fallback_playlist_videos("PL_custom_fallback")
    assert len(videos) == 10

    for idx, v in enumerate(videos):
        assert v["position"] == idx
        assert v["watched"] is False
        assert v["last_position"] == 0.0
        assert v["watch_time"] == 0
        assert v["completed_at"] is None
        assert v["videoId"] == FALLBACK_EDUCATIONAL_VIDEO_IDS[idx % len(FALLBACK_EDUCATIONAL_VIDEO_IDS)]
        assert v["thumbnail"] == f"https://img.youtube.com/vi/{v['videoId']}/mqdefault.jpg"
        assert f"Lesson {idx + 1}:" in v["title"]


# ── 7. Beacon Unload Sync Contract ─────────────────────────────────────────────

def test_char_beacon_save_progress_contract():
    """
    Characterizes frontend navigator.sendBeacon interaction with /api/learning/save-progress.
    Ensures that a beacon request with valid payload and session_id receives HTTP 200.
    """
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        # sendBeacon sends JSON body with session_id
        beacon_payload = {
            "playlist_id": "PL_beacon_123",
            "video_id": "vid_beacon_456",
            "last_position": 250,
            "watch_time": 240,
            "updated_at": "2026-09-06T15:30:00.000Z",
            "session_id": "guest_beacon_user",
        }
        resp = client.post(
            "/api/learning/save-progress",
            json=beacon_payload,
            headers={"Content-Type": "application/json"}
        )
        assert resp.status_code == 200
        assert resp.json().get("success") is True


# ── 8. Video Progress Manual Mark & Mark All Watched ───────────────────────────

@pytest.mark.anyio
async def test_char_update_video_progress_authenticated():
    """Manual mark-as-watched for authenticated user upserts into video_progress."""
    from backend.routers.learning import update_video_progress

    auth_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = VideoProgressRequest(
            playlist_id="PL_vp_test",
            video_id="vid_vp_1",
            watched=True,
            last_position=45.0,
            watch_time=40,
        )
        res = await update_video_progress(req, current_user_id=auth_id)
        assert res == {"success": True}
        upsert_call = mock_table.upsert.call_args[0][0]
        assert upsert_call["user_id"] == auth_id
        assert upsert_call["video_id"] == "vid_vp_1"
        assert upsert_call["watched"] is True
        assert upsert_call["completed_at"] is not None
        assert upsert_call["last_position"] == 45
        assert upsert_call["watch_time"] == 40


@pytest.mark.anyio
async def test_char_update_video_progress_guest():
    """Manual mark-as-watched for guest user returns success without upserting."""
    from backend.routers.learning import update_video_progress

    mock_sb = MagicMock()
    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = VideoProgressRequest(
            playlist_id="PL_vp_test",
            video_id="vid_vp_1",
            watched=True,
        )
        res = await update_video_progress(req, current_user_id="guest_session_123")
        assert res == {"success": True}
        # Guest user (non-UUID) should not call video_progress upsert
        mock_sb.table.assert_not_called()


@pytest.mark.anyio
async def test_char_mark_all_watched():
    """Mark all watched fetches playlist videos and batch upserts to video_progress."""
    from backend.routers.learning import mark_all_watched

    auth_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])

    mock_videos = {
        "videos": [
            {"videoId": "v1", "title": "Vid 1"},
            {"videoId": "v2", "title": "Vid 2"},
        ],
        "count": 2,
    }

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
         patch("backend.routers.learning.get_playlist_videos", return_value=mock_videos):
        req = MarkAllWatchedRequest(playlist_id="PL_all_watched", watched=True)
        res = await mark_all_watched(req, current_user_id=auth_id)
        assert res == {"success": True, "count": 2}
        upsert_rows = mock_table.upsert.call_args[0][0]
        assert len(upsert_rows) == 2
        assert upsert_rows[0]["video_id"] == "v1"
        assert upsert_rows[0]["watched"] is True
        assert upsert_rows[1]["video_id"] == "v2"
        assert upsert_rows[1]["watched"] is True
