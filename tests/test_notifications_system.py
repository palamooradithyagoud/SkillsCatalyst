"""
tests/test_notifications_system.py
Comprehensive Test Suite for Web Push Notifications, Deduplication, Preferences,
and Streak Scheduler according to production requirements.
"""

import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.notification import (
    PushSubscriptionPayload,
    PushSubscriptionKeys,
    SendNotificationRequest,
    NotificationType,
)
from backend.services.web_push_service import format_push_url
from backend.services.notification_service import (
    get_user_preferences,
    update_user_preferences,
    send_notification,
    save_push_subscription,
    remove_push_subscription,
    process_streak_reminders,
    STREAK_MILESTONES,
)

client = TestClient(app)


class TestWebPushSecurityAndModels(unittest.TestCase):
    """Scenario 1: Input Validation, Schema Security, and Open-Redirect Prevention."""

    def test_valid_push_subscription_payload(self):
        payload = PushSubscriptionPayload(
            endpoint="https://fcm.googleapis.com/fcm/send/sample-token-123",
            keys=PushSubscriptionKeys(
                p256dh="BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcDnVwTJaWwBaMOuOvqzLocoNpSB5",
                auth="tBHItJI5svbpez7KI4CCXg",
            ),
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        )
        self.assertEqual(payload.endpoint, "https://fcm.googleapis.com/fcm/send/sample-token-123")
        self.assertIn("Windows", payload.user_agent)

    def test_reject_insecure_http_endpoint(self):
        with self.assertRaises(ValueError):
            PushSubscriptionPayload(
                endpoint="http://insecure-push-service.com/send",
                keys=PushSubscriptionKeys(
                    p256dh="BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcDnVwTJaWwBaMOuOvqzLocoNpSB5",
                    auth="tBHItJI5svbpez7KI4CCXg",
                ),
            )

    def test_notification_url_security_validation(self):
        # Valid relative paths
        req1 = SendNotificationRequest(
            user_id="00000000-0000-0000-0000-000000000001",
            notification_type=NotificationType.EVENT,
            title="New Hackathon",
            body="Hackathon description",
            url="/explore?tab=events&eventId=123",
        )
        self.assertEqual(req1.url, "/explore?tab=events&eventId=123")

        # Valid official domain
        req2 = SendNotificationRequest(
            user_id="00000000-0000-0000-0000-000000000001",
            notification_type=NotificationType.SCHOLARSHIP,
            title="New Scholarship",
            body="Check eligibility",
            url="https://www.skillscatalyst.in/explore",
        )
        self.assertEqual(req2.url, "https://www.skillscatalyst.in/explore")

        # Disallowed external domain (open-redirect protection)
        with self.assertRaises(ValueError):
            SendNotificationRequest(
                user_id="00000000-0000-0000-0000-000000000001",
                notification_type=NotificationType.EVENT,
                title="Malicious",
                body="Attempt redirect",
                url="https://attacker-phishing-site.com/steal-creds",
            )

    def test_format_push_url(self):
        self.assertEqual(
            format_push_url("/events/101"),
            "https://www.skillscatalyst.in/events/101",
        )
        self.assertEqual(
            format_push_url("https://custom.skillscatalyst.in/path"),
            "https://custom.skillscatalyst.in/path",
        )


class TestNotificationPreferencesAndSuppression(unittest.TestCase):
    """Scenario 2: User Notification Preferences & Delivery Suppression."""

    @patch("backend.services.notification_service.get_supabase")
    def test_default_preferences_when_record_missing(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        mock_sb.table().select().eq().limit().execute.return_value = MagicMock(data=[])

        prefs = get_user_preferences("user-123")
        self.assertTrue(prefs["streak_enabled"])
        self.assertTrue(prefs["events_enabled"])
        self.assertTrue(prefs["scholarships_enabled"])

    @patch("backend.services.notification_service.get_supabase")
    def test_update_preferences_upsert(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        mock_sb.table().select().eq().limit().execute.return_value = MagicMock(
            data=[{"user_id": "user-123", "streak_enabled": True, "events_enabled": True, "scholarships_enabled": True}]
        )
        mock_sb.table().upsert().execute.return_value = MagicMock(
            data=[{"user_id": "user-123", "streak_enabled": False, "events_enabled": True, "scholarships_enabled": True}]
        )

        updated = update_user_preferences("user-123", streak_enabled=False)
        self.assertFalse(updated["streak_enabled"])
        self.assertTrue(updated["events_enabled"])

    @patch("backend.services.notification_service.get_user_preferences")
    def test_send_notification_suppression_when_disabled(self, mock_get_prefs):
        # If user disabled event notifications
        mock_get_prefs.return_value = {"streak_enabled": True, "events_enabled": False, "scholarships_enabled": True}

        res = send_notification(
            user_id="user-123",
            notification_type=NotificationType.EVENT.value,
            title="🚀 Hackathon",
            body="New Hackathon",
            check_preferences=True,
        )
        self.assertIsNone(res, "Event notification must be suppressed when events_enabled is False")


class TestNotificationDeduplication(unittest.TestCase):
    """Scenario 3: Multi-Level Deduplication for Events, Scholarships, and Streaks."""

    @patch("backend.services.notification_service.get_supabase")
    @patch("backend.services.notification_service.get_user_preferences")
    def test_event_deduplication_skips_duplicate_source_id(self, mock_prefs, mock_get_sb):
        mock_prefs.return_value = {"events_enabled": True}
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Existing record found with same source_id
        mock_sb.table().select().eq().eq().filter().limit().execute.return_value = MagicMock(
            data=[{"id": "existing-notif-uuid"}]
        )

        result = send_notification(
            user_id="user-123",
            notification_type=NotificationType.EVENT.value,
            title="🚀 Hackathon",
            body="Hackathon Details",
            metadata={"source_type": "event", "source_id": "event-999"},
        )
        self.assertIsNone(result, "Duplicate event notification must be skipped")

    @patch("backend.services.notification_service.get_supabase")
    @patch("backend.services.notification_service.get_user_preferences")
    def test_daily_streak_reminder_deduplication(self, mock_prefs, mock_get_sb):
        mock_prefs.return_value = {"streak_enabled": True}
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Streak reminder already sent on this date
        mock_sb.table().select().eq().eq().filter().limit().execute.return_value = MagicMock(
            data=[{"id": "streak-today-notif"}]
        )

        result = send_notification(
            user_id="user-123",
            notification_type=NotificationType.STREAK.value,
            title="🔥 Streak at risk",
            body="Keep streak alive",
            metadata={"source_type": "streak_at_risk", "streak_date": "2026-09-25"},
        )
        self.assertIsNone(result, "Duplicate daily streak reminder must be skipped")


class TestStreakScheduler(unittest.TestCase):
    """Scenario 4: Streak Scheduler at-risk identification and milestone logic."""

    @patch("backend.services.notification_service.get_redis_client")
    @patch("backend.services.notification_service.get_supabase")
    @patch("backend.services.notification_service.send_notification")
    def test_streak_scheduler_alerts_at_risk_learner(self, mock_send, mock_sb_get, mock_redis_get):
        mock_redis = MagicMock()
        mock_redis_get.return_value = mock_redis
        mock_redis.set.return_value = True  # lock acquired

        mock_sb = MagicMock()
        mock_sb_get.return_value = mock_sb
        mock_sb.table().select().gt().execute.return_value = MagicMock(
            data=[
                # Learner 1: 5-day streak, logged in yesterday (not today) -> at risk!
                {"user_id": "u1", "streak_days": 5, "last_login_date": "2026-09-24"},
                # Learner 2: 3-day streak, logged in today -> NOT at risk!
                {"user_id": "u2", "streak_days": 3, "last_login_date": "2026-09-25"},
            ]
        )
        mock_send.return_value = {"id": "created"}

        result = process_streak_reminders(target_date_str="2026-09-25")
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["reminders_sent"], 1)

        # Check that send_notification was called for u1 but NOT for u2 (who completed today's goal)
        calls = [c for c in mock_send.call_args_list if c.kwargs.get("user_id") == "u1"]
        self.assertEqual(len(calls), 1)
        self.assertIn("at risk", calls[0].kwargs["title"])

    @patch("backend.services.notification_service.get_redis_client")
    def test_streak_scheduler_redis_lock_prevents_duplicate_runs(self, mock_redis_get):
        mock_redis = MagicMock()
        mock_redis_get.return_value = mock_redis
        mock_redis.set.return_value = False  # Lock not acquired (already ran)

        result = process_streak_reminders(target_date_str="2026-09-25")
        self.assertEqual(result["status"], "skipped")
        self.assertIn("already ran", result["message"])


class TestNotificationEndpoints(unittest.TestCase):
    """Scenario 5: API Router & Authentication Enforcements."""

    def test_vapid_public_key_endpoint_available(self):
        res = client.get("/api/notifications/vapid-public-key")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("vapid_public_key", data)
        self.assertTrue(len(data["vapid_public_key"]) > 20)

    def test_unauthenticated_notifications_access_rejected(self):
        res = client.get("/api/notifications")
        self.assertEqual(res.status_code, 401)

    def test_unauthenticated_preferences_rejected(self):
        res = client.get("/api/notifications/preferences")
        self.assertEqual(res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
