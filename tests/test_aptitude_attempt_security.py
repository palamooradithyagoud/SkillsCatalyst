"""
tests/test_aptitude_attempt_security.py
Comprehensive Security & Verification Test Suite for BUG-B-1:
- Correct answer submitted (server-side evaluation)
- Incorrect answer submitted (server-side evaluation)
- Forged is_correct value (server ignores client claim)
- Invalid question ID (404 rejection)
- Unauthenticated request (401 rejection)
- Attempt persistence in user_aptitude_attempts
- Attempt ownership enforcement (anti-IDOR)
- Rate limiting enforcement (429 rejection)
- Solution leakage prevention (answers/explanations not exposed)
"""

import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.subscription_service import SubscriptionService
from backend.services.rate_limiter import rate_limiter

client = TestClient(app)


class MockAuthUser:
    def __init__(self, uid: str, email: str = "student@skillscatalyst.com", role: str = "student"):
        self.id = uid
        self.email = email
        self.app_metadata = {"provider": "google", "role": role}
        self.user_metadata = {"full_name": "Test Student"}


class TestAptitudeAttemptSecurity(unittest.TestCase):

    def setUp(self):
        self.user_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.other_user_id = "99999999-9999-4999-a999-999999999999"
        self.mock_user = MockAuthUser(self.user_id)
        self.mock_other_user = MockAuthUser(self.other_user_id)

        # Mock premium subscription so entitlement check passes
        self.mock_sub = {
            "id": "sub-prem",
            "user_id": self.user_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": None,
            "subscription_plans": {"code": "premium_monthly", "name": "Premium Monthly"},
        }

        # Reset rate limiter memory before each test
        if hasattr(rate_limiter, "_fallback_limiter"):
            rate_limiter._fallback_limiter._requests.clear()
        if hasattr(rate_limiter, "_requests"):
            rate_limiter._requests.clear()

    # -------------------------------------------------------------------------
    # 1. Unauthenticated Request Rejection (401 Unauthorized)
    # -------------------------------------------------------------------------
    def test_01_unauthenticated_request_rejected(self):
        """Requests without Authorization or with invalid tokens must return 401."""
        payload = {
            "topic_id": 1,
            "question_id": 1,
            "selected_option_index": 3,
            "time_taken_seconds": 10,
        }
        # No header
        resp = client.post("/api/practice/aptitude/attempt", json=payload)
        self.assertEqual(resp.status_code, 401)

        # Invalid token
        resp_invalid = client.post(
            "/api/practice/aptitude/attempt",
            json=payload,
            headers={"Authorization": "Bearer invalid_garbage_token"},
        )
        self.assertEqual(resp_invalid.status_code, 401)

    # -------------------------------------------------------------------------
    # 2. Correct Answer Submitted -> Evaluated True by Server
    # -------------------------------------------------------------------------
    def test_02_correct_answer_submitted(self):
        """Server authoritatively compares option against correct_index and returns is_correct=True."""
        mock_question = {
            "id": 1,
            "topic_id": 1,
            "correct_index": 3,
            "options": ["a) 180", "b) 210", "c) 230", "d) 240"],
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[mock_question]
        )
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 3,  # Matches correct_index 3
                "time_taken_seconds": 15,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "success")
            self.assertTrue(data["attempt"]["is_correct"])
            self.assertEqual(data["attempt"]["question_id"], 1)
            self.assertEqual(data["attempt"]["user_id"], self.user_id)

    # -------------------------------------------------------------------------
    # 3. Incorrect Answer Submitted -> Evaluated False by Server
    # -------------------------------------------------------------------------
    def test_03_incorrect_answer_submitted(self):
        """Server authoritatively returns is_correct=False for wrong option."""
        mock_question = {
            "id": 1,
            "topic_id": 1,
            "correct_index": 3,
            "options": ["a) 180", "b) 210", "c) 230", "d) 240"],
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[mock_question]
        )
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 1,  # Wrong answer (correct is 3)
                "time_taken_seconds": 12,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "success")
            self.assertFalse(data["attempt"]["is_correct"])

    # -------------------------------------------------------------------------
    # 4. Forged is_correct Value in Client Body is Ignored
    # -------------------------------------------------------------------------
    def test_04_forged_is_correct_ignored(self):
        """Client supplying is_correct: True on a wrong answer must be evaluated as False."""
        mock_question = {
            "id": 1,
            "topic_id": 1,
            "correct_index": 3,
            "options": ["a) 180", "b) 210", "c) 230", "d) 240"],
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[mock_question]
        )
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            # Forgery attempt: option 0 is wrong, but client claims is_correct: True
            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 0,
                "is_correct": True,  # Attacker assertion
                "time_taken_seconds": 8,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            # Server must ignore the client's is_correct: True and output False
            self.assertFalse(data["attempt"]["is_correct"])

    # -------------------------------------------------------------------------
    # 5. Invalid Question ID Rejection (404 Not Found)
    # -------------------------------------------------------------------------
    def test_05_invalid_question_id_rejected(self):
        """Non-existent question ID must return 404 Not Found."""
        mock_sb = MagicMock()
        # Return empty data (question not found)
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[]
        )

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 999999,
                "selected_option_index": 1,
                "time_taken_seconds": 5,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 404)

    # -------------------------------------------------------------------------
    # 6. Attempt Persistence in user_aptitude_attempts
    # -------------------------------------------------------------------------
    def test_06_attempt_persisted_in_database(self):
        """Verified attempt record is upserted to user_aptitude_attempts."""
        mock_question = {
            "id": 2,
            "topic_id": 1,
            "correct_index": 0,
            "options": ["a) 108", "b) 54", "c) 210", "d) None"],
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[mock_question]
        )
        mock_upsert = MagicMock()
        mock_sb.table.return_value.upsert.return_value = mock_upsert

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 2,
                "selected_option_index": 0,
                "time_taken_seconds": 22,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 200)

            # Verify upsert call on user_aptitude_attempts table
            mock_sb.table.assert_any_call("user_aptitude_attempts")
            upsert_args = mock_sb.table("user_aptitude_attempts").upsert.call_args
            persisted_record = upsert_args[0][0]

            self.assertEqual(persisted_record["user_id"], self.user_id)
            self.assertEqual(persisted_record["question_id"], 2)
            self.assertEqual(persisted_record["selected_option_index"], 0)
            self.assertTrue(persisted_record["is_correct"])
            self.assertEqual(persisted_record["time_taken_seconds"], 22)

    # -------------------------------------------------------------------------
    # 7. Attempt Ownership Enforcement (Anti-IDOR)
    # -------------------------------------------------------------------------
    def test_07_attempt_ownership_enforcement(self):
        """Client attempting to submit an attempt for another user is rejected with 403."""
        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            # Client authenticated as self.user_id attempts to submit for self.other_user_id
            payload = {
                "user_id": self.other_user_id,
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 3,
                "time_taken_seconds": 10,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 403)
            self.assertIn("Cannot record attempt for another user", resp.json()["detail"])

    # -------------------------------------------------------------------------
    # 8. Rate Limiting Enforcement (429 Too Many Requests)
    # -------------------------------------------------------------------------
    def test_08_rate_limiting_enforcement(self):
        """Burst requests exceeding the route rate limit receive 429 Too Many Requests."""
        with patch.object(rate_limiter, "check_rate_limit", return_value=(False, 45)):
            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 3,
                "time_taken_seconds": 5,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 429)
            self.assertEqual(resp.headers.get("Retry-After"), "45")
            self.assertIn("Too many requests", resp.json()["detail"]["message"])

    # -------------------------------------------------------------------------
    # 9. Solution and Correct Answer Details Are Not Leaked
    # -------------------------------------------------------------------------
    def test_09_no_solution_leakage_in_response(self):
        """Response must not leak solution text, answer text, or correct_index."""
        mock_question = {
            "id": 1,
            "topic_id": 1,
            "correct_index": 3,
            "answer_text": "240 meters",
            "solution_text": "Detailed step-by-step solution derivation...",
            "options": ["a) 180", "b) 210", "c) 230", "d) 240"],
        }
        mock_sb = MagicMock()
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[mock_question]
        )
        mock_sb.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[])

        with patch("backend.services.auth_service.get_supabase") as mock_auth_sb, \
             patch("backend.routers.practice.get_supabase", return_value=mock_sb), \
             patch.object(SubscriptionService, "get_user_subscription_record", return_value=self.mock_sub):

            mock_auth_client = MagicMock()
            mock_auth_client.auth.get_user.return_value = MagicMock(user=self.mock_user)
            mock_auth_sb.return_value = mock_auth_client

            payload = {
                "topic_id": 1,
                "question_id": 1,
                "selected_option_index": 3,
                "time_taken_seconds": 15,
            }
            resp = client.post(
                "/api/practice/aptitude/attempt",
                json=payload,
                headers={"Authorization": "Bearer test-valid-token"},
            )
            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            # Ensure sensitive fields are absent
            self.assertNotIn("correct_index", data["attempt"])
            self.assertNotIn("answer_text", data["attempt"])
            self.assertNotIn("solution_text", data["attempt"])
            self.assertNotIn("solution", data)


if __name__ == "__main__":
    unittest.main()
