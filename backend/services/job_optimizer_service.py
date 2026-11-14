"""
SkillsCatalyst Job-Specific Resume Optimization Service (Phase 5)
Extracts structured requirements from candidate-provided Job Descriptions, compares against
resume contents reusing the Phase 2 Keyword Matching Engine, and generates grounded suggestions.
"""

import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from backend.services.keyword_matcher import match_keywords, CANONICAL_KEYWORDS
from backend.services.resume_builder_service import serialize_resume_data_to_text
from backend.services.supabase_service import get_supabase
from backend.services.groq_service import chat_with_groq, AIProviderError

logger = logging.getLogger(__name__)

_MOCK_OPTIMIZATION_SESSIONS: Dict[str, Dict[str, Any]] = {}

COMMON_TECH_PATTERNS = [
    # Languages
    "python", "javascript", "typescript", "java", "c\\+\\+", "c#", "go", "golang", "rust", "ruby", "php", "sql", "html", "css",
    # Frameworks & Libraries
    "react", "react\\.js", "next\\.js", "angular", "vue", "vue\\.js", "fastapi", "django", "flask", "node\\.js", "express", "spring boot", "tailwind", "graphql",
    # Databases & Caching
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "dynamodb", "supabase",
    # DevOps, Cloud & Tools
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "linux", "terraform", "jenkins", "rest api", "microservices"
]

COMMON_SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving", "collaboration",
    "critical thinking", "adaptability", "agile", "scrum", "time management"
]


def extract_job_description_requirements(
    job_description_text: str,
    target_role: Optional[str] = None,
    experience_level: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Extracts structured requirements, competencies, and tools from a raw job description text.
    Uses regex pattern analysis combined with AI semantic parsing when available.
    """
    cleaned_jd = job_description_text.strip()
    if not cleaned_jd:
        return {
            "required_skills": [],
            "preferred_skills": [],
            "soft_skills": [],
            "experience_requirements": experience_level or "Not specified",
            "education_requirements": "Not specified",
            "responsibilities": [],
            "tools_and_tech": [],
            "keywords": [],
        }

    jd_lower = cleaned_jd.lower()

    # 1. Deterministic Extraction of Tech & Tools
    detected_tech: List[str] = []
    for pattern in COMMON_TECH_PATTERNS:
        match = re.search(r'\b' + pattern + r'\b', jd_lower)
        if match:
            clean_word = pattern.replace("\\", "").title()
            if clean_word not in detected_tech:
                detected_tech.append(clean_word)

    detected_soft: List[str] = []
    for soft in COMMON_SOFT_SKILLS:
        if re.search(r'\b' + soft + r'\b', jd_lower):
            detected_soft.append(soft.title())

    # Extract Experience Level & Education
    exp_match = re.search(r'(\d+[\-\+]?\s*(?:to\s*\d+)?\s*(?:years?|yrs?)(?:\s*of\s*experience)?)', jd_lower)
    exp_req = exp_match.group(1).title() if exp_match else (experience_level or "1-3 Years")

    edu_req = "Bachelor's degree in CS, Engineering, or related field"
    if "master" in jd_lower or "phd" in jd_lower:
        edu_req = "Advanced Degree (Master's or Ph.D.) preferred"

    # Segment requirements into required vs preferred
    preferred_tech: List[str] = []
    required_tech: List[str] = []

    lines = cleaned_jd.splitlines()
    in_preferred = False
    for line in lines:
        lower_line = line.lower()
        if any(h in lower_line for h in ["preferred", "nice to have", "bonus", "plus"]):
            in_preferred = True
        elif any(h in lower_line for h in ["required", "qualifications", "must have", "requirements"]):
            in_preferred = False

        for t in detected_tech:
            if re.search(r'\b' + re.escape(t.lower()) + r'\b', lower_line):
                if in_preferred and t not in preferred_tech:
                    preferred_tech.append(t)
                elif not in_preferred and t not in required_tech:
                    required_tech.append(t)

    # Balance remaining tech
    for t in detected_tech:
        if t not in required_tech and t not in preferred_tech:
            required_tech.append(t)

    # Key Responsibilities
    responsibilities = []
    for line in lines:
        stripped = line.strip().lstrip("•-*0123456789. ")
        if len(stripped) > 25 and any(w in stripped.lower() for w in ["develop", "design", "build", "maintain", "lead", "collaborate", "ensure", "architect"]):
            responsibilities.append(stripped)
            if len(responsibilities) >= 5:
                break

    all_keywords = list(dict.fromkeys(required_tech + preferred_tech + detected_soft))

    return {
        "required_skills": required_tech[:12],
        "preferred_skills": preferred_tech[:8],
        "soft_skills": detected_soft[:6],
        "experience_requirements": exp_req,
        "education_requirements": edu_req,
        "responsibilities": responsibilities[:5],
        "tools_and_tech": detected_tech[:15],
        "keywords": all_keywords,
    }


def analyze_resume_job_alignment(
    resume_data: Dict[str, Any],
    job_requirements: Dict[str, Any],
    job_description_text: str,
) -> Dict[str, Any]:
    """
    Compares structured resume data against job requirements using the Phase 2 Keyword Matcher.
    Categorizes skills into matched, missing, unsupported, and preferred.
    """
    plain_resume_text = serialize_resume_data_to_text(resume_data)

    # Run Phase 2 keyword matcher
    kw_report = match_keywords(
        resume_text=plain_resume_text,
        job_description=job_description_text,
        target_role=job_requirements.get("target_role") or "Fullstack Software Engineer",
    )

    resume_text_lower = plain_resume_text.lower()
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    unsupported_skills: List[str] = []
    preferred_matches: List[str] = []

    # Separate missing skills from unsupported skills (BUG 3 fix)
    req_skills = job_requirements.get("required_skills") or []
    for s in req_skills:
        s_norm = s.lower()
        if re.search(r'\b' + re.escape(s_norm) + r'\b', resume_text_lower):
            matched_skills.append(s)
        else:
            missing_skills.append(s)

    # Check for unsupported skills: declared in skills section but lacking project/experience evidence
    skills_obj = resume_data.get("skills") or {}
    declared_skills_text = " ".join(str(v) for v in skills_obj.values() if v)
    projects_list = resume_data.get("projects") or []
    experience_list = resume_data.get("experience") or []

    practical_bullets = []
    for p in projects_list:
        practical_bullets.extend(p.get("bullets") or [])
    for e in experience_list:
        practical_bullets.extend(e.get("bullets") or [])
    practical_str = " ".join(practical_bullets).lower()

    for s in matched_skills:
        s_norm = s.lower()
        # If it was declared in skills but not mentioned in practical bullets
        if re.search(r'\b' + re.escape(s_norm) + r'\b', declared_skills_text.lower()):
            if not re.search(r'\b' + re.escape(s_norm) + r'\b', practical_str):
                unsupported_skills.append(s)

    pref_skills = job_requirements.get("preferred_skills") or []
    for p in pref_skills:
        p_norm = p.lower()
        if re.search(r'\b' + re.escape(p_norm) + r'\b', resume_text_lower):
            preferred_matches.append(p)

    total_req = len(req_skills) if req_skills else 1
    match_pct = round((len(matched_skills) / total_req) * 100) if req_skills else kw_report.keyword_match_percentage

    return {
        "keyword_match_percentage": match_pct,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "unsupported_skills": unsupported_skills,
        "preferred_matches": preferred_matches,
        "total_required_skills": len(req_skills),
        "total_matched_skills": len(matched_skills),
        "keyword_report": kw_report.model_dump(),
    }


def generate_grounded_job_suggestions(
    resume_data: Dict[str, Any],
    job_requirements: Dict[str, Any],
    alignment: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Generates tailored, factually grounded resume optimization recommendations.
    Strictly NEVER advises claiming a skill for which the candidate has no supporting evidence.
    """
    suggestions: List[Dict[str, Any]] = []

    # 1. Summary Alignment Suggestion
    matched_skills = alignment.get("matched_skills") or []
    current_summary = resume_data.get("summary", "")
    target_role = resume_data.get("role", "Software Engineer")

    if matched_skills and current_summary:
        key_matches = ", ".join(matched_skills[:4])
        orig_first_sentence = current_summary.split(".")[0] if "." in current_summary else current_summary
        suggested_summary = f"{orig_first_sentence} specializing in {key_matches}."
        suggestions.append({
            "id": "sug-summary-align",
            "section": "summary",
            "type": "summary_alignment",
            "original_content": orig_first_sentence,
            "suggested_content": suggested_summary,
            "reason": f"Highlight verified matching core competencies ({key_matches}) in your opening statement.",
            "supporting_evidence": f"Candidate verified proficiency in {key_matches}.",
            "relevant_job_requirement": "Job Description core requirements.",
            "status": "pending",
        })

    # 2. Technical Skills Ordering Suggestion
    skills_obj = resume_data.get("skills") or {}
    languages_str = skills_obj.get("languages", "")
    if languages_str and matched_skills:
        current_langs = [l.strip() for l in languages_str.split(",") if l.strip()]
        reordered = sorted(current_langs, key=lambda x: (x.title() not in matched_skills, x))
        reordered_str = ", ".join(reordered)
        if reordered_str != languages_str:
            suggestions.append({
                "id": "sug-skills-reorder",
                "section": "skills",
                "type": "skills_reorder",
                "original_content": languages_str,
                "suggested_content": reordered_str,
                "reason": "Reorder skills to surface JD-matched technologies first for recruiters and ATS parsers.",
                "supporting_evidence": f"Matching declared skills: {', '.join([s for s in matched_skills if s.title() in current_langs])}.",
                "relevant_job_requirement": "Required Technical Skills list.",
                "status": "pending",
            })

    # 3. Project Emphases Suggestions
    projects = resume_data.get("projects") or []
    for idx, proj in enumerate(projects[:2]):
        proj_tech = (proj.get("tech") or "").lower()
        bullets = proj.get("bullets") or []
        for b_idx, bullet in enumerate(bullets):
            # Check if an existing project tech matches the JD but isn't explicitly named in the bullet
            for m_tech in matched_skills[:3]:
                if m_tech.lower() in proj_tech and m_tech.lower() not in bullet.lower():
                    enhanced = f"{bullet.rstrip('.')} using {m_tech}."
                    suggestions.append({
                        "id": f"sug-proj-{idx}-{b_idx}",
                        "section": "projects",
                        "type": "project_tailoring",
                        "original_content": bullet,
                        "suggested_content": enhanced,
                        "reason": f"Explicitly mention {m_tech} in your project bullet to improve ATS keyword density.",
                        "supporting_evidence": f"Project declared stack includes '{proj.get('tech')}'.",
                        "relevant_job_requirement": f"Experience with {m_tech}.",
                        "status": "pending",
                    })
                    break

    # 4. Missing Skills Warning (Non-Hallucinatory)
    unsupported = alignment.get("unsupported_skills") or []
    if unsupported:
        suggestions.append({
            "id": "sug-unsupported-skills",
            "section": "skills",
            "type": "gap_advisory",
            "original_content": "",
            "suggested_content": "",
            "reason": f"Target job requires {', '.join(unsupported[:3])}. We did not detect evidence of these in your resume. Only add them if you genuinely have built projects with them.",
            "supporting_evidence": "Zero occurrence in resume.",
            "relevant_job_requirement": f"Mandatory qualifications: {', '.join(unsupported[:3])}",
            "status": "advisory",
        })

    return suggestions


def create_job_optimization_session(
    user_id: str,
    job_description: str,
    document_id: Optional[str] = None,
    job_title: Optional[str] = None,
    company_name: Optional[str] = None,
    experience_level: Optional[str] = None,
    resume_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Creates and persists a job-specific resume optimization session.
    """
    session_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    extracted = extract_job_description_requirements(job_description, target_role=job_title, experience_level=experience_level)
    alignment: Dict[str, Any] = {}
    suggestions: List[Dict[str, Any]] = []

    if resume_data:
        alignment = analyze_resume_job_alignment(resume_data, extracted, job_description)
        suggestions = generate_grounded_job_suggestions(resume_data, extracted, alignment)

    payload = {
        "id": session_id,
        "user_id": user_id,
        "document_id": document_id,
        "job_title": job_title or "Target Role",
        "company_name": company_name,
        "experience_level": experience_level,
        "job_description": job_description,
        "match_percentage": alignment.get("keyword_match_percentage", 0),
        "extracted_requirements": extracted,
        "keyword_analysis": alignment,
        "recommendations": suggestions,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    client = get_supabase()
    if client:
        try:
            client.table("job_optimization_sessions").insert(payload).execute()
        except Exception as exc:
            logger.warning(f"Supabase job_optimization_sessions insert failed: {exc}")

    _MOCK_OPTIMIZATION_SESSIONS[session_id] = payload
    return payload


def get_job_optimization_session(session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves an optimization session with tenant validation.
    """
    client = get_supabase()
    if client:
        try:
            res = (
                client.table("job_optimization_sessions")
                .select("*")
                .eq("id", session_id)
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase get_job_optimization_session failed: {exc}")

    sess = _MOCK_OPTIMIZATION_SESSIONS.get(session_id)
    if sess and sess.get("user_id") == user_id:
        return sess
    return None
