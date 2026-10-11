"""
backend/services/ai_mentor_quota_service.py
Centralized, persistent, and thread-safe AI Mentor usage quota management.
Fix for BUG-E-1: Replaces process-local in-memory quota tracking with shared,
atomic, persistent usage tracking across backend restarts and multi-worker deployments.
"""

import logging
import re
import threading
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict
from backend.services.cache_service import get_redis_client

logger = logging.getLogger("skillscatalyst.ai_mentor.quota")

# Default TTL: 60 days (5,184,000s) — ensures usage for monthly billing windows
# is retained through the month and automatically garbage-collected after rollover.
_DEFAULT_QUOTA_TTL_SECONDS = 60 * 86400

# ---------------------------------------------------------------------------
# Lua Scripts for Atomic Redis Operations
# ---------------------------------------------------------------------------

# Atomically checks if current usage is strictly below limit, and if so,
# increments usage and returns {1, new_count}.
# If current usage is already >= limit, returns {0, current_count} without incrementing.
# If a race condition caused new_count > limit, safely reverts via DECR and returns {0, count}.
_LUA_RESERVE_SLOT = """
local current = redis.call('GET', KEYS[1])
local count = 0
if current then
    count = tonumber(current)
end
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

if count >= limit then
    return {0, count}
end

local new_count = redis.call('INCR', KEYS[1])
if new_count == 1 then
    redis.call('EXPIRE', KEYS[1], ttl)
end

if new_count > limit then
    redis.call('DECR', KEYS[1])
    return {0, new_count - 1}
end

return {1, new_count}
"""

# Atomically decrements usage by 1 if usage > 0, ensuring count never drops below 0.
_LUA_RELEASE_SLOT = """
local current = redis.call('GET', KEYS[1])
if current then
    local count = tonumber(current)
    if count > 0 then
        return redis.call('DECR', KEYS[1])
    end
end
return 0
"""


def sanitize_user_id(user_id: str) -> str:
    """Sanitizes user identifier for safe Redis key construction."""
    if not user_id:
        return "anonymous"
    clean = re.sub(r"[^\w\-:]", "", str(user_id).strip())
    return clean or "anonymous"


def get_ai_mentor_billing_period(user_id: Optional[str] = None) -> str:
    """
    Returns the canonical monthly billing period identifier (e.g. '2026-10').
    UTC calendar month is the canonical monthly quota window for SkillsCatalyst.
    """
    return datetime.now(timezone.utc).strftime("%Y-%m")


def make_quota_key(user_id: str, period: Optional[str] = None) -> str:
    """
    Constructs canonical Redis key for AI Mentor quota tracking:
    Format: `ai_quota:v1:{sanitized_user_id}:{billing_period}`
    """
    clean_uid = sanitize_user_id(user_id)
    eff_period = period or get_ai_mentor_billing_period(user_id)
    return f"ai_quota:v1:{clean_uid}:{eff_period}"


# ---------------------------------------------------------------------------
# In-Memory Fallback Quota Store
# ---------------------------------------------------------------------------

class InMemoryQuotaStore:
    """
    Thread-safe in-memory fallback store used when Redis is unreachable.
    Prevents API hard-crashes (500) while still enforcing limits safely within the worker.
    """

    def __init__(self):
        self._counts: Dict[str, int] = {}
        self._lock = threading.Lock()

    def get_usage(self, key: str) -> int:
        with self._lock:
            return self._counts.get(key, 0)

    def reserve(self, key: str, limit: int) -> Tuple[bool, int]:
        with self._lock:
            curr = self._counts.get(key, 0)
            if curr >= limit:
                return False, curr
            curr += 1
            self._counts[key] = curr
            return True, curr

    def release(self, key: str) -> int:
        with self._lock:
            curr = self._counts.get(key, 0)
            if curr > 0:
                curr -= 1
                self._counts[key] = curr
                return curr
            return 0

    def increment(self, key: str) -> int:
        with self._lock:
            curr = self._counts.get(key, 0) + 1
            self._counts[key] = curr
            return curr

    def decrement(self, key: str) -> int:
        return self.release(key)

    def reset(self, user_id: Optional[str] = None, period: Optional[str] = None) -> None:
        with self._lock:
            if not user_id:
                self._counts.clear()
            else:
                clean_uid = sanitize_user_id(user_id)
                prefix = f"ai_quota:v1:{clean_uid}:"
                if period:
                    target_key = f"ai_quota:v1:{clean_uid}:{period}"
                    self._counts.pop(target_key, None)
                else:
                    keys_to_del = [k for k in self._counts if k.startswith(prefix)]
                    for k in keys_to_del:
                        self._counts.pop(k, None)


# Shared fallback instance
_fallback_quota_store = InMemoryQuotaStore()


# ---------------------------------------------------------------------------
# Public Authoritative API
# ---------------------------------------------------------------------------

def get_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """
    Retrieves current usage count for a user in the specified billing period.
    Queries persistent Redis cache first; falls back cleanly to thread-safe memory store.
    """
    key = make_quota_key(user_id, period)
    try:
        r = get_redis_client()
        if r:
            raw = r.get(key)
            if raw is not None:
                return int(raw)
            return 0
    except Exception as e:
        logger.warning(f"Redis get_ai_mentor_usage failed ({type(e).__name__}) — using fallback store.")

    return _fallback_quota_store.get_usage(key)


def reserve_ai_mentor_slot(
    user_id: str,
    limit: int,
    period: Optional[str] = None,
) -> Tuple[bool, int]:
    """
    Atomically attempts to reserve 1 quota slot for the user.
    - If current usage < limit: increments count and returns (True, new_count).
    - If current usage >= limit: returns (False, current_count) without incrementing.
    Guarantees concurrency safety across multiple workers and threads.
    """
    key = make_quota_key(user_id, period)
    try:
        r = get_redis_client()
        if r:
            res = r.eval(_LUA_RESERVE_SLOT, 1, key, str(limit), str(_DEFAULT_QUOTA_TTL_SECONDS))
            allowed = bool(int(res[0]) == 1)
            count = int(res[1])
            return allowed, count
    except Exception as e:
        logger.warning(f"Redis reserve_ai_mentor_slot failed ({type(e).__name__}) — using fallback store.")

    return _fallback_quota_store.reserve(key, limit)


def release_ai_mentor_slot(user_id: str, period: Optional[str] = None) -> int:
    """
    Safely releases a previously reserved slot when an AI provider call fails or aborts.
    Ensures usage never decrements below 0 and user is not charged for failed processing.
    """
    key = make_quota_key(user_id, period)
    try:
        r = get_redis_client()
        if r:
            res = r.eval(_LUA_RELEASE_SLOT, 1, key)
            return int(res)
    except Exception as e:
        logger.warning(f"Redis release_ai_mentor_slot failed ({type(e).__name__}) — using fallback store.")

    return _fallback_quota_store.release(key)


def increment_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """
    Increments AI mentor usage count by 1.
    Preserved for backward-compatibility with existing router endpoints and test hooks.
    """
    key = make_quota_key(user_id, period)
    try:
        r = get_redis_client()
        if r:
            pipe = r.pipeline()
            pipe.incr(key)
            pipe.expire(key, _DEFAULT_QUOTA_TTL_SECONDS)
            res = pipe.execute()
            return int(res[0])
    except Exception as e:
        logger.warning(f"Redis increment_ai_mentor_usage failed ({type(e).__name__}) — using fallback store.")

    return _fallback_quota_store.increment(key)


def decrement_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """Safely decrements usage count by 1 without dropping below 0."""
    return release_ai_mentor_slot(user_id, period)


def reset_ai_mentor_usage(user_id: Optional[str] = None, period: Optional[str] = None) -> None:
    """
    Resets usage counts in both Redis and the in-memory fallback store.
    If user_id is provided, resets only that user's usage.
    If user_id is None, resets all AI mentor usage keys.
    """
    _fallback_quota_store.reset(user_id, period)

    try:
        r = get_redis_client()
        if not r:
            return

        if user_id:
            clean_uid = sanitize_user_id(user_id)
            if period:
                key = make_quota_key(user_id, period)
                r.delete(key)
            else:
                pattern = f"ai_quota:v1:{clean_uid}:*"
                cursor = 0
                while True:
                    cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
                    if keys:
                        r.delete(*keys)
                    if cursor == 0:
                        break
        else:
            pattern = "ai_quota:v1:*"
            cursor = 0
            while True:
                cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    r.delete(*keys)
                if cursor == 0:
                    break
    except Exception as e:
        logger.warning(f"Redis reset_ai_mentor_usage failed ({type(e).__name__}): {e}")
