"""
backend/services/ai_mentor_quota_service.py
Centralized, persistent, atomic, and thread-safe AI Mentor usage quota management.
Fix for BUG-E-1: Replaces process-local in-memory quota tracking with shared,
atomic, persistent usage tracking across backend restarts and multi-worker deployments.
Enforces at-most-once reservation/refund states and fails closed on shared store outages.
"""

import logging
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, NamedTuple
from backend.services.cache_service import get_redis_client

logger = logging.getLogger("skillscatalyst.ai_mentor.quota")

# Default TTL: 60 days (5,184,000s) — ensures monthly usage counts are retained
# through the billing window and automatically garbage-collected after rollover.
_DEFAULT_QUOTA_TTL_SECONDS = 60 * 86400

# Reservation state TTL: 300s (5 minutes) for active reservations;
# 3600s (1 hour) for committed/released tombstones to guarantee idempotency.
_RESERVATION_ACTIVE_TTL_SECONDS = 300
_RESERVATION_TOMBSTONE_TTL_SECONDS = 3600

# Strict production safety gate:
# If Redis is unavailable in production, quota-limited requests fail closed (HTTP 503)
# rather than silently granting unlimited quota across multiple workers.
# Can be explicitly enabled via environment variable for offline testing / local dev.
ALLOW_IN_MEMORY_QUOTA_FALLBACK = os.getenv("ALLOW_IN_MEMORY_QUOTA_FALLBACK", "false").lower() in ("true", "1", "yes")


class QuotaStorageUnavailableError(Exception):
    """Raised when the persistent shared quota store (Redis) is unreachable."""
    pass


class QuotaReservationResult(NamedTuple):
    """Immutable result structure for atomic quota slot reservation."""
    allowed: bool
    count: int
    reservation_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Lua Scripts for Atomic Redis Operations
# ---------------------------------------------------------------------------

# Atomically checks if current usage is strictly below limit.
# If allowed, increments count, records unique reservation state as 'RESERVED',
# and returns {1, new_count}.
# If rejected, returns {0, current_count} without recording a reservation.
_LUA_RESERVE_SLOT = """
local current = redis.call('GET', KEYS[1])
local count = 0
if current then
    count = tonumber(current)
end
local limit = tonumber(ARGV[1])
local quota_ttl = tonumber(ARGV[2])
local res_ttl = tonumber(ARGV[3])

if count >= limit then
    return {0, count}
end

local new_count = redis.call('INCR', KEYS[1])
if new_count == 1 then
    redis.call('EXPIRE', KEYS[1], quota_ttl)
end

if new_count > limit then
    redis.call('DECR', KEYS[1])
    return {0, new_count - 1}
end

-- Store active reservation state with timeout
redis.call('SET', KEYS[2], 'RESERVED', 'EX', res_ttl)

return {1, new_count}
"""

# Atomically commits a reservation to 'COMMITTED' state once the AI provider succeeds.
# Returns 1 if committed, 0 if reservation was not in 'RESERVED' state.
_LUA_COMMIT_SLOT = """
local state = redis.call('GET', KEYS[1])
if state == 'RESERVED' then
    redis.call('SET', KEYS[1], 'COMMITTED', 'EX', tonumber(ARGV[1]))
    return 1
end
return 0
"""

# Atomically releases (refunds) a reservation IF AND ONLY IF it is currently 'RESERVED'.
# Marks the reservation as 'RELEASED' so duplicate release calls are safely rejected (idempotent).
# Guarantees that one request's failure can NEVER decrement another request's count.
_LUA_RELEASE_SLOT = """
local state = redis.call('GET', KEYS[2])
if state == 'RESERVED' then
    redis.call('SET', KEYS[2], 'RELEASED', 'EX', tonumber(ARGV[1]))
    local current = redis.call('GET', KEYS[1])
    if current then
        local count = tonumber(current)
        if count > 0 then
            local new_count = redis.call('DECR', KEYS[1])
            return {1, new_count}
        end
    end
    return {1, 0}
end
return {0, -1}
"""

# Fallback release without a reservation ID (legacy / test support)
_LUA_RELEASE_LEGACY_SLOT = """
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


def make_reservation_key(user_id: str, reservation_id: str, period: Optional[str] = None) -> str:
    """
    Constructs canonical Redis key for tracking specific reservation states:
    Format: `ai_quota:v1:{sanitized_user_id}:{billing_period}:res:{reservation_id}`
    """
    base_key = make_quota_key(user_id, period)
    clean_res = re.sub(r"[^\w\-]", "", str(reservation_id).strip())
    return f"{base_key}:res:{clean_res}"


# ---------------------------------------------------------------------------
# In-Memory Quota Store (For explicitly permitted offline test environments)
# ---------------------------------------------------------------------------

class InMemoryQuotaStore:
    """
    Thread-safe in-memory store with stateful reservation tracking.
    Used ONLY when ALLOW_IN_MEMORY_QUOTA_FALLBACK is explicitly enabled.
    """

    def __init__(self):
        self._counts: Dict[str, int] = {}
        self._reservations: Dict[str, str] = {}
        self._lock = threading.Lock()

    def get_usage(self, key: str) -> int:
        with self._lock:
            return self._counts.get(key, 0)

    def reserve(self, key: str, limit: int, reservation_id: str) -> Tuple[bool, int]:
        with self._lock:
            curr = self._counts.get(key, 0)
            if curr >= limit:
                return False, curr
            curr += 1
            self._counts[key] = curr
            res_key = f"{key}:res:{reservation_id}"
            self._reservations[res_key] = "RESERVED"
            return True, curr

    def commit(self, key: str, reservation_id: str) -> bool:
        with self._lock:
            res_key = f"{key}:res:{reservation_id}"
            if self._reservations.get(res_key) == "RESERVED":
                self._reservations[res_key] = "COMMITTED"
                return True
            return False

    def release(self, key: str, reservation_id: Optional[str] = None) -> bool:
        with self._lock:
            if reservation_id:
                res_key = f"{key}:res:{reservation_id}"
                state = self._reservations.get(res_key)
                if state != "RESERVED":
                    return False  # Already committed, released, or non-existent
                self._reservations[res_key] = "RELEASED"

            curr = self._counts.get(key, 0)
            if curr > 0:
                self._counts[key] = curr - 1
            return True

    def increment(self, key: str) -> int:
        with self._lock:
            curr = self._counts.get(key, 0) + 1
            self._counts[key] = curr
            return curr

    def reset(self, user_id: Optional[str] = None, period: Optional[str] = None) -> None:
        with self._lock:
            if not user_id:
                self._counts.clear()
                self._reservations.clear()
            else:
                clean_uid = sanitize_user_id(user_id)
                prefix = f"ai_quota:v1:{clean_uid}:"
                if period:
                    target_key = f"ai_quota:v1:{clean_uid}:{period}"
                    self._counts.pop(target_key, None)
                    res_prefix = f"{target_key}:res:"
                    res_keys = [k for k in self._reservations if k.startswith(res_prefix)]
                    for rk in res_keys:
                        self._reservations.pop(rk, None)
                else:
                    keys_to_del = [k for k in self._counts if k.startswith(prefix)]
                    for k in keys_to_del:
                        self._counts.pop(k, None)
                    res_keys = [k for k in self._reservations if k.startswith(prefix)]
                    for rk in res_keys:
                        self._reservations.pop(rk, None)


# Shared fallback instance
_fallback_quota_store = InMemoryQuotaStore()


# ---------------------------------------------------------------------------
# Public Authoritative API
# ---------------------------------------------------------------------------

def get_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """
    Retrieves current usage count for a user in the specified billing period.
    Raises QuotaStorageUnavailableError if Redis is unavailable and fallback is disabled.
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
        logger.warning(f"Redis get_ai_mentor_usage error ({type(e).__name__}): {e}")

    if not ALLOW_IN_MEMORY_QUOTA_FALLBACK:
        raise QuotaStorageUnavailableError("Shared quota store (Redis) is unavailable.")

    return _fallback_quota_store.get_usage(key)


def reserve_ai_mentor_slot(
    user_id: str,
    limit: int,
    period: Optional[str] = None,
) -> QuotaReservationResult:
    """
    Atomically attempts to reserve 1 quota slot for the user with an idempotent reservation ID.
    - If current usage < limit: increments count, registers reservation as 'RESERVED',
      and returns QuotaReservationResult(allowed=True, count=new_count, reservation_id=...).
    - If current usage >= limit: returns QuotaReservationResult(allowed=False, count=current_count).
    - If Redis is unavailable and fallback is disabled: raises QuotaStorageUnavailableError.
    Guarantees concurrency safety across multiple workers, restarts, and concurrent requests.
    """
    key = make_quota_key(user_id, period)
    res_id = f"res_{uuid.uuid4().hex}"
    res_key = make_reservation_key(user_id, res_id, period)

    try:
        r = get_redis_client()
        if r:
            res = r.eval(
                _LUA_RESERVE_SLOT,
                2,
                key,
                res_key,
                str(limit),
                str(_DEFAULT_QUOTA_TTL_SECONDS),
                str(_RESERVATION_ACTIVE_TTL_SECONDS),
            )
            allowed = bool(int(res[0]) == 1)
            count = int(res[1])
            return QuotaReservationResult(
                allowed=allowed,
                count=count,
                reservation_id=res_id if allowed else None,
            )
    except Exception as e:
        logger.warning(f"Redis reserve_ai_mentor_slot error ({type(e).__name__}): {e}")

    if not ALLOW_IN_MEMORY_QUOTA_FALLBACK:
        raise QuotaStorageUnavailableError("Shared quota store (Redis) is unavailable for reservation.")

    allowed, count = _fallback_quota_store.reserve(key, limit, res_id)
    return QuotaReservationResult(
        allowed=allowed,
        count=count,
        reservation_id=res_id if allowed else None,
    )


def commit_ai_mentor_reservation(
    user_id: str,
    reservation_id: str,
    period: Optional[str] = None,
) -> bool:
    """
    Commits a previously reserved slot to 'COMMITTED' state upon successful AI generation.
    Once committed, the reservation can never be released or refunded.
    """
    if not reservation_id:
        return False

    key = make_quota_key(user_id, period)
    res_key = make_reservation_key(user_id, reservation_id, period)

    try:
        r = get_redis_client()
        if r:
            res = r.eval(_LUA_COMMIT_SLOT, 1, res_key, str(_RESERVATION_TOMBSTONE_TTL_SECONDS))
            return bool(int(res) == 1)
    except Exception as e:
        logger.warning(f"Redis commit_ai_mentor_reservation error ({type(e).__name__}): {e}")

    return _fallback_quota_store.commit(key, reservation_id)


def release_ai_mentor_slot(
    user_id: str,
    reservation_id: Optional[str] = None,
    period: Optional[str] = None,
) -> bool:
    """
    Safely releases (refunds) a previously reserved slot when an AI provider call fails.
    - If reservation_id is provided: releases at-most-once. If already committed or released,
      it safely refuses to decrement the quota counter.
    - Returns True if a slot was successfully refunded, False otherwise.
    """
    key = make_quota_key(user_id, period)

    try:
        r = get_redis_client()
        if r:
            if reservation_id:
                res_key = make_reservation_key(user_id, reservation_id, period)
                res = r.eval(_LUA_RELEASE_SLOT, 2, key, res_key, str(_RESERVATION_TOMBSTONE_TTL_SECONDS))
                return bool(int(res[0]) == 1)
            else:
                res = r.eval(_LUA_RELEASE_LEGACY_SLOT, 1, key)
                return bool(int(res) > 0)
    except Exception as e:
        logger.warning(f"Redis release_ai_mentor_slot error ({type(e).__name__}): {e}")

    return _fallback_quota_store.release(key, reservation_id)


def increment_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """
    Increments AI mentor usage count by 1 directly.
    Preserved for backward-compatibility with tests and legacy callers.
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
        logger.warning(f"Redis increment_ai_mentor_usage error ({type(e).__name__}): {e}")

    if not ALLOW_IN_MEMORY_QUOTA_FALLBACK:
        raise QuotaStorageUnavailableError("Shared quota store (Redis) is unavailable.")

    return _fallback_quota_store.increment(key)


def decrement_ai_mentor_usage(user_id: str, period: Optional[str] = None) -> int:
    """Safely decrements usage count by 1 without dropping below 0."""
    return 1 if release_ai_mentor_slot(user_id, period=period) else 0


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
                res_pattern = f"{key}:res:*"
                cursor = 0
                to_delete = [key]
                while True:
                    cursor, keys = r.scan(cursor=cursor, match=res_pattern, count=100)
                    if keys:
                        to_delete.extend(keys)
                    if cursor == 0:
                        break
                if to_delete:
                    r.delete(*to_delete)
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
        logger.warning(f"Redis reset_ai_mentor_usage error ({type(e).__name__}): {e}")
