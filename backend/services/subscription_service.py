"""
backend/services/subscription_service.py
Centralized Subscription and Feature Entitlement service for SkillsCatalyst.
Authoritative source for resolving commercial plans, expiry states, and feature permissions.
Phase: Payments Phase 1 — Subscription + Entitlement Foundation
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple

from backend.services.supabase_service import get_supabase
from backend.models.subscription import (
    PlanCode,
    SubscriptionStatus,
    AccessLevel,
    FeatureKey,
    SubscriptionPlanDTO,
    EntitlementDetailDTO,
    MySubscriptionResponse,
    DEFAULT_CANONICAL_PLANS,
    DEFAULT_FREE_ENTITLEMENTS,
    DEFAULT_PREMIUM_ENTITLEMENTS,
)

logger = logging.getLogger(__name__)


def _parse_timestamp(val: Any) -> Optional[datetime]:
    """Safely parse Supabase timestamp string into UTC datetime using standard library."""
    if not val:
        return None
    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=timezone.utc)
        return val
    try:
        clean_val = str(val).strip().replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_val)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception as e:
        logger.warning(f"Error parsing timestamp {val}: {e}")
        return None


class SubscriptionService:
    """
    Central service for fetching commercial subscription plans, checking active user subscriptions,
    evaluating time-based expiry and grace periods, and resolving 7-feature entitlement gates.
    """

    @staticmethod
    def get_active_plans() -> List[SubscriptionPlanDTO]:
        """
        Fetches all active subscription plans from database, ordered by price.
        Falls back cleanly to canonical in-memory plans if database connection is unavailable.
        """
        sb = get_supabase()
        if sb:
            try:
                res = (
                    sb.from_("subscription_plans")
                    .select("*")
                    .eq("is_active", True)
                    .order("price_in_paise", desc=False)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    plans = []
                    for row in res.data:
                        plans.append(
                            SubscriptionPlanDTO(
                                id=str(row["id"]),
                                code=PlanCode(row["code"]),
                                name=str(row["name"]),
                                description=row.get("description"),
                                price_in_paise=int(row["price_in_paise"]),
                                currency=str(row.get("currency", "INR")),
                                duration_days=row.get("duration_days"),
                                is_active=bool(row.get("is_active", True)),
                            )
                        )
                    return plans
            except Exception as e:
                logger.warning(f"Failed to fetch subscription_plans from DB, using canonical fallback: {e}")

        return DEFAULT_CANONICAL_PLANS

    @staticmethod
    def get_plan_by_code(code: str) -> Optional[SubscriptionPlanDTO]:
        """Looks up a specific plan by code, either from DB or canonical defaults."""
        plans = SubscriptionService.get_active_plans()
        for p in plans:
            if p.code.value == code:
                return p
        return None

    @staticmethod
    def get_user_subscription_record(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Queries raw user subscription records from Supabase, prioritizing active or recent subscriptions.
        """
        if not user_id:
            return None

        sb = get_supabase()
        if not sb:
            return None

        try:
            res = (
                sb.from_("user_subscriptions")
                .select("*, subscription_plans(*)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            rows = res.data or []
            if not rows:
                return None

            # Look for active or cancelled subscriptions with future or null expiry first
            now = datetime.now(timezone.utc)
            for row in rows:
                st = row.get("status")
                exp = _parse_timestamp(row.get("expires_at"))
                if st in ("active", "cancelled"):
                    if exp is None or exp > now:
                        return row

            # If no currently valid row found, return the most recent subscription row
            return rows[0]
        except Exception as e:
            logger.warning(f"Error querying user_subscriptions for {user_id}: {e}")
            return None

    @staticmethod
    def resolve_effective_subscription(user_id: str) -> Dict[str, Any]:
        """
        Authoritative calculation of effective plan, status, and premium flag:
        - No active subscription -> free, is_premium = False.
        - Active subscription & expires_at > now() -> premium_monthly/premium_3_month, is_premium = True.
        - Active subscription & expires_at <= now() -> free, status=expired, is_premium = False.
        - Cancelled subscription & expires_at > now() -> retains premium until expires_at, status=cancelled, is_premium = True.
        - Cancelled subscription & expires_at <= now() -> free, status=expired, is_premium = False.
        """
        sub = SubscriptionService.get_user_subscription_record(user_id)
        now = datetime.now(timezone.utc)

        # If user has no active subscription or is expired, check if any pending payment completed
        if not sub or (sub.get("expires_at") and (_parse_timestamp(sub.get("expires_at")) or now) <= now):
            try:
                from backend.services.payment_service import PaymentService
                if PaymentService.sync_pending_user_payments(user_id):
                    sub = SubscriptionService.get_user_subscription_record(user_id)
            except Exception as sync_err:
                logger.debug(f"Pending payment sync error for {user_id}: {sync_err}")

        if not sub:
            return {
                "plan": PlanCode.FREE,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": False,
                "started_at": None,
                "expires_at": None,
                "cancelled_at": None,
                "raw_sub": None,
            }

        status_str = str(sub.get("status", "expired")).lower()
        started_at = _parse_timestamp(sub.get("started_at"))
        expires_at = _parse_timestamp(sub.get("expires_at"))
        cancelled_at = _parse_timestamp(sub.get("cancelled_at"))

        plan_rel = sub.get("subscription_plans") or {}
        plan_code_str = plan_rel.get("code") or "free"
        try:
            stored_plan_code = PlanCode(plan_code_str)
        except ValueError:
            stored_plan_code = PlanCode.FREE

        # Case 1: Free plan row
        if stored_plan_code == PlanCode.FREE:
            return {
                "plan": PlanCode.FREE,
                "status": SubscriptionStatus.ACTIVE,
                "is_premium": False,
                "started_at": started_at,
                "expires_at": None,
                "cancelled_at": None,
                "raw_sub": sub,
            }

        # Case 2: Active or Cancelled with Future Expiry
        is_unexpired = expires_at is None or expires_at > now

        if status_str == "active":
            if is_unexpired:
                return {
                    "plan": stored_plan_code,
                    "status": SubscriptionStatus.ACTIVE,
                    "is_premium": True,
                    "started_at": started_at,
                    "expires_at": expires_at,
                    "cancelled_at": None,
                    "raw_sub": sub,
                }
            else:
                # Expired active subscription
                return {
                    "plan": PlanCode.FREE,
                    "status": SubscriptionStatus.EXPIRED,
                    "is_premium": False,
                    "started_at": started_at,
                    "expires_at": expires_at,
                    "cancelled_at": None,
                    "raw_sub": sub,
                }

        elif status_str == "cancelled":
            if is_unexpired:
                # User cancelled renewal but retains paid access until period end
                return {
                    "plan": stored_plan_code,
                    "status": SubscriptionStatus.CANCELLED,
                    "is_premium": True,
                    "started_at": started_at,
                    "expires_at": expires_at,
                    "cancelled_at": cancelled_at,
                    "raw_sub": sub,
                }
            else:
                # Cancelled and now expired
                return {
                    "plan": PlanCode.FREE,
                    "status": SubscriptionStatus.EXPIRED,
                    "is_premium": False,
                    "started_at": started_at,
                    "expires_at": expires_at,
                    "cancelled_at": cancelled_at,
                    "raw_sub": sub,
                }

        # Case 3: Explicitly marked expired
        return {
            "plan": PlanCode.FREE,
            "status": SubscriptionStatus.EXPIRED,
            "is_premium": False,
            "started_at": started_at,
            "expires_at": expires_at,
            "cancelled_at": cancelled_at,
            "raw_sub": sub,
        }

    @staticmethod
    def get_effective_plan(user_id: str) -> Tuple[PlanCode, bool]:
        """Returns tuple of (effective_plan_code, is_premium)."""
        resolved = SubscriptionService.resolve_effective_subscription(user_id)
        return resolved["plan"], resolved["is_premium"]

    @staticmethod
    def get_user_entitlements(user_id: str) -> Dict[str, EntitlementDetailDTO]:
        """
        Returns full 7-feature entitlement dictionary based on user's effective plan.
        Tries DB resolution first, falls back to canonical entitlements.
        """
        plan_code, is_premium = SubscriptionService.get_effective_plan(user_id)

        sb = get_supabase()
        if sb:
            try:
                res = (
                    sb.from_("plan_entitlements")
                    .select("feature_key, access_level, limit_value, subscription_plans!inner(code)")
                    .eq("subscription_plans.code", plan_code.value)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    entitlements: Dict[str, EntitlementDetailDTO] = {}
                    for row in res.data:
                        fk = row["feature_key"]
                        acc = AccessLevel(row["access_level"])
                        lim = row.get("limit_value")
                        entitlements[fk] = EntitlementDetailDTO(access=acc, limit=lim)
                    # Verify all 7 feature keys present
                    all_present = all(k.value in entitlements for k in FeatureKey)
                    if all_present:
                        return entitlements
            except Exception as e:
                logger.warning(f"Failed to query plan_entitlements for {plan_code.value}: {e}")

        # Fallback to canonical in-memory dictionary
        if is_premium:
            return {k: v.model_copy() for k, v in DEFAULT_PREMIUM_ENTITLEMENTS.items()}
        return {k: v.model_copy() for k, v in DEFAULT_FREE_ENTITLEMENTS.items()}

    @staticmethod
    def has_feature_access(user_id: str, feature_key: str) -> bool:
        """
        Checks if the user has access to a specific feature (access_level != 'none').
        """
        entitlements = SubscriptionService.get_user_entitlements(user_id)
        ent = entitlements.get(feature_key)
        if not ent:
            return False
        return ent.access != AccessLevel.NONE

    @staticmethod
    def get_feature_limit(user_id: str, feature_key: str) -> Optional[int]:
        """
        Returns numeric cap for a feature or None if unrestricted/unsupported.
        """
        entitlements = SubscriptionService.get_user_entitlements(user_id)
        ent = entitlements.get(feature_key)
        if not ent:
            return None
        return ent.limit

    @staticmethod
    def get_my_subscription(user_id: str) -> MySubscriptionResponse:
        """
        Full payload for GET /api/subscriptions/me.
        """
        resolved = SubscriptionService.resolve_effective_subscription(user_id)
        entitlements = SubscriptionService.get_user_entitlements(user_id)

        return MySubscriptionResponse(
            plan=resolved["plan"],
            status=resolved["status"],
            is_premium=resolved["is_premium"],
            started_at=resolved["started_at"],
            expires_at=resolved["expires_at"],
            cancelled_at=resolved["cancelled_at"],
            entitlements=entitlements,
        )

    @staticmethod
    def activate_or_extend_subscription(
        user_id: str,
        plan_id: str,
        duration_days: int,
        provider: str = "phonepe",
        provider_event_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Activates or extends a user's subscription:
        - If user has an active premium period (expires_at > now), new duration is added to existing expires_at.
        - If user has no subscription or it is already expired, a fresh period starts from now.
        - Updates or inserts user_subscriptions row via Supabase service role.
        - Records immutable event in subscription_events.
        """
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        existing = SubscriptionService.resolve_effective_subscription(user_id)

        is_currently_active = (
            existing["is_premium"]
            and existing.get("expires_at") is not None
            and existing["expires_at"] > now
        )

        if is_currently_active:
            started_at = existing.get("started_at") or now
            new_expires_at = existing["expires_at"] + timedelta(days=duration_days)
            is_extension = True
        else:
            started_at = now
            new_expires_at = now + timedelta(days=duration_days)
            is_extension = False

        sb = get_supabase()
        sub_id = None

        if sb:
            try:
                # Check for existing user_subscriptions row to update or insert
                existing_rows = (
                    sb.from_("user_subscriptions")
                    .select("id, status")
                    .eq("user_id", user_id)
                    .order("created_at", desc=True)
                    .limit(1)
                    .execute()
                )
                rows = existing_rows.data or []
                if rows:
                    sub_id = rows[0]["id"]
                    sb.from_("user_subscriptions").update({
                        "plan_id": plan_id,
                        "status": "active",
                        "started_at": started_at.isoformat(),
                        "expires_at": new_expires_at.isoformat(),
                        "cancelled_at": None,
                        "updated_at": now.isoformat(),
                    }).eq("id", sub_id).execute()
                else:
                    insert_res = sb.from_("user_subscriptions").insert({
                        "user_id": user_id,
                        "plan_id": plan_id,
                        "status": "active",
                        "started_at": started_at.isoformat(),
                        "expires_at": new_expires_at.isoformat(),
                        "cancelled_at": None,
                    }).execute()
                    if insert_res.data and len(insert_res.data) > 0:
                        sub_id = insert_res.data[0]["id"]

                # Audit event logging
                event_type = "subscription_updated" if is_extension else "subscription_activated"
                sb.from_("subscription_events").insert({
                    "user_id": user_id,
                    "subscription_id": sub_id,
                    "event_type": event_type,
                    "provider": provider,
                    "provider_event_id": provider_event_id,
                    "metadata": {
                        "plan_id": plan_id,
                        "duration_days": duration_days,
                        "is_extension": is_extension,
                        "expires_at": new_expires_at.isoformat(),
                    },
                }).execute()
            except Exception as e:
                logger.error(f"Failed to persist subscription activation for user {user_id}: {e}", exc_info=True)

        return {
            "subscription_id": sub_id,
            "started_at": started_at,
            "expires_at": new_expires_at,
            "is_extension": is_extension,
            "status": SubscriptionStatus.ACTIVE,
        }
