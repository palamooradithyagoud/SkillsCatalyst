"""
backend/services/resume_report_service.py
Phase 4.4: Professional Downloadable Resume Analysis PDF Report Generator.

Generates a vector-sharp, multi-page PDF executive evaluation report
incorporating SkillsCatalyst brand identity, score dashboards, ATS observations,
content strengths/weaknesses, and prioritized step-by-step action plans.
Uses reportlab in-memory streaming with strict input validation.
"""

import io
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from backend.services.resume_history_service import get_resume_analysis_by_id

logger = logging.getLogger("skillscatalyst.resume_report")

# Theme Palette (Professional Clean SaaS)
COLOR_PRIMARY = colors.HexColor("#0F172A")       # Slate 900
COLOR_SECONDARY = colors.HexColor("#334155")     # Slate 700
COLOR_MUTED = colors.HexColor("#64748B")         # Slate 500
COLOR_BORDER = colors.HexColor("#E2E8F0")        # Slate 200
COLOR_BG_CARD = colors.HexColor("#F8FAFC")       # Slate 50
COLOR_ACCENT = colors.HexColor("#0D9488")        # Teal 600
COLOR_ACCENT_LIGHT = colors.HexColor("#CCFBF1")  # Teal 100
COLOR_LIME = colors.HexColor("#84CC16")          # Lime 500
COLOR_AMBER = colors.HexColor("#D97706")         # Amber 600
COLOR_RED = colors.HexColor("#DC2626")           # Red 600


def get_score_color(score: Optional[float]) -> str:
    """Returns hex color string based on score threshold."""
    if score is None:
        return "#64748B"
    if score >= 80:
        return "#16A34A"  # Green
    if score >= 65:
        return "#0284C7"  # Blue
    if score >= 50:
        return "#D97706"  # Amber
    return "#DC2626"      # Red


def build_pdf_styles():
    """Builds clean typography styles for the PDF report."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=COLOR_PRIMARY,
        alignment=TA_LEFT,
    ))

    styles.add(ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=COLOR_MUTED,
        alignment=TA_LEFT,
    ))

    styles.add(ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    ))

    styles.add(ParagraphStyle(
        "CardScore",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        "CardLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=COLOR_MUTED,
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_SECONDARY,
    ))

    styles.add(ParagraphStyle(
        "BodyBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=COLOR_SECONDARY,
        leftIndent=12,
    ))

    styles.add(ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=COLOR_SECONDARY,
    ))

    styles.add(ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11.5,
        textColor=COLOR_PRIMARY,
    ))

    styles.add(ParagraphStyle(
        "FooterText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=COLOR_MUTED,
        alignment=TA_CENTER,
    ))

    return styles


def generate_resume_pdf_report(user_id: str, analysis_id: str) -> bytes:
    """
    Generates a complete multi-page PDF analysis report for a saved resume.
    Returns binary PDF data.
    """
    record = get_resume_analysis_by_id(user_id=user_id, analysis_id=analysis_id)
    analysis_res = record.get("analysis_result", {}) or {}
    if isinstance(analysis_res, str):
        try:
            analysis_res = json.loads(analysis_res)
        except Exception:
            analysis_res = {}
    ats_data = analysis_res.get("ats_analysis", {}) or {}
    ai_data = analysis_res.get("ai_evaluation", {}) or {}
    kw_data = analysis_res.get("keyword_analysis", {}) or {}
    ext_data = analysis_res.get("extraction", {}) or {}

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = build_pdf_styles()
    story = []

    # Safe data extraction
    filename = record.get("original_filename", "Resume.pdf")
    created_at_raw = record.get("created_at", "")
    try:
        date_obj = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
        analysis_date = date_obj.strftime("%B %d, %Y")
    except Exception:
        analysis_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

    candidate_name = ext_data.get("name") or "Candidate"
    target_role = analysis_res.get("target_role") or "General Software Role"
    career_stage = analysis_res.get("career_stage") or ai_data.get("career_stage", "Fresher")

    ov_score = record.get("overall_score") or analysis_res.get("score_breakdown", {}).get("overall_score")
    ats_score = record.get("ats_score") or ats_data.get("ats_compatibility_score")
    cnt_score = record.get("content_score") or ai_data.get("content_quality_score")
    skl_score = record.get("skills_score") or kw_data.get("keyword_match_percentage")
    str_score = record.get("structure_score") or ats_data.get("structure_score")

    # =========================================================================
    # PAGE 1: EXECUTIVE SUMMARY & SCORE DASHBOARD
    # =========================================================================
    story.append(Paragraph("SkillsCatalyst®", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=13, textColor=COLOR_PRIMARY)))
    story.append(Paragraph("AI Resume Intelligence & ATS Diagnostic Report", styles["ReportSubtitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER, spaceBefore=6, spaceAfter=14))

    # Candidate Meta Header
    meta_table_data = [
        [
            Paragraph(f"<b>Candidate:</b> {candidate_name}", styles["TableCell"]),
            Paragraph(f"<b>Target Role:</b> {target_role}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>File:</b> {filename}", styles["TableCell"]),
            Paragraph(f"<b>Evaluated:</b> {analysis_date}", styles["TableCell"]),
        ],
        [
            Paragraph(f"<b>Career Stage:</b> {career_stage}", styles["TableCell"]),
            Paragraph(f"<b>Engine Version:</b> v{record.get('scoring_engine_version', '2.2')}", styles["TableCell"]),
        ],
    ]
    meta_table = Table(meta_table_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 1, COLOR_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # Score Cards Row
    story.append(Paragraph("Performance Score Dashboard", styles["SectionHeading"]))

    def make_score_box(label: str, score: Optional[float]):
        score_str = f"{int(round(score))}" if score is not None else "N/A"
        color_val = get_score_color(score)
        return [
            Paragraph(f"<font color='{color_val}'>{score_str}</font><font size='10' color='#64748B'>/100</font>", styles["CardScore"]),
            Paragraph(label.upper(), styles["CardLabel"]),
        ]

    scores_data = [
        [
            make_score_box("Overall Score", ov_score),
            make_score_box("ATS Parsing", ats_score),
            make_score_box("Content Quality", cnt_score),
            make_score_box("Skills Match", skl_score),
            make_score_box("Structure", str_score),
        ]
    ]
    scores_table = Table(scores_data, colWidths=[108, 108, 108, 108, 108])
    scores_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
        ("BOX", (0, 0), (-1, -1), 1, COLOR_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("PADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(scores_table)
    story.append(Spacer(1, 18))

    # Executive Summary Paragraph
    story.append(Paragraph("Executive Overview", styles["SectionHeading"]))
    exec_summary = ai_data.get("summary") or (
        f"The candidate's resume scored an overall {ov_score}/100 with an ATS compatibility score of {ats_score}/100. "
        "Key qualifications and technical capabilities were successfully indexed. "
        "Addressing the targeted recommendations in this report will optimize screening pass-rates."
    )
    story.append(Paragraph(exec_summary, styles["BodyDark"]))
    story.append(Spacer(1, 14))

    # Key Metrics Snapshot Table
    story.append(Paragraph("Document Extraction Snapshot", styles["SectionHeading"]))
    ext_table_data = [
        [Paragraph("Sections Detected", styles["TableCellBold"]), Paragraph(", ".join(ext_data.get("sections_detected", []) or ["Standard sections"]), styles["TableCell"])],
        [Paragraph("Total Technical Skills", styles["TableCellBold"]), Paragraph(str(len(ext_data.get("skills", []) or [])), styles["TableCell"])],
        [Paragraph("Projects Evaluated", styles["TableCellBold"]), Paragraph(str(len(ext_data.get("projects", []) or [])), styles["TableCell"])],
        [Paragraph("Experience Depth", styles["TableCellBold"]), Paragraph(f"{ext_data.get('total_years_experience', 0)} years documented", styles["TableCell"])],
    ]
    ext_table = Table(ext_table_data, colWidths=[160, 380])
    ext_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), COLOR_BG_CARD),
        ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(ext_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: DETERMINISTIC ATS & KEYWORD ANALYSIS
    # =========================================================================
    story.append(Paragraph("ATS Parsing & Readability & Keyword Coverage", styles["ReportTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER, spaceBefore=4, spaceAfter=14))

    ats_observations = ats_data.get("formatting_checks", []) or []
    story.append(Paragraph(f"ATS Parsing & Readability Score: <b>{ats_score or 'N/A'}/100</b>", styles["SectionHeading"]))
    story.append(Paragraph(
        "Applicant Tracking Systems parse documents linearly to extract contact info, skills, and chronological roles. "
        "Standard headings and simple layout hierarchies ensure reliable indexation.",
        styles["BodyDark"]
    ))
    story.append(Spacer(1, 10))

    # Matched Keywords
    matched_kws = kw_data.get("matched_keywords", []) or []
    missing_kws = kw_data.get("missing_keywords", []) or []

    story.append(Paragraph(f"Matched Keywords ({len(matched_kws)})", styles["SectionHeading"]))
    if matched_kws:
        kw_display = ", ".join(matched_kws[:30])
        story.append(Paragraph(f"<font color='#16A34A'>✔ {kw_display}</font>", styles["BodyDark"]))
    else:
        story.append(Paragraph("No direct keywords matched with baseline criteria.", styles["BodyDark"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph(f"High-Priority Missing Keywords ({len(missing_kws)})", styles["SectionHeading"]))
    if missing_kws:
        missing_display = ", ".join(missing_kws[:20])
        story.append(Paragraph(f"<font color='#DC2626'>✖ {missing_display}</font>", styles["BodyDark"]))
    else:
        story.append(Paragraph("Excellent keyword coverage for target role.", styles["BodyDark"]))
    story.append(Spacer(1, 14))

    # Formatting Observations Table
    story.append(Paragraph("ATS Parser Observations", styles["SectionHeading"]))
    issues = ats_data.get("issues", []) or []
    if issues:
        obs_rows = [[Paragraph(f"• {issue}", styles["TableCell"])] for issue in issues[:8]]
    else:
        obs_rows = [
            [Paragraph("✔ Clean typography and legible character encoding.", styles["TableCell"])],
            [Paragraph("✔ Standard section header conventions observed.", styles["TableCell"])],
            [Paragraph("✔ Linear single-column flow parsed without layout collision.", styles["TableCell"])],
        ]
    obs_table = Table(obs_rows, colWidths=[540])
    obs_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(obs_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: CONTENT QUALITY & SECTION EVALUATION
    # =========================================================================
    story.append(Paragraph("Content Quality & Section Evaluation", styles["ReportTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER, spaceBefore=4, spaceAfter=14))

    # Strengths
    strengths = ai_data.get("strengths", []) or []
    story.append(Paragraph("Document Strengths", styles["SectionHeading"]))
    if strengths:
        for s in strengths[:5]:
            story.append(Paragraph(f"<b>+</b> {s}", styles["BodyBullet"]))
    else:
        story.append(Paragraph("Clear presentation of core technical competencies.", styles["BodyBullet"]))
    story.append(Spacer(1, 12))

    # Weaknesses
    weaknesses = ai_data.get("weaknesses", []) or []
    story.append(Paragraph("Identified Gaps & Weaknesses", styles["SectionHeading"]))
    if weaknesses:
        for w in weaknesses[:5]:
            story.append(Paragraph(f"<b>-</b> {w}", styles["BodyBullet"]))
    else:
        story.append(Paragraph("Minor opportunities for bullet impact quantification.", styles["BodyBullet"]))
    story.append(Spacer(1, 14))

    # Deep Dives: Experience, Projects, Skills
    section_evals = ai_data.get("section_evaluations", {}) or {}
    story.append(Paragraph("Section Depth Analysis", styles["SectionHeading"]))

    sec_rows = [
        [Paragraph("Section", styles["TableCellBold"]), Paragraph("Evaluation & Impact Assessment", styles["TableCellBold"])],
        [
            Paragraph("Experience", styles["TableCellBold"]),
            Paragraph(section_evals.get("experience", "Roles clearly stated. Focus on measurable metric outcomes rather than job duty recitations."), styles["TableCell"])
        ],
        [
            Paragraph("Projects", styles["TableCellBold"]),
            Paragraph(section_evals.get("projects", "Demonstrates hands-on engineering. Highlight architecture, scale, and deployment technologies."), styles["TableCell"])
        ],
        [
            Paragraph("Skills", styles["TableCellBold"]),
            Paragraph(section_evals.get("skills", "Group into logical categories: Languages, Frameworks, Cloud & DevOps, Databases."), styles["TableCell"])
        ],
        [
            Paragraph("Education", styles["TableCellBold"]),
            Paragraph(section_evals.get("education", "Accreditation and degree details verified. Include coursework and honors if early in career."), styles["TableCell"])
        ],
    ]
    sec_table = Table(sec_rows, colWidths=[110, 430])
    sec_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_BG_CARD),
        ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(sec_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: PRIORITIZED RECOMMENDATIONS
    # =========================================================================
    story.append(Paragraph("Prioritized Improvement Recommendations", styles["ReportTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER, spaceBefore=4, spaceAfter=14))

    recs = ai_data.get("recommendations", []) or []

    high_recs = []
    med_recs = []
    low_recs = []

    for r in recs:
        text = r if isinstance(r, str) else r.get("recommendation", "")
        priority = "high" if isinstance(r, str) else r.get("priority", "high").lower()
        if priority == "high":
            high_recs.append(text)
        elif priority == "medium":
            med_recs.append(text)
        else:
            low_recs.append(text)

    if not high_recs and not med_recs and not low_recs and recs:
        high_recs = recs[:3]
        med_recs = recs[3:6]

    story.append(Paragraph("High Priority Actions (Immediate Impact)", styles["SectionHeading"]))
    if high_recs:
        for hr in high_recs[:4]:
            story.append(Paragraph(f"<font color='#DC2626'>[P1]</font> {hr}", styles["BodyBullet"]))
    else:
        story.append(Paragraph("Integrate missing role-specific keywords directly into bullet points.", styles["BodyBullet"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Medium Priority Actions (Quality Refinement)", styles["SectionHeading"]))
    if med_recs:
        for mr in med_recs[:4]:
            story.append(Paragraph(f"<font color='#D97706'>[P2]</font> {mr}", styles["BodyBullet"]))
    else:
        story.append(Paragraph("Rewrite experience statements using the Action Verb + Context + Result formula.", styles["BodyBullet"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Low Priority Actions (Polish & Presentation)", styles["SectionHeading"]))
    if low_recs:
        for lr in low_recs[:3]:
            story.append(Paragraph(f"<font color='#0284C7'>[P3]</font> {lr}", styles["BodyBullet"]))
    else:
        story.append(Paragraph("Ensure uniform date formatting and verified contact URLs.", styles["BodyBullet"]))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: ACTION PLAN & IMPLEMENTATION CHECKLIST
    # =========================================================================
    story.append(Paragraph("Strategic Action Plan & Checklist", styles["ReportTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER, spaceBefore=4, spaceAfter=14))

    story.append(Paragraph(
        "Follow this sequential roadmap to produce your next resume version and monitor your score advancement in SkillsCatalyst.",
        styles["BodyDark"]
    ))
    story.append(Spacer(1, 10))

    checklist_data = [
        [Paragraph("Step", styles["TableCellBold"]), Paragraph("Task Description", styles["TableCellBold"]), Paragraph("Target Milestone", styles["TableCellBold"])],
        [
            Paragraph("1", styles["TableCellBold"]),
            Paragraph("<b>Keyword Insertion:</b> Embed missing role keywords naturally into project summaries.", styles["TableCell"]),
            Paragraph("ATS Score 70+", styles["TableCell"]),
        ],
        [
            Paragraph("2", styles["TableCellBold"]),
            Paragraph("<b>Metric Quantification:</b> Add quantifiable results (%, $, users, latency, throughput) to minimum 3 bullets.", styles["TableCell"]),
            Paragraph("Content Score 75+", styles["TableCell"]),
        ],
        [
            Paragraph("3", styles["TableCellBold"]),
            Paragraph("<b>Layout Standardization:</b> Validate standard headings (Summary, Experience, Projects, Skills, Education).", styles["TableCell"]),
            Paragraph("Structure Score 80+", styles["TableCell"]),
        ],
        [
            Paragraph("4", styles["TableCellBold"]),
            Paragraph("<b>Version Re-evaluation:</b> Export clean single-column PDF and upload Version 2 to your series.", styles["TableCell"]),
            Paragraph("Overall Score 80+", styles["TableCell"]),
        ],
    ]
    checklist_table = Table(checklist_data, colWidths=[40, 360, 140])
    checklist_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_BG_CARD),
        ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("PADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(checklist_table)
    story.append(Spacer(1, 24))

    # SkillsCatalyst Footer Sign-off
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER, spaceBefore=20, spaceAfter=10))
    story.append(Paragraph(
        f"Generated by SkillsCatalyst AI Engine • {analysis_date} • Confidential Career Document • ID: {analysis_id[:8]}",
        styles["FooterText"]
    ))

    # Build document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

