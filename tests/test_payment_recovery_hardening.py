"""
tests/test_payment_recovery_hardening.py
SkillsCatalyst Phase 2: Failure-Injection & Payment Recovery Hardening Suite.

Covers all 8 failure-injection scenarios specified in the Phase 2 Final Acceptance Gate:
1. Process termination after payment verification.
2. Failure after claiming a payment (stranded in 'success' with subscription_id NULL).
3. Failure during subscription provisioning (compensating rollback to 'pending').
4. Failure after subscription provisioning but before HTTP response.
5. Duplicate provider events (idempotent protection against double extension).
6. Concurrent webhook and status-poll requests (thread-safe single activation).
7. Recovery worker retrying an incomplete purchase.
8. Duplicate retries after recovery has completed.

NOTE ON TEST ISOLATION:
- These tests use simulated database state machines and ThreadPoolExecutor to verify
  Python-level concurrency, lease timers, and crash recovery logic.
- They are distinguished from PostgreSQL integration tests which require a live database
  with the claim_and_provision_payment RPC installed.
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
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Recovery Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestPaymentRecoveryHardening(unittest.TestCase):

    def setUp(self):
        SubscriptionService.invalidate_plan_entitlements_cache()
        self.student_id = "55555555-5555-5555-5555-555555555555"
        self.mock_student = MockAuthUser(self.student_id, "student@recovery.test")
        self.now = datetime.now(timezone.utc)

        self.webhook_user = "test_webhook_user"
        self.webhook_pass = "test_webhook_pass"
        to_hash = f"{self.webhook_user}:{self.webhook_pass}".encode("utf-8")
        self.valid_auth_header = hashlib.sha256(to_hash).hexdigest()

    def tearDown(self):
        SubscriptionService.invalidate_plan_entitlements_cache()

    # =========================================================================
    # SCENARIO 1: Process termination after payment verification (before claim)
    # =========================================================================
    def test_01_process_termination_after_payment_verification(self):
        """
        Scenario 1: Process terminates after verification before database claim.
        The transaction remains 'pending' in the database.
        When a retry arrives, the atomic claim succeeds and provisions subscription.
        """
        merchant_order_id = "order_sc_crash_scen_1"
        db_tx = {
            "id": "tx-scen-1",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",  # Unmodified because process died before claim
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub-scen-1", "status": SubscriptionStatus.ACTIVE}

            # Mock DB updating on claim
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_().update().eq().eq().execute.return_value = MagicMock(data=[{"id": "tx-scen-1"}])
            mock_db.from_().update().eq().execute.return_value = MagicMock(data=[{"id": "tx-scen-1"}])
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_1",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")
            mock_act.assert_called_once()

    # =========================================================================
    # SCENARIO 2: Failure after claiming payment (stranded in 'success' with subscription_id NULL)
    # =========================================================================
    def test_02_failure_after_claiming_payment_resumes_cleanly(self):
        """
        Scenario 2: Process crashed immediately after claiming payment (status='success')
        before subscription provisioning ran. The transaction has subscription_id=NULL.
        On retry, the hardened state machine recovers the stranded payment and provisions.
        """
        merchant_order_id = "order_sc_crash_scen_2"
        # Stale timestamp (> 10 seconds ago to simulate previous crashed worker)
        crashed_time = self.now - timedelta(seconds=30)
        db_tx = {
            "id": "tx-scen-2",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",  # Marked success before crash
            "subscription_id": None,  # Provisioning never completed
            "updated_at": crashed_time.isoformat(),
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub-scen-2-recovered", "status": SubscriptionStatus.ACTIVE}

            updated_fields = {}
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[db_tx])
            def mock_update(payload):
                updated_fields.update(payload)
                q = MagicMock()
                q.eq.return_value = MagicMock(execute=lambda: MagicMock(data=[db_tx]))
                return q
            mock_db.from_().update = mock_update
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_2",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # CRITICAL VERIFICATION: Provisioning WAS called to rescue the stranded payment
            mock_act.assert_called_once()
            self.assertEqual(updated_fields.get("subscription_id"), "sub-scen-2-recovered")

    # =========================================================================
    # SCENARIO 3: Failure during subscription provisioning (compensating revert)
    # =========================================================================
    def test_03_failure_during_subscription_provisioning_compensating_revert(self):
        """
        Scenario 3: Exception raised during provisioning triggers compensating revert to 'pending'.
        Subsequent retry reclaims and completes provisioning.
        """
        merchant_order_id = "order_sc_crash_scen_3"
        tx_state = {
            "id": "tx-scen-3",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.side_effect = [
                Exception("Supabase transient connection drop"),
                {"subscription_id": "sub-scen-3-success", "status": SubscriptionStatus.ACTIVE},
            ]

            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                def do_select():
                    return MagicMock(data=[dict(tx_state)])
                q.execute = do_select

                def do_update(payload):
                    tx_state.update(payload)
                    upd_q = MagicMock()
                    upd_q.eq.return_value = upd_q
                    upd_q.execute = lambda: MagicMock(data=[dict(tx_state)])
                    return upd_q
                q.update = do_update
                return q

            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed")
            mock_db.from_ = mock_from
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_3",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            # Attempt 1: Fails during provisioning -> Reverts to 'pending'
            with self.assertRaises(Exception):
                client.post(
                    "/api/subscriptions/webhook/phonepe",
                    headers={"Authorization": self.valid_auth_header},
                    content=json.dumps(payload),
                )
            self.assertEqual(tx_state["status"], "pending")
            self.assertIn("reverted to pending for retry", tx_state.get("failure_message", ""))

            # Attempt 2: Retry succeeds
            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(tx_state["status"], "success")
            self.assertEqual(tx_state["subscription_id"], "sub-scen-3-success")

    # =========================================================================
    # SCENARIO 4: Failure after subscription provisioning before HTTP response
    # =========================================================================
    def test_04_failure_after_subscription_provisioning_before_http_response(self):
        """
        Scenario 4: Subscription was provisioned and subscription_id linked to transaction,
        but network timed out before HTTP 200 returned to PhonePe gateway.
        PhonePe retries -> Line 224 immediately returns idempotent 200 OK without re-provisioning.
        """
        merchant_order_id = "order_sc_crash_scen_4"
        completed_tx = {
            "id": "tx-scen-4",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": "sub-scen-4-already-done",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[completed_tx])
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_4",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # CRITICAL ASSERTION: activate_or_extend_subscription MUST NOT be called on completed retry
            mock_act.assert_not_called()

    # =========================================================================
    # SCENARIO 5: Duplicate provider events safe against double extension
    # =========================================================================
    def test_05_duplicate_provider_events_safe_against_double_extension(self):
        """
        Scenario 5: Calling activate_or_extend_subscription with identical provider_event_id
        returns existing subscription record without adding additional days.
        """
        provider_event_id = "PP_DUP_EVENT_SCEN_5"
        plan_id = "plan-uuid-monthly"

        recorded_events = []
        user_sub = {
            "id": "sub-scen-5",
            "user_id": self.student_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": self.now.isoformat(),
            "expires_at": (self.now + timedelta(days=30)).isoformat(),
        }

        with patch("backend.services.subscription_service.get_supabase") as mock_sub_sb, \
             patch.object(SubscriptionService, "resolve_effective_subscription") as mock_res, \
             patch.object(SubscriptionService, "get_user_subscription_record") as mock_get_rec, \
             patch("backend.services.subscription_service.invalidate_user_subscription"):

            mock_res.return_value = {
                "plan": PlanCode.PREMIUM_MONTHLY,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": True,
                "started_at": self.now,
                "expires_at": self.now + timedelta(days=30),
            }
            mock_get_rec.return_value = user_sub

            db_updates = []
            mock_db = MagicMock()
            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.order.return_value = q
                q.limit.return_value = q

                if tbl == "subscription_events":
                    q.execute = lambda: MagicMock(data=[e for e in recorded_events if e.get("provider_event_id") == provider_event_id])
                    def do_ins(pl):
                        recorded_events.append(pl)
                        return MagicMock(execute=lambda: MagicMock(data=[pl]))
                    q.insert = do_ins
                elif tbl == "user_subscriptions":
                    q.execute.side_effect = [MagicMock(data=[user_sub])]
                    def do_upd(pl):
                        db_updates.append(pl)
                        return MagicMock(eq=lambda c, v: MagicMock(execute=lambda: MagicMock(data=[pl])))
                    q.update = do_upd
                return q

            mock_db.from_ = mock_from
            mock_sub_sb.return_value = mock_db

            # Call 1: Provisions first time
            res1 = SubscriptionService.activate_or_extend_subscription(
                user_id=self.student_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id=provider_event_id,
            )
            self.assertEqual(len(db_updates), 1)
            self.assertEqual(len(recorded_events), 1)

            # Call 2: Duplicate provider event -> skips update and returns existing sub
            res2 = SubscriptionService.activate_or_extend_subscription(
                user_id=self.student_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id=provider_event_id,
            )
            self.assertEqual(len(db_updates), 1, "Must not perform second DB update on duplicate provider event")
            self.assertEqual(len(recorded_events), 1, "Must not insert duplicate event")
            self.assertEqual(res1["expires_at"], res2["expires_at"], "Expiration date must remain identical")

    # =========================================================================
    # SCENARIO 6: Concurrent webhook and status-poll requests
    # =========================================================================
    def test_06_concurrent_webhook_and_status_poll_requests(self):
        """
        Scenario 6: Simultaneous webhook callback and user status polling assert exactly one provisioning.
        """
        import concurrent.futures
        import threading

        merchant_order_id = "order_sc_crash_scen_6"
        order_state = {"status": "pending"}
        state_lock = threading.Lock()

        def mock_from(tbl):
            q = MagicMock()
            if tbl == "payment_transactions":
                def mock_sel(*args, **kwargs):
                    sel = MagicMock()
                    sel.eq.return_value = sel
                    sel.limit.return_value = sel
                    def do_exec():
                        with state_lock:
                            return MagicMock(data=[{
                                "id": "tx-scen-6",
                                "user_id": self.student_id,
                                "plan_id": "plan-uuid-monthly",
                                "amount_in_paise": 9900,
                                "currency": "INR",
                                "status": order_state["status"],
                                "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
                            }])
                    sel.execute = do_exec
                    return sel
                q.select = mock_sel

                def mock_upd(pl):
                    upd = MagicMock()
                    def do_eq1(c1, v1):
                        def do_eq2(c2, v2):
                            upd_ex = MagicMock()
                            def do_exec():
                                with state_lock:
                                    if c2 == "status" and v2 == "pending":
                                        if order_state["status"] == "pending":
                                            order_state["status"] = pl.get("status", "success")
                                            return MagicMock(data=[{"id": "tx-scen-6"}])
                                        else:
                                            return MagicMock(data=[])
                                    return MagicMock(data=[{"id": "tx-scen-6"}])
                            upd_ex.execute = do_exec
                            return upd_ex
                        upd.eq = do_eq2
                        return upd
                    upd.eq = do_eq1
                    return upd
                q.update = mock_upd
            return q

        payload = {
            "type": "CHECKOUT_ORDER",
            "event": "checkout.order.completed",
            "payload": {
                "merchantOrderId": merchant_order_id,
                "orderId": "PP_ORD_SCEN_6",
                "state": "COMPLETED",
                "amount": 9900,
            },
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(PhonePeService, "is_configured", return_value=True), \
             patch.object(PhonePeService, "get_order_status", return_value={"state": "COMPLETED", "order_id": "PP_ORD_SCEN_6"}), \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
            mock_auth_sb.return_value = mock_auth_client

            mock_act.return_value = {"subscription_id": "sub-scen-6", "status": SubscriptionStatus.ACTIVE}
            mock_db = MagicMock()
            mock_db.from_ = mock_from
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_pay_sb.return_value = mock_db

            def send_webhook():
                return client.post(
                    "/api/subscriptions/webhook/phonepe",
                    headers={"Authorization": self.valid_auth_header},
                    content=json.dumps(payload),
                )

            def poll_status():
                return client.get(
                    f"/api/payments/status/{merchant_order_id}",
                    headers={"Authorization": "Bearer mock-token"},
                )

            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                f_webhook = executor.submit(send_webhook)
                f_status = executor.submit(poll_status)
                res_w = f_webhook.result()
                res_s = f_status.result()

            self.assertEqual(res_w.status_code, 200)
            self.assertEqual(res_s.status_code, 200)
            # CRITICAL CONCURRENCY INVARIANT: Exactly one activation occurred
            self.assertEqual(mock_act.call_count, 1)

    # =========================================================================
    # SCENARIO 7: Recovery worker retrying an incomplete purchase
    # =========================================================================
    def test_07_recovery_worker_retrying_incomplete_purchase(self):
        """
        Scenario 7: Recovery worker (via internal sync) retries an incomplete purchase
        where status='success' but subscription_id=NULL.
        Ensures subscription is provisioned and linked.
        """
        merchant_order_id = "order_sc_crash_scen_7"
        tx_row = {
            "id": "tx-scen-7",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": None,
            "updated_at": (self.now - timedelta(minutes=10)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_act.return_value = {"subscription_id": "sub-scen-7-recovered", "status": SubscriptionStatus.ACTIVE}

            updated_fields = {}
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[tx_row])
            def mock_update(payload):
                updated_fields.update(payload)
                q = MagicMock()
                q.eq.return_value = MagicMock(execute=lambda: MagicMock(data=[tx_row]))
                return q
            mock_db.from_().update = mock_update
            mock_pay_sb.return_value = mock_db

            # Invoke out-of-band recovery sync
            res = PaymentService.process_webhook(
                authorization_header=None,
                raw_body=json.dumps({
                    "event": "checkout.order.completed",
                    "payload": {
                        "merchantOrderId": merchant_order_id,
                        "orderId": "PP_ORD_SCEN_7",
                        "state": "COMPLETED",
                        "amount": 9900,
                    },
                }),
                is_internal_sync=True,
            )

            self.assertTrue(res["success"])
            self.assertEqual(res["status"], "success")
            mock_act.assert_called_once()
            self.assertEqual(updated_fields.get("subscription_id"), "sub-scen-7-recovered")

    # =========================================================================
    # SCENARIO 8: Duplicate retries after recovery has completed
    # =========================================================================
    def test_08_duplicate_retries_after_recovery_has_completed(self):
        """
        Scenario 8: After recovery completes and links subscription_id, any subsequent
        webhook or retry immediately returns HTTP 200 without calling provisioning.
        """
        merchant_order_id = "order_sc_crash_scen_8"
        recovered_tx = {
            "id": "tx-scen-8",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": "sub-scen-8-finalized",
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            mock_db = MagicMock()
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[recovered_tx])
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_8",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "success")

            # Must not be called again
            mock_act.assert_not_called()

    # =========================================================================
    # SCENARIO 9: Failure inserting subscription_events handled safely
    # =========================================================================
    def test_09_failure_inserting_subscription_events_handled_safely(self):
        """
        Scenario 9: user_subscriptions row is successfully updated/inserted,
        but inserting into subscription_events fails (e.g. transient DB error).
        The system logs the audit failure without disrupting user entitlement activation.
        """
        user_id = self.student_id
        plan_id = "plan-uuid-monthly"

        user_sub = {
            "id": "sub-scen-9",
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": self.now.isoformat(),
            "expires_at": (self.now + timedelta(days=30)).isoformat(),
        }

        with patch("backend.services.subscription_service.get_supabase") as mock_sub_sb, \
             patch.object(SubscriptionService, "resolve_effective_subscription") as mock_res, \
             patch("backend.services.subscription_service.invalidate_user_subscription"):

            mock_res.return_value = {
                "plan": PlanCode.FREE,
                "status": SubscriptionStatus.EXPIRED,
                "is_premium": False,
                "started_at": self.now - timedelta(days=40),
                "expires_at": self.now - timedelta(days=10),
            }

            mock_db = MagicMock()
            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.order.return_value = q
                q.limit.return_value = q

                if tbl == "subscription_events":
                    q.execute = lambda: MagicMock(data=[])
                    # Simulate failure inserting into subscription_events
                    q.insert.return_value = MagicMock(execute=MagicMock(side_effect=Exception("DB write error on audit log")))
                elif tbl == "user_subscriptions":
                    q.execute.side_effect = [MagicMock(data=[])]  # No existing row -> inserts
                    q.insert.return_value = MagicMock(execute=lambda: MagicMock(data=[user_sub]))
                return q

            mock_db.from_ = mock_from
            mock_sub_sb.return_value = mock_db

            res = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id="PP_ORD_SCEN_9",
            )
            # User subscription must still activate successfully
            self.assertEqual(res["status"], SubscriptionStatus.ACTIVE)
            self.assertEqual(res["subscription_id"], "sub-scen-9")

    # =========================================================================
    # SCENARIO 10: Failure linking subscription_id recovers cleanly on retry
    # =========================================================================
    def test_10_failure_linking_subscription_id_recovers_on_retry(self):
        """
        Scenario 10: Subscription was provisioned, but updating payment_transactions.subscription_id
        dropped due to network timeout.
        When retry arrives, state machine identifies stranded payment and links subscription_id
        without double-extending the subscription.
        """
        merchant_order_id = "order_sc_crash_scen_10"
        tx_row = {
            "id": "tx-scen-10",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "success",
            "subscription_id": None,  # Linking dropped
            "updated_at": (self.now - timedelta(seconds=25)).isoformat(),  # Stale lease
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb, \
             patch.object(SubscriptionService, "activate_or_extend_subscription") as mock_act:

            # Returns existing subscription without double-extension
            mock_act.return_value = {
                "subscription_id": "sub-scen-10-recovered",
                "status": SubscriptionStatus.ACTIVE,
                "is_extension": False,
            }

            linked_ids = []
            mock_db = MagicMock()
            mock_db.rpc.side_effect = Exception("RPC not installed in mock")
            mock_db.from_().select().eq().execute.return_value = MagicMock(data=[tx_row])

            def mock_update(payload):
                if "subscription_id" in payload:
                    linked_ids.append(payload["subscription_id"])
                q = MagicMock()
                q.eq.return_value = MagicMock(execute=lambda: MagicMock(data=[tx_row]))
                return q
            mock_db.from_().update = mock_update
            mock_pay_sb.return_value = mock_db

            payload = {
                "type": "CHECKOUT_ORDER",
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORD_SCEN_10",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = client.post(
                "/api/subscriptions/webhook/phonepe",
                headers={"Authorization": self.valid_auth_header},
                content=json.dumps(payload),
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["status"], "success")
            self.assertIn("sub-scen-10-recovered", linked_ids)

    # =========================================================================
    # SCENARIO 11: Two different successful purchases for the same user
    # =========================================================================
    def test_11_two_different_successful_purchases_for_same_user(self):
        """
        Scenario 11: User makes two separate, distinct purchases (e.g. 2 x 30 days).
        Order 1 activates for 30 days. Order 2 extends by an additional 30 days (+60 days total).
        Both orders succeed independently and neither is ignored or dropped.
        """
        user_id = self.student_id
        plan_id = "plan-uuid-monthly"

        current_expiry = self.now + timedelta(days=30)
        user_sub_state = {
            "id": "sub-scen-11",
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": self.now,
            "expires_at": current_expiry,
            "is_premium": True,
        }

        with patch("backend.services.subscription_service.get_supabase") as mock_sub_sb, \
             patch.object(SubscriptionService, "resolve_effective_subscription") as mock_res, \
             patch.object(SubscriptionService, "get_user_subscription_record") as mock_get_rec, \
             patch("backend.services.subscription_service.invalidate_user_subscription"):

            # Dynamic resolution reflecting current user state
            mock_res.side_effect = lambda uid: dict(user_sub_state)
            mock_get_rec.return_value = {"id": "sub-scen-11"}

            recorded_events = []
            mock_db = MagicMock()
            def mock_from(tbl):
                q = MagicMock()
                q.select.return_value = q
                q.eq.return_value = q
                q.order.return_value = q
                q.limit.return_value = q

                if tbl == "subscription_events":
                    q.execute = lambda: MagicMock(data=[])  # Distinct provider_event_id each time
                    q.insert.return_value = MagicMock(execute=lambda: MagicMock(data=[{}]))
                elif tbl == "user_subscriptions":
                    q.execute.side_effect = [MagicMock(data=[user_sub_state])]
                    def do_update(payload):
                        if "expires_at" in payload:
                            user_sub_state["expires_at"] = datetime.fromisoformat(payload["expires_at"])
                        return MagicMock(eq=lambda c, v: MagicMock(execute=lambda: MagicMock(data=[user_sub_state])))
                    q.update = do_update
                return q

            mock_db.from_ = mock_from
            mock_sub_sb.return_value = mock_db

            # Purchase 1 (Distinct provider event ID 1)
            res1 = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id="PP_ORDER_A_111",
            )
            self.assertTrue(res1["is_extension"])
            expected_exp1 = current_expiry + timedelta(days=30)
            self.assertEqual(res1["expires_at"].date(), expected_exp1.date())

            # Purchase 2 (Distinct provider event ID 2)
            res2 = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=plan_id,
                duration_days=30,
                provider="phonepe",
                provider_event_id="PP_ORDER_B_222",
            )
            self.assertTrue(res2["is_extension"])
            expected_exp2 = expected_exp1 + timedelta(days=30)
            self.assertEqual(res2["expires_at"].date(), expected_exp2.date())

    # =========================================================================
    # SCENARIO 12: Atomic RPC claim_and_provision_payment success execution
    # =========================================================================
    def test_12_atomic_rpc_success_flow(self):
        """
        Verify that when PostgreSQL RPC claim_and_provision_payment is available,
        PaymentService calls it with correct arguments and handles the successful response.
        """
        merchant_order_id = "order_sc_rpc_success"
        db_tx = {
            "id": "tx-rpc-1",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_db = MagicMock()
            # Select query returns db_tx
            mock_query = MagicMock()
            mock_query.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_.return_value = mock_query

            # Mock successful RPC response
            mock_rpc_exec = MagicMock()
            mock_rpc_exec.execute.return_value = MagicMock(data={
                "success": True,
                "claimed": True,
                "already_provisioned": False,
                "status": "success",
                "subscription_id": "sub-uuid-from-rpc",
                "message": "Payment claimed and subscription provisioned atomically.",
            })
            mock_db.rpc.return_value = mock_rpc_exec
            mock_pay_sb.return_value = mock_db

            payload = {
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORDER_RPC_001",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = PaymentService.process_webhook(
                authorization_header=self.valid_auth_header,
                raw_body=json.dumps(payload),
            )

            self.assertTrue(resp["success"])
            self.assertEqual(resp["status"], "success")
            # Verify RPC was called with exact argument names
            mock_db.rpc.assert_called_once_with("claim_and_provision_payment", {
                "p_merchant_order_id": merchant_order_id,
                "p_provider_order_id": "PP_ORDER_RPC_001",
                "p_provider_response": payload["payload"],
            })

    # =========================================================================
    # SCENARIO 13: Atomic RPC idempotent already provisioned response
    # =========================================================================
    def test_13_atomic_rpc_idempotent_already_provisioned(self):
        """
        Verify that when RPC reports already_provisioned = True,
        PaymentService returns successful idempotent acknowledgement.
        """
        merchant_order_id = "order_sc_rpc_idempotent"
        db_tx = {
            "id": "tx-rpc-2",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "pending",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_db = MagicMock()
            mock_query = MagicMock()
            mock_query.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_.return_value = mock_query

            mock_rpc_exec = MagicMock()
            mock_rpc_exec.execute.return_value = MagicMock(data={
                "success": True,
                "claimed": False,
                "already_provisioned": True,
                "status": "success",
                "subscription_id": "sub-existing-123",
                "message": "Payment already processed and provisioned.",
            })
            mock_db.rpc.return_value = mock_rpc_exec
            mock_pay_sb.return_value = mock_db

            payload = {
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORDER_RPC_002",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = PaymentService.process_webhook(
                authorization_header=self.valid_auth_header,
                raw_body=json.dumps(payload),
            )

            self.assertTrue(resp["success"])
            self.assertEqual(resp["status"], "success")

    # =========================================================================
    # SCENARIO 14: Atomic RPC terminal state rejection
    # =========================================================================
    def test_14_atomic_rpc_terminal_state_rejection(self):
        """
        Verify that when RPC rejects claim because transaction is in a terminal
        failure state, PaymentService does NOT report success.
        """
        merchant_order_id = "order_sc_rpc_terminal"
        db_tx = {
            "id": "tx-rpc-3",
            "user_id": self.student_id,
            "plan_id": "plan-uuid-monthly",
            "merchant_order_id": merchant_order_id,
            "amount_in_paise": 9900,
            "currency": "INR",
            "status": "failed",
            "subscription_id": None,
            "subscription_plans": {"code": "premium_monthly", "duration_days": 30},
        }

        with patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_USERNAME", self.webhook_user), \
             patch("backend.services.phonepe_service.PHONEPE_WEBHOOK_PASSWORD", self.webhook_pass), \
             patch("backend.services.payment_service.get_supabase") as mock_pay_sb:

            mock_db = MagicMock()
            mock_query = MagicMock()
            mock_query.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.execute.return_value = MagicMock(data=[db_tx])
            mock_db.from_.return_value = mock_query

            mock_rpc_exec = MagicMock()
            mock_rpc_exec.execute.return_value = MagicMock(data={
                "success": False,
                "claimed": False,
                "status": "failed",
                "error": "TERMINAL_STATE",
                "message": "Payment is in a terminal failure state.",
            })
            mock_db.rpc.return_value = mock_rpc_exec
            mock_pay_sb.return_value = mock_db

            payload = {
                "event": "checkout.order.completed",
                "payload": {
                    "merchantOrderId": merchant_order_id,
                    "orderId": "PP_ORDER_RPC_003",
                    "state": "COMPLETED",
                    "amount": 9900,
                },
            }

            resp = PaymentService.process_webhook(
                authorization_header=self.valid_auth_header,
                raw_body=json.dumps(payload),
            )

            self.assertFalse(resp["success"])
            self.assertEqual(resp["status"], "failed")


if __name__ == "__main__":
    unittest.main()


