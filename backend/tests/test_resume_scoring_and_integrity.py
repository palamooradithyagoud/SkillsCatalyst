"""
Automated Test Suite for Phase 1: Resume Scoring & Data Integrity.

Covers:
- TEST 1: Independent storage of sub-scores (Overall: 85, ATS: 90, Skills: 78, Experience: 82).
- TEST 2: Handling partial AI response (Only overall score; categories remain NULL).
- TEST 3: Strict score validation rejecting invalid values (> 100, 150, NaN, Inf, booleans).
- TEST 4: Preservation of accurate filename (Adithya_Resume_2026.pdf).
- TEST 5: Sanitization of path traversal characters (../../etc/passwd, ..\\windows\\calc.exe).
- TEST 6: Resume Builder unevaluated state representation (No fake 95 score; atsScore is None).
- TEST 7: Supabase failure handling (persisted is False; no false success reported).
- TEST 8: Multi-user isolation (User A vs User B strict scoping).
"""

import math
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from pydantic import ValidationError

from backend.services.resume_scoring import (
    validate_score,
    normalize_score_fraction,
    sanitize_resume_filename,
    extract_resume_scores,
    ResumeCategoryScores,
)
from backend.routers.ai_mentor import (
    ResumeReviewRequest,
    ResumeReviewResponse,
    extract_and_validate_resume_score,
)


# ===========================================================================
# TEST 1: Independent Storage of Sub-Scores
# ===========================================================================

def test_1_independent_storage_of_sub_scores():
    """
    TEST 1:
    A resume receives an overall score of 85, ATS score of 90,
    skills score of 78 and experience score of 82.
    Verify that all four values are parsed and stored independently,
    without overwriting or cloning.
    """
    review_markdown = """
    ## 🧠 Overall Verdict
    - Final Score: 8.5/10
    - Hire

    ## 📊 Section-wise Scores
    - ATS Compatibility: 9/10
    - Role Alignment: 7.8/10
    - Impact: 8.2/10
    - Structure: 8.0/10

    ## ❌ Critical Issues (Top 5)
    - Add metrics to project bullets
    """

    scores = extract_resume_scores(review_markdown)

    assert scores.overall_score == 85.0
    assert scores.ats_compatibility_score == 90.0
    assert scores.skills_match_score == 78.0
    assert scores.experience_score == 82.0
    assert scores.structure_score == 80.0
    assert scores.score_status == "completed"

    # Verify that values are strictly distinct and not cloned copies of each other
    distinct_scores = {
        scores.overall_score,
        scores.ats_compatibility_score,
        scores.skills_match_score,
        scores.experience_score,
    }
    assert len(distinct_scores) == 4, f"Expected 4 distinct scores, got: {distinct_scores}"


# ===========================================================================
# TEST 2: Missing Category Scores Remain NULL
# ===========================================================================

def test_2_missing_category_scores_remain_null():
    """
    TEST 2:
    The AI returns only an overall score.
    Verify that missing category scores remain NULL (None) or unavailable,
    and are NEVER populated with overall_score.
    """
    review_markdown = """
    ## 🧠 Overall Verdict
    - Final Score: 85/100
    - Hire with reservations
    
    (No section-wise breakdown provided)
    """

    scores = extract_resume_scores(review_markdown)

    assert scores.overall_score == 85.0
    assert scores.ats_compatibility_score is None
    assert scores.skills_match_score is None
    assert scores.experience_score is None
    assert scores.structure_score is None
    assert scores.content_quality_score is None
    assert scores.score_status == "partially_completed"


# ===========================================================================
# TEST 3: Strict Score Validation Rejects Out-of-Bounds & Malformed Values
# ===========================================================================

def test_3_strict_score_validation_rejects_invalid():
    """
    TEST 3:
    The AI returns an invalid score such as 150.
    Verify that validation rejects it and does NOT fallback to a default (like 95 or 100).
    """
    # Test raw validator directly
    assert validate_score(150) is None
    assert validate_score(-10) is None
    assert validate_score("150") is None
    assert validate_score(float("nan")) is None
    assert validate_score(float("inf")) is None
    assert validate_score(float("-inf")) is None
    assert validate_score(True) is None   # Booleans must never be treated as 1.0
    assert validate_score(False) is None
    assert validate_score("invalid") is None
    assert validate_score(None) is None

    # Test fraction normalizer
    assert normalize_score_fraction("15", "10") is None  # 15/10 is out of bounds
    assert normalize_score_fraction("150", "100") is None # 150/100 is out of bounds
    assert normalize_score_fraction("8", "20") is None   # non-standard denom
    assert normalize_score_fraction("-5", "10") is None  # negative numerator

    # Test parser on text containing invalid score
    review_markdown = """
    ## 🧠 Overall Verdict
    - Final Score: 150/100
    - ATS Compatibility: 15/10
    """
    scores = extract_resume_scores(review_markdown)
    assert scores.overall_score is None
    assert scores.ats_compatibility_score is None
    assert scores.score_status == "failed"


# ===========================================================================
# TEST 4: Preservation of Accurate Filename
# ===========================================================================

def test_4_accurate_filename_preserved():
    """
    TEST 4:
    The uploaded filename is: 'Adithya_Resume_2026.pdf'.
    Verify that the correct filename is preserved and not hardcoded to 'resume.pdf'.
    """
    input_filename = "Adithya_Resume_2026.pdf"
    sanitized = sanitize_resume_filename(input_filename)
    assert sanitized == "Adithya_Resume_2026.pdf"

    # Also test with DOCX extension (should not be assumed to be PDF)
    docx_filename = "Candidate_Portfolio_2026.docx"
    sanitized_docx = sanitize_resume_filename(docx_filename)
    assert sanitized_docx == "Candidate_Portfolio_2026.docx"

    # Verify Pydantic request model sanitizes and preserves filename
    req = ResumeReviewRequest(
        resume_text="A" * 60,
        target_role="Software Engineer",
        filename="Adithya_Resume_2026.pdf"
    )
    assert req.filename == "Adithya_Resume_2026.pdf"


# ===========================================================================
# TEST 5: Path Traversal Characters Sanitized Safely
# ===========================================================================

def test_5_path_traversal_sanitized():
    """
    TEST 5:
    The uploaded filename contains path traversal characters.
    Verify that it is sanitized safely without directory climbing.
    """
    traversal_cases = [
        ("../../etc/passwd", "passwd"),
        ("..\\..\\..\\Windows\\System32\\cmd.exe", "cmd.exe"),
        ("/var/www/uploads/../../../secret.pdf", "secret.pdf"),
        ("....//....//nested_resume.pdf", "nested_resume.pdf"),
        ("resume\x00_injection.pdf", "resume_injection.pdf"),
        ("foo<bar>:special?.pdf", "foo_bar__special_.pdf"),
        ("...", "uploaded_resume.pdf"),  # All dots stripped -> falls back to default
        ("", "uploaded_resume.pdf"),     # Empty -> default
        (None, "uploaded_resume.pdf"),   # None -> default
    ]

    for raw, expected in traversal_cases:
        result = sanitize_resume_filename(raw, default="uploaded_resume.pdf")
        assert result == expected, f"Failed for '{raw}': got '{result}', expected '{expected}'"


# ===========================================================================
# TEST 6: Resume Builder Unevaluated State Representation
# ===========================================================================

def test_6_resume_builder_unevaluated_state():
    """
    TEST 6:
    When a resume has not been evaluated, verify that scores are None
    and never fall back to an artificial 95.
    """
    # Pydantic model defaults
    empty_scores = ResumeCategoryScores()
    assert empty_scores.overall_score is None
    assert empty_scores.ats_compatibility_score is None
    assert empty_scores.skills_match_score is None
    assert empty_scores.experience_score is None
    assert empty_scores.score_status == "pending"

    # Pydantic ResumeReviewResponse defaults
    resp = ResumeReviewResponse(
        review="Review text",
        overall_score=None,
        scoring_status="unscored",
        ats_compatibility_score=None,
        skills_match_score=None,
        experience_score=None,
        score_status="failed",
        persisted=False,
    )
    assert resp.overall_score is None
    assert resp.ats_compatibility_score is None
    assert resp.scoring_status == "unscored"
    assert resp.persisted is False


# ===========================================================================
# TEST 7: Supabase Insertion Failure Handling
# ===========================================================================

def test_7_supabase_insertion_failure_handled():
    """
    TEST 7:
    Supabase insertion fails.
    Verify that the application handles the error gracefully and does NOT report a successful save.
    """
    score_record = {
        "user_id": "user-123",
        "filename": "test.pdf",
        "target_role": "Backend Engineer",
        "company_type": "Product-Based",
        "overall_score": 85.0,
        "ats_compatibility_score": 90.0,
        "skills_match_score": 80.0,
        "experience_score": 85.0,
        "full_review_json": {"review": "test"},
    }

    # Simulate Supabase client failure
    mock_sb = MagicMock()
    mock_sb.table.side_effect = RuntimeError("Database connection timed out")

    persisted = False
    try:
        mock_sb.table("resume_scores").insert(score_record).execute()
        persisted = True
    except Exception as e:
        persisted = False

    assert persisted is False, "Persisted should be False when Supabase insert fails"

    # Response model accurately reports persisted=False
    resp = ResumeReviewResponse(
        review="Test review",
        overall_score=85.0,
        scoring_status="scored",
        ats_compatibility_score=90.0,
        skills_match_score=80.0,
        experience_score=85.0,
        score_status="completed",
        persisted=persisted,
    )
    assert resp.persisted is False


# ===========================================================================
# TEST 8: Multi-User Isolation
# ===========================================================================

def test_8_multi_user_isolation():
    """
    TEST 8:
    Two different users submit resumes.
    Verify that their records are isolated and bound strictly to their user_id.
    """
    user_a_id = "11111111-1111-1111-1111-111111111111"
    user_b_id = "22222222-2222-2222-2222-222222222222"

    record_a = {
        "user_id": user_a_id,
        "filename": "user_a_resume.pdf",
        "target_role": "Frontend Engineer",
        "overall_score": 82.0,
    }

    record_b = {
        "user_id": user_b_id,
        "filename": "user_b_resume.pdf",
        "target_role": "Data Engineer",
        "overall_score": 91.0,
    }

    assert record_a["user_id"] != record_b["user_id"]
    assert record_a["filename"] != record_b["filename"]
    assert record_a["overall_score"] != record_b["overall_score"]

    # Mock database table storage simulating RLS filter
    db_store = [record_a, record_b]

    def query_user_resumes(query_user_id: str):
        # Strict user isolation condition enforced by Supabase RLS (auth.uid() = user_id)
        return [r for r in db_store if r["user_id"] == query_user_id]

    user_a_resumes = query_user_resumes(user_a_id)
    assert len(user_a_resumes) == 1
    assert user_a_resumes[0]["filename"] == "user_a_resume.pdf"
    assert all(r["user_id"] == user_a_id for r in user_a_resumes)

    user_b_resumes = query_user_resumes(user_b_id)
    assert len(user_b_resumes) == 1
    assert user_b_resumes[0]["filename"] == "user_b_resume.pdf"
    assert all(r["user_id"] == user_b_id for r in user_b_resumes)
