"""
backend/models/coupon.py
Domain models, schemas, and DTOs for Admin-controlled coupons and promotional campaigns.
Phase: Phase 4 — Admin-Controlled Coupons & Promotional Campaigns
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class CreateCouponRequest(BaseModel):
    code: str = Field(..., pattern=r"^[A-Za-z0-9_-]{2,50}$", description="Alphanumeric coupon code")
    description: Optional[str] = Field(None, max_length=500, description="Optional campaign or coupon description")
    discount_type: DiscountType = Field(..., description="Discount structure: 'percentage' or 'fixed_amount'")
    discount_value: int = Field(..., gt=0, description="Percentage (1-100) or fixed amount in integer paise (>0)")
    max_discount_in_paise: Optional[int] = Field(None, gt=0, description="Optional maximum discount cap in paise")
    min_order_in_paise: int = Field(default=0, ge=0, description="Minimum order price in paise to qualify")
    start_at: Optional[datetime] = Field(default=None, description="Campaign activation timestamp (UTC)")
    expires_at: Optional[datetime] = Field(default=None, description="Campaign expiry timestamp (UTC)")
    max_uses: Optional[int] = Field(None, gt=0, description="Maximum total global redemptions allowed")
    max_uses_per_user: int = Field(default=1, ge=1, description="Per-student redemption limit")
    eligible_plan_codes: Optional[List[str]] = Field(default=None, description="Eligible plan codes (null = all plans)")
    is_active: bool = Field(default=True, description="Whether coupon is immediately active")

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        clean = v.strip().upper()
        if len(clean) < 2 or len(clean) > 50:
            raise ValueError("Coupon code must be between 2 and 50 characters.")
        return clean

    @model_validator(mode="after")
    def validate_rules(self) -> "CreateCouponRequest":
        if self.discount_type == DiscountType.PERCENTAGE:
            if self.discount_value < 1 or self.discount_value > 100:
                raise ValueError("Percentage discount must be between 1% and 100%.")
        elif self.discount_type == DiscountType.FIXED_AMOUNT:
            if self.discount_value <= 0:
                raise ValueError("Fixed amount discount must be greater than 0 paise.")

        if self.expires_at and self.start_at:
            if self.expires_at <= self.start_at:
                raise ValueError("Coupon expiry date must be strictly after the start date.")
        return self


class UpdateCouponRequest(BaseModel):
    description: Optional[str] = Field(None, max_length=500)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[int] = Field(None, gt=0)
    max_discount_in_paise: Optional[int] = Field(None, gt=0)
    min_order_in_paise: Optional[int] = Field(None, ge=0)
    start_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = Field(None, gt=0)
    max_uses_per_user: Optional[int] = Field(None, ge=1)
    eligible_plan_codes: Optional[List[str]] = None
    is_active: Optional[bool] = None

    @model_validator(mode="after")
    def validate_rules(self) -> "UpdateCouponRequest":
        if self.discount_type == DiscountType.PERCENTAGE and self.discount_value is not None:
            if self.discount_value < 1 or self.discount_value > 100:
                raise ValueError("Percentage discount must be between 1% and 100%.")
        elif self.discount_type == DiscountType.FIXED_AMOUNT and self.discount_value is not None:
            if self.discount_value <= 0:
                raise ValueError("Fixed amount discount must be greater than 0 paise.")

        if self.expires_at and self.start_at:
            if self.expires_at <= self.start_at:
                raise ValueError("Coupon expiry date must be strictly after the start date.")
        return self


class SetCouponStatusRequest(BaseModel):
    is_active: bool = Field(..., description="Active status toggle")


class CouponAdminDTO(BaseModel):
    id: str
    code: str
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: int
    max_discount_in_paise: Optional[int] = None
    min_order_in_paise: int
    start_at: datetime
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    max_uses_per_user: int
    used_count: int
    is_active: bool
    eligible_plan_codes: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


class ValidateCouponRequest(BaseModel):
    code: str = Field(..., description="Coupon code to validate")
    plan_code: str = Field(..., description="Plan code being purchased")


class CouponValidationResponse(BaseModel):
    valid: bool
    coupon_code: str
    discount_type: DiscountType
    discount_value: int
    original_amount_in_paise: int
    discount_in_paise: int
    final_amount_in_paise: int
    currency: str = "INR"
    message: str


class CouponRedemptionDTO(BaseModel):
    id: str
    coupon_id: str
    user_id: str
    payment_transaction_id: str
    discount_in_paise: int
    original_amount_in_paise: int
    final_amount_in_paise: int
    redeemed_at: datetime
