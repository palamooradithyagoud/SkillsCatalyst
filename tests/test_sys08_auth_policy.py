"""
tests/test_sys08_auth_policy.py
SYS-08: Backend Authentication Policy & Security Boundary Test Suite.

Verifies:
1. Missing credentials on protected endpoints reject with 401 Unauthorized.
2. Valid credentials on protected endpoints succeed with 200 OK.
3. Malformed bearer tokens reject with 401 Unauthorized.
4. Expired JWT tokens reject with 401 Unauthorized.
5. Invalid signature JWT tokens reject with 401 Unauthorized.
6. Valid guest access on dual-mode endpoints (without Authorization header) succeeds.
7. Invalid / expired / malformed credentials on dual-mode endpoints reject with 401 Unauthorized (NEVER silently downgraded to guest).
8. Attempt ownership enforcement (anti-IDOR): client cannot record attempt for another user (403 Forbidden).
9. Client user_id omitted in request body binds strictly to authenticated user identity.
10. Test isolation: dependency overrides and authentication state are cleaned up properly.
"""

import time
import uuid
import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
import jwt

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import (
    get_session_or_user_id,
    require_authenticated_user,
    get_current_user_id,
)
from backend.models.subscription import AccessLevel, EntitlementDetailDTO, FeatureKey
from backend.services.subscription_service import SubscriptionService

client = TestClient(app)

MOCK_SECRET = "super-secret-jwt-key-for-testing-purposes-32-chars-min"
STUDENT_USER_ID = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
OTHER_USER_ID = "99999999-9999-4999-a999-999999999999"


def _create_test_jwt(sub: str, exp_delta: int = 3600, secret: str = MOCK_SECRET, role: str = "student") -> str:
    now = int(time.time())
    payload = {
        "sub": sub,
        "email": f"{sub[:8]}@skillscatalyst.com",
        "aud": "authenticated",
        "role": role,
        "app_metadata": {"provider": "google", "role": role},
        "user_metadata": {"full_name": "Test User"},
        "iat": now,
        "exp": now + exp_delta,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


class TestSYS08AuthPolicy(unittest.TestCase):

    def setUp(self):
        self.valid_token = _create_test_jwt(STUDENT_USER_ID, exp_delta=3600)
        self.expired_token = _create_test_jwt(STUDENT_USER_ID, exp_delta=-3600)
        self.bad_sig_token = _create_test_jwt(STUDENT_USER_ID, exp_delta=3600, secret="wrong-secret-key-that-causes-bad-signature!!")

    def tearDown(self):
        app.dependency_overrides.clear()

    # =========================================================================
    # 1. PROTECTED ENDPOINTS: STRICT 401 REJECTION
    # =========================================================================

    def test_01_practice_attempt_unauthenticated_rejected_401(self):
        """Unauthenticated call to /api/practice/aptitude/attempt must return 401."""
        payload = {
            "topic_id": 1,
            "question_id": 1,
            "selected_option_index": 2,
            "is_correct": True,
            "time_taken_seconds": 10,
        }
        resp = client.post("/api/practice/aptitude/attempt", json=payload)
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Invalid or missing authentication token", resp.text)

    def test_02_practice_attempt_malformed_token_rejected_401(self):
        """Malformed token on /api/practice/aptitude/attempt must return 401."""
        payload = {
            "topic_id": 1,
            "question_id": 1,
            "selected_option_index": 2,
            "time_taken_seconds": 10,
        }
        for bad_header in ["Bearer not-a-jwt", "Bearer null", "Bearer undefined", "Bearer ", "Basic invalid"]:
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": bad_header},
            )
            self.assertEqual(resp.status_code, 401)

    def test_03_practice_attempt_expired_token_rejected_401(self):
        """Expired JWT on /api/practice/aptitude/attempt must return 401."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 2,
                "time_taken_seconds": 10,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": f"Bearer {self.expired_token}"},
            )
            self.assertEqual(resp.status_code, 401)
            self.assertIn("expired", resp.text.lower())

    def test_04_practice_attempt_invalid_signature_rejected_401(self):
        """Tampered / invalid signature JWT on /api/practice/aptitude/attempt must return 401."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 2,
                "time_taken_seconds": 10,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": f"Bearer {self.bad_sig_token}"},
            )
            self.assertEqual(resp.status_code, 401)
            self.assertIn("signature", resp.text.lower())

    # =========================================================================
    # 2. DUAL-MODE / GUEST-SUPPORTING ENDPOINTS: NEVER SILENTLY DEGRADE TO GUEST
    # =========================================================================

    def test_05_get_session_or_user_id_guest_mode_without_auth_header(self):
        """No Authorization header resolves cleanly to a guest session ID."""
        guest_id = get_session_or_user_id(authorization=None, x_session_id=None)
        self.assertTrue(guest_id.startswith("guest_"))

    def test_06_get_session_or_user_id_valid_bearer_token(self):
        """Valid Bearer JWT resolves to authenticated user UUID."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            resolved_id = get_session_or_user_id(authorization=f"Bearer {self.valid_token}")
            self.assertEqual(resolved_id, STUDENT_USER_ID)

    def test_07_get_session_or_user_id_expired_token_raises_401_no_silent_guest(self):
        """Expired Bearer JWT must raise 401 Unauthorized; NEVER silently become a guest."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            from fastapi import HTTPException
            with self.assertRaises(HTTPException) as ctx:
                get_session_or_user_id(authorization=f"Bearer {self.expired_token}")
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("expired", str(ctx.exception.detail).lower())

    def test_08_get_session_or_user_id_invalid_sig_raises_401_no_silent_guest(self):
        """Invalid signature Bearer JWT must raise 401 Unauthorized; NEVER silently become a guest."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            from fastapi import HTTPException
            with self.assertRaises(HTTPException) as ctx:
                get_session_or_user_id(authorization=f"Bearer {self.bad_sig_token}")
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("signature", str(ctx.exception.detail).lower())

    def test_09_get_session_or_user_id_malformed_token_raises_401_no_silent_guest(self):
        """Malformed Bearer JWT must raise 401 Unauthorized; NEVER silently become a guest."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            from fastapi import HTTPException
            for bad_header in ["Bearer invalid_jwt_string", "Bearer undefined", "Bearer null", "Basic credentials"]:
                with self.assertRaises(HTTPException) as ctx:
                    get_session_or_user_id(authorization=bad_header)
                self.assertEqual(ctx.exception.status_code, 401)

    # =========================================================================
    # 3. ENDPOINT INTEGRATION: DUAL-MODE ROUTE BEHAVIOR
    # =========================================================================

    def test_10_ai_mentor_chat_expired_token_returns_401_not_guest(self):
        """Calling /api/ai-mentor/chat with expired token must return 401, not consume guest quota."""
        with patch("backend.services.auth_service.SUPABASE_JWT_SECRET", MOCK_SECRET):
            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Hello mentor"},
                headers={"Authorization": f"Bearer {self.expired_token}"},
            )
            self.assertEqual(resp.status_code, 401)
            self.assertIn("expired", resp.text.lower())

    def test_11_ai_mentor_chat_valid_guest_succeeds_without_auth_header(self):
        """Calling /api/ai-mentor/chat without Authorization header allows legitimate guest access."""
        with patch("backend.routers.ai_mentor.chat_with_groq", return_value="Welcome to guest mentorship"):
            resp = client.post(
                "/api/ai-mentor/chat",
                json={"prompt": "Hello as guest"},
            )
            self.assertEqual(resp.status_code, 200)
            self.assertIn("reply", resp.json())
            self.assertIn("X-Guest-Session-Token", resp.headers)

    # =========================================================================
    # 4. AUTHORIZATION & OWNERSHIP ENFORCEMENT (ANTI-IDOR)
    # =========================================================================

    @patch("backend.services.subscription_service.SubscriptionService.get_user_entitlements")
    def test_12_practice_attempt_idor_rejected_403(self, mock_ent):
        """Authenticated user cannot submit an attempt on behalf of another user ID."""
        mock_ent.return_value = {
            FeatureKey.PLACEMENT_PREP.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None)
        }
        mock_user = MagicMock()
        mock_user.id = STUDENT_USER_ID
        mock_user.email = "student@skillscatalyst.com"
        mock_user.app_metadata = {"provider": "google", "role": "student"}
        mock_user.user_metadata = {"full_name": "Test Student"}

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            # Client passes OTHER_USER_ID in body while authenticated as STUDENT_USER_ID
            payload = {
                "user_id": OTHER_USER_ID,
                "topic_id": 1,
                "question_id": 10,
                "selected_option_index": 2,
                "time_taken_seconds": 15,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer mock-student-jwt"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Cannot record attempt for another user", resp.text)

    @patch("backend.services.subscription_service.SubscriptionService.get_user_entitlements")
    def test_13_practice_attempt_omitted_user_id_binds_to_authenticated_identity(self, mock_ent):
        """When client omits user_id in body, server binds attempt to authenticated user ID."""
        mock_ent.return_value = {
            FeatureKey.PLACEMENT_PREP.value: EntitlementDetailDTO(access=AccessLevel.FULL, limit=None)
        }
        mock_user = MagicMock()
        mock_user.id = STUDENT_USER_ID
        mock_user.email = "student@skillscatalyst.com"
        mock_user.app_metadata = {"provider": "google", "role": "student"}
        mock_user.user_metadata = {"full_name": "Test Student"}

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase") as mock_practice_sb:
            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=mock_user)
            mock_auth_sb.return_value = mock_auth_client

            mock_sb = MagicMock()
            mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[{"id": 10, "topic_id": 1, "correct_index": 2, "options": ["A", "B", "C", "D"]}]
            )
            mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])
            mock_practice_sb.return_value = mock_sb

            payload = {
                "topic_id": 1,
                "question_id": 10,
                "selected_option_index": 2,
                "is_correct": True,
                "time_taken_seconds": 15,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer mock-student-jwt"},
            )
            self.assertEqual(resp.status_code, 200)
            res_json = resp.json()
            self.assertEqual(res_json["status"], "success")
            self.assertEqual(res_json["attempt"]["user_id"], STUDENT_USER_ID)


if __name__ == "__main__":
    unittest.main()
