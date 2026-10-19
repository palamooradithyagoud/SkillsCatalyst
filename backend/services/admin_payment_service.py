"""
backend/services/admin_payment_service.py
Service for Admin Payment Dashboard telemetry, paginated transactions ledger,
subscription lifecycle management, and safe administrative cancellation.
Phase: Payments Phase 6 — Admin Payment Dashboard & Subscription Lifecycle Management

Invariants Enforced:
1. Authoritative revenue derived strictly from verified database records (never browser totals).
2. Collected cash revenue includes ONLY successful payments with amount > 0; pending and failed are excluded.
3. 100% free promotional pass transactions are counted as successful promotional grants, NOT cash revenue.
4. Distinguishes gross value, discounts, and net collected amounts in canonical paise and INR rupees.
5. Zero refunds invented (refunds not supported by schema).
6. Safe paginated queries with bounded limit (max 100), avoiding memory bloat and N+1 round trips.
7. Safe, idempotent cancellation: preserves paid access until existing expires_at, logs audit event, no refunds.
8. Sensitive provider credentials and raw callback payloads are strictly excluded from output DTOs.
"""

import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Tuple
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import is_valid_uuid
from backend.services.subscription_service import SubscriptionService, _parse_timestamp
from backend.services.plan_admin_service import PlanAdminService
from backend.services.coupon_service import CouponService
from backend.services.cache_service import invalidate_user_subscription
from backend.models.payment import PaymentStatus
from backend.models.subscription import SubscriptionStatus
from backend.models.admin_payment import (
    AdminPaymentMetricsDTO,
    AdminPaymentTransactionDTO,
    AdminTransactionsListResponse,
    AdminSubscriptionDTO,
    AdminSubscriptionsListResponse,
    AdminCancelSubscriptionResponse,
)

logger = logging.getLogger("skillscatalyst.admin_payments")


class AdminPaymentService:
    """
    Central orchestration service for Admin payment reporting and subscription governance.
    """

    @staticmethod
    def _resolve_date_boundaries(
        preset: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Tuple[Optional[datetime], Optional[datetime], str]:
        """
        Parses and validates explicit UTC date boundaries for reporting.
        Returns (start_dt, end_dt, resolved_preset_label).
        """
        now = datetime.now(timezone.utc)
        preset_clean = (preset or "").strip().lower()

        if preset_clean == "today":
            start_dt = now.replace(hour=0, minute=0, second=0, microsecond=0)
            return start_dt, now, "today"

        if preset_clean == "7d":
            start_dt = now - timedelta(days=7)
            return start_dt, now, "7d"

        if preset_clean == "30d":
            start_dt = now - timedelta(days=30)
            return start_dt, now, "30d"

        if preset_clean == "all":
            return None, now, "all"

        # Custom date range or unspecified
        start_dt = _parse_timestamp(start_date) if start_date else None
        end_dt = _parse_timestamp(end_date) if end_date else None

        if start_dt and end_dt and start_dt > end_dt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date cannot be after end_date.",
            )

        resolved_label = "custom" if (start_dt or end_dt) else "all"
        return start_dt, end_dt, resolved_label

    @classmethod
    def get_payment_dashboard_metrics(
        cls,
        preset: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> AdminPaymentMetricsDTO:
        """
        Derives authoritative platform revenue and transaction telemetry over a date range.
        Strictly segregates collected cash revenue from zero-value promotional passes.
        """
        start_dt, end_dt, resolved_preset = cls._resolve_date_boundaries(preset, start_date, end_date)
        sb = get_supabase()

        if not sb:
            # Fallback zero-metrics when database is unconfigured
            return AdminPaymentMetricsDTO(
                total_collected_amount_in_paise=0,
                total_collected_amount_in_rupees=0.0,
                gross_transaction_value_in_paise=0,
                gross_transaction_value_in_rupees=0.0,
                total_discount_amount_in_paise=0,
                total_discount_amount_in_rupees=0.0,
                successful_count=0,
                pending_count=0,
                failed_count=0,
                cancelled_count=0,
                promotional_pass_count=0,
                currency="INR",
                start_date=start_dt.isoformat() if start_dt else None,
                end_date=end_dt.isoformat() if end_dt else None,
                preset=resolved_preset,
                by_plan=[],
                by_coupon=[],
                activity=[],
            )

        try:
            # Build query on payment_transactions
            query = sb.from_("payment_transactions").select(
                "id, plan_id, amount_in_paise, original_amount_in_paise, discount_in_paise, status, currency, coupon_id, created_at, subscription_plans(code, name), coupons(code)"
            )

            if start_dt:
                query = query.gte("created_at", start_dt.isoformat())
            if end_dt:
                query = query.lte("created_at", end_dt.isoformat())

            res = query.execute()
            rows = res.data or []

            total_collected_paise = 0
            gross_value_paise = 0
            total_discount_paise = 0
            successful_count = 0
            pending_count = 0
            failed_count = 0
            cancelled_count = 0
            promotional_pass_count = 0

            plan_aggregates: Dict[str, Dict[str, Any]] = {}
            coupon_aggregates: Dict[str, Dict[str, Any]] = {}
            activity_buckets: Dict[str, Dict[str, Any]] = {}

            for row in rows:
                raw_st = (row.get("status") or "").lower()
                amount = int(row.get("amount_in_paise") or 0)
                disc = int(row.get("discount_in_paise") or 0)
                orig = int(row.get("original_amount_in_paise") or (amount + disc))

                created_raw = row.get("created_at")
                date_key = str(created_raw)[:10] if created_raw else "unknown"

                if date_key not in activity_buckets:
                    activity_buckets[date_key] = {
                        "date": date_key,
                        "collected_amount_in_paise": 0,
                        "collected_amount_in_rupees": 0.0,
                        "transaction_count": 0,
                        "successful_count": 0,
                    }
                activity_buckets[date_key]["transaction_count"] += 1

                if raw_st == PaymentStatus.SUCCESS.value:
                    successful_count += 1
                    gross_value_paise += orig
                    total_discount_paise += disc

                    if amount == 0:
                        # 100% Free Promotional Pass checkout: excluded from collected cash revenue
                        promotional_pass_count += 1
                    else:
                        total_collected_paise += amount
                        activity_buckets[date_key]["collected_amount_in_paise"] += amount
                        activity_buckets[date_key]["collected_amount_in_rupees"] = round(
                            activity_buckets[date_key]["collected_amount_in_paise"] / 100.0, 2
                        )

                    activity_buckets[date_key]["successful_count"] += 1

                    # Grouping by plan
                    p_info = row.get("subscription_plans") or {}
                    p_code = p_info.get("code") or "unknown_plan"
                    p_name = p_info.get("name") or p_code.replace("_", " ").title()

                    if p_code not in plan_aggregates:
                        plan_aggregates[p_code] = {
                            "plan_code": p_code,
                            "plan_name": p_name,
                            "count": 0,
                            "collected_amount_in_paise": 0,
                            "collected_amount_in_rupees": 0.0,
                        }
                    plan_aggregates[p_code]["count"] += 1
                    plan_aggregates[p_code]["collected_amount_in_paise"] += amount
                    plan_aggregates[p_code]["collected_amount_in_rupees"] = round(
                        plan_aggregates[p_code]["collected_amount_in_paise"] / 100.0, 2
                    )

                    # Grouping by coupon
                    c_info = row.get("coupons") or {}
                    c_code = c_info.get("code")
                    if c_code or disc > 0:
                        c_key = c_code or "DISCOUNT_APPLIED"
                        if c_key not in coupon_aggregates:
                            coupon_aggregates[c_key] = {
                                "coupon_code": c_key,
                                "redemption_count": 0,
                                "total_discount_in_paise": 0,
                                "total_discount_in_rupees": 0.0,
                            }
                        coupon_aggregates[c_key]["redemption_count"] += 1
                        coupon_aggregates[c_key]["total_discount_in_paise"] += disc
                        coupon_aggregates[c_key]["total_discount_in_rupees"] = round(
                            coupon_aggregates[c_key]["total_discount_in_paise"] / 100.0, 2
                        )

                elif raw_st in (PaymentStatus.PENDING.value, PaymentStatus.CREATED.value):
                    pending_count += 1
                elif raw_st == PaymentStatus.FAILED.value:
                    failed_count += 1
                elif raw_st == PaymentStatus.CANCELLED.value:
                    cancelled_count += 1

            sorted_activity = sorted(activity_buckets.values(), key=lambda x: x["date"])
            sorted_plans = sorted(plan_aggregates.values(), key=lambda x: x["count"], reverse=True)
            sorted_coupons = sorted(coupon_aggregates.values(), key=lambda x: x["redemption_count"], reverse=True)

            return AdminPaymentMetricsDTO(
                total_collected_amount_in_paise=total_collected_paise,
                total_collected_amount_in_rupees=round(total_collected_paise / 100.0, 2),
                gross_transaction_value_in_paise=gross_value_paise,
                gross_transaction_value_in_rupees=round(gross_value_paise / 100.0, 2),
                total_discount_amount_in_paise=total_discount_paise,
                total_discount_amount_in_rupees=round(total_discount_paise / 100.0, 2),
                successful_count=successful_count,
                pending_count=pending_count,
                failed_count=failed_count,
                cancelled_count=cancelled_count,
                promotional_pass_count=promotional_pass_count,
                currency="INR",
                start_date=start_dt.isoformat() if start_dt else None,
                end_date=end_dt.isoformat() if end_dt else None,
                preset=resolved_preset,
                by_plan=sorted_plans,
                by_coupon=sorted_coupons,
                activity=sorted_activity,
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error compiling payment dashboard metrics: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to compile payment metrics.",
            )

    @classmethod
    def get_transactions_ledger(
        cls,
        status_filter: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        plan_code: Optional[str] = None,
        coupon_code: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> AdminTransactionsListResponse:
        """
        Retrieves a paginated and filtered ledger of payment transactions.
        Eliminates N+1 queries by batch-loading user profiles and plans.
        Sanitizes output by omitting raw provider responses and internal secrets.
        """
        # Parameter bounds validation
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be >= 1.")
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be between 1 and 100.")

        start_dt = _parse_timestamp(start_date) if start_date else None
        end_dt = _parse_timestamp(end_date) if end_date else None

        if start_dt and end_dt and start_dt > end_dt:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_date cannot be after end_date.")

        sb = get_supabase()
        if not sb:
            return AdminTransactionsListResponse(
                transactions=[],
                total_count=0,
                page=page,
                limit=limit,
                total_pages=0,
                has_more=False,
            )

        try:
            # 1. Base query with exact count
            query = sb.from_("payment_transactions").select(
                "id, user_id, plan_id, subscription_id, provider, merchant_order_id, amount_in_paise, original_amount_in_paise, discount_in_paise, currency, status, failure_code, failure_message, coupon_id, created_at, updated_at, subscription_plans(code, name), coupons(code)",
                count="exact",
            )

            # 2. Status filter
            if status_filter and status_filter.strip().lower() != "all":
                clean_st = status_filter.strip().lower()
                query = query.eq("status", clean_st)

            # 3. Date range filter
            if start_dt:
                query = query.gte("created_at", start_dt.isoformat())
            if end_dt:
                query = query.lte("created_at", end_dt.isoformat())

            # 4. Plan code filter
            if plan_code and plan_code.strip().lower() != "all":
                plan = SubscriptionService.get_plan_by_code(plan_code.strip().lower())
                if plan and plan.id:
                    query = query.eq("plan_id", plan.id)

            # 5. Coupon code filter
            if coupon_code and coupon_code.strip():
                clean_coupon = coupon_code.strip().upper()
                c = CouponService.get_coupon_by_code(clean_coupon)
                if c and c.id:
                    query = query.eq("coupon_id", c.id)

            # 6. Search filter (merchant_order_id, user UUID, or user email)
            if search and search.strip():
                clean_search = search.strip()
                if is_valid_uuid(clean_search):
                    query = query.or_(f"id.eq.{clean_search},user_id.eq.{clean_search}")
                elif clean_search.startswith("order_sc_"):
                    query = query.ilike("merchant_order_id", f"%{clean_search}%")
                else:
                    # Check if search is an email or name in profiles
                    try:
                        p_matches = (
                            sb.from_("profiles")
                            .select("id")
                            .or_(f"email.ilike.%{clean_search}%,full_name.ilike.%{clean_search}%")
                            .limit(20)
                            .execute()
                        )
                        matched_uids = [m["id"] for m in (p_matches.data or []) if m.get("id")]
                        if matched_uids:
                            query = query.in_("user_id", matched_uids)
                        else:
                            query = query.ilike("merchant_order_id", f"%{clean_search}%")
                    except Exception:
                        query = query.ilike("merchant_order_id", f"%{clean_search}%")

            # 7. Pagination and ordering
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit - 1
            query = query.order("created_at", desc=True).range(start_idx, end_idx)

            res = query.execute()
            rows = res.data or []
            try:
                total_count = int(res.count) if res.count is not None else len(rows)
            except Exception:
                total_count = len(rows)

            # 8. Batch resolve user profiles for page items (Zero N+1 queries)
            user_ids = list({r["user_id"] for r in rows if r.get("user_id")})
            profile_map: Dict[str, Dict[str, Any]] = {}
            if user_ids:
                try:
                    prof_res = sb.from_("profiles").select("id, email, full_name").in_("id", user_ids).execute()
                    for p in prof_res.data or []:
                        profile_map[p["id"]] = p
                except Exception as p_err:
                    logger.debug(f"Profiles batch lookup notice: {p_err}")

            # 9. Format DTOs (sanitizing secrets and raw provider payloads)
            dtos: List[AdminPaymentTransactionDTO] = []
            for r in rows:
                u_id = str(r["user_id"])
                prof = profile_map.get(u_id, {})
                p_info = r.get("subscription_plans") or {}
                c_info = r.get("coupons") or {}

                p_code = p_info.get("code") or "commercial_plan"
                p_name = p_info.get("name") or p_code.replace("_", " ").title()
                c_code = c_info.get("code")

                amount = int(r.get("amount_in_paise") or 0)
                disc = int(r.get("discount_in_paise") or 0)
                orig = int(r.get("original_amount_in_paise") or (amount + disc))

                st_val = r.get("status", "pending").lower()
                try:
                    st_enum = PaymentStatus(st_val)
                except Exception:
                    st_enum = PaymentStatus.PENDING

                completed_at = str(r.get("updated_at")) if st_enum in (PaymentStatus.SUCCESS, PaymentStatus.FAILED) else None

                dtos.append(
                    AdminPaymentTransactionDTO(
                        id=str(r["id"]),
                        merchant_order_id=str(r["merchant_order_id"]),
                        user_id=u_id,
                        user_email=prof.get("email"),
                        user_name=prof.get("full_name"),
                        plan_code=p_code,
                        plan_name=p_name,
                        original_amount_in_paise=orig,
                        discount_in_paise=disc,
                        amount_in_paise=amount,
                        currency=str(r.get("currency", "INR")),
                        coupon_code=c_code,
                        status=st_enum,
                        created_at=str(r.get("created_at") or ""),
                        completed_at=completed_at,
                        subscription_id=str(r["subscription_id"]) if r.get("subscription_id") else None,
                        provider=str(r.get("provider", "phonepe")),
                        failure_code=r.get("failure_code"),
                        failure_message=r.get("failure_message"),
                    )
                )

            total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
            has_more = page < total_pages

            return AdminTransactionsListResponse(
                transactions=dtos,
                total_count=total_count,
                page=page,
                limit=limit,
                total_pages=total_pages,
                has_more=has_more,
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error querying transactions ledger: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to query payment transactions ledger.",
            )

    @classmethod
    def get_subscriptions_ledger(
        cls,
        status_filter: Optional[str] = None,
        plan_code: Optional[str] = None,
        search: Optional[str] = None,
        expires_before: Optional[str] = None,
        expires_after: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> AdminSubscriptionsListResponse:
        """
        Retrieves a paginated view of student subscriptions with search, filter, and entitlement summaries.
        """
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be >= 1.")
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be between 1 and 100.")

        exp_before_dt = _parse_timestamp(expires_before) if expires_before else None
        exp_after_dt = _parse_timestamp(expires_after) if expires_after else None

        sb = get_supabase()
        if not sb:
            return AdminSubscriptionsListResponse(
                subscriptions=[],
                total_count=0,
                page=page,
                limit=limit,
                total_pages=0,
                has_more=False,
            )

        try:
            # 1. Base query
            query = sb.from_("user_subscriptions").select(
                "id, user_id, plan_id, status, started_at, expires_at, cancelled_at, created_at, updated_at, subscription_plans(code, name)",
                count="exact",
            )

            # 2. Status filter
            if status_filter and status_filter.strip().lower() != "all":
                clean_st = status_filter.strip().lower()
                query = query.eq("status", clean_st)

            # 3. Plan code filter
            if plan_code and plan_code.strip().lower() != "all":
                p = SubscriptionService.get_plan_by_code(plan_code.strip().lower())
                if p and p.id:
                    query = query.eq("plan_id", p.id)

            # 4. Expiry filters
            if exp_before_dt:
                query = query.lte("expires_at", exp_before_dt.isoformat())
            if exp_after_dt:
                query = query.gte("expires_at", exp_after_dt.isoformat())

            # 5. Search filter (user UUID, email, or full name)
            if search and search.strip():
                clean_search = search.strip()
                if is_valid_uuid(clean_search):
                    query = query.or_(f"id.eq.{clean_search},user_id.eq.{clean_search}")
                else:
                    try:
                        p_matches = (
                            sb.from_("profiles")
                            .select("id")
                            .or_(f"email.ilike.%{clean_search}%,full_name.ilike.%{clean_search}%")
                            .limit(25)
                            .execute()
                        )
                        matched_uids = [m["id"] for m in (p_matches.data or []) if m.get("id")]
                        if matched_uids:
                            query = query.in_("user_id", matched_uids)
                        else:
                            # No matching users found
                            return AdminSubscriptionsListResponse(
                                subscriptions=[],
                                total_count=0,
                                page=page,
                                limit=limit,
                                total_pages=0,
                                has_more=False,
                            )
                    except Exception:
                        pass

            # 6. Pagination & ordering
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit - 1
            query = query.order("created_at", desc=True).range(start_idx, end_idx)

            res = query.execute()
            rows = res.data or []
            try:
                total_count = int(res.count) if res.count is not None else len(rows)
            except Exception:
                total_count = len(rows)

            # 7. Batch resolve profiles and recent transactions
            user_ids = list({r["user_id"] for r in rows if r.get("user_id")})
            profile_map: Dict[str, Dict[str, Any]] = {}
            recent_tx_map: Dict[str, Dict[str, Any]] = {}

            if user_ids:
                try:
                    prof_res = sb.from_("profiles").select("id, email, full_name").in_("id", user_ids).execute()
                    for p in prof_res.data or []:
                        profile_map[p["id"]] = p
                except Exception:
                    pass

                try:
                    # Fetch recent transactions for these users
                    tx_res = (
                        sb.from_("payment_transactions")
                        .select("id, user_id, merchant_order_id, amount_in_paise, status, created_at")
                        .in_("user_id", user_ids)
                        .order("created_at", desc=True)
                        .limit(50)
                        .execute()
                    )
                    for tx in tx_res.data or []:
                        uid = tx["user_id"]
                        if uid not in recent_tx_map:
                            recent_tx_map[uid] = tx
                except Exception:
                    pass

            # 8. Build DTOs
            now_utc = datetime.now(timezone.utc)
            dtos: List[AdminSubscriptionDTO] = []
            for r in rows:
                u_id = str(r["user_id"])
                prof = profile_map.get(u_id, {})
                p_info = r.get("subscription_plans") or {}
                p_code = p_info.get("code") or "unknown_plan"
                p_name = p_info.get("name") or p_code.replace("_", " ").title()

                raw_st = r.get("status", "active").lower()
                try:
                    st_enum = SubscriptionStatus(raw_st)
                except Exception:
                    st_enum = SubscriptionStatus.ACTIVE

                exp_dt = _parse_timestamp(r.get("expires_at"))
                is_unexpired = exp_dt is None or exp_dt > now_utc

                # Evaluates whether the user currently receives premium entitlements
                is_prem = (st_enum in (SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED)) and is_unexpired and p_code != "free"

                entitlements_summary = {
                    "tier": p_code,
                    "is_premium": is_prem,
                }

                dtos.append(
                    AdminSubscriptionDTO(
                        id=str(r["id"]),
                        user_id=u_id,
                        user_email=prof.get("email"),
                        user_name=prof.get("full_name"),
                        plan_id=str(r["plan_id"]),
                        plan_code=p_code,
                        plan_name=p_name,
                        status=st_enum,
                        is_premium=is_prem,
                        started_at=str(r.get("started_at")) if r.get("started_at") else None,
                        expires_at=str(r.get("expires_at")) if r.get("expires_at") else None,
                        cancelled_at=str(r.get("cancelled_at")) if r.get("cancelled_at") else None,
                        created_at=str(r.get("created_at") or ""),
                        updated_at=str(r.get("updated_at") or ""),
                        recent_transaction=recent_tx_map.get(u_id),
                        entitlements_summary=entitlements_summary,
                    )
                )

            total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
            has_more = page < total_pages

            return AdminSubscriptionsListResponse(
                subscriptions=dtos,
                total_count=total_count,
                page=page,
                limit=limit,
                total_pages=total_pages,
                has_more=has_more,
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error querying subscriptions ledger: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to query user subscriptions ledger.",
            )

    @classmethod
    def cancel_user_subscription(
        cls,
        subscription_id: str,
        admin_user_id: str,
        reason: Optional[str] = None,
    ) -> AdminCancelSubscriptionResponse:
        """
        Safely and idempotently cancels future renewal for a user's subscription.
        Preserves paid access until current expiration date.
        Never refunds payments as a side effect.
        Appends an immutable audit event to subscription_events.
        """
        if not subscription_id or not is_valid_uuid(subscription_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valid subscription UUID required.",
            )

        sb = get_supabase()
        if not sb:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service unavailable.",
            )

        now = datetime.now(timezone.utc)

        try:
            # 1. Fetch subscription record
            sub_res = (
                sb.from_("user_subscriptions")
                .select("id, user_id, plan_id, status, started_at, expires_at, cancelled_at, subscription_plans(code)")
                .eq("id", subscription_id)
                .limit(1)
                .execute()
            )
            rows = sub_res.data or []
            if not rows:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Subscription '{subscription_id}' not found.",
                )

            sub = rows[0]
            current_status = (sub.get("status") or "").lower()
            exp_dt = _parse_timestamp(sub.get("expires_at"))
            p_code = (sub.get("subscription_plans") or {}).get("code", "")

            # 2. Reject free plan cancellation
            if p_code == "free":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Free tier subscriptions have no commercial renewal or billing to cancel.",
                )

            # 3. Idempotency Check: Already cancelled
            if current_status == SubscriptionStatus.CANCELLED.value:
                return AdminCancelSubscriptionResponse(
                    success=True,
                    subscription_id=subscription_id,
                    user_id=str(sub["user_id"]),
                    status=SubscriptionStatus.CANCELLED,
                    cancelled_at=str(sub.get("cancelled_at") or now.isoformat()),
                    expires_at=str(sub.get("expires_at")) if sub.get("expires_at") else None,
                    message="Subscription was already cancelled. Paid access remains active until the expiration date.",
                    is_already_cancelled=True,
                )

            # 4. Check for expired subscription
            if current_status == SubscriptionStatus.EXPIRED.value or (exp_dt and exp_dt < now):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot cancel an already expired subscription.",
                )

            # 5. Execute safe cancellation: preserves expires_at
            now_iso = now.isoformat()
            sb.from_("user_subscriptions").update({
                "status": SubscriptionStatus.CANCELLED.value,
                "cancelled_at": now_iso,
                "updated_at": now_iso,
            }).eq("id", subscription_id).execute()

            # 6. Record immutable audit event
            try:
                sb.from_("subscription_events").insert({
                    "user_id": sub["user_id"],
                    "subscription_id": subscription_id,
                    "event_type": "subscription_cancelled",
                    "provider": "phonepe",
                    "metadata": {
                        "cancelled_by": admin_user_id,
                        "reason": (reason or "").strip() or "Administrative cancellation via Admin Dashboard",
                        "cancelled_at": now_iso,
                        "expires_at": str(sub.get("expires_at")) if sub.get("expires_at") else None,
                    },
                    "created_at": now_iso,
                }).execute()
            except Exception as ev_err:
                logger.warning(f"Audit log insertion notice for subscription cancellation {subscription_id}: {ev_err}")

            # 7. Invalidate Redis subscription cache
            try:
                invalidate_user_subscription(str(sub["user_id"]))
            except Exception as inv_err:
                logger.warning(f"Cache invalidation notice: {inv_err}")

            return AdminCancelSubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                user_id=str(sub["user_id"]),
                status=SubscriptionStatus.CANCELLED,
                cancelled_at=now_iso,
                expires_at=str(sub.get("expires_at")) if sub.get("expires_at") else None,
                message="Subscription renewal successfully cancelled. Paid entitlement remains active until the end of the current period.",
                is_already_cancelled=False,
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error cancelling subscription {subscription_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel subscription.",
            )
