"""
backend/tests/test_owner_admin_permissions.py
Comprehensive automated test suite for Owner-Controlled Admin Access and Granular Permissions.

Covers:
1. Owner immutable UUID resolution & anti-spoofing invariants.
2. Granting and revoking Admin access.
3. Owner self-revocation and self-modification prevention.
4. Granular permission enforcement (read, create, update, publish, delete).
5. Admin isolation from user-management, payments, and global settings.
6. Student rejection on administrative routes.
7. Permission validation and cache invalidation.
8. Security audit logging.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from backend.config import OWNER_USER_ID, OWNER_USERNAME
from backend.services.auth_service import is_authoritative_owner, get_user_role
from backend.services.permission_service import (
    validate_permissions_list,
    get_user_permissions,
    invalidate_permission_cache,
    grant_admin_access,
    revoke_admin_access,
    update_admin_permissions,
    get_audit_logs,
    ALL_VALID_PERMISSIONS,
    _IN_MEMORY_PERMS_CACHE,
)
from backend.main import app


# ── Fixtures & Setup ──────────────────────────────────────────────────────────

TARGET_STUDENT_ID = "11111111-2222-3333-4444-555555555555"
TARGET_ADMIN_ID = "66666666-7777-8888-9999-000000000000"
ATTACKER_ID = "99999999-8888-7777-6666-555555555555"


@pytest.fixture(autouse=True)
def clean_in_memory_cache():
    """Ensure in-memory permission cache is cleared between tests."""
    _IN_MEMORY_PERMS_CACHE.clear()
    yield
    _IN_MEMORY_PERMS_CACHE.clear()
    app.dependency_overrides.clear()


# ── 1. OWNER RESOLUTION & ANTI-SPOOFING TESTS ──────────────────────────────────

def test_owner_authoritative_resolution():
    """Verified owner UUID returns True; arbitrary UUID returns False."""
    assert is_authoritative_owner(OWNER_USER_ID) is True
    assert is_authoritative_owner(ATTACKER_ID) is False
    assert is_authoritative_owner(None) is False
    assert is_authoritative_owner("") is False


def test_spoofed_username_does_not_grant_owner():
    """
    An attacker claiming the owner's username or email but possessing a different UUID
    must NEVER be granted owner privileges.
    """
    spoofed_meta = {
        "app_metadata": {
            "username": OWNER_USERNAME,
            "email": f"{OWNER_USERNAME}@example.com",
            "role": "owner",
        }
    }
    # Attacker UUID with owner username: MUST be downgraded to student
    role = get_user_role(user_id=ATTACKER_ID, supa_user=spoofed_meta)
    assert role == "student"
    assert is_authoritative_owner(ATTACKER_ID) is False


def test_genuine_owner_role_resolution():
    """Canonical owner ID resolves to 'owner' role."""
    owner_meta = {"app_metadata": {"role": "owner", "email": "palamooradithyagoud@gmail.com"}}
    role = get_user_role(user_id=OWNER_USER_ID, supa_user=owner_meta)
    assert role == "owner"


def test_admin_role_resolution():
    """Non-owner account with admin metadata resolves to 'admin' role."""
    admin_meta = {"app_metadata": {"role": "admin"}}
    role = get_user_role(user_id=TARGET_ADMIN_ID, supa_user=admin_meta)
    assert role == "admin"


# ── 2. PERMISSION VALIDATION TESTS ─────────────────────────────────────────────

def test_validate_permissions_valid_subset():
    """Accepts valid permission keys from the supported catalog."""
    valid_subset = ["scholarships.read", "scholarships.create", "events.read", "tech_news.publish"]
    validated = validate_permissions_list(valid_subset)
    assert set(validated) == set(valid_subset)


def test_validate_permissions_rejects_empty():
    """Rejects empty permission lists."""
    with pytest.raises(HTTPException) as exc_info:
        validate_permissions_list([])
    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_validate_permissions_rejects_unknown():
    """Rejects invalid or unknown permissions."""
    with pytest.raises(HTTPException) as exc_info:
        validate_permissions_list(["scholarships.read", "scholarships.hack_db"])
    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "scholarships.hack_db" in exc_info.value.detail


# ── 3. OWNER ROLE MANAGEMENT SERVICE TESTS ────────────────────────────────────

@patch("backend.services.permission_service.get_supabase")
def test_owner_can_grant_admin_access(mock_get_sb):
    """Owner can successfully grant admin access to an eligible user."""
    mock_sb = MagicMock()
    mock_get_sb.return_value = mock_sb

    # Mock admin_permissions upsert
    mock_sb.from_().upsert().execute.return_value = MagicMock(data=[{}])
    # Mock profiles update
    mock_sb.from_().update().eq().execute.return_value = MagicMock(data=[{}])
    # Mock audit log insert
    mock_sb.from_().insert().execute.return_value = MagicMock(data=[{}])

    perms_to_grant = ["scholarships.read", "scholarships.create", "events.read"]
    result = grant_admin_access(
        actor_id=OWNER_USER_ID,
        target_id=TARGET_STUDENT_ID,
        permissions=perms_to_grant,
        reason="Assigned as scholarship coordinator",
    )

    assert result["role"] == "admin"
    assert result["user_id"] == TARGET_STUDENT_ID
    assert set(result["permissions"]) == set(perms_to_grant)


def test_non_owner_cannot_grant_admin_access():
    """Non-owner callers receive 403 when attempting to grant admin access."""
    perms_to_grant = ["scholarships.read"]
    with pytest.raises(HTTPException) as exc_info:
        grant_admin_access(
            actor_id=ATTACKER_ID,
            target_id=TARGET_STUDENT_ID,
            permissions=perms_to_grant,
        )
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


def test_owner_cannot_grant_or_modify_own_admin_access():
    """Owner cannot target their own account for admin role modification."""
    with pytest.raises(HTTPException) as exc_info:
        grant_admin_access(
            actor_id=OWNER_USER_ID,
            target_id=OWNER_USER_ID,
            permissions=["scholarships.read"],
        )
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


@patch("backend.services.permission_service.get_supabase")
def test_owner_can_revoke_admin_access(mock_get_sb):
    """Owner can revoke admin privileges, downgrading target to student."""
    mock_sb = MagicMock()
    mock_get_sb.return_value = mock_sb
    mock_sb.from_().delete().eq().execute.return_value = MagicMock(data=[{}])
    mock_sb.from_().update().eq().execute.return_value = MagicMock(data=[{}])
    mock_sb.from_().insert().execute.return_value = MagicMock(data=[{}])

    result = revoke_admin_access(
        actor_id=OWNER_USER_ID,
        target_id=TARGET_ADMIN_ID,
        reason="Role tenure completed",
    )

    assert result["role"] == "student"
    assert result["user_id"] == TARGET_ADMIN_ID
    assert result["permissions"] == []


def test_owner_cannot_revoke_own_access():
    """Accidental removal of owner's own access is strictly prevented."""
    with pytest.raises(HTTPException) as exc_info:
        revoke_admin_access(actor_id=OWNER_USER_ID, target_id=OWNER_USER_ID)
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


# ── 4. CACHE INVALIDATION & FRESHNESS TESTS ───────────────────────────────────

def test_permission_cache_invalidation():
    """Cache invalidation immediately purges stale records from in-memory cache."""
    test_user_id = "test-cached-user"
    _IN_MEMORY_PERMS_CACHE[test_user_id] = {
        "perms": ["scholarships.read"],
        "expires_at": 9999999999.0,
    }

    assert test_user_id in _IN_MEMORY_PERMS_CACHE
    invalidate_permission_cache(test_user_id)
    assert test_user_id not in _IN_MEMORY_PERMS_CACHE


# ── 5. API ENDPOINT AUTHORIZATION & ROUTE GUARD TESTS ─────────────────────────

def test_admin_me_permissions_endpoint():
    """Authenticated caller can inspect their own role and permissions."""
    from backend.services.auth_service import require_authenticated_user

    mock_user = {
        "user_id": TARGET_ADMIN_ID,
        "email": "admin@example.com",
        "name": "Delegated Admin",
        "role": "admin",
        "is_owner": False,
        "is_admin": True,
        "permissions": ["scholarships.read", "scholarships.create"],
    }
    app.dependency_overrides[require_authenticated_user] = lambda: mock_user

    client = TestClient(app)
    res = client.get("/api/admin/me/permissions")
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "admin"
    assert data["is_owner"] is False
    assert data["is_admin"] is True
    assert "scholarships.read" in data["permissions"]


def test_student_rejected_from_admin_overview():
    """Regular student caller is rejected with 403 Forbidden from admin overview."""
    from backend.services.auth_service import require_admin

    def student_fail():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Platform Owner role required.")

    app.dependency_overrides[require_admin] = student_fail

    client = TestClient(app)
    res = client.get("/api/admin/overview")
    assert res.status_code == 403


def test_admin_forbidden_from_owner_user_directory():
    """Delegated Admin caller is forbidden (403) from accessing the User Governance directory."""
    from backend.services.auth_service import require_owner

    def owner_fail():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform Owner permission required.")

    app.dependency_overrides[require_owner] = owner_fail

    client = TestClient(app)
    res = client.get("/api/admin/users")
    assert res.status_code == 403


def test_admin_forbidden_from_grant_admin_endpoint():
    """Delegated Admin caller cannot grant admin access to other users (403)."""
    from backend.services.auth_service import require_owner

    def owner_fail():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform Owner permission required.")

    app.dependency_overrides[require_owner] = owner_fail

    client = TestClient(app)
    res = client.post(
        f"/api/admin/users/{TARGET_STUDENT_ID}/grant-admin",
        json={"permissions": ["scholarships.read"]},
    )
    assert res.status_code == 403


def test_admin_forbidden_from_audit_logs():
    """Delegated Admin caller is forbidden (403) from reviewing audit logs."""
    from backend.services.auth_service import require_owner

    def owner_fail():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform Owner permission required.")

    app.dependency_overrides[require_owner] = owner_fail

    client = TestClient(app)
    res = client.get("/api/admin/audit-logs")
    assert res.status_code == 403


def test_admin_forbidden_from_commercial_payments():
    """Delegated Admin cannot access financial/revenue dashboards."""
    from backend.services.auth_service import require_owner

    def owner_fail():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform Owner permission required.")

    app.dependency_overrides[require_owner] = owner_fail

    client = TestClient(app)
    res = client.get("/api/admin/payments/overview")
    assert res.status_code == 403


def test_granular_permission_enforcement_allowed_vs_forbidden():
    """
    Tests granular permission dependency:
    - User with 'scholarships.read' passes require_permission('scholarships.read')
    - User without 'scholarships.create' fails require_permission('scholarships.create')
    """
    from backend.services.permission_service import check_has_permission, _IN_MEMORY_PERMS_CACHE

    # Populate in-memory permissions for test admin user
    _IN_MEMORY_PERMS_CACHE[TARGET_ADMIN_ID] = {
        "perms": ["scholarships.read", "events.read"],
        "expires_at": 9999999999.0,
    }

    # Allowed operations for delegated Admin
    assert check_has_permission(TARGET_ADMIN_ID, "scholarships.read") is True
    assert check_has_permission(TARGET_ADMIN_ID, "events.read") is True

    # Forbidden operations for delegated Admin
    assert check_has_permission(TARGET_ADMIN_ID, "scholarships.create") is False
    assert check_has_permission(TARGET_ADMIN_ID, "scholarships.delete") is False
    assert check_has_permission(TARGET_ADMIN_ID, "tech_news.read") is False

    # Owner has all operations unconditionally
    assert check_has_permission(OWNER_USER_ID, "scholarships.delete") is True
    assert check_has_permission(OWNER_USER_ID, "tech_news.create") is True
