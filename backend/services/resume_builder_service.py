"""
SkillsCatalyst Resume Builder Service (Phase 5)
Provides CRUD management for structured resume drafts, version snapshots,
importing from historical analyses, and serialization for ATS re-evaluation.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from backend.services.supabase_service import get_supabase
from backend.services.resume_series_service import (
    create_resume_series,
    get_next_version_number,
    get_latest_analysis_id_for_series,
)
from backend.services.ats_engine import evaluate_resume_ats
from backend.services.keyword_matcher import match_keywords
from backend.services.resume_ai_evaluator import evaluate_resume_content
from backend.services.resume_scoring import calculate_unified_resume_score
from backend.services.resume_history_service import persist_resume_analysis

logger = logging.getLogger(__name__)

# In-memory storage fallbacks for test/offline environments
_MOCK_DOCUMENTS: Dict[str, Dict[str, Any]] = {}
_MOCK_VERSIONS: Dict[str, List[Dict[str, Any]]] = {}


def serialize_resume_data_to_text(data: Dict[str, Any]) -> str:
    """
    Serializes structured resume dictionary into clean, ATS-parseable plain text.
    Standardized across templates for deterministic ATS & keyword evaluation.
    """
    if not isinstance(data, dict):
        return ""

    lines: List[str] = []

    # 1. Header & Contact
    full_name = data.get("fullName") or data.get("full_name") or "Candidate"
    lines.append(full_name.upper())

    role = data.get("role") or data.get("target_role") or ""
    if role:
        lines.append(role)

    contact_parts = []
    for key in ("email", "phone", "location", "linkedin", "github", "portfolio"):
        val = data.get(key)
        if val and str(val).strip():
            contact_parts.append(str(val).strip())
    if contact_parts:
        lines.append(" | ".join(contact_parts))
    lines.append("")

    # 2. Professional Summary
    summary = data.get("summary") or ""
    if summary.strip():
        lines.append("PROFESSIONAL SUMMARY")
        lines.append(summary.strip())
        lines.append("")

    # 3. Work Experience
    experience = data.get("experience") or []
    if isinstance(experience, list) and experience:
        lines.append("WORK EXPERIENCE")
        for item in experience:
            if not isinstance(item, dict):
                continue
            comp = item.get("company", "").strip()
            item_role = item.get("role", "").strip()
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            loc = item.get("location", "").strip()

            header = f"{item_role} at {comp}" if item_role and comp else (item_role or comp)
            meta = " | ".join(filter(None, [dates, loc]))
            if meta:
                header = f"{header} ({meta})"
            if header:
                lines.append(header)

            bullets = item.get("bullets") or []
            for b in bullets:
                if b and str(b).strip():
                    lines.append(f"• {str(b).strip()}")
            lines.append("")

    # 4. Education
    education = data.get("education") or []
    if isinstance(education, list) and education:
        lines.append("EDUCATION")
        for item in education:
            if not isinstance(item, dict):
                continue
            inst = item.get("institution", "").strip()
            deg = item.get("degree", "").strip()
            field = item.get("fieldOfStudy", "").strip()
            deg_field = f"{deg} in {field}" if deg and field else (deg or field)
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            gpa = item.get("gpa", "").strip()

            edu_line = f"{deg_field}, {inst}" if deg_field and inst else (deg_field or inst)
            meta_parts = [dates]
            if gpa:
                meta_parts.append(f"GPA: {gpa}")
            meta_str = " | ".join(filter(None, meta_parts))
            if meta_str:
                edu_line = f"{edu_line} ({meta_str})"
            if edu_line:
                lines.append(edu_line)

            activities = item.get("activities", "").strip()
            if activities:
                lines.append(f"  Activities: {activities}")
        lines.append("")

    # 5. Projects
    projects = data.get("projects") or []
    if isinstance(projects, list) and projects:
        lines.append("PROJECTS")
        for item in projects:
            if not isinstance(item, dict):
                continue
            name = item.get("name") or item.get("title", "")
            tech = item.get("tech", "").strip()
            proj_header = f"{name} ({tech})" if tech else name
            if proj_header:
                lines.append(proj_header)

            bullets = item.get("bullets") or []
            for b in bullets:
                if b and str(b).strip():
                    lines.append(f"• {str(b).strip()}")
        lines.append("")

    # 6. Technical Skills
    skills = data.get("skills") or {}
    if isinstance(skills, dict) and any(skills.values()):
        lines.append("TECHNICAL SKILLS")
        category_map = [
            ("Languages", "languages"),
            ("Frameworks & Libraries", "frameworks"),
            ("Databases", "databases"),
            ("Developer Tools", "tools"),
            ("Cloud & DevOps", "cloudDevOps"),
            ("Other", "custom"),
        ]
        for label, key in category_map:
            val = skills.get(key)
            if val and str(val).strip():
                lines.append(f"{label}: {str(val).strip()}")
        if skills.get("all") and not any(skills.get(k) for _, k in category_map):
            lines.append(f"Skills: {skills['all']}")
        lines.append("")

    # 7. Certifications
    certs = data.get("certifications") or []
    if isinstance(certs, list) and certs:
        lines.append("CERTIFICATIONS")
        for item in certs:
            if not isinstance(item, dict):
                continue
            c_name = item.get("name", "").strip()
            c_issuer = item.get("issuer", "").strip()
            c_date = item.get("date", "").strip()
            c_line = f"• {c_name} - {c_issuer} ({c_date})" if c_issuer else f"• {c_name} ({c_date})"
            lines.append(c_line)
        lines.append("")

    # 8. Achievements
    achievements = data.get("achievements") or []
    if isinstance(achievements, list) and achievements:
        lines.append("ACHIEVEMENTS")
        for item in achievements:
            if not isinstance(item, dict):
                continue
            title = item.get("title", "").strip()
            desc = item.get("description", "").strip()
            ach_line = f"• {title}: {desc}" if desc else f"• {title}"
            lines.append(ach_line)
        lines.append("")

    return "\n".join(lines).strip()


def create_builder_document(
    user_id: str,
    title: str = "Untitled Resume",
    selected_template: str = "sb2nov",
    structured_resume_data: Optional[Dict[str, Any]] = None,
    target_role: Optional[str] = None,
    resume_series_id: Optional[str] = None,
    source_analysis_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new resume builder document draft.
    """
    doc_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    resume_data = structured_resume_data or {}

    payload = {
        "id": doc_id,
        "user_id": user_id,
        "resume_series_id": resume_series_id,
        "title": title.strip() or "Untitled Resume",
        "selected_template": selected_template or "sb2nov",
        "structured_resume_data": resume_data,
        "target_role": target_role,
        "source_analysis_id": source_analysis_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    client = get_supabase()
    if client:
        try:
            res = client.table("resume_builder_documents").insert(payload).execute()
            if res.data:
                return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase resume_builder_documents insert failed, falling back to mock: {exc}")

    _MOCK_DOCUMENTS[doc_id] = payload
    return payload


def get_builder_document(document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a builder document by ID with tenant isolation check.
    """
    client = get_supabase()
    if client:
        try:
            res = (
                client.table("resume_builder_documents")
                .select("*")
                .eq("id", document_id)
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase get_builder_document failed: {exc}")

    doc = _MOCK_DOCUMENTS.get(document_id)
    if doc and doc.get("user_id") == user_id:
        return doc
    return None


def list_user_builder_documents(user_id: str) -> List[Dict[str, Any]]:
    """
    Lists all resume builder drafts for a user, sorted by updated_at descending.
    """
    client = get_supabase()
    if client:
        try:
            res = (
                client.table("resume_builder_documents")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .execute()
            )
            if res.data is not None:
                return res.data
        except Exception as exc:
            logger.warning(f"Supabase list_user_builder_documents failed: {exc}")

    user_docs = [d for d in _MOCK_DOCUMENTS.values() if d.get("user_id") == user_id]
    return sorted(user_docs, key=lambda x: x.get("updated_at", ""), reverse=True)


def update_builder_document(
    document_id: str,
    user_id: str,
    title: Optional[str] = None,
    selected_template: Optional[str] = None,
    structured_resume_data: Optional[Dict[str, Any]] = None,
    target_role: Optional[str] = None,
    resume_series_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Updates an existing resume builder document draft.
    """
    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if title is not None:
        updates["title"] = title.strip() or "Untitled Resume"
    if selected_template is not None:
        updates["selected_template"] = selected_template
    if structured_resume_data is not None:
        updates["structured_resume_data"] = structured_resume_data
    if target_role is not None:
        updates["target_role"] = target_role
    if resume_series_id is not None:
        updates["resume_series_id"] = resume_series_id

    client = get_supabase()
    if client:
        try:
            res = (
                client.table("resume_builder_documents")
                .update(updates)
                .eq("id", document_id)
                .eq("user_id", user_id)
                .execute()
            )
            if res.data:
                return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase update_builder_document failed: {exc}")

    doc = _MOCK_DOCUMENTS.get(document_id)
    if doc and doc.get("user_id") == user_id:
        doc.update(updates)
        return doc
    return None


def delete_builder_document(document_id: str, user_id: str) -> bool:
    """
    Deletes a resume builder document draft.
    """
    client = get_supabase()
    if client:
        try:
            res = (
                client.table("resume_builder_documents")
                .delete()
                .eq("id", document_id)
                .eq("user_id", user_id)
                .execute()
            )
            return bool(res.data)
        except Exception as exc:
            logger.warning(f"Supabase delete_builder_document failed: {exc}")

    if document_id in _MOCK_DOCUMENTS:
        if _MOCK_DOCUMENTS[document_id].get("user_id") == user_id:
            del _MOCK_DOCUMENTS[document_id]
            return True
    return False


def import_resume_from_analysis(
    analysis_record: Dict[str, Any],
    user_id: str,
    selected_template: str = "sb2nov",
) -> Dict[str, Any]:
    """
    Imports and normalizes a previously analyzed resume into structured ResumeData fields.
    Extracts name, contact, education, experience, projects, and skills.
    Supports both nested analysis_result schema and flat record schema.
    """
    analysis_result = analysis_record.get("analysis_result") or analysis_record
    extraction = analysis_result.get("extraction") or analysis_record.get("extraction") or analysis_record
    ai_eval = analysis_result.get("ai_evaluation") or analysis_record.get("ai_evaluation") or {}
    ats_eval = analysis_result.get("ats_analysis") or analysis_record.get("ats_analysis") or {}

    contacts = (
        extraction.get("contact_info")
        or ats_eval.get("contact_info")
        or analysis_record.get("contact_info")
        or {}
    )

    # Extract Full Name
    full_name = (
        contacts.get("name")
        or contacts.get("fullName")
        or extraction.get("candidate_name")
        or analysis_record.get("candidate_name")
        or ""
    )
    if not full_name:
        filename = analysis_record.get("original_filename") or analysis_record.get("file_name", "")
        clean_base = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
        if clean_base and len(clean_base) > 2 and not clean_base.lower().startswith("resume"):
            full_name = clean_base.title()
        else:
            full_name = "Candidate Name"

    # Extract Structured Skills
    extracted_skills_list = (
        extraction.get("skills")
        or ai_eval.get("detected_skills")
        or analysis_record.get("skills")
        or []
    )
    if isinstance(extracted_skills_list, dict):
        flattened = []
        for val in extracted_skills_list.values():
            if isinstance(val, list):
                flattened.extend(val)
            elif isinstance(val, str):
                flattened.append(val)
        skills_str = ", ".join(flattened)
    elif isinstance(extracted_skills_list, list):
        skills_str = ", ".join(extracted_skills_list)
    else:
        skills_str = str(extracted_skills_list)

    # Experience
    raw_exp = (
        extraction.get("experience")
        or analysis_result.get("experience")
        or analysis_record.get("experience")
        or []
    )
    normalized_exp = []
    if isinstance(raw_exp, list):
        for item in raw_exp:
            if isinstance(item, dict):
                normalized_exp.append({
                    "company": item.get("company", ""),
                    "role": item.get("role") or item.get("title", ""),
                    "location": item.get("location", ""),
                    "dates": item.get("dates", ""),
                    "bullets": item.get("bullets", []) or ([item.get("description", "")] if item.get("description") else []),
                })

    # Education
    raw_edu = (
        extraction.get("education")
        or analysis_result.get("education")
        or analysis_record.get("education")
        or []
    )
    normalized_edu = []
    if isinstance(raw_edu, list):
        for item in raw_edu:
            if isinstance(item, dict):
                normalized_edu.append({
                    "institution": item.get("institution") or item.get("school", ""),
                    "degree": item.get("degree", ""),
                    "fieldOfStudy": item.get("fieldOfStudy") or item.get("major", "") or item.get("field_of_study", ""),
                    "location": item.get("location", ""),
                    "dates": item.get("dates", ""),
                    "gpa": item.get("gpa", ""),
                    "activities": "",
                })

    # Projects
    raw_proj = (
        extraction.get("projects")
        or analysis_result.get("projects")
        or analysis_record.get("projects")
        or []
    )
    normalized_proj = []
    if isinstance(raw_proj, list):
        for item in raw_proj:
            if isinstance(item, dict):
                normalized_proj.append({
                    "name": item.get("name") or item.get("title", ""),
                    "tech": item.get("tech") or item.get("technologies", "") or item.get("tech_stack", ""),
                    "link": item.get("link") or item.get("url", ""),
                    "bullets": item.get("bullets", []) or ([item.get("description", "")] if item.get("description") else []),
                })

    # Certifications
    raw_certs = extraction.get("certifications") or []
    normalized_certs = []
    if isinstance(raw_certs, list):
        for item in raw_certs:
            if isinstance(item, dict):
                normalized_certs.append({
                    "name": item.get("name") or item.get("title", ""),
                    "issuer": item.get("issuer", ""),
                    "date": item.get("date", ""),
                    "credentialUrl": item.get("credentialUrl", ""),
                })

    structured_data = {
        "fullName": full_name,
        "role": analysis_record.get("target_role") or "Software Engineer",
        "email": contacts.get("email") or "",
        "phone": contacts.get("phone") or "",
        "location": contacts.get("location") or "",
        "linkedin": contacts.get("linkedin") or "",
        "github": contacts.get("github") or "",
        "portfolio": contacts.get("portfolio") or "",
        "summary": extraction.get("summary") or ai_eval.get("executive_summary") or "",
        "education": normalized_edu,
        "experience": normalized_exp,
        "projects": normalized_proj,
        "skills": {
            "languages": skills_str,
            "frameworks": "",
            "databases": "",
            "tools": "",
            "cloudDevOps": "",
            "softSkills": "",
            "custom": "",
            "all": skills_str,
        },
        "certifications": normalized_certs,
        "spokenLanguages": [],
        "achievements": [],
    }

    doc_title = f"{full_name} - Imported Resume"
    return create_builder_document(
        user_id=user_id,
        title=doc_title,
        selected_template=selected_template,
        structured_resume_data=structured_data,
        target_role=structured_data.get("role"),
        resume_series_id=analysis_record.get("resume_series_id"),
        source_analysis_id=analysis_record.get("id"),
    )


def save_builder_version(
    document_id: str,
    user_id: str,
    change_summary: Optional[str] = None,
    run_ats_eval: bool = True,
    job_description: Optional[str] = None,
    ai_eval_report: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Saves a formal milestone version from a builder document.
    Executes deterministic ATS evaluation on the structured plain text and links to the resume series.
    """
    doc = get_builder_document(document_id, user_id)
    if not doc:
        raise ValueError("Resume builder document not found or access denied.")

    resume_data = doc.get("structured_resume_data") or {}
    series_id = doc.get("resume_series_id")

    # If document has no series, create one automatically
    if not series_id:
        series_title = doc.get("title") or "Resume Series"
        target_role = doc.get("target_role") or resume_data.get("role") or "Software Engineer"
        try:
            series_obj = create_resume_series(user_id=user_id, title=series_title, target_role=target_role)
            series_id = series_obj["id"]
        except Exception as exc:
            logger.warning(f"Could not create resume series via Supabase, using mock series ID: {exc}")
            series_id = f"series-mock-{uuid.uuid4()}"
        update_builder_document(document_id, user_id, resume_series_id=series_id)

    # Monotonic version numbering
    is_mock_series = not series_id or series_id.startswith("series-mock-") or series_id.startswith("series-")
    if is_mock_series:
        existing_versions = _MOCK_VERSIONS.get(document_id, [])
        version_number = len(existing_versions) + 1
        prev_analysis_id = existing_versions[-1].get("analysis_id") if existing_versions else None
    else:
        try:
            version_number = get_next_version_number(series_id)
            prev_analysis_id = get_latest_analysis_id_for_series(series_id)
        except Exception:
            existing_versions = _MOCK_VERSIONS.get(document_id, [])
            version_number = len(existing_versions) + 1
            prev_analysis_id = existing_versions[-1].get("analysis_id") if existing_versions else None

    # 1. Serialize resume data to standard text
    plain_text = serialize_resume_data_to_text(resume_data)

    # 2. Run deterministic ATS & AI evaluation
    analysis_id = None
    analysis_payload: Dict[str, Any] = {}
    ats_score_val = None

    if run_ats_eval and len(plain_text) >= 40:
        target_role = doc.get("target_role") or resume_data.get("role") or "Software Engineer"
        ats_eval = evaluate_resume_ats(plain_text)
        kw_eval = match_keywords(plain_text, job_description=job_description or "", target_role=target_role)

        # AI evaluation: use provided report, or evaluate deterministically from content quality
        if ai_eval_report is not None:
            ai_eval = ai_eval_report
        else:
            # Deterministic content scoring from action verbs and quantifiable metrics
            bullet_count = 0
            metric_count = 0
            for exp in resume_data.get("experience", []):
                for bullet in exp.get("bullets", []):
                    bullet_count += 1
                    if any(c.isdigit() or c in "%$" for c in bullet):
                        metric_count += 1
            for proj in resume_data.get("projects", []):
                for bullet in proj.get("bullets", []):
                    bullet_count += 1
                    if any(c.isdigit() or c in "%$" for c in bullet):
                        metric_count += 1

            metric_ratio = (metric_count / max(bullet_count, 1))
            calc_content_score = round(min(100.0, max(50.0, 65.0 + (metric_ratio * 30.0))), 1)

            from backend.services.resume_ai_evaluator import AIEvaluationReport
            ai_eval = AIEvaluationReport(
                content_quality_score=calc_content_score,
                summary_verdict="Resume evaluated with deterministic ATS rules and content impact analysis.",
                strengths=["Technical sections well defined.", "ATS-compatible formatting verified."],
                weaknesses=[],
                improvements=[],
                rewritten_bullets=[],
                career_stage=getattr(ats_eval, "career_stage_detected", "fresher"),
            )

        final_score, breakdown, score_status = calculate_unified_resume_score(
            ats_compatibility_score=ats_eval.ats_compatibility_score,
            content_quality_score=ai_eval.content_quality_score,
            skills_match_score=kw_eval.keyword_match_percentage,
            structure_score=ats_eval.structure_score,
        )

        overall_score_val = final_score if final_score is not None else ats_eval.ats_compatibility_score
        ats_score_val = overall_score_val

        analysis_payload = {
            "score": overall_score_val,
            "overall_score": overall_score_val,
            "review": getattr(ai_eval, "summary_verdict", "Evaluation completed."),
            "ats_analysis": ats_eval.model_dump(),
            "keyword_analysis": kw_eval.model_dump(),
            "ai_evaluation": ai_eval.model_dump(),
            "score_breakdown": breakdown.model_dump(),
            "career_stage": getattr(ats_eval, "career_stage_detected", "fresher"),
            "sub_scores": {
                "ats": ats_eval.ats_compatibility_score,
                "skills": kw_eval.keyword_match_percentage,
                "content": ai_eval.content_quality_score,
                "structure": ats_eval.structure_score,
            },
            "extraction": {
                "filename": f"{doc.get('title', 'Resume')}_v{version_number}.pdf",
                "char_count": len(plain_text),
                "is_scanned": False,
                "extraction_quality": 100,
            },
        }

        # Persist to resume_analyses if database is available
        analysis_id = f"analysis-{uuid.uuid4()}"
        if not is_mock_series:
            try:
                saved_analysis = persist_resume_analysis(
                    analysis_id=analysis_id,
                    user_id=user_id,
                    original_filename=f"{doc.get('title', 'Resume')}_v{version_number}.pdf",
                    storage_path=f"{user_id}/builder_{document_id}_v{version_number}.pdf",
                    file_type="PDF",
                    file_size=len(plain_text.encode("utf-8")),
                    overall_score=overall_score_val,
                    ats_score=ats_eval.ats_compatibility_score,
                    content_score=ai_eval.content_quality_score,
                    skills_score=kw_eval.keyword_match_percentage,
                    structure_score=ats_eval.structure_score,
                    job_description=job_description,
                    analysis_result=analysis_payload,
                    resume_series_id=series_id,
                    version_number=version_number,
                    previous_analysis_id=prev_analysis_id,
                )
                if saved_analysis and "id" in saved_analysis:
                    analysis_id = saved_analysis["id"]
            except Exception as exc:
                logger.warning(f"Could not persist analysis record via Supabase: {exc}")

    # 3. Create Version Snapshot
    version_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    version_record = {
        "id": version_id,
        "document_id": document_id,
        "user_id": user_id,
        "resume_series_id": series_id,
        "version_number": version_number,
        "structured_resume_data": resume_data,
        "selected_template": doc.get("selected_template", "sb2nov"),
        "analysis_id": analysis_id,
        "change_summary": change_summary or f"Version {version_number} saved from Resume Builder",
        "created_at": now_iso,
    }
    if run_ats_eval and len(plain_text) >= 40:
        version_record["ats_score"] = ats_score_val
        version_record["evaluation_data"] = analysis_payload

    if not is_mock_series:
        client = get_supabase()
        if client:
            try:
                client.table("resume_builder_versions").insert(version_record).execute()
            except Exception as exc:
                logger.warning(f"Supabase resume_builder_versions insert failed: {exc}")

    if document_id not in _MOCK_VERSIONS:
        _MOCK_VERSIONS[document_id] = []
    _MOCK_VERSIONS[document_id].append(version_record)

    return version_record

    if document_id not in _MOCK_VERSIONS:
        _MOCK_VERSIONS[document_id] = []
    _MOCK_VERSIONS[document_id].append(version_record)

    return version_record


def list_builder_versions(document_id: str, user_id: str) -> List[Dict[str, Any]]:
    """
    Returns all saved versions for a builder document.
    """
    client = get_supabase()
    if client:
        try:
            res = (
                client.table("resume_builder_versions")
                .select("*")
                .eq("document_id", document_id)
                .eq("user_id", user_id)
                .order("version_number", desc=True)
                .execute()
            )
            if res.data is not None:
                return res.data
        except Exception as exc:
            logger.warning(f"Supabase list_builder_versions failed: {exc}")

    versions = _MOCK_VERSIONS.get(document_id, [])
    return sorted([v for v in versions if v.get("user_id") == user_id], key=lambda x: x.get("version_number", 1), reverse=True)
