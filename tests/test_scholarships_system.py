"""
tests/test_scholarships_system.py
Comprehensive Test Suite for SkillsCatalyst Scholarships CMS.

Validates all 18 specific backend test scenarios:
1.  Create draft scholarship as owner (201 Created)
2.  Non-owner cannot create (403 Forbidden)
3.  Student cannot create (403 Forbidden)
4.  Owner can edit scholarship (200 OK)
5.  Non-owner cannot edit scholarship (403 Forbidden)
6.  Owner can publish scholarship (200 OK)
7.  Non-owner cannot publish scholarship (403 Forbidden)
8.  Published scholarship appears to students in /api/scholarships
9.  Draft scholarship is hidden from students
10. Archived scholarship is hidden from students
11. Future visible_from hides scholarship from students
12. Expired visible_until hides scholarship from students
13. Application URL validation (valid external URL vs invalid)
14. Required fields validation (cannot be empty/whitespace)
15. Delete scholarship works for owner, rejected for non-owner
16. Image upload authorization (owner can upload to Supabase Storage)
17. Student cannot upload image (403 Forbidden)
18. Admin overview uses real count (replaces hardcoded 8)
"""

import sys
import os
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch, AsyncMock

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.models.scholarship import (
    CreateScholarshipRequest,
    UpdateScholarshipRequest,
    ScholarshipStatus,
)
from backend.services.scholarship_service import _is_scholarship_visible_now

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestScholarshipsCMS(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "palamooradithyagoud@gmail.com"
        self.student_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        self.student_email = "student.learner@gmail.com"

        self.mock_owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Adithya goud Palamoor")
        self.mock_student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.now = datetime.now(timezone.utc)
        self.valid_payload = {
            "name": "Google Generation Scholarship 2026",
            "provided_by": "Google & AnitaB.org",
            "qualification_required": "B.Tech / BE Computer Science (2nd/3rd Year)",
            "eligibility": "Undergraduate students enrolled in a recognized university studying computer science.",
            "requirements": "Updated resume, academic transcripts, Statement of Purpose (SOP), GitHub profile.",
            "application_url": "https://buildyourfuture.withgoogle.com/scholarships/generation-scholarship-apac",
            "image_url": "https://example.com/scholarship.png",
            "status": "draft",
            "visible_from": self.now.isoformat(),
            "visible_until": (self.now + timedelta(days=30)).isoformat(),
        }

    # =========================================================================
    # 1. CREATE SCHOLARSHIP AS OWNER
    # =========================================================================
    def test_01_create_scholarship_as_owner(self):
        """1. Admin can create a draft scholarship (201 Created)."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            mock_sch_client.from_().insert().execute.return_value = MagicMock(
                data=[{**self.valid_payload, "id": "sch-001", "created_by": self.owner_id, "status": "draft"}]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.post(
                "/api/admin/scholarships",
                headers={"Authorization": "Bearer mock-owner-token"},
                json=self.valid_payload,
            )
            self.assertEqual(resp.status_code, 201)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["scholarship"]["name"], self.valid_payload["name"])
            self.assertEqual(data["scholarship"]["status"], "draft")

    # =========================================================================
    # 2 & 3. NON-OWNER / STUDENT CANNOT CREATE (403 Forbidden)
    # =========================================================================
    def test_02_non_owner_cannot_create_scholarship(self):
        """2 & 3. Students and non-owners receive 403 Forbidden when creating scholarships."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/admin/scholarships",
                headers={"Authorization": "Bearer mock-student-token"},
                json=self.valid_payload,
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Platform Owner privileges required", resp.json()["detail"])

    # =========================================================================
    # 4. OWNER CAN EDIT SCHOLARSHIP (200 OK)
    # =========================================================================
    def test_04_owner_can_edit_scholarship(self):
        """4. Owner can edit scholarship content."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            mock_sch_client.from_().update().eq().execute.return_value = MagicMock(
                data=[{**self.valid_payload, "id": "sch-001", "name": "Updated Scholarship Name"}]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.patch(
                "/api/admin/scholarships/sch-001",
                headers={"Authorization": "Bearer mock-owner-token"},
                json={"name": "Updated Scholarship Name"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["scholarship"]["name"], "Updated Scholarship Name")

    # =========================================================================
    # 5. NON-OWNER CANNOT EDIT SCHOLARSHIP (403 Forbidden)
    # =========================================================================
    def test_05_non_owner_cannot_edit_scholarship(self):
        """5. Non-owner receives 403 when trying to edit."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.patch(
                "/api/admin/scholarships/sch-001",
                headers={"Authorization": "Bearer mock-student-token"},
                json={"name": "Hacked Name"},
            )
            self.assertEqual(resp.status_code, 403)

    # =========================================================================
    # 6. OWNER CAN PUBLISH SCHOLARSHIP (200 OK)
    # =========================================================================
    def test_06_owner_can_publish_scholarship(self):
        """6. Owner can publish a draft scholarship."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            mock_sch_client.from_().update().eq().execute.return_value = MagicMock(
                data=[{**self.valid_payload, "id": "sch-001", "status": "published"}]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.post(
                "/api/admin/scholarships/sch-001/publish",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["scholarship"]["status"], "published")

    # =========================================================================
    # 7. NON-OWNER CANNOT PUBLISH SCHOLARSHIP (403 Forbidden)
    # =========================================================================
    def test_07_non_owner_cannot_publish_scholarship(self):
        """7. Non-owner receives 403 when trying to publish."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/admin/scholarships/sch-001/publish",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(resp.status_code, 403)

    # =========================================================================
    # 8. PUBLISHED SCHOLARSHIP APPEARS TO STUDENTS
    # =========================================================================
    def test_08_published_scholarship_appears_to_students(self):
        """8. Published scholarship within visibility window is returned to students."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:
            mock_sch_client = MagicMock()
            active_item = {
                **self.valid_payload,
                "id": "sch-001",
                "status": "published",
                "visible_from": (self.now - timedelta(days=1)).isoformat(),
                "visible_until": (self.now + timedelta(days=10)).isoformat(),
            }
            mock_sch_client.from_().select().eq().order().execute.return_value = MagicMock(
                data=[active_item]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 1)
            self.assertEqual(data["scholarships"][0]["id"], "sch-001")

    # =========================================================================
    # 9. DRAFT SCHOLARSHIP DOES NOT APPEAR TO STUDENTS
    # =========================================================================
    def test_09_draft_scholarship_hidden_from_students(self):
        """9. Draft scholarship is filtered out from student endpoint."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:
            mock_sch_client = MagicMock()
            draft_item = {**self.valid_payload, "id": "sch-draft", "status": "draft"}
            # Mock DB returning draft (or query filtering by published)
            mock_sch_client.from_().select().eq().order().execute.return_value = MagicMock(
                data=[draft_item]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["total"], 0)

    # =========================================================================
    # 10. ARCHIVED SCHOLARSHIP DOES NOT APPEAR TO STUDENTS
    # =========================================================================
    def test_10_archived_scholarship_hidden_from_students(self):
        """10. Archived scholarship is filtered out from student endpoint."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:
            mock_sch_client = MagicMock()
            archived_item = {**self.valid_payload, "id": "sch-archived", "status": "archived"}
            mock_sch_client.from_().select().eq().order().execute.return_value = MagicMock(
                data=[archived_item]
            )
            mock_sch_sb.return_value = mock_sch_client

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["total"], 0)

    # =========================================================================
    # 11. FUTURE VISIBLE_FROM HIDES SCHOLARSHIP
    # =========================================================================
    def test_11_future_visible_from_hides_scholarship(self):
        """11. A published scholarship with visible_from in the future is hidden."""
        future_item = {
            **self.valid_payload,
            "id": "sch-future",
            "status": "published",
            "visible_from": (self.now + timedelta(days=5)).isoformat(),
            "visible_until": (self.now + timedelta(days=15)).isoformat(),
        }
        self.assertFalse(_is_scholarship_visible_now(future_item, self.now))

    # =========================================================================
    # 12. EXPIRED VISIBLE_UNTIL HIDES SCHOLARSHIP
    # =========================================================================
    def test_12_expired_visible_until_hides_scholarship(self):
        """12. A published scholarship with visible_until in the past is hidden."""
        expired_item = {
            **self.valid_payload,
            "id": "sch-expired",
            "status": "published",
            "visible_from": (self.now - timedelta(days=10)).isoformat(),
            "visible_until": (self.now - timedelta(days=1)).isoformat(),
        }
        self.assertFalse(_is_scholarship_visible_now(expired_item, self.now))

    # =========================================================================
    # 13. APPLICATION URL VALIDATION
    # =========================================================================
    def test_13_application_url_validation(self):
        """13. Application URL must start with http:// or https://."""
        invalid_payload = {**self.valid_payload, "application_url": "javascript:alert(1)"}
        with self.assertRaises(ValueError):
            CreateScholarshipRequest(**invalid_payload)

        valid_payload = {**self.valid_payload, "application_url": "https://valid.org/apply"}
        req = CreateScholarshipRequest(**valid_payload)
        self.assertEqual(req.application_url, "https://valid.org/apply")

    # =========================================================================
    # 14. REQUIRED FIELDS VALIDATION
    # =========================================================================
    def test_14_required_fields_validation(self):
        """14. Required text fields cannot be empty or pure whitespace."""
        empty_name_payload = {**self.valid_payload, "name": "   "}
        with self.assertRaises(ValueError):
            CreateScholarshipRequest(**empty_name_payload)

        empty_provider_payload = {**self.valid_payload, "provided_by": ""}
        with self.assertRaises(ValueError):
            CreateScholarshipRequest(**empty_provider_payload)

    # =========================================================================
    # 15. DELETE SCHOLARSHIP BEHAVIOR
    # =========================================================================
    def test_15_delete_scholarship_behavior(self):
        """15. Owner can delete scholarship, non-owner is rejected."""
        # Non-owner test
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.delete(
                "/api/admin/scholarships/sch-001",
                headers={"Authorization": "Bearer mock-student-token"},
            )
            self.assertEqual(resp.status_code, 403)

        # Owner test
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            mock_sch_client.from_().delete().eq().execute.return_value = MagicMock(data=[])
            mock_sch_sb.return_value = mock_sch_client

            resp = client.delete(
                "/api/admin/scholarships/sch-001",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])

    # =========================================================================
    # 16 & 17. IMAGE UPLOAD AUTHORIZATION
    # =========================================================================
    def test_16_image_upload_authorization(self):
        """16 & 17. Student receives 403, owner can upload image."""
        # Student receives 403
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_auth_sb.return_value = mock_auth_client

            resp = client.post(
                "/api/admin/scholarships/upload-image",
                headers={"Authorization": "Bearer mock-student-token"},
                files={"file": ("test.png", b"fake image bytes", "image/png")},
            )
            self.assertEqual(resp.status_code, 403)

        # Owner upload succeeds
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            mock_storage_bucket = MagicMock()
            mock_storage_bucket.upload.return_value = MagicMock(error=None)
            mock_storage_bucket.get_public_url.return_value = "https://supabase.co/storage/v1/object/public/scholarship-banners/sch-123.png"
            mock_sch_client.storage.from_.return_value = mock_storage_bucket
            mock_sch_sb.return_value = mock_sch_client

            resp = client.post(
                "/api/admin/scholarships/upload-image",
                headers={"Authorization": "Bearer mock-owner-token"},
                files={"file": ("test.png", b"\x89PNG\r\n\x1a\n" + b"x" * 100, "image/png")},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertTrue(resp.json()["success"])
            self.assertIn("scholarship-banners", resp.json()["image_url"])

    # =========================================================================
    # 18. ADMIN OVERVIEW USES REAL COUNT
    # =========================================================================
    def test_18_admin_overview_uses_real_count(self):
        """18. /api/admin/overview reports real database scholarship count instead of hardcoded 8."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.admin.get_supabase") as mock_admin_sb, \
             patch("backend.routers.admin.get_active_scholarships_count") as mock_sch_count, \
             patch("backend.routers.admin.get_active_events_count") as mock_ev_count:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sb_inst = MagicMock()
            mock_prof_res = MagicMock()
            mock_prof_res.count = 10
            mock_prof_res.data = []
            mock_sb_inst.from_().select().execute.return_value = mock_prof_res
            mock_admin_sb.return_value = mock_sb_inst

            mock_ev_count.return_value = 5
            mock_sch_count.return_value = 3  # Distinct from old fake 8

            resp = client.get(
                "/api/admin/overview",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            stats = resp.json()["stats"]["cms_modules"]
            self.assertEqual(stats["scholarships"], 3)
            self.assertNotEqual(stats["scholarships"], 8)


if __name__ == "__main__":
    unittest.main()
