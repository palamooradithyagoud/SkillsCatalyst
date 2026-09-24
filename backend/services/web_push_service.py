"""
backend/services/web_push_service.py
Core Web Push delivery service using VAPID and pywebpush.
Formats push payloads, encrypts messages, and handles subscription expiration (404/410).
"""

import json
import logging
from typing import Dict, Any, Optional, Tuple
from pywebpush import webpush, WebPushException

from backend.config import (
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT,
    FRONTEND_URL,
)

logger = logging.getLogger("skillscatalyst.webpush")


def is_vapid_configured() -> bool:
    """Returns True if VAPID keys and subject are present."""
    return bool(VAPID_PRIVATE_KEY and VAPID_SUBJECT)


def format_push_url(url: Optional[str]) -> str:
    """
    Normalizes a notification URL into an absolute destination for the browser service worker.
    Ensures relative paths like '/events/123' resolve against FRONTEND_URL.
    """
    if not url:
        return FRONTEND_URL or "https://www.skillscatalyst.in"
    s = url.strip()
    if s.startswith("http://") or s.startswith("https://"):
        return s
    base = (FRONTEND_URL or "https://www.skillscatalyst.in").rstrip("/")
    if not s.startswith("/"):
        s = f"/{s}"
    return f"{base}{s}"


def send_web_push(
    subscription: Dict[str, Any],
    title: str,
    body: str,
    url: Optional[str] = None,
    notification_type: str = "streak",
    notification_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Tuple[bool, bool, Optional[str]]:
    """
    Sends a web push notification to a browser push service endpoint.
    
    Returns:
        (success: bool, is_expired: bool, error_message: Optional[str])
        
    If the push service returns HTTP 404 or 410 Gone, is_expired will be True,
    signaling the caller to purge the dead subscription.
    """
    if not is_vapid_configured():
        logger.warning("Web Push delivery skipped: VAPID keys not configured in environment.")
        return False, False, "VAPID not configured"

    endpoint = subscription.get("endpoint")
    p256dh = subscription.get("p256dh") or subscription.get("keys", {}).get("p256dh")
    auth = subscription.get("auth") or subscription.get("keys", {}).get("auth")

    if not endpoint or not p256dh or not auth:
        logger.warning(f"Invalid subscription info provided for Web Push: {subscription}")
        return False, True, "Malformed subscription credentials"

    sub_info = {
        "endpoint": endpoint,
        "keys": {
            "p256dh": p256dh,
            "auth": auth,
        },
    }

    resolved_url = format_push_url(url)

    payload_data = {
        "title": title,
        "body": body,
        "url": resolved_url,
        "type": notification_type,
        "notification_id": notification_id or "",
        "metadata": metadata or {},
    }
    payload_json = json.dumps(payload_data)

    vapid_claims = {
        "sub": VAPID_SUBJECT or "mailto:notifications@skillscatalyst.in"
    }

    try:
        response = webpush(
            subscription_info=sub_info,
            data=payload_json,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=vapid_claims,
            timeout=5.0,
        )
        logger.info(f"Web Push sent successfully to endpoint {endpoint[:35]}... Status: {getattr(response, 'status_code', 201)}")
        return True, False, None
    except WebPushException as ex:
        status_code = getattr(ex.response, "status_code", None)
        err_text = str(ex)
        
        # 404 Not Found or 410 Gone indicates the push subscription has expired/unregistered
        if status_code in (404, 410) or "404" in err_text or "410" in err_text or "Gone" in err_text:
            logger.info(f"Push subscription expired/unregistered (HTTP {status_code}): {endpoint[:35]}...")
            return False, True, f"Subscription expired (HTTP {status_code})"
        
        logger.error(f"WebPushException sending notification to {endpoint[:35]}...: {ex}")
        return False, False, err_text
    except Exception as e:
        logger.error(f"Unexpected error in send_web_push to {endpoint[:35]}...: {e}")
        return False, False, str(e)
