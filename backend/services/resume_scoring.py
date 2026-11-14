"""
Centralized Resume Scoring & Validation Service.

Provides deterministic validation, normalization, and extraction of resume scores
and sanitization of resume file metadata. Ensures:
- No artificial, default, or fabricated scores (e.g. 95, 100).
- Explicit independent storage for all category sub-scores.
- Transparent representation of unavailable or failed evaluations.
- Path traversal and security hardening for uploaded filenames.
"""

import math
import os
import re
import logging
from typing import Any, Optional, Tuple, Dict, List
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Transparent Scoring Data Model
# ---------------------------------------------------------------------------

class ResumeCategoryScores(BaseModel):
    """
    Transparent scoring data model representing independent evaluation categories.
    Status can be:
      - 'pending': Evaluation requested / in progress.
      - 'completed': Both overall score and all key category scores successfully evaluated.
      - 'partially_completed': Overall score or some categories evaluated, others unavailable.
      - 'failed': Evaluation failed or scores could not be parsed.
    """
    overall_score: Optional[float] = Field(default=None, description="Overall ATS composite score (0-100)")
    ats_compatibility_score: Optional[float] = Field(default=None, description="ATS parseability & keyword match (0-100)")
    skills_match_score: Optional[float] = Field(default=None, description="Role alignment & technical skills match (0-100)")
    experience_score: Optional[float] = Field(default=None, description="Work/project experience impact & metrics (0-100)")
    structure_score: Optional[float] = Field(default=None, description="Layout, readability & structural flow (0-100)")
    content_quality_score: Optional[float] = Field(default=None, description="Depth of phrasing and substance (0-100)")
    score_status: str = Field(default="pending", description="'pending' | 'completed' | 'partially_completed' | 'failed'")

    @field_validator(
        "overall_score",
        "ats_compatibility_score",
        "skills_match_score",
        "experience_score",
        "structure_score",
        "content_quality_score",
        mode="before",
    )
    @classmethod
    def validate_category_score(cls, v: Any) -> Optional[float]:
        return validate_score(v)


# ---------------------------------------------------------------------------
# Strict Score Validation Mechanism
# ---------------------------------------------------------------------------

def validate_score(score: Any) -> Optional[float]:
    """
    Strict score validator.
    Requirements:
      - Must be numeric (int, float, or numeric string).
      - Rejects boolean types (which subclass int in Python).
      - Rejects NaN, Infinity, negative values, and values > 100.0.
      - Rejects malformed values.
      - NEVER converts invalid scores into 95, 100, or any other default.
      - Returns float rounded to 2 decimal places in range [0.0, 100.0], or None.
    """
    if score is None or isinstance(score, bool):
        return None

    try:
        val = float(score)
    except (ValueError, TypeError):
        return None

    if math.isnan(val) or math.isinf(val):
        return None

    if 0.0 <= val <= 100.0:
        return round(val, 2)

    return None


def normalize_score_fraction(val_str: str, denom_str: str) -> Optional[float]:
    """
    Parses a fraction string (e.g. '8.5', '10') and normalizes to a 0-100 scale.
    Only allows denominators 10.0 and 100.0.
    Fails closed on out-of-bounds or non-standard denominators.
    """
    try:
        val = float(val_str)
        denom = float(denom_str)
    except (ValueError, TypeError):
        return None

    if math.isnan(val) or math.isinf(val) or math.isnan(denom) or math.isinf(denom):
        return None

    if val < 0.0:
        return None

    if denom == 10.0:
        if 0.0 <= val <= 10.0:
            return round(val * 10.0, 2)
        return None
    elif denom == 100.0:
        if 0.0 <= val <= 100.0:
            return round(val, 2)
        return None

    return None


# ---------------------------------------------------------------------------
# Filename Sanitization & Path Traversal Prevention
# ---------------------------------------------------------------------------

def sanitize_resume_filename(filename: Optional[str], default: str = "uploaded_resume.pdf") -> str:
    """
    Sanitizes uploaded resume filename:
      1. Strips path traversal sequences (both POSIX '/' and Windows '\\').
      2. Removes null bytes and non-printable control characters.
      3. Replaces forbidden filesystem characters (<>:"/\\|?*) with underscores.
      4. Strips leading/trailing dots, spaces, and path separators.
      5. Enforces maximum length of 255 characters while preserving the extension.
      6. Preserves valid extensions (.pdf, .docx, .txt, .md).
      7. Gracefully falls back to default if result is empty.
    """
    if not filename or not isinstance(filename, str):
        return default

    # Normalize slashes and extract base name
    raw = filename.strip().replace("\\", "/")
    base = os.path.basename(raw)

    # Remove null bytes and control chars
    base = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', base)

    # Replace filesystem reserved characters
    base = re.sub(r'[\\/:*?"<>|]', '_', base)

    # Strip dots, spaces, underscores from ends
    cleaned = base.strip(". ")

    if not cleaned:
        return default

    # Max length truncation preserving extension
    if len(cleaned) > 255:
        name_part, ext_part = os.path.splitext(cleaned)
        allowed_len = 255 - len(ext_part)
        cleaned = (name_part[:allowed_len] if allowed_len > 0 else name_part[:250]) + ext_part

    return cleaned


# ---------------------------------------------------------------------------
# Independent Category Extraction from AI Review Text
# ---------------------------------------------------------------------------

def extract_single_category_score(text: str, label_patterns: List[str]) -> Optional[float]:
    """
    Extracts a single category score using supplied regex patterns.
    Ensures that multiple conflicting scores for the same category fail closed to None.
    """
    combined_labels = "|".join(label_patterns)

    # 1. Matches "Category: X/10", "Category: X/100", "Category: X out of 10"
    fraction_pattern = re.compile(
        rf"(?:^|[\n\r\-*|#])\s*(?:{combined_labels})\s*[:=\-|]*\s*(-?\d+(?:\.\d+)?)\s*(?:\/|\s*out of\s*)\s*(\d+(?:\.\d+)?)",
        re.IGNORECASE,
    )
    # 2. Matches "Category: X%"
    percent_pattern = re.compile(
        rf"(?:^|[\n\r\-*|#])\s*(?:{combined_labels})\s*[:=\-|]*\s*(-?\d+(?:\.\d+)?)\s*%",
        re.IGNORECASE,
    )

    fraction_matches = fraction_pattern.findall(text)
    percent_matches = percent_pattern.findall(text)

    found_scores: List[float] = []

    for val_str, denom_str in fraction_matches:
        norm = normalize_score_fraction(val_str, denom_str)
        if norm is not None:
            found_scores.append(norm)

    for val_str in percent_matches:
        try:
            val = float(val_str)
            norm = validate_score(val)
            if norm is not None:
                found_scores.append(norm)
        except (ValueError, TypeError):
            continue

    if not found_scores:
        return None

    # If multiple occurrences have different conflicting scores, fail closed (ambiguous)
    if len(set(found_scores)) > 1:
        logger.warning(f"Conflicting scores found for labels [{combined_labels}]: {found_scores}. Returning None.")
        return None

    return found_scores[0]


def extract_resume_scores(review_text: str) -> ResumeCategoryScores:
    """
    Parses and independently extracts the overall score and each category sub-score
    from AI review markdown text.

    Guarantees:
      - NEVER copies overall_score into missing category scores.
      - NEVER invents or generates random scores.
      - If a category is missing or invalid, it returns None.
      - score_status reflects the true evaluation state.
    """
    if not review_text or not isinstance(review_text, str):
        return ResumeCategoryScores(score_status="failed")

    # Clean markdown emphasis characters for cleaner token boundary matching
    clean_text = review_text.replace("**", " ").replace("*", " ").replace("`", "")

    # 1. Independent Category Sub-Scores Extraction
    ats_score = extract_single_category_score(
        clean_text,
        [r"ATS\s*Parsing\s*(?:&|and)\s*Readability", r"ATS\s*Compatibility", r"ATS\s*Parseability", r"ATS\s*Format", r"ATS\s*Compatibility\s*Score"]
    )
    skills_score = extract_single_category_score(
        clean_text,
        [r"Role\s*Alignment", r"Skills\s*Match", r"Skills\s*Alignment", r"Technical\s*Skills", r"Skill\s*Match"]
    )
    experience_score = extract_single_category_score(
        clean_text,
        [r"Impact(?:\s*&\s*Achievements)?", r"Experience(?:\s*&\s*Impact)?", r"Work\s*Experience"]
    )
    structure_score = extract_single_category_score(
        clean_text,
        [r"Structure(?:\s*&\s*Clarity)?", r"Readability(?:\s*&\s*Structure)?", r"Format(?:\s*&\s*Structure)?"]
    )
    content_quality_score = extract_single_category_score(
        clean_text,
        [r"Content\s*Quality", r"Content\s*&\s*Substance", r"Content\s*Score"]
    )

    # 2. Overall Score Extraction with Precedence Rules
    # Tier 1 Authoritative: "Final Score", "Overall Score"
    overall_pattern = re.compile(
        r"\b(Final\s*Score|Overall\s*Score|ATS\s*Score|Total\s*Score|Score)\s*[:=\-]*\s*(-?\d+(?:\.\d+)?)\s*(?:\/|\s*out of\s*)\s*(\d+(?:\.\d+)?)\b",
        re.IGNORECASE,
    )
    raw_matches = overall_pattern.findall(clean_text)

    tier1_scores: List[float] = []
    tier1_has_invalid = False
    tier2_scores: List[float] = []
    tier2_has_invalid = False

    for label, val_str, denom_str in raw_matches:
        norm = normalize_score_fraction(val_str, denom_str)
        is_tier1 = bool(re.match(r"^(Final|Overall)\s*Score$", label.strip(), re.IGNORECASE))
        if is_tier1:
            if norm is None:
                tier1_has_invalid = True
            else:
                tier1_scores.append(norm)
        else:
            if norm is None:
                tier2_has_invalid = True
            else:
                tier2_scores.append(norm)

    overall_score: Optional[float] = None

    # If Tier 1 explicit score existed:
    if raw_matches and any(re.match(r"^(Final|Overall)\s*Score$", m[0].strip(), re.IGNORECASE) for m in raw_matches):
        if not tier1_has_invalid and len(set(tier1_scores)) == 1:
            overall_score = tier1_scores[0]
    elif raw_matches and not tier2_has_invalid and len(set(tier2_scores)) == 1:
        overall_score = tier2_scores[0]

    # Fallback only when no explicit overall score was attempted:
    # Requires at least 3 valid section scores to compute an honest arithmetic average
    if overall_score is None:
        valid_sections = [
            s for s in [ats_score, skills_score, experience_score, structure_score]
            if s is not None
        ]
        if len(valid_sections) >= 3:
            overall_score = round(sum(valid_sections) / len(valid_sections), 2)

    # 3. Determine Transparent Score Status
    has_overall = overall_score is not None
    has_all_core = (
        ats_score is not None and
        skills_score is not None and
        experience_score is not None
    )

    if has_overall and has_all_core:
        status = "completed"
    elif has_overall or ats_score is not None or skills_score is not None or experience_score is not None:
        status = "partially_completed"
    else:
        status = "failed"

    return ResumeCategoryScores(
        overall_score=overall_score,
        ats_compatibility_score=ats_score,
        skills_match_score=skills_score,
        experience_score=experience_score,
        structure_score=structure_score,
        content_quality_score=content_quality_score,
        score_status=status,
    )


# ---------------------------------------------------------------------------
# Unified Transparent Scoring Model
# ---------------------------------------------------------------------------

class ScoreComponent(BaseModel):
    raw_score: Optional[float] = None
    weight: float = 0.0
    weighted_score: Optional[float] = None
    included: bool = True
    reason: Optional[str] = None


class UnifiedScoreBreakdown(BaseModel):
    overall_score: Optional[float] = None
    # 7 Enterprise Dimensions
    ats_compatibility: ScoreComponent = Field(default_factory=ScoreComponent)          # 15% (or 25% legacy)
    keyword_coverage: ScoreComponent = Field(default_factory=ScoreComponent)           # 15%
    technical_skills: ScoreComponent = Field(default_factory=ScoreComponent)           # 15%
    projects_experience: ScoreComponent = Field(default_factory=ScoreComponent)        # 20%
    education_certifications: ScoreComponent = Field(default_factory=ScoreComponent)   # 10%
    content_quality: ScoreComponent = Field(default_factory=ScoreComponent)           # 15% (or 30% legacy)
    structure: ScoreComponent = Field(default_factory=ScoreComponent)                 # 10% (or 20% legacy)
    # Backward compatibility field
    skills_match: ScoreComponent = Field(default_factory=ScoreComponent)
    weights_used: Dict[str, float] = Field(default_factory=dict)
    formula: str = Field(default="")
    evaluated_categories_count: int = Field(default=0)
    total_categories_count: int = Field(default=7)
    score_status: str = Field(default="completed")
    scoring_mode: str = Field(default="complete")
    explanation: str = Field(default="")


def calculate_unified_resume_score(
    ats_compatibility_score: Optional[float] = None,
    content_quality_score: Optional[float] = None,
    skills_match_score: Optional[float] = None,
    structure_score: Optional[float] = None,
    keyword_coverage_score: Optional[float] = None,
    technical_skills_score: Optional[float] = None,
    projects_experience_score: Optional[float] = None,
    education_certifications_score: Optional[float] = None,
) -> Tuple[Optional[float], UnifiedScoreBreakdown, str]:
    """
    Computes a transparent weighted composite score from available validated categories:

    Enterprise 7-Dimensional Architecture (when 7D dimensions are provided):
      - ATS Parsing & Readability: 15% (0.15)
      - Keyword Match / Coverage: 15% (0.15)
      - Technical Skills Assessment: 15% (0.15)
      - Projects & Practical Experience: 20% (0.20)
      - Education & Certifications: 10% (0.10)
      - Content Quality & Achievements: 15% (0.15)
      - Structure, Formatting & Completeness: 10% (0.10)
      Total = 100%

    Legacy 4-Dimensional Architecture (when called with legacy arguments):
      - ATS compatibility: 25% (0.25)
      - Content quality: 30% (0.30)
      - Skills and role relevance: 25% (0.25)
      - Structure and readability: 20% (0.20)
      Total = 100%

    Guarantees:
      - Missing categories are NEVER assigned 0 or fake default scores.
      - Weights are renormalized strictly across available evaluated categories.
      - Returns (overall_score, UnifiedScoreBreakdown, score_status).
    """
    is_7d_mode = any(
        x is not None
        for x in [
            keyword_coverage_score,
            technical_skills_score,
            projects_experience_score,
            education_certifications_score,
        ]
    )

    if is_7d_mode:
        base_weights = {
            "ats_compatibility": 0.15,
            "keyword_coverage": 0.15,
            "technical_skills": 0.15,
            "projects_experience": 0.20,
            "education_certifications": 0.10,
            "content_quality": 0.15,
            "structure": 0.10,
        }
        components = {
            "ats_compatibility": validate_score(ats_compatibility_score),
            "keyword_coverage": validate_score(keyword_coverage_score),
            "technical_skills": validate_score(technical_skills_score),
            "projects_experience": validate_score(projects_experience_score),
            "education_certifications": validate_score(education_certifications_score),
            "content_quality": validate_score(content_quality_score),
            "structure": validate_score(structure_score),
        }
        total_dimensions = 7
        formula_str = (
            "0.15*ATS + 0.15*Keyword + 0.15*TechSkills + 0.20*ProjectsExp + "
            "0.10*Education + 0.15*Content + 0.10*Structure"
        )
    else:
        base_weights = {
            "ats_compatibility": 0.25,
            "content_quality": 0.30,
            "skills_match": 0.25,
            "structure": 0.20,
        }
        components = {
            "ats_compatibility": validate_score(ats_compatibility_score),
            "content_quality": validate_score(content_quality_score),
            "skills_match": validate_score(skills_match_score),
            "structure": validate_score(structure_score),
        }
        total_dimensions = 4
        formula_str = "0.25*ATS + 0.30*Content + 0.25*Skills + 0.20*Structure"

    available_keys = [k for k, v in components.items() if v is not None]
    evaluated_count = len(available_keys)

    if evaluated_count == 0:
        return None, UnifiedScoreBreakdown(
            overall_score=None,
            evaluated_categories_count=0,
            total_categories_count=total_dimensions,
            weights_used={},
            formula=formula_str,
            score_status="failed",
            scoring_mode="unavailable",
            explanation="No valid categories could be evaluated.",
            ats_compatibility=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            keyword_coverage=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            technical_skills=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            projects_experience=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            education_certifications=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            content_quality=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            structure=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
            skills_match=ScoreComponent(raw_score=None, weight=0.0, weighted_score=None, included=False, reason="Unavailable"),
        ), "failed"

    total_available_weight = sum(base_weights[k] for k in available_keys)
    renormalized_weights = {
        k: round(base_weights[k] / total_available_weight, 4) for k in available_keys
    }

    composite_score = sum(
        components[k] * renormalized_weights[k] for k in available_keys
    )
    final_score = max(0.0, min(100.0, round(composite_score, 2)))

    status = "completed" if evaluated_count == total_dimensions else "partially_completed"
    explanation = (
        f"Calculated as a weighted composite of {evaluated_count}/{total_dimensions} verified categories "
        f"({', '.join(available_keys)}) on a 0-100 scale."
    )

    def _make_component(key: str) -> ScoreComponent:
        if key in available_keys:
            raw = components[key]
            wt = renormalized_weights[key]
            return ScoreComponent(
                raw_score=raw,
                weight=wt,
                weighted_score=round(raw * wt, 2) if raw is not None else None,
                included=True,
            )
        return ScoreComponent(
            raw_score=None,
            weight=0.0,
            weighted_score=None,
            included=False,
            reason="Category was not evaluated or unavailable",
        )

    # For backward compatibility mapping
    skills_match_comp = (
        _make_component("technical_skills")
        if is_7d_mode and "technical_skills" in available_keys
        else (_make_component("skills_match") if not is_7d_mode else _make_component("keyword_coverage"))
    )

    breakdown = UnifiedScoreBreakdown(
        overall_score=final_score,
        ats_compatibility=_make_component("ats_compatibility"),
        keyword_coverage=_make_component("keyword_coverage") if is_7d_mode else ScoreComponent(raw_score=None, weight=0.0, included=False, reason="Legacy mode"),
        technical_skills=_make_component("technical_skills") if is_7d_mode else ScoreComponent(raw_score=None, weight=0.0, included=False, reason="Legacy mode"),
        projects_experience=_make_component("projects_experience") if is_7d_mode else ScoreComponent(raw_score=None, weight=0.0, included=False, reason="Legacy mode"),
        education_certifications=_make_component("education_certifications") if is_7d_mode else ScoreComponent(raw_score=None, weight=0.0, included=False, reason="Legacy mode"),
        content_quality=_make_component("content_quality"),
        structure=_make_component("structure"),
        skills_match=skills_match_comp,
        formula=formula_str,
        evaluated_categories_count=evaluated_count,
        total_categories_count=total_dimensions,
        weights_used=renormalized_weights,
        score_status=status,
        scoring_mode="complete" if evaluated_count == total_dimensions else "renormalized",
        explanation=explanation,
    )

    return final_score, breakdown, status

