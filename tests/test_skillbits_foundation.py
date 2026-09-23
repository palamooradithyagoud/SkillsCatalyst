"""
tests/test_skillbits_foundation.py
Comprehensive Production Test Suite for SkillsCatalyst SkillBits Foundation (Step 1).

Validates all 14 core requirements:
1.  Admin can create a draft SkillBit (201 Created)
2.  Unauthorized / unauthenticated user cannot create SkillBits (401 Unauthorized)
3.  Student cannot create SkillBits (403 Forbidden)
4.  Admin can update a SkillBit (200 OK)
5.  Invalid difficulty rejected (422 Unprocessable Entity)
6.  Invalid duration rejected (<= 0 rejected with 422 Unprocessable Entity)
7.  Draft SkillBit is not returned by student endpoint (/api/skillbits)
8.  Archived SkillBit is not returned by student endpoint (/api/skillbits)
9.  Published SkillBit is returned by student endpoint (/api/skillbits)
10. Publish without required data fails (400 Bad Request)
11. Valid SkillBit can be published by admin (200 OK)
12. Student cannot publish (403 Forbidden)
13. Student cannot modify or archive (403 Forbidden)
14. Relational skills are persisted and retrieved correctly in skillbit_skills
15. Student single-item endpoint returns 404 for draft or archived SkillBit
16. Student response projection strictly hides video_asset_id and created_by
17. Invalid video_provider is rejected (422 Unprocessable Entity)
18. Empty or oversized title rejected (422 Unprocessable Entity)
"""

import sys
import unittest
import uuid
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.skillbits import (
    CreateSkillBitRequest,
    UpdateSkillBitRequest,
    SkillBitDifficulty,
    SkillBitStatus,
    VideoProvider,
)
from backend.services.skillbits_service import validate_publish_readiness

client = TestClient(app)


class MockAuthUser:
    """Simulates a Supabase Auth user object returned by sb.auth.get_user()."""
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestSkillBitsFoundation(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "owner@skillscatalyst.com"
        self.admin_id = "22222222-3333-4444-5555-666666666666"
        self.admin_email = "admin@skillscatalyst.com"
        self.student_id = "11111111-2222-3333-4444-555555555555"
        self.student_email = "student@university.edu"

        self.owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Platform Owner")
        self.admin_user = MockAuthUser(self.admin_id, self.admin_email, role="admin", full_name="Content Admin")
        self.student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.mock_skillbit_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        self.mock_skill_id = "ssssssss-1111-2222-3333-444444444444"

        now_str = datetime.now(timezone.utc).isoformat()
        self.mock_draft_record = {
            "id": self.mock_skillbit_id,
            "title": "Understanding React Server Components",
            "description": "Deep-dive into streaming and server-side rendering architecture.",
            "topic": "React",
            "difficulty": "intermediate",
            "duration_seconds": 90,
            "thumbnail_url": "https://example.com/rsc-thumb.jpg",
            "video_provider": "mux",
            "video_asset_id": "mux_asset_abc123",
            "playback_id": "mux_playback_xyz789",
            "status": "draft",
            "published_at": None,
            "created_by": self.admin_id,
            "created_at": now_str,
            "updated_at": now_str,
        }

        self.mock_published_record = {
            **self.mock_draft_record,
            "status": "published",
            "published_at": now_str,
        }

        self.mock_archived_record = {
            **self.mock_draft_record,
            "status": "archived",
            "published_at": now_str,
        }

        self.mock_skills_cache_record = {
            "id": self.mock_skill_id,
            "skill_key": "react",
            "skill_name": "React.js",
        }

    # ── 1. Admin can create a draft SkillBit ────────────────────────────────────
    def test_01_admin_can_create_draft_skillbit(self):
        """1. Admin can create a draft SkillBit (201 Created)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            # mock insert on skillbits table
            mock_svc.from_().insert().execute.return_value = MagicMock(data=[self.mock_draft_record])
            # mock select on skillbit_skills
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            payload = {
                "title": "Understanding React Server Components",
                "description": "Deep-dive into streaming and server-side rendering architecture.",
                "topic": "React",
                "difficulty": "intermediate",
                "duration_seconds": 90,
                "video_provider": "mux",
                "video_asset_id": "mux_asset_abc123",
                "playback_id": "mux_playback_xyz789",
                "status": "draft",
            }

            res = client.post(
                "/api/admin/skillbits",
                json=payload,
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertEqual(data["title"], "Understanding React Server Components")
            self.assertEqual(data["status"], "draft")
            self.assertEqual(data["difficulty"], "intermediate")
            self.assertEqual(data["video_provider"], "mux")

    # ── 2. Unauthorized / unauthenticated user cannot create SkillBits ──────────
    def test_02_unauthenticated_user_cannot_create_skillbit(self):
        """2. Unauthenticated request without Bearer token is rejected with 401 Unauthorized."""
        payload = {
            "title": "Unauthenticated Attempt",
            "difficulty": "beginner",
        }
        res = client.post("/api/admin/skillbits", json=payload)
        self.assertEqual(res.status_code, 401)

    # ── 3. Student cannot create SkillBits (403 Forbidden) ──────────────────────
    def test_03_student_cannot_create_skillbit(self):
        """3. Student receives 403 Forbidden when attempting to create a SkillBit."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth

            payload = {
                "title": "Student Unauthorized Creation",
                "difficulty": "beginner",
            }
            res = client.post(
                "/api/admin/skillbits",
                json=payload,
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("Admin or content manager privileges required", res.json()["detail"])

    # ── 4. Admin can update a SkillBit ──────────────────────────────────────────
    def test_04_admin_can_update_skillbit(self):
        """4. Admin can update a SkillBit (200 OK)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            updated_record = {
                **self.mock_draft_record,
                "title": "Updated RSC Guide 2026",
                "difficulty": "advanced",
            }

            mock_svc = MagicMock()
            # Fetch existing
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_draft_record])
            # Update
            mock_svc.from_().update().eq().execute.return_value = MagicMock(data=[updated_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/admin/skillbits/{self.mock_skillbit_id}",
                json={"title": "Updated RSC Guide 2026", "difficulty": "advanced"},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["title"], "Updated RSC Guide 2026")
            self.assertEqual(data["difficulty"], "advanced")

    # ── 5. Invalid difficulty rejected ──────────────────────────────────────────
    def test_05_invalid_difficulty_rejected(self):
        """5. Invalid difficulty level is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            payload = {
                "title": "Invalid Difficulty Test",
                "difficulty": "super_expert_level",
            }
            res = client.post(
                "/api/admin/skillbits",
                json=payload,
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 422)

    # ── 6. Invalid duration rejected ────────────────────────────────────────────
    def test_06_invalid_duration_rejected(self):
        """6. Negative or zero duration_seconds is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            # Case A: duration = 0
            res1 = client.post(
                "/api/admin/skillbits",
                json={"title": "Zero Duration", "difficulty": "beginner", "duration_seconds": 0},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res1.status_code, 422)

            # Case B: duration = -30
            res2 = client.post(
                "/api/admin/skillbits",
                json={"title": "Negative Duration", "difficulty": "beginner", "duration_seconds": -30},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res2.status_code, 422)

    # ── 7. Draft SkillBit is not returned by student endpoint ───────────────────
    def test_07_draft_skillbit_not_returned_by_student_endpoint(self):
        """7. Student endpoint (/api/skillbits) does not return draft SkillBits."""
        with patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:
            mock_svc = MagicMock()
            # When student query is executed with .eq("status", "published"), return empty
            mock_svc.from_().select().eq().order().range().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get("/api/skillbits")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["total"], 0)
            self.assertEqual(len(data["items"]), 0)

    # ── 8. Archived SkillBit is not returned by student endpoint ────────────────
    def test_08_archived_skillbit_not_returned_by_student_endpoint(self):
        """8. Archived SkillBit is not returned by student endpoint (/api/skillbits)."""
        with patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:
            mock_svc = MagicMock()
            # When student query executes .eq("status", "published"), archived records are excluded
            mock_svc.from_().select().eq().order().range().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get("/api/skillbits")
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json()["total"], 0)

    # ── 9. Published SkillBit is returned by student endpoint ───────────────────
    def test_09_published_skillbit_returned_by_student_endpoint(self):
        """9. Published SkillBit is returned by student endpoint with sanitized structure."""
        with patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:
            mock_svc = MagicMock()
            mock_svc.from_().select().eq().order().range().execute.return_value = MagicMock(data=[self.mock_published_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get("/api/skillbits")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["total"], 1)
            item = data["items"][0]
            self.assertEqual(item["id"], self.mock_skillbit_id)
            self.assertEqual(item["title"], self.mock_published_record["title"])
            self.assertEqual(item["playback_id"], "mux_playback_xyz789")

    # ── 10. Publish without required data fails ─────────────────────────────────
    def test_10_publish_without_required_data_fails(self):
        """10. Attempting to publish without video reference or title fails with 400 Bad Request."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            incomplete_record = {
                "id": self.mock_skillbit_id,
                "title": "Missing Video Reference",
                "difficulty": "beginner",
                "video_provider": None,
                "playback_id": None,
                "video_asset_id": None,
                "status": "draft",
                "created_by": self.admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[incomplete_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 400)
            self.assertIn("missing required fields", res.json()["detail"])

    # ── 11. Valid SkillBit can be published ─────────────────────────────────────
    def test_11_valid_skillbit_can_be_published(self):
        """11. Admin can publish a SkillBit that contains all required video & content metadata."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_draft_record])
            mock_svc.from_().update().eq().execute.return_value = MagicMock(data=[self.mock_published_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["status"], "published")
            self.assertIsNotNone(data["published_at"])

    # ── 12. Student cannot publish ──────────────────────────────────────────────
    def test_12_student_cannot_publish(self):
        """12. Student receives 403 Forbidden when calling publish endpoint."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth

            res = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/publish",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res.status_code, 403)

    # ── 13. Student cannot modify or archive ────────────────────────────────────
    def test_13_student_cannot_modify_or_archive(self):
        """13. Student receives 403 Forbidden when calling PATCH or archive endpoints."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_user)
            mock_auth_sb.return_value = mock_auth

            # Try PATCH
            res1 = client.patch(
                f"/api/admin/skillbits/{self.mock_skillbit_id}",
                json={"title": "Hacked Title"},
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res1.status_code, 403)

            # Try Archive
            res2 = client.post(
                f"/api/admin/skillbits/{self.mock_skillbit_id}/archive",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(res2.status_code, 403)

    # ── 14. Relationships persisted correctly in skillbit_skills ────────────────
    def test_14_relationships_persisted_correctly(self):
        """14. Creating SkillBit with skill_ids links to skillbit_skills and hydrates on query."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()

            def mock_from(table_name):
                mock_table = MagicMock()
                if table_name == "skillbits":
                    mock_table.insert().execute.return_value = MagicMock(data=[self.mock_draft_record])
                    mock_table.select().eq().execute.return_value = MagicMock(data=[self.mock_draft_record])
                elif table_name == "skillbit_skills":
                    mock_table.insert().execute.return_value = MagicMock(data=[])
                    mock_table.select().in_().execute.return_value = MagicMock(
                        data=[{"skillbit_id": self.mock_skillbit_id, "skill_id": self.mock_skill_id}]
                    )
                elif table_name == "skills_cache":
                    mock_table.select().in_().execute.return_value = MagicMock(
                        data=[self.mock_skills_cache_record]
                    )
                return mock_table

            mock_svc.from_.side_effect = mock_from
            mock_svc_sb.return_value = mock_svc

            payload = {
                "title": "React Server Components with Tagged Skills",
                "difficulty": "intermediate",
                "skill_ids": [self.mock_skill_id],
            }

            res = client.post(
                "/api/admin/skillbits",
                json=payload,
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertEqual(len(data["skills"]), 1)
            self.assertEqual(data["skills"][0]["skill_key"], "react")

    # ── 15. Student single-item endpoint returns 404 for draft/archived ─────────
    def test_15_student_single_item_404_for_draft_or_archived(self):
        """15. Student single-item endpoint (/api/skillbits/{id}) returns 404 for draft or archived items."""
        with patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:
            mock_svc = MagicMock()
            # When queried with .eq("status", "published"), returns empty
            mock_svc.from_().select().eq().eq().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get(f"/api/skillbits/{self.mock_skillbit_id}")
            self.assertEqual(res.status_code, 404)
            self.assertIn("not found or not published", res.json()["detail"])

    # ── 16. Student response projection strictly hides video_asset_id & created_by
    def test_16_student_response_projection_security(self):
        """16. Student response projection never leaks video_asset_id or created_by."""
        with patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:
            mock_svc = MagicMock()
            mock_svc.from_().select().eq().eq().execute.return_value = MagicMock(data=[self.mock_published_record])
            mock_svc.from_().select().in_().execute.return_value = MagicMock(data=[])
            mock_svc_sb.return_value = mock_svc

            res = client.get(f"/api/skillbits/{self.mock_skillbit_id}")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            # Verify public fields present
            self.assertIn("playback_id", data)
            self.assertIn("difficulty", data)
            self.assertIn("skills", data)
            self.assertIn("courses", data)
            self.assertIn("lessons", data)
            self.assertIn("roadmaps", data)
            # Verify internal credentials and audit fields are absent
            self.assertNotIn("video_asset_id", data)
            self.assertNotIn("created_by", data)

    # ── 17. Invalid video_provider is rejected ──────────────────────────────────
    def test_17_invalid_video_provider_rejected(self):
        """17. Unsupported video_provider (e.g. 'vimeo', 'dailymotion') is rejected with 422."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            payload = {
                "title": "Unsupported Provider Test",
                "difficulty": "beginner",
                "video_provider": "unsupported_provider",
            }
            res = client.post(
                "/api/admin/skillbits",
                json=payload,
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res.status_code, 422)

    # ── 18. Empty or oversized title rejected ───────────────────────────────────
    def test_18_empty_or_oversized_title_rejected(self):
        """18. Empty title or title > 255 chars is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.admin_user)
            mock_auth_sb.return_value = mock_auth

            # Empty title
            res1 = client.post(
                "/api/admin/skillbits",
                json={"title": "   ", "difficulty": "beginner"},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res1.status_code, 422)

            # Oversized title
            res2 = client.post(
                "/api/admin/skillbits",
                json={"title": "A" * 256, "difficulty": "beginner"},
                headers={"Authorization": "Bearer mock-admin-token"},
            )
            self.assertEqual(res2.status_code, 422)


if __name__ == "__main__":
    unittest.main()
