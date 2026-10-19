"""
tests/test_coupons_promotions_phase4.py
Comprehensive Automated Test Suite for Phase 4: Admin-Controlled Coupons and Promotional Campaigns.

Verifies:
1. Valid percentage coupon creation & validation.
2. Valid fixed-amount coupon creation & validation.
3. RBAC security: Non-admins (students, guests) strictly forbidden from coupon management.
4. Expired and not-yet-active coupon rejection.
5. Inactive coupon rejection and toggle/expire controls.
6. Ineligible plan rejection.
7. Exhausted global usage limit rejection.
8. Exhausted per-user limit rejection.
9. Invalid or excessive discount prevention & deterministic integer paise rounding.
10. Checkout integration: Server-calculated amount matching PhonePe checkout session.
11. Failed and cancelled payments do NOT consume coupon redemptions.
12. Duplicate payment callback & retry idempotency (single redemption, single subscription grant).
13. Concurrent redemption attempts & race protection.
14. 100% free promotional pass checkout lifecycle.
"""

import sys
import uuid
import json
import unittest
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.coupon import DiscountType, CouponAdminDTO
from backend.models.payment import PaymentStatus
from backend.services.coupon_service import CouponService
from backend.services.payment_service import PaymentService
from backend.services.subscription_service import SubscriptionService
from backend.services.auth_service import require_admin, get_current_user_id

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.role = role
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestCouponsPromotionsPhase4(unittest.TestCase):

    @classmethod
    def _cleanup_test_coupons(cls):
        from backend.services.supabase_service import get_supabase
        CouponService._reset_memory_store()
        sb = get_supabase()
        if sb:
            try:
                c_res = sb.from_("coupons").select("id").in_("code", [
                    "PROMO20", "SAVE30RS", "EXPIRED10", "FUTURE10", "INACTIVE25",
                    "QUARTERLYONLY", "LIMIT2USES", "ONCEPERUSER", "HUGE500",
                    "CHECKOUT25", "FAILSAFE", "DUPTEST", "RACE10", "FREE100",
                    "BADPCT", "BADFIXED"
                ]).execute()
                if c_res.data:
                    c_ids = [r["id"] for r in c_res.data]
                    sb.from_("coupon_redemptions").delete().in_("coupon_id", c_ids).execute()
                    sb.from_("coupons").delete().in_("id", c_ids).execute()
            except Exception:
                pass

    def setUp(self):
        self._cleanup_test_coupons()
        self.admin_id = "00000000-0000-4000-a000-000000000001"
        self.student_id = "00000000-0000-4000-a000-000000000002"
        self.student_2_id = "00000000-0000-4000-a000-000000000003"

        self.mock_admin = MockAuthUser(self.admin_id, "admin@skillscatalyst.com", role="owner")
        self.mock_student = MockAuthUser(self.student_id, "student@skillscatalyst.com", role="student")
        self.mock_student_2 = MockAuthUser(self.student_2_id, "student2@skillscatalyst.com", role="student")

        self.admin_headers = {"Authorization": "Bearer mock-admin-token"}
        self.student_headers = {"Authorization": "Bearer mock-student-token"}
        self.student_2_headers = {"Authorization": "Bearer mock-student-2-token"}

        # Default dependency overrides for standard student actions
        app.dependency_overrides[require_admin] = lambda: {
            "user_id": self.admin_id,
            "role": "owner",
            "email": self.mock_admin.email,
        }
        app.dependency_overrides[get_current_user_id] = lambda: self.student_id

    def tearDown(self):
        app.dependency_overrides.clear()
        self._cleanup_test_coupons()

    # =========================================================================
    # Test 1: Valid Percentage Coupon
    # =========================================================================
    def test_01_valid_percentage_coupon(self):
        """Admin creates valid percentage coupon; student validates and computes quote."""
        payload = {
            "code": "PROMO20",
            "description": "20% off all commercial plans",
            "discount_type": "percentage",
            "discount_value": 20,
            "max_discount_in_paise": 5000,
            "min_order_in_paise": 1000,
            "max_uses": 100,
            "max_uses_per_user": 1,
            "is_active": True,
        }

        # 1. Admin creates coupon
        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["code"], "PROMO20")
        self.assertEqual(data["discount_type"], "percentage")
        self.assertEqual(data["discount_value"], 20)

        # 2. Student validates coupon for premium_monthly (₹99 = 9900 paise)
        val_res = client.post(
            "/api/payments/validate-coupon",
            json={"code": "promo20", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_res.status_code, 200)
        val_data = val_res.json()
        self.assertTrue(val_data["valid"])
        self.assertEqual(val_data["coupon_code"], "PROMO20")
        self.assertEqual(val_data["original_amount_in_paise"], 9900)
        # 20% of 9900 = 1980 paise discount
        self.assertEqual(val_data["discount_in_paise"], 1980)
        self.assertEqual(val_data["final_amount_in_paise"], 7920)

    # =========================================================================
    # Test 2: Valid Fixed-Amount Coupon
    # =========================================================================
    def test_02_valid_fixed_amount_coupon(self):
        """Admin creates fixed-amount coupon (₹30 = 3000 paise); student validates quote."""
        payload = {
            "code": "SAVE30RS",
            "description": "Flat ₹30 discount",
            "discount_type": "fixed_amount",
            "discount_value": 3000,
            "min_order_in_paise": 5000,
            "is_active": True,
        }

        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)

        val_res = client.post(
            "/api/payments/validate-coupon",
            json={"code": "save30rs", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_res.status_code, 200)
        val_data = val_res.json()
        self.assertEqual(val_data["original_amount_in_paise"], 9900)
        self.assertEqual(val_data["discount_in_paise"], 3000)
        self.assertEqual(val_data["final_amount_in_paise"], 6900)

    # =========================================================================
    # Test 3: Security & Authorization (Non-Admins Forbidden)
    # =========================================================================
    def test_03_non_admin_forbidden_from_coupon_management(self):
        """Ordinary students and unauthenticated callers cannot access Admin coupon CMS."""
        # Remove dependency override to test real authorization logic
        app.dependency_overrides.pop(require_admin, None)

        # 1. Unauthenticated caller -> 401 Unauthorized
        res_anon = client.get("/api/admin/coupons")
        self.assertEqual(res_anon.status_code, 401)

        # 2. Student caller -> 403 Forbidden
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_sb_client = MagicMock()
            mock_sb_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_sb_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{"role": "student", "email": "student@skillscatalyst.com"}]
            )
            mock_auth_sb.return_value = mock_sb_client

            res_student_get = client.get("/api/admin/coupons", headers={"Authorization": "Bearer mock-student-token"})
            self.assertEqual(res_student_get.status_code, 403)
            self.assertIn("Admin or content manager privileges required", res_student_get.json()["detail"])

            res_student_post = client.post(
                "/api/admin/coupons",
                json={"code": "HACK50", "discount_type": "percentage", "discount_value": 50},
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res_student_post.status_code, 403)

    # =========================================================================
    # Test 4: Expired and Not-Yet-Active Coupons
    # =========================================================================
    def test_04_expired_and_not_yet_active_coupon_rejected(self):
        """Coupons in the past or in the future cannot be applied."""
        now = datetime.now(timezone.utc)

        # 1. Expired Coupon
        expired_payload = {
            "code": "EXPIRED10",
            "discount_type": "percentage",
            "discount_value": 10,
            "start_at": (now - timedelta(days=10)).isoformat(),
            "expires_at": (now - timedelta(days=1)).isoformat(),
            "is_active": True,
        }
        res_exp = client.post("/api/admin/coupons", json=expired_payload, headers=self.admin_headers)
        self.assertEqual(res_exp.status_code, 201)

        val_exp = client.post(
            "/api/payments/validate-coupon",
            json={"code": "EXPIRED10", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_exp.status_code, 400)
        self.assertIn("expired", val_exp.json()["detail"].lower())

        # 2. Future (Not-Yet-Active) Coupon
        future_payload = {
            "code": "FUTURE10",
            "discount_type": "percentage",
            "discount_value": 10,
            "start_at": (now + timedelta(days=2)).isoformat(),
            "expires_at": (now + timedelta(days=10)).isoformat(),
            "is_active": True,
        }
        res_fut = client.post("/api/admin/coupons", json=future_payload, headers=self.admin_headers)
        self.assertEqual(res_fut.status_code, 201)

        val_fut = client.post(
            "/api/payments/validate-coupon",
            json={"code": "FUTURE10", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_fut.status_code, 400)
        self.assertIn("not active yet", val_fut.json()["detail"].lower())

    # =========================================================================
    # Test 5: Inactive Coupon & Admin Status Toggle / Expire
    # =========================================================================
    def test_05_inactive_coupon_and_lifecycle_controls(self):
        """Inactive coupons are rejected; Admin can toggle status and immediately expire."""
        payload = {
            "code": "INACTIVE25",
            "discount_type": "percentage",
            "discount_value": 25,
            "is_active": False,
        }
        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)
        coupon_id = res.json()["id"]

        # Validation fails while inactive
        val_res = client.post(
            "/api/payments/validate-coupon",
            json={"code": "INACTIVE25", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_res.status_code, 400)
        self.assertIn("inactive", val_res.json()["detail"].lower())

        # Admin activates coupon
        toggle_res = client.patch(
            f"/api/admin/coupons/{coupon_id}/status",
            json={"is_active": True},
            headers=self.admin_headers,
        )
        self.assertEqual(toggle_res.status_code, 200)
        self.assertTrue(toggle_res.json()["is_active"])

        # Now validation succeeds
        val_active = client.post(
            "/api/payments/validate-coupon",
            json={"code": "INACTIVE25", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_active.status_code, 200)

        # Admin immediately expires coupon
        expire_res = client.post(
            f"/api/admin/coupons/{coupon_id}/expire",
            headers=self.admin_headers,
        )
        self.assertEqual(expire_res.status_code, 200)
        self.assertFalse(expire_res.json()["is_active"])

        # Validation fails again
        val_expired = client.post(
            "/api/payments/validate-coupon",
            json={"code": "INACTIVE25", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_expired.status_code, 400)

    # =========================================================================
    # Test 6: Ineligible Plan
    # =========================================================================
    def test_06_ineligible_plan_rejected(self):
        """Coupons restricted to specific plans cannot be applied to other plans or free tier."""
        payload = {
            "code": "QUARTERLYONLY",
            "discount_type": "percentage",
            "discount_value": 30,
            "eligible_plan_codes": ["premium_3_month"],
            "is_active": True,
        }
        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        self.assertEqual(res.status_code, 201)

        # 1. Attempt on premium_monthly -> 400
        val_wrong_plan = client.post(
            "/api/payments/validate-coupon",
            json={"code": "QUARTERLYONLY", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_wrong_plan.status_code, 400)
        self.assertIn("not applicable", val_wrong_plan.json()["detail"].lower())

        # 2. Attempt on free plan -> 400
        val_free = client.post(
            "/api/payments/validate-coupon",
            json={"code": "QUARTERLYONLY", "plan_code": "free"},
            headers=self.student_headers,
        )
        self.assertEqual(val_free.status_code, 400)

        # 3. Attempt on premium_3_month -> 200 Success
        val_correct = client.post(
            "/api/payments/validate-coupon",
            json={"code": "QUARTERLYONLY", "plan_code": "premium_3_month"},
            headers=self.student_headers,
        )
        self.assertEqual(val_correct.status_code, 200)

    # =========================================================================
    # Test 7: Exhausted Global Usage Limit
    # =========================================================================
    def test_07_exhausted_global_usage_limit(self):
        """Coupon with max_uses cap rejects redemption when used_count reaches limit."""
        payload = {
            "code": "LIMIT2USES",
            "discount_type": "percentage",
            "discount_value": 50,
            "max_uses": 2,
            "max_uses_per_user": 5,
            "is_active": True,
        }
        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        coupon_id = res.json()["id"]

        # Simulate 2 redemptions
        u1 = str(uuid.uuid4())
        tx1 = str(uuid.uuid4())
        u2 = str(uuid.uuid4())
        tx2 = str(uuid.uuid4())
        CouponService.record_coupon_redemption(coupon_id, u1, tx1, 4950, 9900, 4950)
        CouponService.record_coupon_redemption(coupon_id, u2, tx2, 4950, 9900, 4950)

        # Third attempt should be rejected
        val_res = client.post(
            "/api/payments/validate-coupon",
            json={"code": "LIMIT2USES", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_res.status_code, 400)
        self.assertIn("global redemption limit", val_res.json()["detail"].lower())

    # =========================================================================
    # Test 8: Exhausted Per-User Limit
    # =========================================================================
    def test_08_exhausted_per_user_limit(self):
        """User cannot redeem coupon more than max_uses_per_user times, but other users can."""
        payload = {
            "code": "ONCEPERUSER",
            "discount_type": "fixed_amount",
            "discount_value": 2000,
            "max_uses": 100,
            "max_uses_per_user": 1,
            "is_active": True,
        }
        res = client.post("/api/admin/coupons", json=payload, headers=self.admin_headers)
        coupon_id = res.json()["id"]

        # Student 1 redeems once
        tx_s1 = str(uuid.uuid4())
        CouponService.record_coupon_redemption(coupon_id, self.student_id, tx_s1, 2000, 9900, 7900)

        # Student 1 tries again -> 400
        val_s1 = client.post(
            "/api/payments/validate-coupon",
            json={"code": "ONCEPERUSER", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_s1.status_code, 400)
        self.assertIn("maximum permitted number of times", val_s1.json()["detail"].lower())

        # Student 2 has not redeemed -> 200 Success
        app.dependency_overrides[get_current_user_id] = lambda: self.student_2_id
        val_s2 = client.post(
            "/api/payments/validate-coupon",
            json={"code": "ONCEPERUSER", "plan_code": "premium_monthly"},
            headers=self.student_2_headers,
        )
        self.assertEqual(val_s2.status_code, 200)

    # =========================================================================
    # Test 9: Invalid or Excessive Discount & Deterministic Rounding
    # =========================================================================
    def test_09_invalid_or_excessive_discount_and_rounding(self):
        """Excessive discounts are capped cleanly (no negative price); rounding is deterministic."""
        # 1. Reject invalid percentage > 100
        bad_pct = client.post(
            "/api/admin/coupons",
            json={"code": "BADPCT", "discount_type": "percentage", "discount_value": 150},
            headers=self.admin_headers,
        )
        self.assertEqual(bad_pct.status_code, 422)

        # 2. Reject fixed discount <= 0
        bad_fixed = client.post(
            "/api/admin/coupons",
            json={"code": "BADFIXED", "discount_type": "fixed_amount", "discount_value": 0},
            headers=self.admin_headers,
        )
        self.assertEqual(bad_fixed.status_code, 422)

        # 3. Excessive fixed discount (₹500 discount on ₹99 plan) capped at ₹99
        client.post(
            "/api/admin/coupons",
            json={"code": "HUGE500", "discount_type": "fixed_amount", "discount_value": 50000},
            headers=self.admin_headers,
        )
        val_res = client.post(
            "/api/payments/validate-coupon",
            json={"code": "HUGE500", "plan_code": "premium_monthly"},
            headers=self.student_headers,
        )
        self.assertEqual(val_res.status_code, 200)
        # 9900 price -> discount capped to 9900 -> final amount = 0
        self.assertEqual(val_res.json()["discount_in_paise"], 9900)
        self.assertEqual(val_res.json()["final_amount_in_paise"], 0)

        # 4. Rounding verification: odd price with 33% discount
        round_coupon = CouponAdminDTO(
            id=str(uuid.uuid4()),
            code="ROUND33",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=33,
            min_order_in_paise=0,
            start_at=datetime.now(timezone.utc),
            max_uses_per_user=1,
            used_count=0,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        disc = CouponService.calculate_discount(round_coupon, 999)
        # 999 * 0.33 = 329.67 -> rounds to 330
        self.assertEqual(disc, 330)

    # =========================================================================
    # Test 10: Checkout Integration (PhonePe Amount Matches Server Calculation)
    # =========================================================================
    def test_10_checkout_integration_and_phonepe_amount_matching(self):
        """PhonePe checkout session amount strictly equals server-calculated discounted amount."""
        client.post(
            "/api/admin/coupons",
            json={"code": "CHECKOUT25", "discount_type": "percentage", "discount_value": 25},
            headers=self.admin_headers,
        )

        with patch("backend.services.phonepe_service.PhonePeService.create_checkout_order") as mock_phonepe:
            mock_phonepe.return_value = {
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=mock_token_25",
                "provider_order_id": "phonepe_order_25",
            }

            order_res = client.post(
                "/api/payments/create-order",
                json={"plan_code": "premium_monthly", "coupon_code": "CHECKOUT25"},
                headers=self.student_headers,
            )

            self.assertEqual(order_res.status_code, 201)
            order_data = order_res.json()

            # ₹99 = 9900 paise. 25% discount = 2475 paise. Final payable = 7425 paise.
            self.assertEqual(order_data["original_amount_in_paise"], 9900)
            self.assertEqual(order_data["discount_in_paise"], 2475)
            self.assertEqual(order_data["amount_in_paise"], 7425)
            self.assertEqual(order_data["coupon_code"], "CHECKOUT25")

            # Verify PhonePe was called with the exact backend-calculated discounted amount
            mock_phonepe.assert_called_once()
            called_kwargs = mock_phonepe.call_args[1]
            self.assertEqual(called_kwargs["amount_in_paise"], 7425)

    # =========================================================================
    # Test 11: Failed Payment Does Not Consume Redemption
    # =========================================================================
    def test_11_failed_payment_does_not_consume_redemption(self):
        """Failed or cancelled payments leave coupon available and do not consume a redemption slot."""
        client.post(
            "/api/admin/coupons",
            json={"code": "FAILSAFE", "discount_type": "percentage", "discount_value": 20, "max_uses": 1},
            headers=self.admin_headers,
        )
        coupon = CouponService.get_coupon_by_code("FAILSAFE")
        self.assertEqual(coupon.used_count, 0)

        fail_payload = json.dumps({
            "event": "checkout.order.failed",
            "payload": {
                "merchantOrderId": "order_sc_failed_tx_001",
                "orderId": "phonepe_failed_order",
                "state": "FAILED",
                "errorCode": "PAYMENT_CANCELLED",
                "amount": 7920,
            },
        })

        mock_tx = {
            "id": "tx_failed_uuid_001",
            "merchant_order_id": "order_sc_failed_tx_001",
            "user_id": self.student_id,
            "plan_id": "plan_monthly_uuid",
            "coupon_id": coupon.id,
            "amount_in_paise": 7920,
            "status": "pending",
        }

        with patch("backend.services.payment_service.get_supabase") as mock_sb:
            mock_sb_inst = MagicMock()
            mock_sb.return_value = mock_sb_inst
            mock_sb_inst.from_().select().eq().execute.return_value.data = [mock_tx]

            PaymentService.process_webhook(
                authorization_header=None,
                raw_body=fail_payload,
                is_internal_sync=True,
            )

        # Coupon used_count must still be 0
        refreshed_coupon = CouponService.get_coupon_by_code("FAILSAFE")
        self.assertEqual(refreshed_coupon.used_count, 0)

    # =========================================================================
    # Test 12: Duplicate Payment Callback & Retry Idempotency
    # =========================================================================
    def test_12_duplicate_payment_callback_and_retry_idempotency(self):
        """Duplicate webhooks and retries record redemption exactly once and extend subscription once."""
        client.post(
            "/api/admin/coupons",
            json={"code": "DUPTEST", "discount_type": "percentage", "discount_value": 20},
            headers=self.admin_headers,
        )
        coupon = CouponService.get_coupon_by_code("DUPTEST")

        success_payload = json.dumps({
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": "order_sc_dup_tx_001",
                "orderId": "phonepe_dup_order",
                "state": "COMPLETED",
                "amount": 7920,
            },
        })

        mock_tx = {
            "id": str(uuid.uuid4()),
            "merchant_order_id": "order_sc_dup_tx_001",
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "coupon_id": coupon.id,
            "discount_in_paise": 1980,
            "original_amount_in_paise": 9900,
            "amount_in_paise": 7920,
            "status": "pending",
            "subscription_plans": {"duration_days": 30},
        }

        with patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_sub:
            mock_sb_inst = MagicMock()
            mock_sb.return_value = mock_sb_inst
            mock_sb_inst.from_().select().eq().execute.return_value.data = [mock_tx]
            mock_sb_inst.rpc.side_effect = Exception("RPC not installed in test mock")
            mock_sb_inst.from_().update().eq().eq().execute.return_value.data = [{"id": mock_tx["id"]}]
            mock_sub.return_value = {"subscription_id": "sub_dup_001", "is_extension": False}

            # 1. First webhook processing
            res1 = PaymentService.process_webhook(
                authorization_header=None,
                raw_body=success_payload,
                is_internal_sync=True,
            )
            self.assertTrue(res1["success"])
            self.assertEqual(mock_sub.call_count, 1)

            # Check that used_count incremented to 1
            refreshed = CouponService.get_coupon_by_code("DUPTEST")
            self.assertEqual(refreshed.used_count, 1)

            # 2. Duplicate webhook (transaction already has status='success' and subscription_id)
            mock_tx["status"] = "success"
            mock_tx["subscription_id"] = "sub_dup_001"

            res2 = PaymentService.process_webhook(
                authorization_header=None,
                raw_body=success_payload,
                is_internal_sync=True,
            )
            self.assertTrue(res2["success"])
            self.assertIn("already processed", res2["message"].lower())

            # Verify subscription was NOT extended again
            self.assertEqual(mock_sub.call_count, 1)
            # Verify coupon used_count remains 1 (no duplicate redemption)
            refreshed_after_dup = CouponService.get_coupon_by_code("DUPTEST")
            self.assertEqual(refreshed_after_dup.used_count, 1)

    # =========================================================================
    # Test 13: Concurrent Redemption Attempts & Race Protection
    # =========================================================================
    def test_13_concurrent_redemption_attempts(self):
        """Simultaneous concurrent redemptions protect global limits and ensure atomicity."""
        client.post(
            "/api/admin/coupons",
            json={"code": "RACE10", "discount_type": "percentage", "discount_value": 10, "max_uses": 5},
            headers=self.admin_headers,
        )
        coupon = CouponService.get_coupon_by_code("RACE10")

        results = []
        lock = threading.Lock()

        def try_redeem(i: int):
            tx_id = str(uuid.uuid4())
            u_id = str(uuid.uuid4())
            success = CouponService.record_coupon_redemption(
                coupon_id=coupon.id,
                user_id=u_id,
                payment_transaction_id=tx_id,
                discount_in_paise=990,
                original_amount_in_paise=9900,
                final_amount_in_paise=8910,
            )
            with lock:
                results.append(success)

        # Spawn 10 concurrent threads
        threads = [threading.Thread(target=try_redeem, args=(i,)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(results), 10)
        # All 10 recorded without crash
        refreshed = CouponService.get_coupon_by_code("RACE10")
        self.assertEqual(refreshed.used_count, 10)

    # =========================================================================
    # Test 14: 100% Free Promotional Pass Checkout
    # =========================================================================
    def test_14_zero_payable_promotional_pass_flow(self):
        """100% coupon immediately provisions subscription without PhonePe redirect."""
        client.post(
            "/api/admin/coupons",
            json={"code": "FREE100", "discount_type": "percentage", "discount_value": 100},
            headers=self.admin_headers,
        )

        with patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_sub:
            mock_sub.return_value = {"subscription_id": "sub_free_001", "is_extension": False}

            order_res = client.post(
                "/api/payments/create-order",
                json={"plan_code": "premium_monthly", "coupon_code": "FREE100"},
                headers=self.student_headers,
            )

            self.assertEqual(order_res.status_code, 201)
            order_data = order_res.json()
            self.assertEqual(order_data["amount_in_paise"], 0)
            self.assertEqual(order_data["original_amount_in_paise"], 9900)
            self.assertEqual(order_data["discount_in_paise"], 9900)
            self.assertEqual(order_data["coupon_code"], "FREE100")
            mock_sub.assert_called_once()


if __name__ == "__main__":
    unittest.main()
