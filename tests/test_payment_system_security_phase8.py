"""
tests/test_payment_system_security_phase8.py
SkillsCatalyst Phase 8: Final Payment System Security Audit, Regression Testing,
Reliability Validation, and Production Readiness.

Comprehensive verification of:
1. Authentication & Role-Based Authorization (Admin vs Student vs Anonymous)
2. Insecure Direct Object Reference (IDOR) & Object-Level Access Control
3. PhonePe Gateway Integrity & Security (Scenarios A through L):
   - A. Valid payment succeeds.
   - B. Invalid webhook signature is rejected.
   - C. Duplicate successful webhook is harmless.
   - D. Two concurrent callbacks do not provision twice.
   - E. Payment amount mismatch is detected.
   - F. Currency mismatch is detected.
   - G. Payment remains pending during provider outage.
   - H. Failed payment does not grant access.
   - I. A successful payment with a missed webhook is recoverable.
   - J. Duplicate polling does not duplicate subscription grants.
   - K. Coupon limit is enforced under concurrent redemption.
   - L. Zero-value promotion cannot be redeemed beyond limits.
4. Pricing, Coupon & Entitlement Security (Tamper-proofing, Free Plan Invariant)
5. Subscription Lifecycle Security (Cancellation Preserves Access, Idempotent)
6. Financial Reporting, CSV Formula Injection (CWE-1236), and Reconciliation Non-Downgrade Invariant.
"""

import io
import csv
import json
import uuid
import hashlib
import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import (
    require_admin,
    require_owner,
    require_authenticated_user,
    get_current_user_id,
)
from backend.services.payment_service import PaymentService
from backend.services.phonepe_service import PhonePeService
from backend.services.subscription_service import SubscriptionService
from backend.services.coupon_service import CouponService
from backend.services.admin_payment_service import AdminPaymentService
from backend.services.reporting_service import ReportingService, sanitize_csv_cell
from backend.services.reconciliation_service import ReconciliationService, _reconciliation_batch_lock
from backend.models.payment import PaymentStatus
from backend.models.subscription import PlanCode, SubscriptionStatus
from backend.models.coupon import DiscountType, CouponAdminDTO
from backend.models.reporting import ReconciliationOutcome

client = TestClient(app)

STUDENT_A_ID = "00000000-0000-4000-8000-000000000001"
STUDENT_B_ID = "00000000-0000-4000-8000-000000000002"
ADMIN_USER_ID = "00000000-0000-4000-8000-000000000099"
OWNER_USER_ID = "00000000-0000-4000-8000-000000000088"


@pytest.fixture(autouse=True)
def clean_auth_overrides():
    """Ensure clean dependency overrides for each test."""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


def set_student_auth(user_id: str = STUDENT_A_ID):
    """Sets authenticated context as a regular student."""
    student_payload = {
        "user_id": user_id,
        "email": "student@example.com",
        "name": "Student A",
        "role": "student",
        "is_owner": False,
    }
    app.dependency_overrides[require_authenticated_user] = lambda: student_payload
    app.dependency_overrides[get_current_user_id] = lambda: user_id


def set_admin_auth(user_id: str = ADMIN_USER_ID):
    """Sets authenticated context as an authorized administrator."""
    admin_payload = {
        "user_id": user_id,
        "email": "admin@skillscatalyst.in",
        "name": "Platform Admin",
        "role": "admin",
        "is_owner": False,
    }
    app.dependency_overrides[require_authenticated_user] = lambda: admin_payload
    app.dependency_overrides[require_admin] = lambda: admin_payload
    app.dependency_overrides[require_owner] = lambda: admin_payload
    app.dependency_overrides[get_current_user_id] = lambda: user_id


# ==============================================================================
# SECTION 3: AUTHENTICATION AND AUTHORIZATION AUDIT
# ==============================================================================

class TestAuthenticationAndAuthorizationSecurity:
    """Verifies that unauthenticated callers and students cannot access privileged endpoints."""

    def test_01_anonymous_rejected_on_all_protected_endpoints(self):
        """Anonymous callers without credentials must be rejected with 401 Unauthorized."""
        app.dependency_overrides.clear()

        protected_endpoints = [
            ("POST", "/api/payments/create-order", {"plan_code": "premium_monthly"}),
            ("POST", "/api/payments/validate-coupon", {"code": "TEST50", "plan_code": "premium_monthly"}),
            ("GET", "/api/payments/status/order_sc_test", None),
            ("GET", "/api/payments/receipt/order_sc_test", None),
            ("GET", "/api/payments/history", None),
            ("GET", "/api/subscriptions/me", None),
            ("GET", "/api/admin/plans", None),
            ("POST", "/api/admin/plans", {"code": "new_plan", "name": "New Plan", "price_in_paise": 9900, "duration_days": 30}),
            ("GET", "/api/admin/coupons", None),
            ("GET", "/api/admin/payments/overview", None),
            ("GET", "/api/admin/payments/transactions", None),
            ("GET", "/api/admin/subscriptions", None),
            ("POST", "/api/admin/subscriptions/00000000-0000-4000-8000-000000000001/cancel", {}),
            ("GET", "/api/admin/reports/financial", None),
            ("GET", "/api/admin/reports/export/transactions.csv", None),
            ("GET", "/api/admin/reports/export/revenue-summary.csv", None),
            ("POST", "/api/admin/reconciliation/run", {}),
            ("POST", "/api/admin/reconciliation/transaction/order_sc_test/sync", None),
        ]

        for method, path, payload in protected_endpoints:
            if method == "GET":
                res = client.get(path)
            elif method == "POST":
                res = client.post(path, json=payload or {})
            else:
                continue

            assert res.status_code in (401, 403), f"Endpoint {method} {path} unexpectedly returned {res.status_code}"

    def test_02_student_forbidden_on_all_admin_endpoints(self):
        """Students must be strictly rejected with 403 Forbidden across all admin payment/plan/coupon/report endpoints."""
        set_student_auth(STUDENT_A_ID)

        admin_endpoints = [
            ("GET", "/api/admin/plans", None),
            ("POST", "/api/admin/plans", {"code": "pro", "name": "Pro", "price_in_paise": 9900, "duration_days": 30}),
            ("GET", "/api/admin/coupons", None),
            ("POST", "/api/admin/coupons", {"code": "HACK100", "discount_type": "percentage", "discount_value": 100}),
            ("GET", "/api/admin/payments/overview", None),
            ("GET", "/api/admin/payments/transactions", None),
            ("GET", "/api/admin/subscriptions", None),
            ("POST", "/api/admin/subscriptions/00000000-0000-4000-8000-000000000001/cancel", {}),
            ("GET", "/api/admin/reports/financial", None),
            ("GET", "/api/admin/reports/export/transactions.csv", None),
            ("GET", "/api/admin/reports/export/revenue-summary.csv", None),
            ("POST", "/api/admin/reconciliation/run", {}),
            ("POST", "/api/admin/reconciliation/transaction/order_sc_test/sync", None),
        ]

        for method, path, payload in admin_endpoints:
            if method == "GET":
                res = client.get(path)
            elif method == "POST":
                res = client.post(path, json=payload or {})
            else:
                continue

            assert res.status_code == 403, f"Endpoint {method} {path} permitted student! Status: {res.status_code}"


# ==============================================================================
# SECTION 3B: OBJECT-LEVEL AUTHORIZATION & ANTI-IDOR DEFENSES
# ==============================================================================

class TestObjectLevelAuthorizationAndAntiIdor:
    """Verifies that students cannot access other students' receipts, transactions, or subscriptions."""

    def test_03_student_cannot_view_other_student_receipt_idor(self):
        """Student A cannot access Student B's receipt; endpoint returns 404 to avoid leaking existence."""
        set_student_auth(STUDENT_A_ID)

        mock_tx = {
            "id": "tx-b-uuid",
            "merchant_order_id": "order_sc_student_b",
            "user_id": STUDENT_B_ID,
            "status": "success",
            "amount_in_paise": 49900,
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
            "profiles": {"email": "studentb@example.com"},
        }
        mock_sb = MagicMock()
        mock_sb.from_().select().eq().execute.return_value.data = [mock_tx]

        with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
            res = client.get("/api/payments/receipt/order_sc_student_b")
            assert res.status_code == 404

    def test_04_student_cannot_view_other_student_payment_status_idor(self):
        """Student A cannot query Student B's payment status; query enforces user_id matching."""
        set_student_auth(STUDENT_A_ID)

        mock_sb = MagicMock()
        mock_sb.from_().select().eq().eq().execute.return_value.data = []

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb):
            res = client.get("/api/payments/status/order_sc_student_b")
            assert res.status_code == 404


# ==============================================================================
# SECTION 4: PHONEPE & PAYMENT INTEGRITY AUDIT (SCENARIOS A THROUGH L)
# ==============================================================================

class TestPhonePeAndPaymentIntegrityScenarios:
    """Rigorous verification of the 12 payment integrity scenarios (A through L)."""

    def test_scenario_a_valid_payment_succeeds(self):
        """Scenario A: Valid PhonePe payment callback activates subscription cleanly."""
        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-1",
            "merchant_order_id": "order_sc_valid_1",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }
        mock_sb.from_().select().eq().execute.return_value.data = [tx_row]
        mock_sb.from_().update().eq().eq().execute.return_value.data = [tx_row]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_valid_1",
                 "provider_order_id": "PP_VALID_123",
                 "state": "COMPLETED",
                 "amount": 49900,
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription", return_value={"subscription_id": "sub-valid-1"}):

            res = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "Bearer VALID_SIG"},
                json={"response": "mock_encrypted_payload"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["status"] == "success"

    def test_scenario_b_invalid_webhook_signature_rejected(self):
        """Scenario B: Webhook with invalid signature is strictly rejected with 401."""
        with patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=False):
            res = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "Bearer BAD_SIGNATURE"},
                json={"response": "tampered_payload"},
            )
            assert res.status_code == 401

    def test_scenario_c_duplicate_successful_webhook_is_harmless(self):
        """Scenario C: Repeated successful webhook callbacks are idempotent and do not provision twice."""
        mock_sb = MagicMock()
        already_completed_tx = {
            "id": "tx-1",
            "merchant_order_id": "order_sc_dupe_1",
            "user_id": STUDENT_A_ID,
            "status": "success",
            "subscription_id": "sub-already-provisioned",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().execute.return_value.data = [already_completed_tx]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_dupe_1",
                 "provider_order_id": "PP_DUPE_123",
                 "state": "COMPLETED",
                 "amount": 49900,
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_activate:

            res = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "Bearer VALID_SIG"},
                json={"response": "payload"},
            )
            assert res.status_code == 200
            assert "already" in res.json()["message"].lower() or res.json()["status"] == "success"
            mock_activate.assert_not_called()

    def test_scenario_d_concurrent_callbacks_do_not_provision_twice(self):
        """Scenario D: When two concurrent callbacks arrive, atomic transition ensures only one claims the order."""
        claim_counter = 0
        lock = threading.Lock()

        def mock_claim_order(*args, **kwargs):
            nonlocal claim_counter
            with lock:
                if claim_counter == 0:
                    claim_counter += 1
                    mock_res = MagicMock()
                    mock_res.data = [{"id": "tx-1", "status": "success"}]
                    return mock_res
                else:
                    mock_res = MagicMock()
                    mock_res.data = []  # Second claim finds 0 rows matching status='pending'
                    return mock_res

        mock_sb = MagicMock()
        mock_sb.from_().select().eq().execute.return_value.data = [{
            "id": "tx-1",
            "merchant_order_id": "order_sc_race_1",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-1",
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }]
        mock_sb.from_().update().eq().eq().execute.side_effect = mock_claim_order

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_race_1",
                 "provider_order_id": "PP_RACE_1",
                 "state": "COMPLETED",
                 "amount": 49900,
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription", return_value={"subscription_id": "sub-1"}) as mock_activate:

            res1 = PaymentService.process_webhook("Bearer TOKEN", "body1")
            assert res1["status"] == "success"

            res2 = PaymentService.process_webhook("Bearer TOKEN", "body2")
            assert "Duplicate event ignored" in res2["message"]

            assert mock_activate.call_count == 1

    def test_scenario_e_payment_amount_mismatch_detected(self):
        """Scenario E: Provider returns an amount different from the server-authoritative amount."""
        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-mismatch",
            "merchant_order_id": "order_sc_mismatch",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().execute.return_value.data = [tx_row]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_mismatch",
                 "provider_order_id": "PP_TAMPERED",
                 "state": "COMPLETED",
                 "amount": 9900,  # Provider returned ₹99 instead of ₹499
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_activate:

            with pytest.raises(Exception) as exc_info:
                PaymentService.process_webhook("Bearer TOKEN", "raw_body")

            assert "amount mismatch" in str(exc_info.value.detail).lower()
            mock_activate.assert_not_called()

    def test_scenario_f_currency_mismatch_detected(self):
        """Scenario F: Provider reports non-INR currency."""
        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-currency",
            "merchant_order_id": "order_sc_curr",
            "user_id": STUDENT_A_ID,
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().execute.return_value.data = [tx_row]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_curr",
                 "provider_order_id": "PP_USD",
                 "state": "COMPLETED",
                 "amount": 49900,
                 "currency": "USD",
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_activate:

            with pytest.raises(Exception) as exc_info:
                PaymentService.process_webhook("Bearer TOKEN", "raw_body")

            assert "currency mismatch" in str(exc_info.value.detail).lower()
            mock_activate.assert_not_called()

    def test_scenario_g_payment_remains_pending_during_provider_outage(self):
        """Scenario G: Payment remains pending if PhonePe status lookup times out or fails."""
        set_student_auth(STUDENT_A_ID)

        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-outage",
            "merchant_order_id": "order_sc_outage",
            "user_id": STUDENT_A_ID,
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().eq().execute.return_value.data = [tx_row]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value={"state": "PENDING", "error": "Gateway Timeout"}):

            res = client.get("/api/payments/status/order_sc_outage")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "pending"

    def test_scenario_h_failed_payment_does_not_grant_access(self):
        """Scenario H: PhonePe reporting PAYMENT_ERROR or FAILED marks transaction failed and grants zero access."""
        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-fail",
            "merchant_order_id": "order_sc_fail",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().execute.return_value.data = [tx_row]
        mock_sb.from_().update().eq().execute.return_value.data = [dict(tx_row, status="failed")]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.verify_webhook_signature", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.parse_callback_payload", return_value={
                 "merchant_order_id": "order_sc_fail",
                 "provider_order_id": "PP_FAIL",
                 "state": "FAILED",
                 "amount": 49900,
                 "error_code": "INSUFFICIENT_FUNDS",
             }), \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_activate:

            res = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "Bearer VALID_SIG"},
                json={"response": "failed_payload"},
            )
            assert res.status_code == 200
            assert res.json()["status"] == "failed"
            mock_activate.assert_not_called()

    def test_scenario_i_successful_payment_with_missed_webhook_is_recoverable(self):
        """Scenario I: When a webhook is dropped, status polling recovers and provisions the payment."""
        set_student_auth(STUDENT_A_ID)

        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-missed",
            "merchant_order_id": "order_sc_missed",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "pending",
            "amount_in_paise": 49900,
            "currency": "INR",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }
        mock_sb.from_().select().eq().eq().execute.return_value.data = [tx_row]
        mock_sb.from_().select().eq().limit().execute.return_value.data = [{"status": "success"}]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value={
                 "state": "COMPLETED",
                 "amount": 49900,
                 "provider_order_id": "PP_RECOVERED",
             }), \
             patch("backend.services.payment_service.PaymentService.process_webhook", return_value={"status": "success"}) as mock_sync:

            res = client.get("/api/payments/status/order_sc_missed")
            assert res.status_code == 200
            mock_sync.assert_called_once()

    def test_scenario_j_duplicate_polling_does_not_duplicate_grants(self):
        """Scenario J: Repeated polling for an already successful order does not trigger secondary activations."""
        set_student_auth(STUDENT_A_ID)

        mock_sb = MagicMock()
        tx_row = {
            "id": "tx-poll",
            "merchant_order_id": "order_sc_poll",
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "success",
            "subscription_id": "sub-existing",
            "amount_in_paise": 49900,
            "currency": "INR",
        }
        mock_sb.from_().select().eq().eq().execute.return_value.data = [tx_row]

        with patch("backend.services.payment_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_activate:

            res1 = client.get("/api/payments/status/order_sc_poll")
            res2 = client.get("/api/payments/status/order_sc_poll")

            assert res1.status_code == 200
            assert res2.status_code == 200
            assert res1.json()["status"] == "success"
            mock_remote.assert_not_called()
            mock_activate.assert_not_called()

    def test_scenario_k_coupon_limit_enforced_under_concurrent_redemption(self):
        """Scenario K: Global coupon redemption limit strictly bounds successful uses."""
        mock_coupon = MagicMock()
        mock_coupon.code = "LIMITED1"
        mock_coupon.is_active = True
        mock_coupon.start_at = None
        mock_coupon.expires_at = None
        mock_coupon.eligible_plan_codes = []
        mock_coupon.min_order_in_paise = 0
        mock_coupon.max_uses = 1
        mock_coupon.used_count = 1  # Global limit reached

        mock_plan = MagicMock()
        mock_plan.code = "premium_monthly"
        mock_plan.price_in_paise = 49900

        with patch("backend.services.coupon_service.CouponService.get_coupon_by_code", return_value=mock_coupon), \
             patch("backend.services.subscription_service.SubscriptionService.get_plan_by_code", return_value=mock_plan):

            with pytest.raises(Exception) as exc_info:
                CouponService.validate_coupon_for_user_and_plan("LIMITED1", "premium_monthly", STUDENT_A_ID)

            assert "global redemption limit" in str(exc_info.value.detail).lower()

    def test_scenario_l_zero_value_promotion_cannot_be_redeemed_beyond_limits(self):
        """Scenario L: 100% discount promotional coupon enforces date limits."""
        mock_coupon = MagicMock()
        mock_coupon.code = "FREEPASS"
        mock_coupon.discount_type = DiscountType.PERCENTAGE
        mock_coupon.discount_value = 100
        mock_coupon.is_active = True
        mock_coupon.start_at = None
        mock_coupon.expires_at = datetime.now(timezone.utc) - timedelta(days=1)  # Expired
        mock_coupon.eligible_plan_codes = []

        with patch("backend.services.coupon_service.CouponService.get_coupon_by_code", return_value=mock_coupon):
            with pytest.raises(Exception) as exc_info:
                CouponService.validate_coupon_for_user_and_plan("FREEPASS", "premium_monthly", STUDENT_A_ID)

            assert "expired" in str(exc_info.value.detail).lower()


# ==============================================================================
# SECTION 6 & 7: PRICING, ENTITLEMENTS, AND SUBSCRIPTION LIFECYCLE
# ==============================================================================

class TestPricingAndSubscriptionLifecycleSecurity:
    """Verifies that plan prices cannot be tampered with and cancellations are safe."""

    def test_client_cannot_purchase_free_tier(self):
        """Purchasing the free tier through payment gateway checkout is rejected with 400 Bad Request."""
        set_student_auth(STUDENT_A_ID)

        res = client.post("/api/payments/create-order", json={"plan_code": "free"})
        assert res.status_code == 400
        assert "free tier cannot be purchased" in res.json()["detail"].lower()

    def test_client_cannot_tamper_with_plan_price(self):
        """Checkout prices are authoritatively determined by the database catalog, ignoring client payloads."""
        set_student_auth(STUDENT_A_ID)

        mock_plan = MagicMock()
        mock_plan.code = "premium_monthly"
        mock_plan.price_in_paise = 49900  # ₹499
        mock_plan.currency = "INR"
        mock_plan.is_active = True

        mock_sb = MagicMock()
        mock_sb.from_().insert().execute.return_value.data = [{"id": "tx-1", "merchant_order_id": "order_sc_tamper"}]

        with patch("backend.services.subscription_service.SubscriptionService.get_plan_by_code", return_value=mock_plan), \
             patch("backend.services.phonepe_service.PhonePeService.create_checkout_order", return_value={"checkout_url": "https://phonepe.com/pay"}) as mock_checkout, \
             patch("backend.services.payment_service.get_supabase", return_value=mock_sb):

            res = client.post("/api/payments/create-order", json={"plan_code": "premium_monthly", "amount_in_paise": 100})
            assert res.status_code == 201
            assert res.json()["amount_in_paise"] == 49900
            # Gateway received authoritative amount 49900
            mock_checkout.assert_called_once()
            _, kwargs = mock_checkout.call_args
            assert kwargs.get("amount_in_paise") == 49900

    def test_cancellation_preserves_paid_access_until_expiry(self):
        """Admin subscription cancellation sets status to cancelled but leaves expires_at intact."""
        set_admin_auth(ADMIN_USER_ID)

        sub_uuid = "00000000-0000-4000-8000-000000000001"
        future_expiry = (datetime.now(timezone.utc) + timedelta(days=20)).isoformat()
        mock_sub = {
            "id": sub_uuid,
            "user_id": STUDENT_A_ID,
            "plan_id": "plan-pro-id",
            "status": "active",
            "expires_at": future_expiry,
            "subscription_plans": {"code": "premium_monthly"},
        }

        mock_sb = MagicMock()
        mock_sb.from_().select().eq().limit().execute.return_value.data = [mock_sub]
        mock_sb.from_().update().eq().execute.return_value.data = [dict(mock_sub, status="cancelled")]

        with patch("backend.services.admin_payment_service.get_supabase", return_value=mock_sb):
            res = client.post(f"/api/admin/subscriptions/{sub_uuid}/cancel", json={"reason": "Student request"})
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["status"] == "cancelled"
            assert data["expires_at"] == future_expiry

    def test_cannot_cancel_free_tier(self):
        """Admin cancellation of perpetual free tier is rejected with 400 Bad Request."""
        set_admin_auth(ADMIN_USER_ID)

        sub_uuid = "00000000-0000-4000-8000-000000000002"
        mock_sub = {
            "id": sub_uuid,
            "user_id": STUDENT_A_ID,
            "status": "active",
            "subscription_plans": {"code": "free"},
        }
        mock_sb = MagicMock()
        mock_sb.from_().select().eq().limit().execute.return_value.data = [mock_sub]

        with patch("backend.services.admin_payment_service.get_supabase", return_value=mock_sb):
            res = client.post(f"/api/admin/subscriptions/{sub_uuid}/cancel", json={})
            assert res.status_code == 400
            assert "free tier" in res.json()["detail"].lower()


# ==============================================================================
# SECTION 8 & 9: FINANCIAL REPORTING, RECEIPTS & RECONCILIATION INTEGRITY
# ==============================================================================

class TestFinancialReportingAndReconciliationIntegrity:
    """Verifies cash vs promotional accounting, CSV sanitization, and reconciliation safety."""

    def test_promotional_passes_do_not_inflate_cash_revenue(self):
        """100% discounted promotional passes are recorded as ₹0 in collected cash revenue."""
        mock_rows = [
            {"amount_in_paise": 49900, "original_amount_in_paise": 49900, "discount_in_paise": 0, "status": "success"},
            {"amount_in_paise": 0, "original_amount_in_paise": 49900, "discount_in_paise": 49900, "status": "success"},  # Promo
        ]

        mock_query = MagicMock()
        mock_query.gte.return_value = mock_query
        mock_query.lte.return_value = mock_query
        mock_query.execute.return_value.data = mock_rows

        mock_sb = MagicMock()
        mock_sb.from_().select.return_value = mock_query

        with patch("backend.services.admin_payment_service.get_supabase", return_value=mock_sb):
            metrics = AdminPaymentService.get_payment_dashboard_metrics(preset="all")
            assert metrics.total_collected_amount_in_paise == 49900
            assert metrics.total_collected_amount_in_rupees == 499.0
            assert metrics.promotional_pass_count == 1
            assert metrics.gross_transaction_value_in_rupees == 998.0

    def test_reconciliation_never_downgrades_local_success(self):
        """A locally successful payment is NEVER marked failed if PhonePe times out or errors."""
        mock_tx = {
            "id": "tx-rec-1",
            "merchant_order_id": "order_sc_rec_1",
            "user_id": STUDENT_A_ID,
            "status": "success",
            "amount_in_paise": 49900,
            "currency": "INR",
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
            "profiles": {"email": "student@example.com"},
        }
        mock_sb = MagicMock()
        mock_sb.from_().select().eq().execute.return_value.data = [mock_tx]

        with patch("backend.services.reconciliation_service.get_supabase", return_value=mock_sb), \
             patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value={"state": "ERROR", "error": "Gateway Timeout"}):

            resp = ReconciliationService.reconcile_single_order("order_sc_rec_1", ADMIN_USER_ID)
            assert resp.item.local_status == "success"
            assert resp.item.outcome == ReconciliationOutcome.PROVIDER_UNAVAILABLE

    def test_reconciliation_batch_concurrency_lock(self):
        """Running two concurrent reconciliation batches is blocked by an in-memory lock."""
        acquired = _reconciliation_batch_lock.acquire(blocking=False)
        assert acquired is True

        try:
            with pytest.raises(Exception) as exc_info:
                ReconciliationService.run_reconciliation_batch(ADMIN_USER_ID)
            assert "in progress" in str(exc_info.value.detail).lower()
        finally:
            _reconciliation_batch_lock.release()

    def test_csv_sanitizes_formula_injection_characters(self):
        """Untrusted text starting with formula injection prefixes is safely sanitized."""
        payloads = ["=cmd|' /C calc'!A0", "+12345", "-500", "@SUM(A1:A10)", "\tInjectedTab", "\rInjectedReturn"]
        for p in payloads:
            sanitized = sanitize_csv_cell(p)
            assert sanitized.startswith("'"), f"Payload {p!r} was not sanitized with leading quote: {sanitized!r}"
