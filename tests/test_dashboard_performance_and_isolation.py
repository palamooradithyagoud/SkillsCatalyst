"""
tests/test_dashboard_performance_and_isolation.py
Comprehensive test suite for PERF-B-4:
- Parallelized database retrieval correctness
- Empty vs Populated dashboard payloads
- Tenant isolation and IDOR protection (User A cannot retrieve User B's dashboard)
- Unauthenticated / invalid auth rejection (401)
- Fault isolation: single table query exception does not crash other dashboard metrics
- Verification that dead leetcode_progress query is eliminated
- Concurrent request isolation under ThreadPoolExecutor
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_current_user_id
from backend.routers.dashboard import get_dashboard_data

client = TestClient(app)


# ── 1. Authentication & Tenant Isolation Tests ─────────────────────────────────

def test_dashboard_unauthenticated_request_rejected():
    """Verify that GET /api/dashboard without credentials strictly returns 401."""
    app.dependency_overrides.pop(get_current_user_id, None)
    resp = client.get("/api/dashboard")
    assert resp.status_code == 401
    assert "Bearer" in resp.headers.get("WWW-Authenticate", "")


def test_dashboard_invalid_auth_token_rejected():
    """Verify that GET /api/dashboard with malformed token strictly returns 401."""
    app.dependency_overrides.pop(get_current_user_id, None)
    resp = client.get("/api/dashboard", headers={"Authorization": "Bearer bad_token_123"})
    assert resp.status_code == 401


def test_dashboard_tenant_isolation_cross_user_idor():
    """
    Verify strict tenant isolation: User A receives only User A's data,
    and User B receives only User B's data with zero cross-tenant contamination.
    """
    user_a = str(uuid.uuid4())
    user_b = str(uuid.uuid4())

    mock_sb = MagicMock()

    def mock_table(table_name):
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock

        if table_name == "user_academic_profile":
            def eq_academic(col, val):
                res = MagicMock()
                if val == user_a:
                    res.execute.return_value = MagicMock(data=[{"full_name": "Alice Developer"}])
                elif val == user_b:
                    res.execute.return_value = MagicMock(data=[{"full_name": "Bob Architect"}])
                else:
                    res.execute.return_value = MagicMock(data=[])
                return res
            select_mock.eq.side_effect = eq_academic

        elif table_name == "user_progress":
            def eq_prog(col, val):
                res = MagicMock()
                if val == user_a:
                    res.execute.return_value = MagicMock(data=[{
                        "success_rate": 88.0,
                        "streak_days": 14,
                        "level": 3,
                        "total_xp": 1250,
                        "resume_readiness_score": 75
                    }])
                elif val == user_b:
                    res.execute.return_value = MagicMock(data=[{
                        "success_rate": 95.0,
                        "streak_days": 30,
                        "level": 5,
                        "total_xp": 3500,
                        "resume_readiness_score": 90
                    }])
                else:
                    res.execute.return_value = MagicMock(data=[])
                return res
            select_mock.eq.side_effect = eq_prog

        elif table_name == "saved_playlists":
            select_mock.eq.return_value.execute.return_value = MagicMock(data=[])
        elif table_name == "user_coding_profiles":
            select_mock.eq.return_value.execute.return_value = MagicMock(data=[])
        elif table_name == "resume_scores":
            select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        elif table_name == "roadmap_progress":
            select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])

        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        # Fetch as User A
        data_a = get_dashboard_data(user_id=user_a)
        assert data_a["user"]["name"] == "Alice Developer"
        assert data_a["user"]["streakDays"] == 14
        assert data_a["user"]["totalXp"] == 1250

        # Fetch as User B
        data_b = get_dashboard_data(user_id=user_b)
        assert data_b["user"]["name"] == "Bob Architect"
        assert data_b["user"]["streakDays"] == 30
        assert data_b["user"]["totalXp"] == 3500

        # Verify no leakage between User A and User B
        assert data_a["user"]["name"] != data_b["user"]["name"]


# ── 2. Empty Dashboard Payload ────────────────────────────────────────────────

def test_empty_dashboard_payload_defaults():
    """Verify that a brand new user with no database rows receives consistent 0s and defaults."""
    user_id = str(uuid.uuid4())
    mock_sb = MagicMock()

    def mock_table(table_name):
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock
        select_mock.eq.return_value.execute.return_value = MagicMock(data=[])
        select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        res = get_dashboard_data(user_id=user_id)

    # User defaults
    assert res["user"]["name"] == user_id
    assert res["user"]["streakDays"] == 0
    assert res["user"]["level"] == 0
    assert res["user"]["totalXp"] == 0

    # Metrics defaults
    pri = res["metrics"]["personalReadinessIndex"]
    assert pri["score"] == 0.0
    assert pri["learningWeightPct"] == 15
    assert pri["resumeWeightPct"] == 35
    assert pri["codingWeightPct"] == 35
    assert pri["roadmapWeightPct"] == 15

    learn = res["metrics"]["learningProgress"]
    assert learn["percentage"] == 0
    assert learn["completedVideos"] == 0
    assert learn["totalVideos"] == 0
    assert learn["subtitle"] == "0 videos completed"

    rm = res["metrics"]["roadmapProgress"]
    assert rm["has_active_roadmap"] is False
    assert rm["count"] == 0
    assert rm["percentage"] == 0
    assert rm["subtitle"] == "No active roadmap"

    resume = res["metrics"]["resumeReadiness"]
    assert resume["percentage"] == 0
    assert resume["subtitle"] == "No upload yet"


# ── 3. Populated Dashboard Payload & PRI Formula Verification ─────────────────

def test_populated_dashboard_payload_and_pri_computation():
    """
    Verify complete metrics aggregation and PRI calculation:
    PRI = round((resume_score * 0.35) + (coding_score * 0.35) + (pct * 0.15) + (roadmap_pct * 0.15), 1)
    """
    user_id = str(uuid.uuid4())
    mock_sb = MagicMock()

    def mock_table(table_name):
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock

        if table_name == "saved_playlists":
            select_mock.eq.return_value.execute.return_value = MagicMock(
                data=[{"playlist_id": "pl_1", "video_count": "10 videos"}]
            )
        elif table_name == "video_progress":
            select_mock.eq.return_value.in_.return_value.eq.return_value.execute.return_value = MagicMock(
                count=6, data=[{"video_id": f"v_{i}"} for i in range(6)]
            )
        elif table_name == "user_coding_profiles":
            select_mock.eq.return_value.execute.return_value = MagicMock(
                data=[{
                    "leetcode_url": "https://leetcode.com/elite_coder",
                    "stats_json": {
                        "leetcode": {
                            "configured": True,
                            "total_solved": 40,
                            "easy_solved": 20,
                            "medium_solved": 15,
                            "hard_solved": 5,
                            "username": "elite_coder",
                            "ranking": 45000
                        }
                    }
                }]
            )
        elif table_name == "user_academic_profile":
            select_mock.eq.return_value.execute.return_value = MagicMock(
                data=[{"full_name": "Ada Lovelace"}]
            )
        elif table_name == "user_progress":
            select_mock.eq.return_value.execute.return_value = MagicMock(
                data=[{
                    "success_rate": 85.0,
                    "streak_days": 12,
                    "level": 4,
                    "total_xp": 2100,
                    "resume_readiness_score": 70
                }]
            )
        elif table_name == "resume_scores":
            select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[{"overall_score": 80, "ats_compatibility_score": 78}]
            )
        elif table_name == "roadmap_progress":
            select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[
                    {"roadmap_id": "python-mastery", "node_id": "1. Introduction", "status": "completed", "completed_at": "2026-10-01T12:00:00Z"},
                    {"roadmap_id": "python-mastery", "node_id": "2. Strings", "status": "completed", "completed_at": "2026-10-02T12:00:00Z"},
                ]
            )

        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        res = get_dashboard_data(user_id=user_id)

    # 1. User
    assert res["user"]["name"] == "Ada Lovelace"
    assert res["user"]["streakDays"] == 12
    assert res["user"]["level"] == 4
    assert res["user"]["totalXp"] == 2100

    # 2. Learning progress: 6 / 10 = 60%
    assert res["metrics"]["learningProgress"]["completedVideos"] == 6
    assert res["metrics"]["learningProgress"]["totalVideos"] == 10
    assert res["metrics"]["learningProgress"]["percentage"] == 60
    assert res["metrics"]["learningProgress"]["subtitle"] == "6/10 videos completed"

    # 3. Resume readiness: 80
    assert res["metrics"]["resumeReadiness"]["percentage"] == 80
    assert res["metrics"]["resumeReadiness"]["subtitle"] == "ATS Score: 80/100"

    # 4. Coding progress: 40 solved -> coding_score = (40 / 50) * 100 = 80.0
    assert res["metrics"]["codingProgress"]["totalSolved"] == 40
    assert res["metrics"]["codingProgress"]["easySolved"] == 20
    assert res["metrics"]["codingProgress"]["mediumSolved"] == 15
    assert res["metrics"]["codingProgress"]["hardSolved"] == 5

    # 5. Roadmap progress: 2 / 13 nodes for python-mastery = 15%
    rm = res["metrics"]["roadmapProgress"]
    assert rm["has_active_roadmap"] is True
    assert rm["count"] == 2
    roadmap_pct = rm["percentage"]

    # 6. Expected PRI:
    # resume: 80 * 0.35 = 28.0
    # coding: 80 * 0.35 = 28.0
    # learning: 60 * 0.15 = 9.0
    # roadmap: roadmap_pct * 0.15
    expected_pri = round(28.0 + 28.0 + 9.0 + (roadmap_pct * 0.15), 1)
    assert res["metrics"]["personalReadinessIndex"]["score"] == expected_pri


# ── 4. Dead Query Elimination Verification ────────────────────────────────────

def test_dead_leetcode_progress_query_is_not_called():
    """
    Verify that leetcode_progress (which was dead/unused code) is NO LONGER queried
    by get_dashboard_data, saving a full sequential network round trip.
    """
    user_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    queried_tables = []

    def mock_table(table_name):
        queried_tables.append(table_name)
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock
        select_mock.eq.return_value.execute.return_value = MagicMock(data=[])
        select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        get_dashboard_data(user_id=user_id)

    assert "leetcode_progress" not in queried_tables, (
        f"leetcode_progress was queried! Unnecessary dead queries must be eliminated. Queried: {queried_tables}"
    )


# ── 5. Fault Isolation & Single Query Exception Resilience ────────────────────

def test_fault_isolation_single_table_failure_does_not_break_dashboard():
    """
    Verify that if a single non-critical table fails (e.g. user_academic_profile raises DB exception),
    the dashboard continues to return valid data for all other metrics without failing the request.
    """
    user_id = str(uuid.uuid4())
    mock_sb = MagicMock()

    def mock_table(table_name):
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock

        if table_name == "user_academic_profile":
            select_mock.eq.side_effect = RuntimeError("PostgREST 503 upstream connection timeout")
        elif table_name == "user_progress":
            select_mock.eq.return_value.execute.return_value = MagicMock(
                data=[{"streak_days": 7, "level": 2, "total_xp": 500}]
            )
        else:
            select_mock.eq.return_value.execute.return_value = MagicMock(data=[])
            select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
            select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])

        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        res = get_dashboard_data(user_id=user_id)

    # Name gracefully falls back to user_id
    assert res["user"]["name"] == user_id
    # Other metrics from working tables were successfully retrieved
    assert res["user"]["streakDays"] == 7
    assert res["user"]["level"] == 2
    assert res["user"]["totalXp"] == 500
    assert "metrics" in res
    assert res["metrics"]["personalReadinessIndex"]["score"] >= 0.0


# ── 6. Concurrent Request Thread Safety ───────────────────────────────────────

def test_concurrent_dashboard_requests_threadpool_isolation():
    """
    Verify that concurrent calls for multiple distinct users via ThreadPoolExecutor
    do not cross-contaminate user state or leak data.
    """
    import concurrent.futures

    users = [str(uuid.uuid4()) for _ in range(5)]
    mock_sb = MagicMock()

    def mock_table(table_name):
        table = MagicMock()
        select_mock = MagicMock()
        table.select.return_value = select_mock

        def eq_handler(col, val):
            res = MagicMock()
            if table_name == "user_academic_profile":
                res.execute.return_value = MagicMock(data=[{"full_name": f"User_{val[:8]}"}])
            elif table_name == "user_progress":
                res.execute.return_value = MagicMock(data=[{"streak_days": len(val), "level": 1, "total_xp": 100}])
            else:
                res.execute.return_value = MagicMock(data=[])
            return res

        select_mock.eq.side_effect = eq_handler
        select_mock.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        select_mock.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
        return table

    mock_sb.table.side_effect = mock_table

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            futures = {pool.submit(get_dashboard_data, uid): uid for uid in users}
            for fut in concurrent.futures.as_completed(futures):
                uid = futures[fut]
                data = fut.result()
                assert data["user"]["name"] == f"User_{uid[:8]}"
                assert data["user"]["streakDays"] == len(uid)
