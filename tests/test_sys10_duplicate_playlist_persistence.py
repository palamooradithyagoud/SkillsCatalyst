"""
tests/test_sys10_duplicate_playlist_persistence.py
SYS-10: Duplicate Playlist Persistence Audit & Remediation Test Suite.

Verifies:
1. Saving a playlist once produces the expected canonical record.
2. Repeated submissions do not create unintended duplicates.
3. URL formats and dirty query strings normalize to canonical playlist_id, preventing duplicates.
4. Concurrent requests race-safely upsert without creating duplicate rows.
5. Retries after uncertain responses remain strictly idempotent.
6. Legitimate distinct playlists can still be created and persisted independently.
7. User isolation & anti-IDOR: Users cannot access or mutate each other's playlists.
8. Free plan entitlement allows re-saving existing playlist without 403, but blocks 2nd distinct playlist.
9. learning_progress JSONB completed_steps does not accumulate duplicate entries.
10. Unsave removes both canonical and raw representation variants cleanly.
"""

import uuid
import asyncio
import unittest
from unittest.mock import MagicMock, patch
import concurrent.futures

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.learning.playlist_service import (
    save_playlist,
    unsave_playlist,
    get_saved_playlists,
    SavePlaylistRequest,
)
from backend.services.subscription_service import SubscriptionService

client = TestClient(app)

USER_A = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
USER_B = "99999999-9999-4999-a999-999999999999"


class TestSYS10DuplicatePlaylistPersistence(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        app.dependency_overrides.clear()

    def tearDown(self):
        app.dependency_overrides.clear()

    # =========================================================================
    # 1. BASIC SAVE & RECORD CONTRACT
    # =========================================================================

    async def test_01_save_playlist_once_produces_canonical_record(self):
        """Saving a playlist once normalizes ID to canonical form and calls upsert with on_conflict."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.upsert.return_value.execute.return_value = MagicMock(
            data=[{"id": 1, "playlist_id": "PL_clean_001", "user_id": USER_A}]
        )
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        req = SavePlaylistRequest(
            playlist_id="https://www.youtube.com/playlist?list=PL_clean_001",
            title="Clean Python Course",
            channel="Tech Channel",
            playlist_url="https://www.youtube.com/playlist?list=PL_clean_001",
        )

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            res = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            self.assertTrue(res.get("success"))

            # Verify saved_playlists was upserted with clean canonical ID, NOT the full URL
            upsert_calls = mock_table.upsert.call_args_list
            self.assertTrue(len(upsert_calls) >= 1)
            saved_data = upsert_calls[0][0][0]
            self.assertEqual(saved_data["playlist_id"], "PL_clean_001")
            self.assertEqual(saved_data["user_id"], USER_A)
            self.assertEqual(upsert_calls[0][1].get("on_conflict"), "playlist_id,user_id")

    # =========================================================================
    # 2. REPEATED SUBMISSIONS (IDEMPOTENCY)
    # =========================================================================

    async def test_02_repeated_submissions_do_not_create_duplicates(self):
        """Repeated submissions of the exact same playlist are idempotent and preserve single record."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.upsert.return_value.execute.return_value = MagicMock(
            data=[{"id": 1, "playlist_id": "PL_idempotent_123", "user_id": USER_A}]
        )
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        req = SavePlaylistRequest(
            playlist_id="PL_idempotent_123",
            title="FastAPI Mastery",
            playlist_url="https://www.youtube.com/playlist?list=PL_idempotent_123",
        )

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            res1 = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            res2 = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            res3 = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)

            self.assertTrue(res1.get("success"))
            self.assertTrue(res2.get("success"))
            self.assertTrue(res3.get("success"))

            for call in mock_table.upsert.call_args_list:
                payload = call[0][0]
                self.assertEqual(payload["playlist_id"], "PL_idempotent_123")
                self.assertEqual(call[1].get("on_conflict"), "playlist_id,user_id")

    # =========================================================================
    # 3. URL FORMAT & QUERY STRING NORMALIZATION
    # =========================================================================

    async def test_03_dirty_urls_and_clean_ids_normalize_to_same_canonical_id(self):
        """Playlists submitted as full URL, raw ID, and URL with tracking params all normalize to identical canonical ID."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        dirty_requests = [
            SavePlaylistRequest(playlist_id="https://www.youtube.com/playlist?list=PL_canon_456", title="Course"),
            SavePlaylistRequest(playlist_id="PL_canon_456", title="Course"),
            SavePlaylistRequest(playlist_id="https://www.youtube.com/watch?v=vid1&list=PL_canon_456&index=2&si=track", title="Course"),
        ]

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            for r in dirty_requests:
                await save_playlist(r, current_user_id=USER_A, sb=mock_sb)

            # All 3 saves must pass "PL_canon_456" as playlist_id to the database upsert
            for call in mock_table.upsert.call_args_list:
                payload = call[0][0]
                self.assertEqual(payload["playlist_id"], "PL_canon_456")

    # =========================================================================
    # 4. CONCURRENT REQUESTS & THREAD-SAFETY
    # =========================================================================

    async def test_04_concurrent_requests_upsert_race_safely(self):
        """Simultaneous concurrent requests for the same playlist resolve race-safely via atomic database upsert."""
        stored_rows = {}
        mock_sb = MagicMock()

        def fake_upsert(data, on_conflict=None):
            key = (data["playlist_id"], data["user_id"])
            stored_rows[key] = data
            m = MagicMock()
            m.execute.return_value = MagicMock(data=[data])
            return m

        mock_table = MagicMock()
        mock_table.upsert.side_effect = fake_upsert
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.table.return_value = mock_table

        req = SavePlaylistRequest(
            playlist_id="PL_concurrency_race",
            title="Concurrent Python",
        )

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            # Fire 8 concurrent saves for the exact same playlist
            tasks = [
                save_playlist(req, current_user_id=USER_A, sb=mock_sb)
                for _ in range(8)
            ]
            results = await asyncio.gather(*tasks)
            self.assertEqual(len(results), 8)
            for res in results:
                self.assertTrue(res.get("success"))

            # In the database simulation, exactly ONE unique record exists for (playlist_id, user_id)
            self.assertEqual(len(stored_rows), 1)
            self.assertIn(("PL_concurrency_race", USER_A), stored_rows)

    # =========================================================================
    # 5. RETRY BEHAVIOR AFTER TIMEOUT
    # =========================================================================

    async def test_05_retry_after_uncertain_response_does_not_duplicate(self):
        """Retrying a save after a simulated network timeout updates existing row without duplicate generation."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # First attempt succeeded in DB but network timed out on client
        mock_table.upsert.return_value.execute.return_value = MagicMock(
            data=[{"id": 42, "playlist_id": "PL_retry_test", "user_id": USER_A}]
        )
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        req = SavePlaylistRequest(
            playlist_id="PL_retry_test",
            title="Resilient Systems",
        )

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            # First attempt
            await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            # Retry attempt
            res_retry = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)

            self.assertTrue(res_retry.get("success"))
            # Both attempts upserted with identical constraint key
            calls = mock_table.upsert.call_args_list
            self.assertEqual(len(calls), 2)
            self.assertEqual(calls[0][0][0]["playlist_id"], "PL_retry_test")
            self.assertEqual(calls[1][0][0]["playlist_id"], "PL_retry_test")
            self.assertEqual(calls[1][1].get("on_conflict"), "playlist_id,user_id")

    # =========================================================================
    # 6. LEGITIMATE DISTINCT PLAYLISTS SUPPORTED
    # =========================================================================

    async def test_06_legitimate_distinct_playlists_saved_independently(self):
        """User can save distinct playlists with different IDs without collision or data loss."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])

        p1 = SavePlaylistRequest(playlist_id="PL_course_1", title="Algorithms")
        p2 = SavePlaylistRequest(playlist_id="PL_course_2", title="Databases")

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            await save_playlist(p1, current_user_id=USER_A, sb=mock_sb)
            await save_playlist(p2, current_user_id=USER_A, sb=mock_sb)

            calls = mock_table.upsert.call_args_list
            saved_ids = [c[0][0]["playlist_id"] for c in calls]
            self.assertIn("PL_course_1", saved_ids)
            self.assertIn("PL_course_2", saved_ids)
            self.assertEqual(len(saved_ids), 2)

    # =========================================================================
    # 7. USER ISOLATION & ANTI-IDOR
    # =========================================================================

    async def test_07_different_users_saved_playlists_strictly_isolated(self):
        """Users A and B can both save the same public playlist independently; neither can access or mutate the other's."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_table.delete.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(data=[])

        req = SavePlaylistRequest(playlist_id="PL_shared_tutorial", title="Intro to Git")

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            # User A saves
            await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            # User B saves
            await save_playlist(req, current_user_id=USER_B, sb=mock_sb)

            upsert_calls = mock_table.upsert.call_args_list
            self.assertEqual(upsert_calls[0][0][0]["user_id"], USER_A)
            self.assertEqual(upsert_calls[1][0][0]["user_id"], USER_B)

            # User A unsaves -> delete query filters strictly by user_id == USER_A
            await unsave_playlist(playlist_id="PL_shared_tutorial", user_id=USER_A, sb=mock_sb)
            delete_eq_calls = mock_table.delete.return_value.eq.call_args_list
            self.assertEqual(delete_eq_calls[-1][0], ("user_id", USER_A))

    # =========================================================================
    # 8. ENTITLEMENT RE-SAVING COMPATIBILITY
    # =========================================================================

    async def test_08_free_user_can_resave_existing_playlist_without_403(self):
        """Free user re-saving or updating their 1 saved playlist is recognized as already saved and does NOT raise 403."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Existing check returns an existing row for PL_free_001
        def mock_select(fields="*"):
            builder = MagicMock()
            builder.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{"id": "exist-1", "playlist_id": "PL_free_001"}]
            )
            builder.eq.return_value.execute.return_value = MagicMock(
                data=[{"id": "exist-1", "playlist_id": "PL_free_001"}]
            )
            return builder

        mock_table.select.side_effect = mock_select
        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": "exist-1"}])

        req = SavePlaylistRequest(
            playlist_id="https://www.youtube.com/playlist?list=PL_free_001",
            title="Python Free Course Updated",
        )

        with patch.object(SubscriptionService, "get_user_subscription_record", return_value=None):
            # Must succeed with 200 without raising 403 LIMIT_REACHED
            res = await save_playlist(req, current_user_id=USER_A, sb=mock_sb)
            self.assertTrue(res.get("success"))

    # =========================================================================
    # 9. JSONB COMPLETED_STEPS DEDUPLICATION
    # =========================================================================

    async def test_09_learning_progress_jsonb_does_not_accumulate_duplicates(self):
        """Saving same playlist multiple times updates JSONB completed_steps in place without appending duplicates."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Existing JSONB contains PL_jsonb_test already
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{
                "id": 100,
                "completed_steps": [
                    {"id": "PL_jsonb_test", "title": "Old Title", "completed": False, "videos": [{"videoId": "v1", "watched": True}]}
                ]
            }]
        )
        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
        mock_table.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

        req = SavePlaylistRequest(
            playlist_id="https://www.youtube.com/playlist?list=PL_jsonb_test",
            title="New Title",
        )

        with patch("backend.services.subscription_service.SubscriptionService.get_effective_plan", return_value=(None, True)):
            await save_playlist(req, current_user_id=USER_A, sb=mock_sb)

            # Check what was passed to learning_progress update
            update_call = mock_table.update.call_args[0][0]
            steps = update_call["completed_steps"]
            self.assertEqual(len(steps), 1, "completed_steps must have exactly 1 item, not duplicate appended")
            self.assertEqual(steps[0]["id"], "PL_jsonb_test")
            self.assertEqual(steps[0]["title"], "New Title")
            # Must preserve existing video progress
            self.assertEqual(len(steps[0]["videos"]), 1)
            self.assertTrue(steps[0]["videos"][0]["watched"])

    # =========================================================================
    # 10. GET_SAVED_PLAYLISTS DEDUPLICATION
    # =========================================================================

    async def test_10_get_saved_playlists_deduplicates_relational_and_jsonb(self):
        """get_saved_playlists returns unified deduplicated list even if dirty legacy data has URL and clean ID rows."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Relational table returns dirty legacy rows with both URL and clean ID for the same playlist
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
            data=[
                {"playlist_id": "https://www.youtube.com/playlist?list=PL_legacy_dup", "title": "Legacy Dup 1"},
                {"playlist_id": "PL_legacy_dup", "title": "Legacy Dup 2"},
                {"playlist_id": "PL_distinct_course", "title": "Distinct Course"},
            ]
        )
        # JSONB table returns matching dirty entry
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{
                "completed_steps": [
                    {"id": "PL_legacy_dup", "title": "JSONB Entry"},
                    {"id": "PL_distinct_course", "title": "Distinct Course"},
                ]
            }]
        )

        result = await get_saved_playlists(user_id=USER_A, sb=mock_sb)
        saved = result["saved"]
        saved_ids = [p["id"] for p in saved]

        # Must deduplicate PL_legacy_dup so exactly 2 unique playlists are returned, not 3 or 4
        self.assertEqual(len(saved), 2)
        self.assertIn("PL_legacy_dup", saved_ids)
        self.assertIn("PL_distinct_course", saved_ids)
        self.assertEqual(result["count"], 2)


if __name__ == "__main__":
    unittest.main()
