import sys
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.routers.learning import _validate_skill_query, _filter_skill_playlists, _STRICT_PROHIBITED_TERMS
from backend.services.youtube_service import _BLOCKED_TERMS

client = TestClient(app)

def test_strict_prohibited_terms_regex():
    print("Testing _STRICT_PROHIBITED_TERMS regex...")
    
    # Prohibited Adult / NSFW / Porn queries
    assert _STRICT_PROHIBITED_TERMS.search("xxx porn video") is not None
    assert _STRICT_PROHIBITED_TERMS.search("hot romance scene") is not None
    assert _STRICT_PROHIBITED_TERMS.search("erotic adult movie") is not None
    assert _STRICT_PROHIBITED_TERMS.search("nude photos") is not None
    assert _STRICT_PROHIBITED_TERMS.search("kissing scenes") is not None
    assert _STRICT_PROHIBITED_TERMS.search("nsfw 18+ content") is not None
    
    # Prohibited Songs / Music queries
    assert _STRICT_PROHIBITED_TERMS.search("latest bollywood songs 2024") is not None
    assert _STRICT_PROHIBITED_TERMS.search("dj remix songs") is not None
    assert _STRICT_PROHIBITED_TERMS.search("lofi music playlist") is not None
    assert _STRICT_PROHIBITED_TERMS.search("official music video") is not None
    assert _STRICT_PROHIBITED_TERMS.search("mp3 audio tracks") is not None
    assert _STRICT_PROHIBITED_TERMS.search("romantic songs gaana") is not None
    
    # Prohibited Pure Entertainment / Pranks
    assert _STRICT_PROHIBITED_TERMS.search("funny prank video") is not None
    assert _STRICT_PROHIBITED_TERMS.search("roast video") is not None
    
    # Clean programming skills should NOT match
    assert _STRICT_PROHIBITED_TERMS.search("Python tutorial") is None
    assert _STRICT_PROHIBITED_TERMS.search("React js course") is None
    assert _STRICT_PROHIBITED_TERMS.search("DSA in Java") is None
    assert _STRICT_PROHIBITED_TERMS.search("System Design masterclass") is None
    assert _STRICT_PROHIBITED_TERMS.search("Docker and Kubernetes") is None
    assert _STRICT_PROHIBITED_TERMS.search("Machine Learning PyTorch") is None
    print("[OK] Regex matching strictly filters prohibited terms!")

def test_query_validation():
    print("Testing _validate_skill_query logic...")
    
    # Adult / Romance / Songs -> strictly invalid
    assert _validate_skill_query("hot romance")[0] is False
    assert _validate_skill_query("porn")[0] is False
    assert _validate_skill_query("latest songs")[0] is False
    assert _validate_skill_query("dj remix music")[0] is False
    
    # Off-topic -> invalid
    assert _validate_skill_query("cricket match live")[0] is False
    assert _validate_skill_query("chicken biryani recipe")[0] is False
    assert _validate_skill_query("movie review")[0] is False
    assert _validate_skill_query("astrology horoscope")[0] is False
    
    # Numbers only / empty -> invalid
    assert _validate_skill_query("")[0] is False
    assert _validate_skill_query("12345")[0] is False
    
    # Valid technical skills -> valid
    assert _validate_skill_query("Python")[0] is True
    assert _validate_skill_query("React")[0] is True
    assert _validate_skill_query("DSA")[0] is True
    assert _validate_skill_query("Golang")[0] is True
    assert _validate_skill_query("SQL Database")[0] is True
    
    # Contextual tech skill with domain -> valid
    assert _validate_skill_query("sports data analysis in Python")[0] is True
    print("[OK] Query validation logic passed!")

def test_search_api_prohibited_rejections():
    print("Testing /api/learning/search HTTP endpoint with prohibited queries...")
    
    prohibited_queries = [
        "porn",
        "hot romance",
        "romantic songs",
        "xxx videos",
        "dj remix music",
        "kissing scenes",
        "bollywood songs 2024",
        "funny prank video",
    ]
    
    for q in prohibited_queries:
        resp = client.get(f"/api/learning/search?query={q}")
        assert resp.status_code == 400, f"Query '{q}' should have been rejected with 400 but got {resp.status_code}"
        data = resp.json()
        assert data.get("error") == "not_skill" or data.get("detail", {}).get("error") == "not_skill"
        
    print("[OK] Search API cleanly rejects all prohibited queries with 400!")

def test_search_api_valid_skills():
    print("Testing /api/learning/search HTTP endpoint with valid tech skills...")
    
    valid_skills = ["Python", "Java", "DSA", "React"]
    for s in valid_skills:
        resp = client.get(f"/api/learning/search?query={s}")
        assert resp.status_code == 200, f"Skill '{s}' should succeed with 200"
        data = resp.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        
    print("[OK] Search API successfully returns educational results for valid skills!")

def test_post_filtering_removes_inappropriate_youtube_results():
    print("Testing _filter_skill_playlists post-filtering...")
    
    mock_results = [
        {"source": "youtube", "title": "Complete Python Tutorial for Beginners", "description": "Learn python programming", "channel": "FreeCodeCamp"},
        {"source": "youtube", "title": "Hot Romance Movie Scene Full HD", "description": "Romantic couple kiss", "channel": "CinemaClips"},
        {"source": "youtube", "title": "Top 10 Party Songs & DJ Remix 2024", "description": "Best dance music", "channel": "MusicHub"},
        {"source": "youtube", "title": "Data Structures & Algorithms Course in C++", "description": "Complete DSA bootcamp", "channel": "TechPrep"},
        {"source": "youtube", "title": "Funny Comedy Prank in Public", "description": "Hilarious roast", "channel": "Prankster"},
        {"source": "csv", "title": "DSA in Java", "description": "Curated Java course", "channel": "University"},
    ]
    
    filtered = _filter_skill_playlists(mock_results)
    titles = [p["title"] for p in filtered]
    
    assert "Complete Python Tutorial for Beginners" in titles
    assert "Data Structures & Algorithms Course in C++" in titles
    assert "DSA in Java" in titles
    
    assert "Hot Romance Movie Scene Full HD" not in titles
    assert "Top 10 Party Songs & DJ Remix 2024" not in titles
    assert "Funny Comedy Prank in Public" not in titles
    print("[OK] YouTube playlist post-filtering dropped all inappropriate results!")

def test_roadmap_endpoint_prohibited_rejections():
    print("Testing /api/learning/roadmap rejection of prohibited skills...")
    
    # Prohibited skill roadmap request
    resp = client.post("/api/learning/roadmap", json={"skill": "hot romance scenes"})
    assert resp.status_code == 400
    
    resp_songs = client.post("/api/learning/roadmap", json={"skill": "bollywood songs remix"})
    assert resp_songs.status_code == 400
    
    # Valid skill roadmap request
    with patch("backend.services.groq_service.chat_with_groq", return_value='{"title": "Python Roadmap", "tiers": []}'):
        resp_valid = client.post("/api/learning/roadmap", json={"skill": "Python"})
        assert resp_valid.status_code == 200
        assert resp_valid.json().get("success") is True
        
    print("[OK] Roadmap endpoint correctly guards against non-educational topics!")

if __name__ == "__main__":
    test_strict_prohibited_terms_regex()
    test_query_validation()
    test_search_api_prohibited_rejections()
    test_search_api_valid_skills()
    test_post_filtering_removes_inappropriate_youtube_results()
    test_roadmap_endpoint_prohibited_rejections()
    print("\nSUCCESS: ALL LEARNING CONTENT GUARD TESTS PASSED SUCCESSFULLY!")
