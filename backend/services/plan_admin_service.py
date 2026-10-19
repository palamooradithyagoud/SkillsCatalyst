"""
backend/services/plan_admin_service.py
Service for Admin-controlled subscription plans and pricing management.
Phase: Payments Phase 2 — Admin-Controlled Plans & Pricing

Invariants Enforced:
1. Canonical 'free' plan cannot be deactivated, cannot have price > 0, and duration is perpetual (None).
2. Commercial plans must have price_in_paise > 0, valid duration_days >= 1, and currency INR.
3. Plan code and ID are immutable once created to preserve historical transaction and audit integrity.
4. Server-authoritative validation prevents mass assignment and unauthorized changes.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import HTTPException, status

from backend.models.subscription import (
    SubscriptionPlanAdminDTO,
    CreatePlanRequest,
    UpdatePlanRequest,
    FeatureKey,
    AccessLevel,
)
from backend.services.supabase_service import get_supabase

logger = logging.getLogger("skillscatalyst.plans_admin")


class PlanAdminService:
    @staticmethod
    def get_all_plans_admin() -> List[SubscriptionPlanAdminDTO]:
        """
        Retrieves all subscription plans (active and inactive) for the Admin interface.
        Deterministically ordered by price_in_paise ASC, created_at ASC.
        """
        sb = get_supabase()
        if not sb:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable.",
            )

        try:
            res = (
                sb.from_("subscription_plans")
                .select("*")
                .order("price_in_paise", desc=False)
                .order("created_at", desc=False)
                .execute()
            )
            plans = []
            for row in res.data or []:
                plans.append(
                    SubscriptionPlanAdminDTO(
                        id=str(row["id"]),
                        code=str(row["code"]),
                        name=str(row["name"]),
                        description=row.get("description"),
                        price_in_paise=int(row["price_in_paise"]),
                        currency=str(row.get("currency", "INR")),
                        duration_days=row.get("duration_days"),
                        is_active=bool(row.get("is_active", True)),
                        created_at=str(row.get("created_at") or ""),
                        updated_at=str(row.get("updated_at") or ""),
                    )
                )
            return plans
        except Exception as e:
            logger.error(f"Error fetching admin plans: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve plans from database.",
            )

    @staticmethod
    def create_plan(payload: CreatePlanRequest) -> SubscriptionPlanAdminDTO:
        """
        Creates a new subscription plan with strict server-side validation.
        """
        sb = get_supabase()
        if not sb:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable.",
            )

        code_clean = payload.code.strip().lower()

        # Currency restriction
        if payload.currency.upper() != "INR":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only 'INR' currency is supported for commercial plans.",
            )

        # Invariants for Free vs Commercial plans
        if code_clean == "free":
            if payload.price_in_paise != 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The free plan must have a price of 0 paise.",
                )
            if payload.duration_days is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The free plan cannot have an expiration duration.",
                )
        else:
            if payload.price_in_paise <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Commercial plans must have a price greater than 0 paise.",
                )
            if payload.duration_days is None or payload.duration_days < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Commercial plans must specify a duration of at least 1 day.",
                )

        # Check code uniqueness
        try:
            existing = sb.from_("subscription_plans").select("id").eq("code", code_clean).execute()
            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A subscription plan with code '{code_clean}' already exists.",
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error checking plan code uniqueness: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify plan code uniqueness.",
            )

        now = datetime.now(timezone.utc).isoformat()
        insert_data = {
            "code": code_clean,
            "name": payload.name.strip(),
            "description": payload.description.strip() if payload.description else None,
            "price_in_paise": payload.price_in_paise,
            "currency": payload.currency.upper(),
            "duration_days": payload.duration_days,
            "is_active": payload.is_active,
            "created_at": now,
            "updated_at": now,
        }

        try:
            insert_res = sb.from_("subscription_plans").insert(insert_data).execute()
            if not insert_res.data or len(insert_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database failed to insert plan record.",
                )
            created_row = insert_res.data[0]
            plan_id = str(created_row["id"])

            # Auto-seed standard entitlements for new commercial plan
            if code_clean != "free":
                entitlements = [
                    {"plan_id": plan_id, "feature_key": FeatureKey.SAVED_VIDEOS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.COMPANY_INTERVIEW_QUESTIONS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.PLACEMENT_PREP.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.SCHOLARSHIPS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.TECH_NEWS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.AI_MENTOR.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                    {"plan_id": plan_id, "feature_key": FeatureKey.ROADMAPS.value, "access_level": AccessLevel.FULL.value, "limit_value": None},
                ]
                try:
                    sb.from_("plan_entitlements").insert(entitlements).execute()
                except Exception as ent_err:
                    logger.error(f"Entitlement auto-seed failed for plan {code_clean}, rolling back plan creation: {ent_err}")
                    try:
                        sb.from_("subscription_plans").delete().eq("id", plan_id).execute()
                    except Exception as rb_err:
                        logger.error(f"Failed to rollback plan {plan_id}: {rb_err}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to initialize plan entitlements. Plan creation was rolled back.",
                    )

            try:
                from backend.services.subscription_service import SubscriptionService
                SubscriptionService.invalidate_plan_entitlements_cache(code_clean)
            except Exception:
                pass

            return SubscriptionPlanAdminDTO(
                id=plan_id,
                code=str(created_row["code"]),
                name=str(created_row["name"]),
                description=created_row.get("description"),
                price_in_paise=int(created_row["price_in_paise"]),
                currency=str(created_row.get("currency", "INR")),
                duration_days=created_row.get("duration_days"),
                is_active=bool(created_row.get("is_active", True)),
                created_at=str(created_row.get("created_at") or now),
                updated_at=str(created_row.get("updated_at") or now),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating subscription plan: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create subscription plan: {str(e)}",
            )

    @staticmethod
    def update_plan(plan_id: str, payload: UpdatePlanRequest) -> SubscriptionPlanAdminDTO:
        """
        Updates an existing plan.
        Preserves plan identity and code. Rejects illegal state modifications.
        """
        sb = get_supabase()
        if not sb:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable.",
            )

        # 1. Fetch current plan
        try:
            curr = sb.from_("subscription_plans").select("*").eq("id", plan_id).limit(1).execute()
            if not curr.data or len(curr.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Plan with ID '{plan_id}' not found.",
                )
            existing = curr.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error looking up plan for update: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch plan from database.",
            )

        is_free_plan = (existing.get("code") == "free")

        # 2. Invariant validation for Free plan
        if is_free_plan:
            if payload.price_in_paise is not None and payload.price_in_paise != 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The foundational free plan price cannot be set above zero.",
                )
            if payload.duration_days is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The free plan cannot have an expiration duration.",
                )
            if payload.is_active is False:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The foundational free tier cannot be deactivated.",
                )
        else:
            if payload.price_in_paise is not None and payload.price_in_paise <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Commercial plans must have a price greater than 0 paise.",
                )
            if payload.duration_days is not None and payload.duration_days < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Commercial plans must have a duration of at least 1 day.",
                )

        update_fields: Dict[str, Any] = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if payload.name is not None:
            clean_name = payload.name.strip()
            if not clean_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Plan name cannot be empty.",
                )
            update_fields["name"] = clean_name

        if payload.description is not None:
            update_fields["description"] = payload.description.strip() or None

        if payload.price_in_paise is not None:
            update_fields["price_in_paise"] = payload.price_in_paise

        if payload.duration_days is not None:
            update_fields["duration_days"] = payload.duration_days

        if payload.is_active is not None:
            update_fields["is_active"] = payload.is_active

        try:
            upd_res = (
                sb.from_("subscription_plans")
                .update(update_fields)
                .eq("id", plan_id)
                .execute()
            )
            if not upd_res.data or len(upd_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update plan record.",
                )
            updated_row = upd_res.data[0]
            try:
                from backend.services.subscription_service import SubscriptionService
                SubscriptionService.invalidate_plan_entitlements_cache(str(existing.get("code")))
            except Exception:
                pass

            return SubscriptionPlanAdminDTO(
                id=str(updated_row["id"]),
                code=str(updated_row["code"]),
                name=str(updated_row["name"]),
                description=updated_row.get("description"),
                price_in_paise=int(updated_row["price_in_paise"]),
                currency=str(updated_row.get("currency", "INR")),
                duration_days=updated_row.get("duration_days"),
                is_active=bool(updated_row.get("is_active", True)),
                created_at=str(updated_row.get("created_at") or ""),
                updated_at=str(updated_row.get("updated_at") or ""),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating plan {plan_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update subscription plan.",
            )

    @staticmethod
    def set_plan_status(plan_id: str, is_active: bool) -> SubscriptionPlanAdminDTO:
        """
        Activates or deactivates a plan.
        Safe for idempotent repeats. Prevents deactivating the free plan.
        """
        sb = get_supabase()
        if not sb:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable.",
            )

        try:
            curr = sb.from_("subscription_plans").select("*").eq("id", plan_id).limit(1).execute()
            if not curr.data or len(curr.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Plan with ID '{plan_id}' not found.",
                )
            existing = curr.data[0]
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error finding plan: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to lookup plan.",
            )

        if existing.get("code") == "free" and not is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The foundational free tier cannot be deactivated.",
            )

        # Idempotent check
        if existing.get("is_active") == is_active:
            return SubscriptionPlanAdminDTO(
                id=str(existing["id"]),
                code=str(existing["code"]),
                name=str(existing["name"]),
                description=existing.get("description"),
                price_in_paise=int(existing["price_in_paise"]),
                currency=str(existing.get("currency", "INR")),
                duration_days=existing.get("duration_days"),
                is_active=bool(existing.get("is_active", True)),
                created_at=str(existing.get("created_at") or ""),
                updated_at=str(existing.get("updated_at") or ""),
            )

        now = datetime.now(timezone.utc).isoformat()
        try:
            upd_res = (
                sb.from_("subscription_plans")
                .update({"is_active": is_active, "updated_at": now})
                .eq("id", plan_id)
                .execute()
            )
            if not upd_res.data or len(upd_res.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update plan status.",
                )
            row = upd_res.data[0]
            try:
                from backend.services.subscription_service import SubscriptionService
                SubscriptionService.invalidate_plan_entitlements_cache(str(existing.get("code")))
            except Exception:
                pass

            return SubscriptionPlanAdminDTO(
                id=str(row["id"]),
                code=str(row["code"]),
                name=str(row["name"]),
                description=row.get("description"),
                price_in_paise=int(row["price_in_paise"]),
                currency=str(row.get("currency", "INR")),
                duration_days=row.get("duration_days"),
                is_active=bool(row.get("is_active", True)),
                created_at=str(row.get("created_at") or ""),
                updated_at=str(row.get("updated_at") or ""),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error setting plan status {plan_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update plan status.",
            )
