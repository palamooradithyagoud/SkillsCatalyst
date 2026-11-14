"""
backend/services/resume_progress_service.py
Phase 4.3: Resume Score Improvement Tracking & Progress Dashboard Service.

Provides:
1. Long-term score evolution and growth statistics across all versions of a series.
2. Formatted time-series data for charting (Overall, ATS, Content, Skills, Structure).
3. Objective category improvement indicators (improved, declined, unchanged, not_comparable).
4. Evidence-based achievement milestones triggered strictly by verified analysis metrics.
5. Cross-version tracking of recurring weaknesses and resolution state.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from backend.services.supabase_service import get_supabase
from backend.services.resume_series_service import get_resume_series_detail

logger = logging.getLogger("skillscatalyst.resume_progress")


def calculate_category_indicator(older_val: Optional[float], newer_val: Optional[float]) -> str:
    """Returns 'improved', 'declined', 'unchanged', or 'not_comparable'."""
    if older_val is None or newer_val is None:
        return "not_comparable"
    if newer_val > older_val:
        return "improved"
    elif newer_val < older_val:
        return "declined"
    return "unchanged"


def compute_growth_milestones(versions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluates evidence-based milestones against actual recorded versions.
    Zero fake or hardcoded milestone grants.
    """
    milestones = [
        {
            "id": "first_analysis",
            "title": "First Resume Analysis",
            "description": "Completed your first comprehensive ATS and AI resume evaluation.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "emerald",
        },
        {
            "id": "first_improvement",
            "title": "First Step Forward",
            "description": "Achieved a higher overall score than your previous revision.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "blue",
        },
        {
            "id": "ats_above_70",
            "title": "ATS Ready (70+)",
            "description": "Reached an ATS compatibility score of 70% or higher.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "purple",
        },
        {
            "id": "overall_above_80",
            "title": "Elite Candidate (80+)",
            "description": "Achieved an overall score of 80% or higher.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "amber",
        },
        {
            "id": "five_versions",
            "title": "Dedicated Iteration (5+ Versions)",
            "description": "Iterated 5 or more versions to polish your career materials.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "indigo",
        },
        {
            "id": "consistent_improvement",
            "title": "Consistent Velocity",
            "description": "Demonstrated 2 or more consecutive score improvements.",
            "unlocked": False,
            "unlocked_at": None,
            "badge_color": "cyan",
        },
    ]

    if not versions:
        return milestones

    # 1. First Resume Analysis
    milestones[0]["unlocked"] = True
    milestones[0]["unlocked_at"] = versions[0].get("created_at")

    # 2. First Improvement & Consistent Improvement
    consecutive_gains = 0
    max_consecutive_gains = 0

    for i in range(1, len(versions)):
        prev_score = versions[i - 1].get("overall_score")
        curr_score = versions[i].get("overall_score")

        if prev_score is not None and curr_score is not None:
            if curr_score > prev_score:
                consecutive_gains += 1
                if not milestones[1]["unlocked"]:
                    milestones[1]["unlocked"] = True
                    milestones[1]["unlocked_at"] = versions[i].get("created_at")
            else:
                consecutive_gains = 0
            max_consecutive_gains = max(max_consecutive_gains, consecutive_gains)

    if max_consecutive_gains >= 2:
        milestones[5]["unlocked"] = True
        milestones[5]["unlocked_at"] = versions[-1].get("created_at")

    # 3. ATS Score Above 70
    for v in versions:
        ats = v.get("ats_score")
        if ats is not None and ats >= 70.0:
            milestones[2]["unlocked"] = True
            milestones[2]["unlocked_at"] = v.get("created_at")
            break

    # 4. Overall Score Above 80
    for v in versions:
        ov = v.get("overall_score")
        if ov is not None and ov >= 80.0:
            milestones[3]["unlocked"] = True
            milestones[3]["unlocked_at"] = v.get("created_at")
            break

    # 5. Five Versions
    if len(versions) >= 5:
        milestones[4]["unlocked"] = True
        milestones[4]["unlocked_at"] = versions[4].get("created_at")

    return milestones


def track_recurring_weaknesses(series_id: str) -> List[Dict[str, Any]]:
    """
    Scans the JSONB analysis artifacts for recurring weaknesses across versions
    and determines if they were resolved in the latest revision.
    """
    sb = get_supabase()
    res = (
        sb.table("resume_analyses")
        .select("id, version_number, analysis_result")
        .eq("resume_series_id", series_id)
        .order("version_number", desc=False)
        .execute()
    )
    records = res.data or []
    if not records:
        return []

    latest_record = records[-1]
    latest_result = latest_record.get("analysis_result", {}) or {}
    latest_ai = latest_result.get("ai_evaluation", {}) or {}
    latest_weaknesses = {
        w.strip().lower() for w in (latest_ai.get("weaknesses", []) or []) if isinstance(w, str)
    }

    weakness_frequency: Dict[str, int] = {}
    weakness_samples: Dict[str, str] = {}

    for rec in records:
        analysis_res = rec.get("analysis_result", {}) or {}
        ai_eval = analysis_res.get("ai_evaluation", {}) or {}
        raw_weaknesses = ai_eval.get("weaknesses", []) or []

        for w in raw_weaknesses:
            if isinstance(w, str) and len(w.strip()) > 5:
                norm = w.strip().lower()
                # Group very similar strings by key prefix
                key = norm[:40]
                weakness_frequency[key] = weakness_frequency.get(key, 0) + 1
                if key not in weakness_samples:
                    weakness_samples[key] = w.strip()

    result = []
    for key, count in weakness_frequency.items():
        sample_text = weakness_samples[key]
        is_resolved = not any(key in lw for lw in latest_weaknesses)
        result.append({
            "weakness": sample_text,
            "occurrences": count,
            "status": "resolved" if is_resolved else "persisting",
        })

    # Sort: persisting weaknesses first, then by frequency descending
    result.sort(key=lambda x: (0 if x["status"] == "persisting" else 1, -x["occurrences"]))
    return result[:8]


def get_resume_series_progress(user_id: str, series_id: str) -> Dict[str, Any]:
    """
    Calculates the full career progression analytics for a logical resume series.
    """
    series_detail = get_resume_series_detail(user_id=user_id, series_id=series_id)
    versions = series_detail.get("versions", [])

    total_versions = len(versions)
    if total_versions == 0:
        return {
            "series": {
                "id": series_detail["id"],
                "title": series_detail["title"],
                "target_role": series_detail.get("target_role"),
            },
            "growth": {
                "current_overall_score": None,
                "previous_overall_score": None,
                "best_score": None,
                "total_versions": 0,
                "total_score_improvement": 0.0,
                "last_analyzed_date": None,
            },
            "timeline": [],
            "category_indicators": {
                "overall": "not_comparable",
                "ats": "not_comparable",
                "content": "not_comparable",
                "skills": "not_comparable",
                "structure": "not_comparable",
            },
            "milestones": compute_growth_milestones([]),
            "recurring_weaknesses": [],
        }

    # Chronologically sorted versions
    sorted_v = sorted(versions, key=lambda x: x.get("version_number", 0))

    first_v = sorted_v[0]
    latest_v = sorted_v[-1]
    prev_v = sorted_v[-2] if total_versions > 1 else None

    # Score metrics
    curr_score = latest_v.get("overall_score")
    prev_score = prev_v.get("overall_score") if prev_v else None
    first_score = first_v.get("overall_score")

    valid_scores = [v.get("overall_score") for v in sorted_v if v.get("overall_score") is not None]
    best_score = max(valid_scores) if valid_scores else None

    total_improvement = 0.0
    if curr_score is not None and first_score is not None:
        total_improvement = round(curr_score - first_score, 2)

    # Timeline data for charts
    timeline = []
    for v in sorted_v:
        timeline.append({
            "version_number": v.get("version_number"),
            "analysis_id": v.get("id"),
            "created_at": v.get("created_at"),
            "filename": v.get("original_filename"),
            "overall_score": v.get("overall_score"),
            "ats_score": v.get("ats_score"),
            "content_score": v.get("content_score"),
            "skills_score": v.get("skills_score"),
            "structure_score": v.get("structure_score"),
        })

    # Category indicators
    category_indicators = {
        "overall": calculate_category_indicator(prev_v.get("overall_score") if prev_v else None, latest_v.get("overall_score")),
        "ats": calculate_category_indicator(prev_v.get("ats_score") if prev_v else None, latest_v.get("ats_score")),
        "content": calculate_category_indicator(prev_v.get("content_score") if prev_v else None, latest_v.get("content_score")),
        "skills": calculate_category_indicator(prev_v.get("skills_score") if prev_v else None, latest_v.get("skills_score")),
        "structure": calculate_category_indicator(prev_v.get("structure_score") if prev_v else None, latest_v.get("structure_score")),
    }

    # Milestones & Weaknesses
    milestones = compute_growth_milestones(sorted_v)
    weaknesses = track_recurring_weaknesses(series_id)

    return {
        "series": {
            "id": series_detail["id"],
            "title": series_detail["title"],
            "target_role": series_detail.get("target_role"),
            "description": series_detail.get("description"),
        },
        "growth": {
            "current_overall_score": curr_score,
            "previous_overall_score": prev_score,
            "best_score": best_score,
            "total_versions": total_versions,
            "total_score_improvement": total_improvement,
            "last_analyzed_date": latest_v.get("created_at"),
        },
        "timeline": timeline,
        "category_indicators": category_indicators,
        "milestones": milestones,
        "recurring_weaknesses": weaknesses,
    }

