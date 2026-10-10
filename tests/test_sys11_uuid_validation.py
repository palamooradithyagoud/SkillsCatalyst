"""
tests/test_sys11_uuid_validation.py
Focused automated test suite verifying SYS-11:
PostgreSQL 22P02 Invalid UUID Input Validation and Defense.

Verifies:
1. is_user_identity_locked rejects non-UUID strings without calling PostgREST / raising 22P02.
2. get_authoritative_user_identity handles non-UUID strings safely without querying database.
3. update_student_certificate_identity rejects non-UUID user IDs with HTTP 400.
4. check_course_completion_and_eligibility rejects non-UUID user IDs with HTTP 400.
5. issue_course_certificate rejects non-UUID user IDs with HTTP 400.
6. get_student_certificates returns empty list for non-UUID user IDs without raising 22P02.
7. get_student_certificate_by_course returns HTTP 404 for non-UUID user IDs without raising 22P02.
8. get_student_certificate_by_id rejects non-UUID user_id or certificate_id with HTTP 404.
9. get_course_certificate_config handles non-UUID course_id gracefully.
10. The exact malformed input pattern ("user_test_123") that previously caused 22P02 is handled cleanly.
"""

import uuid
import pytest
from fastapi import HTTPException
from unittest.mock import MagicMock, patch

from backend.services.certificate_service import (
    _is_uuid,
    is_user_identity_locked,
    get_authoritative_user_identity,
    update_student_certificate_identity,
    check_course_completion_and_eligibility,
    issue_course_certificate,
    get_student_certificates,
    get_student_certificate_by_course,
    get_student_certificate_by_id,
    get_course_certificate_config,
)


# ── TEST 1: _is_uuid Validation Accuracy ──────────────────────────────────────
def test_is_uuid_helper_accuracy():
    """Verify that _is_uuid accurately validates standard RFC 4122 UUID strings."""
    valid_id = str(uuid.uuid4())
    assert _is_uuid(valid_id) is True
    assert _is_uuid(valid_id.upper()) is True

    # Rejection of invalid / malformed formats
    assert _is_uuid("user_test_123") is False
    assert _is_uuid("guest_6b84d2e54a07e549f5acc0a87f3f3d20") is False
    assert _is_uuid("") is False
    assert _is_uuid(None) is False
    assert _is_uuid("12345") is False
    assert _is_uuid("not-a-valid-uuid") is False
    assert _is_uuid("6b84d2e5-invalid-uuid-part") is False
    assert _is_uuid("invalid-uuid-with-symbols!@#") is False


# ── TEST 2: is_user_identity_locked Non-UUID Short-Circuit ────────────────────
def test_is_user_identity_locked_non_uuid_short_circuit():
    """Non-UUID user identifiers must return False immediately without calling database."""
    # Pattern that previously triggered 22P02 in test_profile_upgrade.py
    assert is_user_identity_locked("user_test_123") is False
    assert is_user_identity_locked("guest_abc123") is False
    assert is_user_identity_locked("") is False
    assert is_user_identity_locked(None) is False
    assert is_user_identity_locked("malformed-uuid-format") is False


# ── TEST 3: get_authoritative_user_identity Non-UUID Handling ─────────────────
def test_get_authoritative_user_identity_non_uuid():
    """Non-UUID identifiers must safely return default record without database queries."""
    res = get_authoritative_user_identity("user_test_123")
    assert res["user_id"] == "user_test_123"
    assert res["full_name"] == ""
    assert res["college"] == ""
    assert res["is_identity_locked"] is False


# ── TEST 4: update_student_certificate_identity Non-UUID Validation ───────────
def test_update_student_certificate_identity_non_uuid():
    """Non-UUID identifiers must be rejected with HTTP 400 Bad Request."""
    with pytest.raises(HTTPException) as exc_info:
        update_student_certificate_identity("user_test_123", full_name="Valid Name")
    assert exc_info.value.status_code == 400
    assert "Invalid user ID format" in exc_info.value.detail


# ── TEST 5: check_course_completion_and_eligibility Non-UUID Validation ───────
def test_check_course_completion_and_eligibility_non_uuid():
    """Non-UUID identifiers must be rejected with HTTP 400 Bad Request."""
    with pytest.raises(HTTPException) as exc_info:
        check_course_completion_and_eligibility("user_test_123", "python-course")
    assert exc_info.value.status_code == 400
    assert "Invalid user ID format" in exc_info.value.detail


# ── TEST 6: issue_course_certificate Non-UUID Validation ──────────────────────
def test_issue_course_certificate_non_uuid():
    """Non-UUID identifiers must be rejected with HTTP 400 Bad Request."""
    with pytest.raises(HTTPException) as exc_info:
        issue_course_certificate("user_test_123", "python-course")
    assert exc_info.value.status_code == 400
    assert "Invalid user ID format" in exc_info.value.detail


# ── TEST 7: get_student_certificates Non-UUID Safe Return ─────────────────────
def test_get_student_certificates_non_uuid():
    """Non-UUID user identifiers must return empty list without database 22P02 error."""
    assert get_student_certificates("user_test_123") == []
    assert get_student_certificates("guest_anon") == []
    assert get_student_certificates("") == []


# ── TEST 8: get_student_certificate_by_course Non-UUID Handling ───────────────
def test_get_student_certificate_by_course_non_uuid():
    """Non-UUID user identifiers must return 404 without database 22P02 error."""
    with pytest.raises(HTTPException) as exc_info:
        get_student_certificate_by_course("user_test_123", "python-course")
    assert exc_info.value.status_code == 404
    assert "Certificate not found" in exc_info.value.detail


# ── TEST 9: get_student_certificate_by_id Non-UUID Validation ─────────────────
def test_get_student_certificate_by_id_non_uuid():
    """Non-UUID user_id or certificate_id must return 404 without database 22P02 error."""
    valid_cert_id = str(uuid.uuid4())
    valid_user_id = str(uuid.uuid4())

    # Invalid user_id
    with pytest.raises(HTTPException) as exc_info:
        get_student_certificate_by_id("user_test_123", valid_cert_id)
    assert exc_info.value.status_code == 404

    # Invalid certificate_id
    with pytest.raises(HTTPException) as exc_info:
        get_student_certificate_by_id(valid_user_id, "not-a-uuid")
    assert exc_info.value.status_code == 404


# ── TEST 10: get_course_certificate_config Non-UUID Handling ──────────────────
def test_get_course_certificate_config_non_uuid():
    """Non-UUID course identifier returns default disabled config without 22P02 error."""
    cfg = get_course_certificate_config("non-uuid-course")
    assert cfg["course_id"] == "non-uuid-course"
    assert cfg["enabled"] is False
    assert cfg["certificate_template_id"] is None
