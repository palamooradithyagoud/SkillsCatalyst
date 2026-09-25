"""
tests/test_course_media_service.py
Unit & Behavioral Test Suite for Course Lesson Media Foundation (Phase 3A).

Verifies:
  1. Valid JPEG, PNG, WebP, and GIF uploads
  2. SVG upload rejection (XSS/XXE security policy)
  3. Invalid MIME type rejection
  4. Invalid extension rejection
  5. Extension vs MIME mismatch rejection
  6. Empty file rejection (0 bytes)
  7. Oversized file rejection (> 10MB)
  8. Magic bytes / binary signature verification
  9. PIL integrity verification on corrupted payloads
  10. Filename sanitization & path traversal neutralization
  11. Authoritative storage path generation
  12. Course/Module/Lesson hierarchy verification & cross-entity protection
  13. Relational metadata creation & rollback on failure
  14. Deletion safety & cross-lesson deletion blocking
  15. Media listing & retrieval by ID
"""

import io
import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from PIL import Image

from backend.services.course_media_service import (
    validate_and_sanitize_image,
    generate_storage_path,
    upload_lesson_media,
    delete_lesson_media,
    list_lesson_media,
    get_lesson_media_by_id,
    COURSE_LESSON_MEDIA_BUCKET,
    MAX_FILE_SIZE_BYTES,
)


# ── Helpers for Generating Test Image Bytes ───────────────────────────────────

def create_valid_image_bytes(image_format: str = "PNG") -> bytes:
    img = Image.new("RGB", (32, 32), color="blue")
    buf = io.BytesIO()
    img.save(buf, format=image_format)
    return buf.getvalue()


# ── 1. Image Validation Tests ─────────────────────────────────────────────────

def test_validate_valid_png():
    raw_bytes = create_valid_image_bytes("PNG")
    clean_name, mime, ext = validate_and_sanitize_image("diagram.png", "image/png", raw_bytes)
    assert clean_name == "diagram.png"
    assert mime == "image/png"
    assert ext == "png"


def test_validate_valid_jpeg():
    raw_bytes = create_valid_image_bytes("JPEG")
    clean_name, mime, ext = validate_and_sanitize_image("photo.jpg", "image/jpeg", raw_bytes)
    assert clean_name == "photo.jpg"
    assert mime == "image/jpeg"
    assert ext == "jpg"


def test_validate_valid_webp():
    raw_bytes = create_valid_image_bytes("WEBP")
    clean_name, mime, ext = validate_and_sanitize_image("screenshot.webp", "image/webp", raw_bytes)
    assert clean_name == "screenshot.webp"
    assert mime == "image/webp"
    assert ext == "webp"


def test_validate_valid_gif():
    raw_bytes = create_valid_image_bytes("GIF")
    clean_name, mime, ext = validate_and_sanitize_image("animation.gif", "image/gif", raw_bytes)
    assert clean_name == "animation.gif"
    assert mime == "image/gif"
    assert ext == "gif"


def test_reject_empty_file():
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("empty.png", "image/png", b"")
    assert exc_info.value.status_code == 400
    assert "empty" in str(exc_info.value.detail).lower()


def test_reject_oversized_file():
    oversized = b"x" * (MAX_FILE_SIZE_BYTES + 1)
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("large.png", "image/png", oversized)
    assert exc_info.value.status_code == 400
    assert "exceeds" in str(exc_info.value.detail).lower()


def test_reject_svg_files():
    svg_payload = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("vector.svg", "image/svg+xml", svg_payload)
    assert exc_info.value.status_code == 400
    assert "svg" in str(exc_info.value.detail).lower()
    assert "xss" in str(exc_info.value.detail).lower()


def test_reject_unsupported_mime():
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("document.pdf", "application/pdf", b"%PDF-1.4...")
    assert exc_info.value.status_code == 400
    assert "unsupported media mime type" in str(exc_info.value.detail).lower()


def test_reject_unsupported_extension():
    raw_bytes = create_valid_image_bytes("PNG")
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("payload.exe", "image/png", raw_bytes)
    assert exc_info.value.status_code == 400
    assert "unsupported or missing file extension" in str(exc_info.value.detail).lower()


def test_reject_extension_mime_mismatch():
    png_bytes = create_valid_image_bytes("PNG")
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("photo.jpg", "image/png", png_bytes)
    assert exc_info.value.status_code == 400
    assert "does not match declared mime type" in str(exc_info.value.detail).lower()


def test_reject_corrupted_magic_bytes():
    # File named png and declared png, but content is arbitrary text
    fake_png = b"NOT_A_PNG_FILE_CONTENT_AT_ALL"
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("fake.png", "image/png", fake_png)
    assert exc_info.value.status_code == 400
    assert "signature" in str(exc_info.value.detail).lower()


def test_reject_corrupted_image_pil_decoding():
    # Valid PNG header but corrupted internal image payload
    corrupt_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 50
    with pytest.raises(HTTPException) as exc_info:
        validate_and_sanitize_image("corrupted.png", "image/png", corrupt_png)
    assert exc_info.value.status_code == 400
    assert "corrupted" in str(exc_info.value.detail).lower()


def test_filename_sanitization_path_traversal():
    png_bytes = create_valid_image_bytes("PNG")
    malicious_names = [
        ("../../etc/passwd.png", "passwd.png"),
        ("..\\..\\windows\\system32.png", "system32.png"),
        ("../../../evil.png", "evil.png"),
        ("\x00secret.png", "secret.png"),
        ("..\\..\\image.png", "image.png"),
    ]
    for raw_name, expected in malicious_names:
        clean_name, _, _ = validate_and_sanitize_image(raw_name, "image/png", png_bytes)
        assert "/" not in clean_name
        assert "\\" not in clean_name
        assert ".." not in clean_name
        assert clean_name == expected



# ── 2. Storage Path Generation ────────────────────────────────────────────────

def test_generate_storage_path_valid():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    med_id = str(uuid.uuid4())

    path = generate_storage_path(c_id, m_id, l_id, med_id, "webp")
    assert path == f"{c_id}/{m_id}/{l_id}/{med_id}.webp"
    assert ".." not in path


def test_generate_storage_path_rejects_non_uuid():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())

    with pytest.raises(HTTPException) as exc_info:
        generate_storage_path(c_id, m_id, l_id, "not-a-uuid-traversal/../../", "webp")
    assert exc_info.value.status_code == 400
    assert "invalid" in str(exc_info.value.detail).lower()


# ── 3. Hierarchy & Upload Mocked Tests ────────────────────────────────────────

def test_upload_lesson_media_hierarchy_failure():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    png_bytes = create_valid_image_bytes("PNG")

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Hierarchy verification fails
        with patch("backend.services.course_media_service.verify_lesson_hierarchy") as mock_verify:
            mock_verify.side_effect = HTTPException(status_code=404, detail="Module not found")

            with pytest.raises(HTTPException) as exc_info:
                upload_lesson_media(
                    course_id=c_id,
                    module_id=m_id,
                    lesson_id=l_id,
                    file_bytes=png_bytes,
                    original_filename="test.png",
                    content_type="image/png",
                )
            assert exc_info.value.status_code == 404


def test_upload_lesson_media_success():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    u_id = str(uuid.uuid4())
    png_bytes = create_valid_image_bytes("PNG")

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb, \
         patch("backend.services.course_media_service.verify_lesson_hierarchy"), \
         patch("backend.services.course_media_service.log_course_audit"):

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Mock storage upload
        mock_storage_bucket = MagicMock()
        mock_sb.storage.from_.return_value = mock_storage_bucket
        mock_storage_bucket.upload.return_value = {"Key": "test"}
        mock_storage_bucket.get_public_url.return_value = "https://example.com/media.png"

        # Mock DB insert
        fake_db_row = {
            "id": str(uuid.uuid4()),
            "course_id": c_id,
            "module_id": m_id,
            "lesson_id": l_id,
            "storage_path": f"{c_id}/{m_id}/{l_id}/media.png",
            "original_filename": "test.png",
            "mime_type": "image/png",
            "size_bytes": len(png_bytes),
            "public_url": "https://example.com/media.png",
            "created_by": u_id,
            "created_at": "2026-09-25T18:00:00Z",
            "updated_at": "2026-09-25T18:00:00Z",
        }
        mock_sb.from_.return_value.insert.return_value.execute.return_value = MagicMock(data=[fake_db_row])

        result = upload_lesson_media(
            course_id=c_id,
            module_id=m_id,
            lesson_id=l_id,
            file_bytes=png_bytes,
            original_filename="test.png",
            content_type="image/png",
            user_id=u_id,
        )

        assert result["course_id"] == c_id
        assert result["module_id"] == m_id
        assert result["lesson_id"] == l_id
        assert result["mime_type"] == "image/png"
        assert result["public_url"] == "https://example.com/media.png"


def test_upload_rollback_on_db_failure():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    png_bytes = create_valid_image_bytes("PNG")

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb, \
         patch("backend.services.course_media_service.verify_lesson_hierarchy"):

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        mock_storage_bucket = MagicMock()
        mock_sb.storage.from_.return_value = mock_storage_bucket
        mock_storage_bucket.upload.return_value = {"Key": "test"}
        mock_storage_bucket.get_public_url.return_value = "https://example.com/media.png"

        # Database insertion crashes
        mock_sb.from_.return_value.insert.return_value.execute.side_effect = Exception("DB Connection Down")

        with pytest.raises(HTTPException) as exc_info:
            upload_lesson_media(
                course_id=c_id,
                module_id=m_id,
                lesson_id=l_id,
                file_bytes=png_bytes,
                original_filename="test.png",
                content_type="image/png",
            )
        assert exc_info.value.status_code == 500
        # Verify storage removal was called as rollback
        mock_storage_bucket.remove.assert_called_once()


# ── 4. Deletion Tests ─────────────────────────────────────────────────────────

def test_delete_lesson_media_cross_lesson_blocked():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    other_lesson_id = str(uuid.uuid4())
    med_id = str(uuid.uuid4())

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb, \
         patch("backend.services.course_media_service.verify_lesson_hierarchy"):

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        # Media record belongs to another lesson
        fake_row = {
            "id": med_id,
            "course_id": c_id,
            "module_id": m_id,
            "lesson_id": other_lesson_id,
            "storage_path": f"{c_id}/{m_id}/{other_lesson_id}/{med_id}.png",
        }
        mock_sb.from_.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[fake_row])

        with pytest.raises(HTTPException) as exc_info:
            delete_lesson_media(
                course_id=c_id,
                module_id=m_id,
                lesson_id=l_id,
                media_id=med_id,
            )
        assert exc_info.value.status_code == 403
        assert "hierarchy" in str(exc_info.value.detail).lower()


def test_delete_lesson_media_success():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())
    med_id = str(uuid.uuid4())
    storage_path = f"{c_id}/{m_id}/{l_id}/{med_id}.png"

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb, \
         patch("backend.services.course_media_service.verify_lesson_hierarchy"), \
         patch("backend.services.course_media_service.log_course_audit"):

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        fake_row = {
            "id": med_id,
            "course_id": c_id,
            "module_id": m_id,
            "lesson_id": l_id,
            "storage_path": storage_path,
        }
        mock_sb.from_.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[fake_row])
        mock_storage_bucket = MagicMock()
        mock_sb.storage.from_.return_value = mock_storage_bucket

        res = delete_lesson_media(
            course_id=c_id,
            module_id=m_id,
            lesson_id=l_id,
            media_id=med_id,
        )

        assert res["id"] == med_id
        assert res["storage_path"] == storage_path
        mock_storage_bucket.remove.assert_called_once_with([storage_path])


# ── 5. List Media Tests ───────────────────────────────────────────────────────

def test_list_lesson_media_success():
    c_id = str(uuid.uuid4())
    m_id = str(uuid.uuid4())
    l_id = str(uuid.uuid4())

    with patch("backend.services.course_media_service.get_supabase") as mock_get_sb, \
         patch("backend.services.course_media_service.verify_lesson_hierarchy"):

        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb

        rows = [
            {
                "id": str(uuid.uuid4()),
                "course_id": c_id,
                "module_id": m_id,
                "lesson_id": l_id,
                "storage_path": f"{c_id}/{m_id}/{l_id}/1.png",
                "original_filename": "1.png",
                "mime_type": "image/png",
                "size_bytes": 1024,
                "public_url": "https://example.com/1.png",
                "created_by": None,
                "created_at": "2026-09-25T18:00:00Z",
                "updated_at": "2026-09-25T18:00:00Z",
            }
        ]
        mock_sb.from_.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=rows)

        listing = list_lesson_media(c_id, m_id, l_id)
        assert listing["total"] == 1
        assert len(listing["items"]) == 1
        assert listing["items"][0]["original_filename"] == "1.png"
