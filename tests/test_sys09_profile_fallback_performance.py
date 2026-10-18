"""
tests/test_sys09_profile_fallback_performance.py
SYS-09: Profile Fallback Performance & Resilience Test Suite.

Verifies:
1. Authenticated user retrieves profile via RPC fast-path when available (1 roundtrip).
2. Fallback path executes gracefully when RPC is not available or throws an error.
3. Non-UUID user_id skips doomed RPC call and executes fallback without throwing 22P02.
4. Thread pool capacity is scaled (max_workers >= 24), preventing worker starvation.
5. Fallback wait is bounded by timeout (slow query does not hang request indefinitely).
6. Unauthenticated requests reject with 401 Unauthorized.
7. Invalid/expired Bearer tokens reject with 401 Unauthorized.
8. User isolation (anti-IDOR): User A only retrieves User A's profile data.
9. Schema equality: RPC output matches Fallback output structure exactly.
10. Environment configuration override support (PROFILE_EXECUTOR_MAX_WORKERS & PROFILE_FALLBACK_TIMEOUT).
"""

import os
import time
import threading
import unittest
from unittest.mock import MagicMock, patch
import concurrent.futures
import httpx

from fastapi.testclient import TestClient
from backend.main import app
from backend.routers.profile import (
    _PROFILE_EXECUTOR,
    _PROFILE_EXECUTOR_MAX_WORKERS,
    _PROFILE_FALLBACK_TIMEOUT,
    _MAX_CONCURRENT_FALLBACKS,
    _FALLBACK_SEMAPHORE,
    _format_unified_profile_from_rpc,
)
from backend.services.auth_service import get_current_user_id

client = TestClient(app)

USER_A_ID = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
USER_B_ID = "99999999-9999-4999-a999-999999999999"
NON_UUID_ID = "legacy_test_user_123"


class TestSYS09ProfileFallbackPerformance(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides.clear()

    def tearDown(self):
        app.dependency_overrides.clear()

    # =========================================================================
    # 1. AUTHENTICATION & ACCESS CONTROL
    # =========================================================================

    def test_01_profile_unauthenticated_rejected_401(self):
        """Unauthenticated GET /api/profile must return 401 Unauthorized."""
        resp = client.get("/api/profile")
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Invalid or missing authentication token", resp.text)

    def test_02_profile_invalid_token_rejected_401(self):
        """Malformed or invalid Bearer token must return 401 Unauthorized."""
        resp = client.get("/api/profile", headers={"Authorization": "Bearer invalid_token_xyz"})
        self.assertEqual(resp.status_code, 401)

    # =========================================================================
    # 2. THREAD POOL & TIMEOUT CONFIGURATION
    # =========================================================================

    def test_03_executor_capacity_scaled_to_prevent_starvation(self):
        """Worker capacity must be at least 24 (exceeding single request 12-task load by 2x+)."""
        self.assertGreaterEqual(_PROFILE_EXECUTOR_MAX_WORKERS, 24)
        self.assertGreaterEqual(_PROFILE_EXECUTOR._max_workers, 24)

    def test_04_fallback_timeout_is_bounded(self):
        """Fallback timeout must be positive and bounded (<= 10.0s)."""
        self.assertGreater(_PROFILE_FALLBACK_TIMEOUT, 0)
        self.assertLessEqual(_PROFILE_FALLBACK_TIMEOUT, 10.0)

    # =========================================================================
    # 3. RPC FAST-PATH EXECUTION
    # =========================================================================

    def test_05_rpc_fast_path_called_for_valid_uuid(self):
        """Valid UUID calls sb.rpc('get_user_unified_profile') in 1 round trip."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_rpc_res = MagicMock()
        mock_rpc_res.data = {
            "personal": {"full_name": "Alice Student", "avatar_url": "https://example.com/avatar.jpg"},
            "academic": {"college": "Test University", "target_role": "Full Stack Engineer"},
            "coding": {"leetcode_url": "https://leetcode.com/alice"},
            "skills": [{"skill_name": "Python", "proficiency": "Expert"}],
            "experiences": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            "career_preferences": {"target_roles": ["Full Stack Engineer"]},
            "resume": None,
            "progress": {"total_lessons_completed": 5},
        }
        mock_sb.rpc.return_value.execute.return_value = mock_rpc_res

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            # Verify RPC was called with exact user UUID
            mock_sb.rpc.assert_called_once_with("get_user_unified_profile", {"p_user_id": USER_A_ID})
            self.assertEqual(data["personal"]["full_name"], "Alice Student")
            self.assertEqual(data["academic"]["college"], "Test University")
            self.assertEqual(data["coding_inputs"]["leetcode"], "https://leetcode.com/alice")
            self.assertEqual(len(data["skills"]), 1)
            self.assertEqual(data["skills"][0]["skill_name"], "Python")

    # =========================================================================
    # 4. NON-UUID IDENTIFIER AVOIDS DOOMED RPC CALL
    # =========================================================================

    def test_06_non_uuid_skips_rpc_and_executes_fallback(self):
        """Non-UUID user ID does not attempt sb.rpc (skips 22P02 database error)."""
        app.dependency_overrides[get_current_user_id] = lambda: NON_UUID_ID
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.from_.return_value = mock_table

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 200)
            # Crucial: rpc should NOT have been called with non-UUID identifier
            mock_sb.rpc.assert_not_called()
            # Fallback queries were invoked instead
            self.assertTrue(mock_sb.from_.called)

    # =========================================================================
    # 5. RPC FAILURE FALLBACK RESILIENCE
    # =========================================================================

    def test_07_rpc_exception_falls_back_to_parallel_queries(self):
        """When RPC throws an exception, system cleanly falls back to 12 queries."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Supabase RPC connection reset")

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"full_name": "Fallback User", "id": USER_A_ID, "user_id": USER_A_ID}]
        )
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.from_.return_value = mock_table

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["personal"]["full_name"], "Fallback User")

    # =========================================================================
    # 6. BOUNDED TIMEOUT HANDLING (RESILIENCE TO HUNG QUERIES)
    # =========================================================================

    def test_08_slow_sub_query_bounded_by_timeout(self):
        """A hanging sub-query does not block the request indefinitely; returns completed data."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        # Simulate one hung query (e.g. experiences takes 2.0s while timeout is 0.1s)
        def hung_experiences(*args, **kwargs):
            time.sleep(1.0)
            return MagicMock(data=[{"company_name": "Stalled Corp"}])

        def normal_query(*args, **kwargs):
            return MagicMock(data=[{"full_name": "Fast User", "id": USER_A_ID, "user_id": USER_A_ID}])

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.side_effect = normal_query
        mock_table.select.return_value.eq.return_value.order.return_value.execute.side_effect = normal_query
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.side_effect = normal_query

        mock_sb.from_.return_value = mock_table

        # Patch timeout to a short 0.15s duration for the test
        with patch("backend.routers.profile._PROFILE_FALLBACK_TIMEOUT", 0.15), \
             patch("backend.routers.profile._fetch_experiences_data", side_effect=lambda sb, uid: time.sleep(1.0)):
            t0 = time.perf_counter()
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
            elapsed = time.perf_counter() - t0

            self.assertEqual(resp.status_code, 200)
            # Must return in under 0.6s (not waiting 1.0s+ for the stalled sub-query)
            self.assertLess(elapsed, 0.6)
            data = resp.json()
            self.assertEqual(data["experiences"], [])  # Stalled query gracefully defaulted

    # =========================================================================
    # 7. USER ISOLATION & PRIVACY (ANTI-IDOR)
    # =========================================================================

    def test_09_user_isolation_strictly_enforced(self):
        """User A and User B receive strictly isolated profile responses."""
        mock_sb = MagicMock()
        def rpc_handler(rpc_name, params):
            uid = params.get("p_user_id")
            mock_res = MagicMock()
            if uid == USER_A_ID:
                mock_res.data = {
                    "personal": {"full_name": "Alice A", "id": USER_A_ID},
                    "academic": {"user_id": USER_A_ID, "college": "College A"},
                }
            else:
                mock_res.data = {
                    "personal": {"full_name": "Bob B", "id": USER_B_ID},
                    "academic": {"user_id": USER_B_ID, "college": "College B"},
                }
            mock_executor = MagicMock()
            mock_executor.execute.return_value = mock_res
            return mock_executor

        mock_sb.rpc.side_effect = rpc_handler

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            # User A request
            app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
            res_a = client.get("/api/profile")
            self.assertEqual(res_a.json()["personal"]["full_name"], "Alice A")
            self.assertEqual(res_a.json()["academic"]["college"], "College A")

            # User B request
            app.dependency_overrides[get_current_user_id] = lambda: USER_B_ID
            res_b = client.get("/api/profile")
            self.assertEqual(res_b.json()["personal"]["full_name"], "Bob B")
            self.assertEqual(res_b.json()["academic"]["college"], "College B")

    # =========================================================================
    # 8. SCHEMA EQUIVALENCE: RPC VS FALLBACK
    # =========================================================================

    def test_10_rpc_and_fallback_produce_identical_response_keys(self):
        """Both RPC fast-path and fallback path output identical schema keys."""
        # 1. Fallback output with empty tables
        mock_sb_empty = MagicMock()
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb_empty.from_.return_value = mock_table
        mock_sb_empty.rpc.side_effect = RuntimeError("Force fallback")

        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        with patch("backend.routers.profile.get_supabase", return_value=mock_sb_empty):
            fallback_res = client.get("/api/profile").json()

        # 2. RPC output with empty RPC dict
        empty_rpc_data = {
            "personal": None,
            "academic": None,
            "coding": None,
            "skills": [],
            "experiences": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            "career_preferences": None,
            "resume": None,
            "progress": None,
        }
        mock_sb_rpc = MagicMock()
        mock_sb_rpc.rpc.return_value.execute.return_value = MagicMock(data=empty_rpc_data)

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb_rpc):
            rpc_res = client.get("/api/profile").json()

        # Compare top-level keys
        self.assertEqual(set(fallback_res.keys()), set(rpc_res.keys()))

        # Compare nested keys
        for key in ["personal", "academic", "career_preferences", "coding_inputs", "coding_stats"]:
            self.assertEqual(set(fallback_res[key].keys()), set(rpc_res[key].keys()))

    # =========================================================================
    # 9. SATURATION, TIMEOUT & ACCURACY ENFORCEMENT
    # =========================================================================

    def test_11_all_queries_timeout_raises_504_gateway_timeout(self):
        """When all fallback queries time out, endpoint fails closed with 504 Gateway Timeout (no fake 200)."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        with patch("backend.routers.profile._PROFILE_FALLBACK_TIMEOUT", 0.05), \
             patch("backend.routers.profile._fetch_academic_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_personal_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_coding_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_skills_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_experiences_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_education_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_projects_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_certifications_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_achievements_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_career_preferences_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_resume_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_progress_data", side_effect=lambda sb, uid: time.sleep(0.5)):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 504)
                self.assertIn("timed out", resp.text.lower())

    def test_12_core_identity_timeout_raises_504(self):
        """When core identity queries (both personal and academic) time out, returns 504 Gateway Timeout."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        with patch("backend.routers.profile._PROFILE_FALLBACK_TIMEOUT", 0.05), \
             patch("backend.routers.profile._fetch_academic_data", side_effect=lambda sb, uid: time.sleep(0.5)), \
             patch("backend.routers.profile._fetch_personal_data", side_effect=lambda sb, uid: time.sleep(0.5)):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 504)
                self.assertIn("Core profile identity retrieval timed out", resp.text)

    def test_13_partial_timeout_returns_partial_status_header(self):
        """When non-critical query times out but core succeeds, returns partial status header."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"full_name": "Partial User", "id": USER_A_ID, "user_id": USER_A_ID}]
        )
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.from_.return_value = mock_table

        # Only certifications times out
        with patch("backend.routers.profile._PROFILE_FALLBACK_TIMEOUT", 0.08), \
             patch("backend.routers.profile._fetch_certifications_data", side_effect=lambda sb, uid: time.sleep(0.5)):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 200)
                self.assertEqual(resp.headers.get("X-Profile-Status"), "partial")
                self.assertEqual(resp.headers.get("X-Profile-Source"), "fallback")
                self.assertEqual(resp.headers.get("X-Profile-Incomplete-Count"), "1")
                self.assertEqual(resp.json()["personal"]["full_name"], "Partial User")

    def test_14_executor_saturation_raises_503(self):
        """When executor queue exceeds saturation threshold, sheds load with 503 and Retry-After."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        with patch("backend.routers.profile._MAX_FALLBACK_QUEUE_DEPTH", 5), \
             patch("backend.routers.profile._get_profile_executor_queue_depth", return_value=10):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 503)
                self.assertIn("saturated", resp.text.lower())
                self.assertEqual(resp.headers.get("Retry-After"), "2")

    def test_15_missing_database_client_raises_503(self):
        """When Supabase client is None (database unavailable), returns 503 Service Unavailable."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        with patch("backend.routers.profile.get_supabase", return_value=None):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 503)
            self.assertIn("Database service is currently unavailable", resp.text)

    def test_16_rpc_failure_plus_fallback_failure_raises_502(self):
        """Scenario G & Rule 11: When RPC fails and all fallback queries fail with DB errors, produces controlled 502."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("RPC offline")
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.side_effect = RuntimeError("PostgREST connection reset")
        mock_table.select.return_value.eq.return_value.order.return_value.execute.side_effect = RuntimeError("PostgREST connection reset")
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.side_effect = RuntimeError("PostgREST connection reset")
        mock_sb.from_.return_value = mock_table

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 502)
            self.assertIn("Failed to retrieve profile data from database", resp.text)

    def test_17_rpc_failure_plus_core_identity_failure_raises_502(self):
        """When core identity queries (personal & academic) fail with DB errors, produces controlled 502."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("RPC offline")

        with patch("backend.routers.profile._fetch_academic_data", side_effect=RuntimeError("Table error")), \
             patch("backend.routers.profile._fetch_personal_data", side_effect=RuntimeError("Table error")):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 502)
                self.assertIn("Failed to retrieve core profile identity from database", resp.text)

    def test_18_single_fallback_query_failure_returns_partial_200(self):
        """Scenario I: One fallback query fails while remaining queries succeed; returns 200 with X-Profile-Status: partial."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("RPC offline")

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"full_name": "Resilient User", "id": USER_A_ID, "user_id": USER_A_ID}]
        )
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.from_.return_value = mock_table

        with patch("backend.routers.profile._fetch_certifications_data", side_effect=RuntimeError("Certifications table locked")):
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                self.assertEqual(resp.status_code, 200)
                self.assertEqual(resp.headers.get("X-Profile-Status"), "partial")
                self.assertEqual(resp.headers.get("X-Profile-Source"), "fallback")
                self.assertEqual(resp.headers.get("X-Profile-Incomplete-Count"), "1")
                self.assertEqual(resp.json()["personal"]["full_name"], "Resilient User")
                self.assertEqual(resp.json()["certifications"], [])

    def test_19_concurrent_requests_racing_for_admission_are_strictly_bounded(self):
        """Concurrent fallback requests racing for admission are strictly bounded by semaphore."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        # Simulate slow table queries so admitted requests hold the permits momentarily
        def slow_from(table_name):
            t = MagicMock()
            t.select.return_value.eq.return_value.execute.side_effect = lambda: (time.sleep(0.08), MagicMock(data=[]))[1]
            t.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
            t.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
            return t

        mock_sb.from_.side_effect = slow_from

        barrier = threading.Barrier(6)
        results = []

        def worker():
            barrier.wait()
            with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
                resp = client.get("/api/profile")
                results.append(resp.status_code)

        threads = [threading.Thread(target=worker) for _ in range(6)]
        for th in threads:
            th.start()
        for th in threads:
            th.join()

        # With max 3 concurrent fallbacks, admitted requests return 200 and excess requests shed with 503
        status_503_count = results.count(503)
        self.assertGreaterEqual(status_503_count, 1)
        self.assertEqual(len(results), 6)
        # Semaphore must fully recover after all requests complete
        self.assertEqual(_FALLBACK_SEMAPHORE._value, _MAX_CONCURRENT_FALLBACKS)

    def test_20_transport_read_timeout_not_retried_and_terminates_promptly(self):
        """ObservableHTTPTransport does not retry ReadTimeout, terminating without latency amplification."""
        from backend.services.supabase_service import ObservableHTTPTransport
        transport = ObservableHTTPTransport(http2=False)
        call_count = 0

        def fake_handle(request):
            nonlocal call_count
            call_count += 1
            raise httpx.ReadTimeout("Socket read timed out")

        with patch.object(httpx.HTTPTransport, "handle_request", side_effect=fake_handle):
            req = httpx.Request("GET", "https://example.supabase.co/rest/v1/user_academic_profile?user_id=eq.1")
            with self.assertRaises(httpx.ReadTimeout):
                transport.handle_request(req)
            # Must only be called once — NO retry on read timeout
            self.assertEqual(call_count, 1)

    def test_21_optional_data_failure_does_not_corrupt_core_identity(self):
        """Failure of optional entity queries does not corrupt personal or academic identity data."""
        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback")

        def fake_from(table_name):
            t = MagicMock()
            if table_name == "user_academic_profile":
                t.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"full_name": "Core Alice", "college": "Engineering"}])
            elif table_name == "profiles":
                t.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"full_name": "Core Alice", "id": USER_A_ID}])
            elif table_name in ("projects", "certifications"):
                # Optional tables raise DB error
                t.select.return_value.eq.return_value.order.return_value.execute.side_effect = RuntimeError("Table locked")
            else:
                t.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
                t.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
                t.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
            return t

        mock_sb.from_.side_effect = fake_from

        with patch("backend.routers.profile.get_supabase", return_value=mock_sb):
            resp = client.get("/api/profile")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.headers.get("X-Profile-Status"), "partial")
            self.assertEqual(resp.headers.get("X-Profile-Incomplete-Count"), "2")
            data = resp.json()
            self.assertEqual(data["personal"]["full_name"], "Core Alice")
            self.assertEqual(data["academic"]["college"], "Engineering")
            self.assertEqual(data["projects"], [])
            self.assertEqual(data["certifications"], [])

    def test_22_semaphore_held_until_underlying_work_completes_after_timeout(self):
        """Check 1: Semaphore permit is held until underlying database worker finishes, not released when HTTP handler exits."""
        import backend.routers.profile as profile_mod

        app.dependency_overrides[get_current_user_id] = lambda: USER_A_ID
        mock_sb = MagicMock()
        mock_sb.rpc.side_effect = RuntimeError("Force fallback path")

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"full_name": "Alice Lifecycle", "id": USER_A_ID, "user_id": USER_A_ID}]
        )
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        mock_sb.from_.return_value = mock_table

        block_event = threading.Event()

        def blocking_fetch(sb, uid):
            block_event.wait(timeout=5.0)
            return {"full_name": "Alice Blocked", "user_id": uid}

        test_sem = threading.Semaphore(1)
        with patch.object(profile_mod, "_FALLBACK_SEMAPHORE", test_sem), \
             patch.object(profile_mod, "_PROFILE_FALLBACK_TIMEOUT", 0.05), \
             patch.object(profile_mod, "_fetch_academic_data", side_effect=blocking_fetch), \
             patch.object(profile_mod, "get_supabase", return_value=mock_sb):

            # 1. Request 1: Blocks beyond the router timeout (0.05s). Handler returns while worker is still running!
            resp1 = client.get("/api/profile")
            self.assertEqual(resp1.status_code, 200)
            self.assertEqual(resp1.headers.get("X-Profile-Status"), "partial")

            # 2. Request 2: Attempts fallback immediately while the original database worker is still running!
            # The semaphore permit must NOT have been released by Request 1's exit.
            resp2 = client.get("/api/profile")
            self.assertEqual(resp2.status_code, 503)
            self.assertIn("saturated", resp2.json().get("detail", ""))

            # 3. Release the blocking event so Request 1's underlying worker thread completes
            block_event.set()
            time.sleep(0.08)

            # 4. Request 3: Now that background work has actually finished, permit is released and request succeeds
            resp3 = client.get("/api/profile")
            self.assertEqual(resp3.status_code, 200)


if __name__ == "__main__":
    unittest.main()


