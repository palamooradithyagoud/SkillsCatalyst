import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.observability import redact_sensitive_str, get_system_metrics

client = TestClient(app)


def test_health_endpoint_response_structure():
    """Verify health endpoint returns status of database, redis, youtube without exposing secrets."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "healthy"
    assert "services" in data
    assert "database" in data["services"]
    assert "redis" in data["services"]
    assert "youtube" in data["services"]
    assert "groq_ai" in data["services"]

    # Verify no credentials leaked
    raw_text = resp.text
    assert "rediss://" not in raw_text
    assert "eyJ" not in raw_text  # No JWT leaked
    assert "gsk_" not in raw_text  # No Groq key leaked


def test_api_health_alias():
    """Verify /api/health returns identical structured multi-service health data."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_readiness_endpoint():
    resp = client.get("/ready")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ready"


def test_metrics_endpoint():
    resp = client.get("/api/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "uptime_seconds" in data
    assert "requests" in data
    assert "redis_cache" in data


def test_redact_sensitive_strings():
    sample_log = "User Bearer eyJhbGciOi... connected to rediss://default:secretpass123@db.upstash.io:6379 with api_key=AIzaSy..."
    cleaned = redact_sensitive_str(sample_log)
    assert "secretpass123" not in cleaned
    assert "eyJhbGciOi" not in cleaned
    assert "AIzaSy" not in cleaned


def test_correlation_id_lifecycle():
    """Verify request ID is tracked across 200 OK, 401 Unauthorized, and 422 Validation errors."""
    custom_id = "test-custom-req-999"

    # 1. 200 OK inherits custom X-Request-ID
    resp200 = client.get("/health", headers={"X-Request-ID": custom_id})
    assert resp200.status_code == 200
    assert resp200.headers.get("X-Request-ID") == custom_id

    # 2. 401 Unauthorized returns X-Request-ID in header and JSON body
    resp401 = client.get("/api/dashboard", headers={"X-Request-ID": custom_id})
    assert resp401.status_code == 401
    assert resp401.headers.get("X-Request-ID") == custom_id
    assert resp401.json().get("request_id") == custom_id

    # 3. 422 Unprocessable Entity returns X-Request-ID in header and JSON body
    resp422 = client.post(
        "/api/learning/save-progress",
        json={"invalid_body": True},
        headers={"X-Request-ID": custom_id, "X-Forwarded-For": "10.10.10.99"}
    )
    assert resp422.status_code == 422
    assert resp422.headers.get("X-Request-ID") == custom_id
    assert resp422.json().get("request_id") == custom_id
