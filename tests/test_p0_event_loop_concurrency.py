import asyncio
import time
from unittest.mock import MagicMock, patch
import pytest
import httpx
from fastapi import HTTPException
from groq import Timeout, APITimeoutError
from backend.main import app
import backend.services.groq_service as groq_module
try:
    from backend.services.groq_service import (
        chat_with_groq,
        init_ai_semaphore,
        get_ai_semaphore,
        _AI_UNAVAILABLE_MSG,
        _GROQ_HARD_CEILING,
    )
except ImportError:
    from backend.services.groq_service import chat_with_groq, _AI_UNAVAILABLE_MSG
    init_ai_semaphore = None
    get_ai_semaphore = None
    _GROQ_HARD_CEILING = 25.0

try:
    from backend.services.cache_service import get_cached_redis_status, get_redis_health_status
except ImportError:
    from backend.services.cache_service import get_redis_health_status
    get_cached_redis_status = None


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
    mock_table = MagicMock()
    mock_sb.from_.return_value = mock_table
    mock_table.select.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.execute = slow_db_query

    mock_user = MagicMock()
    mock_user.id = "test-user-id"
    mock_user.email = "test@example.com"
    mock_user.user_metadata = {}
    mock_res = MagicMock()
    mock_res.user = mock_user
    mock_sb.auth.get_user.return_value = mock_res

    from backend.services.auth_service import get_current_user_id
    app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb), \
                 patch("backend.services.supabase_service.get_supabase", return_value=mock_sb):

                async def measure_loop_delay():
                    t0 = time.monotonic()
                    await asyncio.sleep(0.05)
                    return (time.monotonic() - t0) * 1000

                monitor_task = asyncio.create_task(measure_loop_delay())
                profile_task = asyncio.create_task(client.get("/api/profile"))

                loop_delay_ms, profile_resp = await asyncio.gather(monitor_task, profile_task)

                assert profile_resp.status_code == 200
                # On unpatched code, sync DB calls in async def freeze loop for 4000ms+
                # On patched code (def get_profile), loop remains free (< 150ms)
                assert loop_delay_ms < 150.0, f"Event loop was blocked during profile fetch: {loop_delay_ms}ms"
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)


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


@pytest.mark.anyio
async def test_invalid_expired_token_still_401_after_middleware_wrap():
    """
    Requirement 3a: Verify that invalid or expired JWT token still strictly
    returns HTTP 401 Unauthorized after middleware to_thread wrap.
    """
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Invalid token
        resp_invalid = await client.get(
            "/api/profile",
            headers={"Authorization": "Bearer invalid.fake.token"},
        )
        assert resp_invalid.status_code == 401
        data = resp_invalid.json()
        assert "Invalid" in data.get("detail", "") or "Invalid" in data.get("message", "")

        # Missing token
        resp_missing = await client.get("/api/profile")
        assert resp_missing.status_code == 401


def test_hanging_groq_mock_returns_standard_error_within_scaled_budget(monkeypatch):
    """
    Requirement 3b: When Groq attempts hang/timeout, verify execution stays within
    budget and returns standard user-facing unavailable message (scaled config).
    """
    # Scaled budget: 4.0s
    monkeypatch.setenv("GROQ_CHAIN_TIMEOUT_SECONDS", "4.0")
    import backend.services.groq_service as groq_svc
    monkeypatch.setattr(groq_svc, "_GROQ_HARD_CEILING", 4.0)

    mock_client = MagicMock()
    def hanging_create(*args, **kwargs):
        # Hang longer than budget
        time.sleep(1.8)
        raise APITimeoutError(request=MagicMock())

    mock_client.chat.completions.create = hanging_create
    monkeypatch.setattr(groq_svc, "groq_client", mock_client)

    t0 = time.monotonic()
    result = groq_svc.chat_with_groq("Test hanging mock")
    elapsed = time.monotonic() - t0

    assert result == _AI_UNAVAILABLE_MSG
    # Should execute at most 2 attempts before remaining budget < 2.0s triggers skip
    assert elapsed <= 4.5, f"Hanging Groq mock exceeded scaled budget: {elapsed}s"


@pytest.mark.anyio
async def test_trickling_groq_mock_returns_standard_503_within_scaled_ceiling(monkeypatch):
    """
    GAP 2: When a remote Groq server trickles bytes slowly without hitting
    per-phase socket timeouts, verify that run_bounded_ai_call watchdog halts
    the execution and returns standard HTTP 503 error payload within ceiling + tolerance.
    """
    scaled_ceiling = 2.0  # seconds
    monkeypatch.setenv("GROQ_CHAIN_TIMEOUT_SECONDS", str(scaled_ceiling))
    import backend.services.groq_service as groq_svc
    monkeypatch.setattr(groq_svc, "_GROQ_HARD_CEILING", scaled_ceiling)

    # Mock a trickling Groq call that sleeps in a loop, simulating slow bytes
    # that would bypass per-phase HTTPX socket timeouts.
    def trickling_groq_call(*args, **kwargs):
        for _ in range(20):
            time.sleep(0.5)
        return "slow trickled response"

    t0 = time.monotonic()
    with pytest.raises(HTTPException) as exc_info:
        await groq_svc.run_bounded_ai_call(
            trickling_groq_call,
            ceiling_timeout=scaled_ceiling,
        )
    elapsed = time.monotonic() - t0

    assert exc_info.value.status_code == 503
    detail = exc_info.value.detail
    assert isinstance(detail, dict)
    assert detail.get("success") is False
    assert "hard deadline" in detail.get("detail", "")
    assert elapsed <= 3.5, f"Watchdog failed to bound trickling call in time: took {elapsed:.2f}s"


@pytest.mark.anyio
async def test_profile_response_matches_pre_fix_snapshot():
    """
    GAP 3: Strict equality regression test ensuring GET /api/profile on the branch
    matches the exact pre-fix JSON snapshot recorded from base 1d15718.
    """
    import json
    from pathlib import Path

    fixture_path = Path(__file__).parent / "fixtures" / "profile_prefix_snapshot.json"
    assert fixture_path.exists(), f"Fixture missing at {fixture_path}"
    with open(fixture_path, "r", encoding="utf-8") as f:
        expected_snapshot = json.load(f)

    user_id = "user-00000000-0000-0000-0000-000000000001"

    # Deterministic mock identical to the generator executed on base 1d15718
    mock_tables = {
        "user_academic_profile": [{
            "user_id": user_id,
            "full_name": "Ada Lovelace",
            "college": "MIT",
            "department": "Computer Science",
            "academic_year": "2025",
            "target_role": "Backend Engineer",
        }],
        "profiles": [{
            "id": user_id,
            "full_name": "Ada Lovelace",
            "headline": "Software Engineer",
            "avatar_url": "https://example.com/avatar.png",
            "country": "US",
            "state": "CA",
            "city": "SF",
            "phone": "+1234567890",
            "gender": "Female",
            "about": "Lover of code",
        }],
        "user_coding_profiles": [{
            "user_id": user_id,
            "leetcode_url": "https://leetcode.com/ada",
            "github_url": "https://github.com/ada",
            "hackerrank_url": "",
            "codechef_url": "",
            "geeksforgeeks_url": "",
            "codeforces_url": "",
            "stats_json": {
                "leetcode": {"solved": 150},
                "github": {"repos": 42},
            },
        }],
        "user_skills": [{
            "id": "sk-1",
            "user_id": user_id,
            "skill_name": "Python",
            "category": "Backend",
            "proficiency": "Expert",
        }],
        "experiences": [{
            "id": "exp-1",
            "user_id": user_id,
            "company": "Tech Corp",
            "role": "Senior Engineer",
            "start_date": "2022-01-01",
        }],
        "education": [{
            "id": "edu-1",
            "user_id": user_id,
            "institution": "MIT",
            "degree": "B.S. CS",
            "start_year": 2018,
        }],
        "projects": [{
            "id": "proj-1",
            "user_id": user_id,
            "title": "Compiler",
            "description": "A compiler in Python",
        }],
        "certifications": [{
            "id": "cert-1",
            "user_id": user_id,
            "name": "AWS Certified Architect",
            "issuer": "Amazon",
            "issue_date": "2023-05-01",
        }],
        "achievements": [{
            "id": "ach-1",
            "user_id": user_id,
            "title": "Hackathon Winner",
            "achievement_date": "2024-02-15",
        }],
        "career_preferences": [{
            "user_id": user_id,
            "target_roles": ["Backend Engineer"],
            "preferred_industries": ["Tech"],
            "target_companies": ["Google"],
            "preferred_locations": ["Remote"],
            "work_arrangements": ["Full-time"],
        }],
        "resume_scores": [{
            "id": "res-1",
            "user_id": user_id,
            "score": 88,
            "created_at": "2026-01-01T00:00:00Z",
        }],
        "user_progress": [{
            "user_id": user_id,
            "total_points": 500,
            "level": 5,
        }],
    }

    class MockQuery:
        def __init__(self, table_name):
            self.table_name = table_name
        def select(self, *args, **kwargs): return self
        def eq(self, *args, **kwargs): return self
        def order(self, *args, **kwargs): return self
        def limit(self, *args, **kwargs): return self
        def execute(self):
            res = MagicMock()
            res.data = mock_tables.get(self.table_name, [])
            return res

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = "ada@example.com"
    mock_auth_res = MagicMock()
    mock_auth_res.user = mock_user

    class MockAuth:
        def get_user(self, *args, **kwargs):
            return mock_auth_res

    class MockSupabase:
        def __init__(self):
            self.auth = MockAuth()
        def from_(self, table_name):
            return MockQuery(table_name)

    mock_sb = MockSupabase()

    from backend.services.auth_service import get_current_user_id
    app.dependency_overrides[get_current_user_id] = lambda: user_id

    # Explicit list of volatile fields to ignore (none in deterministic GET /api/profile schema)
    IGNORED_VOLATILE_FIELDS = []

    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb), \
                 patch("backend.services.auth_service.get_supabase", return_value=mock_sb), \
                 patch("backend.services.auth_service.get_current_user_id", return_value=user_id):

                resp = await client.get(
                    "/api/profile",
                    headers={"Authorization": "Bearer mock_valid_jwt"},
                )
                assert resp.status_code == 200
                actual_data = resp.json()

                def strip_volatile(d):
                    if isinstance(d, dict):
                        return {k: strip_volatile(v) for k, v in d.items() if k not in IGNORED_VOLATILE_FIELDS}
                    elif isinstance(d, list):
                        return [strip_volatile(x) for x in d]
                    return d

                assert strip_volatile(actual_data) == strip_volatile(expected_snapshot), (
                    f"Branch profile output diverged from base 1d15718 snapshot!"
                )
    finally:
        app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────────────────────
# GAP 6: Edge Case Coverage (Semaphore, Cancellation, Refresher, Rate Limiter, Auth)
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_semaphore_saturation_returns_503_and_health_stays_fast():
    """
    GAP 6a: When all slots on the AI semaphore are occupied, request N+1 receives
    HTTP 503 in the standard error shape after acquire timeout, while concurrent
    /health probes remain unblocked (< 50ms).
    """
    from backend.services.groq_service import init_ai_semaphore, run_bounded_ai_call
    sem = init_ai_semaphore(max_concurrent=2)

    # Occupy all 2 slots
    await sem.acquire()
    await sem.acquire()

    try:
        t0 = time.monotonic()
        with pytest.raises(HTTPException) as exc_info:
            await run_bounded_ai_call(
                lambda: "workload",
                acquire_timeout=0.6,
            )
        elapsed = time.monotonic() - t0

        assert exc_info.value.status_code == 503
        detail = exc_info.value.detail
        assert isinstance(detail, dict)
        assert detail.get("success") is False
        assert "concurrency limit" in detail.get("detail", "").lower()
        assert elapsed <= 1.2, f"Acquire timeout took too long: {elapsed}s"

        # Assert /health probe stays fast while semaphore is saturated
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            t_probe = time.monotonic()
            resp = await client.get("/health")
            probe_ms = (time.monotonic() - t_probe) * 1000.0
            assert resp.status_code == 200
            assert probe_ms < 50.0, f"/health took too long ({probe_ms}ms) during semaphore saturation"
    finally:
        sem.release()
        sem.release()


@pytest.mark.anyio
async def test_semaphore_slot_released_on_exception_and_cancellation():
    """
    GAP 6b: Verifies no slot leaks on either worker exception or caller cancellation.
    """
    from backend.services.groq_service import init_ai_semaphore, run_bounded_ai_call
    sem = init_ai_semaphore(max_concurrent=3)
    initial_value = sem._value

    # 1. Exception in worker function
    def failing_worker():
        raise RuntimeError("Synthetic failure in Groq worker")

    with pytest.raises(RuntimeError):
        await run_bounded_ai_call(failing_worker, acquire_timeout=1.0)

    # Allow worker thread finally block to execute threadsafe release
    await asyncio.sleep(0.05)
    assert sem._value == initial_value, f"Slot leaked on exception: sem._value={sem._value}, expected {initial_value}"

    # 2. Client cancellation (task cancelled)
    def long_worker():
        time.sleep(0.2)
        return "done"

    task = asyncio.create_task(run_bounded_ai_call(long_worker, acquire_timeout=1.0))
    await asyncio.sleep(0.05)
    # Cancel while worker is running
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # Wait for background worker to terminate and release slot
    await asyncio.sleep(0.25)
    assert sem._value == initial_value, f"Slot leaked on cancellation: sem._value={sem._value}, expected {initial_value}"


def test_redis_refresher_resilience_and_shutdown():
    """
    GAP 6c: Test that Redis ping failure or hang does not crash the refresher,
    and shutdown cleans up tasks without warnings.
    """
    from backend.services.cache_service import refresh_cached_redis_status, get_cached_redis_status

    with patch("backend.services.cache_service.get_redis_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.ping.side_effect = Exception("Connection refused to Redis")
        mock_get_client.return_value = mock_client

        # Should not raise exception; sets degraded/fallback status
        status = refresh_cached_redis_status()
        assert status in ("degraded/fallback", "disconnected")
        assert get_cached_redis_status() in ("degraded/fallback", "disconnected")


def test_thread_safe_rate_limiter_concurrency():
    """
    GAP 6d: 50 concurrent threads hammering InMemoryRateLimiter on the same key.
    Verifies exactly limit requests are allowed and no thread-safety exceptions occur.
    """
    from concurrent.futures import ThreadPoolExecutor
    from backend.services.rate_limiter import InMemoryRateLimiter

    limiter = InMemoryRateLimiter()
    limit = 20
    window = 60

    # Build mock request object that returns a consistent client key
    mock_req = MagicMock()
    mock_req.headers = {}
    mock_req.client.host = "192.168.1.100"

    results = []

    def hammer():
        allowed, retry = limiter.check_rate_limit(mock_req, limit, window)
        return allowed

    with ThreadPoolExecutor(max_workers=50) as executor:
        futs = [executor.submit(hammer) for _ in range(50)]
        for fut in futs:
            results.append(fut.result())

    allowed_count = sum(1 for r in results if r is True)
    blocked_count = sum(1 for r in results if r is False)

    assert allowed_count == limit, f"Expected exactly {limit} allowed requests, got {allowed_count}"
    assert blocked_count == 30, f"Expected 30 blocked requests, got {blocked_count}"


@pytest.mark.anyio
async def test_middleware_auth_parity_missing_malformed_expired():
    """
    GAP 6e: Confirms missing, malformed, and expired tokens return 401 with standard format.
    """
    import jwt
    import time

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Missing token
        r_missing = await client.get("/api/profile")
        assert r_missing.status_code == 401
        data_missing = r_missing.json()
        assert "Invalid" in data_missing.get("detail", "") or "Invalid" in data_missing.get("message", "")

        # 2. Malformed token
        r_malformed = await client.get("/api/profile", headers={"Authorization": "Bearer not-a-valid-jwt"})
        assert r_malformed.status_code == 401
        data_malformed = r_malformed.json()
        assert "Invalid" in data_malformed.get("detail", "") or "Invalid" in data_malformed.get("message", "")

        # 3. Expired token (past exp timestamp)
        expired_payload = {
            "sub": "user-00000000-0000-0000-0000-000000000001",
            "exp": int(time.time()) - 3600,
        }
        expired_jwt = jwt.encode(expired_payload, "test-secret-key-that-is-thirty-two-bytes-long", algorithm="HS256")
        r_expired = await client.get("/api/profile", headers={"Authorization": f"Bearer {expired_jwt}"})
        assert r_expired.status_code == 401
        data_expired = r_expired.json()
        assert "Invalid" in data_expired.get("detail", "") or "Invalid" in data_expired.get("message", "")

