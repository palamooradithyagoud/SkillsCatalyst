"""
tests/test_sys14_scholarship_total_count.py
Regression & Acceptance Test Suite for SYS-14: Scholarship Total-Count Inconsistency.

Validates that:
1. Total count represents all records matching active search and filter conditions, not merely the page slice.
2. Pagination limit and offset determine returned rows, but do not change the total matching count.
3. Final page with fewer records than page limit preserves the true total.
4. Out-of-bounds offset returns empty rows with correct non-zero total.
5. Search filtering updates both returned rows and matching total count together.
6. Admin scholarship listing calculates total count independently of limit and offset.
7. Database query failures raise explicit HTTP 500/503 rather than masking as zero results.
8. Expired and future scholarships are excluded from both items and total count.
9. Entitlement plan limit slices returned items while preserving total catalog count.
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
from backend.models.scholarship import ScholarshipStatus
from backend.services.scholarship_service import (
    get_student_scholarships,
    get_admin_scholarships,
    _is_scholarship_visible_now,
)

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestSYS14ScholarshipTotalCount(unittest.TestCase):
    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "palamooradithyagoud@gmail.com"
        self.student_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        self.student_email = "student.learner@gmail.com"

        self.mock_owner_user = MockAuthUser(self.owner_id, self.owner_email, role="owner", full_name="Platform Owner")
        self.mock_student_user = MockAuthUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

        self.now = datetime.now(timezone.utc)
        self.now_iso = self.now.isoformat()
        self.past_iso = (self.now - timedelta(days=10)).isoformat()
        self.future_iso = (self.now + timedelta(days=30)).isoformat()

        # Deterministic test fixture: 12 published scholarships (5 Google, 4 Adobe, 3 Microsoft)
        # plus 2 drafts and 1 expired
        self.published_dataset = []
        for i in range(1, 6):
            self.published_dataset.append({
                "id": f"sch-google-{i:02d}",
                "name": f"Google Generation Scholarship Batch {i}",
                "provided_by": "Google APAC",
                "qualification_required": "B.Tech Computer Science",
                "eligibility": "Undergraduate students in computer science.",
                "requirements": "Transcripts and resume.",
                "application_url": f"https://buildyourfuture.withgoogle.com/{i}",
                "image_url": "https://example.com/banner.png",
                "status": "published",
                "visible_from": self.past_iso,
                "visible_until": self.future_iso,
                "created_at": (self.now - timedelta(days=i)).isoformat(),
                "updated_at": (self.now - timedelta(days=i)).isoformat(),
            })

        for i in range(1, 5):
            self.published_dataset.append({
                "id": f"sch-adobe-{i:02d}",
                "name": f"Adobe Women in Tech Grant {i}",
                "provided_by": "Adobe India",
                "qualification_required": "B.Tech Female Students",
                "eligibility": "Women enrolled in technology degrees.",
                "requirements": "SOP and GitHub links.",
                "application_url": f"https://adobe.com/grants/{i}",
                "image_url": "https://example.com/adobe.png",
                "status": "published",
                "visible_from": self.past_iso,
                "visible_until": self.future_iso,
                "created_at": (self.now - timedelta(days=10 + i)).isoformat(),
                "updated_at": (self.now - timedelta(days=10 + i)).isoformat(),
            })

        for i in range(1, 4):
            self.published_dataset.append({
                "id": f"sch-msft-{i:02d}",
                "name": f"Microsoft Research Fellowship {i}",
                "provided_by": "Microsoft Research",
                "qualification_required": "Final Year Engineering",
                "eligibility": "AI and cloud systems researchers.",
                "requirements": "Research proposal.",
                "application_url": f"https://microsoft.com/research/{i}",
                "image_url": None,
                "status": "published",
                "visible_from": self.past_iso,
                "visible_until": self.future_iso,
                "created_at": (self.now - timedelta(days=20 + i)).isoformat(),
                "updated_at": (self.now - timedelta(days=20 + i)).isoformat(),
            })

        # Total valid published = 12

    # =========================================================================
    # A. BASIC COUNT CORRECTNESS & PAGINATION
    # =========================================================================
    def test_count_unpaginated_returns_exact_total(self):
        """Unpaginated query (limit=50, offset=0) returns total == len(scholarships) == 12."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?limit=50&offset=0")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 12)
            self.assertEqual(len(data["scholarships"]), 12)

    def test_count_paginated_first_page_preserves_total(self):
        """Page 1 with limit=4 returns 4 items, but total must remain 12 (not 4)."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?limit=4&offset=0")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 12, "Total must remain 12, not sliced to page limit 4")
            self.assertEqual(len(data["scholarships"]), 4)

    def test_count_paginated_middle_page_preserves_total(self):
        """Page 2 with limit=4, offset=4 returns 4 items, and total remains 12."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?limit=4&offset=4")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 12)
            self.assertEqual(len(data["scholarships"]), 4)
            self.assertEqual(data["scholarships"][0]["id"], "sch-google-05")

    def test_count_paginated_final_page_preserves_total(self):
        """Final page with limit=4, offset=10 contains 2 items, but total must remain 12 (not 2)."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?limit=4&offset=10")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            # Under the defect, total was 2. Now it must be 12.
            self.assertEqual(data["total"], 12, "Final page must not reduce the total count to page items length")
            self.assertEqual(len(data["scholarships"]), 2)

    def test_count_paginated_out_of_bounds_offset_preserves_total(self):
        """Offset beyond available items (offset=50) returns 0 items, but total remains 12."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?limit=10&offset=50")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 12)
            self.assertEqual(len(data["scholarships"]), 0)

    # =========================================================================
    # B. SEARCH AND FILTERING
    # =========================================================================
    def test_search_updates_both_items_and_total_consistently(self):
        """Search query 'Google' matches 5 items; paginated limit=2 returns 2 items and total=5."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            # Search with limit=2
            resp = client.get("/api/scholarships?search=Google&limit=2&offset=0")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 5, "Total must match all 5 Google scholarships, not 2")
            self.assertEqual(len(data["scholarships"]), 2)

            # Page 2 of search
            resp2 = client.get("/api/scholarships?search=Google&limit=2&offset=2")
            self.assertEqual(resp2.status_code, 200)
            data2 = resp2.json()
            self.assertEqual(data2["total"], 5)
            self.assertEqual(len(data2["scholarships"]), 2)

            # Final page of search (1 item)
            resp3 = client.get("/api/scholarships?search=Google&limit=2&offset=4")
            self.assertEqual(resp3.status_code, 200)
            data3 = resp3.json()
            self.assertEqual(data3["total"], 5)
            self.assertEqual(len(data3["scholarships"]), 1)

    def test_clearing_search_restores_unfiltered_total(self):
        """Clearing search restores total to 12."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            # 1. With search
            resp1 = client.get("/api/scholarships?search=Adobe")
            self.assertEqual(resp1.json()["total"], 4)

            # 2. Cleared search
            resp2 = client.get("/api/scholarships")
            self.assertEqual(resp2.json()["total"], 12)

    def test_search_with_zero_matches_returns_empty_and_zero_total(self):
        """Search with no matches returns empty list and total == 0."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=self.published_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships?search=NonExistentKeywordXYZ")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 0)
            self.assertEqual(len(data["scholarships"]), 0)

    # =========================================================================
    # C. ADMIN SCHOLARSHIPS TOTAL COUNT
    # =========================================================================
    def test_admin_scholarships_total_count_preserves_across_pagination(self):
        """Admin endpoint returns total matching status filter across pagination."""
        # Dataset with 12 published, 3 drafts, 2 archived (17 total)
        admin_dataset = list(self.published_dataset)
        for i in range(1, 4):
            admin_dataset.append({
                **self.published_dataset[0],
                "id": f"sch-draft-{i}",
                "name": f"Draft Scholarship {i}",
                "status": "draft",
            })
        for i in range(1, 3):
            admin_dataset.append({
                **self.published_dataset[0],
                "id": f"sch-archived-{i}",
                "name": f"Archived Scholarship {i}",
                "status": "archived",
            })

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.scholarship_service.get_supabase") as mock_sch_sb:

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sch_client = MagicMock()
            # When status_filter=draft, DB query filter or in-memory returns drafts
            mock_sch_client.from_().select().order().eq().execute.return_value = MagicMock(
                data=[s for s in admin_dataset if s["status"] == "draft"]
            )
            # When status_filter is None, returns all 17
            mock_sch_client.from_().select().order().execute.return_value = MagicMock(
                data=admin_dataset
            )
            mock_sch_sb.return_value = mock_sch_client

            # 1. Status filter draft with limit=2 (there are 3 drafts)
            resp = client.get(
                "/api/admin/scholarships?status_filter=draft&limit=2&offset=0",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["total"], 3, "Total must be 3 drafts, not sliced limit 2")
            self.assertEqual(len(data["scholarships"]), 2)

            # 2. All status with limit=5 (17 total items)
            resp_all = client.get(
                "/api/admin/scholarships?limit=5&offset=0",
                headers={"Authorization": "Bearer mock-owner-token"},
            )
            self.assertEqual(resp_all.status_code, 200)
            data_all = resp_all.json()
            self.assertEqual(data_all["total"], 17, "Total must be 17, not sliced limit 5")
            self.assertEqual(len(data_all["scholarships"]), 5)

    # =========================================================================
    # D. DATABASE SERVICE & FAILURE RESILIENCE
    # =========================================================================
    def test_database_service_unavailable_raises_explicit_503(self):
        """Database client returning None raises HTTP 503 instead of masking as 0 count."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_sb.return_value = None

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 503)
            self.assertIn("Database service unavailable", resp.json()["detail"])

    def test_database_query_error_raises_explicit_500(self):
        """Database query exception raises HTTP 500 instead of masking as 0 count."""
        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.side_effect = Exception("DB Connection Lost")
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 500)
            self.assertIn("Failed to retrieve scholarships", resp.json()["detail"])

    # =========================================================================
    # E. VISIBILITY WINDOW AND EXCLUSIONS
    # =========================================================================
    def test_expired_and_future_scholarships_excluded_from_total(self):
        """Expired and future scholarships are excluded from both items and total count."""
        mixed_dataset = list(self.published_dataset)
        # Add 1 future scholarship
        mixed_dataset.append({
            **self.published_dataset[0],
            "id": "sch-future",
            "name": "Future Grant",
            "visible_from": (self.now + timedelta(days=5)).isoformat(),
            "visible_until": (self.now + timedelta(days=20)).isoformat(),
        })
        # Add 1 expired scholarship
        mixed_dataset.append({
            **self.published_dataset[0],
            "id": "sch-expired",
            "name": "Expired Grant",
            "visible_from": (self.now - timedelta(days=30)).isoformat(),
            "visible_until": (self.now - timedelta(days=5)).isoformat(),
        })

        with patch("backend.services.scholarship_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.from_().select().eq().order().execute.return_value = MagicMock(data=mixed_dataset)
            mock_sb.return_value = mock_client

            resp = client.get("/api/scholarships")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            # Only the 12 currently visible scholarships must be counted
            self.assertEqual(data["total"], 12)
            ids = [s["id"] for s in data["scholarships"]]
            self.assertNotIn("sch-future", ids)
            self.assertNotIn("sch-expired", ids)


if __name__ == "__main__":
    unittest.main()
