"""
backend/routers/payments.py
Commercial Payment Endpoints for SkillsCatalyst.
Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, status

from backend.services.auth_service import get_current_user_id
from backend.services.payment_service import PaymentService
from backend.models.payment import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    PaymentStatusResponse,
    PaymentTransactionDTO,
)

from backend.models.coupon import (
    ValidateCouponRequest,
    CouponValidationResponse,
)
from backend.services.coupon_service import CouponService
from backend.models.reporting import PaymentReceiptDTO
from backend.services.reporting_service import ReportingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])



@router.post(
    "/create-order",
    response_model=CreatePaymentOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Commercial Payment Order",
    description="Authenticates user, derives canonical price and duration from subscription_plans, validates any coupon, and initiates PhonePe checkout.",
)
def create_order(
    payload: CreatePaymentOrderRequest,
    user_id: str = Depends(get_current_user_id),
) -> CreatePaymentOrderResponse:
    """
    Creates an internal pending payment_transactions record and initiates a PhonePe Standard Checkout session.
    """
    return PaymentService.create_order(
        user_id=user_id,
        plan_code=payload.plan_code,
        redirect_url=payload.redirect_url,
        coupon_code=payload.coupon_code,
    )


@router.post(
    "/validate-coupon",
    response_model=CouponValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate Coupon Code for Checkout",
    description="Validates a promotional coupon against plan rules, user limits, and dates, returning discounted quote in paise.",
)
def validate_coupon(
    payload: ValidateCouponRequest,
    user_id: str = Depends(get_current_user_id),
) -> CouponValidationResponse:
    """
    Validates a coupon code and calculates server-authoritative payable amount.
    """
    coupon, discount_paise, final_paise = CouponService.validate_coupon_for_user_and_plan(
        code=payload.code,
        plan_code=payload.plan_code,
        user_id=user_id,
    )

    from backend.services.subscription_service import SubscriptionService
    plan = SubscriptionService.get_plan_by_code(payload.plan_code)
    orig_paise = plan.price_in_paise if plan else (final_paise + discount_paise)

    msg = f"Coupon '{coupon.code}' applied successfully!"
    if coupon.discount_type.value == "percentage":
        msg = f"Coupon '{coupon.code}' applied! {coupon.discount_value}% discount."
    else:
        disc_rs = discount_paise / 100.0
        msg = f"Coupon '{coupon.code}' applied! ₹{disc_rs:,.2f} discount."

    return CouponValidationResponse(
        valid=True,
        coupon_code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        original_amount_in_paise=orig_paise,
        discount_in_paise=discount_paise,
        final_amount_in_paise=final_paise,
        currency="INR",
        message=msg,
    )


@router.get(
    "/status/{merchant_order_id}",
    response_model=PaymentStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Payment Transaction Status",
    description="Checks the current status of an order after returning from PhonePe.",
)
def get_payment_status(
    merchant_order_id: str,
    user_id: str = Depends(get_current_user_id),
) -> PaymentStatusResponse:
    """
    Returns verified status for a transaction belonging to the authenticated user.
    """
    return PaymentService.get_payment_status(merchant_order_id=merchant_order_id, user_id=user_id)


@router.get(
    "/history",
    response_model=List[PaymentTransactionDTO],
    status_code=status.HTTP_200_OK,
    summary="Get Payment History",
    description="Returns the authenticated user's commercial payment transaction history.",
)
def get_payment_history(
    user_id: str = Depends(get_current_user_id),
) -> List[PaymentTransactionDTO]:
    """
    Returns list of safe payment transaction records.
    """
    return PaymentService.get_user_payment_history(user_id=user_id)


@router.get(
    "/receipt/{merchant_order_id}",
    response_model=PaymentReceiptDTO,
    status_code=status.HTTP_200_OK,
    summary="Get Payment Receipt",
    description="Returns verified receipt or promotional pass confirmation for a completed transaction owned by the authenticated student.",
)
def get_payment_receipt(
    merchant_order_id: str,
    user_id: str = Depends(get_current_user_id),
) -> PaymentReceiptDTO:
    """
    Returns verified electronic receipt. Authenticated students can only access their own receipts.
    """
    return ReportingService.get_payment_receipt(
        merchant_order_id=merchant_order_id,
        requesting_user_id=user_id,
        is_admin=False,
    )
