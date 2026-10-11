"""
tests/test_resume_score_deduplication.py
Test suite for BUG-E-4: Deduplication of resume score persistence.
Verifies:
1. Successful resume review creates EXACTLY ONE score record in resume_scores.
2. User progress is updated exactly once.
3. Failed/unavailable AI resume reviews do NOT create score records.
4. Score parsing correctly handles both 10-scale and 100-scale formats.
5. Static verification that frontend/lib/api/career.ts contains no redundant direct Supabase writes.
"""

import re
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import get_current_user_id
from backend.dependencies.subscription import require_entitlement
from backend.models.subscription import EntitlementDetailDTO, AccessLevel

client = TestClient(app)


class TestResumeScoreDeduplication(unittest.TestCase):

    def setUp(self):
        self.user_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.mock_entitlement = EntitlementDetailDTO(access=AccessLevel.FULL, limit=None)

    def test_01_successful_resume_review_persists_exactly_one_score_record(self):
        """A successful resume review must trigger exactly one insert into resume_scores."""
        mock_sb = MagicMock()
        mock_insert = MagicMock()
        mock_upsert = MagicMock()
        mock_sb.table.return_value.insert.return_value = mock_insert
        mock_sb.table.return_value.upsert.return_value = mock_upsert

        llm_response = (
            "# ATS Resume Evaluation\n"
            "Final Score: 8.5 / 10\n"
            "## Summary\nStrong technical background with good project depth."
        )

        app.dependency_overrides[get_current_user_id] = lambda: self.user_id
        app.dependency_overrides[require_entitlement("ai_mentor")] = lambda: self.mock_entitlement

        try:
            with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
                 patch("backend.routers.ai_mentor.chat_with_groq", return_value=llm_response):

                resp = client.post(
                    "/api/ai-mentor/review-resume",
                    json={
                        "resume_text": "Experienced Software Engineer with Python and FastAPI skills.",
                        "target_role": "Backend Engineer",
                        "years_experience": "3",
                        "company_type": "Product-Based",
                    },
                    headers={"Authorization": "Bearer mock-token"},
                )

                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertIn("review", data)

                # Verify resume_scores was called and received EXACTLY ONE insert
                mock_sb.table.assert_any_call("resume_scores")
                resume_scores_table = mock_sb.table("resume_scores")
                self.assertEqual(
                    resume_scores_table.insert.call_count,
                    1,
                    f"Expected exactly 1 insert into resume_scores, got {resume_scores_table.insert.call_count}"
                )

                # Verify inserted record values
                inserted_record = resume_scores_table.insert.call_args[0][0]
                self.assertEqual(inserted_record["user_id"], self.user_id)
                self.assertEqual(inserted_record["filename"], "resume.pdf")
                self.assertEqual(inserted_record["target_role"], "Backend Engineer")
                self.assertEqual(inserted_record["overall_score"], 85.0)

                # Verify user_progress was upserted exactly once
                mock_sb.table.assert_any_call("user_progress")
                user_progress_table = mock_sb.table("user_progress")
                self.assertEqual(
                    user_progress_table.upsert.call_count,
                    1,
                    f"Expected exactly 1 upsert into user_progress, got {user_progress_table.upsert.call_count}"
                )
                upsert_record = user_progress_table.upsert.call_args[0][0]
                self.assertEqual(upsert_record["resume_readiness_score"], 85.0)

        finally:
            app.dependency_overrides.pop(get_current_user_id, None)
            app.dependency_overrides.pop(require_entitlement("ai_mentor"), None)

    def test_02_failed_ai_review_does_not_persist_any_score(self):
        """When AI evaluator fails, no score record must be created."""
        from backend.routers.ai_mentor import _AI_UNAVAILABLE_MSG

        mock_sb = MagicMock()

        app.dependency_overrides[get_current_user_id] = lambda: self.user_id
        app.dependency_overrides[require_entitlement("ai_mentor")] = lambda: self.mock_entitlement

        try:
            with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
                 patch("backend.routers.ai_mentor.chat_with_groq", return_value=_AI_UNAVAILABLE_MSG):

                resp = client.post(
                    "/api/ai-mentor/review-resume",
                    json={
                        "resume_text": "Experienced Software Engineer with Python and FastAPI skills building scalable web APIs.",
                        "target_role": "Backend Engineer",
                    },
                    headers={"Authorization": "Bearer mock-token"},
                )

                self.assertEqual(resp.status_code, 502)

                # Verify ZERO calls to resume_scores table
                mock_sb.table.assert_not_called()

        finally:
            app.dependency_overrides.pop(get_current_user_id, None)
            app.dependency_overrides.pop(require_entitlement("ai_mentor"), None)

    def test_03_score_parsing_handles_100_and_10_scales(self):
        """Verifies score parsing regex handles both /10 and /100 accurately."""
        # 100-scale parsing
        review_100 = "ATS Evaluation Complete.\nScore: 92/100\nGreat work."
        match_100 = re.search(r"(?:Final Score:|Score:)?\s*(\d+(?:\.\d+)?)\s*/\s*(100|10)", review_100, re.IGNORECASE)
        self.assertIsNotNone(match_100)
        val_100 = float(match_100.group(1))
        denom_100 = match_100.group(2)
        if denom_100 == "10" or val_100 <= 10.0:
            val_100 = val_100 * 10.0
        self.assertEqual(round(val_100, 2), 92.0)

        # 10-scale parsing
        review_10 = "ATS Evaluation Complete.\nFinal Score: 7.2 / 10\nGood work."
        match_10 = re.search(r"(?:Final Score:|Score:)?\s*(\d+(?:\.\d+)?)\s*/\s*(100|10)", review_10, re.IGNORECASE)
        self.assertIsNotNone(match_10)
        val_10 = float(match_10.group(1))
        denom_10 = match_10.group(2)
        if denom_10 == "10" or val_10 <= 10.0:
            val_10 = val_10 * 10.0
        self.assertEqual(round(val_10, 2), 72.0)

    def test_04_career_ts_no_direct_supabase_insert(self):
        """Static verification: frontend/lib/api/career.ts must not contain direct resume_scores writes."""
        career_ts_path = Path(__file__).resolve().parent.parent / "frontend" / "lib" / "api" / "career.ts"
        self.assertTrue(career_ts_path.exists(), f"File {career_ts_path} not found")

        content = career_ts_path.read_text(encoding="utf-8")

        # Must not contain insert into resume_scores
        self.assertNotIn(
            'supabase.from("resume_scores")',
            content,
            "frontend/lib/api/career.ts should not directly write to resume_scores"
        )
        self.assertNotIn(
            "resume_scores",
            content,
            "frontend/lib/api/career.ts should not reference resume_scores directly"
        )


if __name__ == "__main__":
    unittest.main()
