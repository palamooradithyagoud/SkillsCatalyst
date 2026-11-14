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
    keyword_match_percentage: float = 0.0
    matched: List[KeywordItem] = Field(default_factory=list)
    missing: List[KeywordItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


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
        "R": [r"\br\b", "r-lang"],
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
    can_escaped = re.escape(canonical.lower())
    if canonical.lower() == "c":
        can_regex = re.compile(r'(?<![a-zA-Z0-9_])c(?![a-zA-Z0-9_+#])')
    else:
        can_regex = re.compile(rf'(?<![a-zA-Z0-9_]){can_escaped}(?![a-zA-Z0-9_])')
    for m in can_regex.finditer(text_lower):
        if canonical.lower() == "git":
            following = text_lower[m.end():m.end()+10]
            if re.match(r'\s+(?:out|up|going|done)\b', following):
                continue
        if not _is_match_negated(m.start(), text_lower):
            return "exact"

    # 2. Check aliases
    for pat in patterns:
        if pat.startswith(r"\b"):
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
                return "alias"

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
    profile_key = "fullstack"
    if "front" in role_lower:
        profile_key = "frontend"
    elif "back" in role_lower:
        profile_key = "backend"
    elif "devops" in role_lower or "cloud" in role_lower or "infra" in role_lower:
        profile_key = "devops"
    elif "data" in role_lower or "machine" in role_lower or "ai" in role_lower:
        profile_key = "data"

    target_list = ROLE_DEFAULTS.get(profile_key, ROLE_DEFAULTS["fullstack"])

    for cat_name, items in TAXONOMY_DICTIONARY.items():
        for canonical in target_list:
            if canonical in items:
                inferred.append((canonical, cat_name))

    return inferred


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
# Master Keyword Matching API
# ---------------------------------------------------------------------------

def match_keywords(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = "Fullstack Software Engineer",
) -> KeywordAnalysisReport:
    """
    Compares resume text against job description or inferred role competencies.
    Returns complete, deterministic KeywordAnalysisReport.
    """
    resume_lower = resume_text.lower()

    # 1. Identify target keyword list
    target_skills = []
    if job_description and len(job_description.strip()) >= 3:
        target_skills = extract_keywords_from_jd(job_description)

    # If no target skills extracted from JD, infer from role
    if not target_skills:
        target_skills = infer_keywords_for_role(target_role or "Fullstack Software Engineer")

    # 2. Check each target skill in resume
    matched: List[KeywordItem] = []
    missing: List[KeywordItem] = []

    for canonical, category in target_skills:
        aliases = TAXONOMY_DICTIONARY.get(category, {}).get(canonical, [canonical.lower()])
        match_type = _keyword_present_in_text(canonical, aliases, resume_lower)

        if match_type:
            matched.append(KeywordItem(
                name=canonical,
                category=category,
                match_type=match_type
            ))
        else:
            missing.append(KeywordItem(
                name=canonical,
                category=category,
                match_type="missing"
            ))

    total = len(target_skills)
    matched_count = len(matched)
    missing_count = len(missing)

    pct = round((matched_count / max(total, 1)) * 100.0, 1)

    # 3. Formulate Actionable, Grounded Recommendations
    recommendations: List[str] = []
    if missing:
        # Group missing by category
        missing_by_cat: Dict[str, List[str]] = {}
        for m in missing:
            missing_by_cat.setdefault(m.category, []).append(m.name)

        if "languages" in missing_by_cat:
            langs = ", ".join(missing_by_cat["languages"][:3])
            recommendations.append(f"Consider emphasizing experience with {langs} in your projects if you have used them.")
        if "databases" in missing_by_cat:
            dbs = ", ".join(missing_by_cat["databases"][:2])
            recommendations.append(f"Highlight database design experience using {dbs}.")
        if "tools" in missing_by_cat or "cloud" in missing_by_cat:
            tools = ", ".join((missing_by_cat.get("tools", []) + missing_by_cat.get("cloud", []))[:3])
            recommendations.append(f"Add deployment or CI/CD tooling keywords ({tools}) to your project bullet points.")

    if not recommendations:
        recommendations.append("Strong keyword alignment with target requirements. Ensure all metrics in bullets are quantified.")

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
    )
