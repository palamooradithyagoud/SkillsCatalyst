"""
backend/models/admin_payment.py
Domain models and request/response schemas for Admin Payment Dashboard & Subscription Lifecycle Management.
Phase: Payments Phase 6 — Admin Payment Dashboard & Subscription Lifecycle Management
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from backend.models.payment import PaymentStatus
from backend.models.subscription import SubscriptionStatus


class AdminPaymentMetricsDTO(BaseModel):
    total_collected_amount_in_paise: int = Field(..., description="Authoritative collected cash revenue from successful payments (in paise)")
    total_collected_amount_in_rupees: float = Field(..., description="Authoritative collected cash revenue in INR rupees")
    gross_transaction_value_in_paise: int = Field(..., description="Total value before discounts applied on successful transactions (in paise)")
    gross_transaction_value_in_rupees: float = Field(..., description="Total gross value in INR rupees")
    total_discount_amount_in_paise: int = Field(..., description="Total coupon discount amounts applied on successful transactions (in paise)")
    total_discount_amount_in_rupees: float = Field(..., description="Total discounts in INR rupees")
    successful_count: int = Field(..., description="Number of successful transactions (paid + promotional)")
    pending_count: int = Field(..., description="Number of pending transactions")
    failed_count: int = Field(..., description="Number of failed transactions")
    cancelled_count: int = Field(..., description="Number of cancelled transactions")
    promotional_pass_count: int = Field(..., description="Successful 100% free promotional pass checkouts (excluded from cash revenue)")
    currency: str = Field(default="INR", description="Three-letter currency code")
    start_date: Optional[str] = Field(None, description="Start date of metric range (ISO-8601 UTC)")
    end_date: Optional[str] = Field(None, description="End date of metric range (ISO-8601 UTC)")
    preset: Optional[str] = Field(None, description="Preset filter label: 'today', '7d', '30d', 'all', or 'custom'")
    by_plan: List[Dict[str, Any]] = Field(default_factory=list, description="Aggregates grouped by subscription plan")
    by_coupon: List[Dict[str, Any]] = Field(default_factory=list, description="Coupon discount breakdown for successful payments")
    activity: List[Dict[str, Any]] = Field(default_factory=list, description="Time series bucketed activity over selected range")


class AdminPaymentTransactionDTO(BaseModel):
    id: str = Field(..., description="Transaction UUID")
    merchant_order_id: str = Field(..., description="Internal merchant order tracking ID")
    user_id: str = Field(..., description="Purchasing user UUID")
    user_email: Optional[str] = Field(None, description="Student email if resolved")
    user_name: Optional[str] = Field(None, description="Student display name if resolved")
    plan_code: str = Field(..., description="Purchased subscription plan code")
    plan_name: str = Field(..., description="Purchased subscription plan display name")
    original_amount_in_paise: int = Field(..., description="Original plan price in paise before discount")
    discount_in_paise: int = Field(default=0, description="Coupon discount amount in paise")
    amount_in_paise: int = Field(..., description="Final charged amount in paise")
    currency: str = Field(default="INR", description="Currency code")
    coupon_code: Optional[str] = Field(None, description="Applied coupon code if any")
    status: PaymentStatus = Field(..., description="Transaction status: created, pending, success, failed, cancelled")
    created_at: str = Field(..., description="Transaction creation timestamp (ISO-8601)")
    completed_at: Optional[str] = Field(None, description="Transaction completion timestamp (ISO-8601)")
    subscription_id: Optional[str] = Field(None, description="Associated subscription UUID if provisioned")
    provider: str = Field(default="phonepe", description="Payment provider gateway")
    failure_code: Optional[str] = Field(None, description="Failure code if failed")
    failure_message: Optional[str] = Field(None, description="Human-readable failure detail if failed")


class AdminTransactionsListResponse(BaseModel):
    transactions: List[AdminPaymentTransactionDTO]
    total_count: int
    page: int
    limit: int
    total_pages: int
    has_more: bool


class AdminSubscriptionDTO(BaseModel):
    id: str = Field(..., description="Subscription record UUID")
    user_id: str = Field(..., description="Student user UUID")
    user_email: Optional[str] = Field(None, description="Student email if resolved")
    user_name: Optional[str] = Field(None, description="Student name if resolved")
    plan_id: str = Field(..., description="Subscription plan UUID")
    plan_code: str = Field(..., description="Subscription plan code")
    plan_name: str = Field(..., description="Subscription plan display name")
    status: SubscriptionStatus = Field(..., description="Subscription lifecycle status: active, expired, cancelled")
    is_premium: bool = Field(..., description="Whether user currently receives paid premium entitlements")
    started_at: Optional[str] = Field(None, description="Subscription start timestamp (ISO-8601)")
    expires_at: Optional[str] = Field(None, description="Subscription expiration timestamp (ISO-8601)")
    cancelled_at: Optional[str] = Field(None, description="Cancellation timestamp (ISO-8601) if cancelled")
    created_at: str = Field(..., description="Record creation timestamp")
    updated_at: str = Field(..., description="Record last updated timestamp")
    recent_transaction: Optional[Dict[str, Any]] = Field(None, description="Most recent associated payment transaction summary")
    entitlements_summary: Dict[str, Any] = Field(default_factory=dict, description="Summary of 7-feature entitlement gates")


class AdminSubscriptionsListResponse(BaseModel):
    subscriptions: List[AdminSubscriptionDTO]
    total_count: int
    page: int
    limit: int
    total_pages: int
    has_more: bool


class AdminCancelSubscriptionRequest(BaseModel):
    reason: Optional[str] = Field(default=None, max_length=500, description="Optional administrative reason for cancellation")


class AdminCancelSubscriptionResponse(BaseModel):
    success: bool
    subscription_id: str
    user_id: str
    status: SubscriptionStatus
    cancelled_at: str
    expires_at: Optional[str]
    message: str
    is_already_cancelled: bool
