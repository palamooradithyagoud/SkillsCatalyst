"""
tests/test_live_phase3b_editor_media.py
Live Supabase Integration & E2E Verification for Phase 3B: Image Upload + Lesson Editor Integration.
Runs against the live Supabase instance (zzjxprhapptjoziwdcro).

Verifies the entire Phase 3B workflow:
  1. Creates real Course (DRAFT), Module, Lesson.
  2. Uploads real test PNG image to Supabase Storage.
  3. Verifies media exists in bucket "course-lesson-media" and table "course_lesson_media".
  4. Saves structured lesson content containing the Image block with url, media_id, alt, and caption.
  5. Reloads lesson content and confirms persistence in course_lesson_contents.
  6. Simulates replace image workflow: uploads replacement image, updates block, saves content.
  7. Confirms lesson content now references the new image.
  8. Confirms previous media asset was not prematurely destroyed prior to replacement save.
  9. Verifies existing external image URL blocks persist and validate seamlessly.
  10. Cleans up test entities.
"""

import os
import io
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image

from backend.services.course_service import (
    get_lesson_content,
    save_lesson_content,
)
from backend.services.course_media_service import (
    upload_lesson_media,
    COURSE_LESSON_MEDIA_BUCKET,
)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

assert SUPABASE_URL, "SUPABASE_URL must be defined"
assert SUPABASE_SERVICE_KEY, "SUPABASE_SERVICE_KEY must be defined"

admin_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def create_test_image_bytes(color: str = "blue") -> bytes:
    img = Image.new("RGB", (24, 24), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def admin_user():
    """Finds or creates an admin test user in auth.users."""
    email = f"phase3b_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = admin_client.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Phase 3B Admin"},
        "app_metadata": {"role": "admin"},
    })
    user = user_resp.user
    assert user and user.id

    try:
        admin_client.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Phase 3B Admin",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    try:
        admin_client.auth.admin.delete_user(user.id)
    except Exception:
        pass


def test_live_phase3b_editor_media_e2e_workflow(admin_user):
    tag = uuid.uuid4().hex[:6]
    user_id = admin_user.id
    course_id = None
    module_id = None
    lesson_id = None

    try:
        # 1. Create a parent Course (DRAFT)
        c_res = admin_client.from_("courses").insert({
            "title": f"Phase 3B Test Course {tag}",
            "slug": f"phase3b-test-{tag}",
            "description": "Testing Phase 3B Image Upload & Editor Integration in live Supabase",
            "category": "Engineering",
            "difficulty": "intermediate",
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

        # 3. Create a Lesson
        l_res = admin_client.from_("course_lessons").insert({
            "module_id": module_id,
            "title": f"Lesson 1 {tag}",
            "position": 1,
        }).execute()
        assert l_res.data and len(l_res.data) == 1
        lesson_id = l_res.data[0]["id"]

        # 4. Upload initial Image 1 via Phase 3A API
        png1 = create_test_image_bytes(color="cyan")
        media1 = upload_lesson_media(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            file_bytes=png1,
            original_filename="initial_diagram.png",
            content_type="image/png",
            user_id=user_id,
        )

        assert media1["id"]
        assert media1["public_url"]
        media1_id = media1["id"]
        media1_url = media1["public_url"]
        media1_storage_path = media1["storage_path"]

        # 5. Verify image 1 exists in Supabase Storage and DB
        folder = f"{course_id}/{module_id}/{lesson_id}"
        files_listed = admin_client.storage.from_(COURSE_LESSON_MEDIA_BUCKET).list(path=folder)
        file_names = [f["name"] for f in files_listed]
        assert media1_storage_path.split("/")[-1] in file_names

        db_check1 = admin_client.from_("course_lesson_media").select("*").eq("id", media1_id).execute()
        assert len(db_check1.data) == 1

        # 6. Save lesson content with Image Block referencing Media 1
        content_payload = {
            "schema_version": 1,
            "blocks": [
                {
                    "id": "blk-head-1",
                    "type": "heading",
                    "order": 1,
                    "content": {"level": 2, "text": "Lesson Introduction"},
                },
                {
                    "id": "blk-img-1",
                    "type": "image",
                    "order": 2,
                    "content": {
                        "url": media1_url,
                        "media_id": media1_id,
                        "alt": "Architectural Pipeline Diagram",
                        "caption": "Figure 1: Initial Architecture",
                    },
                },
            ],
        }

        saved_content = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=content_payload,
            user_id=user_id,
        )

        assert saved_content["lesson_id"] == lesson_id
        assert len(saved_content["blocks"]) == 2
        img_block = saved_content["blocks"][1]
        assert img_block["type"] == "image"
        assert img_block["content"]["url"] == media1_url
        assert img_block["content"]["media_id"] == media1_id
        assert img_block["content"]["alt"] == "Architectural Pipeline Diagram"

        # 7. Reload and verify content persistence
        reloaded = get_lesson_content(course_id, module_id, lesson_id)
        assert len(reloaded["blocks"]) == 2
        assert reloaded["blocks"][1]["content"]["media_id"] == media1_id

        # 8. Replace Image Workflow: Upload Media 2
        png2 = create_test_image_bytes(color="magenta")
        media2 = upload_lesson_media(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            file_bytes=png2,
            original_filename="updated_diagram.png",
            content_type="image/png",
            user_id=user_id,
        )

        media2_id = media2["id"]
        media2_url = media2["public_url"]
        assert media2_id != media1_id

        # Crucial check: verify media 1 is NOT deleted before lesson save
        db_check_media1_still_there = admin_client.from_("course_lesson_media").select("*").eq("id", media1_id).execute()
        assert len(db_check_media1_still_there.data) == 1, "Media 1 was prematurely deleted!"

        # 9. Save updated lesson content referencing Media 2
        updated_payload = {
            "schema_version": 1,
            "blocks": [
                {
                    "id": "blk-head-1",
                    "type": "heading",
                    "order": 1,
                    "content": {"level": 2, "text": "Lesson Introduction"},
                },
                {
                    "id": "blk-img-1",
                    "type": "image",
                    "order": 2,
                    "content": {
                        "url": media2_url,
                        "media_id": media2_id,
                        "alt": "Updated Pipeline Diagram",
                        "caption": "Figure 1: Revised Architecture",
                    },
                },
            ],
        }

        saved_update = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=updated_payload,
            user_id=user_id,
        )

        assert saved_update["blocks"][1]["content"]["media_id"] == media2_id
        assert saved_update["blocks"][1]["content"]["url"] == media2_url

        # 10. External Image URL Compatibility: Save an external URL block
        external_payload = {
            "schema_version": 1,
            "blocks": [
                {
                    "id": "blk-ext-img",
                    "type": "image",
                    "order": 1,
                    "content": {
                        "url": "https://images.unsplash.com/photo-1518770660439-4636190af475",
                        "media_id": None,
                        "alt": "External Circuit Board",
                        "caption": "Photo via Unsplash",
                    },
                },
            ],
        }

        saved_external = save_lesson_content(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            payload_dict=external_payload,
            user_id=user_id,
        )

        assert len(saved_external["blocks"]) == 1
        assert saved_external["blocks"][0]["content"]["url"].startswith("https://images.unsplash.com")
        assert saved_external["blocks"][0]["content"]["media_id"] is None

    finally:
        # Cleanup
        if course_id:
            try:
                admin_client.from_("courses").delete().eq("id", course_id).execute()
            except Exception:
                pass
