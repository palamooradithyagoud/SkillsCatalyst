"""
tests/test_mentor_context_cache.py
Adversarial Redis & In-Memory Cache Security & Resilience Test Suite.
Covers:
- P0: Cache Isolation & Poisoning Defense (Tests 10 - 14)
- P0: Redis Failure, Corrupted Payloads, & Schema Mismatches (Tests 36 - 39)
"""

import asyncio
import time
import pytest
from unittest.mock import MagicMock

from backend.services.cache_service import (
    _in_memory_cache,
    delete_pattern,
    get_json,
    set_json,
)
from backend.services.ai_mentor import (
    build_student_mentor_context,
    MentorContext,
    StudentProfileContext,
    ContextMetadata,
)
import backend.services.ai_mentor.context_aggregator as aggregator_module

USER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
USER_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
USER_A_NEAR = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"  # 1 bit difference


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


def _mock_db_with_user_names(user_names_map):
    mock_sb = MagicMock()

    def get_table(table_name):
        def custom_eq(col, val):
            name = user_names_map.get(val, "Default User")
            if table_name in ("profiles", "user_academic_profile"):
                return MockQueryBuilder([{"full_name": name}])
            return MockQueryBuilder([])

        qb = MagicMock()
        qb.select.return_value = qb
        qb.eq.side_effect = custom_eq
        qb.order.return_value = qb
        qb.limit.return_value = qb
        qb.execute.return_value = MagicMock(data=[], count=0)
        return qb

    mock_sb.table.side_effect = get_table
    return mock_sb


# ==============================================================================
# P0: Cache Isolation & Poisoning Defense (Tests 10 - 14)
# ==============================================================================

def test_10_cache_namespace_isolation(monkeypatch):
    """
    Test 10: User A's context is cached under mentor:ctx:USER_A.
    User B's request reads from mentor:ctx:USER_B, never User A.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    mock_sb = _mock_db_with_user_names({USER_A: "Alice User", USER_B: "Bob User"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    # 1. Fetch User A
    ctx_a = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_a.student.name == "Alice User"

    # Verify User A cache exists
    cached_a = get_json(f"mentor:ctx:{USER_A}")
    assert cached_a is not None
    assert cached_a["student"]["name"] == "Alice User"

    # Verify User B cache does not exist yet
    cached_b = get_json(f"mentor:ctx:{USER_B}")
    assert cached_b is None

    # 2. Fetch User B
    ctx_b = asyncio.run(build_student_mentor_context(USER_B))
    assert ctx_b.student.name == "Bob User"

    cached_b = get_json(f"mentor:ctx:{USER_B}")
    assert cached_b is not None
    assert cached_b["student"]["name"] == "Bob User"


def test_11_cross_user_cache_poisoning_defense(monkeypatch):
    """
    Test 11: An attacker pre-populating User B's cache key with corrupted or mismatched data
    does not compromise User A, and schema validation catches malformed injections.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Poison User B's key with invalid garbage
    set_json(f"mentor:ctx:{USER_B}", {"malicious_payload": True, "student": "fake"})

    mock_sb = _mock_db_with_user_names({USER_B: "Real Bob"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    # Requesting User B should fail validation on the poisoned cache, discard it, and rebuild from DB
    ctx_b = asyncio.run(build_student_mentor_context(USER_B))
    assert ctx_b.student.name == "Real Bob"
    assert ctx_b.metadata.cached is False


def test_12_cache_collision_near_identical_uuids(monkeypatch):
    """
    Test 12: Two UUIDs that differ by only 1 bit do not collide in the cache.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    mock_sb = _mock_db_with_user_names({USER_A: "Alice Standard", USER_A_NEAR: "Alice Near Twin"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx_1 = asyncio.run(build_student_mentor_context(USER_A))
    ctx_2 = asyncio.run(build_student_mentor_context(USER_A_NEAR))

    assert ctx_1.student.name == "Alice Standard"
    assert ctx_2.student.name == "Alice Near Twin"

    key_1 = f"mentor:ctx:{USER_A}"
    key_2 = f"mentor:ctx:{USER_A_NEAR}"
    assert key_1 != key_2
    assert get_json(key_1)["student"]["name"] == "Alice Standard"
    assert get_json(key_2)["student"]["name"] == "Alice Near Twin"


def test_13_cache_expiry_fallback_to_db(monkeypatch):
    """
    Test 13: Simulated expiration of the 60s TTL causes a cache miss and fresh database read.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    call_count = 0

    def counting_db():
        nonlocal call_count
        call_count += 1
        return _mock_db_with_user_names({USER_A: f"Alice V{call_count}"})

    monkeypatch.setattr(aggregator_module, "get_supabase", counting_db)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    # First call: populates cache
    ctx_1 = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_1.metadata.cached is False

    # Second call before expiry: hits cache
    ctx_2 = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_2.metadata.cached is True

    # Expire the cache entry manually
    delete_pattern(f"mentor:ctx:{USER_A}")
    _in_memory_cache.clear()

    # Third call after expiry: cache miss -> fresh DB query
    ctx_3 = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_3.metadata.cached is False
    assert call_count > 1


def test_14_force_refresh_bypasses_and_updates_cache(monkeypatch):
    """
    Test 14: force_refresh=True ignores existing warm cache, reads DB, and updates cache.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    current_name = "Alice Version 1"

    def dynamic_db():
        return _mock_db_with_user_names({USER_A: current_name})

    monkeypatch.setattr(aggregator_module, "get_supabase", dynamic_db)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx_1 = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_1.student.name == "Alice Version 1"

    # Database changes
    current_name = "Alice Version 2 (Updated Profile)"

    # Normal call still returns cached Version 1
    ctx_cached = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx_cached.student.name == "Alice Version 1"
    assert ctx_cached.metadata.cached is True

    # Force refresh returns Version 2 and updates cache
    ctx_fresh = asyncio.run(build_student_mentor_context(USER_A, force_refresh=True))
    assert ctx_fresh.student.name == "Alice Version 2 (Updated Profile)"
    assert ctx_fresh.metadata.cached is False


# ==============================================================================
# P0: Redis Failure, Corrupted Payloads, & Schema Mismatches (Tests 36 - 39)
# ==============================================================================

def test_36_redis_unavailable_fallback(monkeypatch):
    """
    Test 36: When Redis client is None or raises connection error, aggregator
    gracefully succeeds using DB / in-memory fallback without raising 500.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Simulate Redis connection failure
    monkeypatch.setattr("backend.services.cache_service.get_redis_client", lambda: None)

    mock_sb = _mock_db_with_user_names({USER_A: "Alice No-Redis"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx.student.name == "Alice No-Redis"
    assert ctx.metadata.cached is False


def test_37_redis_timeout_exception(monkeypatch):
    """
    Test 37: Redis raising a TimeoutError during get_json or set_json does not hang or crash.
    """
    mock_redis = MagicMock()
    mock_redis.get.side_effect = TimeoutError("Redis socket read timeout")
    mock_redis.setex.side_effect = TimeoutError("Redis socket write timeout")

    monkeypatch.setattr("backend.services.cache_service.get_redis_client", lambda: mock_redis)

    mock_sb = _mock_db_with_user_names({USER_A: "Alice Timeout"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx.student.name == "Alice Timeout"


def test_38_redis_corrupt_json(monkeypatch):
    """
    Test 38: Raw corrupted non-JSON bytes in Redis are safely purged and ignored.
    """
    mock_redis = MagicMock()
    # Returns corrupted bytes
    mock_redis.get.return_value = "{malformed-json-truncated..."

    monkeypatch.setattr("backend.services.cache_service.get_redis_client", lambda: mock_redis)

    mock_sb = _mock_db_with_user_names({USER_A: "Alice Clean"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx.student.name == "Alice Clean"
    # Verify corrupted key was targeted for deletion
    mock_redis.delete.assert_called_with(f"mentor:ctx:{USER_A}")


def test_39_redis_wrong_schema(monkeypatch):
    """
    Test 39: Valid JSON with totally wrong fields fails Pydantic validation safely
    and triggers fresh DB rebuild.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Set valid JSON with schema mismatch (missing required metadata)
    set_json(f"mentor:ctx:{USER_A}", {"wrong_structure": True, "count": 123})

    mock_sb = _mock_db_with_user_names({USER_A: "Alice Recovered"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_A))
    assert ctx.student.name == "Alice Recovered"
    assert ctx.metadata.cached is False
