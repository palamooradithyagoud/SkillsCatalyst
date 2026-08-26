import os
import json
import re
import time
import logging
from typing import Any, Optional, Tuple, Dict
from backend.config import REDIS_URL
from backend.services.observability import (
    record_redis_hit,
    record_redis_miss,
    record_redis_error,
)

logger = logging.getLogger("skillscatalyst.cache")

# Shared Redis Connection Pool
_redis_pool = None
_redis_client = None
_redis_initialized = False


def _init_redis_pool():
    """Initializes a shared connection pool with timeouts and retry safety."""
    global _redis_pool, _redis_client, _redis_initialized
    if _redis_initialized:
        return _redis_client

    _redis_url = REDIS_URL or os.getenv("REDIS_URL", "").strip()
    if not _redis_url:
        _redis_initialized = True
        _redis_client = None
        return None

    try:
        import redis
        # Connection pool with strict timeouts
        _redis_pool = redis.ConnectionPool.from_url(
            _redis_url,
            decode_responses=True,
            socket_timeout=2.0,
            socket_connect_timeout=2.0,
            retry_on_timeout=True,
            max_connections=50,
        )
        client = redis.Redis(connection_pool=_redis_pool)
        client.ping()
        _redis_client = client
        _redis_initialized = True
        logger.info("Connected to Upstash Redis Cache using pooled connections.")
        return _redis_client
    except Exception as e:
        record_redis_error()
        logger.warning(f"Could not connect to Redis ({type(e).__name__}) — running with in-memory fallback.")
        _redis_initialized = True
        _redis_client = None
        return None


def get_redis_client():
    """Returns the shared Redis client instance or None."""
    global _redis_client
    if not _redis_initialized:
        _init_redis_pool()
    return _redis_client


def get_redis_health_status() -> str:
    """Returns sanitized health status string without exposing credentials."""
    _redis_url = REDIS_URL or os.getenv("REDIS_URL", "").strip()
    if not _redis_url:
        return "unconfigured"
    try:
        r = get_redis_client()
        if r and r.ping():
            return "connected"
    except Exception:
        pass
    return "degraded/fallback"


# ── Thread-Safe In-Memory Cache with TTL & Size Limit ─────────────────────────
_in_memory_cache: Dict[str, Tuple[Any, float]] = {}
_MAX_IN_MEMORY_ITEMS = 2000


def _evict_stale_in_memory():
    """Evicts expired items if in-memory cache exceeds size limit."""
    now = time.time()
    if len(_in_memory_cache) > _MAX_IN_MEMORY_ITEMS:
        expired_keys = [k for k, (_, exp) in _in_memory_cache.items() if exp < now]
        for k in expired_keys:
            _in_memory_cache.pop(k, None)
        # If still over limit, drop oldest
        if len(_in_memory_cache) > _MAX_IN_MEMORY_ITEMS:
            oldest_keys = sorted(_in_memory_cache.keys(), key=lambda k: _in_memory_cache[k][1])[:200]
            for k in oldest_keys:
                _in_memory_cache.pop(k, None)


# ── Generic Cache Accessors ───────────────────────────────────────────────────

def get_json(key: str) -> Optional[Any]:
    """
    Retrieve JSON-deserialized object from Redis (or in-memory fallback).
    Gracefully handles corrupted or malformed JSON payloads.
    """
    try:
        r = get_redis_client()
        if r:
            raw_val = r.get(key)
            if raw_val:
                try:
                    data = json.loads(raw_val)
                    record_redis_hit()
                    return data
                except Exception as json_err:
                    logger.warning(f"Corrupted cache entry for key '{key}' — clearing: {json_err}")
                    r.delete(key)
                    record_redis_miss()
                    return None
            record_redis_miss()
    except Exception as e:
        record_redis_error()
        logger.warning(f"Redis get_json error for key '{key}': {type(e).__name__}")

    # In-memory fallback
    now = time.time()
    if key in _in_memory_cache:
        val, expiry = _in_memory_cache[key]
        if now < expiry:
            return val
        del _in_memory_cache[key]

    return None


def set_json(key: str, value: Any, ttl_seconds: int = 86400) -> bool:
    """Store JSON-serializable object into Redis with TTL (default 24h)."""
    try:
        r = get_redis_client()
        if r:
            payload = json.dumps(value, ensure_ascii=False)
            r.set(key, payload, ex=ttl_seconds)
            return True
    except Exception as e:
        record_redis_error()
        logger.warning(f"Redis set_json error for key '{key}': {type(e).__name__}")

    # In-memory fallback
    _evict_stale_in_memory()
    _in_memory_cache[key] = (value, time.time() + ttl_seconds)
    return True


def delete_key(key: str) -> bool:
    """Delete a key from Redis / in-memory cache."""
    try:
        r = get_redis_client()
        if r:
            r.delete(key)
    except Exception as e:
        record_redis_error()

    _in_memory_cache.pop(key, None)
    return True


# ── Canonical Key Builders & Domain Helpers ───────────────────────────────────

def make_learning_cache_key(topic: str, language: str) -> str:
    """
    Generate canonical, collision-free cache key for Learning searches:
    Format: `learning:v1:{normalized_topic}:{normalized_language}`
    """
    # Normalize topic: lower, strip punctuation, replace spaces with hyphen
    clean_topic = re.sub(r"[^\w\s\+\#\.\-]", "", topic.lower())
    clean_topic = re.sub(r"\s+", "-", clean_topic.strip())
    if not clean_topic:
        clean_topic = "default"

    clean_lang = language.lower().strip()
    if clean_lang not in ("english", "telugu", "hindi"):
        clean_lang = "english"

    return f"learning:v1:{clean_topic}:{clean_lang}"


def make_profile_cache_key(platform: str, username: str) -> str:
    """
    Generate canonical cache key for coding platform profile stats:
    Format: `profile:v1:{platform}:{normalized_username}`
    """
    clean_platform = platform.lower().strip()
    clean_user = re.sub(r"[^\w\-\.]", "", username.lower().strip())
    return f"profile:v1:{clean_platform}:{clean_user}"


def get_cached_youtube_search(query: str, language: str) -> Optional[list[dict]]:
    """Retrieve cached YouTube search results using canonical key."""
    key = make_learning_cache_key(query, language)
    return get_json(key)


def cache_youtube_search(query: str, language: str, results: list[dict], ttl_seconds: int = 86400) -> bool:
    """Cache YouTube search results with 24h TTL."""
    if not results or not isinstance(results, list):
        return False
    key = make_learning_cache_key(query, language)
    return set_json(key, results, ttl_seconds=ttl_seconds)


def get_cached_profile_stats(platform: str, username: str) -> Optional[dict]:
    """Retrieve cached coding profile stats using canonical key."""
    key = make_profile_cache_key(platform, username)
    return get_json(key)


def cache_profile_stats(platform: str, username: str, stats: dict, ttl_seconds: int = 3600) -> bool:
    """Cache coding profile stats with 1h TTL."""
    if not stats or not isinstance(stats, dict):
        return False
    key = make_profile_cache_key(platform, username)
    return set_json(key, stats, ttl_seconds=ttl_seconds)
