"""
Content Quality & Achievements Evaluation Engine (Dimension 6 - 15% Weight).

Evaluates:
- Strong action verbs vs passive/weak verbs across accomplishment bullets.
- Quantifiable metrics density (% of bullets containing measurable numbers, %, $, latency, users).
- STAR framework indicators (Action + Result combinations).
- Generic buzzword / fluff penalties.
- Bullet point conciseness and technical clarity.
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

class ContentQualityReport(BaseModel):
    content_quality_score: float = Field(default=75.0, description="Dimension 6 Score (0-100 scale, 15% weight)")
    strong_action_verbs_count: int = 0
    weak_action_verbs_count: int = 0
    quantifiable_metrics_count: int = 0
    metric_bullet_percentage: float = 0.0
    star_alignment_percentage: float = 0.0
    total_bullets_analyzed: int = 0
    fluff_phrases_detected: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Dictionaries & Regex
# ---------------------------------------------------------------------------

_STRONG_ACTION_VERBS = {
    # Engineering & Building
    "architected", "engineered", "developed", "built", "implemented", "constructed",
    "designed", "modeled", "programmed", "coded", "integrated", "deployed",
    # Optimization & Performance
    "optimized", "accelerated", "streamlined", "refactored", "automated", "scaled",
    "reduced", "increased", "maximized", "minimized", "enhanced", "boosted",
    # Leadership & Delivery
    "spearheaded", "orchestrated", "led", "directed", "mentored", "delivered",
    "established", "published", "pioneered", "initiated", "executed", "authored",
    # Investigation & Security
    "analyzed", "resolved", "debugged", "audited", "secured", "migrated", "benchmarked"
}

_WEAK_ACTION_VERBS = {
    "worked on", "helped", "assisted", "responsible for", "participated in",
    "handled", "tasked with", "involved in", "attempted", "learned", "tried"
}

_FLUFF_PHRASES = [
    "hard worker", "team player", "quick learner", "detail oriented",
    "go-getter", "self starter", "out of the box", "dynamic professional",
    "good communicator", "passionate coder", "enthusiastic learner", "hardworking"
]

_METRIC_REGEX = re.compile(
    r'(?:'
    r'\b\d+(?:\.\d+)?%|'
    r'\$\s*\d+(?:,\d+)*(?:\.\d+)?(?:[kKmMbB])?\b|'
    r'\b\d+(?:\.\d+)?\s*(?:x|X|fold)\b|'
    r'\b\d+(?:,\d+)*\+?\s*(?:[a-zA-Z]+\s+){0,2}(?:users|clients|requests|qps|rps|tps|transactions|dau|mau|records|queries)\b|'
    r'\b(?:reduced|increased|improved|decreased|optimized|saved)\s+[^,\.\n]+?\b\d+(?:\.\d+)?(?:%|ms|s|hours|days|x)?\b'
    r')',
    re.IGNORECASE
)


# ---------------------------------------------------------------------------
# Evaluator Function
# ---------------------------------------------------------------------------

def evaluate_content_quality(
    resume_text: str,
    ai_content_score: Optional[float] = None,
    **kwargs: Any,
) -> ContentQualityReport:
    """
    Evaluates the quality of resume accomplishment bullets, verb strength,
    measurable impact, and STAR methodology adherence.
    Hybrid architecture: combines deterministic linguistic metrics with optional
    AI qualitative rating when available.
    """
    lines = resume_text.splitlines()
    bullets: List[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r'^\s*[-*•\d\.]+\s+', line) and len(stripped) > 20:
            bullets.append(stripped.lstrip("-*•0123456789. "))

    # If no explicit bullet formatting, extract sentence clauses
    if len(bullets) < 3:
        sentences = [s.strip() for s in re.split(r'[\.\n]+', resume_text) if len(s.strip().split()) >= 6]
        bullets = sentences[:15]

    total_bullets = len(bullets)
    strong_verb_count = 0
    weak_verb_count = 0
    bullets_with_metrics = 0
    star_bullets = 0
    all_metrics: List[str] = []

    for b in bullets:
        b_lower = b.lower()
        first_few_words = " ".join(b_lower.split()[:4])

        # Check action verbs
        has_strong = any(v in first_few_words for v in _STRONG_ACTION_VERBS)
        has_weak = any(v in first_few_words for v in _WEAK_ACTION_VERBS)

        if has_strong:
            strong_verb_count += 1
        elif has_weak:
            weak_verb_count += 1

        # Check metrics
        metrics = [m.group(0) for m in _METRIC_REGEX.finditer(b)]
        if metrics:
            bullets_with_metrics += 1
            all_metrics.extend(metrics)

        # Check STAR pattern (Action Verb + Result / Metric / Outcome keyword)
        has_outcome = any(w in b_lower for w in ["resulting in", "enabling", "reducing", "increasing", "improving", "by", "to achieve", "which allowed"])
        if has_strong and (metrics or has_outcome):
            star_bullets += 1

    # Detect fluff phrases
    resume_lower = resume_text.lower()
    fluff_found = [fp for fp in _FLUFF_PHRASES if re.search(rf'\b{re.escape(fp)}\b', resume_lower)]

    # Calculate percentages
    metric_pct = round((bullets_with_metrics / max(total_bullets, 1)) * 100.0, 1)
    star_pct = round((star_bullets / max(total_bullets, 1)) * 100.0, 1)

    # ── Deterministic Score Calculation (0-100) ──────────────────────────────
    # Base: 40 pts
    score = 40.0

    # 1. Action Verbs (up to 25 pts)
    verb_ratio = strong_verb_count / max(total_bullets, 1)
    score += min(25.0, verb_ratio * 30.0)
    score -= min(10.0, weak_verb_count * 3.0)

    # 2. Measurable Metrics (up to 25 pts)
    if metric_pct >= 40.0:
        score += 25.0
    elif metric_pct >= 25.0:
        score += 18.0
    elif metric_pct >= 10.0:
        score += 10.0
    elif bullets_with_metrics > 0:
        score += 5.0

    # 3. STAR Alignment (up to 15 pts)
    score += min(15.0, (star_pct / 100.0) * 20.0)

    # 4. Fluff Penalty (-4 pts per cliché phrase)
    score -= min(12.0, len(fluff_found) * 4.0)

    deterministic_score = max(0.0, min(100.0, round(score, 1)))

    # Hybrid blending: if AI content evaluation succeeded, blend 70% deterministic + 30% AI
    if ai_content_score is not None and isinstance(ai_content_score, (int, float)):
        final_score = round(0.70 * deterministic_score + 0.30 * float(ai_content_score), 1)
    else:
        final_score = deterministic_score

    # ── Feedback & Recommendations ───────────────────────────────────────────
    strengths = []
    weaknesses = []
    recommendations = []

    if strong_verb_count >= 3:
        strengths.append(f"Uses {strong_verb_count} decisive engineering action verbs (e.g. Engineered, Optimized, Architected).")
    if bullets_with_metrics >= 2:
        strengths.append(f"{metric_pct}% of accomplishment bullets include measurable, verifiable metrics.")
    if star_pct >= 30.0:
        strengths.append("Demonstrates STAR impact structure (Action + Measurable Outcome).")

    if weak_verb_count > 0:
        weaknesses.append(f"Contains {weak_verb_count} passive or weak phrases (e.g. 'assisted', 'responsible for', 'helped').")
        recommendations.append("Replace passive phrases ('responsible for', 'worked on') with punchy action verbs ('Engineered', 'Spearheaded', 'Optimized').")

    if metric_pct < 25.0:
        weaknesses.append("Low quantifiable metrics density (< 25% of bullets feature numbers).")
        recommendations.append("Aim for at least 30-40% of bullet points to cite concrete metrics: latency reduction, user count, %, or scale.")

    if fluff_found:
        weaknesses.append(f"Contains generic filler buzzwords: {', '.join(fluff_found)}.")
        recommendations.append(f"Remove generic buzzwords ('{fluff_found[0]}') and let technical accomplishments prove your capability.")

    if not strengths:
        strengths.append("Foundational bullet structure present; focus on adding quantification.")
    if not recommendations:
        recommendations.append("Excellent content impact and metric density across all evaluated statements.")

    return ContentQualityReport(
        content_quality_score=final_score,
        strong_action_verbs_count=strong_verb_count,
        weak_action_verbs_count=weak_verb_count,
        quantifiable_metrics_count=len(all_metrics),
        metric_bullet_percentage=metric_pct,
        star_alignment_percentage=star_pct,
        total_bullets_analyzed=total_bullets,
        fluff_phrases_detected=fluff_found,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
    )

