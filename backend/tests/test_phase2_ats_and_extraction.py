import pytest
import io
from unittest.mock import MagicMock, patch

from backend.services.resume_extractor import (
    extract_document,
    calculate_extraction_quality,
    parse_and_clean_document,
)
from backend.services.ats_engine import (
    evaluate_resume_ats,
    extract_contact_info,
    detect_sections,
    analyze_structure_and_symbols,
    SECTION_TAXONOMY,
)
from backend.services.keyword_matcher import (
    match_keywords,
    extract_keywords_from_jd,
    normalize_skill,
    CANONICAL_KEYWORDS,
)
from backend.services.resume_ai_evaluator import (
    determine_career_stage,
    build_evaluation_prompts,
    parse_structured_evaluation,
)
from backend.services.resume_scoring import (
    calculate_unified_resume_score,
    validate_score,
)


# ===========================================================================
# 1. ADVANCED RESUME EXTRACTION TESTS
# ===========================================================================

def test_extraction_quality_score_calculation():
    """Verify that extraction quality accurately penalizes low density, missing words, and non-printable noise."""
    high_quality_text = "John Doe\nSoftware Engineer\njohn.doe@example.com\n" + ("Developed cloud microservices using Python and Docker. " * 30)
    score_high = calculate_extraction_quality(high_quality_text, is_scanned=False, warnings=[])
    assert score_high >= 85.0, f"Expected high quality score >= 85, got {score_high}"

    # Empty or near-empty text
    score_empty = calculate_extraction_quality("", is_scanned=False, warnings=[])
    assert score_empty == 0.0

    # Scanned document penalty
    score_scanned = calculate_extraction_quality("Short text.", is_scanned=True, warnings=["Scanned image"])
    assert score_scanned <= 25.0


def test_plain_text_document_extraction():
    """Verify that plain text resumes extract cleanly with 1 column and 100% text fidelity."""
    sample_text = (
        "Adithya Palamoor\n"
        "Email: adithya@example.com | Phone: +1 555 123 4567 | Location: New York, NY\n"
        "LinkedIn: https://linkedin.com/in/adithyap | GitHub: https://github.com/adithyap\n\n"
        "PROFESSIONAL SUMMARY\n"
        "Full-stack engineer with 4 years of experience building distributed systems.\n\n"
        "TECHNICAL SKILLS\n"
        "Languages: Python, TypeScript, Go\n"
        "Frameworks: FastAPI, React, Node.js\n"
        "Databases: PostgreSQL, Redis, MongoDB\n\n"
        "WORK EXPERIENCE\n"
        "Software Engineer at Acme Corp (2022 - Present)\n"
        "- Scaled REST APIs handling 45,000 requests per minute with FastAPI and Redis caching.\n"
        "- Migrated monolithic database to PostgreSQL clusters, reducing query p99 latency by 38%.\n\n"
        "EDUCATION\n"
        "B.S. in Computer Science, Tech University, 2021\n"
    )

    content_bytes = sample_text.encode("utf-8")
    report = extract_document(content_bytes, "adithya_resume.txt")

    assert report.filename == "adithya_resume.txt"
    assert report.file_type == "txt"
    assert not report.is_scanned
    assert report.detected_columns == 1
    assert report.char_count == len(sample_text.strip())
    assert "Acme Corp" in report.extracted_text


# ===========================================================================
# 2. DETERMINISTIC ATS ENGINE TESTS
# ===========================================================================

def test_ats_contact_info_extraction():
    """Verify extraction of email, phone, LinkedIn, GitHub, and portfolio URLs."""
    raw_header = (
        "Alice Smith\n"
        "Contact: alice.smith@cs.stanford.edu | (415) 555-0199\n"
        "LinkedIn: linkedin.com/in/alicesmith-dev\n"
        "GitHub: github.com/alicesmith\n"
        "Portfolio: https://alicesmith.dev\n"
        "San Francisco, CA\n"
    )
    contact = extract_contact_info(raw_header)
    assert contact.has_email is True
    assert contact.email == "alice.smith@cs.stanford.edu"
    assert contact.has_phone is True
    assert contact.has_linkedin is True
    assert contact.has_github is True
    assert contact.has_portfolio is True
    assert len(contact.missing_critical) == 0


def test_ats_missing_email_critical_penalty():
    """Resumes missing an email address must receive a critical ATS finding and score deduction."""
    resume_no_email = (
        "Bob Builder\n"
        "Phone: 555-0123\n"
        "EXPERIENCE\n"
        "Constructed civil projects with over 150 team members across 12 infrastructure sites.\n"
        "- Managed $4.5M civil engineering budget and delivered 100% on schedule.\n"
        "- Reduced project safety incidents by 65% through daily protocol audits.\n"
        "- Coordinated engineering workflows between architectural staff and contractors.\n"
        "EDUCATION\n"
        "B.Eng Civil Engineering, 2019\n"
    )
    report = evaluate_resume_ats(resume_no_email, years_experience="2 years")
    critical_issues = [f for f in report.findings if f.severity == "critical"]
    assert any("email" in f.issue.lower() for f in critical_issues)
    assert report.ats_compatibility_score < 85.0


def test_ats_fresher_career_stage_calibration():
    """
    Freshers/students who have PROJECTS and EDUCATION must NOT be penalized
    for having no corporate 'Work Experience' section.
    """
    fresher_resume = (
        "Jane Doe\n"
        "jane@college.edu | (555) 000-1111 | linkedin.com/in/janedoe | github.com/janedoe\n\n"
        "EDUCATION\n"
        "Bachelor of Technology in Computer Science and Engineering, 2024\n"
        "National Institute of Technology | CGPA: 8.9 / 10.0\n"
        "Relevant Coursework: Data Structures, Operating Systems, Computer Networks, Database Management Systems\n\n"
        "TECHNICAL SKILLS\n"
        "Languages: Python, TypeScript, Java, SQL\n"
        "Frameworks & Libraries: React, Next.js, Node.js, FastAPI, Tailwind CSS\n"
        "Databases & Tools: PostgreSQL, Redis, MongoDB, Git, Docker, Linux\n\n"
        "ACADEMIC & PERSONAL PROJECTS\n"
        "AI Career Accelerator Web Application (Next.js, FastAPI, PostgreSQL)\n"
        "- Designed and deployed a full-stack career preparation platform serving 1,200+ active student users.\n"
        "- Engineered an automated ATS resume scoring engine that parsed PDF documents and validated keyword alignment.\n"
        "- Integrated vector database caching using Redis, reducing semantic search latency by 45%.\n"
        "- Implemented secure JWT-based authentication and role-based access control policies across all API endpoints.\n\n"
        "Distributed Task Queue System (Python, Redis, Docker)\n"
        "- Implemented asynchronous message broker supporting 5,000 tasks per second with exponential backoff retries.\n"
        "- Built comprehensive test suite achieving 92% code coverage across unit and integration tests.\n"
    )
    report = evaluate_resume_ats(fresher_resume, years_experience="fresher")
    assert report.career_stage_detected == "fresher"
    # Should not have a critical penalty for missing experience because projects are present
    critical_for_exp = [f for f in report.findings if f.severity == "critical" and "experience" in f.issue.lower()]
    assert len(critical_for_exp) == 0
    assert report.ats_compatibility_score >= 80.0


def test_ats_unusual_symbols_detection():
    """Verify that fancy non-ATS symbols (e.g. stars, emojis, icons) trigger an ATS warning."""
    fancy_resume = (
        "John Developer\n"
        "john@example.com | 555-1234\n"
        "SKILLS\n"
        "★ Python ★ JavaScript ★ C++\n"
        "🚀 Cloud Architecture & DevOps 🚀\n"
        "EXPERIENCE\n"
        "Built software.\n"
        "EDUCATION\n"
        "B.S. CS\n"
    )
    struct_info = analyze_structure_and_symbols(fancy_resume)
    assert len(struct_info["unusual_symbols"]) > 0

    report = evaluate_resume_ats(fancy_resume)
    assert any("symbol" in f.issue.lower() or "emoji" in f.issue.lower() for f in report.findings)


# ===========================================================================
# 3. DETERMINISTIC KEYWORD MATCHER TESTS
# ===========================================================================

def test_keyword_matcher_exact_and_alias():
    """Verify matching with technology aliases: 'ReactJS' -> 'React', 'Postgres' -> 'PostgreSQL'."""
    resume_text = (
        "I am a developer with experience in ReactJS, Postgres, and k8s. "
        "Also built backend microservices using Python and deployed workloads to AWS."
    )
    report = match_keywords(resume_text, target_role="Fullstack Software Engineer")

    matched_names = {k.name for k in report.matched}
    assert "React" in matched_names
    assert "PostgreSQL" in matched_names
    assert "Kubernetes" in matched_names
    assert "Python" in matched_names
    assert "AWS" in matched_names
    assert report.matched_keywords_count >= 5
    assert report.keyword_match_percentage > 0


def test_keyword_matcher_word_boundaries():
    """Ensure short keywords like 'Go', 'R', or 'C' don't trigger false positives inside normal words."""
    bogus_text = (
        "I have good communication skills and organize files by category. "
        "Always striving to make things better."
    )
    report = match_keywords(bogus_text, target_role="Backend Developer")
    matched_names = {k.name for k in report.matched}
    assert "Go" not in matched_names
    assert "C" not in matched_names


def test_keyword_matcher_custom_job_description():
    """When a JD is provided, match keywords directly extracted from the JD."""
    jd = (
        "We are looking for a Senior DevOps Engineer with deep expertise in "
        "Terraform, Kubernetes, Prometheus, Grafana, and Ansible."
    )
    resume = (
        "DevOps specialist skilled in Terraform, Kubernetes, and Docker. "
        "Built monitoring solutions with Prometheus."
    )
    report = match_keywords(resume, job_description=jd)

    matched_names = {k.name for k in report.matched}
    missing_names = {k.name for k in report.missing}

    assert "Terraform" in matched_names
    assert "Kubernetes" in matched_names
    assert "Prometheus" in matched_names
    assert "Grafana" in missing_names
    assert "Ansible" in missing_names
    assert report.keyword_match_percentage == pytest.approx(60.0, abs=1.0)


# ===========================================================================
# 4. STRUCTURED AI EVALUATOR PROMPTS & PARSING
# ===========================================================================

def test_determine_career_stage():
    """Verify calibration detection between freshers, students, and experienced engineers."""
    assert determine_career_stage("0 years", "") == "fresher"
    assert determine_career_stage("Fresher / Entry Level", "") == "fresher"
    assert determine_career_stage("1-3 years", "Currently a 4th year student") == "fresher"
    assert determine_career_stage("5+ years", "Senior Lead Architect") == "experienced"


def test_parse_structured_evaluation_json():
    """Verify resilient parsing of AI JSON output into AIEvaluationReport."""
    ai_raw_json = """
    ```json
    {
      "career_stage": "experienced",
      "summary_verdict": "Solid engineering foundation with measurable impact.",
      "content_quality_score": 84,
      "fresher_potential_score": null,
      "missing_measurable_results": [
        "Database migration bullet lacks percentage latency improvement."
      ],
      "weak_bullet_points": [
        "Responsible for handling customer issues."
      ],
      "rewritten_bullets": [
        {
          "original": "Responsible for handling customer issues.",
          "improved": "Resolved 120+ high-priority customer escalations per month, achieving a 98.4% CSAT rating.",
          "reason": "Quantifies volume, SLA impact, and customer satisfaction metrics.",
          "metrics_added": ["120+ escalations", "98.4% CSAT"]
        }
      ],
      "improvements": [
        {
          "priority": "high",
          "section": "Experience",
          "issue": "Missing quantifiable outcome on second job bullet",
          "action": "Add throughput or revenue impact to project delivery bullet."
        }
      ],
      "anti_hallucination_verified": true
    }
    ```
    """
    report = parse_structured_evaluation(ai_raw_json, career_stage="experienced")
    assert report.content_quality_score == 84.0
    assert report.career_stage == "experienced"
    assert len(report.rewritten_bullets) == 1
    assert report.rewritten_bullets[0].metrics_added == ["120+ escalations", "98.4% CSAT"]
    assert report.anti_hallucination_verified is True


# ===========================================================================
# 5. UNIFIED SCORING & DYNAMIC WEIGHT RENORMALIZATION
# ===========================================================================

def test_unified_scoring_complete_weights():
    """
    Standard complete evaluation:
    Weights: 25% ATS, 30% Content, 25% Skills, 20% Structure
    Calculation: 0.25*80 + 0.30*70 + 0.25*90 + 0.20*85
               = 20.0 + 21.0 + 22.5 + 17.0 = 80.5
    """
    overall, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=80.0,
        content_quality_score=70.0,
        skills_match_score=90.0,
        structure_score=85.0,
    )
    assert overall == 80.5
    assert status == "completed"
    assert breakdown.overall_score == 80.5
    assert breakdown.weights_used["ats_compatibility"] == 0.25
    assert breakdown.weights_used["content_quality"] == 0.30
    assert breakdown.weights_used["skills_match"] == 0.25
    assert breakdown.weights_used["structure"] == 0.20
    assert breakdown.content_quality.raw_score == 70.0
    assert breakdown.content_quality.included is True


def test_unified_scoring_dynamic_weight_renormalization():
    """
    When content_quality_score is None (e.g. AI provider outage or qualitative-only mode),
    remaining components must be dynamically renormalized to sum to 1.0 (100%).
    Available weights: ATS (0.25), Skills (0.25), Structure (0.20). Sum = 0.70.
    Renormalized weights:
      ATS: 0.25 / 0.70 = 0.35714
      Skills: 0.25 / 0.70 = 0.35714
      Structure: 0.20 / 0.70 = 0.28571
    Scores: ATS=90, Skills=80, Structure=80
    Overall: 90*(25/70) + 80*(25/70) + 80*(20/70) = 83.57
    """
    overall, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=90.0,
        content_quality_score=None,
        skills_match_score=80.0,
        structure_score=80.0,
    )
    assert overall is not None
    assert overall == pytest.approx(83.57, abs=0.1)
    assert status == "partially_completed"
    assert breakdown.content_quality.included is False
    assert breakdown.ats_compatibility.included is True
    # Ensure weights sum to 1.0
    total_wt = sum(breakdown.weights_used.values())
    assert total_wt == pytest.approx(1.0, abs=0.01)


def test_unified_scoring_all_none_returns_none():
    """If no category could be scored, overall score must be None and status 'failed'."""
    overall, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=None,
        content_quality_score=None,
        skills_match_score=None,
        structure_score=None,
    )
    assert overall is None
    assert status == "failed"
    assert breakdown.overall_score is None
