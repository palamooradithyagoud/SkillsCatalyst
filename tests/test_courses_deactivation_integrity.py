"""
tests/test_courses_deactivation_integrity.py
Comprehensive Verification Suite for Courses Feature Deactivation Integrity.

Validates the complete safety boundaries:
1. Student course endpoints return 404 (inaccessible).
2. Admin course endpoints return 404 (de-registered from active router).
3. Unrelated admin endpoints remain registered and strictly enforce admin auth.
4. Certificates endpoints remain active for viewing and public verification.
5. Profile identity-lock behavior remains functional.
"""

import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import require_admin, require_owner, get_current_user_id


@pytest.fixture
def client():
    return TestClient(app)


# ── 1. Admin Course Endpoints Inaccessibility ────────────────────────────────

def test_admin_courses_list_inaccessible(client):
    """Verifies GET /api/admin/courses returns 404."""
    res = client.get("/api/admin/courses")
    assert res.status_code == 404


def test_admin_courses_create_inaccessible(client):
    """Verifies POST /api/admin/courses returns 404."""
    res = client.post("/api/admin/courses", json={"title": "Test Course"})
    assert res.status_code == 404


def test_admin_courses_detail_inaccessible(client):
    """Verifies GET /api/admin/courses/{id} returns 404."""
    res = client.get(f"/api/admin/courses/{uuid.uuid4()}")
    assert res.status_code == 404


def test_admin_courses_delete_inaccessible(client):
    """Verifies DELETE /api/admin/courses/{id} returns 404."""
    res = client.delete(f"/api/admin/courses/{uuid.uuid4()}")
    assert res.status_code == 404


def test_admin_courses_modules_inaccessible(client):
    """Verifies GET /api/admin/courses/{id}/modules returns 404."""
    res = client.get(f"/api/admin/courses/{uuid.uuid4()}/modules")
    assert res.status_code == 404


def test_admin_courses_certificate_config_inaccessible(client):
    """Verifies GET /api/admin/courses/{id}/certificate returns 404."""
    res = client.get(f"/api/admin/courses/{uuid.uuid4()}/certificate")
    assert res.status_code == 404


def test_admin_courses_certificate_preview_inaccessible(client):
    """Verifies GET /api/admin/courses/{id}/certificate/preview returns 404."""
    res = client.get(f"/api/admin/courses/{uuid.uuid4()}/certificate/preview")
    assert res.status_code == 404


# ── 2. Unrelated Admin Endpoints Functionality & Security ────────────────────

def test_unrelated_admin_endpoints_require_auth(client):
    """Verifies active admin endpoints reject unauthenticated requests."""
    res_overview = client.get("/api/admin/overview")
    assert res_overview.status_code in (401, 403)

    res_events = client.get("/api/admin/events")
    assert res_events.status_code in (401, 403)

    res_templates = client.get("/api/admin/certificate-templates")
    assert res_templates.status_code in (401, 403)


def test_unrelated_admin_endpoints_accessible_with_admin_auth(client):
    """Verifies active admin endpoints succeed when authenticated as administrator."""
    mock_admin = {"user_id": str(uuid.uuid4()), "email": "admin@skillscatalyst.in", "role": "owner"}
    app.dependency_overrides[require_admin] = lambda: mock_admin
    app.dependency_overrides[require_owner] = lambda: mock_admin

    try:
        mock_sb = MagicMock()
        mock_sb.from_.return_value.select.return_value.execute.return_value = MagicMock(data=[], count=0)
        
        with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
             patch("backend.routers.admin.get_supabase", return_value=mock_sb):
            res_overview = client.get("/api/admin/overview")
            assert res_overview.status_code == 200

            res_status = client.get("/api/admin/system-status")
            assert res_status.status_code == 200
    finally:
        app.dependency_overrides.pop(require_admin, None)
        app.dependency_overrides.pop(require_owner, None)


# ── 3. Certificates Functionality Preservation ──────────────────────────────

def test_student_certificates_list_requires_auth(client):
    """Verifies GET /api/certificates rejects unauthenticated requests."""
    res = client.get("/api/certificates")
    assert res.status_code in (401, 403)


def test_student_certificates_accessible_with_auth(client):
    """Verifies GET /api/certificates is active and returns student certificates."""
    student_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: student_id

    try:
        with patch("backend.routers.certificates.get_student_certificates", return_value=[]):
            res = client.get("/api/certificates")
            assert res.status_code == 200
            assert res.json() == []
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)


def test_public_certificate_verification_accessible_without_auth(client):
    """Verifies GET /api/public/certificates/{verification_id} is active and requires no auth."""
    mock_data = {
        "is_valid": True,
        "message": "Valid credential.",
        "certificate_number": "SC-CERT-2026-ABCDEF12",
        "student_name": "Test Student",
        "course_title": "Python Programming",
        "issued_at": "2026-09-26T00:00:00Z",
        "score": 95,
        "design_theme": "professional_blue",
        "background_media_url": "https://example.com/bg.png",
    }
    with patch("backend.routers.certificates.verify_certificate_public", return_value=mock_data):
        res = client.get("/api/public/certificates/sc-v-test-12345678")
        assert res.status_code == 200
        data = res.json()
        assert data["is_valid"] is True
        assert data["student_name"] == "Test Student"


# ── 4. Profile Identity Lock Preservation ────────────────────────────────────

def test_profile_identity_lock_enforcement(client):
    """Verifies that is_user_identity_locked correctly blocks name modification when a certificate exists."""
    user_id = str(uuid.uuid4())
    app.dependency_overrides[get_current_user_id] = lambda: user_id

    try:
        mock_sb = MagicMock()
        mock_sb.from_.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"full_name": "Original Name"}]
        )

        with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
             patch("backend.routers.profile.get_supabase", return_value=mock_sb), \
             patch("backend.services.certificate_service.is_user_identity_locked", return_value=True):
            
            # Attempt to change name to 'Hacked Name' via POST /api/profile/personal
            res = client.post("/api/profile/personal", json={"full_name": "Hacked Name"})
            assert res.status_code == 403
            assert "locked" in res.json().get("detail", "").lower()
    finally:
        app.dependency_overrides.pop(get_current_user_id, None)
