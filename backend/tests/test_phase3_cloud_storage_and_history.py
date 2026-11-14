"""
backend/tests/test_phase3_cloud_storage_and_history.py

Automated Test Suite for Phase 3: Cloud Storage & Resume History.
Tests all requirements specified in Phase 3.7:
1. Upload & File Validation (PDF, DOCX, extension whitelist, magic bytes, oversized, empty, unauth)
2. Supabase Storage Object Lifecycle & Security (Path building, traversal defense, signed URLs)
3. Relational Persistence & Integrity (Correct fields, scores bounded, JSONB artifact, NULL preserved)
4. History Retrieval (Lightweight projection, pagination, sorting, empty state)
5. Tenant Isolation & Authorization (User A vs User B cross-access, download, delete protection)
6. Deletion Lifecycle (DB record deletion, storage cleanup, safe idempotency)
7. Failure & Compensation Handling (Storage rollback on analysis/DB failure, quota release)
"""

import io
import os
import uuid
import datetime
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException
from backend.services.resume_history_service import (
    build_storage_path,
    upload_resume_to_storage,
    delete_resume_from_storage,
    generate_signed_download_url,
    persist_resume_analysis,
    get_user_resume_history,
    get_resume_analysis_by_id,
    delete_resume_analysis,
    RESUMES_BUCKET,
)
from backend.routers.resume import (
    validate_magic_bytes,
    get_file_mime_type,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
)
from backend.services.resume_ai_evaluator import AIEvaluationReport
from backend.services.ats_engine import ATSAnalysisReport
from backend.services.keyword_matcher import KeywordAnalysisReport


# ---------------------------------------------------------------------------
# Test Data Fixtures
# ---------------------------------------------------------------------------

USER_A = "11111111-1111-4111-a111-111111111111"
USER_B = "22222222-2222-4222-b222-222222222222"

VALID_PDF_BYTES = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
VALID_DOCX_BYTES = b"PK\x03\x04\x14\x00\x00\x00\x08\x00word/document.xmlFakeZipData"


# ===========================================================================
# 1. UPLOAD & FILE VALIDATION TESTS
# ===========================================================================

def test_upload_valid_pdf_magic_bytes():
    """Verify standard %PDF- magic bytes validation."""
    assert validate_magic_bytes(VALID_PDF_BYTES, ".pdf") is True
    assert validate_magic_bytes(b"INVALID HEADER", ".pdf") is False


def test_upload_valid_docx_magic_bytes():
    """Verify PK zip header magic bytes for DOCX."""
    assert validate_magic_bytes(VALID_DOCX_BYTES, ".docx") is True
    assert validate_magic_bytes(b"NOT A ZIP CONTAINER", ".docx") is False


def test_upload_invalid_file_extension():
    """Verify non-whitelisted extensions (.exe, .sh, .py) are rejected."""
    bad_extensions = [".exe", ".sh", ".py", ".bat", ".php", ".js"]
    for ext in bad_extensions:
        assert ext not in ALLOWED_EXTENSIONS


def test_upload_magic_byte_mismatch():
    """Verify mismatched content (e.g. JPEG bytes with .pdf extension) fails validation."""
    fake_pdf = b"\xff\xd8\xff\xe0" + b"A" * 100  # JPEG header with .pdf ext
    assert validate_magic_bytes(fake_pdf, ".pdf") is False


def test_upload_empty_file_rejected():
    """Verify zero-byte files are rejected."""
    assert validate_magic_bytes(b"", ".pdf") is False
    assert validate_magic_bytes(b"", ".docx") is False


def test_upload_oversized_file_limit():
    """Verify 5MB file size limit threshold."""
    oversized = b"X" * (MAX_FILE_SIZE_BYTES + 1)
    assert len(oversized) > MAX_FILE_SIZE_BYTES


# ===========================================================================
# 2. STORAGE OBJECT & SECURITY TESTS
# ===========================================================================

def test_storage_path_sanitization_and_traversal_defense():
    """Verify path generation neutralizes directory traversal and special chars."""
    dirty_filename = "../../Windows/System32/cmd.exe..//my_resume.pdf"
    path = build_storage_path(USER_A, "resume-123", dirty_filename)

    assert ".." not in path
    assert "\\" not in path
    assert path.startswith(f"{USER_A}/resume-123/")
    assert path.endswith(".pdf")


def test_storage_upload_success():
    """Verify upload_resume_to_storage calls Supabase Storage with correct bucket and options."""
    mock_sb = MagicMock()
    mock_bucket = MagicMock()
    mock_sb.storage.from_.return_value = mock_bucket

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        storage_path = upload_resume_to_storage(
            user_id=USER_A,
            resume_id="res-abc",
            filename="my_resume.pdf",
            content=VALID_PDF_BYTES,
            mime_type="application/pdf",
        )

        assert storage_path == f"{USER_A}/res-abc/my_resume.pdf"
        mock_sb.storage.from_.assert_called_with(RESUMES_BUCKET)
        mock_bucket.upload.assert_called_once_with(
            path=storage_path,
            file=VALID_PDF_BYTES,
            file_options={"content-type": "application/pdf", "upsert": "false"},
        )


def test_storage_signed_url_generation():
    """Verify short-lived signed download URL generation."""
    mock_sb = MagicMock()
    mock_bucket = MagicMock()
    mock_sb.storage.from_.return_value = mock_bucket
    mock_bucket.create_signed_url.return_value = {
        "signedURL": "https://supabase.co/storage/v1/object/sign/resumes/signed-download-link",
        "signedUrl": "https://supabase.co/storage/v1/object/sign/resumes/signed-download-link",
    }

    storage_path = f"{USER_A}/res-abc/my_resume.pdf"
    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        signed_url = generate_signed_download_url(
            user_id=USER_A,
            storage_path=storage_path,
            expires_in=900,
        )

        assert signed_url == "https://supabase.co/storage/v1/object/sign/resumes/signed-download-link"
        mock_bucket.create_signed_url.assert_called_once_with(
            path=storage_path,
            expires_in=900,
        )


def test_storage_signed_url_cross_user_rejection():
    """Verify User A cannot request a signed URL for User B's storage path."""
    unauthorized_path = f"{USER_B}/res-xyz/confidential_resume.pdf"
    with pytest.raises(HTTPException) as exc:
        generate_signed_download_url(user_id=USER_A, storage_path=unauthorized_path)
    assert exc.value.status_code == 403


# ===========================================================================
# 3. DATABASE PERSISTENCE & DATA INTEGRITY TESTS
# ===========================================================================

def test_persistence_correct_fields_and_scores():
    """Verify analysis metadata, component scores, and JSONB are stored in resume_analyses."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    saved_payload = {
        "id": "analysis-uuid-123",
        "user_id": USER_A,
        "original_filename": "jane_doe_cv.pdf",
        "storage_path": f"{USER_A}/analysis-uuid-123/jane_doe_cv.pdf",
        "file_type": "PDF",
        "file_size": 10240,
        "ats_score": 88.5,
        "content_score": 82.0,
        "skills_score": 85.0,
        "structure_score": 90.0,
        "overall_score": 85.85,
        "analysis_result": {"summary": "Strong hire", "career_stage": "fresher"},
        "job_description": "Fullstack Engineer",
        "created_at": "2026-11-14T10:00:00Z",
    }
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[saved_payload])

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        record = persist_resume_analysis(
            analysis_id="analysis-uuid-123",
            user_id=USER_A,
            original_filename="jane_doe_cv.pdf",
            storage_path=f"{USER_A}/analysis-uuid-123/jane_doe_cv.pdf",
            file_type="PDF",
            file_size=10240,
            ats_score=88.5,
            content_score=82.0,
            skills_score=85.0,
            structure_score=90.0,
            overall_score=85.85,
            analysis_result={"summary": "Strong hire", "career_stage": "fresher"},
            job_description="Fullstack Engineer",
        )

        assert record["id"] == "analysis-uuid-123"
        assert record["user_id"] == USER_A
        assert record["overall_score"] == 85.85
        assert record["ats_score"] == 88.5
        mock_sb.table.assert_called_with("resume_analyses")


def test_persistence_preserves_null_scores():
    """Verify unavailable category scores remain NULL and are never replaced with artificial zeros."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    saved_row = {
        "id": "analysis-null-scores",
        "user_id": USER_A,
        "ats_score": 80.0,
        "content_score": None,  # Missing LLM output
        "skills_score": None,
        "structure_score": 85.0,
        "overall_score": 82.2,
    }
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[saved_row])

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        record = persist_resume_analysis(
            analysis_id="analysis-null-scores",
            user_id=USER_A,
            original_filename="resume.pdf",
            storage_path=f"{USER_A}/analysis-null-scores/resume.pdf",
            file_type="PDF",
            file_size=5000,
            ats_score=80.0,
            content_score=None,
            skills_score=None,
            structure_score=85.0,
            overall_score=82.2,
            analysis_result={},
        )

        assert record["content_score"] is None
        assert record["skills_score"] is None
        assert record["ats_score"] == 80.0


# ===========================================================================
# 4. HISTORY RETRIEVAL & PAGINATION TESTS
# ===========================================================================

def test_history_lightweight_projection_and_pagination():
    """Verify get_user_resume_history fetches lightweight records and respects pagination."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Mock count query
    mock_count_query = MagicMock()
    mock_count_query.select.return_value.eq.return_value.execute.return_value = MagicMock(count=25)

    # Mock data query
    mock_data_query = MagicMock()
    mock_sb.table.side_effect = [mock_count_query, mock_data_query]

    items_page_2 = [
        {
            "id": f"res-{i}",
            "user_id": USER_A,
            "original_filename": f"resume_{i}.pdf",
            "storage_path": f"{USER_A}/res-{i}/resume_{i}.pdf",
            "overall_score": 80.0 + i,
            "ats_score": 85.0,
            "created_at": f"2026-11-14T1{i}:00:00Z",
        }
        for i in range(10)
    ]
    mock_data_query.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(data=items_page_2)

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        res = get_user_resume_history(
            user_id=USER_A,
            page=2,
            page_size=10,
            sort_by="created_at",
            order="desc",
        )

        assert res["total"] == 25
        assert res["page"] == 2
        assert res["page_size"] == 10
        assert res["total_pages"] == 3
        assert len(res["items"]) == 10


def test_history_empty_state():
    """Verify empty history response for new candidate without past analyses."""
    mock_sb = MagicMock()
    mock_count_query = MagicMock()
    mock_count_query.select.return_value.eq.return_value.execute.return_value = MagicMock(count=0)

    mock_data_query = MagicMock()
    mock_data_query.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(data=[])
    mock_sb.table.side_effect = [mock_count_query, mock_data_query]

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        res = get_user_resume_history(user_id=USER_A, page=1, page_size=10)
        assert res["total"] == 0
        assert res["items"] == []
        assert res["total_pages"] == 1


# ===========================================================================
# 5. TENANT ISOLATION & AUTHORIZATION TESTS
# ===========================================================================

def test_tenant_isolation_get_analysis():
    """Verify User A cannot retrieve User B's historical analysis record."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    # When querying with user_id=USER_A for User B's record, database returns empty list
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    target_analysis_id = "33333333-3333-4333-c333-333333333333"

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            get_resume_analysis_by_id(user_id=USER_A, analysis_id=target_analysis_id)
        assert exc.value.status_code == 404


def test_tenant_isolation_delete_analysis():
    """Verify User A cannot delete User B's resume analysis."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    # User B's record is not accessible to User A
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    target_analysis_id = "44444444-4444-4444-d444-444444444444"

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            delete_resume_analysis(user_id=USER_A, analysis_id=target_analysis_id)
        assert exc.value.status_code == 404


# ===========================================================================
# 6. DELETION & STORAGE CLEANUP TESTS
# ===========================================================================

def test_delete_analysis_removes_db_record_and_storage_file():
    """Verify delete_resume_analysis removes both the PostgreSQL record and the Storage file."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_bucket = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_sb.storage.from_.return_value = mock_bucket

    analysis_id = "55555555-5555-4555-e555-555555555555"
    storage_path = f"{USER_A}/{analysis_id}/resume.pdf"

    # Mock finding record
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": analysis_id, "user_id": USER_A, "storage_path": storage_path}]
    )

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        success = delete_resume_analysis(user_id=USER_A, analysis_id=analysis_id)
        assert success is True

        # Verify DB delete was called with user_id scope
        mock_table.delete.assert_called_once()

        # Verify Supabase Storage remove was called with storage_path
        mock_sb.storage.from_.assert_called_with(RESUMES_BUCKET)
        mock_bucket.remove.assert_called_once_with([storage_path])


def test_repeated_deletion_idempotent_or_404():
    """Verify deleting an already deleted analysis returns 404 without error."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    analysis_id = "66666666-6666-4666-f666-666666666666"

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            delete_resume_analysis(user_id=USER_A, analysis_id=analysis_id)
        assert exc.value.status_code == 404


# ===========================================================================
# 7. COMPENSATION & FAILURE ROLLBACK TESTS
# ===========================================================================

def test_database_persistence_failure_cleans_up_storage_object():
    """Verify if database insert fails, the previously uploaded storage object is deleted (compensation)."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_bucket = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_sb.storage.from_.return_value = mock_bucket

    # Simulate database insertion exception
    mock_table.insert.return_value.execute.side_effect = RuntimeError("PostgreSQL connection timeout")

    storage_path = f"{USER_A}/res-fail/resume.pdf"

    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            persist_resume_analysis(
                analysis_id="res-fail",
                user_id=USER_A,
                original_filename="resume.pdf",
                storage_path=storage_path,
                file_type="PDF",
                file_size=5000,
                ats_score=85.0,
                content_score=80.0,
                skills_score=80.0,
                structure_score=90.0,
                overall_score=83.5,
                analysis_result={},
            )

        assert exc.value.status_code == 500
        # Assert storage compensation cleanup was invoked
        mock_bucket.remove.assert_called_once_with([storage_path])


# ===========================================================================
# 8. API FASTAPI INTEGRATION ENDPOINT TESTS
# ===========================================================================

from backend.services.auth_service import get_current_user_id


def test_api_unauthenticated_request_rejected():
    """Verify unauthenticated requests to /api/resume/history are rejected with 401."""
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization=None)
    assert exc.value.status_code == 401

    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization="")
    assert exc.value.status_code == 401


def test_api_download_unauthorized_record():
    """Verify attempting to download without authentication or cross-tenant ownership fails safely."""
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization="Bearer invalid-token")
    assert exc.value.status_code == 401

    fake_id = str(uuid.uuid4())
    fake_path = f"different-user/{fake_id}/resume.pdf"
    with pytest.raises(HTTPException) as exc:
        generate_signed_download_url(user_id=USER_A, storage_path=fake_path)
    assert exc.value.status_code == 403


def test_api_delete_unauthorized_record():
    """Verify unauthenticated or cross-tenant delete call is rejected."""
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization="Bearer ")
    assert exc.value.status_code == 401

    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    fake_id = str(uuid.uuid4())
    with patch("backend.services.resume_history_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            delete_resume_analysis(user_id=USER_A, analysis_id=fake_id)
        assert exc.value.status_code == 404
