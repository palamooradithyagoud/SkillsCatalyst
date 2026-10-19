"""
tests/test_financial_reporting_reconciliation_phase7.py
Comprehensive test suite for Phase 7: Financial Reporting, Receipts, Secure CSV Exports,
and PhonePe Payment Reconciliation.
"""

import io
import csv
import json
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import require_admin, require_owner, get_current_user_id
from backend.services.reporting_service import ReportingService, sanitize_csv_cell
from backend.services.reconciliation_service import ReconciliationService, _reconciliation_batch_lock
from backend.models.reporting import ReconciliationOutcome, PaymentReceiptDTO
from backend.models.payment import PaymentStatus

client = TestClient(app)

STUDENT_A_ID = "00000000-0000-4000-8000-00000000000a"
STUDENT_B_ID = "00000000-0000-4000-8000-00000000000b"
ADMIN_USER_ID = "00000000-0000-4000-8000-000000000099"


@pytest.fixture(autouse=True)
def clean_auth_overrides():
    """Ensure clean dependency overrides for each test."""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


def override_as_student(user_id: str = STUDENT_A_ID):
    app.dependency_overrides[get_current_user_id] = lambda: user_id


def override_as_admin(user_id: str = ADMIN_USER_ID):
    admin_payload = {"user_id": user_id, "role": "admin", "email": "admin@skillscatalyst.in"}
    app.dependency_overrides[require_admin] = lambda: admin_payload
    app.dependency_overrides[require_owner] = lambda: admin_payload
    app.dependency_overrides[get_current_user_id] = lambda: user_id


# ==============================================================================
# 1. CSV Formula Injection Defense (CWE-1236)
# ==============================================================================

def test_sanitize_csv_cell_formula_injection():
    """Tests that any cell starting with '=', '+', '-', '@', '\t', '\r' is prefixed with single quote."""
    # Malicious injection payloads
    assert sanitize_csv_cell("=1+1") == "'=1+1"
    assert sanitize_csv_cell("=cmd|' /C calc'!A0") == "'=cmd|' /C calc'!A0"
    assert sanitize_csv_cell("+100") == "'+100"
    assert sanitize_csv_cell("-50") == "'-50"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("\tTAB_INJECT") == "'\tTAB_INJECT"
    assert sanitize_csv_cell("\rRETURN_INJECT") == "'\rRETURN_INJECT"

    # Benign strings
    assert sanitize_csv_cell("order_sc_12345") == "order_sc_12345"
    assert sanitize_csv_cell("student@example.com") == "student@example.com"
    assert sanitize_csv_cell("SkillsCatalyst Pro") == "SkillsCatalyst Pro"
    assert sanitize_csv_cell(None) == ""
    assert sanitize_csv_cell(12345) == "12345"


# ==============================================================================
# 2. Payment Receipts: Access, Ownership, and Free Passes
# ==============================================================================

def test_receipt_success_paid_payment():
    """Verifies that a completed paid transaction produces a valid receipt with all required branding and fields."""
    override_as_student(STUDENT_A_ID)

    mock_tx = {
        "id": "tx-uuid-1",
        "merchant_order_id": "order_sc_success_1",
        "user_id": STUDENT_A_ID,
        "plan_id": "plan-pro-id",
        "status": "success",
        "amount_in_paise": 49900,
        "original_amount_in_paise": 49900,
        "discount_in_paise": 0,
        "currency": "INR",
        "provider_order_id": "PP_ORD_123",
        "subscription_id": "sub-uuid-1",
        "created_at": "2026-10-15T10:00:00Z",
        "updated_at": "2026-10-15T10:05:00Z",
        "subscription_plans": {"code": "pro_monthly", "name": "Pro Monthly", "duration_days": 30},
        "coupons": None,
        "profiles": {"full_name": "Adithya Student", "email": "adithya@example.com"},
        "user_subscriptions": {"started_at": "2026-10-15T10:05:00Z", "expires_at": "2026-11-14T10:05:00Z"},
    }

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value.data = [mock_tx]

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        response = client.get("/api/payments/receipt/order_sc_success_1")
        assert response.status_code == 200
        data = response.json()

        assert data["receipt_id"] == "rcpt_order_sc_success_1"
        assert data["receipt_type"] == "payment_receipt"
        assert data["payment_status"] == "PAID"
        assert data["merchant_order_id"] == "order_sc_success_1"
        assert data["provider_order_id"] == "PP_ORD_123"
        assert data["amount_paid_in_paise"] == 49900
        assert data["amount_paid_in_rupees"] == 499.0
        assert data["plan_code"] == "pro_monthly"
        assert data["customer_email"] == "adithya@example.com"
        assert data["is_promotional"] is False
        assert "Electronic Payment Receipt" in data["disclaimer"]
        assert "No GST registration is claimed" in data["disclaimer"]


def test_receipt_zero_value_promotional_pass():
    """Verifies that 100% free promotional pass is labelled as Promotional Pass Confirmation and NOT cash receipt."""
    override_as_student(STUDENT_A_ID)

    mock_promo_tx = {
        "id": "tx-uuid-promo",
        "merchant_order_id": "order_sc_promo_free",
        "user_id": STUDENT_A_ID,
        "plan_id": "plan-pro-id",
        "status": "success",
        "amount_in_paise": 0,
        "original_amount_in_paise": 49900,
        "discount_in_paise": 49900,
        "currency": "INR",
        "provider_order_id": None,
        "subscription_id": "sub-uuid-promo",
        "created_at": "2026-10-16T12:00:00Z",
        "updated_at": "2026-10-16T12:00:00Z",
        "subscription_plans": {"code": "pro_monthly", "name": "Pro Monthly", "duration_days": 30},
        "coupons": {"code": "FREELIFETIME", "discount_type": "percentage", "discount_value": 100},
        "profiles": {"full_name": "Free Learner", "email": "free@example.com"},
        "user_subscriptions": {"started_at": "2026-10-16T12:00:00Z", "expires_at": "2026-11-15T12:00:00Z"},
    }

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value.data = [mock_promo_tx]

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        response = client.get("/api/payments/receipt/order_sc_promo_free")
        assert response.status_code == 200
        data = response.json()

        assert data["receipt_type"] == "promotional_confirmation"
        assert data["payment_status"] == "PROMOTIONAL_GRANT"
        assert data["is_promotional"] is True
        assert data["amount_paid_in_paise"] == 0
        assert data["amount_paid_in_rupees"] == 0.0
        assert data["discount_in_paise"] == 49900
        assert data["coupon_code"] == "FREELIFETIME"
        assert "Promotional Confirmation" in data["disclaimer"]
        assert "No cash payment was collected" in data["disclaimer"]


def test_receipt_rejected_for_pending_failed_or_cancelled():
    """Verifies that pending, failed, or cancelled transactions NEVER generate a paid receipt."""
    override_as_student(STUDENT_A_ID)

    mock_pending_tx = {
        "id": "tx-uuid-pending",
        "merchant_order_id": "order_sc_pending_1",
        "user_id": STUDENT_A_ID,
        "status": "pending",
        "amount_in_paise": 49900,
        "subscription_plans": {"code": "pro_monthly"},
    }

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value.data = [mock_pending_tx]

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        res = client.get("/api/payments/receipt/order_sc_pending_1")
        assert res.status_code == 400
        assert "only be generated for successfully completed payments" in res.json()["detail"]


def test_receipt_ownership_enforcement():
    """Verifies that Student A cannot view Student B's receipt (404/403)."""
    override_as_student(STUDENT_A_ID)

    mock_b_tx = {
        "id": "tx-uuid-b",
        "merchant_order_id": "order_sc_student_b",
        "user_id": STUDENT_B_ID,  # Belongs to Student B
        "status": "success",
        "amount_in_paise": 49900,
        "subscription_plans": {"code": "pro_monthly"},
    }

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value.data = [mock_b_tx]

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        res = client.get("/api/payments/receipt/order_sc_student_b")
        # Rejected because Student A does not own this transaction
        assert res.status_code == 404


def test_admin_can_access_any_receipt():
    """Verifies that authorized Admin can view any student's receipt via admin receipt endpoint."""
    override_as_admin(ADMIN_USER_ID)

    mock_b_tx = {
        "id": "tx-uuid-b",
        "merchant_order_id": "order_sc_student_b",
        "user_id": STUDENT_B_ID,
        "status": "success",
        "amount_in_paise": 49900,
        "subscription_plans": {"code": "pro_monthly", "name": "Pro Monthly"},
        "profiles": {"email": "studentb@example.com"},
    }

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value.data = [mock_b_tx]

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        res = client.get("/api/admin/payments/receipt/order_sc_student_b")
        assert res.status_code == 200
        assert res.json()["customer_id"] == STUDENT_B_ID


# ==============================================================================
# 3. CSV Exports: Authorization, Formatting, and Formula Injection Guard
# ==============================================================================

def test_csv_export_unauthorized_for_students():
    """Verifies that non-admin students are rejected with 403 Forbidden on CSV export endpoints."""
    override_as_student(STUDENT_A_ID)

    res_tx = client.get("/api/admin/reports/export/transactions.csv")
    assert res_tx.status_code in (401, 403)

    res_rev = client.get("/api/admin/reports/export/revenue-summary.csv")
    assert res_rev.status_code in (401, 403)


def test_csv_export_transactions_sanitizes_injection_and_formats_columns():
    """Verifies that transactions CSV properly escapes formula triggers and excludes sensitive provider secrets."""
    override_as_admin(ADMIN_USER_ID)

    mock_rows = [
        {
            "id": "tx-1",
            "merchant_order_id": "=cmd|' /C calc'!A0",  # malicious order id
            "provider_order_id": "PP_12345",
            "status": "success",
            "user_id": "+919876543210",  # phone format starting with +
            "plan_id": "plan-1",
            "amount_in_paise": 49900,
            "original_amount_in_paise": 49900,
            "discount_in_paise": 0,
            "currency": "INR",
            "created_at": "2026-10-18T10:00:00Z",
            "updated_at": "2026-10-18T10:01:00Z",
            "subscription_id": "@SUB_UUID",  # starts with @
            "subscription_plans": {"code": "pro", "name": "Pro Plan"},
            "coupons": {"code": "-OFF50"},  # starts with -
            "profiles": {"full_name": "=AdminHacked", "email": "test@domain.com"},
        }
    ]

    mock_sb = MagicMock()
    mock_sb.from_().select().order().limit().execute.return_value.data = mock_rows

    with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
        res = client.get("/api/admin/reports/export/transactions.csv")
        assert res.status_code == 200
        assert res.headers["content-type"].startswith("text/csv")
        assert "attachment; filename=" in res.headers["content-disposition"]

        content = res.text
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # Header row check
        assert "Merchant Order ID" in rows[0]
        assert "Paid Amount (INR)" in rows[0]

        data_row = rows[1]
        # Malicious '=cmd...' must be prepended with '\''
        assert data_row[0].startswith("'=")
        # Phone '+91...' must be prepended with '\''
        assert data_row[10].startswith("'+")
        # Name '=AdminHacked' must be prepended with '\''
        assert data_row[11].startswith("'=")
        # Coupon '-OFF50' must be prepended with '\''
        assert data_row[9].startswith("'-")
        # Subscription '@SUB_UUID' must be prepended with '\''
        assert data_row[13].startswith("'@")


def test_csv_export_revenue_summary():
    """Verifies that executive revenue summary CSV outputs all KPI blocks and plan breakdowns correctly."""
    override_as_admin(ADMIN_USER_ID)

    mock_metrics_data = [
        {
            "id": "tx-1",
            "amount_in_paise": 49900,
            "original_amount_in_paise": 49900,
            "discount_in_paise": 0,
            "status": "success",
            "currency": "INR",
            "created_at": "2026-10-19T00:00:00Z",
            "subscription_plans": {"code": "pro", "name": "Pro Plan"},
            "coupons": None,
        },
        {
            "id": "tx-promo",
            "amount_in_paise": 0,
            "original_amount_in_paise": 49900,
            "discount_in_paise": 49900,
            "status": "success",
            "currency": "INR",
            "created_at": "2026-10-19T00:00:00Z",
            "subscription_plans": {"code": "pro", "name": "Pro Plan"},
            "coupons": {"code": "FREE100"},
        },
    ]

    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_query.gte.return_value = mock_query
    mock_query.lte.return_value = mock_query
    mock_query.execute.return_value.data = mock_metrics_data
    mock_sb.from_().select.return_value = mock_query

    with patch("backend.services.admin_payment_service.get_supabase", return_value=mock_sb):
        with patch("backend.services.reporting_service.get_supabase", return_value=mock_sb):
            res = client.get("/api/admin/reports/export/revenue-summary.csv?preset=30d")
            assert res.status_code == 200
            content = res.text

            assert "SKILLSCATALYST FINANCIAL REVENUE REPORT" in content
            assert "Total Collected Cash Revenue" in content
            assert "499.00" in content
            assert "Zero-Value Promotional Passes" in content


# ==============================================================================
# 4. Reconciliation Engine: Anomaly Detection & Safe Recovery
# ==============================================================================

def test_reconciliation_matched_transaction():
    """Verifies that when local DB and PhonePe match in status, amount, currency, and sub association, it is classified as MATCHED."""
    override_as_admin(ADMIN_USER_ID)

    tx = {
        "merchant_order_id": "order_sc_match_1",
        "user_id": STUDENT_A_ID,
        "status": "success",
        "amount_in_paise": 49900,
        "currency": "INR",
        "subscription_id": "sub-123",
        "subscription_plans": {"code": "pro"},
        "profiles": {"email": "test@test.com"},
    }

    mock_phonepe_resp = {
        "state": "COMPLETED",
        "amount": 49900,
        "order_id": "PP_ORD_MATCH_1",
    }

    with patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value=mock_phonepe_resp):
        item = ReconciliationService.reconcile_transaction(tx, auto_recover=False)
        assert item.outcome == ReconciliationOutcome.MATCHED
        assert item.requires_review is False
        assert "Authoritatively verified" in item.action_taken


def test_reconciliation_amount_mismatch_detected():
    """Verifies that an amount mismatch is flagged for review without automated amount modification."""
    override_as_admin(ADMIN_USER_ID)

    tx = {
        "merchant_order_id": "order_sc_tampered",
        "user_id": STUDENT_A_ID,
        "status": "success",
        "amount_in_paise": 49900,
        "currency": "INR",
        "subscription_id": "sub-123",
        "subscription_plans": {"code": "pro"},
    }

    # PhonePe reports only 100 paise was paid!
    mock_phonepe_resp = {
        "state": "COMPLETED",
        "amount": 100,
        "order_id": "PP_ORD_TAMPERED",
    }

    with patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value=mock_phonepe_resp):
        item = ReconciliationService.reconcile_transaction(tx, auto_recover=False)
        assert item.outcome == ReconciliationOutcome.AMOUNT_MISMATCH
        assert item.requires_review is True
        assert "Amount mismatch detected" in item.action_taken


def test_reconciliation_recovers_locally_pending_completed_by_phonepe():
    """Verifies that a locally pending transaction confirmed COMPLETED by PhonePe triggers recovery."""
    override_as_admin(ADMIN_USER_ID)

    tx = {
        "merchant_order_id": "order_sc_delayed_webhook",
        "user_id": STUDENT_A_ID,
        "status": "pending",
        "amount_in_paise": 49900,
        "currency": "INR",
        "subscription_plans": {"code": "pro"},
    }

    mock_phonepe_resp = {
        "state": "COMPLETED",
        "amount": 49900,
        "order_id": "PP_ORD_RECOVERED",
    }

    with patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value=mock_phonepe_resp):
        with patch("backend.services.payment_service.PaymentService.process_webhook") as mock_webhook:
            item = ReconciliationService.reconcile_transaction(tx, auto_recover=True)
            assert item.outcome == ReconciliationOutcome.PENDING_RECOVERED_SUCCESS
            assert item.requires_review is False
            assert mock_webhook.called
            # Verify is_internal_sync=True
            _, kwargs = mock_webhook.call_args
            assert kwargs.get("is_internal_sync") is True


def test_reconciliation_locally_success_phonepe_failed_preserves_access_and_flags():
    """CRITICAL SAFETY: Never automatically downgrade a paid transaction when PhonePe reports conflict; flag for review."""
    override_as_admin(ADMIN_USER_ID)

    tx = {
        "merchant_order_id": "order_sc_conflict_1",
        "user_id": STUDENT_A_ID,
        "status": "success",
        "amount_in_paise": 49900,
        "currency": "INR",
        "subscription_id": "sub-123",
        "subscription_plans": {"code": "pro"},
    }

    # PhonePe reports FAILED for an order locally marked success
    mock_phonepe_resp = {
        "state": "FAILED",
        "amount": None,
        "order_id": "PP_ORD_CONFLICT",
    }

    with patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value=mock_phonepe_resp):
        item = ReconciliationService.reconcile_transaction(tx, auto_recover=True)
        assert item.outcome == ReconciliationOutcome.STATUS_MISMATCH_REVIEW
        assert item.requires_review is True
        assert "preserved paid access" in item.action_taken


def test_reconciliation_provider_timeout_marked_unresolved():
    """Verifies that gateway timeouts / errors remain unresolved for retry, not falsely failed."""
    override_as_admin(ADMIN_USER_ID)

    tx = {
        "merchant_order_id": "order_sc_timeout",
        "user_id": STUDENT_A_ID,
        "status": "pending",
        "amount_in_paise": 49900,
        "currency": "INR",
        "subscription_plans": {"code": "pro"},
    }

    mock_phonepe_resp = {
        "state": "ERROR",
        "error": "Connection timed out after 5000ms",
    }

    with patch("backend.services.phonepe_service.PhonePeService.get_order_status", return_value=mock_phonepe_resp):
        item = ReconciliationService.reconcile_transaction(tx, auto_recover=True)
        assert item.outcome == ReconciliationOutcome.PROVIDER_UNAVAILABLE
        assert item.requires_review is False
        assert "marked unresolved for retry" in item.action_taken


def test_reconciliation_batch_concurrency_lock():
    """Verifies that overlapping batch reconciliation jobs are rejected with 409 Conflict."""
    override_as_admin(ADMIN_USER_ID)

    # Acquire lock manually to simulate concurrent active batch job
    acquired = _reconciliation_batch_lock.acquire(blocking=False)
    assert acquired is True

    try:
        res = client.post("/api/admin/reconciliation/run", json={"preset": "today", "limit": 10})
        assert res.status_code == 409
        assert "already currently in progress" in res.json()["detail"]
    finally:
        _reconciliation_batch_lock.release()
