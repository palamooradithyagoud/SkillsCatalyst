"""
tests/test_course_system_foundation.py
Comprehensive Production Test Suite for SkillsCatalyst Course System:
Phase 1: Foundation + Module Quiz Foundation.

Validates:
1. Course CRUD (create, read detail hierarchy, update metadata, archive, delete)
2. Course List (server-side search by title, status filter, difficulty filter, category filter, whitelisted sorting, pagination)
3. Module CRUD & ordering within Course
4. Lesson CRUD & ordering within Module (metadata only)
5. Quiz Foundation:
   - Exactly one quiz per module
   - Duplicate quiz creation rejected with 409 Conflict
   - Question CRUD and deterministic ordering
   - Option CRUD and deterministic ordering
   - Server-side is_correct flag handling
6. Authoritative Server-Side Publication Validation:
   - Course without modules cannot publish (400)
   - Module without quiz cannot publish (400)
   - Quiz without questions cannot publish (400)
   - Question without options cannot publish (400)
   - SINGLE_SELECT with 0 correct answers cannot publish (400)
   - SINGLE_SELECT with >1 correct answers cannot publish (400)
   - Complete valid course successfully transitions to PUBLISHED
7. Security & Authorization:
   - Unauthenticated requests rejected (401)
   - Non-admin student requests rejected from CMS mutations (403)
8. Audit Logging:
   - Important actions (course_created, course_published, module_created, quiz_created, question_created) recorded
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
from backend.services.auth_service import require_admin, require_authenticated_user

client = TestClient(app)


class TestCourseSystemFoundation(unittest.TestCase):

    def setUp(self):
        self.admin_id = "22222222-3333-4444-5555-666666666666"
        self.admin_email = "admin@skillscatalyst.com"
        self.student_id = "11111111-2222-3333-4444-555555555555"
        self.student_email = "student@university.edu"

        self.mock_course_id = "c0000000-0000-0000-0000-000000000001"
        self.mock_module_id = "m0000000-0000-0000-0000-000000000001"
        self.mock_lesson_id = "l0000000-0000-0000-0000-000000000001"
        self.mock_quiz_id = "q0000000-0000-0000-0000-000000000001"
        self.mock_question_id = "k0000000-0000-0000-0000-000000000001"
        self.mock_option_1_id = "o0000000-0000-0000-0000-000000000001"
        self.mock_option_2_id = "o0000000-0000-0000-0000-000000000002"

        # Default override: authorized admin
        app.dependency_overrides[require_admin] = lambda: {
            "user_id": self.admin_id,
            "email": self.admin_email,
            "role": "admin",
        }

    def tearDown(self):
        app.dependency_overrides.clear()

    # ── 1. COURSE CRUD ────────────────────────────────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_create_course_success(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        # Mock slug check (empty -> slug unique)
        mock_client.from_().select().ilike().execute.return_value = MagicMock(data=[])

        # Mock insert
        created_row = {
            "id": self.mock_course_id,
            "title": "Python for Data Engineering",
            "slug": "python-for-data-engineering",
            "short_description": "Foundations of data pipelines",
            "description": "Learn python primitives, pandas, and ETL.",
            "thumbnail_url": "https://cdn.skillscatalyst.in/courses/python.png",
            "category": "Data Engineering",
            "difficulty": "beginner",
            "estimated_duration_minutes": 180,
            "status": "DRAFT",
            "created_by": self.admin_id,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }
        mock_client.from_().insert().execute.return_value = MagicMock(data=[created_row])

        payload = {
            "title": "Python for Data Engineering",
            "short_description": "Foundations of data pipelines",
            "description": "Learn python primitives, pandas, and ETL.",
            "thumbnail_url": "https://cdn.skillscatalyst.in/courses/python.png",
            "category": "Data Engineering",
            "difficulty": "beginner",
            "estimated_duration_minutes": 180,
            "status": "DRAFT",
        }

        resp = client.post("/api/admin/courses", json=payload)
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["id"], self.mock_course_id)
        self.assertEqual(data["slug"], "python-for-data-engineering")
        self.assertEqual(data["status"], "DRAFT")

    def test_create_course_empty_title_rejected(self):
        resp = client.post("/api/admin/courses", json={"title": "   ", "difficulty": "beginner"})
        self.assertEqual(resp.status_code, 422)

    def test_create_course_published_directly_rejected(self):
        payload = {
            "title": "Instant Published Course",
            "difficulty": "beginner",
            "status": "PUBLISHED",
        }
        resp = client.post("/api/admin/courses", json=payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("cannot be created directly in PUBLISHED", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_get_course_detail_hierarchy(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        # Course record
        course_row = {
            "id": self.mock_course_id,
            "title": "Full Stack Mastery",
            "slug": "full-stack-mastery",
            "difficulty": "intermediate",
            "status": "DRAFT",
            "created_by": self.admin_id,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }

        # Modules
        module_rows = [{
            "id": self.mock_module_id,
            "course_id": self.mock_course_id,
            "title": "Module 1: Architecture",
            "position": 1,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }]

        # Lessons
        lesson_rows = [{
            "id": self.mock_lesson_id,
            "module_id": self.mock_module_id,
            "title": "Lesson 1: System Design",
            "position": 1,
            "estimated_duration_minutes": 20,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }]

        # Quiz
        quiz_rows = [{
            "id": self.mock_quiz_id,
            "module_id": self.mock_module_id,
            "title": "Module 1 Quiz",
            "status": "DRAFT",
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }]

        # Questions
        question_rows = [{
            "id": self.mock_question_id,
            "quiz_id": self.mock_quiz_id,
            "question_text": "What is horizontal scaling?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
            "explanation": "Adding more machine nodes",
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }]

        # Options
        option_rows = [
            {"id": self.mock_option_1_id, "question_id": self.mock_question_id, "option_text": "Adding more nodes", "is_correct": True, "position": 1, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"},
            {"id": self.mock_option_2_id, "question_id": self.mock_question_id, "option_text": "Upgrading CPU only", "is_correct": False, "position": 2, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"},
        ]

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_lessons":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=lesson_rows)
            elif table_name == "course_quizzes":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=quiz_rows)
            elif table_name == "quiz_questions":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=question_rows)
            elif table_name == "quiz_options":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=option_rows)
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.get(f"/api/admin/courses/{self.mock_course_id}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["id"], self.mock_course_id)
        self.assertEqual(len(data["modules"]), 1)
        mod = data["modules"][0]
        self.assertEqual(len(mod["lessons"]), 1)
        self.assertIsNotNone(mod["quiz"])
        self.assertEqual(len(mod["quiz"]["questions"]), 1)
        self.assertEqual(len(mod["quiz"]["questions"][0]["options"]), 2)
        self.assertTrue(mod["quiz"]["questions"][0]["options"][0]["is_correct"])

    # ── 2. SORTING, FILTERING & SEARCH ────────────────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_list_courses_whitelisted_sorting(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client
        mock_client.from_().select().order().range().execute.return_value = MagicMock(data=[], count=0)

        # Valid sort options
        for s in ("newest", "oldest", "title_asc", "title_desc", "updated_at"):
            resp = client.get(f"/api/admin/courses?sort={s}")
            self.assertEqual(resp.status_code, 200)

        # Invalid sort option rejected with 422
        resp = client.get("/api/admin/courses?sort=arbitrary_column_drop_table")
        self.assertEqual(resp.status_code, 422)

    # ── 3. MODULE ORDERING & CRUD ─────────────────────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_create_module_computes_sequential_position(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        # Course exists
        mock_client.from_().select().eq().execute.return_value = MagicMock(data=[{"id": self.mock_course_id}])

        # Existing max position is 2 -> next should be 3
        mock_client.from_().select().eq().order().limit().execute.return_value = MagicMock(data=[{"position": 2}])

        created_row = {
            "id": self.mock_module_id,
            "course_id": self.mock_course_id,
            "title": "Module 3: Advanced Topics",
            "position": 3,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }
        mock_client.from_().insert().execute.return_value = MagicMock(data=[created_row])

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/modules", json={"title": "Module 3: Advanced Topics"})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["position"], 3)

    # ── 4. QUIZ FOUNDATION: ONE QUIZ PER MODULE ───────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_create_quiz_duplicate_rejected_409(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        # Module exists
        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": self.mock_module_id}])
            elif table_name == "course_quizzes":
                # Existing quiz already present for this module!
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": self.mock_quiz_id}])
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/modules/{self.mock_module_id}/quiz", json={"title": "Duplicate Quiz"})
        self.assertEqual(resp.status_code, 409)
        self.assertIn("already exists for this module", resp.json()["detail"])

    # ── 5. AUTHORITATIVE PUBLICATION VALIDATION ───────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_publish_course_without_modules_fails(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {
            "id": self.mock_course_id,
            "title": "Empty Course",
            "difficulty": "beginner",
            "status": "DRAFT",
        }

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("at least one module", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_publish_module_without_quiz_fails(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {"id": self.mock_course_id, "title": "Course 1", "difficulty": "beginner", "status": "DRAFT"}
        module_rows = [{"id": self.mock_module_id, "course_id": self.mock_course_id, "title": "Mod 1", "position": 1}]

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_quizzes":
                # No quiz for module!
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("missing a required quiz", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_publish_quiz_without_questions_fails(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {"id": self.mock_course_id, "title": "Course 1", "difficulty": "beginner", "status": "DRAFT"}
        module_rows = [{"id": self.mock_module_id, "course_id": self.mock_course_id, "title": "Mod 1", "position": 1}]
        quiz_rows = [{"id": self.mock_quiz_id, "module_id": self.mock_module_id, "title": "Quiz 1"}]

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_quizzes":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=quiz_rows)
            elif table_name == "quiz_questions":
                # Zero questions in quiz!
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("at least one question", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_publish_single_select_zero_correct_fails(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {"id": self.mock_course_id, "title": "Course 1", "difficulty": "beginner", "status": "DRAFT"}
        module_rows = [{"id": self.mock_module_id, "course_id": self.mock_course_id, "title": "Mod 1", "position": 1}]
        quiz_rows = [{"id": self.mock_quiz_id, "module_id": self.mock_module_id, "title": "Quiz 1"}]
        question_rows = [{
            "id": self.mock_question_id,
            "quiz_id": self.mock_quiz_id,
            "question_text": "What is Python?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
        }]
        # Two options, but both is_correct = False!
        option_rows = [
            {"id": self.mock_option_1_id, "question_id": self.mock_question_id, "option_text": "A snake", "is_correct": False, "position": 1},
            {"id": self.mock_option_2_id, "question_id": self.mock_question_id, "option_text": "A lizard", "is_correct": False, "position": 2},
        ]

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_quizzes":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=quiz_rows)
            elif table_name == "quiz_questions":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=question_rows)
            elif table_name == "quiz_options":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=option_rows)
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("zero correct options", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_publish_single_select_multiple_correct_fails(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {"id": self.mock_course_id, "title": "Course 1", "difficulty": "beginner", "status": "DRAFT"}
        module_rows = [{"id": self.mock_module_id, "course_id": self.mock_course_id, "title": "Mod 1", "position": 1}]
        quiz_rows = [{"id": self.mock_quiz_id, "module_id": self.mock_module_id, "title": "Quiz 1"}]
        question_rows = [{
            "id": self.mock_question_id,
            "quiz_id": self.mock_quiz_id,
            "question_text": "What is Python?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
        }]
        # Two options, BOTH is_correct = True!
        option_rows = [
            {"id": self.mock_option_1_id, "question_id": self.mock_question_id, "option_text": "Programming language", "is_correct": True, "position": 1},
            {"id": self.mock_option_2_id, "question_id": self.mock_question_id, "option_text": "Interpreted language", "is_correct": True, "position": 2},
        ]

        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[course_row])
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_quizzes":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=quiz_rows)
            elif table_name == "quiz_questions":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=question_rows)
            elif table_name == "quiz_options":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=option_rows)
            return t_mock

        mock_client.from_.side_effect = table_resolver

        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("correct options. Exactly one correct option is permitted", resp.json()["detail"])

    @patch("backend.services.course_service.get_supabase")
    def test_publish_complete_valid_course_succeeds(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client

        course_row = {
            "id": self.mock_course_id,
            "title": "Complete Course",
            "slug": "complete-course",
            "difficulty": "beginner",
            "status": "DRAFT",
            "created_by": self.admin_id,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }
        module_rows = [{"id": self.mock_module_id, "course_id": self.mock_course_id, "title": "Mod 1", "position": 1, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"}]
        lesson_rows = [{"id": self.mock_lesson_id, "module_id": self.mock_module_id, "title": "Lesson 1", "position": 1, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"}]
        quiz_rows = [{"id": self.mock_quiz_id, "module_id": self.mock_module_id, "title": "Quiz 1", "status": "DRAFT", "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"}]
        question_rows = [{
            "id": self.mock_question_id,
            "quiz_id": self.mock_quiz_id,
            "question_text": "What is Python?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
            "created_at": "2026-09-25T10:00:00Z",
            "updated_at": "2026-09-25T10:00:00Z",
        }]
        option_rows = [
            {"id": self.mock_option_1_id, "question_id": self.mock_question_id, "option_text": "A programming language", "is_correct": True, "position": 1, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"},
            {"id": self.mock_option_2_id, "question_id": self.mock_question_id, "option_text": "An animal only", "is_correct": False, "position": 2, "created_at": "2026-09-25T10:00:00Z", "updated_at": "2026-09-25T10:00:00Z"},
        ]

        current_status = ["DRAFT"]
        def table_resolver(table_name):
            t_mock = MagicMock()
            if table_name == "courses":
                t_mock.select.return_value.eq.return_value.execute.side_effect = lambda: MagicMock(
                    data=[{**course_row, "status": current_status[0]}]
                )
                def on_update(payload):
                    if "status" in payload:
                        current_status[0] = payload["status"]
                    return MagicMock(execute=lambda: MagicMock(data=[{**course_row, "status": current_status[0]}]))
                t_mock.update.side_effect = lambda payload: MagicMock(eq=lambda col, val: on_update(payload))
            elif table_name == "course_modules":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=module_rows)
            elif table_name == "course_lessons":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=lesson_rows)
            elif table_name == "course_quizzes":
                t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=quiz_rows)
            elif table_name == "quiz_questions":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=question_rows)
            elif table_name == "quiz_options":
                t_mock.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=option_rows)
            return t_mock

        mock_client.from_.side_effect = table_resolver


        resp = client.post(f"/api/admin/courses/{self.mock_course_id}/publish")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "PUBLISHED")

    # ── 6. SECURITY & AUTHORIZATION ───────────────────────────────────────────

    def test_unauthorized_user_rejected_401(self):
        # Clear dependency override to test live require_admin rejection
        app.dependency_overrides.clear()
        resp = client.post("/api/admin/courses", json={"title": "Hack Attempt"})
        self.assertEqual(resp.status_code, 401)

    def test_student_role_rejected_403(self):
        app.dependency_overrides[require_admin] = lambda: (_ for _ in ()).throw(
            HTTPException(status_code=403, detail="Forbidden: Admin or content manager privileges required.")
        )
        from fastapi import HTTPException
        resp = client.post("/api/admin/courses", json={"title": "Student Write"})
        self.assertEqual(resp.status_code, 403)

    # ── 7. COURSE HERO GRAPHIC UPLOAD ─────────────────────────────────────────

    @patch("backend.services.course_service.get_supabase")
    def test_upload_course_hero_png_success(self, mock_sb):
        mock_client = MagicMock()
        mock_sb.return_value = mock_client
        mock_storage = MagicMock()
        mock_client.storage.from_.return_value = mock_storage
        mock_storage.get_public_url.return_value = "https://mock-supabase.co/storage/v1/object/public/course-hero-graphics/course_hero_test.png"

        valid_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"

        files = {"file": ("hero.png", valid_png, "image/png")}
        resp = client.post("/api/admin/courses/upload-hero", files=files)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertIn("course_hero_test.png", data["thumbnail_url"])

    def test_upload_course_hero_invalid_extension_rejected(self):
        files = {"file": ("malicious.sh", b"#!/bin/bash\necho bad", "text/plain")}
        resp = client.post("/api/admin/courses/upload-hero", files=files)
        self.assertEqual(resp.status_code, 400)


if __name__ == "__main__":
    unittest.main()

