"""
Skill Evidence Verification Engine (Supporting Engine 1).

Verifies declared technical skills against practical project and work experience evidence:
- Classifies skills into:
  1. DEMONSTRATED (supported by practical project implementation or work experience)
  2. MENTIONED ONLY (listed in skills section with zero corroborating project bullets)
  3. PARTIALLY DEMONSTRATED (cited in tools list but lacking deep implementation details)
  4. UNSUPPORTED CLAIM (advanced proficiency claimed without supporting evidence)
  5. REQUIRES VERIFICATION (claims that cannot be verified from document context)
- Extracts exact supporting text citations and confidence metrics.
- Computes overall Demonstration Rate (% of declared skills backed by evidence).
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Any, Set
from pydantic import BaseModel, Field

from backend.services.keyword_matcher import TAXONOMY_DICTIONARY, _keyword_present_in_text

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class SkillEvidenceCitation(BaseModel):
    section: str
    snippet: str
    confidence: float = 0.90


class SkillEvidenceItem(BaseModel):
    skill: str
    category: str
    classification: str  # "demonstrated" | "partially_demonstrated" | "mentioned_only" | "unsupported_claim" | "requires_verification"
    evidence: List[SkillEvidenceCitation] = Field(default_factory=list)
    confidence: float = 0.85
    explanation: str


class SkillEvidenceReport(BaseModel):
    technical_skills_score: float = Field(default=0.0, description="Dimension 3 Score (0-100 scale, 15% weight)")
    total_declared_skills: int = 0
    demonstrated_count: int = 0
    partially_demonstrated_count: int = 0
    mentioned_only_count: int = 0
    unsupported_count: int = 0
    demonstration_rate: float = 0.0  # percentage of declared skills backed by evidence
    items: List[SkillEvidenceItem] = Field(default_factory=list)
    demonstrated_skills: List[str] = Field(default_factory=list)
    mentioned_only_skills: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Section Slicing Helpers
# ---------------------------------------------------------------------------

def _slice_sections(resume_text: str) -> Dict[str, str]:
    """Splits resume text into standardized section buckets."""
    sections: Dict[str, List[str]] = {
        "skills": [],
        "projects": [],
        "experience": [],
        "education": [],
        "summary": [],
        "other": []
    }

    current_bucket = "other"
    lines = resume_text.splitlines()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        lower = stripped.lower()
        if re.match(r'^\s*(?:##\s*|[-*•]\s*)?(?:skills|technical skills|technologies|competencies)\s*[:\-\—]?\s*$', lower):
            current_bucket = "skills"
            continue
        elif re.match(r'^\s*(?:##\s*|[-*•]\s*)?(?:projects|personal projects|key projects|academic projects)\s*[:\-\—]?\s*$', lower):
            current_bucket = "projects"
            continue
        elif re.match(r'^\s*(?:##\s*|[-*•]\s*)?(?:experience|work experience|employment|internships)\s*[:\-\—]?\s*$', lower):
            current_bucket = "experience"
            continue
        elif re.match(r'^\s*(?:##\s*|[-*•]\s*)?(?:education|academic background|academics)\s*[:\-\—]?\s*$', lower):
            current_bucket = "education"
            continue
        elif re.match(r'^\s*(?:##\s*|[-*•]\s*)?(?:summary|profile|about me|professional summary)\s*[:\-\—]?\s*$', lower):
            current_bucket = "summary"
            continue

        sections[current_bucket].append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


# ---------------------------------------------------------------------------
# Verification Logic
# ---------------------------------------------------------------------------

def verify_skill_evidence(
    resume_text: str,
    declared_skills: Optional[List[str]] = None,
    **kwargs: Any,
) -> SkillEvidenceReport:
    """
    Cross-references every declared skill against practical application in projects and experience.
    Generates structured, grounded SkillEvidenceReport.
    """
    sections = _slice_sections(resume_text)
    projects_text = sections.get("projects", "")
    experience_text = sections.get("experience", "")
    skills_text = sections.get("skills", "")

    # Combine practical sections
    practical_text = (projects_text + "\n" + experience_text).strip()
    practical_lower = practical_text.lower()
    skills_lower = skills_text.lower()
    full_lower = resume_text.lower()

    # Identify declared skills
    target_skills: List[Tuple[str, str, List[str]]] = []
    seen = set()

    for cat_name, items in TAXONOMY_DICTIONARY.items():
        for canonical, aliases in items.items():
            if canonical in seen:
                continue
            # If skill appears in the resume at all
            if _keyword_present_in_text(canonical, aliases, full_lower):
                target_skills.append((canonical, cat_name, aliases))
                seen.add(canonical)

    items: List[SkillEvidenceItem] = []
    demonstrated_list: List[str] = []
    mentioned_only_list: List[str] = []
    unsupported_count = 0
    partially_count = 0

    for canonical, category, aliases in target_skills:
        in_practical = _keyword_present_in_text(canonical, aliases, practical_lower)
        in_skills_section = _keyword_present_in_text(canonical, aliases, skills_lower)

        # Check for matching sentences / bullets in projects or experience
        citations: List[SkillEvidenceCitation] = []
        if in_practical:
            for line in practical_text.splitlines():
                line_str = line.strip()
                if len(line_str) >= 20 and _keyword_present_in_text(canonical, aliases, line_str.lower()):
                    # Determine section origin
                    origin = "Projects" if line in projects_text else "Experience"
                    clean_snippet = line_str.lstrip("-*•0123456789. ")[:140]
                    citations.append(SkillEvidenceCitation(
                        section=origin,
                        snippet=clean_snippet,
                        confidence=0.95
                    ))
                    if len(citations) >= 2:
                        break

        # Classification decision tree
        if len(citations) >= 1:
            # Check if snippet contains active verbs or outcomes
            snippet_text = " ".join(c.snippet.lower() for c in citations)
            is_active = any(w in snippet_text for w in ["engineered", "built", "developed", "implemented", "optimized", "designed", "integrated", "using", "with", "scaled", "created"])
            if is_active or len(citations) >= 2:
                classification = "demonstrated"
                explanation = f"Supported by implementation evidence in {citations[0].section}."
                demonstrated_list.append(canonical)
            else:
                classification = "partially_demonstrated"
                explanation = f"Mentioned in {citations[0].section} bullet but lacks detailed implementation context."
                partially_count += 1
        elif in_skills_section:
            classification = "mentioned_only"
            explanation = "Listed in Technical Skills section without supporting project or work experience evidence."
            mentioned_only_list.append(canonical)
        else:
            # Appeared only in summary or hobby
            classification = "unsupported_claim"
            explanation = "Mentioned outside practical project or technical sections."
            unsupported_count += 1

        items.append(SkillEvidenceItem(
            skill=canonical,
            category=category,
            classification=classification,
            evidence=citations,
            confidence=0.95 if citations else 0.80,
            explanation=explanation,
        ))

    total = len(target_skills)
    demonstrated_count = len(demonstrated_list)
    rate = round((demonstrated_count / max(total, 1)) * 100.0, 1)

    recommendations: List[str] = []
    if mentioned_only_list:
        sample_skills = ", ".join(mentioned_only_list[:3])
        recommendations.append(
            f"Add project bullet points demonstrating hands-on usage of {sample_skills} to validate your proficiency."
        )
    if unsupported_count > 0:
        recommendations.append(
            "Ensure all technical skills declared in your summary are corroborated by detailed project accomplishments."
        )
    if not recommendations:
        recommendations.append("Outstanding technical credibility: all declared skills are substantiated by project evidence.")

    # -----------------------------------------------------------------------
    # Dimension 3: Technical Skills Score Calculation (15% Weight)
    # -----------------------------------------------------------------------
    if total == 0:
        tech_score = 0.0
    else:
        # 1. Demonstration rate (up to 50 pts)
        demo_pts = (rate / 100.0) * 50.0

        # 2. Diversity across categories (up to 30 pts)
        demo_categories = {
            item.category for item in items
            if item.classification in ("demonstrated", "partially_demonstrated")
        }
        diversity_pts = 0.0
        if "Programming Languages" in demo_categories:
            diversity_pts += 10.0
        if "Frameworks & Libraries" in demo_categories:
            diversity_pts += 8.0
        if "Databases" in demo_categories:
            diversity_pts += 6.0
        if any(c in demo_categories for c in ["Cloud & DevOps", "Tools & Platforms", "Architecture & Systems"]):
            diversity_pts += 6.0

        # 3. Volume of practical skills (up to 20 pts)
        practical_count = demonstrated_count + partially_count
        if practical_count >= 6:
            vol_pts = 20.0
        elif practical_count >= 4:
            vol_pts = 15.0
        elif practical_count >= 2:
            vol_pts = 10.0
        elif practical_count >= 1:
            vol_pts = 5.0
        else:
            vol_pts = 0.0

        raw_tech_score = demo_pts + diversity_pts + vol_pts

        # Anti-gaming penalty for declaring > 8 skills but having < 25% demonstration rate
        if total >= 8 and rate < 25.0:
            raw_tech_score -= 15.0

        tech_score = max(0.0, min(100.0, round(raw_tech_score, 1)))

    return SkillEvidenceReport(
        technical_skills_score=tech_score,
        total_declared_skills=total,
        demonstrated_count=demonstrated_count,
        partially_demonstrated_count=partially_count,
        mentioned_only_count=len(mentioned_only_list),
        unsupported_count=unsupported_count,
        demonstration_rate=rate,
        items=items,
        demonstrated_skills=demonstrated_list,
        mentioned_only_skills=mentioned_only_list,
        recommendations=recommendations,
    )
