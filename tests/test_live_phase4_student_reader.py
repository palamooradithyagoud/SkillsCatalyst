"""
tests/test_live_phase4_student_reader.py
Live Supabase End-to-End Integration Test for Phase 4: Student Course Experience.
Uses the real linked Supabase database and storage bucket (zzjxprhapptjoziwdcro).

Full Lifecycle:
1. Create course in DRAFT status -> verify student route GET /api/courses/{id} returns 404 (draft isolation).
2. Create Module 1 with Lesson 1 and Lesson 2.
3. Create Module 2 with Lesson 3.
4. Add quizzes with questions/options to meet publish readiness.
5. Upload real image binary to course-lesson-media storage.
6. Populate Lesson 1 with representative blocks covering all block types.
7. Publish course -> verify status transitions to PUBLISHED.
8. Call student endpoint GET /api/courses -> verify course appears in student discovery list.
9. Call student endpoint GET /api/courses/{id} -> verify syllabus and quiz outline (no answer keys).
10. Call student endpoint GET /api/courses/{id}/lessons/{l1} -> verify all blocks and next_lesson = l2.
11. Call student endpoint GET /api/courses/{id}/lessons/{l2} -> verify module boundary: next_lesson = l3 in Module 2!
12. Call student endpoint GET /api/courses/{id}/lessons/{l3} -> verify final lesson: next_lesson = None.
13. Verify read-only enforcement: POST /api/courses returns 405.
14. Safe teardown: purge course and storage object.
"""

import os
import io
import uuid
import pytest
from PIL import Image
from fastapi.testclient import TestClient

def create_test_image_bytes(color: str = "purple") -> bytes:
    img = Image.new("RGB", (32, 32), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

from backend.main import app
from backend.services.supabase_service import get_supabase
from backend.services.course_media_service import (
    upload_lesson_media,
    delete_lesson_media,
)
from backend.services.course_service import (
    create_course,
    create_course_module,
    create_course_lesson,
    create_course_quiz,
    create_quiz_question,
    create_quiz_option,
    publish_course,
    save_lesson_content,
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

client = TestClient(app)


def _supabase_configured() -> bool:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    return bool(url and key)


@pytest.fixture(scope="module")
def admin_user():
    """Finds or creates an admin test user in auth.users."""
    sb = get_supabase()
    email = f"phase4_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = sb.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Phase 4 Admin"},
        "app_metadata": {"role": "admin"},
    })
    user = user_resp.user
    assert user and user.id

    try:
        sb.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Phase 4 Admin",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    try:
        sb.auth.admin.delete_user(user.id)
    except Exception:
        pass


@pytest.mark.skipif(not _supabase_configured(), reason="Live Supabase environment required.")
def test_live_phase4_student_reader_e2e_workflow(admin_user):
    sb = get_supabase()
    assert sb is not None, "Supabase client must be available"

    test_user_id = str(admin_user.id)
    unique_suffix = uuid.uuid4().hex[:8]
    created_media_id = None
    created_course_id = None

    try:
        # ── Step 1: Create Course in DRAFT status ─────────────────────────────
        course_payload = CourseCreate(
            title=f"Live Phase 4 Test Course {unique_suffix}",
            short_description="Testing student reader experience live",
            description="Detailed syllabus for Phase 4 E2E verification",
            category="Web Development",
            difficulty=CourseDifficulty.BEGINNER,
            estimated_duration_minutes=90,
        )
        course_data = create_course(data=course_payload, user_id=test_user_id)
        created_course_id = course_data["id"]
        assert course_data["status"] == "DRAFT"

        # Verify draft isolation: Student endpoint MUST return 404 for draft course
        draft_res = client.get(f"/api/courses/{created_course_id}")
        assert draft_res.status_code == 404, "Draft course must be hidden from students"

        # ── Step 2: Create Module 1 (2 lessons) & Module 2 (1 lesson) ─────────
        mod1_data = create_course_module(
            course_id=created_course_id,
            data=CourseModuleCreate(title="Module 1: Foundations", position=1),
            user_id=test_user_id,
        )
        mod1_id = mod1_data["id"]

        l1_data = create_course_lesson(
            module_id=mod1_id,
            data=CourseLessonCreate(title="Lesson 1.1: Introduction", position=1, estimated_duration_minutes=15),
            user_id=test_user_id,
        )
        l1_id = l1_data["id"]

        l2_data = create_course_lesson(
            module_id=mod1_id,
            data=CourseLessonCreate(title="Lesson 1.2: Advanced Variables", position=2, estimated_duration_minutes=20),
            user_id=test_user_id,
        )
        l2_id = l2_data["id"]

        mod2_data = create_course_module(
            course_id=created_course_id,
            data=CourseModuleCreate(title="Module 2: Deep Dive", position=2),
            user_id=test_user_id,
        )
        mod2_id = mod2_data["id"]

        l3_data = create_course_lesson(
            module_id=mod2_id,
            data=CourseLessonCreate(title="Lesson 2.1: Async Patterns", position=1, estimated_duration_minutes=25),
            user_id=test_user_id,
        )
        l3_id = l3_data["id"]

        # ── Step 3: Populate Quizzes for Publish Readiness ────────────────────
        q1 = create_course_quiz(module_id=mod1_id, data=CourseQuizCreate(title="Mod 1 Checkpoint"), user_id=test_user_id)
        qq1 = create_quiz_question(
            quiz_id=q1["id"],
            data=QuizQuestionCreate(question_text="Is Python high-level?", question_type=QuestionType.SINGLE_SELECT, position=1),
            user_id=test_user_id,
        )
        create_quiz_option(question_id=qq1["id"], data=QuizOptionCreate(option_text="Yes", is_correct=True, position=1), user_id=test_user_id)
        create_quiz_option(question_id=qq1["id"], data=QuizOptionCreate(option_text="No", is_correct=False, position=2), user_id=test_user_id)

        q2 = create_course_quiz(module_id=mod2_id, data=CourseQuizCreate(title="Mod 2 Checkpoint"), user_id=test_user_id)
        qq2 = create_quiz_question(
            quiz_id=q2["id"],
            data=QuizQuestionCreate(question_text="Is Async non-blocking?", question_type=QuestionType.SINGLE_SELECT, position=1),
            user_id=test_user_id,
        )
        create_quiz_option(question_id=qq2["id"], data=QuizOptionCreate(option_text="Yes", is_correct=True, position=1), user_id=test_user_id)
        create_quiz_option(question_id=qq2["id"], data=QuizOptionCreate(option_text="No", is_correct=False, position=2), user_id=test_user_id)

        # ── Step 4: Upload Real Image Binary to course-lesson-media ───────────
        png_bytes = create_test_image_bytes("purple")
        media_record = upload_lesson_media(
            course_id=created_course_id,
            module_id=mod1_id,
            lesson_id=l1_id,
            file_bytes=png_bytes,
            original_filename=f"student_reader_arch_{unique_suffix}.png",
            content_type="image/png",
            user_id=test_user_id,
        )
        created_media_id = media_record["id"]
        uploaded_image_url = media_record["public_url"]

        # ── Step 5: Save Structured Lesson Content with All 12 Block Types ─────
        blocks_payload = [
            {"id": "b_h2", "type": "heading", "order": 1, "content": {"text": "Architecture Overview", "level": 2}},
            {"id": "b_par", "type": "paragraph", "order": 2, "content": {"text": "Welcome to the live student course experience."}},
            {
                "id": "b_img",
                "type": "image",
                "order": 3,
                "content": {
                    "url": uploaded_image_url,
                    "media_id": created_media_id,
                    "alt": "Verified live architecture diagram",
                    "caption": "Figure 1: Full system data flow",
                },
            },
            {"id": "b_code", "type": "code", "order": 4, "content": {"code": "def run():\n    return 'success'", "language": "python"}},
            {"id": "b_out", "type": "output", "order": 5, "content": {"text": "success\nExit code: 0"}},
            {"id": "b_list", "type": "list", "order": 6, "content": {"style": "bullet", "items": ["Item A", "Item B"]}},
            {"id": "b_tbl", "type": "table", "order": 7, "content": {"headers": ["Col 1", "Col 2"], "rows": [["Val 1", "Val 2"]]}},
            {"id": "b_call", "type": "callout", "order": 8, "content": {"variant": "tip", "title": "Tip", "text": "Practice daily."}},
            {"id": "b_quote", "type": "quote", "order": 9, "content": {"text": "Code is poetry.", "author": "Anonymous"}},
            {"id": "b_yt", "type": "youtube", "order": 10, "content": {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "video_id": "dQw4w9WgXcQ"}},
            {"id": "b_link", "type": "link", "order": 11, "content": {"url": "https://python.org", "text": "Python Docs"}},
            {"id": "b_take", "type": "key_takeaways", "order": 12, "content": {"items": ["Point 1", "Point 2"]}},
        ]

        save_lesson_content(
            course_id=created_course_id,
            module_id=mod1_id,
            lesson_id=l1_id,
            payload_dict={"blocks": blocks_payload},
            user_id=test_user_id,
        )

        # ── Step 6: Publish the Course ────────────────────────────────────────
        published_course = publish_course(course_id=created_course_id, user_id=test_user_id)
        assert published_course["status"] == "PUBLISHED"

        # ── Step 7: Verify Student Discovery (GET /api/courses) ───────────────
        disc_res = client.get("/api/courses")
        assert disc_res.status_code == 200
        disc_data = disc_res.json()
        matching = [c for c in disc_data["items"] if c["id"] == created_course_id]
        assert len(matching) == 1, "Published course must be present in discovery list"
        assert matching[0]["modules_count"] == 2
        assert matching[0]["lessons_count"] == 3

        # ── Step 8: Verify Student Course Detail (GET /api/courses/{id}) ───────
        detail_res = client.get(f"/api/courses/{created_course_id}")
        assert detail_res.status_code == 200
        detail_data = detail_res.json()
        assert detail_data["title"] == course_payload.title
        assert len(detail_data["modules"]) == 2
        # Verify quiz outline is display-only and strictly omits answer keys
        mod1 = detail_data["modules"][0]
        assert mod1["quiz"]["title"] == "Mod 1 Checkpoint"
        assert "questions" not in mod1["quiz"]
        assert "is_correct" not in mod1["quiz"]

        # ── Step 9: Verify Lesson 1 Reader & Content (All 12 Blocks) ──────────
        l1_res = client.get(f"/api/courses/{created_course_id}/lessons/{l1_id}")
        assert l1_res.status_code == 200
        l1_json = l1_res.json()
        assert l1_json["lesson"]["title"] == "Lesson 1.1: Introduction"
        assert len(l1_json["content"]["blocks"]) == 12
        assert l1_json["prev_lesson"] is None, "First lesson must have prev_lesson = None"
        assert l1_json["next_lesson"]["id"] == l2_id
        assert l1_json["next_lesson"]["title"] == "Lesson 1.2: Advanced Variables"

        # Verify image block in lesson content
        img_block = next(b for b in l1_json["content"]["blocks"] if b["type"] == "image")
        assert img_block["content"]["url"] == uploaded_image_url
        assert img_block["content"]["media_id"] == created_media_id

        # ── Step 10: Verify Module Boundary Navigation (Lesson 2 -> Lesson 3) ──
        l2_res = client.get(f"/api/courses/{created_course_id}/lessons/{l2_id}")
        assert l2_res.status_code == 200
        l2_json = l2_res.json()
        assert l2_json["prev_lesson"]["id"] == l1_id
        # Boundary jump from Module 1 to Module 2!
        assert l2_json["next_lesson"]["id"] == l3_id
        assert l2_json["next_lesson"]["module_id"] == mod2_id
        assert l2_json["next_lesson"]["module_title"] == "Module 2: Deep Dive"

        # ── Step 11: Verify Final Lesson Navigation (Lesson 3) ────────────────
        l3_res = client.get(f"/api/courses/{created_course_id}/lessons/{l3_id}")
        assert l3_res.status_code == 200
        l3_json = l3_res.json()
        assert l3_json["prev_lesson"]["id"] == l2_id
        assert l3_json["next_lesson"] is None, "Final lesson must have next_lesson = None"

        # ── Step 12: Verify Student Route Mutation Rejection ──────────────────
        mutate_res = client.post("/api/courses", json={"title": "Hacked Course"})
        assert mutate_res.status_code == 405

    finally:
        # ── Cleanup: Purge Test Course & Storage Objects ───────────────────────
        if created_media_id and created_course_id:
            try:
                delete_lesson_media(
                    course_id=created_course_id,
                    module_id=mod1_id,
                    lesson_id=l1_id,
                    media_id=created_media_id,
                    user_id=test_user_id,
                )
            except Exception:
                pass

        if created_course_id:
            try:
                delete_course(course_id=created_course_id, user_id=test_user_id)
            except Exception:
                pass
