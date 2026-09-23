"""
tests/test_skillbits_progress.py
Comprehensive Production Test Suite for SkillsCatalyst SkillBits Video Learning Progress (Step 4).

Validates all 16 core requirements:
1.  Authenticated user can get own progress (200 OK, returns progress or clean default)
2.  Unauthenticated user cannot get progress (401 Unauthorized)
3.  Authenticated user can create progress (PATCH returns 200 OK)
4.  Repeated update does not create duplicate row (atomic upsert modifies same record)
5.  User cannot access another user's progress (strict personal isolation)
6.  Invalid watched_seconds rejected (< 0 returns 422 Unprocessable Entity)
7.  Invalid last_position rejected (< 0 or > duration + buffer returns 422 / 400 Bad Request)
8.  Completion percentage cannot exceed 100 (422 Unprocessable Entity)
9.  Completion percentage cannot be negative (422 Unprocessable Entity)
10. Draft SkillBit progress rejected (404 Not Found)
11. Archived SkillBit progress rejected (404 Not Found)
12. Completion at 90% marks completed = true
13. Completion stores completed_at timestamp
14. Completed state remains completed after subsequent updates/rewinds
15. Progress upsert works correctly and updates last_position_seconds and watched_seconds
16. Unauthenticated PATCH is rejected with 401 Unauthorized
"""

import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class MockAuthUser:
    """Simulates a Supabase Auth user object returned by sb.auth.get_user()."""
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Student User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestSkillBitsProgress(unittest.TestCase):

    def setUp(self):
        self.student_a_id = "11111111-2222-3333-4444-555555555555"
        self.student_a_email = "student_a@university.edu"
        self.student_b_id = "99999999-8888-7777-6666-555555555555"
        self.student_b_email = "student_b@university.edu"

        self.student_a_user = MockAuthUser(self.student_a_id, self.student_a_email, role="student", full_name="Student A")
        self.student_b_user = MockAuthUser(self.student_b_id, self.student_b_email, role="student", full_name="Student B")

        self.mock_skillbit_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        now_str = datetime.now(timezone.utc).isoformat()

        self.mock_published_skillbit = {
            "id": self.mock_skillbit_id,
            "title": "Async Python and FastAPI Concurrency",
            "description": "Learn event loop execution and async background workers.",
            "topic": "Python",
            "difficulty": "intermediate",
            "duration_seconds": 60,
            "thumbnail_url": "https://example.com/thumb.jpg",
            "video_provider": "mux",
            "video_asset_id": "mux_asset_python123",
            "playback_id": "mux_play_python123",
            "status": "published",
            "video_status": "READY",
            "published_at": now_str,
            "created_by": "admin-123",
            "created_at": now_str,
            "updated_at": now_str,
        }

        self.mock_draft_skillbit = {
            **self.mock_published_skillbit,
            "status": "draft",
            "published_at": None,
        }

        self.mock_archived_skillbit = {
            **self.mock_published_skillbit,
            "status": "archived",
        }

    # ── 1. Authenticated User Can Get Own Progress (Default when empty) ───────
    def test_01_authenticated_user_can_get_default_progress(self):
        """1. Authenticated user retrieves clean default progress when no record exists."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            # 1. SkillBit query returns published SkillBit
            # 2. Progress query returns empty data
            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[])
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.get(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["skillbit_id"], self.mock_skillbit_id)
            self.assertEqual(data["watched_seconds"], 0)
            self.assertEqual(data["last_position_seconds"], 0.0)
            self.assertEqual(data["completion_percentage"], 0.0)
            self.assertFalse(data["started"])
            self.assertFalse(data["completed"])
            self.assertIsNone(data["started_at"])
            self.assertIsNone(data["completed_at"])

    # ── 2. Unauthenticated User Cannot Get Progress ───────────────────────────
    def test_02_unauthenticated_user_cannot_get_progress(self):
        """2. Unauthenticated request to GET /progress returns 401 Unauthorized."""
        res = client.get(f"/api/skillbits/{self.mock_skillbit_id}/progress")
        self.assertEqual(res.status_code, 401)

    # ── 3. Authenticated User Can Create Progress ──────────────────────────────
    def test_03_authenticated_user_can_create_progress(self):
        """3. Authenticated student can submit progress via PATCH."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            now_iso = datetime.now(timezone.utc).isoformat()

            saved_row = {
                "id": "prog-uuid-1",
                "user_id": self.student_a_id,
                "skillbit_id": self.mock_skillbit_id,
                "watched_seconds": 15,
                "completion_percentage": 25.0,
                "last_position_seconds": 15.0,
                "started_at": now_iso,
                "last_watched_at": now_iso,
                "completed_at": None,
                "completed": False,
            }

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[])
                    builder.upsert().execute.return_value = MagicMock(data=[saved_row])
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 15,
                    "last_position_seconds": 15.0,
                    "completion_percentage": 25.0,
                },
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["skillbit_id"], self.mock_skillbit_id)
            self.assertEqual(data["watched_seconds"], 15)
            self.assertEqual(data["last_position_seconds"], 15.0)
            self.assertEqual(data["completion_percentage"], 25.0)
            self.assertTrue(data["started"])
            self.assertFalse(data["completed"])
            self.assertIsNotNone(data["started_at"])

    # ── 4. Repeated Update Modifies Same Row (Atomic Upsert) ───────────────────
    def test_04_repeated_update_modifies_same_row(self):
        """4. Repeated updates modify the existing record using on_conflict user_id,skillbit_id."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            now_iso = datetime.now(timezone.utc).isoformat()

            existing_row = {
                "id": "prog-uuid-1",
                "user_id": self.student_a_id,
                "skillbit_id": self.mock_skillbit_id,
                "watched_seconds": 10,
                "completion_percentage": 16.7,
                "last_position_seconds": 10.0,
                "started_at": now_iso,
                "last_watched_at": now_iso,
                "completed_at": None,
                "completed": False,
            }

            upsert_mock = MagicMock()

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[existing_row])
                    builder.upsert = upsert_mock
                    upsert_mock.return_value.execute.return_value = MagicMock(data=[{
                        **existing_row,
                        "watched_seconds": 25,
                        "last_position_seconds": 25.0,
                        "completion_percentage": 41.7,
                    }])
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 25,
                    "last_position_seconds": 25.0,
                    "completion_percentage": 41.7,
                },
            )
            self.assertEqual(res.status_code, 200)
            # Verify upsert called with on_conflict="user_id,skillbit_id"
            upsert_mock.assert_called_once()
            _, kwargs = upsert_mock.call_args
            self.assertEqual(kwargs.get("on_conflict"), "user_id,skillbit_id")

    # ── 5. User Isolation: Cannot Access Another User's Progress ──────────────
    def test_05_user_cannot_access_another_user_progress(self):
        """5. Student B's token only queries progress filtered by Student B's user_id."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_b_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            eq_mock = MagicMock()

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    # Verify user_id filter matches authenticated student B
                    builder.select().eq = eq_mock
                    eq_mock.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.get(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_token_student_b"},
            )
            self.assertEqual(res.status_code, 200)
            eq_mock.assert_called_with("user_id", self.student_b_id)

    # ── 6. Invalid watched_seconds Rejected ───────────────────────────────────
    def test_06_invalid_watched_seconds_rejected(self):
        """6. Negative watched_seconds is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": -5,
                    "last_position_seconds": 10.0,
                    "completion_percentage": 20.0,
                },
            )
            self.assertEqual(res.status_code, 422)

    # ── 7. Invalid last_position Rejected (Nonsensical vs Duration) ────────────
    def test_07_invalid_last_position_rejected(self):
        """7. Negative last_position or position exceeding duration+buffer returns 422 / 400."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            # 7a. Negative last_position -> 422
            res1 = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": -2.0,
                    "completion_percentage": 20.0,
                },
            )
            self.assertEqual(res1.status_code, 422)

            # 7b. last_position exceeds duration (60s) + 5s buffer -> 400 Bad Request
            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
            mock_svc_sb.return_value = mock_svc

            res2 = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 999.0,  # Far exceeds 60s
                    "completion_percentage": 20.0,
                },
            )
            self.assertEqual(res2.status_code, 400)
            self.assertIn("exceeds video duration", res2.json()["detail"])

    # ── 8. Completion Percentage Cannot Exceed 100 ─────────────────────────────
    def test_08_completion_percentage_cannot_exceed_100(self):
        """8. completion_percentage > 100 is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 10.0,
                    "completion_percentage": 150.0,
                },
            )
            self.assertEqual(res.status_code, 422)

    # ── 9. Completion Percentage Cannot Be Negative ────────────────────────────
    def test_09_completion_percentage_cannot_be_negative(self):
        """9. completion_percentage < 0 is rejected with 422 Unprocessable Entity."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 10.0,
                    "completion_percentage": -10.0,
                },
            )
            self.assertEqual(res.status_code, 422)

    # ── 10. Draft SkillBit Progress Rejected ──────────────────────────────────
    def test_10_draft_skillbit_progress_rejected(self):
        """10. Recording progress for draft SkillBit is rejected with 404 Not Found."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_draft_skillbit])
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 10.0,
                    "completion_percentage": 20.0,
                },
            )
            self.assertEqual(res.status_code, 404)
            self.assertIn("unpublished", res.json()["detail"].lower())

    # ── 11. Archived SkillBit Progress Rejected ────────────────────────────────
    def test_11_archived_skillbit_progress_rejected(self):
        """11. Recording progress for archived SkillBit is rejected with 404 Not Found."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            mock_svc.from_().select().eq().execute.return_value = MagicMock(data=[self.mock_archived_skillbit])
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 10.0,
                    "completion_percentage": 20.0,
                },
            )
            self.assertEqual(res.status_code, 404)
            self.assertIn("unpublished", res.json()["detail"].lower())

    # ── 12. Completion at 90% Marks Completed ─────────────────────────────────
    def test_12_completion_at_90_percent_marks_completed(self):
        """12. When completion_percentage >= 90%, backend marks completed = true."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            now_iso = datetime.now(timezone.utc).isoformat()

            completed_row = {
                "id": "prog-uuid-1",
                "user_id": self.student_a_id,
                "skillbit_id": self.mock_skillbit_id,
                "watched_seconds": 55,
                "completion_percentage": 91.7,
                "last_position_seconds": 55.0,
                "started_at": now_iso,
                "last_watched_at": now_iso,
                "completed_at": now_iso,
                "completed": True,
            }

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[])
                    builder.upsert().execute.return_value = MagicMock(data=[completed_row])
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 55,
                    "last_position_seconds": 55.0,
                    "completion_percentage": 91.7,
                },
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["completed"])
            self.assertIsNotNone(data["completed_at"])

    # ── 13. Completion Stores completed_at Timestamp ──────────────────────────
    def test_13_completion_stores_completed_at_timestamp(self):
        """13. Reaching completion sets a valid ISO completed_at timestamp."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            upsert_captured = {}

            def fake_upsert(payload, **kwargs):
                upsert_captured.update(payload)
                mock_res = MagicMock()
                mock_res.execute.return_value = MagicMock(data=[payload])
                return mock_res

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[])
                    builder.upsert = fake_upsert
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 57,
                    "last_position_seconds": 57.0,
                    "completion_percentage": 95.0,
                },
            )
            self.assertEqual(res.status_code, 200)
            self.assertTrue(upsert_captured.get("completed"))
            self.assertIsNotNone(upsert_captured.get("completed_at"))

    # ── 14. Completed State Remains Completed After Later Updates ─────────────
    def test_14_completed_state_preserved_on_rewind(self):
        """14. If a completed video is rewound or paused at 10s, completed remains true."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            original_completed_at = "2026-09-24T00:00:00+00:00"
            existing_completed_row = {
                "id": "prog-uuid-1",
                "user_id": self.student_a_id,
                "skillbit_id": self.mock_skillbit_id,
                "watched_seconds": 60,
                "completion_percentage": 100.0,
                "last_position_seconds": 60.0,
                "started_at": "2026-09-23T23:50:00+00:00",
                "last_watched_at": original_completed_at,
                "completed_at": original_completed_at,
                "completed": True,
            }

            upsert_captured = {}

            def fake_upsert(payload, **kwargs):
                upsert_captured.update(payload)
                mock_res = MagicMock()
                mock_res.execute.return_value = MagicMock(data=[payload])
                return mock_res

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[existing_completed_row])
                    builder.upsert = fake_upsert
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            # Student re-watches from beginning and pauses at 10 seconds
            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 10,
                    "last_position_seconds": 10.0,
                    "completion_percentage": 16.7,
                },
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            # Invariant: completed remains true, completed_at preserved
            self.assertTrue(data["completed"])
            self.assertEqual(data["completed_at"], original_completed_at)
            self.assertEqual(upsert_captured.get("last_position_seconds"), 10.0)

    # ── 15. Progress Upsert Works Correctly ────────────────────────────────────
    def test_15_progress_upsert_monotonic_watched_seconds(self):
        """15. Watched seconds accumulates monotonically and position updates accurately."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.services.skillbits_service.get_supabase") as mock_svc_sb:

            mock_auth = MagicMock()
            mock_auth.auth.get_user.return_value = MagicMock(user=self.student_a_user)
            mock_auth_sb.return_value = mock_auth

            mock_svc = MagicMock()
            existing_row = {
                "id": "prog-uuid-1",
                "user_id": self.student_a_id,
                "skillbit_id": self.mock_skillbit_id,
                "watched_seconds": 30,
                "completion_percentage": 50.0,
                "last_position_seconds": 30.0,
                "started_at": "2026-09-24T00:00:00+00:00",
                "last_watched_at": "2026-09-24T00:00:00+00:00",
                "completed_at": None,
                "completed": False,
            }

            upsert_captured = {}

            def fake_upsert(payload, **kwargs):
                upsert_captured.update(payload)
                mock_res = MagicMock()
                mock_res.execute.return_value = MagicMock(data=[payload])
                return mock_res

            def from_side_effect(table_name):
                builder = MagicMock()
                if table_name == "skillbits":
                    builder.select().eq().execute.return_value = MagicMock(data=[self.mock_published_skillbit])
                elif table_name == "user_skillbit_progress":
                    builder.select().eq().eq().execute.return_value = MagicMock(data=[existing_row])
                    builder.upsert = fake_upsert
                return builder

            mock_svc.from_.side_effect = from_side_effect
            mock_svc_sb.return_value = mock_svc

            # Send payload with watched_seconds = 45 and last_position = 45.0
            res = client.patch(
                f"/api/skillbits/{self.mock_skillbit_id}/progress",
                headers={"Authorization": "Bearer mock_valid_jwt_token"},
                json={
                    "watched_seconds": 45,
                    "last_position_seconds": 45.0,
                    "completion_percentage": 75.0,
                },
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(upsert_captured.get("watched_seconds"), 45)
            self.assertEqual(upsert_captured.get("last_position_seconds"), 45.0)

    # ── 16. Unauthenticated PATCH is Rejected ─────────────────────────────────
    def test_16_unauthenticated_patch_rejected(self):
        """16. PATCH request without authorization header returns 401 Unauthorized."""
        res = client.patch(
            f"/api/skillbits/{self.mock_skillbit_id}/progress",
            json={
                "watched_seconds": 15,
                "last_position_seconds": 15.0,
                "completion_percentage": 25.0,
            },
        )
        self.assertEqual(res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
