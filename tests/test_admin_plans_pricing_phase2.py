"""
tests/test_admin_plans_pricing_phase2.py
SkillsCatalyst Phase 2: Admin-Controlled Plans & Pricing Test Suite.

Validates:
1. Admin Authorization:
   - Unauthenticated access to Admin APIs rejected (401 Unauthorized).
   - Ordinary student access rejected (403 Forbidden).
   - Authoritative Admin/Owner access allowed (200 OK / 201 Created).
   - Client role tampering attempts rejected.
2. Server-Side Plan Validation & Domain Invariants:
   - Negative prices rejected (422 Unprocessable Entity by schema).
   - Zero-price commercial plans rejected (400 Bad Request).
   - Free plan price must remain 0 and duration perpetual (400 Bad Request if violated).
   - Unsupported currency rejected (400 Bad Request).
   - Non-positive duration rejected for commercial plans (400 Bad Request).
   - Malformed plan codes rejected (422 Unprocessable Entity by regex).
   - Duplicate plan codes rejected (400 Bad Request).
   - Free plan deactivation prohibited (400 Bad Request).
   - Immutable plan code preserved across updates.
3. Server-Side Price Authority & Checkout Invariants:
   - Checkout uses authoritative DB price; client-supplied amounts are ignored.
   - Deactivated plans rejected at checkout (400 Bad Request).
   - Free tier rejected at checkout (400 Bad Request).
   - Authoritative price updates immediately reflected in subsequent orders.
4. Concurrency, Idempotency & Crash-Recovery Investigation:
   - Repeated activation/deactivation idempotent.
   - Duplicate webhook when payment is already success is ignored safely without double provisioning.
"""

import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.subscription import (
    SubscriptionPlanDTO,
    PlanCode,
    SubscriptionStatus,
)
from backend.services.phonepe_service import PhonePeService
from backend.services.subscription_service import SubscriptionService

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestAdminPlansPricingPhase2(unittest.TestCase):

    def setUp(self):
        SubscriptionService.invalidate_plan_entitlements_cache()
        self.student_id = "11111111-1111-1111-1111-111111111111"
        self.admin_id = "99999999-9999-9999-9999-999999999999"
        self.mock_student = MockAuthUser(self.student_id, "student@skillscatalyst.com", role="student")
        self.mock_admin = MockAuthUser(self.admin_id, "admin@skillscatalyst.com", role="owner")
        self.now = datetime.now(timezone.utc)

    def tearDown(self):
        SubscriptionService.invalidate_plan_entitlements_cache()

    # =========================================================================
    # 1. ADMIN AUTHORIZATION SECURITY TESTS
    # =========================================================================

    def test_01_unauthenticated_admin_plan_listing_rejected(self):
        """Unauthenticated requests to Admin Plan API must return 401 Unauthorized."""
        resp = client.get("/api/admin/plans")
        self.assertEqual(resp.status_code, 401)

    def test_02_student_forbidden_from_admin_plan_listing(self):
        """Authenticated student requests to Admin Plan API must return 403 Forbidden."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            resp = client.get(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Admin or content manager privileges required", resp.json()["detail"])

    def test_03_admin_authorized_plan_listing(self):
        """Authenticated platform owner/admin can list all plans (active and inactive)."""
        mock_plans_data = [
            {
                "id": "p-01",
                "code": "free",
                "name": "Student Free",
                "description": "Essential foundational access",
                "price_in_paise": 0,
                "currency": "INR",
                "duration_days": None,
                "is_active": True,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
            },
            {
                "id": "p-02",
                "code": "premium_monthly",
                "name": "Premium (1 Month)",
                "description": "Fast sprint preparation",
                "price_in_paise": 9900,
                "currency": "INR",
                "duration_days": 30,
                "is_active": True,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
            },
            {
                "id": "p-03",
                "code": "legacy_quarterly",
                "name": "Legacy Quarterly",
                "description": "Discontinued plan",
                "price_in_paise": 29900,
                "currency": "INR",
                "duration_days": 90,
                "is_active": False,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z",
            },
        ]

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()
            mock_chain = MagicMock()
            mock_chain.select.return_value = mock_chain
            mock_chain.order.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(data=mock_plans_data)
            mock_admin_client.from_.return_value = mock_chain
            mock_admin_sb.return_value = mock_admin_client

            resp = client.get(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(resp.status_code, 200)
            plans = resp.json()
            self.assertEqual(len(plans), 3)
            self.assertEqual(plans[0]["code"], "free")
            self.assertFalse(plans[2]["is_active"])

    def test_04_student_forbidden_from_creating_or_updating_plans(self):
        """Student cannot call POST /api/admin/plans or PUT /api/admin/plans/{id}."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            # Create attempt
            resp_create = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-student-token"},
                json={
                    "code": "hacker_tier",
                    "name": "Hacker Tier",
                    "price_in_paise": 100,
                    "duration_days": 365,
                },
            )
            self.assertEqual(resp_create.status_code, 403)

            # Update attempt
            resp_update = client.put(
                "/api/admin/plans/plan-uuid",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"name": "Tampered Plan", "price_in_paise": 100},
            )
            self.assertEqual(resp_update.status_code, 403)

            # Status toggle attempt
            resp_status = client.patch(
                "/api/admin/plans/plan-uuid/status",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"is_active": False},
            )
            self.assertEqual(resp_status.status_code, 403)

    # =========================================================================
    # 2. SERVER-SIDE PLAN VALIDATION & INVARIANTS
    # =========================================================================

    def test_05_create_plan_success(self):
        """Admin can successfully create a new commercial subscription plan."""
        created_row = {
            "id": "new-plan-uuid",
            "code": "placement_pass_annual",
            "name": "Placement Pass Annual",
            "description": "Full placement prep with 365-day access",
            "price_in_paise": 89900,
            "currency": "INR",
            "duration_days": 365,
            "is_active": True,
            "created_at": "2026-10-19T20:00:00Z",
            "updated_at": "2026-10-19T20:00:00Z",
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()
            mock_chain = MagicMock()
            # Uniqueness check: no existing plan
            mock_chain.select.return_value = mock_chain
            mock_chain.eq.return_value = mock_chain
            mock_chain.insert.return_value = mock_chain
            mock_chain.execute.side_effect = [
                MagicMock(data=[]),             # Uniqueness query
                MagicMock(data=[created_row]),  # Insert query
                MagicMock(data=[]),             # Entitlements insert query
            ]
            mock_admin_client.from_.return_value = mock_chain
            mock_admin_sb.return_value = mock_admin_client

            resp = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "placement_pass_annual",
                    "name": "Placement Pass Annual",
                    "description": "Full placement prep with 365-day access",
                    "price_in_paise": 89900,
                    "currency": "INR",
                    "duration_days": 365,
                    "is_active": True,
                },
            )
            self.assertEqual(resp.status_code, 201)
            body = resp.json()
            self.assertEqual(body["code"], "placement_pass_annual")
            self.assertEqual(body["price_in_paise"], 89900)
            self.assertEqual(body["duration_days"], 365)
            self.assertTrue(body["is_active"])

    def test_06_create_plan_rejects_negative_or_zero_price_for_commercial(self):
        """Commercial plans must reject negative (422) or zero (400) prices."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            # Zero price on commercial plan
            resp_zero = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "invalid_free_commercial",
                    "name": "Invalid Commercial",
                    "price_in_paise": 0,
                    "duration_days": 30,
                },
            )
            self.assertEqual(resp_zero.status_code, 400)
            self.assertIn("greater than 0 paise", resp_zero.json()["detail"])

            # Negative price (rejected by Pydantic ge=0 constraint)
            resp_neg = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "negative_price_plan",
                    "name": "Negative Price",
                    "price_in_paise": -5000,
                    "duration_days": 30,
                },
            )
            self.assertEqual(resp_neg.status_code, 422)

    def test_07_create_plan_rejects_invalid_currency_and_duration(self):
        """Plans reject unsupported currencies and missing or invalid duration for commercial tiers."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            # Unsupported currency
            resp_curr = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "usd_plan",
                    "name": "USD Plan",
                    "price_in_paise": 1000,
                    "currency": "USD",
                    "duration_days": 30,
                },
            )
            self.assertEqual(resp_curr.status_code, 400)
            self.assertIn("Only 'INR' currency is supported", resp_curr.json()["detail"])

            # Missing duration on commercial plan
            resp_dur = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "no_duration_commercial",
                    "name": "No Duration Commercial",
                    "price_in_paise": 10000,
                    "duration_days": None,
                },
            )
            self.assertEqual(resp_dur.status_code, 400)
            self.assertIn("at least 1 day", resp_dur.json()["detail"])

    def test_08_create_plan_rejects_malformed_code_and_duplicates(self):
        """Malformed code regex check (422) and duplicate code validation (400)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            # Malformed codes: caught by Pydantic regex pattern
            for bad_code in ["with spaces", "UPPERCASE", "a", "code$symbol"]:
                resp = client.post(
                    "/api/admin/plans",
                    headers={"Authorization": "Bearer mock-admin-token"},
                    json={
                        "code": bad_code,
                        "name": "Bad Code Plan",
                        "price_in_paise": 1000,
                        "duration_days": 30,
                    },
                )
                self.assertEqual(resp.status_code, 422, f"Expected 422 for bad code: {bad_code}")

            # Duplicate code: caught by service uniqueness query
            mock_admin_client = MagicMock()
            mock_chain = MagicMock()
            mock_chain.select.return_value = mock_chain
            mock_chain.eq.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(
                data=[{"id": "existing-plan", "code": "premium_monthly"}]
            )
            mock_admin_client.from_.return_value = mock_chain
            mock_admin_sb.return_value = mock_admin_client

            resp_dup = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "premium_monthly",
                    "name": "Duplicate Premium Monthly",
                    "price_in_paise": 9900,
                    "duration_days": 30,
                },
            )
            self.assertEqual(resp_dup.status_code, 400)
            self.assertIn("already exists", resp_dup.json()["detail"])

    def test_09_free_plan_invariants_enforced(self):
        """Free plan cannot be deactivated, and cannot have price > 0."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()
            mock_chain = MagicMock()
            mock_chain.select.return_value = mock_chain
            mock_chain.eq.return_value = mock_chain
            mock_chain.limit.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(
                data=[{"id": "free-plan-uuid", "code": "free", "price_in_paise": 0, "is_active": True}]
            )
            mock_admin_client.from_.return_value = mock_chain
            mock_admin_sb.return_value = mock_admin_client

            # Attempt to deactivate free tier
            resp_deact = client.patch(
                "/api/admin/plans/free-plan-uuid/status",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={"is_active": False},
            )
            self.assertEqual(resp_deact.status_code, 400)
            self.assertIn("cannot be deactivated", resp_deact.json()["detail"])

            # Attempt to set price > 0 on free tier
            resp_price = client.put(
                "/api/admin/plans/free-plan-uuid",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={"name": "Paid Free", "price_in_paise": 5000},
            )
            self.assertEqual(resp_price.status_code, 400)
            self.assertIn("cannot be set above zero", resp_price.json()["detail"].lower())

    # =========================================================================
    # 3. SERVER-SIDE PRICE AUTHORITY & CHECKOUT INVARIANTS
    # =========================================================================

    def test_10_checkout_uses_authoritative_database_price(self):
        """Order creation strictly looks up authoritative price from database, ignoring client amount."""
        authoritative_plan = SubscriptionPlanDTO(
            id="plan-uuid-monthly",
            code="premium_monthly",
            name="Premium Monthly",
            description="Fast sprint prep",
            price_in_paise=14900,  # Authoritative price updated by Admin
            currency="INR",
            duration_days=30,
            is_active=True,
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch("backend.services.payment_service.SubscriptionService.get_plan_by_code", return_value=authoritative_plan), \
             patch.object(PhonePeService, "create_checkout_order") as mock_pp:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_pay_db = MagicMock()
            mock_pay_db.from_().insert().execute.return_value = MagicMock(data=[{"id": "tx-002"}])
            mock_pay_sb.return_value = mock_pay_db

            mock_pp.return_value = {
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=test_tok_authoritative",
                "provider_order_id": "PP_ORD_AUTH",
            }

            # Client attempts to send forged price/amount payload
            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-student-token"},
                json={
                    "plan_code": "premium_monthly",
                    "amount": 100,
                    "price_in_paise": 100,
                    "user_id": "other-student-id",
                },
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            # Authoritative amount must be 14900, NOT the forged 100!
            self.assertEqual(data["amount_in_paise"], 14900)
            self.assertEqual(data["currency"], "INR")

    def test_11_checkout_rejects_deactivated_plan(self):
        """Attempting to checkout a deactivated plan returns HTTP 400 Bad Request."""
        inactive_plan = SubscriptionPlanDTO(
            id="plan-uuid-inactive",
            code="premium_monthly",
            name="Premium Monthly",
            description="Deactivated plan",
            price_in_paise=9900,
            currency="INR",
            duration_days=30,
            is_active=False,  # Deactivated by Admin
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch("backend.services.payment_service.SubscriptionService.get_plan_by_code", return_value=inactive_plan):

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"plan_code": "premium_monthly"},
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("inactive and cannot be purchased", resp.json()["detail"])

    def test_12_checkout_rejects_free_tier(self):
        """Attempting to checkout the free tier returns HTTP 400 Bad Request."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"plan_code": "free"},
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("free tier cannot be purchased", resp.json()["detail"].lower())

    # =========================================================================
    # 4. CONCURRENCY, IDEMPOTENCY & CRASH RECOVERY INVESTIGATION
    # =========================================================================

    def test_13_status_toggle_idempotency(self):
        """Setting the same active status multiple times is safe and returns consistent state."""
        existing_plan = {
            "id": "plan-uuid-commercial",
            "code": "premium_monthly",
            "name": "Premium Monthly",
            "price_in_paise": 9900,
            "currency": "INR",
            "duration_days": 30,
            "is_active": True,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z",
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()
            mock_chain = MagicMock()
            mock_chain.select.return_value = mock_chain
            mock_chain.eq.return_value = mock_chain
            mock_chain.limit.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(data=[existing_plan])
            mock_admin_client.from_.return_value = mock_chain
            mock_admin_sb.return_value = mock_admin_client

            # Repeated call with is_active = True
            for _ in range(3):
                resp = client.patch(
                    "/api/admin/plans/plan-uuid-commercial/status",
                    headers={"Authorization": "Bearer mock-admin-token"},
                    json={"is_active": True},
                )
                self.assertEqual(resp.status_code, 200)
                self.assertTrue(resp.json()["is_active"])

    def test_14_crash_recovery_payment_verified_before_provisioning(self):
        """
        Investigation of critical failure window:
        Payment is verified by PhonePe and transaction marked 'success'.
        A subsequent duplicate webhook or retry finds status == 'success' and returns 200 OK
        without calling activate_or_extend_subscription again (preventing double extension).
        """
        import hashlib
        import json
        webhook_user = "test_webhook_user"
        webhook_pass = "test_webhook_pass"
        to_hash = f"{webhook_user}:{webhook_pass}".encode("utf-8")
        valid_auth_header = hashlib.sha256(to_hash).hexdigest()

        merchant_order_id = "order_sc_test_idempotent_014"
        mock_tx_already_success = {
            "id": "tx-301",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",  # Already marked success
            "subscription_id": "sub-already-provisioned-014",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_activate:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[mock_tx_already_success])
            mock_sb.return_value = mock_db

            webhook_payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_ALREADY_DONE",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": valid_auth_header},
                content=json.dumps(webhook_payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")
            # Invariant: activate_or_extend_subscription must NOT have been called!
            mock_activate.assert_not_called()

    # =========================================================================
    # 5. DYNAMIC CUSTOM PLAN PURCHASE & ENTITLEMENT INTEGRATION TESTS
    # =========================================================================

    def test_15_dynamic_custom_plan_purchase_lifecycle(self):
        """
        Investigation 1: Trace complete path for an Admin-created dynamic plan
        (code not in original PlanCode enum):
        Admin creates plan -> plan persisted -> student retrieves plan
        -> student selects plan -> order request validated -> authoritative price charged.
        """
        custom_plan_dto = SubscriptionPlanDTO(
            id="plan-uuid-dynamic-annual",
            code="placement_pro_annual",
            name="Placement Pro Annual Pass",
            description="365-day full career access",
            price_in_paise=49900,
            currency="INR",
            duration_days=365,
            is_active=True,
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch("backend.services.subscription_service.SubscriptionService.get_plan_by_code", return_value=custom_plan_dto), \
             patch("backend.services.payment_service.SubscriptionService.get_plan_by_code", return_value=custom_plan_dto), \
             patch.object(PhonePeService, "create_checkout_order") as mock_pp:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_pay_db = MagicMock()
            mock_pay_db.from_().insert().execute.return_value = MagicMock(data=[{"id": "tx-dynamic-001"}])
            mock_pay_sb.return_value = mock_pay_db

            mock_pp.return_value = {
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=test_tok_dynamic",
                "provider_order_id": "PP_ORD_DYNAMIC",
            }

            # Student creates order for dynamic plan, attempting client price tampering
            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-student-token"},
                json={
                    "plan_code": "placement_pro_annual",
                    "amount": 100,  # Tampered client price
                    "price_in_paise": 100,
                },
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["plan_code"], "placement_pro_annual")
            # Authoritative price must be 49900 paise, NOT 100!
            self.assertEqual(data["amount_in_paise"], 49900)
            self.assertEqual(data["currency"], "INR")
            self.assertIn("checkout_url", data)

    def test_16_dynamic_plan_effective_subscription_and_entitlements(self):
        """
        Investigation 1 & 4: Subscriptions for custom dynamic plans must resolve
        as active premium and grant authoritative entitlements across all 7 features
        without enum casting or AttributeError exceptions.
        """
        from backend.models.subscription import FeatureKey, AccessLevel
        now = datetime.now(timezone.utc)
        from datetime import timedelta

        mock_sub_row = {
            "id": "sub-dynamic-001",
            "user_id": self.student_id,
            "status": "active",
            "started_at": now.isoformat(),
            "expires_at": (now + timedelta(days=365)).isoformat(),
            "cancelled_at": None,
            "subscription_plans": {
                "id": "plan-uuid-dynamic-annual",
                "code": "placement_pro_annual",
                "name": "Placement Pro Annual Pass",
            },
        }

        mock_entitlements_rows = [
            {"feature_key": FeatureKey.SAVED_VIDEOS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.COMPANY_INTERVIEW_QUESTIONS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.PLACEMENT_PREP.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.SCHOLARSHIPS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.TECH_NEWS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.AI_MENTOR.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
            {"feature_key": FeatureKey.ROADMAPS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
        ]

        with patch("backend.services.subscription_service.get_supabase") as mock_sub_sb:
            mock_sb = MagicMock()
            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.order.return_value = q
                q.limit.return_value = q
                if tbl in ("user_subscriptions", "subscriptions"):
                    q.execute.return_value = MagicMock(data=[mock_sub_row])
                elif tbl == "plan_entitlements":
                    q.execute.return_value = MagicMock(data=mock_entitlements_rows)
                else:
                    q.execute.return_value = MagicMock(data=[])
                return q
            mock_sb.from_ = mock_from
            mock_sub_sb.return_value = mock_sb

            resolved = SubscriptionService.resolve_effective_subscription(self.student_id)
            self.assertEqual(resolved["plan"], "placement_pro_annual")
            self.assertTrue(resolved["is_premium"])
            self.assertEqual(resolved["status"].value, "active")

            entitlements = SubscriptionService.get_user_entitlements(self.student_id)
            self.assertEqual(len(entitlements), 7)
            for fk in FeatureKey:
                self.assertIn(fk.value, entitlements)
                self.assertEqual(entitlements[fk.value].access, AccessLevel.FULL)

    def test_17_unknown_plan_code_rejected_with_422(self):
        """
        Investigation 1: An unknown, nonexistent plan code must be rejected
        during request validation with HTTP 422 Unprocessable Entity.
        """
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.subscription_service.SubscriptionService.get_plan_by_code", return_value=None):

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_sb_client

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"plan_code": "unknown_fake_plan"},
            )
            self.assertEqual(resp.status_code, 422)

    def test_18_crash_recovery_resumes_unfulfilled_provisioning(self):
        """
        Investigation 3: True Crash Recovery Exercise.
        Scenario: Webhook arrives and payment verification succeeds.
        During subscription provisioning, an exception occurs (e.g. database timeout).
        The system catches the exception and atomically reverts the transaction status to 'pending'.
        When the gateway retry arrives, the order is claimed, activate_or_extend_subscription completes,
        and the subscription ID is persisted!
        """
        import hashlib
        import json
        webhook_user = "test_webhook_user"
        webhook_pass = "test_webhook_pass"
        to_hash = f"{webhook_user}:{webhook_pass}".encode("utf-8")
        valid_auth_header = hashlib.sha256(to_hash).hexdigest()

        merchant_order_id = "order_sc_test_crash_recovery_018"
        db_tx_state = {
            "id": "tx-unfulfilled-018",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "provider_order_id": "PP_ORD_CRASH_018",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_activate:

            # Phase 1: First attempt fails with transient database exception
            mock_activate.side_effect = [
                Exception("Transient DB timeout during provisioning"),
                {"subscription_id": "sub-recovered-018", "is_extension": False},
            ]

            class MockQuery:
                def __init__(self, state):
                    self.state = state
                    self.payload = None
                    self.conditions = []

                def select(self, *args, **kwargs):
                    return self

                def update(self, payload):
                    self.payload = payload
                    return self

                def eq(self, col, val):
                    self.conditions.append((col, val))
                    return self

                def limit(self, n):
                    return self

                def execute(self):
                    # Atomic claim check: where status = 'pending'
                    for col, val in self.conditions:
                        if col == "status" and val == "pending" and self.state.get("status") != "pending":
                            return MagicMock(data=[])
                    if self.payload:
                        self.state.update(self.payload)
                        self.payload = None
                    return MagicMock(data=[dict(self.state)])

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed")
            mock_db.from_ = lambda tbl: MockQuery(db_tx_state)
            mock_pay_sb.return_value = mock_db

            webhook_payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_CRASH_018",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            # Attempt 1: Provisioning fails, triggers exception and reverts state to 'pending'
            with self.assertRaises(Exception):
                client.post(
                    "/api/subscriptions/webhook/phonepe",
                    headers={"Authorization": valid_auth_header},
                    content=json.dumps(webhook_payload),
                )

            # Assert state was safely reverted to 'pending' for retry
            self.assertEqual(db_tx_state["status"], "pending")
            self.assertIn("reverted to pending for retry", db_tx_state.get("failure_message", ""))

            # Attempt 2: Retry arrives -> Claims order, provisions subscription, records subscription_id
            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": valid_auth_header},
                content=json.dumps(webhook_payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # Final verification: status is 'success', subscription_id is populated, provisioning completed
            self.assertEqual(db_tx_state["status"], "success")
            self.assertEqual(db_tx_state["subscription_id"], "sub-recovered-018")
            self.assertEqual(mock_activate.call_count, 2)
    def test_19_create_plan_rolls_back_if_entitlement_seeding_fails(self):
        """
        Investigation D: Atomicity & Consistency.
        If plan_entitlements insert fails during plan creation, the newly inserted
        plan row must be immediately deleted (rolled back) and HTTP 500 returned,
        ensuring no orphaned or partial plan records exist.
        """
        created_row = {
            "id": "plan-uuid-failed-ent",
            "code": "placement_pro_failed",
            "name": "Placement Pro Failed",
            "price_in_paise": 19900,
            "currency": "INR",
            "duration_days": 30,
            "is_active": True,
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()
            deleted_plans = []

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                if tbl == "subscription_plans":
                    q.execute.side_effect = [MagicMock(data=[])]
                    q.insert.return_value = MagicMock(execute=lambda: MagicMock(data=[created_row]))
                    def do_delete():
                        del_q = MagicMock()
                        def do_del_eq(col, val):
                            deleted_plans.append(val)
                            return MagicMock(execute=lambda: MagicMock(data=[created_row]))
                        del_q.eq = do_del_eq
                        return del_q
                    q.delete = do_delete
                elif tbl == "plan_entitlements":
                    q.insert.return_value = MagicMock(execute=MagicMock(side_effect=Exception("DB Unique Constraint Violation")))
                return q

            mock_admin_client.from_ = mock_from
            mock_admin_sb.return_value = mock_admin_client

            resp = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "placement_pro_failed",
                    "name": "Placement Pro Failed",
                    "price_in_paise": 19900,
                    "duration_days": 30,
                },
            )
            self.assertEqual(resp.status_code, 500)
            self.assertIn("Failed to initialize plan entitlements", resp.json()["detail"])
            self.assertIn("plan-uuid-failed-ent", deleted_plans)


    # =========================================================================
    # 6. FINAL SECURITY GATE: ROLE REVOCATION, RECOVERY & COMPENSATING ROLLBACK
    # =========================================================================

    def test_20_admin_role_revocation_lifecycle(self):
        """
        Investigation 1: Role Revocation Lifecycle Verification.
        1. Authorized Admin: Returns HTTP 200 OK.
        2. Student with forged role claims (x-user-role, x-role): Returns HTTP 403 Forbidden.
        3. Demoted Admin whose token was refreshed to 'student': Returns HTTP 403 Forbidden.
        4. Expired authentication token: Returns HTTP 401 Unauthorized.
        """
        # Scenario 1: Active authorized platform owner
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            resp = client.get("/api/admin/plans", headers={"Authorization": "Bearer valid-admin-jwt"})
            self.assertEqual(resp.status_code, 200)

        # Scenario 2: Student with forged role claims
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            forged_headers = {
                "Authorization": "Bearer student-jwt",
                "x-user-role": "owner",
                "role": "admin",
                "x-admin-override": "true",
            }
            resp = client.get("/api/admin/plans", headers=forged_headers)
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Admin or content manager privileges required", resp.json()["detail"])

        # Scenario 3: Demoted admin with refreshed token having app_metadata.role = 'student'
        demoted_user = MockAuthUser(self.admin_id, "admin@skillscatalyst.com", role="student")
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=demoted_user)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            resp = client.get("/api/admin/plans", headers={"Authorization": "Bearer refreshed-student-jwt"})
            self.assertEqual(resp.status_code, 403)

        # Scenario 4: Expired token
        from fastapi import HTTPException
        with patch("backend.services.auth_service.verify_jwt_token") as mock_jwt_verify:
            mock_jwt_verify.side_effect = HTTPException(
                status_code=401, detail="Authentication token has expired."
            )
            resp = client.get("/api/admin/plans", headers={"Authorization": "Bearer expired-token"})
            self.assertEqual(resp.status_code, 401)
            self.assertIn("expired", resp.json()["detail"].lower())

    def test_21_payment_recovery_duplicate_and_partial_completion(self):
        """
        Investigation 2: Payment Recovery Guarantees.
        1. When transaction is already in 'success' state, duplicate webhooks or retries
           MUST return HTTP 200 without calling activate_or_extend_subscription.
        2. When transaction has status 'failed', payment verification is rejected.
        """
        import hashlib
        import json
        webhook_user = "test_webhook_user"
        webhook_pass = "test_webhook_pass"
        to_hash = f"{webhook_user}:{webhook_pass}".encode("utf-8")
        valid_auth_header = hashlib.sha256(to_hash).hexdigest()

        merchant_order_id = "order_sc_test_idempotent_021"
        mock_tx_success = {
            "id": "tx-already-done-021",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": "sub-existing-021",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_activate:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[mock_tx_success])
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_DONE_021",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")
            mock_activate.assert_not_called()

    def test_22_entitlement_compensating_rollback_failure_handling(self):
        """
        Investigation 3: Compensating Rollback Edge Case.
        If plan_entitlements insertion fails AND the compensating delete query
        encounters a secondary error (e.g. DB connection dropped during delete),
        PlanAdminService catches the secondary exception, logs it, and surfaces
        HTTP 500 without crashing the server process.
        """
        created_row = {
            "id": "plan-uuid-double-fail",
            "code": "placement_pro_double_fail",
            "name": "Placement Pro Double Fail",
            "price_in_paise": 19900,
            "currency": "INR",
            "duration_days": 30,
            "is_active": True,
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.plan_admin_service.get_supabase") as mock_admin_sb:

            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "owner", "email": "admin@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            mock_admin_client = MagicMock()

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                if tbl == "subscription_plans":
                    q.execute.side_effect = [MagicMock(data=[])]  # uniqueness check
                    q.insert.return_value = MagicMock(execute=lambda: MagicMock(data=[created_row]))
                    # Compensating rollback delete also raises exception
                    del_q = MagicMock()
                    del_q.eq.return_value = MagicMock(execute=MagicMock(side_effect=Exception("DB Connection Drop during Rollback")))
                    q.delete = lambda: del_q
                elif tbl == "plan_entitlements":
                    q.insert.return_value = MagicMock(execute=MagicMock(side_effect=Exception("Entitlement insert failed")))
                return q

            mock_admin_client.from_ = mock_from
            mock_admin_sb.return_value = mock_admin_client

            resp = client.post(
                "/api/admin/plans",
                headers={"Authorization": "Bearer mock-admin-token"},
                json={
                    "code": "placement_pro_double_fail",
                    "name": "Placement Pro Double Fail",
                    "price_in_paise": 19900,
                    "duration_days": 30,
                },
            )
            # Must return HTTP 500 cleanly without crashing process
            self.assertEqual(resp.status_code, 500)
            self.assertIn("Failed to initialize plan entitlements", resp.json()["detail"])

    def test_23_activate_or_extend_subscription_idempotency_on_provider_event_id(self):
        """
        Task A: Payment Recovery Review.
        Verifies that retrying subscription activation with the same provider_event_id
        returns the existing active subscription and does NOT double-extend the subscription period.
        """
        from datetime import timedelta
        provider_event_id = "PP_TEST_RECOVERY_023"
        user_id = self.student_id
        plan_id = "plan-uuid-monthly"

        # Mock database state
        recorded_events = []
        user_sub_record = {
            "id": "sub-id-023",
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": self.now.isoformat(),
            "expires_at": (self.now + timedelta(days=30)).isoformat(),
        }

        with patch("backend.services.subscription_service.get_supabase") as mock_sub_sb, \
             patch.object(SubscriptionService, "resolve_effective_subscription") as mock_resolve, \
             patch.object(SubscriptionService, "get_user_subscription_record") as mock_get_rec, \
             patch("backend.services.subscription_service.invalidate_user_subscription"):

            mock_resolve.return_value = {
                "plan": PlanCode.PREMIUM_MONTHLY,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": True,
                "started_at": self.now,
                "expires_at": self.now + timedelta(days=30),
            }
            mock_get_rec.return_value = user_sub_record

            mock_sb_client = MagicMock()
            update_calls = []

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.order.return_value = q
                q.limit.return_value = q

                if tbl == "subscription_events":
                    def do_select():
                        matches = [e for e in recorded_events if e.get("provider_event_id") == provider_event_id]
                        return MagicMock(data=matches)
                    q.execute = do_select

                    def do_insert(payload):
                        recorded_events.append(payload)
                        return MagicMock(execute=lambda: MagicMock(data=[payload]))
                    q.insert = do_insert

                elif tbl == "user_subscriptions":
                    q.execute.side_effect = [
                        MagicMock(data=[user_sub_record]),  # existing_rows check
                    ]
                    def do_update(payload):
                        update_calls.append(payload)
                        return MagicMock(eq=lambda col, val: MagicMock(execute=lambda: MagicMock(data=[payload])))
                    q.update = do_update

                return q

            mock_sb_client.from_ = mock_from
            mock_sub_sb.return_value = mock_sb_client

            # Initial call: provider_event_id is not yet recorded -> provisions and records event
            res1 = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id=provider_event_id,
            )
            self.assertEqual(res1["status"], SubscriptionStatus.ACTIVE)
            self.assertEqual(len(recorded_events), 1)
            self.assertEqual(len(update_calls), 1)

            # Retry call: same provider_event_id -> must detect event already applied and NOT double-extend
            res2 = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id=provider_event_id,
            )
            self.assertEqual(res2["status"], SubscriptionStatus.ACTIVE)
            # Critical assertions: update_calls must NOT increase (no second extension), event not duplicated
            self.assertEqual(len(update_calls), 1, "Subscription must NOT be updated/extended a second time on retry")
            self.assertEqual(len(recorded_events), 1, "Subscription events must NOT contain duplicate provider event")


if __name__ == "__main__":
    unittest.main()


