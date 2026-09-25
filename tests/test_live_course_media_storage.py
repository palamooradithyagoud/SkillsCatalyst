"""
tests/test_live_course_media_storage.py
Live Supabase Integration & RLS Security Suite for Course Lesson Media (Phase 3A).
Runs against the live Supabase instance (zzjxprhapptjoziwdcro).

Verifies:
  1. Bucket exists ('course-lesson-media') and verifies configuration (10MB, allowed MIMEs).
  2. Creates real test Course, Module, Lesson.
  3. Uploads real test image (PNG) via upload_lesson_media.
  4. Verifies storage object persistence in Supabase Storage.
  5. Verifies relational metadata in public.course_lesson_media.
  6. Verifies anonymous / unauthorized storage write/delete is blocked by RLS.
  7. Verifies cross-lesson deletion is rejected with 403 Forbidden.
  8. Verifies draft course media metadata is hidden from anonymous clients via RLS.
  9. Verifies publishing course makes media metadata selectable by anon/student clients.
  10. Verifies authorized deletion removes storage object and database row.
  11. Verifies cascade cleanup when parent course is deleted.
"""

import os
import io
import uuid
import pytest
from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image
from fastapi import HTTPException

from backend.services.course_media_service import (
    upload_lesson_media,
    delete_lesson_media,
    list_lesson_media,
    get_lesson_media_by_id,
    COURSE_LESSON_MEDIA_BUCKET,
    MAX_FILE_SIZE_BYTES,
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


def create_test_png_bytes(color: str = "green") -> bytes:
    img = Image.new("RGB", (20, 20), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def admin_user():
    """Finds or creates an admin test user in auth.users."""
    email = f"media_admin_{uuid.uuid4().hex[:8]}@skillscatalyst.internal"
    pwd = "AdminSecurePassword123!#"
    user_resp = admin_client.auth.admin.create_user({
        "email": email,
        "password": pwd,
        "email_confirm": True,
        "user_metadata": {"full_name": "Media Admin Tester"},
        "app_metadata": {"role": "admin"},
    })
    user = user_resp.user
    assert user and user.id, f"Failed to create admin user: {user_resp}"

    try:
        admin_client.from_("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": "Media Admin Tester",
            "role": "admin",
        }).execute()
    except Exception:
        pass

    yield user

    try:
        admin_client.auth.admin.delete_user(user.id)
    except Exception:
        pass


def test_live_supabase_bucket_configuration():
    """Verifies that the dedicated course-lesson-media bucket exists with proper limits."""
    buckets = admin_client.storage.list_buckets()
    bucket = next((b for b in buckets if b.id == COURSE_LESSON_MEDIA_BUCKET), None)
    assert bucket is not None, f"Bucket '{COURSE_LESSON_MEDIA_BUCKET}' not found on Supabase"
    assert bucket.file_size_limit == MAX_FILE_SIZE_BYTES
    assert "image/jpeg" in bucket.allowed_mime_types
    assert "image/png" in bucket.allowed_mime_types
    assert "image/webp" in bucket.allowed_mime_types
    assert "image/gif" in bucket.allowed_mime_types
    assert bucket.public is True


def test_live_course_media_full_lifecycle(admin_user):
    """
    Executes full live lifecycle:
      Create Course (DRAFT) -> Module -> Lesson -> Upload Image -> Verify Storage & DB ->
      Test RLS & Cross-Lesson -> Publish Course & Check Visibility -> Delete Media -> Cascade Check
    """
    tag = uuid.uuid4().hex[:6]
    user_id = admin_user.id
    course_id = None
    module_id = None
    lesson_id = None
    other_lesson_id = None

    try:
        # 1. Create a parent Course (DRAFT)
        c_res = admin_client.from_("courses").insert({
            "title": f"Media Test Course {tag}",
            "slug": f"media-test-{tag}",
            "description": "Testing media foundation in live Supabase",
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
            "title": f"Media Module 1 {tag}",
            "position": 1,
        }).execute()
        assert m_res.data and len(m_res.data) == 1
        module_id = m_res.data[0]["id"]

        # 3. Create target Lesson and an adjacent Lesson in the same module
        l1_res = admin_client.from_("course_lessons").insert({
            "module_id": module_id,
            "title": f"Media Lesson 1 {tag}",
            "position": 1,
        }).execute()
        assert l1_res.data and len(l1_res.data) == 1
        lesson_id = l1_res.data[0]["id"]

        l2_res = admin_client.from_("course_lessons").insert({
            "module_id": module_id,
            "title": f"Media Lesson 2 {tag}",
            "position": 2,
        }).execute()
        assert l2_res.data and len(l2_res.data) == 1
        other_lesson_id = l2_res.data[0]["id"]

        # 4. Upload real image via backend media service
        png_bytes = create_test_png_bytes(color="purple")
        filename = f"diagram_{tag}.png"
        upload_result = upload_lesson_media(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            file_bytes=png_bytes,
            original_filename=filename,
            content_type="image/png",
            user_id=user_id,
        )

        assert upload_result["id"]
        media_id = upload_result["id"]
        storage_path = upload_result["storage_path"]
        assert storage_path.startswith(f"{course_id}/{module_id}/{lesson_id}/")
        assert storage_path.endswith(".png")
        assert upload_result["public_url"].startswith(f"{SUPABASE_URL}/storage/v1/object/public/{COURSE_LESSON_MEDIA_BUCKET}/")
        assert upload_result["size_bytes"] == len(png_bytes)

        # 5. Verify storage object actually exists in Supabase Storage
        path_folder = f"{course_id}/{module_id}/{lesson_id}"
        listed_files = admin_client.storage.from_(COURSE_LESSON_MEDIA_BUCKET).list(path=path_folder)
        file_names = [f["name"] for f in listed_files]
        media_file_name = storage_path.split("/")[-1]
        assert media_file_name in file_names, f"Uploaded file {media_file_name} not found in {path_folder}"

        # 6. Verify row in public.course_lesson_media
        db_check = admin_client.from_("course_lesson_media").select("*").eq("id", media_id).execute()
        assert len(db_check.data) == 1
        assert db_check.data[0]["original_filename"] == filename

        # 7. Verify List and Get by ID
        media_list = list_lesson_media(course_id, module_id, lesson_id)
        assert media_list["total"] >= 1
        assert any(m["id"] == media_id for m in media_list["items"])

        fetched_media = get_lesson_media_by_id(course_id, module_id, lesson_id, media_id)
        assert fetched_media["id"] == media_id
        assert fetched_media["storage_path"] == storage_path

        # 8. Security Check: Cross-Lesson deletion attempt must be rejected (403)
        with pytest.raises(HTTPException) as exc_info:
            delete_lesson_media(
                course_id=course_id,
                module_id=module_id,
                lesson_id=other_lesson_id,  # Wrong lesson!
                media_id=media_id,
                user_id=user_id,
            )
        assert exc_info.value.status_code == 403

        # 9. Security Check: Anonymous user cannot read draft course media metadata
        anon_read = anon_client.from_("course_lesson_media").select("*").eq("id", media_id).execute()
        assert len(anon_read.data) == 0, "Anonymous user was able to query draft course media metadata!"

        # 10. Security Check: Anonymous user cannot insert or delete directly
        with pytest.raises(Exception):
            anon_client.from_("course_lesson_media").insert({
                "course_id": course_id,
                "module_id": module_id,
                "lesson_id": lesson_id,
                "storage_path": "fake/path/test.png",
                "original_filename": "evil.png",
                "mime_type": "image/png",
                "size_bytes": 100,
                "public_url": "https://evil.com",
            }).execute()

        # Anonymous delete attempt affects 0 rows; row remains strictly protected
        anon_del = anon_client.from_("course_lesson_media").delete().eq("id", media_id).execute()
        assert len(anon_del.data or []) == 0
        still_exists = admin_client.from_("course_lesson_media").select("id").eq("id", media_id).execute()
        assert len(still_exists.data) == 1, "Anonymous user was able to delete media record!"


        # 11. Publish the Course and verify Anonymous user CAN read published media metadata
        admin_client.from_("courses").update({"status": "PUBLISHED"}).eq("id", course_id).execute()

        anon_pub_read = anon_client.from_("course_lesson_media").select("*").eq("id", media_id).execute()
        assert len(anon_pub_read.data) == 1, "Anonymous user could not read published course media metadata!"
        assert anon_pub_read.data[0]["id"] == media_id

        # 12. Authorized Admin Deletion
        del_result = delete_lesson_media(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            media_id=media_id,
            user_id=user_id,
        )
        assert del_result["id"] == media_id

        # Verify DB row is gone
        db_check_after = admin_client.from_("course_lesson_media").select("*").eq("id", media_id).execute()
        assert len(db_check_after.data) == 0

        # Verify storage object is removed
        listed_after = admin_client.storage.from_(COURSE_LESSON_MEDIA_BUCKET).list(path=path_folder)
        assert media_file_name not in [f["name"] for f in listed_after]

        # 13. Test Cascade Deletion: Upload second image, delete course, verify cascade
        png2 = create_test_png_bytes(color="yellow")
        upload2 = upload_lesson_media(
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
            file_bytes=png2,
            original_filename="cascade_test.png",
            content_type="image/png",
            user_id=user_id,
        )
        media2_id = upload2["id"]

        # Delete parent Course
        admin_client.from_("courses").delete().eq("id", course_id).execute()
        course_id = None  # Already cleaned up

        # Verify row in course_lesson_media was deleted by FK CASCADE
        cascade_check = admin_client.from_("course_lesson_media").select("*").eq("id", media2_id).execute()
        assert len(cascade_check.data) == 0, "course_lesson_media record was not cascade deleted!"

    finally:
        # Cleanup course if still exists
        if course_id:
            try:
                admin_client.from_("courses").delete().eq("id", course_id).execute()
            except Exception:
                pass
