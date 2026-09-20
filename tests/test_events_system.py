"""
tests/test_events_system.py
Comprehensive Test Suite for SkillsCatalyst Events & Hackathons CMS.

Validates all 20 specific backend test scenarios:
1.  Create draft event
2.  Draft is not student-visible
3.  Publish event
4.  Published event becomes visible
5.  Future visible_from event is hidden
6.  Event becomes visible after visible_from
7.  Expired event disappears (visible_until in past)
8.  No visible_until remains visible indefinitely
9.  Archived event disappears from student listings
10. Non-hackathon works cleanly without hackathon fields
11. Hackathon supports prize pool
12. Hackathon supports team size
13. Hackathon supports mode (online / offline / hybrid)
14. Invalid date ranges rejected (end_date < start_date)
15. Invalid URL rejected
16. Required fields validated
17. Student cannot mutate (403 Forbidden)
18. Owner can mutate (create/update/delete)
19. Delete works for authorized admin
20. Search & category filter works
"""

import sys
import os
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.event import (
    CreateEventRequest,
    UpdateEventRequest,
    EventStatus,
    EventCategory,
    EventMode,
)
from backend.services.event_service import _is_event_visible_now

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestEventsCMS(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "palamooradithyagoud@gmail.com"
        self.student_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        self.student_email = "student.learner@gmail.com"

        self.mock_owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Adithya goud Palamoor")
        self.mock_student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.now = datetime.now(timezone.utc)
        self.valid_event_payload = {
            "event_name": "Google x College Hackathon",
            "conducted_by_college": "ABC Engineering College",
            "event_link": "https://example.com/register",
            "registration_deadline": (self.now + timedelta(days=10)).isoformat(),
            "start_date": (self.now + timedelta(days=15)).isoformat(),
            "end_date": (self.now + timedelta(days=16)).isoformat(),
            "location": "Visakhapatnam",
            "category": "offline",
            "banner_url": "https://example.com/poster.jpg",
            "description": "Build innovative campus solutions.",
            "is_hackathon": True,
            "prize_pool": "₹1,00,000",
            "team_size": "2-4",
            "mode": "offline",
            "status": "draft",
        }

    # =========================================================================
    # 1. CREATE DRAFT EVENT
    # =========================================================================
    def test_01_create_draft_event(self):
        """1. Admin can create a draft event."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.event_service.get_supabase") as mock_ev_sb:
            
            # Mock owner auth
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            # Mock DB insert
            mock_ev_client = MagicMock()
            mock_ev_client.from_().insert().execute.return_value = MagicMock(
                data=[{**self.valid_event_payload, "id": "ev-123", "created_by": self.owner_id, "status": "draft"}]
            )
            mock_ev_sb.return_value = mock_ev_client

            resp = client.post(
                "/api/admin/events",
                headers={"Authorization": "Bearer mock-owner-token"},
                json=self.valid_event_payload,
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["event"]["status"], "draft")

    # =========================================================================
    # 2. DRAFT IS NOT STUDENT-VISIBLE
    # =========================================================================
    def test_02_draft_not_student_visible(self):
        """2. Draft events do not pass visibility checks for students."""
        draft_ev = {**self.valid_event_payload, "status": "draft"}
        self.assertFalse(_is_event_visible_now(draft_ev, self.now))

    # =========================================================================
    # 3. PUBLISH EVENT
    # =========================================================================
    def test_03_publish_event(self):
        """3. Admin can publish an event via publish endpoint."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.event_service.get_supabase") as mock_ev_sb:
            
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_ev_client = MagicMock()
            mock_ev_client.from_().update().eq().execute.return_value = MagicMock(
                data=[{**self.valid_event_payload, "id": "ev-123", "status": "published"}]
            )
            mock_ev_sb.return_value = mock_ev_client

            resp = client.post(
                "/api/admin/events/ev-123/publish",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["event"]["status"], "published")

    # =========================================================================
    # 4. PUBLISHED EVENT BECOMES VISIBLE
    # =========================================================================
    def test_04_published_event_visible(self):
        """4. Published event with no bounds is visible."""
        pub_ev = {**self.valid_event_payload, "status": "published", "visible_from": None, "visible_until": None}
        self.assertTrue(_is_event_visible_now(pub_ev, self.now))

    # =========================================================================
    # 5. FUTURE visible_from EVENT IS HIDDEN
    # =========================================================================
    def test_05_future_visible_from_hidden(self):
        """5. Published event scheduled for future visible_from is hidden."""
        future_from = (self.now + timedelta(days=2)).isoformat()
        future_ev = {
            **self.valid_event_payload,
            "status": "published",
            "visible_from": future_from,
            "visible_until": None,
        }
        self.assertFalse(_is_event_visible_now(future_ev, self.now))

    # =========================================================================
    # 6. EVENT BECOMES VISIBLE AFTER visible_from
    # =========================================================================
    def test_06_visible_after_visible_from(self):
        """6. Published event whose visible_from is in the past is visible."""
        past_from = (self.now - timedelta(days=1)).isoformat()
        active_ev = {
            **self.valid_event_payload,
            "status": "published",
            "visible_from": past_from,
            "visible_until": None,
        }
        self.assertTrue(_is_event_visible_now(active_ev, self.now))

    # =========================================================================
    # 7. EXPIRED EVENT DISAPPEARS
    # =========================================================================
    def test_07_expired_event_disappears(self):
        """7. Event whose visible_until is in the past disappears."""
        past_until = (self.now - timedelta(minutes=5)).isoformat()
        expired_ev = {
            **self.valid_event_payload,
            "status": "published",
            "visible_from": None,
            "visible_until": past_until,
        }
        self.assertFalse(_is_event_visible_now(expired_ev, self.now))

    # =========================================================================
    # 8. NO visible_until REMAINS VISIBLE
    # =========================================================================
    def test_08_no_visible_until_remains_visible(self):
        """8. An event with NULL visible_until remains visible."""
        ev = {
            **self.valid_event_payload,
            "status": "published",
            "visible_from": (self.now - timedelta(days=5)).isoformat(),
            "visible_until": None,
        }
        self.assertTrue(_is_event_visible_now(ev, self.now))

    # =========================================================================
    # 9. ARCHIVED EVENT DISAPPEARS
    # =========================================================================
    def test_09_archived_event_disappears(self):
        """9. An archived event does not pass student visibility."""
        arch_ev = {**self.valid_event_payload, "status": "archived"}
        self.assertFalse(_is_event_visible_now(arch_ev, self.now))

    # =========================================================================
    # 10. NON-HACKATHON WORKS WITHOUT HACKATHON FIELDS
    # =========================================================================
    def test_10_non_hackathon_cleans_fields(self):
        """10. When is_hackathon is False, prize_pool and team_size are cleared to None."""
        payload = {
            "event_name": "Tech Seminar",
            "conducted_by_college": "XYZ University",
            "event_link": "https://xyz.edu/seminar",
            "registration_deadline": (self.now + timedelta(days=5)).isoformat(),
            "start_date": (self.now + timedelta(days=7)).isoformat(),
            "end_date": (self.now + timedelta(days=8)).isoformat(),
            "category": "online",
            "banner_url": "https://example.com/poster.png",
            "is_hackathon": False,
            "prize_pool": "Should be cleared",
            "team_size": "4",
        }
        req = CreateEventRequest(**payload)
        self.assertFalse(req.is_hackathon)
        self.assertIsNone(req.prize_pool)
        self.assertIsNone(req.team_size)
        self.assertIsNone(req.mode)

    # =========================================================================
    # 11-13. HACKATHON SUPPORTS PRIZE POOL, TEAM SIZE, MODE
    # =========================================================================
    def test_11_12_13_hackathon_fields(self):
        """11-13. Hackathon preserves prize_pool, team_size, and mode."""
        payload = {
            "event_name": "AI Innovators Hackathon",
            "conducted_by_college": "MIT Campus",
            "event_link": "https://hack.mit.edu",
            "registration_deadline": (self.now + timedelta(days=5)).isoformat(),
            "start_date": (self.now + timedelta(days=7)).isoformat(),
            "end_date": (self.now + timedelta(days=9)).isoformat(),
            "category": "offline",
            "banner_url": "https://example.com/hack.jpg",
            "is_hackathon": True,
            "prize_pool": "₹5,00,000",
            "team_size": "2-4 members",
            "mode": "hybrid",
        }
        req = CreateEventRequest(**payload)
        self.assertTrue(req.is_hackathon)
        self.assertEqual(req.prize_pool, "₹5,00,000")
        self.assertEqual(req.team_size, "2-4 members")
        self.assertEqual(req.mode, EventMode.HYBRID)

    # =========================================================================
    # 14. INVALID DATE RANGES REJECTED
    # =========================================================================
    def test_14_invalid_date_range_rejected(self):
        """14. Rejects end_date < start_date and visible_until <= visible_from."""
        # end_date before start_date
        bad_dates = {
            **self.valid_event_payload,
            "start_date": (self.now + timedelta(days=10)).isoformat(),
            "end_date": (self.now + timedelta(days=5)).isoformat(),
        }
        with self.assertRaises(ValueError):
            CreateEventRequest(**bad_dates)

        # visible_until before visible_from
        bad_visibility = {
            **self.valid_event_payload,
            "visible_from": (self.now + timedelta(days=10)).isoformat(),
            "visible_until": (self.now + timedelta(days=5)).isoformat(),
        }
        with self.assertRaises(ValueError):
            CreateEventRequest(**bad_visibility)

    # =========================================================================
    # 15. INVALID URL REJECTED
    # =========================================================================
    def test_15_invalid_url_rejected(self):
        """15. Rejects malformed URLs for event_link."""
        bad_url = {**self.valid_event_payload, "event_link": "not-a-valid-url-at-all"}
        with self.assertRaises(ValueError):
            CreateEventRequest(**bad_url)

    # =========================================================================
    # 16. REQUIRED FIELDS VALIDATED
    # =========================================================================
    def test_16_required_fields_validated(self):
        """16. Fails if required field (e.g. conducted_by_college) is missing."""
        missing_college = {**self.valid_event_payload}
        del missing_college["conducted_by_college"]
        with self.assertRaises(Exception):
            CreateEventRequest(**missing_college)

    # =========================================================================
    # 17. STUDENT CANNOT MUTATE
    # =========================================================================
    def test_17_student_cannot_mutate(self):
        """17. Non-owner / student receives 403 Forbidden on create/update/delete."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            # POST /api/admin/events
            resp = client.post(
                "/api/admin/events",
                headers={"Authorization": "Bearer mock-student-token"},
                json=self.valid_event_payload,
            )
            self.assertEqual(resp.status_code, 403)

            # DELETE /api/admin/events/123
            resp_del = client.delete(
                "/api/admin/events/123",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(resp_del.status_code, 403)

    # =========================================================================
    # 18. OWNER CAN MUTATE
    # =========================================================================
    def test_18_owner_can_mutate(self):
        """18. Owner can successfully mutate event records."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.event_service.get_supabase") as mock_ev_sb:
            
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_ev_client = MagicMock()
            mock_ev_client.from_().select().eq().execute.return_value = MagicMock(
                data=[{**self.valid_event_payload, "id": "ev-100"}]
            )
            mock_ev_client.from_().update().eq().execute.return_value = MagicMock(
                data=[{**self.valid_event_payload, "id": "ev-100", "event_name": "Updated Event"}]
            )
            mock_ev_sb.return_value = mock_ev_client

            resp = client.patch(
                "/api/admin/events/ev-100",
                headers={"Authorization": "Bearer mock-owner-token"},
                json={"event_name": "Updated Event"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])

    # =========================================================================
    # 19. DELETE WORKS FOR AUTHORIZED ADMIN
    # =========================================================================
    def test_19_delete_works_for_admin(self):
        """19. Authorized admin can permanently delete an event."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.event_service.get_supabase") as mock_ev_sb:
            
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_ev_client = MagicMock()
            mock_ev_client.from_().delete().eq().execute.return_value = MagicMock(data=[{"id": "ev-100"}])
            mock_ev_sb.return_value = mock_ev_client

            resp = client.delete(
                "/api/admin/events/ev-100",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])

    # =========================================================================
    # 20. SEARCH & FILTER WORKS
    # =========================================================================
    def test_20_search_and_filters_work(self):
        """20. Student endpoint supports category and search filtering."""
        with patch("backend.services.event_service.get_supabase") as mock_ev_sb:
            ev1 = {
                **self.valid_event_payload,
                "id": "e1",
                "event_name": "Python Hackathon",
                "category": "online",
                "status": "published",
            }
            ev2 = {
                **self.valid_event_payload,
                "id": "e2",
                "event_name": "Robotics Summit",
                "category": "offline",
                "status": "published",
            }

            mock_ev_client = MagicMock()
            mock_ev_client.from_().select().eq().order().execute.return_value = MagicMock(data=[ev1, ev2])
            mock_ev_sb.return_value = mock_ev_client

            # Search "Python"
            resp = client.get("/api/events?search=python")
            self.assertEqual(resp.status_code, 200)
            events = resp.json()["events"]
            self.assertEqual(len(events), 1)
            self.assertEqual(events[0]["event_name"], "Python Hackathon")


if __name__ == "__main__":
    unittest.main()
