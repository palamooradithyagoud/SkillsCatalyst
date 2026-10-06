"""
tests/test_mentor_context_concurrency.py
Performance Benchmarking, Latency Distribution, & High Concurrency Test Suite.
Covers:
- P1: Performance & Latency (Tests 55 - 57)
- P1: Concurrency & Cache Stampede (Tests 58 - 60)
- P1: Cache Invalidation Behavior (Test 61)
"""

import asyncio
import time
import statistics
import pytest
from unittest.mock import MagicMock

from backend.services.cache_service import delete_pattern, _in_memory_cache
from backend.services.ai_mentor import build_student_mentor_context
import backend.services.ai_mentor.context_aggregator as aggregator_module

USER_PREFIX = "55555555-5555-5555-5555-"


class MockQueryBuilder:
    def __init__(self, data=None):
        self._data = data if data is not None else []

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        res = MagicMock()
        res.data = self._data
        res.count = len(self._data)
        return res


def _mock_fast_sb():
    mock = MagicMock()
    mock.table.side_effect = lambda t: MockQueryBuilder([{"full_name": "Perf Student", "total_solved": 50}])
    return mock


# ==============================================================================
# P1: Performance & Latency (Tests 55 - 57)
# ==============================================================================

def test_55_single_request_latency_distribution(monkeypatch):
    """
    Test 55: Measures p50, p95, and p99 latency for 50 context builds.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    mock_sb = _mock_fast_sb()
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    test_uid = f"{USER_PREFIX}000000000001"

    # Prime cache once
    asyncio.run(build_student_mentor_context(test_uid))

    latencies_ms = []
    for _ in range(50):
        t0 = time.perf_counter()
        asyncio.run(build_student_mentor_context(test_uid))
        latencies_ms.append((time.perf_counter() - t0) * 1000)

    p50 = statistics.median(latencies_ms)
    sorted_l = sorted(latencies_ms)
    p95 = sorted_l[int(len(sorted_l) * 0.95)]
    p99 = sorted_l[int(len(sorted_l) * 0.99)]

    assert p50 < 100.0, f"p50 latency too high: {p50}ms"
    assert p95 < 200.0, f"p95 latency too high: {p95}ms"


def test_56_and_57_cold_vs_warm_cache_latency(monkeypatch):
    """
    Test 56 & 57: Warm-cache execution is demonstrably faster than cold-cache DB assembly.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Add simulated DB latency
    def slow_table_query(t):
        time.sleep(0.005)  # 5ms simulated DB roundtrip
        return MockQueryBuilder([{"full_name": "Cold User"}])

    mock_sb = MagicMock()
    mock_sb.table.side_effect = slow_table_query
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    test_uid = f"{USER_PREFIX}000000000002"

    # Cold run
    t_cold_start = time.perf_counter()
    ctx_cold = asyncio.run(build_student_mentor_context(test_uid, force_refresh=True))
    cold_duration_ms = (time.perf_counter() - t_cold_start) * 1000
    assert ctx_cold.metadata.cached is False

    # Warm run
    t_warm_start = time.perf_counter()
    ctx_warm = asyncio.run(build_student_mentor_context(test_uid))
    warm_duration_ms = (time.perf_counter() - t_warm_start) * 1000
    assert ctx_warm.metadata.cached is True

    # Warm cache must be faster than cold
    assert warm_duration_ms < cold_duration_ms


# ==============================================================================
# P1: Concurrency & Cache Stampede (Tests 58 - 60)
# ==============================================================================

def test_58_one_hundred_concurrent_requests(monkeypatch):
    """
    Test 58: 100 concurrent requests across different users execute without crashes or memory corruption.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    mock_sb = _mock_fast_sb()
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    async def run_batch():
        tasks = [
            build_student_mentor_context(f"{USER_PREFIX}{i:012d}")
            for i in range(100)
        ]
        return await asyncio.gather(*tasks)

    results = asyncio.run(run_batch())
    assert len(results) == 100
    for r in results:
        assert r is not None
        assert r.student.name == "Perf Student"


def test_59_same_user_concurrent_requests_cache_stampede(monkeypatch):
    """
    Test 59: 50 simultaneous requests for the SAME user.
    Measures database query count and ensures consistent state.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    query_count = 0

    def counting_table(t):
        nonlocal query_count
        query_count += 1
        return MockQueryBuilder([{"full_name": "Stampede User"}])

    mock_sb = MagicMock()
    mock_sb.table.side_effect = counting_table
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    same_user = f"{USER_PREFIX}000000000099"

    async def run_concurrent():
        tasks = [build_student_mentor_context(same_user) for _ in range(50)]
        return await asyncio.gather(*tasks)

    results = asyncio.run(run_concurrent())
    assert len(results) == 50
    # Verify all results return valid identical context
    for r in results:
        assert r.student.name == "Stampede User"


def test_60_multiple_users_concurrent_strict_isolation(monkeypatch):
    """
    Test 60: 20 simultaneous users requesting contexts concurrently.
    Strictly verifies NO data bleeding between concurrent coroutines.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    def isolated_table(t):
        def custom_eq(col, val):
            return MockQueryBuilder([{"full_name": f"User_{val[-4:]}"}])
        qb = MagicMock()
        qb.select.return_value = qb
        qb.eq.side_effect = custom_eq
        qb.order.return_value = qb
        qb.limit.return_value = qb
        qb.execute.return_value = MagicMock(data=[], count=0)
        return qb

    mock_sb = MagicMock()
    mock_sb.table.side_effect = isolated_table
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    uids = [f"{USER_PREFIX}{i:012d}" for i in range(20)]

    async def run_isolated():
        tasks = [build_student_mentor_context(uid) for uid in uids]
        return await asyncio.gather(*tasks)

    results = asyncio.run(run_isolated())
    assert len(results) == 20
    for i, r in enumerate(results):
        expected_suffix = f"{i:04d}"
        assert expected_suffix in r.student.name, f"Data bleeding detected! Expected suffix {expected_suffix} in {r.student.name}"


# ==============================================================================
# P1: Cache Invalidation Behavior (Test 61)
# ==============================================================================

def test_61_cache_invalidation_behavior(monkeypatch):
    """
    Test 61: Validates that when data mutates, calling with force_refresh=True
    evicts the stale state immediately, whereas without force_refresh it honors the 60s TTL.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    progress = 20

    def dynamic_progress_sb(t):
        return MockQueryBuilder([{"full_name": "Student", "total_xp": progress}])

    mock_sb = MagicMock()
    mock_sb.table.side_effect = dynamic_progress_sb
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    uid = f"{USER_PREFIX}000000000077"

    # 1. Initial build: XP = 20
    ctx_1 = asyncio.run(build_student_mentor_context(uid))
    assert ctx_1.gamification.total_xp == 20

    # 2. Student completes milestone -> progress = 25
    progress = 25

    # Without force_refresh: returns cached stale value (honoring 60s TTL window)
    ctx_stale = asyncio.run(build_student_mentor_context(uid))
    assert ctx_stale.gamification.total_xp == 20
    assert ctx_stale.metadata.cached is True

    # With force_refresh: returns updated value immediately
    ctx_fresh = asyncio.run(build_student_mentor_context(uid, force_refresh=True))
    assert ctx_fresh.gamification.total_xp == 25
    assert ctx_fresh.metadata.cached is False
