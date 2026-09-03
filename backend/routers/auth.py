"""
Auth-related API routes including Welcome Email dispatch.
"""

import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, status
from pydantic import BaseModel, Field
from backend.services.email_service import send_welcome_email
from backend.services.cache_service import get_redis_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


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
    Uses Redis/cache key to prevent duplicate emails for the same user.
    """
    clean_email = payload.email.lower().strip()
    cache_key = f"welcome_email_sent:{clean_email}"

    r = get_redis_client()
    if r:
        try:
            already_sent = r.get(cache_key)
            if already_sent:
                logger.info(f"Welcome email already sent recently to {clean_email}. Skipping duplicate.")
                return {
                    "success": True,
                    "message": "Welcome email was already sent recently.",
                    "skipped": True,
                }
            # Mark as sent for 7 days (604800 seconds)
            r.setex(cache_key, 604800, "1")
        except Exception as err:
            logger.warning(f"Redis check for welcome email failed: {err}")

    # Queue email in background
    background_tasks.add_task(_dispatch_welcome_email, clean_email, payload.full_name)

    return {
        "success": True,
        "message": "Welcome email queued for delivery.",
    }
