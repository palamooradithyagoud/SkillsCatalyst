"""
backend/services/course_media_service.py
Core Backend Media Service for Course Lesson Media Foundation (Phase 3A).

Manages:
  - MIME & binary magic byte validation (JPEG, PNG, WebP, GIF)
  - Extension whitelist and mismatch prevention
  - PIL image integrity decoding verification
  - Strict 10MB maximum file size enforcement
  - Authoritative collision-safe storage path generation
  - Course -> Module -> Lesson hierarchy authorization
  - Upload & delete operations in Supabase Storage ("course-lesson-media")
  - Relational media metadata persistence in public.course_lesson_media
  - Structured administrative audit logging
"""

import io
import os
import re
import uuid
import logging
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status
try:
    from PIL import Image
    _PIL_AVAILABLE = True
except ImportError:
    Image = None  # type: ignore
    _PIL_AVAILABLE = False

from backend.services.supabase_service import get_supabase
from backend.services.auth_service import is_valid_uuid
from backend.services.course_service import (
    verify_lesson_hierarchy,
    log_course_audit,
    _format_datetime,
)

logger = logging.getLogger("skillscatalyst.courses.media")

# ── Storage Constants ─────────────────────────────────────────────────────────

COURSE_LESSON_MEDIA_BUCKET = "course-lesson-media"
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_EXTENSIONS = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

CANONICAL_EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}

# Explicitly disallowed SVG types
SVG_MIME_TYPES = {"image/svg+xml", "image/svg", "text/xml-svg"}
SVG_EXTENSIONS = {".svg", ".svgz"}


# ── Media Validation & Sanitization ───────────────────────────────────────────

def validate_and_sanitize_image(
    original_filename: str,
    content_type: str,
    file_bytes: bytes,
) -> Tuple[str, str, str]:
    """
    Performs multi-layered verification:
      1. Rejects empty files (0 bytes)
      2. Enforces maximum 10MB size limit
      3. Rejects SVG uploads with explicit explanation (XSS/XXE prevention)
      4. Validates declared MIME type against whitelist
      5. Validates file extension and ensures it matches declared MIME type
      6. Validates binary magic bytes (file signature)
      7. Performs PIL decoding verification to catch corrupted or polyglot payloads
      8. Sanitizes original filename for metadata storage

    Returns:
      (sanitized_filename, validated_mime, canonical_extension)
    """
    # 1. Empty file check
    file_size = len(file_bytes)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # 2. Maximum file size check
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({file_size} bytes) exceeds the maximum allowed limit of 10MB ({MAX_FILE_SIZE_BYTES} bytes).",
        )

    # 3. Explicit SVG rejection
    raw_filename = (original_filename or "").strip().lower()
    raw_mime = (content_type or "").strip().lower()
    _, ext = os.path.splitext(raw_filename)

    if ext in SVG_EXTENSIONS or raw_mime in SVG_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "SVG uploads are not permitted for course lesson media due to script execution "
                "(XSS) and XML external entity (XXE) security risks. Please upload a standard raster "
                "image (JPEG, PNG, WebP, or GIF)."
            ),
        )

    # 4. Declared MIME whitelist
    if raw_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media MIME type: '{content_type}'. Allowed types: {sorted(ALLOWED_MIME_TYPES)}",
        )

    # 5. Extension validation and MIME match
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported or missing file extension: '{ext}'. Allowed extensions: {sorted(ALLOWED_EXTENSIONS.keys())}",
        )

    expected_mime = ALLOWED_EXTENSIONS[ext]
    if raw_mime != expected_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' does not match declared MIME type '{content_type}'.",
        )

    # 6. Binary Magic Bytes Validation
    if raw_mime == "image/jpeg":
        if not file_bytes.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match valid JPEG binary signature.",
            )
    elif raw_mime == "image/png":
        if not file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match valid PNG binary signature.",
            )
    elif raw_mime == "image/gif":
        if not (file_bytes.startswith(b"GIF87a") or file_bytes.startswith(b"GIF89a")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match valid GIF binary signature.",
            )
    elif raw_mime == "image/webp":
        if not (file_bytes.startswith(b"RIFF") and len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match valid WebP binary signature.",
            )

    # 7. PIL Image Verification
    if _PIL_AVAILABLE and Image is not None:
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img.verify()
                pil_format = (img.format or "").upper()
                format_map = {
                    "JPEG": "image/jpeg",
                    "PNG": "image/png",
                    "WEBP": "image/webp",
                    "GIF": "image/gif",
                }
                if pil_format not in format_map or format_map[pil_format] != raw_mime:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Decoded image format '{pil_format}' does not match expected format '{raw_mime}'.",
                    )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Corrupted or invalid image payload: {str(exc)}",
            )
    else:
        logger.warning("PIL (Pillow) is not installed; skipping deep image payload verification.")

    # 8. Filename Sanitization for metadata
    clean_name = os.path.basename(original_filename or "").strip()
    clean_name = re.sub(r"[\x00-\x1f\x7f]", "", clean_name)
    clean_name = clean_name.replace("/", "").replace("\\", "").replace("..", "")
    canonical_ext = CANONICAL_EXTENSIONS[raw_mime]
    if not clean_name or clean_name == f".{canonical_ext}":
        clean_name = f"lesson_image.{canonical_ext}"

    # Truncate to reasonable metadata limit
    if len(clean_name) > 255:
        base, extension = os.path.splitext(clean_name)
        clean_name = base[: 255 - len(extension)] + extension

    return clean_name, raw_mime, canonical_ext


def generate_storage_path(
    course_id: str,
    module_id: str,
    lesson_id: str,
    media_id: str,
    canonical_ext: str,
) -> str:
    """
    Constructs an authoritative, collision-safe storage path:
      {course_id}/{module_id}/{lesson_id}/{media_id}.{canonical_ext}

    Strictly validates UUIDs to guarantee path traversal is impossible.
    """
    for param_name, val in [
        ("course_id", course_id),
        ("module_id", module_id),
        ("lesson_id", lesson_id),
        ("media_id", media_id),
    ]:
        if not is_valid_uuid(val):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {param_name} UUID: '{val}'",
            )

    if canonical_ext not in CANONICAL_EXTENSIONS.values():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid storage extension: '{canonical_ext}'",
        )

    return f"{course_id}/{module_id}/{lesson_id}/{media_id}.{canonical_ext}"


# ── Media Service Operations ──────────────────────────────────────────────────

def upload_lesson_media(
    course_id: str,
    module_id: str,
    lesson_id: str,
    file_bytes: bytes,
    original_filename: str,
    content_type: str,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Validates, uploads, and records a course lesson image.
    Executes in three stages:
      1. Hierarchy verification (course -> module -> lesson)
      2. Image validation & path construction
      3. Supabase Storage upload + relational metadata insertion
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    # 1. Authoritative Hierarchy Verification
    verify_lesson_hierarchy(course_id=course_id, module_id=module_id, lesson_id=lesson_id)

    # 2. Strict Image Validation
    sanitized_filename, validated_mime, canonical_ext = validate_and_sanitize_image(
        original_filename=original_filename,
        content_type=content_type,
        file_bytes=file_bytes,
    )

    # 3. Generate authoritative IDs and paths
    media_id = str(uuid.uuid4())
    storage_path = generate_storage_path(
        course_id=course_id,
        module_id=module_id,
        lesson_id=lesson_id,
        media_id=media_id,
        canonical_ext=canonical_ext,
    )

    # 4. Upload to Supabase Storage Bucket
    try:
        sb.storage.from_(COURSE_LESSON_MEDIA_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": validated_mime, "upsert": "false"},
        )
    except Exception as exc:
        logger.error(f"Failed to upload media object '{storage_path}' to Supabase Storage: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to store media object in storage service: {str(exc)}",
        )

    # 5. Authoritative Public URL
    public_url = sb.storage.from_(COURSE_LESSON_MEDIA_BUCKET).get_public_url(storage_path)

    # 6. Relational Metadata Persistence
    media_row = {
        "id": media_id,
        "course_id": course_id,
        "module_id": module_id,
        "lesson_id": lesson_id,
        "storage_path": storage_path,
        "original_filename": sanitized_filename,
        "mime_type": validated_mime,
        "size_bytes": len(file_bytes),
        "public_url": public_url,
        "created_by": user_id,
    }

    try:
        db_res = sb.from_("course_lesson_media").insert(media_row).execute()
        if not db_res.data:
            raise RuntimeError("Database inserted 0 records for course_lesson_media")
    except Exception as exc:
        logger.error(f"Database insertion failed for media '{media_id}'; rolling back storage object: {exc}", exc_info=True)
        # Rollback storage object to prevent orphan leak
        try:
            sb.storage.from_(COURSE_LESSON_MEDIA_BUCKET).remove([storage_path])
        except Exception as rb_exc:
            logger.warning(f"Storage rollback failed for '{storage_path}': {rb_exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record media metadata: {str(exc)}",
        )

    record = db_res.data[0]

    # 7. Audit Logging
    log_course_audit(
        action="course_lesson_media_uploaded",
        entity_type="course_lesson_media",
        entity_id=media_id,
        user_id=user_id,
        details={
            "course_id": course_id,
            "module_id": module_id,
            "lesson_id": lesson_id,
            "storage_path": storage_path,
            "original_filename": sanitized_filename,
            "mime_type": validated_mime,
            "size_bytes": len(file_bytes),
        },
    )

    return {
        "id": str(record["id"]),
        "course_id": str(record["course_id"]),
        "module_id": str(record["module_id"]),
        "lesson_id": str(record["lesson_id"]),
        "storage_path": str(record["storage_path"]),
        "original_filename": str(record["original_filename"]),
        "mime_type": str(record["mime_type"]),
        "size_bytes": int(record["size_bytes"]),
        "public_url": str(record["public_url"]),
        "created_by": str(record["created_by"]) if record.get("created_by") else None,
        "created_at": _format_datetime(record.get("created_at")),
        "updated_at": _format_datetime(record.get("updated_at")),
    }


def delete_lesson_media(
    course_id: str,
    module_id: str,
    lesson_id: str,
    media_id: str,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Deletes a course lesson media object.
    Verifies that the media belongs directly to the specified hierarchy
    before deleting from storage and database.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    # 1. Authoritative Hierarchy Verification
    verify_lesson_hierarchy(course_id=course_id, module_id=module_id, lesson_id=lesson_id)

    if not is_valid_uuid(media_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media_id UUID: '{media_id}'",
        )

    # 2. Query Media Metadata
    media_res = sb.from_("course_lesson_media").select("*").eq("id", media_id).limit(1).execute()
    if not media_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media object '{media_id}' not found.",
        )

    record = media_res.data[0]

    # 3. Cross-hierarchy ownership verification
    if (
        str(record.get("course_id")) != course_id
        or str(record.get("module_id")) != module_id
        or str(record.get("lesson_id")) != lesson_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Media object does not belong to the specified course/module/lesson hierarchy.",
        )

    storage_path = record["storage_path"]

    # 4. Remove from Supabase Storage
    try:
        sb.storage.from_(COURSE_LESSON_MEDIA_BUCKET).remove([storage_path])
    except Exception as exc:
        logger.warning(f"Supabase storage object removal notice for '{storage_path}': {exc}")

    # 5. Delete metadata record
    sb.from_("course_lesson_media").delete().eq("id", media_id).execute()

    # 6. Audit Logging
    log_course_audit(
        action="course_lesson_media_deleted",
        entity_type="course_lesson_media",
        entity_id=media_id,
        user_id=user_id,
        details={
            "course_id": course_id,
            "module_id": module_id,
            "lesson_id": lesson_id,
            "storage_path": storage_path,
        },
    )

    return {
        "message": "Media deleted successfully",
        "id": media_id,
        "storage_path": storage_path,
    }


def list_lesson_media(
    course_id: str,
    module_id: str,
    lesson_id: str,
) -> Dict[str, Any]:
    """
    Lists all media metadata items associated with a lesson.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    # 1. Authoritative Hierarchy Verification
    verify_lesson_hierarchy(course_id=course_id, module_id=module_id, lesson_id=lesson_id)

    # 2. Query Metadata
    res = (
        sb.from_("course_lesson_media")
        .select("*")
        .eq("lesson_id", lesson_id)
        .order("created_at", desc=True)
        .execute()
    )

    items = []
    for row in res.data or []:
        items.append({
            "id": str(row["id"]),
            "course_id": str(row["course_id"]),
            "module_id": str(row["module_id"]),
            "lesson_id": str(row["lesson_id"]),
            "storage_path": str(row["storage_path"]),
            "original_filename": str(row["original_filename"]),
            "mime_type": str(row["mime_type"]),
            "size_bytes": int(row["size_bytes"]),
            "public_url": str(row["public_url"]),
            "created_by": str(row["created_by"]) if row.get("created_by") else None,
            "created_at": _format_datetime(row.get("created_at")),
            "updated_at": _format_datetime(row.get("updated_at")),
        })

    return {
        "total": len(items),
        "items": items,
    }


def get_lesson_media_by_id(
    course_id: str,
    module_id: str,
    lesson_id: str,
    media_id: str,
) -> Dict[str, Any]:
    """
    Retrieves a single media metadata item by ID after hierarchy verification.
    """
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    verify_lesson_hierarchy(course_id=course_id, module_id=module_id, lesson_id=lesson_id)

    if not is_valid_uuid(media_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media_id UUID: '{media_id}'",
        )

    res = sb.from_("course_lesson_media").select("*").eq("id", media_id).limit(1).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media object '{media_id}' not found.",
        )

    record = res.data[0]
    if (
        str(record.get("course_id")) != course_id
        or str(record.get("module_id")) != module_id
        or str(record.get("lesson_id")) != lesson_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Media object does not belong to the specified course/module/lesson hierarchy.",
        )

    return {
        "id": str(record["id"]),
        "course_id": str(record["course_id"]),
        "module_id": str(record["module_id"]),
        "lesson_id": str(record["lesson_id"]),
        "storage_path": str(record["storage_path"]),
        "original_filename": str(record["original_filename"]),
        "mime_type": str(record["mime_type"]),
        "size_bytes": int(record["size_bytes"]),
        "public_url": str(record["public_url"]),
        "created_by": str(record["created_by"]) if record.get("created_by") else None,
        "created_at": _format_datetime(record.get("created_at")),
        "updated_at": _format_datetime(record.get("updated_at")),
    }
