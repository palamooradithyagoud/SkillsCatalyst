"""
backend/routers/auth.py
Production-grade Welcome Email API for SkillsCatalyst.

Guarantees:
- Exactly-one welcome email per user using durable database table welcome_email_events.
- Zero welcome emails for existing user logins.
- Distributed concurrency locking via Upstash Redis (with safe database-level fallback).
- Processing leases (processing_until = now + 5 min) to prevent deadlocks on worker crash.
- Provider idempotency header (X-Entity-Ref-ID).
- Full retryability with exponential backoff on Resend/network failures.
- Strict authentication validation: derives user_id & email from Supabase Bearer token.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, status
from pydantic import BaseModel, Field

from backend.services.email_service import send_welcome_email
from backend.services.cache_service import get_redis_client
from backend.services.supabase_service import get_supabase
from backend.services.welcome_email_store import (
    get_welcome_email_event,
    create_welcome_email_event,
    claim_welcome_email_job,
    mark_welcome_email_sent,
    mark_welcome_email_failed,
)

logger = logging.getLogger("skillscatalyst.welcome_email")

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Backoff intervals per attempt (in seconds)
_BACKOFF_SECONDS = {
    1: 0,
    2: 10,
    3: 30,
    4: 60,
    5: 120,
}
_MAX_ATTEMPTS = 5
_PROCESSING_LEASE_SECONDS = 300  # 5 minutes


class WelcomeEmailRequest(BaseModel):
    is_signup: bool = Field(default=False, description="True only during genuine new user registration flow")
    full_name: Optional[str] = Field(default=None, max_length=255)


def _is_backoff_ready(event: dict) -> bool:
    """Checks whether sufficient time has elapsed since last failure according to backoff policy."""
    attempts = event.get("attempts") or 0
    delay_sec = _BACKOFF_SECONDS.get(attempts, 120)
    updated_at_str = event.get("updated_at")
    if not updated_at_str:
        return True

    try:
        updated_at = datetime.fromisoformat(updated_at_str.replace("Z", "+00:00"))
        return datetime.now(timezone.utc) >= (updated_at + timedelta(seconds=delay_sec))
    except Exception:
        return True


def _process_welcome_email_job(user_id: str, email: str, full_name: Optional[str]):
    """Background worker that executes the external email send and updates durable state."""
    clean_user_id = str(user_id).strip()
    clean_email = str(email).strip().lower()

    try:
        logger.info(f"welcome_email_processing: executing send for user_id={clean_user_id} email={clean_email}")
        res = send_welcome_email(to=clean_email, full_name=full_name, user_id=clean_user_id)

        if res.get("success") and res.get("id"):
            msg_id = res.get("id")
            mark_welcome_email_sent(user_id=clean_user_id, resend_id=msg_id)
            logger.info(f"welcome_email_sent: successfully completed for user_id={clean_user_id} resend_id={msg_id}")
        else:
            err_msg = res.get("error") or "Email provider rejected send without message ID"
            mark_welcome_email_failed(user_id=clean_user_id, error_message=err_msg)
            logger.warning(f"welcome_email_failed: user_id={clean_user_id} error={err_msg}")
    except Exception as exc:
        err_str = str(exc)
        mark_welcome_email_failed(user_id=clean_user_id, error_message=err_str)
        logger.error(f"welcome_email_failed: unhandled exception for user_id={clean_user_id}: {err_str}")
    finally:
        # Release short-lived Redis lock
        r = get_redis_client()
        if r:
            try:
                r.delete(f"welcome_email_lock:{clean_user_id}")
            except Exception:
                pass


@router.post("/welcome-email", status_code=status.HTTP_200_OK)
def trigger_welcome_email(
    payload: WelcomeEmailRequest,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
):
    """
    Idempotent Welcome Email Endpoint.
    Requires: Authorization: Bearer <Supabase access token>
    
    Guarantees:
    - Derives authenticated user identity, email, and metadata securely from Supabase.
    - Uses durable database table welcome_email_events with UNIQUE(user_id).
    - Existing users logging in receive 0 emails.
    - Brand new signups (Email or Google OAuth) receive exactly one welcome email.
    - Concurrent requests are guarded by Redis distributed locking + database processing leases.
    - Failed deliveries remain retryable.
    """
    # 1. Strict Authentication Validation
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid Supabase Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable.",
        )

    try:
        auth_res = sb.auth.get_user(jwt=token)
        if not auth_res or not auth_res.user or not auth_res.user.id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        supa_user = auth_res.user
    except HTTPException:
        raise
    except Exception as auth_err:
        logger.warning(f"Supabase auth token verification error: {auth_err}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(supa_user.id).strip()
    user_email = (supa_user.email or "").strip().lower()
    if not user_email or "@" not in user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account has no valid email address.",
        )

    # Derive name gracefully from user metadata
    user_meta = supa_user.user_metadata or {}
    derived_name = (
        user_meta.get("full_name")
        or user_meta.get("name")
        or payload.full_name
        or user_email.split("@")[0]
        or "Learner"
    )

    # 2. Query Durable Event Store
    event = get_welcome_email_event(user_id)

    # 3. Handle Existing Users vs. New Signups
    if not event:
        if not payload.is_signup:
            # Existing user login with no onboarding event -> Never send email
            logger.info(f"welcome_email_skipped: user_id={user_id} status=skipped_existing reason=no_onboarding_event")
            return {
                "success": True,
                "status": "skipped_existing",
                "message": "Existing user account. Welcome email skipped.",
            }

        # Genuine new signup onboarding flow -> Create durable event
        event, _ = create_welcome_email_event(user_id=user_id, email=user_email)
        if not event:
            return {
                "success": False,
                "status": "failed",
                "message": "Unable to initialize welcome email event.",
            }

    # 4. Check Current Event State
    current_status = event.get("status")

    if current_status == "sent":
        logger.info(f"welcome_email_skipped: user_id={user_id} status=already_sent resend_id={event.get('resend_id')}")
        return {
            "success": True,
            "status": "already_sent",
            "message": "Welcome email has already been sent.",
        }

    if current_status == "processing":
        processing_until_str = event.get("processing_until")
        if processing_until_str:
            try:
                p_until = datetime.fromisoformat(processing_until_str.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) < p_until:
                    logger.info(f"welcome_email_skipped: user_id={user_id} status=processing active_lease_until={processing_until_str}")
                    return {
                        "success": True,
                        "status": "processing",
                        "message": "Welcome email is currently being processed by another worker.",
                    }
            except Exception:
                pass

    if (event.get("attempts") or 0) >= _MAX_ATTEMPTS:
        logger.warning(f"welcome_email_skipped: user_id={user_id} status=failed reason=max_attempts_exceeded")
        return {
            "success": False,
            "status": "failed",
            "message": "Maximum delivery attempts reached.",
        }

    if current_status == "failed" and not _is_backoff_ready(event):
        logger.info(f"welcome_email_retry: user_id={user_id} waiting_for_backoff attempt={event.get('attempts')}")
        return {
            "success": True,
            "status": "processing",
            "message": "Retry is scheduled under exponential backoff policy.",
        }

    # 5. Acquire Short-Lived Redis Distributed Lock (30s TTL)
    r = get_redis_client()
    lock_acquired = False
    lock_key = f"welcome_email_lock:{user_id}"
    if r:
        try:
            lock_acquired = bool(r.set(lock_key, "1", nx=True, ex=30))
            if not lock_acquired:
                logger.info(f"welcome_email_lock_failed: concurrent request for user_id={user_id}")
                return {
                    "success": True,
                    "status": "processing",
                    "message": "Welcome email dispatch already in progress.",
                }
        except Exception as lock_err:
            logger.warning(f"Redis lock attempt failed ({lock_err}) — continuing to database atomic claim.")

    # 6. Atomically Claim Event with Bounded Lease (5 minutes)
    claimed_event = claim_welcome_email_job(user_id=user_id, lease_seconds=_PROCESSING_LEASE_SECONDS)
    if not claimed_event:
        if r and lock_acquired:
            try:
                r.delete(lock_key)
            except Exception:
                pass
        return {
            "success": True,
            "status": "processing",
            "message": "Job claimed by concurrent worker.",
        }

    # 7. Hand Off to Asynchronous Background Task
    background_tasks.add_task(_process_welcome_email_job, user_id, user_email, derived_name)

    return {
        "success": True,
        "status": "queued",
        "message": "Welcome email queued for delivery.",
    }
