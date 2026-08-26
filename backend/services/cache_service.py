import os
import json
import logging
from typing import Any, Optional
from backend.config import REDIS_URL

logger = logging.getLogger(__name__)

# Global redis client handle
_redis_client = None
_redis_initialized = False


def _get_redis():
    """Lazily initializes and returns the Redis client if REDIS_URL is configured."""
    global _redis_client, _redis_initialized
    if _redis_initialized:
        return _redis_client

    _redis_url = REDIS_URL or os.getenv("REDIS_URL", "").strip()
    if not _redis_url:
        _redis_initialized = True
        _redis_client = None
        return None

    try:
        import redis
        client = redis.Redis.from_url(
            _redis_url,
            decode_responses=True,
            socket_timeout=3,
            socket_connect_timeout=3,
            retry_on_timeout=True
        )
        client.ping()
        _redis_client = client
        _redis_initialized = True
        logger.info("Connected successfully to Upstash Redis Cache.")
        return _redis_client
    except Exception as e:
        logger.warning(f"Could not connect to Redis ({e}) — operating with in-memory fallback.")
        _redis_initialized = True
        _redis_client = None
        return None


# Simple in-memory fallback dictionary with TTL timestamps
_in_memory_cache = {}


def get_json(key: str) -> Optional[Any]:
    """Retrieve JSON-deserialized object from Redis (or in-memory cache)."""
    try:
        r = _get_redis()
        if r:
            val = r.get(key)
            if val:
                return json.loads(val)
            return None
    except Exception as e:
        logger.warning(f"Redis get_json error for key '{key}': {e}")

    # In-memory fallback
    import time
    if key in _in_memory_cache:
        val, expiry = _in_memory_cache[key]
        if time.time() < expiry:
            return val
        del _in_memory_cache[key]
    return None


def set_json(key: str, value: Any, ttl_seconds: int = 86400) -> bool:
    """Store JSON-serializable object into Redis with TTL (default 24h)."""
    try:
        r = _get_redis()
        if r:
            payload = json.dumps(value, ensure_ascii=False)
            r.set(key, payload, ex=ttl_seconds)
            return True
    except Exception as e:
        logger.warning(f"Redis set_json error for key '{key}': {e}")

    # In-memory fallback
    import time
    _in_memory_cache[key] = (value, time.time() + ttl_seconds)
    return True


def delete_key(key: str) -> bool:
    """Delete a key from Redis / in-memory cache."""
    try:
        r = _get_redis()
        if r:
            r.delete(key)
    except Exception as e:
        logger.warning(f"Redis delete error for key '{key}': {e}")

    if key in _in_memory_cache:
        del _in_memory_cache[key]
    return True


# ── Specialized Domain Caching Helpers ────────────────────────────────────────

def get_cached_youtube_search(query: str, language: str) -> Optional[list[dict]]:
    """Retrieve cached YouTube search results (24h TTL)."""
    norm_q = query.lower().strip()
    norm_lang = language.lower().strip()
    key = f"yt_search:{norm_lang}:{norm_q}"
    return get_json(key)


def cache_youtube_search(query: str, language: str, results: list[dict], ttl_seconds: int = 86400) -> bool:
    """Cache YouTube search results for 24 hours to save API quotas."""
    norm_q = query.lower().strip()
    norm_lang = language.lower().strip()
    key = f"yt_search:{norm_lang}:{norm_q}"
    return set_json(key, results, ttl_seconds=ttl_seconds)


def get_cached_profile_stats(platform: str, username: str) -> Optional[dict]:
    """Retrieve cached coding profile stats (1h TTL)."""
    key = f"profile:{platform.lower()}:{username.lower().strip()}"
    return get_json(key)


def cache_profile_stats(platform: str, username: str, stats: dict, ttl_seconds: int = 3600) -> bool:
    """Cache coding profile stats for 1 hour to prevent scraping rate limits."""
    key = f"profile:{platform.lower()}:{username.lower().strip()}"
    return set_json(key, stats, ttl_seconds=ttl_seconds)
