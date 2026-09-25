"""
tests/test_live_course_supabase.py
Live Supabase Integration & RLS Security Verification Suite for Course System (Phase 1).
Runs against the real live Supabase database (zzjxprhapptjoziwdcro).
Performs end-to-end relational CRUD, checks constraints, validates publication rules,
verifies RLS draft/archived protection, and cleans up all created test entities.
"""

import os
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

assert SUPABASE_URL, "SUPABASE_URL must be defined"
assert SUPABASE_SERVICE_KEY, "SUPABASE_SERVICE_KEY must be defined"
assert SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY must be defined"

admin_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
anon_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@pytest.fixture(scope="module")
def admin_user():
    """Finds or creates an admin test user in auth.users."""
    email = f"course_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = admin_client.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Course Admin Tester"},
        "app_metadata": {"role": "admin"}
    })
    user = user_resp.user
    assert user and user.id, f"Failed to create admin user: {user_resp}"

    # Also insert role into profiles table
    try:
        admin_client.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Course Admin Tester",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    # Cleanup user
    try:
        admin_client.auth.admin.delete_user(user.id)
    except Exception:
        pass


def test_live_course_system_lifecycle_and_constraints(admin_user):
    user_id = admin_user.id
    unique_tag = uuid.uuid4().hex[:6]
    created_course_id = None

    try:
        # ── 1. Create Course ──
        c_title = f"Live Automated Course {unique_tag}"
        c_slug = f"live-automated-course-{unique_tag}"
        c_res = admin_client.from_("courses").insert({
            "title": c_title,
            "slug": c_slug,
            "short_description": "Live test course short description",
            "description": "Comprehensive live integration test for course system foundation.",
            "category": "Testing",
            "difficulty": "beginner",
            "estimated_duration_minutes": 60,
            "status": "DRAFT",
            "created_by": user_id,
        }).execute()
        assert c_res.data and len(c_res.data) > 0, "Failed to insert course"
        course = c_res.data[0]
        created_course_id = course["id"]
        assert course["slug"] == c_slug
        assert course["status"] == "DRAFT"

        # ── 2. Verify RLS: Anon CANNOT read DRAFT course ──
        anon_res = anon_client.from_("courses").select("id").eq("id", created_course_id).execute()
        assert len(anon_res.data or []) == 0, "SECURITY VIOLATION: Anon client must not see DRAFT course!"

        # ── 3. Create Module 1 & Module 2 ──
        m1_res = admin_client.from_("course_modules").insert({
            "course_id": created_course_id,
            "title": "Module 1: Foundations",
            "position": 1,
        }).execute()
        assert m1_res.data and len(m1_res.data) > 0
        module_1_id = m1_res.data[0]["id"]

        m2_res = admin_client.from_("course_modules").insert({
            "course_id": created_course_id,
            "title": "Module 2: Advanced",
            "position": 2,
        }).execute()
        assert m2_res.data and len(m2_res.data) > 0
        module_2_id = m2_res.data[0]["id"]

        # ── 4. Create Lessons in Module 1 ──
        l1_res = admin_client.from_("course_lessons").insert({
            "module_id": module_1_id,
            "title": "Lesson 1: Introduction",
            "position": 1,
            "estimated_duration_minutes": 15,
        }).execute()
        assert l1_res.data and len(l1_res.data) > 0
        lesson_1_id = l1_res.data[0]["id"]

        l2_res = admin_client.from_("course_lessons").insert({
            "module_id": module_1_id,
            "title": "Lesson 2: Primitives",
            "position": 2,
            "estimated_duration_minutes": 20,
        }).execute()
        assert l2_res.data and len(l2_res.data) > 0

        # ── 5. Create Module 1 Quiz ──
        q1_res = admin_client.from_("course_quizzes").insert({
            "module_id": module_1_id,
            "title": "Module 1 Quiz",
            "status": "DRAFT",
        }).execute()
        assert q1_res.data and len(q1_res.data) > 0
        quiz_1_id = q1_res.data[0]["id"]

        # ── 6. ATTEMPT DUPLICATE QUIZ FOR MODULE 1 (MUST FAIL IN DATABASE!) ──
        duplicate_failed = False
        try:
            admin_client.from_("course_quizzes").insert({
                "module_id": module_1_id,
                "title": "Illegal Second Quiz",
                "status": "DRAFT",
            }).execute()
        except Exception as e:
            duplicate_failed = True
            assert "uq_course_quizzes_module_id" in str(e) or "duplicate key" in str(e).lower()

        assert duplicate_failed, "CRITICAL DATABASE ERROR: Database allowed duplicate quiz on single module!"

        # ── 7. Create Questions & Options for Module 1 Quiz ──
        qq1_res = admin_client.from_("quiz_questions").insert({
            "quiz_id": quiz_1_id,
            "question_text": "What is Python?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
            "explanation": "Python is a high-level interpreted programming language.",
        }).execute()
        assert qq1_res.data and len(qq1_res.data) > 0
        question_1_id = qq1_res.data[0]["id"]

        # Options for Question 1
        admin_client.from_("quiz_options").insert([
            {"question_id": question_1_id, "option_text": "A programming language", "is_correct": True, "position": 1},
            {"question_id": question_1_id, "option_text": "An operating system", "is_correct": False, "position": 2},
        ]).execute()

        # ── 8. Create Module 2 Quiz & Questions + Options ──
        q2_res = admin_client.from_("course_quizzes").insert({
            "module_id": module_2_id,
            "title": "Module 2 Quiz",
            "status": "DRAFT",
        }).execute()
        quiz_2_id = q2_res.data[0]["id"]

        qq2_res = admin_client.from_("quiz_questions").insert({
            "quiz_id": quiz_2_id,
            "question_text": "Is Python dynamically typed?",
            "question_type": "SINGLE_SELECT",
            "position": 1,
        }).execute()
        question_2_id = qq2_res.data[0]["id"]

        admin_client.from_("quiz_options").insert([
            {"question_id": question_2_id, "option_text": "Yes", "is_correct": True, "position": 1},
            {"question_id": question_2_id, "option_text": "No", "is_correct": False, "position": 2},
        ]).execute()

        # ── 9. Transition Course to PUBLISHED ──
        admin_client.from_("courses").update({
            "status": "PUBLISHED",
            "published_at": "2026-09-25T10:00:00Z",
        }).eq("id", created_course_id).execute()

        # Also publish the quizzes so child RLS permits read
        admin_client.from_("course_quizzes").update({"status": "PUBLISHED"}).eq("id", quiz_1_id).execute()
        admin_client.from_("course_quizzes").update({"status": "PUBLISHED"}).eq("id", quiz_2_id).execute()

        # ── 10. Verify RLS: Anon CAN now read PUBLISHED Course & Modules ──
        anon_pub_res = anon_client.from_("courses").select("id, title, status").eq("id", created_course_id).execute()
        assert len(anon_pub_res.data or []) == 1, "Anon client should be able to view PUBLISHED course!"
        assert anon_pub_res.data[0]["status"] == "PUBLISHED"

        anon_mod_res = anon_client.from_("course_modules").select("id, title").eq("course_id", created_course_id).execute()
        assert len(anon_mod_res.data or []) == 2, "Anon client should see modules of PUBLISHED course!"

        # ── 11. Archive Course & Verify Anon CANNOT see ARCHIVED Course ──
        admin_client.from_("courses").update({"status": "ARCHIVED"}).eq("id", created_course_id).execute()
        anon_arch_res = anon_client.from_("courses").select("id").eq("id", created_course_id).execute()
        assert len(anon_arch_res.data or []) == 0, "SECURITY VIOLATION: Anon client must not see ARCHIVED course!"

        # ── 12. Audit Log Insertion ──
        audit_res = admin_client.from_("audit_logs").insert({
            "action": "course_published",
            "entity_type": "course",
            "entity_id": created_course_id,
            "user_id": user_id,
            "details": {"title": c_title, "status": "PUBLISHED"},
        }).execute()
        assert audit_res.data and len(audit_res.data) > 0, "Failed to insert into audit_logs"

    finally:
        # ── Cleanup from Live Database ──
        if created_course_id:
            try:
                # Deleting course cascades to modules, lessons, quizzes, questions, options
                admin_client.from_("courses").delete().eq("id", created_course_id).execute()
            except Exception as e:
                print(f"Warning during course cleanup: {e}")
            try:
                admin_client.from_("audit_logs").delete().eq("entity_id", created_course_id).execute()
            except Exception:
                pass
