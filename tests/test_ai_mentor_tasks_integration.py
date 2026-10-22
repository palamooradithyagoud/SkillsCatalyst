"""
tests/test_ai_mentor_tasks_integration.py
Focused unit and integration tests for Phase 2A: AI Mentor + To-Do List Integration.
Covers:
1. Task Awareness data retrieval, prompt formatting, empty states, and tenant isolation.
2. Natural-language extraction, validation, and proposal parsing.
3. Cryptographic approval token security (tampering, expiration, cross-user, anti-replay, idempotency).
4. Batch task proposal validation and execution.
5. AI-assisted task management (update, complete, reopen, delete, and ambiguity handling).
"""

import time
import uuid
from unittest.mock import MagicMock, patch
from pydantic import ValidationError

from backend.models.ai_mentor_tasks import (
    MAX_BATCH_TASKS_LIMIT,
    TaskActionType,
    ProposedTaskItem,
    TaskActionProposal,
    ExecuteTaskActionRequest,
    CancelTaskActionRequest,
)
from backend.services.ai_mentor.approval_service import (
    generate_approval_token,
    verify_approval_token,
    acquire_action_reservation,
    release_action_reservation,
    is_action_consumed,
    mark_action_consumed,
    get_idempotent_result,
    store_idempotent_result,
    _CONSUMED_ACTIONS_MEM,
    _ACTION_RESERVATIONS_MEM,
    _IDEMPOTENCY_STORE_MEM,
)
from backend.services.ai_mentor.task_service import (
    fetch_authenticated_user_tasks,
    format_tasks_for_mentor_prompt,
    find_matching_tasks,
    extract_and_validate_proposals,
    execute_approved_task_action,
)


USER_A = "11111111-1111-4111-8111-111111111111"
USER_B = "22222222-2222-4222-8222-222222222222"


# ===========================================================================
# 1. TASK AWARENESS TESTS
# ===========================================================================

def test_format_tasks_for_mentor_prompt_empty():
    xml = format_tasks_for_mentor_prompt([], "Thursday, 22 October 2026, 17:00:00", "Asia/Kolkata")
    assert "<user_tasks_context>" in xml
    assert 'total="0"' in xml
    assert "No tasks currently exist" in xml
    assert "Asia/Kolkata" in xml


def test_format_tasks_for_mentor_prompt_populated():
    tasks = [
        {
            "id": "task-uuid-1",
            "title": "DSA Assignment on Graphs",
            "status": "todo",
            "priority": "high",
            "category": "Assignments",
            "due_at": "2026-10-23T18:00:00Z",
            "estimated_minutes": 120,
        },
        {
            "id": "task-uuid-2",
            "title": "System Design Video",
            "status": "completed",
            "priority": "medium",
            "category": "Study",
            "due_at": None,
            "estimated_minutes": 45,
        },
    ]
    xml = format_tasks_for_mentor_prompt(tasks, "Thursday, 22 October 2026, 17:00:00", "UTC")
    assert 'total="2"' in xml
    assert 'id="task-uuid-1"' in xml
    assert 'title="DSA Assignment on Graphs"' in xml
    assert 'priority="high"' in xml
    assert 'due="2026-10-23T18:00:00Z"' in xml
    assert 'id="task-uuid-2"' in xml
    assert 'status="completed"' in xml


def test_fetch_authenticated_user_tasks_db_failure_handled():
    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=None):
        tasks = fetch_authenticated_user_tasks(USER_A)
        assert tasks == []


# ===========================================================================
# 2. NATURAL-LANGUAGE EXTRACTION & AMBIGUITY RESOLUTION
# ===========================================================================

def test_extract_single_create_task_proposal():
    raw_llm = (
        "I've prepared a high-priority task for your DSA assignment.\n\n"
        "<task_proposals>\n"
        "{\n"
        '  "action_type": "create_task",\n'
        '  "title": "Complete Graph Theory Assignment",\n'
        '  "description": "Solve problem 1 to 5",\n'
        '  "category": "Assignments",\n'
        '  "priority": "high",\n'
        '  "due_at": "2026-10-23T18:00:00Z",\n'
        '  "estimated_minutes": 120\n'
        "}\n"
        "</task_proposals>\n\n"
        "Please review and confirm to save it to your To-Do List."
    )
    cleaned, proposals = extract_and_validate_proposals(raw_llm, USER_A, [])
    assert "<task_proposals>" not in cleaned
    assert "prepared a high-priority task" in cleaned
    assert len(proposals) == 1
    p = proposals[0]
    assert p.action_type == TaskActionType.CREATE_TASK
    assert p.proposed_data["title"] == "Complete Graph Theory Assignment"
    assert p.proposed_data["priority"] == "high"
    assert p.proposed_data["category"] == "Assignments"
    assert p.proposed_data["estimated_minutes"] == 120
    assert p.approval_token is not None
    assert p.status == "pending"


def test_extract_batch_create_proposals():
    raw_llm = (
        "Here are the 3 tasks you requested:\n\n"
        "<task_proposals>\n"
        "{\n"
        '  "action_type": "batch_create_tasks",\n'
        '  "tasks": [\n'
        '    {"title": "Read Chapter 4", "category": "Study", "priority": "medium", "estimated_minutes": 60},\n'
        '    {"title": "Implement Dijkstra", "category": "Projects", "priority": "high", "estimated_minutes": 90},\n'
        '    {"title": "Review PR #42", "category": "Other", "priority": "low", "estimated_minutes": 30}\n'
        "  ]\n"
        "}\n"
        "</task_proposals>"
    )
    cleaned, proposals = extract_and_validate_proposals(raw_llm, USER_A, [])
    assert len(proposals) == 1
    p = proposals[0]
    assert p.action_type == TaskActionType.BATCH_CREATE_TASKS
    assert len(p.proposed_tasks) == 3
    assert p.proposed_tasks[0].title == "Read Chapter 4"
    assert p.proposed_tasks[1].title == "Implement Dijkstra"
    assert p.proposed_tasks[2].title == "Review PR #42"


def test_ambiguous_task_resolution():
    existing_tasks = [
        {"id": "t-1", "title": "DSA Assignment 1", "status": "todo"},
        {"id": "t-2", "title": "DSA Assignment 2", "status": "todo"},
    ]
    # When user says "assignment", multiple tasks match
    matches = find_matching_tasks("assignment", existing_tasks)
    assert len(matches) == 2

    # Should not generate proposal for ambiguous match
    raw_llm = (
        "<task_proposals>\n"
        '{"action_type": "complete_task", "title": "assignment"}\n'
        "</task_proposals>"
    )
    cleaned, proposals = extract_and_validate_proposals(raw_llm, USER_A, existing_tasks)
    assert len(proposals) == 0


def test_unambiguous_task_match():
    existing_tasks = [
        {"id": "t-1", "title": "Operating Systems Quiz", "status": "todo"},
        {"id": "t-2", "title": "DSA Binary Trees", "status": "todo"},
    ]
    raw_llm = (
        "<task_proposals>\n"
        '{"action_type": "complete_task", "title": "Binary Trees"}\n'
        "</task_proposals>"
    )
    cleaned, proposals = extract_and_validate_proposals(raw_llm, USER_A, existing_tasks)
    assert len(proposals) == 1
    p = proposals[0]
    assert p.action_type == TaskActionType.COMPLETE_TASK
    assert p.task_id == "t-2"


# ===========================================================================
# 3. APPROVAL TOKEN SECURITY & MUTATION INTEGRITY
# ===========================================================================

def test_token_tampering_rejected():
    token, exp = generate_approval_token(USER_A, "action-1", "create_task")
    # Tamper with token signature
    parts = token.split(".")
    tampered = f"{parts[0]}.deadbeef"
    valid, err, payload = verify_approval_token(tampered, USER_A)
    assert valid is False
    assert "invalid signature" in err.lower()


def test_token_expiration_rejected():
    # Token with 0 second TTL
    token, exp = generate_approval_token(USER_A, "action-exp", "create_task", ttl_seconds=-10)
    valid, err, payload = verify_approval_token(token, USER_A)
    assert valid is False
    assert "expired" in err.lower()


def test_cross_user_approval_rejected():
    token, exp = generate_approval_token(USER_A, "action-cross", "create_task")
    # User B attempts to verify or execute User A's token
    valid, err, payload = verify_approval_token(token, USER_B)
    assert valid is False
    assert "unauthorized" in err.lower()


def test_anti_replay_protection():
    action_id = f"action-replay-{uuid.uuid4()}"
    assert is_action_consumed(action_id) is False
    mark_action_consumed(action_id)
    assert is_action_consumed(action_id) is True


def test_idempotency_store_and_retrieve():
    idemp_key = f"key-{uuid.uuid4()}"
    data = {"success": True, "created": "task-xyz"}
    assert get_idempotent_result(USER_A, idemp_key) is None
    store_idempotent_result(USER_A, idemp_key, data)
    retrieved = get_idempotent_result(USER_A, idemp_key)
    assert retrieved == data


# ===========================================================================
# 4. MUTATION EXECUTION TESTS
# ===========================================================================

def test_execute_create_task_success():
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)

    mock_sb = MagicMock()
    mock_insert_res = MagicMock()
    mock_insert_res.data = [{
        "id": "new-task-uuid",
        "title": "Approved Assignment",
        "category": "Assignments",
        "priority": "high",
        "status": "todo",
    }]
    mock_sb.from_().insert().execute.return_value = mock_insert_res

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
        edited_data={"title": "Approved Assignment", "priority": "high", "category": "Assignments"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.action_id == action_id
        assert len(res.created_tasks) == 1
        assert res.created_tasks[0]["id"] == "new-task-uuid"


def test_execute_update_task_success():
    action_id = str(uuid.uuid4())
    task_id = "task-to-update-1"
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.UPDATE_TASK.value, task_id=task_id)

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().eq().execute.return_value = MagicMock(data=[{"id": task_id, "user_id": USER_A}])
    mock_sb.from_().update().eq().eq().select().execute.return_value = MagicMock(data=[{
        "id": task_id,
        "title": "Updated Title",
        "priority": "high",
    }])

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
        edited_data={"title": "Updated Title", "priority": "high"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.updated_task["title"] == "Updated Title"


def test_execute_delete_task_success():
    action_id = str(uuid.uuid4())
    task_id = "task-to-delete-1"
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.DELETE_TASK.value, task_id=task_id)

    mock_sb = MagicMock()
    mock_sb.from_().select().eq().eq().execute.return_value = MagicMock(data=[{"title": "Obsolete Task"}])
    mock_sb.from_().delete().eq().eq().execute.return_value = MagicMock(data=[{"id": task_id}])

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.deleted_task_id == task_id


def test_execute_complete_task_success():
    action_id = str(uuid.uuid4())
    task_id = "task-to-complete-1"
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.COMPLETE_TASK.value, task_id=task_id)

    mock_sb = MagicMock()
    mock_sb.from_().update().eq().eq().select().execute.return_value = MagicMock(data=[{
        "id": task_id,
        "title": "Completed Task",
        "status": "completed",
    }])

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.updated_task["status"] == "completed"


# ===========================================================================
# 5. SECURITY AUDIT FIXES: REDIS PERSISTENCE & CONCURRENCY RESERVATION
# ===========================================================================

def test_redis_persistence_with_correct_api():
    """Verify that mark_action_consumed and store_idempotent_result use ttl_seconds (not ex!)."""
    action_id = f"test-redis-action-{uuid.uuid4()}"
    idemp_key = f"test-redis-idemp-{uuid.uuid4()}"
    test_result = {"success": True, "task_id": "redis-task-1"}

    with patch("backend.services.ai_mentor.approval_service.set_json") as mock_set_json:
        mock_set_json.return_value = True

        # Test mark_action_consumed uses ttl_seconds parameter
        mark_action_consumed(action_id, ttl_seconds=1800)
        assert mock_set_json.called
        args, kwargs = mock_set_json.call_args
        assert args[0] == f"mentor:action_consumed:{action_id}"
        assert "ttl_seconds" in kwargs
        assert kwargs["ttl_seconds"] == 1800
        assert "ex" not in kwargs  # Confirm incorrect ex keyword is completely absent!

        # Test store_idempotent_result uses ttl_seconds parameter
        store_idempotent_result(USER_A, idemp_key, test_result, ttl_seconds=2400)
        args, kwargs = mock_set_json.call_args
        assert args[0] == f"mentor:idemp:{USER_A}:{idemp_key}"
        assert kwargs["ttl_seconds"] == 2400
        assert "ex" not in kwargs


def test_redis_failure_and_fallback_behavior():
    """Verify that when Redis fails, operations degrade gracefully to thread-safe process memory."""
    action_id = f"test-fallback-action-{uuid.uuid4()}"
    idemp_key = f"test-fallback-idemp-{uuid.uuid4()}"

    # Mock Redis client throwing connection error
    mock_redis = MagicMock()
    mock_redis.set.side_effect = Exception("Redis connection refused")

    with patch("backend.services.ai_mentor.approval_service.get_redis_client", return_value=mock_redis):
        # 1. acquire_action_reservation should fall back to memory and still succeed
        resv_acquired = acquire_action_reservation(action_id, ttl_seconds=30)
        assert resv_acquired is True
        assert action_id in _ACTION_RESERVATIONS_MEM

        # 2. Second reservation attempt in fallback mode must be rejected
        second_resv = acquire_action_reservation(action_id, ttl_seconds=30)
        assert second_resv is False

        # 3. Clean up reservation
        release_action_reservation(action_id)
        assert action_id not in _ACTION_RESERVATIONS_MEM


def test_concurrent_duplicate_approval_requests():
    """Verify mutual exclusion: simultaneous requests for the same action cannot both acquire reservation."""
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)

    # Request 1 successfully acquires reservation
    assert acquire_action_reservation(action_id, ttl_seconds=60) is True

    # Request 2 attempting to execute the exact same action concurrently must be rejected
    mock_sb = MagicMock()
    req2 = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
        edited_data={"title": "Duplicate Task", "category": "Assignments"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        try:
            execute_approved_task_action(USER_A, req2)
            assert False, "Should have raised ValueError on concurrent duplicate execution!"
        except ValueError as e:
            assert "currently being executed" in str(e).lower()

    # Release for clean state
    release_action_reservation(action_id)


def test_repeated_requests_after_successful_execution():
    """Verify that a completed action returns cached idempotent response on repeated submission."""
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)
    shared_idemp_key = f"idemp-shared-{uuid.uuid4()}"

    mock_sb = MagicMock()
    mock_sb.from_().insert().execute.return_value = MagicMock(data=[{
        "id": "persisted-task-1",
        "title": "Idempotent Task",
        "category": "Assignments",
        "priority": "high",
        "status": "todo",
    }])

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=shared_idemp_key,
        edited_data={"title": "Idempotent Task", "category": "Assignments"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        # First execution -> succeeds and inserts to DB
        res1 = execute_approved_task_action(USER_A, req)
        assert res1.success is True
        assert res1.created_tasks[0]["id"] == "persisted-task-1"
        assert mock_sb.from_().insert().execute.call_count == 1

        # Second execution with exact same idempotency_key -> returns cached result without calling DB again
        res2 = execute_approved_task_action(USER_A, req)
        assert res2.success is True
        assert res2.created_tasks[0]["id"] == "persisted-task-1"
        assert mock_sb.from_().insert().execute.call_count == 1  # Call count remains 1!

        # Third execution with DIFFERENT idempotency_key -> rejected as consumed
        req_diff_key = ExecuteTaskActionRequest(
            action_id=action_id,
            approval_token=token,
            idempotency_key=f"idemp-diff-{uuid.uuid4()}",
            edited_data={"title": "Idempotent Task", "category": "Assignments"},
        )
        try:
            execute_approved_task_action(USER_A, req_diff_key)
            assert False, "Should have raised ValueError because action is consumed!"
        except ValueError as e:
            assert "already been executed" in str(e).lower()


def test_retry_behavior_after_failed_execution():
    """Verify that if a database mutation fails, the reservation is released and subsequent retries can proceed."""
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)
    idemp_key = f"idemp-retry-{uuid.uuid4()}"

    mock_sb_fail = MagicMock()
    mock_sb_fail.from_().insert().execute.side_effect = RuntimeError("Database timeout during insert")

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=idemp_key,
        edited_data={"title": "Retryable Task", "category": "Study"},
    )

    # 1. First attempt fails due to database error
    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb_fail):
        try:
            execute_approved_task_action(USER_A, req)
            assert False, "Should have raised RuntimeError on database failure!"
        except RuntimeError:
            pass

    # Verify action is NOT marked consumed and reservation was safely released
    assert is_action_consumed(action_id) is False
    assert action_id not in _ACTION_RESERVATIONS_MEM

    # 2. Database recovers -> retry succeeds!
    mock_sb_success = MagicMock()
    mock_sb_success.from_().insert().execute.return_value = MagicMock(data=[{
        "id": "retry-success-id",
        "title": "Retryable Task",
        "category": "Study",
        "priority": "medium",
        "status": "todo",
    }])

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb_success):
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.created_tasks[0]["id"] == "retry-success-id"
        assert is_action_consumed(action_id) is True


def test_multiple_workers_sharing_replay_protection_state():
    """Simulate Worker A executing an action and Worker B (with fresh local memory) checking consumed state via shared Redis."""
    action_id = f"worker-action-{uuid.uuid4()}"

    # Shared mock Redis store
    shared_redis_store = {}

    def fake_set_json(key, value, ttl_seconds=3600):
        shared_redis_store[key] = value
        return True

    def fake_get_json(key):
        return shared_redis_store.get(key)

    with patch("backend.services.ai_mentor.approval_service.set_json", side_effect=fake_set_json), \
         patch("backend.services.ai_mentor.approval_service.get_json", side_effect=fake_get_json):

        # Worker A marks action consumed
        mark_action_consumed(action_id)
        assert f"mentor:action_consumed:{action_id}" in shared_redis_store

        # Worker B starts with empty in-memory cache
        _CONSUMED_ACTIONS_MEM.pop(action_id, None)

        # Worker B calls is_action_consumed -> finds it via shared Redis!
        worker_b_check = is_action_consumed(action_id)
        assert worker_b_check is True


def test_expired_reservations():
    """Verify that action reservations expire safely after their TTL."""
    action_id = f"action-ttl-{uuid.uuid4()}"
    # Acquire with negative/expired TTL
    with patch("backend.services.ai_mentor.approval_service.get_redis_client", return_value=None):
        _ACTION_RESERVATIONS_MEM[action_id] = time.time() - 5.0  # Expired 5 seconds ago

        # New acquire request should succeed because previous reservation expired
        resv_acquired = acquire_action_reservation(action_id, ttl_seconds=30)
        assert resv_acquired is True

        release_action_reservation(action_id)


def test_oversized_batch_rejection_pydantic():
    """Verify request validation rejects batches with more than 20 tasks via Pydantic max_length constraint."""
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.BATCH_CREATE_TASKS.value)

    # 25 tasks (exceeding MAX_BATCH_TASKS_LIMIT = 20)
    oversized_tasks = [
        ProposedTaskItem(title=f"Task #{i}", category="Assignments", priority="medium", status="todo")
        for i in range(25)
    ]

    try:
        ExecuteTaskActionRequest(
            action_id=action_id,
            approval_token=token,
            idempotency_key=f"idemp-{uuid.uuid4()}",
            edited_tasks=oversized_tasks,
        )
        assert False, "Should have raised Pydantic ValidationError for > 20 tasks!"
    except ValidationError as e:
        assert "at most 20 items" in str(e).lower() or "too_long" in str(e).lower()


def test_oversized_batch_rejection_service():
    """Verify service-layer enforcement rejects batches exceeding MAX_BATCH_TASKS_LIMIT before database writes."""
    action_id = str(uuid.uuid4())
    token, exp = generate_approval_token(USER_A, action_id, TaskActionType.BATCH_CREATE_TASKS.value)

    # 21 tasks bypassing Pydantic or constructed directly
    oversized_tasks = [
        ProposedTaskItem(title=f"Task #{i}", category="Assignments", priority="medium", status="todo")
        for i in range(21)
    ]

    req = ExecuteTaskActionRequest.model_construct(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
        edited_tasks=oversized_tasks,
    )

    mock_sb = MagicMock()
    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        try:
            execute_approved_task_action(USER_A, req)
            assert False, "Service should have raised ValueError on oversized batch!"
        except ValueError as e:
            assert "exceeds maximum limit of 20 tasks" in str(e).lower()
        # Verify no database insert was attempted
        assert mock_sb.from_().insert().execute.called is False


# ===========================================================================
# 6. PRODUCTION HARDENING: FAIL-CLOSED, DURABLE IDEMPOTENCY & UNCERTAIN OUTCOME TESTS
# ===========================================================================

import pytest
from fastapi import HTTPException
from backend.routers.ai_mentor import execute_task_action_endpoint, cancel_task_action_endpoint
from backend.services.ai_mentor.task_service import fetch_tasks_by_action_id, fetch_durable_action_record


@pytest.mark.anyio
async def test_production_redis_unavailable_returns_503_execute():
    """Verify that in production (IS_PRODUCTION=True), missing or failing Redis returns HTTP 503 Service Unavailable."""
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=f"idemp-{uuid.uuid4()}",
        edited_data={"title": "Prod Task", "category": "Study"},
    )

    with patch("backend.services.ai_mentor.approval_service.IS_PRODUCTION", True), \
         patch("backend.services.ai_mentor.approval_service.get_redis_client", return_value=None):
        try:
            await execute_task_action_endpoint(req=req, current_user_id=USER_A)
            assert False, "Should have raised HTTPException 503 in production without Redis!"
        except HTTPException as he:
            assert he.status_code == 503
            assert he.detail.get("code") == "SERVICE_UNAVAILABLE"
            assert "unavailable" in he.detail.get("message", "").lower()


@pytest.mark.anyio
async def test_production_redis_unavailable_returns_503_cancel():
    """Verify that in production (IS_PRODUCTION=True), canceling an action without Redis returns HTTP 503."""
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)

    req = CancelTaskActionRequest(
        action_id=action_id,
        approval_token=token,
    )

    with patch("backend.services.ai_mentor.approval_service.IS_PRODUCTION", True), \
         patch("backend.services.ai_mentor.approval_service.get_redis_client", return_value=None):
        try:
            await cancel_task_action_endpoint(req=req, current_user_id=USER_A)
            assert False, "Should have raised HTTPException 503 on cancellation without Redis in prod!"
        except HTTPException as he:
            assert he.status_code == 503
            assert he.detail.get("code") == "SERVICE_UNAVAILABLE"


def test_successful_single_task_creation_followed_by_retry():
    """Verify successful single-task creation followed by retry returns existing result without duplicate insertion."""
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)
    idemp_key = f"idemp-single-retry-{uuid.uuid4()}"

    insert_count = 0
    persisted_tasks = []

    def fake_insert(rows):
        nonlocal insert_count
        insert_count += 1
        res_rows = []
        for r in rows:
            res_rows.append({
                "id": f"task-uuid-{len(persisted_tasks) + 1}",
                "user_id": r["user_id"],
                "title": r["title"],
                "category": r["category"],
                "priority": r["priority"],
                "status": r["status"],
                "action_id": r.get("action_id"),
                "batch_index": r.get("batch_index", 0),
            })
        persisted_tasks.extend(res_rows)
        qb = MagicMock()
        qb.execute.return_value = MagicMock(data=res_rows)
        return qb

    def fake_from(table_name):
        mock_table = MagicMock()
        if table_name == "tasks":
            mock_table.insert.side_effect = fake_insert
            def fake_select():
                qb = MagicMock()
                qb.data = [t for t in persisted_tasks if t.get("action_id") == action_id]
                return qb
            mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.side_effect = fake_select
        elif table_name == "mentor_task_actions":
            mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{}])
            mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        return mock_table

    mock_sb = MagicMock()
    mock_sb.from_.side_effect = fake_from

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=idemp_key,
        edited_data={"title": "Single Task Title", "category": "Study", "priority": "high"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        # 1. First execution
        res1 = execute_approved_task_action(USER_A, req)
        assert res1.success is True
        assert res1.action_id == action_id
        assert len(res1.created_tasks) == 1
        assert insert_count == 1
        created_id = res1.created_tasks[0]["id"]

        # 2. Retry with same request (cache hit)
        res2 = execute_approved_task_action(USER_A, req)
        assert res2.success is True
        assert res2.created_tasks[0]["id"] == created_id
        # Crucial: No second insert was called!
        assert insert_count == 1


def test_successful_batch_creation_followed_by_retry():
    """Verify successful batch task creation followed by retry returns existing batch without duplicate insertion."""
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.BATCH_CREATE_TASKS.value)
    idemp_key = f"idemp-batch-retry-{uuid.uuid4()}"

    insert_count = 0
    persisted_tasks = []

    def fake_insert(rows):
        nonlocal insert_count
        insert_count += 1
        res_rows = []
        for i, r in enumerate(rows):
            res_rows.append({
                "id": f"batch-uuid-{i + 1}",
                "user_id": r["user_id"],
                "title": r["title"],
                "category": r["category"],
                "priority": r["priority"],
                "status": r["status"],
                "action_id": r.get("action_id"),
                "batch_index": r.get("batch_index", i),
            })
        persisted_tasks.extend(res_rows)
        qb = MagicMock()
        qb.execute.return_value = MagicMock(data=res_rows)
        return qb

    def fake_from(table_name):
        mock_table = MagicMock()
        if table_name == "tasks":
            mock_table.insert.side_effect = fake_insert
            def fake_select():
                qb = MagicMock()
                qb.data = [t for t in persisted_tasks if t.get("action_id") == action_id]
                return qb
            mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.side_effect = fake_select
        elif table_name == "mentor_task_actions":
            mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{}])
            mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        return mock_table

    mock_sb = MagicMock()
    mock_sb.from_.side_effect = fake_from

    tasks_to_create = [
        ProposedTaskItem(title=f"Batch Item {i}", category="Assignments", priority="medium", status="todo")
        for i in range(3)
    ]

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=idemp_key,
        edited_tasks=tasks_to_create,
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        # 1. First execution
        res1 = execute_approved_task_action(USER_A, req)
        assert res1.success is True
        assert len(res1.created_tasks) == 3
        assert insert_count == 1

        # 2. Retry execution
        res2 = execute_approved_task_action(USER_A, req)
        assert res2.success is True
        assert len(res2.created_tasks) == 3
        assert res2.created_tasks[0]["id"] == "batch-uuid-1"
        assert insert_count == 1


def test_simulated_crash_after_db_commit_before_redis_records_success():
    """
    CRITICAL HARDENING TEST:
    Simulate worker crash after PostgreSQL commits tasks, but BEFORE Redis records consumption.
    Verifies that on retry:
    - Backend detects committed tasks in PostgreSQL via action_id.
    - Does NOT insert duplicates.
    - Returns existing committed tasks.
    - Updates Redis to prevent future re-execution.
    """
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)
    idemp_key = f"idemp-crash-{uuid.uuid4()}"

    # Pre-existing task committed in PostgreSQL prior to worker crash
    committed_task = {
        "id": "pre-committed-uuid-42",
        "user_id": USER_A,
        "title": "Crash Recovery Task",
        "category": "Career",
        "priority": "high",
        "status": "todo",
        "action_id": action_id,
        "batch_index": 0,
    }

    insert_called = False

    def fake_from(table_name):
        mock_table = MagicMock()
        if table_name == "tasks":
            def fake_insert(rows):
                nonlocal insert_called
                insert_called = True
                qb = MagicMock()
                qb.execute.return_value = MagicMock(data=rows)
                return qb
            mock_table.insert.side_effect = fake_insert

            def fake_execute():
                m = MagicMock()
                m.data = [committed_task]
                return m
            mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.side_effect = fake_execute
        elif table_name == "mentor_task_actions":
            mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{}])
            mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        return mock_table

    mock_sb = MagicMock()
    mock_sb.from_.side_effect = fake_from

    # Simulate: Redis and in-memory caches have NO RECORD of consumption or idempotency (wiped by crash)
    _CONSUMED_ACTIONS_MEM.pop(action_id, None)
    _ACTION_RESERVATIONS_MEM.pop(action_id, None)
    _IDEMPOTENCY_STORE_MEM.pop(f"{USER_A}:{idemp_key}", None)

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=idemp_key,
        edited_data={"title": "Crash Recovery Task", "category": "Career", "priority": "high"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb), \
         patch("backend.services.ai_mentor.approval_service.get_json", return_value=None):

        # Execute retry
        res = execute_approved_task_action(USER_A, req)

        # 1. Must return success
        assert res.success is True
        # 2. Must return the pre-committed task from PostgreSQL
        assert res.created_tasks[0]["id"] == "pre-committed-uuid-42"
        # 3. MUST NOT attempt another database insert (NO DUPLICATES!)
        assert insert_called is False
        # 4. Must have marked action consumed to protect against future attempts
        assert is_action_consumed(action_id) is True


def test_recovery_from_uncertain_operation_outcome():
    """
    Verify that if an unhandled network error occurs after DB commit:
    - Exception handler discovers DB commit was successful.
    - Preserves reservation / marks consumed to prevent re-execution.
    - Client retry recovers the committed task rather than failing or duplicating.
    """
    action_id = str(uuid.uuid4())
    token, _ = generate_approval_token(USER_A, action_id, TaskActionType.CREATE_TASK.value)
    idemp_key = f"idemp-uncertain-{uuid.uuid4()}"

    committed_tasks_db = []
    insert_attempts = 0

    def fake_from(table_name):
        mock_table = MagicMock()
        if table_name == "tasks":
            def fake_insert(rows):
                nonlocal insert_attempts
                insert_attempts += 1
                # PostgreSQL transaction commits tasks to storage:
                committed_tasks_db.extend([
                    {
                        "id": "uncertain-task-uuid-99",
                        "user_id": USER_A,
                        "title": "Uncertain Task",
                        "category": "Study",
                        "priority": "medium",
                        "status": "todo",
                        "action_id": action_id,
                        "batch_index": 0,
                    }
                ])
                # BUT right after commit, network drops before client receives HTTP 200:
                raise RuntimeError("PostgREST network connection reset by peer after commit")
            mock_table.insert.side_effect = fake_insert

            # fetch_tasks_by_action_id finds the committed task
            def fake_select_tasks():
                m = MagicMock()
                m.data = [t for t in committed_tasks_db if t.get("action_id") == action_id]
                return m
            mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.side_effect = fake_select_tasks
        elif table_name == "mentor_task_actions":
            mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{}])
            mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        return mock_table

    mock_sb = MagicMock()
    mock_sb.from_.side_effect = fake_from

    req = ExecuteTaskActionRequest(
        action_id=action_id,
        approval_token=token,
        idempotency_key=idemp_key,
        edited_data={"title": "Uncertain Task", "category": "Study"},
    )

    with patch("backend.services.ai_mentor.task_service.get_supabase", return_value=mock_sb):
        # 1. First execution experiences post-commit network failure
        try:
            execute_approved_task_action(USER_A, req)
            assert False, "Should have re-raised the exception after uncertain outcome check"
        except RuntimeError as e:
            assert "reset by peer" in str(e)

        # 2. Action MUST be marked consumed because tasks exist in PostgreSQL!
        assert is_action_consumed(action_id) is True

        # 3. Client retries -> Recovers the committed task from PostgreSQL!
        res = execute_approved_task_action(USER_A, req)
        assert res.success is True
        assert res.created_tasks[0]["id"] == "uncertain-task-uuid-99"
        # No extra insert was attempted on retry
        assert insert_attempts == 1


def test_shared_upstash_redis_live_locking():
    """
    LIVE SHARED INFRASTRUCTURE TEST:
    Verifies atomic distributed locking directly against live Upstash Redis.
    Runs when REDIS_URL is configured.
    """
    from backend.services.cache_service import get_redis_client
    r = get_redis_client()
    if not r:
        pytest.skip("Shared Redis infrastructure is not configured or reachable")

    action_id = f"live-test-{uuid.uuid4()}"
    key = f"mentor:action_resv:{action_id}"

    try:
        # 1. First acquire succeeds
        res1 = r.set(key, "reserved", nx=True, ex=10)
        assert res1 is True

        # 2. Simultaneous acquire fails (atomic mutual exclusion)
        res2 = r.set(key, "reserved", nx=True, ex=10)
        assert res2 is None or res2 is False

        # 3. Delete key (release)
        r.delete(key)

        # 4. Acquire succeeds again after release
        res3 = r.set(key, "reserved", nx=True, ex=10)
        assert res3 is True
    finally:
        r.delete(key)
