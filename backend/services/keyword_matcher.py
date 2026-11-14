"""
Deterministic Job Description Keyword Matcher.

Features:
- Standardized taxonomy of 200+ tech skills, frameworks, databases, tools, cloud platforms, concepts.
- Normalized alias matching (ReactJS -> React, Postgres -> PostgreSQL, K8s -> Kubernetes, TS -> TypeScript).
- Regex word-boundary protection to eliminate substring false positives (e.g., 'c' in 'cat', 'go' in 'good').
- Role-based keyword inference when no explicit job description is supplied.
- Categorized matched and missing keyword reports.
- Deterministic keyword match percentage calculation.
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Optional, Set, Any, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class KeywordItem(BaseModel):
    name: str
    category: str  # "languages" | "frameworks" | "databases" | "tools" | "cloud" | "concepts" | "soft_skills"
    match_type: str = "exact"  # "exact" | "alias"


class KeywordAnalysisReport(BaseModel):
    total_keywords: int = 0
    matched_keywords_count: int = 0
    missing_keywords_count: int = 0
    exact_matches_count: int = 0
    alias_matches_count: int = 0
    keyword_match_percentage: Optional[float] = None
    matched: List[KeywordItem] = Field(default_factory=list)
    missing: List[KeywordItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    evaluation_mode: str = Field(default="general_resume", description="'general_resume' | 'job_specific'")
    job_match_status: str = Field(default="not_evaluated", description="'not_evaluated' | 'evaluated'")
    job_match_score: Optional[float] = Field(default=None, description="Score strictly against an uploaded JD (0-100). None if no JD.")
    keyword_optimization_score: float = Field(default=75.0, description="Dimension 2: Keyword Optimization (15%)")
    technical_skills_relevance_score: float = Field(default=75.0, description="Dimension 3: Technical Skills Relevance (15%)")
    keyword_stuffing_detected: bool = Field(default=False, description="Flagged if keywords are repeated unnaturally")
    stuffed_keywords: List[str] = Field(default_factory=list, description="Keywords repeated excessively")
    category_coverage: Dict[str, int] = Field(default_factory=dict, description="Count of verified skills per category")


# ---------------------------------------------------------------------------
# Comprehensive Keyword Taxonomy & Aliases
# ---------------------------------------------------------------------------

TAXONOMY_DICTIONARY: Dict[str, Dict[str, List[str]]] = {
    "languages": {
        "Python": ["python", "python3", "py"],
        "JavaScript": ["javascript", "js", "ecmascript"],
        "TypeScript": ["typescript", "ts"],
        "Java": ["java", "jvm"],
        "C++": ["c++", "cpp"],
        "C#": ["c#", "csharp", "dotnet c#"],
        "C": [r"\bc(?![+#])\b"],  # Word boundary strictly enforced, cannot be followed by + or #
        "Go": ["golang", r"\bgo\b"],
        "Rust": ["rust"],
        "SQL": ["sql", "structured query language"],
        "Ruby": ["ruby"],
        "PHP": ["php"],
        "Swift": ["swift"],
        "Kotlin": ["kotlin"],
        "Dart": ["dart"],
        "HTML/CSS": ["html", "css", "html5", "css3"],
        "Bash/Shell": ["bash", "shell scripting", "sh", "zsh"],
        "R": [
            r"\br-lang\b",
            r"\br-language\b",
            r"\br\s+language\b",
            r"\br\s+programming\b",
            r"\br-programming\b",
            r"\br\s+script(?:ing|s)?\b",
            r"\brstudio\b",
            r"\br-studio\b",
            r"\br\s+studio\b",
            r"\b(?:cran|tidyverse|ggplot2?|dplyr|shiny)\b",
            r"\b(?:used|using|use|utilizing|utilized|experience\s+with|proficient\s+in|knowledge\s+of|developed\s+in|programmed\s+in|programming\s+in|code\s+in|coding\s+in|written\s+in|scripted\s+in|expertise\s+in|skills?\s+in)\s+r\b",
            r"\br\b\s+(?:for\s+(?:statistical|data|analysis|analytics|modeling|machine\s+learning|regression|visualization|bioinformatics)|environment|scripts?|code|developer|programmer)\b",
            r"\b(?:python|java|c\+\+|c#|sql|scala|julia|matlab|sas|spss|bash|perl|ruby|javascript|typescript)\s*[,/|]\s*r\b",
            r"\br\b\s*[,/|]\s*(?:python|java|c\+\+|c#|sql|scala|julia|matlab|sas|spss|bash|perl|ruby|javascript|typescript)\b",
            r"\b(?:languages?|programming\s+languages?)\s*:[^.\n]*?\br\b",
            r"\b(?:required|requirements?|qualifications?|preferred|seeking)\s*:[^.\n]*?\br\b",
        ],
        "Scala": ["scala"],
    },
    "frameworks": {
        "React": ["react", "react.js", "reactjs"],
        "Next.js": ["next.js", "nextjs", "next"],
        "Node.js": ["node.js", "nodejs", "node"],
        "Express": ["express", "express.js", "expressjs"],
        "FastAPI": ["fastapi", "fast-api"],
        "Django": ["django"],
        "Flask": ["flask"],
        "Spring Boot": ["spring boot", "springboot", "spring"],
        "Angular": ["angular", "angularjs"],
        "Vue.js": ["vue", "vue.js", "vuejs"],
        "Tailwind CSS": ["tailwind", "tailwindcss"],
        "Bootstrap": ["bootstrap"],
        "ASP.NET": ["asp.net", ".net core", "dotnet core"],
        "Flutter": ["flutter"],
        "React Native": ["react native", "react-native"],
        "PyTorch": ["pytorch"],
        "TensorFlow": ["tensorflow", "tf"],
        "Pandas": ["pandas"],
        "Scikit-learn": ["scikit-learn", "sklearn"],
    },
    "databases": {
        "PostgreSQL": ["postgresql", "postgres", "psql"],
        "MongoDB": ["mongodb", "mongo"],
        "MySQL": ["mysql"],
        "Redis": ["redis"],
        "Kafka": ["kafka", "apache kafka"],
        "SQLite": ["sqlite", "sqlite3"],
        "Supabase": ["supabase"],
        "Firebase": ["firebase", "firestore"],
        "Elasticsearch": ["elasticsearch", "elastic search"],
        "DynamoDB": ["dynamodb"],
        "Cassandra": ["cassandra"],
        "Oracle": ["oracle db", "oracle database"],
        "Vector Databases": ["vector database", "vector databases", "vector db", "pinecone", "weaviate", "chromadb", "qdrant"],
    },
    "tools": {
        "Git": ["git"],
        "GitHub": ["github"],
        "GitLab": ["gitlab"],
        "Docker": ["docker", "containerization"],
        "Kubernetes": ["kubernetes", "k8s"],
        "Linux": ["linux", "unix", "ubuntu"],
        "CI/CD": ["ci/cd", "continuous integration", "github actions", "jenkins"],
        "Spark": ["spark", "apache spark"],
        "Postman": ["postman"],
        "Vite": ["vite"],
        "Webpack": ["webpack"],
        "Nginx": ["nginx"],
        "Terraform": ["terraform"],
        "Prometheus": ["prometheus"],
        "Grafana": ["grafana"],
        "Ansible": ["ansible"],
    },
    "cloud": {
        "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
        "GCP": ["gcp", "google cloud", "google cloud platform"],
        "Google Cloud": ["google cloud", "google cloud platform", "gcp"],
        "BigQuery": ["bigquery", "google bigquery"],
        "Microsoft Azure": ["azure", "microsoft azure"],
        "Vercel": ["vercel"],
        "Netlify": ["netlify"],
        "Cloudflare": ["cloudflare"],
        "Railway": ["railway.app", r"\brailway\s+(?:app|deployment|hosting|cloud|platform)\b", r"(?:deployed|hosted)\s+(?:on|via|to)\s+railway\b", r"\brailway\b\s*[,/|]\s*(?:vercel|render|supabase|heroku|aws|docker)", r"(?:vercel|render|supabase|heroku|aws|docker)\s*[,/|]\s*\brailway\b", r"\b(?:tools|technologies|cloud)\b[^.\n]*?\brailway\b"],
        "Render": ["render.com", r"\brender\s+(?:cloud|deployment|hosting|platform|app)\b", r"(?:deployed|hosted)\s+(?:on|via|to)\s+render\b", r"\brender\b\s*[,/|]\s*(?:vercel|railway|heroku|aws|gcp|netlify|fly\.io|supabase)", r"(?:vercel|railway|heroku|aws|gcp|netlify|fly\.io|supabase)\s*[,/|]\s*\brender\b", r"\b(?:tools|technologies|cloud)\b[^.\n]*?\brender\b"],
    },
    "concepts": {
        "API": [r"\bapi\b", r"\bapis\b", "rest api", "rest apis"],
        "REST APIs": ["rest api", "rest apis", "restful", "restful apis"],
        "GraphQL": ["graphql"],
        "Microservices": ["microservices", "microservice architecture"],
        "Data Structures & Algorithms": ["data structures", "algorithms", "dsa", "leetcode"],
        "System Design": ["system design", "distributed systems", "high availability"],
        "Object-Oriented Programming": ["oop", "object-oriented programming", "object oriented"],
        "Database Indexing & Optimization": ["indexing", "query optimization", "normalization"],
        "Testing & QA": ["unit testing", "integration testing", "jest", "pytest", "cypress"],
        "Agile / Scrum": ["agile", "scrum", "sprints"],
        "Machine Learning": ["machine learning", "deep learning", "neural networks", "model training"],
        "LLM APIs": ["llm", "llms", "llm api", "llm apis", "generative ai", "genai", "prompt engineering", "langchain", "llamaindex", "groq", "groq api", "openai", "anthropic"],
    },
    "soft_skills": {
        "Problem Solving": ["problem solving", "analytical thinking"],
        "Communication": ["communication", "technical communication"],
        "Team Collaboration": ["teamwork", "collaboration", "cross-functional"],
        "Leadership": ["leadership", "mentoring", "ownership"],
    },
}

# Role default keyword expectations for common tech roles
ROLE_DEFAULTS: Dict[str, List[str]] = {
    "frontend": ["React", "JavaScript", "TypeScript", "HTML/CSS", "Tailwind CSS", "Git", "REST APIs"],
    "backend": ["Python", "Node.js", "PostgreSQL", "REST APIs", "Docker", "Git", "Redis", "Data Structures & Algorithms"],
    "fullstack": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Git", "Docker", "Kubernetes", "AWS", "REST APIs", "HTML/CSS"],
    "devops": ["Docker", "Kubernetes", "Linux", "CI/CD", "AWS", "Terraform", "Git", "Bash/Shell", "Prometheus", "Grafana", "Ansible"],
    "data": ["Python", "SQL", "PostgreSQL", "Docker", "Git", "Data Structures & Algorithms"],
}


# ---------------------------------------------------------------------------
# Matching Utilities
# ---------------------------------------------------------------------------

_NEGATION_RE = re.compile(
    r'(?:'
    r'no\s+(?:prior\s+)?experience\s+(?:with|in)|'
    r'not\s+(?:experienced|familiar)\s+(?:with|in)|'
    r'lack\s+of\s+(?:(?:practical|hands-on|commercial|professional)\s+)?experience\s+(?:in|with)|'
    r'lacking\s+(?:(?:practical|hands-on|commercial|professional)\s+)?(?:experience|familiarity)\s+(?:in|with)|'
    r'never\s+used|'
    r'haven\'?t\s+worked\s+with|'
    r'have\s+never\s+worked\s+with|'
    r'zero\s+(?:knowledge|familiarity)\s+(?:of|with)|'
    r'(?:planning|aspiring|hoping|eager|looking)\s+to\s+(?:learn|study|gain\s+exposure\s+to)|'
    r'(?:interested|keen)\s+(?:(?:interest\s+)?in|on)\s+(?:learning|studying)|'
    r'will\s+start\s+learning|'
    r'hope\s+to\s+gain\s+exposure\s+to|'
    r'enrolled\s+in\s+(?:a\s+)?course\s+to\s+study'
    r')\s+',
    re.IGNORECASE
)


def _is_match_negated(start_pos: int, text_lower: str) -> bool:
    """Checks if a keyword occurrence at start_pos is preceded by a negation phrase."""
    prefix = text_lower[max(0, start_pos - 85):start_pos]
    return bool(_NEGATION_RE.search(prefix))


def _keyword_present_in_text(canonical: str, patterns: List[str], text_lower: str) -> Optional[str]:
    """
    Checks if canonical keyword or any of its aliases exists in text.
    Uses regex word boundaries to avoid false positives.
    Disregards occurrences that are explicitly negated (e.g. 'no experience in X').
    Returns 'exact' if canonical matched, 'alias' if alias matched, or None.
    """
    # 1. Check canonical first
    if canonical.lower() == "r":
        # Single-letter "R" should NEVER match as a bare standalone letter because
        # standalone "r" causes false positives on initials (e.g. 'P. R.'), R&D, regulation codes, section markers, etc.
        can_regex = None
    elif canonical.lower() == "c":
        can_regex = re.compile(r'(?<![a-zA-Z0-9_])c(?![a-zA-Z0-9_+#])')
    else:
        can_escaped = re.escape(canonical.lower())
        can_regex = re.compile(rf'(?<![a-zA-Z0-9_]){can_escaped}(?![a-zA-Z0-9_])')

    if can_regex:
        for m in can_regex.finditer(text_lower):
            if canonical.lower() == "git":
                following = text_lower[m.end():m.end()+10]
                if re.match(r'\s+(?:out|up|going|done)\b', following):
                    continue
            if not _is_match_negated(m.start(), text_lower):
                return "exact"

    # 2. Check aliases / patterns
    for pat in patterns:
        if pat.startswith(r"\b") or pat.startswith(r"(?"):
            p_regex = re.compile(pat)
        else:
            p_escaped = re.escape(pat.lower())
            p_regex = re.compile(rf'(?<![a-zA-Z0-9_]){p_escaped}(?![a-zA-Z0-9_])')

        for m in p_regex.finditer(text_lower):
            if canonical.lower() == "git" or pat == "git":
                following = text_lower[m.end():m.end()+10]
                if re.match(r'\s+(?:out|up|going|done)\b', following):
                    continue
            if not _is_match_negated(m.start(), text_lower):
                return "exact" if canonical.lower() == "r" else "alias"

    return None


def extract_keywords_from_jd(jd_text: str) -> List[Tuple[str, str]]:
    """
    Scans a Job Description text and returns deduplicated list of (canonical_name, category) found in JD.
    """
    jd_lower = jd_text.lower()
    target_keywords: List[Tuple[str, str]] = []
    seen = set()

    for cat_name, items in TAXONOMY_DICTIONARY.items():
        for canonical, aliases in items.items():
            if canonical not in seen and _keyword_present_in_text(canonical, aliases, jd_lower):
                target_keywords.append((canonical, cat_name))
                seen.add(canonical)

    return target_keywords


def infer_keywords_for_role(target_role: str) -> List[Tuple[str, str]]:
    """
    Provides default essential keywords for target role when no explicit JD is given.
    """
    role_lower = (target_role or "").lower()
    inferred: List[Tuple[str, str]] = []

    # Map role name to best matching profile
    if not role_lower:
        target_list = ["Python", "JavaScript", "PostgreSQL", "Docker", "Git", "REST APIs", "Data Structures & Algorithms"]
    else:
        profile_key = "fullstack"
        if "front" in role_lower:
            profile_key = "frontend"
        elif "back" in role_lower:
            profile_key = "backend"
        elif "devops" in role_lower or "cloud" in role_lower or "infra" in role_lower:
            profile_key = "devops"
        elif "data" in role_lower or "machine" in role_lower or "ai" in role_lower:
            profile_key = "data"

        target_list = ROLE_DEFAULTS.get(profile_key, ["Python", "JavaScript", "PostgreSQL", "Docker", "Git", "REST APIs"])

    for cat_name, items in TAXONOMY_DICTIONARY.items():
        for canonical in target_list:
            if canonical in items:
                inferred.append((canonical, cat_name))

    return inferred


def extract_summary_and_signals(resume_text: str) -> str:
    """Extracts the professional summary or top section of the resume for domain context."""
    m = re.search(
        r'(?:executive\s+summary|professional\s+summary|summary|profile|about\s+me)\s*[:\-\n](.+?)(?=\n[A-Z\s]{3,20}[:\n]|\Z)',
        resume_text,
        re.IGNORECASE | re.DOTALL,
    )
    if m:
        return m.group(1)[:1200]
    return resume_text[:1200]


def infer_companion_missing_keywords(
    resume_text: str,
    matched: List[KeywordItem],
    target_role: Optional[str] = None,
) -> List[KeywordItem]:
    """
    Dynamically identifies high-value, complementary industry keywords that the candidate
    is missing based on their declared Executive Summary, target role, and detected tech stack.
    Checks the Summary and entire resume to never flag already-present skills as missing.
    """
    matched_names = {m.name.lower() for m in matched}
    summary_text = extract_summary_and_signals(resume_text).lower()
    full_text_lower = resume_text.lower()
    role_text = (target_role or "").lower()

    # Determine candidate's primary technical domain from summary, target role, and matched skills
    is_ai_ml = (
        any(sig in summary_text or sig in role_text for sig in ["ai", "ml", "machine learning", "deep learning", "intelligent", "llm", "nlp", "computer vision"])
        or any(m.name in ["PyTorch", "TensorFlow", "Pandas", "Scikit-learn", "R", "Machine Learning", "LLM APIs"] for m in matched)
    )
    is_data = (
        any(sig in summary_text or sig in role_text for sig in ["data engineer", "data science", "analytics", "etl", "big data", "data pipeline"])
        or any(m.name in ["Spark", "BigQuery", "SQL", "Pandas"] for m in matched)
    )
    is_frontend = (
        any(sig in summary_text or sig in role_text for sig in ["frontend", "front-end", "ui/ux", "web design", "client-side"])
        or any(m.name in ["React", "Vue.js", "Angular", "Tailwind CSS", "Next.js"] for m in matched)
    )
    is_devops = any(sig in summary_text or sig in role_text for sig in ["devops", "cloud", "infra", "sre", "platform", "kubernetes", "ci/cd"])
    is_backend = (
        any(sig in summary_text or sig in role_text for sig in ["backend", "back-end", "api", "microservices", "server-side"])
        or any(m.name in ["Flask", "FastAPI", "Django", "Spring Boot", "Node.js", "PostgreSQL", "Supabase", "Redis"] for m in matched)
    )

    # Core companion competencies prioritized by ecosystem
    candidates_to_check: List[Tuple[str, str]] = []

    if is_ai_ml:
        candidates_to_check.extend([
            ("FastAPI", "frameworks"),
            ("Docker", "tools"),
            ("Redis", "databases"),
            ("Vector Databases", "databases"),
            ("Git", "tools"),
            ("CI/CD", "tools"),
            ("REST APIs", "concepts"),
            ("Data Structures & Algorithms", "concepts"),
            ("PyTorch", "frameworks"),
            ("Testing & QA", "concepts"),
        ])
    elif is_data:
        candidates_to_check.extend([
            ("SQL", "languages"),
            ("Docker", "tools"),
            ("PostgreSQL", "databases"),
            ("Git", "tools"),
            ("CI/CD", "tools"),
            ("Redis", "databases"),
            ("Data Structures & Algorithms", "concepts"),
            ("Spark", "tools"),
            ("FastAPI", "frameworks"),
        ])
    elif is_frontend:
        candidates_to_check.extend([
            ("TypeScript", "languages"),
            ("React", "frameworks"),
            ("Next.js", "frameworks"),
            ("Tailwind CSS", "frameworks"),
            ("Git", "tools"),
            ("REST APIs", "concepts"),
            ("CI/CD", "tools"),
            ("Testing & QA", "concepts"),
        ])
    elif is_devops:
        candidates_to_check.extend([
            ("Docker", "tools"),
            ("Kubernetes", "tools"),
            ("Linux", "tools"),
            ("CI/CD", "tools"),
            ("AWS", "cloud"),
            ("Git", "tools"),
            ("Terraform", "tools"),
            ("Prometheus", "tools"),
        ])
    elif is_backend:
        candidates_to_check.extend([
            ("FastAPI", "frameworks"),
            ("Docker", "tools"),
            ("Redis", "databases"),
            ("Git", "tools"),
            ("PostgreSQL", "databases"),
            ("REST APIs", "concepts"),
            ("CI/CD", "tools"),
            ("Data Structures & Algorithms", "concepts"),
            ("Testing & QA", "concepts"),
        ])
    else:
        # Balanced General Software Engineering
        candidates_to_check.extend([
            ("Git", "tools"),
            ("Docker", "tools"),
            ("PostgreSQL", "databases"),
            ("REST APIs", "concepts"),
            ("CI/CD", "tools"),
            ("Data Structures & Algorithms", "concepts"),
            ("Testing & QA", "concepts"),
        ])

    missing_items: List[KeywordItem] = []
    seen: Set[str] = set()

    for canonical, category in candidates_to_check:
        if canonical.lower() in seen:
            continue
        seen.add(canonical.lower())

        # Verify not already in matched list
        if canonical.lower() in matched_names:
            continue

        # Also double-check if present via regex in resume text (including summary)
        aliases = TAXONOMY_DICTIONARY.get(category, {}).get(canonical, [canonical.lower()])
        if _keyword_present_in_text(canonical, aliases, full_text_lower):
            continue

        missing_items.append(KeywordItem(name=canonical, category=category, match_type="missing"))

    # Cap recommended missing keywords at 5 to keep it crisp and actionable
    return missing_items[:5]


def normalize_skill(skill: str) -> str:
    """Normalizes a raw skill name to its canonical taxonomy name if recognized, else returns stripped title."""
    s_lower = skill.strip().lower()
    for cat, items in TAXONOMY_DICTIONARY.items():
        for canonical, aliases in items.items():
            if s_lower == canonical.lower() or any(s_lower == a.lower().replace(r"\b", "") for a in aliases):
                return canonical
    return skill.strip()


CANONICAL_KEYWORDS = [canonical for cat in TAXONOMY_DICTIONARY.values() for canonical in cat.keys()]


# ---------------------------------------------------------------------------
# General Keyword Optimization & Skills Breadth Evaluator
# ---------------------------------------------------------------------------

def evaluate_general_keywords(
    resume_text: str
) -> Tuple[float, float, bool, List[str], Dict[str, int], List[KeywordItem]]:
    """
    Evaluates general resume technical keyword health independently of any Job Description.
    Calculates:
      - Dimension 2: Keyword Optimization Score (15%)
      - Dimension 3: Technical Skills Relevance Score (15%)
      - Repetition and keyword stuffing detection
      - Verified category coverage
    """
    resume_lower = resume_text.lower()
    cat_counts: Dict[str, int] = {
        "languages": 0, "frameworks": 0, "databases": 0,
        "tools": 0, "cloud": 0, "concepts": 0
    }
    all_matched: List[KeywordItem] = []
    seen = set()

    # 1. Identify all verified technical keywords
    for cat_name, items in TAXONOMY_DICTIONARY.items():
        for canonical, aliases in items.items():
            if canonical in seen:
                continue
            m_type = _keyword_present_in_text(canonical, aliases, resume_lower)
            if m_type:
                all_matched.append(KeywordItem(name=canonical, category=cat_name, match_type=m_type))
                cat_counts[cat_name] = cat_counts.get(cat_name, 0) + 1
                seen.add(canonical)

    # 2. Keyword Stuffing Detection (Repeated > 7 times)
    stuffed_keywords: List[str] = []
    stuffing_detected = False
    for item in all_matched:
        kw = item.name.lower()
        # Word boundary pattern count
        matches = len(re.findall(rf'\b{re.escape(kw)}\b', resume_lower))
        if matches >= 8 and kw not in ["git", "c", "go"]:
            stuffed_keywords.append(f"{item.name} ({matches}x)")
            stuffing_detected = True

    # 3. Compute Dimension 3: Technical Skills Relevance Score (0-100)
    # Balanced evaluation across fundamental software engineering pillars:
    # Languages (25%), Frameworks (20%), Databases (20%), Tools/Cloud (20%), Concepts (15%)
    lang_score = min(100.0, cat_counts["languages"] * 35.0)
    fw_score = min(100.0, cat_counts["frameworks"] * 40.0)
    db_score = min(100.0, cat_counts["databases"] * 45.0)
    tool_score = min(100.0, (cat_counts["tools"] + cat_counts["cloud"]) * 25.0)
    concept_score = min(100.0, cat_counts["concepts"] * 45.0)

    tech_score = round(
        0.25 * lang_score +
        0.20 * fw_score +
        0.20 * db_score +
        0.20 * tool_score +
        0.15 * concept_score,
        1
    )

    # 4. Compute Dimension 2: Keyword Optimization Score (0-100)
    # Evaluates terminology depth, variety, alias normalization, and penalizes stuffing
    total_skills = len(all_matched)
    if total_skills == 0:
        opt_score = 20.0
    elif total_skills < 4:
        opt_score = 45.0
    elif total_skills < 8:
        opt_score = 70.0
    elif total_skills < 15:
        opt_score = 88.0
    else:
        opt_score = 96.0

    # Penalize keyword stuffing
    if stuffing_detected:
        opt_score = max(20.0, opt_score - (15.0 * min(3, len(stuffed_keywords))))

    return (
        round(max(0.0, min(100.0, opt_score)), 1),
        round(max(0.0, min(100.0, tech_score)), 1),
        stuffing_detected,
        stuffed_keywords,
        cat_counts,
        all_matched,
    )


# ---------------------------------------------------------------------------
# Master Keyword Matching API
# ---------------------------------------------------------------------------

def match_keywords(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = None,
) -> KeywordAnalysisReport:
    """
    Compares resume text against job description when provided, or calculates
    pure general keyword optimization & technical skill relevance (BUG 2 fix).
    Never fabricates a job-specific match percentage when no JD is supplied.
    """
    resume_lower = resume_text.lower()
    (
        kw_opt_score,
        tech_skills_score,
        stuffing_detected,
        stuffed_kws,
        cat_counts,
        general_matched,
    ) = evaluate_general_keywords(resume_text)

    if job_description and len(job_description.strip()) >= 20:
        # ── Mode A: Job-Specific Evaluation ──────────────────────────────────
        target_skills = extract_keywords_from_jd(job_description)
        if not target_skills:
            # Fallback to role inference only if JD did not contain recognized keywords
            target_skills = infer_keywords_for_role(target_role or "")

        matched: List[KeywordItem] = []
        missing: List[KeywordItem] = []

        for canonical, category in target_skills:
            aliases = TAXONOMY_DICTIONARY.get(category, {}).get(canonical, [canonical.lower()])
            match_type = _keyword_present_in_text(canonical, aliases, resume_lower)

            if match_type:
                matched.append(KeywordItem(name=canonical, category=category, match_type=match_type))
            else:
                missing.append(KeywordItem(name=canonical, category=category, match_type="missing"))

        total = len(target_skills)
        matched_count = len(matched)
        missing_count = len(missing)
        pct = round((matched_count / max(total, 1)) * 100.0, 1)

        recommendations: List[str] = []
        if missing:
            missing_by_cat: Dict[str, List[str]] = {}
            for m in missing:
                missing_by_cat.setdefault(m.category, []).append(m.name)

            if "languages" in missing_by_cat:
                recommendations.append(f"Target JD seeks experience with {', '.join(missing_by_cat['languages'][:3])}.")
            if "databases" in missing_by_cat:
                recommendations.append(f"Consider highlighting database competencies in {', '.join(missing_by_cat['databases'][:2])}.")
            if "tools" in missing_by_cat or "cloud" in missing_by_cat:
                tools = ", ".join((missing_by_cat.get("tools", []) + missing_by_cat.get("cloud", []))[:3])
                recommendations.append(f"Add deployment/cloud tooling keywords ({tools}) matching the JD.")

        if not recommendations:
            recommendations.append("Strong keyword alignment with target requirements.")

        exact_count = sum(1 for m in matched if m.match_type == "exact")
        alias_count = sum(1 for m in matched if m.match_type == "alias")

        return KeywordAnalysisReport(
            total_keywords=total,
            matched_keywords_count=matched_count,
            missing_keywords_count=missing_count,
            exact_matches_count=exact_count,
            alias_matches_count=alias_count,
            keyword_match_percentage=pct,
            matched=matched,
            missing=missing,
            recommendations=recommendations,
            evaluation_mode="job_specific",
            job_match_status="evaluated",
            job_match_score=pct,
            keyword_optimization_score=kw_opt_score,
            technical_skills_relevance_score=tech_skills_score,
            keyword_stuffing_detected=stuffing_detected,
            stuffed_keywords=stuffed_kws,
            category_coverage=cat_counts,
        )

    else:
        # ── Mode B: General Resume Evaluation (Ecosystem & Summary-Guided) ────
        exact_count = sum(1 for m in general_matched if m.match_type == "exact")
        alias_count = sum(1 for m in general_matched if m.match_type == "alias")

        # Dynamically infer ecosystem-specific missing keywords from resume summary and detected stack
        missing = infer_companion_missing_keywords(
            resume_text=resume_text,
            matched=general_matched,
            target_role=target_role,
        )

        total_evaluated = len(general_matched) + len(missing)
        domain_match_pct = round((len(general_matched) / max(total_evaluated, 1)) * 100.0, 1)

        recommendations: List[str] = []
        if missing:
            missing_names = [m.name for m in missing[:3]]
            recommendations.append(f"High-impact companion skills to consider adding: {', '.join(missing_names)}.")
        if cat_counts.get("cloud", 0) == 0 and cat_counts.get("tools", 0) < 2:
            recommendations.append("Add modern CI/CD, cloud, or containerization tooling (Docker, AWS, Git) to strengthen infrastructure skills.")
        if cat_counts.get("databases", 0) == 0:
            recommendations.append("Include explicit database management skills (PostgreSQL, MongoDB, Redis).")
        if stuffing_detected:
            recommendations.append(f"Avoid repetitive keyword stuffing ({', '.join(stuffed_kws)}). Use natural accomplishment bullets instead.")

        if not recommendations:
            recommendations.append("Well-balanced technical skills distribution across languages, frameworks, and tools.")

        return KeywordAnalysisReport(
            total_keywords=total_evaluated,
            matched_keywords_count=len(general_matched),
            missing_keywords_count=len(missing),
            exact_matches_count=exact_count,
            alias_matches_count=alias_count,
            keyword_match_percentage=domain_match_pct,
            matched=general_matched,
            missing=missing,
            recommendations=recommendations,
            evaluation_mode="general_resume",
            job_match_status="not_evaluated",
            job_match_score=None,  # NEVER fake a job match without a JD!
            keyword_optimization_score=kw_opt_score,
            technical_skills_relevance_score=domain_match_pct,
            keyword_stuffing_detected=stuffing_detected,
            stuffed_keywords=stuffed_kws,
            category_coverage=cat_counts,
        )
