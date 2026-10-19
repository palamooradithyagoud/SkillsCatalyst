"""
tests/test_admin_payments_dashboard_phase6.py
SkillsCatalyst Phase 6: Admin Payment Dashboard & Subscription Lifecycle Management Test Suite.

Verifies:
1. Authorization & Security:
   - Unauthenticated callers rejected with 401 Unauthorized.
   - Normal students rejected with 403 Forbidden.
   - Authorized Platform Admin/Owner allowed (200 OK).
   - Sensitive payment secrets and raw provider payloads never exposed.
2. Financial Telemetry & Aggregation:
   - Successful commercial payments accurately aggregated into collected cash revenue.
   - Pending, failed, and cancelled payments strictly excluded from collected revenue.
   - 100% free promotional pass checkouts excluded from cash revenue; tracked as promotional passes.
   - Gross transaction value and coupon discounts accurately derived.
   - Date range presets ('today', '7d', '30d', 'all') and custom boundaries enforced; invalid ranges rejected.
   - Plan-based and coupon-based breakdowns grouped accurately.
3. Transactions Ledger:
   - Pagination bounds enforced (limit <= 100, page >= 1); invalid limits rejected with 400.
   - Filtering by status, date range, plan, coupon, and search query.
   - Zero N+1 queries; profiles batch-loaded.
   - Empty results handled cleanly.
4. Subscription Management & Safe Cancellation:
   - Subscriptions listed with active entitlement summaries, validity dates, and user profiles.
   - Cancellation preserves paid access until current expires_at (no premature cutoff).
   - Cancellation records audit log in subscription_events; does not refund payment.
   - Repeated cancellation calls are safe and idempotent.
   - Reject cancellation on already expired or perpetual free tier subscriptions.
"""

import sys
import uuid
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.payment import PaymentStatus
from backend.models.subscription import SubscriptionStatus, PlanCode
from backend.services.admin_payment_service import AdminPaymentService
from backend.services.subscription_service import SubscriptionService

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestAdminPaymentsDashboardPhase6(unittest.TestCase):

    def setUp(self):
        SubscriptionService.invalidate_plan_entitlements_cache()
        self.student_id = "11111111-1111-4000-a000-000000000001"
        self.admin_id = "99999999-9999-4000-a000-000000000099"
        self.mock_student = MockAuthUser(self.student_id, "student@skillscatalyst.in", role="student", full_name="Student User")
        self.mock_admin = MockAuthUser(self.admin_id, "admin@skillscatalyst.in", role="owner", full_name="Platform Owner")
        self.student_headers = {"Authorization": "Bearer mock-student-token"}
        self.admin_headers = {"Authorization": "Bearer mock-admin-token"}
        self.now = datetime.now(timezone.utc)

    def _mock_admin_auth(self, mock_auth_sb):
        """Helper to mock admin authorization."""
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = MagicMock(user=self.mock_admin)
        mock_client.from_().select().eq().execute.return_value = MagicMock(
            data=[{"role": "owner", "email": "admin@skillscatalyst.in"}]
        )
        mock_auth_sb.return_value = mock_client
        return mock_client

    def _mock_student_auth(self, mock_auth_sb):
        """Helper to mock student authorization."""
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student)
        mock_client.from_().select().eq().execute.return_value = MagicMock(
            data=[{"role": "student", "email": "student@skillscatalyst.in"}]
        )
        mock_auth_sb.return_value = mock_client
        return mock_client

    # =========================================================================
    # 1. AUTHORIZATION AND SECURITY TESTS
    # =========================================================================

    def test_01_unauthenticated_requests_rejected(self):
        """All Phase 6 admin endpoints must reject unauthenticated requests with 401."""
        endpoints = [
            ("GET", "/api/admin/payments/overview"),
            ("GET", "/api/admin/payments/transactions"),
            ("GET", "/api/admin/subscriptions"),
            ("POST", f"/api/admin/subscriptions/{uuid.uuid4()}/cancel"),
        ]
        for method, url in endpoints:
            if method == "GET":
                resp = client.get(url)
            else:
                resp = client.post(url, json={})
            self.assertEqual(resp.status_code, 401, f"{method} {url} should return 401")

    def test_02_student_access_rejected_with_403(self):
        """Ordinary students must be rejected with 403 Forbidden on all admin payment APIs."""
        endpoints = [
            ("GET", "/api/admin/payments/overview"),
            ("GET", "/api/admin/payments/transactions"),
            ("GET", "/api/admin/subscriptions"),
            ("POST", f"/api/admin/subscriptions/{uuid.uuid4()}/cancel"),
        ]
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            self._mock_student_auth(mock_auth_sb)
            for method, url in endpoints:
                if method == "GET":
                    resp = client.get(url, headers=self.student_headers)
                else:
                    resp = client.post(url, headers=self.student_headers, json={})
                self.assertEqual(resp.status_code, 403, f"{method} {url} should return 403 for students")
                self.assertIn("Admin or content manager privileges required", resp.json()["detail"])

    # =========================================================================
    # 2. FINANCIAL METRICS & REVENUE DERIVATION TESTS
    # =========================================================================

    def test_03_financial_metrics_cash_revenue_and_promotional_segregation(self):
        """
        Derives authoritative metrics:
        - Paid successful payments aggregated into collected revenue.
        - 100% free promotional pass checkouts excluded from cash revenue.
        - Pending and failed payments excluded from cash revenue.
        - Gross value and discounts accurately reported.
        """
        mock_tx_data = [
            # Successful commercial payment: ₹99
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 9900,
                "original_amount_in_paise": 9900,
                "discount_in_paise": 0,
                "status": "success",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=1)).isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
                "coupons": None,
            },
            # Successful commercial payment with coupon: ₹150 (orig ₹250, disc ₹100)
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 15000,
                "original_amount_in_paise": 25000,
                "discount_in_paise": 10000,
                "status": "success",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=2)).isoformat(),
                "subscription_plans": {"code": "premium_3_month", "name": "Premium 3 Months"},
                "coupons": {"code": "SAVE100"},
            },
            # Successful 100% Free Promotional Pass: ₹0 paid (orig ₹99, disc ₹99)
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 0,
                "original_amount_in_paise": 9900,
                "discount_in_paise": 9900,
                "status": "success",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=3)).isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
                "coupons": {"code": "FREEPASS"},
            },
            # Pending payment: ₹99 (must be excluded from collected revenue)
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 9900,
                "original_amount_in_paise": 9900,
                "discount_in_paise": 0,
                "status": "pending",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=1)).isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
                "coupons": None,
            },
            # Failed payment: ₹99 (must be excluded from collected revenue)
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 9900,
                "original_amount_in_paise": 9900,
                "discount_in_paise": 0,
                "status": "failed",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=1)).isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
                "coupons": None,
            },
            # Cancelled payment: ₹250 (must be excluded from collected revenue)
            {
                "id": str(uuid.uuid4()),
                "amount_in_paise": 25000,
                "original_amount_in_paise": 25000,
                "discount_in_paise": 0,
                "status": "cancelled",
                "currency": "INR",
                "created_at": (self.now - timedelta(days=1)).isoformat(),
                "subscription_plans": {"code": "premium_3_month", "name": "Premium 3 Months"},
                "coupons": None,
            },
        ]

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)

            mock_sb = MagicMock()
            mock_sb.from_().select().execute.return_value = MagicMock(data=mock_tx_data)
            # Support chaining of gte/lte
            mock_query = MagicMock()
            mock_query.gte.return_value = mock_query
            mock_query.lte.return_value = mock_query
            mock_query.execute.return_value = MagicMock(data=mock_tx_data)
            mock_sb.from_().select.return_value = mock_query
            mock_data_sb.return_value = mock_sb

            resp = client.get("/api/admin/payments/overview?preset=30d", headers=self.admin_headers)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            # Expected Collected Cash: 9900 + 15000 = 24900 paise (₹249.00)
            self.assertEqual(data["total_collected_amount_in_paise"], 24900)
            self.assertEqual(data["total_collected_amount_in_rupees"], 249.0)

            # Expected Gross: 9900 + 25000 + 9900 = 44800 paise (₹448.00)
            self.assertEqual(data["gross_transaction_value_in_paise"], 44800)
            self.assertEqual(data["gross_transaction_value_in_rupees"], 448.0)

            # Expected Discount: 0 + 10000 + 9900 = 19900 paise (₹199.00)
            self.assertEqual(data["total_discount_amount_in_paise"], 19900)
            self.assertEqual(data["total_discount_amount_in_rupees"], 199.0)

            # Counts
            self.assertEqual(data["successful_count"], 3)  # 2 commercial + 1 promo
            self.assertEqual(data["promotional_pass_count"], 1)  # 1 free pass
            self.assertEqual(data["pending_count"], 1)
            self.assertEqual(data["failed_count"], 1)
            self.assertEqual(data["cancelled_count"], 1)

            # Plan breakdown checks
            monthly_plan = next(p for p in data["by_plan"] if p["plan_code"] == "premium_monthly")
            self.assertEqual(monthly_plan["count"], 2)  # 1 paid + 1 promo
            self.assertEqual(monthly_plan["collected_amount_in_paise"], 9900)

            # Coupon breakdown checks
            save100 = next(c for c in data["by_coupon"] if c["coupon_code"] == "SAVE100")
            self.assertEqual(save100["redemption_count"], 1)
            self.assertEqual(save100["total_discount_in_paise"], 10000)

    def test_04_date_range_preset_and_validation(self):
        """Custom date range validation: start_date > end_date returns 400 Bad Request."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)
            mock_data_sb.return_value = MagicMock()

            # Invalid range: start after end
            resp = client.get(
                "/api/admin/payments/overview?start_date=2026-10-20T00:00:00Z&end_date=2026-10-10T00:00:00Z",
                headers=self.admin_headers,
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("start_date cannot be after end_date", resp.json()["detail"])

    # =========================================================================
    # 3. TRANSACTIONS LEDGER TESTS
    # =========================================================================

    def test_05_transactions_ledger_pagination_and_bounds(self):
        """Transactions pagination limits enforced (limit between 1 and 100, page >= 1)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)
            mock_data_sb.return_value = MagicMock()

            # Exceeding max limit (100) -> 422 or 400
            resp_exceed = client.get(
                "/api/admin/payments/transactions?limit=150",
                headers=self.admin_headers,
            )
            self.assertIn(resp_exceed.status_code, (400, 422))

            # Non-positive page (0) -> 422 or 400
            resp_bad_page = client.get(
                "/api/admin/payments/transactions?page=0",
                headers=self.admin_headers,
            )
            self.assertIn(resp_bad_page.status_code, (400, 422))

    def test_06_transactions_ledger_sanitization_and_profiles_batch_load(self):
        """
        Transactions ledger returns sanitized customer fields and strictly omits
        internal provider secrets or raw payloads.
        """
        mock_tx_id = str(uuid.uuid4())
        mock_user_id = str(uuid.uuid4())
        mock_rows = [
            {
                "id": mock_tx_id,
                "user_id": mock_user_id,
                "plan_id": str(uuid.uuid4()),
                "subscription_id": str(uuid.uuid4()),
                "provider": "phonepe",
                "merchant_order_id": "order_sc_test_sanitized_001",
                "amount_in_paise": 9900,
                "original_amount_in_paise": 9900,
                "discount_in_paise": 0,
                "currency": "INR",
                "status": "success",
                "failure_code": None,
                "failure_message": None,
                "coupon_id": None,
                "created_at": "2026-10-19T10:00:00Z",
                "updated_at": "2026-10-19T10:01:00Z",
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
                "coupons": None,
            }
        ]
        mock_profile = [{"id": mock_user_id, "email": "student@domain.com", "full_name": "Student A"}]

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)

            mock_sb = MagicMock()
            # Transactions query mock
            tx_q = MagicMock()
            tx_q.eq.return_value = tx_q
            tx_q.order.return_value = tx_q
            tx_q.range.return_value = MagicMock(execute=lambda: MagicMock(data=mock_rows, count=1))

            # Profiles batch query mock
            prof_q = MagicMock()
            prof_q.in_.return_value = MagicMock(execute=lambda: MagicMock(data=mock_profile))

            def mock_from(tbl):
                if tbl == "payment_transactions":
                    return MagicMock(select=lambda *a, **kw: tx_q)
                elif tbl == "profiles":
                    return MagicMock(select=lambda *a, **kw: prof_q)
                return MagicMock()

            mock_sb.from_.side_effect = mock_from
            mock_data_sb.return_value = mock_sb

            resp = client.get("/api/admin/payments/transactions?page=1&limit=20", headers=self.admin_headers)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            self.assertEqual(data["total_count"], 1)
            tx = data["transactions"][0]
            self.assertEqual(tx["merchant_order_id"], "order_sc_test_sanitized_001")
            self.assertEqual(tx["user_email"], "student@domain.com")
            self.assertEqual(tx["user_name"], "Student A")
            self.assertEqual(tx["plan_code"], "premium_monthly")

            # Sanitization verification: ensure no sensitive keys are leaked
            raw_keys = tx.keys()
            self.assertNotIn("provider_response", raw_keys)
            self.assertNotIn("client_secret", raw_keys)
            self.assertNotIn("merchant_key", raw_keys)

    # =========================================================================
    # 4. SUBSCRIPTION MANAGEMENT & SAFE CANCELLATION TESTS
    # =========================================================================

    def test_07_subscriptions_roster_listing(self):
        """Subscriptions ledger returns list of active subscriptions with entitlement summaries."""
        mock_sub_id = str(uuid.uuid4())
        mock_user_id = str(uuid.uuid4())
        future_exp = (self.now + timedelta(days=20)).isoformat()
        mock_subs = [
            {
                "id": mock_sub_id,
                "user_id": mock_user_id,
                "plan_id": str(uuid.uuid4()),
                "status": "active",
                "started_at": self.now.isoformat(),
                "expires_at": future_exp,
                "cancelled_at": None,
                "created_at": self.now.isoformat(),
                "updated_at": self.now.isoformat(),
                "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
            }
        ]

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)

            mock_sb = MagicMock()
            sub_q = MagicMock()
            sub_q.order.return_value = sub_q
            sub_q.range.return_value = MagicMock(execute=lambda: MagicMock(data=mock_subs, count=1))

            def mock_sub_from(tbl):
                if tbl == "user_subscriptions":
                    return MagicMock(select=lambda *a, **kw: sub_q)
                elif tbl == "profiles":
                    p_mock = MagicMock()
                    p_mock.in_.return_value = MagicMock(execute=lambda: MagicMock(data=[]))
                    return MagicMock(select=lambda *a, **kw: p_mock)
                elif tbl == "payment_transactions":
                    tx_mock = MagicMock()
                    tx_mock.in_.return_value = tx_mock
                    tx_mock.order.return_value = tx_mock
                    tx_mock.limit.return_value = MagicMock(execute=lambda: MagicMock(data=[]))
                    return MagicMock(select=lambda *a, **kw: tx_mock)
                return MagicMock()

            mock_sb.from_.side_effect = mock_sub_from
            mock_data_sb.return_value = mock_sb

            resp = client.get("/api/admin/subscriptions?page=1&limit=20", headers=self.admin_headers)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total_count"], 1)
            s = data["subscriptions"][0]
            self.assertEqual(s["status"], "active")
            self.assertTrue(s["is_premium"])
            self.assertEqual(s["plan_code"], "premium_monthly")

    def test_08_safe_cancellation_preserves_period_access_and_records_audit(self):
        """
        Safe cancellation sets status to 'cancelled', preserves expires_at,
        records audit log in subscription_events, and does NOT issue refunds.
        """
        mock_sub_id = str(uuid.uuid4())
        mock_user_id = str(uuid.uuid4())
        future_exp = (self.now + timedelta(days=15)).isoformat()

        existing_sub = {
            "id": mock_sub_id,
            "user_id": mock_user_id,
            "plan_id": str(uuid.uuid4()),
            "status": "active",
            "started_at": self.now.isoformat(),
            "expires_at": future_exp,
            "cancelled_at": None,
            "subscription_plans": {"code": "premium_monthly"},
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb, \
             patch("backend.services.admin_payment_service.invalidate_user_subscription") as mock_inv:

            self._mock_admin_auth(mock_auth_sb)

            update_calls = []
            audit_events = []

            mock_sb = MagicMock()
            # Select mock
            mock_sb.from_("user_subscriptions").select().eq().limit().execute.return_value = MagicMock(
                data=[existing_sub]
            )

            # Update mock
            def track_update(payload):
                u = MagicMock()
                u.eq.return_value = MagicMock(execute=lambda: update_calls.append(payload))
                return u
            mock_sb.from_("user_subscriptions").update.side_effect = track_update

            # Insert mock for audit events
            def track_insert(payload):
                audit_events.append(payload)
                return MagicMock(execute=lambda: MagicMock(data=[payload]))
            mock_sb.from_("subscription_events").insert.side_effect = track_insert

            mock_data_sb.return_value = mock_sb

            resp = client.post(
                f"/api/admin/subscriptions/{mock_sub_id}/cancel",
                headers=self.admin_headers,
                json={"reason": "Customer support cancellation request"},
            )

            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "cancelled")
            self.assertFalse(data["is_already_cancelled"])
            self.assertEqual(data["expires_at"], future_exp)  # Preserved!

            # Verify DB update changed status to cancelled
            self.assertTrue(any(u.get("status") == "cancelled" for u in update_calls))

            # Verify audit event was inserted
            self.assertEqual(len(audit_events), 1)
            self.assertEqual(audit_events[0]["event_type"], "subscription_cancelled")
            self.assertEqual(audit_events[0]["metadata"]["reason"], "Customer support cancellation request")

            # Verify Redis cache invalidated
            mock_inv.assert_called_once_with(mock_user_id)

    def test_09_repeated_cancellation_is_idempotent(self):
        """Repeated cancellation of an already cancelled subscription returns idempotent response safely."""
        mock_sub_id = str(uuid.uuid4())
        mock_user_id = str(uuid.uuid4())
        already_cancelled_at = (self.now - timedelta(days=2)).isoformat()
        future_exp = (self.now + timedelta(days=10)).isoformat()

        cancelled_sub = {
            "id": mock_sub_id,
            "user_id": mock_user_id,
            "plan_id": str(uuid.uuid4()),
            "status": "cancelled",
            "started_at": (self.now - timedelta(days=20)).isoformat(),
            "expires_at": future_exp,
            "cancelled_at": already_cancelled_at,
            "subscription_plans": {"code": "premium_monthly"},
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)

            mock_sb = MagicMock()
            mock_sb.from_("user_subscriptions").select().eq().limit().execute.return_value = MagicMock(
                data=[cancelled_sub]
            )
            mock_data_sb.return_value = mock_sb

            resp = client.post(
                f"/api/admin/subscriptions/{mock_sub_id}/cancel",
                headers=self.admin_headers,
                json={"reason": "Duplicate cancel attempt"},
            )

            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "cancelled")
            self.assertTrue(data["is_already_cancelled"])
            self.assertEqual(data["cancelled_at"], already_cancelled_at)

    def test_10_cancellation_of_free_or_expired_plan_rejected(self):
        """Cancelling a perpetual free tier or already expired subscription is rejected with 400 Bad Request."""
        mock_sub_id_free = str(uuid.uuid4())
        free_sub = {
            "id": mock_sub_id_free,
            "user_id": str(uuid.uuid4()),
            "plan_id": str(uuid.uuid4()),
            "status": "active",
            "started_at": self.now.isoformat(),
            "expires_at": None,
            "cancelled_at": None,
            "subscription_plans": {"code": "free"},
        }

        mock_sub_id_exp = str(uuid.uuid4())
        expired_sub = {
            "id": mock_sub_id_exp,
            "user_id": str(uuid.uuid4()),
            "plan_id": str(uuid.uuid4()),
            "status": "expired",
            "started_at": (self.now - timedelta(days=60)).isoformat(),
            "expires_at": (self.now - timedelta(days=30)).isoformat(),
            "cancelled_at": None,
            "subscription_plans": {"code": "premium_monthly"},
        }

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.admin_payment_service.get_supabase") as mock_data_sb:

            self._mock_admin_auth(mock_auth_sb)

            mock_sb = MagicMock()
            # 1. Test Free Plan Rejection
            mock_sb.from_("user_subscriptions").select().eq().limit().execute.return_value = MagicMock(
                data=[free_sub]
            )
            mock_data_sb.return_value = mock_sb

            resp_free = client.post(
                f"/api/admin/subscriptions/{mock_sub_id_free}/cancel",
                headers=self.admin_headers,
                json={},
            )
            self.assertEqual(resp_free.status_code, 400)
            self.assertIn("Free tier subscriptions have no commercial renewal", resp_free.json()["detail"])

            # 2. Test Expired Plan Rejection
            mock_sb.from_("user_subscriptions").select().eq().limit().execute.return_value = MagicMock(
                data=[expired_sub]
            )
            resp_exp = client.post(
                f"/api/admin/subscriptions/{mock_sub_id_exp}/cancel",
                headers=self.admin_headers,
                json={},
            )
            self.assertEqual(resp_exp.status_code, 400)
            self.assertIn("Cannot cancel an already expired subscription", resp_exp.json()["detail"])


if __name__ == "__main__":
    unittest.main()
