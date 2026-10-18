"""
tests/test_sys11_batch_playlist_stats.py
Automated test suite verifying SYS-11:
N+1 Playlist-Stat Requests Elimination and Batch Aggregate Optimization.

Verifies:
1. Empty playlist collection returns empty stats mapping with count 0.
2. Single playlist returns accurate statistics (total_videos, completed_videos, progress_pct, last_watched_at).
3. Multiple playlists return accurate independent statistics in a single batch.
4. Missing / unstarted playlist returns zero-progress defaults without error.
5. Deleted or unknown playlist ID returns safe zero-baseline default.
6. Backend query-count behavior: 1 vs 10 vs 50 vs 100 playlists executes strictly O(1) bounded queries.
7. Concurrent batch requests execute safely without race conditions or memory corruption.
8. Database failure handling: PostgREST error falls back gracefully without 500.
9. User isolation & anti-IDOR: User A cannot access or leak User B's progress.
10. Canonical URL normalization: Dirty URLs and clean IDs match identical batch stats.
11. Dual-persistence JSONB merge: Guest and dual-stored progress is correctly reflected in batch stats.
12. get_saved_playlists enrichment: Saved playlists endpoint automatically attaches batch stats in 1 call.
"""

import asyncio
import unittest
from unittest.mock import MagicMock, patch
from collections import defaultdict

from backend.services.learning.playlist_service import (
    get_batch_playlist_stats,
    get_batch_playlist_stats_internal,
    get_saved_playlists,
    PlaylistStatsBatchRequest,
)

USER_A = "11111111-1111-4111-8111-111111111111"
USER_B = "22222222-2222-4222-8222-222222222222"
GUEST_ID = "guest_session_test_xyz789"


class TestSYS11BatchPlaylistStats(unittest.IsolatedAsyncioTestCase):

    # ── TEST 1: Empty Playlist Collection ─────────────────────────────────────
    async def test_01_empty_playlist_collection(self):
        """Empty input collection returns empty stats mapping with zero count."""
        mock_sb = MagicMock()
        res = await get_batch_playlist_stats(playlist_ids=[], user_id=USER_A, sb=mock_sb)
        self.assertEqual(res, {"stats": {}, "count": 0, "status": "available"})
        # Should not execute any database queries for empty list
        mock_sb.table.assert_not_called()

    # ── TEST 2: Single Playlist Statistics Accuracy ───────────────────────────
    async def test_02_single_playlist_accurate_stats(self):
        """Single playlist resolves total_videos, completed_videos, and percentage accurately."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # 1. Stored video_count in saved_playlists = 10
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(
            data=[{"playlist_id": "PL_single_101", "video_count": "10"}]
        )
        # 2. Watched videos in video_progress = 4 watched
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[{"playlist_id": "PL_single_101", "video_count": "10"}]),
            MagicMock(data=[
                {"playlist_id": "PL_single_101", "video_id": "v1", "watched": True, "completed_at": "2026-10-18T12:00:00Z"},
                {"playlist_id": "PL_single_101", "video_id": "v2", "watched": True, "completed_at": "2026-10-18T13:00:00Z"},
                {"playlist_id": "PL_single_101", "video_id": "v3", "watched": True, "completed_at": "2026-10-18T14:00:00Z"},
                {"playlist_id": "PL_single_101", "video_id": "v4", "watched": True, "completed_at": "2026-10-18T15:00:00Z"},
            ])
        ]
        # 3. learning_progress empty
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_single_101"], user_id=USER_A, sb=mock_sb)
        self.assertEqual(res["count"], 1)
        stat = res["stats"]["PL_single_101"]
        self.assertEqual(stat["playlist_id"], "PL_single_101")
        self.assertEqual(stat["total_videos"], 10)
        self.assertEqual(stat["completed_videos"], 4)
        self.assertEqual(stat["progress_pct"], 40)
        self.assertEqual(stat["last_watched_at"], "2026-10-18T15:00:00Z")

    # ── TEST 3: Multiple Playlists Batch Resolution ───────────────────────────
    async def test_03_multiple_playlists_batch_resolution(self):
        """Multiple playlists resolve independent statistics simultaneously in a single batch."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # 3 playlists with 20, 10, 5 videos
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[
                {"playlist_id": "PL_course_A", "video_count": "20"},
                {"playlist_id": "PL_course_B", "video_count": "10"},
                {"playlist_id": "PL_course_C", "video_count": "5"},
            ]),
            MagicMock(data=[
                # Course A: 10 watched (50%)
                *[{"playlist_id": "PL_course_A", "video_id": f"a{i}", "watched": True, "completed_at": f"2026-10-18T10:0{i}:00Z"} for i in range(10)],
                # Course B: 10 watched (100%)
                *[{"playlist_id": "PL_course_B", "video_id": f"b{i}", "watched": True, "completed_at": f"2026-10-18T11:0{i}:00Z"} for i in range(10)],
                # Course C: 0 watched (0%)
            ])
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(
            playlist_ids=["PL_course_A", "PL_course_B", "PL_course_C"],
            user_id=USER_A,
            sb=mock_sb,
        )
        self.assertEqual(res["count"], 3)
        self.assertEqual(res["stats"]["PL_course_A"]["progress_pct"], 50)
        self.assertEqual(res["stats"]["PL_course_B"]["progress_pct"], 100)
        self.assertEqual(res["stats"]["PL_course_C"]["progress_pct"], 0)

    # ── TEST 4: Missing / Unstarted Playlist ───────────────────────────────────
    async def test_04_missing_or_unstarted_playlist(self):
        """Playlist with zero progress records returns 0% without errors or null dereferences."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[{"playlist_id": "PL_fresh_course", "video_count": "15"}]),
            MagicMock(data=[]),  # zero video progress rows
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_fresh_course"], user_id=USER_A, sb=mock_sb)
        stat = res["stats"]["PL_fresh_course"]
        self.assertEqual(stat["total_videos"], 15)
        self.assertEqual(stat["completed_videos"], 0)
        self.assertEqual(stat["progress_pct"], 0)
        self.assertIsNone(stat["last_watched_at"])

    # ── TEST 5: Unknown or Deleted Playlist ────────────────────────────────────
    async def test_05_unknown_or_deleted_playlist_returns_safe_zero_defaults(self):
        """Deleted or non-existent playlist returns safe zero-baseline default."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[]),
            MagicMock(data=[]),
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_deleted_999"], user_id=USER_A, sb=mock_sb)
        self.assertIn("PL_deleted_999", res["stats"])
        stat = res["stats"]["PL_deleted_999"]
        self.assertEqual(stat["total_videos"], 0)
        self.assertEqual(stat["completed_videos"], 0)
        self.assertEqual(stat["progress_pct"], 0)

    # ── TEST 6: O(1) Query-Count Invariant (1 vs 10 vs 50 vs 100 Playlists) ─────
    async def test_06_query_count_remains_strictly_bounded_as_playlist_count_scales(self):
        """CRITICAL: Database queries must remain O(1) bounded (<= 3 queries) whether N=1, 10, 50, or 100."""
        for n in [1, 10, 50, 100]:
            mock_sb = MagicMock()
            mock_table = MagicMock()
            mock_sb.table.return_value = mock_table

            pids = [f"PL_perf_test_{i}" for i in range(n)]

            mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
                MagicMock(data=[{"playlist_id": pid, "video_count": "10"} for pid in pids]),
                MagicMock(data=[{"playlist_id": pid, "video_id": f"v_{pid}", "watched": True} for pid in pids[: n // 2]]),
            ]
            mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[]
            )

            res = await get_batch_playlist_stats(playlist_ids=pids, user_id=USER_A, sb=mock_sb)
            self.assertEqual(res["count"], n)

            # Table calls should be at most 3: saved_playlists, video_progress, learning_progress
            table_calls = mock_sb.table.call_count
            self.assertLessEqual(
                table_calls,
                3,
                f"For N={n} playlists, query count must be <= 3 (got {table_calls}). N+1 query pattern detected!",
            )

    # ── TEST 7: Concurrent Batch Requests Race-Safety ─────────────────────────
    async def test_07_concurrent_batch_requests_race_safely(self):
        """Multiple concurrent requests for batch stats execute safely without race conditions."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.select.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(
            data=[{"playlist_id": "PL_concur_1", "video_count": "10"}]
        )
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        tasks = [
            get_batch_playlist_stats(playlist_ids=["PL_concur_1"], user_id=USER_A, sb=mock_sb)
            for _ in range(15)
        ]
        results = await asyncio.gather(*tasks)
        for r in results:
            self.assertEqual(r["count"], 1)
            self.assertIn("PL_concur_1", r["stats"])

    # ── TEST 8: Database Failure Explicit Semantics ──────────────────────────
    async def test_08_database_failure_degrades_gracefully_without_500(self):
        """Under database failures, returns explicit unavailable status without fabricating zero progress."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Simulate database timeout/error on query
        mock_table.select.side_effect = RuntimeError("PostgREST connection pool timeout")

        res = await get_batch_playlist_stats(playlist_ids=["PL_err_test"], user_id=USER_A, sb=mock_sb)
        self.assertIn("PL_err_test", res["stats"])
        stat = res["stats"]["PL_err_test"]
        self.assertEqual(stat["status"], "unavailable")
        self.assertIsNone(stat["completed_videos"])
        self.assertIsNone(stat["progress_pct"])
        self.assertEqual(res["status"], "unavailable")

    # ── TEST 9: Strict User Isolation (Anti-IDOR) ─────────────────────────────
    async def test_09_user_isolation_strictly_enforced(self):
        """User A querying playlists cannot see or leak User B's watch progress."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Capture eq calls
        eq_calls = []

        def capture_eq(*args):
            eq_calls.append(args)
            return mock_table.select.return_value

        mock_table.select.return_value.eq.side_effect = capture_eq
        mock_table.select.return_value.in_.return_value.execute.return_value = MagicMock(data=[])

        await get_batch_playlist_stats(playlist_ids=["PL_user_b_private"], user_id=USER_A, sb=mock_sb)

        # Verify that all user queries strictly filter by USER_A and NEVER USER_B
        user_id_filters = [c[1] for c in eq_calls if c and c[0] in ("user_id", "session_id")]
        self.assertTrue(all(uid == USER_A for uid in user_id_filters))
        self.assertNotIn(USER_B, user_id_filters)

    # ── TEST 10: Dirty URL and Clean ID Normalization ─────────────────────────
    async def test_10_dirty_urls_normalize_to_same_canonical_stats(self):
        """Batch stats requested with dirty URLs resolve to the canonical playlist ID and aliases."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[{"playlist_id": "PL_clean_canon_777", "video_count": "10"}]),
            MagicMock(data=[{"playlist_id": "PL_clean_canon_777", "video_id": "v1", "watched": True}]),
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        raw_url = "https://www.youtube.com/playlist?list=PL_clean_canon_777"
        res = await get_batch_playlist_stats(playlist_ids=[raw_url], user_id=USER_A, sb=mock_sb)

        # Both canonical ID and raw URL should be indexed for immediate client lookup
        self.assertIn("PL_clean_canon_777", res["stats"])
        self.assertIn(raw_url, res["stats"])
        self.assertEqual(res["stats"]["PL_clean_canon_777"]["completed_videos"], 1)
        self.assertEqual(res["stats"][raw_url]["completed_videos"], 1)

    # ── TEST 11: Dual-Persistence JSONB Synchronization ───────────────────────
    async def test_11_dual_persistence_jsonb_correctly_merged(self):
        """Guest session progress stored in JSONB completed_steps is accurately resolved in batch stats."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Relational table returns nothing (guest session has no UUID)
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(data=[])
        # JSONB table contains guest progress
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{
                "completed_steps": [
                    {
                        "id": "PL_guest_course",
                        "video_count": "8",
                        "videos": [
                            {"videoId": "gv1", "watched": True},
                            {"videoId": "gv2", "watched": True},
                            {"videoId": "gv3", "watched": False},
                        ]
                    }
                ]
            }]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_guest_course"], user_id=GUEST_ID, sb=mock_sb)
        stat = res["stats"]["PL_guest_course"]
        self.assertEqual(stat["total_videos"], 3)  # derived from video objects array
        self.assertEqual(stat["completed_videos"], 2)
        self.assertEqual(stat["progress_pct"], 67)

    # ── TEST 12: get_saved_playlists Automatic Enrichment ─────────────────────
    async def test_12_get_saved_playlists_automatically_attaches_stats(self):
        """get_saved_playlists enriches every playlist with completed_videos, total_videos, and progress_pct."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
            data=[
                {"id": 1, "playlist_id": "PL_saved_enrich_1", "title": "Track 1", "video_count": "10"},
                {"id": 2, "playlist_id": "PL_saved_enrich_2", "title": "Track 2", "video_count": "20"},
            ]
        )
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            # batch video_count lookup
            MagicMock(data=[
                {"playlist_id": "PL_saved_enrich_1", "video_count": "10"},
                {"playlist_id": "PL_saved_enrich_2", "video_count": "20"},
            ]),
            # batch watched videos lookup
            MagicMock(data=[
                {"playlist_id": "PL_saved_enrich_1", "video_id": "v1", "watched": True},
                {"playlist_id": "PL_saved_enrich_1", "video_id": "v2", "watched": True},
                {"playlist_id": "PL_saved_enrich_2", "video_id": "v3", "watched": True},
            ])
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_saved_playlists(user_id=USER_A, sb=mock_sb)
        self.assertEqual(res["count"], 2)
        pl1 = next(p for p in res["saved"] if p["id"] == "PL_saved_enrich_1")
        pl2 = next(p for p in res["saved"] if p["id"] == "PL_saved_enrich_2")

        # Stats must be pre-attached directly on the returned playlist dictionary
        self.assertEqual(pl1["completed_videos"], 2)
        self.assertEqual(pl1["total_videos"], 10)
        self.assertEqual(pl1["progress_pct"], 20)

        self.assertEqual(pl2["completed_videos"], 1)
        self.assertEqual(pl2["total_videos"], 20)
        self.assertEqual(pl2["progress_pct"], 5)

    # ── TEST 13: Partial Failure Distinguishes Partial State ──────────────────
    async def test_13_partial_database_failure_distinguished(self):
        """When total video counts succeed but video_progress fails, status is partial and stats are not fabricated."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # Query 1 (saved_playlists count) succeeds:
        # Query 2 (video_progress) throws:
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[{"playlist_id": "PL_partial_test", "video_count": "15"}]),
            RuntimeError("video_progress table timeout"),
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_partial_test"], user_id=USER_A, sb=mock_sb)
        stat = res["stats"]["PL_partial_test"]
        self.assertEqual(stat["status"], "partial")
        self.assertEqual(stat["total_videos"], 15)
        self.assertIsNone(stat["completed_videos"])
        self.assertIsNone(stat["progress_pct"])
        self.assertEqual(res["status"], "partial")

    # ── TEST 14: Genuine Zero Progress vs Missing Distinction ─────────────────
    async def test_14_genuine_zero_progress_vs_missing(self):
        """Distinguishes genuine zero progress (user has saved playlist, 0 watched) from missing/unknown playlist."""
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table

        # PL_zero is saved (10 videos), PL_missing is not saved
        mock_table.select.return_value.eq.return_value.in_.return_value.execute.side_effect = [
            MagicMock(data=[{"playlist_id": "PL_zero", "video_count": "10"}]),
            MagicMock(data=[]),  # 0 videos completed
        ]
        mock_table.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[]
        )

        res = await get_batch_playlist_stats(playlist_ids=["PL_zero", "PL_missing"], user_id=USER_A, sb=mock_sb)

        zero_stat = res["stats"]["PL_zero"]
        missing_stat = res["stats"]["PL_missing"]

        # PL_zero is genuine zero progress
        self.assertEqual(zero_stat["status"], "available")
        self.assertEqual(zero_stat["total_videos"], 10)
        self.assertEqual(zero_stat["completed_videos"], 0)
        self.assertEqual(zero_stat["progress_pct"], 0)

        # PL_missing is missing
        self.assertEqual(missing_stat["status"], "missing")
        self.assertEqual(missing_stat["total_videos"], 0)
        self.assertEqual(missing_stat["completed_videos"], 0)
        self.assertEqual(missing_stat["progress_pct"], 0)

    # ── TEST 15: Router Endpoint Raises 503 on Database Outage ────────────────
    async def test_15_router_endpoint_failure_semantics(self):
        """HTTP batch endpoint raises 503 when database failure prevents retrieving stats."""
        from fastapi import Response, HTTPException
        from backend.routers.learning import get_playlists_stats_get

        mock_response = MagicMock(spec=Response)
        mock_response.headers = {}

        with patch("backend.routers.learning.get_supabase", return_value=None):
            with self.assertRaises(HTTPException) as cm:
                await get_playlists_stats_get(
                    response=mock_response,
                    playlist_ids="PL_fail_1,PL_fail_2",
                    user_id=USER_A,
                )
            self.assertEqual(cm.exception.status_code, 503)
            self.assertIn("temporarily unavailable", cm.exception.detail)


if __name__ == "__main__":
    unittest.main()
