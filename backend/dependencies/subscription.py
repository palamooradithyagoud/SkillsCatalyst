"""
backend/dependencies/subscription.py
FastAPI route dependencies for subscription and entitlement enforcement.
Phase: Payments Phase 3 — Premium Entitlement Enforcement
"""

from typing import Callable, Optional, Dict, Any
from fastapi import Depends, HTTPException, status

from backend.services.auth_service import get_current_user_id, get_session_or_user_id
from backend.services.subscription_service import SubscriptionService
from backend.models.subscription import (
    PlanCode,
    MySubscriptionResponse,
    FeatureKey,
    AccessLevel,
    EntitlementDetailDTO,
)


def get_current_user_subscription(
    user_id: str = Depends(get_current_user_id),
) -> MySubscriptionResponse:
    """
    FastAPI dependency returning current authenticated user's complete subscription state.
    """
    return SubscriptionService.get_my_subscription(user_id)


def get_current_user_plan(
    user_id: str = Depends(get_current_user_id),
) -> PlanCode:
    """
    FastAPI dependency returning user's effective PlanCode (free, premium_monthly, premium_3_month).
    """
    plan, _ = SubscriptionService.get_effective_plan(user_id)
    return plan


def require_premium(
    user_id: str = Depends(get_current_user_id),
) -> MySubscriptionResponse:
    """
    FastAPI dependency that guarantees the caller has an active premium subscription.
    Raises 403 Forbidden if user is on the free tier.
    """
    sub = SubscriptionService.get_my_subscription(user_id)
    if not sub.is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "PREMIUM_REQUIRED",
                "message": "Premium subscription required",
                "plan": sub.plan.value if hasattr(sub.plan, "value") else str(sub.plan),
            },
        )
    return sub


def require_entitlement(feature_key: str) -> Callable:
    """
    Centralized Authoritative Entitlement Dependency for Phase 3.
    Resolves caller identity via authenticated JWT or secure session token.
    Raises 403 Forbidden if feature access is NONE.
    Returns the resolved EntitlementDetailDTO(access, limit).
    """
    def _dependency(
        user_id: str = Depends(get_session_or_user_id),
    ) -> EntitlementDetailDTO:
        entitlements = SubscriptionService.get_user_entitlements(user_id)
        ent = entitlements.get(feature_key)
        if not ent or ent.access == AccessLevel.NONE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "PREMIUM_REQUIRED",
                    "feature": feature_key,
                    "message": "Premium subscription required",
                },
            )
        return ent

    return _dependency


def check_feature_quota(feature_key: str, current_count: int, user_id: str) -> None:
    """
    Evaluates whether a caller's usage count has reached or exceeded their plan limit.
    Raises HTTP 403 with machine-readable LIMIT_REACHED detail.
    Premium users and features with None limits pass unconditionally.
    """
    _, is_premium = SubscriptionService.get_effective_plan(user_id)
    if is_premium:
        return

    limit = SubscriptionService.get_feature_limit(user_id, feature_key)
    if limit is not None and current_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "LIMIT_REACHED",
                "feature": feature_key,
                "limit": limit,
            },
        )


def require_feature_access(feature_key: str) -> Callable:
    """
    Backward-compatible dependency factory for checking feature access.
    Raises 403 Forbidden if access_level == 'none'.
    """
    def _dependency(user_id: str = Depends(get_current_user_id)) -> bool:
        has_access = SubscriptionService.has_feature_access(user_id, feature_key)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "PREMIUM_REQUIRED",
                    "feature": feature_key,
                    "message": "Premium subscription required",
                },
            )
        return True

    return _dependency


def require_feature_limit(feature_key: str) -> Callable:
    """
    Dependency factory: Returns a FastAPI dependency providing the numeric cap for a feature.
    """
    def _dependency(user_id: str = Depends(get_current_user_id)) -> Optional[int]:
        return SubscriptionService.get_feature_limit(user_id, feature_key)

    return _dependency

