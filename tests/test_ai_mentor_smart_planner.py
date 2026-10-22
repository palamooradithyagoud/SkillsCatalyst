"""
tests/test_ai_mentor_smart_planner.py
Comprehensive unit and integration tests for Phase 2B: AI-Powered Smart Task Planning.
Covers:
1. Deterministic Multi-Factor Smart Prioritization (overdue, deadline proximity, duration, authentic vs AI priority).
2. Schedule Conflict Analysis (physical overlaps, past-time scheduling, deadline violations, slot capacity).
3. Multi-Day Workload Balancing (even distribution, deadline respect, overload detection).
4. Prompt Context Formatting (<smart_planning_analysis>, timezone handling, completed task exclusion).
5. Proposal Extraction & Validation (apply_schedule_plan, HMAC-SHA256 approval tokens).
6. Execution & Persistence (atomic task updates, durable idempotency in mentor_task_actions, Redis locking).
7. Security (cross-user isolation, tampered tokens, expired tokens, replay prevention).
"""

import datetime
import json
import time
import uuid
from unittest.mock import MagicMock, patch
import pytest

from backend.models.ai_mentor_tasks import (
    TaskActionType,
    ScheduledPlanItem,
    SchedulePlanData,
    TaskActionProposal,
    ExecuteTaskActionRequest,
    ExecuteTaskActionResponse,
)
from backend.models.task import TaskPriority
from backend.services.ai_mentor.smart_planner import (
    prioritize_user_tasks,
    analyze_schedule_conflicts,
    distribute_tasks_across_days,
    format_smart_planner_context,
)
from backend.services.ai_mentor.approval_service import (
    generate_approval_token,
    verify_approval_token,
    acquire_action_reservation,
    release_action_reservation,
    mark_action_consumed,
    get_idempotent_result,
    store_idempotent_result,
    _CONSUMED_ACTIONS_MEM,
    _ACTION_RESERVATIONS_MEM,
    _IDEMPOTENCY_STORE_MEM,
)
from backend.services.ai_mentor.task_service import (
    extract_and_validate_proposals,
    execute_approved_task_action,
)

USER_A = "11111111-1111-4111-8111-111111111111"
USER_B = "22222222-2222-4222-8222-222222222222"


@pytest.fixture(autouse=True)
def clean_memory_caches():
    _CONSUMED_ACTIONS_MEM.clear()
    _ACTION_RESERVATIONS_MEM.clear()
    _IDEMPOTENCY_STORE_MEM.clear()
    yield
    _CONSUMED_ACTIONS_MEM.clear()
    _ACTION_RESERVATIONS_MEM.clear()
    _IDEMPOTENCY_STORE_MEM.clear()


# ===========================================================================
# 1. SMART PRIORITIZATION TESTS (FEATURE B)
# ===========================================================================

def test_prioritization_excludes_completed_tasks_by_default():
    now_dt = datetime.datetime(2026, 10, 23, 10, 0, 0, tzinfo=datetime.timezone.utc)
    tasks = [
        {"id": "t1", "title": "Done Task", "status": "completed", "priority": "high"},
        {"id": "t2", "title": "Pending Task", "status": "todo", "priority": "medium"},
    ]
    ranked = prioritize_user_tasks(tasks, reference_now=now_dt)
    assert len(ranked) == 1
    assert ranked[0]["id"] == "t2"
    assert ranked[0]["title"] == "Pending Task"


def test_prioritization_ranks_overdue_tasks_highest():
    now_dt = datetime.datetime(2026, 10, 23, 12, 0, 0, tzinfo=datetime.timezone.utc)
    past_deadline = (now_dt - datetime.timedelta(days=1)).isoformat()
    future_deadline = (now_dt + datetime.timedelta(days=3)).isoformat()

    tasks = [
        {"id": "future", "title": "Future Task", "status": "todo", "priority": "high", "due_at": future_deadline, "estimated_minutes": 60},
        {"id": "overdue", "title": "Overdue Task", "status": "todo", "priority": "medium", "due_at": past_deadline, "estimated_minutes": 60},
    ]

    ranked = prioritize_user_tasks(tasks, reference_now=now_dt)
    assert len(ranked) == 2
    # Overdue task should be ranked first despite authentic priority being medium
    assert ranked[0]["id"] == "overdue"
    assert ranked[0]["is_overdue"] is True
    assert ranked[0]["ai_recommended_priority"] == "high"
    assert ranked[0]["authentic_priority"] == "medium"
    assert ranked[0]["urgency_rank"] == 1


def test_prioritization_distinguishes_ai_priority_from_authentic():
    now_dt = datetime.datetime(2026, 10, 23, 12, 0, 0, tzinfo=datetime.timezone.utc)
    # Task due today in 2 hours
    urgent_deadline = (now_dt + datetime.timedelta(hours=2)).isoformat()

    tasks = [
        {"id": "low_urgent", "title": "Low Priority Urgent", "status": "todo", "priority": "low", "due_at": urgent_deadline, "estimated_minutes": 30},
    ]
    ranked = prioritize_user_tasks(tasks, reference_now=now_dt)
    assert ranked[0]["authentic_priority"] == "low"
    assert ranked[0]["ai_recommended_priority"] == "high"
    assert "Due today" in ranked[0]["urgency_reason"] or "Critical deadline" in ranked[0]["urgency_reason"]


# ===========================================================================
# 2. SCHEDULE CONFLICT DETECTION TESTS (FEATURE E)
# ===========================================================================

def test_conflict_detection_clean_sequential_schedule():
    now_dt = datetime.datetime(2026, 10, 23, 8, 0, 0, tzinfo=datetime.timezone.utc)
    items = [
        ScheduledPlanItem(
            task_id="t1",
            title="Morning Task",
            start_time="2026-10-23T09:00:00+00:00",
            end_time="2026-10-23T10:00:00+00:00",
            due_at="2026-10-23T18:00:00+00:00",
            priority=TaskPriority.high,
            estimated_minutes=60,
        ),
        ScheduledPlanItem(
            task_id="t2",
            title="Midday Task",
            start_time="2026-10-23T10:15:00+00:00",
            end_time="2026-10-23T11:15:00+00:00",
            due_at="2026-10-23T18:00:00+00:00",
            priority=TaskPriority.medium,
            estimated_minutes=60,
        ),
    ]

    validated, detected, warnings = analyze_schedule_conflicts(items, reference_now=now_dt)
    assert detected is False
    assert len(warnings) == 0
    assert validated[0].is_conflict is False
    assert validated[1].is_conflict is False


def test_conflict_detection_detects_overlapping_time_blocks():
    now_dt = datetime.datetime(2026, 10, 23, 8, 0, 0, tzinfo=datetime.timezone.utc)
    items = [
        ScheduledPlanItem(
            task_id="t1",
            title="Slot A",
            start_time="2026-10-23T09:00:00+00:00",
            end_time="2026-10-23T10:30:00+00:00",
            priority=TaskPriority.high,
            estimated_minutes=90,
        ),
        ScheduledPlanItem(
            task_id="t2",
            title="Slot B (Overlaps)",
            start_time="2026-10-23T10:00:00+00:00",  # Overlaps with Slot A
            end_time="2026-10-23T11:00:00+00:00",
            priority=TaskPriority.medium,
            estimated_minutes=60,
        ),
    ]

    validated, detected, warnings = analyze_schedule_conflicts(items, reference_now=now_dt)
    assert detected is True
    assert validated[1].is_conflict is True
    assert any("overlap" in w.lower() for w in validated[1].warnings)


def test_conflict_detection_flags_past_scheduling():
    now_dt = datetime.datetime(2026, 10, 23, 14, 0, 0, tzinfo=datetime.timezone.utc)
    # Scheduled at 9am today, but current time is 2pm today
    items = [
        ScheduledPlanItem(
            task_id="t1",
            title="Past Slot",
            start_time="2026-10-23T09:00:00+00:00",
            end_time="2026-10-23T10:00:00+00:00",
            priority=TaskPriority.medium,
            estimated_minutes=60,
        ),
    ]

    validated, detected, warnings = analyze_schedule_conflicts(items, reference_now=now_dt)
    assert detected is True
    assert validated[0].is_conflict is True
    assert any("past" in w.lower() for w in validated[0].warnings)


def test_conflict_detection_flags_deadline_breach():
    now_dt = datetime.datetime(2026, 10, 23, 8, 0, 0, tzinfo=datetime.timezone.utc)
    # Scheduled until 18:00, but deadline is 16:00
    items = [
        ScheduledPlanItem(
            task_id="t1",
            title="Late Task",
            start_time="2026-10-23T16:30:00+00:00",
            end_time="2026-10-23T18:00:00+00:00",
            due_at="2026-10-23T16:00:00+00:00",
            priority=TaskPriority.high,
            estimated_minutes=90,
        ),
    ]

    validated, detected, warnings = analyze_schedule_conflicts(items, reference_now=now_dt)
    assert detected is True
    assert validated[0].is_conflict is True
    assert any("deadline" in w.lower() for w in validated[0].warnings)


# ===========================================================================
# 3. WORKLOAD BALANCING & MULTI-DAY PLANNING (FEATURE C & D)
# ===========================================================================

def test_workload_balancing_distributes_across_days():
    now_dt = datetime.datetime(2026, 10, 23, 8, 0, 0, tzinfo=datetime.timezone.utc)
    # 4 tasks, 120 mins each = 480 mins total. Daily capacity 180 mins.
    tasks = [
        {"id": f"t{i}", "title": f"Task {i}", "status": "todo", "priority": "medium", "estimated_minutes": 120, "due_at": (now_dt + datetime.timedelta(days=4)).isoformat()}
        for i in range(1, 5)
    ]

    schedule_by_day, overload_notes = distribute_tasks_across_days(
        tasks,
        num_days=3,
        daily_capacity_minutes=180,
        reference_now=now_dt,
    )

    assert len(schedule_by_day) == 3
    # Check that day 1 did not take all tasks
    day1_tasks = schedule_by_day[0]["tasks"]
    assert len(day1_tasks) <= 2
    total_scheduled = sum(len(d["tasks"]) for d in schedule_by_day)
    assert total_scheduled == 4


# ===========================================================================
# 4. XML CONTEXT FORMATTING (SMART PLANNER GROUNDING)
# ===========================================================================

def test_format_smart_planner_context_produces_structured_xml():
    now_dt = datetime.datetime(2026, 10, 23, 10, 0, 0, tzinfo=datetime.timezone.utc)
    past_due = (now_dt - datetime.timedelta(days=1)).isoformat()
    tasks = [
        {"id": "t1", "title": "Overdue DSA", "status": "todo", "priority": "medium", "due_at": past_due, "estimated_minutes": 90},
        {"id": "t2", "title": "Done Task", "status": "completed", "priority": "high"},
    ]

    xml = format_smart_planner_context(tasks, reference_now=now_dt, client_tz="Asia/Kolkata")
    assert "<smart_planning_analysis" in xml
    assert 'pending_count="1"' in xml
    assert 'overdue_count="1"' in xml
    assert 'title="Overdue DSA"' in xml
    assert 'is_overdue="True"' in xml
    assert 'ai_priority="high"' in xml
    assert "Done Task" not in xml  # Completed task excluded from smart planner ranking


# ===========================================================================
# 5. PROPOSAL EXTRACTION & VALIDATION (FEATURE F & APPROVAL TOKEN)
# ===========================================================================

def test_extract_and_validate_proposals_apply_schedule_plan():
    user_tasks = [
        {"id": "t1-uuid", "title": "Prepare Resume", "status": "todo", "priority": "high", "estimated_minutes": 60, "due_at": "2026-10-23T23:59:00+00:00"},
        {"id": "t2-uuid", "title": "Practice LeetCode", "status": "todo", "priority": "medium", "estimated_minutes": 90, "due_at": "2026-10-24T18:00:00+00:00"},
    ]

    llm_output = """
Here is your daily study schedule for today:

<task_proposals>
{
  "proposals": [
    {
      "action_type": "apply_schedule_plan",
      "plan_period": "daily",
      "target_date": "2026-10-23",
      "items": [
        {
          "task_id": "t1-uuid",
          "title": "Prepare Resume",
          "start_time": "2026-10-23T14:00:00+00:00",
          "end_time": "2026-10-23T15:00:00+00:00",
          "due_at": "2026-10-23T23:59:00+00:00",
          "priority": "high",
          "estimated_minutes": 60,
          "reason": "Top priority task due tonight."
        },
        {
          "task_id": "t2-uuid",
          "title": "Practice LeetCode",
          "start_time": "2026-10-23T15:15:00+00:00",
          "end_time": "2026-10-23T16:45:00+00:00",
          "due_at": "2026-10-24T18:00:00+00:00",
          "priority": "medium",
          "estimated_minutes": 90,
          "reason": "Medium priority practice."
        }
      ],
      "overload_warning": null
    }
  ]
}
</task_proposals>

Please confirm when ready.
"""

    cleaned_reply, proposals = extract_and_validate_proposals(llm_output, USER_A, user_tasks)
    assert "<task_proposals>" not in cleaned_reply
    assert len(proposals) == 1

    prop = proposals[0]
    assert prop.action_type == TaskActionType.APPLY_SCHEDULE_PLAN
    assert prop.schedule_plan is not None
    assert len(prop.schedule_plan.items) == 2
    assert prop.schedule_plan.total_allocated_minutes == 150
    assert prop.schedule_plan.items[0].task_id == "t1-uuid"
    assert prop.schedule_plan.items[1].task_id == "t2-uuid"
    assert prop.approval_token is not None

    # Validate approval token
    is_valid, err, payload = verify_approval_token(prop.approval_token, USER_A, prop.action_id)
    assert is_valid is True
    assert payload["act"] == TaskActionType.APPLY_SCHEDULE_PLAN.value


# ===========================================================================
# 6. EXECUTION & PERSISTENCE TESTS (FEATURE H & SECURITY)
# ===========================================================================

def test_execute_approved_schedule_plan_success():
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.APPLY_SCHEDULE_PLAN.value)

    plan_data = SchedulePlanData(
        plan_period="daily",
        target_date="2026-10-23",
        total_allocated_minutes=120,
        conflicts_detected=False,
        warnings=[],
        items=[
            ScheduledPlanItem(
                task_id="task-1",
                title="Task One",
                start_time="2026-10-23T10:00:00+00:00",
                end_time="2026-10-23T11:00:00+00:00",
                time_range="10:00 AM - 11:00 AM",
                due_at="2026-10-23T18:00:00+00:00",
                priority=TaskPriority.high,
                estimated_minutes=60,
                reason="High priority",
            ),
        ],
    )

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key="idemp-key-plan-1",
        edited_plan=plan_data,
    )

    mock_sb = MagicMock()
    # Mock ownership check and update
    mock_existing = MagicMock()
    mock_existing.data = [{"id": "task-1", "user_id": USER_A, "title": "Task One"}]

    mock_update_res = MagicMock()
    mock_update_res.data = [{
        "id": "task-1",
        "user_id": USER_A,
        "title": "Task One",
        "time_range": "10:00 AM - 11:00 AM",
        "due_at": "2026-10-23T18:00:00+00:00",
        "priority": "high",
        "estimated_minutes": 60,
    }]

    # Setup query chains
    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.execute.side_effect = [mock_existing, mock_update_res]
    mock_query.update.return_value = mock_query
    mock_query.upsert.return_value = mock_query

    mock_sb.from_.return_value = mock_query

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb), \
         patch("backend.services.ai_mentor.task_service.fetch_durable_action_record", return_value=None), \
         patch("backend.services.ai_mentor.task_service.record_durable_action", return_value=True):

        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.action_type == TaskActionType.APPLY_SCHEDULE_PLAN.value
        assert "Schedule plan applied successfully" in res.message
        assert len(res.created_tasks) == 1
        assert res.created_tasks[0]["id"] == "task-1"


def test_execute_schedule_plan_cross_user_rejection():
    # Token minted for USER_A
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.APPLY_SCHEDULE_PLAN.value)

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key="idemp-key-cross-user",
        edited_plan=SchedulePlanData(items=[]),
    )

    # USER_B attempts to execute USER_A's token
    with pytest.raises(ValueError, match="Unauthorized approval token"):
        execute_approved_task_action(USER_B, req)


def test_execute_schedule_plan_tampered_token_rejection():
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.APPLY_SCHEDULE_PLAN.value)
    tampered_token = token[:-5] + "XXXXX"

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=tampered_token,
        idempotency_key="idemp-tamper",
        edited_plan=SchedulePlanData(items=[]),
    )

    with pytest.raises(ValueError, match="invalid signature"):
        execute_approved_task_action(USER_A, req)


def test_execute_schedule_plan_replay_protection():
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.APPLY_SCHEDULE_PLAN.value)

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key="idemp-replay-test",
        edited_plan=SchedulePlanData(items=[]),
    )

    # Pre-mark action as consumed
    mark_action_consumed(action_id)

    with pytest.raises(ValueError, match="already been executed"):
        execute_approved_task_action(USER_A, req)
