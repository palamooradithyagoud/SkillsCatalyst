"""
tests/test_sys06_resume_ai_scoring.py
SYS-06: Comprehensive Adversarial Verification Suite for Resume AI Score Handling.

Verifies:
1. Valid AI response contains valid overall_score and scoring_status in HTTP response.
2. 10-scale and 100-scale scores normalized accurately to 0.00-100.00.
3. Anchored score extraction is protected from earlier fractions (e.g. 'top 1/10').
4. Section scores fallback when Final Score is omitted by LLM (at least 3 valid sections).
5. Out-of-bounds scores (> 100 or < 0 or > 10 on 10-scale) are REJECTED as None (ZERO clamping).
6. Decimal scores on 100-scale (e.g. 8.5/100) are not inflated 10x to 85.0.
7. Missing score produces None (scoring_status='unscored') without fabricating 75.0 or any default.
8. Unscored review does NOT persist to resume_scores and does NOT overwrite user_progress.
9. AI provider unavailable (502) does not persist or return scores.
10. All test cases A through O required by SYS-06 verification specification.
"""

import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_current_user_id
from backend.dependencies.subscription import require_entitlement
from backend.models.subscription import EntitlementDetailDTO, AccessLevel
from backend.routers.ai_mentor import extract_and_validate_resume_score, ResumeReviewResponse

client = TestClient(app)


class TestSYS06ResumeAIScoring(unittest.TestCase):

    def setUp(self):
        self.user_id = "4113d832-6ac1-402a-bd00-1fd7f2b7ab26"
        self.mock_entitlement = EntitlementDetailDTO(access=AccessLevel.FULL, limit=None)
        app.dependency_overrides[get_current_user_id] = lambda: self.user_id
        app.dependency_overrides[require_entitlement("ai_mentor")] = lambda: self.mock_entitlement

    def tearDown(self):
        app.dependency_overrides.pop(get_current_user_id, None)
        app.dependency_overrides.pop(require_entitlement("ai_mentor"), None)

    # ──────────────────────────────────────────────────────────────────────────
    # 1. API Response & Persistence Contract
    # ──────────────────────────────────────────────────────────────────────────
    def test_01_api_returns_overall_score_matching_persisted_value(self):
        """API response must contain 'overall_score' and 'scoring_status' matching database persistence."""
        mock_sb = MagicMock()
        mock_insert = MagicMock()
        mock_upsert = MagicMock()
        mock_sb.table.return_value.insert.return_value = mock_insert
        mock_sb.table.return_value.upsert.return_value = mock_upsert

        llm_response = (
            "## Overall Verdict\n"
            "- Final Score: 8.8 / 10\n"
            "- Strong hire for backend role."
        )

        with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value=llm_response):

            resp = client.post(
                "/api/ai-mentor/review-resume",
                json={
                    "resume_text": "Experienced Python and FastAPI backend engineer with 5 years experience.",
                    "target_role": "Senior Backend Engineer",
                },
                headers={"Authorization": "Bearer mock-token"},
            )

            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            # Contract verification
            self.assertIn("review", data)
            self.assertEqual(data["overall_score"], 88.0)
            self.assertEqual(data["scoring_status"], "scored")

            # Database persistence verification
            resume_scores_table = mock_sb.table("resume_scores")
            inserted_record = resume_scores_table.insert.call_args[0][0]
            self.assertEqual(inserted_record["overall_score"], 88.0)

            user_progress_table = mock_sb.table("user_progress")
            upsert_record = user_progress_table.upsert.call_args[0][0]
            self.assertEqual(upsert_record["resume_readiness_score"], 88.0)

    def test_02_api_unscored_review_distinguished_and_skips_persistence(self):
        """When AI returns text without usable score, API returns overall_score=None, scoring_status='unscored', and skips DB persistence."""
        mock_sb = MagicMock()
        llm_response = (
            "## Overall Verdict\n"
            "Great candidate with solid experience, but needs more quantifiable accomplishments."
        )

        with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value=llm_response):

            resp = client.post(
                "/api/ai-mentor/review-resume",
                json={
                    "resume_text": "Experienced Python and FastAPI backend engineer with 5 years experience.",
                    "target_role": "Senior Backend Engineer",
                },
                headers={"Authorization": "Bearer mock-token"},
            )

            self.assertEqual(resp.status_code, 200)
            data = resp.json()

            # Must distinguish successful text generation from successful score generation
            self.assertIn("review", data)
            self.assertIsNone(data["overall_score"], "Must not fabricate a numeric score")
            self.assertEqual(data["scoring_status"], "unscored")

            # DB persistence must NOT overwrite existing user progress
            mock_sb.table.assert_not_called()

    def test_03_ai_provider_failure_returns_502_no_persistence(self):
        """When AI evaluator fails, returns 502 and persists zero score records."""
        from backend.routers.ai_mentor import _AI_UNAVAILABLE_MSG

        mock_sb = MagicMock()
        with patch("backend.services.supabase_service.get_supabase", return_value=mock_sb), \
             patch("backend.routers.ai_mentor.chat_with_groq", return_value=_AI_UNAVAILABLE_MSG):

            resp = client.post(
                "/api/ai-mentor/review-resume",
                json={
                    "resume_text": "Experienced Python and FastAPI backend engineer with 5 years experience.",
                    "target_role": "Backend Engineer",
                },
                headers={"Authorization": "Bearer mock-token"},
            )

            self.assertEqual(resp.status_code, 502)
            mock_sb.table.assert_not_called()

    # ──────────────────────────────────────────────────────────────────────────
    # 2. SYS-06 Verification Specification Cases A through O
    # ──────────────────────────────────────────────────────────────────────────
    def test_case_A_final_score_9_over_10(self):
        """Case A: 'Final Score: 9/10' -> 90.0"""
        self.assertEqual(extract_and_validate_resume_score("Final Score: 9/10"), 90.0)

    def test_case_B_unrelated_fraction_before_score(self):
        """Case B: 'top 1/10' appearing before 'Final Score: 9/10' -> 90.0"""
        text = "This candidate is in the top 1/10 of applicants.\nFinal Score: 9/10"
        self.assertEqual(extract_and_validate_resume_score(text), 90.0)

    def test_case_C_decimal_score_100_scale(self):
        """Case C: 'Final Score: 8.5/100' -> 8.5 (not 85.0)"""
        self.assertEqual(extract_and_validate_resume_score("Final Score: 8.5/100"), 8.5)

    def test_case_D_out_of_bounds_high_10_scale_rejected(self):
        """Case D: 'Final Score: 15/10' -> None (strictly rejected, NOT clamped to 100)"""
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 15/10"))

    def test_case_E_negative_score_rejected(self):
        """Case E: 'Final Score: -3/10' -> None (strictly rejected, NOT clamped to 0)"""
        self.assertIsNone(extract_and_validate_resume_score("Final Score: -3/10"))

    def test_case_F_out_of_bounds_high_100_scale_rejected(self):
        """Case F: 'Final Score: 150/100' -> None (strictly rejected, NOT clamped to 100)"""
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 150/100"))

    def test_case_G_zero_score_valid(self):
        """Case G: 'Final Score: 0/100' -> 0.0"""
        self.assertEqual(extract_and_validate_resume_score("Final Score: 0/100"), 0.0)

    def test_case_H_perfect_score_valid(self):
        """Case H: 'Final Score: 100/100' -> 100.0"""
        self.assertEqual(extract_and_validate_resume_score("Final Score: 100/100"), 100.0)

    def test_case_I_missing_score_with_valid_section_scores(self):
        """Case I: Missing overall score with valid section scores -> Average of section scores"""
        text = (
            "## Section Breakdown\n"
            "- ATS Compatibility: 8/10\n"
            "- Role Alignment: 7/10\n"
            "- Impact: 9/10\n"
            "- Structure: 8/10\n"
        )
        # (80 + 70 + 90 + 80) / 4 = 80.0
        self.assertEqual(extract_and_validate_resume_score(text), 80.0)

    def test_case_J_missing_score_and_missing_section_scores(self):
        """Case J: Missing score and missing section scores -> None (ZERO fabricated default)"""
        text = "Candidate has a well-structured resume. Good job."
        self.assertIsNone(extract_and_validate_resume_score(text))

    def test_case_K_contradictory_or_corrupted_overall_score(self):
        """Case K: Contradictory overall and section scores (e.g. invalid overall 15/10 with sections) -> None"""
        text = (
            "Final Score: 15/10\n"
            "ATS Compatibility: 8/10\n"
            "Role Alignment: 7/10\n"
            "Impact: 9/10\n"
            "Structure: 8/10\n"
        )
        # Attempted overall score was invalid; do not guess or silently substitute section scores
        self.assertIsNone(extract_and_validate_resume_score(text))

    def test_case_L_malformed_denominators(self):
        """Case L: Malformed denominators (e.g. /0, /5, /20, /abc) -> None"""
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 8/0"))
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 8/5"))
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 8/20"))
        self.assertIsNone(extract_and_validate_resume_score("Final Score: 8/abc"))

    def test_case_M_multiple_possible_overall_score_labels(self):
        """Case M: Multiple possible overall-score labels ('Overall Score', 'ATS Score', 'Total Score', 'Score')"""
        self.assertEqual(extract_and_validate_resume_score("Overall Score: 8.5/10"), 85.0)
        self.assertEqual(extract_and_validate_resume_score("ATS Score: 92/100"), 92.0)
        self.assertEqual(extract_and_validate_resume_score("Total Score: 7/10"), 70.0)
        self.assertEqual(extract_and_validate_resume_score("Score: 80/100"), 80.0)

    def test_case_N_valid_score_embedded_in_prose(self):
        """Case N: A valid score embedded in unrelated prose -> 80.0"""
        text = "After an extensive review of the candidate's accomplishments, the Final Score: 8/10 was awarded."
        self.assertEqual(extract_and_validate_resume_score(text), 80.0)

    def test_case_O_markdown_formatted_score_output(self):
        """Case O: Markdown-formatted score output (bold, backticks, list items)"""
        text1 = "- **Final Score**: **8.5/10**"
        text2 = "### ATS Score: `94/100`"
        text3 = "* **Overall Score:** *88/100*"
        self.assertEqual(extract_and_validate_resume_score(text1), 85.0)
        self.assertEqual(extract_and_validate_resume_score(text2), 94.0)
        self.assertEqual(extract_and_validate_resume_score(text3), 88.0)

    # ──────────────────────────────────────────────────────────────────────────
    # 3. Conflicting Score Labels & Precedence Rules
    # ──────────────────────────────────────────────────────────────────────────
    def test_precedence_ats_score_followed_by_final_score(self):
        """ATS Score: 92/100 followed by Final Score: 65/100 -> Final Score (65.0) takes precedence."""
        text = "ATS Score: 92/100 in keyword match.\n## Overall Verdict\nFinal Score: 65/100"
        self.assertEqual(extract_and_validate_resume_score(text), 65.0)

    def test_precedence_final_score_followed_by_ats_score(self):
        """Final Score: 65/100 followed by ATS Score: 92/100 -> Final Score (65.0) takes precedence."""
        text = "Final Score: 65/100\nATS Score: 92/100"
        self.assertEqual(extract_and_validate_resume_score(text), 65.0)

    def test_duplicate_final_score_conflicting_values_rejected(self):
        """Duplicate Final Score labels with conflicting values -> None (ambiguous/contradictory)."""
        text = "Final Score: 65/100\nFinal Score: 80/100"
        self.assertIsNone(extract_and_validate_resume_score(text))

    def test_duplicate_final_score_identical_values_accepted(self):
        """Duplicate Final Score labels with identical values -> 75.0 (consistent)."""
        text = "Final Score: 75/100\nFinal Score: 75/100"
        self.assertEqual(extract_and_validate_resume_score(text), 75.0)

    def test_invalid_final_score_with_valid_sections_never_falls_back(self):
        """An invalid explicit overall score must not silently fall back to section scores."""
        text = (
            "Final Score: 15/10\n"
            "- ATS Compatibility: 9/10\n"
            "- Role Alignment: 8/10\n"
            "- Impact: 9/10\n"
            "- Structure: 8/10\n"
        )
        self.assertIsNone(extract_and_validate_resume_score(text))


if __name__ == "__main__":
    unittest.main()

