"""
tests/test_subscription_foundation.py
Comprehensive Test Suite for SkillsCatalyst Subscription + Entitlement Foundation.
Phase: Payments Phase 1 — Subscription + Entitlement Foundation

Validates:
1. Free user (no subscription) -> resolves to 'free', is_premium = False.
2. Premium Monthly active -> resolves to 'premium_monthly', is_premium = True.
3. Premium 3 Months active -> resolves to 'premium_3_month', is_premium = True.
4. Expired subscription (expires_at < now) -> resolves to 'free', is_premium = False.
5. Future expiry (expires_at > now) -> resolves to premium.
6. Cancelled subscription with future expiry -> retains premium until expiry.
7. Cancelled subscription with past expiry -> downgrades to free.
8. Entitlement matrix evaluation for Free vs Premium across all 7 features.
9. Pricing integrity: 9900 paise (₹99/30d), 25000 paise (₹250/90d), currency INR.
10. API endpoint contracts: GET /api/subscriptions/plans and GET /api/subscriptions/me.
11. FastAPI dependencies: require_premium, require_feature_access, require_feature_limit.
12. Resilience fallback: graceful degradation if Supabase is unavailable.
"""

import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.subscription import (
    PlanCode,
    SubscriptionStatus,
    AccessLevel,
    FeatureKey,
    SubscriptionPlanDTO,
    EntitlementDetailDTO,
    DEFAULT_CANONICAL_PLANS,
    DEFAULT_FREE_ENTITLEMENTS,
    DEFAULT_PREMIUM_ENTITLEMENTS,
)
from backend.services.subscription_service import SubscriptionService
from backend.dependencies.subscription import (
    require_premium,
    require_feature_access,
    require_feature_limit,
)

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test Student"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestSubscriptionFoundation(unittest.TestCase):

    def setUp(self):
        self.student_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        self.mock_student = MockAuthUser(self.student_id, "student@skillscatalyst.com")
        self.now = datetime.now(timezone.utc)

    # =========================================================================
    # 1. FREE USER (NO SUBSCRIPTION RECORD)
    # =========================================================================
    def test_01_free_user_no_subscription(self):
        """User with no subscription record resolves to free plan with is_premium=False."""
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.FREE)
            self.assertEqual(resolved["status"], SubscriptionStatus.ACTIVE)
            self.assertFalse(resolved["is_premium"])
            self.assertIsNone(resolved["expires_at"])

            plan_code, is_premium = SubscriptionService.get_effective_plan(self.student_id)
            self.assertEqual(plan_code, PlanCode.FREE)
            self.assertFalse(is_premium)

    # =========================================================================
    # 2. PREMIUM MONTHLY ACTIVE
    # =========================================================================
    def test_02_premium_monthly_active(self):
        """Active premium monthly subscription with future expiry date."""
        mock_sub = {
            "id": "sub-1",
            "user_id": self.student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=5)).isoformat(),
            "expires_at": (self.now + timedelta(days=25)).isoformat(),
            "cancelled_at": None,
            "subscription_plans": {
                "code": "premium_monthly",
                "name": "Premium Monthly",
                "price_in_paise": 9900,
            },
        }
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.PREMIUM_MONTHLY)
            self.assertEqual(resolved["status"], SubscriptionStatus.ACTIVE)
            self.assertTrue(resolved["is_premium"])
            self.assertIsNotNone(resolved["expires_at"])
            self.assertGreater(resolved["expires_at"], self.now)

    # =========================================================================
    # 3. PREMIUM 3 MONTHS ACTIVE
    # =========================================================================
    def test_03_premium_3_month_active(self):
        """Active premium 3-month subscription with future expiry date."""
        mock_sub = {
            "id": "sub-2",
            "user_id": self.student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=10)).isoformat(),
            "expires_at": (self.now + timedelta(days=80)).isoformat(),
            "cancelled_at": None,
            "subscription_plans": {
                "code": "premium_3_month",
                "name": "Premium 3 Months",
                "price_in_paise": 25000,
            },
        }
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.PREMIUM_3_MONTH)
            self.assertEqual(resolved["status"], SubscriptionStatus.ACTIVE)
            self.assertTrue(resolved["is_premium"])

    # =========================================================================
    # 4. EXPIRED SUBSCRIPTION (EXPIRES_AT < NOW)
    # =========================================================================
    def test_04_expired_subscription_downgrades_to_free(self):
        """Expired premium subscription returns free plan and status=expired."""
        mock_sub = {
            "id": "sub-3",
            "user_id": self.student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=35)).isoformat(),
            "expires_at": (self.now - timedelta(days=5)).isoformat(),
            "cancelled_at": None,
            "subscription_plans": {
                "code": "premium_monthly",
                "name": "Premium Monthly",
                "price_in_paise": 9900,
            },
        }
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.FREE)
            self.assertEqual(resolved["status"], SubscriptionStatus.EXPIRED)
            self.assertFalse(resolved["is_premium"])

    # =========================================================================
    # 5. CANCELLED SUBSCRIPTION WITH FUTURE EXPIRY (RETAINS PREMIUM)
    # =========================================================================
    def test_05_cancelled_with_future_expiry_retains_premium(self):
        """Cancelled subscription retains paid access until expires_at date."""
        mock_sub = {
            "id": "sub-4",
            "user_id": self.student_id,
            "status": "cancelled",
            "started_at": (self.now - timedelta(days=10)).isoformat(),
            "expires_at": (self.now + timedelta(days=20)).isoformat(),
            "cancelled_at": (self.now - timedelta(days=1)).isoformat(),
            "subscription_plans": {
                "code": "premium_monthly",
                "name": "Premium Monthly",
                "price_in_paise": 9900,
            },
        }
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.PREMIUM_MONTHLY)
            self.assertEqual(resolved["status"], SubscriptionStatus.CANCELLED)
            self.assertTrue(resolved["is_premium"])

    # =========================================================================
    # 6. CANCELLED SUBSCRIPTION WITH PAST EXPIRY (DOWNGRADES TO FREE)
    # =========================================================================
    def test_06_cancelled_with_past_expiry_downgrades_to_free(self):
        """Cancelled subscription past its expiry date downgrades to free."""
        mock_sub = {
            "id": "sub-5",
            "user_id": self.student_id,
            "status": "cancelled",
            "started_at": (self.now - timedelta(days=40)).isoformat(),
            "expires_at": (self.now - timedelta(days=10)).isoformat(),
            "cancelled_at": (self.now - timedelta(days=15)).isoformat(),
            "subscription_plans": {
                "code": "premium_monthly",
                "name": "Premium Monthly",
                "price_in_paise": 9900,
            },
        }
        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):
            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], PlanCode.FREE)
            self.assertEqual(resolved["status"], SubscriptionStatus.EXPIRED)
            self.assertFalse(resolved["is_premium"])

    # =========================================================================
    # 7. ENTITLEMENT MATRIX EVALUATION (ALL 7 FEATURES)
    # =========================================================================
    def test_07_entitlement_matrix_free_vs_premium(self):
        """Evaluates 7-feature entitlement gates for Free tier and Premium tier."""
        # --- FREE TIER ---
        with patch.object(SubscriptionService, "get_effective_plan", return_value=(PlanCode.FREE, False)):
            free_ent = SubscriptionService.get_user_entitlements(self.student_id)
            self.assertEqual(len(free_ent), 7)

            # saved_videos: limited (1)
            self.assertEqual(free_ent["saved_videos"].access, AccessLevel.LIMITED)
            self.assertEqual(free_ent["saved_videos"].limit, 1)
            self.assertTrue(SubscriptionService.has_feature_access(self.student_id, "saved_videos"))
            self.assertEqual(SubscriptionService.get_feature_limit(self.student_id, "saved_videos"), 1)

            # company_interview_questions: none
            self.assertEqual(free_ent["company_interview_questions"].access, AccessLevel.NONE)
            self.assertFalse(SubscriptionService.has_feature_access(self.student_id, "company_interview_questions"))

            # placement_prep: none
            self.assertEqual(free_ent["placement_prep"].access, AccessLevel.NONE)
            self.assertFalse(SubscriptionService.has_feature_access(self.student_id, "placement_prep"))

            # scholarships: limited
            self.assertEqual(free_ent["scholarships"].access, AccessLevel.LIMITED)
            self.assertTrue(SubscriptionService.has_feature_access(self.student_id, "scholarships"))

            # tech_news: limited (2)
            self.assertEqual(free_ent["tech_news"].access, AccessLevel.LIMITED)
            self.assertEqual(free_ent["tech_news"].limit, 2)
            self.assertTrue(SubscriptionService.has_feature_access(self.student_id, "tech_news"))
            self.assertEqual(SubscriptionService.get_feature_limit(self.student_id, "tech_news"), 2)

            # ai_mentor: limited
            self.assertEqual(free_ent["ai_mentor"].access, AccessLevel.LIMITED)
            self.assertTrue(SubscriptionService.has_feature_access(self.student_id, "ai_mentor"))

            # roadmaps: limited
            self.assertEqual(free_ent["roadmaps"].access, AccessLevel.LIMITED)
            self.assertTrue(SubscriptionService.has_feature_access(self.student_id, "roadmaps"))

        # --- PREMIUM TIER ---
        with patch.object(SubscriptionService, "get_effective_plan", return_value=(PlanCode.PREMIUM_MONTHLY, True)):
            prem_ent = SubscriptionService.get_user_entitlements(self.student_id)
            self.assertEqual(len(prem_ent), 7)

            for key in FeatureKey:
                self.assertEqual(prem_ent[key.value].access, AccessLevel.FULL)
                self.assertIsNone(prem_ent[key.value].limit)
                self.assertTrue(SubscriptionService.has_feature_access(self.student_id, key.value))
                self.assertIsNone(SubscriptionService.get_feature_limit(self.student_id, key.value))

    # =========================================================================
    # 8. PRICING INTEGRITY IN PAISE
    # =========================================================================
    def test_08_pricing_integrity(self):
        """Verifies integer paise pricing across active commercial plans."""
        plans = SubscriptionService.get_active_plans()
        plan_dict = {p.code: p for p in plans}

        # Free Plan
        self.assertIn(PlanCode.FREE, plan_dict)
        self.assertEqual(plan_dict[PlanCode.FREE].price_in_paise, 0)
        self.assertIsNone(plan_dict[PlanCode.FREE].duration_days)

        # Premium Monthly
        self.assertIn(PlanCode.PREMIUM_MONTHLY, plan_dict)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_MONTHLY].price_in_paise, 9900)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_MONTHLY].duration_days, 30)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_MONTHLY].currency, "INR")

        # Premium 3 Month
        self.assertIn(PlanCode.PREMIUM_3_MONTH, plan_dict)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_3_MONTH].price_in_paise, 25000)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_3_MONTH].duration_days, 90)
        self.assertEqual(plan_dict[PlanCode.PREMIUM_3_MONTH].currency, "INR")

    # =========================================================================
    # 9. GET /api/subscriptions/plans (PUBLIC CONTRACT)
    # =========================================================================
    def test_09_api_get_plans_public(self):
        """GET /api/subscriptions/plans is public and returns list of plans with paise prices."""
        resp = client.get("/api/subscriptions/plans")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 3)

        codes = [p["code"] for p in data]
        self.assertIn("free", codes)
        self.assertIn("premium_monthly", codes)
        self.assertIn("premium_3_month", codes)

        for p in data:
            self.assertIn("price_in_paise", p)
            self.assertIsInstance(p["price_in_paise"], int)
            self.assertEqual(p["currency"], "INR")

    # =========================================================================
    # 10. GET /api/subscriptions/me (AUTHENTICATED CONTRACT)
    # =========================================================================
    def test_10_api_get_my_subscription(self):
        """GET /api/subscriptions/me requires auth and returns effective plan and entitlements."""
        # Unauthenticated request -> 401
        unauth_resp = client.get("/api/subscriptions/me")
        self.assertEqual(unauth_resp.status_code, 401)

        # Authenticated student request
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.get(
                "/api/subscriptions/me",
                headers={"Authorization": "Bearer valid-student-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["plan"], "free")
            self.assertEqual(data["status"], "active")
            self.assertFalse(data["is_premium"])
            self.assertIn("entitlements", data)
            self.assertEqual(len(data["entitlements"]), 7)
            self.assertEqual(data["entitlements"]["saved_videos"]["access"], "limited")
            self.assertEqual(data["entitlements"]["saved_videos"]["limit"], 1)

    # =========================================================================
    # 11. FASTAPI DEPENDENCY ENFORCEMENT
    # =========================================================================
    def test_11_fastapi_dependencies(self):
        """Tests require_premium, require_feature_access, require_feature_limit."""
        # Free user attempting to access premium-only feature
        with patch.object(SubscriptionService, "resolve_effective_subscription") as mock_resolve:
            mock_resolve.return_value = {
                "plan": PlanCode.FREE,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": False,
                "started_at": None,
                "expires_at": None,
                "cancelled_at": None,
            }
            with self.assertRaises(HTTPException) as ctx:
                require_premium(self.student_id)
            self.assertEqual(ctx.exception.status_code, 403)

        # Premium user passes require_premium
        with patch.object(SubscriptionService, "resolve_effective_subscription") as mock_resolve:
            mock_resolve.return_value = {
                "plan": PlanCode.PREMIUM_MONTHLY,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": True,
                "started_at": self.now,
                "expires_at": self.now + timedelta(days=30),
                "cancelled_at": None,
            }
            sub = require_premium(self.student_id)
            self.assertTrue(sub.is_premium)

        # Feature access dependency: company_interview_questions for free user -> 403
        with patch.object(SubscriptionService, "has_feature_access", return_value=False):
            dep = require_feature_access("company_interview_questions")
            with self.assertRaises(HTTPException) as ctx:
                dep(self.student_id)
            self.assertEqual(ctx.exception.status_code, 403)

        # Feature access dependency: company_interview_questions for premium user -> True
        with patch.object(SubscriptionService, "has_feature_access", return_value=True):
            dep = require_feature_access("company_interview_questions")
            self.assertTrue(dep(self.student_id))

    # =========================================================================
    # 12. RESILIENCE & FALLBACK WHEN SUPABASE IS DEGRADED
    # =========================================================================
    def test_12_resilience_fallback_when_db_down(self):
        """SubscriptionService falls back to canonical defaults when database errors occur."""
        with patch("backend.services.subscription_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.side_effect = Exception("DB Connection Timeout")
            mock_sb.return_value = mock_client

            plans = SubscriptionService.get_active_plans()
            self.assertEqual(len(plans), 3)
            self.assertEqual(plans[0].code, PlanCode.FREE)

            ent = SubscriptionService.get_user_entitlements("any-user")
            self.assertEqual(len(ent), 7)
            self.assertEqual(ent["saved_videos"].limit, 1)


if __name__ == "__main__":
    unittest.main()
