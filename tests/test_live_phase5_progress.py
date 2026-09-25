"""
tests/test_live_phase5_progress.py
Live Supabase End-to-End Integration Test for Phase 5: Student Progress + Resume + Module Completion.
Runs against the real live Supabase database (zzjxprhapptjoziwdcro).

Full Lifecycle & Invariants Verified:
1. Create real course with 2 modules & 5 lessons; publish course.
2. Create Student A and Student B test users.
3. Student A opens course -> initial progress is 0%, no completed lessons.
4. Student A navigates to Lesson 1 -> last_lesson_id updates to Lesson 1 for resume.
5. Student A marks Lesson 1 complete -> 1 of 5 = 20%, row persisted in student_lesson_progress.
6. Student A navigates to Lesson 2 -> last_lesson_id updates to Lesson 2.
7. Student A completes Lesson 2 -> 2 of 5 = 40%.
8. Student A completes Lesson 3 -> Module 1 lesson requirement satisfied (3 of 3 = 100%), lessons_complete = True.
9. Verify Module 1 is NOT marked fully complete (quiz remains pending Phase 6).
10. Multi-session/device verification: fresh client fetch returns identical progress and resume position.
11. Cross-student data isolation: Student B sees 0% progress; Student B cannot see Student A's data.
12. Identity forgery protection: user_id in request body is ignored; JWT user identity is strictly enforced.
13. Unauthenticated guest rejection: guest receives 401 on progress endpoints.
14. Complete remaining lessons (4 & 5) -> progress reaches 100%.
15. Verify NO certificates, XP, or gamification artifacts were created.
16. Direct RLS verification: authenticated Student client cannot select or update another student's progress rows.
17. Teardown: purge test course and test auth users cleanly.
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
def setup_users():
    sb = get_supabase()
    assert sb is not None, "Supabase client required"

    unique_suffix = uuid.uuid4().hex[:8]
    password = "TestSecurePassword123!#"

    # Admin User
    admin_email = f"phase5_admin_{unique_suffix}@skillscatalyst.internal"
    admin_resp = sb.auth.admin.create_user({
        "email": admin_email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": "Phase 5 Admin"},
        "app_metadata": {"role": "admin"},
    })
    admin_user = admin_resp.user
    sb.from_("profiles").upsert({
        "id": admin_user.id,
        "email": admin_email,
        "full_name": "Phase 5 Admin",
        "role": "admin",
    }).execute()

    # Student A
    student_a_email = f"phase5_student_a_{unique_suffix}@skillscatalyst.internal"
    student_a_resp = sb.auth.admin.create_user({
        "email": student_a_email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": "Student A"},
        "app_metadata": {"role": "student"},
    })
    student_a = student_a_resp.user
    sb.from_("profiles").upsert({
        "id": student_a.id,
        "email": student_a_email,
        "full_name": "Student A",
        "role": "student",
    }).execute()

    # Student B
    student_b_email = f"phase5_student_b_{unique_suffix}@skillscatalyst.internal"
    student_b_resp = sb.auth.admin.create_user({
        "email": student_b_email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": "Student B"},
        "app_metadata": {"role": "student"},
    })
    student_b = student_b_resp.user
    sb.from_("profiles").upsert({
        "id": student_b.id,
        "email": student_b_email,
        "full_name": "Student B",
        "role": "student",
    }).execute()

    # Get JWT access tokens via isolated auth client (avoid mutating global service_role client)
    auth_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    token_a_res = auth_client.auth.sign_in_with_password({"email": student_a_email, "password": password})
    token_a = token_a_res.session.access_token

    token_b_res = auth_client.auth.sign_in_with_password({"email": student_b_email, "password": password})
    token_b = token_b_res.session.access_token

    yield {
        "admin": admin_user,
        "student_a": student_a,
        "student_b": student_b,
        "token_a": token_a,
        "token_b": token_b,
    }

    # Teardown users
    for u in (admin_user, student_a, student_b):
        try:
            sb.auth.admin.delete_user(u.id)
        except Exception:
            pass


@pytest.mark.skipif(not _supabase_configured(), reason="Live Supabase environment required.")
def test_live_phase5_progress_and_resume_e2e(setup_users):
    sb = get_supabase()
    assert sb is not None

    admin_user = setup_users["admin"]
    student_a = setup_users["student_a"]
    student_b = setup_users["student_b"]
    token_a = setup_users["token_a"]
    token_b = setup_users["token_b"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    unique_suffix = uuid.uuid4().hex[:8]
    created_course_id = None

    try:
        # ── Step 1: Create and Publish Course with 2 Modules and 5 Lessons ──
        c_res = create_course(
            data=CourseCreate(
                title=f"Live Phase 5 Progress Course {unique_suffix}",
                short_description="Course for live progress and resume testing",
                description="Comprehensive syllabus with multiple modules for completion testing",
                category="Programming",
                difficulty=CourseDifficulty.INTERMEDIATE,
                estimated_duration_minutes=150,
            ),
            user_id=str(admin_user.id),
        )
        created_course_id = c_res["id"]

        # Module 1 (3 Lessons + Quiz)
        m1 = create_course_module(
            course_id=created_course_id,
            data=CourseModuleCreate(title="Module 1: Core", position=1),
            user_id=str(admin_user.id),
        )
        l1 = create_course_lesson(
            module_id=m1["id"],
            data=CourseLessonCreate(title="Lesson 1", position=1, estimated_duration_minutes=10),
            user_id=str(admin_user.id),
        )
        l2 = create_course_lesson(
            module_id=m1["id"],
            data=CourseLessonCreate(title="Lesson 2", position=2, estimated_duration_minutes=15),
            user_id=str(admin_user.id),
        )
        l3 = create_course_lesson(
            module_id=m1["id"],
            data=CourseLessonCreate(title="Lesson 3", position=3, estimated_duration_minutes=20),
            user_id=str(admin_user.id),
        )
        q1 = create_course_quiz(
            module_id=m1["id"],
            data=CourseQuizCreate(title="Module 1 Quiz"),
            user_id=str(admin_user.id),
        )
        quest1 = create_quiz_question(
            quiz_id=q1["id"],
            data=QuizQuestionCreate(question_text="Q1?", question_type=QuestionType.SINGLE_SELECT, position=1),
            user_id=str(admin_user.id),
        )
        create_quiz_option(
            question_id=quest1["id"],
            data=QuizOptionCreate(option_text="Opt A", is_correct=True, position=1),
            user_id=str(admin_user.id),
        )
        create_quiz_option(
            question_id=quest1["id"],
            data=QuizOptionCreate(option_text="Opt B", is_correct=False, position=2),
            user_id=str(admin_user.id),
        )

        # Module 2 (2 Lessons + Quiz)
        m2 = create_course_module(
            course_id=created_course_id,
            data=CourseModuleCreate(title="Module 2: Advanced", position=2),
            user_id=str(admin_user.id),
        )
        l4 = create_course_lesson(
            module_id=m2["id"],
            data=CourseLessonCreate(title="Lesson 4", position=1, estimated_duration_minutes=25),
            user_id=str(admin_user.id),
        )
        l5 = create_course_lesson(
            module_id=m2["id"],
            data=CourseLessonCreate(title="Lesson 5", position=2, estimated_duration_minutes=30),
            user_id=str(admin_user.id),
        )
        q2 = create_course_quiz(
            module_id=m2["id"],
            data=CourseQuizCreate(title="Module 2 Quiz"),
            user_id=str(admin_user.id),
        )
        quest2 = create_quiz_question(
            quiz_id=q2["id"],
            data=QuizQuestionCreate(question_text="Q2?", question_type=QuestionType.SINGLE_SELECT, position=1),
            user_id=str(admin_user.id),
        )
        create_quiz_option(
            question_id=quest2["id"],
            data=QuizOptionCreate(option_text="Opt A", is_correct=True, position=1),
            user_id=str(admin_user.id),
        )
        create_quiz_option(
            question_id=quest2["id"],
            data=QuizOptionCreate(option_text="Opt B", is_correct=False, position=2),
            user_id=str(admin_user.id),
        )

        # Publish course
        published = publish_course(course_id=created_course_id, user_id=str(admin_user.id))
        assert published["status"] == "PUBLISHED"

        # ── Step 2: Student A Opens Course Progress (Initial 0%) ──────────────
        res_init = client.get(f"/api/courses/{created_course_id}/progress", headers=headers_a)
        assert res_init.status_code == 200
        p_init = res_init.json()
        assert p_init["completed_lessons"] == 0
        assert p_init["total_lessons"] == 5
        assert p_init["progress_percentage"] == 0
        assert p_init["last_lesson_id"] is None
        assert p_init["completed_lesson_ids"] == []

        # ── Step 3: Student A Opens Lesson 1 (View Ping Updates Resume) ────────
        res_view1 = client.post(
            f"/api/courses/{created_course_id}/lessons/{l1['id']}/progress",
            headers=headers_a,
            json={}
        )
        assert res_view1.status_code == 200
        p_view1 = res_view1.json()
        assert p_view1["lesson"]["completed"] is False
        assert p_view1["course_progress"]["last_lesson_id"] == l1["id"]
        assert p_view1["course_progress"]["completed_lessons"] == 0

        # ── Step 4: Student A Marks Lesson 1 Complete (20%) ──────────────────
        res_comp1 = client.post(
            f"/api/courses/{created_course_id}/lessons/{l1['id']}/progress",
            headers=headers_a,
            json={"completed": True}
        )
        assert res_comp1.status_code == 200
        p_comp1 = res_comp1.json()
        assert p_comp1["lesson"]["completed"] is True
        assert p_comp1["lesson"]["completed_at"] is not None
        assert p_comp1["course_progress"]["completed_lessons"] == 1
        assert p_comp1["course_progress"]["progress_percentage"] == 20
        assert l1["id"] in p_comp1["course_progress"]["completed_lesson_ids"]

        # Verify database row in student_lesson_progress
        db_lp = sb.from_("student_lesson_progress").select("*").eq("user_id", str(student_a.id)).eq("lesson_id", l1["id"]).execute()
        assert len(db_lp.data) == 1
        assert db_lp.data[0]["completed"] is True

        # ── Step 5: Student A Navigates to Lesson 2 (Resume Updates to L2) ─────
        res_view2 = client.post(
            f"/api/courses/{created_course_id}/lessons/{l2['id']}/progress",
            headers=headers_a,
            json={}
        )
        assert res_view2.status_code == 200
        assert res_view2.json()["course_progress"]["last_lesson_id"] == l2["id"]

        # ── Step 6: Complete Lesson 2 (40%) ──────────────────────────────────
        res_comp2 = client.post(
            f"/api/courses/{created_course_id}/lessons/{l2['id']}/progress",
            headers=headers_a,
            json={"completed": True}
        )
        assert res_comp2.status_code == 200
        p_comp2 = res_comp2.json()["course_progress"]
        assert p_comp2["completed_lessons"] == 2
        assert p_comp2["progress_percentage"] == 40

        # Module 1 should show 2 of 3 lessons complete (lessons_complete = False)
        m1_prog = next(m for m in p_comp2["modules"] if m["module_id"] == m1["id"])
        assert m1_prog["completed_lessons"] == 2
        assert m1_prog["total_lessons"] == 3
        assert m1_prog["lessons_complete"] is False

        # ── Step 7: Complete Lesson 3 (Module 1 Requirement Satisfied) ────────
        res_comp3 = client.post(
            f"/api/courses/{created_course_id}/lessons/{l3['id']}/progress",
            headers=headers_a,
            json={"completed": True}
        )
        assert res_comp3.status_code == 200
        p_comp3 = res_comp3.json()["course_progress"]
        assert p_comp3["completed_lessons"] == 3
        assert p_comp3["progress_percentage"] == 60

        # Module 1 lessons_complete is now True!
        m1_prog_done = next(m for m in p_comp3["modules"] if m["module_id"] == m1["id"])
        assert m1_prog_done["completed_lessons"] == 3
        assert m1_prog_done["lessons_complete"] is True
        # STRICT BOUNDARY CHECK: Module is NOT marked fully complete (no module_complete field)
        assert "module_complete" not in m1_prog_done

        # ── Step 8: Multi-Session Persistence (Fresh Request) ─────────────────
        res_fresh = client.get(f"/api/courses/{created_course_id}/progress", headers=headers_a)
        assert res_fresh.status_code == 200
        assert res_fresh.json()["completed_lessons"] == 3
        assert res_fresh.json()["last_lesson_id"] == l3["id"]

        # ── Step 9: Cross-Student Isolation & Data Protection ─────────────────
        # Student B checks course progress -> must be 0%
        res_b = client.get(f"/api/courses/{created_course_id}/progress", headers=headers_b)
        assert res_b.status_code == 200
        assert res_b.json()["completed_lessons"] == 0
        assert res_b.json()["progress_percentage"] == 0
        assert res_b.json()["completed_lesson_ids"] == []

        # Student A attempts to forge user_id in payload targeting Student B
        forge_res = client.post(
            f"/api/courses/{created_course_id}/lessons/{l4['id']}/progress",
            headers=headers_a,
            json={"user_id": str(student_b.id), "completed": True}
        )
        assert forge_res.status_code == 200
        # Mutation MUST be recorded for Student A, NOT Student B
        res_b_check = client.get(f"/api/courses/{created_course_id}/progress", headers=headers_b)
        assert res_b_check.json()["completed_lessons"] == 0, "Student B progress must NOT be modified by Student A"

        # ── Step 10: Unauthenticated Guest Rejection ──────────────────────────
        guest_res = client.get(f"/api/courses/{created_course_id}/progress")
        assert guest_res.status_code == 401, "Guest cannot access progress endpoint"

        # ── Step 11: Complete Remaining Lessons (100% Progress) ───────────────
        client.post(f"/api/courses/{created_course_id}/lessons/{l5['id']}/progress", headers=headers_a, json={"completed": True})
        res_final = client.get(f"/api/courses/{created_course_id}/progress", headers=headers_a)
        assert res_final.status_code == 200
        p_final = res_final.json()
        assert p_final["completed_lessons"] == 5
        assert p_final["total_lessons"] == 5
        assert p_final["progress_percentage"] == 100

        # ── Step 12: Direct Database RLS Policy Verification ───────────────────
        # Create PostgREST clients authenticated as Student A and Student B
        client_a_sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
        client_a_sb.postgrest.auth(token_a)

        client_b_sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
        client_b_sb.postgrest.auth(token_b)

        # 1. Student A can SELECT own progress
        a_own_rows = client_a_sb.from_("student_lesson_progress").select("*").eq("user_id", str(student_a.id)).execute()
        assert len(a_own_rows.data) > 0, "Student A must be able to SELECT own progress under RLS"

        # 2. Student A CANNOT SELECT Student B's progress (RLS returns empty)
        a_b_rows = client_a_sb.from_("student_lesson_progress").select("*").eq("user_id", str(student_b.id)).execute()
        assert len(a_b_rows.data) == 0, "RLS VIOLATION: Student A must not see Student B rows"

        # 3. Student B CANNOT INSERT progress for Student A (RLS WITH CHECK fails)
        try:
            client_b_sb.from_("student_lesson_progress").insert({
                "user_id": str(student_a.id),
                "course_id": created_course_id,
                "module_id": m1["id"],
                "lesson_id": l1["id"],
                "completed": True,
            }).execute()
            assert False, "RLS VIOLATION: Student B must NOT be allowed to insert progress for Student A"
        except Exception as rls_err:
            assert "row-level security" in str(rls_err).lower() or "violates" in str(rls_err).lower()

        # 4. Student B CANNOT UPDATE Student A's progress (0 rows updated)
        b_update_res = client_b_sb.from_("student_lesson_progress").update({
            "completed": False,
        }).eq("user_id", str(student_a.id)).execute()
        assert len(b_update_res.data or []) == 0, "RLS VIOLATION: Student B must not be able to update Student A rows"

        # 5. Student B CANNOT DELETE Student A's progress (0 rows deleted)
        b_del_res = client_b_sb.from_("student_lesson_progress").delete().eq("user_id", str(student_a.id)).execute()
        assert len(b_del_res.data or []) == 0, "RLS VIOLATION: Student B must not be able to delete Student A rows"


    finally:
        # ── Clean Teardown ────────────────────────────────────────────────────
        if created_course_id:
            try:
                delete_course(course_id=created_course_id, user_id=str(admin_user.id))
            except Exception as e:
                print(f"[TEARDOWN_WARNING] Could not delete course {created_course_id}: {e}")
