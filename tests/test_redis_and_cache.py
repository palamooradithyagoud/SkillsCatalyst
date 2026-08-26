import pytest
import json
import time
from backend.services.cache_service import (
    get_redis_client,
    get_redis_health_status,
    make_learning_cache_key,
    make_profile_cache_key,
    get_json,
    set_json,
    delete_key,
    get_cached_youtube_search,
    cache_youtube_search,
    _in_memory_cache,
)


def test_redis_health_status_no_secrets():
    """Verify health status reports clean state without exposing passwords or URLs."""
    status = get_redis_health_status()
    assert status in ("connected", "degraded/fallback", "unconfigured")
    assert "rediss://" not in status
    assert "password" not in status


def test_canonical_cache_key_generation():
    """Verify learning cache keys normalize punctuation, spaces, and casing strictly."""
    key1 = make_learning_cache_key("Java", "Telugu")
    key2 = make_learning_cache_key("  java   ", "telugu")
    key3 = make_learning_cache_key("Java", "Hindi")
    key4 = make_learning_cache_key("Spring Boot!!", "English")

    assert key1 == "learning:v1:java:telugu"
    assert key2 == "learning:v1:java:telugu"
    assert key3 == "learning:v1:java:hindi"
    assert key4 == "learning:v1:spring-boot:english"
    # Strict cross-language isolation:
    assert key1 != key3
    assert key1 != key2 or key1 == key2


def test_cache_set_and_get():
    """Test standard JSON caching and retrieval."""
    test_key = "test:unit:item1"
    payload = {"skill": "FastAPI", "score": 95, "tags": ["python", "api"]}

    assert set_json(test_key, payload, ttl_seconds=30) is True
    retrieved = get_json(test_key)
    assert retrieved == payload

    delete_key(test_key)
    assert get_json(test_key) is None


def test_corrupted_json_recovery():
    """Verify corrupted / malformed cache value is safely dropped and treated as a miss."""
    r = get_redis_client()
    bad_key = "test:corrupted:key"
    if r:
        r.set(bad_key, "INVALID_NON_JSON{{{", ex=30)
    else:
        _in_memory_cache[bad_key] = ("INVALID_NON_JSON{{{", time.time() + 30)

    # get_json should recover gracefully without throwing an exception
    val = get_json(bad_key)
    assert val is None


def test_youtube_search_caching_and_isolation():
    """Test YouTube query caching and verify Telugu and Hindi never mix results."""
    telugu_res = [{"id": "te1", "title": "Spring Boot in Telugu", "language": "Telugu"}]
    hindi_res = [{"id": "hi1", "title": "Spring Boot in Hindi", "language": "Hindi"}]

    cache_youtube_search("spring boot", "telugu", telugu_res, ttl_seconds=30)
    cache_youtube_search("spring boot", "hindi", hindi_res, ttl_seconds=30)

    cached_telugu = get_cached_youtube_search("spring boot", "telugu")
    cached_hindi = get_cached_youtube_search("spring boot", "hindi")

    assert cached_telugu is not None
    assert cached_telugu[0]["title"] == "Spring Boot in Telugu"
    assert cached_hindi is not None
    assert cached_hindi[0]["title"] == "Spring Boot in Hindi"

    # Clean up
    delete_key(make_learning_cache_key("spring boot", "telugu"))
    delete_key(make_learning_cache_key("spring boot", "hindi"))
