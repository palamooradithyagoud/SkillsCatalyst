"""
Projects & Experience Evaluation Engine (Dimension 4 - 20% Weight).

Evaluates:
- Practical project implementations, architecture, complexity, and technology integration.
- Measurable outcomes and quantifiable metrics in accomplishment statements.
- Differentiates academic/personal projects, internships, and full-time employment.
- Career-stage calibrated: Freshers and campus graduates are evaluated on engineering depth
  without penalty for lacking corporate tenure.
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Any, Set
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class ExtractedProject(BaseModel):
    title: str
    technologies: List[str] = Field(default_factory=list)
    bullets: List[str] = Field(default_factory=list)
    has_metrics: bool = False
    metrics: List[str] = Field(default_factory=list)
    complexity_level: str = "intermediate"  # "advanced" | "intermediate" | "basic"


class ExtractedExperience(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    is_internship: bool = False
    bullets: List[str] = Field(default_factory=list)
    metrics: List[str] = Field(default_factory=list)


class ProjectEvaluationReport(BaseModel):
    projects_experience_score: float = Field(default=75.0, description="Dimension 4 Score (0-100 scale, 20% weight)")
    project_count: int = 0
    experience_count: int = 0
    total_metrics_count: int = 0
    technical_depth_level: str = "intermediate"  # "advanced" | "intermediate" | "basic" | "minimal"
    career_stage_applied: str = "experienced"  # "fresher" | "intern" | "experienced"
    projects: List[ExtractedProject] = Field(default_factory=list)
    experiences: List[ExtractedExperience] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Metric & Complexity Patterns
# ---------------------------------------------------------------------------

_METRIC_REGEX = re.compile(
    r'(?:'
    r'\b\d+(?:\.\d+)?%|'
    r'\$\s*\d+(?:,\d+)*(?:\.\d+)?(?:[kKmMbB])?\b|'
    r'\b\d+(?:\.\d+)?\s*(?:x|X|fold)\b|'
    r'\b\d+(?:,\d+)*\+?\s*(?:[a-zA-Z]+\s+){0,2}(?:users|clients|requests|qps|rps|tps|transactions|dau|mau|records|queries|tasks|developers|stars|downloads|customers)\b|'
    r'\b(?:reduced|increased|improved|decreased|optimized|saved|cutting)\s+[^,\.\n]+?\b\d+(?:\.\d+)?(?:%|ms|s|minutes|hours|days|x)?\b'
    r')',
    re.IGNORECASE
)

_COMPLEXITY_KEYWORDS = {
    "advanced": [
        "microservices", "kubernetes", "distributed", "concurrency", "multithreading",
        "kafka", "rabbitmq", "grpc", "sharding", "replication", "event-driven",
        "websockets", "ci/cd pipeline", "graphql", "redis cache", "zero-downtime",
        "elasticsearch", "p99", "load balancing", "docker swarm", "terraform"
    ],
    "intermediate": [
        "rest api", "postgresql", "mongodb", "authentication", "jwt", "oauth",
        "docker", "react", "next.js", "state management", "redux", "crud",
        "tailwind", "express", "fastapi", "django", "flask", "pagination", "orm"
    ]
}


# ---------------------------------------------------------------------------
# Section Slicing Helpers
# ---------------------------------------------------------------------------

def _extract_section_text(resume_text: str, section_names: List[str]) -> str:
    """Extracts text belonging to a specific section heading until the next major section."""
    lines = resume_text.splitlines()
    in_section = False
    section_lines = []

    pattern = re.compile(
        rf'^\s*(?:##\s*|[-*•]\s*)?(?:{"|".join(section_names)})\s*[:\-\—]?\s*$',
        re.IGNORECASE
    )
    stop_pattern = re.compile(
        r'^\s*(?:##\s*|[-*•]\s*)?(?:education|academic|skills|technical skills|projects|experience|employment|work history|certifications|awards|contact|summary|languages)\s*[:\-\—]?\s*$',
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_section:
                section_lines.append("")
            continue

        if pattern.match(stripped):
            in_section = True
            continue
        elif in_section and stop_pattern.match(stripped):
            # Hit next major section
            break
        elif in_section:
            section_lines.append(line)

    return "\n".join(section_lines).strip()


# ---------------------------------------------------------------------------
# Core Evaluator Implementation
# ---------------------------------------------------------------------------

def evaluate_projects_and_experience(
    resume_text: str,
    years_experience: Optional[str] = "1-3 years",
    target_role: Optional[str] = "Fullstack Software Engineer",
    career_stage: Optional[str] = None,
    **kwargs: Any,
) -> ProjectEvaluationReport:
    """
    Deterministically evaluates candidate projects and work experience.
    Calibrated to career stage:
    - Freshers: scored heavily on project depth, architecture, and practical outcomes.
    - Experienced: scored on career tenure, quantifiable business impact, and system scale.
    """
    if career_stage:
        is_fresher = career_stage.lower() in ("fresher", "student", "intern", "entry")
        stage = "fresher" if is_fresher else "experienced"
    else:
        is_fresher = (
            years_experience in ("0-1 years", "Student", "Fresher", "Intern", "0 years") or
            "0-" in (years_experience or "") or
            (years_experience or "").lower() == "fresher"
        )
        stage = "fresher" if is_fresher else "experienced"

    # 1. Extract Project Section Text
    project_text = _extract_section_text(resume_text, ["projects", "personal projects", "academic projects", "key projects"])
    experience_text = _extract_section_text(resume_text, ["experience", "work experience", "employment", "professional experience", "internships"])

    # Fallback: if explicit sections weren't sliced, check whole document for bullet points
    if not project_text and not experience_text:
        project_text = resume_text

    # 2. Parse Project Entries
    extracted_projects: List[ExtractedProject] = []
    lines = project_text.splitlines()
    current_proj_title = ""
    current_proj_bullets = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Heuristic for project header: line without bullet starting with title or containing tech
        is_bullet = bool(re.match(r'^\s*[-*•\d\.]+\s+', line))
        if not is_bullet and len(stripped) <= 120 and ("(" in stripped or "|" in stripped or "–" in stripped or "-" in stripped or ":" in stripped or len(stripped.split()) <= 8):
            if current_proj_title and current_proj_bullets:
                # Flush previous project
                metrics_found = [m.group(0) for b in current_proj_bullets for m in _METRIC_REGEX.finditer(b)]
                extracted_projects.append(ExtractedProject(
                    title=current_proj_title,
                    bullets=current_proj_bullets,
                    has_metrics=len(metrics_found) > 0,
                    metrics=metrics_found,
                ))
            current_proj_title = stripped
            current_proj_bullets = []
        elif is_bullet and current_proj_title:
            current_proj_bullets.append(stripped.lstrip("-*•0123456789. "))
        elif is_bullet and not current_proj_title:
            # Bullet without explicit header
            current_proj_bullets.append(stripped.lstrip("-*•0123456789. "))

    if current_proj_title and current_proj_bullets:
        metrics_found = [m.group(0) for b in current_proj_bullets for m in _METRIC_REGEX.finditer(b)]
        extracted_projects.append(ExtractedProject(
            title=current_proj_title,
            bullets=current_proj_bullets,
            has_metrics=len(metrics_found) > 0,
            metrics=metrics_found,
        ))

    # If project headers weren't isolated, capture top bullets as generic projects
    if not extracted_projects and project_text:
        generic_bullets = [l.strip().lstrip("-*•0123456789. ") for l in lines if re.match(r'^\s*[-*•]', l) and len(l.strip()) > 20]
        if generic_bullets:
            metrics_found = [m.group(0) for b in generic_bullets for m in _METRIC_REGEX.finditer(b)]
            extracted_projects.append(ExtractedProject(
                title="Technical Project Accomplishments",
                bullets=generic_bullets[:6],
                has_metrics=len(metrics_found) > 0,
                metrics=metrics_found,
            ))

    # 3. Parse Experience Entries
    extracted_experiences: List[ExtractedExperience] = []
    exp_lines = experience_text.splitlines()
    exp_bullets = [
        l.strip().lstrip("-*•0123456789. ")
        for l in exp_lines
        if re.match(r'^\s*[-*•\d\.]+\s+', l) and len(l.strip()) > 15
    ]
    exp_metrics = [m.group(0) for b in exp_bullets for m in _METRIC_REGEX.finditer(b)]
    is_intern = any(any(w in l.lower() for w in ["intern", "internship", "trainee"]) for l in exp_lines)

    if exp_bullets or len(experience_text) > 50:
        extracted_experiences.append(ExtractedExperience(
            company="Professional Employment",
            role="Software Engineer",
            is_internship=is_intern,
            bullets=exp_bullets,
            metrics=exp_metrics,
        ))

    # 4. Analyze Technical Complexity & Metrics
    all_bullets = [b for p in extracted_projects for b in p.bullets] + [b for e in extracted_experiences for b in e.bullets]
    combined_proj_text = (project_text + " " + experience_text).lower()

    adv_count = sum(1 for kw in _COMPLEXITY_KEYWORDS["advanced"] if kw in combined_proj_text)
    int_count = sum(1 for kw in _COMPLEXITY_KEYWORDS["intermediate"] if kw in combined_proj_text)

    if adv_count >= 3:
        depth_level = "advanced"
    elif int_count >= 3 or adv_count >= 1:
        depth_level = "intermediate"
    elif int_count >= 1:
        depth_level = "basic"
    else:
        depth_level = "minimal"

    total_metrics = sum(len(p.metrics) for p in extracted_projects) + sum(len(e.metrics) for e in extracted_experiences)

    # 5. Score Calculation (0-100 Scale, strictly bounded)
    score = 50.0

    # Project Count Credit
    proj_count = len(extracted_projects)
    if proj_count >= 3:
        score += 20.0
    elif proj_count >= 2:
        score += 15.0
    elif proj_count == 1:
        score += 8.0

    # Technical Depth Credit
    if depth_level == "advanced":
        score += 20.0
    elif depth_level == "intermediate":
        score += 12.0
    elif depth_level == "basic":
        score += 5.0

    # Measurable Metrics Credit
    if total_metrics >= 3:
        score += 15.0
    elif total_metrics >= 1:
        score += 8.0

    # Experience / Fresher Calibration
    if is_fresher:
        # Campus graduates: award up to 15 bonus points for strong project portfolio in lieu of tenure
        if proj_count >= 2 and depth_level in ("intermediate", "advanced"):
            score += 15.0
        elif proj_count >= 1:
            score += 8.0
    else:
        # Experienced: reward verifiable corporate employment tenure
        if extracted_experiences:
            score += 15.0
        else:
            # Penalize experienced candidates with zero corporate experience listed
            score -= 15.0

    final_score = max(0.0, min(100.0, round(score, 1)))

    # 6. Formulate Insights & Actionable Feedback
    strengths = []
    weaknesses = []
    recommendations = []

    if proj_count >= 2:
        strengths.append(f"Documented {proj_count} distinct practical engineering projects.")
    if depth_level in ("advanced", "intermediate"):
        strengths.append(f"Demonstrates {depth_level}-level architectural implementation (APIs, databases, deployment).")
    if total_metrics > 0:
        strengths.append(f"Includes {total_metrics} quantifiable performance or business outcome metrics.")

    if proj_count < 2:
        weaknesses.append("Fewer than 2 detailed projects found in the resume.")
        recommendations.append("Add at least 2 comprehensive full-stack or backend projects showcasing end-to-end architecture.")
    if total_metrics == 0:
        weaknesses.append("Project descriptions lack quantifiable impact metrics (latency, users, throughput, %).")
        recommendations.append("Apply Google's XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]' to quantify your results.")
    if depth_level in ("basic", "minimal"):
        weaknesses.append("Projects appear relatively basic or tutorial-based.")
        recommendations.append("Incorporate production engineering components: caching (Redis), Docker containerization, CI/CD pipelines, or asynchronous task workers.")

    if not strengths:
        strengths.append("Foundations established; expand technical depth and metrics.")
    if not recommendations:
        recommendations.append("Outstanding project depth. Continue keeping dependencies and deployment URLs updated.")

    return ProjectEvaluationReport(
        projects_experience_score=final_score,
        project_count=proj_count,
        experience_count=len(extracted_experiences),
        total_metrics_count=total_metrics,
        technical_depth_level=depth_level,
        career_stage_applied=stage,
        projects=extracted_projects,
        experiences=extracted_experiences,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
    )


evaluate_projects = evaluate_projects_and_experience

