"""
tests/test_student_progress_api.py
Comprehensive unit & integration tests for Student Course Progress & Resume API (Phase 5).
Tests:
- Guest unauthenticated access rejection (401)
- Authenticated retrieval of student course progress
- Hierarchy validation & draft course isolation (404)
- Deterministic lesson completion & idempotent updates
- Resume pointer tracking and fallback
- Module lesson completion calculation without premature full module completion
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_current_user_id
from backend.models.course import CourseStatus


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def student_auth_override():
    test_user_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: test_user_id
    yield test_user_id
    app.dependency_overrides.pop(get_current_user_id, None)


def test_progress_unauthenticated_guest_rejected(client):
    """Verifies unauthenticated guest requests to progress endpoints return 401 Unauthorized."""
    course_id = str(uuid.uuid4())
    lesson_id = str(uuid.uuid4())

    # GET progress without auth
    res_get = client.get(f"/api/courses/{course_id}/progress")
    assert res_get.status_code == 401
    assert "Invalid or missing" in res_get.json()["detail"] or "Not authenticated" in res_get.json()["detail"]

    # POST progress without auth
    res_post = client.post(
        f"/api/courses/{course_id}/lessons/{lesson_id}/progress",
        json={"completed": True}
    )
    assert res_post.status_code == 401


def test_get_course_progress_draft_course_returns_404(client, student_auth_override):
    """Verifies that attempting to fetch progress for a DRAFT course returns 404."""
    course_id = str(uuid.uuid4())

    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_sb.from_.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    # Return DRAFT status
    mock_query.execute.return_value = MagicMock(
        data=[{"id": course_id, "title": "Draft Course", "status": CourseStatus.DRAFT.value}]
    )

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        res = client.get(f"/api/courses/{course_id}/progress")
        assert res.status_code == 404
        assert "not found or unavailable" in res.json()["detail"].lower()


def test_record_lesson_progress_wrong_hierarchy_returns_404(client, student_auth_override):
    """Verifies that submitting progress for a lesson that belongs to another course returns 404."""
    course_id = str(uuid.uuid4())
    other_course_id = str(uuid.uuid4())
    lesson_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())

    mock_sb = MagicMock()

    # Dispatcher based on table
    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Course A", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_lessons":
            q.execute.return_value = MagicMock(
                data=[{"id": lesson_id, "module_id": module_id}]
            )
        elif table_name == "course_modules":
            # Module points to other_course_id, not course_id!
            q.execute.return_value = MagicMock(
                data=[{"id": module_id, "course_id": other_course_id}]
            )
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        res = client.post(
            f"/api/courses/{course_id}/lessons/{lesson_id}/progress",
            json={"completed": True}
        )
        assert res.status_code == 404
        assert "does not belong" in res.json()["detail"].lower()


def test_get_course_progress_calculation(client, student_auth_override):
    """Verifies authoritative calculation of completed lessons, progress percentage, and module summaries."""
    course_id = str(uuid.uuid4())
    m1_id = str(uuid.uuid4())
    m2_id = str(uuid.uuid4())
    l1_id = str(uuid.uuid4())
    l2_id = str(uuid.uuid4())
    l3_id = str(uuid.uuid4())

    mock_sb = MagicMock()
    lesson_call_count = [0]

    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.order.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Published Course", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_modules":
            q.execute.return_value = MagicMock(
                data=[
                    {"id": m1_id, "position": 1},
                    {"id": m2_id, "position": 2},
                ]
            )
        elif table_name == "course_lessons":
            lesson_call_count[0] += 1
            if lesson_call_count[0] == 1:
                q.execute.return_value = MagicMock(data=[{"id": l1_id, "position": 1}, {"id": l2_id, "position": 2}])
            else:
                q.execute.return_value = MagicMock(data=[{"id": l3_id, "position": 1}])
        elif table_name == "student_lesson_progress":
            # User has completed l1 and l2 (Module 1 is 100% lessons complete!)
            q.execute.return_value = MagicMock(
                data=[
                    {"lesson_id": l1_id, "completed": True},
                    {"lesson_id": l2_id, "completed": True},
                ]
            )
        elif table_name == "student_course_progress":
            q.execute.return_value = MagicMock(
                data=[{"last_lesson_id": l2_id}]
            )
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        res = client.get(f"/api/courses/{course_id}/progress")
        assert res.status_code == 200
        data = res.json()

        assert data["course_id"] == course_id
        assert data["completed_lessons"] == 2
        assert data["total_lessons"] == 3
        # 2 of 3 = 67%
        assert data["progress_percentage"] == 67
        assert data["last_lesson_id"] == l2_id
        assert set(data["completed_lesson_ids"]) == {l1_id, l2_id}

        # Module 1 should have lessons_complete = True
        mod1 = next(m for m in data["modules"] if m["module_id"] == m1_id)
        assert mod1["completed_lessons"] == 2
        assert mod1["total_lessons"] == 2
        assert mod1["progress_percentage"] == 100
        assert mod1["lessons_complete"] is True

        # Module 2 should have lessons_complete = False
        mod2 = next(m for m in data["modules"] if m["module_id"] == m2_id)
        assert mod2["completed_lessons"] == 0
        assert mod2["total_lessons"] == 1
        assert mod2["progress_percentage"] == 0
        assert mod2["lessons_complete"] is False


def test_record_lesson_progress_completion_and_idempotency(client, student_auth_override):
    """Verifies that marking a lesson complete records progress and repeated calls preserve original timestamp."""
    course_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())

    initial_completed_at = "2026-09-26T00:05:00+00:00"

    mock_sb = MagicMock()
    updated_records = []

    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.order.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Published Course", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_lessons":
            q.execute.return_value = MagicMock(data=[{"id": l_id, "module_id": m_id, "position": 1}])
        elif table_name == "course_modules":
            q.execute.return_value = MagicMock(data=[{"id": m_id, "course_id": course_id, "position": 1}])
        elif table_name == "student_lesson_progress":
            q.execute.return_value = MagicMock(
                data=[{"id": "lp-1", "lesson_id": l_id, "completed": True, "completed_at": initial_completed_at}]
            )
            q.update = lambda payload: MagicMock(
                eq=lambda col, val: MagicMock(
                    execute=lambda: updated_records.append(payload)
                )
            )
        elif table_name == "student_course_progress":
            q.execute.return_value = MagicMock(data=[{"id": "cp-1", "last_lesson_id": l_id}])
            q.update = lambda payload: MagicMock(
                eq=lambda col, val: MagicMock(execute=lambda: None)
            )
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        # Call completion again
        res = client.post(
            f"/api/courses/{course_id}/lessons/{l_id}/progress",
            json={"completed": True}
        )
        assert res.status_code == 200
        data = res.json()

        assert data["lesson"]["lesson_id"] == l_id
        assert data["lesson"]["completed"] is True
        # Original completion timestamp MUST be preserved
        assert data["lesson"]["completed_at"] == initial_completed_at
        assert len(updated_records) == 1
        assert updated_records[0]["completed_at"] == initial_completed_at



def test_resume_fallback_when_last_lesson_deleted(client, student_auth_override):
    """Verifies that if saved last_lesson_id points to a deleted lesson, it safely falls back to first published lesson."""
    course_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    first_lesson_id = str(uuid.uuid4())
    deleted_last_lesson_id = str(uuid.uuid4())

    mock_sb = MagicMock()

    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.order.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Published Course", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_modules":
            q.execute.return_value = MagicMock(data=[{"id": m_id, "position": 1}])
        elif table_name == "course_lessons":
            # Only first_lesson_id exists in published course
            q.execute.return_value = MagicMock(data=[{"id": first_lesson_id, "position": 1}])
        elif table_name == "student_lesson_progress":
            q.execute.return_value = MagicMock(data=[{"lesson_id": first_lesson_id, "completed": True}])
        elif table_name == "student_course_progress":
            # Saved pointer was deleted_last_lesson_id
            q.execute.return_value = MagicMock(data=[{"last_lesson_id": deleted_last_lesson_id}])
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        res = client.get(f"/api/courses/{course_id}/progress")
        assert res.status_code == 200
        data = res.json()
        # Should safely fall back to first_lesson_id
        assert data["last_lesson_id"] == first_lesson_id


def test_record_lesson_progress_toggle_incomplete(client, student_auth_override):
    """Verifies that calling progress with completed=False unmarks completion."""
    course_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())

    mock_sb = MagicMock()
    updated_records = []

    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.order.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Published Course", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_lessons":
            q.execute.return_value = MagicMock(data=[{"id": l_id, "module_id": m_id, "position": 1}])
        elif table_name == "course_modules":
            q.execute.return_value = MagicMock(data=[{"id": m_id, "course_id": course_id, "position": 1}])
        elif table_name == "student_lesson_progress":
            q.execute.return_value = MagicMock(
                data=[{"id": "lp-1", "lesson_id": l_id, "completed": True, "completed_at": "2026-09-26T00:00:00Z"}]
            )
            q.update = lambda payload: MagicMock(
                eq=lambda col, val: MagicMock(
                    execute=lambda: updated_records.append(payload)
                )
            )
        elif table_name == "student_course_progress":
            q.execute.return_value = MagicMock(data=[{"id": "cp-1", "last_lesson_id": l_id}])
            q.update = lambda payload: MagicMock(eq=lambda col, val: MagicMock(execute=lambda: None))
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        res = client.post(
            f"/api/courses/{course_id}/lessons/{l_id}/progress",
            json={"completed": False}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["lesson"]["completed"] is False
        assert data["lesson"]["completed_at"] is None
        assert len(updated_records) == 1
        assert updated_records[0]["completed"] is False
        assert updated_records[0]["completed_at"] is None


def test_record_lesson_progress_view_only(client, student_auth_override):
    """Verifies that calling progress without completed parameter updates last_lesson_id without modifying completion."""
    course_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())

    mock_sb = MagicMock()
    updated_records = []

    def mock_from(table_name):
        q = MagicMock()
        q.select.return_value = q
        q.eq.return_value = q
        q.order.return_value = q
        q.limit.return_value = q

        if table_name == "courses":
            q.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Published Course", "status": CourseStatus.PUBLISHED.value}]
            )
        elif table_name == "course_lessons":
            q.execute.return_value = MagicMock(data=[{"id": l_id, "module_id": m_id, "position": 1}])
        elif table_name == "course_modules":
            q.execute.return_value = MagicMock(data=[{"id": m_id, "course_id": course_id, "position": 1}])
        elif table_name == "student_lesson_progress":
            # Row was incomplete
            q.execute.return_value = MagicMock(
                data=[{"id": "lp-1", "lesson_id": l_id, "completed": False, "completed_at": None}]
            )
            q.update = lambda payload: MagicMock(
                eq=lambda col, val: MagicMock(
                    execute=lambda: updated_records.append(payload)
                )
            )
        elif table_name == "student_course_progress":
            q.execute.return_value = MagicMock(data=[{"id": "cp-1", "last_lesson_id": l_id}])
            q.update = lambda payload: MagicMock(eq=lambda col, val: MagicMock(execute=lambda: None))
        return q

    mock_sb.from_.side_effect = mock_from

    with patch("backend.services.student_progress_service.get_supabase", return_value=mock_sb):
        # Empty payload
        res = client.post(
            f"/api/courses/{course_id}/lessons/{l_id}/progress",
            json={}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["lesson"]["completed"] is False
        assert len(updated_records) == 1
        assert updated_records[0]["completed"] is False

