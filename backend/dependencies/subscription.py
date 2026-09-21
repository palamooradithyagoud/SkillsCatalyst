"""
backend/dependencies/subscription.py
FastAPI route dependencies for subscription and entitlement enforcement.
Prepared for Phase 3 (Enforcement). Read-only and non-blocking in Phase 1.
"""

from typing import Callable, Optional, Dict, Any
from fastapi import Depends, HTTPException, status

from backend.services.auth_service import get_current_user_id
from backend.services.subscription_service import SubscriptionService
from backend.models.subscription import PlanCode, MySubscriptionResponse, FeatureKey


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
                "error": "PREMIUM_REQUIRED",
                "message": "This feature requires an active SkillsCatalyst Premium subscription.",
                "plan": sub.plan.value,
            },
        )
    return sub


def require_feature_access(feature_key: str) -> Callable:
    """
    Dependency factory: Returns a FastAPI dependency ensuring user has access to specified feature.
    Raises 403 Forbidden if the user's effective plan denies access (access_level == 'none').
    """
    def _dependency(user_id: str = Depends(get_current_user_id)) -> bool:
        has_access = SubscriptionService.has_feature_access(user_id, feature_key)
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "FEATURE_ACCESS_DENIED",
                    "feature_key": feature_key,
                    "message": f"Your current subscription plan does not include access to {feature_key}.",
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
