"""
backend/models/reporting.py
Domain models and request/response schemas for Financial Reporting, Receipts,
Secure CSV Exports, and PhonePe Payment Reconciliation.
Phase: Payments Phase 7 — Financial Reporting, Receipts, CSV Exports & Payment Reconciliation
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ReconciliationOutcome(str, Enum):
    MATCHED = "matched"
    PENDING_RECOVERED_SUCCESS = "pending_recovered_success"
    PENDING_MARKED_FAILED = "pending_marked_failed"
    AMOUNT_MISMATCH = "amount_mismatch"
    CURRENCY_MISMATCH = "currency_mismatch"
    STATUS_MISMATCH_REVIEW = "status_mismatch_review"
    MISSING_PROVIDER_REF = "missing_provider_ref"
    MISSING_SUBSCRIPTION_RECOVERED = "missing_subscription_recovered"
    COUPON_INCONSISTENCY = "coupon_inconsistency"
    PROVIDER_UNAVAILABLE = "provider_unavailable"


class PaymentReceiptDTO(BaseModel):
    receipt_id: str = Field(..., description="Unique receipt identifier, e.g. rcpt_<merchant_order_id>")
    receipt_type: str = Field(..., description="'payment_receipt' or 'promotional_confirmation'")
    merchant_order_id: str = Field(..., description="Internal merchant order reference")
    provider_order_id: Optional[str] = Field(None, description="Payment gateway transaction reference")
    payment_date: str = Field(..., description="Payment completion or creation timestamp (ISO-8601 UTC)")
    customer_id: str = Field(..., description="Purchasing student UUID")
    customer_name: Optional[str] = Field(None, description="Customer name if available")
    customer_email: Optional[str] = Field(None, description="Customer email if available")
    plan_code: str = Field(..., description="Subscription plan code")
    plan_name: str = Field(..., description="Subscription plan display name")
    duration_days: int = Field(default=30, description="Plan duration in days")
    original_amount_in_paise: int = Field(..., description="Original price before coupon discount (in paise)")
    original_amount_in_rupees: float = Field(..., description="Original price in INR rupees")
    discount_in_paise: int = Field(default=0, description="Coupon discount applied (in paise)")
    discount_in_rupees: float = Field(default=0.0, description="Coupon discount in INR rupees")
    coupon_code: Optional[str] = Field(None, description="Applied coupon code if any")
    amount_paid_in_paise: int = Field(..., description="Final charged cash amount (in paise)")
    amount_paid_in_rupees: float = Field(..., description="Final charged cash amount in INR rupees")
    currency: str = Field(default="INR", description="Three-letter currency code")
    payment_status: str = Field(..., description="Payment status: PAID or PROMOTIONAL_GRANT")
    subscription_id: Optional[str] = Field(None, description="Associated subscription UUID")
    subscription_started_at: Optional[str] = Field(None, description="Subscription active from (ISO-8601 UTC)")
    subscription_expires_at: Optional[str] = Field(None, description="Subscription access until (ISO-8601 UTC)")
    generated_at: str = Field(..., description="Receipt generation timestamp (ISO-8601 UTC)")
    is_promotional: bool = Field(default=False, description="True if this is a 100% free promotional pass")
    disclaimer: str = Field(..., description="Legal and tax transparency disclaimer")
    platform_name: str = Field(default="SkillsCatalyst", description="Platform branding name")
    platform_url: str = Field(default="https://skillscatalyst.in", description="Official website")
    support_email: str = Field(default="support@skillscatalyst.in", description="Support email")


class ReconciliationItemDTO(BaseModel):
    merchant_order_id: str = Field(..., description="Merchant order reference")
    user_id: str = Field(..., description="User UUID")
    user_email: Optional[str] = Field(None, description="User email if resolved")
    plan_code: str = Field(..., description="Plan code")
    local_status: str = Field(..., description="Status stored in database")
    local_amount_in_paise: int = Field(..., description="Amount stored in database (paise)")
    local_currency: str = Field(default="INR", description="Currency stored in database")
    provider_status: Optional[str] = Field(None, description="Authoritative PhonePe order state")
    provider_amount_in_paise: Optional[int] = Field(None, description="PhonePe authoritative amount (paise)")
    provider_currency: Optional[str] = Field(None, description="PhonePe authoritative currency")
    provider_order_id: Optional[str] = Field(None, description="PhonePe transaction reference")
    outcome: ReconciliationOutcome = Field(..., description="Reconciliation classification outcome")
    action_taken: str = Field(..., description="Safe action executed or recommended")
    requires_review: bool = Field(default=False, description="Whether transaction requires manual admin review")
    reconciled_at: str = Field(..., description="Reconciliation timestamp (ISO-8601 UTC)")
    error_detail: Optional[str] = Field(None, description="Error message if provider lookup failed")


class ReconciliationSummaryDTO(BaseModel):
    total_checked: int = Field(..., description="Total transactions evaluated in this reconciliation run")
    matched_count: int = Field(..., description="Transactions perfectly matching between DB and PhonePe")
    recovered_count: int = Field(..., description="Pending or unlinked transactions safely recovered")
    mismatches_count: int = Field(..., description="Transactions with amount, currency, or status conflict")
    unresolved_count: int = Field(..., description="Transactions unresolved due to provider lookup errors/timeouts")
    review_required_count: int = Field(..., description="Transactions flagged for human administrative review")
    started_at: str = Field(..., description="Reconciliation start timestamp (ISO-8601 UTC)")
    completed_at: str = Field(..., description="Reconciliation completion timestamp (ISO-8601 UTC)")
    items: List[ReconciliationItemDTO] = Field(default_factory=list, description="Reconciled transaction details")


class RunReconciliationRequest(BaseModel):
    preset: Optional[str] = Field(default="30d", description="Date preset: 'today', '7d', '30d', or 'all'")
    status_filter: Optional[str] = Field(default="pending", description="Filter by status: 'pending', 'success', 'all'")
    limit: int = Field(default=50, ge=1, le=200, description="Maximum transactions to reconcile in this batch")


class SingleReconciliationResponse(BaseModel):
    success: bool
    item: ReconciliationItemDTO
    message: str
