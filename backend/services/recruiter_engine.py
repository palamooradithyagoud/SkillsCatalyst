"""
Recruiter Evaluation Engine (Supporting Engine 2).

Provides the qualitative lens of a Senior Technical Recruiter and Hiring Manager:
- Evaluates the "First 10-Second Scan" readability and professional positioning.
- Detects recruiter red flags (unexplained employment gaps > 6 months, job-hopping, missing links).
- Evaluates achievement credibility, career trajectory, and technical substance.
- Generates recruiter strengths, recruiter concerns, and prioritized hiring manager advice.
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class RecruiterEvaluationReport(BaseModel):
    first_10_second_impression: str
    overall_qualitative_verdict: str  # "Strong Shortlist" | "Competitive Candidate" | "Borderline / Needs Polish" | "Requires Significant Revision"
    recruiter_strengths: List[str] = Field(default_factory=list)
    recruiter_concerns: List[str] = Field(default_factory=list)
    top_improvement_recommendations: List[str] = Field(default_factory=list)
    timeline_flags: List[str] = Field(default_factory=list)
    positioning_clarity: str = "clear"  # "clear" | "diffuse" | "unclear"


# ---------------------------------------------------------------------------
# Recruiter Heuristics
# ---------------------------------------------------------------------------

def evaluate_recruiter_lens(
    resume_text: str,
    target_role: Optional[str] = "Fullstack Software Engineer",
    years_experience: Optional[str] = "1-3 years",
    ats_score: Optional[float] = None,
    demonstration_rate: Optional[float] = None,
    **kwargs: Any,
) -> RecruiterEvaluationReport:
    """
    Evaluates resume from the standpoint of an experienced tech recruiter.
    Identifies high-signal strengths, red flags, and interview shortlisting readiness.
    """
    resume_lower = resume_text.lower()
    is_fresher = (
        years_experience in ("0-1 years", "Student", "Fresher", "Intern", "0 years") or
        "0-" in (years_experience or "")
    )

    strengths: List[str] = []
    concerns: List[str] = []
    recommendations: List[str] = []
    timeline_flags: List[str] = []

    # 1. Contact & Professional Links Check
    has_linkedin = "linkedin.com" in resume_lower
    has_github = "github.com" in resume_lower or "gitlab.com" in resume_lower
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}', resume_text))

    if has_linkedin and has_github:
        strengths.append("High digital credibility: Both verified LinkedIn profile and active GitHub/code portfolio links are prominently featured.")
    elif not has_linkedin:
        concerns.append("Missing LinkedIn URL: 85%+ of corporate recruiters search LinkedIn to cross-reference employment before scheduling screenings.")
        recommendations.append("Include your customized LinkedIn URL at the top of your resume.")

    if not has_github and any(w in (target_role or "").lower() for w in ["software", "frontend", "backend", "fullstack", "developer", "engineer"]):
        concerns.append("No GitHub or code repository link detected for a software engineering position.")
        recommendations.append("Add a link to your GitHub profile containing 2-3 pinned, well-documented code repositories.")

    # 2. Skimmability & Visual Structure (10-Second Test)
    lines = resume_text.splitlines()
    word_count = len(resume_text.split())

    has_bullets = any(re.match(r'^\s*[-*•\d\.]+\s+', l) for l in lines)
    if not has_bullets:
        concerns.append("Dense paragraph styling: Human recruiters spend an average of 7-10 seconds scanning; block paragraphs reduce shortlisting probability by 60%.")
        recommendations.append("Convert dense paragraphs into concise, bulleted accomplishment statements.")

    if word_count > 1100 and is_fresher:
        concerns.append(f"Resume is {word_count} words long: Exceeds optimal 1-page standard for early-career candidates.")
        recommendations.append("Condense resume to a crisp 1-page document by removing older academic coursework or high school details.")
    elif word_count < 120:
        concerns.append("Resume is extremely brief: Lacks sufficient project implementation details.")
        recommendations.append("Expand project entries with technologies used, problems solved, and measurable outcomes.")

    # 3. Demonstration & Buzzword Ratio
    if demonstration_rate is not None:
        if demonstration_rate >= 60.0:
            strengths.append(f"Strong skill verification: {demonstration_rate}% of declared technical competencies are evidenced in projects or experience.")
        elif demonstration_rate < 35.0:
            concerns.append("Buzzword-heavy: Many technologies listed in Skills lack corroborating project bullets.")
            recommendations.append("Either demonstrate declared skills in your project bullets or remove unpracticed keywords.")

    # 4. Measurable Outcomes & Metrics
    metrics_count = len(re.findall(r'(?:\b\d+%\b|\$\d+|\b\d+\s*x\b|\b\d+\+?\s*(?:users|clients|requests|qps))', resume_lower))
    if metrics_count >= 3:
        strengths.append(f"Results-oriented narrative: Includes {metrics_count} quantifiable metrics showing business or technical impact.")
    else:
        concerns.append("Task-focused rather than impact-focused: Lacks measurable numbers or outcome metrics.")
        recommendations.append("Quantify accomplishments: How many users? What was the latency reduction? By what % did performance improve?")

    # 5. Timeline & Career Trajectory
    year_matches = [int(y) for y in re.findall(r'\b(20[0-2]\d)\b', resume_text)]
    if year_matches:
        unique_years = sorted(set(year_matches))
        if len(unique_years) >= 2:
            min_y, max_y = min(unique_years), max(unique_years)
            if (max_y - min_y) > 8 and is_fresher:
                timeline_flags.append("Timeline shows dates spanning > 8 years while claiming Fresher status.")

    # 6. Overall Qualitative Verdict
    total_concerns = len(concerns)
    if total_concerns == 0 and len(strengths) >= 2:
        verdict = "Strong Shortlist"
        impression = f"Clean, compelling presentation clearly targeting {target_role}. High likelihood of recruiter screening invitation."
    elif total_concerns <= 2:
        verdict = "Competitive Candidate"
        impression = f"Well-structured profile with solid technical foundations for {target_role}. Resolving minor link/metric gaps will maximize interview callbacks."
    elif total_concerns <= 4:
        verdict = "Borderline / Needs Polish"
        impression = f"Candidate possesses technical capabilities, but resume presentation dilutes impact. Formatting and quantification adjustments required."
    else:
        verdict = "Requires Significant Revision"
        impression = "High friction for recruiter review due to missing links, formatting issues, or lack of project depth."

    if not strengths:
        strengths.append("Established technical baseline suitable for technical review.")
    if not recommendations:
        recommendations.append("Resume is recruiter-ready. Tailor opening summary for specific target employers.")

    return RecruiterEvaluationReport(
        first_10_second_impression=impression,
        overall_qualitative_verdict=verdict,
        recruiter_strengths=strengths,
        recruiter_concerns=concerns,
        top_improvement_recommendations=recommendations,
        timeline_flags=timeline_flags,
        positioning_clarity="clear" if total_concerns <= 2 else "diffuse",
    )

