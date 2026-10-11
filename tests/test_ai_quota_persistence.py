"""
tests/test_ai_quota_persistence.py
Test suite for BUG-E-1: AI Mentor Usage Quota Persistence across
backend restarts, multi-worker deployments, concurrency, and billing periods.
"""

import sys
import unittest
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.subscription import (
    AccessLevel,
    FeatureKey,
    EntitlementDetailDTO,
    PlanCode,
    SubscriptionStatus,
)
from backend.services.subscription_service import SubscriptionService
from backend.services.ai_mentor_quota_service import (
    get_ai_mentor_usage,
    reserve_ai_mentor_slot,
    release_ai_mentor_slot,
    increment_ai_mentor_usage,
    reset_ai_mentor_usage,
    make_quota_key,
    get_ai_mentor_billing_period,
    InMemoryQuotaStore,
)
from backend.services.groq_service import _AI_UNAVAILABLE_MSG

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test Student"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestAIMentorQuotaPersistence(unittest.TestCase):
    """
    Validates persistent, atomic, shared AI Mentor quota tracking.
    Exercises live Redis (with fallback tests), simulated restarts,
    multi-worker environments, and high-concurrency race conditions.
    """

    def setUp(self):
        self.user_id = "test-user-e1-1111-2222-333344445555"
        self.premium_user_id = "test-prem-e1-9999-8888-777766665555"
        self.period = "2026-10"
        reset_ai_mentor_usage(self.user_id, self.period)
        reset_ai_mentor_usage(self.premium_user_id, self.period)

    def tearDown(self):
        reset_ai_mentor_usage(self.user_id, self.period)
        reset_ai_mentor_usage(self.premium_user_id, self.period)

    # =========================================================================
    # 1. Normal Free-Tier Quota Consumption
    # =========================================================================
    def test_01_normal_free_tier_quota_consumption(self):
        """Valid requests increment persistent quota count until limit is reached."""
        limit = 3
        entitlement = EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=limit)

        with patch("backend.routers.ai_mentor.chat_with_groq", return_value="Here is python explanation."):
            # 1st request
            ok1, c1 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
            self.assertTrue(ok1)
            self.assertEqual(c1, 1)
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 1)

            # 2nd request
            ok2, c2 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
            self.assertTrue(ok2)
            self.assertEqual(c2, 2)
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 2)

            # 3rd request
            ok3, c3 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
            self.assertTrue(ok3)
            self.assertEqual(c3, 3)
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 3)

    # =========================================================================
    # 2. Requests Blocked After Quota Exhausted
    # =========================================================================
    def test_02_requests_blocked_after_quota_exhausted(self):
        """Once limit is reached, subsequent chat and resume requests receive 403 LIMIT_REACHED."""
        limit = 2
        # Exhaust quota
        reserve_ai_mentor_slot(self.user_id, limit, self.period)
        reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 2)

        # 3rd reservation attempt is blocked
        ok, count = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(ok)
        self.assertEqual(count, 2)

        # Test through chat endpoint with limit=2
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq") as mock_groq, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=2)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Explain merge sort in Python"},
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 403)
            detail = resp.json()["detail"]
            self.assertEqual(detail["code"], "LIMIT_REACHED")
            self.assertEqual(detail["feature"], "ai_mentor")
            self.assertEqual(detail["limit"], 2)
            mock_groq.assert_not_called()

            # Test through resume review endpoint
            resume_resp = client.post(
                "/api/ai-mentor/review-resume",
                json={
                    "resume_text": "Experienced Python Engineer with over five years building distributed scalable backend systems.",
                    "target_role": "Backend Developer",
                },
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resume_resp.status_code, 403)
            self.assertEqual(resume_resp.json()["detail"]["code"], "LIMIT_REACHED")

    # =========================================================================
    # 3. Backend Restart Persistence
    # =========================================================================
    def test_03_backend_restart_persistence(self):
        """Simulated server restart (heap clear) must NOT reset persistent quota."""
        limit = 5
        # Worker 1 consumes 3 requests
        reserve_ai_mentor_slot(self.user_id, limit, self.period)
        reserve_ai_mentor_slot(self.user_id, limit, self.period)
        reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 3)

        # Simulate backend restart:
        # Wipe in-memory fallback store entirely
        from backend.services.ai_mentor_quota_service import _fallback_quota_store
        _fallback_quota_store._counts.clear()

        # New worker starts up after reboot: reads usage from persistent storage
        restarted_usage = get_ai_mentor_usage(self.user_id, self.period)
        self.assertEqual(restarted_usage, 3, "Usage must persist across backend restarts!")

        # New worker consumes 4th slot
        ok, c = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(ok)
        self.assertEqual(c, 4)

        # 5th slot
        ok, c = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(ok)
        self.assertEqual(c, 5)

        # 6th slot blocked
        ok, c = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(ok)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 5)

    # =========================================================================
    # 4. Shared Quota Across Simulated Workers
    # =========================================================================
    def test_04_shared_quota_across_simulated_workers(self):
        """Multiple backend workers must share identical usage counts."""
        limit = 3

        # Worker 1 reserves slot 1
        ok1, c1 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(ok1)
        self.assertEqual(c1, 1)

        # Worker 2 queries usage: immediately sees 1
        w2_usage = get_ai_mentor_usage(self.user_id, self.period)
        self.assertEqual(w2_usage, 1)

        # Worker 2 reserves slot 2
        ok2, c2 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(ok2)
        self.assertEqual(c2, 2)

        # Worker 3 reserves slot 3
        ok3, c3 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(ok3)
        self.assertEqual(c3, 3)

        # Worker 1 attempts slot 4: rejected!
        ok4, c4 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(ok4)
        self.assertEqual(c4, 3)

    # =========================================================================
    # 5. Concurrent Requests Near Quota Limit
    # =========================================================================
    def test_05_concurrent_requests_near_quota_limit(self):
        """Concurrent requests arriving simultaneously must never exceed quota."""
        limit = 5
        # Set usage to 4 (exactly 1 slot remaining)
        for _ in range(4):
            reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 4)

        # Fire 10 concurrent requests at the same instant
        results = []
        def make_concurrent_call():
            return reserve_ai_mentor_slot(self.user_id, limit, self.period)

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_concurrent_call) for _ in range(10)]
            for f in as_completed(futures):
                results.append(f.result())

        # Exactly 1 request should have succeeded, exactly 9 should have failed
        allowed_count = sum(1 for ok, _ in results if ok)
        rejected_count = sum(1 for ok, _ in results if not ok)

        self.assertEqual(allowed_count, 1, "Exactly one concurrent request must win the last slot")
        self.assertEqual(rejected_count, 9, "Remaining 9 concurrent requests must be rejected")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 5, "Total usage must equal limit, never exceed")

    # =========================================================================
    # 6. Monthly Reset Behavior
    # =========================================================================
    def test_06_monthly_reset_behavior(self):
        """Usage in previous billing period does NOT block requests in new billing period."""
        limit = 3
        period_current = "2026-10"
        period_next = "2026-11"

        # Exhaust quota in 2026-10
        for _ in range(limit):
            reserve_ai_mentor_slot(self.user_id, limit, period_current)
        self.assertEqual(get_ai_mentor_usage(self.user_id, period_current), 3)

        # Verify blocked in 2026-10
        ok_oct, _ = reserve_ai_mentor_slot(self.user_id, limit, period_current)
        self.assertFalse(ok_oct)

        # In 2026-11, usage starts clean at 0
        self.assertEqual(get_ai_mentor_usage(self.user_id, period_next), 0)

        # User can consume quota in 2026-11
        ok_nov, count_nov = reserve_ai_mentor_slot(self.user_id, limit, period_next)
        self.assertTrue(ok_nov)
        self.assertEqual(count_nov, 1)
        self.assertEqual(get_ai_mentor_usage(self.user_id, period_next), 1)

        # 2026-10 count remains preserved at 3
        self.assertEqual(get_ai_mentor_usage(self.user_id, period_current), 3)

        # Cleanup
        reset_ai_mentor_usage(self.user_id, period_next)

    # =========================================================================
    # 7. Premium Entitlement Behavior
    # =========================================================================
    def test_07_premium_entitlement_unlimited(self):
        """Premium users with limit=None bypass quota checks and have unlimited access."""
        mock_user = MockAuthUser(self.premium_user_id, "prem@test.com")
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_user_id,
            "status": "active",
            "started_at": "2026-09-01T00:00:00Z",
            "expires_at": "2026-12-01T00:00:00Z",
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value="Premium answer") as mock_groq, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            for i in range(10):
                resp = client.post(
                    "/api/ai-mentor/chat",
                    json={"prompt": f"System design question {i}"},
                    headers={"Authorization": "Bearer prem-token"},
                )
                self.assertEqual(resp.status_code, 200)
                self.assertEqual(resp.json()["reply"], "Premium answer")

            self.assertEqual(mock_groq.call_count, 10)
            # Premium users do not consume limited quota keys
            self.assertEqual(get_ai_mentor_usage(self.premium_user_id, self.period), 0)

    # =========================================================================
    # 8. Unavailable Quota Storage Graceful Fallback
    # =========================================================================
    def test_08_unavailable_quota_storage_graceful_fallback(self):
        """When Redis is unreachable, system falls back to in-memory store without 500 error."""
        with patch("backend.services.ai_mentor_quota_service.get_redis_client", return_value=None):
            fb_user = "fallback-user-isolated"
            reset_ai_mentor_usage(fb_user, self.period)

            self.assertEqual(get_ai_mentor_usage(fb_user, self.period), 0)

            # Slot 1 succeeds
            ok1, c1 = reserve_ai_mentor_slot(fb_user, 2, self.period)
            self.assertTrue(ok1)
            self.assertEqual(c1, 1)

            # Slot 2 succeeds
            ok2, c2 = reserve_ai_mentor_slot(fb_user, 2, self.period)
            self.assertTrue(ok2)
            self.assertEqual(c2, 2)

            # Slot 3 blocked (enforces limit safely in fallback mode)
            ok3, c3 = reserve_ai_mentor_slot(fb_user, 2, self.period)
            self.assertFalse(ok3)
            self.assertEqual(c3, 2)

            # Release slot
            rel = release_ai_mentor_slot(fb_user, self.period)
            self.assertEqual(rel, 1)
            self.assertEqual(get_ai_mentor_usage(fb_user, self.period), 1)

    # =========================================================================
    # 9. AI Provider Errors and Retries (Failure Compensation)
    # =========================================================================
    def test_09_ai_provider_error_does_not_consume_quota(self):
        """When LLM provider fails, reserved quota slot is refunded and not charged."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        # 1. Chat provider returns _AI_UNAVAILABLE_MSG
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value=_AI_UNAVAILABLE_MSG), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=3)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Explain binary search"},
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["reply"], _AI_UNAVAILABLE_MSG)

            # Usage must be refunded: count remains 0!
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        # 2. Resume review provider returns 502 Bad Gateway
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value=_AI_UNAVAILABLE_MSG), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=3)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/review-resume",
                json={
                    "resume_text": "Experienced Python Engineer with over five years building distributed scalable backend systems.",
                    "target_role": "SWE",
                },
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 502)

            # Usage must be refunded: count remains 0!
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

    # =========================================================================
    # 10. Off-Topic Prompts Do Not Consume Quota
    # =========================================================================
    def test_10_offtopic_prompt_does_not_consume_quota(self):
        """Off-topic prompt redirect must return early without charging user quota."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq") as mock_groq, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=3)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Who is your favorite movie actor?"},
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertIn("SkillsCatalyst", resp.json()["reply"])
            mock_groq.assert_not_called()

            # Quota was NOT charged
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)


if __name__ == "__main__":
    unittest.main()
