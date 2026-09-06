import pytest
from backend.services.observability import (
    record_request,
    record_redis_hit,
    record_redis_miss,
    record_redis_error,
    record_youtube_call,
    record_ai_call,
    record_learning_search,
    get_system_metrics,
    redact_sensitive_str,
)


def test_ai_observability_percentiles_and_breakdown():
    """Verify AI calls record latencies, calculate p50/p95 percentiles, and track models/errors."""
    # Record multiple AI calls with different latencies and models
    record_ai_call(success=True, provider="groq", model="llama-3.3-70b-versatile", latency_ms=100.0)
    record_ai_call(success=True, provider="groq", model="llama-3.3-70b-versatile", latency_ms=200.0)
    record_ai_call(success=True, provider="groq", model="openai/gpt-oss-120b", latency_ms=300.0)
    record_ai_call(success=False, provider="groq", model="openai/gpt-oss-20b", latency_ms=500.0, error_category="rate_limit")
    record_ai_call(success=False, provider="groq", model="qwen/qwen3.6-27b", latency_ms=1500.0, error_category="timeout", timed_out=True)

    metrics = get_system_metrics()
    assert "ai_metrics" in metrics
    ai = metrics["ai_metrics"]

    assert ai["total_calls"] >= 5
    assert ai["errors"] >= 2
    assert ai["timeouts"] >= 1
    assert "latency_ms" in ai
    assert ai["latency_ms"]["p50"] > 0
    assert ai["latency_ms"]["p95"] >= ai["latency_ms"]["p50"]

    # Verify model counter
    assert "llama-3.3-70b-versatile" in ai["models"]
    assert "openai_gpt-oss-120b" in ai["models"]

    # Verify error categories
    assert "rate_limit" in ai["error_categories"]
    assert "timeout" in ai["error_categories"]

    # Verify backward compatible external_services keys exist
    assert "external_services" in metrics
    ext = metrics["external_services"]
    assert "ai_calls" in ext
    assert "ai_errors" in ext
    assert ext["ai_calls"] >= 5
    assert ext["ai_errors"] >= 2


def test_youtube_observability_recording():
    """Verify YouTube API call success and failure telemetry."""
    record_youtube_call(success=True)
    record_youtube_call(success=False)

    metrics = get_system_metrics()
    assert "external_services" in metrics
    ext = metrics["external_services"]
    assert ext["youtube_calls"] >= 2
    assert ext["youtube_errors"] >= 1


def test_redact_sensitive_strings_comprehensive():
    """Verify redacting of JWT, Redis connection strings, API keys, and passwords."""
    samples = [
        ("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThis", "[REDACTED]"),
        ("Connecting to redis://user:super_secret_redis_pass@localhost:6379/0", "[REDACTED]"),
        ("Error with api_key=gsk_9999999999999999999999999999", "[REDACTED]"),
        ("password=MySuperSecretPassword!123", "[REDACTED]"),
    ]

    for text, expected_marker in samples:
        scrubbed = redact_sensitive_str(text)
        assert expected_marker in scrubbed
        assert "super_secret_redis_pass" not in scrubbed
        assert "gsk_999999" not in scrubbed
        assert "MySuperSecretPassword!123" not in scrubbed
        assert "doNotLeakThis" not in scrubbed
