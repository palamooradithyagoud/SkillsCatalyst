import time
import re
import logging
from collections import defaultdict
from typing import Dict, Any, Optional

logger = logging.getLogger("skillscatalyst.observability")

# In-memory metric stores
_request_latencies = []  # rolling last 1000 request latencies in ms
_ai_latencies = []       # rolling last 500 AI invocation latencies in ms
_counters: Dict[str, int] = defaultdict(int)
_search_sources: Dict[str, int] = defaultdict(int)
_start_timestamp = time.time()

# Sensitive patterns to redact
_SENSITIVE_REGEX = re.compile(
    r"(Bearer\s+[\w\.\-]+|rediss?://[^:]+:[^@]+@|password=[\w\.\-]+|api_key=[\w\.\-]+|secret=[\w\.\-]+)",
    re.IGNORECASE
)


def redact_sensitive_str(text: str) -> str:
    """Scrub tokens, API keys, passwords, and connection strings from log outputs."""
    if not text:
        return ""
    return _SENSITIVE_REGEX.sub("[REDACTED]", text)


def record_request(method: str, path: str, status_code: int, latency_ms: float):
    """Record an HTTP request telemetry entry."""
    _counters["total_requests"] += 1
    if status_code >= 400:
        _counters["error_requests"] += 1
    if status_code == 429:
        _counters["rate_limited_429"] += 1

    # Keep a sliding window of recent latencies
    _request_latencies.append(latency_ms)
    if len(_request_latencies) > 1000:
        _request_latencies.pop(0)


def record_redis_hit():
    """Increment Redis cache hit counter."""
    _counters["redis_hits"] += 1


def record_redis_miss():
    """Increment Redis cache miss counter."""
    _counters["redis_misses"] += 1


def record_redis_error():
    """Increment Redis error counter."""
    _counters["redis_errors"] += 1


def record_youtube_call(success: bool = True):
    """Record YouTube Data API call."""
    _counters["youtube_api_calls"] += 1
    if not success:
        _counters["youtube_api_errors"] += 1


def record_ai_call(
    success: bool = True,
    provider: str = "groq",
    model: Optional[str] = None,
    latency_ms: Optional[float] = None,
    error_category: Optional[str] = None,
    timed_out: bool = False,
):
    """
    Record AI invocation telemetry with provider, model, latency, and error categorisation.
    Maintains backwards compatibility with record_ai_call(success=bool).
    """
    _counters["ai_calls"] += 1
    _counters[f"ai_provider_{provider.lower()}"] += 1

    if model:
        # Sanitize model name for counter key
        clean_model = model.replace("/", "_").replace(":", "_").lower()
        _counters[f"ai_model_{clean_model}"] += 1

    if timed_out:
        _counters["ai_timeouts"] += 1

    if latency_ms is not None and latency_ms >= 0:
        _ai_latencies.append(latency_ms)
        if len(_ai_latencies) > 500:
            _ai_latencies.pop(0)

    if not success:
        _counters["ai_errors"] += 1
        if error_category:
            _counters[f"ai_err_{error_category.lower()}"] += 1


def record_learning_search(source: str, language: str, cache_hit: bool, latency_ms: float):
    """Record learning search breakdown."""
    _counters["learning_searches"] += 1
    _search_sources[f"source_{source.lower()}"] += 1
    _search_sources[f"lang_{language.lower()}"] += 1
    if cache_hit:
        _counters["learning_cache_hits"] += 1
    else:
        _counters["learning_cache_misses"] += 1


def get_system_metrics() -> Dict[str, Any]:
    """Calculate and return system observability metrics."""
    uptime_sec = round(time.time() - _start_timestamp, 1)
    
    # Calculate HTTP request latency percentiles
    p50, p95, p99 = 0.0, 0.0, 0.0
    if _request_latencies:
        sorted_lats = sorted(_request_latencies)
        n = len(sorted_lats)
        p50 = round(sorted_lats[int(n * 0.50)], 2)
        p95 = round(sorted_lats[min(int(n * 0.95), n - 1)], 2)
        p99 = round(sorted_lats[min(int(n * 0.99), n - 1)], 2)

    # Calculate AI latency percentiles
    ai_p50, ai_p95 = 0.0, 0.0
    if _ai_latencies:
        sorted_ai_lats = sorted(_ai_latencies)
        n_ai = len(sorted_ai_lats)
        ai_p50 = round(sorted_ai_lats[int(n_ai * 0.50)], 2)
        ai_p95 = round(sorted_ai_lats[min(int(n_ai * 0.95), n_ai - 1)], 2)

    redis_hits = _counters.get("redis_hits", 0)
    redis_misses = _counters.get("redis_misses", 0)
    total_cache_ops = redis_hits + redis_misses
    hit_rate = round((redis_hits / total_cache_ops) * 100.0, 1) if total_cache_ops > 0 else 0.0

    return {
        "uptime_seconds": uptime_sec,
        "requests": {
            "total": _counters.get("total_requests", 0),
            "errors": _counters.get("error_requests", 0),
            "rate_limited_429": _counters.get("rate_limited_429", 0),
            "latency_ms": {
                "p50": p50,
                "p95": p95,
                "p99": p99,
            }
        },
        "redis_cache": {
            "hits": redis_hits,
            "misses": redis_misses,
            "errors": _counters.get("redis_errors", 0),
            "hit_rate_pct": hit_rate,
        },
        "external_services": {
            "youtube_calls": _counters.get("youtube_api_calls", 0),
            "youtube_errors": _counters.get("youtube_api_errors", 0),
            "ai_calls": _counters.get("ai_calls", 0),
            "ai_errors": _counters.get("ai_errors", 0),
        },
        "ai_metrics": {
            "total_calls": _counters.get("ai_calls", 0),
            "errors": _counters.get("ai_errors", 0),
            "timeouts": _counters.get("ai_timeouts", 0),
            "latency_ms": {
                "p50": ai_p50,
                "p95": ai_p95,
            },
            "models": {k.replace("ai_model_", ""): v for k, v in _counters.items() if k.startswith("ai_model_")},
            "error_categories": {k.replace("ai_err_", ""): v for k, v in _counters.items() if k.startswith("ai_err_")},
        },
        "learning_search_breakdown": dict(_search_sources),
    }
