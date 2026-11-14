"""
backend/tests/test_phase4_resume_intelligence.py
Phase 4: Comprehensive Test Suite for Resume Intelligence & Career Progress Tracking.

Covers:
1. Resume Series Management (Create, List, Detail, Update, Delete)
2. Safe Monotonic Versioning (Version 1 -> Version 2 -> Version 3)
3. Intelligent Resume Comparison (Score deltas, structured diffs, keywords, anti-hallucination)
4. Career Growth Tracking & Data-Backed Milestones
5. Professional Vector PDF Report Generation
6. Tenant Isolation, Security & Authorization
"""

import io
import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from backend.services.resume_series_service import (
    create_resume_series,
    list_user_resume_series,
    get_resume_series_detail,
    update_resume_series,
    delete_resume_series,
    get_next_version_number,
    get_latest_analysis_id_for_series,
)
from backend.services.resume_comparison_service import (
    compare_resume_versions,
    compare_score,
    compare_structured_content,
    compare_keywords,
    compute_jd_hash,
)
from backend.services.resume_progress_service import (
    get_resume_series_progress,
    compute_growth_milestones,
    track_recurring_weaknesses,
    calculate_category_indicator,
)
from backend.services.resume_report_service import generate_resume_pdf_report
from backend.services.auth_service import get_current_user_id

USER_A = "11111111-1111-4111-a111-111111111111"
USER_B = "22222222-2222-4222-b222-222222222222"
SERIES_ID_A = "33333333-3333-4333-c333-333333333333"


# ===========================================================================
# 1. RESUME SERIES MANAGEMENT TESTS
# ===========================================================================

def test_create_resume_series_success():
    """Verify creating a new logical resume series."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    created_row = {
        "id": SERIES_ID_A,
        "user_id": USER_A,
        "title": "Software Developer Resume",
        "target_role": "Fullstack Engineer",
        "description": "Primary tech resume",
    }
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[created_row])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        result = create_resume_series(
            user_id=USER_A,
            title="Software Developer Resume",
            target_role="Fullstack Engineer",
            description="Primary tech resume",
        )
        assert result["id"] == SERIES_ID_A
        assert result["title"] == "Software Developer Resume"
        mock_table.insert.assert_called_once()


def test_create_resume_series_empty_title_rejected():
    """Verify empty series title raises HTTP 400."""
    with pytest.raises(HTTPException) as exc:
        create_resume_series(user_id=USER_A, title="   ")
    assert exc.value.status_code == 400


def test_list_user_resume_series_with_aggregated_metrics():
    """Verify list_user_resume_series aggregates version count, latest score, and best score."""
    mock_sb = MagicMock()
    series_table = MagicMock()
    analyses_table = MagicMock()

    def table_router(table_name):
        if table_name == "resume_series":
            return series_table
        return analyses_table

    mock_sb.table.side_effect = table_router

    # User has 1 series
    series_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[
        {
            "id": SERIES_ID_A,
            "user_id": USER_A,
            "title": "Backend Resume",
            "target_role": "Backend Engineer",
            "created_at": "2026-11-14T10:00:00Z",
            "updated_at": "2026-11-14T11:00:00Z",
        }
    ])

    # Series has 2 versions: v1 (score 65), v2 (score 82)
    analyses_table.select.return_value.in_.return_value.order.return_value.execute.return_value = MagicMock(data=[
        {"id": "v1-id", "resume_series_id": SERIES_ID_A, "version_number": 1, "overall_score": 65.0, "created_at": "2026-11-14T10:00:00Z", "original_filename": "res_v1.pdf"},
        {"id": "v2-id", "resume_series_id": SERIES_ID_A, "version_number": 2, "overall_score": 82.0, "created_at": "2026-11-14T11:00:00Z", "original_filename": "res_v2.pdf"},
    ])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        result = list_user_resume_series(user_id=USER_A)
        assert len(result) == 1
        item = result[0]
        assert item["versions_count"] == 2
        assert item["latest_version"] == 2
        assert item["latest_score"] == 82.0
        assert item["best_score"] == 82.0
        assert item["latest_analysis_id"] == "v2-id"


def test_update_resume_series_success():
    """Verify updating a series title and target role."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Ownership check passes
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": SERIES_ID_A}])
    # Update returns updated row
    mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[
        {"id": SERIES_ID_A, "title": "Updated ML Series", "target_role": "AI Engineer"}
    ])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        updated = update_resume_series(
            user_id=USER_A,
            series_id=SERIES_ID_A,
            title="Updated ML Series",
            target_role="AI Engineer",
        )
        assert updated["title"] == "Updated ML Series"
        assert updated["target_role"] == "AI Engineer"


def test_delete_resume_series_cleans_up_storage_and_db():
    """Verify deleting a series removes all associated storage files and database row."""
    mock_sb = MagicMock()
    series_table = MagicMock()
    analyses_table = MagicMock()

    def table_router(table_name):
        if table_name == "resume_series":
            return series_table
        return analyses_table

    mock_sb.table.side_effect = table_router

    # Ownership check passes
    series_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": SERIES_ID_A}])
    # Returns 2 storage files to clean up
    analyses_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[
        {"storage_path": f"{USER_A}/v1/resume.pdf"},
        {"storage_path": f"{USER_A}/v2/resume.pdf"},
    ])
    series_table.delete.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb), \
         patch("backend.services.resume_series_service.delete_resume_from_storage") as mock_del_storage:
        success = delete_resume_series(user_id=USER_A, series_id=SERIES_ID_A)
        assert success is True
        assert mock_del_storage.call_count == 2
        series_table.delete.assert_called_once()


# ===========================================================================
# 2. VERSION NUMBERING & MONOTONIC PROGRESSION TESTS
# ===========================================================================

def test_get_next_version_number_progression():
    """Verify version numbering starts at 1 and increases monotonically."""
    mock_sb = MagicMock()
    mock_table = MagicMock()
    mock_sb.table.return_value = mock_table

    # Case A: Empty series -> version 1
    mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        assert get_next_version_number(SERIES_ID_A) == 1

    # Case B: Max version is 3 -> next is 4
    mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[{"version_number": 3}])
    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        assert get_next_version_number(SERIES_ID_A) == 4


# ===========================================================================
# 3. INTELLIGENT VERSION COMPARISON TESTS
# ===========================================================================

def test_compare_score_calculation():
    """Verify compare_score calculates deltas, percentage changes, and direction."""
    # Positive delta
    res_pos = compare_score(60.0, 75.0)
    assert res_pos["delta"] == 15.0
    assert res_pos["percentage_change"] == 25.0
    assert res_pos["status"] == "improved"

    # Negative delta
    res_neg = compare_score(80.0, 72.0)
    assert res_neg["delta"] == -8.0
    assert res_neg["percentage_change"] == -10.0
    assert res_neg["status"] == "declined"

    # Unchanged
    res_unchanged = compare_score(75.0, 75.0)
    assert res_unchanged["delta"] == 0.0
    assert res_unchanged["status"] == "unchanged"

    # NULL handling without fake scores
    res_null = compare_score(None, 80.0)
    assert res_null["delta"] is None
    assert res_null["status"] == "not_comparable"


def test_compare_structured_content_detects_sections_skills_projects():
    """Verify structured comparison accurately identifies added/removed skills, projects, and sections."""
    older_ext = {
        "sections_detected": ["Education", "Skills", "Experience"],
        "skills": ["Python", "Django", "SQL"],
        "projects": [{"title": "Weather App"}],
        "certifications": ["AWS Cloud Practitioner"],
    }
    newer_ext = {
        "sections_detected": ["Education", "Skills", "Experience", "Projects", "Certifications"],
        "skills": ["Python", "Django", "SQL", "Docker", "Kubernetes", "FastAPI"],
        "projects": [{"title": "Weather App"}, {"title": "E-Commerce Microservices"}],
        "certifications": ["AWS Cloud Practitioner", "CKA Kubernetes"],
    }

    diff = compare_structured_content(older_ext, newer_ext)

    # Sections
    assert "Projects" in diff["sections"]["added"]
    assert "Certifications" in diff["sections"]["added"]
    assert len(diff["sections"]["removed"]) == 0

    # Skills
    assert "docker" in diff["skills"]["added"]
    assert "kubernetes" in diff["skills"]["added"]
    assert "fastapi" in diff["skills"]["added"]
    assert len(diff["skills"]["removed"]) == 0
    assert diff["skills"]["retained_count"] == 3

    # Projects
    assert diff["projects"]["added_count"] == 1
    assert "E-Commerce Microservices" in diff["projects"]["added_titles"]

    # Certifications
    assert "cka kubernetes" in diff["certifications"]["added"]


def test_compare_keywords_and_jd_divergence_warning():
    """Verify keyword diffing flags newly matched keywords and warns if job descriptions differ."""
    older_kw = {
        "matched_keywords": ["python", "sql"],
        "missing_keywords": ["docker", "fastapi", "kubernetes"],
    }
    newer_kw = {
        "matched_keywords": ["python", "sql", "docker", "fastapi"],
        "missing_keywords": ["kubernetes", "terraform"],
    }

    # Case A: Same JD
    diff_same = compare_keywords(older_kw, newer_kw, jd_differ=False)
    assert "docker" in diff_same["newly_matched_keywords"]
    assert "fastapi" in diff_same["newly_matched_keywords"]
    assert "docker" in diff_same["resolved_missing_keywords"]
    assert diff_same["job_descriptions_differ"] is False
    assert diff_same["warning"] is None

    # Case B: Different JD
    diff_diff_jd = compare_keywords(older_kw, newer_kw, jd_differ=True)
    assert diff_diff_jd["job_descriptions_differ"] is True
    assert diff_diff_jd["warning"] is not None


def test_compare_resume_versions_end_to_end():
    """Verify end-to-end comparison controller rejects cross-series and compares valid records."""
    rec_v1 = {
        "id": "v1-uuid",
        "user_id": USER_A,
        "resume_series_id": SERIES_ID_A,
        "version_number": 1,
        "original_filename": "res_v1.pdf",
        "created_at": "2026-11-14T10:00:00Z",
        "overall_score": 60.0,
        "ats_score": 55.0,
        "content_score": 62.0,
        "skills_score": 58.0,
        "structure_score": 65.0,
        "scoring_engine_version": "2.2",
        "analysis_result": {
            "extraction": {"sections_detected": ["Education", "Experience"], "skills": ["Python"]},
            "keyword_analysis": {"matched_keywords": ["python"], "missing_keywords": ["docker"]},
            "ai_evaluation": {"recommendations": ["Add cloud skills and quantifiable bullets"], "weaknesses": ["No metrics"]},
        }
    }
    rec_v2 = {
        "id": "v2-uuid",
        "user_id": USER_A,
        "resume_series_id": SERIES_ID_A,
        "version_number": 2,
        "original_filename": "res_v2.pdf",
        "created_at": "2026-11-14T12:00:00Z",
        "overall_score": 78.0,
        "ats_score": 75.0,
        "content_score": 80.0,
        "skills_score": 76.0,
        "structure_score": 82.0,
        "scoring_engine_version": "2.2",
        "analysis_result": {
            "extraction": {"sections_detected": ["Education", "Experience", "Projects"], "skills": ["Python", "Docker"]},
            "keyword_analysis": {"matched_keywords": ["python", "docker"], "missing_keywords": []},
            "ai_evaluation": {"recommendations": ["Expand deployment architecture"], "weaknesses": []},
        }
    }

    with patch("backend.services.resume_comparison_service.get_resume_analysis_by_id") as mock_get:
        mock_get.side_effect = [rec_v1, rec_v2]

        comparison = compare_resume_versions(
            user_id=USER_A,
            older_analysis_id="v1-uuid",
            newer_analysis_id="v2-uuid",
        )

        assert comparison["success"] is True
        assert comparison["scores"]["overall"]["delta"] == 18.0
        assert comparison["scores"]["overall"]["status"] == "improved"
        assert comparison["scores"]["ats"]["delta"] == 20.0
        assert "docker" in comparison["content_changes"]["skills"]["added"]
        assert len(comparison["summary"]["what_improved"]) > 0


def test_compare_versions_rejects_cross_series():
    """Verify comparing analyses from two different series is rejected with HTTP 400."""
    rec_s1 = {"id": "v1", "user_id": USER_A, "resume_series_id": "series-1", "analysis_result": {}}
    rec_s2 = {"id": "v2", "user_id": USER_A, "resume_series_id": "series-2", "analysis_result": {}}

    with patch("backend.services.resume_comparison_service.get_resume_analysis_by_id") as mock_get:
        mock_get.side_effect = [rec_s1, rec_s2]
        with pytest.raises(HTTPException) as exc:
            compare_resume_versions(user_id=USER_A, older_analysis_id="v1", newer_analysis_id="v2")
        assert exc.value.status_code == 400


# ===========================================================================
# 4. CAREER PROGRESSION & MILESTONES TESTS
# ===========================================================================

def test_compute_growth_milestones_evidence_based():
    """Verify milestones unlock strictly based on real score milestones."""
    versions = [
        {"version_number": 1, "overall_score": 60.0, "ats_score": 65.0, "created_at": "2026-11-14T08:00:00Z"},
        {"version_number": 2, "overall_score": 72.0, "ats_score": 74.0, "created_at": "2026-11-14T09:00:00Z"},
        {"version_number": 3, "overall_score": 82.0, "ats_score": 78.0, "created_at": "2026-11-14T10:00:00Z"},
    ]

    milestones = compute_growth_milestones(versions)
    unlocked_ids = {m["id"] for m in milestones if m["unlocked"]}

    # Should unlock: first_analysis, first_improvement, ats_above_70, overall_above_80, consistent_improvement (2 gains)
    assert "first_analysis" in unlocked_ids
    assert "first_improvement" in unlocked_ids
    assert "ats_above_70" in unlocked_ids
    assert "overall_above_80" in unlocked_ids
    assert "consistent_improvement" in unlocked_ids
    # Should NOT unlock: five_versions (only 3 versions)
    assert "five_versions" not in unlocked_ids


def test_category_indicators_calculation():
    """Verify indicator direction (improved, declined, unchanged, not_comparable)."""
    assert calculate_category_indicator(60.0, 70.0) == "improved"
    assert calculate_category_indicator(75.0, 70.0) == "declined"
    assert calculate_category_indicator(80.0, 80.0) == "unchanged"
    assert calculate_category_indicator(None, 80.0) == "not_comparable"


def test_get_resume_series_progress_summary():
    """Verify progress aggregation returns growth metrics, chart timeline, and recurring weaknesses."""
    mock_detail = {
        "id": SERIES_ID_A,
        "title": "Software Engineer Series",
        "target_role": "Fullstack",
        "description": "Main track",
        "versions": [
            {"version_number": 1, "id": "v1", "created_at": "2026-11-14T08:00:00Z", "original_filename": "v1.pdf", "overall_score": 60.0, "ats_score": 55.0, "content_score": 65.0, "skills_score": 60.0, "structure_score": 60.0},
            {"version_number": 2, "id": "v2", "created_at": "2026-11-14T10:00:00Z", "original_filename": "v2.pdf", "overall_score": 78.0, "ats_score": 72.0, "content_score": 80.0, "skills_score": 75.0, "structure_score": 85.0},
        ],
    }

    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[
        {"id": "v1", "version_number": 1, "analysis_result": {"ai_evaluation": {"weaknesses": ["Missing metrics"]}}},
        {"id": "v2", "version_number": 2, "analysis_result": {"ai_evaluation": {"weaknesses": []}}},
    ])

    with patch("backend.services.resume_progress_service.get_resume_series_detail", return_value=mock_detail), \
         patch("backend.services.resume_progress_service.get_supabase", return_value=mock_sb):
        progress = get_resume_series_progress(user_id=USER_A, series_id=SERIES_ID_A)

        growth = progress["growth"]
        assert growth["total_versions"] == 2
        assert growth["current_overall_score"] == 78.0
        assert growth["previous_overall_score"] == 60.0
        assert growth["best_score"] == 78.0
        assert growth["total_score_improvement"] == 18.0
        assert len(progress["timeline"]) == 2
        assert progress["category_indicators"]["overall"] == "improved"


# ===========================================================================
# 5. PROFESSIONAL VECTOR PDF REPORT GENERATION TESTS
# ===========================================================================

def test_generate_resume_pdf_report_valid_output():
    """Verify generate_resume_pdf_report produces a non-empty vector PDF matching spec."""
    mock_record = {
        "id": "11111111-1111-4111-8111-111111111111",
        "user_id": USER_A,
        "original_filename": "Jane_Doe_Resume.pdf",
        "created_at": "2026-11-14T10:00:00Z",
        "overall_score": 84.5,
        "ats_score": 80.0,
        "content_score": 88.0,
        "skills_score": 82.0,
        "structure_score": 88.0,
        "scoring_engine_version": "2.2",
        "analysis_result": {
            "target_role": "Fullstack Engineer",
            "career_stage": "Early Career",
            "extraction": {
                "name": "Jane Doe",
                "sections_detected": ["Summary", "Experience", "Projects", "Skills", "Education"],
                "skills": ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
                "projects": [{"title": "SkillsCatalyst Portal"}],
                "total_years_experience": 2,
            },
            "ats_analysis": {
                "ats_compatibility_score": 80.0,
                "issues": ["Minor font size discrepancy in footer"],
            },
            "keyword_analysis": {
                "matched_keywords": ["React", "TypeScript", "Docker"],
                "missing_keywords": ["Kubernetes", "AWS"],
            },
            "ai_evaluation": {
                "summary": "Strong candidate with demonstrable web architecture skills.",
                "strengths": ["Modern tech stack", "Clean structure", "Clear project scope"],
                "weaknesses": ["Could include more quantifiable performance metrics"],
                "recommendations": [
                    {"priority": "high", "recommendation": "Add quantifiable impact to project bullets"},
                    {"priority": "medium", "recommendation": "Incorporate container orchestration keywords"},
                ],
                "section_evaluations": {
                    "experience": "Solid trajectory with clear technical focus.",
                    "projects": "Demonstrates hands-on fullstack competency.",
                },
            },
        },
    }

    with patch("backend.services.resume_report_service.get_resume_analysis_by_id", return_value=mock_record):
        pdf_bytes = generate_resume_pdf_report(user_id=USER_A, analysis_id="11111111-1111-4111-8111-111111111111")
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 2000
        # Check standard PDF magic bytes
        assert pdf_bytes.startswith(b"%PDF-")


def test_generate_resume_pdf_report_handles_missing_fields_gracefully():
    """Verify PDF generator does not crash on sparse/minimal analysis payloads."""
    sparse_record = {
        "id": "22222222-2222-4222-8222-222222222222",
        "user_id": USER_A,
        "original_filename": "sparse.pdf",
        "created_at": "2026-11-14T10:00:00Z",
        "overall_score": 50.0,
        "ats_score": None,
        "content_score": None,
        "skills_score": None,
        "structure_score": None,
        "analysis_result": {},
    }

    with patch("backend.services.resume_report_service.get_resume_analysis_by_id", return_value=sparse_record):
        pdf_bytes = generate_resume_pdf_report(user_id=USER_A, analysis_id="22222222-2222-4222-8222-222222222222")
        assert isinstance(pdf_bytes, bytes)
        assert pdf_bytes.startswith(b"%PDF-")


# ===========================================================================
# 6. TENANT ISOLATION & SECURITY TESTS
# ===========================================================================

def test_tenant_isolation_series_detail():
    """Verify User A cannot inspect User B's resume series."""
    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            get_resume_series_detail(user_id=USER_A, series_id=SERIES_ID_A)
        assert exc.value.status_code == 404


def test_tenant_isolation_update_series():
    """Verify User A cannot update User B's resume series."""
    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            update_resume_series(user_id=USER_A, series_id=SERIES_ID_A, title="Hacked")
        assert exc.value.status_code == 404


def test_tenant_isolation_delete_series():
    """Verify User A cannot delete User B's resume series."""
    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.services.resume_series_service.get_supabase", return_value=mock_sb):
        with pytest.raises(HTTPException) as exc:
            delete_resume_series(user_id=USER_A, series_id=SERIES_ID_A)
        assert exc.value.status_code == 404


def test_unauthenticated_token_rejected():
    """Verify missing authentication token is rejected with HTTP 401."""
    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization=None)
    assert exc.value.status_code == 401

    with pytest.raises(HTTPException) as exc:
        get_current_user_id(authorization="Bearer ")
    assert exc.value.status_code == 401

