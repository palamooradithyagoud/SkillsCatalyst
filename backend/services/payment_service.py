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
from backend.services.subscription_service import SubscriptionService, _parse_timestamp
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
        plan_code: Union[PlanCode, str],
        redirect_url: Optional[str] = None,
        coupon_code: Optional[str] = None,
    ) -> CreatePaymentOrderResponse:
        """
        Initiates a commercial payment order:
        1. Validates plan from database; rejects free plan and inactive plans.
        2. Validates promotional coupon if provided and calculates server-authoritative discount.
        3. Generates internal unique merchant_order_id.
        4. Creates pending record in payment_transactions with server-authoritative amount.
        5. Calls PhonePe Standard Checkout v2 API to generate redirect URL (or auto-provisions if 100% discount).
        """
        if not user_id or not is_valid_uuid(user_id):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Valid authenticated user UUID required for purchasing subscriptions.",
            )

        plan_code_str = plan_code.value if hasattr(plan_code, "value") else str(plan_code)

        if plan_code_str == "free" or plan_code == PlanCode.FREE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The free tier cannot be purchased via payment gateway.",
            )

        # Authoritative plan lookup from database/canonical catalog
        plan = SubscriptionService.get_plan_by_code(plan_code_str)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subscription plan '{plan_code_str}' not found.",
            )

        if not plan.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subscription plan '{plan_code_str}' is currently inactive and cannot be purchased.",
            )

        original_amount_in_paise = plan.price_in_paise
        discount_in_paise = 0
        coupon_id: Optional[str] = None
        applied_coupon_code: Optional[str] = None

        # Authoritative coupon validation and discount calculation
        if coupon_code and str(coupon_code).strip():
            from backend.services.coupon_service import CouponService
            coupon, discount_in_paise, final_amount = CouponService.validate_coupon_for_user_and_plan(
                code=str(coupon_code).strip(),
                plan_code=plan_code_str,
                user_id=user_id,
            )
            amount_in_paise = final_amount
            coupon_id = coupon.id
            applied_coupon_code = coupon.code
        else:
            amount_in_paise = original_amount_in_paise

        currency = plan.currency or "INR"
        merchant_order_id = f"order_sc_{uuid.uuid4().hex[:20]}"

        sb = get_supabase()
        db_plan_id = plan.id

        # Insert pending record in payment_transactions
        tx_row_id = None
        if sb:
            try:
                # If plan.id is not a valid UUID (e.g. fallback string), resolve real DB plan ID
                if not db_plan_id or not len(db_plan_id) == 36:
                    plan_row = (
                        sb.from_("subscription_plans")
                        .select("id")
                        .eq("code", plan_code.value if hasattr(plan_code, "value") else str(plan_code))
                        .execute()
                    )
                    if plan_row.data and len(plan_row.data) > 0:
                        db_plan_id = plan_row.data[0]["id"]

                insert_payload = {
                    "user_id": user_id,
                    "plan_id": db_plan_id,
                    "provider": "phonepe" if amount_in_paise > 0 else "coupon",
                    "merchant_order_id": merchant_order_id,
                    "amount_in_paise": amount_in_paise,
                    "original_amount_in_paise": original_amount_in_paise,
                    "discount_in_paise": discount_in_paise,
                    "coupon_id": coupon_id,
                    "currency": currency,
                    "status": PaymentStatus.PENDING.value,
                    "provider_response": {},
                }
                res = sb.from_("payment_transactions").insert(insert_payload).execute()
                if res.data and len(res.data) > 0:
                    tx_row_id = str(res.data[0]["id"])
            except Exception as e:
                logger.error(f"Failed to record pending transaction in database: {e}", exc_info=True)

        # Handle 100% Free Promotional Pass (amount_in_paise == 0)
        if amount_in_paise == 0:
            logger.info(f"100% Promotional coupon applied for order {merchant_order_id}. Directly provisioning subscription...")
            now_iso = datetime.now(timezone.utc).isoformat()
            if sb:
                try:
                    sb.from_("payment_transactions").update({
                        "status": PaymentStatus.SUCCESS.value,
                        "updated_at": now_iso,
                    }).eq("merchant_order_id", merchant_order_id).execute()
                except Exception as e:
                    logger.warning(f"Error marking 100% discounted transaction as success: {e}")

            sub_res = SubscriptionService.activate_or_extend_subscription(
                user_id=user_id,
                plan_id=db_plan_id,
                duration_days=plan.duration_days or 30,
                provider="coupon",
                provider_event_id=merchant_order_id,
            )

            if sb and sub_res.get("subscription_id"):
                try:
                    sb.from_("payment_transactions").update({
                        "subscription_id": sub_res.get("subscription_id"),
                        "updated_at": now_iso,
                    }).eq("merchant_order_id", merchant_order_id).execute()
                except Exception as e:
                    logger.warning(f"Error updating subscription_id on zero-amount transaction: {e}")

            if coupon_id:
                from backend.services.coupon_service import CouponService
                CouponService.record_coupon_redemption(
                    coupon_id=coupon_id,
                    user_id=user_id,
                    payment_transaction_id=tx_row_id or merchant_order_id,
                    discount_in_paise=discount_in_paise,
                    original_amount_in_paise=original_amount_in_paise,
                    final_amount_in_paise=0,
                )

            success_url = redirect_url if PaymentService._is_safe_redirect_url(redirect_url) else "/dashboard?payment=success"
            return CreatePaymentOrderResponse(
                success=True,
                merchant_order_id=merchant_order_id,
                checkout_url=success_url,
                amount_in_paise=0,
                original_amount_in_paise=original_amount_in_paise,
                discount_in_paise=discount_in_paise,
                coupon_code=applied_coupon_code,
                currency=currency,
                plan_code=plan_code,
            )

        safe_redirect_url = redirect_url if PaymentService._is_safe_redirect_url(redirect_url) else None

        # Call PhonePe API to obtain checkout redirect URL with the final payable amount
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
            original_amount_in_paise=original_amount_in_paise,
            discount_in_paise=discount_in_paise,
            coupon_code=applied_coupon_code,
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

        # 3. Idempotency Check: if already processed AND subscription provisioned, return 200 immediately
        if tx.get("status") == PaymentStatus.SUCCESS.value:
            if tx.get("subscription_id"):
                logger.info(f"Payment {merchant_order_id} already marked as success with active subscription. Returning idempotent acknowledgement.")
                return {
                    "success": True,
                    "message": "Payment already processed successfully.",
                    "merchant_order_id": merchant_order_id,
                    "status": "success",
                }
            else:
                # Transaction is 'success' but subscription_id is NULL:
                # Distinguish active concurrent worker in-flight (< 10s lease) vs stranded crash (> 10s)
                tx_updated_at = _parse_timestamp(tx.get("updated_at") or tx.get("created_at"))
                now_utc = datetime.now(timezone.utc)
                is_stale_or_recovery = is_internal_sync or (
                    tx_updated_at is not None and (now_utc - tx_updated_at).total_seconds() >= 10.0
                )

                if not is_stale_or_recovery:
                    logger.info(
                        f"Payment {merchant_order_id} has status='success' and is in-flight by concurrent worker. "
                        "Returning duplicate in-flight acknowledgement."
                    )
                    return {
                        "success": True,
                        "message": "Payment processing in progress.",
                        "merchant_order_id": merchant_order_id,
                        "status": "success",
                    }

                logger.warning(
                    f"Payment {merchant_order_id} has status='success' but subscription_id is NULL (stale lease or recovery). "
                    "Detected stranded unfulfilled payment from prior process crash. Initiating recovery provisioning..."
                )

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
            or (tx.get("status") == PaymentStatus.SUCCESS.value and not tx.get("subscription_id"))
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
                    if isinstance(rpc_res.data, dict):
                        if rpc_res.data.get("success") is True:
                            # Record coupon redemption if coupon was applied
                            coupon_id = tx.get("coupon_id")
                            if coupon_id:
                                try:
                                    from backend.services.coupon_service import CouponService
                                    CouponService.record_coupon_redemption(
                                        coupon_id=str(coupon_id),
                                        user_id=str(tx["user_id"]),
                                        payment_transaction_id=str(tx["id"]),
                                        discount_in_paise=int(tx.get("discount_in_paise") or 0),
                                        original_amount_in_paise=int(tx.get("original_amount_in_paise") or tx.get("amount_in_paise", 0)),
                                        final_amount_in_paise=int(tx["amount_in_paise"]),
                                    )
                                except Exception as c_err:
                                    logger.debug(f"Coupon sync notice: {c_err}")

                            return {
                                "success": True,
                                "message": rpc_res.data.get("message") or "Payment verified and subscription activated successfully via atomic RPC.",
                                "merchant_order_id": merchant_order_id,
                                "status": "success",
                            }
                        elif rpc_res.data.get("error") == "TERMINAL_STATE":
                            t_status = rpc_res.data.get("status") or "failed"
                            logger.warning(f"RPC rejected order {merchant_order_id}: transaction is in terminal state '{t_status}'")
                            return {
                                "success": False,
                                "message": f"Payment is in a terminal failure state ({t_status}).",
                                "merchant_order_id": merchant_order_id,
                                "status": t_status,
                            }
                        else:
                            logger.warning(
                                f"RPC claim_and_provision_payment returned unsuccessful status for {merchant_order_id}: "
                                f"{rpc_res.data.get('error')} - {rpc_res.data.get('message')}"
                            )
                except Exception as rpc_err:
                    logger.debug(f"RPC claim_and_provision_payment unavailable, falling back to direct atomic claim: {rpc_err}")

                # 2. Atomic PostgREST Claim:
                # If transaction is 'pending', atomically transition to 'success'.
                # If transaction is already 'success' with NULL subscription_id (unfulfilled crash recovery), claim recovery.
                if tx.get("status") == PaymentStatus.PENDING.value:
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
                elif tx.get("status") == PaymentStatus.SUCCESS.value and not tx.get("subscription_id"):
                    # Unfulfilled crash recovery claim: proceed to ensure subscription provisioning
                    claimed = True

                if not claimed:
                    logger.info(f"Order {merchant_order_id} could not be claimed (already claimed or completed).")
                    curr = sb.from_("payment_transactions").select("status, subscription_id").eq("merchant_order_id", merchant_order_id).limit(1).execute()
                    c_status = curr.data[0].get("status") if (isinstance(curr.data, list) and len(curr.data) > 0) else "unknown"
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

                    # Record coupon redemption if coupon was applied
                    coupon_id = tx.get("coupon_id")
                    if coupon_id:
                        try:
                            from backend.services.coupon_service import CouponService
                            CouponService.record_coupon_redemption(
                                coupon_id=str(coupon_id),
                                user_id=str(user_id),
                                payment_transaction_id=str(tx["id"]),
                                discount_in_paise=int(tx.get("discount_in_paise") or 0),
                                original_amount_in_paise=int(tx.get("original_amount_in_paise") or tx.get("amount_in_paise", 0)),
                                final_amount_in_paise=int(tx["amount_in_paise"]),
                            )
                        except Exception as c_err:
                            logger.error(f"Error recording coupon redemption on order {merchant_order_id}: {c_err}")

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
            original_amount_in_paise=tx.get("original_amount_in_paise"),
            discount_in_paise=int(tx.get("discount_in_paise") or 0),
            coupon_id=str(tx.get("coupon_id")) if tx.get("coupon_id") else None,
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
                .select("*, subscription_plans(*), coupons(code)")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            rows = res.data or []
            transactions = []
            for r in rows:
                plan_rel = r.get("subscription_plans") or {}
                coupon_rel = r.get("coupons") or {}
                coupon_code = coupon_rel.get("code") if isinstance(coupon_rel, dict) else None
                transactions.append(
                    PaymentTransactionDTO(
                        id=str(r["id"]),
                        merchant_order_id=str(r["merchant_order_id"]),
                        provider_order_id=r.get("provider_order_id"),
                        plan_code=plan_rel.get("code", "premium_monthly"),
                        plan_name=plan_rel.get("name", "Premium Monthly"),
                        amount_in_paise=int(r["amount_in_paise"]),
                        original_amount_in_paise=r.get("original_amount_in_paise"),
                        discount_in_paise=int(r.get("discount_in_paise") or 0),
                        coupon_code=coupon_code,
                        currency=str(r.get("currency", "INR")),
                        status=PaymentStatus(r.get("status", "pending")),
                        created_at=r["created_at"],
                    )
                )
            return transactions
        except Exception as e:
            logger.warning(f"Failed to fetch payment history for user {user_id}: {e}")
            return []
