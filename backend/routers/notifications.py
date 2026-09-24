"""
backend/routers/notifications.py
FastAPI Router for Web Push Subscriptions, User Notifications, Preferences, and Schedulers.
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks

from backend.services.auth_service import require_authenticated_user, require_admin
from backend.models.notification import (
    PushSubscriptionPayload,
    PushSubscriptionDeleteRequest,
    NotificationPreferencesUpdate,
    NotificationPreferencesResponse,
    NotificationListResponse,
    NotificationItemResponse,
    SendNotificationRequest,
)
from backend.services.notification_service import (
    save_push_subscription,
    remove_push_subscription,
    get_user_preferences,
    update_user_preferences,
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    delete_notification,
    send_notification,
    process_streak_reminders,
)
from backend.config import NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PUBLIC_KEY

logger = logging.getLogger("skillscatalyst.notifications.router")

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# ── 1. PUBLIC VAPID CONFIG ───────────────────────────────────────────

@router.get("/vapid-public-key")
async def get_vapid_key():
    """Returns the application VAPID public key needed for client PushManager subscription."""
    public_key = VAPID_PUBLIC_KEY or NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if not public_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VAPID push notifications are not configured on server",
        )
    return {"vapid_public_key": public_key}


# ── 2. WEB PUSH SUBSCRIPTIONS ────────────────────────────────────────

@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
async def subscribe_push(
    payload: PushSubscriptionPayload,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """
    Registers or updates a browser Web Push subscription for the authenticated user.
    Supports multiple devices (e.g. mobile Chrome, desktop Chrome, Edge).
    """
    user_id = current_user["user_id"]
    try:
        data = save_push_subscription(
            user_id=user_id,
            endpoint=payload.endpoint,
            p256dh=payload.keys.p256dh,
            auth=payload.keys.auth,
            user_agent=payload.user_agent or "",
        )
        return {"status": "subscribed", "endpoint": payload.endpoint[:35] + "..."}
    except Exception as e:
        logger.error(f"Error subscribing push endpoint for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save push subscription",
        )


@router.delete("/subscribe", status_code=status.HTTP_200_OK)
async def unsubscribe_push(
    payload: PushSubscriptionDeleteRequest,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Removes a specific Web Push subscription for the authenticated user."""
    user_id = current_user["user_id"]
    success = remove_push_subscription(user_id=user_id, endpoint=payload.endpoint)
    return {"status": "unsubscribed" if success else "not_found"}


# ── 3. IN-APP NOTIFICATIONS ──────────────────────────────────────────

@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    unread_only: bool = Query(default=False),
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """
    Returns paginated in-app notifications and unread counter for the current user.
    """
    user_id = current_user["user_id"]
    data = get_user_notifications(
        user_id=user_id,
        limit=limit,
        offset=offset,
        unread_only=unread_only,
    )
    return data


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Marks a single notification as read."""
    user_id = current_user["user_id"]
    success = mark_notification_as_read(user_id=user_id, notification_id=notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied",
        )
    return {"status": "marked_as_read", "id": notification_id}


@router.patch("/read-all")
async def mark_all_read(
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Marks all notifications as read for current user."""
    user_id = current_user["user_id"]
    count = mark_all_notifications_as_read(user_id=user_id)
    return {"status": "all_marked_as_read", "count": count}


@router.delete("/{notification_id}")
async def remove_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Deletes a specific notification from user's history."""
    user_id = current_user["user_id"]
    success = delete_notification(user_id=user_id, notification_id=notification_id)
    return {"status": "deleted" if success else "not_found"}


# ── 4. NOTIFICATION PREFERENCES ──────────────────────────────────────

@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def fetch_preferences(
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Returns notification delivery preferences for the current user."""
    user_id = current_user["user_id"]
    prefs = get_user_preferences(user_id=user_id)
    return NotificationPreferencesResponse(
        streak_enabled=prefs.get("streak_enabled", True),
        events_enabled=prefs.get("events_enabled", True),
        scholarships_enabled=prefs.get("scholarships_enabled", True),
    )


@router.patch("/preferences", response_model=NotificationPreferencesResponse)
async def update_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """Updates user notification preferences."""
    user_id = current_user["user_id"]
    updated = update_user_preferences(
        user_id=user_id,
        streak_enabled=payload.streak_enabled,
        events_enabled=payload.events_enabled,
        scholarships_enabled=payload.scholarships_enabled,
    )
    return NotificationPreferencesResponse(
        streak_enabled=updated.get("streak_enabled", True),
        events_enabled=updated.get("events_enabled", True),
        scholarships_enabled=updated.get("scholarships_enabled", True),
    )


# ── 5. SELF TEST & SCHEDULER ENDPOINTS ───────────────────────────────

@router.post("/test-push")
async def send_self_test_push(
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
):
    """
    Sends an immediate test notification to the current user's registered devices.
    Enables instant verification of browser permissions and service worker push delivery.
    """
    user_id = current_user["user_id"]
    notif = send_notification(
        user_id=user_id,
        notification_type="streak",
        title="🔔 Notification Test",
        body="Web Push is configured and working perfectly on SkillsCatalyst!",
        url="/dashboard",
        metadata={"source_type": "test"},
        check_preferences=False,
    )
    return {"status": "sent" if notif else "failed", "notification": notif}


@router.post("/admin/streak-check")
async def trigger_streak_scheduler(
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """
    Admin-only endpoint to trigger the daily streak at-risk and milestone check.
    Executed in background task to prevent blocking the HTTP response.
    """
    background_tasks.add_task(process_streak_reminders)
    return {"status": "scheduled", "message": "Daily streak reminder task started in background"}
