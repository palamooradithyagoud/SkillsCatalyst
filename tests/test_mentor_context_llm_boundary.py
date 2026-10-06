"""
tests/test_mentor_context_llm_boundary.py
LLM Boundary, Prompt Formulation, & Personalization Separation Test Suite.
Covers:
- P1: LLM Prompt Boundary & Injection (Tests 50 - 54)
"""

import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.auth_service import get_session_or_user_id
import backend.routers.ai_mentor as router_module
import backend.services.ai_mentor.context_aggregator as aggregator_module

client = TestClient(app)

STUDENT_A_ID = "aaaaaaaa-1111-1111-1111-111111111111"
STUDENT_B_ID = "bbbbbbbb-2222-2222-2222-222222222222"


# ==============================================================================
# P1: LLM Boundary & Personalization (Tests 50 - 54)
# ==============================================================================

def test_50_authenticated_student_receives_context_in_prompt(monkeypatch):
    """
    Test 50: An authenticated student's prompt to Groq includes their <student_context>.
    """
    captured = []

    def mock_chat_with_groq(prompt, system_prompt=None):
        captured.append(system_prompt)
        return "Advice based on your profile."

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)
    app.dependency_overrides[get_session_or_user_id] = lambda: STUDENT_A_ID

    async def mock_get_context(uid, force_refresh=False):
        return "<student_context><profile name=\"Alice Engineer\" /></student_context>"

    monkeypatch.setattr(router_module, "get_formatted_student_context_for_mentor", mock_get_context)

    try:
        resp = client.post("/api/ai-mentor/chat", json={"prompt": "How to learn system design?"})
        assert resp.status_code == 200
        assert len(captured) == 1
        assert "<student_context>" in captured[0]
        assert "Alice Engineer" in captured[0]
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_51_guest_receives_no_student_context(monkeypatch):
    """
    Test 51: A guest user session receives the generic prompt, NEVER any student data or empty context block.
    """
    captured = []

    def mock_chat_with_groq(prompt, system_prompt=None):
        captured.append(system_prompt)
        return "Generic tech advice."

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)
    app.dependency_overrides[get_session_or_user_id] = lambda: "guest_session_1234567890abcdef.signature"

    try:
        resp = client.post("/api/ai-mentor/chat", json={"prompt": "How to learn system design?"})
        assert resp.status_code == 200
        assert len(captured) == 1
        assert "<student_context>" not in captured[0]
        assert "You are SkillsCatalyst AI Mentor" in captured[0]
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_52_no_context_duplication_on_repeated_calls(monkeypatch):
    """
    Test 52: Sending multiple chat requests does not accumulate or duplicate context blocks.
    """
    captured = []

    def mock_chat_with_groq(prompt, system_prompt=None):
        captured.append(system_prompt)
        return "Reply."

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)
    app.dependency_overrides[get_session_or_user_id] = lambda: STUDENT_A_ID

    async def mock_get_context(uid, force_refresh=False):
        return "<student_context><profile name=\"Alice\" /></student_context>"

    monkeypatch.setattr(router_module, "get_formatted_student_context_for_mentor", mock_get_context)

    try:
        for i in range(3):
            client.post("/api/ai-mentor/chat", json={"prompt": f"Question {i} about Python algorithms?"})

        assert len(captured) == 3
        for sys_prompt in captured:
            assert sys_prompt.count("<student_context>") == 1
            assert sys_prompt.count("</student_context>") == 1
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)


def test_53_prompt_size_bounded_under_maximum_context():
    """
    Test 53: Maximum possible legitimate student profile generates a prompt block well within token limits (< 4000 chars).
    """
    huge_ctx = aggregator_module.MentorContext(
        student=aggregator_module.StudentProfileContext(
            name="Maximus Student",
            college="Massachusetts Institute of Technology",
            department="Electrical Engineering and Computer Science",
            academic_year="Fourth Year Senior",
            headline="Full Stack & Distributed Systems Researcher",
        ),
        career=aggregator_module.CareerContext(
            target_roles=["Full Stack Engineer", "Backend Architect", "AI Systems Engineer"],
            target_companies=["Google", "Meta", "Stripe", "OpenAI", "Anthropic"],
        ),
        skills=aggregator_module.SkillsContext(
            technical_skills=[
                aggregator_module.SkillItem(skill_name=f"Skill_{i}", category="CS", proficiency="Expert")
                for i in range(20)
            ]
        ),
        projects=aggregator_module.ProjectsContext(
            top_projects=[
                aggregator_module.ProjectItem(
                    project_name=f"High Scale Project {i}",
                    technologies=["Python", "Go", "Kubernetes", "Redis"],
                )
                for i in range(3)
            ]
        ),
        roadmap=aggregator_module.RoadmapContext(
            has_active_roadmap=True,
            roadmap_title="Full Stack Developer",
            progress_percent=85,
            completed_milestones=17,
            total_milestones=20,
            current_module="GraphQL & WebSockets",
            next_module="System Design",
        ),
        dsa=aggregator_module.CodingDSAContext(
            total_problems_solved=350,
            leetcode_solved=300,
            easy_solved=100,
            medium_solved=150,
            hard_solved=50,
            leetcode_ranking=15000,
            recent_solved_titles=["LRU Cache", "Word Break II", "Median of Two Sorted Arrays"],
        ),
        resume=aggregator_module.ResumeContext(
            has_resume_review=True,
            overall_score=92.0,
            target_role="Full Stack Engineer",
            top_improvements=["Quantify revenue impact in work bullets", "Detail distributed cache tuning"],
        ),
        gamification=aggregator_module.GamificationContext(
            streak_days=45,
            level=10,
            total_xp=8900,
        ),
        readiness=aggregator_module.ReadinessContext(personal_readiness_index=88.5),
        metadata=aggregator_module.ContextMetadata(
            generated_at="2026-10-07T00:00:00Z",
            user_id_hash="user_max_hash",
            duration_ms=1.2,
        ),
    )

    formatted = aggregator_module.format_context_for_prompt(huge_ctx)
    assert len(formatted) < 3000, f"Prompt length {len(formatted)} exceeded safe 3000-char budget!"


def test_54_mandatory_two_student_personalization_test(monkeypatch):
    """
    Test 54 (MANDATORY):
    Student A:
      Target role: Backend Engineer, DSA: 120, Roadmap: 72%
    Student B:
      Target role: Data Scientist, DSA: 15, Roadmap: 18%

    Both send exact prompt: 'What should I focus on right now?'
    Assert:
      A context != B context
      A context contains ONLY A data
      B context contains ONLY B data
    """
    captured_prompts_map = {}

    def mock_chat_with_groq(prompt, system_prompt=None):
        # Record system prompt by whichever user is in dependency
        user_id = current_test_user
        captured_prompts_map[user_id] = system_prompt
        return f"Advice for {user_id}"

    monkeypatch.setattr(router_module, "chat_with_groq", mock_chat_with_groq)

    # Context generator for each student
    async def dynamic_get_context(uid, force_refresh=False):
        if uid == STUDENT_A_ID:
            return (
                '<student_context>\n'
                '  <profile name="Alice" />\n'
                '  <career target_roles="Backend Engineer" />\n'
                '  <active_roadmap title="Backend Engineer Path" progress="72%" />\n'
                '  <coding_practice total_solved="120" />\n'
                '</student_context>'
            )
        elif uid == STUDENT_B_ID:
            return (
                '<student_context>\n'
                '  <profile name="Bob" />\n'
                '  <career target_roles="Data Scientist" />\n'
                '  <active_roadmap title="Data Science Path" progress="18%" />\n'
                '  <coding_practice total_solved="15" />\n'
                '</student_context>'
            )
        return ""

    monkeypatch.setattr(router_module, "get_formatted_student_context_for_mentor", dynamic_get_context)

    # 1. Execute Student A request
    current_test_user = STUDENT_A_ID
    app.dependency_overrides[get_session_or_user_id] = lambda: STUDENT_A_ID
    try:
        resp_a = client.post("/api/ai-mentor/chat", json={"prompt": "What should I focus on right now?"})
        assert resp_a.status_code == 200
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)

    # 2. Execute Student B request
    current_test_user = STUDENT_B_ID
    app.dependency_overrides[get_session_or_user_id] = lambda: STUDENT_B_ID
    try:
        resp_b = client.post("/api/ai-mentor/chat", json={"prompt": "What should I focus on right now?"})
        assert resp_b.status_code == 200
    finally:
        app.dependency_overrides.pop(get_session_or_user_id, None)

    # Assertions on prompt separation
    prompt_a = captured_prompts_map[STUDENT_A_ID]
    prompt_b = captured_prompts_map[STUDENT_B_ID]

    assert prompt_a != prompt_b, "CRITICAL: Student A and Student B received identical system prompt!"

    # Student A assertions
    assert "Backend Engineer" in prompt_a
    assert "72%" in prompt_a
    assert "120" in prompt_a
    assert "Data Scientist" not in prompt_a
    assert "18%" not in prompt_a
    assert "Bob" not in prompt_a

    # Student B assertions
    assert "Data Scientist" in prompt_b
    assert "18%" in prompt_b
    assert "15" in prompt_b
    assert "Backend Engineer" not in prompt_b
    assert "72%" not in prompt_b
    assert "Alice" not in prompt_b
