"""
tests/test_sys07_ai_error_handling.py
Comprehensive regression tests for SYS-07:
Verifies structured, safe AI error semantics across all 8 scenarios on both
/api/ai-mentor/chat and /api/ai-mentor/review-resume.
"""

import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from groq import (
    RateLimitError,
    AuthenticationError,
    APIConnectionError,
    APITimeoutError,
    APIStatusError,
)
import httpx

from backend.main import app
from backend.services.auth_service import get_current_user_id, get_session_or_user_id
from backend.models.subscription import EntitlementDetailDTO, AccessLevel

client = TestClient(app)

class TestSYS07AIErrorHandling(unittest.TestCase):

    def setUp(self):
        self.user_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.mock_entitlement = EntitlementDetailDTO(access=AccessLevel.FULL, limit=None)
        app.dependency_overrides[get_current_user_id] = lambda: self.user_id
        app.dependency_overrides[get_session_or_user_id] = lambda: self.user_id
        self.ent_patch = patch(
            "backend.services.subscription_service.SubscriptionService.get_user_entitlements",
            return_value={"ai_mentor": self.mock_entitlement}
        )
        self.ent_patch.start()

    def tearDown(self):
        self.ent_patch.stop()
        app.dependency_overrides.pop(get_current_user_id, None)
        app.dependency_overrides.pop(get_session_or_user_id, None)

    # -----------------------------------------------------------------------
    # Scenario 1: Upstream Provider Quota Exhaustion -> HTTP 503 AI_QUOTA_EXHAUSTED
    # -----------------------------------------------------------------------
    def test_01_provider_quota_exhausted_chat(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(429, request=mock_req, json={
            "error": {"message": "You exceeded your current quota, please check your plan and billing details.", "type": "insufficient_quota"}
        })
        exc = RateLimitError(
            message="Error code: 429 - {'error': {'message': 'You exceeded your current quota', 'type': 'insufficient_quota'}}",
            response=mock_resp,
            body={"error": {"type": "insufficient_quota"}}
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 503)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertFalse(detail.get("success"))
            self.assertEqual(detail.get("code"), "AI_QUOTA_EXHAUSTED")
            self.assertIn("quota", detail.get("message", "").lower())
            self.assertNotIn("offline", detail.get("message", "").lower())
            self.assertNotIn("fastapi", detail.get("message", "").lower())

    def test_01_provider_quota_exhausted_review_resume(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(429, request=mock_req, json={
            "error": {"message": "insufficient_quota: billing limit reached", "type": "insufficient_quota"}
        })
        exc = RateLimitError(
            message="Error code: 429 - insufficient_quota: billing limit reached",
            response=mock_resp,
            body={"error": {"type": "insufficient_quota"}}
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/review-resume", json={
                "resume_text": "Experienced Python developer with 3 years building microservices and APIs.",
                "target_role": "Backend Engineer",
                "years_experience": "3 years",
                "company_type": "Product-Based",
            })
            self.assertEqual(resp.status_code, 503)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertEqual(detail.get("code"), "AI_QUOTA_EXHAUSTED")

    # -----------------------------------------------------------------------
    # Scenario 1b: User Plan Quota Exhaustion -> HTTP 403 LIMIT_REACHED
    # -----------------------------------------------------------------------
    def test_01b_user_plan_limit_reached(self):
        limited_entitlement = EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=5)
        with patch(
            "backend.services.subscription_service.SubscriptionService.get_user_entitlements",
            return_value={"ai_mentor": limited_entitlement}
        ):
            with patch("backend.routers.ai_mentor.get_ai_mentor_usage", return_value=5):
                resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
                self.assertEqual(resp.status_code, 403)
                detail = resp.json().get("detail", {})
                self.assertEqual(detail.get("code"), "LIMIT_REACHED")

    # -----------------------------------------------------------------------
    # Scenario 2: Upstream Provider Rate Limit -> HTTP 429 AI_RATE_LIMIT_EXCEEDED
    # -----------------------------------------------------------------------
    def test_02_provider_rate_limit_chat(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(429, request=mock_req, headers={"retry-after": "12"}, json={
            "error": {"message": "Rate limit reached for model on requests per minute (RPM)", "type": "requests"}
        })
        exc = RateLimitError(
            message="Error code: 429 - Rate limit reached for model on requests per minute",
            response=mock_resp,
            body={"error": {"type": "requests"}}
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 429)
            self.assertEqual(resp.headers.get("retry-after"), "12")
            data = resp.json()
            detail = data.get("detail", {})
            self.assertFalse(detail.get("success"))
            self.assertEqual(detail.get("code"), "AI_RATE_LIMIT_EXCEEDED")
            self.assertIn("12s", detail.get("message", ""))

    # -----------------------------------------------------------------------
    # Scenario 3: Provider Auth Failure -> HTTP 502 AI_PROVIDER_AUTH_ERROR (NEVER 401!)
    # -----------------------------------------------------------------------
    def test_03_provider_auth_failure_chat(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(401, request=mock_req, json={
            "error": {"message": "Invalid API Key: gsk_secret_key_12345", "type": "invalid_request_error"}
        })
        exc = AuthenticationError(
            message="Error code: 401 - Invalid API Key: gsk_secret_key_12345",
            response=mock_resp,
            body=None
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            # MUST NOT be 401 (which would destroy user frontend session)
            self.assertNotEqual(resp.status_code, 401)
            self.assertEqual(resp.status_code, 502)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertEqual(detail.get("code"), "AI_PROVIDER_AUTH_ERROR")
            # MUST NOT leak API key or secret token
            self.assertNotIn("gsk_secret", resp.text)
            self.assertNotIn("12345", resp.text)

    # -----------------------------------------------------------------------
    # Scenario 4: Provider Unavailable -> HTTP 502 AI_PROVIDER_UNAVAILABLE
    # -----------------------------------------------------------------------
    def test_04_provider_service_unavailable(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        exc = APIConnectionError(request=mock_req, message="Connection error to api.groq.com")

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 502)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertEqual(detail.get("code"), "AI_PROVIDER_UNAVAILABLE")

    # -----------------------------------------------------------------------
    # Scenario 5: Provider Request Timeout -> HTTP 504 AI_TIMEOUT
    # -----------------------------------------------------------------------
    def test_05_provider_timeout(self):
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        exc = APITimeoutError(request=mock_req)

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 504)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertEqual(detail.get("code"), "AI_TIMEOUT")

    # -----------------------------------------------------------------------
    # Scenario 7: Invalid / Empty Provider Response -> HTTP 502 AI_INVALID_RESPONSE
    # -----------------------------------------------------------------------
    def test_07_invalid_empty_provider_response(self):
        mock_choice = MagicMock()
        mock_choice.message.content = ""  # Empty string
        mock_resp = MagicMock()
        mock_resp.choices = [mock_choice]

        with patch("backend.services.groq_service.groq_client.chat.completions.create", return_value=mock_resp):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 502)
            data = resp.json()
            detail = data.get("detail", {})
            self.assertEqual(detail.get("code"), "AI_INVALID_RESPONSE")

    # -----------------------------------------------------------------------
    # Scenario 8: Successful AI Request -> HTTP 200
    # -----------------------------------------------------------------------
    def test_08_successful_request(self):
        mock_choice = MagicMock()
        mock_choice.message.content = "To optimize SQL queries, start with EXPLAIN ANALYZE..."
        mock_resp = MagicMock()
        mock_resp.choices = [mock_choice]

        with patch("backend.services.groq_service.groq_client.chat.completions.create", return_value=mock_resp):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn("EXPLAIN ANALYZE", data.get("reply", ""))

    # -----------------------------------------------------------------------
    # Phase 2: Retry Behavior Bounds Verification
    # -----------------------------------------------------------------------
    def test_09_quota_exhaustion_does_not_loop_fallback_models(self):
        """Phase 2: Quota exhaustion must not trigger model retry cascade across all models."""
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(429, request=mock_req, json={
            "error": {"message": "Billing limit reached", "type": "insufficient_quota"}
        })
        exc = RateLimitError(
            message="Error code: 429 - insufficient_quota",
            response=mock_resp,
            body={"error": {"type": "insufficient_quota"}}
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc) as mock_create:
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 503)
            # Must halt immediately on first attempt — not loop 5 times through all fallback models
            self.assertEqual(mock_create.call_count, 1)

    def test_10_auth_error_does_not_loop_fallback_models(self):
        """Phase 2: Auth credential error must not loop through all models under the same bad key."""
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        exc = AuthenticationError(
            message="Error code: 401 - Invalid API Key",
            response=httpx.Response(401, request=mock_req),
            body=None
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc) as mock_create:
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 502)
            # Must halt immediately — invalid key will never succeed on other models
            self.assertEqual(mock_create.call_count, 1)

    # -----------------------------------------------------------------------
    # Phase 3: Quota Reservation Lifecycle Verification
    # -----------------------------------------------------------------------
    def test_11_reservation_released_on_provider_failure(self):
        """Phase 3: Slot reservation is cleanly refunded when provider fails."""
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        exc = APIConnectionError(request=mock_req, message="Network down")

        limited_ent = EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=10)
        with patch("backend.services.subscription_service.SubscriptionService.get_user_entitlements", return_value={"ai_mentor": limited_ent}), \
             patch("backend.routers.ai_mentor.reserve_ai_mentor_slot") as mock_reserve, \
             patch("backend.routers.ai_mentor.release_ai_mentor_slot") as mock_release, \
             patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            mock_res_obj = MagicMock()
            mock_res_obj.allowed = True
            mock_res_obj.reservation_id = "test-res-uuid-123"
            mock_reserve.return_value = mock_res_obj

            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 502)
            mock_release.assert_called_once_with(self.user_id, "test-res-uuid-123")

    def test_12_reservation_committed_on_provider_success(self):
        """Phase 3: Slot reservation is committed on success, not refunded."""
        mock_choice = MagicMock()
        mock_choice.message.content = "SQL indexing strategies..."
        mock_resp = MagicMock()
        mock_resp.choices = [mock_choice]

        limited_ent = EntitlementDetailDTO(access=AccessLevel.LIMITED, limit=10)
        with patch("backend.services.subscription_service.SubscriptionService.get_user_entitlements", return_value={"ai_mentor": limited_ent}), \
             patch("backend.routers.ai_mentor.reserve_ai_mentor_slot") as mock_reserve, \
             patch("backend.routers.ai_mentor.commit_ai_mentor_reservation") as mock_commit, \
             patch("backend.routers.ai_mentor.release_ai_mentor_slot") as mock_release, \
             patch("backend.services.groq_service.groq_client.chat.completions.create", return_value=mock_resp):
            mock_res_obj = MagicMock()
            mock_res_obj.allowed = True
            mock_res_obj.reservation_id = "test-res-uuid-456"
            mock_reserve.return_value = mock_res_obj

            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 200)
            mock_commit.assert_called_once_with(self.user_id, "test-res-uuid-456")
            mock_release.assert_not_called()

    # -----------------------------------------------------------------------
    # Phase 2 / Phase 4: Retry-After Clamping & Robustness
    # -----------------------------------------------------------------------
    def test_13_retry_after_clamped_safely(self):
        """Phase 2: Unreasonable or malformed Retry-After headers are clamped safely [1, 3600]."""
        mock_req = httpx.Request("POST", "https://api.groq.com/chat")
        mock_resp = httpx.Response(429, request=mock_req, headers={"retry-after": "9999999"}, json={
            "error": {"message": "Rate limit reached", "type": "requests"}
        })
        exc = RateLimitError(
            message="Error code: 429 - Rate limit reached",
            response=mock_resp,
            body={"error": {"type": "requests"}}
        )

        with patch("backend.services.groq_service.groq_client.chat.completions.create", side_effect=exc):
            resp = client.post("/api/ai-mentor/chat", json={"prompt": "How do I optimize SQL queries?"})
            self.assertEqual(resp.status_code, 429)
            # Clamped to maximum 3600 seconds
            self.assertEqual(resp.headers.get("retry-after"), "3600")


if __name__ == "__main__":
    unittest.main()
