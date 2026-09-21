"""
backend/routers/subscriptions.py
Subscription and Entitlement API Endpoints.
Phase: Payments Phase 1 — Subscription + Entitlement Foundation
"""

import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status, Request, Header

from backend.services.auth_service import get_current_user_id
from backend.services.subscription_service import SubscriptionService
from backend.services.payment_service import PaymentService
from backend.models.subscription import (
    SubscriptionPlanDTO,
    MySubscriptionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get(
    "/plans",
    response_model=List[SubscriptionPlanDTO],
    status_code=status.HTTP_200_OK,
    summary="Get Active Subscription Plans",
    description="Public endpoint returning available commercial plans with canonical prices in paise.",
)
def get_plans() -> List[SubscriptionPlanDTO]:
    """
    Public catalog of commercial subscription plans.
    Guarantees prices in paise (e.g. 9900 = ₹99) and active availability.
    """
    return SubscriptionService.get_active_plans()


@router.get(
    "/me",
    response_model=MySubscriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get My Subscription & Entitlements",
    description="Authenticated endpoint returning user's effective plan, validity dates, and feature entitlements.",
)
def get_my_subscription(
    user_id: str = Depends(get_current_user_id),
) -> MySubscriptionResponse:
    """
    Returns the caller's authoritative subscription state and entitlement limits across all 7 features.
    Strictly isolated from user role (profiles.role).
    """
    return SubscriptionService.get_my_subscription(user_id)


@router.post(
    "/webhook/phonepe",
    status_code=status.HTTP_200_OK,
    summary="PhonePe Server-to-Server Webhook Callback",
    description="Public endpoint receiving signed S2S payment notifications from PhonePe to activate subscriptions.",
)
async def phonepe_webhook(
    request: Request,
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    Authoritative Webhook Receiver for PhonePe Standard Checkout.
    Validates SHA username/password or HMAC signature, enforces idempotency,
    and updates subscription state only on verified successful payment.
    """
    raw_body_bytes = await request.body()
    raw_body = raw_body_bytes.decode("utf-8")
    return PaymentService.process_webhook(authorization_header=authorization, raw_body=raw_body)
