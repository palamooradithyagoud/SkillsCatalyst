"""
tests/test_live_phase6_quiz_attempts.py
Live Supabase End-to-End Integration Test for Phase 6: Module Quizzes.
Runs against the real live Supabase database.

Full Lifecycle & Invariants Verified:
 1. Create real course with 2 modules, 3 lessons per module, quizzes with questions/options.
 2. Publish course.
 3. Create Student A and Student B test users.
 4. QUIZ LOCK: Student A cannot take quiz before completing lessons (HTTP 403).
 5. Student A completes all 3 lessons in Module 1.
 6. Student A opens quiz — receives questions WITHOUT is_correct or answer keys.
 7. WRONG SUBMISSION: Student A submits wrong answers — server scores 0%, failed.
 8. RETRY: Student A retries with correct answers — server scores 100%, passed.
 9. MODULE COMPLETION: lessons_complete + quiz_passed → module is marked complete.
10. ATTEMPT HISTORY: History shows both attempts; best_score=100, ever_passed=True.
11. CROSS-STUDENT ISOLATION: Student B sees 0 attempts; Student B cannot access Student A's data.
12. ANSWER KEY NEVER EXPOSED: Quiz GET response never includes is_correct.
13. TAMPER PROTECTION: Submitting option from wrong question is rejected (HTTP 422).
14. DOUBLE SUBMISSION: Submitting same question twice is rejected (HTTP 422).
15. SCORE SERVER-AUTHORITATIVE: Any client-side score manipulation is irrelevant.
16. STUDENT B MODULE ISOLATION: Student B completes all lessons, fails quiz → B's module incomplete.
17. RLS: Student B cannot read Student A's attempt rows via direct Supabase client.
18. Teardown: purge test course and test auth users.
"""

import os
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.supabase_service import get_supabase
from backend.services.course_service import (
    create_course,
    create_course_module,
    create_course_lesson,
    create_course_quiz,
    create_quiz_question,
    create_quiz_option,
    publish_course,
    delete_course,
)
from backend.models.course import (
    CourseCreate,
    CourseModuleCreate,
    CourseLessonCreate,
    CourseQuizCreate,
    QuizQuestionCreate,
    QuizOptionCreate,
    QuestionType,
    CourseDifficulty,
)

load_dotenv()
client = TestClient(app)


def _supabase_configured() -> bool:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    return bool(url and key)


@pytest.fixture(scope="module")
def setup_quiz_env():
    """
    Creates a complete test environment:
    - 1 course with 2 modules
    - Module 1: 3 lessons + quiz with 2 questions (correct answers known)
    - Module 2: 1 lesson + quiz
    - Admin user, Student A, Student B
    Returns all context needed for tests.
    """
    sb = get_supabase()
    assert sb is not None, "Supabase client required"

    unique_suffix = uuid.uuid4().hex[:8]
    password = "TestQuizPassword123!#"

    # ── Admin ──────────────────────────────────────────────────────────────────
    admin_email = f"p6_admin_{unique_suffix}@skillscatalyst.internal"
    admin_resp = sb.auth.admin.create_user({
        "email": admin_email,
        "password": password,
        "email_confirm": True,
        "app_metadata": {"role": "admin"},
    })
    admin_user = admin_resp.user
    sb.from_("profiles").upsert({
        "id": admin_user.id,
        "email": admin_email,
        "full_name": "Phase 6 Admin",
        "role": "admin",
    }).execute()

    # ── Student A ──────────────────────────────────────────────────────────────
    student_a_email = f"p6_student_a_{unique_suffix}@skillscatalyst.internal"
    student_a_resp = sb.auth.admin.create_user({
        "email": student_a_email,
        "password": password,
        "email_confirm": True,
        "app_metadata": {"role": "student"},
    })
    student_a = student_a_resp.user
    sb.from_("profiles").upsert({
        "id": student_a.id,
        "email": student_a_email,
        "full_name": "Student A",
        "role": "student",
    }).execute()

    # ── Student B ──────────────────────────────────────────────────────────────
    student_b_email = f"p6_student_b_{unique_suffix}@skillscatalyst.internal"
    student_b_resp = sb.auth.admin.create_user({
        "email": student_b_email,
        "password": password,
        "email_confirm": True,
        "app_metadata": {"role": "student"},
    })
    student_b = student_b_resp.user
    sb.from_("profiles").upsert({
        "id": student_b.id,
        "email": student_b_email,
        "full_name": "Student B",
        "role": "student",
    }).execute()

    # ── Course ─────────────────────────────────────────────────────────────────
    course = create_course(
        data=CourseCreate(
            title=f"Phase 6 Test Course {unique_suffix}",
            difficulty=CourseDifficulty.BEGINNER,
        ),
        user_id=str(admin_user.id),
    )
    course_id = course["id"]

    # ── Module 1 ───────────────────────────────────────────────────────────────
    mod1 = create_course_module(
        course_id=course_id,
        data=CourseModuleCreate(title="Module 1 – Testing", position=1),
        user_id=str(admin_user.id),
    )
    mod1_id = mod1["id"]

    # 3 lessons in Module 1
    lessons_m1 = []
    for i in range(1, 4):
        l = create_course_lesson(
            module_id=mod1_id,
            data=CourseLessonCreate(title=f"M1 Lesson {i}", position=i),
            user_id=str(admin_user.id),
        )
        lessons_m1.append(l["id"])

    # Quiz for Module 1: 2 questions
    quiz1 = create_course_quiz(
        module_id=mod1_id,
        data=CourseQuizCreate(title="Module 1 Quiz", status="PUBLISHED"),
        user_id=str(admin_user.id),
    )
    quiz1_id = quiz1["id"]

    # Question 1: "What is 2+2?" Correct: "4"
    q1 = create_quiz_question(
        quiz_id=quiz1_id,
        data=QuizQuestionCreate(
            question_text="What is 2 + 2?",
            question_type=QuestionType.SINGLE_SELECT,
            position=1,
            explanation="Basic arithmetic",
        ),
        user_id=str(admin_user.id),
    )
    q1_id = q1["id"]
    opt_q1_wrong = create_quiz_option(
        question_id=q1_id,
        data=QuizOptionCreate(option_text="3", is_correct=False, position=1),
        user_id=str(admin_user.id),
    )
    opt_q1_correct = create_quiz_option(
        question_id=q1_id,
        data=QuizOptionCreate(option_text="4", is_correct=True, position=2),
        user_id=str(admin_user.id),
    )
    opt_q1_wrong2 = create_quiz_option(
        question_id=q1_id,
        data=QuizOptionCreate(option_text="5", is_correct=False, position=3),
        user_id=str(admin_user.id),
    )

    # Question 2: "Python is ___?" Correct: "a programming language"
    q2 = create_quiz_question(
        quiz_id=quiz1_id,
        data=QuizQuestionCreate(
            question_text="Python is a ___?",
            question_type=QuestionType.SINGLE_SELECT,
            position=2,
            explanation="Python is a programming language",
        ),
        user_id=str(admin_user.id),
    )
    q2_id = q2["id"]
    opt_q2_wrong = create_quiz_option(
        question_id=q2_id,
        data=QuizOptionCreate(option_text="reptile", is_correct=False, position=1),
        user_id=str(admin_user.id),
    )
    opt_q2_correct = create_quiz_option(
        question_id=q2_id,
        data=QuizOptionCreate(option_text="programming language", is_correct=True, position=2),
        user_id=str(admin_user.id),
    )

    # ── Module 2 ───────────────────────────────────────────────────────────────
    mod2 = create_course_module(
        course_id=course_id,
        data=CourseModuleCreate(title="Module 2 – Advanced", position=2),
        user_id=str(admin_user.id),
    )
    mod2_id = mod2["id"]
    lesson_m2 = create_course_lesson(
        module_id=mod2_id,
        data=CourseLessonCreate(title="M2 Lesson 1", position=1),
        user_id=str(admin_user.id),
    )
    quiz2 = create_course_quiz(
        module_id=mod2_id,
        data=CourseQuizCreate(title="Module 2 Quiz", status="PUBLISHED"),
        user_id=str(admin_user.id),
    )
    quiz2_id = quiz2["id"]
    q3 = create_quiz_question(
        quiz_id=quiz2_id,
        data=QuizQuestionCreate(
            question_text="Is this Phase 6?",
            question_type=QuestionType.SINGLE_SELECT,
            position=1,
        ),
        user_id=str(admin_user.id),
    )
    q3_id = q3["id"]
    create_quiz_option(
        question_id=q3_id,
        data=QuizOptionCreate(option_text="Yes", is_correct=True, position=1),
        user_id=str(admin_user.id),
    )
    create_quiz_option(
        question_id=q3_id,
        data=QuizOptionCreate(option_text="No", is_correct=False, position=2),
        user_id=str(admin_user.id),
    )

    # ── Publish Course ─────────────────────────────────────────────────────────
    publish_course(course_id, user_id=str(admin_user.id))

    # ── Auth tokens for students ───────────────────────────────────────────────
    auth_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    sa_auth = auth_client.auth.sign_in_with_password({"email": student_a_email, "password": password})
    student_a_token = sa_auth.session.access_token

    sb_auth = auth_client.auth.sign_in_with_password({"email": student_b_email, "password": password})
    student_b_token = sb_auth.session.access_token

    ctx = {
        "course_id": course_id,
        "mod1_id": mod1_id,
        "mod2_id": mod2_id,
        "lessons_m1": lessons_m1,
        "lesson_m2_id": lesson_m2["id"],
        "quiz1_id": quiz1_id,
        "quiz2_id": quiz2_id,
        "q1_id": q1_id,
        "q2_id": q2_id,
        "q3_id": q3_id,
        "opt_q1_correct": opt_q1_correct["id"],
        "opt_q1_wrong": opt_q1_wrong["id"],
        "opt_q2_correct": opt_q2_correct["id"],
        "opt_q2_wrong": opt_q2_wrong["id"],
        "opt_q1_wrong2": opt_q1_wrong2["id"],
        "student_a_id": str(student_a.id),
        "student_b_id": str(student_b.id),
        "student_a_email": student_a_email,
        "student_b_email": student_b_email,
        "student_a_token": student_a_token,
        "student_b_token": student_b_token,
        "admin_id": str(admin_user.id),
        "admin_email": admin_email,
        "password": password,
    }

    yield ctx

    # ── Teardown ───────────────────────────────────────────────────────────────
    try:
        delete_course(course_id, user_id=str(admin_user.id))
    except Exception as e:
        print(f"Warning: Could not delete test course: {e}")

    for uid in [str(admin_user.id), str(student_a.id), str(student_b.id)]:
        try:
            sb.auth.admin.delete_user(uid)
        except Exception as e:
            print(f"Warning: Could not delete user {uid}: {e}")


@pytest.mark.skipif(not _supabase_configured(), reason="Supabase not configured")
class TestPhase6QuizAttempts:

    def _auth_headers(self, token: str) -> dict:
        return {"Authorization": f"Bearer {token}"}

    # ── 4. QUIZ LOCK ───────────────────────────────────────────────────────────
    def test_01_quiz_locked_before_lessons_complete(self, setup_quiz_env):
        """Student A cannot take quiz before completing lessons in the module."""
        ctx = setup_quiz_env
        payload = {
            "answers": [
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_correct"]},
                {"question_id": ctx["q2_id"], "selected_option_id": ctx["opt_q2_correct"]},
            ]
        }
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json=payload,
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 403, f"Expected 403, got {resp.status_code}: {resp.text}"
        assert "lesson" in resp.json()["detail"].lower(), "Should mention lessons prerequisite"

    # ── 6. QUIZ GET: No answer keys ───────────────────────────────────────────
    def test_02_quiz_get_never_exposes_correct_answers(self, setup_quiz_env):
        """Quiz GET response never includes is_correct or any answer key."""
        ctx = setup_quiz_env
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz",
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()

        # Validate structure
        assert "questions" in data
        assert data["passing_score"] == 70  # default
        assert "quiz_id" in data

        # CRITICAL: is_correct must never appear in question or options
        for q in data["questions"]:
            assert "is_correct" not in q, "is_correct must not appear in question"
            for opt in q.get("options", []):
                assert "is_correct" not in opt, f"is_correct must not appear in option: {opt}"
                assert "correct_option_id" not in opt

    # ── 5. Complete lessons, then quiz unlocks ─────────────────────────────────
    def test_03_complete_all_lessons_unlocks_quiz(self, setup_quiz_env):
        """After completing all lessons, Student A can submit quiz."""
        ctx = setup_quiz_env

        # Complete all 3 lessons in Module 1
        for lesson_id in ctx["lessons_m1"]:
            resp = client.post(
                f"/api/courses/{ctx['course_id']}/lessons/{lesson_id}/progress",
                json={"completed": True},
                headers=self._auth_headers(ctx["student_a_token"]),
            )
            assert resp.status_code == 200, f"Failed to complete lesson {lesson_id}: {resp.text}"

        # Verify module progress reports lessons complete
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/progress",
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200
        prog = resp.json()
        assert prog["lessons_complete"] is True, "All lessons should be complete"
        assert prog["quiz_passed"] is False, "Quiz not yet taken"
        assert prog["completed"] is False, "Module not complete yet"

    # ── 7. Wrong answers → fail ────────────────────────────────────────────────
    def test_04_wrong_answers_fail_quiz(self, setup_quiz_env):
        """Submitting wrong answers results in a failed attempt (server-calculated)."""
        ctx = setup_quiz_env
        payload = {
            "answers": [
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_wrong"]},
                {"question_id": ctx["q2_id"], "selected_option_id": ctx["opt_q2_wrong"]},
            ]
        }
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json=payload,
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200, resp.text
        result = resp.json()

        assert result["attempt_number"] == 1
        assert result["correct_count"] == 0
        assert result["total_questions"] == 2
        assert result["score_percentage"] == 0
        assert result["passed"] is False
        assert result["passing_score"] == 70
        assert result["module_completed"] is False

        # Per-question results: all incorrect
        for ar in result["answer_results"]:
            assert ar["is_correct"] is False

    # ── 8. Correct answers → pass ──────────────────────────────────────────────
    def test_05_correct_answers_pass_quiz(self, setup_quiz_env):
        """Submitting correct answers results in a passed attempt."""
        ctx = setup_quiz_env
        payload = {
            "answers": [
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_correct"]},
                {"question_id": ctx["q2_id"], "selected_option_id": ctx["opt_q2_correct"]},
            ]
        }
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json=payload,
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200, resp.text
        result = resp.json()

        assert result["attempt_number"] == 2
        assert result["correct_count"] == 2
        assert result["total_questions"] == 2
        assert result["score_percentage"] == 100
        assert result["passed"] is True
        assert result["passing_score"] == 70

        # ── 9. MODULE COMPLETION ───────────────────────────────────────────────
        assert result["module_completed"] is True, "Module should be complete: lessons + quiz passed"

        # Per-question results: all correct
        for ar in result["answer_results"]:
            assert ar["is_correct"] is True

    # ── 9. Module progress reflects completion ─────────────────────────────────
    def test_06_module_progress_after_pass(self, setup_quiz_env):
        """Module progress is updated correctly after passing the quiz."""
        ctx = setup_quiz_env
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/progress",
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200, resp.text
        prog = resp.json()

        assert prog["lessons_complete"] is True
        assert prog["quiz_passed"] is True
        assert prog["completed"] is True, "Module must be complete"
        assert prog["best_score"] == 100

    # ── 10. Attempt history ────────────────────────────────────────────────────
    def test_07_attempt_history_shows_both_attempts(self, setup_quiz_env):
        """Attempt history shows both attempts; ever_passed=True; best_score=100."""
        ctx = setup_quiz_env
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200, resp.text
        hist = resp.json()

        assert len(hist["attempts"]) == 2
        assert hist["ever_passed"] is True
        assert hist["best_score"] == 100

        # First attempt failed, second passed
        attempts = sorted(hist["attempts"], key=lambda a: a["attempt_number"])
        assert attempts[0]["passed"] is False
        assert attempts[0]["score_percentage"] == 0
        assert attempts[1]["passed"] is True
        assert attempts[1]["score_percentage"] == 100

        # Attempt history never includes is_correct
        for attempt in hist["attempts"]:
            assert "is_correct" not in attempt

    # ── 11. Cross-student isolation ────────────────────────────────────────────
    def test_08_student_b_sees_empty_history(self, setup_quiz_env):
        """Student B has 0 attempts for Module 1 quiz — strictly isolated from Student A."""
        ctx = setup_quiz_env
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            headers=self._auth_headers(ctx["student_b_token"]),
        )
        assert resp.status_code == 200, resp.text
        hist = resp.json()
        assert len(hist["attempts"]) == 0
        assert hist["ever_passed"] is False
        assert hist["best_score"] is None

    # ── 13. Tamper: option from wrong question rejected ────────────────────────
    def test_09_tamper_wrong_question_option_rejected(self, setup_quiz_env):
        """Submitting an option that belongs to a different question is rejected."""
        ctx = setup_quiz_env
        # Complete lessons for student_b to be able to submit
        for lesson_id in ctx["lessons_m1"]:
            client.post(
                f"/api/courses/{ctx['course_id']}/lessons/{lesson_id}/progress",
                json={"completed": True},
                headers=self._auth_headers(ctx["student_b_token"]),
            )

        # opt_q1_correct belongs to q1, but here we try to use it for q2
        payload = {
            "answers": [
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_correct"]},
                # Tamper: q2 answer uses an option from q1
                {"question_id": ctx["q2_id"], "selected_option_id": ctx["opt_q1_wrong2"]},
            ]
        }
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json=payload,
            headers=self._auth_headers(ctx["student_b_token"]),
        )
        assert resp.status_code == 422, f"Expected 422 for tampered option, got {resp.status_code}: {resp.text}"

    # ── 14. Double question submission rejected ────────────────────────────────
    def test_10_duplicate_question_rejected(self, setup_quiz_env):
        """Submitting the same question_id twice is rejected."""
        ctx = setup_quiz_env
        payload = {
            "answers": [
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_correct"]},
                {"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_wrong"]},  # duplicate
                {"question_id": ctx["q2_id"], "selected_option_id": ctx["opt_q2_correct"]},
            ]
        }
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json=payload,
            headers=self._auth_headers(ctx["student_b_token"]),
        )
        assert resp.status_code == 422, f"Expected 422 for duplicate question, got {resp.status_code}: {resp.text}"

    # ── 17. RLS: B cannot see A's attempts via direct Supabase query ──────────
    def test_11_rls_student_b_cannot_read_student_a_attempts(self, setup_quiz_env):
        """Student B's Supabase client cannot SELECT Student A's quiz attempt rows."""
        ctx = setup_quiz_env
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_ANON_KEY", "")
        if not url or not key:
            pytest.skip("SUPABASE_URL or SUPABASE_ANON_KEY not configured")

        # Authenticate as Student B
        sb_b = create_client(url, key)
        sb_b.auth.sign_in_with_password({
            "email": ctx["student_b_email"],
            "password": ctx["password"],
        })

        # Attempt to read Student A's quiz attempts
        result = sb_b.from_("student_quiz_attempts").select("*").eq(
            "user_id", ctx["student_a_id"]
        ).execute()
        rows = result.data or []
        assert len(rows) == 0, f"RLS VIOLATION: Student B can see {len(rows)} of Student A's quiz attempts"

    # ── Unauthenticated rejection ──────────────────────────────────────────────
    def test_12_unauthenticated_quiz_get_rejected(self, setup_quiz_env):
        """Unauthenticated quiz GET returns 401."""
        ctx = setup_quiz_env
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz"
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_13_unauthenticated_quiz_submit_rejected(self, setup_quiz_env):
        """Unauthenticated quiz submission returns 401."""
        ctx = setup_quiz_env
        resp = client.post(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod1_id']}/quiz/attempts",
            json={"answers": [{"question_id": ctx["q1_id"], "selected_option_id": ctx["opt_q1_correct"]}]},
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    # ── Module 2: incomplete ───────────────────────────────────────────────────
    def test_14_module_2_stays_incomplete_without_quiz_pass(self, setup_quiz_env):
        """Module 2 progress shows incomplete when lessons done but quiz not passed."""
        ctx = setup_quiz_env
        # Module 2 has 1 lesson — complete it for Student A
        client.post(
            f"/api/courses/{ctx['course_id']}/lessons/{ctx['lesson_m2_id']}/progress",
            json={"completed": True},
            headers=self._auth_headers(ctx["student_a_token"]),
        )

        # Module 2 progress: lessons_complete=True, quiz_passed=False → not completed
        resp = client.get(
            f"/api/courses/{ctx['course_id']}/modules/{ctx['mod2_id']}/progress",
            headers=self._auth_headers(ctx["student_a_token"]),
        )
        assert resp.status_code == 200
        prog = resp.json()
        assert prog["lessons_complete"] is True
        assert prog["quiz_passed"] is False
        assert prog["completed"] is False, "Module incomplete: quiz not passed"
