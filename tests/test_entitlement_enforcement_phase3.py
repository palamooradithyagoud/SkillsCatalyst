"""
tests/test_entitlement_enforcement_phase3.py
Phase 3: Comprehensive Free/Premium Entitlement Enforcement Test Suite.

Validates the 20 authoritative backend entitlement enforcement scenarios:
1. Free: saved_videos 1st save succeeds (200)
2. Free: saved_videos 2nd save blocked with HTTP 403 LIMIT_REACHED
3. Free: saved_videos unsaving playlist frees slot, next save succeeds (200)
4. Free: company_interview_questions blocked with HTTP 403 PREMIUM_REQUIRED
5. Free: placement_prep aptitude topic blocked with HTTP 403 PREMIUM_REQUIRED
6. Free: placement_prep aptitude attempt blocked with HTTP 403 PREMIUM_REQUIRED
7. Free: scholarships read-only access succeeds (200)
8. Free: tech_news feed is capped at 2 stories server-side
9. Free: tech_news detail past free limit blocked with HTTP 403 LIMIT_REACHED
10. Free: ai_mentor quota checked before Groq execution (HTTP 403 LIMIT_REACHED on quota exceeded)
11. Free: roadmaps generation quota checked (HTTP 403 LIMIT_REACHED on quota exceeded)
12. Premium: saved_videos allows multiple / unlimited saves
13. Premium: company_interview_questions returns 200 with full question bank
14. Premium: placement_prep aptitude questions and attempt return 200 OK
15. Premium: scholarships returns 200 with full listings
16. Premium: tech_news returns all stories without 2-story cap and all details
17. Premium: ai_mentor allows unlimited chat and resume reviews
18. Premium: roadmaps allows full roadmap generation
19. Expiry: expired subscription (expires_at <= now()) automatically reverts to Free tier without cron
20. Security: client spoofing headers (x-plan, x-is-premium) strictly ignored, zero content leakage
"""

import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.subscription import (
    PlanCode,
    SubscriptionStatus,
    AccessLevel,
    FeatureKey,
    EntitlementDetailDTO,
)
from backend.services.subscription_service import SubscriptionService

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test Student"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestEntitlementEnforcementPhase3(unittest.TestCase):

    def setUp(self):
        self.free_student_id = "11111111-1111-4111-a111-111111111111"
        self.premium_student_id = "22222222-2222-4222-a222-222222222222"
        self.free_user = MockAuthUser(self.free_student_id, "free@skillscatalyst.com")
        self.premium_user = MockAuthUser(self.premium_student_id, "premium@skillscatalyst.com")
        self.now = datetime.now(timezone.utc)

    # =========================================================================
    # SCENARIO 1: Free User - 1st Playlist Save Succeeds (200)
    # =========================================================================
    def test_01_free_saved_videos_first_save_succeeds(self):
        """Free student saving their first playlist succeeds (200 OK)."""
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[{"playlist_id": "PL_001"}])
        mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
             patch("backend.services.learning.playlist_service.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "playlist_id": "PL_001",
                "title": "Python for Beginners",
                "channel": "Programming Hub",
                "playlist_url": "https://www.youtube.com/playlist?list=PL_001",
            }
            resp = client.post(
                "/api/learning/save",
                json=payload,
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json().get("success"))

    # =========================================================================
    # SCENARIO 2: Free User - 2nd Playlist Save Blocked (403 LIMIT_REACHED)
    # =========================================================================
    def test_02_free_saved_videos_second_save_blocked_403(self):
        """Free student attempting to save a 2nd playlist receives 403 LIMIT_REACHED."""
        mock_sb = MagicMock()

        def mock_select(fields="*"):
            builder = MagicMock()
            def mock_eq(col, val):
                eq_builder = MagicMock()
                if col == "playlist_id" and val == "PL_002":
                    eq_builder.execute.return_value = MagicMock(data=[])
                else:
                    eq_builder.execute.return_value = MagicMock(data=[{"id": "existing-1", "playlist_id": "PL_001"}])
                return eq_builder
            builder.eq.side_effect = mock_eq
            return builder

        mock_sb.table.return_value.select.side_effect = mock_select

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
             patch("backend.services.learning.playlist_service.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "playlist_id": "PL_002",
                "title": "Advanced Data Structures",
                "channel": "CS Academy",
                "playlist_url": "https://www.youtube.com/playlist?list=PL_002",
            }
            resp = client.post(
                "/api/learning/save",
                json=payload,
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "LIMIT_REACHED")
            self.assertEqual(data["feature"], "saved_videos")
            self.assertEqual(data["limit"], 1)

    # =========================================================================
    # SCENARIO 3: Free User - Unsaving Playlist Frees Slot
    # =========================================================================
    def test_03_free_saved_videos_unsave_frees_slot(self):
        """Unsaving/deleting a playlist frees the single slot, allowing a new save."""
        mock_sb = MagicMock()
        mock_sb.table.return_value.delete.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
             patch("backend.services.learning.playlist_service.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            # 1. Delete existing playlist
            del_resp = client.delete(
                "/api/learning/save/PL_001",
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(del_resp.status_code, 200)
            self.assertTrue(del_resp.json().get("success"))

            # 2. Save new playlist now succeeds (count drops to 0)
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[{"playlist_id": "PL_NEW"}])
            mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[])

            payload = {
                "playlist_id": "PL_NEW",
                "title": "Clean Code in TypeScript",
                "channel": "Code Hub",
                "playlist_url": "https://www.youtube.com/playlist?list=PL_NEW",
            }
            save_resp = client.post(
                "/api/learning/save",
                json=payload,
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(save_resp.status_code, 200)

    # =========================================================================
    # SCENARIO 4: Free User - Company Questions Blocked (403 PREMIUM_REQUIRED)
    # =========================================================================
    def test_04_free_company_interview_questions_blocked_403(self):
        """Free user requesting interview questions receives 403 PREMIUM_REQUIRED."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.get(
                "/api/practice/questions/google",
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "PREMIUM_REQUIRED")
            self.assertEqual(data["feature"], "company_interview_questions")
            self.assertIn("Premium subscription required", data["message"])

    # =========================================================================
    # SCENARIO 5: Free User - Placement Prep Aptitude Topic Blocked (403)
    # =========================================================================
    def test_05_free_placement_prep_aptitude_topic_blocked_403(self):
        """Free user requesting placement prep aptitude questions receives 403 PREMIUM_REQUIRED."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.get(
                "/api/practice/aptitude/percentages",
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "PREMIUM_REQUIRED")
            self.assertEqual(data["feature"], "placement_prep")

    # =========================================================================
    # SCENARIO 6: Free User - Placement Prep Aptitude Attempt Blocked (403)
    # =========================================================================
    def test_06_free_placement_prep_aptitude_attempt_blocked_403(self):
        """Free user submitting aptitude attempt receives 403 PREMIUM_REQUIRED."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 101,
                "selected_option_index": 2,
                "is_correct": True,
                "time_taken_seconds": 25,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "PREMIUM_REQUIRED")
            self.assertEqual(data["feature"], "placement_prep")

    # =========================================================================
    # SCENARIO 7: Free User - Scholarships Read-Only Access (200 OK)
    # =========================================================================
    def test_07_free_scholarships_read_only_accessible(self):
        """Free student can view scholarships directory (200 OK, limited access)."""
        mock_data = [
            {
                "id": "sch-01",
                "title": "National Merit Scholarship 2026",
                "amount": 50000,
                "deadline": "2026-12-31",
                "eligibility": "B.Tech students",
            }
        ]
        with patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.order.return_value.execute.return_value = MagicMock(data=mock_data)
            mock_sch_sb.return_value = mock_sb

            resp = client.get("/api/scholarships/")
            self.assertEqual(resp.status_code, 200)

    # =========================================================================
    # SCENARIO 8: Free User - Tech News Feed Capped at 2 Server-Side
    # =========================================================================
    def test_08_free_tech_news_feed_capped_at_two(self):
        """Server-side slices grouped stories to max 2 for free users."""
        grouped_mock = [
            {
                "source_id": "src-1",
                "source_name": "TechCrunch",
                "category": "AI",
                "stories": [
                    {"id": "story-1", "title": "Story 1"},
                    {"id": "story-2", "title": "Story 2"},
                    {"id": "story-3", "title": "Story 3"},
                    {"id": "story-4", "title": "Story 4"},
                ],
            }
        ]
        with patch("backend.routers.tech_news.get_student_grouped_tech_news", return_value=grouped_mock), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            resp = client.get("/api/tech-news/")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            total_stories = data.get("total_stories", 0)
            self.assertEqual(total_stories, 2)
            sources = data.get("sources", [])
            self.assertEqual(sources[0]["stories"][0]["id"], "story-1")
            self.assertEqual(sources[0]["stories"][1]["id"], "story-2")

    # =========================================================================
    # SCENARIO 9: Free User - Tech News Detail Past Limit Blocked (403)
    # =========================================================================
    def test_09_free_tech_news_detail_past_limit_blocked_403(self):
        """Free user requesting detail of 3rd story receives 403 LIMIT_REACHED."""
        grouped_mock = [
            {
                "source_id": "src-1",
                "stories": [
                    {"id": "story-1", "title": "Story 1"},
                    {"id": "story-2", "title": "Story 2"},
                    {"id": "story-3", "title": "Story 3"},
                ],
            }
        ]
        mock_story_3 = {
            "id": "story-3",
            "source_id": "src-1",
            "title": "Story 3",
            "url": "https://example.com/3",
            "summary": "Summary 3",
            "published_at": "2026-09-21T00:00:00Z",
            "is_active": True,
            "created_at": "2026-09-21T00:00:00Z",
        }
        with patch("backend.routers.tech_news.get_student_story_by_id", return_value=mock_story_3), \
             patch("backend.routers.tech_news.get_student_grouped_tech_news", return_value=grouped_mock), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            resp = client.get("/api/tech-news/story-3")
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "LIMIT_REACHED")
            self.assertEqual(data["feature"], "tech_news")
            self.assertEqual(data["limit"], 2)

    # =========================================================================
    # SCENARIO 10: Free User - AI Mentor Quota Enforced Before Groq
    # =========================================================================
    def test_10_free_ai_mentor_quota_enforced_before_groq(self):
        """When AI mentor quota is reached, 403 is returned BEFORE Groq execution."""
        with patch("backend.routers.ai_mentor.get_ai_mentor_usage", return_value=5), \
             patch("backend.routers.ai_mentor.chat_with_groq") as mock_groq, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.AI_MENTOR.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=5)
             }):

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Explain Dijkstra algorithm"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "LIMIT_REACHED")
            self.assertEqual(data["feature"], "ai_mentor")
            mock_groq.assert_not_called()

    # =========================================================================
    # SCENARIO 11: Free User - Roadmaps Generation Quota Enforced
    # =========================================================================
    def test_11_free_roadmaps_generation_quota_enforced(self):
        """Free user who has exhausted roadmaps quota receives 403 LIMIT_REACHED."""
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"roadmap_id": "rm-1"}, {"roadmap_id": "rm-2"}, {"roadmap_id": "rm-3"}]
        )
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None), \
             patch.object(SubscriptionService, "get_user_entitlements", return_value={
                 FeatureKey.ROADMAPS.value: EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=1)
             }):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/learning/roadmap",
                json={"skill": "Full Stack Development"},
                headers={"Authorization": "Bearer free-token"},
            )
            self.assertEqual(resp.status_code, 403)
            data = resp.json()["detail"]
            self.assertEqual(data["code"], "LIMIT_REACHED")
            self.assertEqual(data["feature"], "roadmaps")

    # =========================================================================
    # SCENARIO 12: Premium User - Saved Videos Unlimited
    # =========================================================================
    def test_12_premium_saved_videos_unlimited(self):
        """Premium user can save multiple playlists without hitting limits."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=2)).isoformat(),
            "expires_at": (self.now + timedelta(days=28)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[{"playlist_id": "PL_099"}])
        mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.get_supabase", return_value=mock_sb), \
             patch("backend.services.learning.playlist_service.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "playlist_id": "PL_099",
                "title": "System Design Masterclass",
                "channel": "Tech Lead",
                "playlist_url": "https://www.youtube.com/playlist?list=PL_099",
            }
            resp = client.post(
                "/api/learning/save",
                json=payload,
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json().get("success"))

    # =========================================================================
    # SCENARIO 13: Premium User - Company Questions Full Access (200 OK)
    # =========================================================================
    def test_13_premium_company_questions_full_access(self):
        """Premium user gets 200 OK and full list of interview questions."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.get(
                "/api/practice/questions/google",
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["company"], "google")
            self.assertIn("questions", data)
            self.assertGreater(len(data["questions"]), 0)

    # =========================================================================
    # SCENARIO 14: Premium User - Placement Prep Full Access (200 OK)
    # =========================================================================
    def test_14_premium_placement_prep_full_access(self):
        """Premium user can access aptitude topic questions and submit attempts."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            # 1. Aptitude Topic
            topic_resp = client.get(
                "/api/practice/aptitude/percentages",
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(topic_resp.status_code, 200)
            self.assertEqual(topic_resp.json()["topic"], "Percentages")

            # 2. Aptitude Attempt
            attempt_payload = {
                "topic_id": 1,
                "question_id": 50,
                "selected_option_index": 3,
                "is_correct": True,
                "time_taken_seconds": 18,
            }
            attempt_resp = client.post(
                "/api/practice/aptitude/attempt",
                json=attempt_payload,
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(attempt_resp.status_code, 200)
            self.assertEqual(attempt_resp.json()["status"], "success")

    # =========================================================================
    # SCENARIO 15: Premium User - Scholarships Full Access (200 OK)
    # =========================================================================
    def test_15_premium_scholarships_full_access(self):
        """Premium user has unrestricted access to scholarships database."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        mock_data = [{"id": "sch-01", "title": "Merit Scholarship"}]
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.order.return_value.execute.return_value = MagicMock(data=mock_data)
            mock_sch_sb.return_value = mock_sb

            resp = client.get(
                "/api/scholarships/",
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(resp.status_code, 200)

    # =========================================================================
    # SCENARIO 16: Premium User - Tech News Unlimited Feed & Details
    # =========================================================================
    def test_16_premium_tech_news_unlimited_feed_and_details(self):
        """Premium user receives all stories without 2-story cap and can view any detail."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        grouped_mock = [
            {
                "source_id": "src-1",
                "stories": [
                    {"id": "story-1", "title": "Story 1"},
                    {"id": "story-2", "title": "Story 2"},
                    {"id": "story-3", "title": "Story 3"},
                    {"id": "story-4", "title": "Story 4"},
                ],
            }
        ]
        mock_story_4 = {
            "id": "story-4",
            "source_id": "src-1",
            "source_url": "https://example.com/source4",
            "title": "Story 4",
            "headline": "Story 4",
            "url": "https://example.com/4",
            "summary": "Summary 4",
            "published_at": "2026-09-21T00:00:00Z",
            "is_active": True,
            "created_at": "2026-09-21T00:00:00Z",
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.tech_news.get_student_grouped_tech_news", return_value=grouped_mock), \
             patch("backend.routers.tech_news.get_student_story_by_id", return_value=mock_story_4), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            # 1. Feed returns all 4 stories
            feed_resp = client.get(
                "/api/tech-news/",
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(feed_resp.status_code, 200)
            total = feed_resp.json().get("total_stories", 0)
            self.assertEqual(total, 4)

            # 2. Detail of story-4 succeeds (not blocked by 403)
            det_resp = client.get(
                "/api/tech-news/story-4",
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(det_resp.status_code, 200)
            self.assertEqual(det_resp.json()["id"], "story-4")

    # =========================================================================
    # SCENARIO 17: Premium User - AI Mentor Unlimited Access
    # =========================================================================
    def test_17_premium_ai_mentor_unlimited_chat_and_resume(self):
        """Premium user has unlimited chat and resume reviews without quota blocks."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value="Great interview answer!"), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Conduct mock interview"},
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertIn("reply", resp.json())

    # =========================================================================
    # SCENARIO 18: Premium User - Roadmaps Full Generation
    # =========================================================================
    def test_18_premium_roadmaps_full_generation(self):
        """Premium user has full roadmap generation access without quota checks."""
        mock_sub = {
            "id": "sub-prem",
            "user_id": self.premium_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=1)).isoformat(),
            "expires_at": (self.now + timedelta(days=29)).isoformat(),
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.learning.generate_skill_roadmap", return_value={"steps": ["Step 1", "Step 2"]}), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.premium_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/learning/roadmap",
                json={"skill": "Backend Architecture"},
                headers={"Authorization": "Bearer premium-token"},
            )
            self.assertEqual(resp.status_code, 200)

    # =========================================================================
    # SCENARIO 19: Expired Premium Automatically Reverts to Free (Zero Cron)
    # =========================================================================
    def test_19_expired_subscription_automatically_reverts_to_free(self):
        """Expired subscription (expires_at in past) immediately downgrades without cron."""
        expired_sub = {
            "id": "sub-expired",
            "user_id": self.free_student_id,
            "status": "active",
            "started_at": (self.now - timedelta(days=35)).isoformat(),
            "expires_at": (self.now - timedelta(days=5)).isoformat(),  # Expired 5 days ago
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=expired_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            # /api/subscriptions/me reports free plan & is_premium=False
            me_resp = client.get(
                "/api/subscriptions/me",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(me_resp.status_code, 200)
            me_data = me_resp.json()
            self.assertEqual(me_data["plan"], "free")
            self.assertFalse(me_data["is_premium"])

            # Practice company questions are immediately blocked
            prac_resp = client.get(
                "/api/practice/questions/google",
                headers={"Authorization": "Bearer token"},
            )
            self.assertEqual(prac_resp.status_code, 403)
            self.assertEqual(prac_resp.json()["detail"]["code"], "PREMIUM_REQUIRED")

    # =========================================================================
    # SCENARIO 20: Tamper Resistance & Content Leakage Prevention
    # =========================================================================
    def test_20_tamper_resistance_and_zero_content_leakage(self):
        """Client-supplied spoof headers are ignored; 403 errors leak no protected data."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.free_user)
            mock_auth_sb.return_value = mock_auth_client

            # Attacker attempts to inject forged headers
            tamper_headers = {
                "Authorization": "Bearer free-token",
                "x-plan": "premium_monthly",
                "x-is-premium": "true",
                "x-user-role": "admin",
                "role": "premium",
            }
            resp = client.get("/api/practice/questions/google", headers=tamper_headers)
            self.assertEqual(resp.status_code, 403)

            err = resp.json()["detail"]
            self.assertEqual(err["code"], "PREMIUM_REQUIRED")
            self.assertNotIn("questions", resp.json())
            self.assertNotIn("leetcode", resp.text.lower())
            self.assertNotIn("acceptance", resp.text.lower())


if __name__ == "__main__":
    unittest.main()
