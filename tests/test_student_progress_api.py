"""
tests/test_student_progress_api.py
Deactivation Verification Suite for Student Course Progress & Quiz API.

Verifies that all student progress, lesson completion checkoff, module quizzes,
and quiz attempt endpoints are genuinely de-registered from FastAPI and return HTTP 404.
"""

import uuid
import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_course_progress_inaccessible(client):
    """Verifies GET /api/courses/{course_id}/progress is decommissioned and returns 404."""
    course_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{course_id}/progress")
    assert response.status_code == 404


def test_record_lesson_progress_inaccessible(client):
    """Verifies POST /api/courses/{course_id}/lessons/{lesson_id}/progress returns 404."""
    course_id = str(uuid.uuid4())
    lesson_id = str(uuid.uuid4())
    response = client.post(
        f"/api/courses/{course_id}/lessons/{lesson_id}/progress",
        json={"completed": True}
    )
    assert response.status_code == 404


def test_get_module_quiz_inaccessible(client):
    """Verifies GET /api/courses/{course_id}/modules/{module_id}/quiz returns 404."""
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{course_id}/modules/{module_id}/quiz")
    assert response.status_code == 404


def test_submit_quiz_attempt_inaccessible(client):
    """Verifies POST /api/courses/{course_id}/modules/{module_id}/quiz/attempts returns 404."""
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    response = client.post(
        f"/api/courses/{course_id}/modules/{module_id}/quiz/attempts",
        json={"answers": []}
    )
    assert response.status_code == 404


def test_get_quiz_history_inaccessible(client):
    """Verifies GET /api/courses/{course_id}/modules/{module_id}/quiz/attempts returns 404."""
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{course_id}/modules/{module_id}/quiz/attempts")
    assert response.status_code == 404


def test_get_module_progress_inaccessible(client):
    """Verifies GET /api/courses/{course_id}/modules/{module_id}/progress returns 404."""
    course_id = str(uuid.uuid4())
    module_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{course_id}/modules/{module_id}/progress")
    assert response.status_code == 404
