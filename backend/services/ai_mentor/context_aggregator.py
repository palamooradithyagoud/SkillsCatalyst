"""
backend/services/ai_mentor/context_aggregator.py
Production-Grade Student Context Aggregator for SkillsCatalyst AI Mentor.
Batches, normalizes, sanitizes, and caches authenticated student data across all platform modules.
"""

import datetime
import hashlib
import logging
import re
import time
from typing import Optional, Any, List

from backend.services.auth_service import is_valid_uuid
from backend.services.cache_service import get_json, set_json
from backend.services.supabase_service import get_supabase
from backend.routers.dashboard import get_active_roadmap_data
from backend.services.ai_mentor.context_models import (
    MentorContext,
    StudentProfileContext,
    CareerContext,
    SkillsContext,
    SkillItem,
    ProjectsContext,
    ProjectItem,
    ExperienceContext,
    ExperienceItem,
    RoadmapContext,
    LearningContext,
    CodingDSAContext,
    ResumeContext,
    GamificationContext,
    ReadinessContext,
    ContextMetadata,
)
from backend.services.ai_mentor.context_sanitizer import (
    format_context_for_prompt,
)

logger = logging.getLogger(__name__)

CONTEXT_CACHE_TTL_SECONDS = 60
CACHE_KEY_PREFIX = "mentor:ctx:"


def _clean_handle(url_or_handle: Optional[str]) -> str:
    """Extracts username handle from profile URL or raw string."""
    if not url_or_handle:
        return ""
    text = str(url_or_handle).strip()
    text = text.split("?")[0].split("#")[0].rstrip("/")
    if "://" in text:
        text = text.split("://", 1)[1]
    if "/" in text:
        parts = [
            p.strip()
            for p in text.split("/")
            if p.strip() and p.strip().lower() not in ("u", "user", "users", "profile", "in", "in-in")
        ]
        return parts[-1] if parts else text
    return text.lstrip("@").strip()


def _normalize_str_list(val: Any) -> List[str]:
    """Ensures input is normalized into a list of non-empty strings."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(x).strip() for x in val if x and str(x).strip()]
    if isinstance(val, str):
        cleaned = val.strip("{}[]")
        return [x.strip().strip('"\'') for x in cleaned.split(",") if x.strip()]
    return []


async def build_student_mentor_context(
    user_id: str,
    force_refresh: bool = False,
) -> MentorContext:
    """
    Builds the strongly-typed, sanitized MentorContext for the specified user.
    - Validates user identity (returns anonymous/empty context if non-UUID).
    - Checks Redis cache (TTL 60s) unless force_refresh is True.
    - Batches queries across all student data tables with defensive try/except isolation.
    - Caches and returns normalized MentorContext.
    """
    start_time = time.perf_counter()

    # 1. Identity Validation (fail-closed for invalid UUIDs or guests)
    if not user_id or not is_valid_uuid(user_id):
        logger.debug(f"Non-UUID or guest session ID passed to context aggregator: '{user_id}'")
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return MentorContext(
            metadata=ContextMetadata(
                generated_at=now_iso,
                user_id_hash="anonymous",
                duration_ms=0.0,
                cached=False,
            )
        )

    cache_key = f"{CACHE_KEY_PREFIX}{user_id}"

    # 2. Cache Lookup
    if not force_refresh:
        try:
            cached_payload = get_json(cache_key)
            if cached_payload and isinstance(cached_payload, dict):
                ctx = (
                    MentorContext.model_validate(cached_payload)
                    if hasattr(MentorContext, "model_validate")
                    else MentorContext(**cached_payload)
                )
                ctx.metadata.cached = True
                logger.debug(f"Mentor context cache hit for user {user_id[:8]}...")
                return ctx
        except Exception as cache_err:
            logger.warning(f"Error reading mentor context cache for {user_id[:8]}...: {cache_err}")

    # 3. Supabase Connection Check
    sb = get_supabase()
    user_hash = hashlib.sha256(str(user_id).encode("utf-8")).hexdigest()[:12]

    if not sb:
        logger.warning(f"Supabase client unavailable when aggregating context for user hash {user_hash}")
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return MentorContext(
            metadata=ContextMetadata(
                generated_at=now_iso,
                user_id_hash=user_hash,
                duration_ms=round((time.perf_counter() - start_time) * 1000, 2),
                cached=False,
            )
        )

    # 4. Fetch Student Profile & Academic Details
    display_name = "Learner"
    college_val = None
    dept_val = None
    acad_year_val = None
    headline_val = None
    acad_target_role = None

    try:
        res_acad = (
            sb.table("user_academic_profile")
            .select("full_name, college, department, academic_year, target_role")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if res_acad.data and len(res_acad.data) > 0:
            row = res_acad.data[0]
            if row.get("full_name"):
                display_name = str(row["full_name"]).strip()
            college_val = row.get("college")
            dept_val = row.get("department")
            acad_year_val = row.get("academic_year")
            acad_target_role = row.get("target_role")
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch user_academic_profile: {e}")

    try:
        res_prof = (
            sb.table("profiles")
            .select("full_name, headline")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )
        if res_prof.data and len(res_prof.data) > 0:
            row = res_prof.data[0]
            if (display_name == "Learner" or not display_name) and row.get("full_name"):
                display_name = str(row["full_name"]).strip()
            if row.get("headline"):
                headline_val = row.get("headline")
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch profiles: {e}")

    student_ctx = StudentProfileContext(
        name=display_name or "Learner",
        college=college_val,
        department=dept_val,
        academic_year=acad_year_val,
        headline=headline_val,
    )

    # 5. Fetch Career Preferences
    career_ctx = CareerContext()
    try:
        res_cp = (
            sb.table("career_preferences")
            .select("target_roles, preferred_industries, target_companies, preferred_locations, work_arrangements")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if res_cp.data and len(res_cp.data) > 0:
            cp_row = res_cp.data[0]
            t_roles = _normalize_str_list(cp_row.get("target_roles"))
            if not t_roles and acad_target_role:
                t_roles = [str(acad_target_role).strip()]
            career_ctx = CareerContext(
                target_roles=t_roles,
                preferred_industries=_normalize_str_list(cp_row.get("preferred_industries")),
                target_companies=_normalize_str_list(cp_row.get("target_companies")),
                preferred_locations=_normalize_str_list(cp_row.get("preferred_locations")),
                work_arrangements=_normalize_str_list(cp_row.get("work_arrangements")),
            )
        elif acad_target_role:
            career_ctx = CareerContext(target_roles=[str(acad_target_role).strip()])
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch career_preferences: {e}")

    # 6. Fetch Technical Skills (limit 20)
    skills_ctx = SkillsContext()
    try:
        res_skills = (
            sb.table("user_skills")
            .select("skill_name, category, proficiency")
            .eq("user_id", user_id)
            .limit(20)
            .execute()
        )
        if res_skills.data:
            skill_items = []
            for s in res_skills.data:
                s_name = s.get("skill_name")
                if s_name:
                    skill_items.append(
                        SkillItem(
                            skill_name=str(s_name).strip(),
                            category=str(s.get("category") or "Programming").strip(),
                            proficiency=str(s.get("proficiency") or "Intermediate").strip(),
                        )
                    )
            skills_ctx = SkillsContext(technical_skills=skill_items)
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch user_skills: {e}")

    # 7. Fetch Top Projects (limit 3, latest first)
    projects_ctx = ProjectsContext()
    try:
        res_proj = (
            sb.table("projects")
            .select("project_name, description, technologies, currently_working")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(3)
            .execute()
        )
        if res_proj.data:
            proj_items = []
            for p in res_proj.data:
                p_name = p.get("project_name")
                if p_name:
                    proj_items.append(
                        ProjectItem(
                            project_name=str(p_name).strip(),
                            description=p.get("description"),
                            technologies=_normalize_str_list(p.get("technologies")),
                            currently_working=bool(p.get("currently_working", False)),
                        )
                    )
            projects_ctx = ProjectsContext(top_projects=proj_items)
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch projects: {e}")

    # 8. Fetch Experiences (limit 3, latest first)
    experiences_ctx = ExperienceContext()
    try:
        res_exp = (
            sb.table("experiences")
            .select("company_name, role, work_type, currently_working, description")
            .eq("user_id", user_id)
            .order("start_date", desc=True)
            .limit(3)
            .execute()
        )
        if res_exp.data:
            exp_items = []
            for e in res_exp.data:
                c_name = e.get("company_name")
                r_name = e.get("role")
                if c_name and r_name:
                    exp_items.append(
                        ExperienceItem(
                            company_name=str(c_name).strip(),
                            role=str(r_name).strip(),
                            work_type=str(e.get("work_type") or "Remote").strip(),
                            currently_working=bool(e.get("currently_working", False)),
                            description=e.get("description"),
                        )
                    )
            experiences_ctx = ExperienceContext(experiences=exp_items)
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch experiences: {e}")

    # 9. Fetch Active Roadmap Progress (reusing dashboard roadmaps helper)
    roadmap_ctx = RoadmapContext()
    roadmap_pct = 0
    try:
        active_rm = get_active_roadmap_data(user_id)
        if active_rm and active_rm.get("has_active_roadmap"):
            roadmap_pct = int(active_rm.get("progress_percent") or 0)
            curr_m = active_rm.get("current_module")
            if isinstance(curr_m, dict):
                curr_m = curr_m.get("title") or curr_m.get("id")
            next_m = active_rm.get("next_module")
            if isinstance(next_m, dict):
                next_m = next_m.get("title") or next_m.get("id")
            roadmap_ctx = RoadmapContext(
                has_active_roadmap=True,
                roadmap_id=active_rm.get("roadmap_id"),
                roadmap_title=active_rm.get("title"),
                progress_percent=roadmap_pct,
                completed_milestones=int(active_rm.get("completed_milestones") or 0),
                total_milestones=int(active_rm.get("total_milestones") or 0),
                current_module=str(curr_m) if curr_m else None,
                next_module=str(next_m) if next_m else None,
            )
    except Exception as e:
        logger.debug(f"Context aggregator: failed to get active roadmap data: {e}")

    # 10. Fetch Video & Learning Progress
    learning_ctx = LearningContext()
    video_pct = 0
    try:
        res_saved = (
            sb.table("saved_playlists")
            .select("playlist_id, video_count")
            .eq("user_id", user_id)
            .execute()
        )
        saved_pids = []
        total_videos = 0
        saved_playlists_count = 0
        if res_saved.data:
            saved_playlists_count = len(res_saved.data)
            for row in res_saved.data:
                pid = row.get("playlist_id")
                if pid:
                    saved_pids.append(pid)
                vc_str = str(row.get("video_count", "0"))
                match = re.search(r"\d+", vc_str)
                if match:
                    total_videos += int(match.group())

        completed_videos = 0
        if saved_pids:
            res_completed = (
                sb.table("video_progress")
                .select("video_id", count="exact")
                .eq("user_id", user_id)
                .in_("playlist_id", saved_pids)
                .eq("watched", True)
                .execute()
            )
            completed_videos = res_completed.count or (len(res_completed.data) if res_completed.data else 0)

        if total_videos > 0:
            if completed_videos > total_videos:
                total_videos = completed_videos
            video_pct = round((completed_videos / total_videos) * 100)
        elif completed_videos > 0:
            video_pct = 0

        learning_ctx = LearningContext(
            completed_videos=completed_videos,
            total_videos=total_videos,
            completion_percent=video_pct,
            saved_playlists_count=saved_playlists_count,
        )
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch video learning progress: {e}")

    # 11. Fetch Coding & DSA Platform Stats
    dsa_ctx = CodingDSAContext()
    problems_solved = 0
    try:
        extracted_solved = 0
        leetcode_solved = 0
        leetcode_easy = 0
        leetcode_med = 0
        leetcode_hard = 0
        leetcode_user = ""
        leetcode_ranking = None

        res_code = (
            sb.table("user_coding_profiles")
            .select("leetcode_url, stats_json")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if res_code.data and len(res_code.data) > 0:
            code_row = res_code.data[0]
            stats_json = code_row.get("stats_json") or {}
            raw_lc_url = code_row.get("leetcode_url") or ""

            lc = stats_json.get("leetcode", {})
            if isinstance(lc, dict) and (lc.get("configured") or "total_solved" in lc):
                leetcode_solved = int(lc.get("total_solved") or lc.get("solved") or 0)
                leetcode_easy = int(lc.get("easy_solved", 0))
                leetcode_med = int(lc.get("medium_solved", 0))
                leetcode_hard = int(lc.get("hard_solved", 0))
                leetcode_user = str(lc.get("username", "") or _clean_handle(raw_lc_url))
                if lc.get("ranking"):
                    try:
                        leetcode_ranking = int(lc.get("ranking"))
                    except (ValueError, TypeError):
                        leetcode_ranking = None
            elif raw_lc_url:
                leetcode_user = _clean_handle(raw_lc_url)

            for platform, pdata in stats_json.items():
                if isinstance(pdata, dict):
                    ts = pdata.get("total_solved") or pdata.get("solved") or 0
                    if isinstance(ts, (int, float)):
                        extracted_solved += int(ts)

        res_practice = (
            sb.table("leetcode_progress")
            .select("question_title", count="exact")
            .eq("user_id", user_id)
            .eq("status", "solved")
            .order("solved_at", desc=True)
            .limit(3)
            .execute()
        )
        db_practice_solved = res_practice.count or (len(res_practice.data) if res_practice.data else 0)
        recent_titles = [r.get("question_title") for r in (res_practice.data or []) if r.get("question_title")]

        problems_solved = max(extracted_solved, leetcode_solved, db_practice_solved)

        dsa_ctx = CodingDSAContext(
            total_problems_solved=problems_solved,
            leetcode_solved=leetcode_solved,
            easy_solved=leetcode_easy,
            medium_solved=leetcode_med,
            hard_solved=leetcode_hard,
            leetcode_username=leetcode_user or None,
            leetcode_ranking=leetcode_ranking,
            recent_solved_titles=recent_titles,
        )
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch coding DSA stats: {e}")

    # 12. Fetch Gamification & User Progress
    gamification_ctx = GamificationContext()
    user_prog_resume_score = None
    try:
        res_up = (
            sb.table("user_progress")
            .select("streak_days, level, total_xp, success_rate, resume_readiness_score")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if res_up.data and len(res_up.data) > 0:
            up_row = res_up.data[0]
            gamification_ctx = GamificationContext(
                streak_days=int(up_row.get("streak_days") or 0),
                level=int(up_row.get("level") or 0),
                total_xp=int(up_row.get("total_xp") or 0),
                success_rate=float(up_row.get("success_rate") or 0.0),
            )
            if up_row.get("resume_readiness_score") is not None:
                user_prog_resume_score = float(up_row.get("resume_readiness_score"))
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch user_progress: {e}")

    # 13. Fetch Resume Review Summary
    resume_ctx = ResumeContext()
    effective_resume_score = 0.0
    try:
        res_resume = (
            sb.table("resume_scores")
            .select("overall_score, ats_compatibility_score, skills_match_score, experience_score, target_role, improvements, full_review_json, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res_resume.data and len(res_resume.data) > 0:
            r_row = res_resume.data[0]
            sc = r_row.get("overall_score") or r_row.get("ats_compatibility_score")
            ov_score = float(sc) if sc is not None else None
            if ov_score is not None:
                effective_resume_score = ov_score

            top_imps = []
            raw_imps = r_row.get("improvements")
            if isinstance(raw_imps, list):
                top_imps = [str(x).strip() for x in raw_imps if x and str(x).strip()][:3]
            elif isinstance(raw_imps, dict):
                top_imps = [str(v).strip() for v in raw_imps.values() if v and str(v).strip()][:3]

            if not top_imps:
                fr_json = r_row.get("full_review_json") or {}
                if isinstance(fr_json, dict):
                    rev_text = fr_json.get("review") or ""
                    issues = re.findall(r"[-*•]\s+([^\n\r]+)", rev_text)
                    if issues:
                        top_imps = [i.strip() for i in issues if len(i.strip()) > 10][:3]

            resume_ctx = ResumeContext(
                has_resume_review=True,
                overall_score=ov_score,
                ats_compatibility_score=float(r_row["ats_compatibility_score"]) if r_row.get("ats_compatibility_score") is not None else None,
                skills_match_score=float(r_row["skills_match_score"]) if r_row.get("skills_match_score") is not None else None,
                experience_score=float(r_row["experience_score"]) if r_row.get("experience_score") is not None else None,
                target_role=r_row.get("target_role"),
                top_improvements=top_imps,
            )
        elif user_prog_resume_score is not None and user_prog_resume_score > 0:
            effective_resume_score = user_prog_resume_score
            resume_ctx = ResumeContext(
                has_resume_review=True,
                overall_score=user_prog_resume_score,
                ats_compatibility_score=user_prog_resume_score,
            )
    except Exception as e:
        logger.debug(f"Context aggregator: failed to fetch resume_scores: {e}")

    # 14. Personal Readiness Index (PRI) Computation
    coding_score = min(100.0, (problems_solved / 50.0) * 100.0)
    pri_score = round(
        (effective_resume_score * 0.35)
        + (coding_score * 0.35)
        + (video_pct * 0.15)
        + (roadmap_pct * 0.15),
        1,
    )

    readiness_ctx = ReadinessContext(
        personal_readiness_index=pri_score,
        learning_weight_pct=15,
        resume_weight_pct=35,
        coding_weight_pct=35,
        roadmap_weight_pct=15,
    )

    # 15. Observability Metadata & Final Assembly
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    metadata = ContextMetadata(
        generated_at=now_iso,
        user_id_hash=user_hash,
        duration_ms=duration_ms,
        cached=False,
    )

    context = MentorContext(
        student=student_ctx,
        career=career_ctx,
        skills=skills_ctx,
        projects=projects_ctx,
        experience=experiences_ctx,
        roadmap=roadmap_ctx,
        learning=learning_ctx,
        dsa=dsa_ctx,
        resume=resume_ctx,
        gamification=gamification_ctx,
        readiness=readiness_ctx,
        metadata=metadata,
    )

    # 16. Cache in Redis
    try:
        dump_data = context.model_dump() if hasattr(context, "model_dump") else context.dict()
        set_json(cache_key, dump_data, ttl_seconds=CONTEXT_CACHE_TTL_SECONDS)
    except Exception as c_err:
        logger.warning(f"Failed to cache mentor context for {user_hash}: {c_err}")

    return context


async def get_formatted_student_context_for_mentor(
    user_id: str,
    force_refresh: bool = False,
) -> str:
    """
    Convenience method for LLM prompting:
    Validates user identity, builds context, and formats into safe XML delimiters.
    Returns empty string for guest / invalid user IDs.
    """
    if not is_valid_uuid(user_id):
        return ""
    context = await build_student_mentor_context(user_id, force_refresh=force_refresh)
    return format_context_for_prompt(context)
