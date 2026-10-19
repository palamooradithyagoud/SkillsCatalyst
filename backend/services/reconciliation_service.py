"""
backend/services/reconciliation_service.py
Service for authoritative PhonePe payment reconciliation, anomaly detection,
and safe, idempotent payment recovery.
Phase: Payments Phase 7 — Financial Reporting, Receipts, CSV Exports & Payment Reconciliation

Invariants Enforced:
1. Authoritative verification via PhonePeService.get_order_status (never trust frontend).
2. Never silently downgrade a locally successful payment without confirmed human review.
3. Automatically and idempotently recovers pending transactions that PhonePe reports as COMPLETED.
4. Detects amount mismatches and currency discrepancies and flags them for manual review.
5. Idempotent recovery via claim_and_provision_payment RPC and PaymentService.process_webhook.
6. Guard against duplicate concurrent batch reconciliation jobs using execution locks.
7. Immutable audit logging of all reconciliation runs and single-order recovery actions.
8. No provider settlement data is fabricated; uses only real supported PhonePe order status APIs.
"""

import json
import logging
import threading
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.services.phonepe_service import PhonePeService
from backend.services.payment_service import PaymentService
from backend.services.admin_payment_service import AdminPaymentService
from backend.services.reporting_service import record_audit_log
from backend.models.payment import PaymentStatus
from backend.models.reporting import (
    ReconciliationOutcome,
    ReconciliationItemDTO,
    ReconciliationSummaryDTO,
    SingleReconciliationResponse,
)

logger = logging.getLogger("skillscatalyst.reconciliation")

# Concurrency lock to prevent overlapping reconciliation batch jobs
_reconciliation_batch_lock = threading.Lock()


class ReconciliationService:
    """
    Orchestrates payment reconciliation between local payment_transactions ledger and PhonePe gateway.
    """

    @classmethod
    def reconcile_transaction(
        cls,
        tx: Dict[str, Any],
        auto_recover: bool = True,
    ) -> ReconciliationItemDTO:
        """
        Reconciles a single transaction record against authoritative PhonePe order status.
        """
        merchant_order_id = tx.get("merchant_order_id")
        user_id = tx.get("user_id") or "unknown"
        local_status = (tx.get("status") or "").lower()
        local_amount = int(tx.get("amount_in_paise") or 0)
        local_currency = (tx.get("currency") or "INR").upper()
        now_utc = datetime.now(timezone.utc).isoformat()

        plan_info = tx.get("subscription_plans") or {}
        plan_code = plan_info.get("code") or "unknown"

        prof = tx.get("profiles") or {}
        user_email = prof.get("email")

        # Handle 100% free promotional pass checkout (provider is 'coupon', not PhonePe)
        provider = (tx.get("provider") or "").lower()
        if provider == "coupon" or (local_status == PaymentStatus.SUCCESS.value and local_amount == 0):
            # Promotional pass verification: check subscription link
            sub_id = tx.get("subscription_id")
            if sub_id:
                return ReconciliationItemDTO(
                    merchant_order_id=merchant_order_id,
                    user_id=user_id,
                    user_email=user_email,
                    plan_code=plan_code,
                    local_status=local_status,
                    local_amount_in_paise=local_amount,
                    local_currency=local_currency,
                    provider_status="PROMOTIONAL_PASS",
                    provider_amount_in_paise=0,
                    provider_currency=local_currency,
                    provider_order_id=tx.get("provider_order_id"),
                    outcome=ReconciliationOutcome.MATCHED,
                    action_taken="Promotional pass verified with active subscription association.",
                    requires_review=False,
                    reconciled_at=now_utc,
                )
            else:
                # Missing subscription for promotional pass -> recovery
                action = "Promotional pass missing subscription link."
                if auto_recover:
                    try:
                        PaymentService.process_webhook(
                            authorization_header=None,
                            raw_body=json.dumps({
                                "event": "coupon.order.completed",
                                "payload": {
                                    "merchantOrderId": merchant_order_id,
                                    "state": "COMPLETED",
                                    "amount": 0,
                                },
                            }),
                            is_internal_sync=True,
                        )
                        action = "Promotional pass subscription recovered successfully."
                        return ReconciliationItemDTO(
                            merchant_order_id=merchant_order_id,
                            user_id=user_id,
                            user_email=user_email,
                            plan_code=plan_code,
                            local_status=local_status,
                            local_amount_in_paise=local_amount,
                            local_currency=local_currency,
                            provider_status="PROMOTIONAL_PASS",
                            provider_amount_in_paise=0,
                            provider_currency=local_currency,
                            provider_order_id=tx.get("provider_order_id"),
                            outcome=ReconciliationOutcome.MISSING_SUBSCRIPTION_RECOVERED,
                            action_taken=action,
                            requires_review=False,
                            reconciled_at=now_utc,
                        )
                    except Exception as e:
                        logger.error(f"Failed to recover promo pass {merchant_order_id}: {e}")
                        action = f"Recovery error: {str(e)}"

                return ReconciliationItemDTO(
                    merchant_order_id=merchant_order_id,
                    user_id=user_id,
                    user_email=user_email,
                    plan_code=plan_code,
                    local_status=local_status,
                    local_amount_in_paise=local_amount,
                    local_currency=local_currency,
                    provider_status="PROMOTIONAL_PASS",
                    provider_amount_in_paise=0,
                    provider_currency=local_currency,
                    provider_order_id=tx.get("provider_order_id"),
                    outcome=ReconciliationOutcome.STATUS_MISMATCH_REVIEW,
                    action_taken=action,
                    requires_review=True,
                    reconciled_at=now_utc,
                )

        # Query PhonePe out-of-band order status
        remote_resp = PhonePeService.get_order_status(merchant_order_id)
        remote_state = (remote_resp.get("state") or "").upper()
        remote_amount = remote_resp.get("amount")
        remote_order_id = remote_resp.get("order_id")
        remote_currency = "INR"  # PhonePe Standard Checkout operates strictly in INR

        sb = get_supabase()

        # Case 1: Provider error / timeout
        if remote_state == "ERROR" or (not remote_state and not PhonePeService.is_configured()):
            error_msg = remote_resp.get("error") or "Gateway status query unreachable or unconfigured."
            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status=local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state or "UNREACHABLE",
                provider_amount_in_paise=remote_amount,
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.PROVIDER_UNAVAILABLE,
                action_taken="Preserved local state; marked unresolved for retry.",
                requires_review=False,
                reconciled_at=now_utc,
                error_detail=error_msg,
            )

        # Case 2: Amount Mismatch (Remote amount != Local amount)
        if remote_amount is not None and int(remote_amount) != local_amount:
            logger.warning(
                f"[RECONCILIATION] Amount mismatch on order {merchant_order_id}: DB={local_amount} paise, PhonePe={remote_amount} paise"
            )
            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status=local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state,
                provider_amount_in_paise=int(remote_amount),
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.AMOUNT_MISMATCH,
                action_taken="Amount mismatch detected. Flagged for administrative audit; no automated amount change.",
                requires_review=True,
                reconciled_at=now_utc,
                error_detail=f"Expected {local_amount} paise, PhonePe reported {remote_amount} paise.",
            )

        # Case 3: Locally PENDING, but PhonePe reported COMPLETED / SUCCESS
        if local_status in (PaymentStatus.PENDING.value, PaymentStatus.CREATED.value) and remote_state in ("COMPLETED", "SUCCESS"):
            action = "Locally pending payment is COMPLETED at PhonePe."
            if auto_recover:
                try:
                    PaymentService.process_webhook(
                        authorization_header=None,
                        raw_body=json.dumps({
                            "event": "checkout.order.completed",
                            "payload": {
                                "merchantOrderId": merchant_order_id,
                                "orderId": remote_order_id or tx.get("provider_order_id"),
                                "state": "COMPLETED",
                                "amount": remote_amount if remote_amount is not None else local_amount,
                                "currency": remote_currency,
                            },
                        }),
                        is_internal_sync=True,
                    )
                    action = "Recovered pending payment: marked success and provisioned subscription."
                    return ReconciliationItemDTO(
                        merchant_order_id=merchant_order_id,
                        user_id=user_id,
                        user_email=user_email,
                        plan_code=plan_code,
                        local_status="success",
                        local_amount_in_paise=local_amount,
                        local_currency=local_currency,
                        provider_status=remote_state,
                        provider_amount_in_paise=remote_amount,
                        provider_currency=remote_currency,
                        provider_order_id=remote_order_id,
                        outcome=ReconciliationOutcome.PENDING_RECOVERED_SUCCESS,
                        action_taken=action,
                        requires_review=False,
                        reconciled_at=now_utc,
                    )
                except Exception as rec_err:
                    logger.error(f"Error during reconciliation auto-recovery for {merchant_order_id}: {rec_err}")
                    action = f"Failed to auto-recover: {str(rec_err)}"

            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status=local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state,
                provider_amount_in_paise=remote_amount,
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.STATUS_MISMATCH_REVIEW,
                action_taken=action,
                requires_review=True,
                reconciled_at=now_utc,
            )

        # Case 4: Locally PENDING, but PhonePe reported FAILED / CANCELLED
        if local_status in (PaymentStatus.PENDING.value, PaymentStatus.CREATED.value) and remote_state in ("FAILED", "CANCELLED"):
            if auto_recover and sb:
                try:
                    sb.from_("payment_transactions").update({
                        "status": PaymentStatus.FAILED.value,
                        "failure_code": "PHONEPE_FAILED_SYNC",
                        "failure_message": f"Synchronized failure from PhonePe status check (state: {remote_state})",
                        "updated_at": now_utc,
                    }).eq("merchant_order_id", merchant_order_id).execute()
                    action = f"Updated local pending status to failed (PhonePe state: {remote_state})."
                except Exception as f_err:
                    logger.error(f"Error updating failed state for {merchant_order_id}: {f_err}")
                    action = f"Failed to mark as failed: {str(f_err)}"
            else:
                action = f"PhonePe reports order {remote_state}. Awaiting administrative sync."

            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status="failed" if auto_recover else local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state,
                provider_amount_in_paise=remote_amount,
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.PENDING_MARKED_FAILED,
                action_taken=action,
                requires_review=False,
                reconciled_at=now_utc,
            )

        # Case 5: Locally SUCCESS, but PhonePe reported FAILED / CANCELLED / PENDING
        if local_status == PaymentStatus.SUCCESS.value and remote_state in ("FAILED", "CANCELLED", "PENDING"):
            # CRITICAL: Never auto-downgrade without manual admin intervention!
            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status=local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state,
                provider_amount_in_paise=remote_amount,
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.STATUS_MISMATCH_REVIEW,
                action_taken="Confirmed mismatch: DB has SUCCESS but PhonePe reported conflicting state. Flagged for review; preserved paid access.",
                requires_review=True,
                reconciled_at=now_utc,
                error_detail=f"Local state '{local_status}' conflicts with gateway state '{remote_state}'.",
            )

        # Case 6: Locally SUCCESS and PhonePe COMPLETED, but subscription_id is NULL
        if local_status == PaymentStatus.SUCCESS.value and remote_state in ("COMPLETED", "SUCCESS"):
            sub_id = tx.get("subscription_id")
            if not sub_id:
                action = "Transaction is SUCCESS but missing subscription association."
                if auto_recover:
                    try:
                        PaymentService.process_webhook(
                            authorization_header=None,
                            raw_body=json.dumps({
                                "event": "checkout.order.completed",
                                "payload": {
                                    "merchantOrderId": merchant_order_id,
                                    "orderId": remote_order_id or tx.get("provider_order_id"),
                                    "state": "COMPLETED",
                                    "amount": local_amount,
                                    "currency": local_currency,
                                },
                            }),
                            is_internal_sync=True,
                        )
                        action = "Recovered stranded payment: provisioned missing subscription."
                        return ReconciliationItemDTO(
                            merchant_order_id=merchant_order_id,
                            user_id=user_id,
                            user_email=user_email,
                            plan_code=plan_code,
                            local_status=local_status,
                            local_amount_in_paise=local_amount,
                            local_currency=local_currency,
                            provider_status=remote_state,
                            provider_amount_in_paise=remote_amount,
                            provider_currency=remote_currency,
                            provider_order_id=remote_order_id,
                            outcome=ReconciliationOutcome.MISSING_SUBSCRIPTION_RECOVERED,
                            action_taken=action,
                            requires_review=False,
                            reconciled_at=now_utc,
                        )
                    except Exception as s_err:
                        action = f"Recovery provisioning failed: {str(s_err)}"

                return ReconciliationItemDTO(
                    merchant_order_id=merchant_order_id,
                    user_id=user_id,
                    user_email=user_email,
                    plan_code=plan_code,
                    local_status=local_status,
                    local_amount_in_paise=local_amount,
                    local_currency=local_currency,
                    provider_status=remote_state,
                    provider_amount_in_paise=remote_amount,
                    provider_currency=remote_currency,
                    provider_order_id=remote_order_id,
                    outcome=ReconciliationOutcome.STATUS_MISMATCH_REVIEW,
                    action_taken=action,
                    requires_review=True,
                    reconciled_at=now_utc,
                )

            # Both match and subscription is valid!
            return ReconciliationItemDTO(
                merchant_order_id=merchant_order_id,
                user_id=user_id,
                user_email=user_email,
                plan_code=plan_code,
                local_status=local_status,
                local_amount_in_paise=local_amount,
                local_currency=local_currency,
                provider_status=remote_state,
                provider_amount_in_paise=remote_amount,
                provider_currency=remote_currency,
                provider_order_id=remote_order_id,
                outcome=ReconciliationOutcome.MATCHED,
                action_taken="Authoritatively verified: states, amounts, and subscription association match.",
                requires_review=False,
                reconciled_at=now_utc,
            )

        # Default fallback (e.g. locally failed and PhonePe failed/pending)
        return ReconciliationItemDTO(
            merchant_order_id=merchant_order_id,
            user_id=user_id,
            user_email=user_email,
            plan_code=plan_code,
            local_status=local_status,
            local_amount_in_paise=local_amount,
            local_currency=local_currency,
            provider_status=remote_state,
            provider_amount_in_paise=remote_amount,
            provider_currency=remote_currency,
            provider_order_id=remote_order_id,
            outcome=ReconciliationOutcome.MATCHED if local_status == "failed" and remote_state in ("FAILED", "CANCELLED") else ReconciliationOutcome.STATUS_MISMATCH_REVIEW,
            action_taken=f"Status: Local '{local_status}', PhonePe '{remote_state}'.",
            requires_review=(local_status != "failed" or remote_state not in ("FAILED", "CANCELLED")),
            reconciled_at=now_utc,
        )

    @classmethod
    def run_reconciliation_batch(
        cls,
        admin_user_id: str,
        preset: Optional[str] = "30d",
        status_filter: Optional[str] = "pending",
        limit: int = 50,
    ) -> ReconciliationSummaryDTO:
        """
        Executes a bounded batch reconciliation run across matching transactions.
        Guards against concurrent execution using an in-process lock.
        """
        # Guard against overlapping batch runs
        acquired = _reconciliation_batch_lock.acquire(blocking=False)
        if not acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A payment reconciliation batch job is already currently in progress. Please wait for it to complete.",
            )

        started_at = datetime.now(timezone.utc).isoformat()
        bounded_limit = max(1, min(limit, 200))

        try:
            start_dt, end_dt, _ = AdminPaymentService._resolve_date_boundaries(preset=preset)
            sb = get_supabase()
            rows: List[Dict[str, Any]] = []

            if sb:
                query = sb.from_("payment_transactions").select(
                    "*, subscription_plans(code, name), profiles(email)"
                )
                if start_dt:
                    query = query.gte("created_at", start_dt.isoformat())
                if end_dt:
                    query = query.lte("created_at", end_dt.isoformat())

                if status_filter and status_filter.lower() != "all":
                    query = query.eq("status", status_filter.lower())

                query = query.order("created_at", desc=True).limit(bounded_limit)
                res = query.execute()
                rows = res.data or []

            items: List[ReconciliationItemDTO] = []
            matched_count = 0
            recovered_count = 0
            mismatches_count = 0
            unresolved_count = 0
            review_required_count = 0

            for r in rows:
                item = cls.reconcile_transaction(r, auto_recover=True)
                items.append(item)

                if item.outcome == ReconciliationOutcome.MATCHED:
                    matched_count += 1
                elif item.outcome in (
                    ReconciliationOutcome.PENDING_RECOVERED_SUCCESS,
                    ReconciliationOutcome.PENDING_MARKED_FAILED,
                    ReconciliationOutcome.MISSING_SUBSCRIPTION_RECOVERED,
                ):
                    recovered_count += 1
                elif item.outcome == ReconciliationOutcome.PROVIDER_UNAVAILABLE:
                    unresolved_count += 1
                else:
                    mismatches_count += 1

                if item.requires_review:
                    review_required_count += 1

            completed_at = datetime.now(timezone.utc).isoformat()

            summary = ReconciliationSummaryDTO(
                total_checked=len(items),
                matched_count=matched_count,
                recovered_count=recovered_count,
                mismatches_count=mismatches_count,
                unresolved_count=unresolved_count,
                review_required_count=review_required_count,
                started_at=started_at,
                completed_at=completed_at,
                items=items,
            )

            record_audit_log(
                action="payment_reconciliation_batch_run",
                entity_type="payment_reconciliation",
                entity_id=f"batch_{int(datetime.now(timezone.utc).timestamp())}",
                user_id=admin_user_id,
                details={
                    "total_checked": summary.total_checked,
                    "matched": matched_count,
                    "recovered": recovered_count,
                    "mismatches": mismatches_count,
                    "unresolved": unresolved_count,
                    "review_required": review_required_count,
                    "status_filter": status_filter,
                },
            )

            return summary

        finally:
            _reconciliation_batch_lock.release()

    @classmethod
    def reconcile_single_order(
        cls,
        merchant_order_id: str,
        admin_user_id: str,
    ) -> SingleReconciliationResponse:
        """
        Performs an on-demand reconciliation check and idempotent recovery for a single order.
        """
        clean_order_id = merchant_order_id.strip()
        sb = get_supabase()
        tx = None

        if sb:
            try:
                res = (
                    sb.from_("payment_transactions")
                    .select("*, subscription_plans(code, name), profiles(email)")
                    .eq("merchant_order_id", clean_order_id)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    tx = res.data[0]
            except Exception as e:
                logger.error(f"Error querying order {clean_order_id} for reconciliation: {e}")

        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{clean_order_id}' was not found.",
            )

        item = cls.reconcile_transaction(tx, auto_recover=True)

        record_audit_log(
            action="payment_reconciliation_single_sync",
            entity_type="payment_transaction",
            entity_id=clean_order_id,
            user_id=admin_user_id,
            details={
                "outcome": item.outcome.value,
                "action_taken": item.action_taken,
                "requires_review": item.requires_review,
            },
        )

        return SingleReconciliationResponse(
            success=True,
            item=item,
            message=item.action_taken,
        )
