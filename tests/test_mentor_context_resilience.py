"""
tests/test_mentor_context_resilience.py
Subsystem Fault Isolation & Graceful Degradation Test Suite.
Covers:
- P0: Database Subsystem Failures & Partial Outages (Tests 29 - 35)
"""

import asyncio
import pytest
from unittest.mock import MagicMock

from backend.services.cache_service import delete_pattern, _in_memory_cache
from backend.services.ai_mentor import build_student_mentor_context
import backend.services.ai_mentor.context_aggregator as aggregator_module

USER_ID = "33333333-3333-3333-3333-333333333333"


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


def _build_failing_sb(failing_tables: set, working_data: dict = None):
    mock_sb = MagicMock()
    working_data = working_data or {}

    def get_table(table_name):
        if table_name in failing_tables:
            raise RuntimeError(f"Database table '{table_name}' connection failure or timeout!")
        data = working_data.get(table_name, [])
        return MockQueryBuilder(data)

    mock_sb.table.side_effect = get_table
    return mock_sb


# ==============================================================================
# P0: Database Failure / Graceful Degradation (Tests 29 - 35)
# ==============================================================================

def test_29_profile_failure_resilience(monkeypatch):
    """
    Test 29: Profiles / academic profile failure defaults to 'Learner'
    while skills, projects, and remaining context survive.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    working_data = {
        "user_skills": [{"skill_name": "Go", "category": "Programming", "proficiency": "Intermediate"}],
    }
    mock_sb = _build_failing_sb({"profiles", "user_academic_profile"}, working_data)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.student.name == "Learner"
    assert len(ctx.skills.technical_skills) == 1
    assert ctx.skills.technical_skills[0].skill_name == "Go"


def test_30_skills_failure_resilience(monkeypatch):
    """
    Test 30: user_skills table failure yields empty technical_skills list without 500.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    working_data = {"profiles": [{"full_name": "Sam Student"}]}
    mock_sb = _build_failing_sb({"user_skills"}, working_data)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.student.name == "Sam Student"
    assert ctx.skills.technical_skills == []


def test_31_roadmap_failure_resilience(monkeypatch):
    """
    Test 31: Roadmap helper crashing or raising unhandled exception
    defaults has_active_roadmap to False without crashing context aggregator.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    working_data = {"profiles": [{"full_name": "Sam Student"}]}
    mock_sb = _build_failing_sb(set(), working_data)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)

    def failing_roadmap(uid):
        raise ConnectionResetError("Roadmap microservice down")

    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", failing_roadmap)

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.roadmap.has_active_roadmap is False
    assert ctx.student.name == "Sam Student"


def test_32_resume_failure_resilience(monkeypatch):
    """
    Test 32: resume_scores failure yields has_resume_review=False,
    NEVER fabricating a fake ATS score.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    mock_sb = _build_failing_sb({"resume_scores"})
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.resume.has_resume_review is False
    assert ctx.resume.overall_score is None


def test_33_dsa_failure_resilience(monkeypatch):
    """
    Test 33: user_coding_profiles and leetcode_progress table failures
    gracefully default DSA solved counts to 0 while remaining context works.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    working_data = {"profiles": [{"full_name": "Sam Student"}]}
    mock_sb = _build_failing_sb({"user_coding_profiles", "leetcode_progress"}, working_data)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.dsa.total_problems_solved == 0
    assert ctx.student.name == "Sam Student"


def test_34_project_failure_resilience(monkeypatch):
    """
    Test 34: projects table failure defaults top_projects to empty list.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    working_data = {"profiles": [{"full_name": "Sam Student"}]}
    mock_sb = _build_failing_sb({"projects"}, working_data)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: {"has_active_roadmap": False})

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx.projects.top_projects == []
    assert ctx.student.name == "Sam Student"


def test_35_multiple_simultaneous_subsystem_failures(monkeypatch):
    """
    Test 35: Catastrophic partial outage:
    Profiles ❌ Roadmap ❌ Resume ❌ DSA ❌ Projects ❌ Redis ❌
    Aggregator must STILL return safe, valid MentorContext without throwing 500.
    """
    delete_pattern("mentor:ctx:*")
    _in_memory_cache.clear()

    # Redis fails
    monkeypatch.setattr("backend.services.cache_service.get_redis_client", lambda: None)

    # All DB tables fail
    all_failing = {
        "profiles", "user_academic_profile", "career_preferences",
        "user_skills", "projects", "experiences", "saved_playlists",
        "video_progress", "user_coding_profiles", "leetcode_progress",
        "user_progress", "resume_scores"
    }
    mock_sb = _build_failing_sb(all_failing)
    monkeypatch.setattr(aggregator_module, "get_supabase", lambda: mock_sb)

    # Roadmap service fails
    monkeypatch.setattr(aggregator_module, "get_active_roadmap_data", lambda uid: (_ for _ in ()).throw(RuntimeError("Roadmap down")))

    ctx = asyncio.run(build_student_mentor_context(USER_ID, force_refresh=True))
    assert ctx is not None
    assert ctx.student.name == "Learner"
    assert ctx.readiness.personal_readiness_index == 0.0
    assert ctx.roadmap.has_active_roadmap is False
    assert ctx.resume.has_resume_review is False
    assert ctx.metadata.user_id_hash != "anonymous"
