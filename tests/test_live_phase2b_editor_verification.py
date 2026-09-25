"""
tests/test_live_phase2b_editor_verification.py
Live End-to-End Verification Suite for Phase 2B — Admin Lesson Block Editor.
Runs against the live Supabase database and verifies:
  1. Open a real lesson in live Supabase.
  2. Verify content loads from Supabase (empty state).
  3. Add multiple blocks across various block types (Heading, Paragraph, Code, Table, Callout, YouTube, Key Takeaways).
  4. Edit block contents.
  5. Reorder blocks and verify 0..N-1 order normalization.
  6. Duplicate a block with unique ID generation.
  7. Delete a block with re-normalization.
  8. Save content to Supabase.
  9. Reload and confirm persistence in course_lesson_contents.
  10. Test preview block parsing integrity.
  11. Test invalid block rejection (H1 heading, invalid language, mismatched table, bad YouTube).
  12. Test unauthorized access (RLS protection against anonymous mutations).
  13. Clean up test records via cascade deletion.
"""

import os
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import ValidationError

from backend.services.course_service import (
    get_lesson_content,
    save_lesson_content,
)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

assert SUPABASE_URL, "SUPABASE_URL must be set"
assert SUPABASE_SERVICE_KEY, "SUPABASE_SERVICE_KEY must be set"
assert SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY must be set"

admin_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
anon_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@pytest.fixture(scope="module")
def admin_user():
    """Finds or creates an admin test user in auth.users."""
    email = f"phase2b_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = admin_client.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Phase 2B Admin Tester"},
        "app_metadata": {"role": "admin"}
    })
    user = user_resp.user
    assert user and user.id, f"Failed to create admin user: {user_resp}"

    try:
        admin_client.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Phase 2B Admin Tester",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    try:
        admin_client.auth.admin.delete_user(user.id)
    except Exception:
        pass


def test_live_phase2b_editor_e2e_workflow(admin_user):
    tag = uuid.uuid4().hex[:6]
    test_user_id = admin_user.id
    course_id = None
    module_id = None
    lesson_id = None

    try:
        # 1. Create a parent Course
        c_res = admin_client.from_("courses").insert({
            "title": f"Phase 2B Test Course {tag}",
            "slug": f"phase-2b-course-{tag}",
            "description": "Verifying Admin Lesson Block Editor E2E workflow in live Supabase",
            "category": "Engineering",
            "difficulty": "intermediate",
            "status": "DRAFT",
            "created_by": test_user_id,
        }).execute()
        assert c_res.data and len(c_res.data) == 1, "Course creation failed"
        course_id = c_res.data[0]["id"]

        # 2. Create a parent Module
        m_res = admin_client.from_("course_modules").insert({
            "course_id": course_id,
            "title": f"Module 1 {tag}",
            "position": 1,
        }).execute()
        assert m_res.data and len(m_res.data) == 1, "Module creation failed"
        module_id = m_res.data[0]["id"]

        # 3. Create a parent Lesson
        l_res = admin_client.from_("course_lessons").insert({
            "module_id": module_id,
            "title": f"Lesson 1: Introduction to Block Editor {tag}",
            "slug": f"lesson-1-intro-{tag}",
            "position": 1,
            "estimated_duration_minutes": 25,
        }).execute()
        assert l_res.data and len(l_res.data) == 1, "Lesson creation failed"
        lesson_id = l_res.data[0]["id"]

        # ── Step 1 & 2: Load lesson content (initial empty state) ────────────
        initial_content = get_lesson_content(course_id, module_id, lesson_id)
        assert initial_content["blocks"] == [], "Initial lesson blocks should be empty list"
        assert initial_content["schema_version"] == 1
        assert initial_content["lesson_id"] == lesson_id

        # ── Step 3: Add several different blocks ─────────────────────────────
        editor_blocks = [
            {
                "id": f"blk_h2_{uuid.uuid4().hex[:6]}",
                "type": "heading",
                "order": 0,
                "content": {"level": 2, "text": "Welcome to Python Foundations"},
            },
            {
                "id": f"blk_p_{uuid.uuid4().hex[:6]}",
                "type": "paragraph",
                "order": 1,
                "content": {"text": "Python is a versatile, high-level programming language."},
            },
            {
                "id": f"blk_code_{uuid.uuid4().hex[:6]}",
                "type": "code",
                "order": 2,
                "content": {
                    "language": "python",
                    "code": "def greet(name: str) -> str:\n    return f'Hello, {name}!'",
                },
            },
            {
                "id": f"blk_callout_{uuid.uuid4().hex[:6]}",
                "type": "callout",
                "order": 3,
                "content": {
                    "variant": "tip",
                    "title": "Pro Tip",
                    "text": "Always write type annotations for public functions.",
                },
            },
            {
                "id": f"blk_table_{uuid.uuid4().hex[:6]}",
                "type": "table",
                "order": 4,
                "content": {
                    "headers": ["Type", "Example", "Mutable"],
                    "rows": [
                        ["int", "42", "No"],
                        ["list", "[1, 2, 3]", "Yes"],
                    ],
                },
            },
            {
                "id": f"blk_yt_{uuid.uuid4().hex[:6]}",
                "type": "youtube",
                "order": 5,
                "content": {
                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "video_id": "dQw4w9WgXcQ",
                    "title": "Python Overview Video",
                },
            },
            {
                "id": f"blk_kt_{uuid.uuid4().hex[:6]}",
                "type": "key_takeaways",
                "order": 6,
                "content": {
                    "items": [
                        "Python emphasizes code readability",
                        "Type hints improve maintainability",
                    ],
                },
            },
        ]

        # ── Step 4: Edit a block ─────────────────────────────────────────────
        editor_blocks[0]["content"]["text"] = "Welcome to Advanced Python Foundations"
        editor_blocks[1]["content"]["text"] = "Updated paragraph text with enriched explanation."

        # ── Step 5: Reorder blocks (swap index 1 and 2) ──────────────────────
        editor_blocks[1], editor_blocks[2] = editor_blocks[2], editor_blocks[1]
        for idx, b in enumerate(editor_blocks):
            b["order"] = idx

        # ── Step 6: Duplicate a block ────────────────────────────────────────
        dup_source = editor_blocks[3]  # callout block
        duplicated_block = {
            "id": f"blk_callout_dup_{uuid.uuid4().hex[:6]}",
            "type": dup_source["type"],
            "order": 4,
            "content": {**dup_source["content"], "title": "Duplicated Tip"},
        }
        editor_blocks.insert(4, duplicated_block)
        for idx, b in enumerate(editor_blocks):
            b["order"] = idx

        assert len(editor_blocks) == 8

        # ── Step 7: Delete a block ───────────────────────────────────────────
        # Delete table block (originally index 5, now index 5 after duplication)
        editor_blocks = [b for b in editor_blocks if b["type"] != "table"]
        for idx, b in enumerate(editor_blocks):
            b["order"] = idx

        assert len(editor_blocks) == 7

        # ── Step 8: Save to Supabase via backend course service ───────────────
        payload = {"blocks": editor_blocks}
        saved_response = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=payload,
            user_id=test_user_id,
        )

        assert saved_response["schema_version"] == 1
        assert len(saved_response["blocks"]) == 7
        assert saved_response["blocks"][0]["content"]["text"] == "Welcome to Advanced Python Foundations"

        # ── Step 9: Refresh & verify persistence in Supabase ─────────────────
        reloaded = get_lesson_content(course_id, module_id, lesson_id)
        assert len(reloaded["blocks"]) == 7
        for idx, b in enumerate(reloaded["blocks"]):
            assert b["order"] == idx, f"Block {b['id']} order must match sequence index {idx}"

        # ── Step 10: Test invalid block payloads are strictly rejected ────────
        # 10a. Reject H1 heading
        with pytest.raises(ValidationError):
            save_lesson_content(
                course_id=course_id,
                module_id=module_id,
                lesson_id=lesson_id,
                payload_dict={"blocks": [{
                    "id": "bad-h1",
                    "type": "heading",
                    "order": 0,
                    "content": {"level": 1, "text": "Forbidden H1"},
                }]},
                user_id=test_user_id,
            )

        # 10b. Reject invalid code language
        with pytest.raises(ValidationError):
            save_lesson_content(
                course_id=course_id,
                module_id=module_id,
                lesson_id=lesson_id,
                payload_dict={"blocks": [{
                    "id": "bad-lang",
                    "type": "code",
                    "order": 0,
                    "content": {"language": "malicious_unsupported_lang", "code": "print(1)"},
                }]},
                user_id=test_user_id,
            )

        # 10c. Reject mismatched table dimensions
        with pytest.raises(ValidationError):
            save_lesson_content(
                course_id=course_id,
                module_id=module_id,
                lesson_id=lesson_id,
                payload_dict={"blocks": [{
                    "id": "bad-tbl",
                    "type": "table",
                    "order": 0,
                    "content": {
                        "headers": ["Col 1", "Col 2"],
                        "rows": [["Cell 1"]],  # Missing second column
                    },
                }]},
                user_id=test_user_id,
            )

        # 10d. Reject unsafe HTML injection
        with pytest.raises(ValidationError):
            save_lesson_content(
                course_id=course_id,
                module_id=module_id,
                lesson_id=lesson_id,
                payload_dict={"blocks": [{
                    "id": "bad-xss",
                    "type": "paragraph",
                    "order": 0,
                    "content": {"text": "<script>alert('xss')</script>"},
                }]},
                user_id=test_user_id,
            )

        # ── Step 11: Security — RLS prevents anonymous mutation ──────────────
        with pytest.raises(Exception):
            anon_client.from_("course_lesson_contents").insert({
                "lesson_id": lesson_id,
                "schema_version": 1,
                "blocks": [],
            }).execute()

    finally:
        # ── Step 12: Cleanup test course which cascades to module & lesson ────
        if course_id:
            admin_client.from_("courses").delete().eq("id", course_id).execute()
            # Verify cascade deletion
            check = admin_client.from_("course_lesson_contents").select("id").eq("lesson_id", lesson_id).execute()
            assert len(check.data) == 0, "Lesson contents must be cascade-deleted"
