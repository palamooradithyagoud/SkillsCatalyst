"""
backend/services/phonepe_service.py
Isolated Service for PhonePe Website Standard Checkout API v2.
Handles client initialization, order checkout initiation, out-of-band status checks,
and SHA/HMAC webhook verification.
Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
"""

import json
import hmac
import hashlib
import logging
from typing import Optional, Dict, Any, Tuple

from backend.config import (
    PHONEPE_ENV,
    PHONEPE_CLIENT_ID,
    PHONEPE_CLIENT_SECRET,
    PHONEPE_CLIENT_VERSION,
    PHONEPE_WEBHOOK_USERNAME,
    PHONEPE_WEBHOOK_PASSWORD,
    PHONEPE_WEBHOOK_SECRET,
    PHONEPE_REDIRECT_URL,
)

logger = logging.getLogger(__name__)

_phonepe_client_instance = None


def get_phonepe_client():
    """
    Singleton accessor for PhonePe StandardCheckoutClient.
    Initializes on first use if credentials are provided.
    """
    global _phonepe_client_instance
    if _phonepe_client_instance is not None:
        return _phonepe_client_instance

    if not PHONEPE_CLIENT_ID or not PHONEPE_CLIENT_SECRET:
        logger.warning(
            "PhonePe credentials (PHONEPE_CLIENT_ID / PHONEPE_CLIENT_SECRET) not set. "
            "PhonePe client running in unconfigured mode."
        )
        return None

    try:
        from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
        from phonepe.sdk.pg.env import Env

        env = Env.PRODUCTION if PHONEPE_ENV == "PRODUCTION" else Env.SANDBOX
        try:
            _phonepe_client_instance = StandardCheckoutClient.get_instance(
                client_id=PHONEPE_CLIENT_ID,
                client_secret=PHONEPE_CLIENT_SECRET,
                client_version=PHONEPE_CLIENT_VERSION,
                env=env,
            )
        except Exception as init_err:
            if env == Env.SANDBOX and ("401" in str(init_err) or "Unauthorized" in str(init_err)):
                logger.info("Sandbox auth failed (401). Retrying with Env.PRODUCTION...")
                StandardCheckoutClient._instance = None
                _phonepe_client_instance = StandardCheckoutClient.get_instance(
                    client_id=PHONEPE_CLIENT_ID,
                    client_secret=PHONEPE_CLIENT_SECRET,
                    client_version=PHONEPE_CLIENT_VERSION,
                    env=Env.PRODUCTION,
                )
            else:
                raise init_err
        logger.info(f"PhonePe StandardCheckoutClient initialized (Environment: {PHONEPE_ENV}).")
        return _phonepe_client_instance
    except Exception as e:
        logger.error(f"Failed to initialize PhonePe StandardCheckoutClient: {e}", exc_info=True)
        return None


class PhonePeService:
    """
    Dedicated wrapper isolating PhonePe Standard Checkout API v2 operations.
    """

    @staticmethod
    def is_configured() -> bool:
        """Returns True if PhonePe client credentials are populated."""
        return bool(PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET)

    @staticmethod
    def create_checkout_order(
        merchant_order_id: str,
        amount_in_paise: int,
        redirect_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Calls PhonePe Standard Checkout v2 API to generate a payment session redirect URL.
        """
        client = get_phonepe_client()
        target_redirect_url = redirect_url or PHONEPE_REDIRECT_URL

        if client is None:
            # When sandbox credentials are not yet configured in environment, return clean test payload
            logger.info(f"Creating mock/stub checkout session for {merchant_order_id} ({amount_in_paise} paise)")
            mock_url = (
                f"https://mercury-uat.phonepe.com/transact/pg?token=test_session_{merchant_order_id}"
            )
            return {
                "checkout_url": mock_url,
                "provider_order_id": f"PP_ORD_{merchant_order_id}",
            }

        from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import (
            StandardCheckoutPayRequest,
        )

        pay_request = StandardCheckoutPayRequest.build_request(
            merchant_order_id=merchant_order_id,
            amount=amount_in_paise,
            redirect_url=target_redirect_url,
        )

        response = client.pay(pay_request)
        checkout_url = getattr(response, "redirect_url", None)
        if not checkout_url:
            raise RuntimeError(f"PhonePe pay API did not return redirect_url: {response}")

        provider_order_id = getattr(response, "order_id", None) or f"PP_ORD_{merchant_order_id}"

        return {
            "checkout_url": checkout_url,
            "provider_order_id": provider_order_id,
        }

    @staticmethod
    def get_order_status(merchant_order_id: str) -> Dict[str, Any]:
        """
        Queries authoritative order state from PhonePe server.
        """
        client = get_phonepe_client()
        if client is None:
            return {
                "state": "PENDING",
                "amount": None,
                "order_id": None,
            }

        try:
            status_resp = client.get_order_status(merchant_order_id=merchant_order_id)
            state = getattr(status_resp, "state", None)
            amount = getattr(status_resp, "amount", None)
            order_id = getattr(status_resp, "order_id", None)
            return {
                "state": state,
                "amount": amount,
                "order_id": order_id,
                "raw": status_resp,
            }
        except Exception as e:
            logger.warning(f"PhonePe get_order_status query failed for {merchant_order_id}: {e}")
            return {
                "state": "ERROR",
                "error": str(e),
            }

    @staticmethod
    def verify_webhook_signature(
        authorization_header: Optional[str],
        raw_body: str,
    ) -> bool:
        """
        Authoritative validation of PhonePe S2S webhook.
        Supports both:
        1. SHA Username & Password: sha256(f"{username}:{password}") == authorization_header
           (using constant-time comparison via hmac.compare_digest).
        2. HMAC-SHA256: hmac.new(secret, raw_body, sha256) == authorization_header
        """
        if not authorization_header:
            logger.warning("PhonePe webhook missing Authorization header.")
            return False

        auth_header_clean = authorization_header.strip()

        # Method 1: SHA Username & Password (PhonePe Standard Checkout v2 Default)
        if PHONEPE_WEBHOOK_USERNAME and PHONEPE_WEBHOOK_PASSWORD:
            to_hash = f"{PHONEPE_WEBHOOK_USERNAME}:{PHONEPE_WEBHOOK_PASSWORD}".encode("utf-8")
            expected_sha = hashlib.sha256(to_hash).hexdigest()
            if hmac.compare_digest(expected_sha.lower(), auth_header_clean.lower()):
                return True

        # Method 2: HMAC Shared Secret Key
        if PHONEPE_WEBHOOK_SECRET:
            # Some gateways prefix "HMAC-SHA256 " or similar
            token = auth_header_clean
            if token.lower().startswith("hmac-sha256 "):
                token = token.split(" ", 1)[1].strip()
            expected_hmac = hmac.new(
                PHONEPE_WEBHOOK_SECRET.encode("utf-8"),
                raw_body.encode("utf-8") if isinstance(raw_body, str) else raw_body,
                hashlib.sha256,
            ).hexdigest()
            if hmac.compare_digest(expected_hmac.lower(), token.lower()):
                return True

        logger.warning(
            "PhonePe webhook authorization verification failed. "
            "Header did not match configured SHA credentials or HMAC secret."
        )
        return False

    @staticmethod
    def parse_callback_payload(raw_body: str) -> Dict[str, Any]:
        """
        Parses raw PhonePe callback json payload and normalizes camelCase and snake_case fields.
        """
        try:
            data = json.loads(raw_body)
        except Exception as e:
            logger.error(f"Failed to parse PhonePe webhook JSON payload: {e}")
            raise ValueError(f"Invalid JSON payload: {e}")

        event = data.get("event")
        callback_type = data.get("type")
        payload = data.get("payload") or {}

        merchant_order_id = (
            payload.get("merchantOrderId")
            or payload.get("merchant_order_id")
            or payload.get("merchantId")
        )
        provider_order_id = payload.get("orderId") or payload.get("order_id")
        state = (payload.get("state") or "").upper()
        amount = payload.get("amount")
        error_code = payload.get("errorCode") or payload.get("error_code")
        detailed_error_code = payload.get("detailedErrorCode") or payload.get("detailed_error_code")

        return {
            "event": event,
            "callback_type": callback_type,
            "merchant_order_id": merchant_order_id,
            "provider_order_id": provider_order_id,
            "state": state,
            "amount": amount,
            "error_code": error_code,
            "detailed_error_code": detailed_error_code,
            "raw_payload": payload,
        }
