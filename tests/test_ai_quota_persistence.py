"""
tests/test_ai_quota_persistence.py
Comprehensive test suite for BUG-E-1: AI Mentor Usage Quota Persistence across
backend restarts, multi-worker deployments, concurrency, and billing periods.
Verifies fail-closed storage safety, idempotent reservation/refund lifecycles,
and non-blind timeout refunds.
"""

import sys
import unittest
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch
import redis

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import HTTPException
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
    commit_ai_mentor_reservation,
    release_ai_mentor_slot,
    increment_ai_mentor_usage,
    reset_ai_mentor_usage,
    make_quota_key,
    get_ai_mentor_billing_period,
    QuotaStorageUnavailableError,
    QuotaReservationResult,
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
    Exercises live Redis, fail-closed safety, simulated restarts,
    multi-worker environments, idempotency, and high-concurrency race conditions.
    """

    def setUp(self):
        self.user_id = "e1111111-1111-4111-a111-111111111111"
        self.premium_user_id = "e2222222-2222-4222-a222-222222222222"
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

        # 1st request
        res1 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res1.allowed)
        self.assertEqual(res1.count, 1)
        self.assertIsNotNone(res1.reservation_id)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 1)

        # 2nd request
        res2 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res2.allowed)
        self.assertEqual(res2.count, 2)
        self.assertIsNotNone(res2.reservation_id)
        self.assertNotEqual(res1.reservation_id, res2.reservation_id)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 2)

        # 3rd request
        res3 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res3.allowed)
        self.assertEqual(res3.count, 3)
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
        res3 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(res3.allowed)
        self.assertEqual(res3.count, 2)
        self.assertIsNone(res3.reservation_id)

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

        # Simulate backend restart: Wipe in-memory fallback store entirely
        from backend.services.ai_mentor_quota_service import _fallback_quota_store
        _fallback_quota_store._counts.clear()
        _fallback_quota_store._reservations.clear()

        # New worker starts up after reboot: reads usage from persistent storage
        restarted_usage = get_ai_mentor_usage(self.user_id, self.period)
        self.assertEqual(restarted_usage, 3, "Usage must persist across backend restarts!")

        # New worker consumes 4th slot
        res4 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res4.allowed)
        self.assertEqual(res4.count, 4)

        # 5th slot
        res5 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res5.allowed)
        self.assertEqual(res5.count, 5)

        # 6th slot blocked
        res6 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(res6.allowed)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 5)

    # =========================================================================
    # 4. Shared Quota Across Simulated Workers
    # =========================================================================
    def test_04_shared_quota_across_simulated_workers(self):
        """Multiple backend workers must share identical usage counts."""
        limit = 3

        # Worker 1 reserves slot 1
        res1 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res1.allowed)
        self.assertEqual(res1.count, 1)

        # Worker 2 queries usage: immediately sees 1
        w2_usage = get_ai_mentor_usage(self.user_id, self.period)
        self.assertEqual(w2_usage, 1)

        # Worker 2 reserves slot 2
        res2 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res2.allowed)
        self.assertEqual(res2.count, 2)

        # Worker 3 reserves slot 3
        res3 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res3.allowed)
        self.assertEqual(res3.count, 3)

        # Worker 1 attempts slot 4: rejected!
        res4 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertFalse(res4.allowed)
        self.assertEqual(res4.count, 3)

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
        allowed_count = sum(1 for res in results if res.allowed)
        rejected_count = sum(1 for res in results if not res.allowed)

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
        res_oct = reserve_ai_mentor_slot(self.user_id, limit, period_current)
        self.assertFalse(res_oct.allowed)

        # In 2026-11, usage starts clean at 0
        self.assertEqual(get_ai_mentor_usage(self.user_id, period_next), 0)

        # User can consume quota in 2026-11
        res_nov = reserve_ai_mentor_slot(self.user_id, limit, period_next)
        self.assertTrue(res_nov.allowed)
        self.assertEqual(res_nov.count, 1)
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
            self.assertEqual(get_ai_mentor_usage(self.premium_user_id, self.period), 0)

    # =========================================================================
    # 8. Storage Failure Safety — Production Mode (Fail Closed)
    # =========================================================================
    def test_08_redis_unconfigured_in_production_mode_fails_closed(self):
        """In production mode, Redis outages raise controlled 503 QUOTA_UNAVAILABLE, never granting silent quota."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")

        with patch("backend.services.ai_mentor_quota_service.ALLOW_IN_MEMORY_QUOTA_FALLBACK", False), \
             patch("backend.services.ai_mentor_quota_service.get_redis_client", return_value=None), \
             patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=3)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            # Direct call raises QuotaStorageUnavailableError
            with self.assertRaises(QuotaStorageUnavailableError):
                reserve_ai_mentor_slot(self.user_id, limit=3, period=self.period)

            # API endpoint returns controlled HTTP 503
            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Explain binary search"},
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 503)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "QUOTA_UNAVAILABLE")
            self.assertEqual(data["feature"], "ai_mentor")

    def test_08b_redis_unavailable_during_reservation_fails_closed(self):
        """Redis network exceptions during reservation return controlled 503."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        mock_redis = MagicMock()
        mock_redis.eval.side_effect = redis.ConnectionError("Redis connection refused")

        with patch("backend.services.ai_mentor_quota_service.ALLOW_IN_MEMORY_QUOTA_FALLBACK", False), \
             patch("backend.services.ai_mentor_quota_service.get_redis_client", return_value=mock_redis), \
             patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
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
            self.assertEqual(resp.status_code, 503)
            self.assertEqual(resp.json()["detail"]["code"], "QUOTA_UNAVAILABLE")

    def test_08c_redis_unavailable_during_refund_handled_safely(self):
        """Redis network failure during quota refund logs safely and returns False without crashing."""
        mock_redis = MagicMock()
        mock_redis.eval.side_effect = redis.TimeoutError("Redis socket read timeout")

        with patch("backend.services.ai_mentor_quota_service.get_redis_client", return_value=mock_redis):
            result = release_ai_mentor_slot(self.user_id, "res_fake_id", self.period)
            self.assertFalse(result)

    # =========================================================================
    # 9. Idempotent Reservation State Machine & Duplicate Refund Prevention
    # =========================================================================
    def test_09_duplicate_refund_attempts_idempotent(self):
        """A reservation can be released at-most-once. Duplicate release attempts are rejected."""
        limit = 3
        res1 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res1.allowed)
        self.assertEqual(res1.count, 1)
        r_id1 = res1.reservation_id

        # 1st release attempt: succeeds and decrements count to 0
        ok1 = release_ai_mentor_slot(self.user_id, r_id1, self.period)
        self.assertTrue(ok1)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        # 2nd release attempt with same reservation_id: rejected! Count does NOT decrement!
        ok2 = release_ai_mentor_slot(self.user_id, r_id1, self.period)
        self.assertFalse(ok2, "Duplicate refund must be rejected")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        # Now make a new reservation (res2)
        res2 = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res2.allowed)
        self.assertEqual(res2.count, 1)
        r_id2 = res2.reservation_id

        # Attempt to refund using the old r_id1 again: MUST NOT affect res2!
        ok_stale = release_ai_mentor_slot(self.user_id, r_id1, self.period)
        self.assertFalse(ok_stale)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 1, "Stale reservation refund must not decrement res2")

        # Cleanup res2
        release_ai_mentor_slot(self.user_id, r_id2, self.period)

    def test_09b_committed_reservation_cannot_be_refunded(self):
        """Once committed after successful AI generation, reservation cannot be refunded."""
        limit = 3
        res = reserve_ai_mentor_slot(self.user_id, limit, self.period)
        self.assertTrue(res.allowed)
        self.assertEqual(res.count, 1)

        # Commit reservation upon success
        committed = commit_ai_mentor_reservation(self.user_id, res.reservation_id, self.period)
        self.assertTrue(committed)

        # Late refund attempt: rejected!
        refunded = release_ai_mentor_slot(self.user_id, res.reservation_id, self.period)
        self.assertFalse(refunded)
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 1, "Committed reservation count must remain 1")

    # =========================================================================
    # 10. AI Provider Failures vs Uncertain Timeouts
    # =========================================================================
    def test_10_ai_provider_error_refunds_reservation(self):
        """When LLM provider explicitly returns error message, reservation is refunded."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

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
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

    def test_10b_provider_hard_deadline_timeout_does_not_blindly_refund(self):
        """Hard ceiling provider timeouts have uncertain completion and must NOT be refunded."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        timeout_exc = HTTPException(
            status_code=503,
            detail={
                "success": False,
                "message": "AI Mentor service is currently experiencing high load.",
                "detail": "AI request exceeded hard deadline (25.0s)",
            },
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.run_bounded_ai_call", side_effect=timeout_exc), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=3)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Heavy prompt that timed out at 25s"},
                headers={"Authorization": "Bearer valid-token"},
            )
            self.assertEqual(resp.status_code, 503)

            # Quota is retained to prevent abuse on ambiguous provider completions
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 1)

    def test_10c_concurrency_acquire_timeout_does_refund(self):
        """When local concurrency semaphore acquire times out, provider was never touched -> safe to refund."""
        mock_user = MockAuthUser(self.user_id, "user@test.com")
        self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

        acquire_exc = HTTPException(
            status_code=503,
            detail={
                "success": False,
                "message": "AI Mentor service is currently experiencing high load.",
                "detail": "AI concurrency limit reached (acquire timeout 5.0s)",
            },
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.run_bounded_ai_call", side_effect=acquire_exc), \
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
            self.assertEqual(resp.status_code, 503)

            # Safe refund: usage remains 0 because request never reached Groq
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

    # =========================================================================
    # 11. Off-Topic Prompts Do Not Consume Quota
    # =========================================================================
    def test_11_offtopic_prompt_does_not_consume_quota(self):
        """Off-topic prompt redirect returns early without charging user quota."""
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
            self.assertEqual(get_ai_mentor_usage(self.user_id, self.period), 0)

    # =========================================================================
    # 12. Permitted Offline Fallback Mode
    # =========================================================================
    def test_12_explicit_offline_fallback_mode_with_stateful_reservations(self):
        """When in-memory fallback is explicitly allowed, reservation state machine works thread-safely."""
        with patch("backend.services.ai_mentor_quota_service.ALLOW_IN_MEMORY_QUOTA_FALLBACK", True), \
             patch("backend.services.ai_mentor_quota_service.get_redis_client", return_value=None):

            fb_user = "offline-fallback-user-1"
            reset_ai_mentor_usage(fb_user, self.period)

            # Reserve slot 1
            res1 = reserve_ai_mentor_slot(fb_user, 2, self.period)
            self.assertTrue(res1.allowed)
            self.assertEqual(res1.count, 1)

            # Duplicate release rejected
            self.assertTrue(release_ai_mentor_slot(fb_user, res1.reservation_id, self.period))
            self.assertFalse(release_ai_mentor_slot(fb_user, res1.reservation_id, self.period))
            self.assertEqual(get_ai_mentor_usage(fb_user, self.period), 0)

            # Commit lifecycle in fallback
            res2 = reserve_ai_mentor_slot(fb_user, 2, self.period)
            self.assertTrue(commit_ai_mentor_reservation(fb_user, res2.reservation_id, self.period))
            self.assertFalse(release_ai_mentor_slot(fb_user, res2.reservation_id, self.period))
            self.assertEqual(get_ai_mentor_usage(fb_user, self.period), 1)


if __name__ == "__main__":
    unittest.main()
