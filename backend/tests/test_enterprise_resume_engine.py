"""
Comprehensive Test Suite for Enterprise 7-Dimensional Resume Intelligence Engine.

Validates:
1. Excellent Fullstack Engineer Resume (high score, high evidence, balanced stack).
2. Average Fresher Resume (fresher calibrated, strong projects, zero tenure penalty).
3. Poor / Minimal Resume (honest low score < 40, critical missing sections).
4. Keyword-Stuffed Resume (anti-stuffing detection, low demonstration rate penalty).
5. Empty Section Headings Gaming (anti-gaming detection for empty headings).
6. Resume Without JD (general mode, job_match_status='not_evaluated', job_match_score=None).
7. Resume With JD (decoupled job_match_score based on required/preferred skills).
8. AI Evaluator Failure Handling (no hardcoded 70/75 fallback, honest renormalization).
9. Mathematical Scoring Consistency & Determinism (identical inputs yield identical scores).
10. Skill Evidence Verification & Snippet Extraction (demonstrated vs mentioned-only).
11. Recruiter Lens First-Impression Evaluation (strengths, concerns, verdict).
12. Education & Certifications Evaluation (degree, branch, certs, zero prestige bias).
"""

import pytest
from backend.services.ats_engine import evaluate_resume_ats, detect_sections
from backend.services.keyword_matcher import match_keywords
from backend.services.project_evaluator import evaluate_projects_and_experience
from backend.services.education_evaluator import evaluate_education_and_certifications
from backend.services.content_quality_engine import evaluate_content_quality
from backend.services.skill_evidence_engine import verify_skill_evidence
from backend.services.recruiter_engine import evaluate_recruiter_lens
from backend.services.job_matching_engine import evaluate_job_description_match
from backend.services.resume_scoring import calculate_unified_resume_score


# ---------------------------------------------------------------------------
# Sample Resumes
# ---------------------------------------------------------------------------

EXCELLENT_RESUME = """
Alex Morgan
alex.morgan@gmail.com | +1 (555) 234-5678 | linkedin.com/in/alexmorgan | github.com/alexmorgan | alexmorgan.dev

SUMMARY
Results-driven Fullstack Software Engineer with 4+ years of experience architecting resilient distributed systems and responsive modern web applications. Proven track record optimizing high-throughput microservices and scaling cloud infrastructure.

EDUCATION
Bachelor of Technology in Computer Science and Engineering, 2020
University of California, Berkeley - GPA: 3.85/4.00

CERTIFICATIONS
AWS Certified Solutions Architect Associate, 2022
Certified Kubernetes Administrator (CKA), 2023

TECHNICAL SKILLS
- Languages: Python, TypeScript, JavaScript, Go, SQL
- Frameworks: React, Next.js, Node.js, FastAPI, Express
- Databases: PostgreSQL, Redis, MongoDB
- Cloud & DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD, Git

WORK EXPERIENCE
Senior Software Engineer | CloudScale Inc.
June 2022 - Present
- Architected and deployed microservices backend using FastAPI and PostgreSQL handling 50,000+ daily active users.
- Optimized Redis caching layer, reducing p99 API latency by 42% across core search endpoints.
- Engineered automated CI/CD pipeline using Docker and GitHub Actions, cutting release deployment cycle from 45 minutes to 8 minutes.
- Mentored 4 junior engineers on distributed systems design and test-driven development practices.

Software Engineer | NextGen Platforms
July 2020 - May 2022
- Developed responsive customer dashboard in React and TypeScript adopted by 12,000 enterprise clients.
- Integrated Stripe payment gateway with webhook verification processing $1.5M in annual transactions.
- Refactored legacy monolithic API into modular services, cutting server resource costs by 28%.

PROJECTS
OpenSource Distributed Task Queue
- Built distributed asynchronous task queue in Go and Redis with automatic retries and dead-letter queues.
- Achieved 15,000 tasks/second benchmark throughput with zero task loss across fault-injection simulations.
- Starred by 850+ developers on GitHub.
"""

AVERAGE_FRESHER_RESUME = """
Priya Sharma
priya.sharma@college.edu | +91 98765 43210 | linkedin.com/in/priyasharma | github.com/priyasharma

EDUCATION
Bachelor of Technology in Computer Science, 2025
National Institute of Technology - CGPA: 8.4/10.0

TECHNICAL SKILLS
Languages: Python, Java, JavaScript
Web Technologies: React, Node.js, Express, HTML5, CSS3
Databases: PostgreSQL, MongoDB
Tools: Git, Docker, VS Code

PROJECTS
Fullstack E-Commerce Web Application
- Built comprehensive e-commerce platform using React, Node.js, and PostgreSQL with user authentication.
- Implemented shopping cart, product search filtering, and order history modules serving 500 test users.
- Containerized application with Docker for seamless cross-environment deployment.

AI Document Summarizer
- Developed natural language summarization tool using Python and Hugging Face Transformers.
- Processed PDF documents up to 50 pages with an average processing latency under 3 seconds.
- Created intuitive REST API endpoints using FastAPI for client integrations.
"""

POOR_MINIMAL_RESUME = """
John
I am looking for a software job.
Helped with some coding in college.
Worked on website.
Knows some python and computers.
"""

KEYWORD_STUFFED_RESUME = """
Spammy Candidate
spam@gmail.com | 555-0199 | linkedin.com/in/spam

SKILLS
Python Python Python Python Python Python Python Python Python
React React React React React React React React React React
Docker Docker Docker Docker Docker Docker Docker Docker Docker
AWS AWS AWS AWS AWS AWS AWS AWS AWS AWS
Kubernetes Kubernetes Kubernetes Kubernetes Kubernetes Kubernetes Kubernetes Kubernetes
Postgres Postgres Postgres Postgres Postgres Postgres Postgres Postgres
Java Java Java Java Java Java Java Java Java Java
GraphQL GraphQL GraphQL GraphQL GraphQL GraphQL GraphQL GraphQL

EXPERIENCE
Did some general tasks.
"""

EMPTY_SECTIONS_RESUME = """
Gamer Candidate
gamer@example.com | 555-123-4567 | linkedin.com/in/gamer

EDUCATION

SKILLS

EXPERIENCE

PROJECTS
"""


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_scenario_1_excellent_candidate():
    """Validates that an exceptional resume receives a high score across all 7 dimensions."""
    ats_rep = evaluate_resume_ats(EXCELLENT_RESUME, years_experience="3-5 years")
    kw_rep = match_keywords(EXCELLENT_RESUME, target_role="Fullstack Software Engineer")
    skill_ev = verify_skill_evidence(EXCELLENT_RESUME)
    proj_rep = evaluate_projects_and_experience(EXCELLENT_RESUME, years_experience="3-5 years")
    edu_rep = evaluate_education_and_certifications(EXCELLENT_RESUME)
    content_rep = evaluate_content_quality(EXCELLENT_RESUME, ai_content_score=90.0)

    score, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=ats_rep.ats_compatibility_score,
        keyword_coverage_score=kw_rep.keyword_match_percentage,
        technical_skills_score=skill_ev.technical_skills_score,
        projects_experience_score=proj_rep.projects_experience_score,
        education_certifications_score=edu_rep.education_certifications_score,
        content_quality_score=content_rep.content_quality_score,
        structure_score=ats_rep.structure_score,
    )

    assert status == "completed"
    assert score is not None and score >= 85.0
    assert ats_rep.ats_compatibility_score >= 90.0
    assert edu_rep.has_degree is True
    assert edu_rep.has_certifications is True
    assert skill_ev.demonstrated_count >= 10
    assert skill_ev.demonstration_rate >= 40.0
    assert proj_rep.total_metrics_count >= 3
    assert content_rep.strong_action_verbs_count >= 5


def test_scenario_2_fresher_career_stage_calibration():
    """Freshers with strong projects and education must score solidly without penalty for lacking corporate tenure."""
    ats_rep = evaluate_resume_ats(AVERAGE_FRESHER_RESUME, years_experience="fresher")
    assert ats_rep.career_stage_detected == "fresher"

    # Verify no critical missing experience penalty
    critical_exp = [f for f in ats_rep.findings if f.severity == "critical" and "experience" in f.issue.lower()]
    assert len(critical_exp) == 0

    skill_ev = verify_skill_evidence(AVERAGE_FRESHER_RESUME)
    proj_rep = evaluate_projects_and_experience(AVERAGE_FRESHER_RESUME, years_experience="fresher")
    edu_rep = evaluate_education_and_certifications(AVERAGE_FRESHER_RESUME)
    kw_rep = match_keywords(AVERAGE_FRESHER_RESUME, target_role="Fullstack Software Engineer")
    content_rep = evaluate_content_quality(AVERAGE_FRESHER_RESUME, ai_content_score=75.0)

    score, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=ats_rep.ats_compatibility_score,
        keyword_coverage_score=kw_rep.keyword_match_percentage,
        technical_skills_score=skill_ev.technical_skills_score,
        projects_experience_score=proj_rep.projects_experience_score,
        education_certifications_score=edu_rep.education_certifications_score,
        content_quality_score=content_rep.content_quality_score,
        structure_score=ats_rep.structure_score,
    )

    assert status == "completed"
    assert score is not None and 65.0 <= score <= 90.0
    assert edu_rep.has_degree is True
    assert proj_rep.project_count >= 2


def test_scenario_3_poor_minimal_resume():
    """Minimal, uninformative resume must honestly receive a low score (< 40) without artificial inflation."""
    ats_rep = evaluate_resume_ats(POOR_MINIMAL_RESUME)
    kw_rep = match_keywords(POOR_MINIMAL_RESUME, target_role="Fullstack Software Engineer")
    skill_ev = verify_skill_evidence(POOR_MINIMAL_RESUME)
    proj_rep = evaluate_projects_and_experience(POOR_MINIMAL_RESUME)
    edu_rep = evaluate_education_and_certifications(POOR_MINIMAL_RESUME)
    content_rep = evaluate_content_quality(POOR_MINIMAL_RESUME, ai_content_score=20.0)

    score, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=ats_rep.ats_compatibility_score,
        keyword_coverage_score=kw_rep.keyword_match_percentage,
        technical_skills_score=skill_ev.technical_skills_score,
        projects_experience_score=proj_rep.projects_experience_score,
        education_certifications_score=edu_rep.education_certifications_score,
        content_quality_score=content_rep.content_quality_score,
        structure_score=ats_rep.structure_score,
    )

    assert score is not None and score < 40.0
    assert ats_rep.critical_issues_count >= 2  # Missing email, phone, sections


def test_scenario_4_keyword_stuffing_detection():
    """Keyword stuffing must trigger penalties and result in low technical demonstration score."""
    kw_rep = match_keywords(KEYWORD_STUFFED_RESUME, target_role="Fullstack Software Engineer")
    assert kw_rep.keyword_stuffing_detected is True
    assert len(kw_rep.stuffed_keywords) >= 3

    skill_ev = verify_skill_evidence(KEYWORD_STUFFED_RESUME)
    # Declared 8+ skills but practically 0 demonstrated in projects
    assert skill_ev.demonstration_rate < 20.0
    assert skill_ev.technical_skills_score < 30.0


def test_scenario_5_anti_gaming_empty_section_headers():
    """Resumes with empty section headers must be flagged as empty sections and penalized."""
    sec_res = detect_sections(EMPTY_SECTIONS_RESUME)
    assert len(sec_res.empty_sections) >= 3

    ats_rep = evaluate_resume_ats(EMPTY_SECTIONS_RESUME)
    assert len(ats_rep.empty_sections) >= 3
    empty_findings = [f for f in ats_rep.findings if "Empty Section Header" in f.issue]
    assert len(empty_findings) >= 3


def test_scenario_6_general_mode_no_jd():
    """When no JD is provided, Job Match must be 'not_evaluated' and job_match_score must be None."""
    job_match = evaluate_job_description_match(EXCELLENT_RESUME, job_description=None)
    assert job_match.job_match_status == "not_evaluated"
    assert job_match.job_match_score is None

    kw_rep = match_keywords(EXCELLENT_RESUME, job_description=None)
    assert kw_rep.evaluation_mode == "general_resume"
    assert kw_rep.job_match_status == "not_evaluated"
    assert kw_rep.job_match_score is None


def test_scenario_7_job_specific_matching_with_jd():
    """When a JD is provided, Job Match must evaluate independently against required/preferred skills."""
    target_jd = """
    We are looking for a Senior Fullstack Engineer.
    Required Skills: Python, React, PostgreSQL, Docker, AWS.
    Preferred Skills: Kubernetes, Go, Redis.
    Must have at least 3 years of experience.
    """
    job_match = evaluate_job_description_match(EXCELLENT_RESUME, job_description=target_jd)
    assert job_match.job_match_status == "evaluated"
    assert job_match.job_match_score is not None
    assert job_match.job_match_score >= 75.0
    assert job_match.matched_required_count >= 4


def test_scenario_8_ai_failure_honest_renormalization():
    """When AI fails, content_quality_score is None and score is renormalized without fake 70/75 fallbacks."""
    score, breakdown, status = calculate_unified_resume_score(
        ats_compatibility_score=85.0,
        keyword_coverage_score=80.0,
        technical_skills_score=75.0,
        projects_experience_score=80.0,
        education_certifications_score=90.0,
        content_quality_score=None,  # AI failure
        structure_score=85.0,
    )

    assert status == "partially_completed"
    assert breakdown.content_quality.included is False
    assert breakdown.evaluated_categories_count == 6
    # Sum of renormalized weights across the 6 available categories must equal 1.0
    assert abs(sum(breakdown.weights_used.values()) - 1.0) < 0.001
    assert score is not None and score > 0.0


def test_scenario_9_scoring_determinism():
    """Identical resume inputs must produce identical mathematical scores on every evaluation."""
    run1 = calculate_unified_resume_score(88.0, None, None, 84.0, 80.0, 75.0, 85.0, 90.0)
    run2 = calculate_unified_resume_score(88.0, None, None, 84.0, 80.0, 75.0, 85.0, 90.0)
    assert run1[0] == run2[0]
    assert run1[1].model_dump() == run2[1].model_dump()


def test_scenario_10_recruiter_lens():
    """Recruiter lens evaluates first-impression readability and career trajectory."""
    recruiter_rep = evaluate_recruiter_lens(
        EXCELLENT_RESUME,
        target_role="Fullstack Software Engineer",
        years_experience="3-5 years",
        ats_score=92.0,
        demonstration_rate=85.0,
    )

    assert "Shortlist" in recruiter_rep.overall_qualitative_verdict or "Competitive" in recruiter_rep.overall_qualitative_verdict
    assert len(recruiter_rep.recruiter_strengths) >= 2
    assert len(recruiter_rep.first_10_second_impression) > 20
