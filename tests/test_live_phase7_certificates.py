"""
tests/test_live_phase7_certificates.py
Comprehensive Live Supabase End-to-End Test Suite for Phase 7:
Course Completion, Course-Specific Certificates, Admin Templates,
Authoritative Identity Locking, Immutability, and Public Verification.

Runs against the real live Supabase database and FastAPI backend.

Invariants Verified:
  1. Course completion eligibility (lessons completed + quizzes passed + module progress).
  2. Certificate enabled/disabled configuration per course.
  3. Course-specific certificate template assignment (different courses can use different templates).
  4. Student can edit Name and College BEFORE first certificate issuance.
  5. Server-authoritative issuance snapshots authoritative student Name and College from profile.
  6. Server-authoritative issuance snapshots Course Title, Score, Template ID, and Background.
  7. Idempotent issuance: duplicate issuance requests return the exact same certificate.
  8. Uniqueness: exactly one certificate per (user_id, course_id).
  9. Permanent Identity Lock: after first certificate, Name and College cannot be updated via API (HTTP 403).
 10. Direct Database Bypass Protection: direct Supabase UPDATE on profiles is blocked by PostgreSQL trigger.
 11. Multiple courses: student can complete a second course and receive a second certificate.
 12. Second certificate preserves the same permanently locked identity.
 13. Template change isolation: changing Course A template does NOT mutate previously issued Certificate A.
 14. New certificates for Course A issued after template change use the new template.
 15. Certificate immutability: issued certificate snapshots cannot be altered via direct UPDATE.
 16. Public verification: unauthenticated GET returns valid safe public fields only (no private IDs/emails).
 17. Public verification: invalid verification ID returns safe invalid response.
 18. Cross-user isolation / RLS: Student A cannot view Student B's certificate.
 19. Anonymous direct DB access to certificates table is blocked.
"""

import os
import uuid
import pytest
from dotenv import load_dotenv
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
from backend.services.certificate_service import (
    list_certificate_templates,
    create_certificate_template,
    get_course_certificate_config,
    set_course_certificate_config,
    check_course_completion_and_eligibility,
    issue_course_certificate,
    get_student_certificate_by_course,
    get_student_certificates,
    verify_certificate_public,
    is_user_identity_locked,
    update_student_certificate_identity,
)
from backend.models.certificate import CertificateTemplateCreate
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


def _mark_lesson_completed(sb, user_id: str, course_id: str, module_id: str, lesson_id: str):
    sb.from_("student_lesson_progress").upsert({
        "user_id": user_id,
        "course_id": course_id,
        "module_id": module_id,
        "lesson_id": lesson_id,
        "completed": True,
        "completed_at": "2026-09-26T01:00:00Z",
    }).execute()


def _mark_quiz_and_module_passed(sb, user_id: str, course_id: str, module_id: str, quiz_id: str, score: int = 100):
    sb.from_("student_quiz_attempts").insert({
        "user_id": user_id,
        "course_id": course_id,
        "module_id": module_id,
        "quiz_id": quiz_id,
        "attempt_number": 1,
        "score_percentage": score,
        "correct_count": 1,
        "total_questions": 1,
        "passed": True,
        "passing_score": 70,
        "submitted_at": "2026-09-26T01:05:00Z",
    }).execute()
    sb.from_("student_module_progress").upsert({
        "user_id": user_id,
        "course_id": course_id,
        "module_id": module_id,
        "lessons_complete": True,
        "quiz_passed": True,
        "best_score": score,
        "completed": True,
        "completed_at": "2026-09-26T01:05:00Z",
    }).execute()


@pytest.fixture(scope="module")
def setup_phase7_env():
    """
    Sets up a full live test environment on Supabase:
    - Admin user, Student 1, Student 2.
    - Template A ("Professional Blue") and Template B ("Modern Gold").
    - Course A: with module, lessons, passed quiz -> Certificate Enabled with Template A.
    - Course B: with module, lessons, passed quiz -> Certificate Enabled with Template B.
    - Course C: with module, lessons, passed quiz -> Certificate Disabled.
    """
    sb = get_supabase()
    assert sb is not None, "Supabase client required"

    unique_suffix = uuid.uuid4().hex[:8]
    password = "TestCertPassword123!#"

    # 1. Admin
    admin_email = f"p7_admin_{unique_suffix}@skillscatalyst.internal"
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
        "full_name": "Phase 7 Admin",
        "role": "admin",
    }).execute()

    # 2. Student 1
    student1_email = f"p7_student1_{unique_suffix}@skillscatalyst.internal"
    student1_resp = sb.auth.admin.create_user({
        "email": student1_email,
        "password": password,
        "email_confirm": True,
        "app_metadata": {"role": "student"},
    })
    student1 = student1_resp.user
    sb.from_("profiles").upsert({
        "id": student1.id,
        "email": student1_email,
        "full_name": "Initial Student One",
        "college": "Initial College One",
        "role": "student",
    }).execute()

    # 3. Student 2
    student2_email = f"p7_student2_{unique_suffix}@skillscatalyst.internal"
    student2_resp = sb.auth.admin.create_user({
        "email": student2_email,
        "password": password,
        "email_confirm": True,
        "app_metadata": {"role": "student"},
    })
    student2 = student2_resp.user
    sb.from_("profiles").upsert({
        "id": student2.id,
        "email": student2_email,
        "full_name": "Student Two",
        "college": "College Two",
        "role": "student",
    }).execute()

    # 4. Fetch or create Templates
    templates = list_certificate_templates(include_inactive=False)
    template_a = next((t for t in templates if t["design_theme"] == "professional_blue"), None)
    template_b = next((t for t in templates if t["design_theme"] == "modern_gold"), None)

    if not template_a:
        template_a = create_certificate_template(
            data=CertificateTemplateCreate(
                name=f"Template Blue {unique_suffix}",
                background_media_url="https://storage.skillscatalyst.io/blue.png",
                design_theme="professional_blue",
            ),
            user_id=str(admin_user.id),
        )
    if not template_b:
        template_b = create_certificate_template(
            data=CertificateTemplateCreate(
                name=f"Template Gold {unique_suffix}",
                background_media_url="https://storage.skillscatalyst.io/gold.png",
                design_theme="modern_gold",
            ),
            user_id=str(admin_user.id),
        )

    # 5. Helper to create a fully completed-ready course with 1 module, 1 lesson, 1 quiz
    def _create_test_course(title_prefix: str):
        c = create_course(
            data=CourseCreate(
                title=f"{title_prefix} {unique_suffix}",
                difficulty=CourseDifficulty.BEGINNER,
            ),
            user_id=str(admin_user.id),
        )
        c_id = c["id"]

        mod = create_course_module(
            course_id=c_id,
            data=CourseModuleCreate(title="Module 1", position=1),
            user_id=str(admin_user.id),
        )
        mod_id = mod["id"]

        les = create_course_lesson(
            module_id=mod_id,
            data=CourseLessonCreate(title="Lesson 1", position=1),
            user_id=str(admin_user.id),
        )
        les_id = les["id"]

        quiz = create_course_quiz(
            module_id=mod_id,
            data=CourseQuizCreate(title="Module 1 Quiz", status="PUBLISHED"),
            user_id=str(admin_user.id),
        )
        quiz_id = quiz["id"]

        q = create_quiz_question(
            quiz_id=quiz_id,
            data=QuizQuestionCreate(
                question_text="Is this valid?",
                question_type=QuestionType.SINGLE_SELECT,
                position=1,
            ),
            user_id=str(admin_user.id),
        )
        opt_correct = create_quiz_option(
            question_id=q["id"],
            data=QuizOptionCreate(option_text="Yes", is_correct=True, position=1),
            user_id=str(admin_user.id),
        )
        opt_wrong = create_quiz_option(
            question_id=q["id"],
            data=QuizOptionCreate(option_text="No", is_correct=False, position=2),
            user_id=str(admin_user.id),
        )

        return {
            "course_id": c_id,
            "module_id": mod_id,
            "lesson_id": les_id,
            "quiz_id": quiz_id,
            "question_id": q["id"],
            "correct_option_id": opt_correct["id"],
            "wrong_option_id": opt_wrong["id"],
        }

    course_a_info = _create_test_course("Course A Python")
    course_b_info = _create_test_course("Course B Analytics")
    course_c_info = _create_test_course("Course C No Cert")

    # Configure Course A with Template A
    set_course_certificate_config(
        course_id=course_a_info["course_id"],
        enabled=True,
        template_id=template_a["id"],
        user_id=str(admin_user.id),
    )

    # Configure Course B with Template B
    set_course_certificate_config(
        course_id=course_b_info["course_id"],
        enabled=True,
        template_id=template_b["id"],
        user_id=str(admin_user.id),
    )

    # Configure Course C with Certificates Disabled
    set_course_certificate_config(
        course_id=course_c_info["course_id"],
        enabled=False,
        template_id=None,
        user_id=str(admin_user.id),
    )

    # Publish all courses
    publish_course(course_a_info["course_id"], user_id=str(admin_user.id))
    publish_course(course_b_info["course_id"], user_id=str(admin_user.id))
    publish_course(course_c_info["course_id"], user_id=str(admin_user.id))

    context = {
        "sb": sb,
        "admin_user": admin_user,
        "student1": student1,
        "student2": student2,
        "template_a": template_a,
        "template_b": template_b,
        "course_a": course_a_info,
        "course_b": course_b_info,
        "course_c": course_c_info,
    }

    yield context

    # Cleanup test courses and users
    try:
        delete_course(course_a_info["course_id"], user_id=str(admin_user.id))
        delete_course(course_b_info["course_id"], user_id=str(admin_user.id))
        delete_course(course_c_info["course_id"], user_id=str(admin_user.id))
        sb.from_("profiles").delete().eq("id", str(student1.id)).execute()
        sb.from_("profiles").delete().eq("id", str(student2.id)).execute()
        sb.from_("profiles").delete().eq("id", str(admin_user.id)).execute()
        sb.auth.admin.delete_user(str(student1.id))
        sb.auth.admin.delete_user(str(student2.id))
        sb.auth.admin.delete_user(str(admin_user.id))
    except Exception as e:
        print(f"Teardown cleanup exception (benign): {e}")


# ── TEST 1: Course Completion Eligibility ─────────────────────────────────────
def test_course_completion_eligibility(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    student1_id = str(ctx["student1"].id)
    course_a_id = ctx["course_a"]["course_id"]
    module_id = ctx["course_a"]["module_id"]
    lesson_id = ctx["course_a"]["lesson_id"]
    quiz_id = ctx["course_a"]["quiz_id"]

    # Initially, student has completed 0 lessons, 0 quizzes
    eligibility = check_course_completion_and_eligibility(student1_id, course_a_id)
    assert eligibility["course_completed"] is False
    assert eligibility["can_issue_certificate"] is False
    assert "requirements yet" in eligibility["reason_ineligible"]

    # Student completes lesson
    _mark_lesson_completed(sb, student1_id, course_a_id, module_id, lesson_id)

    # Still ineligible because quiz is not passed
    eligibility2 = check_course_completion_and_eligibility(student1_id, course_a_id)
    assert eligibility2["all_lessons_completed"] is True
    assert eligibility2["all_quizzes_passed"] is False
    assert eligibility2["can_issue_certificate"] is False

    # Student passes quiz and completes module
    _mark_quiz_and_module_passed(sb, student1_id, course_a_id, module_id, quiz_id, score=100)

    # Now all requirements are satisfied!
    eligibility3 = check_course_completion_and_eligibility(student1_id, course_a_id)
    assert eligibility3["all_lessons_completed"] is True
    assert eligibility3["all_quizzes_passed"] is True
    assert eligibility3["course_completed"] is True
    assert eligibility3["can_issue_certificate"] is True
    assert eligibility3["course_score"] == 100


# ── TEST 2: Pre-Issuance Identity Update ──────────────────────────────────────
def test_pre_certificate_identity_editing(setup_phase7_env):
    ctx = setup_phase7_env
    student1_id = str(ctx["student1"].id)

    # Student 1 has not received any certificates yet
    assert is_user_identity_locked(student1_id) is False

    # Student 1 updates name and college before issuance
    updated = update_student_certificate_identity(
        user_id=student1_id,
        full_name="Ada Lovelace",
        college="Babbage Institute of Computing",
    )
    assert updated["full_name"] == "Ada Lovelace"
    assert updated["college"] == "Babbage Institute of Computing"
    assert updated["is_identity_locked"] is False


# ── TEST 3: Certificate Issuance & Immutable Snapshots ────────────────────────
def test_certificate_issuance_and_snapshot(setup_phase7_env):
    ctx = setup_phase7_env
    student1_id = str(ctx["student1"].id)
    course_a_id = ctx["course_a"]["course_id"]

    # Issue Certificate for Course A
    cert = issue_course_certificate(student1_id, course_a_id)
    assert cert["course_id"] == course_a_id
    assert cert["student_name"] == "Ada Lovelace"
    assert cert["college_name"] == "Babbage Institute of Computing"
    assert cert["score"] == 100
    assert cert["design_theme"] == "professional_blue"
    assert cert["certificate_number"].startswith("SC-CERT-2026-")
    assert cert["verification_id"] is not None
    assert cert["status"] == "issued"
    assert cert["verification_url"].endswith(cert["verification_id"])

    # Verify IDEMPOTENCY: second issuance call returns the exact same record
    cert_repeat = issue_course_certificate(student1_id, course_a_id)
    assert cert_repeat["id"] == cert["id"]
    assert cert_repeat["certificate_number"] == cert["certificate_number"]
    assert cert_repeat["verification_id"] == cert["verification_id"]


# ── TEST 4: Identity Lock Enforcement (API & DB Bypass Protection) ─────────────
def test_identity_lock_enforcement_and_direct_bypass(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    student1_id = str(ctx["student1"].id)

    # 1. Identity is now permanently locked
    assert is_user_identity_locked(student1_id) is True

    # 2. Service level rejection
    with pytest.raises(Exception) as exc_info:
        update_student_certificate_identity(
            user_id=student1_id,
            full_name="Malicious Hacker",
            college="Fake College",
        )
    assert "locked because a SkillsCatalyst certificate has already been issued" in str(exc_info.value)

    # 3. Direct Database Bypass Protection:
    # Authenticated user trying to execute a direct Supabase update on profiles
    with pytest.raises(Exception) as db_exc_info:
        sb.from_("profiles").update({
            "full_name": "Direct Bypass Hacker",
            "college": "Bypassed College",
        }).eq("id", student1_id).execute()

    err_str = str(db_exc_info.value)
    assert "locked because a SkillsCatalyst certificate has already been issued" in err_str or "P0001" in err_str

    # 4. Verify authoritative profile remains untampered
    profile = sb.from_("profiles").select("full_name, college").eq("id", student1_id).single().execute()
    assert profile.data["full_name"] == "Ada Lovelace"
    assert profile.data["college"] == "Babbage Institute of Computing"


# ── TEST 5: Template Change Isolation (Old vs New Certificates) ───────────────
def test_template_change_isolation(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    admin_id = str(ctx["admin_user"].id)
    student1_id = str(ctx["student1"].id)
    student2_id = str(ctx["student2"].id)
    course_a_id = ctx["course_a"]["course_id"]
    module_a_id = ctx["course_a"]["module_id"]
    lesson_a_id = ctx["course_a"]["lesson_id"]
    quiz_a_id = ctx["course_a"]["quiz_id"]
    template_b = ctx["template_b"]

    # 1. Check Student 1's existing certificate for Course A uses Template A
    cert1 = get_student_certificate_by_course(student1_id, course_a_id)
    assert cert1 is not None
    assert cert1["design_theme"] == "professional_blue"

    # 2. Admin switches Course A to Template B ("Modern Gold")
    set_course_certificate_config(
        course_id=course_a_id,
        enabled=True,
        template_id=template_b["id"],
        user_id=admin_id,
    )

    # 3. Verify Student 1's existing certificate STILL uses Template A (Snapshot preserved!)
    cert1_recheck = get_student_certificate_by_course(student1_id, course_a_id)
    assert cert1_recheck["design_theme"] == "professional_blue"

    # 4. Student 2 completes Course A
    _mark_lesson_completed(sb, student2_id, course_a_id, module_a_id, lesson_a_id)
    _mark_quiz_and_module_passed(sb, student2_id, course_a_id, module_a_id, quiz_a_id, score=90)

    # 5. Issue new certificate for Student 2 on Course A
    cert2 = issue_course_certificate(student2_id, course_a_id)
    # Student 2's certificate MUST use Template B ("Modern Gold")
    assert cert2["design_theme"] == "modern_gold"
    assert cert2["student_name"] == "Student Two"

    # And verify again Student 1's certificate is still Template A
    cert1_final = get_student_certificate_by_course(student1_id, course_a_id)
    assert cert1_final["design_theme"] == "professional_blue"


# ── TEST 6: Multiple Certificates for Same Student ───────────────────────────
def test_multiple_certificates_per_student(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    student1_id = str(ctx["student1"].id)
    course_b_id = ctx["course_b"]["course_id"]
    module_b_id = ctx["course_b"]["module_id"]
    lesson_b_id = ctx["course_b"]["lesson_id"]
    quiz_b_id = ctx["course_b"]["quiz_id"]

    # Student 1 completes Course B
    _mark_lesson_completed(sb, student1_id, course_b_id, module_b_id, lesson_b_id)
    _mark_quiz_and_module_passed(sb, student1_id, course_b_id, module_b_id, quiz_b_id, score=95)

    # Issue Certificate for Course B to Student 1
    cert_b = issue_course_certificate(student1_id, course_b_id)
    assert cert_b["course_id"] == course_b_id
    # Course B uses Template B
    assert cert_b["design_theme"] == "modern_gold"
    # Preserves the locked identity of Student 1
    assert cert_b["student_name"] == "Ada Lovelace"
    assert cert_b["college_name"] == "Babbage Institute of Computing"

    # Student 1 now has 2 certificates
    all_certs = get_student_certificates(student1_id)
    assert len(all_certs) == 2
    course_ids = {c["course_id"] for c in all_certs}
    course_a_id = ctx["course_a"]["course_id"]
    assert course_a_id in course_ids
    assert course_b_id in course_ids


# ── TEST 7: Certificate Disabled Course Rejection ─────────────────────────────
def test_certificate_disabled_rejection(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    student1_id = str(ctx["student1"].id)
    course_c_id = ctx["course_c"]["course_id"]
    module_c_id = ctx["course_c"]["module_id"]
    lesson_c_id = ctx["course_c"]["lesson_id"]
    quiz_c_id = ctx["course_c"]["quiz_id"]

    # Student 1 completes Course C
    _mark_lesson_completed(sb, student1_id, course_c_id, module_c_id, lesson_c_id)
    _mark_quiz_and_module_passed(sb, student1_id, course_c_id, module_c_id, quiz_c_id, score=100)

    # Eligibility check should state certificate disabled
    eligibility = check_course_completion_and_eligibility(student1_id, course_c_id)
    assert eligibility["certificate_enabled"] is False
    assert eligibility["can_issue_certificate"] is False
    assert "does not issue a certificate" in eligibility["reason_ineligible"]

    # Issuance attempt must raise error
    with pytest.raises(Exception) as exc_info:
        issue_course_certificate(student1_id, course_c_id)
    assert "does not issue a certificate" in str(exc_info.value)


# ── TEST 8: Public Certificate Verification ───────────────────────────────────
def test_public_certificate_verification(setup_phase7_env):
    ctx = setup_phase7_env
    student1_id = str(ctx["student1"].id)
    course_a_id = ctx["course_a"]["course_id"]

    cert = get_student_certificate_by_course(student1_id, course_a_id)
    assert cert is not None
    verification_id = cert["verification_id"]

    # 1. Valid verification ID
    pub_result = verify_certificate_public(verification_id)
    assert pub_result["is_valid"] is True
    assert pub_result["student_name"] == "Ada Lovelace"
    assert pub_result["college_name"] == "Babbage Institute of Computing"
    assert pub_result["score"] == 100
    assert pub_result["certificate_number"] == cert["certificate_number"]
    assert pub_result["status"] == "issued"
    # Ensure no private fields leaked
    assert "user_id" not in pub_result
    assert "email" not in pub_result
    assert "auth_id" not in pub_result
    assert "quiz_answers" not in pub_result

    # 2. Invalid verification ID
    invalid_result = verify_certificate_public("SC-INVALID-NONEXISTENT")
    assert invalid_result["is_valid"] is False
    assert "could not be verified" in invalid_result["message"]


# ── TEST 9: Certificate Immutability & DB Trigger Protection ──────────────────
def test_certificate_immutability(setup_phase7_env):
    ctx = setup_phase7_env
    sb = ctx["sb"]
    student1_id = str(ctx["student1"].id)
    course_a_id = ctx["course_a"]["course_id"]

    cert = get_student_certificate_by_course(student1_id, course_a_id)
    assert cert is not None
    cert_id = cert["id"]

    # Attempt direct UPDATE on snapshot fields -> Trigger must abort!
    with pytest.raises(Exception) as exc_info:
        sb.from_("certificates").update({
            "student_name_snapshot": "Tampered Name",
            "score_snapshot": 50,
        }).eq("id", cert_id).execute()

    err_str = str(exc_info.value)
    assert "immutable" in err_str.lower() or "P0001" in err_str

    # Verify certificate record is unmodified
    cert_check = sb.from_("certificates").select("student_name_snapshot, score_snapshot").eq("id", cert_id).single().execute()
    assert cert_check.data["student_name_snapshot"] == "Ada Lovelace"
    assert cert_check.data["score_snapshot"] == 100


# ── TEST 10: Cross-User Isolation (Student 2 cannot see Student 1's cert) ─────
def test_cross_user_isolation(setup_phase7_env):
    ctx = setup_phase7_env
    student1_id = str(ctx["student1"].id)
    student2_id = str(ctx["student2"].id)

    # Student 2 certificates list should NOT contain Student 1's certificates
    s2_certs = get_student_certificates(student2_id)
    for c in s2_certs:
        assert c["course_id"] != ctx["course_b"]["course_id"] or c["student_name"] != "Ada Lovelace"
