"""
backend/models/subscription.py
Pydantic domain models, enums, and schemas for SkillsCatalyst Subscription & Entitlement system.
Phase: Payments Phase 1 — Subscription + Entitlement Foundation
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class PlanCode(str, Enum):
    FREE = "free"
    PREMIUM_MONTHLY = "premium_monthly"
    PREMIUM_3_MONTH = "premium_3_month"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class AccessLevel(str, Enum):
    NONE = "none"
    LIMITED = "limited"
    FULL = "full"


class FeatureKey(str, Enum):
    SAVED_VIDEOS = "saved_videos"
    COMPANY_INTERVIEW_QUESTIONS = "company_interview_questions"
    PLACEMENT_PREP = "placement_prep"
    SCHOLARSHIPS = "scholarships"
    TECH_NEWS = "tech_news"
    AI_MENTOR = "ai_mentor"
    ROADMAPS = "roadmaps"


class EntitlementDetailDTO(BaseModel):
    access: AccessLevel = Field(..., description="Feature access level: none, limited, or full")
    limit: Optional[int] = Field(None, description="Numeric cap if limited (e.g. 1 saved video, 2 tech news articles)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access": "limited",
                "limit": 1
            }
        }
    }


class SubscriptionPlanDTO(BaseModel):
    id: Optional[str] = Field(None, description="UUID of the plan in database")
    code: PlanCode = Field(..., description="Unique plan code identifier")
    name: str = Field(..., description="Human-readable plan name")
    description: Optional[str] = Field(None, description="Plan description")
    price_in_paise: int = Field(..., ge=0, description="Canonical price in Indian paise (e.g. 9900 = ₹99)")
    currency: str = Field(default="INR", description="Three-letter currency code")
    duration_days: Optional[int] = Field(None, ge=1, description="Duration in days, null for free lifetime")
    is_active: bool = Field(default=True, description="Whether plan is actively available for purchase")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "11111111-2222-3333-4444-555555555555",
                "code": "premium_monthly",
                "name": "Premium Monthly",
                "description": "Fast-paced interview sprint preparation with unrestricted access",
                "price_in_paise": 9900,
                "currency": "INR",
                "duration_days": 30,
                "is_active": True
            }
        }
    }


class MySubscriptionResponse(BaseModel):
    plan: PlanCode = Field(..., description="Effective subscription plan for user")
    status: SubscriptionStatus = Field(..., description="Subscription state: active, expired, or cancelled")
    is_premium: bool = Field(..., description="Whether user effectively has premium entitlement right now")
    started_at: Optional[datetime] = Field(None, description="When current plan period began")
    expires_at: Optional[datetime] = Field(None, description="When current plan access expires, null if perpetual free")
    cancelled_at: Optional[datetime] = Field(None, description="When user cancelled, if applicable")
    entitlements: Dict[str, EntitlementDetailDTO] = Field(
        default_factory=dict,
        description="Dictionary mapping all 7 feature keys to their respective access level and limit"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "plan": "free",
                "status": "active",
                "is_premium": False,
                "started_at": "2026-09-22T00:00:00Z",
                "expires_at": None,
                "cancelled_at": None,
                "entitlements": {
                    "saved_videos": {"access": "limited", "limit": 1},
                    "company_interview_questions": {"access": "none", "limit": None},
                    "placement_prep": {"access": "none", "limit": None},
                    "scholarships": {"access": "limited", "limit": None},
                    "tech_news": {"access": "limited", "limit": 2},
                    "ai_mentor": {"access": "limited", "limit": None},
                    "roadmaps": {"access": "limited", "limit": None}
                }
            }
        }
    }


# Canonical defaults for fallback when DB is unreachable or during unit tests
DEFAULT_CANONICAL_PLANS: List[SubscriptionPlanDTO] = [
    SubscriptionPlanDTO(
        id="plan_free",
        code=PlanCode.FREE,
        name="Free",
        description="Essential foundational access to explore skills",
        price_in_paise=0,
        currency="INR",
        duration_days=None,
        is_active=True,
    ),
    SubscriptionPlanDTO(
        id="plan_premium_monthly",
        code=PlanCode.PREMIUM_MONTHLY,
        name="Premium Monthly",
        description="Fast-paced interview sprint preparation with unrestricted access",
        price_in_paise=9900,
        currency="INR",
        duration_days=30,
        is_active=True,
    ),
    SubscriptionPlanDTO(
        id="plan_premium_3_month",
        code=PlanCode.PREMIUM_3_MONTH,
        name="Premium 3 Months",
        description="Complete 90-day placement preparation pack (Save ~16%)",
        price_in_paise=25000,
        currency="INR",
        duration_days=90,
        is_active=True,
    ),
]

DEFAULT_FREE_ENTITLEMENTS: Dict[str, EntitlementDetailDTO] = {
    FeatureKey.SAVED_VIDEOS.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=1),
    FeatureKey.COMPANY_INTERVIEW_QUESTIONS.value: EntitlementDetailDTO(access=AccessLevel.NONE, limit=None),
    FeatureKey.PLACEMENT_PREP.value: EntitlementDetailDTO(access=AccessLevel.NONE, limit=None),
    FeatureKey.SCHOLARSHIPS.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=None),
    FeatureKey.TECH_NEWS.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=2),
    FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=None),
    FeatureKey.ROADMAPS.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=None),
}

DEFAULT_PREMIUM_ENTITLEMENTS: Dict[str, EntitlementDetailDTO] = {
    FeatureKey.SAVED_VIDEOS.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.COMPANY_INTERVIEW_QUESTIONS.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.PLACEMENT_PREP.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.SCHOLARSHIPS.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.TECH_NEWS.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
    FeatureKey.ROADMAPS.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None),
}
