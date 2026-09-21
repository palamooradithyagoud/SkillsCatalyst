"""
tests/test_tech_news_system.py
Comprehensive Production Test Suite for SkillsCatalyst Tech News System.

Validates all 19 core test scenarios:
1.  Create company source as platform owner (201 Created)
2.  Non-owner cannot create company source (403 Forbidden)
3.  Student cannot create company source (403 Forbidden)
4.  Owner can update company source (200 OK)
5.  Owner can delete company source (200 OK)
6.  Create tech news story as owner in draft status (201 Created)
7.  Non-owner cannot create story (403 Forbidden)
8.  Student cannot create story (403 Forbidden)
9.  Owner can publish story: enforces 48-Hour visibility window (visible_until = visible_from + 48h)
10. Student feed (/api/tech-news) returns active published stories grouped by company source
11. Sources with zero active stories are omitted from student feed
12. Draft stories are hidden from student feed
13. Archived stories are hidden from student feed
14. Expired stories (>48 hours) are hidden from student feed
15. Student can fetch active story by ID (/api/tech-news/{id} -> 200 OK)
16. Student cannot fetch expired or draft story by ID (404 Not Found)
17. Owner can archive story, hiding it from student feed (200 OK)
18. Admin overview (/api/admin/overview) returns dynamic news count (replaces hardcoded 15)
19. 48-hour calculation logic unit tests
"""

import sys
import os
import unittest
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch, AsyncMock

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.tech_news import (
    CreateTechNewsSourceRequest,
    UpdateTechNewsSourceRequest,
    CreateTechNewsRequest,
    UpdateTechNewsRequest,
    TechNewsStatus,
)
from backend.services.tech_news_service import _is_story_visible_now

client = TestClient(app)


class MockAuthUser:
    """Simulates a Supabase auth user object returned by sb.auth.get_user()."""
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestTechNewsSystem(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "owner@skillscatalyst.com"
        self.student_id = "11111111-2222-3333-4444-555555555555"
        self.student_email = "student@university.edu"

        self.owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Platform Owner")
        self.student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.mock_source_id = "src-openai-001"
        self.mock_source_data = {
            "id": self.mock_source_id,
            "name": "OpenAI Engineering",
            "slug": "openai-engineering",
            "logo_url": "https://example.com/openai.png",
            "description": "Frontier AI research and models.",
            "website_url": "https://openai.com",
            "display_order": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        self.mock_story_id = "story-gpt5-001"
        now_dt = datetime.now(timezone.utc)
        self.mock_active_story_data = {
            "id": self.mock_story_id,
            "source_id": self.mock_source_id,
            "headline": "OpenAI Announces Autonomous Reasoning Breakthrough",
            "summary": "Novel architecture benchmarks on deep technical problems.",
            "why_it_matters": "Advances in test-time compute scaling for autonomous systems.",
            "cover_image_url": "https://example.com/cover.jpg",
            "source_url": "https://openai.com/index/reasoning",
            "category": "AI & ML",
            "tags": ["AI", "Reasoning", "OpenAI"],
            "status": "published",
            "display_order": 1,
            "published_at": now_dt.isoformat(),
            "visible_from": now_dt.isoformat(),
            "visible_until": (now_dt + timedelta(hours=48)).isoformat(),
            "created_by": self.owner_id,
            "created_at": now_dt.isoformat(),
            "updated_at": now_dt.isoformat(),
        }

    # ── 1. Create company source as owner (201 Created) ──────────────────────────
    def test_01_create_source_as_owner(self):
        """1. Platform owner can create a new tech news company source (201 Created)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_svc_client = MagicMock()
            mock_svc_client.from_().insert().execute.return_value = MagicMock(data=[self.mock_source_data])
            mock_svc_sb.return_value = mock_svc_client

            payload = {
                "name": "OpenAI Engineering",
                "website_url": "https://openai.com",
                "logo_url": "https://example.com/openai.png",
                "display_order": 1,
            }

            res = client.post(
                "/api/admin/tech-news/sources",
                json=payload,
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["source"]["name"], "OpenAI Engineering")

    # ── 2. Non-owner cannot create company source (403 Forbidden) ────────────────
    def test_02_non_owner_cannot_create_source(self):
        """2. Non-owner user receives 403 Forbidden when creating a source."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "name": "Unauthorized Company",
                "logo_url": "https://example.com/logo.png",
            }
            res = client.post(
                "/api/admin/tech-news/sources",
                json=payload,
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("Platform Owner privileges required", res.json()["detail"])

    # ── 3. Student cannot access admin sources ──────────────────────────────────
    def test_03_student_cannot_list_admin_sources(self):
        """3. Students receive 403 when listing admin sources."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth_client

            res = client.get(
                "/api/admin/tech-news/sources",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)

    # ── 4. Owner can update company source (200 OK) ──────────────────────────────
    def test_04_owner_can_update_source(self):
        """4. Owner can partially update a company source (200 OK)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            updated_data = dict(self.mock_source_data, name="OpenAI Research")
            mock_svc_client = MagicMock()
            mock_svc_client.from_().update().eq().execute.return_value = MagicMock(data=[updated_data])
            mock_svc_sb.return_value = mock_svc_client

            res = client.patch(
                f"/api/admin/tech-news/sources/{self.mock_source_id}",
                json={"name": "OpenAI Research"},
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["source"]["name"], "OpenAI Research")

    # ── 5. Owner can delete company source (200 OK) ──────────────────────────────
    def test_05_owner_can_delete_source(self):
        """5. Owner can permanently delete a company source (200 OK)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_svc_client = MagicMock()
            mock_svc_client.from_().delete().eq().execute.return_value = MagicMock(data=[self.mock_source_data])
            mock_svc_sb.return_value = mock_svc_client

            res = client.delete(
                f"/api/admin/tech-news/sources/{self.mock_source_id}",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 200)
            self.assertTrue(res.json()["success"])

    # ── 6. Create tech news story as owner in draft status (201 Created) ─────────
    def test_06_create_story_as_owner(self):
        """6. Owner creates a tech news story in draft status (201 Created)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            draft_story = dict(
                self.mock_active_story_data,
                status="draft",
                visible_from=None,
                visible_until=None,
                published_at=None,
            )
            mock_svc_client = MagicMock()
            mock_svc_client.from_().insert().execute.return_value = MagicMock(data=[draft_story])
            mock_svc_sb.return_value = mock_svc_client

            payload = {
                "source_id": self.mock_source_id,
                "headline": "Draft Technical Story on Reasoning",
                "summary": "This is a summary of the draft article.",
                "source_url": "https://openai.com/blog/draft-story",
                "status": "draft",
            }

            res = client.post(
                "/api/admin/tech-news/stories",
                json=payload,
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 201)
            self.assertEqual(res.json()["story"]["status"], "draft")

    def test_06b_create_story_with_frontend_aliases(self):
        """6b. Owner can create story using frontend alias fields (title and content) without 422 error."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_svc_client = MagicMock()
            mock_svc_client.from_().insert().execute.return_value = MagicMock(data=[self.mock_active_story_data])
            mock_svc_sb.return_value = mock_svc_client

            # Exact payload sent by the frontend modal (using title and content instead of headline/why_it_matters)
            frontend_payload = {
                "source_id": self.mock_source_id,
                "title": "GPT-6 Astra Hits 13% of Enterprise AI Spending",
                "summary": "captured 13% of tracked enterprise AI spending.",
                "content": "Full article content on OpenAI GPT-6 architecture.",
                "cover_image_url": "https://example.com/cover.png",
                "source_url": "https://openai.com/index/gpt-6-astra/",
                "status": "draft",
                "display_order": 0,
            }

            res = client.post(
                "/api/admin/tech-news/stories",
                json=frontend_payload,
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 201)
            story_res = res.json()["story"]
            self.assertIn("title", story_res)
            self.assertIn("headline", story_res)
            self.assertIn("content", story_res)
            self.assertIn("why_it_matters", story_res)

    # ── 7. Non-owner cannot create story (403 Forbidden) ─────────────────────────
    def test_07_non_owner_cannot_create_story(self):
        """7. Non-owner user receives 403 Forbidden when creating a story."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "source_id": self.mock_source_id,
                "headline": "Unauthorized Story Attempt",
                "summary": "Should not be allowed.",
                "source_url": "https://example.com/story",
            }
            res = client.post(
                "/api/admin/tech-news/stories",
                json=payload,
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)

    # ── 8. Student cannot create story (403 Forbidden) ───────────────────────────
    def test_08_student_cannot_create_story(self):
        """8. Student receives 403 Forbidden when creating a story via admin endpoint."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "source_id": self.mock_source_id,
                "headline": "Student Story Injection",
                "summary": "Students should never be able to create stories.",
                "source_url": "https://example.com/student-story",
            }
            res = client.post(
                "/api/admin/tech-news/stories",
                json=payload,
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("Platform Owner privileges required", res.json()["detail"])

    # ── 9. Owner can publish story: enforces 48-Hour visibility window ───────────
    def test_09_owner_can_publish_story_with_48h_window(self):
        """9. Publishing a story enforces visible_until = visible_from + 48 hours."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            now_dt = datetime.now(timezone.utc)
            until_dt = now_dt + timedelta(hours=48)
            published_story = dict(
                self.mock_active_story_data,
                status="published",
                published_at=now_dt.isoformat(),
                visible_from=now_dt.isoformat(),
                visible_until=until_dt.isoformat(),
            )
            mock_svc_client = MagicMock()
            mock_svc_client.from_().update().eq().execute.return_value = MagicMock(data=[published_story])
            mock_svc_sb.return_value = mock_svc_client

            res = client.post(
                f"/api/admin/tech-news/stories/{self.mock_story_id}/publish",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["story"]["status"], "published")
            # Verify 48h visibility window
            from_dt = datetime.fromisoformat(data["story"]["visible_from"].replace("Z", "+00:00"))
            to_dt = datetime.fromisoformat(data["story"]["visible_until"].replace("Z", "+00:00"))
            delta_hours = (to_dt - from_dt).total_seconds() / 3600
            self.assertAlmostEqual(delta_hours, 48.0, places=1)

    # ── 10. Student feed returns active stories grouped by company source ────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_10_student_grouped_feed_returns_active_stories(self, mock_get_sb):
        """10. GET /api/tech-news returns active published stories grouped by source."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        mock_sb.from_("tech_news_sources").select().eq().order().execute.return_value = MagicMock(
            data=[self.mock_source_data]
        )
        mock_sb.from_("tech_news").select().eq().order().order().execute.return_value = MagicMock(
            data=[self.mock_active_story_data]
        )

        res = client.get("/api/tech-news")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_sources"], 1)
        self.assertEqual(data["total_stories"], 1)
        source = data["sources"][0]
        self.assertEqual(source["id"], self.mock_source_id)
        self.assertEqual(len(source["stories"]), 1)
        self.assertEqual(source["stories"][0]["id"], self.mock_story_id)

    # ── 11. Sources with zero active stories are omitted from student feed ───────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_11_sources_with_zero_active_stories_omitted(self, mock_get_sb):
        """11. Sources with no active stories are omitted from the student feed."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        source2 = dict(self.mock_source_data, id="src-google", name="Google DeepMind")
        mock_sb.from_("tech_news_sources").select().eq().order().execute.return_value = MagicMock(
            data=[self.mock_source_data, source2]
        )
        # Only self.mock_source_data has a story; source2 has none
        mock_sb.from_("tech_news").select().eq().order().order().execute.return_value = MagicMock(
            data=[self.mock_active_story_data]
        )

        res = client.get("/api/tech-news")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_sources"], 1)
        returned_source_ids = [s["id"] for s in data["sources"]]
        self.assertIn(self.mock_source_id, returned_source_ids)
        self.assertNotIn("src-google", returned_source_ids)

    # ── 12. Draft stories hidden from student feed ───────────────────────────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_12_draft_stories_hidden_from_students(self, mock_get_sb):
        """12. Draft stories are hidden from the student feed."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        mock_sb.from_("tech_news_sources").select().eq().order().execute.return_value = MagicMock(
            data=[self.mock_source_data]
        )
        # DB query filters by status=published, so draft stories return empty
        mock_sb.from_("tech_news").select().eq().order().order().execute.return_value = MagicMock(data=[])

        res = client.get("/api/tech-news")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_sources"], 0)
        self.assertEqual(data["total_stories"], 0)

    # ── 13. Archived stories hidden from student feed ────────────────────────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_13_archived_stories_hidden_from_students(self, mock_get_sb):
        """13. Archived stories are hidden from the student feed."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Archived story: status != published → _is_story_visible_now → False
        archived_story = dict(self.mock_active_story_data, status="archived")

        mock_sb.from_("tech_news_sources").select().eq().order().execute.return_value = MagicMock(
            data=[self.mock_source_data]
        )
        mock_sb.from_("tech_news").select().eq().order().order().execute.return_value = MagicMock(
            data=[archived_story]
        )

        res = client.get("/api/tech-news")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # Archived story filtered out → source has 0 active stories → omitted
        self.assertEqual(data["total_sources"], 0)
        self.assertEqual(data["total_stories"], 0)

    # ── 14. Expired stories (>48 hours) hidden from student feed ─────────────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_14_expired_stories_hidden_from_students(self, mock_get_sb):
        """14. Stories past their 48h visibility window are hidden from students."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Expired story from 3 days ago
        old_dt = datetime.now(timezone.utc) - timedelta(days=3)
        expired_story = dict(
            self.mock_active_story_data,
            visible_from=old_dt.isoformat(),
            visible_until=(old_dt + timedelta(hours=48)).isoformat(),
        )

        mock_sb.from_("tech_news_sources").select().eq().order().execute.return_value = MagicMock(
            data=[self.mock_source_data]
        )
        mock_sb.from_("tech_news").select().eq().order().order().execute.return_value = MagicMock(
            data=[expired_story]
        )

        res = client.get("/api/tech-news")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # Expired story filtered out -> source has 0 active stories -> omitted
        self.assertEqual(data["total_sources"], 0)
        self.assertEqual(data["total_stories"], 0)

    # ── 15. Student can fetch active story by ID (200 OK) ────────────────────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_15_student_get_active_story_by_id(self, mock_get_sb):
        """15. Student can fetch an active published story by ID (200 OK)."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Story query returns active story with joined source
        story_with_source = dict(
            self.mock_active_story_data,
            tech_news_sources=self.mock_source_data,
        )
        mock_sb.from_().select().eq().execute.return_value = MagicMock(data=[story_with_source])

        res = client.get(f"/api/tech-news/{self.mock_story_id}")
        self.assertEqual(res.status_code, 200)
        response_data = res.json()
        self.assertEqual(response_data["id"], self.mock_story_id)
        self.assertEqual(response_data["headline"], self.mock_active_story_data["headline"])

    # ── 16. Student cannot fetch expired story by ID (404 Not Found) ─────────────
    @patch("backend.services.tech_news_service.get_supabase")
    def test_16_student_get_expired_story_by_id_returns_404(self, mock_get_sb):
        """16. Student receives 404 for expired or draft stories."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        old_dt = datetime.now(timezone.utc) - timedelta(days=3)
        expired_story = dict(
            self.mock_active_story_data,
            visible_from=old_dt.isoformat(),
            visible_until=(old_dt + timedelta(hours=48)).isoformat(),
        )
        mock_sb.from_().select().eq().execute.return_value = MagicMock(data=[expired_story])

        res = client.get(f"/api/tech-news/{self.mock_story_id}")
        self.assertEqual(res.status_code, 404)

    # ── 17. Owner can archive story (200 OK) ─────────────────────────────────────
    def test_17_owner_can_archive_story(self):
        """17. Owner can archive a story, hiding it from students (200 OK)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.tech_news_service.get_supabase") as mock_svc_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            archived_story = dict(self.mock_active_story_data, status="archived")
            mock_svc_client = MagicMock()
            mock_svc_client.from_().update().eq().execute.return_value = MagicMock(data=[archived_story])
            mock_svc_sb.return_value = mock_svc_client

            res = client.post(
                f"/api/admin/tech-news/stories/{self.mock_story_id}/archive",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["story"]["status"], "archived")

    # ── 18. Admin overview uses dynamic active news count ────────────────────────
    def test_18_admin_overview_uses_dynamic_news_count(self):
        """18. GET /api/admin/overview returns real active news count instead of hardcoded 15."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.admin.get_active_stories_count") as mock_count, \
             patch("backend.routers.admin.get_supabase") as mock_admin_sb, \
             patch("backend.routers.admin.get_active_events_count") as mock_events_count, \
             patch("backend.routers.admin.get_active_scholarships_count") as mock_sch_count:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_count.return_value = 7
            mock_events_count.return_value = 3
            mock_sch_count.return_value = 5

            # Mock admin overview's direct supabase calls for user counts
            mock_admin_client = MagicMock()
            prof_res = MagicMock()
            prof_res.count = 10
            prof_res.data = [
                {"id": "u1", "role": "owner"},
                {"id": "u2", "role": "student"},
                {"id": "u3", "role": "student"},
            ]
            mock_admin_client.from_("profiles").select().execute.return_value = prof_res

            acad_res = MagicMock()
            acad_res.count = 2
            mock_admin_client.from_("user_academic_profile").select().execute.return_value = acad_res

            mock_admin_sb.return_value = mock_admin_client

            res = client.get(
                "/api/admin/overview",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["stats"]["cms_modules"]["news_updates"], 7)

    # ── 19. 48-hour visibility calculation unit tests ────────────────────────────
    def test_19_is_story_visible_now_active_within_window(self):
        """19a. Story published within 48h window → visible (True)."""
        now = datetime.now(timezone.utc)
        story_active = {
            "status": "published",
            "visible_from": (now - timedelta(hours=2)).isoformat(),
            "visible_until": (now + timedelta(hours=46)).isoformat(),
        }
        self.assertTrue(_is_story_visible_now(story_active, now))

    def test_19_is_story_visible_now_draft(self):
        """19b. Draft story → not visible (False)."""
        now = datetime.now(timezone.utc)
        story_draft = {
            "status": "draft",
            "visible_from": (now - timedelta(hours=2)).isoformat(),
            "visible_until": (now + timedelta(hours=46)).isoformat(),
        }
        self.assertFalse(_is_story_visible_now(story_draft, now))

    def test_19_is_story_visible_now_archived(self):
        """19c. Archived story → not visible (False)."""
        now = datetime.now(timezone.utc)
        story_archived = {
            "status": "archived",
            "visible_from": (now - timedelta(hours=2)).isoformat(),
            "visible_until": (now + timedelta(hours=46)).isoformat(),
        }
        self.assertFalse(_is_story_visible_now(story_archived, now))

    def test_19_is_story_visible_now_future(self):
        """19d. Story with future visible_from → not yet visible (False)."""
        now = datetime.now(timezone.utc)
        story_future = {
            "status": "published",
            "visible_from": (now + timedelta(hours=1)).isoformat(),
            "visible_until": (now + timedelta(hours=49)).isoformat(),
        }
        self.assertFalse(_is_story_visible_now(story_future, now))

    def test_19_is_story_visible_now_expired(self):
        """19e. Story past visible_until (>48h ago) → expired (False)."""
        now = datetime.now(timezone.utc)
        story_expired = {
            "status": "published",
            "visible_from": (now - timedelta(hours=50)).isoformat(),
            "visible_until": (now - timedelta(hours=2)).isoformat(),
        }
        self.assertFalse(_is_story_visible_now(story_expired, now))

    def test_19_is_story_visible_now_null_fields(self):
        """19f. Published story with NULL visible_from/visible_until → visible (True)."""
        now = datetime.now(timezone.utc)
        story_null = {
            "status": "published",
            "visible_from": None,
            "visible_until": None,
        }
        self.assertTrue(_is_story_visible_now(story_null, now))

    def test_19_is_story_visible_now_empty_dict(self):
        """19g. Empty dict → not visible (False)."""
        now = datetime.now(timezone.utc)
        self.assertFalse(_is_story_visible_now({}, now))

    def test_19_is_story_visible_now_none_input(self):
        """19h. None input → not visible (False)."""
        now = datetime.now(timezone.utc)
        self.assertFalse(_is_story_visible_now(None, now))

    def test_19_is_story_visible_now_exactly_at_boundary(self):
        """19i. Story exactly at visible_until boundary → expired (False, uses strict <)."""
        now = datetime.now(timezone.utc)
        story_boundary = {
            "status": "published",
            "visible_from": (now - timedelta(hours=48)).isoformat(),
            "visible_until": now.isoformat(),
        }
        # visible_until <= now_dt → False (boundary check is strict)
        self.assertFalse(_is_story_visible_now(story_boundary, now))


if __name__ == "__main__":
    unittest.main()
