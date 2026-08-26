import pytest
from fastapi.testclient import TestClient
from backend.main import app

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
