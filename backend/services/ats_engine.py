"""
Deterministic ATS Analysis Engine.

Performs rule-based, deterministic analysis of resume text without relying on LLM guesses:
1. Contact Information Extraction (Name, Email, Phone, LinkedIn, GitHub, Portfolio).
2. Section Classification & Heading Recognition (Education, Experience, Projects, Skills, etc.).
3. Structural Health Analysis (Date consistency, bullet point standardization, symbol sanity).
4. Measurable ATS Compatibility Findings (Critical, Warning, Good) with actionable fixes.
5. Deterministic ATS Compatibility Score & Structure Score computation (0-100).
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Any, Set, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class ContactInformation(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    has_email: bool = False
    has_phone: bool = False
    has_linkedin: bool = False
    has_github: bool = False
    has_portfolio: bool = False
    detected_fields: List[str] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    missing_critical: List[str] = Field(default_factory=list)


class ATSFinding(BaseModel):
    id: str
    category: str  # "contact" | "sections" | "formatting" | "readability"
    severity: str  # "critical" | "warning" | "good"
    issue: str
    evidence: str
    impact: str
    recommended_fix: str


class ATSAnalysisReport(BaseModel):
    ats_compatibility_score: float = Field(description="Deterministic ATS compatibility score (0-100)")
    structure_score: float = Field(description="Deterministic structural health & readability score (0-100)")
    contact_information: ContactInformation
    detected_sections: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    empty_sections: List[str] = Field(default_factory=list, description="Sections with headings but zero substantive content (anti-gaming)")
    critical_issues_count: int = 0
    warnings_count: int = 0
    good_points_count: int = 0
    findings: List[ATSFinding] = Field(default_factory=list)
    career_stage_detected: str = "fresher"  # "fresher" | "experienced"


# ---------------------------------------------------------------------------
# Section Taxonomy & Aliases
# ---------------------------------------------------------------------------

SECTION_TAXONOMY = {
    "EDUCATION": [
        r"\beducation\b", r"\bacademics?\b", r"\bacacademic\s+background\b",
        r"\beducational\s+qualifications?\b", r"\bqualifications?\b"
    ],
    "EXPERIENCE": [
        r"\bexperience\b", r"\bwork\s+experience\b", r"\bemployment\b",
        r"\bprofessional\s+experience\b", r"\bwork\s+history\b"
    ],
    "INTERNSHIPS": [
        r"\binternships?\b", r"\binternship\s+experience\b", r"\bindustrial\s+training\b"
    ],
    "PROJECTS": [
        r"\bprojects?\b", r"\btechnical\s+projects?\b", r"\bacademic\s+projects?\b",
        r"\bpersonal\s+projects?\b", r"\bkey\s+projects?\b"
    ],
    "SKILLS": [
        r"\bskills?\b", r"\btechnical\s+skills?\b", r"\bskills\s*&\s*competencies\b",
        r"\bcore\s+competencies\b", r"\btechnologies\b", r"\btools\s*&\s*technologies\b"
    ],
    "SUMMARY": [
        r"\bsummary\b", r"\bprofessional\s+summary\b", r"\bprofile\b",
        r"\babout\s+me\b", r"\bexecutive\s+summary\b"
    ],
    "OBJECTIVE": [
        r"\bobjective\b", r"\bcareer\s+objective\b"
    ],
    "CERTIFICATIONS": [
        r"\bcertifications?\b", r"\bcertificates?\b", r"\blicenses?\s*&\s*certifications?\b",
        r"\baccreditations?\b"
    ],
    "ACHIEVEMENTS": [
        r"\bachievements?\b", r"\bawards?\b", r"\bhonors?\s*&\s*awards?\b",
        r"\baccomplishments?\b"
    ],
    "PUBLICATIONS": [
        r"\bpublications?\b", r"\bresearch\s+papers?\b"
    ],
    "LEADERSHIP": [
        r"\bleadership\b", r"\bextracurricular\s+activities?\b", r"\bactivities?\b",
        r"\bpositions\s+of\s+responsibility\b", r"\bvolunteering\b"
    ],
}


# ---------------------------------------------------------------------------
# Contact Detection
# ---------------------------------------------------------------------------

def extract_contact_info(text: str) -> ContactInformation:
    """
    Extracts name, email, phone, and professional links deterministically.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # 1. Email extraction (RFC 5322 regex)
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0).lower().strip(".") if email_match else None

    # 2. Phone extraction (International & Standard formats)
    phone_pattern = re.compile(
        r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,5}'
    )
    # Search first 1500 chars (header) to avoid phone false positives in text/dates
    header_snippet = text[:1500]
    phones = phone_pattern.findall(header_snippet)
    valid_phone = None
    for p in phones:
        digits_only = re.sub(r'\D', '', p)
        if 9 <= len(digits_only) <= 15:
            valid_phone = p.strip()
            break

    # 3. LinkedIn
    li_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    linkedin = li_match.group(0) if li_match else None

    # 4. GitHub
    gh_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    github = gh_match.group(0) if gh_match else None

    # 5. Portfolio / Personal Site
    port_match = re.search(
        r'(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|me|dev|tech|site|online|io))',
        text,
        re.IGNORECASE
    )
    portfolio = port_match.group(0) if port_match else None

    # 6. Candidate Name heuristic from top 5 lines
    candidate_name = None
    exclude_name_words = {"resume", "curriculum", "vitae", "cv", "profile", "contact", "email", "phone"}
    for line in lines[:5]:
        line_clean = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        words = line_clean.split()
        if 2 <= len(words) <= 4:
            if not any(w.lower() in exclude_name_words for w in words):
                candidate_name = line_clean
                break

    detected = []
    missing = []

    if email: detected.append("email")
    else: missing.append("email")

    if valid_phone: detected.append("phone")
    else: missing.append("phone")

    if linkedin: detected.append("linkedin")
    else: missing.append("linkedin")

    if github: detected.append("github")
    if portfolio: detected.append("portfolio")
    if candidate_name: detected.append("name")

    has_email = bool(email)
    has_phone = bool(valid_phone)
    has_linkedin = bool(linkedin)
    has_github = bool(github)
    has_portfolio = bool(portfolio)
    missing_critical = []
    if not has_email:
        missing_critical.append("email")
    if not has_phone:
        missing_critical.append("phone")

    return ContactInformation(
        name=candidate_name,
        email=email,
        phone=valid_phone,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
        has_email=has_email,
        has_phone=has_phone,
        has_linkedin=has_linkedin,
        has_github=has_github,
        has_portfolio=has_portfolio,
        detected_fields=detected,
        missing_fields=missing,
        missing_critical=missing_critical,
    )


# ---------------------------------------------------------------------------
# Section Detection
# ---------------------------------------------------------------------------

class SectionDetectionResult(tuple):
    """
    Backward-compatible tuple (detected, missing) with empty_sections tracking.
    """
    def __new__(cls, detected: List[str], missing: List[str], empty_sections: Optional[List[str]] = None):
        return super().__new__(cls, (detected, missing))

    def __init__(self, detected: List[str], missing: List[str], empty_sections: Optional[List[str]] = None):
        self.empty_sections: List[str] = empty_sections or []


def detect_sections(text: str) -> SectionDetectionResult:
    """
    Scans the document for recognizable section headings in document appearance order.
    Handles both standalone line headings (e.g. EDUCATION) and inline colon headings (e.g. EDUCATION: ...).
    Guards against empty section heading gaming: verifies actual substantive content exists under each heading.
    Returns SectionDetectionResult (unpacks as (detected_sections, missing_sections)).
    """
    detected_with_index: List[Tuple[int, str, bool]] = []  # (line_idx, section_name, is_inline)
    lines = text.split("\n")

    for section_name, patterns in SECTION_TAXONOMY.items():
        for idx, line in enumerate(lines):
            line_str = line.strip().lower()
            if not line_str:
                continue

            is_match = False
            is_inline = False
            # Candidate 1: Standalone short line (< 50 chars)
            if len(line_str) <= 50:
                clean_line = re.sub(r'^[#*\-•\s|]+|[#*\-•\s|:]+$', '', line_str).strip()
                for pat in patterns:
                    if re.search(rf'^{pat}$', clean_line, re.IGNORECASE) or re.search(rf'^{pat}\s*:', clean_line, re.IGNORECASE):
                        is_match = True
                        break

            # Candidate 2: Inline colon heading on longer line (e.g. "EDUCATION: B.Tech...")
            if not is_match and ":" in line_str:
                prefix = line_str.split(":", 1)[0].strip()
                if len(prefix) <= 35:
                    clean_prefix = re.sub(r'^[#*\-•\s|]+|[#*\-•\s|:]+$', '', prefix).strip()
                    for pat in patterns:
                        if re.search(rf'^{pat}$', clean_prefix, re.IGNORECASE):
                            is_match = True
                            is_inline = True
                            break

            if is_match:
                detected_with_index.append((idx, section_name, is_inline))
                break

    # Sort by line position to preserve true document reading order
    detected_with_index.sort(key=lambda x: x[0])

    seen: Set[str] = set()
    detected: List[str] = []
    empty_sections: List[str] = []

    for i, (idx, sec_name, is_inline) in enumerate(detected_with_index):
        if sec_name in seen:
            continue
        seen.add(sec_name)

        # Anti-gaming check: verify substantive content under header
        next_idx = detected_with_index[i + 1][0] if i + 1 < len(detected_with_index) else len(lines)
        if is_inline:
            line_after_colon = lines[idx].split(":", 1)[1] if ":" in lines[idx] else ""
            body = " ".join(lines[idx + 1:next_idx])
            content_text = (line_after_colon + " " + body).strip()
        else:
            content_text = " ".join(lines[idx + 1:next_idx]).strip()

        # Alphanumeric check: heading must have at least 8 alphanumeric chars of actual content
        alphanumeric_count = len(re.sub(r'[^a-zA-Z0-9]', '', content_text))
        if alphanumeric_count >= 8:
            detected.append(sec_name)
        else:
            empty_sections.append(sec_name)

    # Determine missing important sections
    # Core standard sections: EDUCATION, SKILLS, and (EXPERIENCE or PROJECTS)
    all_core = ["EDUCATION", "SKILLS", "EXPERIENCE", "PROJECTS", "SUMMARY"]
    missing = [s for s in all_core if s not in detected]

    return SectionDetectionResult(detected, missing, empty_sections)


# ---------------------------------------------------------------------------
# Structure & Health Analysis
# ---------------------------------------------------------------------------

def analyze_structure_and_symbols(text: str) -> Dict[str, Any]:
    """
    Evaluates:
    - Bullet point consistency
    - Date format consistency
    - Unusual symbols/emojis
    - Word count density
    """
    lines = text.split("\n")
    bullet_types: Dict[str, int] = {}
    standard_bullets = {'•', '-', '*', '–', '—', '▪'}

    for line in lines:
        stripped = line.strip()
        if stripped:
            first_char = stripped[0]
            if first_char in standard_bullets:
                bullet_types[first_char] = bullet_types.get(first_char, 0) + 1

    # Date formatting patterns
    date_patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b',  # Month YYYY
        r'\b\d{1,2}\/\d{4}\b',  # MM/YYYY
        r'\b20\d{2}\s*[-–—]\s*(?:20\d{2}|Present|Current)\b',  # YYYY - YYYY
        r'\b(?:19|20)\d{2}\b',  # Bare year
    ]
    detected_dates_count = sum(len(re.findall(p, text, re.IGNORECASE)) for p in date_patterns)

    # Unusual characters / Wingdings / Emojis that crash legacy ATS parsers
    # Emojis regex range
    emoji_pattern = re.compile(
        r'[\U00010000-\U0010ffff]',
        flags=re.UNICODE
    )
    unusual_symbols = emoji_pattern.findall(text)

    # Word count
    word_count = len(text.split())

    return {
        "bullet_counts": bullet_types,
        "uses_bullets": sum(bullet_types.values()) >= 3,
        "multiple_bullet_styles": len(bullet_types) > 2,
        "detected_dates_count": detected_dates_count,
        "unusual_symbols": unusual_symbols,
        "word_count": word_count,
    }


# ---------------------------------------------------------------------------
# Master ATS Engine Analysis
# ---------------------------------------------------------------------------

def evaluate_resume_ats(
    text: str,
    years_experience: Optional[str] = "1-3 years",
    detected_columns: int = 1,
    extraction_quality: float = 100.0,
) -> ATSAnalysisReport:
    """
    Executes full deterministic ATS compatibility analysis on extracted text.
    Returns structured ATSAnalysisReport.
    """
    findings: List[ATSFinding] = []
    contact = extract_contact_info(text)
    sec_res = detect_sections(text)
    detected_sections, missing_sections = sec_res
    empty_sections = getattr(sec_res, "empty_sections", [])
    struct_info = analyze_structure_and_symbols(text)

    # Detect career stage
    is_fresher = (
        years_experience in ("0-1 years", "Student", "Fresher", "Intern") or
        "0-" in (years_experience or "") or
        "EDUCATION" in detected_sections and "EXPERIENCE" not in detected_sections
    )
    career_stage = "fresher" if is_fresher else "experienced"

    # Base Scores
    ats_score = 100.0
    structure_score = 100.0

    # 1. Contact Checks
    if not contact.email:
        findings.append(ATSFinding(
            id="ATS-CONT-01",
            category="contact",
            severity="critical",
            issue="Missing Email Address",
            evidence="No valid email pattern found in the resume document.",
            impact="Recruiters and ATS parsers cannot send automated interview invites or index the candidate.",
            recommended_fix="Place a professional email address (e.g., name@gmail.com) at the very top header."
        ))
        ats_score -= 20.0
    else:
        findings.append(ATSFinding(
            id="ATS-CONT-02",
            category="contact",
            severity="good",
            issue="Valid Email Address Detected",
            evidence=f"Detected: {contact.email}",
            impact="Candidate profile can be reliably indexed by all ATS systems.",
            recommended_fix="Keep contact info at the top."
        ))

    if not contact.phone:
        findings.append(ATSFinding(
            id="ATS-CONT-03",
            category="contact",
            severity="warning",
            issue="Missing Phone Number",
            evidence="No standard 10-15 digit phone number was identified.",
            impact="Recruiters cannot conduct phone screenings or verify geographic location.",
            recommended_fix="Add your phone number with country code (e.g. +91 98765 43210)."
        ))
        # Scaled penalty: 5pt if email is present (since recruiters can still email), 10pt if email also missing
        ats_score -= 5.0 if contact.email else 10.0

    if not contact.linkedin:
        findings.append(ATSFinding(
            id="ATS-CONT-04",
            category="contact",
            severity="warning",
            issue="Missing LinkedIn Profile URL",
            evidence="No linkedin.com URL detected.",
            impact="Over 85% of tech recruiters verify candidates via LinkedIn before scheduling interviews.",
            recommended_fix="Add your personalized LinkedIn profile URL (e.g. linkedin.com/in/yourname)."
        ))
        ats_score -= 5.0
    else:
        findings.append(ATSFinding(
            id="ATS-CONT-05",
            category="contact",
            severity="good",
            issue="LinkedIn Profile Found",
            evidence=f"Detected: {contact.linkedin}",
            impact="Enhances candidate verification and credibility.",
            recommended_fix="Ensure LinkedIn profile mirrors the resume."
        ))

    # 2. Section Checks (Career-Stage Aware)
    if "SKILLS" not in detected_sections:
        findings.append(ATSFinding(
            id="ATS-SEC-01",
            category="sections",
            severity="critical",
            issue="Missing Dedicated Technical Skills Section",
            evidence="Could not find headings like 'Skills', 'Technical Skills', or 'Technologies'.",
            impact="Keyword indexing will fail or penalize relevance because skills are scattered.",
            recommended_fix="Add an explicit 'Technical Skills' section categorized by Languages, Frameworks, Tools, and Databases."
        ))
        ats_score -= 20.0
    else:
        findings.append(ATSFinding(
            id="ATS-SEC-02",
            category="sections",
            severity="good",
            issue="Dedicated Skills Section Present",
            evidence="Standard skills heading recognized.",
            impact="ATS keyword filters parse and match competencies quickly.",
            recommended_fix="Keep skills grouped logically."
        ))

    if "EDUCATION" not in detected_sections:
        findings.append(ATSFinding(
            id="ATS-SEC-03",
            category="sections",
            severity="critical",
            issue="Missing Education Section",
            evidence="No recognized 'Education' heading found.",
            impact="ATS filters with degree requirements (e.g. B.Tech / B.S.) will automatically disqualify the resume.",
            recommended_fix="Add an 'Education' section listing your degree, institution, graduation year, and GPA/percentage."
        ))
        ats_score -= 15.0

    # Career-stage fair experience evaluation:
    if "EXPERIENCE" not in detected_sections and "INTERNSHIPS" not in detected_sections:
        if is_fresher and "PROJECTS" in detected_sections:
            # Student/fresher with projects: DO NOT severely penalize!
            findings.append(ATSFinding(
                id="ATS-SEC-04",
                category="sections",
                severity="good",
                issue="Strong Project Portfolio (Fresher Track)",
                evidence="Projects section identified in lieu of full-time professional experience.",
                impact="Demonstrates hands-on engineering capabilities suitable for campus / junior hiring.",
                recommended_fix="Continue expanding practical project outcomes with quantifiable metrics."
            ))
        else:
            findings.append(ATSFinding(
                id="ATS-SEC-05",
                category="sections",
                severity="critical" if not is_fresher else "warning",
                issue="Missing Work Experience or Projects Section",
                evidence="Neither Experience, Internships, nor Projects was detected.",
                impact="ATS cannot evaluate candidate's practical contributions.",
                recommended_fix="Add detailed Experience or Project entries with bullet points highlighting your contributions."
            ))
            ats_score -= 20.0

    # Anti-gaming check: penalize empty section headers
    for emp_sec in empty_sections:
        findings.append(ATSFinding(
            id=f"ATS-SEC-EMPTY-{emp_sec[:4]}",
            category="sections",
            severity="critical",
            issue=f"Empty Section Header Detected: {emp_sec}",
            evidence=f"Heading '{emp_sec}' was detected but contains zero substantive entries or bullet points.",
            impact="Empty section headings are flagged by ATS parsers and recruiters as placeholders or gaming attempts.",
            recommended_fix=f"Provide substantive accomplishment entries under '{emp_sec}' or remove the empty heading."
        ))
        ats_score -= 15.0
        structure_score -= 10.0

    # 3. Formatting & Structural Checks
    if not struct_info["uses_bullets"]:
        findings.append(ATSFinding(
            id="ATS-FMT-01",
            category="formatting",
            severity="warning",
            issue="Few or Inconsistent Bullet Points",
            evidence="Fewer than 3 bullet points detected across the document.",
            impact="Paragraph-based resumes have a 60% lower human readability rating and parse poorly in ATS.",
            recommended_fix="Format project and experience accomplishments using concise, action-oriented bullet points."
        ))
        structure_score -= 15.0

    if struct_info["multiple_bullet_styles"]:
        findings.append(ATSFinding(
            id="ATS-FMT-02",
            category="formatting",
            severity="warning",
            issue="Inconsistent Bullet Symbols",
            evidence="Found multiple different bullet glyphs across sections.",
            impact="Suggests copied or pasted text fragments with inconsistent styling.",
            recommended_fix="Use a single standard bullet character (e.g. '•' or '-') consistently."
        ))
        structure_score -= 5.0

    if struct_info["unusual_symbols"]:
        findings.append(ATSFinding(
            id="ATS-FMT-03",
            category="formatting",
            severity="warning",
            issue="Non-Standard Unicode Emojis / Symbols Detected",
            evidence=f"Found {len(struct_info['unusual_symbols'])} decorative emojis or symbols.",
            impact="Older enterprise ATS parsers (Taleo, iCIMS) render emojis as garbled text or parsing errors.",
            recommended_fix="Replace graphic emojis with plain text headers and standard bullet points."
        ))
        ats_score -= 5.0
        structure_score -= 5.0

    if detected_columns > 1:
        findings.append(ATSFinding(
            id="ATS-FMT-04",
            category="formatting",
            severity="warning",
            issue=f"Multi-Column Layout Detected ({detected_columns} columns)",
            evidence=f"Document geometry has {detected_columns} visual columns.",
            impact="Complex columns can cause older ATS parsers to interleave lines horizontally across columns.",
            recommended_fix="Single-column layouts are universally recommended for 100% ATS parse reliability."
        ))
        structure_score -= 5.0

    # Separate ATS parsing from content length/readability (no duplicate penalty)
    if struct_info["word_count"] < 80:
        findings.append(ATSFinding(
            id="ATS-FMT-05",
            category="readability",
            severity="critical",
            issue="Resume Content is Extremely Brief",
            evidence=f"Word count is only {struct_info['word_count']} words.",
            impact="Lacks sufficient technical substance and keyword density for ATS ranking.",
            recommended_fix="Expand your resume with detailed project descriptions, tech stack details, and quantifiable metrics."
        ))
        structure_score -= 15.0
    elif struct_info["word_count"] < 150:
        findings.append(ATSFinding(
            id="ATS-FMT-05",
            category="readability",
            severity="warning",
            issue="Resume Content is Relatively Brief",
            evidence=f"Word count is {struct_info['word_count']} words.",
            impact="Early-career resumes benefit from slightly more descriptive accomplishment bullets.",
            recommended_fix="Elaborate on project outcomes and key technical decisions."
        ))
        structure_score -= 5.0
    elif struct_info["word_count"] > 1200:
        findings.append(ATSFinding(
            id="ATS-FMT-06",
            category="readability",
            severity="warning",
            issue="Resume Content is Overly Long",
            evidence=f"Word count exceeds {struct_info['word_count']} words.",
            impact="Exceeds optimal length for early-career professionals and creates recruiter fatigue.",
            recommended_fix="Condense content to 1 page (freshers/mid) or 2 pages (seniors), removing redundant details."
        ))
        structure_score -= 10.0

    # Tally finding severities
    crit_count = sum(1 for f in findings if f.severity == "critical")
    warn_count = sum(1 for f in findings if f.severity == "warning")
    good_count = sum(1 for f in findings if f.severity == "good")

    # Strictly bound scores to [0.0, 100.0] without artificial floors
    final_ats = max(0.0, min(100.0, round(ats_score, 1)))
    final_structure = max(0.0, min(100.0, round(structure_score, 1)))

    return ATSAnalysisReport(
        ats_compatibility_score=final_ats,
        structure_score=final_structure,
        contact_information=contact,
        detected_sections=detected_sections,
        missing_sections=missing_sections,
        empty_sections=empty_sections,
        critical_issues_count=crit_count,
        warnings_count=warn_count,
        good_points_count=good_count,
        findings=findings,
        career_stage_detected=career_stage,
    )
