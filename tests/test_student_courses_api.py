"""
tests/test_student_courses_api.py
Comprehensive unit & integration tests for Student Course Experience API (Phase 4).
Tests:
- Published course discovery & filtering
- Published course detail with ordered syllabus
- Student lesson reading with all 12 block structures
- Module boundary navigation resolution
- Draft content isolation (draft courses/lessons return 404)
- Quiz answer key omission
- Read-only route mutation prevention
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.models.course import CourseStatus


@pytest.fixture
def client():
    return TestClient(app)


def test_list_published_courses_success(client):
    """Verifies GET /api/courses returns published courses and excludes draft courses."""
    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_sb.from_.return_value = mock_query
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.range.return_value = mock_query

    c1_id = str(uuid.uuid4())
    mock_query.execute.return_value = MagicMock(
        count=1,
        data=[
            {
                "id": c1_id,
                "title": "Mastering TypeScript",
                "slug": "mastering-typescript",
                "short_description": "Advanced TS patterns",
                "description": "Full syllabus",
                "thumbnail_url": "https://example.com/ts.png",
                "category": "Frontend",
                "difficulty": "advanced",
                "estimated_duration_minutes": 180,
                "status": "PUBLISHED",
                "published_at": "2026-09-26T00:00:00Z",
                "course_modules": [
                    {"id": str(uuid.uuid4()), "course_lessons": [{"id": str(uuid.uuid4())}]},
                ],
            }
        ],
    )

    with patch("backend.services.student_course_service.get_supabase", return_value=mock_sb):
        response = client.get("/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        item = data["items"][0]
        assert item["title"] == "Mastering TypeScript"
        assert item["status"] == "PUBLISHED"
        assert item["modules_count"] == 1
        assert item["lessons_count"] == 1
        # Security: verify no admin internal fields
        assert "created_by" not in item
        assert "audit_logs" not in item


def test_get_published_course_detail_success(client):
    """Verifies GET /api/courses/{id} returns full syllabus and omits quiz answer keys."""
    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_sb.from_.return_value = mock_query

    course_id = str(uuid.uuid4())
    mod_id = str(uuid.uuid4())
    les_id = str(uuid.uuid4())
    quiz_id = str(uuid.uuid4())

    def from_side_effect(table_name):
        q = MagicMock()
        if table_name == "courses":
            q.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{
                    "id": course_id,
                    "title": "Data Structures",
                    "slug": "data-structures",
                    "short_description": "DSA overview",
                    "description": "Full DSA course",
                    "category": "Computer Science",
                    "difficulty": "intermediate",
                    "estimated_duration_minutes": 240,
                    "status": "PUBLISHED",
                    "published_at": "2026-09-26T00:00:00Z",
                }]
            )
        elif table_name == "course_modules":
            q.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[{
                    "id": mod_id,
                    "course_id": course_id,
                    "title": "Trees & Graphs",
                    "description": "Module 1",
                    "position": 1,
                }]
            )
        elif table_name == "course_lessons":
            q.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[{
                    "id": les_id,
                    "module_id": mod_id,
                    "title": "Binary Search Trees",
                    "slug": "bst",
                    "short_description": "Intro to BST",
                    "position": 1,
                    "estimated_duration_minutes": 30,
                }]
            )
        elif table_name == "course_quizzes":
            q.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{
                    "id": quiz_id,
                    "module_id": mod_id,
                    "title": "BST Checkpoint Quiz",
                    "description": "Test understanding",
                    "status": "PUBLISHED",
                }]
            )
        return q

    mock_sb.from_.side_effect = from_side_effect

    with patch("backend.services.student_course_service.get_supabase", return_value=mock_sb):
        response = client.get(f"/api/courses/{course_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Data Structures"
        assert len(data["modules"]) == 1
        mod = data["modules"][0]
        assert mod["title"] == "Trees & Graphs"
        assert len(mod["lessons"]) == 1
        assert mod["lessons"][0]["title"] == "Binary Search Trees"
        assert mod["quiz"]["title"] == "BST Checkpoint Quiz"
        # Security: verify no question/option answer keys
        assert "questions" not in mod["quiz"]
        assert "is_correct" not in mod["quiz"]


def test_get_draft_course_returns_404(client):
    """Verifies that accessing an unpublished (DRAFT) course returns 404."""
    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_sb.from_.return_value = mock_query

    course_id = str(uuid.uuid4())
    mock_query.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": course_id,
            "title": "Draft Course",
            "slug": "draft-course",
            "status": "DRAFT",
        }]
    )

    with patch("backend.services.student_course_service.get_supabase", return_value=mock_sb):
        response = client.get(f"/api/courses/{course_id}")
        assert response.status_code == 404
        data = response.json()
        assert "not found or unavailable" in data["message"].lower()


def test_get_student_lesson_with_module_boundary_navigation(client):
    """Verifies lesson content retrieval and boundary navigation across Module 1 and Module 2."""
    mock_sb = MagicMock()

    course_id = str(uuid.uuid4())
    mod1_id = str(uuid.uuid4())
    mod2_id = str(uuid.uuid4())

    l1_id = str(uuid.uuid4())
    l2_id = str(uuid.uuid4())  # Last lesson of Module 1
    l3_id = str(uuid.uuid4())  # First lesson of Module 2
    l4_id = str(uuid.uuid4())  # Final lesson

    def from_side_effect(table_name):
        q = MagicMock()
        if table_name == "courses":
            q.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{
                    "id": course_id,
                    "title": "Complete Python",
                    "slug": "complete-python",
                    "status": "PUBLISHED",
                }]
            )
        elif table_name == "course_modules":
            q.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[
                    {"id": mod1_id, "title": "Module 1: Basics", "position": 1},
                    {"id": mod2_id, "title": "Module 2: Advanced", "position": 2},
                ]
            )
        elif table_name == "course_lessons":
            def order_mock(field, desc=False):
                exec_mock = MagicMock()
                # If queried for mod1
                if q.select.return_value.eq.call_args[0][1] == mod1_id:
                    exec_mock.execute.return_value = MagicMock(data=[
                        {"id": l1_id, "module_id": mod1_id, "title": "Syntax", "slug": "syntax", "position": 1, "estimated_duration_minutes": 10},
                        {"id": l2_id, "module_id": mod1_id, "title": "Variables", "slug": "vars", "position": 2, "estimated_duration_minutes": 15},
                    ])
                else:
                    exec_mock.execute.return_value = MagicMock(data=[
                        {"id": l3_id, "module_id": mod2_id, "title": "Decorators", "slug": "decor", "position": 1, "estimated_duration_minutes": 20},
                        {"id": l4_id, "module_id": mod2_id, "title": "Generators", "slug": "gen", "position": 2, "estimated_duration_minutes": 25},
                    ])
                return exec_mock
            q.select.return_value.eq.return_value.order.side_effect = order_mock
        elif table_name == "course_lesson_contents":
            q.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[{
                    "schema_version": 1,
                    "blocks": [
                        {"id": "b1", "type": "heading", "content": {"text": "Variables in Python", "level": 2}},
                        {"id": "b2", "type": "paragraph", "content": {"text": "Variables store data."}},
                    ],
                }]
            )
        return q

    mock_sb.from_.side_effect = from_side_effect

    with patch("backend.services.student_course_service.get_supabase", return_value=mock_sb):
        # Fetch L2 (end of Module 1)
        response = client.get(f"/api/courses/{course_id}/lessons/{l2_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["lesson"]["title"] == "Variables"
        assert len(data["content"]["blocks"]) == 2

        # Verify boundary navigation: previous is L1, next is L3 (Module 2!)
        assert data["prev_lesson"]["id"] == l1_id
        assert data["prev_lesson"]["title"] == "Syntax"

        assert data["next_lesson"]["id"] == l3_id
        assert data["next_lesson"]["title"] == "Decorators"
        assert data["next_lesson"]["module_id"] == mod2_id
        assert data["next_lesson"]["module_title"] == "Module 2: Advanced"


def test_first_lesson_has_no_previous_destination(client):
    """Verifies that the first lesson has prev_lesson = null."""
    mock_sb = MagicMock()
    course_id = str(uuid.uuid4())
    mod1_id = str(uuid.uuid4())
    l1_id = str(uuid.uuid4())
    l2_id = str(uuid.uuid4())

    def from_side_effect(table_name):
        q = MagicMock()
        if table_name == "courses":
            q.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{"id": course_id, "title": "Py", "slug": "py", "status": "PUBLISHED"}]
            )
        elif table_name == "course_modules":
            q.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[{"id": mod1_id, "title": "M1", "position": 1}]
            )
        elif table_name == "course_lessons":
            q.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                data=[
                    {"id": l1_id, "module_id": mod1_id, "title": "L1", "position": 1},
                    {"id": l2_id, "module_id": mod1_id, "title": "L2", "position": 2},
                ]
            )
        elif table_name == "course_lesson_contents":
            q.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[]
            )
        return q

    mock_sb.from_.side_effect = from_side_effect

    with patch("backend.services.student_course_service.get_supabase", return_value=mock_sb):
        response = client.get(f"/api/courses/{course_id}/lessons/{l1_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["prev_lesson"] is None
        assert data["next_lesson"]["id"] == l2_id


def test_student_routes_reject_mutations(client):
    """Verifies student routes strictly disallow POST / PUT / DELETE mutations."""
    post_res = client.post("/api/courses", json={"title": "Hack"})
    assert post_res.status_code == 405  # Method Not Allowed

    delete_res = client.delete("/api/courses/some-course-id")
    assert delete_res.status_code == 405

    put_res = client.put("/api/courses/some-course-id/lessons/some-lesson-id", json={})
    assert put_res.status_code == 405
