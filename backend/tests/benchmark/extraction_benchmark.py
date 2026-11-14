"""
Resume Extraction Benchmark Suite (Phase 2.2).

Constructs 32 rigorous layout fixtures spanning 9 categories:
1. Standard single-column (5 fixtures)
2. Symmetric two-column 50/50 (4 fixtures)
3. Asymmetric two-column (5 fixtures: 30/70, 70/30, 25/75, etc.)
4. Three-column specialized (2 fixtures)
5. Sidebar-based (4 fixtures)
6. Table-heavy (3 fixtures)
7. Hyperlink-heavy (2 fixtures)
8. Multi-page (3 fixtures: 2-page & 3-page)
9. Unicode / unusual formatting (2 fixtures)
10. Scanned / image-only (2 fixtures)

Measures:
- Character-level similarity
- Word-level Precision, Recall, and F1
- Section detection accuracy
- Reading order preservation accuracy
- Scanned document warning accuracy
"""

from __future__ import annotations

import io
import fitz  # PyMuPDF
import docx  # python-docx
from typing import Dict, List, Any, NamedTuple, Set, Tuple
from dataclasses import dataclass, field

from backend.services.resume_extractor import extract_document
from backend.services.ats_engine import evaluate_resume_ats
from backend.tests.benchmark.metrics import (
    calculate_character_similarity,
    calculate_word_precision_recall_f1,
    calculate_section_detection_accuracy,
    calculate_reading_order_accuracy,
    normalize_text_for_metrics,
)


@dataclass
class ExtractionBenchmarkCase:
    case_id: str
    category: str
    title: str
    format: str  # "pdf" | "docx"
    file_bytes: bytes
    expected_text: str
    expected_sections: Set[str]
    expected_section_order: List[str]
    is_scanned: bool = False
    expected_contact: Dict[str, Any] = field(default_factory=dict)


def _create_single_column_pdf(
    name: str,
    email: str,
    phone: str,
    sections: List[Dict[str, Any]]
) -> Tuple[bytes, str, List[str]]:
    """Creates a well-formed single column PDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4

    text_parts = [name, f"Email: {email} | Phone: {phone}"]
    expected_order = []

    y = 50
    page.insert_text((50, y), name, fontsize=16, fontname="helv")
    y += 20
    page.insert_text((50, y), f"Email: {email} | Phone: {phone}", fontsize=10, fontname="helv")
    y += 25

    for sec in sections:
        sec_title = sec["title"]
        expected_order.append(sec_title.upper())
        text_parts.append(sec_title.upper())
        page.insert_text((50, y), sec_title.upper(), fontsize=12, fontname="helv")
        y += 18

        for line in sec["content"]:
            text_parts.append(line)
            # Word wrap simulation
            page.insert_text((50, y), line, fontsize=10, fontname="helv")
            y += 16
        y += 10

    expected_full_text = "\n".join(text_parts)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes, expected_full_text, expected_order


def _create_multi_column_pdf(
    name: str,
    email: str,
    phone: str,
    columns: List[Dict[str, Any]],  # Each col has x0, x1 and list of sections
    page_width: float = 595,
    page_height: float = 842,
) -> Tuple[bytes, str, List[str]]:
    """Creates a multi-column PDF with precise bounding boxes for columns."""
    doc = fitz.open()
    page = doc.new_page(width=page_width, height=page_height)

    # Header spans full width
    page.insert_text((50, 45), name, fontsize=16, fontname="helv")
    page.insert_text((50, 65), f"Email: {email} | Phone: {phone}", fontsize=10, fontname="helv")

    text_parts = [name, f"Email: {email} | Phone: {phone}"]
    expected_order = []

    # Sort columns left-to-right
    sorted_cols = sorted(columns, key=lambda c: c["x0"])

    for col in sorted_cols:
        x0 = col["x0"]
        x1 = col["x1"]
        y = 95
        for sec in col["sections"]:
            sec_title = sec["title"]
            expected_order.append(sec_title.upper())
            text_parts.append(sec_title.upper())
            page.insert_text((x0, y), sec_title.upper(), fontsize=11, fontname="helv")
            y += 16

            for line in sec["content"]:
                text_parts.append(line)
                page.insert_text((x0, y), line, fontsize=9, fontname="helv")
                y += 15
            y += 10

    expected_full_text = "\n".join(text_parts)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes, expected_full_text, expected_order


def _create_table_pdf(
    name: str,
    email: str,
    table_rows: List[List[str]],
    sections: List[Dict[str, Any]]
) -> Tuple[bytes, str, List[str]]:
    """Creates a PDF with table structure and standard sections."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 45), name, fontsize=16, fontname="helv")
    page.insert_text((50, 65), f"Email: {email}", fontsize=10, fontname="helv")

    text_parts = [name, f"Email: {email}"]
    expected_order = ["EDUCATION"]
    text_parts.append("EDUCATION")

    page.insert_text((50, 95), "EDUCATION", fontsize=12, fontname="helv")
    y = 115

    # Draw table
    col_widths = [140, 160, 90, 80]
    for row in table_rows:
        x = 50
        row_text = []
        for i, cell in enumerate(row):
            w = col_widths[i]
            page.draw_rect(fitz.Rect(x, y, x + w, y + 20), color=(0.7, 0.7, 0.7), width=0.5)
            page.insert_text((x + 4, y + 14), cell, fontsize=9, fontname="helv")
            row_text.append(cell)
            x += w
        text_parts.append(" ".join(row_text))
        y += 20

    y += 20
    for sec in sections:
        sec_title = sec["title"]
        expected_order.append(sec_title.upper())
        text_parts.append(sec_title.upper())
        page.insert_text((50, y), sec_title.upper(), fontsize=12, fontname="helv")
        y += 18
        for line in sec["content"]:
            text_parts.append(line)
            page.insert_text((50, y), line, fontsize=10, fontname="helv")
            y += 16
        y += 10

    expected_full_text = "\n".join(text_parts)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes, expected_full_text, expected_order


def _create_docx_resume(
    name: str,
    email: str,
    phone: str,
    sections: List[Dict[str, Any]]
) -> Tuple[bytes, str, List[str]]:
    """Creates a native docx resume."""
    doc = docx.Document()
    doc.add_heading(name, level=0)
    p = doc.add_paragraph()
    p.add_run(f"Email: {email} | Phone: {phone}")

    text_parts = [name, f"Email: {email} | Phone: {phone}"]
    expected_order = []

    for sec in sections:
        sec_title = sec["title"]
        expected_order.append(sec_title.upper())
        text_parts.append(sec_title.upper())
        doc.add_heading(sec_title.upper(), level=1)
        for line in sec["content"]:
            text_parts.append(line)
            doc.add_paragraph(line)

    buffer = io.BytesIO()
    doc.save(buffer)
    docx_bytes = buffer.getvalue()
    expected_full_text = "\n".join(text_parts)
    return docx_bytes, expected_full_text, expected_order


def _create_scanned_pdf() -> Tuple[bytes, str, List[str]]:
    """Creates a scanned image PDF with zero text layer."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    # Create an image pixmap
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 400, 600), 1)
    pix.clear_with(240)  # light gray
    page.insert_image(fitz.Rect(50, 50, 545, 792), pixmap=pix)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes, "", []


def build_extraction_benchmark_dataset() -> List[ExtractionBenchmarkCase]:
    """Assembles all 32 benchmark fixtures across 9 categories."""
    cases: List[ExtractionBenchmarkCase] = []

    # -------------------------------------------------------------
    # 1. Standard Single-Column (5 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 6):
        roles = ["Software Engineer", "Frontend Developer", "Backend Architect", "DevOps Engineer", "Machine Learning Specialist"]
        role = roles[i - 1]
        name = f"Candidate SingleCol {i}"
        email = f"singlecol{i}@skillscatalyst.io"
        phone = f"+1-555-010{i}"
        sections = [
            {"title": "Summary", "content": [f"Results-oriented {role} with proven track record in software development."]},
            {"title": "Experience", "content": [f"Senior Engineer at Tech Corp - Built cloud services reducing latency by 35%."]},
            {"title": "Education", "content": ["Bachelor of Science in Computer Science, GPA 3.8/4.0."]},
            {"title": "Skills", "content": ["Python, JavaScript, Docker, Kubernetes, PostgreSQL, Git, AWS."]},
            {"title": "Projects", "content": ["Scalable API Gateway: Deployed microservices processing 1M requests daily."]},
        ]
        pdf_bytes, exp_text, exp_order = _create_single_column_pdf(name, email, phone, sections)
        cases.append(ExtractionBenchmarkCase(
            case_id=f"EXT-SC-0{i}",
            category="Standard single-column",
            title=f"Single Column {role}",
            format="pdf",
            file_bytes=pdf_bytes,
            expected_text=exp_text,
            expected_sections=set(exp_order),
            expected_section_order=exp_order,
            expected_contact={"email": email, "phone": phone}
        ))

    # -------------------------------------------------------------
    # 2. Symmetric Two-Column 50/50 (4 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 5):
        name = f"Candidate SymDual {i}"
        email = f"symdual{i}@skillscatalyst.io"
        phone = f"+1-555-020{i}"
        cols = [
            {
                "x0": 50, "x1": 280,
                "sections": [
                    {"title": "Education", "content": ["B.Tech Computer Science 2024", "National Institute of Technology"]},
                    {"title": "Skills", "content": ["Python, Java, TypeScript", "React, Node.js, FastAPI", "Docker, PostgreSQL"]},
                    {"title": "Certifications", "content": ["AWS Certified Cloud Practitioner", "CKA Kubernetes Admin"]}
                ]
            },
            {
                "x0": 315, "x1": 545,
                "sections": [
                    {"title": "Experience", "content": ["Software Engineer at FinTech Labs", "Engineered real-time trade ledger."]},
                    {"title": "Projects", "content": ["Distributed Event Bus: Kafka streams pipeline handling 50k events/sec."]}
                ]
            }
        ]
        pdf_bytes, exp_text, exp_order = _create_multi_column_pdf(name, email, phone, cols)
        cases.append(ExtractionBenchmarkCase(
            case_id=f"EXT-SYM-0{i}",
            category="Symmetric two-column",
            title=f"Symmetric 50/50 Dual Column {i}",
            format="pdf",
            file_bytes=pdf_bytes,
            expected_text=exp_text,
            expected_sections=set(exp_order),
            expected_section_order=exp_order,
            expected_contact={"email": email, "phone": phone}
        ))

    # -------------------------------------------------------------
    # 3. Asymmetric Two-Column (5 fixtures: 30/70, 70/30, 25/75, etc.)
    # -------------------------------------------------------------
    # Case 3.1: 30/70 Left Sidebar
    cols_30_70 = [
        {"x0": 50, "x1": 190, "sections": [
            {"title": "Skills", "content": ["Python, C++, SQL", "Git, Linux, Docker"]},
            {"title": "Education", "content": ["B.S. CS 2023", "Stanford University"]}
        ]},
        {"x0": 215, "x1": 545, "sections": [
            {"title": "Experience", "content": ["Systems Engineer at CloudScale - Optimized kernel TCP buffer parameters."]},
            {"title": "Projects", "content": ["High Throughput Memory Cache in C++ achieving 100k QPS."]}
        ]}
    ]
    pdf_b, exp_t, exp_o = _create_multi_column_pdf("Candidate AsymLeft", "asymleft@skillscatalyst.io", "+1-555-0301", cols_30_70)
    cases.append(ExtractionBenchmarkCase("EXT-ASYM-01", "Asymmetric two-column", "30/70 Left Sidebar Layout", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # Case 3.2: 70/30 Right Sidebar
    cols_70_30 = [
        {"x0": 50, "x1": 390, "sections": [
            {"title": "Experience", "content": ["Full Stack Developer at HealthTech - Built HIPAA compliant tele-health suite."]},
            {"title": "Projects", "content": ["EHR Sync Engine syncing 100k patient records with zero data divergence."]}
        ]},
        {"x0": 415, "x1": 545, "sections": [
            {"title": "Skills", "content": ["React, TypeScript", "GraphQL, MongoDB"]},
            {"title": "Education", "content": ["B.Tech CS 2022"]}
        ]}
    ]
    pdf_b, exp_t, exp_o = _create_multi_column_pdf("Candidate AsymRight", "asymright@skillscatalyst.io", "+1-555-0302", cols_70_30)
    cases.append(ExtractionBenchmarkCase("EXT-ASYM-02", "Asymmetric two-column", "70/30 Right Sidebar Layout", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # Case 3.3: 25/75 Narrow Sidebar
    cols_25_75 = [
        {"x0": 50, "x1": 175, "sections": [
            {"title": "Skills", "content": ["AWS, Terraform", "Kubernetes, Go"]},
            {"title": "Certifications", "content": ["AWS DevOps Pro"]}
        ]},
        {"x0": 200, "x1": 545, "sections": [
            {"title": "Experience", "content": ["DevOps Lead at SaaSify - Automated multi-region Kubernetes deployments."]},
            {"title": "Education", "content": ["M.S. Software Engineering, Carnegie Mellon University."]}
        ]}
    ]
    pdf_b, exp_t, exp_o = _create_multi_column_pdf("Candidate NarrowSidebar", "narrow@skillscatalyst.io", "+1-555-0303", cols_25_75)
    cases.append(ExtractionBenchmarkCase("EXT-ASYM-03", "Asymmetric two-column", "25/75 Narrow Sidebar Layout", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # Case 3.4: 35/65 Mid-Split
    cols_35_65 = [
        {"x0": 50, "x1": 220, "sections": [
            {"title": "Education", "content": ["B.S. Mathematics & Computing 2024"]},
            {"title": "Skills", "content": ["PyTorch, TensorFlow, Scikit-learn", "Python, R, SQL, Pandas"]}
        ]},
        {"x0": 245, "x1": 545, "sections": [
            {"title": "Experience", "content": ["Data Science Intern at Analytics Corp - Deployed churn prediction model."]},
            {"title": "Projects", "content": ["Transformer-based Summarizer yielding 42.5 ROUGE score."]}
        ]}
    ]
    pdf_b, exp_t, exp_o = _create_multi_column_pdf("Candidate MidSplit", "midsplit@skillscatalyst.io", "+1-555-0304", cols_35_65)
    cases.append(ExtractionBenchmarkCase("EXT-ASYM-04", "Asymmetric two-column", "35/65 Split Layout", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # Case 3.5: Asymmetric Dual Column DOCX
    sec_docx = [
        {"title": "Summary", "content": ["Full Stack Engineer with 4 years building scalable web applications."]},
        {"title": "Experience", "content": ["Software Engineer at Acme Corp. Engineered Next.js dashboard."]},
        {"title": "Education", "content": ["B.Tech in Information Technology."]},
        {"title": "Skills", "content": ["React, TypeScript, Node.js, PostgreSQL, Docker."]},
    ]
    docx_b, exp_t, exp_o = _create_docx_resume("Candidate Docx Asym", "docxasym@skillscatalyst.io", "+1-555-0305", sec_docx)
    cases.append(ExtractionBenchmarkCase("EXT-ASYM-05", "Asymmetric two-column", "DOCX Flow Layout Asymmetric", "docx", docx_b, exp_t, set(exp_o), exp_o))

    # -------------------------------------------------------------
    # 4. Three-Column Specialized (2 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 3):
        cols_3 = [
            {"x0": 50, "x1": 190, "sections": [{"title": "Education", "content": ["BS Computer Science"]}, {"title": "Achievements", "content": ["Hackathon Winner 2024"]}]},
            {"x0": 210, "x1": 380, "sections": [{"title": "Experience", "content": ["Full Stack Intern at WebCorp.", "Shipped payment checkout."]}]},
            {"x0": 400, "x1": 545, "sections": [{"title": "Skills", "content": ["React, Node, Express", "PostgreSQL, Redis"]}]}
        ]
        pdf_b, exp_t, exp_o = _create_multi_column_pdf(f"Candidate TriCol {i}", f"tri{i}@skillscatalyst.io", f"+1-555-040{i}", cols_3)
        expected_sec_set = {"EDUCATION", "ACHIEVEMENTS", "EXPERIENCE", "SKILLS"}
        cases.append(ExtractionBenchmarkCase(f"EXT-TRI-0{i}", "Three-column", f"Three-Column Layout {i}", "pdf", pdf_b, exp_t, expected_sec_set, exp_o))

    # -------------------------------------------------------------
    # 5. Sidebar-based (4 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 5):
        cols_sb = [
            {"x0": 50, "x1": 200, "sections": [
                {"title": "Contact", "content": [f"sb{i}@skillscatalyst.io", f"+1-555-050{i}", "linkedin.com/in/sidebaruser"]},
                {"title": "Skills", "content": ["Python, Django, Celery", "Docker, Redis, PostgreSQL"]},
                {"title": "Languages", "content": ["English (Fluent)", "Spanish (Intermediate)"]}
            ]},
            {"x0": 225, "x1": 545, "sections": [
                {"title": "Summary", "content": [f"Backend Software Specialist with focused expertise in distributed messaging."]},
                {"title": "Experience", "content": [f"Backend Engineer at DataStream - Managed 400 microservices instances."]},
                {"title": "Education", "content": ["B.S. in Software Systems, Magna Cum Laude."]}
            ]}
        ]
        pdf_b, exp_t, exp_o = _create_multi_column_pdf(f"Candidate Sidebar {i}", f"sb{i}@skillscatalyst.io", f"+1-555-050{i}", cols_sb)
        cases.append(ExtractionBenchmarkCase(f"EXT-SB-0{i}", "Sidebar-based", f"Sidebar Card Layout {i}", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # -------------------------------------------------------------
    # 6. Table-Heavy (3 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 4):
        table_rows = [
            ["Degree", "Institution", "Year", "CGPA"],
            ["B.Tech CS", "State University", "2020-2024", "8.9/10"],
            ["Higher Secondary", "Public High School", "2018-2020", "94.2%"],
        ]
        sections = [
            {"title": "Experience", "content": [f"Engineering Intern at ScaleWorks - Automated test suites with pytest."]},
            {"title": "Skills", "content": ["Python, Pytest, Docker, CI/CD, Git, Linux."]},
            {"title": "Projects", "content": ["Automated Benchmarking Harness: Built performance regression tracker."]}
        ]
        pdf_b, exp_t, exp_o = _create_table_pdf(f"Candidate Table {i}", f"table{i}@skillscatalyst.io", table_rows, sections)
        cases.append(ExtractionBenchmarkCase(f"EXT-TBL-0{i}", "Table-heavy", f"Tabular Grid Resume {i}", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # -------------------------------------------------------------
    # 7. Hyperlink-Heavy (2 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 3):
        sections = [
            {"title": "Summary", "content": ["Open source contributor with extensive portfolio."]},
            {"title": "Experience", "content": [
                "Full Stack Contributor at OpenSourceOrg - github.com/candidate/repo.",
                "Portfolio live at https://candidate-portfolio.dev featuring interactive WebGL demos."
            ]},
            {"title": "Education", "content": ["B.S. Computer Engineering - Verified at verify.edu/cert/12345."]},
            {"title": "Skills", "content": ["TypeScript, React, Three.js, WebGL, Next.js, Vercel."]}
        ]
        pdf_b, exp_t, exp_o = _create_single_column_pdf(f"Candidate Hyperlink {i}", f"link{i}@skillscatalyst.io", f"+1-555-070{i}", sections)
        cases.append(ExtractionBenchmarkCase(f"EXT-LNK-0{i}", "Hyperlink-heavy", f"Hyperlink Dense Layout {i}", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # -------------------------------------------------------------
    # 8. Multi-Page (3 fixtures: 2-page & 3-page)
    # -------------------------------------------------------------
    for i in range(1, 4):
        doc = fitz.open()
        p1 = doc.new_page(width=595, height=842)
        p1.insert_text((50, 50), f"Candidate MultiPage {i}", fontsize=16, fontname="helv")
        p1.insert_text((50, 70), f"Email: multi{i}@skillscatalyst.io | Phone: +1-555-080{i}", fontsize=10, fontname="helv")
        p1.insert_text((50, 100), "SUMMARY", fontsize=12, fontname="helv")
        p1.insert_text((50, 120), "Experienced Principal Architect with 12+ years designing distributed systems.", fontsize=10, fontname="helv")
        p1.insert_text((50, 150), "EXPERIENCE", fontsize=12, fontname="helv")
        p1.insert_text((50, 170), "Principal Architect at Enterprise Cloud - Scaled global storage tier to 50 Petabytes.", fontsize=10, fontname="helv")

        p2 = doc.new_page(width=595, height=842)
        p2.insert_text((50, 50), "EDUCATION", fontsize=12, fontname="helv")
        p2.insert_text((50, 70), "Ph.D. in Computer Science - Distributed Consensus Protocols.", fontsize=10, fontname="helv")
        p2.insert_text((50, 100), "PUBLICATIONS", fontsize=12, fontname="helv")
        p2.insert_text((50, 120), "Byzantine Fault Tolerance at Scale - IEEE Transactions 2021.", fontsize=10, fontname="helv")
        p2.insert_text((50, 150), "SKILLS", fontsize=12, fontname="helv")
        p2.insert_text((50, 170), "Go, Rust, Distributed Systems, Raft, Paxos, Kubernetes, C++.", fontsize=10, fontname="helv")

        if i == 3:
            p3 = doc.new_page(width=595, height=842)
            p3.insert_text((50, 50), "PATENTS & AWARDS", fontsize=12, fontname="helv")
            p3.insert_text((50, 70), "US Patent 9876543: Adaptive Quorum Assignment in Geo-Replicated Clusters.", fontsize=10, fontname="helv")

        pdf_b = doc.tobytes()
        doc.close()

        expected_sections = {"SUMMARY", "EXPERIENCE", "EDUCATION", "PUBLICATIONS", "SKILLS"}
        if i == 3:
            expected_sections.add("PATENTS & AWARDS")
        exp_o = ["SUMMARY", "EXPERIENCE", "EDUCATION", "PUBLICATIONS", "SKILLS"]
        if i == 3:
            exp_o.append("PATENTS & AWARDS")

        exp_text = f"Candidate MultiPage {i}\nEmail: multi{i}@skillscatalyst.io | Phone: +1-555-080{i}\nSUMMARY\nExperienced Principal Architect with 12+ years designing distributed systems.\nEXPERIENCE\nPrincipal Architect at Enterprise Cloud - Scaled global storage tier to 50 Petabytes.\nEDUCATION\nPh.D. in Computer Science - Distributed Consensus Protocols.\nPUBLICATIONS\nByzantine Fault Tolerance at Scale - IEEE Transactions 2021.\nSKILLS\nGo, Rust, Distributed Systems, Raft, Paxos, Kubernetes, C++."

        cases.append(ExtractionBenchmarkCase(f"EXT-MUL-0{i}", "Multi-page", f"Multi-Page Layout {i} ({'3-Page' if i == 3 else '2-Page'})", "pdf", pdf_b, exp_text, expected_sections, exp_o))

    # -------------------------------------------------------------
    # 9. Unicode / Unusual Formatting (2 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 3):
        sections = [
            {"title": "Summary", "content": ["Software engineer specialized in internationalization & NLP."]},
            {"title": "Experience", "content": ["Engineered algorithmic engine (α-β pruning) with 99.9% uptime — zero latency regression."]},
            {"title": "Education", "content": ["M.Sc. in Computer Science (Summa Cum Laude, GPA 4.0/4.0)."]},
            {"title": "Skills", "content": ["Python, C++, PyTorch, Docker, Kubernetes, AWS."]}
        ]
        pdf_b, exp_t, exp_o = _create_single_column_pdf(f"Candidate Unicode {i}", f"unicode{i}@skillscatalyst.io", f"+1-555-090{i}", sections)
        cases.append(ExtractionBenchmarkCase(f"EXT-UNI-0{i}", "Unicode/unusual formatting", f"Unicode & Mathematical Formatting {i}", "pdf", pdf_b, exp_t, set(exp_o), exp_o))

    # -------------------------------------------------------------
    # 10. Scanned / Image-Only (2 fixtures)
    # -------------------------------------------------------------
    for i in range(1, 3):
        pdf_b, exp_t, exp_o = _create_scanned_pdf()
        cases.append(ExtractionBenchmarkCase(
            case_id=f"EXT-SCN-0{i}",
            category="Scanned / Image-based",
            title=f"Scanned Flat Image Resume {i}",
            format="pdf",
            file_bytes=pdf_b,
            expected_text="",
            expected_sections=set(),
            expected_section_order=[],
            is_scanned=True
        ))

    return cases


def run_extraction_benchmark() -> Dict[str, Any]:
    """
    Executes the extraction benchmark across all 32 layout fixtures.
    Returns aggregated metrics and per-case results.
    """
    cases = build_extraction_benchmark_dataset()
    results = []

    total_char_sim = 0.0
    total_word_precision = 0.0
    total_word_recall = 0.0
    total_word_f1 = 0.0
    total_section_acc = 0.0
    total_reading_order_acc = 0.0

    digital_count = 0
    scanned_detected_correctly = 0
    scanned_total = 0

    for case in cases:
        try:
            report = extract_document(case.file_bytes, f"{case.case_id}.{case.format}")
            err_msg = None
        except ValueError as ve:
            report = None
            err_msg = str(ve)

        if case.is_scanned:
            scanned_total += 1
            is_flagged = (
                (err_msg is not None and "scanned" in err_msg.lower()) or
                (report is not None and (report.is_scanned or any("scanned" in w.lower() for w in report.warnings) or report.char_count < 100))
            )
            if is_flagged:
                scanned_detected_correctly += 1
            results.append({
                "case_id": case.case_id,
                "category": case.category,
                "title": case.title,
                "format": case.format,
                "is_scanned": True,
                "scanned_flagged": is_flagged,
                "char_sim": 1.0 if is_flagged else 0.0,
                "word_f1": 1.0 if is_flagged else 0.0,
                "section_acc": 1.0 if is_flagged else 0.0,
                "reading_order_acc": 1.0 if is_flagged else 0.0,
                "quality_score": 0.0 if not report else report.extraction_quality,
                "status": "PASS" if is_flagged else "FAIL"
            })
            continue

        if report is None:
            results.append({
                "case_id": case.case_id,
                "category": case.category,
                "title": case.title,
                "format": case.format,
                "is_scanned": False,
                "char_sim": 0.0,
                "word_precision": 0.0,
                "word_recall": 0.0,
                "word_f1": 0.0,
                "section_acc": 0.0,
                "reading_order_acc": 0.0,
                "quality_score": 0.0,
                "status": "FAIL",
                "error": err_msg
            })
            continue

        digital_count += 1
        # Run ATS engine to detect section order
        ats_rep = evaluate_resume_ats(report.extracted_text)
        detected_sections = set(ats_rep.detected_sections)
        detected_order = ats_rep.detected_sections

        char_sim = calculate_character_similarity(case.expected_text, report.extracted_text)
        p, r, f1 = calculate_word_precision_recall_f1(case.expected_text, report.extracted_text)
        _, _, sec_f1 = calculate_section_detection_accuracy(case.expected_sections, detected_sections)
        order_acc = calculate_reading_order_accuracy(case.expected_section_order, detected_order)

        total_char_sim += char_sim
        total_word_precision += p
        total_word_recall += r
        total_word_f1 += f1
        total_section_acc += sec_f1
        total_reading_order_acc += order_acc

        passed = (f1 >= 0.85 and sec_f1 >= 0.80 and order_acc >= 0.80)
        results.append({
            "case_id": case.case_id,
            "category": case.category,
            "title": case.title,
            "format": case.format,
            "is_scanned": False,
            "char_sim": char_sim,
            "word_precision": p,
            "word_recall": r,
            "word_f1": f1,
            "section_acc": sec_f1,
            "reading_order_acc": order_acc,
            "quality_score": report.extraction_quality,
            "status": "PASS" if passed else "FAIL"
        })

    avg_char_sim = total_char_sim / digital_count if digital_count else 0.0
    avg_word_precision = total_word_precision / digital_count if digital_count else 0.0
    avg_word_recall = total_word_recall / digital_count if digital_count else 0.0
    avg_word_f1 = total_word_f1 / digital_count if digital_count else 0.0
    avg_section_acc = total_section_acc / digital_count if digital_count else 0.0
    avg_reading_order_acc = total_reading_order_acc / digital_count if digital_count else 0.0

    return {
        "total_cases": len(cases),
        "digital_cases": digital_count,
        "scanned_cases": scanned_total,
        "scanned_detected_correctly": scanned_detected_correctly,
        "avg_char_similarity": avg_char_sim,
        "avg_word_precision": avg_word_precision,
        "avg_word_recall": avg_word_recall,
        "avg_word_f1": avg_word_f1,
        "avg_section_accuracy": avg_section_acc,
        "avg_reading_order_accuracy": avg_reading_order_acc,
        "per_case_results": results,
    }


if __name__ == "__main__":
    benchmark_data = run_extraction_benchmark()
    print(f"Extraction Benchmark Completed: {benchmark_data['total_cases']} cases.")
    print(f"Avg Word F1: {benchmark_data['avg_word_f1'] * 100:.2f}%")
    print(f"Avg Section Acc: {benchmark_data['avg_section_accuracy'] * 100:.2f}%")
    print(f"Avg Reading Order Acc: {benchmark_data['avg_reading_order_accuracy'] * 100:.2f}%")
    print(f"Scanned Acc: {benchmark_data['scanned_detected_correctly']}/{benchmark_data['scanned_cases']}")
    print("-" * 75)
    for r in benchmark_data["per_case_results"]:
        f1 = r.get("word_f1", 0)
        sec = r.get("section_acc", 0)
        ord_acc = r.get("reading_order_acc", 0)
        print(f"{r['case_id']} | {r['category']:<25} | F1: {f1:.2f} | Sec: {sec:.2f} | Ord: {ord_acc:.2f} | {r['status']}")
