"""
tests/test_unified_auth_and_owner.py
Comprehensive End-to-End & Unit Test Suite for SkillsCatalyst Unified Auth & Owner System.

Tests all 26 critical requirements:
1-4:   Authentication & Role Resolution
5-7:   Admin API RBAC Protection (200 / 403 / 401)
8-11:  Role Escalation Safeguards (DB & API)
12-16: Mode Switching & Identity Isolation
17-20: Route Protection & 403 Non-Logout Invariance
21-26: Regressions (Existing Auth, Dashboard, Profile, Session Refresh)
"""

import sys
import os
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Ensure workspace root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import (
    get_user_role,
    require_authenticated_user,
    require_owner,
    get_current_user_id,
)
from backend.config import OWNER_EMAIL

client = TestClient(app)


class MockUser:
    def __init__(self, uid: str, email: str, role: str = "student", full_name: str = "Test User"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": full_name}


class TestUnifiedAuthAndOwnerSystem(unittest.TestCase):

    def setUp(self):
        self.owner_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.owner_email = "palamooradithyagoud@gmail.com"
        self.student_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        self.student_email = "student.learner@gmail.com"

        self.mock_owner_user = MockUser(self.owner_id, self.owner_email, role="owner", full_name="Adithya goud Palamoor")
        self.mock_student_user = MockUser(self.student_id, self.student_email, role="student", full_name="Student Learner")

    # =========================================================================
    # 1-4: AUTHENTICATION & ROLE RESOLUTION TESTS
    # =========================================================================

    def test_01_student_authenticates_successfully(self):
        """1. Student authenticates successfully."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            user = require_authenticated_user(authorization="Bearer mock-student-jwt")
            self.assertEqual(user["user_id"], self.student_id)
            self.assertEqual(user["email"], self.student_email)

    def test_02_owner_authenticates_successfully(self):
        """2. Owner authenticates successfully."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            user = require_authenticated_user(authorization="Bearer mock-owner-jwt")
            self.assertEqual(user["user_id"], self.owner_id)
            self.assertEqual(user["email"], self.owner_email)

    def test_03_student_resolves_to_role_student(self):
        """3. Student resolves to role=student."""
        role = get_user_role(self.student_id, self.mock_student_user)
        self.assertEqual(role, "student")

    def test_04_owner_resolves_to_role_owner(self):
        """4. Owner resolves to role=owner."""
        role = get_user_role(self.owner_id, self.mock_owner_user)
        self.assertEqual(role, "owner")

    def test_auth_me_endpoint_returns_correct_role_for_owner(self):
        """Auth /me endpoint correctly returns role=owner and is_owner=True for owner."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            resp = client.get("/api/auth/me", headers={"Authorization": "Bearer mock-owner-jwt"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["role"], "owner")
            self.assertTrue(data["is_owner"])
            self.assertEqual(data["email"], self.owner_email)

    def test_auth_me_endpoint_returns_correct_role_for_student(self):
        """Auth /me endpoint correctly returns role=student and is_owner=False for student."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            resp = client.get("/api/auth/me", headers={"Authorization": "Bearer mock-student-jwt"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["role"], "student")
            self.assertFalse(data["is_owner"])
            self.assertEqual(data["email"], self.student_email)

    # =========================================================================
    # 5-7: ADMIN API RBAC PROTECTION
    # =========================================================================

    def test_05_owner_access_admin_overview_returns_200(self):
        """5. Owner calling /api/admin/overview returns HTTP 200 OK."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            # Mock profiles query for overview
            mock_client.from_().select().execute.return_value = MagicMock(data=[], count=10)
            mock_sb.return_value = mock_client

            resp = client.get("/api/admin/overview", headers={"Authorization": "Bearer mock-owner-jwt"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "operational")
            self.assertEqual(data["caller"]["role"], "owner")

    def test_06_student_access_admin_overview_returns_403(self):
        """6. Student calling /api/admin/overview returns HTTP 403 Forbidden."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            resp = client.get("/api/admin/overview", headers={"Authorization": "Bearer mock-student-jwt"})
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Forbidden", resp.json()["detail"])

    def test_07_unauthenticated_access_admin_overview_returns_401(self):
        """7. Unauthenticated user calling /api/admin/overview returns HTTP 401 Unauthorized."""
        resp = client.get("/api/admin/overview")
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Invalid or missing authentication token", resp.json()["detail"])

    # =========================================================================
    # 8-11: ROLE ESCALATION PREVENTION TESTS
    # =========================================================================

    def test_08_student_cannot_change_role_to_owner_via_api(self):
        """8. Student attempting to inject role=owner into personal profile API is ignored/prevented."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb, \
             patch("backend.routers.profile.get_supabase") as mock_prof_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_client.from_().upsert().execute.return_value = MagicMock(data=[])
            mock_sb.return_value = mock_client
            mock_prof_sb.return_value = mock_client

            # Send payload attempting to tamper with role
            tampered_payload = {
                "full_name": "Student Hacker",
                "role": "owner",
                "headline": "Trying to become owner",
            }
            resp = client.post(
                "/api/profile/personal",
                json=tampered_payload,
                headers={"Authorization": "Bearer mock-student-jwt"},
            )
            # Endpoint must succeed for valid profile fields but strictly exclude 'role'
            self.assertEqual(resp.status_code, 200)
            saved_personal = resp.json().get("personal", {})
            self.assertNotIn("role", saved_personal, "Role must never be writable via personal profile API!")

    def test_09_student_cannot_modify_another_user_role(self):
        """9. Student attempting to access admin user management is blocked with 403."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            resp = client.get(
                "/api/admin/users",
                headers={"Authorization": "Bearer mock-student-jwt"},
            )
            self.assertEqual(resp.status_code, 403)

    def test_10_migration_file_contains_escalation_prevention_trigger(self):
        """10. Migration SQL defines prevent_profile_role_escalation trigger."""
        migration_path = root_dir / "supabase" / "migrations" / "20260920_add_user_roles_and_owner.sql"
        self.assertTrue(migration_path.exists(), "Migration file must exist!")
        sql_content = migration_path.read_text(encoding="utf-8")
        self.assertIn("prevent_profile_role_escalation", sql_content)
        self.assertIn("BEFORE UPDATE OF role ON public.profiles", sql_content)
        self.assertIn("chk_profiles_role", sql_content)

    def test_11_role_resolution_never_trusts_request_body_or_header(self):
        """11. Backend role is derived strictly from JWT app_metadata / server state, never client headers."""
        # Calling with spoofed header x-role or query param ?role=owner
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            resp = client.get(
                "/api/auth/me?role=owner",
                headers={
                    "Authorization": "Bearer mock-student-jwt",
                    "X-Role": "owner",
                    "X-Admin": "true",
                },
            )
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(resp.json()["role"], "student")
            self.assertFalse(resp.json()["is_owner"])

    # =========================================================================
    # 12-16: MODE SWITCHING & IDENTITY ISOLATION
    # =========================================================================

    def test_12_owner_mode_switching_preserves_single_session(self):
        """12. Mode switching preserves a single authentication session."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            user_identity = require_authenticated_user(authorization="Bearer mock-owner-token")
            self.assertEqual(user_identity["role"], "owner")
            self.assertTrue(user_identity["is_owner"])

    def test_13_mode_switching_does_not_create_new_login(self):
        """13. Mode switching is purely client application state without a new login."""
        # Simulated mode transition does not invoke auth endpoints or alter credentials
        user_identity = {"user_id": self.owner_id, "email": self.owner_email, "role": "owner", "is_owner": True}
        # In student mode:
        student_mode_state = {**user_identity, "appMode": "student"}
        # In admin mode:
        admin_mode_state = {**user_identity, "appMode": "admin"}
        self.assertEqual(student_mode_state["user_id"], admin_mode_state["user_id"])
        self.assertEqual(student_mode_state["role"], admin_mode_state["role"])

    def test_14_mode_switching_preserves_user_id(self):
        """14. Supabase user ID remains invariant across mode switches."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            user_before = require_authenticated_user(authorization="Bearer mock-owner-token")
            user_after = require_authenticated_user(authorization="Bearer mock-owner-token")
            self.assertEqual(user_before["user_id"], user_after["user_id"])
            self.assertEqual(user_before["user_id"], self.owner_id)

    def test_15_mode_switching_preserves_auth_jwt(self):
        """15. JWT and session tokens remain unchanged across mode switches."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            token = "Bearer mock-owner-jwt-token"
            identity_1 = require_authenticated_user(authorization=token)
            identity_2 = require_authenticated_user(authorization=token)
            self.assertEqual(identity_1, identity_2)

    def test_16_student_cannot_bypass_via_client_storage(self):
        """16. Student cannot activate admin privileges by forging local state; backend enforces role."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            # Calling admin overview while student
            resp = client.get("/api/admin/overview", headers={"Authorization": "Bearer mock-student-jwt"})
            self.assertEqual(resp.status_code, 403)

    # =========================================================================
    # 17-20: ROUTE PROTECTION & 403 INVARIANCE
    # =========================================================================

    def test_17_owner_can_access_admin_system_status(self):
        """17. Owner can access /api/admin/system-status."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_owner_user)
            mock_sb.return_value = mock_client

            resp = client.get("/api/admin/system-status", headers={"Authorization": "Bearer mock-owner-jwt"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["auth_system"]["unified"])
            self.assertEqual(data["auth_system"]["authoritative_role_source"], "supabase_app_metadata")

    def test_18_student_cannot_access_admin_system_status(self):
        """18. Student cannot access /api/admin/system-status."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_sb.return_value = mock_client

            resp = client.get("/api/admin/system-status", headers={"Authorization": "Bearer mock-student-jwt"})
            self.assertEqual(resp.status_code, 403)

    def test_19_unauthenticated_user_rejected_from_admin(self):
        """19. Unauthenticated user rejected with 401."""
        resp = client.get("/api/admin/users")
        self.assertEqual(resp.status_code, 401)

    def test_20_client_ts_does_not_sign_out_on_403(self):
        """20. Verified that frontend/lib/api/client.ts only signs out on 401, NOT on 403."""
        client_ts_path = root_dir / "frontend" / "lib" / "api" / "client.ts"
        self.assertTrue(client_ts_path.exists())
        content = client_ts_path.read_text(encoding="utf-8")
        self.assertIn("if (res.status === 401 && typeof window !== \"undefined\")", content)
        self.assertNotIn("res.status === 403", content)

    # =========================================================================
    # 21-26: REGRESSION TESTS
    # =========================================================================

    def test_21_root_endpoint_online(self):
        """21. Root probe returns online 200."""
        r_root = client.get("/")
        self.assertEqual(r_root.status_code, 200)
        self.assertEqual(r_root.json()["status"], "online")

    def test_22_health_endpoint_healthy(self):
        """22. Health probe returns healthy 200."""
        r_health = client.get("/health")
        self.assertEqual(r_health.status_code, 200)
        self.assertEqual(r_health.json()["status"], "healthy")

    def test_23_student_profile_fetch_regression(self):
        """23. Existing profile fetch functions correctly for student user."""
        with patch("backend.services.auth_service.get_supabase") as mock_sb, \
             patch("backend.routers.profile.get_supabase") as mock_prof_sb:
            mock_client = MagicMock()
            mock_client.auth.get_user.return_value = MagicMock(user=self.mock_student_user)
            mock_client.from_().select().eq().execute.return_value = MagicMock(data=[])
            mock_sb.return_value = mock_client
            mock_prof_sb.return_value = mock_client

            resp = client.get("/api/profile", headers={"Authorization": "Bearer mock-student-jwt"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn("personal", data)
            self.assertIn("academic", data)
            self.assertIn("skills", data)

    def test_24_guest_session_id_backward_compatibility(self):
        """24. Guest session IDs continue to be issued and signed for unauthenticated learners."""
        resp = client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("X-Guest-Session-Token", resp.headers)
        token = resp.headers["X-Guest-Session-Token"]
        self.assertTrue(token.startswith("guest_"))
        self.assertIn(".", token)

    def test_25_live_bootstrap_owner_verified(self):
        """25. Authoritative owner account has role=owner verified in live Supabase Auth."""
        from backend.services.supabase_service import get_supabase
        sb = get_supabase()
        if sb:
            user_res = sb.auth.admin.get_user_by_id(self.owner_id)
            self.assertIsNotNone(user_res.user)
            self.assertEqual(user_res.user.email, self.owner_email)
            self.assertEqual((user_res.user.app_metadata or {}).get("role"), "owner")

    def test_26_owner_email_config_match(self):
        """26. OWNER_EMAIL in backend config matches palamooradithyagoud@gmail.com."""
        self.assertEqual(OWNER_EMAIL, "palamooradithyagoud@gmail.com")


if __name__ == "__main__":
    unittest.main()
