"""
backend/services/ai_mentor/task_service.py
Core Task Awareness, Natural Language Proposal Parsing, and Mutation Engine for AI Mentor.
Enforces:
- Authoritative database queries scoped strictly to authenticated user_id.
- Entity identification and ambiguity resolution.
- Cryptographic approval token generation.
- Re-validation of user-edited proposal fields.
- Atomic / accurate execution and anti-replay protection.
"""

import datetime
import json
import logging
import re
import uuid
from typing import Optional, List, Dict, Any, Tuple

from backend.models.ai_mentor_tasks import (
    MAX_BATCH_TASKS_LIMIT,
    TaskActionType,
    ProposedTaskItem,
    TaskActionProposal,
    ExecuteTaskActionRequest,
    ExecuteTaskActionResponse,
)
from backend.models.task import (
    TaskCategory,
    TaskPriority,
    TaskStatus,
    CreateTaskRequest,
    UpdateTaskRequest,
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
)
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Task Retrieval & Awareness
# ---------------------------------------------------------------------------

def fetch_authenticated_user_tasks(
    user_id: str,
    status_filter: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """
    Retrieves authentic tasks owned by the authenticated student from Supabase.
    Strictly isolated by user_id = auth.uid().
    """
    sb = get_supabase()
    if not sb:
        logger.warning(f"Supabase client unavailable for task retrieval for user {user_id}")
        return []

    try:
        query = (
            sb.from_("tasks")
            .select("id, user_id, title, description, status, priority, category, due_at, estimated_minutes, completed_at, created_at")
            .eq("user_id", user_id)
        )
        if status_filter and status_filter != "all":
            query = query.eq("status", status_filter)

        query = query.order("created_at", desc=True).limit(limit)
        res = query.execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching user tasks for AI Mentor awareness: {e}", exc_info=True)
        return []


def format_tasks_for_mentor_prompt(
    tasks: List[Dict[str, Any]],
    current_time_str: str,
    timezone_name: str = "UTC",
) -> str:
    """
    Formats the student's authentic tasks into a secure, minimal XML context block.
    Injected into the AI Mentor prompt so it can answer questions with 100% factual accuracy.
    """
    lines = [
        "<user_tasks_context>",
        f"  <!-- CURRENT REFERENCE TIME: {current_time_str} ({timezone_name}) -->",
        f"  <!-- The tasks below are the student's REAL authoritative tasks from their To-Do List. -->",
        f"  <!-- Answer questions using these exact records. Distinguish existing tasks from proposed tasks. -->",
    ]

    if not tasks:
        lines.append("  <tasks total=\"0\" status=\"empty\">No tasks currently exist in the student's To-Do List.</tasks>")
    else:
        lines.append(f"  <tasks total=\"{len(tasks)}\">")
        for t in tasks:
            tid = t.get("id")
            title = str(t.get("title") or "").replace('"', '&quot;')
            st = t.get("status") or "todo"
            pri = t.get("priority") or "medium"
            cat = t.get("category") or "Other"
            due = t.get("due_at") or "none"
            mins = t.get("estimated_minutes") or "none"

            lines.append(
                f'    <task id="{tid}" title="{title}" status="{st}" priority="{pri}" category="{cat}" due="{due}" est_mins="{mins}" />'
            )
        lines.append("  </tasks>")

    lines.append("</user_tasks_context>")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Task Management & Ambiguity Resolution
# ---------------------------------------------------------------------------

def find_matching_tasks(
    task_title_or_id: str,
    user_tasks: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Finds existing tasks matching an identifier or title query.
    Returns list of matching tasks.
    """
    query = (task_title_or_id or "").strip().lower()
    if not query:
        return []

    # 1. Exact ID match
    id_matches = [t for t in user_tasks if str(t.get("id", "")).lower() == query]
    if id_matches:
        return id_matches

    # 2. Exact Title match
    exact_title_matches = [t for t in user_tasks if (t.get("title") or "").strip().lower() == query]
    if exact_title_matches:
        return exact_title_matches

    # 3. Substring match
    sub_matches = [t for t in user_tasks if query in (t.get("title") or "").strip().lower()]
    return sub_matches


# ---------------------------------------------------------------------------
# Model Output Parser & Proposal Generator
# ---------------------------------------------------------------------------

_PROPOSAL_BLOCK_PATTERN = re.compile(
    r"<task_proposals>([\s\S]*?)</task_proposals>",
    re.IGNORECASE,
)

_MARKDOWN_JSON_PATTERN = re.compile(
    r"```json\s*(\{[\s\S]*?\"(?:proposals|action_type)\"[\s\S]*?\})\s*```",
    re.IGNORECASE,
)


def extract_and_validate_proposals(
    raw_response: str,
    user_id: str,
    user_tasks: List[Dict[str, Any]],
) -> Tuple[str, List[TaskActionProposal]]:
    """
    Extracts proposed task actions from LLM output, validates them strictly,
    generates cryptographic approval tokens, and returns:
    (cleaned_conversational_reply, list_of_validated_proposals).
    """
    if not raw_response or not isinstance(raw_response, str):
        return raw_response, []

    proposals: List[TaskActionProposal] = []
    json_payload_str = None

    # 1. Extract from <task_proposals>...</task_proposals>
    match = _PROPOSAL_BLOCK_PATTERN.search(raw_response)
    cleaned_reply = raw_response
    if match:
        json_payload_str = match.group(1).strip()
        cleaned_reply = _PROPOSAL_BLOCK_PATTERN.sub("", raw_response).strip()
    else:
        # Fallback check for markdown json block containing proposals
        md_match = _MARKDOWN_JSON_PATTERN.search(raw_response)
        if md_match:
            json_payload_str = md_match.group(1).strip()
            cleaned_reply = _MARKDOWN_JSON_PATTERN.sub("", raw_response).strip()

    if not json_payload_str:
        return cleaned_reply, []

    try:
        data = json.loads(json_payload_str)
    except Exception as parse_err:
        logger.warning(f"Failed to parse task proposals JSON: {parse_err}")
        return cleaned_reply, []

    raw_items = []
    if isinstance(data, dict):
        if "proposals" in data and isinstance(data["proposals"], list):
            raw_items = data["proposals"]
        elif "action_type" in data:
            raw_items = [data]
    elif isinstance(data, list):
        raw_items = data

    for item in raw_items:
        if not isinstance(item, dict):
            continue

        raw_action_type = item.get("action_type") or item.get("action")
        try:
            action_type = TaskActionType(raw_action_type)
        except Exception:
            continue

        action_id = str(uuid.uuid4())

        # Case A: CREATE_TASK
        if action_type == TaskActionType.CREATE_TASK:
            title = str(item.get("title") or "").strip()
            if not title:
                continue

            category_val = _sanitize_category(item.get("category"))
            priority_val = _sanitize_priority(item.get("priority"))
            status_val = _sanitize_status(item.get("status"))
            est_mins = _sanitize_est_minutes(item.get("estimated_minutes"))
            due_at = _sanitize_due_at(item.get("due_at"))

            proposed_data = {
                "title": title[:255],
                "description": str(item.get("description") or "").strip()[:4000],
                "category": category_val,
                "priority": priority_val,
                "status": status_val,
                "due_at": due_at,
                "estimated_minutes": est_mins,
            }

            token, expires_at = generate_approval_token(user_id, action_id, action_type.value)
            proposals.append(
                TaskActionProposal(
                    action_id=action_id,
                    action_type=action_type,
                    proposed_data=proposed_data,
                    approval_token=token,
                    expires_at=expires_at,
                    status="pending",
                    description=f"Create task: {title}",
                )
            )

        # Case B: BATCH_CREATE_TASKS
        elif action_type == TaskActionType.BATCH_CREATE_TASKS:
            raw_tasks = item.get("tasks") or []
            if not isinstance(raw_tasks, list) or len(raw_tasks) == 0:
                continue

            valid_items: List[ProposedTaskItem] = []
            for t_item in raw_tasks[:MAX_BATCH_TASKS_LIMIT]:
                if not isinstance(t_item, dict):
                    continue
                t_title = str(t_item.get("title") or "").strip()
                if not t_title:
                    continue

                valid_items.append(
                    ProposedTaskItem(
                        temp_id=str(uuid.uuid4()),
                        title=t_title[:255],
                        description=str(t_item.get("description") or "").strip()[:4000],
                        category=TaskCategory(_sanitize_category(t_item.get("category"))),
                        priority=TaskPriority(_sanitize_priority(t_item.get("priority"))),
                        status=TaskStatus(_sanitize_status(t_item.get("status"))),
                        due_at=_sanitize_due_at(t_item.get("due_at")),
                        estimated_minutes=_sanitize_est_minutes(t_item.get("estimated_minutes")),
                    )
                )

            if valid_items:
                token, expires_at = generate_approval_token(user_id, action_id, action_type.value)
                proposals.append(
                    TaskActionProposal(
                        action_id=action_id,
                        action_type=action_type,
                        proposed_tasks=valid_items,
                        approval_token=token,
                        expires_at=expires_at,
                        status="pending",
                        description=f"Batch create {len(valid_items)} tasks",
                    )
                )

        # Case C: UPDATE_TASK
        elif action_type == TaskActionType.UPDATE_TASK:
            target_id = item.get("task_id")
            matches = find_matching_tasks(str(target_id or item.get("title") or ""), user_tasks)
            if len(matches) != 1:
                # Ambiguous or not found — do not generate unverified proposal
                continue

            matched_task = matches[0]
            real_task_id = str(matched_task["id"])

            raw_changes = item.get("proposed_changes") or item.get("changes") or item.get("proposed_data") or {}
            proposed_changes: Dict[str, Any] = {}

            if "title" in raw_changes and str(raw_changes["title"]).strip():
                proposed_changes["title"] = str(raw_changes["title"]).strip()[:255]
            if "description" in raw_changes:
                proposed_changes["description"] = str(raw_changes["description"]).strip()[:4000]
            if "priority" in raw_changes:
                proposed_changes["priority"] = _sanitize_priority(raw_changes["priority"])
            if "category" in raw_changes:
                proposed_changes["category"] = _sanitize_category(raw_changes["category"])
            if "status" in raw_changes:
                proposed_changes["status"] = _sanitize_status(raw_changes["status"])
            if "due_at" in raw_changes:
                proposed_changes["due_at"] = _sanitize_due_at(raw_changes["due_at"])
            if "estimated_minutes" in raw_changes:
                proposed_changes["estimated_minutes"] = _sanitize_est_minutes(raw_changes["estimated_minutes"])

            if proposed_changes:
                token, expires_at = generate_approval_token(user_id, action_id, action_type.value, task_id=real_task_id)
                proposals.append(
                    TaskActionProposal(
                        action_id=action_id,
                        action_type=action_type,
                        task_id=real_task_id,
                        existing_task=matched_task,
                        proposed_data=proposed_changes,
                        approval_token=token,
                        expires_at=expires_at,
                        status="pending",
                        description=f"Update task: {matched_task.get('title')}",
                    )
                )

        # Case D: COMPLETE_TASK
        elif action_type == TaskActionType.COMPLETE_TASK:
            target_id = item.get("task_id")
            matches = find_matching_tasks(str(target_id or item.get("title") or ""), user_tasks)
            if len(matches) != 1:
                continue

            matched_task = matches[0]
            real_task_id = str(matched_task["id"])
            token, expires_at = generate_approval_token(user_id, action_id, action_type.value, task_id=real_task_id)
            proposals.append(
                TaskActionProposal(
                    action_id=action_id,
                    action_type=action_type,
                    task_id=real_task_id,
                    existing_task=matched_task,
                    approval_token=token,
                    expires_at=expires_at,
                    status="pending",
                    description=f"Mark task completed: {matched_task.get('title')}",
                )
            )

        # Case E: REOPEN_TASK
        elif action_type == TaskActionType.REOPEN_TASK:
            target_id = item.get("task_id")
            matches = find_matching_tasks(str(target_id or item.get("title") or ""), user_tasks)
            if len(matches) != 1:
                continue

            matched_task = matches[0]
            real_task_id = str(matched_task["id"])
            token, expires_at = generate_approval_token(user_id, action_id, action_type.value, task_id=real_task_id)
            proposals.append(
                TaskActionProposal(
                    action_id=action_id,
                    action_type=action_type,
                    task_id=real_task_id,
                    existing_task=matched_task,
                    approval_token=token,
                    expires_at=expires_at,
                    status="pending",
                    description=f"Reopen task: {matched_task.get('title')}",
                )
            )

        # Case F: DELETE_TASK
        elif action_type == TaskActionType.DELETE_TASK:
            target_id = item.get("task_id")
            matches = find_matching_tasks(str(target_id or item.get("title") or ""), user_tasks)
            if len(matches) != 1:
                continue

            matched_task = matches[0]
            real_task_id = str(matched_task["id"])
            token, expires_at = generate_approval_token(user_id, action_id, action_type.value, task_id=real_task_id)
            proposals.append(
                TaskActionProposal(
                    action_id=action_id,
                    action_type=action_type,
                    task_id=real_task_id,
                    existing_task=matched_task,
                    approval_token=token,
                    expires_at=expires_at,
                    status="pending",
                    description=f"Delete task: {matched_task.get('title')}",
                )
            )

    return cleaned_reply, proposals


# ---------------------------------------------------------------------------
# Trusted Server-Side Mutation Execution
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Durable Database Idempotency & Recovery Helpers
# ---------------------------------------------------------------------------

def fetch_durable_action_record(sb: Any, user_id: str, action_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves the persisted action record from public.mentor_task_actions.
    Guarantees durable idempotency even across full worker crashes and Redis restarts.
    """
    if not sb or not action_id:
        return None
    try:
        res = (
            sb.from_("mentor_task_actions")
            .select("action_id, user_id, action_type, idempotency_key, status, created_task_ids, target_task_id, response_payload, created_at")
            .eq("user_id", user_id)
            .eq("action_id", action_id)
            .execute()
        )
        if hasattr(res, "data") and isinstance(res.data, list) and len(res.data) > 0 and isinstance(res.data[0], dict):
            return res.data[0]
        return None
    except Exception as e:
        err_msg = str(e).lower()
        if "mentor_task_actions" in err_msg and ("does not exist" in err_msg or "pgrst205" in err_msg or "42p01" in err_msg):
            return None
        logger.warning(f"Error fetching durable action record {action_id}: {e}")
        return None


def record_durable_action(
    sb: Any,
    user_id: str,
    action_id: str,
    action_type: str,
    idempotency_key: str,
    response_payload: Dict[str, Any],
    created_task_ids: Optional[List[str]] = None,
    target_task_id: Optional[str] = None,
) -> bool:
    """
    Persists the executed action and its response into public.mentor_task_actions.
    """
    if not sb or not action_id:
        return False
    try:
        payload = {
            "action_id": action_id,
            "user_id": user_id,
            "action_type": action_type,
            "idempotency_key": idempotency_key,
            "status": "completed",
            "created_task_ids": created_task_ids or [],
            "target_task_id": target_task_id,
            "response_payload": response_payload,
        }
        sb.from_("mentor_task_actions").upsert(payload, on_conflict="action_id").execute()
        return True
    except Exception as e:
        err_msg = str(e).lower()
        if "mentor_task_actions" in err_msg and ("does not exist" in err_msg or "pgrst205" in err_msg or "42p01" in err_msg):
            return False
        logger.warning(f"Failed to record durable action in mentor_task_actions for {action_id}: {e}")
        return False


def fetch_tasks_by_action_id(sb: Any, user_id: str, action_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves authentic tasks committed in PostgreSQL with the specified action_id.
    Used for durable idempotency reconciliation after crashes or uncertain outcomes.
    """
    if not sb or not action_id:
        return []
    try:
        res = (
            sb.from_("tasks")
            .select("id, user_id, title, description, status, priority, category, due_at, time_range, collaborators, estimated_minutes, completed_at, created_at, action_id, batch_index")
            .eq("user_id", user_id)
            .eq("action_id", action_id)
            .order("batch_index", desc=False)
            .execute()
        )
        if hasattr(res, "data") and isinstance(res.data, list):
            return [t for t in res.data if isinstance(t, dict)]
        return []
    except Exception as e:
        err_msg = str(e).lower()
        if "column" in err_msg and "action_id" in err_msg:
            # Column does not exist in schema yet
            return []
        logger.warning(f"Error checking tasks by action_id {action_id}: {e}")
        return []


def insert_tasks_with_action(
    sb: Any,
    rows: List[Dict[str, Any]],
    user_id: str,
    action_id: str,
) -> List[Dict[str, Any]]:
    """
    Inserts tasks atomically into public.tasks, including action_id and batch_index.
    Guarantees:
    - Atomicity: PostgREST inserts all rows in a single SQL statement transaction.
    - Database Idempotency: If a concurrent request or prior attempt committed these tasks,
      PostgreSQL's UNIQUE INDEX (uq_tasks_action_batch) rejects the duplicate with error 23505.
      In that event, we recover and return the already committed tasks.
    - Schema compatibility: If tasks.action_id column does not exist yet in the database,
      gracefully falls back to inserting without action_id and batch_index.
    """
    try:
        res = sb.from_("tasks").insert(rows).execute()
        if hasattr(res, "data") and isinstance(res.data, list):
            if len(res.data) == 0:
                raise RuntimeError("Database insert failed.")
            return res.data
        elif hasattr(res, "data") and res.data:
            return res.data
        raise RuntimeError("Database insert failed.")
    except Exception as e:
        err_msg = str(e).lower()

        # Check for PostgreSQL Unique Constraint Violation on (action_id, batch_index)
        if "uq_tasks_action_batch" in err_msg or "23505" in err_msg or ("unique" in err_msg and "constraint" in err_msg):
            logger.info(f"PostgreSQL unique constraint triggered for action {action_id}. Retrieving already-committed tasks.")
            existing = fetch_tasks_by_action_id(sb, user_id, action_id)
            if existing:
                return existing
            raise

        # Check for missing action_id column in database (schema migration pending)
        if "column tasks.action_id does not exist" in err_msg or "42703" in err_msg or ("action_id" in err_msg and "does not exist" in err_msg):
            logger.warning("tasks.action_id column does not exist in schema. Falling back to insert without action_id.")
            fallback_rows = []
            for r in rows:
                fallback_rows.append({k: v for k, v in r.items() if k not in ("action_id", "batch_index")})
            res = sb.from_("tasks").insert(fallback_rows).execute()
            if hasattr(res, "data") and isinstance(res.data, list):
                if len(res.data) == 0:
                    raise RuntimeError("Database insert failed.")
                return res.data
            elif hasattr(res, "data") and res.data:
                return res.data
            raise RuntimeError("Database insert failed.")

        raise


def reconstruct_response_from_tasks(
    req: ExecuteTaskActionRequest,
    action_type: str,
    tasks: List[Dict[str, Any]],
) -> ExecuteTaskActionResponse:
    """Reconstructs the ExecuteTaskActionResponse from authentic database tasks."""
    if action_type == TaskActionType.CREATE_TASK.value:
        t_title = tasks[0].get("title", "Task") if tasks else "Task"
        return ExecuteTaskActionResponse(
            success=True,
            action_id=req.action_id,
            action_type=action_type,
            message=f"Task '{t_title}' created successfully.",
            created_tasks=tasks,
        )
    elif action_type == TaskActionType.BATCH_CREATE_TASKS.value:
        return ExecuteTaskActionResponse(
            success=True,
            action_id=req.action_id,
            action_type=action_type,
            message=f"Successfully created {len(tasks)} task(s).",
            created_tasks=tasks,
        )
    return ExecuteTaskActionResponse(
        success=True,
        action_id=req.action_id,
        action_type=action_type,
        message="Action recovered from database records.",
        created_tasks=tasks,
    )


# ---------------------------------------------------------------------------
# Trusted Server-Side Mutation Execution
# ---------------------------------------------------------------------------

def execute_approved_task_action(
    user_id: str,
    req: ExecuteTaskActionRequest,
) -> ExecuteTaskActionResponse:
    """
    Executes an approved task action on behalf of the authenticated student.
    Enforces:
    1. Cryptographic token validity and tenant isolation.
    2. Token expiration.
    3. Multi-tier durable idempotency (Redis cache + PostgreSQL mentor_task_actions + tasks.action_id).
    4. Anti-replay and distributed concurrency locking.
    5. Database row ownership re-validation.
    6. Safe retry and recovery without duplicate creation after process crashes.
    """
    # 1. Fast Cache Idempotency Check (Redis / In-memory)
    cached_res = get_idempotent_result(user_id, req.idempotency_key)
    if cached_res:
        logger.info(f"Returning cached idempotent response for action {req.action_id}")
        return ExecuteTaskActionResponse(**cached_res)

    # 2. Token Verification (Verify cryptographic integrity, tenant isolation, expiration)
    is_valid, err_msg, token_payload = verify_approval_token(
        token=req.approval_token,
        authenticated_user_id=user_id,
        expected_action_id=req.action_id,
    )
    if not is_valid or not token_payload:
        raise ValueError(err_msg or "Approval token verification failed.")

    action_type = token_payload.get("act")
    target_task_id = token_payload.get("tid")

    sb = get_supabase()
    if not sb:
        raise RuntimeError("Database connection is currently unavailable.")

    # 3. Durable Database Idempotency Check (Survives Redis restarts and hard worker crashes)
    # 3a. Check mentor_task_actions
    durable_rec = fetch_durable_action_record(sb, user_id, req.action_id)
    if durable_rec and durable_rec.get("response_payload"):
        logger.info(f"Returning database-persisted idempotent response for action {req.action_id}")
        payload = durable_rec["response_payload"]
        store_idempotent_result(user_id, req.idempotency_key, payload)
        mark_action_consumed(req.action_id)
        return ExecuteTaskActionResponse(**payload)

    # 3b. Check tasks.action_id (Recovers from crash between task commit and mentor_task_actions/Redis write)
    if action_type in (TaskActionType.CREATE_TASK.value, TaskActionType.BATCH_CREATE_TASKS.value):
        existing_committed = fetch_tasks_by_action_id(sb, user_id, req.action_id)
        if existing_committed:
            logger.info(
                f"Durable recovery: Found {len(existing_committed)} committed tasks in PostgreSQL for action {req.action_id}. "
                "Returning existing tasks without duplicate insertion."
            )
            reconstructed = reconstruct_response_from_tasks(req, action_type, existing_committed)
            record_durable_action(
                sb=sb,
                user_id=user_id,
                action_id=req.action_id,
                action_type=action_type,
                idempotency_key=req.idempotency_key,
                response_payload=reconstructed.model_dump(),
                created_task_ids=[t.get("id") for t in existing_committed if t.get("id")],
            )
            store_idempotent_result(user_id, req.idempotency_key, reconstructed.model_dump())
            mark_action_consumed(req.action_id)
            return reconstructed

    # 4. Anti-Replay Check (Redis)
    if is_action_consumed(req.action_id):
        raise ValueError("This action approval has already been executed.")

    # 5. Atomic Concurrency Reservation (Mutual Exclusion Lock before DB write)
    if not acquire_action_reservation(req.action_id):
        if is_action_consumed(req.action_id):
            raise ValueError("This action approval has already been executed.")
        raise ValueError("This action is currently being executed. Please do not submit duplicate requests.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result_response: Optional[ExecuteTaskActionResponse] = None

    try:
        # -------------------------------------------------------------------
        # Action: CREATE_TASK
        # -------------------------------------------------------------------
        if action_type == TaskActionType.CREATE_TASK.value:
            data = req.edited_data or {}
            title = (data.get("title") or "").strip()
            if not title:
                raise ValueError("Task title cannot be empty.")

            category_val = _sanitize_category(data.get("category"))
            priority_val = _sanitize_priority(data.get("priority"))
            status_val = _sanitize_status(data.get("status"))
            est_mins = _sanitize_est_minutes(data.get("estimated_minutes"))
            due_at = _sanitize_due_at(data.get("due_at"))
            completed_at = now_iso if status_val == "completed" else None

            insert_payload = {
                "user_id": user_id,
                "title": title[:255],
                "description": str(data.get("description") or "").strip()[:4000],
                "category": category_val,
                "priority": priority_val,
                "status": status_val,
                "due_at": due_at,
                "time_range": data.get("time_range"),
                "collaborators": data.get("collaborators") or [],
                "estimated_minutes": est_mins,
                "completed_at": completed_at,
                "action_id": req.action_id,
                "batch_index": 0,
            }

            created_rows = insert_tasks_with_action(sb, [insert_payload], user_id, req.action_id)
            if not created_rows or len(created_rows) == 0:
                raise RuntimeError("Database insert failed.")

            created = created_rows[0]
            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Task '{created['title']}' created successfully.",
                created_tasks=[created],
            )

        # -------------------------------------------------------------------
        # Action: BATCH_CREATE_TASKS
        # -------------------------------------------------------------------
        elif action_type == TaskActionType.BATCH_CREATE_TASKS.value:
            tasks_to_create = req.edited_tasks or []
            if not tasks_to_create:
                raise ValueError("No tasks provided for batch creation.")

            if len(tasks_to_create) > MAX_BATCH_TASKS_LIMIT:
                raise ValueError(f"Batch size exceeds maximum limit of {MAX_BATCH_TASKS_LIMIT} tasks.")

            insert_rows = []
            for idx, t in enumerate(tasks_to_create):
                t_title = t.title.strip()
                if not t_title:
                    continue

                c_val = _sanitize_category(t.category.value if t.category else "Other")
                p_val = _sanitize_priority(t.priority.value if t.priority else "medium")
                s_val = _sanitize_status(t.status.value if t.status else "todo")
                d_val = _sanitize_due_at(t.due_at)
                m_val = _sanitize_est_minutes(t.estimated_minutes)
                comp_at = now_iso if s_val == "completed" else None

                insert_rows.append(
                    {
                        "user_id": user_id,
                        "title": t_title[:255],
                        "description": (t.description or "").strip()[:4000],
                        "category": c_val,
                        "priority": p_val,
                        "status": s_val,
                        "due_at": d_val,
                        "time_range": t.time_range,
                        "collaborators": t.collaborators or [],
                        "estimated_minutes": m_val,
                        "completed_at": comp_at,
                        "action_id": req.action_id,
                        "batch_index": idx,
                    }
                )

            if not insert_rows:
                raise ValueError("No valid tasks to create.")

            created_list = insert_tasks_with_action(sb, insert_rows, user_id, req.action_id)
            if len(created_list) != len(insert_rows):
                logger.warning(f"Partial batch creation: {len(created_list)} of {len(insert_rows)} inserted.")

            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Successfully created {len(created_list)} task(s).",
                created_tasks=created_list,
            )

        # -------------------------------------------------------------------
        # Action: UPDATE_TASK
        # -------------------------------------------------------------------
        elif action_type == TaskActionType.UPDATE_TASK.value:
            if not target_task_id:
                raise ValueError("Missing target task ID in approval token.")

            # Re-verify task ownership
            existing = sb.from_("tasks").select("id, user_id, status").eq("id", target_task_id).eq("user_id", user_id).execute()
            if not existing.data or len(existing.data) == 0:
                raise ValueError("Task not found or unauthorized.")

            data = req.edited_data or {}
            update_payload: Dict[str, Any] = {"updated_at": now_iso}

            if "title" in data:
                title = str(data["title"]).strip()
                if not title:
                    raise ValueError("Task title cannot be empty.")
                update_payload["title"] = title[:255]

            if "description" in data:
                update_payload["description"] = str(data["description"]).strip()[:4000]

            if "category" in data and data["category"] is not None:
                update_payload["category"] = _sanitize_category(data["category"])

            if "priority" in data and data["priority"] is not None:
                update_payload["priority"] = _sanitize_priority(data["priority"])

            if "due_at" in data:
                update_payload["due_at"] = _sanitize_due_at(data["due_at"])

            if "estimated_minutes" in data:
                update_payload["estimated_minutes"] = _sanitize_est_minutes(data["estimated_minutes"])

            if "status" in data and data["status"] is not None:
                st = _sanitize_status(data["status"])
                update_payload["status"] = st
                if st == "completed":
                    update_payload["completed_at"] = now_iso
                else:
                    update_payload["completed_at"] = None

            res = (
                sb.from_("tasks")
                .update(update_payload)
                .eq("id", target_task_id)
                .eq("user_id", user_id)
                .select()
                .execute()
            )
            if not res.data or len(res.data) == 0:
                raise RuntimeError("Database update failed.")

            updated = res.data[0]
            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Task '{updated['title']}' updated successfully.",
                updated_task=updated,
            )

        # -------------------------------------------------------------------
        # Action: COMPLETE_TASK
        # -------------------------------------------------------------------
        elif action_type == TaskActionType.COMPLETE_TASK.value:
            if not target_task_id:
                raise ValueError("Missing target task ID in approval token.")

            res = (
                sb.from_("tasks")
                .update({"status": "completed", "completed_at": now_iso, "updated_at": now_iso})
                .eq("id", target_task_id)
                .eq("user_id", user_id)
                .select()
                .execute()
            )
            if not res.data or len(res.data) == 0:
                raise ValueError("Task not found or unauthorized.")

            updated = res.data[0]
            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Task '{updated['title']}' marked as completed.",
                updated_task=updated,
            )

        # -------------------------------------------------------------------
        # Action: REOPEN_TASK
        # -------------------------------------------------------------------
        elif action_type == TaskActionType.REOPEN_TASK.value:
            if not target_task_id:
                raise ValueError("Missing target task ID in approval token.")

            res = (
                sb.from_("tasks")
                .update({"status": "todo", "completed_at": None, "updated_at": now_iso})
                .eq("id", target_task_id)
                .eq("user_id", user_id)
                .select()
                .execute()
            )
            if not res.data or len(res.data) == 0:
                raise ValueError("Task not found or unauthorized.")

            updated = res.data[0]
            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Task '{updated['title']}' reopened.",
                updated_task=updated,
            )

        # -------------------------------------------------------------------
        # Action: DELETE_TASK
        # -------------------------------------------------------------------
        elif action_type == TaskActionType.DELETE_TASK.value:
            if not target_task_id:
                raise ValueError("Missing target task ID in approval token.")

            # Get title before deletion for confirmation message
            existing = sb.from_("tasks").select("title").eq("id", target_task_id).eq("user_id", user_id).execute()
            if not existing.data or len(existing.data) == 0:
                raise ValueError("Task not found or unauthorized.")

            title = existing.data[0].get("title") or "Task"

            res = sb.from_("tasks").delete().eq("id", target_task_id).eq("user_id", user_id).execute()
            if not res.data or len(res.data) == 0:
                raise ValueError("Task not found or unauthorized.")

            result_response = ExecuteTaskActionResponse(
                success=True,
                action_id=req.action_id,
                action_type=action_type,
                message=f"Task '{title}' deleted permanently.",
                deleted_task_id=target_task_id,
            )

        else:
            raise ValueError(f"Unsupported action type: {action_type}")

        # 6. Record durable action in PostgreSQL mentor_task_actions
        if result_response:
            c_task_ids = [t["id"] for t in (result_response.created_tasks or []) if isinstance(t, dict) and "id" in t]
            record_durable_action(
                sb=sb,
                user_id=user_id,
                action_id=req.action_id,
                action_type=action_type,
                idempotency_key=req.idempotency_key,
                response_payload=result_response.model_dump(),
                created_task_ids=c_task_ids,
                target_task_id=target_task_id,
            )

        # 7. Mark action consumed to prevent replay & release reservation
        mark_action_consumed(req.action_id)

        # 8. Store for fast-path idempotency
        if result_response:
            store_idempotent_result(user_id, req.idempotency_key, result_response.model_dump())

        return result_response

    except Exception as exc:
        # Safe Retry & Recovery: Disambiguate genuine failure from uncertain outcome / crash after DB commit
        committed_tasks = []
        if action_type in (TaskActionType.CREATE_TASK.value, TaskActionType.BATCH_CREATE_TASKS.value):
            try:
                committed_tasks = fetch_tasks_by_action_id(sb, user_id, req.action_id)
            except Exception as check_err:
                logger.warning(f"Error checking committed tasks for action {req.action_id}: {check_err}")

        durable_exists = False
        try:
            durable_check = fetch_durable_action_record(sb, user_id, req.action_id)
            durable_exists = bool(durable_check and durable_check.get("response_payload"))
        except Exception:
            pass

        if committed_tasks or durable_exists:
            # UNCERTAIN OUTCOME RESOLVED AS COMMITTED:
            # PostgreSQL commit succeeded, but connection dropped before response was delivered or Redis updated.
            # Do NOT release the reservation! That would allow a duplicate execution!
            logger.warning(
                f"Action {req.action_id} raised {type(exc).__name__}, but database records exist. "
                "Marking action consumed to prevent duplicate execution."
            )
            try:
                mark_action_consumed(req.action_id)
            except Exception:
                pass
            raise
        else:
            # GENUINE FAILURE:
            # No tasks were committed to PostgreSQL.
            # Safely release the reservation so legitimate retries can proceed.
            release_action_reservation(req.action_id)
            raise


# ---------------------------------------------------------------------------
# Validation & Sanitization Helpers
# ---------------------------------------------------------------------------

def _sanitize_category(val: Any) -> str:
    valid = {"Study", "Assignments", "Projects", "Hackathons", "Career", "Personal", "Other"}
    if val and str(val).strip() in valid:
        return str(val).strip()
    return "Other"


def _sanitize_priority(val: Any) -> str:
    valid = {"low", "medium", "high"}
    if val and str(val).strip().lower() in valid:
        return str(val).strip().lower()
    return "medium"


def _sanitize_status(val: Any) -> str:
    valid = {"todo", "in_progress", "completed", "past_due"}
    if val and str(val).strip().lower() in valid:
        return str(val).strip().lower()
    return "todo"


def _sanitize_est_minutes(val: Any) -> Optional[int]:
    if val is None or val == "":
        return None
    try:
        num = int(val)
        if 0 <= num <= 10080:
            return num
    except (ValueError, TypeError):
        pass
    return None


def _sanitize_due_at(val: Any) -> Optional[str]:
    if not val or not str(val).strip():
        return None
    val_str = str(val).strip()
    try:
        # Check parseability
        dt = datetime.datetime.fromisoformat(val_str.replace("Z", "+00:00"))
        if 2000 <= dt.year <= 2100:
            return dt.isoformat()
    except Exception:
        pass
    return None
