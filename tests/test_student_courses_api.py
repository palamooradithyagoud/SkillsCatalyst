"""
tests/test_student_courses_api.py
Deactivation Verification Suite for Student Courses API.

Verifies that all student-facing course discovery, catalog, lesson,
and syllabus endpoints are genuinely de-registered from FastAPI and return HTTP 404.
"""

import uuid
import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_list_published_courses_inaccessible(client):
    """Verifies GET /api/courses is decommissioned and returns 404."""
    response = client.get("/api/courses")
    assert response.status_code == 404


def test_get_published_course_detail_inaccessible(client):
    """Verifies GET /api/courses/{course_id} is decommissioned and returns 404."""
    test_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{test_id}")
    assert response.status_code == 404


def test_get_course_by_slug_inaccessible(client):
    """Verifies GET /api/courses/{slug} is decommissioned and returns 404."""
    response = client.get("/api/courses/python-for-beginners")
    assert response.status_code == 404


def test_get_student_lesson_inaccessible(client):
    """Verifies GET /api/courses/{course_id}/lessons/{lesson_id} returns 404."""
    course_id = str(uuid.uuid4())
    lesson_id = str(uuid.uuid4())
    response = client.get(f"/api/courses/{course_id}/lessons/{lesson_id}")
    assert response.status_code == 404


def test_student_routes_reject_mutations_with_404(client):
    """Verifies POST / PUT / DELETE mutations to /api/courses return 404 (not mounted)."""
    post_res = client.post("/api/courses", json={"title": "Hacked Course"})
    assert post_res.status_code == 404

    put_res = client.put(f"/api/courses/{uuid.uuid4()}", json={"title": "Hacked Course"})
    assert put_res.status_code == 404

    del_res = client.delete(f"/api/courses/{uuid.uuid4()}")
    assert del_res.status_code == 404


def test_course_certificate_issuance_inaccessible(client):
    """Verifies POST /api/courses/{id}/certificate/issue is decommissioned and returns 404."""
    course_id = str(uuid.uuid4())
    response = client.post(f"/api/courses/{course_id}/certificate/issue")
    assert response.status_code == 404
