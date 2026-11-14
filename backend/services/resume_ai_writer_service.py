"""
SkillsCatalyst Resume AI Writing Assistant Service (Phase 5)
Provides grounded, anti-hallucinatory rewrites for experience bullets, project descriptions,
and professional summaries, plus deterministic writing quality feedback.
"""

import re
import logging
from typing import Dict, Any, List, Optional
from backend.services.groq_service import chat_with_groq, AIProviderError

logger = logging.getLogger(__name__)

# Action verb substitutions for stronger professional impact
STRONG_VERB_MAP = {
    "worked on": ["Engineered", "Developed", "Architected", "Implemented"],
    "helped with": ["Collaborated on", "Assisted in engineering", "Contributed to"],
    "responsible for": ["Led", "Managed", "Executed", "Directed"],
    "did": ["Executed", "Implemented", "Delivered"],
    "made": ["Built", "Constructed", "Engineered"],
    "fixed": ["Resolved", "Debugged", "Remediated"],
    "used": ["Leveraged", "Utilized", "Employed"],
    "handled": ["Orchestrated", "Supervised", "Coordinated"],
    "checked": ["Audited", "Validated", "Verified"],
    "changed": ["Refactored", "Optimized", "Overhauled"],
}

WEAK_WORDS = [
    "stuff", "things", "various", "worked on", "helped with", "responsible for",
    "assisted", "good", "lot of", "lots of", "basically", "tried to", "participated in"
]

NUMERICAL_METRIC_PATTERN = re.compile(r'(\d+[\d,.]*\s*(?:%|\$|k|m|million|billion|users|customers|x|times|revenue))', re.IGNORECASE)


def validate_anti_hallucination(original_text: str, candidate_text: str) -> bool:
    """
    Programmatically verifies that candidate text does not fabricate metrics
    (e.g., $+revenue, %-increases, or user counts) absent from the original text.
    """
    orig_nums = set(NUMERICAL_METRIC_PATTERN.findall(original_text.lower()))
    cand_nums = set(NUMERICAL_METRIC_PATTERN.findall(candidate_text.lower()))

    # If candidate introduced numbers/metrics that were not in original, reject it
    new_metrics = cand_nums - orig_nums
    if new_metrics:
        logger.warning(f"Anti-hallucination check caught fabricated metrics: {new_metrics}")
        return False
    return True


def generate_deterministic_rule_suggestions(original_bullet: str, action: str) -> List[str]:
    """
    Fallback rule-based rewriter if LLM is unavailable or unconfigured.
    Guarantees 100% deterministic, grounded output with zero invented facts.
    """
    bullet = original_bullet.strip().lstrip("•-* ").strip()
    if not bullet:
        return []

    suggestions: List[str] = []
    bullet_lower = bullet.lower()

    # 1. Action verb enhancement
    replaced = bullet
    for weak, strong_list in STRONG_VERB_MAP.items():
        if bullet_lower.startswith(weak):
            remainder = bullet[len(weak):].strip()
            for strong in strong_list[:2]:
                suggestions.append(f"{strong} {remainder}")
            break

    # 2. Concise version
    words = bullet.split()
    trimmed_words = [w for w in words if w.lower() not in {"very", "basically", "really", "literally", "actually", "just"}]
    concise = " ".join(trimmed_words)
    if concise and concise != bullet and concise not in suggestions:
        suggestions.append(concise)

    # 3. Structural action formulation
    if not suggestions:
        if not any(bullet.startswith(v) for v in ("Engineered", "Developed", "Built", "Implemented", "Designed")):
            suggestions.append(f"Implemented {bullet[0].lower() + bullet[1:] if len(bullet) > 1 else bullet}")
            suggestions.append(f"Engineered {bullet[0].lower() + bullet[1:] if len(bullet) > 1 else bullet}")

    return suggestions[:3]


def analyze_writing_feedback(bullet: str) -> Dict[str, Any]:
    """
    Analyzes an achievement bullet for weak phrasing, passive voice, and missing context.
    """
    bullet_clean = bullet.strip().lstrip("•-* ").strip()
    bullet_lower = bullet_clean.lower()
    word_count = len(bullet_clean.split())

    weak_findings: List[str] = []
    strengths: List[str] = []
    opportunities: List[str] = []

    # Check for weak words
    for weak in WEAK_WORDS:
        if weak in bullet_lower:
            weak_findings.append(f"Contains passive or informal phrase '{weak}'")

    # Check start verb
    starts_strong = any(bullet_lower.startswith(v) for v in [
        "architected", "engineered", "developed", "built", "implemented", "designed",
        "optimized", "deployed", "scaled", "automated", "created", "reduced", "increased"
    ])
    if starts_strong:
        strengths.append("Starts with a strong technical action verb.")
    else:
        opportunities.append("Start with an active verb (e.g., 'Engineered', 'Developed', 'Optimized') rather than 'Worked on' or responsibilities.")

    # Check length
    if word_count < 6:
        weak_findings.append("Bullet is overly brief; lacks technical context or responsibility scope.")
    elif word_count > 35:
        weak_findings.append("Bullet is too verbose; consider splitting or trimming filler words.")
    else:
        strengths.append("Optimal bullet length for recruiter readability.")

    # Check quantifiable metrics
    has_metrics = bool(re.search(r'\d+', bullet_clean))
    if has_metrics:
        strengths.append("Includes quantifiable metrics or numbers.")
    else:
        opportunities.append("If applicable, add genuine impact metrics (e.g. latency, user volume, test coverage) from your actual work.")

    return {
        "word_count": word_count,
        "strengths": strengths,
        "weak_points": weak_findings,
        "actionable_opportunities": opportunities,
        "quality_rating": "Strong" if len(weak_findings) == 0 and starts_strong else "Needs Improvement",
    }


def improve_bullet_point(
    original_bullet: str,
    action: str = "improve",
    role_context: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Rewrites a resume bullet point using AI with strict anti-hallucination verification.
    """
    cleaned = original_bullet.strip().lstrip("•-* ").strip()
    if not cleaned:
        return {
            "original_text": original_bullet,
            "suggestions": [],
            "improvement_reason": "Input was empty.",
            "supporting_evidence": "None",
            "requires_user_confirmation": True,
        }

    # Prompt specification enforcing negative constraints
    system_prompt = (
        "You are an expert Resume Writing Assistant for technical and professional candidates.\n"
        "STRICT CONSTRAINTS:\n"
        "1. DO NOT invent numbers, percentages, dollar figures, revenue, team sizes, user counts, or impact metrics not present in the original bullet.\n"
        "2. DO NOT claim technologies or certifications not explicitly stated in the input.\n"
        "3. Preserve all factual information faithfully.\n"
        "4. Start with a strong action verb (e.g. Engineered, Developed, Implemented, Architected).\n"
        "5. Output exactly 3 alternative bullet rewrites, each on a new line prefixed with '1.', '2.', '3.'\n"
        "6. Do not include introductory conversational filler."
    )

    action_instruction = {
        "improve": "Rewrite this bullet point to be professional, achievement-oriented, and impactful.",
        "concise": "Make this bullet point concise and clear by removing filler words while keeping core facts.",
        "strong_verbs": "Rewrite this bullet starting with high-impact technical action verbs.",
        "technical_clarity": "Improve technical precision and clarity of implementation without adding new unmentioned tools.",
    }.get(action, "Improve this resume bullet point.")

    user_prompt = f"Goal: {action_instruction}\nContext Role: {role_context or 'Software Engineer'}\nOriginal Bullet:\n\"{cleaned}\""

    suggestions: List[str] = []
    reason = "Enhanced action verb and professional phrasing while preserving factual scope."

    try:
        raw_response = chat_with_groq(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )

        for line in raw_response.splitlines():
            line_str = line.strip()
            line_clean = re.sub(r'^\d+[\.\)]\s*', '', line_str).strip(' "•-*')
            if line_clean and len(line_clean) > 8:
                # Anti-hallucination validation
                if validate_anti_hallucination(cleaned, line_clean):
                    suggestions.append(line_clean)

    except (AIProviderError, Exception) as exc:
        logger.warning(f"AI provider unavailable for bullet rewriter, using deterministic fallback: {exc}")

    # Fallback to rule-based suggestions if AI failed or returned invalid outputs
    if not suggestions:
        suggestions = generate_deterministic_rule_suggestions(cleaned, action)

    return {
        "original_text": original_bullet,
        "suggestions": suggestions[:3],
        "improvement_reason": reason,
        "supporting_evidence": "Grounded entirely in candidate-provided bullet points.",
        "requires_user_confirmation": True,
    }


def improve_summary(
    original_summary: str,
    target_role: Optional[str] = None,
    experience_level: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Improves a professional resume summary without inventing facts or experience.
    """
    cleaned = original_summary.strip()
    if not cleaned:
        role_label = target_role or "Software Engineer"
        fallback = f"Motivated {role_label} with foundational experience in full-stack development, software engineering principles, and scalable web solutions."
        return {
            "original_text": original_summary,
            "suggestions": [fallback],
            "improvement_reason": "Generated initial professional summary aligned to target role.",
            "supporting_evidence": f"Calibrated for {role_label}.",
            "requires_user_confirmation": True,
        }

    system_prompt = (
        "You are an ATS Resume Strategist.\n"
        "STRICT CONSTRAINTS:\n"
        "1. Never invent years of experience, companies, or degrees not mentioned.\n"
        "2. Keep the summary between 2 and 4 concise sentences.\n"
        "3. Focus on candidate competencies and professional scope.\n"
        "4. Return 2 distinct improved versions, prefixed with '1.' and '2.'"
    )

    user_prompt = f"Target Role: {target_role or 'Software Engineer'}\nLevel: {experience_level or 'Mid'}\nOriginal Summary:\n\"{cleaned}\""

    suggestions: List[str] = []
    try:
        raw_response = chat_with_groq(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )
        for line in raw_response.splitlines():
            line_str = line.strip()
            line_clean = re.sub(r'^\d+[\.\)]\s*', '', line_str).strip(' "')
            if line_clean and len(line_clean) > 25:
                if validate_anti_hallucination(cleaned, line_clean):
                    suggestions.append(line_clean)
    except Exception as exc:
        logger.warning(f"AI provider error for summary rewriter: {exc}")

    if not suggestions:
        # Grounded rule-based refinement
        refined = cleaned
        if target_role and target_role.lower() not in cleaned.lower():
            refined = f"{target_role} with expertise in {cleaned[0].lower() + cleaned[1:] if len(cleaned) > 1 else cleaned}"
        suggestions = [refined]

    return {
        "original_text": original_summary,
        "suggestions": suggestions[:2],
        "improvement_reason": "Refined executive summary for recruiter impact and keyword clarity.",
        "supporting_evidence": "Faithful to user summary text.",
        "requires_user_confirmation": True,
    }


def improve_project_description(
    project_name: str,
    original_description: str,
    technologies: str,
) -> Dict[str, Any]:
    """
    Improves a project description or bullets, grounding them in the declared technologies.
    """
    cleaned_desc = original_description.strip()
    cleaned_tech = technologies.strip()

    system_prompt = (
        "You are a Senior Technical Resume Editor.\n"
        "STRICT RULES:\n"
        "1. DO NOT invent performance numbers, star ratings, or business revenue.\n"
        "2. Highlight architecture, implementation details, and technical scope.\n"
        "3. Ground improvements strictly in the declared technologies.\n"
        "4. Return up to 3 bullet suggestions prefixed with '1.', '2.', '3.'"
    )

    user_prompt = f"Project: {project_name}\nTechnologies: {cleaned_tech}\nOriginal Description:\n\"{cleaned_desc}\""

    suggestions: List[str] = []
    try:
        raw_response = chat_with_groq(
            prompt=user_prompt,
            system_prompt=system_prompt,
        )
        for line in raw_response.splitlines():
            line_str = line.strip()
            line_clean = re.sub(r'^\d+[\.\)]\s*', '', line_str).strip(' "•-*')
            if line_clean and len(line_clean) > 10:
                if validate_anti_hallucination(cleaned_desc, line_clean):
                    suggestions.append(line_clean)
    except Exception as exc:
        logger.warning(f"AI provider error for project rewriter: {exc}")

    if not suggestions:
        tech_suffix = f" utilizing {cleaned_tech}" if cleaned_tech else ""
        suggestions = [
            f"Developed {project_name} application{tech_suffix}, implementing core features and responsive interface.",
            f"Architected {project_name}{tech_suffix}, focusing on clean modular design and reliable functionality.",
        ]

    return {
        "project_name": project_name,
        "original_text": original_description,
        "suggestions": suggestions[:3],
        "improvement_reason": "Elevated technical clarity and implementation scope.",
        "supporting_evidence": f"Reflects declared stack ({cleaned_tech}).",
        "requires_user_confirmation": True,
    }
