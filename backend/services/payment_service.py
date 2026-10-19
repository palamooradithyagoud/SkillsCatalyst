"""
backend/services/payment_service.py
Central payment processing service coordinating between PhonePe gateway,
internal payment_transactions ledger, and SubscriptionService.
Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
"""

import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status

from backend.services.supabase_service import get_supabase
from backend.services.subscription_service import SubscriptionService
from backend.services.phonepe_service import PhonePeService
from backend.services.auth_service import is_valid_uuid
from backend.models.payment import (
    PaymentStatus,
    CreatePaymentOrderResponse,
    PaymentStatusResponse,
    PaymentTransactionDTO,
)
from backend.models.subscription import PlanCode

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Authoritative payment orchestrator.
    Guarantees:
    - Frontend cannot override amount, currency, or duration.
    - Zero trust in client-side payment completion.
    - Idempotent callback processing prevents duplicate subscription grants.
    """

    @staticmethod
    def _is_safe_redirect_url(url: Optional[str]) -> bool:
        if not url:
            return False
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                return False
            host = (parsed.hostname or "").lower()
            allowed_hosts = {"localhost", "127.0.0.1", "skillscatalyst.in", "www.skillscatalyst.in"}
            return host in allowed_hosts or host.endswith(".skillscatalyst.in")
        except Exception:
            return False

    @staticmethod
    def create_order(
        user_id: str,
        plan_code: PlanCode,
        redirect_url: Optional[str] = None,
    ) -> CreatePaymentOrderResponse:
        """
        Initiates a commercial payment order:
        1. Validates plan from database; rejects free plan.
        2. Generates internal unique merchant_order_id.
        3. Creates pending record in payment_transactions.
        4. Calls PhonePe Standard Checkout v2 API to generate redirect URL.
        """
        if not user_id or not is_valid_uuid(user_id):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Valid authenticated user UUID required for purchasing subscriptions.",
            )

        if plan_code == PlanCode.FREE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The free tier cannot be purchased via payment gateway.",
            )

        # Authoritative plan lookup from database/canonical catalog
        plan = SubscriptionService.get_plan_by_code(plan_code.value)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subscription plan '{plan_code.value}' not found.",
            )

        amount_in_paise = plan.price_in_paise
        currency = plan.currency or "INR"
        merchant_order_id = f"order_sc_{uuid.uuid4().hex[:20]}"

        sb = get_supabase()
        db_plan_id = plan.id

        # Insert pending record in payment_transactions
        if sb:
            try:
                # If plan.id is not a valid UUID (e.g. fallback string), resolve real DB plan ID
                if not db_plan_id or not len(db_plan_id) == 36:
                    plan_row = (
                        sb.from_("subscription_plans")
                        .select("id")
                        .eq("code", plan_code.value)
                        .execute()
                    )
                    if plan_row.data and len(plan_row.data) > 0:
                        db_plan_id = plan_row.data[0]["id"]

                sb.from_("payment_transactions").insert({
                    "user_id": user_id,
                    "plan_id": db_plan_id,
                    "provider": "phonepe",
                    "merchant_order_id": merchant_order_id,
                    "amount_in_paise": amount_in_paise,
                    "currency": currency,
                    "status": PaymentStatus.PENDING.value,
                    "provider_response": {},
                }).execute()
            except Exception as e:
                logger.error(f"Failed to record pending transaction in database: {e}", exc_info=True)
                # If table doesn't exist yet during transitional verification, log error

        safe_redirect_url = redirect_url if PaymentService._is_safe_redirect_url(redirect_url) else None

        # Call PhonePe API to obtain checkout redirect URL
        checkout_info = PhonePeService.create_checkout_order(
            merchant_order_id=merchant_order_id,
            amount_in_paise=amount_in_paise,
            redirect_url=safe_redirect_url,
        )

        checkout_url = checkout_info.get("checkout_url", "")
        provider_order_id = checkout_info.get("provider_order_id")

        # Update transaction with provider order ID if available
        if sb and provider_order_id:
            try:
                sb.from_("payment_transactions").update({
                    "provider_order_id": provider_order_id
                }).eq("merchant_order_id", merchant_order_id).execute()
            except Exception as e:
                logger.debug(f"Could not update provider_order_id on pending transaction: {e}")

        return CreatePaymentOrderResponse(
            success=True,
            merchant_order_id=merchant_order_id,
            checkout_url=checkout_url,
            amount_in_paise=amount_in_paise,
            currency=currency,
            plan_code=plan_code,
        )

    @staticmethod
    def process_webhook(
        authorization_header: Optional[str],
        raw_body: str,
        is_internal_sync: bool = False,
    ) -> Dict[str, Any]:
        """
        Processes server-to-server webhook callback from PhonePe.
        1. Validates webhook SHA username/password or HMAC signature (skipped for verified internal out-of-band sync).
        2. Normalizes callback event and payload.
        3. Enforces idempotency (ignores already succeeded payments).
        4. Verifies amount and currency against database transaction.
        5. On success: marks transaction 'success', activates or extends user subscription.
        6. On failure: marks transaction 'failed' with error code.
        """
        # 1. Authenticate webhook caller (unless initiated by verified internal out-of-band sync)
        if not is_internal_sync:
            is_valid = PhonePeService.verify_webhook_signature(authorization_header, raw_body)
            if not is_valid:
                logger.warning("Rejected PhonePe webhook: Invalid authentication header.")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid webhook authorization header.",
                )

        # 2. Parse callback body
        callback = PhonePeService.parse_callback_payload(raw_body)
        merchant_order_id = callback.get("merchant_order_id")
        provider_order_id = callback.get("provider_order_id")
        state = callback.get("state", "").upper()
        event = callback.get("event") or ""
        amount = callback.get("amount")

        if not merchant_order_id:
            logger.error("PhonePe callback missing merchant_order_id.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing merchant_order_id in webhook payload.",
            )

        sb = get_supabase()
        tx = None

        if sb:
            try:
                tx_res = (
                    sb.from_("payment_transactions")
                    .select("*, subscription_plans(*)")
                    .eq("merchant_order_id", merchant_order_id)
                    .execute()
                )
                if tx_res.data and len(tx_res.data) > 0:
                    tx = tx_res.data[0]
            except Exception as e:
                logger.error(f"Error querying payment_transactions for webhook {merchant_order_id}: {e}")

        if not tx:
            logger.warning(f"Transaction not found in database for merchant_order_id: {merchant_order_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID '{merchant_order_id}' was not found.",
            )

        # 3. Idempotency Check: if already processed, return 200 immediately
        if tx.get("status") == PaymentStatus.SUCCESS.value:
            logger.info(f"Payment {merchant_order_id} already marked as success. Returning idempotent acknowledgement.")
            return {
                "success": True,
                "message": "Payment already processed successfully.",
                "merchant_order_id": merchant_order_id,
                "status": "success",
            }

        # 4. Verify Amount (prevent payload tampering)
        if amount is not None:
            expected_amount = int(tx["amount_in_paise"])
            if int(amount) != expected_amount:
                logger.error(
                    f"Payment amount mismatch for {merchant_order_id}: received {amount}, expected {expected_amount}"
                )
                if sb:
                    sb.from_("payment_transactions").update({
                        "status": PaymentStatus.FAILED.value,
                        "failure_code": "AMOUNT_MISMATCH",
                        "failure_message": f"Received {amount} paise, expected {expected_amount} paise",
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }).eq("id", tx["id"]).execute()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Transaction amount mismatch.",
                )

        # 5. Handle Outcome
        now = datetime.now(timezone.utc)
        is_success = (
            state in ("COMPLETED", "SUCCESS")
            or event in ("checkout.order.completed", "pg.order.completed")
        )

        if is_success:
            logger.info(f"PhonePe payment SUCCEEDED for order: {merchant_order_id}. Activating subscription...")
            user_id = tx["user_id"]
            plan_rel = tx.get("subscription_plans") or {}
            duration_days = plan_rel.get("duration_days") or 30
            plan_id = tx["plan_id"]

            claimed = False
            if sb:
                # 1. Try atomic PostgreSQL RPC claim_and_provision_payment if installed
                try:
                    rpc_res = sb.rpc("claim_and_provision_payment", {
                        "p_merchant_order_id": merchant_order_id,
                        "p_provider_order_id": provider_order_id,
                        "p_provider_response": callback.get("raw_payload", {}),
                    }).execute()
                    if isinstance(rpc_res.data, dict) and rpc_res.data.get("success") is True:
                        return {
                            "success": True,
                            "message": "Payment verified and subscription activated successfully via atomic RPC.",
                            "merchant_order_id": merchant_order_id,
                            "status": "success",
                        }
                    elif isinstance(rpc_res.data, dict) and rpc_res.data.get("claimed") is False:
                        logger.info(f"Order {merchant_order_id} already claimed or finalized in RPC.")
                        return {
                            "success": True,
                            "message": "Payment already claimed or finalized by concurrent worker.",
                            "merchant_order_id": merchant_order_id,
                            "status": "success",
                        }
                except Exception as rpc_err:
                    logger.debug(f"RPC claim_and_provision_payment unavailable, falling back to direct atomic claim: {rpc_err}")

                # 2. Atomic PostgREST Claim:
                # Atomically update payment_transactions where status == 'pending'.
                # Only 1 worker can successfully match status='pending' and transition to 'success'.
                claim_res = (
                    sb.from_("payment_transactions")
                    .update({
                        "status": PaymentStatus.SUCCESS.value,
                        "provider_order_id": provider_order_id or tx.get("provider_order_id"),
                        "provider_response": callback.get("raw_payload", {}),
                        "updated_at": now.isoformat(),
                    })
                    .eq("merchant_order_id", merchant_order_id)
                    .eq("status", PaymentStatus.PENDING.value)
                    .execute()
                )
                if isinstance(claim_res.data, list):
                    claimed = (len(claim_res.data) >= 1)
                else:
                    claimed = bool(claim_res.data)

                if not claimed:
                    logger.info(f"Order {merchant_order_id} could not be claimed (already claimed or completed).")
                    curr = sb.from_("payment_transactions").select("status").eq("merchant_order_id", merchant_order_id).limit(1).execute()
                    c_status = curr.data[0].get("status") if (isinstance(curr.data, list) and len(curr.data) > 0 and isinstance(curr.data[0], dict)) else "unknown"
                    return {
                        "success": True,
                        "message": f"Payment already {c_status}. Duplicate event ignored.",
                        "merchant_order_id": merchant_order_id,
                        "status": c_status,
                    }
            else:
                claimed = True

            if claimed:
                try:
                    # Authoritative activation or extension of subscription
                    sub_res = SubscriptionService.activate_or_extend_subscription(
                        user_id=user_id,
                        plan_id=plan_id,
                        duration_days=duration_days,
                        provider="phonepe",
                        provider_event_id=provider_order_id,
                    )

                    # Update payment transaction record with subscription_id
                    if sb and sub_res.get("subscription_id"):
                        try:
                            sb.from_("payment_transactions").update({
                                "subscription_id": sub_res.get("subscription_id"),
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }).eq("id", tx["id"]).execute()
                        except Exception as e:
                            logger.error(f"Error updating subscription_id on transaction: {e}")

                    return {
                        "success": True,
                        "message": "Payment verified and subscription activated successfully.",
                        "merchant_order_id": merchant_order_id,
                        "status": "success",
                    }
                except Exception as prov_err:
                    logger.error(f"Provisioning failed after claiming order {merchant_order_id}: {prov_err}", exc_info=True)
                    # REVERT STATUS: return to 'pending' so retry or out-of-band sync can resume
                    if sb:
                        try:
                            sb.from_("payment_transactions").update({
                                "status": PaymentStatus.PENDING.value,
                                "failure_message": f"Provisioning failed, reverted to pending for retry: {str(prov_err)}",
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }).eq("id", tx["id"]).execute()
                        except Exception as rev_err:
                            logger.critical(f"Failed to revert transaction status to pending: {rev_err}")
                    raise
        else:
            # Payment failed or cancelled
            logger.info(f"PhonePe payment FAILED for order: {merchant_order_id} (State: {state})")
            if sb:
                try:
                    sb.from_("payment_transactions").update({
                        "status": PaymentStatus.FAILED.value,
                        "failure_code": callback.get("error_code") or "PAYMENT_FAILED",
                        "failure_message": callback.get("detailed_error_code") or f"Payment state: {state}",
                        "provider_response": callback.get("raw_payload", {}),
                        "updated_at": now.isoformat(),
                    }).eq("id", tx["id"]).execute()
                except Exception as e:
                    logger.error(f"Error marking transaction as failed: {e}")

            return {
                "success": True,
                "message": f"Payment marked as failed (State: {state}).",
                "merchant_order_id": merchant_order_id,
                "status": "failed",
            }

    @staticmethod
    def get_payment_status(merchant_order_id: str, user_id: str) -> PaymentStatusResponse:
        """
        Returns the current state of a payment transaction.
        If still pending in database, checks PhonePe out-of-band status to catch delayed webhooks.
        """
        if not user_id or not is_valid_uuid(user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{merchant_order_id}' not found.",
            )

        sb = get_supabase()
        tx = None

        if sb:
            try:
                res = (
                    sb.from_("payment_transactions")
                    .select("*, subscription_plans(*)")
                    .eq("merchant_order_id", merchant_order_id)
                    .eq("user_id", user_id)
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    tx = res.data[0]
            except Exception as e:
                logger.warning(f"Error querying payment status for {merchant_order_id}: {e}")

        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{merchant_order_id}' not found.",
            )

        current_status = PaymentStatus(tx.get("status", "pending"))

        # If pending and PhonePe client is configured, check live status out-of-band
        if current_status == PaymentStatus.PENDING and PhonePeService.is_configured():
            remote_status = PhonePeService.get_order_status(merchant_order_id)
            remote_state = (remote_status.get("state") or "").upper()
            if remote_state in ("COMPLETED", "SUCCESS"):
                # Authoritative out-of-band synchronization
                PaymentService.process_webhook(
                    authorization_header=None,
                    raw_body=json.dumps({
                        "event": "checkout.order.completed",
                        "payload": {
                            "merchantOrderId": merchant_order_id,
                            "orderId": remote_status.get("order_id") or tx.get("provider_order_id"),
                            "state": "COMPLETED",
                            "amount": tx["amount_in_paise"],
                        },
                    }),
                    is_internal_sync=True,
                )
                if sb:
                    refreshed = sb.from_("payment_transactions").select("status").eq("merchant_order_id", merchant_order_id).limit(1).execute()
                    if refreshed.data:
                        current_status = PaymentStatus(refreshed.data[0].get("status", "pending"))
                    else:
                        current_status = PaymentStatus.SUCCESS
                else:
                    current_status = PaymentStatus.SUCCESS
            elif remote_state in ("FAILED", "CANCELLED"):
                if sb:
                    try:
                        sb.from_("payment_transactions").update({
                            "status": PaymentStatus.FAILED.value,
                            "failure_code": remote_status.get("error_code") or "PAYMENT_FAILED",
                            "failure_message": remote_status.get("detailed_error_code") or f"Payment state: {remote_state}",
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }).eq("id", tx["id"]).execute()
                    except Exception as e:
                        logger.error(f"Error marking transaction as failed: {e}")
                current_status = PaymentStatus.FAILED

        plan_rel = tx.get("subscription_plans") or {}
        plan_code = plan_rel.get("code") or "premium_monthly"

        return PaymentStatusResponse(
            merchant_order_id=merchant_order_id,
            status=current_status,
            is_completed=(current_status == PaymentStatus.SUCCESS),
            plan_code=plan_code,
            amount_in_paise=int(tx["amount_in_paise"]),
            created_at=tx.get("created_at"),
        )

    @staticmethod
    def sync_pending_user_payments(user_id: str) -> bool:
        """
        Reconciles any pending payment transactions for the user against PhonePe
        authoritative state out-of-band. Returns True if any payment was activated.
        """
        if not user_id or not is_valid_uuid(user_id) or not PhonePeService.is_configured():
            return False

        sb = get_supabase()
        if not sb:
            return False

        try:
            res = (
                sb.from_("payment_transactions")
                .select("merchant_order_id, amount_in_paise, provider_order_id")
                .eq("user_id", user_id)
                .eq("status", PaymentStatus.PENDING.value)
                .order("created_at", desc=True)
                .limit(3)
                .execute()
            )
            rows = res.data or []
            any_synced = False
            for r in rows:
                m_order_id = r.get("merchant_order_id")
                if not m_order_id:
                    continue
                remote = PhonePeService.get_order_status(m_order_id)
                if (remote.get("state") or "").upper() in ("COMPLETED", "SUCCESS"):
                    PaymentService.process_webhook(
                        authorization_header=None,
                        raw_body=json.dumps({
                            "event": "checkout.order.completed",
                            "payload": {
                                "merchantOrderId": m_order_id,
                                "orderId": remote.get("order_id") or r.get("provider_order_id"),
                                "state": "COMPLETED",
                                "amount": r["amount_in_paise"],
                            },
                        }),
                        is_internal_sync=True,
                    )
                    any_synced = True
            return any_synced
        except Exception as e:
            logger.warning(f"Error syncing pending payments for user {user_id}: {e}")
            return False

    @staticmethod
    def get_user_payment_history(user_id: str) -> List[PaymentTransactionDTO]:
        """
        Returns safe transaction history for the authenticated student.
        """
        if not user_id or not is_valid_uuid(user_id):
            return []

        sb = get_supabase()
        if not sb:
            return []

        try:
            res = (
                sb.from_("payment_transactions")
                .select("*, subscription_plans(*)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            rows = res.data or []
            transactions = []
            for r in rows:
                plan_rel = r.get("subscription_plans") or {}
                transactions.append(
                    PaymentTransactionDTO(
                        id=str(r["id"]),
                        merchant_order_id=str(r["merchant_order_id"]),
                        provider_order_id=r.get("provider_order_id"),
                        plan_code=plan_rel.get("code", "premium_monthly"),
                        plan_name=plan_rel.get("name", "Premium Monthly"),
                        amount_in_paise=int(r["amount_in_paise"]),
                        currency=str(r.get("currency", "INR")),
                        status=PaymentStatus(r.get("status", "pending")),
                        created_at=r["created_at"],
                    )
                )
            return transactions
        except Exception as e:
            logger.warning(f"Failed to fetch payment history for user {user_id}: {e}")
            return []
