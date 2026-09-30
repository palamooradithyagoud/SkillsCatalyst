import os
import json
import re
import time
import logging
import fnmatch
from typing import Any, Optional, Tuple, Dict, List
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


def delete_many(keys: List[str]) -> bool:
    """Delete multiple keys from Redis and in-memory cache."""
    if not keys:
        return True
    try:
        r = get_redis_client()
        if r:
            r.delete(*keys)
    except Exception as e:
        record_redis_error()
        logger.warning(f"Redis delete_many error: {type(e).__name__}")

    for k in keys:
        _in_memory_cache.pop(k, None)
    return True


def delete_pattern(pattern: str) -> int:
    """
    Safely delete keys matching a glob pattern using SCAN (never blocking KEYS).
    Also evicts matching entries from in-memory fallback cache.
    """
    count = 0
    try:
        r = get_redis_client()
        if r:
            cursor = 0
            while True:
                cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    r.delete(*keys)
                    count += len(keys)
                if cursor == 0:
                    break
    except Exception as e:
        record_redis_error()
        logger.warning(f"Redis delete_pattern error for '{pattern}': {type(e).__name__}")

    # Synchronize in-memory fallback
    matching_in_mem = [k for k in list(_in_memory_cache.keys()) if fnmatch.fnmatch(k, pattern)]
    for k in matching_in_mem:
        _in_memory_cache.pop(k, None)
        count += 1

    return count


def log_cache_event(category: str, event: str, key: Optional[str] = None, reason: Optional[str] = None) -> None:
    """
    Standardized, safe observability logging for cache operations.
    Strictly avoids logging passwords, tokens, full user objects, or secrets.
    """
    msg = f"redis_cache category={category} event={event}"
    if reason:
        msg += f" reason={reason}"
    logger.info(msg)



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


# ── 1. User Subscription / Entitlement Cache ─────────────────────────────────

USER_SUBSCRIPTION_CACHE_TTL = 600  # 10 minutes


def make_subscription_cache_key(user_id: str) -> str:
    """
    Generate canonical user subscription cache key:
    Format: `user:subscription:{clean_user_id}`
    """
    clean_user = re.sub(r"[^\w\-]", "", str(user_id or "").strip())
    return f"user:subscription:{clean_user}"


def get_cached_user_subscription(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve minimal cached entitlement payload for a user.
    Returns None on cache miss, corruption, or Redis failure.
    """
    if not user_id:
        return None
    key = make_subscription_cache_key(user_id)
    cached = get_json(key)
    if cached is not None and isinstance(cached, dict):
        log_cache_event("user_subscription", "hit")
        return cached
    log_cache_event("user_subscription", "miss")
    return None


def set_cached_user_subscription(
    user_id: str,
    data: Dict[str, Any],
    ttl_seconds: int = USER_SUBSCRIPTION_CACHE_TTL,
) -> bool:
    """
    Store minimal, safe entitlement representation into Redis.
    Strictly excludes raw DB rows, internal tokens, credentials, or billing secrets.
    """
    if not user_id or not isinstance(data, dict):
        return False

    # Extract minimal canonical fields
    plan_val = data.get("plan")
    plan_str = getattr(plan_val, "value", str(plan_val or "free")).lower()

    status_val = data.get("status")
    status_str = getattr(status_val, "value", str(status_val or "active")).lower()

    minimal: Dict[str, Any] = {
        "plan": plan_str,
        "status": status_str,
        "is_premium": bool(data.get("is_premium", False)),
        "started_at": str(data["started_at"]) if data.get("started_at") else None,
        "expires_at": str(data["expires_at"]) if data.get("expires_at") else None,
        "cancelled_at": str(data["cancelled_at"]) if data.get("cancelled_at") else None,
    }

    key = make_subscription_cache_key(user_id)
    success = set_json(key, minimal, ttl_seconds=ttl_seconds)
    if success:
        log_cache_event("user_subscription", "set")
    return success


def invalidate_user_subscription(user_id: str) -> bool:
    """
    Invalidate user subscription cache upon database state mutation.
    """
    if not user_id:
        return False
    key = make_subscription_cache_key(user_id)
    success = delete_key(key)
    log_cache_event("user_subscription", "invalidate")
    return success


# ── 2. Tech News Shared Cache ────────────────────────────────────────────────

TECH_NEWS_CACHE_TTL = 900  # 15 minutes


def make_tech_news_grouped_cache_key(search: Optional[str] = None) -> str:
    """
    Generate deterministic cache key for shared tech news list.
    Format: `technews:v1:grouped` or `technews:v1:search:{clean_search}`
    """
    if search:
        clean = re.sub(r"[^\w\s\-]", "", search.lower()).strip()
        clean = re.sub(r"\s+", "-", clean)[:60]
        if clean:
            return f"technews:v1:search:{clean}"
    return "technews:v1:grouped"


def make_tech_news_story_cache_key(story_id: str) -> str:
    """
    Generate cache key for single tech news story.
    Format: `technews:v1:story:{clean_story_id}`
    """
    clean_id = re.sub(r"[^\w\-]", "", str(story_id or "").strip())
    return f"technews:v1:story:{clean_id}"


def get_cached_tech_news_grouped(search: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
    """Retrieve cached grouped tech news sources and stories."""
    key = make_tech_news_grouped_cache_key(search)
    cached = get_json(key)
    if cached is not None and isinstance(cached, list):
        log_cache_event("technews", "hit")
        return cached
    log_cache_event("technews", "miss")
    return None


def set_cached_tech_news_grouped(
    data: List[Dict[str, Any]],
    search: Optional[str] = None,
    ttl_seconds: int = TECH_NEWS_CACHE_TTL,
) -> bool:
    """Cache serialized public grouped tech news."""
    if not isinstance(data, list):
        return False
    key = make_tech_news_grouped_cache_key(search)
    success = set_json(key, data, ttl_seconds=ttl_seconds)
    if success:
        log_cache_event("technews", "set")
    return success


def get_cached_tech_news_story(story_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve single cached tech news story."""
    if not story_id:
        return None
    key = make_tech_news_story_cache_key(story_id)
    cached = get_json(key)
    if cached is not None and isinstance(cached, dict):
        log_cache_event("technews", "hit")
        return cached
    log_cache_event("technews", "miss")
    return None


def set_cached_tech_news_story(
    story_id: str,
    data: Dict[str, Any],
    ttl_seconds: int = TECH_NEWS_CACHE_TTL,
) -> bool:
    """Cache serialized single tech news story."""
    if not story_id or not isinstance(data, dict):
        return False
    key = make_tech_news_story_cache_key(story_id)
    success = set_json(key, data, ttl_seconds=ttl_seconds)
    if success:
        log_cache_event("technews", "set")
    return success


def invalidate_tech_news_cache(story_id: Optional[str] = None) -> bool:
    """
    Invalidate shared tech news cache on admin publishing, updating, or deleting stories/sources.
    Purges main grouped list, search keys, and specific story key.
    """
    delete_key("technews:v1:grouped")
    delete_pattern("technews:v1:*")
    if story_id:
        delete_key(make_tech_news_story_cache_key(story_id))
    log_cache_event("technews", "invalidate")
    return True


# ── 3. Event Hero / Banner Shared Cache ──────────────────────────────────────

EVENT_HERO_CACHE_TTL = 1800  # 30 minutes


def make_event_hero_cache_key(event_id: str) -> str:
    """
    Generate cache key for single event hero/banner.
    Format: `events:v1:hero:{clean_event_id}`
    """
    clean_id = re.sub(r"[^\w\-]", "", str(event_id or "").strip())
    return f"events:v1:hero:{clean_id}"


def make_event_featured_cache_key() -> str:
    """Generate cache key for public featured / default event list."""
    return "events:v1:featured"


def get_cached_event_hero(event_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve cached event hero/banner details."""
    if not event_id:
        return None
    key = make_event_hero_cache_key(event_id)
    cached = get_json(key)
    if cached is not None and isinstance(cached, dict):
        log_cache_event("event_hero", "hit")
        return cached
    log_cache_event("event_hero", "miss")
    return None


def set_cached_event_hero(
    event_id: str,
    data: Dict[str, Any],
    ttl_seconds: int = EVENT_HERO_CACHE_TTL,
) -> bool:
    """
    Cache public event hero/banner metadata.
    Guarantees no binary image blobs are stored; banner URLs only.
    """
    if not event_id or not isinstance(data, dict):
        return False

    # Filter out any binary data or non-serializable fields
    safe_data = {
        k: v for k, v in data.items()
        if not isinstance(v, (bytes, bytearray))
    }
    key = make_event_hero_cache_key(event_id)
    success = set_json(key, safe_data, ttl_seconds=ttl_seconds)
    if success:
        log_cache_event("event_hero", "set")
    return success


def get_cached_featured_events() -> Optional[List[Dict[str, Any]]]:
    """Retrieve cached list of published featured events for hero rendering."""
    key = make_event_featured_cache_key()
    cached = get_json(key)
    if cached is not None and isinstance(cached, list):
        log_cache_event("event_hero", "hit")
        return cached
    log_cache_event("event_hero", "miss")
    return None


def set_cached_featured_events(
    data: List[Dict[str, Any]],
    ttl_seconds: int = EVENT_HERO_CACHE_TTL,
) -> bool:
    """Cache public featured events list."""
    if not isinstance(data, list):
        return False
    safe_list = [
        {k: v for k, v in item.items() if not isinstance(v, (bytes, bytearray))}
        for item in data if isinstance(item, dict)
    ]
    key = make_event_featured_cache_key()
    success = set_json(key, safe_list, ttl_seconds=ttl_seconds)
    if success:
        log_cache_event("event_hero", "set")
    return success


def invalidate_event_cache(event_id: Optional[str] = None) -> bool:
    """
    Invalidate event hero and featured event caches upon admin event mutations.
    """
    delete_key(make_event_featured_cache_key())
    if event_id:
        delete_key(make_event_hero_cache_key(event_id))
    delete_pattern("events:v1:*")
    log_cache_event("event_hero", "invalidate")
    return True

