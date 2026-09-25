"""
tests/test_live_lesson_content_supabase.py
Live Supabase Integration & RLS Security Suite for Lesson Content (Phase 2A).
Runs against the live Supabase database (zzjxprhapptjoziwdcro).
Verifies:
  - Real relational lifecycle: Course -> Module -> Lesson -> Content
  - Empty lesson content support
  - 12 structured block types persistence & JSONB integrity
  - YouTube URL normalization upon persistence
  - Block reordering / updating
  - RLS policies (draft vs published visibility, mutation protection)
  - Cascade deletion on parent lesson removal
"""

import os
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client, Client

from backend.services.course_service import (
    get_lesson_content,
    save_lesson_content,
    verify_lesson_hierarchy,
)

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
    email = f"content_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = admin_client.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Content Admin Tester"},
        "app_metadata": {"role": "admin"}
    })
    user = user_resp.user
    assert user and user.id, f"Failed to create admin user: {user_resp}"

    try:
        admin_client.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Content Admin Tester",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    try:
        admin_client.auth.admin.delete_user(user.id)
    except Exception:
        pass


def test_live_lesson_content_lifecycle_and_security(admin_user):
    tag = uuid.uuid4().hex[:6]
    user_id = admin_user.id
    course_id = None
    module_id = None
    lesson_id = None

    try:
        # 1. Create a parent Course (DRAFT)
        c_res = admin_client.from_("courses").insert({
            "title": f"Content Test Course {tag}",
            "slug": f"content-test-{tag}",
            "description": "Testing lesson content architecture in live Supabase",
            "category": "Engineering",
            "difficulty": "beginner",
            "status": "DRAFT",
            "created_by": user_id,
        }).execute()
        assert c_res.data and len(c_res.data) == 1
        course_id = c_res.data[0]["id"]

        # 2. Create a parent Module
        m_res = admin_client.from_("course_modules").insert({
            "course_id": course_id,
            "title": f"Module 1 {tag}",
            "position": 1,
        }).execute()
        assert m_res.data and len(m_res.data) == 1
        module_id = m_res.data[0]["id"]

        # 3. Create a parent Lesson (metadata only initially)
        l_res = admin_client.from_("course_lessons").insert({
            "module_id": module_id,
            "title": f"Lesson 1 {tag}",
            "slug": f"lesson-1-{tag}",
            "position": 1,
            "estimated_duration_minutes": 15,
        }).execute()
        assert l_res.data and len(l_res.data) == 1
        lesson_id = l_res.data[0]["id"]

        # 4. Verify initial empty content via service
        initial_content = get_lesson_content(course_id, module_id, lesson_id)
        assert initial_content["lesson_id"] == lesson_id
        assert initial_content["blocks"] == []
        assert initial_content["schema_version"] == 1

        # 5. Verify hierarchy check succeeds for valid IDs
        module_check, lesson_check = verify_lesson_hierarchy(course_id, module_id, lesson_id)
        assert module_check["id"] == module_id
        assert lesson_check["id"] == lesson_id

        # 6. Verify hierarchy check raises 404 for wrong course_id
        fake_course_id = str(uuid.uuid4())
        with pytest.raises(Exception) as excinfo:
            verify_lesson_hierarchy(fake_course_id, module_id, lesson_id)
        assert "404" in str(excinfo.value) or "not found" in str(excinfo.value).lower()

        # 7. Construct payload with all 12 block types, including YouTube with full URL
        raw_payload = {
            "blocks": [
                {
                    "id": f"b-heading-{tag}",
                    "type": "heading",
                    "order": 0,
                    "content": {"level": 2, "text": "Mastering Python Architectures"}
                },
                {
                    "id": f"b-para-{tag}",
                    "type": "paragraph",
                    "order": 1,
                    "content": {"text": "Python enables rapid prototype development with clean semantics."}
                },
                {
                    "id": f"b-image-{tag}",
                    "type": "image",
                    "order": 2,
                    "content": {
                        "url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
                        "alt": "Python code illustration",
                        "caption": "Clean architecture diagram"
                    }
                },
                {
                    "id": f"b-code-{tag}",
                    "type": "code",
                    "order": 3,
                    "content": {
                        "language": "python",
                        "code": "def solve(x: int) -> int:\n    return x * 2"
                    }
                },
                {
                    "id": f"b-output-{tag}",
                    "type": "output",
                    "order": 4,
                    "content": {"text": "42\n[Process completed]"}
                },
                {
                    "id": f"b-list-{tag}",
                    "type": "list",
                    "order": 5,
                    "content": {
                        "ordered": True,
                        "items": ["First step: design", "Second step: code", "Third step: test"]
                    }
                },
                {
                    "id": f"b-table-{tag}",
                    "type": "table",
                    "order": 6,
                    "content": {
                        "headers": ["Concept", "Complexity"],
                        "rows": [["List indexing", "O(1)"], ["Dictionary lookup", "O(1)"]]
                    }
                },
                {
                    "id": f"b-callout-{tag}",
                    "type": "callout",
                    "order": 7,
                    "content": {
                        "variant": "tip",
                        "title": "Pro Tip",
                        "text": "Always write comprehensive automated tests."
                    }
                },
                {
                    "id": f"b-quote-{tag}",
                    "type": "quote",
                    "order": 8,
                    "content": {
                        "text": "Simple is better than complex.",
                        "author": "The Zen of Python"
                    }
                },
                {
                    "id": f"b-youtube-{tag}",
                    "type": "youtube",
                    "order": 9,
                    "content": {
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "title": "Educational Video Walkthrough"
                    }
                },
                {
                    "id": f"b-link-{tag}",
                    "type": "link",
                    "order": 10,
                    "content": {
                        "text": "Official Documentation",
                        "url": "https://docs.python.org/3/"
                    }
                },
                {
                    "id": f"b-takeaways-{tag}",
                    "type": "key_takeaways",
                    "order": 11,
                    "content": {
                        "items": ["Clean code is readable", "Structure prevents bugs"]
                    }
                }
            ]
        }

        # 8. Save content using service
        saved = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=raw_payload,
            user_id=user_id,
        )
        assert saved["lesson_id"] == lesson_id
        assert len(saved["blocks"]) == 12

        # 9. Verify YouTube block normalization occurred: video_id is 11-char ID
        yt_block = next(b for b in saved["blocks"] if b["type"] == "youtube")
        assert yt_block["content"]["video_id"] == "dQw4w9WgXcQ"
        assert yt_block["content"]["url"] == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

        # 10. Retrieve from DB via get_lesson_content
        retrieved = get_lesson_content(course_id, module_id, lesson_id)
        assert len(retrieved["blocks"]) == 12
        assert retrieved["blocks"][0]["type"] == "heading"
        assert retrieved["blocks"][0]["content"]["text"] == "Mastering Python Architectures"

        # 11. Update / Reorder blocks
        reordered_payload = {
            "blocks": [
                {
                    "id": f"b-para-{tag}",
                    "type": "paragraph",
                    "order": 0,
                    "content": {"text": "Updated paragraph after reordering."}
                },
                {
                    "id": f"b-heading-{tag}",
                    "type": "heading",
                    "order": 1,
                    "content": {"level": 3, "text": "H3 Subheading"}
                }
            ]
        }
        updated = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=reordered_payload,
            user_id=user_id,
        )
        assert len(updated["blocks"]) == 2
        assert updated["blocks"][0]["content"]["text"] == "Updated paragraph after reordering."
        assert updated["blocks"][1]["content"]["level"] == 3

        # 12. RLS Verification:
        # A) Course is DRAFT -> anon cannot view content
        anon_read_draft = anon_client.from_("course_lesson_contents").select("*").eq("lesson_id", lesson_id).execute()
        assert len(anon_read_draft.data) == 0, "Draft lesson content must NOT be visible to anonymous user"

        # B) Publish course -> anon CAN view content
        admin_client.from_("courses").update({"status": "PUBLISHED"}).eq("id", course_id).execute()

        anon_read_pub = anon_client.from_("course_lesson_contents").select("*").eq("lesson_id", lesson_id).execute()
        assert len(anon_read_pub.data) == 1, "Published lesson content MUST be visible to public/anon"
        assert len(anon_read_pub.data[0]["blocks"]) == 2

        # C) Anonymous mutation MUST fail
        with pytest.raises(Exception):
            anon_client.from_("course_lesson_contents").insert({
                "lesson_id": lesson_id,
                "blocks": []
            }).execute()

    finally:
        # Cleanup: Delete parent course which cascades to module, lesson, and lesson_contents
        if course_id:
            admin_client.from_("courses").delete().eq("id", course_id).execute()
            # Verify cascade deletion
            if lesson_id:
                check_deleted = admin_client.from_("course_lesson_contents").select("id").eq("lesson_id", lesson_id).execute()
                assert len(check_deleted.data) == 0, "Cascade deletion should remove lesson_contents"
