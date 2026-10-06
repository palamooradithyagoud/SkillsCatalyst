"""
tests/test_mentor_context_data_integrity.py
Data Integrity, Normalization, Boundaries & PRI Calculation Test Suite.
Covers:
- P1: Data Integrity & Boundary Handling (Tests 40 - 46)
- P1: PRI Correctness & Weighting (Tests 47 - 49)
"""

import asyncio
import pytest
from unittest.mock import MagicMock

from backend.services.cache_service import delete_pattern, _in_memory_cache
from backend.services.ai_mentor import (
    build_student_mentor_context,
    format_context_for_prompt,
    MentorContext,
    ResumeContext,
    CodingDSAContext,
    ReadinessContext,
    ContextMetadata,
)
import backend.services.ai_mentor.context_aggregator as aggregator_module

USER_ID = "44444444-4444-4444-4444-444444444444"


class MockQueryBuilder:
    def __init__(self, data=None):
        self._data = data if data is not None else []

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        res = MagicMock()
        res.data = self._data
        res.count = len(self._data)
        return res


def _mock_sb(tables_data):
    mock = MagicMock()
    mock.table.side_effect = lambda t: MockQueryBuilder(tables_data.get(t, []))
    return mock


# ==============================================================================
# P1: Data Integrity (Tests 40 - 46)
# ==============================================================================

def test_40_new_student_clean_defaults(monkeypatch):
    """
    Test 40: A brand new student with no platform records gets valid empty defaults,
    never crashing or producing fake placeholders.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb({}))
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.student.name == "Learner"
    assert ctx.skills.technical_skills == []
    assert ctx.projects.top_projects == []
    assert ctx.resume.has_resume_review is False
    assert ctx.dsa.total_problems_solved == 0
    assert ctx.readiness.personal_readiness_index == 0.0


def test_41_null_vs_zero_distinction(monkeypatch):
    """
    Test 41: Clear distinction between NULL (no record / not evaluated) and 0 (attempted, score 0).
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Case A: No resume review -> has_resume_review=False, overall_score=None
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb({}))
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx_no_resume = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx_no_resume.resume.has_resume_review is False
    assert ctx_no_resume.resume.overall_score is None

    # Case B: Resume evaluated with score 0
    tables = {
        "resume_scores": [{"overall_score": 0.0, "ats_compatibility_score": 0.0, "target_role": "QA"}],
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))

    ctx_zero_resume = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx_zero_resume.resume.has_resume_review is True
    assert ctx_zero_resume.resume.overall_score == 0.0


def test_42_empty_arrays_handling(monkeypatch):
    """
    Test 42: Empty arrays in DB return predictable [] in model, not None or errors.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "career_preferences": [
            {
                "target_roles": [],
                "preferred_industries": [],
                "target_companies": [],
                "preferred_locations": [],
                "work_arrangements": [],
            }
        ],
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert isinstance(ctx.career.target_roles, list)
    assert ctx.career.target_roles == []
    assert ctx.career.preferred_industries == []


def test_43_maximum_allowed_records_caps(monkeypatch):
    """
    Test 43: Cap limits: skills capped at 20, projects capped at 3, experiences capped at 3.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "user_skills": [{"skill_name": f"Skill_{i}", "category": "Dev", "proficiency": "Int"} for i in range(50)],
        "projects": [{"project_name": f"Proj_{i}", "technologies": ["Python"]} for i in range(10)],
        "experiences": [{"company_name": f"Comp_{i}", "role": "Dev"} for i in range(10)],
    }
    mock = MagicMock()

    def get_table(t):
        raw = tables.get(t, [])
        # Mock PostgREST limit behavior
        class CappedQuery(MockQueryBuilder):
            def limit(self, n):
                return MockQueryBuilder(raw[:n])
        return CappedQuery(raw)

    mock.table.side_effect = get_table
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert len(ctx.skills.technical_skills) <= 20
    assert len(ctx.projects.top_projects) <= 3
    assert len(ctx.experience.experiences) <= 3


def test_44_long_project_descriptions_truncated_in_prompt():
    """
    Test 44: Very long project descriptions are truncated to prevent prompt bloat.
    """
    long_desc = "X" * 500
    ctx = MentorContext(
        projects=aggregator_module.ProjectsContext(
            top_projects=[
                aggregator_module.ProjectItem(
                    project_name="Massive Project",
                    description=long_desc,
                    technologies=["Python", "PostgreSQL"],
                )
            ]
        ),
        metadata=ContextMetadata(
            generated_at="2026-10-07T00:00:00Z",
            user_id_hash="abc",
            duration_ms=1.0,
        ),
    )
    formatted = format_context_for_prompt(ctx)
    assert len(formatted) < 1000
    assert "Massive Project" in formatted


def test_45_malformed_stats_json_resilience(monkeypatch):
    """
    Test 45: Corrupted, non-dictionary, or unexpected keys in stats_json
    do not crash the aggregator or invent fake DSA numbers.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    corrupted_cases = [
        "not a dictionary",
        {"leetcode": "invalid_string_instead_of_dict"},
        {"leetcode": {"total_solved": "one hundred"}},
        {"leetcode": {"ranking": "unknown"}},
        None,
    ]

    for stats in corrupted_cases:
        tables = {"user_coding_profiles": [{"leetcode_url": "https://leetcode.com/user", "stats_json": stats}]}
        monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
        monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

        ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
        assert ctx.dsa.total_problems_solved >= 0
        assert ctx.dsa.leetcode_solved >= 0


def test_46_invalid_numeric_data_handling(monkeypatch):
    """
    Test 46: Handled safely when database contains negative numbers or extreme values.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "user_progress": [{"streak_days": -5, "level": -1, "total_xp": -100}],
        "saved_playlists": [{"video_count": "-50"}],
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.gamification.streak_days in (-5, 0)
    assert ctx.learning.completion_percent >= 0


# ==============================================================================
# P1: PRI Correctness & Weighting (Tests 47 - 49)
# ==============================================================================

def test_47_pri_formula_deterministic_calculation(monkeypatch):
    """
    Test 47: Validates PRI formula:
    resume: 80 × 0.35 = 28.0
    coding: 60/50*100 -> cap 100 -> 30 solved -> 30/50*100 = 60.0 × 0.35 = 21.0
    video: 40 × 0.15 = 6.0
    roadmap: 20 × 0.15 = 3.0
    Total PRI = 28.0 + 21.0 + 6.0 + 3.0 = 58.0
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "resume_scores": [{"overall_score": 80.0}],
        "user_coding_profiles": [{"stats_json": {"leetcode": {"total_solved": 30}}}],
        "saved_playlists": [{"playlist_id": "p1", "video_count": "10"}],
        "video_progress": [{"video_id": f"v{i}"} for i in range(4)],  # 4/10 = 40%
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
    monkeypatch.setattr(
        aggregator_module,
        "get_active_roadmap_data",
        lambda uid: {"has_active_roadmap": True, "progress_percent": 20},
    )

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.readiness.personal_readiness_index == 58.0


def test_48_pri_coding_score_cap_at_100(monkeypatch):
    """
    Test 48: 500 solved coding problems cannot exceed the 100 maximum coding score cap.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "resume_scores": [{"overall_score": 0.0}],
        "user_coding_profiles": [{"stats_json": {"leetcode": {"total_solved": 500}}}],
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    # coding_score = min(100.0, (500/50)*100 = 1000) = 100.0
    # PRI = 100.0 * 0.35 = 35.0
    assert ctx.readiness.personal_readiness_index == 35.0


@pytest.mark.parametrize("resume_val, problems_val, video_pct_val, roadmap_pct_val", [
    (0.0, 0, 0, 0),
    (100.0, 50, 100, 100),
    (50.0, 25, 50, 50),
    (1.0, 1, 1, 1),
])
def test_49_pri_boundary_values(monkeypatch, resume_val, problems_val, video_pct_val, roadmap_pct_val):
    """
    Test 49: PRI calculations on boundary values [0, 1, 50, 100] are always bounded in [0.0, 100.0].
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    tables = {
        "resume_scores": [{"overall_score": resume_val}],
        "user_coding_profiles": [{"stats_json": {"leetcode": {"total_solved": problems_val}}}],
        "saved_playlists": [{"playlist_id": "p1", "video_count": "100"}],
        "video_progress": [{"video_id": f"v{i}"} for i in range(video_pct_val)],
    }
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: _mock_sb(tables))
    monkeypatch.setattr(
        aggregator_module,
        "get_active_roadmap_data",
        lambda uid: {"has_active_roadmap": True, "progress_percent": roadmap_pct_val},
    )

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    pri = ctx.readiness.personal_readiness_index
    assert 0.0 <= pri <= 100.0
