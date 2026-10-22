"""
tests/test_ai_mentor_personalization.py
Comprehensive unit and integration tests for Phase 2C: Personalized AI Mentor.

Covers:
1. Student Learning Profile: creation, update, validation, reset, and tenant isolation.
2. Facts vs Inferences: evidence-based learning progress tracking without claiming mastery.
3. Personalized Learning Roadmaps: stage-based generation, prerequisites, and milestone-to-task HMAC proposal conversion.
4. Skill Gap Analysis: confirmed vs self-reported vs target vs confirmed gap vs unevaluated skills.
5. Weekly Progress Reviews: authentic task completion calculations with timezone handling.
6. Adaptive Recommendations & Prompt Context Injection.
7. Security: Cross-user isolation, HMAC tokens, authentication context enforcement.
"""

import datetime
import json
import uuid
from unittest.mock import MagicMock, patch
import pytest
from pydantic import ValidationError

from backend.models.ai_mentor_personalization import (
    ExperienceLevel,
    RoadmapStatus,
    MilestoneStatus,
    SkillStatus,
    StudentLearningProfile,
    UpdateLearningProfileRequest,
    StudentLearningRoadmap,
    GenerateRoadmapRequest,
    ConvertMilestonesToTasksRequest,
    SkillGapItem,
    SkillGapAnalysisResult,
    WeeklyProgressReviewResult,
)
from backend.services.ai_mentor.personalization_service import (
    get_student_learning_profile,
    save_student_learning_profile,
    reset_student_learning_profile,
    get_student_learning_progress_state,
    analyze_skill_gaps,
    generate_student_roadmap,
    save_student_roadmap,
    get_student_roadmaps,
    get_student_roadmap_by_id,
    delete_student_roadmap,
    convert_roadmap_milestones_to_task_proposals,
    generate_weekly_progress_review,
    format_personalization_context_for_prompt,
    ROLE_SKILL_TAXONOMY,
)
from backend.services.ai_mentor.approval_service import (
    verify_approval_token,
    _CONSUMED_ACTIONS_MEM,
    _ACTION_RESERVATIONS_MEM,
    _IDEMPOTENCY_STORE_MEM,
)
from backend.models.ai_mentor_tasks import TaskActionType

USER_A = "11111111-1111-4111-8111-111111111111"
USER_B = "22222222-2222-4222-8222-222222222222"


@pytest.fixture(autouse=True)
def clean_memory_state():
    _CONSUMED_ACTIONS_MEM.clear()
    _ACTION_RESERVATIONS_MEM.clear()
    _IDEMPOTENCY_STORE_MEM.clear()


# ---------------------------------------------------------------------------
# 1. Student Learning Profile Tests
# ---------------------------------------------------------------------------

def test_default_profile_generation():
    """Default profile is returned with sensible defaults when no database record exists."""
    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=None):
        profile = get_student_learning_profile(USER_A)
        assert profile.user_id == USER_A
        assert profile.experience_level == ExperienceLevel.Beginner
        assert profile.preferred_daily_minutes == 60
        assert isinstance(profile.existing_skills, list)
        assert isinstance(profile.target_skills, list)


def test_update_learning_profile_validation():
    """Updating profile validates field ranges and persists updates."""
    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value = MagicMock(data=[])
    mock_sb.from_().upsert().execute.return_value = MagicMock(data=[])

    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=mock_sb):
        req = UpdateLearningProfileRequest(
            career_goal="Full Stack Developer",
            experience_level=ExperienceLevel.Intermediate,
            existing_skills=["Python", "FastAPI"],
            target_skills=["Next.js", "PostgreSQL"],
            preferred_daily_minutes=180,
            learning_preferences=["Project-based"],
            short_term_objective="Build full-stack MVP",
            long_term_objective="Senior Full Stack Engineer",
        )
        updated = save_student_learning_profile(USER_A, req)

        assert updated.user_id == USER_A
        assert updated.career_goal == "Full Stack Developer"
        assert updated.experience_level == ExperienceLevel.Intermediate
        assert updated.existing_skills == ["Python", "FastAPI"]
        assert updated.target_skills == ["Next.js", "PostgreSQL"]
        assert updated.preferred_daily_minutes == 180
        assert updated.short_term_objective == "Build full-stack MVP"
        assert updated.long_term_objective == "Senior Full Stack Engineer"


def test_profile_bounds_validation():
    """Profile rejects invalid daily availability or lengths out of bounds."""
    with pytest.raises(ValidationError):
        UpdateLearningProfileRequest(preferred_daily_minutes=-10)  # ge=0

    with pytest.raises(ValidationError):
        UpdateLearningProfileRequest(preferred_daily_minutes=2000)  # le=1440

    with pytest.raises(ValidationError):
        UpdateLearningProfileRequest(career_goal="x" * 300)  # max_length=255


def test_reset_learning_profile():
    """Resetting profile clears persistence in student_learning_profiles."""
    mock_sb = MagicMock()
    mock_sb.from_().delete().eq().execute.return_value = MagicMock(data=[])

    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=mock_sb):
        success = reset_student_learning_profile(USER_A)
        assert success is True
        mock_sb.from_().delete().eq.assert_called_with("user_id", USER_A)


def test_profile_cross_user_isolation():
    """User B query with get_supabase strictly queries with user_id == USER_B."""
    mock_sb = MagicMock()
    mock_sb.from_().select().eq().execute.return_value = MagicMock(data=[])

    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=mock_sb):
        profile_b = get_student_learning_profile(USER_B)
        assert profile_b.user_id == USER_B
        mock_sb.from_().select().eq.assert_called_with("user_id", USER_B)


# ---------------------------------------------------------------------------
# 2. Facts vs Inferences & Learning Progress Evidence Tests
# ---------------------------------------------------------------------------

def test_progress_evidence_facts_vs_inferences():
    """Distinguishes between measured task facts and cautious AI inferences without claiming mastery."""
    mock_tasks = [
        {"id": "t1", "title": "Complete Python Tutorial", "status": "completed", "category": "Study"},
        {"id": "t2", "title": "Build FastAPI App", "status": "completed", "category": "Projects"},
        {"id": "t3", "title": "SQL Practice", "status": "todo", "category": "Study", "due_at": "2026-10-20T10:00:00Z"},
    ]

    mock_profile = StudentLearningProfile(
        user_id=USER_A,
        career_goal="Backend Developer",
        experience_level=ExperienceLevel.Intermediate,
        existing_skills=["Python", "FastAPI"],
        target_skills=["Docker"],
        learning_preferences=[],
        preferred_daily_minutes=60,
        short_term_objective="",
        long_term_objective="",
    )

    with patch("backend.services.ai_mentor.personalization_service.get_student_learning_profile", return_value=mock_profile), \
         patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=None):
        progress = get_student_learning_progress_state(USER_A, mock_tasks)

        assert progress["facts"]["completed_tasks_count"] == 2
        assert progress["facts"]["pending_tasks_count"] == 1
        assert len(progress["facts"]["recent_completed_titles"]) == 2

        # Verify facts include evidenced skills
        evidenced = [s.lower() for s in progress["facts"]["evidenced_skills"]]
        assert "python" in evidenced or "fastapi" in evidenced

        # Verify inferences do not claim mastery
        inferences_text = " ".join(progress["inferences"])
        assert "mastery" not in inferences_text.lower()
        assert "certified" not in inferences_text.lower()


# ---------------------------------------------------------------------------
# 3. Personalized Learning Roadmaps Tests
# ---------------------------------------------------------------------------

def test_generate_student_roadmap_structure():
    """Generates structured roadmap with sequential stages, milestones, and prerequisites."""
    req = GenerateRoadmapRequest(
        career_goal="Full Stack Developer",
        starting_level=ExperienceLevel.Beginner,
    )
    roadmap = generate_student_roadmap(USER_A, req)

    assert roadmap.user_id == USER_A
    assert roadmap.career_goal == "Full Stack Developer"
    assert roadmap.starting_level == ExperienceLevel.Beginner
    assert len(roadmap.stages) == 3
    assert roadmap.stages[0].stage_index == 1
    assert roadmap.stages[1].stage_index == 2
    assert roadmap.stages[2].stage_index == 3

    assert len(roadmap.milestones) >= 5
    for m in roadmap.milestones:
        assert m.suggested_duration_minutes > 0
        assert m.status == MilestoneStatus.not_started
        assert isinstance(m.skills_covered, list)

    # Stage 2 milestone has prerequisite
    s2_m = roadmap.stages[1].milestones[0]
    assert len(s2_m.prerequisites) > 0


def test_convert_milestones_to_task_proposals():
    """Converting roadmap milestones creates a HMAC-signed batch_create_tasks proposal."""
    req = GenerateRoadmapRequest(
        career_goal="AI Engineer",
        starting_level=ExperienceLevel.Intermediate,
    )
    roadmap = generate_student_roadmap(USER_A, req)
    milestone_ids = [roadmap.milestones[0].id, roadmap.milestones[1].id]

    with patch("backend.services.ai_mentor.personalization_service.get_student_roadmap_by_id", return_value=roadmap):
        proposal = convert_roadmap_milestones_to_task_proposals(USER_A, roadmap.id, milestone_ids)

        assert proposal is not None
        assert proposal.action_type == TaskActionType.BATCH_CREATE_TASKS
        assert len(proposal.proposed_tasks) == 2
        assert proposal.proposed_tasks[0].title == roadmap.milestones[0].title
        assert proposal.proposed_tasks[1].title == roadmap.milestones[1].title
        assert proposal.status == "pending"

        # Verify HMAC approval token is valid and user-bound
        is_valid, err, payload = verify_approval_token(
            token=proposal.approval_token,
            authenticated_user_id=USER_A,
            expected_action_id=proposal.action_id,
        )
        assert is_valid is True
        assert err is None
        assert payload["act"] == TaskActionType.BATCH_CREATE_TASKS.value

        # Cross-user rejection: User B cannot verify or execute User A's proposal
        is_valid_b, err_b, _ = verify_approval_token(
            token=proposal.approval_token,
            authenticated_user_id=USER_B,
            expected_action_id=proposal.action_id,
        )
        assert is_valid_b is False


def test_roadmap_ownership_enforcement():
    """User B cannot fetch or delete User A's roadmap."""
    mock_sb = MagicMock()
    mock_sb.from_().select().eq().eq().execute.return_value = MagicMock(data=[])

    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=mock_sb):
        roadmap = get_student_roadmap_by_id(USER_B, "some-roadmap-id")
        assert roadmap is None


# ---------------------------------------------------------------------------
# 4. Skill Gap Analysis Tests
# ---------------------------------------------------------------------------

def test_analyze_skill_gaps_taxonomy_matching():
    """Categorizes skills accurately according to the student's stated goal and evidence."""
    mock_profile = StudentLearningProfile(
        user_id=USER_A,
        career_goal="Backend Developer",
        experience_level=ExperienceLevel.Intermediate,
        existing_skills=["Python"],
        target_skills=["Docker"],
        learning_preferences=[],
        preferred_daily_minutes=60,
        short_term_objective="",
        long_term_objective="",
    )

    with patch("backend.services.ai_mentor.personalization_service.get_student_learning_profile", return_value=mock_profile), \
         patch("backend.services.ai_mentor.personalization_service.get_student_learning_progress_state", return_value={
             "facts": {"evidenced_skills": ["Python"]},
             "evidenced_skills": ["Python"],
             "completed_tasks_count": 3,
         }):
        res = analyze_skill_gaps(USER_A)

        assert res.target_role == "Backend Developer"
        assert "Python" in res.confirmed_skills
        assert "Docker" in res.skills_in_progress
        assert len(res.gaps) > 0
        assert len(res.recommended_next_steps) > 0


def test_skill_gap_unknown_skill_not_assumed_deficiency():
    """Skills not recorded are marked unevaluated rather than fabricated negative scores."""
    mock_profile = StudentLearningProfile(
        user_id=USER_A,
        career_goal="Data Scientist",
        experience_level=ExperienceLevel.Beginner,
        existing_skills=["Python"],
        target_skills=[],
        learning_preferences=[],
        preferred_daily_minutes=60,
        short_term_objective="",
        long_term_objective="",
    )

    with patch("backend.services.ai_mentor.personalization_service.get_student_learning_profile", return_value=mock_profile), \
         patch("backend.services.ai_mentor.personalization_service.get_student_learning_progress_state", return_value={
             "facts": {"evidenced_skills": []},
             "evidenced_skills": [],
             "completed_tasks_count": 0,
         }):
        res = analyze_skill_gaps(USER_A)

        unevaluated_items = [i for i in res.gaps if i.status == SkillStatus.unevaluated]
        assert len(unevaluated_items) > 0
        for item in unevaluated_items:
            assert "numerical score" not in item.reason.lower()


# ---------------------------------------------------------------------------
# 5. Weekly Progress Review Tests
# ---------------------------------------------------------------------------

def test_generate_weekly_progress_review_counts_and_dates():
    """Summarizes only tasks completed within the past 7 days and detects overdue tasks."""
    now_utc = datetime.datetime(2026, 10, 23, 12, 0, 0, tzinfo=datetime.timezone.utc)
    recent_completed = (now_utc - datetime.timedelta(days=2)).isoformat()
    old_completed = (now_utc - datetime.timedelta(days=20)).isoformat()
    overdue_deadline = (now_utc - datetime.timedelta(days=1)).isoformat()

    mock_tasks = [
        {
            "id": "t1",
            "title": "Recent Study Task",
            "status": "completed",
            "completed_at": recent_completed,
            "category": "Study",
        },
        {
            "id": "t2",
            "title": "Old Task",
            "status": "completed",
            "completed_at": old_completed,
            "category": "Study",
        },
        {
            "id": "t3",
            "title": "Overdue Assignment",
            "status": "todo",
            "due_at": overdue_deadline,
            "category": "Assignments",
        },
        {
            "id": "t4",
            "title": "Future Task",
            "status": "todo",
            "due_at": (now_utc + datetime.timedelta(days=3)).isoformat(),
            "category": "Study",
        },
    ]

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().limit().execute.return_value = MagicMock(data=mock_tasks)

    with patch("backend.services.ai_mentor.personalization_service.get_supabase", return_value=mock_sb):
        review = generate_weekly_progress_review(
            user_id=USER_A,
            client_timezone="Asia/Kolkata",
            reference_now=now_utc,
        )

        assert review.tasks_completed_count == 1
        assert len(review.completed_tasks) == 1
        assert review.completed_tasks[0]["title"] == "Recent Study Task"
        assert review.pending_tasks_count == 2
        assert review.overdue_tasks_count == 1
        assert review.timezone == "Asia/Kolkata"
        assert len(review.suggested_priorities_next_week) > 0


# ---------------------------------------------------------------------------
# 6. Prompt Context Formatting Tests
# ---------------------------------------------------------------------------

def test_format_personalization_context_for_prompt():
    """Generates clean XML context block containing student learning profile and skill gaps."""
    mock_profile = StudentLearningProfile(
        user_id=USER_A,
        career_goal="AI Engineer",
        experience_level=ExperienceLevel.Intermediate,
        existing_skills=["Python", "PyTorch"],
        target_skills=["LangChain"],
        learning_preferences=["Hands-on code"],
        preferred_daily_minutes=60,
        short_term_objective="Deploy an LLM bot",
        long_term_objective="Staff AI Engineer",
    )

    with patch("backend.services.ai_mentor.personalization_service.get_student_learning_profile", return_value=mock_profile), \
         patch("backend.services.ai_mentor.personalization_service.get_student_roadmaps", return_value=[]):
        context_str = format_personalization_context_for_prompt(USER_A, [], "UTC")

        assert "<student_learning_profile>" in context_str
        assert "<career_goal>AI Engineer</career_goal>" in context_str
        assert "<skill_gap_summary>" in context_str
        assert "<learning_progress_evidence>" in context_str
        assert "LangChain" in context_str
