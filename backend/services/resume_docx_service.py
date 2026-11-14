"""
SkillsCatalyst Resume DOCX Export Service (Phase 5)
Generates clean, ATS-compliant Microsoft Word (.docx) documents from structured ResumeData.
Preserves headings, bullet hierarchies, contact metadata, and hyperlinks.
"""

import io
import logging
from typing import Dict, Any, List, Optional
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

logger = logging.getLogger(__name__)


def _add_hyperlink(paragraph, url: str, text: str, color: str = "2563EB", underline: bool = True):
    """
    Inserts a clickable hyperlink into a python-docx paragraph using OpenXML elements.
    """
    part = paragraph.part
    r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)

    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)

    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')

    if color:
        c = OxmlElement('w:color')
        c.set(qn('w:val'), color)
        rPr.append(c)

    if underline:
        u = OxmlElement('w:u')
        u.set(qn('w:val'), 'single')
        rPr.append(u)

    new_run.append(rPr)
    new_run.text = text
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def _add_section_heading(doc: docx.Document, title: str):
    """
    Renders an ATS-friendly section heading with a bottom border / divider line.
    """
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True

    run = p.add_run(title.upper())
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)  # slate-900

    # Add a thin bottom border to paragraph
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')  # ~0.75 pt
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'CBD5E1')  # slate-300
    pBdr.append(bottom)
    p._p.get_or_add_pPr().append(pBdr)


def generate_resume_docx(resume_data: Dict[str, Any], template_id: str = "sb2nov") -> io.BytesIO:
    """
    Generates a publication-grade .docx resume document and returns in-memory bytes buffer.
    """
    doc = docx.Document()

    # Standard 0.6 inch margins for optimal ATS line lengths
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.65)
        section.right_margin = Inches(0.65)

    # 1. Candidate Header
    full_name = resume_data.get("fullName") or resume_data.get("full_name") or "Candidate Name"
    target_role = resume_data.get("role") or resume_data.get("target_role") or ""

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    p_title.paragraph_format.space_before = Pt(0)

    run_name = p_title.add_run(full_name)
    run_name.font.name = "Arial"
    run_name.font.size = Pt(20)
    run_name.font.bold = True
    run_name.font.color.rgb = RGBColor(15, 23, 42)

    if target_role:
        p_role = doc.add_paragraph()
        p_role.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_role.paragraph_format.space_after = Pt(3)
        run_role = p_role.add_run(target_role)
        run_role.font.name = "Arial"
        run_role.font.size = Pt(11)
        run_role.font.color.rgb = RGBColor(79, 70, 229)  # indigo-600
        run_role.font.bold = True

    # Contact line
    contacts = []
    for key in ("email", "phone", "location"):
        val = resume_data.get(key)
        if val and str(val).strip():
            contacts.append(str(val).strip())

    links = []
    for link_key, label in [("linkedin", "LinkedIn"), ("github", "GitHub"), ("portfolio", "Portfolio")]:
        url = resume_data.get(link_key)
        if url and str(url).strip():
            clean_url = str(url).strip()
            if not clean_url.startswith("http"):
                clean_url = f"https://{clean_url}"
            links.append((clean_url, label))

    p_contact = doc.add_paragraph()
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_after = Pt(6)

    # Add text contacts
    if contacts:
        run_c = p_contact.add_run(" | ".join(contacts))
        run_c.font.name = "Arial"
        run_c.font.size = Pt(9.5)
        run_c.font.color.rgb = RGBColor(71, 85, 105)

    # Add clickable hyperlinks
    if links:
        if contacts:
            p_contact.add_run(" | ")
        for idx, (url, lbl) in enumerate(links):
            if idx > 0:
                p_contact.add_run(" | ")
            _add_hyperlink(p_contact, url, lbl, color="4F46E5", underline=True)

    # 2. Professional Summary
    summary = resume_data.get("summary", "").strip()
    if summary:
        _add_section_heading(doc, "Professional Summary")
        p_sum = doc.add_paragraph()
        p_sum.paragraph_format.space_after = Pt(4)
        run_sum = p_sum.add_run(summary)
        run_sum.font.name = "Arial"
        run_sum.font.size = Pt(10)
        run_sum.font.color.rgb = RGBColor(51, 65, 85)

    # 3. Work Experience
    experience = resume_data.get("experience") or []
    if isinstance(experience, list) and any(e.get("company") or e.get("role") for e in experience):
        _add_section_heading(doc, "Experience")
        for item in experience:
            company = item.get("company", "").strip()
            role = item.get("role", "").strip()
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            loc = item.get("location", "").strip()

            p_head = doc.add_paragraph()
            p_head.paragraph_format.space_before = Pt(4)
            p_head.paragraph_format.space_after = Pt(1)
            p_head.paragraph_format.keep_with_next = True

            run_role = p_head.add_run(role)
            run_role.font.name = "Arial"
            run_role.font.size = Pt(10.5)
            run_role.font.bold = True
            run_role.font.color.rgb = RGBColor(15, 23, 42)

            if company:
                p_head.add_run(" — ")
                run_comp = p_head.add_run(company)
                run_comp.font.name = "Arial"
                run_comp.font.size = Pt(10)
                run_comp.font.color.rgb = RGBColor(51, 65, 85)

            meta_str = " | ".join(filter(None, [dates, loc]))
            if meta_str:
                p_head.add_run(f" ({meta_str})")

            bullets = item.get("bullets") or []
            for b in bullets:
                b_str = str(b).strip()
                if b_str:
                    p_b = doc.add_paragraph(style='List Bullet')
                    p_b.paragraph_format.space_before = Pt(0)
                    p_b.paragraph_format.space_after = Pt(1.5)
                    run_b = p_b.add_run(b_str)
                    run_b.font.name = "Arial"
                    run_b.font.size = Pt(9.5)
                    run_b.font.color.rgb = RGBColor(51, 65, 85)

    # 4. Education
    education = resume_data.get("education") or []
    if isinstance(education, list) and any(e.get("institution") or e.get("degree") for e in education):
        _add_section_heading(doc, "Education")
        for item in education:
            inst = item.get("institution", "").strip()
            degree = item.get("degree", "").strip()
            field = item.get("fieldOfStudy", "").strip()
            dates = item.get("dates") or f"{item.get('startDate', '')} - {item.get('endDate', '')}".strip(" -")
            gpa = item.get("gpa", "").strip()

            p_edu = doc.add_paragraph()
            p_edu.paragraph_format.space_before = Pt(3)
            p_edu.paragraph_format.space_after = Pt(1)
            p_edu.paragraph_format.keep_with_next = True

            deg_str = f"{degree} in {field}" if degree and field else (degree or field)
            run_deg = p_edu.add_run(deg_str)
            run_deg.font.name = "Arial"
            run_deg.font.size = Pt(10.5)
            run_deg.font.bold = True
            run_deg.font.color.rgb = RGBColor(15, 23, 42)

            if inst:
                p_edu.add_run(" — ")
                run_inst = p_edu.add_run(inst)
                run_inst.font.name = "Arial"
                run_inst.font.size = Pt(10)
                run_inst.font.color.rgb = RGBColor(51, 65, 85)

            meta_parts = [dates]
            if gpa:
                meta_parts.append(f"GPA: {gpa}")
            meta_str = " | ".join(filter(None, meta_parts))
            if meta_str:
                p_edu.add_run(f" ({meta_str})")

    # 5. Projects
    projects = resume_data.get("projects") or []
    if isinstance(projects, list) and any(p.get("name") or p.get("title") for p in projects):
        _add_section_heading(doc, "Projects")
        for proj in projects:
            p_name = proj.get("name") or proj.get("title", "")
            p_tech = proj.get("tech", "").strip()
            p_link = proj.get("link") or proj.get("githubUrl", "")

            p_proj = doc.add_paragraph()
            p_proj.paragraph_format.space_before = Pt(3)
            p_proj.paragraph_format.space_after = Pt(1)
            p_proj.paragraph_format.keep_with_next = True

            run_pn = p_proj.add_run(p_name)
            run_pn.font.name = "Arial"
            run_pn.font.size = Pt(10)
            run_pn.font.bold = True
            run_pn.font.color.rgb = RGBColor(15, 23, 42)

            if p_tech:
                p_proj.add_run(" | ")
                run_tech = p_proj.add_run(p_tech)
                run_tech.font.name = "Arial"
                run_tech.font.size = Pt(9.5)
                run_tech.font.color.rgb = RGBColor(71, 85, 105)

            if p_link:
                p_proj.add_run(" | ")
                url = p_link if p_link.startswith("http") else f"https://{p_link}"
                _add_hyperlink(p_proj, url, "Link", color="4F46E5", underline=True)

            bullets = proj.get("bullets") or []
            for b in bullets:
                b_str = str(b).strip()
                if b_str:
                    p_b = doc.add_paragraph(style='List Bullet')
                    p_b.paragraph_format.space_before = Pt(0)
                    p_b.paragraph_format.space_after = Pt(1.5)
                    run_b = p_b.add_run(b_str)
                    run_b.font.name = "Arial"
                    run_b.font.size = Pt(9.5)
                    run_b.font.color.rgb = RGBColor(51, 65, 85)

    # 6. Technical Skills
    skills = resume_data.get("skills") or {}
    if isinstance(skills, dict) and any(skills.values()):
        _add_section_heading(doc, "Technical Skills")
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
                p_s = doc.add_paragraph()
                p_s.paragraph_format.space_before = Pt(1)
                p_s.paragraph_format.space_after = Pt(1)

                run_lbl = p_s.add_run(f"{label}: ")
                run_lbl.font.name = "Arial"
                run_lbl.font.size = Pt(9.5)
                run_lbl.font.bold = True
                run_lbl.font.color.rgb = RGBColor(15, 23, 42)

                run_val = p_s.add_run(str(val).strip())
                run_val.font.name = "Arial"
                run_val.font.size = Pt(9.5)
                run_val.font.color.rgb = RGBColor(51, 65, 85)

    # 7. Certifications
    certs = resume_data.get("certifications") or []
    if isinstance(certs, list) and any(c.get("name") for c in certs):
        _add_section_heading(doc, "Certifications")
        for item in certs:
            c_name = item.get("name", "").strip()
            c_issuer = item.get("issuer", "").strip()
            c_date = item.get("date", "").strip()
            if c_name:
                p_c = doc.add_paragraph(style='List Bullet')
                p_c.paragraph_format.space_before = Pt(0)
                p_c.paragraph_format.space_after = Pt(1)
                c_str = f"{c_name} — {c_issuer} ({c_date})" if c_issuer else f"{c_name} ({c_date})"
                run_c = p_c.add_run(c_str)
                run_c.font.name = "Arial"
                run_c.font.size = Pt(9.5)

    # 8. Achievements
    achievements = resume_data.get("achievements") or []
    if isinstance(achievements, list) and any(a.get("title") for a in achievements):
        _add_section_heading(doc, "Achievements")
        for item in achievements:
            title = item.get("title", "").strip()
            desc = item.get("description", "").strip()
            if title:
                p_a = doc.add_paragraph(style='List Bullet')
                p_a.paragraph_format.space_before = Pt(0)
                p_a.paragraph_format.space_after = Pt(1)
                run_t = p_a.add_run(title)
                run_t.font.name = "Arial"
                run_t.font.size = Pt(9.5)
                run_t.font.bold = True
                if desc:
                    p_a.add_run(f": {desc}")

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer

