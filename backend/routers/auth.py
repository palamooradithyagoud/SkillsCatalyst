"""
Auth-related API routes including Welcome Email dispatch.
"""

import logging
import time
import threading
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, status
from pydantic import BaseModel, Field
from backend.services.email_service import send_welcome_email
from backend.services.cache_service import get_redis_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory deduplication fallback when Redis is unconfigured or unavailable
_LOCAL_SENT_EMAILS: dict[str, float] = {}
_LOCAL_LOCK = threading.Lock()
_DEDUPLICATION_WINDOW_SECONDS = 604800  # 7 days


class WelcomeEmailRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    full_name: Optional[str] = None
    user_id: Optional[str] = None


def _dispatch_welcome_email(email: str, full_name: Optional[str]):
    try:
        res = send_welcome_email(to=email, full_name=full_name)
        logger.info(f"Background welcome email dispatch for {email}: {res}")
    except Exception as exc:
        logger.error(f"Error in background welcome email dispatch for {email}: {exc}")


@router.post("/welcome-email", status_code=status.HTTP_200_OK)
def trigger_welcome_email(payload: WelcomeEmailRequest, background_tasks: BackgroundTasks):
    """
    Triggers a welcome email upon new user registration.
    Runs asynchronously in the background so registration remains fast and non-blocking.
    Uses atomic Redis key (SET NX EX) or thread-safe in-memory cache to prevent duplicate
    emails from rapid concurrent requests or repeated sign-in actions.
    """
    clean_email = payload.email.lower().strip()
    cache_key = f"welcome_email_sent:{clean_email}"
    redis_handled = False

    # 1. Try atomic Redis lock (SET NX EX)
    r = get_redis_client()
    if r:
        try:
            # Atomic: returns True if key was set (new email), None/False if key already exists
            is_new = r.set(cache_key, "1", nx=True, ex=_DEDUPLICATION_WINDOW_SECONDS)
            redis_handled = True
            if not is_new:
                logger.info(f"Welcome email already sent recently to {clean_email} (Redis). Skipping duplicate.")
                return {
                    "success": True,
                    "message": "Welcome email was already sent recently.",
                    "skipped": True,
                }
        except Exception as err:
            logger.warning(f"Redis check for welcome email failed: {err}")
            redis_handled = False

    # 2. In-memory fallback if Redis is missing or encountered an error
    if not redis_handled:
        now = time.time()
        with _LOCAL_LOCK:
            last_sent = _LOCAL_SENT_EMAILS.get(clean_email)
            if last_sent and (now - last_sent) < _DEDUPLICATION_WINDOW_SECONDS:
                logger.info(f"Welcome email already sent recently to {clean_email} (in-memory). Skipping duplicate.")
                return {
                    "success": True,
                    "message": "Welcome email was already sent recently.",
                    "skipped": True,
                }
            _LOCAL_SENT_EMAILS[clean_email] = now

            # Clean up old keys if dictionary grows large
            if len(_LOCAL_SENT_EMAILS) > 5000:
                cutoff = now - _DEDUPLICATION_WINDOW_SECONDS
                expired_keys = [k for k, v in _LOCAL_SENT_EMAILS.items() if v < cutoff]
                for k in expired_keys:
                    del _LOCAL_SENT_EMAILS[k]

    # 3. Queue email in background
    background_tasks.add_task(_dispatch_welcome_email, clean_email, payload.full_name)

    return {
        "success": True,
        "message": "Welcome email queued for delivery.",
    }
