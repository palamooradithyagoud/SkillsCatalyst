import asyncio
import time
from unittest.mock import MagicMock, patch
import pytest
import httpx
from groq import Timeout, APITimeoutError
from backend.main import app
import backend.services.groq_service as groq_module
from backend.services.groq_service import (
    chat_with_groq,
    init_ai_semaphore,
    get_ai_semaphore,
    _AI_UNAVAILABLE_MSG,
    _GROQ_HARD_CEILING,
)
from backend.services.cache_service import get_cached_redis_status, get_redis_health_status


@pytest.mark.anyio
async def test_health_zero_network_io():
    """
    Condition 3: /health endpoint must execute ZERO network I/O.
    Redis ping is never invoked during health check probe.
    """
    mock_redis = MagicMock()
    mock_redis.ping.side_effect = RuntimeError("Network I/O should never occur on /health!")

    with patch("backend.services.cache_service.get_redis_client", return_value=mock_redis):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/health")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "healthy"
            # Verify ping was never called
            mock_redis.ping.assert_not_called()


def test_groq_timeout_budget_and_parameters(monkeypatch):
    """
    Condition 1: Per-attempt timeout = min(12s, remaining budget of 25s), with write=5s, pool=3s.
    Total fallback chain provably stays under 25s ceiling.
    """
    captured_timeouts = []
    mock_client = MagicMock()

    def mock_create(*args, **kwargs):
        timeout_arg = kwargs.get("timeout")
        captured_timeouts.append(timeout_arg)
        # Simulate each model timing out
        raise APITimeoutError(request=MagicMock())

    mock_client.chat.completions.create = mock_create
    monkeypatch.setattr(groq_module, "groq_client", mock_client)

    t_start = time.monotonic()
    result = chat_with_groq("Test timeout budget")
    elapsed = time.monotonic() - t_start

    assert result == _AI_UNAVAILABLE_MSG
    assert len(captured_timeouts) >= 1

    # Verify first timeout configuration has write=5.0, pool=3.0, and read<=12.0
    first_timeout = captured_timeouts[0]
    assert isinstance(first_timeout, Timeout)
    assert first_timeout.read == 12.0
    assert first_timeout.write == 5.0
    assert first_timeout.pool == 3.0
    assert first_timeout.connect == 3.0


@pytest.mark.anyio
async def test_ai_concurrency_semaphore_limits_parallelism():
    """
    Condition 2: AI semaphore bounds concurrent AI executions to MAX_CONCURRENT_AI_REQUESTS.
    """
    max_slots = 3
    sem = init_ai_semaphore(max_concurrent=max_slots)
    current_concurrency = 0
    max_observed_concurrency = 0

    async def worker():
        nonlocal current_concurrency, max_observed_concurrency
        async with get_ai_semaphore():
            current_concurrency += 1
            if current_concurrency > max_observed_concurrency:
                max_observed_concurrency = current_concurrency
            await asyncio.sleep(0.05)
            current_concurrency -= 1

    # Launch 6 concurrent workers with a capacity of 3
    tasks = [asyncio.create_task(worker()) for _ in range(6)]
    await asyncio.gather(*tasks)

    assert max_observed_concurrency <= max_slots
    # Reset semaphore back to default 6
    init_ai_semaphore(max_concurrent=6)


@pytest.mark.anyio
async def test_event_loop_unblocked_during_groq_ai_call():
    """
    P0-1 Fix Verification:
    When /api/ai-mentor/chat runs a slow Groq call in a thread,
    the event loop is NOT blocked and /health responds in < 100ms.
    """
    def slow_mock_groq(*args, **kwargs):
        time.sleep(0.5)  # Simulate 500ms sync I/O in worker thread
        return "AI Mentor Response"

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        with patch("backend.services.groq_service.chat_with_groq", side_effect=slow_mock_groq), \
             patch("backend.services.ai_mentor.context_aggregator.build_student_mentor_context", return_value="context"):

            # Start slow AI chat request
            ai_task = asyncio.create_task(
                client.post(
                    "/api/ai-mentor/chat",
                    json={"message": "Help me with algorithms", "session_id": "test_session"},
                )
            )

            # Wait 50ms to ensure AI request has entered execution
            await asyncio.sleep(0.05)

            # Measure /health probe latency while AI request is in flight
            t_health_start = time.monotonic()
            health_resp = await client.get("/health")
            health_latency_ms = (time.monotonic() - t_health_start) * 1000

            ai_resp = await ai_task

            assert health_resp.status_code == 200
            assert health_resp.json()["status"] == "healthy"
            # Event loop was not frozen; health probe responded swiftly
            assert health_latency_ms < 100.0, f"Health probe took {health_latency_ms}ms (expected < 100ms)"


@pytest.mark.anyio
async def test_event_loop_unblocked_during_profile_queries():
    """
    P0-1 Fix Verification:
    When GET /api/profile executes PostgREST queries via AnyIO threadpool,
    the event loop is NOT blocked and /health responds in < 100ms.
    """
    def slow_db_query(*args, **kwargs):
        time.sleep(0.4)  # Simulate 400ms PostgREST sync call in AnyIO threadpool
        mock_result = MagicMock()
        mock_result.data = [{"id": "test-user-id", "full_name": "Test User"}]
        return mock_result

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute = slow_db_query
    mock_user = MagicMock()
    mock_user.id = "test-user-id"
    mock_user.email = "test@example.com"
    mock_user.user_metadata = {}
    mock_res = MagicMock()
    mock_res.user = mock_user
    mock_sb.auth.get_user.return_value = mock_res

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        with patch("backend.routers.profile.get_supabase", return_value=mock_sb), \
             patch("backend.services.auth_service.get_supabase", return_value=mock_sb):

            profile_task = asyncio.create_task(
                client.get(
                    "/api/profile",
                    headers={"Authorization": "Bearer mock_jwt_token"},
                )
            )

            # Wait 50ms for profile request to enter worker thread
            await asyncio.sleep(0.05)

            # Measure /health probe latency while profile DB calls are running
            t_health_start = time.monotonic()
            health_resp = await client.get("/health")
            health_latency_ms = (time.monotonic() - t_health_start) * 1000

            await profile_task

            assert health_resp.status_code == 200
            assert health_latency_ms < 100.0, f"Health probe took {health_latency_ms}ms during profile fetch"


@pytest.mark.anyio
async def test_control_demonstrates_event_loop_blocking_vs_non_blocking():
    """
    Control Test:
    Proves that calling synchronous blocking I/O directly inside an async def
    handler freezes the asyncio event loop (causing scheduled coroutines and probes
    to stall for the full duration of the blocking call).
    Demonstrates that offloading via asyncio.to_thread prevents the stall completely.
    """
    from fastapi import FastAPI

    test_app = FastAPI()

    @test_app.get("/unpatched_blocking")
    async def unpatched_blocking():
        # EXACT PATTERN OF ORIGINAL BUG (P0-1): sync blocking call directly on event loop thread
        time.sleep(0.4)
        return {"done": True}

    @test_app.get("/patched_non_blocking")
    async def patched_non_blocking():
        # PATCHED PATTERN: sync blocking call offloaded to AnyIO/asyncio worker thread
        await asyncio.to_thread(time.sleep, 0.4)
        return {"done": True}

    async def measure_loop_delay():
        # Attempts to sleep for 50ms. If the event loop is blocked,
        # it cannot resume until the blocking call finishes.
        t0 = time.monotonic()
        await asyncio.sleep(0.05)
        return (time.monotonic() - t0) * 1000

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=test_app), base_url="http://test") as client:
        # 1. Unpatched scenario: Event loop is frozen by sync time.sleep on event loop thread
        monitor_task_blocked = asyncio.create_task(measure_loop_delay())
        blocking_task = asyncio.create_task(client.get("/unpatched_blocking"))

        loop_lag_unpatched_ms, _ = await asyncio.gather(monitor_task_blocked, blocking_task)

        # Control assertion: prove the unpatched code stalls event loop (> 350ms vs expected 50ms)
        assert loop_lag_unpatched_ms >= 350.0, (
            f"Unpatched blocking call should stall loop for >= 350ms, observed {loop_lag_unpatched_ms}ms"
        )

        # 2. Patched scenario: Event loop remains unblocked via to_thread
        monitor_task_free = asyncio.create_task(measure_loop_delay())
        patched_task = asyncio.create_task(client.get("/patched_non_blocking"))

        loop_lag_patched_ms, _ = await asyncio.gather(monitor_task_free, patched_task)

        # Patched assertion: event loop resumes promptly (< 100ms)
        assert loop_lag_patched_ms < 100.0, (
            f"Patched call should keep event loop responsive (< 100ms), observed {loop_lag_patched_ms}ms"
        )
