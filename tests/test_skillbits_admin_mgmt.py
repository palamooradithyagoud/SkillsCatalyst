"""
tests/test_skillbits_admin_mgmt.py
Production Test Suite for SkillsCatalyst SkillBits Phase 5:
SkillBits Operational Management, Filtering, Sorting, and Student Discovery.

Validates:
1.  Admin sorting by newest (created_at DESC)
2.  Admin sorting by oldest (created_at ASC)
3.  Admin sorting by title_asc
4.  Admin sorting by title_desc
5.  Admin sorting by duration_desc
6.  Admin sorting by duration_asc
7.  Admin sorting whitelist rejects unauthorized sort strings (422 Unprocessable Entity)
8.  Admin filtering by status (draft, published, archived)
9.  Admin filtering by topic
10. Admin filtering by difficulty
11. Admin filtering by title keyword search
12. Admin server-side pagination with exact total count and total_pages
13. Admin unpublish transitions published SkillBit to draft
14. Admin unpublish requires admin privileges (401/403)
15. Admin restore transitions archived SkillBit back to draft
16. Admin restore requires admin privileges (401/403)
17. Publish strictly rejected (400 Bad Request) for non-ready states (NOT_UPLOADED, UPLOADING, PROCESSING, ERROR)
18. Publish succeeds when video_status is READY with playback_id
19. Student feed filters by topic and difficulty, returning only published items with playback_id
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch
import unittest

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import require_admin

client = TestClient(app)


class TestSkillBitsAdminManagement(unittest.TestCase):

    def setUp(self):
        self.admin_id = "22222222-3333-4444-5555-666666666666"
        self.admin_email = "admin@skillscatalyst.com"
        self.student_id = "11111111-2222-3333-4444-555555555555"
        self.student_email = "student@university.edu"

        self.mock_skillbit_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"

        self.base_record = {
            "id": self.mock_skillbit_id,
            "title": "Master React Hooks in 60s",
            "description": "Short micro-lesson on React useEffect and memoization.",
            "topic": "React",
            "difficulty": "intermediate",
            "duration_seconds": 60,
            "thumbnail_url": "https://image.mux.com/test_playback_id/thumbnail.jpg",
            "video_provider": "mux",
            "video_asset_id": "asset_12345",
            "playback_id": "test_playback_id",
            "status": "published",
            "video_status": "READY",
            "mux_upload_id": "upload_123",
            "created_by": self.admin_id,
            "created_at": "2026-09-24T00:00:00Z",
            "updated_at": "2026-09-24T00:00:00Z",
            "published_at": "2026-09-24T00:00:00Z",
        }

        # Override admin authentication dependency for admin endpoints
        app.dependency_overrides[require_admin] = lambda: {
            "user_id": self.admin_id,
            "email": self.admin_email,
            "role": "admin",
        }

    def tearDown(self):
        app.dependency_overrides.clear()

    def _setup_admin_mocks(self, mock_sb, data_rows=None, total_count=1):
        if data_rows is None:
            data_rows = [self.base_record]

        count_query = MagicMock()
        count_query.eq.return_value = count_query
        count_query.ilike.return_value = count_query
        count_query.execute.return_value = MagicMock(count=total_count, data=[{"id": self.mock_skillbit_id}])

        data_query = MagicMock()
        data_query.eq.return_value = data_query
        data_query.ilike.return_value = data_query
        data_query.range.return_value = data_query
        data_query.execute.return_value = MagicMock(data=data_rows)

        select_mock = MagicMock()
        select_mock.order.return_value = data_query

        skillbits_tbl = MagicMock()
        skillbits_tbl.select.side_effect = [count_query, select_mock]

        skills_tbl = MagicMock()
        skills_tbl.select.return_value.in_.return_value.execute.return_value = MagicMock(data=[])

        def mock_from(table):
            if table == "skillbits":
                return skillbits_tbl
            if table == "skillbit_skills":
                return skills_tbl
            return MagicMock()

        mock_sb.from_.side_effect = mock_from
        return select_mock, data_query

    # ── SORTING TESTS ──────────────────────────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_newest(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=newest")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("created_at", desc=True)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_oldest(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=oldest")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("created_at", desc=False)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_title_asc(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=title_asc")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("title", desc=False)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_title_desc(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=title_desc")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("title", desc=True)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_duration_desc(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=duration_desc")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("duration_seconds", desc=True)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_duration_asc(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        select_mock, _ = self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?sort=duration_asc")
        self.assertEqual(response.status_code, 200)
        select_mock.order.assert_called_with("duration_seconds", desc=False)

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_sort_invalid_rejected_422(self, mock_get_sb):
        """Ensures SQL injection / arbitrary columns in sort parameter are strictly blocked with 422."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        response = client.get("/api/admin/skillbits?sort=drop_table_users;--")
        self.assertEqual(response.status_code, 422)
        self.assertIn("Invalid sort option", response.json()["detail"])

    # ── FILTERING & SEARCH TESTS ───────────────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_filter_by_topic_and_difficulty(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?topic=React&difficulty=intermediate")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 1)
        self.assertEqual(len(data["items"]), 1)
        self.assertEqual(data["items"][0]["topic"], "React")

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_filter_by_status(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        self._setup_admin_mocks(mock_sb, data_rows=[{**self.base_record, "status": "draft"}])

        response = client.get("/api/admin/skillbits?status=draft")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["items"][0]["status"], "draft")

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_filter_by_search(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        self._setup_admin_mocks(mock_sb)

        response = client.get("/api/admin/skillbits?search=Hooks")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["items"]), 1)

    # ── PAGINATION TESTS ───────────────────────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_pagination_page_and_page_size(self, mock_get_sb):
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        _, data_query = self._setup_admin_mocks(mock_sb, total_count=45)

        response = client.get("/api/admin/skillbits?page=2&page_size=20")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 45)
        self.assertEqual(data["page"], 2)
        self.assertEqual(data["page_size"], 20)
        self.assertEqual(data["total_pages"], 3)
        data_query.range.assert_called_with(20, 39)

    # ── UNPUBLISH & RESTORE LIFECYCLE ──────────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_unpublish_skillbit_success(self, mock_get_sb):
        """Unpublishing transitions published SkillBit to draft."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        mock_sb.from_("skillbits").select().eq().execute.return_value = MagicMock(data=[self.base_record])

        unpublished_record = {**self.base_record, "status": "draft"}
        mock_sb.from_("skillbits").update().eq().execute.return_value = MagicMock(data=[unpublished_record])
        mock_sb.from_("skillbit_skills").select().in_().execute.return_value = MagicMock(data=[])

        response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/unpublish")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "draft")

    def test_admin_unpublish_requires_admin(self):
        """Non-admin / anonymous requests cannot unpublish."""
        app.dependency_overrides.clear()
        response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/unpublish")
        self.assertIn(response.status_code, [401, 403])

    @patch("backend.services.skillbits_service.get_supabase")
    def test_admin_restore_skillbit_success(self, mock_get_sb):
        """Restoring transitions archived SkillBit to draft."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        archived_record = {**self.base_record, "status": "archived"}
        mock_sb.from_("skillbits").select().eq().execute.return_value = MagicMock(data=[archived_record])

        restored_record = {**self.base_record, "status": "draft"}
        mock_sb.from_("skillbits").update().eq().execute.return_value = MagicMock(data=[restored_record])
        mock_sb.from_("skillbit_skills").select().in_().execute.return_value = MagicMock(data=[])

        response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/restore")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "draft")

    def test_admin_restore_requires_admin(self):
        """Non-admin / anonymous requests cannot restore."""
        app.dependency_overrides.clear()
        response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/restore")
        self.assertIn(response.status_code, [401, 403])

    # ── PUBLISH READINESS VALIDATION TESTS ─────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_publish_blocked_when_not_ready(self, mock_get_sb):
        """
        Enforces that videos in NOT_UPLOADED, UPLOADING, PROCESSING, and ERROR
        are rejected with 400 Bad Request and descriptive feedback.
        """
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        non_ready_statuses = ["NOT_UPLOADED", "UPLOADING", "PROCESSING", "ERROR"]

        for non_ready in non_ready_statuses:
            unready_record = {**self.base_record, "status": "draft", "video_status": non_ready}
            mock_sb.from_("skillbits").select().eq().execute.return_value = MagicMock(data=[unready_record])

            response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/publish")
            self.assertEqual(
                response.status_code,
                400,
                f"Expected 400 when publishing SkillBit with video_status={non_ready}",
            )
            self.assertIn("video is currently in", response.json()["detail"])
            self.assertIn("READY", response.json()["detail"])

    @patch("backend.services.skillbits_service.get_supabase")
    def test_publish_succeeds_when_ready(self, mock_get_sb):
        """SkillBit in READY status with playback_id publishes cleanly."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        draft_ready_record = {**self.base_record, "status": "draft", "video_status": "READY"}
        mock_sb.from_("skillbits").select().eq().execute.return_value = MagicMock(data=[draft_ready_record])

        published_record = {**self.base_record, "status": "published", "video_status": "READY"}
        mock_sb.from_("skillbits").update().eq().execute.return_value = MagicMock(data=[published_record])
        mock_sb.from_("skillbit_skills").select().in_().execute.return_value = MagicMock(data=[])

        response = client.post(f"/api/admin/skillbits/{self.mock_skillbit_id}/publish")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "published")

    # ── STUDENT FEED FILTERING & DISCOVERY ─────────────────────────────────────

    @patch("backend.services.skillbits_service.get_supabase")
    def test_student_feed_filtered_and_only_ready_playable(self, mock_get_sb):
        """Student feed respects topic & difficulty and excludes non-playable items."""
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        feed_rows = [
            self.base_record,
            {**self.base_record, "id": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff", "playback_id": None},  # Not playable
        ]

        query_mock = MagicMock()
        query_mock.eq.return_value = query_mock
        query_mock.order.return_value = query_mock
        query_mock.range.return_value = query_mock
        query_mock.execute.return_value = MagicMock(data=feed_rows)

        mock_sb.from_("skillbits").select.return_value = query_mock
        mock_sb.from_("skillbit_skills").select().in_().execute.return_value = MagicMock(data=[])

        response = client.get("/api/skillbits?topic=React&difficulty=intermediate")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 1)  # Excludes the item missing playback_id
        self.assertEqual(len(data["items"]), 1)
        self.assertEqual(data["items"][0]["id"], self.mock_skillbit_id)


if __name__ == "__main__":
    unittest.main()
