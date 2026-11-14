"""
SkillsCatalyst Resume PDF Export Service (Phase 5)
Generates vector-crisp, ATS-compliant PDF resumes from structured ResumeData using ReportLab.
"""

import io
import logging
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

logger = logging.getLogger(__name__)


def generate_resume_pdf(resume_data: Dict[str, Any], template_id: str = "sb2nov") -> io.BytesIO:
    """
    Renders an ATS-friendly, clean vector PDF resume into an in-memory buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Define color scheme based on template
    primary_color = colors.HexColor("#0F172A")  # slate-900
    accent_color = colors.HexColor("#4F46E5")   # indigo-600
    subtext_color = colors.HexColor("#475569")  # slate-600

    if template_id == "modern-cv":
        accent_color = colors.HexColor("#7C3AED")  # purple-600
    elif template_id == "academic":
        accent_color = colors.HexColor("#0D9488")  # teal-600

    # Custom styles
    name_style = ParagraphStyle(
        "CandidateName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        alignment=1,  # Center
        textColor=primary_color,
    )

    role_style = ParagraphStyle(
        "CandidateRole",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        alignment=1,
        textColor=accent_color,
    )

    contact_style = ParagraphStyle(
        "CandidateContact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        alignment=1,
        textColor=subtext_color,
    )

    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=primary_color,
        spaceBefore=8,
        spaceAfter=2,
    )

    body_bold_style = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=primary_color,
    )

    body_regular_style = ParagraphStyle(
        "BodyRegular",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=subtext_color,
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        leftIndent=12,
        textColor=subtext_color,
        spaceBefore=1,
        spaceAfter=1,
    )

    story: List[Any] = []

    # 1. Header
    full_name = resume_data.get("fullName") or resume_data.get("full_name") or "Candidate Name"
    target_role = resume_data.get("role") or resume_data.get("target_role") or ""

    story.append(Paragraph(full_name, name_style))
    if target_role:
        story.append(Spacer(1, 2))
        story.append(Paragraph(target_role, role_style))

    contact_parts = []
    for key in ("email", "phone", "location"):
        val = resume_data.get(key)
        if val and str(val).strip():
            contact_parts.append(str(val).strip())
    for link_key in ("linkedin", "github", "portfolio"):
        val = resume_data.get(link_key)
        if val and str(val).strip():
            contact_parts.append(str(val).strip())

    if contact_parts:
        story.append(Spacer(1, 3))
        story.append(Paragraph(" | ".join(contact_parts), contact_style))

    story.append(Spacer(1, 6))

    def add_heading(title: str):
        story.append(Paragraph(title.upper(), section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor("#CBD5E1"), spaceBefore=1, spaceAfter=4))

    # 2. Professional Summary
    summary = resume_data.get("summary", "").strip()
    if summary:
        add_heading("Professional Summary")
        story.append(Paragraph(summary, body_regular_style))
        story.append(Spacer(1, 4))

    # 3. Work Experience
    experience = resume_data.get("experience") or []
    if isinstance(experience, list) and any(e.get("company") or e.get("role") for e in experience):
        add_heading("Experience")
        for item in experience:
            comp = item.get("company", "").strip()
            role = item.get("role", "").strip()
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            loc = item.get("location", "").strip()

            meta = " | ".join(filter(None, [dates, loc]))
            header_text = f"<b>{role}</b> — {comp}" if comp else f"<b>{role}</b>"
            if meta:
                header_text = f"{header_text} ({meta})"

            story.append(Paragraph(header_text, body_bold_style))

            bullets = item.get("bullets") or []
            for b in bullets:
                b_str = str(b).strip()
                if b_str:
                    story.append(Paragraph(f"• {b_str}", bullet_style))
            story.append(Spacer(1, 4))

    # 4. Education
    education = resume_data.get("education") or []
    if isinstance(education, list) and any(e.get("institution") or e.get("degree") for e in education):
        add_heading("Education")
        for item in education:
            inst = item.get("institution", "").strip()
            deg = item.get("degree", "").strip()
            field = item.get("fieldOfStudy", "").strip()
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            gpa = item.get("gpa", "").strip()

            deg_str = f"<b>{deg} in {field}</b>" if deg and field else f"<b>{deg or field}</b>"
            if inst:
                deg_str = f"{deg_str} — {inst}"
            meta_parts = [dates]
            if gpa:
                meta_parts.append(f"GPA: {gpa}")
            meta_str = " | ".join(filter(None, meta_parts))
            if meta_str:
                deg_str = f"{deg_str} ({meta_str})"

            story.append(Paragraph(deg_str, body_regular_style))
            story.append(Spacer(1, 2))

    # 5. Projects
    projects = resume_data.get("projects") or []
    if isinstance(projects, list) and any(p.get("name") or p.get("title") for p in projects):
        add_heading("Projects")
        for proj in projects:
            name = proj.get("name") or proj.get("title", "")
            tech = proj.get("tech", "").strip()
            header = f"<b>{name}</b>"
            if tech:
                header = f"{header} | {tech}"
            story.append(Paragraph(header, body_bold_style))

            bullets = proj.get("bullets") or []
            for b in bullets:
                b_str = str(b).strip()
                if b_str:
                    story.append(Paragraph(f"• {b_str}", bullet_style))
            story.append(Spacer(1, 3))

    # 6. Technical Skills
    skills = resume_data.get("skills") or {}
    if isinstance(skills, dict) and any(skills.values()):
        add_heading("Technical Skills")
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
                story.append(Paragraph(f"<b>{label}:</b> {str(val).strip()}", body_regular_style))
        story.append(Spacer(1, 4))

    # 7. Certifications
    certs = resume_data.get("certifications") or []
    if isinstance(certs, list) and any(c.get("name") for c in certs):
        add_heading("Certifications")
        for item in certs:
            c_name = item.get("name", "").strip()
            c_issuer = item.get("issuer", "").strip()
            c_date = item.get("date", "").strip()
            c_str = f"• <b>{c_name}</b> — {c_issuer} ({c_date})" if c_issuer else f"• <b>{c_name}</b> ({c_date})"
            story.append(Paragraph(c_str, body_regular_style))
        story.append(Spacer(1, 3))

    # 8. Achievements
    achievements = resume_data.get("achievements") or []
    if isinstance(achievements, list) and any(a.get("title") for a in achievements):
        add_heading("Achievements")
        for item in achievements:
            title = item.get("title", "").strip()
            desc = item.get("description", "").strip()
            a_str = f"• <b>{title}</b>: {desc}" if desc else f"• <b>{title}</b>"
            story.append(Paragraph(a_str, body_regular_style))
        story.append(Spacer(1, 3))

    doc.build(story)
    buffer.seek(0)
    return buffer

