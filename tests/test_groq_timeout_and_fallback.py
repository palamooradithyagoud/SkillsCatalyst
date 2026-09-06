import pytest
from unittest.mock import MagicMock
from groq import APITimeoutError, RateLimitError, APIConnectionError
import backend.services.groq_service as groq_module
from backend.services.groq_service import chat_with_groq, _AI_UNAVAILABLE_MSG
from backend.services.observability import get_system_metrics, record_ai_call


def test_groq_fallback_on_timeout(monkeypatch):
    """
    Simulates model 1 raising APITimeoutError and model 2 succeeding.
    Verifies fallback chain proceeds to next model and returns expected response.
    """
    call_count = 0
    attempted_models = []

    mock_client = MagicMock()

    def mock_create(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        model = kwargs.get("model", "")
        attempted_models.append(model)
        if call_count == 1:
            raise APITimeoutError(request=MagicMock())
        # Second model succeeds
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "Groq fallback successful response"
        mock_response.choices = [mock_choice]
        return mock_response

    mock_client.chat.completions.create = mock_create
    monkeypatch.setattr(groq_module, "groq_client", mock_client)

    result = chat_with_groq("Hello AI Mentor")

    assert result == "Groq fallback successful response"
    assert call_count == 2
    assert len(attempted_models) == 2


def test_groq_fallback_on_rate_limit(monkeypatch):
    """
    Simulates model 1 raising RateLimitError (429) and model 2 succeeding.
    Verifies that rate limit on one model triggers fallback without user disruption.
    """
    call_count = 0

    mock_client = MagicMock()

    def mock_create(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RateLimitError(
                message="Rate limit exceeded",
                response=MagicMock(status_code=429),
                body=None,
            )
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "Second model succeeded after 429"
        mock_response.choices = [mock_choice]
        return mock_response

    mock_client.chat.completions.create = mock_create
    monkeypatch.setattr(groq_module, "groq_client", mock_client)

    result = chat_with_groq("Test rate limit fallback")

    assert result == "Second model succeeded after 429"
    assert call_count == 2


def test_groq_all_models_fail_returns_safe_message(monkeypatch):
    """
    Simulates all fallback models failing with APITimeoutError.
    Verifies that:
      1. No exception is raised to caller
      2. The safe user-facing message is returned
      3. No internal details/traceback are exposed in the return value
    """
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = APITimeoutError(request=MagicMock())
    monkeypatch.setattr(groq_module, "groq_client", mock_client)

    result = chat_with_groq("Tell me about algorithms")

    assert result == _AI_UNAVAILABLE_MSG
    # Ensure internal exception strings are NOT leaked
    assert "APITimeoutError" not in result
    assert "Traceback" not in result
    assert "gsk_" not in result


def test_groq_client_uninitialized(monkeypatch):
    """
    When groq_client is None (e.g. GROQ_API_KEY missing), returns safe message cleanly.
    """
    monkeypatch.setattr(groq_module, "groq_client", None)
    result = chat_with_groq("Test prompt")
    assert result == _AI_UNAVAILABLE_MSG


def test_ai_mentor_review_resume_502_on_ai_failure(monkeypatch):
    """
    Verifies that /api/ai-mentor/review-resume returns HTTP 502 Bad Gateway
    with clean user-facing error when all Groq models are unavailable.
    """
    from fastapi.testclient import TestClient
    from backend.main import app
    import backend.routers.ai_mentor as ai_mentor_module
    from backend.services.auth_service import get_current_user_id

    # Mock auth dependency
    app.dependency_overrides[get_current_user_id] = lambda: "00000000-0000-0000-0000-000000000001"

    try:
        # Force chat_with_groq to return _AI_UNAVAILABLE_MSG
        monkeypatch.setattr(ai_mentor_module, "chat_with_groq", lambda *args, **kwargs: _AI_UNAVAILABLE_MSG)

        client = TestClient(app)
        res = client.post(
            "/api/ai-mentor/review-resume",
            json={
                "resume_text": "Experienced Python Developer with 5 years experience in building APIs.",
                "target_role": "Backend Engineer",
                "years_experience": "5",
                "company_type": "Product-Based",
            }
        )

        assert res.status_code == 502
        data = res.json()
        assert data.get("success") is False
        assert "temporarily unavailable" in data.get("message", "").lower()
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)


def test_groq_observability_integration():
    """
    Verifies record_ai_call updates system metrics with model, latency, and timeouts.
    """
    record_ai_call(
        success=True,
        provider="groq",
        model="llama-3.3-70b-versatile",
        latency_ms=350.5,
    )
    record_ai_call(
        success=False,
        provider="groq",
        model="openai/gpt-oss-120b",
        latency_ms=5000.0,
        error_category="timeout",
        timed_out=True,
    )

    metrics = get_system_metrics()
    assert "ai_metrics" in metrics
    ai_m = metrics["ai_metrics"]
    assert ai_m["total_calls"] >= 2
    assert ai_m["errors"] >= 1
    assert ai_m["timeouts"] >= 1
    assert "timeout" in ai_m["error_categories"]
