import os
import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from backend.services.auth_service import get_optional_user_id

logger = logging.getLogger(__name__)

# Configurable RPM (Requests Per Minute) limits from environment variables
RATE_LIMIT_AI_RPM = int(os.getenv("RATE_LIMIT_AI_RPM", "30"))
RATE_LIMIT_RESUME_RPM = int(os.getenv("RATE_LIMIT_RESUME_RPM", "10"))
RATE_LIMIT_SEARCH_RPM = int(os.getenv("RATE_LIMIT_SEARCH_RPM", "60"))
RATE_LIMIT_DEFAULT_RPM = int(os.getenv("RATE_LIMIT_DEFAULT_RPM", "120"))

class SlidingWindowRateLimiter:
    """
    Lightweight, thread-safe in-memory sliding window rate limiter.
    Tracks request timestamps per client identity (User ID if authenticated, else IP).
    Includes automatic key eviction to prevent dictionary key accumulation.
    """

    def __init__(self):
        # Maps key -> list of timestamps
        self._requests: Dict[str, List[float]] = defaultdict(list)

    def _get_client_key(self, request: Request) -> str:
        """
        Extracts client key:
        1. Authenticated User UUID (from Bearer JWT if available)
        2. X-Forwarded-For header (first IP in proxy chain for Railway/Vercel)
        3. Client Host IP
        """
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            user_id = get_optional_user_id(authorization=auth_header)
            if user_id:
                return f"user:{user_id}"

        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
            if ip:
                return f"ip:{ip}"

        if request.client and request.client.host:
            return f"ip:{request.client.host}"

        return "ip:unknown"

    def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int]:
        """
        Checks if the request exceeds max_requests in the window_seconds time frame.
        Returns (is_allowed, retry_after_seconds). Cleanly evicts stale keys to prevent memory leak.
        """
        now = time.time()
        key = f"{self._get_client_key(request)}:{request.url.path}"
        window_start = now - window_seconds

        # Filter timestamps outside the active window
        timestamps = [ts for ts in self._requests.get(key, []) if ts > window_start]

        if not timestamps:
            # Evict stale key to prevent in-memory dictionary key accumulation
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

# Global Rate Limiter instance
rate_limiter = SlidingWindowRateLimiter()

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
            logger.warning(
                f"Rate limit exceeded for path '{request.url.path}' by client '{rate_limiter._get_client_key(request)}'. Retry after {retry_after}s."
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
