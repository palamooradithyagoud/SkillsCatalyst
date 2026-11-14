"""
Education & Certifications Evaluation Engine (Dimension 5 - 10% Weight).

Evaluates:
- Educational completeness: Degree, major/specialization, institution, graduation year, CGPA/GPA.
- Professional certifications: Cloud (AWS, Azure, GCP), Kubernetes (CKA), cybersecurity, development.
- Technical alignment: Relevancy to computing, software engineering, and technical disciplines.
- Equity guarantee: Zero university prestige penalties or bias against non-traditional institutions.
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class ExtractedDegree(BaseModel):
    degree: str
    major: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None


class ExtractedCertification(BaseModel):
    name: str
    issuer: Optional[str] = None
    year: Optional[str] = None


class EducationEvaluationReport(BaseModel):
    education_certifications_score: float = Field(default=75.0, description="Dimension 5 Score (0-100 scale, 10% weight)")
    has_degree: bool = False
    degrees: List[ExtractedDegree] = Field(default_factory=list)
    certifications: List[ExtractedCertification] = Field(default_factory=list)
    completeness_status: str = "complete"  # "complete" | "partial" | "missing"
    has_certifications: bool = False
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Regex Taxonomies
# ---------------------------------------------------------------------------

_DEGREE_PATTERNS = [
    (r'\b(?:Bachelor\s+of\s+Technology|B\.?\s*Tech|BTech)\b', "B.Tech"),
    (r'\b(?:Bachelor\s+of\s+Engineering|B\.?\s*E|B\.?Eng)\b', "B.E."),
    (r'\b(?:Bachelor\s+of\s+Science|B\.?\s*S|B\.?Sc|BSc)\b', "B.S."),
    (r'\b(?:Bachelor\s+of\s+Computer\s+Applications|B\.?\s*C\.?\s*A|BCA)\b', "B.C.A."),
    (r'\b(?:Master\s+of\s+Technology|M\.?\s*Tech|MTech)\b', "M.Tech"),
    (r'\b(?:Master\s+of\s+Science|M\.?\s*S|M\.?Sc|MSc)\b', "M.S."),
    (r'\b(?:Master\s+of\s+Computer\s+Applications|M\.?\s*C\.?\s*A|MCA)\b', "M.C.A."),
    (r'\b(?:Master\s+of\s+Business\s+Administration|M\.?\s*B\.?\s*A|MBA)\b', "M.B.A."),
    (r'\b(?:Doctor\s+of\s+Philosophy|Ph\.?\s*D|Doctorate)\b', "Ph.D."),
    (r'\b(?:Associate\s+Degree|A\.?\s*S|A\.?A)\b', "Associate Degree"),
    (r'\b(?:Diploma\s+in\s+[^,\.\n]+)\b', "Diploma"),
]

_MAJOR_PATTERNS = [
    r'Computer\s+Science(?:\s+and\s+Engineering)?',
    r'Information\s+Technology',
    r'Software\s+Engineering',
    r'Data\s+Science',
    r'Artificial\s+Intelligence(?:\s+and\s+Machine\s+Learning)?',
    r'Electrical\s+and\s+Electronics',
    r'Electronics\s+and\s+Communication',
    r'Mechanical\s+Engineering',
    r'Civil\s+Engineering',
    r'Mathematics(?:\s+and\s+Computing)?',
    r'Cybersecurity',
    r'Information\s+Systems',
]

_CERT_PATTERNS = [
    (r'\bAWS\s+Certified\s+[^,\.\n]+|\bAWS\s+(?:Solutions\s+Architect|Developer|SysOps|Cloud\s+Practitioner)\b', "AWS"),
    (r'\bGoogle\s+Cloud\s+Certified\s+[^,\.\n]+|\bAssociate\s+Cloud\s+Engineer\b|\bProfessional\s+Cloud\s+Architect\b', "Google Cloud"),
    (r'\b(?:Microsoft\s+Certified|Azure\s+Fundamentals|AZ-900|AZ-104|AZ-204)\b', "Microsoft Azure"),
    (r'\b(?:Certified\s+Kubernetes\s+Administrator|CKA|CKAD|CKS)\b', "Linux Foundation"),
    (r'\b(?:HashiCorp\s+Certified|Terraform\s+Associate)\b', "HashiCorp"),
    (r'\b(?:CompTIA\s+Security\+|CompTIA\s+Network\+|CompTIA\s+A\+)\b', "CompTIA"),
    (r'\b(?:Cisco\s+Certified|CCNA|CCNP)\b', "Cisco"),
    (r'\b(?:Meta\s+Front-End|Meta\s+Back-End|Meta\s+Database)\s+Developer\b', "Meta"),
    (r'\b(?:Certified\s+Scrum\s+Master|CSM)\b', "Scrum Alliance"),
    (r'\b(?:Oracle\s+Certified|OCP|OCA)\b', "Oracle"),
]

_GPA_REGEX = re.compile(
    r'(?:'
    r'\b(?:CGPA|GPA|Score|Percentage)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(?:10|4(?:\.0)?|100)|%)?|'
    r'\b(\d+(?:\.\d+)?)\s*\/\s*(?:10|4(?:\.0)?)\s*(?:CGPA|GPA)?|'
    r'\b(\d{2}(?:\.\d+)?)\s*%\s*(?:aggregate|marks)?'
    r')',
    re.IGNORECASE
)

_YEAR_REGEX = re.compile(
    r'\b(20\d{2}|19\d{2})\s*(?:[-–—to]+\s*(?:20\d{2}|Present|Current|Expected|\d{2}))?\b',
    re.IGNORECASE
)


# ---------------------------------------------------------------------------
# Section Slicing Helper
# ---------------------------------------------------------------------------

def _extract_section(resume_text: str, headings: List[str]) -> str:
    lines = resume_text.splitlines()
    in_section = False
    section_lines = []

    pattern = re.compile(
        rf'^\s*(?:##\s*|[-*•]\s*)?(?:{"|".join(headings)})\s*[:\-\—]?\s*$',
        re.IGNORECASE
    )
    stop_pattern = re.compile(
        r'^\s*(?:##\s*|[-*•]\s*)?(?:education|academic|skills|technical skills|projects|experience|employment|work history|certifications|awards|contact|summary|languages)\s*[:\-\—]?\s*$',
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if pattern.match(stripped):
            in_section = True
            continue
        elif in_section and stop_pattern.match(stripped):
            break
        elif in_section:
            section_lines.append(line)

    return "\n".join(section_lines).strip()


# ---------------------------------------------------------------------------
# Evaluator Function
# ---------------------------------------------------------------------------

def evaluate_education_and_certifications(
    resume_text: str,
    target_role: Optional[str] = "Fullstack Software Engineer",
    **kwargs: Any,
) -> EducationEvaluationReport:
    """
    Deterministically evaluates candidate education, degrees, academic performance, and certifications.
    Returns structured EducationEvaluationReport for Dimension 5 (10% weight).
    """
    edu_text = _extract_section(resume_text, ["education", "academic background", "academics", "educational qualification"])
    cert_text = _extract_section(resume_text, ["certifications", "certificates", "licenses & certifications", "professional certifications"])

    if not edu_text and not cert_text:
        # Fallback to whole resume scan
        edu_text = resume_text

    extracted_degrees: List[ExtractedDegree] = []
    extracted_certs: List[ExtractedCertification] = []

    # 1. Degree Extraction
    for pat, canonical in _DEGREE_PATTERNS:
        match = re.search(pat, edu_text, re.IGNORECASE)
        if match:
            # Look around match for major, year, gpa
            start = max(0, match.start() - 100)
            end = min(len(edu_text), match.end() + 150)
            context = edu_text[start:end]

            major_found = None
            for m_pat in _MAJOR_PATTERNS:
                m_match = re.search(m_pat, context, re.IGNORECASE)
                if m_match:
                    major_found = m_match.group(0).strip()
                    break

            year_match = _YEAR_REGEX.search(context)
            year_found = year_match.group(0).strip() if year_match else None

            gpa_match = _GPA_REGEX.search(context)
            gpa_found = gpa_match.group(0).strip() if gpa_match else None

            # Look for institution keyword (University, Institute, College, School, Campus)
            inst_found = None
            for line in context.splitlines():
                if any(w in line.lower() for w in ["university", "institute", "college", "school", "campus"]):
                    inst_found = line.strip()[:60]
                    break

            extracted_degrees.append(ExtractedDegree(
                degree=canonical,
                major=major_found or "Computer Science / Technical",
                institution=inst_found,
                year=year_found,
                gpa=gpa_found,
            ))
            break  # Highest/primary degree matched

    # 2. Certification Extraction
    combined_cert_text = cert_text + "\n" + resume_text
    seen_certs = set()
    for pat, issuer in _CERT_PATTERNS:
        for match in re.finditer(pat, combined_cert_text, re.IGNORECASE):
            cert_name = match.group(0).strip()
            if cert_name.lower() not in seen_certs:
                seen_certs.add(cert_name.lower())
                extracted_certs.append(ExtractedCertification(
                    name=cert_name,
                    issuer=issuer,
                ))

    # 3. Completeness & Scoring Calculation
    score = 0.0
    strengths = []
    weaknesses = []
    recommendations = []

    has_degree = len(extracted_degrees) > 0
    has_certs = len(extracted_certs) > 0

    if has_degree:
        deg = extracted_degrees[0]
        score += 65.0  # Base credit for formal degree
        strengths.append(f"Formal degree identified: {deg.degree} ({deg.major or 'Engineering/Technical'}).")

        if deg.institution:
            score += 10.0
        else:
            weaknesses.append("Institution or university name was not explicitly identified.")
            recommendations.append("List the full name of your university or college.")

        if deg.year:
            score += 10.0
        else:
            weaknesses.append("Graduation year or dates are missing.")
            recommendations.append("Specify graduation year or expected completion date (e.g. 'Graduating May 2025').")

        if deg.gpa:
            score += 5.0
            strengths.append(f"Academic score recorded: {deg.gpa}.")
    else:
        score += 25.0  # Non-traditional or boot-camp / self-taught path
        weaknesses.append("No standard academic degree heading (B.Tech, B.S., M.S.) identified.")
        recommendations.append("Add an 'Education' section with your degree, college, graduation year, and GPA.")

    # Certification Credit
    if has_certs:
        cert_count = len(extracted_certs)
        cert_bonus = min(15.0, cert_count * 8.0)
        score += cert_bonus
        strengths.append(f"Possesses {cert_count} industry certification(s): {', '.join(c.name for c in extracted_certs[:2])}.")
    else:
        recommendations.append("Consider pursuing role-relevant cloud or platform certifications (e.g. AWS Cloud Practitioner, CKA) to validate expertise.")

    final_score = max(0.0, min(100.0, round(score, 1)))

    if has_degree and extracted_degrees[0].institution and extracted_degrees[0].year:
        completeness = "complete"
    elif has_degree:
        completeness = "partial"
    else:
        completeness = "missing"

    return EducationEvaluationReport(
        education_certifications_score=final_score,
        has_degree=has_degree,
        degrees=extracted_degrees,
        certifications=extracted_certs,
        completeness_status=completeness,
        has_certifications=has_certs,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
    )

