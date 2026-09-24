"""
backend/services/notification_service.py
Core Notification & Web Push Service Layer for SkillsCatalyst.
Manages push subscriptions, user preferences, in-app notification records,
delivery via VAPID Web Push, and duplicate prevention.
"""

import uuid
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Optional, Tuple

from backend.services.supabase_service import get_supabase
from backend.services.web_push_service import send_web_push, is_vapid_configured
from backend.services.cache_service import get_redis_client
from backend.models.notification import NotificationType

logger = logging.getLogger("skillscatalyst.notifications")

DEFAULT_TIMEZONE = "Asia/Kolkata"
STREAK_MILESTONES = {7, 14, 30, 50, 100}


def get_current_date_str(tz_name: str = DEFAULT_TIMEZONE) -> str:
    """Returns today's date string (YYYY-MM-DD) for the given timezone."""
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo(DEFAULT_TIMEZONE)
    return datetime.now(tz).strftime("%Y-%m-%d")


# =====================================================================
# 1. PUSH SUBSCRIPTIONS MANAGEMENT (MULTI-DEVICE SUPPORT)
# =====================================================================

def save_push_subscription(
    user_id: str,
    endpoint: str,
    p256dh: str,
    auth: str,
    user_agent: str = "",
) -> Dict[str, Any]:
    """
    Saves or updates a Web Push subscription.
    Each unique endpoint corresponds to a specific browser/device instance.
    Does not overwrite subscriptions belonging to other devices of the user.
    """
    sb = get_supabase()
    if not sb:
        raise RuntimeError("Database connection unavailable")

    endpoint_clean = endpoint.strip()
    payload = {
        "user_id": user_id,
        "endpoint": endpoint_clean,
        "p256dh": p256dh.strip(),
        "auth": auth.strip(),
        "user_agent": user_agent or "",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        # Upsert by unique constraint on endpoint
        res = sb.table("push_subscriptions").upsert(payload, on_conflict="endpoint").execute()
        data = res.data[0] if res.data else payload
        logger.info(f"Saved push subscription for user {user_id} on endpoint {endpoint_clean[:35]}...")
        return data
    except Exception as e:
        logger.error(f"Failed to save push subscription for user {user_id}: {e}")
        raise


def remove_push_subscription(user_id: str, endpoint: str) -> bool:
    """Removes a push subscription for the specified user and endpoint."""
    sb = get_supabase()
    if not sb:
        return False

    try:
        sb.table("push_subscriptions").delete().eq("user_id", user_id).eq("endpoint", endpoint.strip()).execute()
        logger.info(f"Removed push subscription for user {user_id} on endpoint {endpoint[:35]}...")
        return True
    except Exception as e:
        logger.error(f"Failed to remove push subscription: {e}")
        return False


def purge_expired_subscription(endpoint: str) -> None:
    """Purges a dead/expired push subscription (HTTP 404 or 410 Gone) across all users."""
    sb = get_supabase()
    if not sb or not endpoint:
        return

    try:
        sb.table("push_subscriptions").delete().eq("endpoint", endpoint.strip()).execute()
        logger.info(f"Purged expired push subscription endpoint: {endpoint[:35]}...")
    except Exception as e:
        logger.warning(f"Error purging expired subscription: {e}")


# =====================================================================
# 2. NOTIFICATION PREFERENCES
# =====================================================================

def get_user_preferences(user_id: str) -> Dict[str, Any]:
    """Retrieves user notification preferences or returns sensible defaults."""
    default_prefs = {
        "user_id": user_id,
        "streak_enabled": True,
        "events_enabled": True,
        "scholarships_enabled": True,
    }

    sb = get_supabase()
    if not sb:
        return default_prefs

    try:
        res = sb.table("notification_preferences").select("*").eq("user_id", user_id).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return default_prefs
    except Exception as e:
        logger.warning(f"Failed to retrieve notification preferences for {user_id}: {e}")
        return default_prefs


def update_user_preferences(
    user_id: str,
    streak_enabled: Optional[bool] = None,
    events_enabled: Optional[bool] = None,
    scholarships_enabled: Optional[bool] = None,
) -> Dict[str, Any]:
    """Updates or initializes user notification preferences."""
    current = get_user_preferences(user_id)
    update_data: Dict[str, Any] = {
        "user_id": user_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if streak_enabled is not None:
        update_data["streak_enabled"] = streak_enabled
    else:
        update_data["streak_enabled"] = current.get("streak_enabled", True)

    if events_enabled is not None:
        update_data["events_enabled"] = events_enabled
    else:
        update_data["events_enabled"] = current.get("events_enabled", True)

    if scholarships_enabled is not None:
        update_data["scholarships_enabled"] = scholarships_enabled
    else:
        update_data["scholarships_enabled"] = current.get("scholarships_enabled", True)

    sb = get_supabase()
    if not sb:
        return update_data

    try:
        res = sb.table("notification_preferences").upsert(update_data, on_conflict="user_id").execute()
        return res.data[0] if res.data else update_data
    except Exception as e:
        logger.error(f"Failed to update notification preferences for user {user_id}: {e}")
        raise


# =====================================================================
# 3. NOTIFICATION DISPATCH & DEDUPLICATION
# =====================================================================

def send_notification(
    user_id: str,
    notification_type: str,
    title: str,
    body: str,
    url: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    check_preferences: bool = True,
) -> Optional[Dict[str, Any]]:
    """
    Sends an in-app and Web Push notification to a user.
    - Honors user preferences (streak_enabled, events_enabled, scholarships_enabled).
    - Prevents duplicates based on metadata (source_id for events/scholarships, streak_date for streaks).
    - Dispatches Web Push to all active devices of the user.
    - Purges expired endpoints automatically upon HTTP 404/410.
    """
    sb = get_supabase()
    if not sb:
        logger.error("Supabase client is not available")
        return None

    meta = metadata.copy() if metadata else {}

    # 1. Preferences check
    if check_preferences:
        prefs = get_user_preferences(user_id)
        if notification_type == NotificationType.STREAK.value and not prefs.get("streak_enabled", True):
            logger.info(f"Skipping streak notification for user {user_id}: streak notifications disabled.")
            return None
        elif notification_type == NotificationType.EVENT.value and not prefs.get("events_enabled", True):
            logger.info(f"Skipping event notification for user {user_id}: event notifications disabled.")
            return None
        elif notification_type == NotificationType.SCHOLARSHIP.value and not prefs.get("scholarships_enabled", True):
            logger.info(f"Skipping scholarship notification for user {user_id}: scholarship notifications disabled.")
            return None

    # 2. Application-level deduplication check
    source_id = meta.get("source_id")
    streak_date = meta.get("streak_date")
    milestone_day = meta.get("milestone_day")

    try:
        if notification_type in (NotificationType.EVENT.value, NotificationType.SCHOLARSHIP.value) and source_id:
            existing = (
                sb.table("notifications")
                .select("id")
                .eq("user_id", user_id)
                .eq("type", notification_type)
                .filter("metadata->>source_id", "eq", str(source_id))
                .limit(1)
                .execute()
            )
            if existing.data and len(existing.data) > 0:
                logger.info(f"Deduplication: {notification_type} notification for source_id {source_id} already exists for user {user_id}. Skipping.")
                return None

        elif notification_type == NotificationType.STREAK.value:
            if streak_date:
                existing = (
                    sb.table("notifications")
                    .select("id")
                    .eq("user_id", user_id)
                    .eq("type", notification_type)
                    .filter("metadata->>streak_date", "eq", str(streak_date))
                    .limit(1)
                    .execute()
                )
                if existing.data and len(existing.data) > 0:
                    logger.info(f"Deduplication: Streak reminder already sent to user {user_id} on {streak_date}. Skipping.")
                    return None

            if milestone_day:
                existing = (
                    sb.table("notifications")
                    .select("id")
                    .eq("user_id", user_id)
                    .eq("type", notification_type)
                    .filter("metadata->>milestone_day", "eq", str(milestone_day))
                    .limit(1)
                    .execute()
                )
                if existing.data and len(existing.data) > 0:
                    logger.info(f"Deduplication: Streak milestone {milestone_day} already notified to user {user_id}. Skipping.")
                    return None
    except Exception as e:
        logger.warning(f"Error checking notification deduplication (proceeding with caution): {e}")

    # 3. Create In-App Notification Record
    notif_id = str(uuid.uuid4())
    record = {
        "id": notif_id,
        "user_id": user_id,
        "type": notification_type,
        "title": title.strip(),
        "body": body.strip(),
        "url": url,
        "metadata": meta,
        "is_read": False,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        ins_res = sb.table("notifications").insert(record).execute()
        created_notif = ins_res.data[0] if ins_res.data else record
    except Exception as e:
        logger.error(f"Failed to insert notification record in Supabase: {e}")
        # If failure is a unique constraint violation (dedup index), return gracefully
        if "idx_notifications_" in str(e):
            logger.info(f"Notification caught by DB unique deduplication index for user {user_id}")
            return None
        raise

    # 4. Dispatch Web Push to all devices subscribed by user
    try:
        subs_res = sb.table("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", user_id).execute()
        subscriptions = subs_res.data or []
        for sub in subscriptions:
            success, is_expired, err = send_web_push(
                subscription=sub,
                title=title,
                body=body,
                url=url,
                notification_type=notification_type,
                notification_id=notif_id,
                metadata=meta,
            )
            if is_expired:
                # Purge invalid/unregistered subscription
                purge_expired_subscription(sub.get("endpoint", ""))
    except Exception as e:
        logger.warning(f"Web Push delivery error for user {user_id}: {e}")

    return created_notif


def send_bulk_notifications(
    user_ids: List[str],
    notification_type: str,
    title: str,
    body: str,
    url: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    batch_size: int = 50,
) -> int:
    """
    Sends notifications to multiple users in efficient batches.
    Returns the count of successfully created notifications.
    """
    if not user_ids:
        return 0

    sent_count = 0
    # Process in chunks to avoid blocking
    for i in range(0, len(user_ids), batch_size):
        chunk = user_ids[i:i + batch_size]
        for uid in chunk:
            try:
                res = send_notification(
                    user_id=uid,
                    notification_type=notification_type,
                    title=title,
                    body=body,
                    url=url,
                    metadata=metadata,
                    check_preferences=True,
                )
                if res:
                    sent_count += 1
            except Exception as e:
                logger.error(f"Error sending bulk notification to user {uid}: {e}")

    return sent_count


# =====================================================================
# 4. IN-APP NOTIFICATION CENTER QUERIES & MUTATIONS
# =====================================================================

def get_user_notifications(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
) -> Dict[str, Any]:
    """Fetches user notifications with pagination and unread counts."""
    sb = get_supabase()
    if not sb:
        return {"total": 0, "unread_count": 0, "notifications": []}

    try:
        # 1. Total unread count
        unread_res = (
            sb.table("notifications")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )
        unread_count = unread_res.count if unread_res.count is not None else 0

        # 2. Notification items query
        query = (
            sb.table("notifications")
            .select("*", count="exact")
            .eq("user_id", user_id)
        )
        if unread_only:
            query = query.eq("is_read", False)

        res = (
            query.order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        items = res.data or []
        total = res.count if res.count is not None else len(items)

        return {
            "total": total,
            "unread_count": unread_count,
            "notifications": items,
        }
    except Exception as e:
        logger.error(f"Failed to fetch notifications for user {user_id}: {e}")
        return {"total": 0, "unread_count": 0, "notifications": []}


def mark_notification_as_read(user_id: str, notification_id: str) -> bool:
    """Marks a single notification as read for the user."""
    sb = get_supabase()
    if not sb:
        return False

    try:
        sb.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to mark notification {notification_id} as read: {e}")
        return False


def mark_all_notifications_as_read(user_id: str) -> int:
    """Marks all unread notifications as read for the user."""
    sb = get_supabase()
    if not sb:
        return 0

    try:
        res = sb.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
        return len(res.data) if res.data else 0
    except Exception as e:
        logger.error(f"Failed to mark all notifications as read for {user_id}: {e}")
        return 0


def delete_notification(user_id: str, notification_id: str) -> bool:
    """Deletes a notification item."""
    sb = get_supabase()
    if not sb:
        return False

    try:
        sb.table("notifications").delete().eq("id", notification_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete notification {notification_id}: {e}")
        return False


# =====================================================================
# 5. DOMAIN EVENT TRIGGERS (EVENTS & SCHOLARSHIPS)
# =====================================================================

def notify_new_event(
    event_id: str,
    event_title: str,
    event_category: str = "Hackathons",
    custom_message: Optional[str] = None,
) -> int:
    """
    Triggered when an event transitions to PUBLISHED.
    Broadcasts notifications to users who have events_enabled = True.
    """
    sb = get_supabase()
    if not sb:
        return 0

    # Determine category label and emoji
    cat_lower = str(event_category).lower()
    if "hackathon" in cat_lower:
        cat_label = "Hackathon"
        emoji = "🚀"
    elif "workshop" in cat_lower:
        cat_label = "Workshop"
        emoji = "💡"
    elif "competition" in cat_lower:
        cat_label = "Competition"
        emoji = "🏆"
    elif "conference" in cat_lower:
        cat_label = "Conference"
        emoji = "🎤"
    elif "internship" in cat_lower:
        cat_label = "Internship"
        emoji = "💼"
    else:
        cat_label = "Event"
        emoji = "🚀"

    title = f"{emoji} New {cat_label} Added"
    body = custom_message or f"{event_title} is now available on SkillsCatalyst."
    url = f"/explore?tab=events&eventId={event_id}"

    # Query all users with active push subscriptions or who haven't disabled events
    try:
        # Find users with events_enabled != False
        pref_res = sb.table("notification_preferences").select("user_id").eq("events_enabled", False).execute()
        disabled_uids = {r["user_id"] for r in (pref_res.data or [])}

        # Target all users registered in auth/profiles
        users_res = sb.table("profiles").select("id").execute()
        target_uids = [r["id"] for r in (users_res.data or []) if r["id"] not in disabled_uids]

        logger.info(f"Broadcasting event notification '{event_title}' to {len(target_uids)} users...")
        return send_bulk_notifications(
            user_ids=target_uids,
            notification_type=NotificationType.EVENT.value,
            title=title,
            body=body,
            url=url,
            metadata={
                "source_type": "event",
                "source_id": str(event_id),
                "category": event_category,
            },
        )
    except Exception as e:
        logger.error(f"Failed to dispatch event notification for event {event_id}: {e}")
        return 0


def notify_new_scholarship(
    scholarship_id: str,
    scholarship_title: str,
    scholarship_data: Optional[Dict[str, Any]] = None,
) -> int:
    """
    Triggered when a scholarship transitions to PUBLISHED.
    Performs eligibility targeting if student profile fields match,
    otherwise broadcasts to all users with scholarships_enabled = True.
    """
    sb = get_supabase()
    if not sb:
        return 0

    title = "🎓 New Scholarship Available"
    body = f"{scholarship_title} is now available. Check your eligibility."
    url = f"/explore?tab=scholarships&scholarshipId={scholarship_id}"

    try:
        # Find users who disabled scholarships
        pref_res = sb.table("notification_preferences").select("user_id").eq("scholarships_enabled", False).execute()
        disabled_uids = {r["user_id"] for r in (pref_res.data or [])}

        profiles_query = sb.table("profiles").select("id, branch, graduation_year, gender, category")
        profiles_res = profiles_query.execute()
        candidates = profiles_res.data or []

        eligible_uids = []
        for p in candidates:
            uid = p.get("id")
            if uid in disabled_uids:
                continue

            # Personalized eligibility filtering if scholarship criteria specified
            if scholarship_data:
                # E.g. branch match
                req_branches = scholarship_data.get("eligible_branches") or []
                if req_branches and p.get("branch") and p.get("branch") not in req_branches:
                    continue
                # E.g. graduation year match
                req_years = scholarship_data.get("eligible_graduation_years") or []
                if req_years and p.get("graduation_year") and p.get("graduation_year") not in req_years:
                    continue
                # E.g. gender requirement (e.g. women in STEM)
                req_gender = scholarship_data.get("eligible_gender")
                if req_gender and p.get("gender") and p.get("gender").lower() != req_gender.lower():
                    continue

            eligible_uids.append(uid)

        logger.info(f"Broadcasting scholarship notification '{scholarship_title}' to {len(eligible_uids)} eligible users...")
        return send_bulk_notifications(
            user_ids=eligible_uids,
            notification_type=NotificationType.SCHOLARSHIP.value,
            title=title,
            body=body,
            url=url,
            metadata={
                "source_type": "scholarship",
                "source_id": str(scholarship_id),
            },
        )
    except Exception as e:
        logger.error(f"Failed to dispatch scholarship notification for {scholarship_id}: {e}")
        return 0


# =====================================================================
# 6. STREAK SCHEDULER & AT-RISK REMINDERS
# =====================================================================

def process_streak_reminders(target_date_str: Optional[str] = None) -> Dict[str, Any]:
    """
    Daily streak reminder job:
    1. Acquires a Redis lock for target_date_str to prevent duplicate execution.
    2. Identifies learners whose streak is at risk (streak_days > 0 and last_login_date < today).
    3. Identifies milestone achievements (e.g. 7, 14, 30, 50, 100 days).
    4. Sends Web Push and in-app notifications with deduplication.
    """
    sb = get_supabase()
    if not sb:
        return {"status": "error", "message": "Supabase client unavailable"}

    today_str = target_date_str or get_current_date_str()
    redis_client = get_redis_client()

    # Redis distributed lock to guarantee idempotent execution
    lock_key = f"lock:streak_scheduler:{today_str}"
    if redis_client:
        try:
            # Set lock with 2-hour TTL
            acquired = redis_client.set(lock_key, "running", nx=True, ex=7200)
            if not acquired:
                logger.info(f"Streak scheduler for {today_str} is already running or ran recently. Skipping duplicate execution.")
                return {"status": "skipped", "message": f"Job already ran for {today_str}"}
        except Exception as e:
            logger.warning(f"Redis lock attempt failed: {e}. Proceeding with DB checks.")

    reminders_sent = 0
    milestones_sent = 0

    try:
        # Fetch users with active streak
        progress_res = sb.table("user_progress").select("user_id, streak_days, last_login_date").gt("streak_days", 0).execute()
        learners = progress_res.data or []

        for learner in learners:
            user_id = learner.get("user_id")
            streak_days = int(learner.get("streak_days") or 0)
            last_login = str(learner.get("last_login_date") or "").strip()

            if not user_id:
                continue

            # If user already completed learning goal today, do NOT notify
            if last_login == today_str:
                # Check for milestone congratulations if completed today
                if streak_days in STREAK_MILESTONES:
                    m_title = f"🏆 {streak_days}-Day Streak!"
                    m_body = f"You've completed your learning goal for {streak_days} consecutive days."
                    res = send_notification(
                        user_id=user_id,
                        notification_type=NotificationType.STREAK.value,
                        title=m_title,
                        body=m_body,
                        url="/dashboard",
                        metadata={
                            "source_type": "streak_milestone",
                            "milestone_day": streak_days,
                            "streak_date": today_str,
                        },
                        check_preferences=True,
                    )
                    if res:
                        milestones_sent += 1
                continue

            # User has NOT completed today's goal yet -> Streak is at risk!
            title = f"🔥 Your {streak_days}-day streak is at risk"
            body = "Complete today's learning goal before the day ends to keep your streak alive."
            res = send_notification(
                user_id=user_id,
                notification_type=NotificationType.STREAK.value,
                title=title,
                body=body,
                url="/dashboard",
                metadata={
                    "source_type": "streak_at_risk",
                    "streak_days": streak_days,
                    "streak_date": today_str,
                },
                check_preferences=True,
            )
            if res:
                reminders_sent += 1

        logger.info(f"Streak scheduler completed for {today_str}: {reminders_sent} at-risk reminders, {milestones_sent} milestones sent.")
        return {
            "status": "success",
            "date": today_str,
            "reminders_sent": reminders_sent,
            "milestones_sent": milestones_sent,
            "total_evaluated": len(learners),
        }
    except Exception as e:
        logger.error(f"Error in streak reminder job: {e}")
        return {"status": "error", "message": str(e)}
