"""
backend/services/ai_mentor/approval_service.py
Cryptographic approval tokens and replay-safe execution security for AI Mentor task operations.
Guarantees:
- Server-side integrity verification via HMAC-SHA256.
- Strict user-id binding (prevents tenant escalation / cross-user approval).
- Action expiration enforcement (fail-closed after TTL).
- Anti-replay and anti-double-submission protection via cache/in-memory consumed store.
- Idempotency key binding to return previously computed results for retried network submissions.
"""

import base64
import hashlib
import hmac
import json
import logging
import threading
import time
from typing import Optional, Dict, Any, Tuple

from backend.config import SECRET_KEY, SUPABASE_JWT_SECRET, IS_PRODUCTION
from backend.services.cache_service import get_json, set_json, get_redis_client, delete_key

logger = logging.getLogger(__name__)

# Expiration window for proposed action approval tokens (15 minutes)
APPROVAL_TOKEN_TTL_SECONDS = 900
CONSUMED_ACTION_TTL_SECONDS = 3600  # 1 hour anti-replay window
IDEMPOTENCY_TTL_SECONDS = 3600
ACTION_RESERVATION_TTL_SECONDS = 60  # Short mutual-exclusion lock for execution

# Thread-safe in-memory fallbacks when Redis is unconfigured/unavailable
_MEM_LOCK = threading.Lock()
_CONSUMED_ACTIONS_MEM: Dict[str, float] = {}
_ACTION_RESERVATIONS_MEM: Dict[str, float] = {}
_IDEMPOTENCY_STORE_MEM: Dict[str, Tuple[float, Dict[str, Any]]] = {}


def _get_signing_key() -> bytes:
    """Returns the cryptographic secret key used for HMAC signing."""
    key = SECRET_KEY or SUPABASE_JWT_SECRET
    if not key:
        if IS_PRODUCTION:
            raise RuntimeError("CRITICAL SECURITY ERROR: SECRET_KEY must be configured in production for approval tokens.")
        key = "dev-secure-local-approval-key-fallback"
    return key.encode("utf-8")


def generate_approval_token(
    user_id: str,
    action_id: str,
    action_type: str,
    task_id: Optional[str] = None,
    ttl_seconds: int = APPROVAL_TOKEN_TTL_SECONDS,
) -> Tuple[str, str]:
    """
    Generates a tamper-proof HMAC-SHA256 signed approval token and expiration ISO string.
    Token structure: base64url(payload).signature_hex
    """
    now = int(time.time())
    expires_at_epoch = now + ttl_seconds
    expires_at_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at_epoch))

    payload = {
        "uid": str(user_id),
        "aid": str(action_id),
        "act": str(action_type),
        "tid": str(task_id) if task_id else None,
        "exp": expires_at_epoch,
        "iat": now,
    }

    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")

    signature = hmac.new(_get_signing_key(), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    token = f"{payload_b64}.{signature}"

    return token, expires_at_iso


def verify_approval_token(
    token: str,
    authenticated_user_id: str,
    expected_action_id: Optional[str] = None,
    expected_action_type: Optional[str] = None,
) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Verifies that the approval token:
    1. Is cryptographically valid and untampered.
    2. Belongs strictly to the authenticated user.
    3. Has not expired.
    4. Matches the expected action ID and action type (if specified).

    Returns: (is_valid, error_reason, payload_dict)
    """
    if not token or "." not in token:
        return False, "Invalid approval token format.", None

    parts = token.split(".")
    if len(parts) != 2:
        return False, "Malformed approval token structure.", None

    payload_b64, signature = parts[0], parts[1]

    # Constant-time signature verification
    expected_sig = hmac.new(_get_signing_key(), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        logger.warning(f"HMAC forgery detected on approval token for user {authenticated_user_id}")
        return False, "Approval token verification failed (invalid signature).", None

    # Decode JSON payload
    try:
        # Add padding back if necessary
        padded_b64 = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload_bytes = base64.urlsafe_b64decode(padded_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception as e:
        logger.warning(f"Failed to decode approval token payload: {e}")
        return False, "Approval token payload is corrupted.", None

    # Check expiration
    now = int(time.time())
    exp = payload.get("exp", 0)
    if now > exp:
        return False, "Approval token has expired. Please request the operation again.", payload

    # Check authenticated user binding
    token_uid = payload.get("uid")
    if not token_uid or str(token_uid) != str(authenticated_user_id):
        logger.warning(f"Tenant isolation mismatch: token uid {token_uid} vs auth uid {authenticated_user_id}")
        return False, "Unauthorized approval token for the current session.", payload

    # Check action ID match if supplied
    token_aid = payload.get("aid")
    if expected_action_id and str(token_aid) != str(expected_action_id):
        return False, "Approval token does not match the target action ID.", payload

    # Check action type match if supplied
    token_act = payload.get("act")
    if expected_action_type and str(token_act) != str(expected_action_type):
        return False, "Approval token does not match the target action type.", payload

    return True, None, payload


# ---------------------------------------------------------------------------
# Concurrency Control: Atomic Action Reservation
# ---------------------------------------------------------------------------

def acquire_action_reservation(action_id: str, ttl_seconds: int = ACTION_RESERVATION_TTL_SECONDS) -> bool:
    """
    Atomically reserves an action_id prior to initiating database mutations.
    Guarantees mutual exclusion so concurrent requests cannot both execute the mutation.

    In production (IS_PRODUCTION=True):
    - Distributed locking via Redis is MANDATORY.
    - If Redis is missing, unconfigured, or errors, fails closed by raising RuntimeError,
      which triggers HTTP 503 Service Unavailable.
    - Does NOT fall back to process-local memory in production.

    In development / test (IS_PRODUCTION=False):
    - Falls back to thread-safe process-local memory if Redis is unconfigured or down.

    Returns:
        True if reservation acquired successfully.
        False if the action is already consumed or currently reserved.
    """
    # 1. Fast check if already consumed
    if is_action_consumed(action_id):
        return False

    now = time.time()
    resv_key = f"mentor:action_resv:{action_id}"

    # 2. Production: Mandatory distributed locking (fail closed)
    if IS_PRODUCTION:
        redis_client = None
        try:
            redis_client = get_redis_client()
        except Exception as e:
            logger.error(f"Critical Redis error during production reservation {action_id}: {e}")
            raise RuntimeError(f"Distributed locking service is unavailable (Redis connection error: {type(e).__name__}).")

        if not redis_client:
            logger.error(f"Redis is unconfigured/unavailable for production action reservation {action_id}")
            raise RuntimeError("Distributed locking service is unavailable (Redis is unconfigured or unreachable).")

        try:
            acquired = redis_client.set(resv_key, "reserved", nx=True, ex=ttl_seconds)
            return bool(acquired)
        except Exception as e:
            logger.error(f"Redis SETNX failed during production action reservation {action_id}: {e}")
            raise RuntimeError(f"Distributed locking service is unavailable (Redis error: {type(e).__name__}).")

    # 3. Non-production / Local development: Best-effort Redis with thread-safe process-local fallback
    redis_client = None
    try:
        redis_client = get_redis_client()
    except Exception as e:
        logger.warning(f"Error accessing Redis client for action reservation {action_id}: {e}")

    if redis_client:
        try:
            acquired = redis_client.set(resv_key, "reserved", nx=True, ex=ttl_seconds)
            if not acquired:
                return False
        except Exception as e:
            logger.warning(
                f"Redis SETNX failed for action reservation {action_id} ({type(e).__name__}); "
                "degrading to thread-safe process-local reservation."
            )
    else:
        logger.info(f"Redis unconfigured/unavailable for action reservation {action_id}; using process-local reservation.")

    with _MEM_LOCK:
        if action_id in _ACTION_RESERVATIONS_MEM:
            if now < _ACTION_RESERVATIONS_MEM[action_id]:
                if redis_client:
                    try:
                        redis_client.delete(resv_key)
                    except Exception:
                        pass
                return False
            del _ACTION_RESERVATIONS_MEM[action_id]

        _ACTION_RESERVATIONS_MEM[action_id] = now + ttl_seconds

    return True


def release_action_reservation(action_id: str) -> None:
    """
    Releases an active action reservation when a database mutation fails,
    allowing subsequent legitimate retries to proceed safely.
    """
    resv_key = f"mentor:action_resv:{action_id}"
    try:
        delete_key(resv_key)
    except Exception as e:
        logger.warning(f"Error deleting reservation key from Redis for action {action_id}: {e}")

    with _MEM_LOCK:
        _ACTION_RESERVATIONS_MEM.pop(action_id, None)


# ---------------------------------------------------------------------------
# Replay Protection: Consumed Actions Store
# ---------------------------------------------------------------------------

def is_action_consumed(action_id: str) -> bool:
    """
    Checks whether an action_id has already been executed or marked consumed.
    In production: Requires distributed Redis check; raises RuntimeError on Redis failure
    to guarantee replay protection cannot be silently bypassed.
    In non-production: Checks Redis with process-local memory fallback.
    """
    cache_key = f"mentor:action_consumed:{action_id}"

    if IS_PRODUCTION:
        redis_client = None
        try:
            redis_client = get_redis_client()
        except Exception as e:
            logger.error(f"Critical Redis error checking consumed state {action_id}: {e}")
            raise RuntimeError(f"Distributed replay protection storage is unavailable (Redis connection error: {type(e).__name__}).")

        if not redis_client:
            logger.error(f"Redis unconfigured/unavailable for production replay check {action_id}")
            raise RuntimeError("Distributed replay protection storage is unavailable (Redis is unconfigured or unreachable).")

        try:
            raw = redis_client.get(cache_key)
            return raw is not None
        except Exception as e:
            logger.error(f"Redis get error checking consumed action {action_id}: {e}")
            raise RuntimeError(f"Distributed replay protection storage is unavailable (Redis error: {type(e).__name__}).")

    # Non-production check
    try:
        val = get_json(cache_key)
        if val is not None:
            return True
    except Exception as e:
        logger.warning(f"Redis get_json error checking consumed action {action_id}: {e}")

    now = time.time()
    with _MEM_LOCK:
        if action_id in _CONSUMED_ACTIONS_MEM:
            if now < _CONSUMED_ACTIONS_MEM[action_id]:
                return True
            del _CONSUMED_ACTIONS_MEM[action_id]

    return False


def mark_action_consumed(action_id: str, ttl_seconds: int = CONSUMED_ACTION_TTL_SECONDS) -> bool:
    """
    Marks an action_id as consumed so it cannot be replayed.
    Releases any active reservation lock and records the consumed timestamp.

    In production:
    - Writes directly to Redis with TTL.
    - If Redis fails, raises RuntimeError (cannot silently claim distributed replay protection).
    - Releases reservation lock.

    In non-production:
    - Writes to Redis and falls back to memory.
    """
    cache_key = f"mentor:action_consumed:{action_id}"

    if IS_PRODUCTION:
        redis_client = None
        try:
            redis_client = get_redis_client()
        except Exception as e:
            logger.error(f"Critical Redis error marking action {action_id} consumed: {e}")
            raise RuntimeError(f"Distributed replay protection storage is unavailable (Redis connection error: {type(e).__name__}).")

        if not redis_client:
            logger.error(f"Redis unconfigured/unavailable for production action consumption {action_id}")
            raise RuntimeError("Distributed replay protection storage is unavailable (Redis is unconfigured or unreachable).")

        try:
            payload = json.dumps({"consumed_at": time.time()})
            success = redis_client.set(cache_key, payload, ex=ttl_seconds)
            if not success:
                raise RuntimeError("Redis set command returned failure status.")
        except Exception as e:
            logger.error(f"Redis set error marking action {action_id} consumed: {e}")
            raise RuntimeError(f"Distributed replay protection storage is unavailable (Redis error: {type(e).__name__}).")

        # Release reservation lock
        release_action_reservation(action_id)

        with _MEM_LOCK:
            _CONSUMED_ACTIONS_MEM[action_id] = time.time() + ttl_seconds

        return True

    # Non-production
    redis_success = False
    try:
        redis_success = set_json(cache_key, {"consumed_at": time.time()}, ttl_seconds=ttl_seconds)
    except Exception as e:
        logger.warning(f"Redis set_json error marking action {action_id} consumed: {e}")

    # Release reservation lock
    release_action_reservation(action_id)

    with _MEM_LOCK:
        _CONSUMED_ACTIONS_MEM[action_id] = time.time() + ttl_seconds

    if not redis_success:
        logger.warning(
            f"Consumed action {action_id} recorded in memory only (Redis write unconfirmed). "
            "Multi-worker replay protection degraded."
        )

    return True


# ---------------------------------------------------------------------------
# Idempotency Store & Retrieval
# ---------------------------------------------------------------------------

def get_idempotent_result(user_id: str, idempotency_key: str) -> Optional[Dict[str, Any]]:
    """Retrieves previously computed execution result for a retry submission."""
    cache_key = f"mentor:idemp:{user_id}:{idempotency_key}"
    try:
        cached = get_json(cache_key)
        if cached:
            return cached
    except Exception as e:
        logger.warning(f"Redis get_json error for idempotency key {idempotency_key}: {e}")

    mem_key = f"{user_id}:{idempotency_key}"
    with _MEM_LOCK:
        if mem_key in _IDEMPOTENCY_STORE_MEM:
            expires_at, result = _IDEMPOTENCY_STORE_MEM[mem_key]
            if time.time() < expires_at:
                return result
            del _IDEMPOTENCY_STORE_MEM[mem_key]

    return None


def store_idempotent_result(
    user_id: str,
    idempotency_key: str,
    result: Dict[str, Any],
    ttl_seconds: int = IDEMPOTENCY_TTL_SECONDS,
) -> bool:
    """Stores the execution result bound to the user and idempotency key."""
    cache_key = f"mentor:idemp:{user_id}:{idempotency_key}"
    redis_success = False
    try:
        # Correct parameter: ttl_seconds (not ex!)
        redis_success = set_json(cache_key, result, ttl_seconds=ttl_seconds)
    except Exception as e:
        logger.warning(f"Redis set_json error storing idempotency key {idempotency_key}: {e}")

    mem_key = f"{user_id}:{idempotency_key}"
    with _MEM_LOCK:
        _IDEMPOTENCY_STORE_MEM[mem_key] = (time.time() + ttl_seconds, result)

    if not redis_success:
        logger.warning(f"Idempotency result for key {idempotency_key} stored in memory only (Redis write unconfirmed).")

    return True
