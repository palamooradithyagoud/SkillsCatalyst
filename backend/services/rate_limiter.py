import os
import time
import logging
from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Dict, List, Tuple, Optional
from fastapi import Request, HTTPException, status
from backend.services.auth_service import get_optional_user_id

logger = logging.getLogger(__name__)

# Configurable RPM (Requests Per Minute) limits from environment variables
RATE_LIMIT_AI_RPM = int(os.getenv("RATE_LIMIT_AI_RPM", "30"))
RATE_LIMIT_RESUME_RPM = int(os.getenv("RATE_LIMIT_RESUME_RPM", "10"))
RATE_LIMIT_SEARCH_RPM = int(os.getenv("RATE_LIMIT_SEARCH_RPM", "60"))
RATE_LIMIT_DEFAULT_RPM = int(os.getenv("RATE_LIMIT_DEFAULT_RPM", "120"))

# Trusted proxy IPs/networks (defaulting to local loopback and internal proxy defaults)
TRUSTED_PROXIES = set(
    filter(None, [p.strip() for p in os.getenv("TRUSTED_PROXIES", "127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16").split(",")])
)


def _is_trusted_proxy(ip: str) -> bool:
    """Checks if immediate peer IP is in trusted proxy allowlist."""
    if not ip:
        return False
    if ip in TRUSTED_PROXIES:
        return True
    for prefix in ("127.", "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.30.", "172.31.", "192.168.", "::1"):
        if ip.startswith(prefix):
            return True
    return False


def extract_client_key(request: Request) -> str:
    """
    Safely extracts client identity:
    1. Authenticated User UUID (from Bearer JWT if present)
    2. X-Forwarded-For header ONLY IF connecting peer is a trusted proxy
    3. Client Host IP directly
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        user_id = get_optional_user_id(authorization=auth_header)
        if user_id:
            return f"user:{user_id}"

    peer_ip = request.client.host if request.client else ""

    # Only trust X-Forwarded-For if request comes from a trusted proxy
    if peer_ip and _is_trusted_proxy(peer_ip):
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            first_ip = forwarded.split(",")[0].strip()
            if first_ip:
                return f"ip:{first_ip}"

    if peer_ip:
        return f"ip:{peer_ip}"

    return "ip:unknown"


class BaseRateLimiter(ABC):
    """Abstract Rate Limiter Interface for pluggable storage (Memory / Redis)."""

    @abstractmethod
    def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        pass


class InMemoryRateLimiter(BaseRateLimiter):
    """
    Thread-safe in-memory sliding window rate limiter.
    Includes key eviction to prevent memory accumulation.
    """

    def __init__(self):
        self._requests: Dict[str, List[float]] = defaultdict(list)

    def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        now = time.time()
        client_key = extract_client_key(request)
        key = f"{client_key}:{request.url.path}"
        window_start = now - window_seconds

        timestamps = [ts for ts in self._requests.get(key, []) if ts > window_start]

        if not timestamps:
            self._requests.pop(key, None)
        else:
            self._requests[key] = timestamps

        if len(timestamps) >= max_requests:
            oldest_ts = timestamps[0]
            retry_after = max(1, int(oldest_ts + window_seconds - now))
            return False, retry_after

        if key not in self._requests:
            self._requests[key] = []
        self._requests[key].append(now)

        return True, 0


class RedisRateLimiter(BaseRateLimiter):
    """
    Distributed Redis sliding window rate limiter using sorted sets.
    Active when REDIS_URL environment variable is configured.
    """

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._redis_client = None

    def _get_redis(self):
        if self._redis_client is None:
            import redis
            self._redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True)
        return self._redis_client

    def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        try:
            r = self._get_redis()
            now = time.time()
            client_key = extract_client_key(request)
            key = f"rate:{client_key}:{request.url.path}"
            window_start = now - window_seconds

            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zrange(key, 0, 0, withscores=True)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, window_seconds + 5)
            res = pipe.execute()

            current_count = res[1]
            oldest_entries = res[2]

            if current_count >= max_requests:
                oldest_score = oldest_entries[0][1] if oldest_entries else window_start
                retry_after = max(1, int(oldest_score + window_seconds - now))
                return False, retry_after

            return True, 0
        except Exception as err:
            logger.warning(f"Redis rate limiter fallback to allow: {err}")
            return True, 0


# Factory initializer: selects Redis if REDIS_URL present, else InMemory
_redis_url = os.getenv("REDIS_URL")
if _redis_url:
    logger.info("Initializing RedisRateLimiter backend.")
    rate_limiter: BaseRateLimiter = RedisRateLimiter(_redis_url)
else:
    logger.info("Initializing InMemoryRateLimiter backend.")
    rate_limiter: BaseRateLimiter = InMemoryRateLimiter()


def enforce_rate_limit(max_requests: int, window_seconds: int = 60):
    """
    FastAPI dependency for enforcing rate limits on specific endpoint routes.
    """
    async def dependency(request: Request):
        allowed, retry_after = rate_limiter.check_rate_limit(
            request=request,
            max_requests=max_requests,
            window_seconds=window_seconds
        )
        if not allowed:
            client_key = extract_client_key(request)
            logger.warning(
                f"Rate limit exceeded for path '{request.url.path}' by client '{client_key}'. Retry after {retry_after}s."
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "success": False,
                    "message": f"Too many requests. Please wait {retry_after} seconds before trying again.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )
    return dependency
