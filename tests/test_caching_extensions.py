"""
tests/test_caching_extensions.py
Comprehensive test suite verifying Redis caching extensions for:
1. User Subscription / Entitlement status
2. Shared Tech News
3. Event Hero / Banner metadata
4. Live Redis Integration & cleanup
"""

import json
import time
import uuid
import pytest
from unittest.mock import MagicMock, patch

from backend.models.subscription import PlanCode, SubscriptionStatus
from backend.services.cache_service import (
    get_redis_client,
    get_json,
    set_json,
    delete_key,
    delete_many,
    delete_pattern,
    _in_memory_cache,
    make_subscription_cache_key,
    get_cached_user_subscription,
    set_cached_user_subscription,
    invalidate_user_subscription,
    USER_SUBSCRIPTION_CACHE_TTL,
    make_tech_news_grouped_cache_key,
    make_tech_news_story_cache_key,
    get_cached_tech_news_grouped,
    set_cached_tech_news_grouped,
    get_cached_tech_news_story,
    set_cached_tech_news_story,
    invalidate_tech_news_cache,
    TECH_NEWS_CACHE_TTL,
    make_event_hero_cache_key,
    make_event_featured_cache_key,
    get_cached_event_hero,
    set_cached_event_hero,
    get_cached_featured_events,
    set_cached_featured_events,
    invalidate_event_cache,
    EVENT_HERO_CACHE_TTL,
)
from backend.services.subscription_service import SubscriptionService
from backend.services.tech_news_service import (
    get_student_grouped_tech_news,
    get_student_story_by_id,
    create_story,
    update_story,
    publish_story,
    delete_story,
)
from backend.services.event_service import (
    get_student_events,
    get_student_event_by_id,
    create_event,
    update_event,
    delete_event,
)
from backend.models.event import CreateEventRequest, UpdateEventRequest, EventCategory, EventStatus
from backend.models.tech_news import CreateTechNewsRequest, UpdateTechNewsRequest


# =====================================================================
# 1. USER SUBSCRIPTION CACHE TESTS
# =====================================================================

class TestUserSubscriptionCache:

    def test_01_cache_miss_queries_authoritative_source_and_caches_result(self):
        """1 & 2: Cache miss queries Supabase, stores minimal result in Redis."""
        user_id = str(uuid.uuid4())
        invalidate_user_subscription(user_id)

        mock_sb = MagicMock()
        mock_sb.from_().select().eq().order().execute.return_value = MagicMock(data=[])

        with patch("backend.services.subscription_service.get_supabase", return_value=mock_sb):
            res = SubscriptionService.resolve_effective_subscription(user_id)
            assert res["plan"] == PlanCode.FREE
            assert res["is_premium"] is False

            # Verify it was stored in cache
            cached = get_cached_user_subscription(user_id)
            assert cached is not None
            assert cached["plan"] == "free"
            assert cached["is_premium"] is False

        invalidate_user_subscription(user_id)

    def test_02_cache_hit_avoids_database_lookup(self):
        """3: Cache hit returns cached subscription and skips Supabase query."""
        user_id = str(uuid.uuid4())
        set_cached_user_subscription(user_id, {
            "plan": "premium_monthly",
            "status": "active",
            "is_premium": True,
            "started_at": "2026-01-01T00:00:00+00:00",
            "expires_at": "2026-12-31T00:00:00+00:00",
        })

        mock_sb = MagicMock()
        with patch("backend.services.subscription_service.get_supabase", return_value=mock_sb):
            res = SubscriptionService.resolve_effective_subscription(user_id)
            assert res["plan"] == PlanCode.PREMIUM_MONTHLY
            assert res["is_premium"] is True
            # Database should NEVER be called on cache hit
            mock_sb.from_.assert_not_called()

        invalidate_user_subscription(user_id)

    def test_03_pro_and_normal_user_differentiation(self):
        """4 & 5: Pro user returns pro, normal user returns free."""
        pro_user = str(uuid.uuid4())
        free_user = str(uuid.uuid4())

        set_cached_user_subscription(pro_user, {
            "plan": "premium_monthly",
            "status": "active",
            "is_premium": True,
        })
        set_cached_user_subscription(free_user, {
            "plan": "free",
            "status": "active",
            "is_premium": False,
        })

        pro_res = SubscriptionService.resolve_effective_subscription(pro_user)
        free_res = SubscriptionService.resolve_effective_subscription(free_user)

        assert pro_res["is_premium"] is True
        assert pro_res["plan"] == PlanCode.PREMIUM_MONTHLY
        assert free_res["is_premium"] is False
        assert free_res["plan"] == PlanCode.FREE

        invalidate_user_subscription(pro_user)
        invalidate_user_subscription(free_user)

    def test_04_subscription_change_invalidates_cache(self):
        """6: Mutation invalidates cache so subsequent call fetches fresh state."""
        user_id = str(uuid.uuid4())
        set_cached_user_subscription(user_id, {
            "plan": "free",
            "status": "active",
            "is_premium": False,
        })
        assert get_cached_user_subscription(user_id) is not None

        # Invalidate
        invalidate_user_subscription(user_id)
        assert get_cached_user_subscription(user_id) is None

    def test_05_redis_unavailable_falls_back_to_supabase(self):
        """7: If Redis fails or is None, Supabase remains authoritative without HTTP 500."""
        user_id = str(uuid.uuid4())
        mock_sb = MagicMock()
        mock_sb.from_().select().eq().order().execute.return_value = MagicMock(data=[])

        with patch("backend.services.cache_service.get_redis_client", return_value=None):
            with patch("backend.services.subscription_service.get_supabase", return_value=mock_sb):
                res = SubscriptionService.resolve_effective_subscription(user_id)
                assert res["plan"] == PlanCode.FREE
                assert res["is_premium"] is False

    def test_06_user_isolation(self):
        """8: User A cannot read User B's subscription cache."""
        user_a = str(uuid.uuid4())
        user_b = str(uuid.uuid4())

        set_cached_user_subscription(user_a, {"plan": "premium_monthly", "is_premium": True})
        set_cached_user_subscription(user_b, {"plan": "free", "is_premium": False})

        assert get_cached_user_subscription(user_a)["is_premium"] is True
        assert get_cached_user_subscription(user_b)["is_premium"] is False
        assert make_subscription_cache_key(user_a) != make_subscription_cache_key(user_b)

        invalidate_user_subscription(user_a)
        invalidate_user_subscription(user_b)

    def test_07_minimal_safe_data_cached(self):
        """10: Minimal safe data only (no tokens, passwords, payment secrets, or internal DB handles)."""
        user_id = str(uuid.uuid4())
        payload = {
            "plan": "premium_monthly",
            "status": "active",
            "is_premium": True,
            "secret_token": "sk_test_123456",
            "password_hash": "$2b$12$e...",
            "raw_sub": {"internal_db_conn": "postgres://..."},
        }
        set_cached_user_subscription(user_id, payload)
        cached = get_cached_user_subscription(user_id)

        assert "secret_token" not in cached
        assert "password_hash" not in cached
        assert "raw_sub" not in cached
        assert set(cached.keys()).issubset({"plan", "status", "is_premium", "started_at", "expires_at", "cancelled_at"})

        invalidate_user_subscription(user_id)


# =====================================================================
# 2. TECH NEWS CACHE TESTS
# =====================================================================

class TestTechNewsCache:

    def test_01_first_request_miss_second_request_hit(self):
        """1-4: First request misses cache and stores, second request hits cache without DB."""
        invalidate_tech_news_cache()

        mock_sources = [{"id": "src-1", "name": "Google", "is_active": True, "display_order": 1}]
        mock_stories = [{
            "id": "st-1",
            "source_id": "src-1",
            "headline": "Gemini 3 Released",
            "status": "published",
            "visible_from": None,
            "visible_until": None,
            "display_order": 1,
            "published_at": "2026-01-01T00:00:00+00:00",
        }]

        mock_sb = MagicMock()
        mock_query = MagicMock()
        mock_sb.from_.return_value = mock_query
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.side_effect = [
            MagicMock(data=mock_sources),
            MagicMock(data=mock_stories),
        ]

        with patch("backend.services.tech_news_service.get_supabase", return_value=mock_sb):
            # 1st request -> DB called
            res1 = get_student_grouped_tech_news()
            assert len(res1) == 1
            assert res1[0]["name"] == "Google"

        # 2nd request -> Hits cache, Supabase not called!
        mock_sb_empty = MagicMock()
        with patch("backend.services.tech_news_service.get_supabase", return_value=mock_sb_empty):
            res2 = get_student_grouped_tech_news()
            assert len(res2) == 1
            assert res2[0]["name"] == "Google"
            mock_sb_empty.from_.assert_not_called()

        invalidate_tech_news_cache()

    def test_02_mutation_invalidates_cache(self):
        """6: Admin update/publish invalidates tech news cache."""
        set_cached_tech_news_grouped([{"id": "cached_src"}])
        set_cached_tech_news_story("story_123", {"id": "story_123", "title": "Old Title"})

        assert get_cached_tech_news_grouped() is not None
        assert get_cached_tech_news_story("story_123") is not None

        invalidate_tech_news_cache("story_123")

        assert get_cached_tech_news_grouped() is None
        assert get_cached_tech_news_story("story_123") is None

    def test_03_corrupted_json_recovery(self):
        """7: Corrupted JSON is deleted and treated as cache miss without throwing."""
        bad_key = "technews:v1:grouped"
        r = get_redis_client()
        if r:
            r.set(bad_key, "INVALID_CORRUPTED_JSON{{{", ex=60)
        else:
            _in_memory_cache[bad_key] = ("INVALID_CORRUPTED_JSON{{{", time.time() + 60)

        # get_cached_tech_news_grouped should gracefully return None
        res = get_cached_tech_news_grouped()
        assert res is None

        # Verify corrupted key was purged
        if r:
            assert r.get(bad_key) is None

    def test_04_redis_failure_falls_back_to_source(self):
        """8: When Redis is down, tech news queries continue via Supabase."""
        mock_sb = MagicMock()
        mock_query = MagicMock()
        mock_sb.from_.return_value = mock_query
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.side_effect = [
            MagicMock(data=[{"id": "src-2", "name": "Microsoft", "is_active": True, "display_order": 1}]),
            MagicMock(data=[{
                "id": "st-2",
                "source_id": "src-2",
                "headline": "TypeScript 6",
                "status": "published",
                "visible_from": None,
                "visible_until": None,
                "display_order": 1,
            }]),
        ]

        with patch("backend.services.cache_service.get_redis_client", return_value=None):
            with patch("backend.services.tech_news_service.get_supabase", return_value=mock_sb):
                res = get_student_grouped_tech_news()
                assert len(res) == 1
                assert res[0]["name"] == "Microsoft"

    def test_05_deterministic_search_keys(self):
        """9 & 10: Different query parameters generate deterministic separate keys; shared across users."""
        key_all = make_tech_news_grouped_cache_key(None)
        key_ai = make_tech_news_grouped_cache_key("AI Models")
        key_ai2 = make_tech_news_grouped_cache_key("  ai   models  ")
        key_py = make_tech_news_grouped_cache_key("Python")

        assert key_all == "technews:v1:grouped"
        assert key_ai == "technews:v1:search:ai-models"
        assert key_ai2 == "technews:v1:search:ai-models"
        assert key_ai != key_py
        assert "user" not in key_ai  # Shared, NOT user-specific!


# =====================================================================
# 3. EVENT HERO / BANNER CACHE TESTS
# =====================================================================

class TestEventHeroCache:

    def test_01_event_hero_caching_and_retrieval(self):
        """1-3: Event hero cached and retrieved with only allowed public fields."""
        event_id = str(uuid.uuid4())
        mock_event = {
            "id": event_id,
            "event_name": "National Hackathon 2026",
            "conducted_by_college": "IIT Bombay",
            "banner_url": "https://supabase.co/storage/v1/object/public/banners/event.webp",
            "event_link": "https://hackathon.example.com",
            "start_date": "2026-11-01T09:00:00+00:00",
            "end_date": "2026-11-03T18:00:00+00:00",
            "status": "published",
            "is_hackathon": True,
        }

        set_cached_event_hero(event_id, mock_event)
        cached = get_cached_event_hero(event_id)

        assert cached is not None
        assert cached["event_name"] == "National Hackathon 2026"
        assert cached["banner_url"].startswith("https://")

        # Cleanup
        invalidate_event_cache(event_id)
        assert get_cached_event_hero(event_id) is None

    def test_02_featured_events_caching(self):
        """Featured event list cached and returned without database re-query."""
        invalidate_event_cache()

        mock_events = [{
            "id": str(uuid.uuid4()),
            "event_name": "Keynote 2026",
            "status": "published",
            "start_date": "2026-10-15T10:00:00+00:00",
        }]

        mock_sb = MagicMock()
        mock_sb.from_().select().eq().order().execute.return_value = MagicMock(data=mock_events)

        with patch("backend.services.event_service.get_supabase", return_value=mock_sb):
            # 1st call -> misses cache, queries Supabase
            res1 = get_student_events()
            assert len(res1) == 1
            assert res1[0]["event_name"] == "Keynote 2026"

        # 2nd call -> hits cache, avoids Supabase!
        mock_sb_empty = MagicMock()
        with patch("backend.services.event_service.get_supabase", return_value=mock_sb_empty):
            res2 = get_student_events()
            assert len(res2) == 1
            assert res2[0]["event_name"] == "Keynote 2026"
            mock_sb_empty.from_.assert_not_called()

        invalidate_event_cache()

    def test_03_no_binary_data_stored(self):
        """9: Ensures binary image blobs are not stored in Redis."""
        event_id = str(uuid.uuid4())
        mock_event_with_binary = {
            "id": event_id,
            "event_name": "Banner Test",
            "banner_url": "https://cdn.example.com/banner.png",
            "raw_image_blob": b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR",
        }

        set_cached_event_hero(event_id, mock_event_with_binary)
        cached = get_cached_event_hero(event_id)

        assert cached is not None
        assert "raw_image_blob" not in cached
        assert cached["banner_url"] == "https://cdn.example.com/banner.png"

        invalidate_event_cache(event_id)

    def test_04_redis_failure_falls_back_to_db(self):
        """7: When Redis fails, get_student_event_by_id seamlessly falls back to Supabase."""
        event_id = str(uuid.uuid4())
        mock_sb = MagicMock()
        mock_sb.from_().select().eq().eq().execute.return_value = MagicMock(data=[{
            "id": event_id,
            "event_name": "Fallback Event",
            "status": "published",
        }])

        with patch("backend.services.cache_service.get_redis_client", return_value=None):
            with patch("backend.services.event_service.get_supabase", return_value=mock_sb):
                ev = get_student_event_by_id(event_id)
                assert ev is not None
                assert ev["event_name"] == "Fallback Event"


# =====================================================================
# 4. LIVE REDIS INTEGRATION & CLEANUP
# =====================================================================

class TestLiveRedisIntegration:

    def test_live_redis_subscription_crud(self):
        """Live Redis CRUD test for user subscriptions using real Redis instance."""
        r = get_redis_client()
        if not r:
            pytest.skip("Live Redis not configured in environment.")

        test_user = f"test-live-{uuid.uuid4()}"
        key = make_subscription_cache_key(test_user)

        try:
            # 1. Write
            data = {"plan": "premium_monthly", "status": "active", "is_premium": True}
            set_cached_user_subscription(test_user, data, ttl_seconds=60)

            # 2. Read back
            cached = get_cached_user_subscription(test_user)
            assert cached is not None
            assert cached["plan"] == "premium_monthly"
            assert cached["is_premium"] is True

            # 3. Verify TTL
            ttl = r.ttl(key)
            assert 0 < ttl <= 60

            # 4. Delete & Verify
            invalidate_user_subscription(test_user)
            assert get_cached_user_subscription(test_user) is None
            assert r.get(key) is None
        finally:
            r.delete(key)

    def test_live_redis_tech_news_crud(self):
        """Live Redis CRUD test for Tech News using real Redis instance."""
        r = get_redis_client()
        if not r:
            pytest.skip("Live Redis not configured in environment.")

        test_story_id = f"story-{uuid.uuid4()}"
        key = make_tech_news_story_cache_key(test_story_id)

        try:
            # 1. Write
            story_data = {"id": test_story_id, "title": "Live News Item"}
            set_cached_tech_news_story(test_story_id, story_data, ttl_seconds=60)

            # 2. Read
            cached = get_cached_tech_news_story(test_story_id)
            assert cached is not None
            assert cached["title"] == "Live News Item"

            # 3. TTL
            ttl = r.ttl(key)
            assert 0 < ttl <= 60

            # 4. Delete & Verify
            invalidate_tech_news_cache(test_story_id)
            assert get_cached_tech_news_story(test_story_id) is None
        finally:
            r.delete(key)

    def test_live_redis_event_hero_crud(self):
        """Live Redis CRUD test for Event Hero using real Redis instance."""
        r = get_redis_client()
        if not r:
            pytest.skip("Live Redis not configured in environment.")

        test_event_id = f"event-{uuid.uuid4()}"
        key = make_event_hero_cache_key(test_event_id)

        try:
            # 1. Write
            event_data = {"id": test_event_id, "event_name": "Live Event"}
            set_cached_event_hero(test_event_id, event_data, ttl_seconds=60)

            # 2. Read
            cached = get_cached_event_hero(test_event_id)
            assert cached is not None
            assert cached["event_name"] == "Live Event"

            # 3. TTL
            ttl = r.ttl(key)
            assert 0 < ttl <= 60

            # 4. Invalidation
            invalidate_event_cache(test_event_id)
            assert get_cached_event_hero(test_event_id) is None
        finally:
            r.delete(key)
