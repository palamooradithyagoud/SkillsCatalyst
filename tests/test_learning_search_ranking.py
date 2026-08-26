import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.routers.learning import (
    _search_csv_playlists,
    _score_and_rank_playlists,
    _validate_skill_query,
    _detect_query_language,
)
from backend.services.cache_service import delete_key, make_learning_cache_key

client = TestClient(app)


def test_language_detection():
    assert _detect_query_language("python in telugu") == "telugu"
    assert _detect_query_language("java course hindi") == "hindi"
    assert _detect_query_language("dsa tutorial in english") == "english"
    assert _detect_query_language("react full course") is None


def test_csv_precedence_and_zero_youtube():
    """Verify searching for Java returns CSV playlists immediately."""
    csv_rows = _search_csv_playlists("java", language="telugu")
    assert len(csv_rows) > 0
    for r in csv_rows:
        assert r.get("source") == "csv"
        assert "telugu" in r.get("language", "").lower()


def test_deterministic_ranking_language_and_tech_match():
    """Test deterministic ranking: exact tech and language match outranks competing tech."""
    mock_items = [
        {"source": "youtube", "title": "Complete JavaScript Tutorial", "language": "Telugu", "channel": "Random"},
        {"source": "csv", "title": "Java Full Course in Telugu", "language": "Telugu", "channel": "Telusko"},
        {"source": "youtube", "title": "Java in Hindi for Beginners", "language": "Hindi", "channel": "CodeWithHarry"},
    ]

    ranked = _score_and_rank_playlists(mock_items, query="java", language="telugu")
    # Top result must be Java in Telugu
    assert ranked[0]["title"] == "Java Full Course in Telugu"
    assert ranked[0]["language"] == "Telugu"


def test_competing_tech_penalty():
    """Verify JavaScript is penalized when searching for Java."""
    mock_items = [
        {"source": "youtube", "title": "JavaScript Masterclass 2026", "language": "English", "channel": "TechGuy"},
        {"source": "youtube", "title": "Java Programming for Beginners", "language": "English", "channel": "TechGuy"},
    ]

    ranked = _score_and_rank_playlists(mock_items, query="java", language="english")
    assert ranked[0]["title"] == "Java Programming for Beginners"


def test_reputable_channel_boost():
    """Verify reputable channels get a scoring boost."""
    mock_items = [
        {"id": "v1", "source": "youtube", "title": "Python Bootcamp Tutorial", "language": "English", "channel": "RandomGuy123"},
        {"id": "v2", "source": "youtube", "title": "Python Bootcamp Tutorial", "language": "English", "channel": "freeCodeCamp"},
    ]

    ranked = _score_and_rank_playlists(mock_items, query="python", language="english")
    assert ranked[0]["channel"] == "freeCodeCamp"


def test_search_api_csv_hit():
    """HTTP Test: verify /api/learning/search returns source='csv' for curated skills."""
    resp = client.get("/api/learning/search?query=java&language=telugu")
    assert resp.status_code == 200
    data = resp.json()
    assert data["source"] == "csv"
    assert data["language"] == "telugu"
    assert len(data["results"]) > 0
