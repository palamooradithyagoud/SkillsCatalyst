"""
backend/models/payment.py
Pydantic schemas and domain models for PhonePe payments and transaction history.
Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

from backend.models.subscription import PlanCode


class PaymentStatus(str, Enum):
    CREATED = "created"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CreatePaymentOrderRequest(BaseModel):
    plan_code: PlanCode = Field(..., description="Target commercial subscription plan code to purchase")

    model_config = {
        "json_schema_extra": {
            "example": {
                "plan_code": "premium_monthly"
            }
        }
    }


class CreatePaymentOrderResponse(BaseModel):
    success: bool = Field(..., description="Whether checkout order generation succeeded")
    merchant_order_id: str = Field(..., description="Unique merchant order tracking identifier")
    checkout_url: str = Field(..., description="PhonePe Standard Checkout redirect URL")
    amount_in_paise: int = Field(..., description="Amount charged in integer paise")
    currency: str = Field(default="INR", description="Three-letter currency code")
    plan_code: PlanCode = Field(..., description="Plan code purchased")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "merchant_order_id": "order_sc_f47ac10b58cc4372a5670e02b2c3d479",
                "checkout_url": "https://mercury-uat.phonepe.com/transact/pg?token=...",
                "amount_in_paise": 9900,
                "currency": "INR",
                "plan_code": "premium_monthly"
            }
        }
    }


class PaymentStatusResponse(BaseModel):
    merchant_order_id: str = Field(..., description="Internal order tracking ID")
    status: PaymentStatus = Field(..., description="Current transaction status")
    is_completed: bool = Field(..., description="True if payment succeeded and subscription is active")
    plan_code: str = Field(..., description="Plan associated with this payment")
    amount_in_paise: int = Field(..., description="Transaction amount in paise")
    created_at: Optional[datetime] = Field(None, description="Order timestamp")


class PaymentTransactionDTO(BaseModel):
    id: str = Field(..., description="Transaction UUID")
    merchant_order_id: str = Field(..., description="Internal order ID")
    provider_order_id: Optional[str] = Field(None, description="PhonePe transaction reference")
    plan_code: str = Field(..., description="Purchased plan code")
    plan_name: str = Field(..., description="Purchased plan display name")
    amount_in_paise: int = Field(..., description="Amount paid in integer paise")
    currency: str = Field(default="INR", description="Currency code")
    status: PaymentStatus = Field(..., description="Transaction status")
    created_at: datetime = Field(..., description="When transaction was initiated")
