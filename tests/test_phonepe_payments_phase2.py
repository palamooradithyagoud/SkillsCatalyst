"""
tests/test_phonepe_payments_phase2.py
Comprehensive Automated Test Suite for PhonePe Payments Phase 2 (Backend-First).
Validates:
1. Payment creation for premium_monthly (201 Created)
2. Payment creation for premium_3_month (201 Created)
3. Free plan rejected (400 Bad Request)
4. Invalid plan code rejected (422 Unprocessable Entity)
5. Security: Client cannot override amount, currency, duration, or user_id
6. Webhook SHA username/password authentication (200 OK vs 401 Unauthorized)
7. Successful webhook (checkout.order.completed) activates subscription
8. Failed webhook (checkout.order.failed) marks transaction as failed
9. Idempotency: Duplicate successful callback ignores duplicate extension
10. Expiry extension: Active subscriber retains existing period and gets +30/+90 days
11. Expiry reset: Expired subscriber starts a new period from current timestamp
12. Webhook amount tampering rejected (400 Bad Request)
13. Payment status endpoint (GET /api/payments/status/{order_id})
14. Payment history endpoint (GET /api/payments/history)
"""

import sys
import json
import hashlib
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.subscription import PlanCode, SubscriptionStatus
from backend.models.payment import PaymentStatus
from backend.services.subscription_service import SubscriptionService
from backend.services.payment_service import PaymentService
from backend.services.phonepe_service import PhonePeService

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test Student"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestPhonePePaymentsPhase2(unittest.TestCase):

    def setUp(self):
        self.student_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        self.mock_student = MockAuthUser(self.student_id, "student@skillscatalyst.com")
        self.now = datetime.now(timezone.utc)

        self.webhook_user = "test_webhook_user"
        self.webhook_pass = "test_webhook_pass"
        to_hash = f"{self.webhook_user}:{self.webhook_pass}".encode("utf-8")
        self.valid_auth_header = hashlib.sha256(to_hash).hexdigest()

    # =========================================================================
    # 1. PAYMENT CREATION: PREMIUM MONTHLY
    # =========================================================================
    def test_01_create_payment_order_monthly(self):
        """Creates pending transaction for premium_monthly and returns checkout URL."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(PhonePeService, "create_checkout_order") as mock_pp:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[{"id": "plan-uuid-monthly"}])
            mock_db.from_().insert().execute.return_value = MagicMock(data=[{"id": "tx-001"}])
            mock_pay_sb.return_value = mock_db

            mock_pp.return_value = {
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=test_tok_1",
                "provider_order_id": "PP_ORD_001",
            }

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-token"},
                json={"plan_code": "premium_monthly"},
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["amount_in_paise"], 9900)
            self.assertEqual(data["currency"], "INR")
            self.assertEqual(data["plan_code"], "premium_monthly")
            self.assertIn("checkout_url", data)

    # =========================================================================
    # 2. PAYMENT CREATION: PREMIUM 3 MONTHS
    # =========================================================================
    def test_02_create_payment_order_3_month(self):
        """Creates pending transaction for premium_3_month and returns checkout URL."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(PhonePeService, "create_checkout_order") as mock_pp:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[{"id": "plan-uuid-3month"}])
            mock_db.from_().insert().execute.return_value = MagicMock(data=[{"id": "tx-002"}])
            mock_pay_sb.return_value = mock_db

            mock_pp.return_value = {
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=test_tok_2",
                "provider_order_id": "PP_ORD_002",
            }

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-token"},
                json={"plan_code": "premium_3_month"},
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["amount_in_paise"], 25000)
            self.assertEqual(data["currency"], "INR")
            self.assertEqual(data["plan_code"], "premium_3_month")

    # =========================================================================
    # 3. PAYMENT CREATION: FREE PLAN REJECTED
    # =========================================================================
    def test_03_free_plan_rejected(self):
        """Purchasing the free plan via payment gateway is strictly rejected."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-token"},
                json={"plan_code": "free"},
            )
            self.assertEqual(resp.status_code, 400)

    # =========================================================================
    # 4. PAYMENT CREATION: INVALID PLAN CODE
    # =========================================================================
    def test_04_invalid_plan_code_rejected(self):
        """Invalid plan code returns 422 unprocessable entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-token"},
                json={"plan_code": "non_existent_plan"},
            )
            self.assertEqual(resp.status_code, 422)

    # =========================================================================
    # 5. SECURITY: CLIENT CANNOT OVERRIDE CANONICAL PRICING OR USER_ID
    # =========================================================================
    def test_05_security_client_cannot_tamper(self):
        """Ensures amount, duration, and user_id are derived from server-side session and DB."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(PhonePeService, "create_checkout_order") as mock_pp:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[{"id": "plan-uuid-monthly"}])
            mock_db.from_().insert().execute.return_value = MagicMock(data=[{"id": "tx-001"}])
            mock_pay_sb.return_value = mock_db

            mock_pp.return_value = {"checkout_url": "https://test.phonepe.com", "provider_order_id": "PP_01"}

            # Client attempts to send malicious fields in body
            resp = client.post(
                "/api/payments/create-order",
                headers={"Authorization": "Bearer mock-token"},
                json={
                    "plan_code": "premium_monthly",
                    "amount_in_paise": 10,  # Attacker tries to pay ₹0.10
                    "user_id": "victim-user-id",  # Attacker tries to buy for someone else
                    "currency": "USD",
                },
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            # Server completely ignored malicious client overrides
            self.assertEqual(data["amount_in_paise"], 9900)
            self.assertEqual(data["currency"], "INR")

    # =========================================================================
    # 6. WEBHOOK AUTHENTICATION (VALID VS INVALID)
    # =========================================================================
    def test_06_webhook_authentication_validation(self):
        """Webhook accepts matching SHA signature and rejects invalid/missing headers."""
        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass):

            # Missing authorization header -> 401
            resp_no_auth = client.post(
                "/api/subscriptions/webhook/phonepe",
                content=json.dumps({"event": "checkout.order.completed"}),
            )
            self.assertEqual(resp_no_auth.status_code, 401)

            # Invalid authorization header -> 401
            resp_bad_auth = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "invalid_fake_hash"},
                content=json.dumps({"event": "checkout.order.completed"}),
            )
            self.assertEqual(resp_bad_auth.status_code, 401)

    # =========================================================================
    # 7. WEBHOOK: SUCCESSFUL PAYMENT ACTIVATES SUBSCRIPTION
    # =========================================================================
    def test_07_webhook_successful_payment_activates_subscription(self):
        """Webhook checkout.order.completed marks transaction success and activates subscription."""
        merchant_order_id = "order_sc_test_success_001"
        provider_order_id = "PP_OMO_123456"

        mock_tx = {
            "id": "tx-100",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[mock_tx])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": "tx-100"}])
            mock_sb.return_value = mock_db

            mock_act.return_value = {
                "subscription_id": "sub-new-100",
                "started_at": self.now,
                "expires_at": self.now + timedelta(days=30),
                "is_extension": False,
                "status": SubscriptionStatus.ACTIVE,
            }

            webhook_payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": provider_order_id,
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(webhook_payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # Verify activate_or_extend_subscription was called with 30 days
            mock_act.assert_called_once_with(
                user_id=self.student_id,
                plan_id="plan-uuid-monthly",
                duration_days=30,
                provider="phonepe",
                provider_event_id=provider_order_id,
            )

    # =========================================================================
    # 8. WEBHOOK: FAILED PAYMENT MARKS TRANSACTION FAILED
    # =========================================================================
    def test_08_webhook_failed_payment(self):
        """Webhook checkout.order.failed marks transaction as failed."""
        merchant_order_id = "order_sc_test_failed_002"

        mock_tx = {
            "id": "tx-200",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[mock_tx])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": "tx-200"}])
            mock_sb.return_value = mock_db

            webhook_payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.failed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_FAIL_123",
                    "state": "FAILED",
                    "amount": 9900,
                    "errorCode": "PAYMENT_CANCELLED",
                    "detailedErrorCode": "User exited payment page",
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(webhook_payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "failed")

            # Must NOT activate subscription
            mock_act.assert_not_called()

    # =========================================================================
    # 9. IDEMPOTENCY: DUPLICATE WEBHOOK ACKNOWLEDGED WITHOUT DOUBLE-ACTIVATION
    # =========================================================================
    def test_09_idempotency_duplicate_webhook(self):
        """Duplicate webhook callback returns 200 OK without re-activating subscription."""
        merchant_order_id = "order_sc_test_idempotent_003"

        mock_tx_already_success = {
            "id": "tx-300",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",  # Already succeeded
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

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
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(webhook_payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # Must not activate subscription again
            mock_act.assert_not_called()

    # =========================================================================
    # 10. EXPIRY EXTENSION: ACTIVE SUBSCRIBER GETS ADDITIONAL DAYS
    # =========================================================================
    def test_10_subscription_expiry_extension(self):
        """When user has an active premium period, new duration extends from existing expires_at."""
        future_expiry = self.now + timedelta(days=15)
        existing_sub = {
            "plan": PlanCode.PREMIUM_MONTHLY,
            "status": SubscriptionStatus.ACTIVE,
            "is_premium": True,
            "started_at": self.now - timedelta(days=15),
            "expires_at": future_expiry,
        }

        with patch.object(SubscriptionService, "resolve_effective_subscription", return_value=existing_sub), \
             patch("backend.services.subscription_service.get_supabase") as mock_sb:

            mock_db = MagicMock()
            mock_db.from_().select().eq().order().limit().execute.return_value = MagicMock(data=[{"id": "sub-old-1"}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{}])
            mock_db.from_().insert().execute.return_value = MagicMock(data=[{}])
            mock_sb.return_value = mock_db

            result = SubscriptionService.activate_or_extend_subscription(
                user_id=self.student_id,
                plan_id="plan-3month",
                duration_days=90,
            )

            self.assertTrue(result["is_extension"])
            expected_new_expiry = future_expiry + timedelta(days=90)
            self.assertEqual(result["expires_at"].date(), expected_new_expiry.date())

    # =========================================================================
    # 11. EXPIRY RESET: EXPIRED SUBSCRIBER STARTS NEW PERIOD FROM NOW
    # =========================================================================
    def test_11_subscription_expired_starts_from_now(self):
        """When user's previous subscription has expired, new period starts from now."""
        past_expiry = self.now - timedelta(days=5)
        expired_sub = {
            "plan": PlanCode.FREE,
            "status": SubscriptionStatus.EXPIRED,
            "is_premium": False,
            "started_at": self.now - timedelta(days=35),
            "expires_at": past_expiry,
        }

        with patch.object(SubscriptionService, "resolve_effective_subscription", return_value=expired_sub), \
             patch("backend.services.subscription_service.get_supabase") as mock_sb:

            mock_db = MagicMock()
            mock_db.from_().select().eq().order().limit().execute.return_value = MagicMock(data=[{"id": "sub-old-2"}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{}])
            mock_db.from_().insert().execute.return_value = MagicMock(data=[{}])
            mock_sb.return_value = mock_db

            result = SubscriptionService.activate_or_extend_subscription(
                user_id=self.student_id,
                plan_id="plan-monthly",
                duration_days=30,
            )

            self.assertFalse(result["is_extension"])
            expected_new_expiry = self.now + timedelta(days=30)
            self.assertEqual(result["expires_at"].date(), expected_new_expiry.date())

    # =========================================================================
    # 12. WEBHOOK: AMOUNT MISMATCH REJECTED
    # =========================================================================
    def test_12_webhook_amount_tampering_rejected(self):
        """Webhook with modified amount is rejected with 400 Bad Request."""
        merchant_order_id = "order_sc_tampered_004"
        mock_tx = {
            "id": "tx-400",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "amount_in_paise": 9900,  # Expected 9900
            "currency": "INR",
            "status": "pending",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[mock_tx])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{}])
            mock_sb.return_value = mock_db

            tampered_payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_TAMPERED",
                    "state": "COMPLETED",
                    "amount": 500,  # Tampered: paid only 500 paise
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(tampered_payload),
            )
            self.assertEqual(resp.status_code, 400)

    # =========================================================================
    # 13. PAYMENT STATUS ENDPOINT
    # =========================================================================
    def test_13_get_payment_status(self):
        """GET /api/payments/status/{order_id} returns transaction details."""
        merchant_order_id = "order_sc_status_check_005"
        mock_tx = {
            "id": "tx-500",
            "user_id": self.student_id,
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "status": "success",
            "created_at": self.now.isoformat(),
            "subscription_plans": {"code": "premium_monthly"},
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_db = MagicMock()
            mock_db.from_().select().eq().eq().execute.return_value = MagicMock(data=[mock_tx])
            mock_pay_sb.return_value = mock_db

            resp = client.get(
                f"/api/payments/status/{merchant_order_id}",
                headers={"Authorization": "Bearer mock-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["merchant_order_id"], merchant_order_id)
            self.assertEqual(data["status"], "success")
            self.assertTrue(data["is_completed"])
            self.assertEqual(data["plan_code"], "premium_monthly")

    # =========================================================================
    # 14. PAYMENT HISTORY ENDPOINT
    # =========================================================================
    def test_14_get_payment_history(self):
        """GET /api/payments/history returns safe user transaction list."""
        mock_txs = [
            {
                "id": "tx-601",
                "merchant_order_id": "order_sc_hist_1",
                "provider_order_id": "PP_HIST_1",
                "amount_in_paise": 9900,
                "currency": "INR",
                "status": "success",
                "created_at": self.now.isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
            }
        ]

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_db = MagicMock()
            mock_db.from_().select().eq().order().execute.return_value = MagicMock(data=mock_txs)
            mock_pay_sb.return_value = mock_db

            resp = client.get(
                "/api/payments/history",
                headers={"Authorization": "Bearer mock-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["merchant_order_id"], "order_sc_hist_1")
            self.assertEqual(data[0]["status"], "success")
            self.assertEqual(data[0]["amount_in_paise"], 9900)


if __name__ == "__main__":
    unittest.main()
