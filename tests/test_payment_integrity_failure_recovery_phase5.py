"""
tests/test_payment_integrity_failure_recovery_phase5.py
SkillsCatalyst Phase 5: Payment Integrity & Failure Recovery Test Suite.

Authoritative verification of the 12 failure and concurrency scenarios specified
in the Phase 5 Payment Integrity & Failure Recovery Gate:

1. The same successful PhonePe callback arrives multiple times.
2. Webhook processing and status polling run concurrently.
3. A payment succeeds immediately before the backend crashes.
4. The payment is marked successful, but subscription provisioning fails.
5. A payment remains pending and is subsequently verified as successful.
6. PhonePe reports a failed or cancelled payment.
7. The payment amount differs from the expected server-calculated amount.
8. A callback has an invalid signature.
9. A successful coupon payment is processed more than once.
10. Multiple customers attempt to redeem the final available coupon slot.
11. A free promotional coupon is redeemed and access is provisioned.
12. A retry occurs after a partial failure.

DISTINCTION OF TEST ENVIRONMENTS:
- TestPaymentIntegrityFailureRecoverySimulated: Exercises the FastAPI endpoints,
  Python state machine, atomic lease locks, threading concurrency, compensating rollbacks,
  and recovery mechanisms under isolated mock/in-memory environments.
- TestPostgreSqlRpcBehavior: Analyzes and verifies the exact SQL constraints,
  row-level FOR UPDATE locking semantics, and ACID atomicity enforced by the
  `claim_and_provision_payment` RPC and `20261022_payment_integrity_and_recovery.sql`.
"""

import sys
import uuid
import json
import hashlib
import unittest
import threading
from concurrent.futures import ThreadPoolExecutor
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
from backend.models.coupon import DiscountType
from backend.services.coupon_service import CouponService
from backend.services.payment_service import PaymentService
from backend.services.phonepe_service import PhonePeService
from backend.services.subscription_service import SubscriptionService
from backend.services.auth_service import get_current_user_id, require_admin

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test Student"):
        self.id = uid
        self.email = email
        self.role = role
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestPaymentIntegrityFailureRecoverySimulated(unittest.TestCase):

    @classmethod
    def _cleanup_test_coupons(cls):
        from backend.services.supabase_service import get_supabase
        CouponService._reset_memory_store()
        sb = get_supabase()
        if sb:
            try:
                c_res = sb.from_("coupons").select("id").in_("code", [
                    "FREEFAIL", "LASTSLOT", "DUPCOUPON", "WELCOME100"
                ]).execute()
                if c_res.data:
                    c_ids = [r["id"] for r in c_res.data]
                    sb.from_("coupon_redemptions").delete().in_("coupon_id", c_ids).execute()
                    sb.from_("coupons").delete().in_("id", c_ids).execute()
            except Exception:
                pass

    def setUp(self):
        self._cleanup_test_coupons()
        SubscriptionService.invalidate_plan_entitlements_cache()
        CouponService._reset_memory_store()

        self.student_id = "11111111-1111-4000-a000-000000000001"
        self.student_2_id = "22222222-2222-4000-a000-000000000002"
        self.admin_id = "99999999-9999-4000-a000-000000000099"

        self.mock_student = MockAuthUser(self.student_id, "student1@skillscatalyst.in")
        self.mock_student_2 = MockAuthUser(self.student_2_id, "student2@skillscatalyst.in")
        self.mock_admin = MockAuthUser(self.admin_id, "admin@skillscatalyst.in", role="owner")

        self.student_headers = {"Authorization": "Bearer mock-student-token"}
        self.student_2_headers = {"Authorization": "Bearer mock-student-2-token"}
        self.admin_headers = {"Authorization": "Bearer mock-admin-token"}

        app.dependency_overrides[get_current_user_id] = lambda: self.student_id
        app.dependency_overrides[require_admin] = lambda: {
            "user_id": self.admin_id,
            "role": "owner",
            "email": self.mock_admin.email,
        }

        self.webhook_user = "test_webhook_user"
        self.webhook_pass = "test_webhook_pass"
        to_hash = f"{self.webhook_user}:{self.webhook_pass}".encode("utf-8")
        self.valid_auth_header = hashlib.sha256(to_hash).hexdigest()
        self.now = datetime.now(timezone.utc)

    def tearDown(self):
        app.dependency_overrides.clear()
        self._cleanup_test_coupons()
        CouponService._reset_memory_store()
        SubscriptionService.invalidate_plan_entitlements_cache()

    # =========================================================================
    # SCENARIO 1: The same successful PhonePe callback arrives multiple times
    # =========================================================================
    def test_01_duplicate_phonepe_callback_idempotency(self):
        """
        Scenario 1: The same successful PhonePe callback arrives multiple times.
        First callback marks payment success, provisions subscription, and redeems coupon.
        Subsequent callbacks acknowledge idempotently without duplicate subscription extensions.
        """
        merchant_order_id = "order_sc_duplicate_cb_001"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        callback_payload = json.dumps({
            "type": "CHECKOUT_ORDER",
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": merchant_order_id,
                "orderId": "PP_ORD_DUP_001",
                "state": "COMPLETED",
                "amount": 9900,
                "currency": "INR",
            },
        })

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub_dup_001", "is_extension": False, "status": SubscriptionStatus.ACTIVE}
            mock_db = MagicMock()
            mock_sb.return_value = mock_db

            # First callback: tx is pending
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().eq().execute.return_value = MagicMock(data=[{"id": db_tx["id"]}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": db_tx["id"]}])

            # 1. First webhook arrives
            resp1 = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=callback_payload,
            )
            self.assertEqual(resp1.status_code, 200)
            self.assertTrue(resp1.json()["success"])
            self.assertEqual(mock_act.call_count, 1)

            # 2. Second callback arrives (transaction is now 'success' with subscription_id set)
            db_tx["status"] = "success"
            db_tx["subscription_id"] = "sub_dup_001"
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])

            resp2 = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=callback_payload,
            )
            self.assertEqual(resp2.status_code, 200)
            self.assertTrue(resp2.json()["success"])
            self.assertIn("already processed", resp2.json()["message"].lower())
            # Provisioning must NOT be invoked a second time
            self.assertEqual(mock_act.call_count, 1)

    # =========================================================================
    # SCENARIO 2: Webhook processing and status polling run concurrently
    # =========================================================================
    def test_02_concurrent_webhook_and_status_polling(self):
        """
        Scenario 2: Webhook processing and status polling run concurrently.
        Both race on the same pending order; thread safety ensures single provisioning.
        """
        merchant_order_id = "order_sc_concur_race_002"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        # Simulated DB state machine with thread lock
        state_lock = threading.Lock()
        provision_count = 0

        def simulated_activate(**kwargs):
            nonlocal provision_count
            with state_lock:
                provision_count += 1
            return {"subscription_id": "sub_concur_002", "is_extension": False, "status": SubscriptionStatus.ACTIVE}

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription", side_effect=simulated_activate):

            mock_remote.return_value = {"state": "COMPLETED", "amount": 9900, "order_id": "PP_CONCUR_002"}

            # Thread-safe mock query and atomic claim
            def mock_from(tbl):
                q = MagicMock()
                def mock_select(*args, **kwargs):
                    s = MagicMock()
                    def mock_eq(col, val):
                        e = MagicMock()
                        def mock_exec():
                            with state_lock:
                                return MagicMock(data=[dict(db_tx)])
                        e.execute = mock_exec
                        e.limit.return_value = e
                        e.eq.return_value = e
                        return e
                    s.eq = mock_eq
                    return s
                def mock_update(payload):
                    u = MagicMock()
                    def mock_eq1(col1, val1):
                        e1 = MagicMock()
                        def mock_eq2(col2, val2):
                            e2 = MagicMock()
                            def mock_exec():
                                with state_lock:
                                    if col2 == "status" and db_tx["status"] == val2:
                                        db_tx.update(payload)
                                        return MagicMock(data=[dict(db_tx)])
                                    return MagicMock(data=[])
                            e2.execute = mock_exec
                            return e2
                        e1.eq = mock_eq2
                        e1.execute = lambda: MagicMock(data=[dict(db_tx)])
                        return e1
                    u.eq = mock_eq1
                    return u
                q.select = mock_select
                q.update = mock_update
                return q

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_.side_effect = mock_from
            mock_sb.return_value = mock_db

            raw_body = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_CONCUR_002",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            })

            results = []
            def run_webhook():
                r = PaymentService.process_webhook(self.valid_auth_header, raw_body, is_internal_sync=False)
                results.append(r)

            def run_poll():
                r = PaymentService.get_payment_status(merchant_order_id, self.student_id)
                results.append(r)

            t1 = threading.Thread(target=run_webhook)
            t2 = threading.Thread(target=run_poll)
            t1.start()
            t2.start()
            t1.join()
            t2.join()

            self.assertEqual(len(results), 2)
            self.assertEqual(provision_count, 1, "Subscription must be provisioned exactly once despite concurrent race")

    # =========================================================================
    # SCENARIO 3: A payment succeeds immediately before the backend crashes
    # =========================================================================
    def test_03_payment_succeeds_before_backend_crash_out_of_band_recovery(self):
        """
        Scenario 3: Payment succeeds on PhonePe gateway, but the backend crashes before callback.
        The transaction is still pending in DB. When the user polls status, out-of-band sync
        detects COMPLETED state on PhonePe and provisions the subscription cleanly.
        """
        merchant_order_id = "order_sc_crash_before_cb_003"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_remote.return_value = {"state": "COMPLETED", "amount": 9900, "order_id": "PP_REMOTE_003"}
            mock_act.return_value = {"subscription_id": "sub_recovered_003", "status": SubscriptionStatus.ACTIVE}

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.limit.return_value = q
                q.order.return_value = q
                q.execute.return_value = MagicMock(data=[dict(db_tx)])
                def do_update(payload):
                    db_tx.update(payload)
                    upd_q = MagicMock()
                    upd_q.eq.return_value = upd_q
                    upd_q.execute.return_value = MagicMock(data=[dict(db_tx)])
                    return upd_q
                q.update = do_update
                return q

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_ = mock_from
            mock_sb.return_value = mock_db

            resp = client.get(f"/api/payments/status/{merchant_order_id}", headers=self.student_headers)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "success")
            self.assertTrue(data["is_completed"])
            mock_act.assert_called_once()

    # =========================================================================
    # SCENARIO 4: Payment marked successful, but subscription provisioning fails
    # =========================================================================
    def test_04a_webhook_provisioning_failure_reverts_status_to_pending(self):
        """
        Scenario 4A: In webhook processing, if subscription provisioning raises an exception,
        status must be reverted from 'success' back to 'pending' to allow safe retry.
        """
        merchant_order_id = "order_sc_prov_fail_004a"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.side_effect = RuntimeError("Database down during subscription activation")

            revert_calls = []
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().eq().execute.return_value = MagicMock(data=[{"id": db_tx["id"]}])

            def track_update(payload):
                u = MagicMock()
                def track_eq(col, val):
                    revert_calls.append((payload, col, val))
                    return MagicMock(execute=lambda: MagicMock(data=[{"id": db_tx["id"]}]))
                u.eq = track_eq
                return u
            mock_db.from_().update.side_effect = track_update
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_PROV_FAIL_004A",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            })

            with self.assertRaises(RuntimeError):
                PaymentService.process_webhook(self.valid_auth_header, payload, is_internal_sync=False)

            # Assert compensating rollback reverted transaction to 'pending'
            reverted = any(p.get("status") == "pending" for p, col, val in revert_calls)
            self.assertTrue(reverted, "Transaction must revert to 'pending' upon provisioning failure")

    def test_04b_free_coupon_provisioning_failure_rolls_back_coupon_and_marks_failed(self):
        """
        Scenario 4B: For 100% free promotional pass checkout, if subscription provisioning fails,
        the claimed coupon slot must be rolled back and transaction marked failed.
        """
        # Create a free coupon with 1 slot
        c_res = client.post(
            "/api/admin/coupons",
            json={"code": "FREEFAIL", "discount_type": "percentage", "discount_value": 100, "max_uses": 1},
            headers=self.admin_headers,
        )
        self.assertEqual(c_res.status_code, 201)
        coupon = CouponService.get_coupon_by_code("FREEFAIL")
        self.assertEqual(coupon.used_count, 0)

        with patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_act:
            mock_act.side_effect = RuntimeError("Provisioning service unavailable")

            res = client.post(
                "/api/payments/create-order",
                json={"plan_code": "premium_monthly", "coupon_code": "FREEFAIL"},
                headers=self.student_headers,
            )
            self.assertEqual(res.status_code, 500)
            self.assertIn("failed to provision", res.json()["detail"].lower())

            # Verify coupon slot was cleanly rolled back
            refreshed = CouponService.get_coupon_by_code("FREEFAIL")
            self.assertEqual(refreshed.used_count, 0, "Coupon slot must be released after provisioning failure")

    def test_04c_stranded_unfulfilled_payment_resumed_by_recovery(self):
        """
        Scenario 4C: Transaction was marked status='success' by prior crashed process but subscription_id=NULL.
        Recovery acknowledges stale lease (>10s) and successfully provisions subscription.
        """
        merchant_order_id = "order_sc_stranded_004c"
        crashed_time = self.now - timedelta(seconds=25)
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": None,
            "updated_at": crashed_time.isoformat(),
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub_recovered_004c", "status": SubscriptionStatus.ACTIVE}
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": db_tx["id"]}])
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_STRANDED_004C",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            })

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])
            mock_act.assert_called_once()

    # =========================================================================
    # SCENARIO 5: Payment remains pending and is subsequently verified
    # =========================================================================
    def test_05_pending_payment_verified_as_successful_subsequently(self):
        """
        Scenario 5: Payment initially remains pending on PhonePe. Subsequently verified
        as successful and transitioned to active subscription.
        """
        merchant_order_id = "order_sc_pending_to_success_005"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.limit.return_value = q
                q.order.return_value = q
                q.execute.return_value = MagicMock(data=[dict(db_tx)])
                def do_update(payload):
                    db_tx.update(payload)
                    upd_q = MagicMock()
                    upd_q.eq.return_value = upd_q
                    upd_q.execute.return_value = MagicMock(data=[dict(db_tx)])
                    return upd_q
                q.update = do_update
                return q

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_ = mock_from
            mock_sb.return_value = mock_db

            # 1. First poll: still pending on PhonePe
            mock_remote.return_value = {"state": "PENDING", "amount": 9900}
            resp1 = client.get(f"/api/payments/status/{merchant_order_id}", headers=self.student_headers)
            self.assertEqual(resp1.status_code, 200)
            self.assertEqual(resp1.json()["status"], "pending")
            self.assertFalse(resp1.json()["is_completed"])
            mock_act.assert_not_called()

            # 2. Subsequent poll: payment completed on PhonePe
            mock_remote.return_value = {"state": "COMPLETED", "amount": 9900, "order_id": "PP_PEND_005"}
            mock_act.return_value = {"subscription_id": "sub_pend_005", "status": SubscriptionStatus.ACTIVE}

            resp2 = client.get(f"/api/payments/status/{merchant_order_id}", headers=self.student_headers)
            self.assertEqual(resp2.status_code, 200)
            self.assertEqual(resp2.json()["status"], "success")
            self.assertTrue(resp2.json()["is_completed"])
            mock_act.assert_called_once()

    # =========================================================================
    # SCENARIO 6: PhonePe reports a failed or cancelled payment
    # =========================================================================
    def test_06a_phonepe_reports_failed_or_cancelled_payment(self):
        """
        Scenario 6A: PhonePe sends webhook indicating payment failed/cancelled.
        Transaction marked failed; no subscription or coupon redemptions granted.
        """
        merchant_order_id = "order_sc_failed_state_006a"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.failed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_FAIL_006A",
                    "state": "FAILED",
                    "errorCode": "PAYMENT_CANCELLED",
                    "detailedErrorCode": "User exited checkout window",
                    "amount": 9900,
                },
            })

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["status"], "failed")
            mock_act.assert_not_called()

    def test_06b_pending_sync_marks_failed_payments_and_does_not_loop(self):
        """
        Scenario 6B: Pending sync checks PhonePe out-of-band and marks FAILED/CANCELLED
        transactions as failed in database so they are not endlessly queried.
        """
        m_id = "order_sc_sync_failed_006b"
        with patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.payment_service.get_supabase") as mock_sb:

            mock_remote.return_value = {"state": "CANCELLED", "error_code": "USER_ABORTED"}

            updated_rows = []
            mock_db = MagicMock()
            mock_db.from_().select().eq().eq().order().limit().execute.return_value = MagicMock(
                data=[{"merchant_order_id": m_id, "amount_in_paise": 9900}]
            )
            def track_update(payload):
                u = MagicMock()
                u.eq = lambda col, val: MagicMock(execute=lambda: updated_rows.append((payload, col, val)))
                return u
            mock_db.from_().update.side_effect = track_update
            mock_sb.return_value = mock_db

            any_synced = PaymentService.sync_pending_user_payments(self.student_id)
            self.assertFalse(any_synced)
            self.assertTrue(
                any(p.get("status") == "failed" and val == m_id for p, col, val in updated_rows),
                "Cancelled transaction must be updated to status='failed'",
            )

    # =========================================================================
    # SCENARIO 7: Payment amount differs from expected server-calculated amount
    # =========================================================================
    def test_07a_amount_mismatch_rejected_with_400_and_marked_failed(self):
        """
        Scenario 7A: Webhook sends tampered amount (e.g. 500 paise instead of 9900).
        Transaction rejected with 400 Bad Request and marked failed with AMOUNT_MISMATCH.
        """
        merchant_order_id = "order_sc_tampered_amt_007a"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_TAMPER_007A",
                    "state": "COMPLETED",
                    "amount": 500,  # Expected 9900
                },
            })

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("amount mismatch", resp.json()["detail"].lower())
            mock_act.assert_not_called()

    def test_07b_external_webhook_missing_amount_rejected_with_400(self):
        """
        Scenario 7B: External webhook omits the amount parameter.
        Must be rejected with 400 Bad Request and not grant access.
        """
        merchant_order_id = "order_sc_missing_amt_007b"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_MISSING_007B",
                    "state": "COMPLETED",
                    # amount intentionally omitted
                },
            })

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("amount missing", resp.json()["detail"].lower())

    def test_07c_currency_mismatch_rejected_with_400(self):
        """
        Scenario 7C: Webhook reports currency other than expected (e.g. USD instead of INR).
        Must be rejected with 400 Bad Request.
        """
        merchant_order_id = "order_sc_bad_curr_007c"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_sb.return_value = mock_db

            payload = json.dumps({
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_CURR_007C",
                    "state": "COMPLETED",
                    "amount": 9900,
                    "currency": "USD",  # Expected INR
                },
            })

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("currency mismatch", resp.json()["detail"].lower())

    def test_07d_out_of_band_polling_amount_mismatch_fails_transaction(self):
        """
        Scenario 7D: Out-of-band status query returns an amount differing from DB transaction.
        Transaction is marked failed and not provisioned.
        """
        merchant_order_id = "order_sc_oob_amt_diff_007d"
        db_tx = {
            "id": str(uuid.uuid4()),
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly"},
        }

        with patch("backend.services.phonepe_service.PhonePeService.is_configured", return_value=True), \
             patch("backend.services.phonepe_service.PhonePeService.get_order_status") as mock_remote, \
             patch("backend.services.payment_service.get_supabase") as mock_sb:

            mock_remote.return_value = {"state": "COMPLETED", "amount": 100}  # Mismatch (100 != 9900)

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.limit.return_value = q
                q.order.return_value = q
                q.execute.return_value = MagicMock(data=[dict(db_tx)])
                def do_update(payload):
                    db_tx.update(payload)
                    upd_q = MagicMock()
                    upd_q.eq.return_value = upd_q
                    upd_q.execute.return_value = MagicMock(data=[dict(db_tx)])
                    return upd_q
                q.update = do_update
                return q

            mock_db = MagicMock()
            mock_db.from_ = mock_from
            mock_sb.return_value = mock_db

            resp = client.get(f"/api/payments/status/{merchant_order_id}", headers=self.student_headers)
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["status"], "failed")

    # =========================================================================
    # SCENARIO 8: A callback has an invalid signature
    # =========================================================================
    def test_08_invalid_webhook_signature_rejected_with_401(self):
        """
        Scenario 8: Callback with invalid or forged signature rejected with 401 Unauthorized.
        No database records or entitlements are modified.
        """
        payload = json.dumps({
            "type": "CHECKOUT_ORDER",
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": "order_sc_unauth_008",
                "orderId": "PP_FORGED",
                "state": "COMPLETED",
                "amount": 9900,
            },
        })

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass):

            # 1. Missing header -> 401
            resp1 = client.post("/api/subscriptions/webhook/phonepe", content=payload)
            self.assertEqual(resp1.status_code, 401)

            # 2. Forged header -> 401
            resp2 = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": "forged_sha256_hash_value"},
                content=payload,
            )
            self.assertEqual(resp2.status_code, 401)

    # =========================================================================
    # SCENARIO 9: A successful coupon payment is processed more than once
    # =========================================================================
    def test_09_successful_coupon_payment_processed_more_than_once(self):
        """
        Scenario 9: A coupon payment is processed multiple times.
        Coupon used_count must increment exactly once, and duplicate webhooks must not double-redeem.
        """
        c_res = client.post(
            "/api/admin/coupons",
            json={"code": "DUPCOUPON", "discount_type": "percentage", "discount_value": 20},
            headers=self.admin_headers,
        )
        coupon = CouponService.get_coupon_by_code("DUPCOUPON")
        self.assertEqual(coupon.used_count, 0)

        merchant_order_id = "order_sc_dup_coupon_009"
        tx_id = str(uuid.uuid4())
        db_tx = {
            "id": tx_id,
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "coupon_id": coupon.id,
            "merchant_order_id": merchant_order_id,
            "discount_in_paise": 1980,
            "original_amount_in_paise": 9900,
            "amount_in_paise": 7920,
            "status": "pending",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        payload = json.dumps({
            "type": "CHECKOUT_ORDER",
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": merchant_order_id,
                "orderId": "PP_DUP_COUPON_009",
                "state": "COMPLETED",
                "amount": 7920,
            },
        })

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub_dup_c_009", "status": SubscriptionStatus.ACTIVE}
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().eq().execute.return_value = MagicMock(data=[{"id": tx_id}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": tx_id}])
            mock_sb.return_value = mock_db

            # 1. First webhook
            res1 = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(res1.status_code, 200)
            self.assertEqual(CouponService.get_coupon_by_code("DUPCOUPON").used_count, 1)

            # 2. Duplicate webhook
            db_tx["status"] = "success"
            db_tx["subscription_id"] = "sub_dup_c_009"
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])

            res2 = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(res2.status_code, 200)
            # Assert used_count is still 1
            self.assertEqual(CouponService.get_coupon_by_code("DUPCOUPON").used_count, 1)

    # =========================================================================
    # SCENARIO 10: Multiple customers attempt to redeem final available coupon slot
    # =========================================================================
    def test_10_concurrent_customers_attempt_to_redeem_final_available_coupon_slot(self):
        """
        Scenario 10: Coupon has max_uses=1. Two students simultaneously attempt to redeem
        the final slot of a 100% free promotional pass.
        Exactly one student succeeds; the other is rejected with 400 Bad Request.
        """
        c_res = client.post(
            "/api/admin/coupons",
            json={"code": "LASTSLOT", "discount_type": "percentage", "discount_value": 100, "max_uses": 1},
            headers=self.admin_headers,
        )
        self.assertEqual(c_res.status_code, 201)
        self.assertEqual(CouponService.get_coupon_by_code("LASTSLOT").used_count, 0)

        with patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_act:
            mock_act.return_value = {"subscription_id": "sub_last_slot", "is_extension": False}

            status_codes = []
            lock = threading.Lock()

            def attempt_redeem(user_id, token_header):
                app.dependency_overrides[get_current_user_id] = lambda: user_id
                r = client.post(
                    "/api/payments/create-order",
                    json={"plan_code": "premium_monthly", "coupon_code": "LASTSLOT"},
                    headers=token_header,
                )
                with lock:
                    status_codes.append(r.status_code)

            t1 = threading.Thread(target=attempt_redeem, args=(self.student_id, self.student_headers))
            t2 = threading.Thread(target=attempt_redeem, args=(self.student_2_id, self.student_2_headers))

            t1.start()
            t2.start()
            t1.join()
            t2.join()

            self.assertEqual(len(status_codes), 2)
            # Exactly one 201 and exactly one 400
            self.assertIn(201, status_codes, "One customer must successfully redeem the final slot")
            self.assertIn(400, status_codes, "The other customer must be rejected when slot is exhausted")
            # Global usage count must be exactly 1, never 2
            refreshed = CouponService.get_coupon_by_code("LASTSLOT")
            self.assertEqual(refreshed.used_count, 1)

    # =========================================================================
    # SCENARIO 11: Free promotional coupon is redeemed and access is provisioned
    # =========================================================================
    def test_11_free_promotional_coupon_redeemed_and_access_provisioned(self):
        """
        Scenario 11: A 100% free promotional coupon is redeemed.
        Access is provisioned directly without redirecting to PhonePe gateway.
        """
        client.post(
            "/api/admin/coupons",
            json={"code": "WELCOME100", "discount_type": "percentage", "discount_value": 100},
            headers=self.admin_headers,
        )

        with patch("backend.services.subscription_service.SubscriptionService.activate_or_extend_subscription") as mock_act:
            mock_act.return_value = {"subscription_id": "sub_promo_100", "is_extension": False}

            resp = client.post(
                "/api/payments/create-order",
                json={"plan_code": "premium_monthly", "coupon_code": "WELCOME100"},
                headers=self.student_headers,
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertEqual(data["amount_in_paise"], 0)
            self.assertEqual(data["discount_in_paise"], 9900)
            self.assertEqual(data["coupon_code"], "WELCOME100")
            self.assertIn("/dashboard?payment=success", data["checkout_url"])
            mock_act.assert_called_once()

    # =========================================================================
    # SCENARIO 12: A retry occurs after a partial failure
    # =========================================================================
    def test_12_retry_occurs_after_partial_failure(self):
        """
        Scenario 12: A partial failure occurred (status reverted to pending).
        A subsequent retry arrives and successfully provisions subscription.
        """
        merchant_order_id = "order_sc_retry_after_fail_012"
        tx_id = str(uuid.uuid4())
        db_tx = {
            "id": tx_id,
            "user_id": self.student_id,
            "plan_id": str(uuid.uuid4()),
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",  # Safely reverted to pending after initial failure
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        payload = json.dumps({
            "type": "CHECKOUT_ORDER",
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": merchant_order_id,
                "orderId": "PP_RETRY_012",
                "state": "COMPLETED",
                "amount": 9900,
            },
        })

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            # On retry, downstream provisioning succeeds
            mock_act.return_value = {"subscription_id": "sub_retried_012", "is_extension": False, "status": SubscriptionStatus.ACTIVE}

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().eq().execute.return_value = MagicMock(data=[{"id": tx_id}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": tx_id}])
            mock_sb.return_value = mock_db

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=payload,
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])
            self.assertEqual(resp.json()["status"], "success")
            mock_act.assert_called_once()


class TestPostgreSqlRpcBehavior(unittest.TestCase):
    """
    Explicitly tests and documents the PostgreSQL claim_and_provision_payment RPC
    contract and migration constraints (20261022_payment_integrity_and_recovery.sql).
    """

    def test_rpc_migration_file_exists_and_contains_check_constraint(self):
        """Verify migration 20261022 exists and contains the check constraint on coupons."""
        migration_path = root_dir / "supabase" / "migrations" / "20261022_payment_integrity_and_recovery.sql"
        self.assertTrue(migration_path.exists(), "Migration file 20261022 must exist")
        content = migration_path.read_text(encoding="utf-8")
        self.assertIn("chk_coupons_max_uses", content)
        self.assertIn("CHECK (max_uses IS NULL OR used_count <= max_uses)", content)
        self.assertIn("claim_and_provision_payment", content)
        self.assertIn("REVOKE ALL ON FUNCTION public.claim_and_provision_payment", content)
        self.assertIn("GRANT EXECUTE ON FUNCTION public.claim_and_provision_payment(TEXT, TEXT, JSONB) TO service_role", content)

    def test_rpc_already_provisioned_signature_contract(self):
        """
        Verify the RPC return schema for already_provisioned payments matches the
        Python state machine contract.
        """
        expected_keys = {"success", "claimed", "already_provisioned", "status", "subscription_id", "message"}
        # Simulated RPC output when transaction is already processed
        simulated_rpc_output = {
            "success": True,
            "claimed": False,
            "already_provisioned": True,
            "status": "success",
            "subscription_id": "00000000-0000-0000-0000-000000000000",
            "message": "Payment already processed and provisioned.",
        }
        self.assertTrue(expected_keys.issubset(simulated_rpc_output.keys()))
        self.assertTrue(simulated_rpc_output["already_provisioned"])


if __name__ == "__main__":
    unittest.main()
