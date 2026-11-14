"""
backend/tests/test_phase5_resume_builder.py
Phase 5: Automated Test Suite for AI Resume Builder & Job-Specific Optimization.

Covers:
1. Builder Document CRUD & Tenant Isolation
2. Import Analyzed Resume into Builder
3. Structured Resume Serialization to ATS Plain Text
4. AI Content Assistant & Strict Anti-Hallucination Guardrails
5. Writing Quality Feedback Audit
6. Job Description Extraction, Keyword Coverage & Grounded Alignment
7. High-Quality Vector PDF Export (ReportLab)
8. High-Quality Word DOCX Export (python-docx)
9. Version Management Integration with Deterministic ATS Scoring
"""

import io
import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from backend.services.resume_builder_service import (
    serialize_resume_data_to_text,
    create_builder_document,
    get_builder_document,
    list_user_builder_documents,
    update_builder_document,
    delete_builder_document,
    import_resume_from_analysis,
    save_builder_version,
    list_builder_versions,
    _MOCK_DOCUMENTS,
    _MOCK_VERSIONS,
)
from backend.services.resume_ai_writer_service import (
    validate_anti_hallucination,
    improve_bullet_point,
    improve_summary,
    improve_project_description,
    analyze_writing_feedback,
)
from backend.services.job_optimizer_service import (
    extract_job_description_requirements,
    analyze_resume_job_alignment,
    generate_grounded_job_suggestions,
    create_job_optimization_session,
    get_job_optimization_session,
    _MOCK_OPTIMIZATION_SESSIONS,
)
from backend.services.resume_docx_service import generate_resume_docx
from backend.services.resume_pdf_service import generate_resume_pdf

USER_A = "11111111-1111-4111-a111-111111111111"
USER_B = "22222222-2222-4222-b222-222222222222"
DOC_ID_A = "55555555-5555-4555-a555-555555555555"

SAMPLE_RESUME_DATA = {
    "fullName": "Aadithya Goud",
    "role": "Fullstack Software Engineer",
    "email": "aadithya@example.com",
    "phone": "+91 98765 43210",
    "location": "Hyderabad, India",
    "linkedin": "linkedin.com/in/aadithya",
    "github": "github.com/aadithya",
    "summary": "Fullstack software engineer with 3+ years experience building scalable web apps with FastAPI and React.",
    "education": [
        {
            "institution": "IIIT Hyderabad",
            "degree": "B.Tech",
            "fieldOfStudy": "Computer Science",
            "location": "Hyderabad",
            "startDate": "2020",
            "endDate": "2024",
            "gpa": "9.1",
        }
    ],
    "experience": [
        {
            "company": "TechNova Corp",
            "role": "Software Engineer",
            "location": "Bangalore",
            "startDate": "Jan 2024",
            "endDate": "Present",
            "bullets": [
                "Architected high-throughput REST APIs handling 10,000 requests per minute.",
                "Optimized PostgreSQL queries, decreasing database latency by 35%.",
            ],
        }
    ],
    "projects": [
        {
            "name": "SkillsCatalyst AI Suite",
            "tech": "FastAPI, React, PostgreSQL",
            "bullets": [
                "Built an automated ATS resume builder and evaluator.",
            ],
        }
    ],
    "skills": {
        "languages": "Python, TypeScript, SQL, Go",
        "frameworks": "FastAPI, React, Next.js, Django",
        "databases": "PostgreSQL, Redis, Supabase",
        "tools": "Docker, Git, Linux, Postman",
        "cloudDevOps": "AWS, Docker, CI/CD",
        "softSkills": "Problem Solving, Agile, Leadership",
    },
    "certifications": [
        {
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "date": "2024",
        }
    ],
    "achievements": [
        {
            "title": "Smart India Hackathon Finalist",
            "description": "Top 10 out of 500 teams nationwide.",
            "date": "2023",
        }
    ],
    "spokenLanguages": [
        {"name": "English", "proficiency": "Fluent"},
        {"name": "Telugu", "proficiency": "Native"},
    ],
}


# ===========================================================================
# 1. BUILDER DOCUMENT CRUD & TENANT ISOLATION
# ===========================================================================

def test_create_and_get_builder_document():
    """Verify document creation and retrieval with proper ownership."""
    # Ensure memory store is clean
    _MOCK_DOCUMENTS.clear()

    doc = create_builder_document(
        user_id=USER_A,
        title="My Primary Tech Resume",
        selected_template="sb2nov",
        structured_resume_data=SAMPLE_RESUME_DATA,
        target_role="Fullstack Software Engineer",
    )

    assert doc["id"] is not None
    assert doc["title"] == "My Primary Tech Resume"
    assert doc["selected_template"] == "sb2nov"
    assert doc["structured_resume_data"]["fullName"] == "Aadithya Goud"

    # User A retrieves document successfully
    retrieved = get_builder_document(doc["id"], user_id=USER_A)
    assert retrieved["id"] == doc["id"]
    assert retrieved["user_id"] == USER_A


def test_builder_document_tenant_isolation():
    """Verify User B cannot access or delete User A's resume document."""
    _MOCK_DOCUMENTS.clear()

    doc = create_builder_document(
        user_id=USER_A,
        title="Confidential Resume",
        selected_template="simple-classic",
        structured_resume_data=SAMPLE_RESUME_DATA,
    )

    # User B attempts to access doc
    retrieved = get_builder_document(doc["id"], user_id=USER_B)
    assert retrieved is None

    # User B attempts to update doc
    updated = update_builder_document(doc["id"], user_id=USER_B, title="Hacked Title")
    assert updated is None

    # User B attempts to delete doc
    deleted = delete_builder_document(doc["id"], user_id=USER_B)
    assert deleted is False


def test_update_and_delete_builder_document():
    """Verify document updating and safe deletion."""
    _MOCK_DOCUMENTS.clear()

    doc = create_builder_document(
        user_id=USER_A,
        title="Draft v1",
        selected_template="modern-cv",
        structured_resume_data=SAMPLE_RESUME_DATA,
    )

    updated = update_builder_document(
        doc["id"],
        user_id=USER_A,
        title="Draft v2 - Optimized",
        selected_template="academic",
    )
    assert updated["title"] == "Draft v2 - Optimized"
    assert updated["selected_template"] == "academic"

    # Delete
    res = delete_builder_document(doc["id"], user_id=USER_A)
    assert res is True

    # Confirm deletion
    deleted_check = get_builder_document(doc["id"], user_id=USER_A)
    assert deleted_check is None


# ===========================================================================
# 2. IMPORT ANALYZED RESUME INTO BUILDER
# ===========================================================================

def test_import_resume_from_analysis():
    """Verify importing past analysis record translates structured sections into resume data."""
    _MOCK_DOCUMENTS.clear()

    analysis_record = {
        "id": "analysis-123",
        "file_name": "adithya_cv_final.pdf",
        "target_role": "Backend Engineer",
        "contact_info": {
            "name": "Aadithya Goud",
            "email": "aadithya@example.com",
            "phone": "+91 99999 88888",
            "location": "Hyderabad",
            "linkedin": "linkedin.com/in/aadithya",
        },
        "experience": [
            {
                "company": "CloudTech",
                "role": "Backend Developer",
                "dates": "2023 - 2024",
                "bullets": ["Maintained distributed message queues with RabbitMQ."],
            }
        ],
        "education": [
            {
                "institution": "IIIT Hyderabad",
                "degree": "B.Tech Computer Science",
                "dates": "2020 - 2024",
            }
        ],
        "projects": [
            {
                "title": "Scalable Cache System",
                "tech_stack": "Python, Redis",
                "bullets": ["Implemented LRU cache with sub-millisecond retrieval."],
            }
        ],
        "skills": {
            "programming_languages": ["Python", "Go", "SQL"],
            "frameworks": ["FastAPI", "Docker"],
        },
    }

    doc = import_resume_from_analysis(analysis_record, user_id=USER_A, selected_template="sb2nov")

    assert doc["id"] is not None
    assert doc["selected_template"] == "sb2nov"
    data = doc["structured_resume_data"]
    assert data["fullName"] == "Aadithya Goud"
    assert data["email"] == "aadithya@example.com"
    assert len(data["experience"]) == 1
    assert data["experience"][0]["company"] == "CloudTech"
    assert len(data["education"]) == 1
    assert "Python" in data["skills"]["languages"]


# ===========================================================================
# 3. STRUCTURED RESUME SERIALIZATION TO ATS PLAIN TEXT
# ===========================================================================

def test_serialize_resume_data_to_text():
    """Verify plain text serialization captures all headings and contents for ATS scanning."""
    text = serialize_resume_data_to_text(SAMPLE_RESUME_DATA)

    assert "AADITHYA GOUD" in text
    assert "Fullstack Software Engineer" in text
    assert "aadithya@example.com" in text
    assert "PROFESSIONAL SUMMARY" in text
    assert "WORK EXPERIENCE" in text
    assert "TechNova Corp" in text
    assert "EDUCATION" in text
    assert "IIIT Hyderabad" in text
    assert "PROJECTS" in text
    assert "SkillsCatalyst AI Suite" in text
    assert "TECHNICAL SKILLS" in text
    assert "Python, TypeScript" in text
    assert "CERTIFICATIONS" in text
    assert "AWS Certified Solutions Architect" in text


# ===========================================================================
# 4. AI CONTENT ASSISTANT & ANTI-HALLUCINATION SAFEGUARDS
# ===========================================================================

def test_anti_hallucination_validation_allows_grounded_rewrites():
    """Anti-hallucination check passes when rewrites do not inject fabricated metrics."""
    original = "Optimized database queries and lowered response latency."
    improved = "Engineered optimized database indexing and refined query execution, lowering overall response latency."

    is_valid = validate_anti_hallucination(original, improved)
    assert is_valid is True


def test_anti_hallucination_validation_blocks_fabricated_numbers():
    """Anti-hallucination check catches fabricated revenue, percentages, or team sizes."""
    original = "Built internal dashboard for marketing team."
    hallucinated = "Built internal dashboard generating $500,000 revenue and boosting efficiency by 75% across 40 engineers."

    is_valid = validate_anti_hallucination(original, hallucinated)
    assert is_valid is False


def test_improve_bullet_point_actions():
    """Verify all 4 bullet improvement actions return non-empty suggestions."""
    bullet = "Worked on fixing bugs and improving the website performance."

    for action in ["improve", "concise", "strong_verbs", "technical_clarity"]:
        res = improve_bullet_point(bullet, action=action, role_context="Frontend Engineer")
        assert "suggestions" in res
        assert len(res["suggestions"]) >= 1
        assert "improvement_reason" in res


def test_improve_summary_and_project():
    """Verify summary and project enhancement services return grounded, elevated descriptions."""
    summary_res = improve_summary(
        "Software engineer doing backend work.",
        target_role="Senior Backend Engineer",
        experience_level="Mid",
    )
    assert "suggestions" in summary_res
    assert len(summary_res["suggestions"]) >= 1

    project_res = improve_project_description(
        project_name="E-Commerce API",
        original_description="Made an API for shopping cart.",
        technologies="FastAPI, PostgreSQL, Redis",
    )
    assert "suggestions" in project_res
    assert len(project_res["suggestions"]) >= 1


# ===========================================================================
# 5. WRITING QUALITY FEEDBACK AUDIT
# ===========================================================================

def test_analyze_writing_feedback_detects_weakness():
    """Verify writing feedback identifies weak verbs, passive voice, and missing impact metrics."""
    text_with_weakness = (
        "I was responsible for helping with backend features. "
        "A system was created by the team. "
        "Worked on various tasks."
    )

    feedback = analyze_writing_feedback(text_with_weakness)
    assert len(feedback["weak_points"]) > 0
    assert len(feedback["actionable_opportunities"]) > 0
    assert feedback["quality_rating"] in ["Needs Improvement", "Strong"]


# ===========================================================================
# 6. JOB-SPECIFIC OPTIMIZATION & KEYWORD ALIGNMENT
# ===========================================================================

SAMPLE_JD = """
Job Title: Senior Fullstack Engineer
Company: CloudScale Systems
Requirements:
- 3+ years experience with Python, FastAPI, and React.
- Strong knowledge of PostgreSQL, Redis, and Docker.
- Experience with Kubernetes and Microservices is a plus.
- Excellent communication and problem-solving skills.
Responsibilities:
- Build reliable REST APIs and distributed backend workflows.
- Collaborate with frontend engineers to deliver intuitive interfaces.
"""

def test_extract_job_description_requirements():
    """Verify extraction of core skills, experience level, and responsibilities from JD."""
    reqs = extract_job_description_requirements(SAMPLE_JD)

    assert "required_skills" in reqs
    assert "preferred_skills" in reqs
    assert "Python" in reqs["required_skills"] or "FastAPI" in reqs["required_skills"]
    assert "experience_requirements" in reqs


def test_analyze_resume_job_alignment():
    """Verify keyword alignment matches candidate skills against job requirements."""
    jd_reqs = extract_job_description_requirements(SAMPLE_JD)
    alignment = analyze_resume_job_alignment(SAMPLE_RESUME_DATA, jd_reqs, SAMPLE_JD)

    assert "keyword_match_percentage" in alignment
    assert alignment["keyword_match_percentage"] > 40  # Candidate has Python, FastAPI, React, Docker, Redis
    assert "matched_skills" in alignment
    assert len(alignment["matched_skills"]) > 0
    assert "missing_skills" in alignment


def test_generate_grounded_job_suggestions():
    """Verify grounded suggestions advise reordering skills and tailoring summary without hallucinating unheld skills."""
    jd_reqs = extract_job_description_requirements(SAMPLE_JD)
    alignment = analyze_resume_job_alignment(SAMPLE_RESUME_DATA, jd_reqs, SAMPLE_JD)
    suggestions = generate_grounded_job_suggestions(SAMPLE_RESUME_DATA, jd_reqs, alignment)

    assert len(suggestions) >= 1
    # Verify suggestions have section, reason, and suggested_content
    for sug in suggestions:
        assert "section" in sug
        assert "reason" in sug
        assert "suggested_content" in sug


def test_job_optimization_session_flow():
    """Verify creating and retrieving full job optimization session."""
    _MOCK_OPTIMIZATION_SESSIONS.clear()

    sess = create_job_optimization_session(
        user_id=USER_A,
        job_title="Senior Fullstack Engineer",
        company_name="CloudScale Systems",
        job_description=SAMPLE_JD,
        resume_data=SAMPLE_RESUME_DATA,
    )

    assert sess["id"] is not None
    assert sess["match_percentage"] > 0
    assert len(sess["recommendations"]) > 0

    retrieved = get_job_optimization_session(sess["id"], user_id=USER_A)
    assert retrieved["id"] == sess["id"]
    assert retrieved["company_name"] == "CloudScale Systems"

    # Tenant check: User B cannot view User A's session
    retrieved_b = get_job_optimization_session(sess["id"], user_id=USER_B)
    assert retrieved_b is None


# ===========================================================================
# 7. HIGH-QUALITY VECTOR PDF EXPORT (ReportLab)
# ===========================================================================

def test_generate_resume_pdf_vector_output():
    """Verify ReportLab PDF generation outputs valid vector PDF binary stream."""
    for template in ["simple-classic", "sb2nov", "modern-cv", "academic", "ultra-minimal"]:
        buf = generate_resume_pdf(SAMPLE_RESUME_DATA, template_id=template)
        pdf_bytes = buf.getvalue()
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 500
        # Valid PDF files start with %PDF
        assert pdf_bytes.startswith(b"%PDF-")


# ===========================================================================
# 8. HIGH-QUALITY WORD DOCX EXPORT (python-docx)
# ===========================================================================

def test_generate_resume_docx_valid_zip_output():
    """Verify python-docx generation outputs valid Office Open XML ZIP binary stream."""
    for template in ["simple-classic", "sb2nov", "modern-cv", "academic"]:
        buf = generate_resume_docx(SAMPLE_RESUME_DATA, template_id=template)
        docx_bytes = buf.getvalue()
        assert isinstance(docx_bytes, bytes)
        assert len(docx_bytes) > 2000
        # Valid DOCX files start with PK (ZIP magic header)
        assert docx_bytes.startswith(b"PK")


# ===========================================================================
# 9. VERSION MANAGEMENT INTEGRATION & DETERMINISTIC ATS AUDIT
# ===========================================================================

def test_save_builder_version_with_ats_audit():
    """Verify saving version snapshots triggers deterministic ATS engine and monotonic versioning."""
    _MOCK_DOCUMENTS.clear()
    _MOCK_VERSIONS.clear()

    doc = create_builder_document(
        user_id=USER_A,
        title="Versioned Document",
        selected_template="sb2nov",
        structured_resume_data=SAMPLE_RESUME_DATA,
        target_role="Fullstack Software Engineer",
    )

    # Save Version 1
    v1 = save_builder_version(
        document_id=doc["id"],
        user_id=USER_A,
        change_summary="Initial version from scratch",
        run_ats_eval=True,
    )

    assert v1["version_number"] == 1
    assert v1["document_id"] == doc["id"]
    assert v1["ats_score"] is not None
    assert 0 <= v1["ats_score"] <= 100
    assert v1["evaluation_data"] is not None

    # Save Version 2
    v2 = save_builder_version(
        document_id=doc["id"],
        user_id=USER_A,
        change_summary="Refined achievements and added keywords",
        run_ats_eval=True,
    )

    assert v2["version_number"] == 2
    assert v2["ats_score"] is not None

    # List versions
    versions = list_builder_versions(doc["id"], user_id=USER_A)
    assert len(versions) == 2
    assert versions[0]["version_number"] == 2
    assert versions[1]["version_number"] == 1
