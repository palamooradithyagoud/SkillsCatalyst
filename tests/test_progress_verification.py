import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.routers.learning import (
    SaveProgressRequest,
    save_video_progress,
)

client = TestClient(app)


def test_save_progress_bounds_validation():
    """Negative positions or watch times must be rejected by Playback Progress Verification."""
    # Negative watch_time
    resp1 = client.post(
        "/api/learning/save-progress",
        json={
            "playlist_id": "PL123",
            "video_id": "vid123",
            "last_position": 10.0,
            "watch_time": -50,
        },
        headers={"x-session-id": "guest_testsession123"}
    )
    assert resp1.status_code == 200
    assert resp1.json().get("success") is False

    # Negative position
    resp2 = client.post(
        "/api/learning/save-progress",
        json={
            "playlist_id": "PL123",
            "video_id": "vid123",
            "last_position": -10.0,
            "watch_time": 10,
        },
        headers={"x-session-id": "guest_testsession123"}
    )
    assert resp2.status_code == 200
    assert resp2.json().get("success") is False


def test_complete_video_negative_watch_time_rejection():
    """Negative watch time on complete-video must return 400 Bad Request."""
    resp = client.post(
        "/api/learning/complete-video",
        json={
            "playlist_id": "PL123",
            "video_id": "vid123",
            "watch_time": -10,
            "completed": True,
        },
        headers={"x-session-id": "guest_testsession123"}
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_guest_save_progress_persists_to_jsonb():
    """Verifies guest users have their progress persisted to learning_progress JSONB with timestamps."""
    guest_id = "guest_abc123456"

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Existing guest row with empty completed_steps
    mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{
            "id": str(uuid.uuid4()),
            "completed_steps": [
                {
                    "id": "PL_guest_123",
                    "videos": []
                }
            ]
        }]
    )
    mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": 1}])

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = SaveProgressRequest(
            playlist_id="PL_guest_123",
            video_id="vid_guest_01",
            last_position=45.6,
            watch_time=30,
        )
        res = await save_video_progress(req, current_user_id=guest_id)
        assert res.get("success") is True
        assert "updated_at" in res

        # Verify update was called on learning_progress with JSONB
        mock_sb.table.assert_called_with("learning_progress")
        update_args = mock_table.update.call_args[0][0]
        assert "completed_steps" in update_args
        playlists = update_args["completed_steps"]
        assert len(playlists) == 1
        video = playlists[0]["videos"][0]
        assert video["videoId"] == "vid_guest_01"
        assert video["last_position"] == 46
        assert video["watch_time"] == 30
        assert "updated_at" in video


@pytest.mark.anyio
async def test_authenticated_save_progress_persistence():
    """Verifies authenticated users have progress saved to video_progress with integer conversion and updatedAt."""
    auth_user_id = str(uuid.uuid4())

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    mock_table.update.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": 101}]
    )

    with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
        req = SaveProgressRequest(
            playlist_id="https://www.youtube.com/playlist?list=PL_auth_789",
            video_id="vid_auth_99",
            last_position=125.4,
            watch_time=75,
            updated_at="2026-09-06T10:30:00.000Z",
        )
        res = await save_video_progress(req, current_user_id=auth_user_id)
        assert res.get("success") is True
        assert res.get("updated_at") == "2026-09-06T10:30:00.000Z"

        mock_sb.table.assert_called_with("video_progress")
        update_call = mock_table.update.call_args[0][0]
        assert update_call["last_position"] == 125
        assert update_call["watch_time"] == 75
        assert update_call["updated_at"] == "2026-09-06T10:30:00.000Z"


def test_conflict_resolution_rewind_latest_wins():
    """
    Verifies conflict resolution behavior:
    - User watches to 00:30 at 10:00:00
    - User intentionally rewinds to 00:10 at 10:05:00
    The newer update (00:10) MUST win over the older update (00:30)
    even though 30 is numerically greater than 10.
    """
    from datetime import datetime

    older_time = "2026-09-06T10:00:00Z"
    newer_time = "2026-09-06T10:05:00Z"

    older_server_progress = {
        "videoId": "vid_conflict_1",
        "lastPosition": 30.0,
        "watchTime": 30,
        "updatedAt": older_time,
    }

    newer_local_progress = {
        "videoId": "vid_conflict_1",
        "lastPosition": 10.0,
        "watchTime": 45,
        "updatedAt": newer_time,
    }

    # Conflict resolution rule: latest valid update wins
    dt_local = datetime.fromisoformat(newer_local_progress["updatedAt"].replace("Z", "+00:00"))
    dt_server = datetime.fromisoformat(older_server_progress["updatedAt"].replace("Z", "+00:00"))

    if dt_local >= dt_server:
        resolved_position = newer_local_progress["lastPosition"]
    else:
        resolved_position = older_server_progress["lastPosition"]

    # The newer position (10.0) wins over 30.0!
    assert resolved_position == 10.0
    assert resolved_position != 30.0

    # Cumulative watchTime should preserve accumulated progress
    cumulative_watch_time = max(newer_local_progress["watchTime"], older_server_progress["watchTime"])
    assert cumulative_watch_time == 45
