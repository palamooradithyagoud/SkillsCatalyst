"""
backend/services/reporting_service.py
Service for Financial Reporting, Receipts, Secure CSV Exports, and Audit Logging.
Phase: Payments Phase 7 — Financial Reporting, Receipts, CSV Exports & Payment Reconciliation

Invariants Enforced:
1. Strict CSV Formula Injection protection (CWE-1236): prefixes '=', '+', '-', '@', '\t', '\r' with '\''.
2. Bounded, streaming/StringIO export generation to avoid memory blowup.
3. Zero-value promotional passes are strictly labelled as 'Promotional Pass Confirmation', NOT cash payment receipts.
4. Receipts only generated for verified 'success' transactions (pending/failed/cancelled strictly rejected).
5. Student receipt ownership check: students can only access their own receipts; Admins can access all.
6. Does not invent GST numbers, company addresses, or tax rates.
7. Immutable audit logging of administrative exports and receipt access.
8. Sensitive provider secrets and auth tokens are strictly excluded from all exports and receipts.
"""

import io
import csv
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import is_valid_uuid
from backend.services.subscription_service import SubscriptionService, _parse_timestamp
from backend.services.admin_payment_service import AdminPaymentService
from backend.models.payment import PaymentStatus
from backend.models.reporting import PaymentReceiptDTO

logger = logging.getLogger("skillscatalyst.reporting")
audit_logger = logging.getLogger("skillscatalyst.audit")


def sanitize_csv_cell(value: Any) -> str:
    """
    Prevents CSV formula injection (CWE-1236).
    If a string cell starts with '=', '+', '-', '@', or control chars '\t' / '\r',
    it is prepended with a single quote (') so spreadsheet applications treat it as text.
    """
    if value is None:
        return ""
    val_str = str(value).replace("\0", "")
    if val_str and val_str[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{val_str}"
    return val_str


def record_audit_log(
    action: str,
    entity_type: str,
    entity_id: str,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Records an administrative action to both structured logger and the central public.audit_logs table.
    Ensures safe metadata: no secrets, keys, or passwords.
    """
    safe_details = details or {}
    # Strip any potential sensitive keys
    sanitized_details = {
        k: v for k, v in safe_details.items()
        if k not in ("password", "secret", "token", "raw_payload", "key", "authorization")
    }

    audit_logger.info(
        f"[PAYMENT_AUDIT] action={action} entity_type={entity_type} entity_id={entity_id} "
        f"user_id={user_id} details={sanitized_details}"
    )

    sb = get_supabase()
    if sb:
        try:
            sb.from_("audit_logs").insert({
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "user_id": user_id,
                "details": sanitized_details,
            }).execute()
        except Exception as e:
            logger.debug(f"Audit log database insert skipped: {e}")


class ReportingService:
    """
    Authoritative service for Financial Reports, Payment Receipts, and Secure CSV Exports.
    """

    @classmethod
    def get_payment_receipt(
        cls,
        merchant_order_id: str,
        requesting_user_id: str,
        is_admin: bool = False,
    ) -> PaymentReceiptDTO:
        """
        Retrieves receipt details for a transaction.
        Enforces:
        - Authenticated student can only retrieve receipts for their own transactions.
        - Admins can view any receipt.
        - Receipts are ONLY issued for 'success' status.
        - 100% free promotional checkouts are explicitly labelled as 'Promotional Pass Confirmation'.
        """
        if not merchant_order_id or not merchant_order_id.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Merchant order ID is required.",
            )

        clean_order_id = merchant_order_id.strip()
        sb = get_supabase()
        tx = None

        if sb:
            try:
                res = (
                    sb.from_("payment_transactions")
                    .select(
                        "*, subscription_plans(*), coupons(code, discount_type, discount_value), "
                        "profiles(full_name, email), user_subscriptions(started_at, expires_at)"
                    )
                    .eq("merchant_order_id", clean_order_id)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    tx = res.data[0]
            except Exception as e:
                logger.error(f"Error querying payment receipt for order {clean_order_id}: {e}")

        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{clean_order_id}' was not found.",
            )

        # 1. Ownership & Authorization Check
        tx_user_id = tx.get("user_id")
        if not is_admin and tx_user_id != requesting_user_id:
            logger.warning(
                f"Unauthorized receipt access attempt: user={requesting_user_id} tried to view receipt for order={clean_order_id} owned by user={tx_user_id}"
            )
            # Return 404 to avoid leaking transaction existence
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{clean_order_id}' was not found.",
            )

        # 2. Status Invariant: Only 'success' transactions qualify for receipts
        tx_status = (tx.get("status") or "").lower()
        if tx_status != PaymentStatus.SUCCESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Receipts can only be generated for successfully completed payments. Current status: '{tx_status}'.",
            )

        # 3. Plan, Customer, and Subscription resolution
        plan_data = tx.get("subscription_plans") or {}
        coupon_data = tx.get("coupons") or {}
        profile_data = tx.get("profiles") or {}
        sub_data = tx.get("user_subscriptions") or {}

        plan_code = plan_data.get("code") or "unknown_plan"
        plan_name = plan_data.get("name") or plan_code.replace("_", " ").title()
        duration_days = int(plan_data.get("duration_days") or 30)

        customer_name = profile_data.get("full_name") or "SkillsCatalyst Student"
        customer_email = profile_data.get("email")

        amount_paise = int(tx.get("amount_in_paise") or 0)
        disc_paise = int(tx.get("discount_in_paise") or 0)
        orig_paise = int(tx.get("original_amount_in_paise") or (amount_paise + disc_paise))

        coupon_code = coupon_data.get("code")

        is_promotional = (amount_paise == 0)
        now_utc = datetime.now(timezone.utc).isoformat()

        if is_promotional:
            receipt_type = "promotional_confirmation"
            payment_status = "PROMOTIONAL_GRANT"
            disclaimer = (
                "Promotional Confirmation: This document confirms the grant of a 100% discounted "
                "promotional subscription pass on SkillsCatalyst. No cash payment was collected. "
                "This document is not a tax invoice and carries no monetary tax credit."
            )
        else:
            receipt_type = "payment_receipt"
            payment_status = "PAID"
            disclaimer = (
                "SkillsCatalyst Electronic Payment Receipt: This electronic receipt confirms your "
                "subscription payment. Generated electronically from verified transaction records; "
                "no physical signature required. No GST registration is claimed on this electronic receipt."
            )

        # 4. Record audit trail
        record_audit_log(
            action="payment_receipt_generated",
            entity_type="payment_transaction",
            entity_id=clean_order_id,
            user_id=requesting_user_id,
            details={
                "merchant_order_id": clean_order_id,
                "is_admin": is_admin,
                "is_promotional": is_promotional,
                "amount_in_paise": amount_paise,
            },
        )

        return PaymentReceiptDTO(
            receipt_id=f"rcpt_{clean_order_id}",
            receipt_type=receipt_type,
            merchant_order_id=clean_order_id,
            provider_order_id=tx.get("provider_order_id") or tx.get("provider_payment_id"),
            payment_date=tx.get("updated_at") or tx.get("created_at") or now_utc,
            customer_id=tx_user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            plan_code=plan_code,
            plan_name=plan_name,
            duration_days=duration_days,
            original_amount_in_paise=orig_paise,
            original_amount_in_rupees=round(orig_paise / 100.0, 2),
            discount_in_paise=disc_paise,
            discount_in_rupees=round(disc_paise / 100.0, 2),
            coupon_code=coupon_code,
            amount_paid_in_paise=amount_paise,
            amount_paid_in_rupees=round(amount_paise / 100.0, 2),
            currency=tx.get("currency") or "INR",
            payment_status=payment_status,
            subscription_id=tx.get("subscription_id"),
            subscription_started_at=sub_data.get("started_at"),
            subscription_expires_at=sub_data.get("expires_at"),
            generated_at=now_utc,
            is_promotional=is_promotional,
            disclaimer=disclaimer,
            platform_name="SkillsCatalyst",
            platform_url="https://skillscatalyst.in",
            support_email="support@skillscatalyst.in",
        )

    @classmethod
    def export_transactions_csv(
        cls,
        admin_user_id: str,
        status_filter: Optional[str] = None,
        preset: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        plan_code: Optional[str] = None,
        coupon_code: Optional[str] = None,
        search: Optional[str] = None,
        max_rows: int = 5000,
    ) -> str:
        """
        Generates a secure, formula-injection-safe CSV export of payment transactions.
        Enforces maximum row bounds to prevent out-of-memory denial of service.
        """
        start_dt, end_dt, resolved_preset = AdminPaymentService._resolve_date_boundaries(
            preset, start_date, end_date
        )

        sb = get_supabase()
        rows: List[Dict[str, Any]] = []

        if sb:
            query = sb.from_("payment_transactions").select(
                "*, subscription_plans(code, name), coupons(code), profiles(full_name, email)"
            )

            if start_dt:
                query = query.gte("created_at", start_dt.isoformat())
            if end_dt:
                query = query.lte("created_at", end_dt.isoformat())

            if status_filter and status_filter.lower() != "all":
                query = query.eq("status", status_filter.lower())

            if plan_code:
                plan_obj = SubscriptionService.get_plan_by_code(plan_code)
                if plan_obj and plan_obj.id:
                    query = query.eq("plan_id", plan_obj.id)

            query = query.order("created_at", desc=True).limit(min(max_rows, 10000))
            res = query.execute()
            rows = res.data or []

        # Client-side filtering for coupon_code and search if needed
        filtered_rows = []
        for r in rows:
            c_info = r.get("coupons") or {}
            c_code = (c_info.get("code") or "").upper()
            if coupon_code and coupon_code.strip().upper() != c_code:
                continue

            if search and search.strip():
                s = search.strip().lower()
                m_order = (r.get("merchant_order_id") or "").lower()
                u_id = (r.get("user_id") or "").lower()
                prof = r.get("profiles") or {}
                u_email = (prof.get("email") or "").lower()
                u_name = (prof.get("full_name") or "").lower()
                if s not in m_order and s not in u_id and s not in u_email and s not in u_name:
                    continue

            filtered_rows.append(r)

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        # Header metadata
        generation_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        date_range_str = f"{start_dt.isoformat() if start_dt else 'Epoch'} to {end_dt.isoformat() if end_dt else 'Now'}"

        headers = [
            "Merchant Order ID",
            "Provider Order ID",
            "Payment Status",
            "Plan Code",
            "Plan Name",
            "Original Amount (INR)",
            "Discount Amount (INR)",
            "Paid Amount (INR)",
            "Currency",
            "Coupon Code",
            "Customer ID",
            "Customer Name",
            "Customer Email",
            "Subscription ID",
            "Created At (UTC)",
            "Completed At (UTC)",
        ]
        writer.writerow(headers)

        for r in filtered_rows:
            p_info = r.get("subscription_plans") or {}
            c_info = r.get("coupons") or {}
            prof = r.get("profiles") or {}

            amount_paise = int(r.get("amount_in_paise") or 0)
            disc_paise = int(r.get("discount_in_paise") or 0)
            orig_paise = int(r.get("original_amount_in_paise") or (amount_paise + disc_paise))

            row_cells = [
                sanitize_csv_cell(r.get("merchant_order_id")),
                sanitize_csv_cell(r.get("provider_order_id") or r.get("provider_payment_id")),
                sanitize_csv_cell(r.get("status")),
                sanitize_csv_cell(p_info.get("code") or "unknown"),
                sanitize_csv_cell(p_info.get("name") or "Unknown Plan"),
                f"{orig_paise / 100.0:.2f}",
                f"{disc_paise / 100.0:.2f}",
                f"{amount_paise / 100.0:.2f}",
                sanitize_csv_cell(r.get("currency") or "INR"),
                sanitize_csv_cell(c_info.get("code") or ""),
                sanitize_csv_cell(r.get("user_id")),
                sanitize_csv_cell(prof.get("full_name") or ""),
                sanitize_csv_cell(prof.get("email") or ""),
                sanitize_csv_cell(r.get("subscription_id") or ""),
                sanitize_csv_cell(r.get("created_at")),
                sanitize_csv_cell(r.get("updated_at") if r.get("status") == "success" else ""),
            ]
            writer.writerow(row_cells)

        record_audit_log(
            action="financial_report_export",
            entity_type="payment_transactions_csv",
            entity_id="transactions_ledger",
            user_id=admin_user_id,
            details={
                "preset": resolved_preset,
                "status_filter": status_filter,
                "row_count": len(filtered_rows),
                "date_range": date_range_str,
            },
        )

        return output.getvalue()

    @classmethod
    def export_revenue_summary_csv(
        cls,
        admin_user_id: str,
        preset: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> str:
        """
        Generates an authoritative executive revenue summary CSV containing:
        - Financial KPIs (Gross Value, Discounts, Net Cash Collected, Counts)
        - Revenue by Subscription Plan
        - Discounts and Redemptions by Coupon
        - Daily Revenue Breakdown
        """
        metrics = AdminPaymentService.get_payment_dashboard_metrics(
            preset=preset,
            start_date=start_date,
            end_date=end_date,
        )

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Title & Metadata
        writer.writerow(["SKILLSCATALYST FINANCIAL REVENUE REPORT"])
        writer.writerow(["Generated At (UTC)", sanitize_csv_cell(now_utc)])
        writer.writerow(["Date Range Preset", sanitize_csv_cell(metrics.preset or "all")])
        writer.writerow(["Start Date (UTC)", sanitize_csv_cell(metrics.start_date or "Epoch")])
        writer.writerow(["End Date (UTC)", sanitize_csv_cell(metrics.end_date or "Current")])
        writer.writerow([])

        # 2. Key Financial Metrics
        writer.writerow(["METRIC", "VALUE", "UNIT"])
        writer.writerow(["Total Collected Cash Revenue", f"{metrics.total_collected_amount_in_rupees:.2f}", "INR"])
        writer.writerow(["Gross Transaction Value", f"{metrics.gross_transaction_value_in_rupees:.2f}", "INR"])
        writer.writerow(["Total Coupon Discounts", f"{metrics.total_discount_amount_in_rupees:.2f}", "INR"])
        writer.writerow(["Successful Cash Transactions", str(metrics.successful_count - metrics.promotional_pass_count), "count"])
        writer.writerow(["Zero-Value Promotional Passes", str(metrics.promotional_pass_count), "count"])
        writer.writerow(["Pending Transactions", str(metrics.pending_count), "count"])
        writer.writerow(["Failed Transactions", str(metrics.failed_count), "count"])
        writer.writerow(["Cancelled Transactions", str(metrics.cancelled_count), "count"])
        writer.writerow([])

        # 3. Revenue by Subscription Plan
        writer.writerow(["REVENUE BY PLAN"])
        writer.writerow(["Plan Code", "Plan Name", "Transactions Count", "Collected Revenue (INR)"])
        for p in metrics.by_plan:
            writer.writerow([
                sanitize_csv_cell(p.get("plan_code")),
                sanitize_csv_cell(p.get("plan_name")),
                str(p.get("count", 0)),
                f"{p.get('collected_amount_in_rupees', 0.0):.2f}",
            ])
        writer.writerow([])

        # 4. Discounts by Coupon
        writer.writerow(["DISCOUNTS BY COUPON"])
        writer.writerow(["Coupon Code", "Redemptions Count", "Total Discount Granted (INR)"])
        for c in metrics.by_coupon:
            writer.writerow([
                sanitize_csv_cell(c.get("coupon_code")),
                str(c.get("redemption_count", 0)),
                f"{c.get('total_discount_in_rupees', 0.0):.2f}",
            ])
        writer.writerow([])

        # 5. Daily Transaction & Revenue Breakdown
        writer.writerow(["DAILY REVENUE BREAKDOWN"])
        writer.writerow(["Date", "Total Transactions", "Successful Count", "Collected Revenue (INR)"])
        for day in metrics.activity:
            writer.writerow([
                sanitize_csv_cell(day.get("date")),
                str(day.get("transaction_count", 0)),
                str(day.get("successful_count", 0)),
                f"{day.get('collected_amount_in_rupees', 0.0):.2f}",
            ])

        record_audit_log(
            action="financial_report_export",
            entity_type="revenue_summary_csv",
            entity_id="executive_summary",
            user_id=admin_user_id,
            details={
                "preset": metrics.preset,
                "collected_revenue_in_rupees": metrics.total_collected_amount_in_rupees,
                "successful_count": metrics.successful_count,
            },
        )

        return output.getvalue()
