import time
import pytest
from unittest.mock import MagicMock
from fastapi import Request
from backend.services.rate_limiter import (
    InMemoryRateLimiter,
    RedisRateLimiter,
    extract_client_key,
)


def _make_mock_request(ip: str = "192.168.1.50", path: str = "/api/test", auth: str = None) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": path,
        "headers": [(b"authorization", auth.encode())] if auth else [],
        "client": (ip, 12345),
    }
    return Request(scope)


def test_client_key_extraction():
    req_ip = _make_mock_request(ip="103.21.244.1")
    key_ip = extract_client_key(req_ip)
    assert key_ip == "ip:103.21.244.1"

    req_user = _make_mock_request(auth="Bearer invalid_jwt_for_key_test")
    # Non-valid token falls back to IP
    key_fallback = extract_client_key(req_user)
    assert key_fallback.startswith("ip:")


def test_in_memory_rate_limiter_enforcement():
    limiter = InMemoryRateLimiter()
    req = _make_mock_request(ip="192.168.10.10", path="/api/search")

    # Allow up to 3 requests in 10-second window
    allowed1, _ = limiter.check_rate_limit(req, max_requests=3, window_seconds=10)
    allowed2, _ = limiter.check_rate_limit(req, max_requests=3, window_seconds=10)
    allowed3, _ = limiter.check_rate_limit(req, max_requests=3, window_seconds=10)
    assert allowed1 is True
    assert allowed2 is True
    assert allowed3 is True

    # 4th request must be blocked
    allowed4, retry_after = limiter.check_rate_limit(req, max_requests=3, window_seconds=10)
    assert allowed4 is False
    assert retry_after >= 1


def test_redis_rate_limiter_with_fallback():
    limiter = RedisRateLimiter()
    req = _make_mock_request(ip="192.168.20.20", path="/api/ai-mentor/chat")

    allowed1, _ = limiter.check_rate_limit(req, max_requests=2, window_seconds=5)
    allowed2, _ = limiter.check_rate_limit(req, max_requests=2, window_seconds=5)
    assert allowed1 is True
    assert allowed2 is True

    # 3rd request should be blocked
    allowed3, retry_after = limiter.check_rate_limit(req, max_requests=2, window_seconds=5)
    assert allowed3 is False
    assert retry_after >= 1
