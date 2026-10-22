"""
backend/services/ai_mentor/personalization_service.py
Core Personalization, Learning Profile, Roadmap Generation, Skill Gap Analysis,
and Weekly Progress Review Engine for SkillsCatalyst Phase 2C.
Enforces:
- Strict tenant isolation (authenticated user_id).
- Facts vs Inferences separation.
- Seamless conversion of roadmap milestones into Phase 2A task proposals with cryptographic HMAC tokens.
- Cross-session memory and cache invalidation.
- Deterministic taxonomies and sensible defaults.
"""

import datetime
import logging
import uuid
from typing import Optional, List, Dict, Any, Tuple

from backend.models.ai_mentor_personalization import (
    ExperienceLevel,
    RoadmapStatus,
    MilestoneStatus,
    SkillStatus,
    StudentLearningProfile,
    UpdateLearningProfileRequest,
    RoadmapMilestone,
    RoadmapStage,
    StudentLearningRoadmap,
    GenerateRoadmapRequest,
    SkillGapItem,
    SkillGapAnalysisResult,
    WeeklyProgressReviewResult,
)
from backend.models.ai_mentor_tasks import (
    TaskActionType,
    ProposedTaskItem,
    TaskActionProposal,
)
from backend.models.task import (
    TaskCategory,
    TaskPriority,
    TaskStatus,
)
from backend.services.ai_mentor.approval_service import generate_approval_token
from backend.services.cache_service import delete_key
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)

# Cache prefix from context_aggregator
CONTEXT_CACHE_KEY_PREFIX = "mentor:context:"


# ---------------------------------------------------------------------------
# Standard Role Skill Taxonomies for Deterministic Skill Gap Analysis
# ---------------------------------------------------------------------------

ROLE_SKILL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "full-stack developer": {
        "critical": ["JavaScript", "React", "Node.js", "SQL", "Git", "HTML/CSS", "REST APIs"],
        "recommended": ["TypeScript", "Next.js", "Docker", "Tailwind CSS", "PostgreSQL", "System Design"],
        "optional": ["GraphQL", "Redis", "AWS", "CI/CD", "Kubernetes"],
    },
    "frontend developer": {
        "critical": ["HTML/CSS", "JavaScript", "React", "Git", "Responsive Design", "REST APIs"],
        "recommended": ["TypeScript", "Next.js", "Tailwind CSS", "State Management (Redux/Zustand)", "Web Performance"],
        "optional": ["Vue.js", "Testing (Jest/Playwright)", "GraphQL", "Accessibility (WCAG)"],
    },
    "backend developer": {
        "critical": ["Python", "Java", "SQL", "REST APIs", "Git", "Data Structures", "Relational Databases"],
        "recommended": ["FastAPI", "Spring Boot", "Node.js", "PostgreSQL", "Docker", "System Design"],
        "optional": ["Redis", "Kafka", "Microservices", "Kubernetes", "AWS/GCP"],
    },
    "ai engineer": {
        "critical": ["Python", "Linear Algebra", "Data Structures", "Git", "PyTorch", "Machine Learning Basics"],
        "recommended": ["Hugging Face", "LLMs & Prompt Engineering", "Vector Databases", "FastAPI", "NumPy & Pandas", "Fine-Tuning"],
        "optional": ["LangChain", "Deep Learning", "MLOps", "CUDA", "Docker"],
    },
    "data scientist": {
        "critical": ["Python", "SQL", "Pandas", "NumPy", "Statistics", "Machine Learning", "Data Visualization"],
        "recommended": ["Scikit-Learn", "Matplotlib / Seaborn", "Jupyter", "Feature Engineering", "Hypothesis Testing"],
        "optional": ["PyTorch", "BigQuery", "Tableau / PowerBI", "Spark", "Deep Learning"],
    },
    "mobile developer": {
        "critical": ["React Native", "Flutter", "JavaScript/Dart", "Mobile UI", "REST APIs", "Git"],
        "recommended": ["TypeScript", "State Management", "Push Notifications", "App Store Deployment"],
        "optional": ["Swift", "Kotlin", "Offline Storage (SQLite)", "CI/CD for Mobile"],
    },
    "devops engineer": {
        "critical": ["Linux", "Git", "Docker", "CI/CD Pipelines", "Networking Basics", "Bash/Python"],
        "recommended": ["Kubernetes", "AWS/Cloud", "Terraform", "Monitoring (Prometheus/Grafana)", "Ansible"],
        "optional": ["ArgoCD", "Helm", "Security Hardening", "Service Mesh"],
    },
}


def _normalize_role_key(role_query: str) -> str:
    """Matches a user's role query to standard taxonomy keys."""
    q = (role_query or "").strip().lower()
    if not q:
        return "full-stack developer"
    for k in ROLE_SKILL_TAXONOMY:
        if k in q or q in k:
            return k
    if "fullstack" in q or "full stack" in q:
        return "full-stack developer"
    if "front" in q or "react" in q or "ui" in q:
        return "frontend developer"
    if "back" in q or "api" in q or "django" in q or "fastapi" in q or "spring" in q:
        return "backend developer"
    if "ai" in q or "machine learning" in q or "ml" in q or "deep learning" in q:
        return "ai engineer"
    if "data" in q or "analytics" in q:
        return "data scientist"
    if "mobile" in q or "android" in q or "ios" in q or "flutter" in q:
        return "mobile developer"
    if "devops" in q or "cloud" in q or "sre" in q:
        return "devops engineer"
    return "full-stack developer"


# ---------------------------------------------------------------------------
# Feature A & G: Student Learning Profile Management
# ---------------------------------------------------------------------------

def get_student_learning_profile(user_id: str) -> StudentLearningProfile:
    """
    Retrieves the authenticated student's persistent learning profile.
    Falls back gracefully to platform-wide career preferences and academic data
    if the learning profile row does not exist yet.
    """
    sb = get_supabase()
    if not sb:
        return StudentLearningProfile(user_id=user_id)

    # 1. Attempt primary retrieval from student_learning_profiles
    try:
        res = sb.from_("student_learning_profiles").select("*").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            row = res.data[0]
            return StudentLearningProfile(
                user_id=user_id,
                career_goal=row.get("career_goal") or "",
                experience_level=ExperienceLevel(row.get("experience_level") or "Beginner"),
                existing_skills=row.get("existing_skills") or [],
                target_skills=row.get("target_skills") or [],
                learning_preferences=row.get("learning_preferences") or [],
                preferred_daily_minutes=int(row.get("preferred_daily_minutes") or 60),
                short_term_objective=row.get("short_term_objective") or "",
                long_term_objective=row.get("long_term_objective") or "",
                target_date=row.get("target_date"),
                created_at=row.get("created_at"),
                updated_at=row.get("updated_at"),
            )
    except Exception as e:
        logger.debug(f"Learning profile fetch fallback: {e}")

    # 2. Fallback to career_preferences and user_skills
    career_goal = ""
    existing_skills = []
    try:
        cp_res = sb.from_("career_preferences").select("target_roles").eq("user_id", user_id).execute()
        if cp_res.data and len(cp_res.data) > 0:
            roles = cp_res.data[0].get("target_roles") or []
            if roles:
                career_goal = str(roles[0]).strip()

        if not career_goal:
            acad_res = sb.from_("user_academic_profile").select("target_role").eq("user_id", user_id).execute()
            if acad_res.data and len(acad_res.data) > 0:
                career_goal = str(acad_res.data[0].get("target_role") or "").strip()

        skills_res = sb.from_("user_skills").select("skill_name").eq("user_id", user_id).limit(30).execute()
        if skills_res.data:
            existing_skills = [str(s.get("skill_name")).strip() for s in skills_res.data if s.get("skill_name")]
    except Exception as fallback_err:
        logger.debug(f"Profile fallback retrieval notice: {fallback_err}")

    return StudentLearningProfile(
        user_id=user_id,
        career_goal=career_goal,
        experience_level=ExperienceLevel.Beginner,
        existing_skills=existing_skills,
        target_skills=[],
        learning_preferences=["project-based", "hands-on practice"],
        preferred_daily_minutes=60,
    )


def save_student_learning_profile(
    user_id: str,
    req: UpdateLearningProfileRequest,
) -> StudentLearningProfile:
    """
    Persists updates to the student's learning profile.
    Syncs career goal to career_preferences for seamless platform-wide awareness.
    Invalidates mentor context cache.
    """
    sb = get_supabase()
    current = get_student_learning_profile(user_id)

    # Merge incoming updates
    updated_goal = req.career_goal if req.career_goal is not None else current.career_goal
    updated_level = req.experience_level if req.experience_level is not None else current.experience_level
    updated_existing = req.existing_skills if req.existing_skills is not None else current.existing_skills
    updated_target = req.target_skills if req.target_skills is not None else current.target_skills
    updated_prefs = req.learning_preferences if req.learning_preferences is not None else current.learning_preferences
    updated_mins = req.preferred_daily_minutes if req.preferred_daily_minutes is not None else current.preferred_daily_minutes
    updated_short = req.short_term_objective if req.short_term_objective is not None else current.short_term_objective
    updated_long = req.long_term_objective if req.long_term_objective is not None else current.long_term_objective
    updated_date = req.target_date if req.target_date is not None else current.target_date

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    payload = {
        "user_id": user_id,
        "career_goal": (updated_goal or "").strip()[:255],
        "experience_level": updated_level.value if hasattr(updated_level, "value") else str(updated_level),
        "existing_skills": [s.strip()[:100] for s in updated_existing if s.strip()][:50],
        "target_skills": [s.strip()[:100] for s in updated_target if s.strip()][:50],
        "learning_preferences": [p.strip()[:100] for p in updated_prefs if p.strip()][:20],
        "preferred_daily_minutes": max(0, min(int(updated_mins), 1440)),
        "short_term_objective": (updated_short or "").strip()[:500],
        "long_term_objective": (updated_long or "").strip()[:1000],
        "target_date": updated_date or None,
        "updated_at": now_iso,
    }

    if sb:
        try:
            sb.from_("student_learning_profiles").upsert(payload, on_conflict="user_id").execute()
            # Sync career goal to career_preferences and user_academic_profile if provided
            if payload["career_goal"]:
                try:
                    sb.from_("career_preferences").upsert(
                        {"user_id": user_id, "target_roles": [payload["career_goal"]]},
                        on_conflict="user_id",
                    ).execute()
                    sb.from_("user_academic_profile").upsert(
                        {"user_id": user_id, "target_role": payload["career_goal"]},
                        on_conflict="user_id",
                    ).execute()
                except Exception as sync_err:
                    logger.debug(f"Sync career goal notice: {sync_err}")
        except Exception as e:
            logger.warning(f"Failed to upsert student_learning_profiles: {e}")

    # Invalidate mentor context cache
    try:
        delete_key(f"{CONTEXT_CACHE_KEY_PREFIX}{user_id}")
    except Exception:
        pass

    return StudentLearningProfile(
        user_id=user_id,
        career_goal=payload["career_goal"],
        experience_level=ExperienceLevel(payload["experience_level"]),
        existing_skills=payload["existing_skills"],
        target_skills=payload["target_skills"],
        learning_preferences=payload["learning_preferences"],
        preferred_daily_minutes=payload["preferred_daily_minutes"],
        short_term_objective=payload["short_term_objective"],
        long_term_objective=payload["long_term_objective"],
        target_date=payload["target_date"],
        updated_at=now_iso,
    )


def reset_student_learning_profile(user_id: str) -> bool:
    """
    Resets the student's learning profile to blank defaults.
    """
    sb = get_supabase()
    if not sb:
        return True

    try:
        sb.from_("student_learning_profiles").delete().eq("user_id", user_id).execute()
    except Exception as e:
        logger.warning(f"Error resetting student learning profile: {e}")
        return False

    try:
        delete_key(f"{CONTEXT_CACHE_KEY_PREFIX}{user_id}")
    except Exception:
        pass

    return True


# ---------------------------------------------------------------------------
# Feature B & F: Progress-Aware Learning State
# ---------------------------------------------------------------------------

def get_student_learning_progress_state(
    user_id: str,
    user_tasks: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Aggregates authentic task and milestone progress data.
    Separates measured FACTS from INFERENCES.
    """
    sb = get_supabase()
    tasks = user_tasks or []
    if not tasks and sb:
        try:
            res = sb.from_("tasks").select("id, title, status, priority, category, due_at, completed_at, created_at").eq("user_id", user_id).limit(60).execute()
            tasks = res.data or []
        except Exception as e:
            logger.debug(f"Error fetching tasks for learning state: {e}")

    now_utc = datetime.datetime.now(datetime.timezone.utc)

    completed_tasks = [t for t in tasks if (t.get("status") == "completed")]
    pending_tasks = [t for t in tasks if (t.get("status") in ("todo", "in_progress"))]

    overdue_tasks = []
    for t in pending_tasks:
        due_str = t.get("due_at")
        if due_str:
            try:
                due_dt = datetime.datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                if due_dt < now_utc:
                    overdue_tasks.append(t)
            except Exception:
                pass

    # Stalled tasks: pending tasks created > 7 days ago with no updates
    stalled_tasks = []
    for t in pending_tasks:
        created_str = t.get("created_at")
        if created_str:
            try:
                c_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                if (now_utc - c_dt).total_seconds() > 7 * 86400:
                    stalled_tasks.append(t)
            except Exception:
                pass

    # Extract skills mentioned in completed task titles
    skills_evidenced = set()
    for t in completed_tasks:
        title_lower = (t.get("title") or "").lower()
        for kw in ["python", "java", "react", "javascript", "sql", "docker", "dsa", "git", "fastapi", "node"]:
            if kw in title_lower:
                skills_evidenced.add(kw.capitalize() if kw != "sql" and kw != "dsa" else kw.upper())

    # FACTS vs INFERENCES
    facts = {
        "completed_tasks_count": len(completed_tasks),
        "pending_tasks_count": len(pending_tasks),
        "overdue_tasks_count": len(overdue_tasks),
        "stalled_tasks_count": len(stalled_tasks),
        "evidenced_skills": list(skills_evidenced),
        "recent_completed_titles": [t.get("title") for t in completed_tasks[:5]],
    }

    inferences = []
    if len(completed_tasks) >= 3 and skills_evidenced:
        inferences.append(f"Student has demonstrated steady practice in {', '.join(skills_evidenced)}; ready for small project milestones.")
    elif len(completed_tasks) == 0:
        inferences.append("No learning tasks completed yet; start with small, low-friction foundational tasks.")

    if len(overdue_tasks) >= 2:
        inferences.append("Multiple overdue tasks indicate current study capacity or schedule pacing may need adjustment.")

    if len(stalled_tasks) >= 1:
        inferences.append(f"{len(stalled_tasks)} task(s) have been pending for over a week; consider breaking them into subtasks.")

    return {
        "facts": facts,
        "inferences": inferences,
        "completed_tasks_count": len(completed_tasks),
        "pending_tasks_count": len(pending_tasks),
        "overdue_tasks_count": len(overdue_tasks),
        "stalled_tasks_count": len(stalled_tasks),
        "evidenced_skills": list(skills_evidenced),
    }


# ---------------------------------------------------------------------------
# Feature D: Deterministic Skill Gap Analysis Engine
# ---------------------------------------------------------------------------

def analyze_skill_gaps(
    user_id: str,
    target_role_override: Optional[str] = None,
) -> SkillGapAnalysisResult:
    """
    Compares the student's reported and evidenced skills against target role taxonomy.
    Distinguishes:
    - verified skills (evidenced in completed tasks)
    - self_reported skills (in profile)
    - target_desired skills (skills student requested)
    - confirmed_gap (critical role skills missing from profile)
    - unevaluated skills (optional supporting skills)
    """
    profile = get_student_learning_profile(user_id)
    progress_state = get_student_learning_progress_state(user_id)

    target_role = (target_role_override or profile.career_goal or "Full-Stack Developer").strip()
    role_key = _normalize_role_key(target_role)
    taxonomy = ROLE_SKILL_TAXONOMY.get(role_key, ROLE_SKILL_TAXONOMY["full-stack developer"])

    existing_set = {s.lower().strip() for s in profile.existing_skills}
    target_set = {s.lower().strip() for s in profile.target_skills}
    facts_obj = progress_state.get("facts") if isinstance(progress_state, dict) else {}
    evidenced = (
        facts_obj.get("evidenced_skills", [])
        if isinstance(facts_obj, dict)
        else progress_state.get("evidenced_skills", [])
    )
    evidenced_set = {s.lower().strip() for s in evidenced}

    confirmed_skills: List[str] = []
    missing_critical: List[str] = []
    skills_in_progress: List[str] = []
    gap_items: List[SkillGapItem] = []

    # 1. Evaluate Critical Skills
    for skill in taxonomy["critical"]:
        s_lower = skill.lower()
        if s_lower in evidenced_set:
            confirmed_skills.append(skill)
            gap_items.append(
                SkillGapItem(
                    skill_name=skill,
                    status=SkillStatus.verified,
                    importance="critical",
                    reason=f"Evidenced by completed learning tasks.",
                    recommended_action="Continue reinforcing through hands-on project implementations.",
                )
            )
        elif s_lower in existing_set:
            confirmed_skills.append(skill)
            gap_items.append(
                SkillGapItem(
                    skill_name=skill,
                    status=SkillStatus.self_reported,
                    importance="critical",
                    reason="Reported by student in profile.",
                    recommended_action="Complete practical tasks to verify depth and application.",
                )
            )
        elif s_lower in target_set:
            skills_in_progress.append(skill)
            gap_items.append(
                SkillGapItem(
                    skill_name=skill,
                    status=SkillStatus.target_desired,
                    importance="critical",
                    reason="Identified as desired learning objective.",
                    recommended_action="Schedule initial study milestones and foundational exercises.",
                )
            )
        else:
            missing_critical.append(skill)
            gap_items.append(
                SkillGapItem(
                    skill_name=skill,
                    status=SkillStatus.confirmed_gap,
                    importance="critical",
                    reason=f"Core foundational requirement for {target_role}.",
                    recommended_action=f"Prioritize {skill} fundamentals before moving to advanced topics.",
                )
            )

    # 2. Evaluate Recommended Skills
    for skill in taxonomy["recommended"]:
        s_lower = skill.lower()
        if s_lower in evidenced_set or s_lower in existing_set:
            confirmed_skills.append(skill)
        elif s_lower in target_set:
            skills_in_progress.append(skill)
        else:
            gap_items.append(
                SkillGapItem(
                    skill_name=skill,
                    status=SkillStatus.unevaluated,
                    importance="recommended",
                    reason=f"Valuable industry differentiator for {target_role}.",
                    recommended_action=f"Learn after core {taxonomy['critical'][0]} foundations.",
                )
            )

    # Construct actionable next steps
    next_steps = []
    if missing_critical:
        next_steps.append(f"Focus on core {target_role} prerequisites: {', '.join(missing_critical[:2])}.")
    if skills_in_progress:
        next_steps.append(f"Advance current target skills: {', '.join(skills_in_progress[:2])}.")
    if not missing_critical and confirmed_skills:
        next_steps.append(f"Core skills established; develop a comprehensive capstone project showcasing {confirmed_skills[0]} and {confirmed_skills[-1]}.")

    return SkillGapAnalysisResult(
        target_role=target_role,
        current_level=profile.experience_level.value,
        confirmed_skills=confirmed_skills,
        missing_critical_skills=missing_critical,
        skills_in_progress=skills_in_progress,
        gaps=gap_items,
        recommended_next_steps=next_steps,
    )


# ---------------------------------------------------------------------------
# Feature C & H: Learning Roadmaps & To-Do List Integration
# ---------------------------------------------------------------------------

def generate_student_roadmap(
    user_id: str,
    req: GenerateRoadmapRequest,
) -> StudentLearningRoadmap:
    """
    Generates a personalized, stage-based learning roadmap grounded in the
    student's target career goal and starting skill level.
    """
    roadmap_id = str(uuid.uuid4())
    goal = req.career_goal.strip()
    level = req.starting_level or ExperienceLevel.Beginner
    role_key = _normalize_role_key(goal)
    taxonomy = ROLE_SKILL_TAXONOMY.get(role_key, ROLE_SKILL_TAXONOMY["full-stack developer"])

    crit_skills = taxonomy["critical"]
    rec_skills = taxonomy["recommended"]

    stages: List[RoadmapStage] = []
    all_milestones: List[RoadmapMilestone] = []

    # Stage 1: Foundations
    s1_milestones = [
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_1",
            title=f"{crit_skills[0]} Syntax & Core Concepts",
            description=f"Understand fundamentals, control flow, functions, and data structures.",
            stage_index=1,
            suggested_duration_minutes=90,
            skills_covered=[crit_skills[0]],
            status=MilestoneStatus.not_started,
            prerequisites=[],
        ),
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_2",
            title=f"{crit_skills[1]} Basics & Hands-On Practice",
            description=f"Build small interactive scripts and exercises applying {crit_skills[1]}.",
            stage_index=1,
            suggested_duration_minutes=120,
            skills_covered=[crit_skills[1]],
            status=MilestoneStatus.not_started,
            prerequisites=[f"{crit_skills[0]} Syntax & Core Concepts"],
        ),
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_3",
            title=f"Version Control with Git & GitHub",
            description="Initialize repositories, create branches, commit progress, and push to GitHub.",
            stage_index=1,
            suggested_duration_minutes=60,
            skills_covered=["Git"],
            status=MilestoneStatus.not_started,
            prerequisites=[],
        ),
    ]
    stages.append(
        RoadmapStage(
            stage_index=1,
            title="Stage 1: Core Foundations & Tooling",
            description="Establish robust foundational understanding of programming and version control.",
            milestones=s1_milestones,
        )
    )
    all_milestones.extend(s1_milestones)

    # Stage 2: Applied Development
    s2_milestones = [
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_4",
            title=f"Building with {crit_skills[2] if len(crit_skills) > 2 else 'Modern Frameworks'}",
            description="Structure real-world applications with modular components and clean state.",
            stage_index=2,
            suggested_duration_minutes=150,
            skills_covered=[crit_skills[2] if len(crit_skills) > 2 else crit_skills[0]],
            status=MilestoneStatus.not_started,
            prerequisites=[s1_milestones[0].title],
        ),
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_5",
            title=f"Database Design & Integration ({crit_skills[3] if len(crit_skills) > 3 else 'SQL'})",
            description="Model relational schemas, write queries, and persist application data.",
            stage_index=2,
            suggested_duration_minutes=120,
            skills_covered=[crit_skills[3] if len(crit_skills) > 3 else "SQL"],
            status=MilestoneStatus.not_started,
            prerequisites=[],
        ),
    ]
    stages.append(
        RoadmapStage(
            stage_index=2,
            title="Stage 2: Applied Development & Data Persistence",
            description="Build scalable components connected to persistent relational databases.",
            milestones=s2_milestones,
        )
    )
    all_milestones.extend(s2_milestones)

    # Stage 3: Portfolio & Production Readiness
    s3_milestones = [
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_6",
            title=f"End-to-End {goal} Capstone Project",
            description="Implement a complete production project from architecture to deployment.",
            stage_index=3,
            suggested_duration_minutes=240,
            skills_covered=rec_skills[:3],
            status=MilestoneStatus.not_started,
            prerequisites=[s2_milestones[0].title, s2_milestones[1].title],
        ),
        RoadmapMilestone(
            id=f"m_{roadmap_id[:8]}_7",
            title="Containerization & Deployment with Docker",
            description="Write Dockerfiles, run containers locally, and deploy to cloud hosting.",
            stage_index=3,
            suggested_duration_minutes=90,
            skills_covered=["Docker"],
            status=MilestoneStatus.not_started,
            prerequisites=[],
        ),
    ]
    stages.append(
        RoadmapStage(
            stage_index=3,
            title="Stage 3: Capstone Architecture & Deployment",
            description="Demonstrate job readiness with a verified capstone project deployed online.",
            milestones=s3_milestones,
        )
    )
    all_milestones.extend(s3_milestones)

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    roadmap = StudentLearningRoadmap(
        id=roadmap_id,
        user_id=user_id,
        title=f"{goal} Learning Roadmap",
        career_goal=goal,
        starting_level=level,
        stages=stages,
        milestones=all_milestones,
        status=RoadmapStatus.active,
        created_at=now_iso,
        updated_at=now_iso,
    )

    return roadmap


def save_student_roadmap(
    user_id: str,
    roadmap: StudentLearningRoadmap,
) -> StudentLearningRoadmap:
    """
    Saves a generated learning roadmap to PostgreSQL.
    Enforces user_id ownership.
    """
    sb = get_supabase()
    if not sb:
        return roadmap

    payload = {
        "id": roadmap.id,
        "user_id": user_id,
        "title": roadmap.title,
        "career_goal": roadmap.career_goal,
        "starting_level": roadmap.starting_level.value,
        "stages": [s.model_dump() for s in roadmap.stages],
        "milestones": [m.model_dump() for m in roadmap.milestones],
        "status": roadmap.status.value,
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    try:
        sb.from_("student_learning_roadmaps").upsert(payload, on_conflict="id").execute()
    except Exception as e:
        logger.warning(f"Failed to persist student roadmap: {e}")

    return roadmap


def get_student_roadmaps(user_id: str) -> List[StudentLearningRoadmap]:
    """Retrieves all learning roadmaps for the authenticated student."""
    sb = get_supabase()
    if not sb:
        return []

    try:
        res = (
            sb.from_("student_learning_roadmaps")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        roadmaps: List[StudentLearningRoadmap] = []
        for r in res.data or []:
            roadmaps.append(
                StudentLearningRoadmap(
                    id=str(r.get("id")),
                    user_id=str(r.get("user_id")),
                    title=r.get("title") or "Roadmap",
                    career_goal=r.get("career_goal") or "",
                    starting_level=ExperienceLevel(r.get("starting_level") or "Beginner"),
                    stages=[RoadmapStage(**s) for s in r.get("stages") or []],
                    milestones=[RoadmapMilestone(**m) for m in r.get("milestones") or []],
                    status=RoadmapStatus(r.get("status") or "active"),
                    created_at=r.get("created_at"),
                    updated_at=r.get("updated_at"),
                )
            )
        return roadmaps
    except Exception as e:
        logger.warning(f"Error fetching student roadmaps: {e}")
        return []


def get_student_roadmap_by_id(user_id: str, roadmap_id: str) -> Optional[StudentLearningRoadmap]:
    """Retrieves a specific learning roadmap, strictly validating user_id ownership."""
    sb = get_supabase()
    if not sb:
        return None

    try:
        res = (
            sb.from_("student_learning_roadmaps")
            .select("*")
            .eq("id", roadmap_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not res.data or len(res.data) == 0:
            return None
        r = res.data[0]
        return StudentLearningRoadmap(
            id=str(r.get("id")),
            user_id=str(r.get("user_id")),
            title=r.get("title") or "Roadmap",
            career_goal=r.get("career_goal") or "",
            starting_level=ExperienceLevel(r.get("starting_level") or "Beginner"),
            stages=[RoadmapStage(**s) for s in r.get("stages") or []],
            milestones=[RoadmapMilestone(**m) for m in r.get("milestones") or []],
            status=RoadmapStatus(r.get("status") or "active"),
            created_at=r.get("created_at"),
            updated_at=r.get("updated_at"),
        )
    except Exception as e:
        logger.warning(f"Error fetching roadmap {roadmap_id}: {e}")
        return None


def delete_student_roadmap(user_id: str, roadmap_id: str) -> bool:
    """Deletes a student roadmap strictly validating user_id ownership."""
    sb = get_supabase()
    if not sb:
        return False
    try:
        sb.from_("student_learning_roadmaps").delete().eq("id", roadmap_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.warning(f"Error deleting roadmap {roadmap_id}: {e}")
        return False


def convert_roadmap_milestones_to_task_proposals(
    user_id: str,
    roadmap_id: str,
    milestone_ids: List[str],
) -> Optional[TaskActionProposal]:
    """
    Converts selected roadmap milestones into a Phase 2A task creation proposal.
    Reuses the cryptographic HMAC approval mechanism so the user can review,
    edit, and explicitly confirm before anything is inserted into public.tasks!
    """
    roadmap = get_student_roadmap_by_id(user_id, roadmap_id)
    if not roadmap:
        return None

    target_milestones = [
        m for m in roadmap.milestones if m.id in milestone_ids
    ]
    if not target_milestones:
        return None

    proposed_tasks: List[ProposedTaskItem] = []
    for m in target_milestones[:20]:
        proposed_tasks.append(
            ProposedTaskItem(
                temp_id=str(uuid.uuid4()),
                title=m.title[:255],
                description=f"Roadmap Milestone ({roadmap.career_goal}): {m.description or ''}".strip()[:4000],
                category=TaskCategory.Study,
                priority=TaskPriority.medium,
                status=TaskStatus.todo,
                estimated_minutes=m.suggested_duration_minutes or 60,
            )
        )

    action_id = str(uuid.uuid4())
    token, expires_at = generate_approval_token(user_id, action_id, TaskActionType.BATCH_CREATE_TASKS.value)

    return TaskActionProposal(
        action_id=action_id,
        action_type=TaskActionType.BATCH_CREATE_TASKS,
        proposed_tasks=proposed_tasks,
        approval_token=token,
        expires_at=expires_at,
        status="pending",
        description=f"Add {len(proposed_tasks)} roadmap milestone(s) to To-Do List",
    )


# ---------------------------------------------------------------------------
# Feature E: Weekly Progress Reviews
# ---------------------------------------------------------------------------

def generate_weekly_progress_review(
    user_id: str,
    client_timezone: str = "UTC",
    reference_now: Optional[datetime.datetime] = None,
) -> WeeklyProgressReviewResult:
    """
    Constructs an evidence-backed weekly progress review from authentic database records.
    Respects student's local timezone.
    Never fabricates hours or false achievements.
    """
    ref_now = reference_now or datetime.datetime.now(datetime.timezone.utc)
    week_start_dt = ref_now - datetime.timedelta(days=7)

    profile = get_student_learning_profile(user_id)
    sb = get_supabase()
    tasks: List[Dict[str, Any]] = []

    if sb:
        try:
            res = (
                sb.from_("tasks")
                .select("id, title, status, priority, category, due_at, completed_at, created_at, estimated_minutes")
                .eq("user_id", user_id)
                .limit(100)
                .execute()
            )
            tasks = res.data or []
        except Exception as e:
            logger.debug(f"Error retrieving tasks for weekly review: {e}")

    completed_in_period: List[Dict[str, Any]] = []
    pending_tasks: List[Dict[str, Any]] = []
    overdue_tasks: List[Dict[str, Any]] = []

    for t in tasks:
        st = t.get("status")
        comp_at_str = t.get("completed_at")

        if st == "completed":
            if comp_at_str:
                try:
                    c_dt = datetime.datetime.fromisoformat(comp_at_str.replace("Z", "+00:00"))
                    if c_dt >= week_start_dt:
                        completed_in_period.append(t)
                except Exception:
                    pass
        else:
            pending_tasks.append(t)
            due_str = t.get("due_at")
            if due_str:
                try:
                    d_dt = datetime.datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                    if d_dt < ref_now:
                        overdue_tasks.append(t)
                except Exception:
                    pass

    # Achievements based strictly on facts
    achievements = []
    if completed_in_period:
        titles_str = ", ".join(f"'{t['title']}'" for t in completed_in_period[:3])
        achievements.append(f"Completed {len(completed_in_period)} task(s) this week including {titles_str}.")
    else:
        achievements.append("No learning tasks recorded as completed in the past 7 days.")

    # Bottlenecks
    bottlenecks = []
    if overdue_tasks:
        bottlenecks.append(f"{len(overdue_tasks)} task(s) have passed their scheduled deadlines.")

    # Next week priorities
    priorities = []
    if overdue_tasks:
        priorities.append(f"Resolve overdue items first: '{overdue_tasks[0]['title']}'.")
    if profile.short_term_objective:
        priorities.append(f"Advance short-term objective: '{profile.short_term_objective}'.")
    elif profile.career_goal:
        priorities.append(f"Complete next milestones towards {profile.career_goal}.")
    else:
        priorities.append("Establish a clear target career role in your learning profile.")

    return WeeklyProgressReviewResult(
        start_date=week_start_dt.strftime("%Y-%m-%d"),
        end_date=ref_now.strftime("%Y-%m-%d"),
        timezone=client_timezone,
        tasks_completed_count=len(completed_in_period),
        completed_tasks=completed_in_period,
        pending_tasks_count=len(pending_tasks),
        overdue_tasks_count=len(overdue_tasks),
        overdue_tasks=overdue_tasks,
        active_goals=[profile.career_goal] if profile.career_goal else [],
        bottlenecks=bottlenecks,
        achievements=achievements,
        suggested_priorities_next_week=priorities,
    )


# ---------------------------------------------------------------------------
# Prompt Context Formatter for AI Mentor Personalization
# ---------------------------------------------------------------------------

def format_personalization_context_for_prompt(
    user_id: str,
    user_tasks: Optional[List[Dict[str, Any]]] = None,
    client_timezone: str = "UTC",
) -> str:
    """
    Generates a concise, authoritative XML context block for the AI Mentor.
    Injected on every student message to ensure all suggestions are
    grounded in career goals, real progress, and skill gaps without hallucinations.
    """
    profile = get_student_learning_profile(user_id)
    progress_state = get_student_learning_progress_state(user_id, user_tasks)
    skill_gaps = analyze_skill_gaps(user_id)

    lines = [
        "<student_learning_profile>",
        f"  <career_goal>{profile.career_goal or 'Not specified by student'}</career_goal>",
        f"  <experience_level>{profile.experience_level.value}</experience_level>",
        f"  <existing_skills>{', '.join(profile.existing_skills) if profile.existing_skills else 'None reported'}</existing_skills>",
        f"  <target_skills>{', '.join(profile.target_skills) if profile.target_skills else 'None reported'}</target_skills>",
        f"  <learning_preferences>{', '.join(profile.learning_preferences) if profile.learning_preferences else 'Default'}</learning_preferences>",
        f"  <daily_availability_minutes>{profile.preferred_daily_minutes}</daily_availability_minutes>",
    ]

    if profile.short_term_objective:
        lines.append(f"  <short_term_objective>{profile.short_term_objective}</short_term_objective>")
    if profile.long_term_objective:
        lines.append(f"  <long_term_objective>{profile.long_term_objective}</long_term_objective>")
    if profile.target_date:
        lines.append(f"  <target_date>{profile.target_date}</target_date>")

    lines.append("</student_learning_profile>")

    # Skill Gap Summary
    lines.append("<skill_gap_summary>")
    lines.append(f"  <!-- TARGET ROLE: {skill_gaps.target_role} -->")
    if skill_gaps.confirmed_skills:
        lines.append(f"  <confirmed_skills>{', '.join(skill_gaps.confirmed_skills)}</confirmed_skills>")
    if skill_gaps.missing_critical_skills:
        lines.append(f"  <missing_critical_gaps>{', '.join(skill_gaps.missing_critical_skills)}</missing_critical_gaps>")
    if skill_gaps.skills_in_progress:
        lines.append(f"  <skills_in_progress>{', '.join(skill_gaps.skills_in_progress)}</skills_in_progress>")
    lines.append("</skill_gap_summary>")

    # Progress Facts vs Inferences
    facts = progress_state["facts"]
    lines.append("<learning_progress_evidence>")
    lines.append(f"  <facts completed_tasks=\"{facts['completed_tasks_count']}\" pending_tasks=\"{facts['pending_tasks_count']}\" overdue_tasks=\"{facts['overdue_tasks_count']}\" />")
    if facts["evidenced_skills"]:
        lines.append(f"  <evidenced_skills_from_tasks>{', '.join(facts['evidenced_skills'])}</evidenced_skills_from_tasks>")
    for inf in progress_state["inferences"]:
        lines.append(f"  <!-- INFERENCE: {inf} -->")
    lines.append("</learning_progress_evidence>")

    return "\n".join(lines)
