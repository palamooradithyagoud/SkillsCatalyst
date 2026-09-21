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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post(
    "/create-order",
    response_model=CreatePaymentOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Commercial Payment Order",
    description="Authenticates user, derives canonical price and duration from subscription_plans, and initiates PhonePe checkout.",
)
def create_order(
    payload: CreatePaymentOrderRequest,
    user_id: str = Depends(get_current_user_id),
) -> CreatePaymentOrderResponse:
    """
    Creates an internal pending payment_transactions record and initiates a PhonePe Standard Checkout session.
    """
    return PaymentService.create_order(user_id=user_id, plan_code=payload.plan_code)


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
