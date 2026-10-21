"""
backend/routers/tasks.py
Production-grade FastAPI endpoints for Task Management & Subtasks.
Enforces tenant isolation, input validation, and ownership verification.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.services.auth_service import get_current_user_id, is_valid_uuid
from backend.services.supabase_service import get_supabase
from backend.models.task import (
    CreateTaskRequest,
    UpdateTaskRequest,
    CreateSubtaskRequest,
    UpdateSubtaskRequest,
    TaskResponse,
    SubtaskResponse,
    TaskMetricsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _get_supabase_or_503():
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is currently unavailable.",
        )
    return sb


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    view: Optional[str] = Query("all"),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    user_id: str = Depends(get_current_user_id),
):
    """
    Lists tasks owned by the authenticated user with optional filtering and sorting.
    """
    sb = _get_supabase_or_503()

    try:
        query = sb.from_("tasks").select("*, subtasks(*)").eq("user_id", user_id)

        if status_filter and status_filter != "all":
            query = query.eq("status", status_filter)

        if priority_filter and priority_filter != "all":
            query = query.eq("priority", priority_filter)

        if category_filter and category_filter != "all":
            query = query.eq("category", category_filter)

        is_asc = (sort_order or "desc").lower() == "asc"
        if sort_by == "due_date":
            query = query.order("due_at", ascending=is_asc)
        elif sort_by == "priority":
            query = query.order("priority", ascending=is_asc)
        else:
            query = query.order("created_at", ascending=is_asc)

        res = query.execute()
        tasks = res.data or []

        # Client-side style search filtering if search parameter provided
        if search and search.strip():
            clean = search.strip().lower()
            tasks = [
                t for t in tasks
                if clean in (t.get("title") or "").lower() or clean in (t.get("description") or "").lower()
            ]

        # Format subtasks
        formatted: List[TaskResponse] = []
        for row in tasks:
            subs = row.get("subtasks") or []
            if isinstance(subs, list):
                subs.sort(key=lambda s: s.get("created_at") or "")
            formatted.append(
                TaskResponse(
                    id=str(row["id"]),
                    user_id=str(row["user_id"]),
                    title=row["title"],
                    description=row.get("description") or "",
                    status=row.get("status") or "todo",
                    priority=row.get("priority") or "medium",
                    category=row.get("category") or "Other",
                    due_at=row.get("due_at"),
                    time_range=row.get("time_range"),
                    collaborators=row.get("collaborators") or [],
                    estimated_minutes=row.get("estimated_minutes"),
                    completed_at=row.get("completed_at"),
                    created_at=str(row.get("created_at")),
                    updated_at=str(row.get("updated_at")),
                    subtasks=[
                        SubtaskResponse(
                            id=str(s["id"]),
                            task_id=str(s["task_id"]),
                            user_id=str(s["user_id"]),
                            title=s["title"],
                            is_completed=bool(s.get("is_completed", False)),
                            created_at=str(s.get("created_at")),
                            updated_at=str(s.get("updated_at")),
                        )
                        for s in subs
                    ],
                )
            )

        return formatted
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] list_tasks error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tasks.",
        )


@router.get("/metrics", response_model=TaskMetricsResponse)
async def get_task_metrics(user_id: str = Depends(get_current_user_id)):
    """
    Computes dashboard overview metrics for the authenticated user.
    """
    sb = _get_supabase_or_503()

    try:
        res = sb.from_("tasks").select("id, status, due_at").eq("user_id", user_id).execute()
        tasks = res.data or []

        now = datetime.now(timezone.utc)
        total_count = len(tasks)
        completed_count = 0
        in_progress_count = 0
        due_today_count = 0
        overdue_count = 0

        for t in tasks:
            st = t.get("status") or "todo"
            due_str = t.get("due_at")

            if st == "completed":
                completed_count += 1
            else:
                is_overdue_flag = False
                if st == "past_due":
                    overdue_count += 1
                    is_overdue_flag = True
                elif st == "in_progress":
                    in_progress_count += 1

                if due_str:
                    try:
                        due_dt = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                        if due_dt < now and not is_overdue_flag:
                            overdue_count += 1
                        if due_dt.date() == now.date():
                            due_today_count += 1
                    except Exception:
                        pass

        completion_pct = (
            round((completed_count / total_count) * 100) if total_count > 0 else 0
        )

        return TaskMetricsResponse(
            dueTodayCount=due_today_count,
            overdueCount=overdue_count,
            inProgressCount=in_progress_count,
            completedCount=completed_count,
            totalCount=total_count,
            completionPercentage=completion_pct,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] get_task_metrics error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute task metrics.",
        )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: CreateTaskRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Creates a new task owned by the authenticated user.
    """
    sb = _get_supabase_or_503()

    now_iso = datetime.now(timezone.utc).isoformat()
    status_val = payload.status.value if payload.status else "todo"
    completed_at = now_iso if status_val == "completed" else None

    row = {
        "user_id": user_id,
        "title": payload.title.strip(),
        "description": (payload.description or "").strip(),
        "status": status_val,
        "priority": payload.priority.value if payload.priority else "medium",
        "category": payload.category.value if payload.category else "Other",
        "due_at": payload.due_at.isoformat() if payload.due_at else None,
        "time_range": payload.time_range,
        "collaborators": payload.collaborators or [],
        "estimated_minutes": payload.estimated_minutes,
        "completed_at": completed_at,
    }

    try:
        res = sb.from_("tasks").insert(row).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create task.",
            )

        created = res.data[0]
        return TaskResponse(
            id=str(created["id"]),
            user_id=str(created["user_id"]),
            title=created["title"],
            description=created.get("description") or "",
            status=created.get("status") or "todo",
            priority=created.get("priority") or "medium",
            category=created.get("category") or "Other",
            due_at=created.get("due_at"),
            time_range=created.get("time_range"),
            collaborators=created.get("collaborators") or [],
            estimated_minutes=created.get("estimated_minutes"),
            completed_at=created.get("completed_at"),
            created_at=str(created.get("created_at")),
            updated_at=str(created.get("updated_at")),
            subtasks=[],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] create_task error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create task.",
        )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieves a single task owned by the authenticated user.
    """
    if not is_valid_uuid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format.",
        )

    sb = _get_supabase_or_503()

    try:
        res = sb.from_("tasks").select("*, subtasks(*)").eq("id", task_id).eq("user_id", user_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        row = res.data[0]
        subs = row.get("subtasks") or []
        return TaskResponse(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            title=row["title"],
            description=row.get("description") or "",
            status=row.get("status") or "todo",
            priority=row.get("priority") or "medium",
            category=row.get("category") or "Other",
            due_at=row.get("due_at"),
            time_range=row.get("time_range"),
            collaborators=row.get("collaborators") or [],
            estimated_minutes=row.get("estimated_minutes"),
            completed_at=row.get("completed_at"),
            created_at=str(row.get("created_at")),
            updated_at=str(row.get("updated_at")),
            subtasks=[
                SubtaskResponse(
                    id=str(s["id"]),
                    task_id=str(s["task_id"]),
                    user_id=str(s["user_id"]),
                    title=s["title"],
                    is_completed=bool(s.get("is_completed", False)),
                    created_at=str(s.get("created_at")),
                    updated_at=str(s.get("updated_at")),
                )
                for s in subs
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] get_task error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task.",
        )


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    payload: UpdateTaskRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Updates an existing task owned by the authenticated user.
    """
    if not is_valid_uuid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format.",
        )

    sb = _get_supabase_or_503()

    update_data = {}
    if payload.title is not None:
        update_data["title"] = payload.title.strip()
    if payload.description is not None:
        update_data["description"] = payload.description.strip()
    if payload.priority is not None:
        update_data["priority"] = payload.priority.value
    if payload.category is not None:
        update_data["category"] = payload.category.value
    if payload.due_at is not None:
        update_data["due_at"] = payload.due_at.isoformat()
    if payload.time_range is not None:
        update_data["time_range"] = payload.time_range
    if payload.collaborators is not None:
        update_data["collaborators"] = payload.collaborators
    if payload.estimated_minutes is not None:
        update_data["estimated_minutes"] = payload.estimated_minutes

    now_iso = datetime.now(timezone.utc).isoformat()
    if payload.status is not None:
        st_val = payload.status.value
        update_data["status"] = st_val
        if st_val == "completed":
            update_data["completed_at"] = (
                payload.completed_at.isoformat() if payload.completed_at else now_iso
            )
        else:
            update_data["completed_at"] = None

    update_data["updated_at"] = now_iso

    try:
        res = (
            sb.from_("tasks")
            .update(update_data)
            .eq("id", task_id)
            .eq("user_id", user_id)
            .select("*, subtasks(*)")
            .execute()
        )

        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or unauthorized.",
            )

        row = res.data[0]
        subs = row.get("subtasks") or []
        return TaskResponse(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            title=row["title"],
            description=row.get("description") or "",
            status=row.get("status") or "todo",
            priority=row.get("priority") or "medium",
            category=row.get("category") or "Other",
            due_at=row.get("due_at"),
            time_range=row.get("time_range"),
            collaborators=row.get("collaborators") or [],
            estimated_minutes=row.get("estimated_minutes"),
            completed_at=row.get("completed_at"),
            created_at=str(row.get("created_at")),
            updated_at=str(row.get("updated_at")),
            subtasks=[
                SubtaskResponse(
                    id=str(s["id"]),
                    task_id=str(s["task_id"]),
                    user_id=str(s["user_id"]),
                    title=s["title"],
                    is_completed=bool(s.get("is_completed", False)),
                    created_at=str(s.get("created_at")),
                    updated_at=str(s.get("updated_at")),
                )
                for s in subs
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] update_task error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task.",
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Deletes a task owned by the authenticated user.
    """
    if not is_valid_uuid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format.",
        )

    sb = _get_supabase_or_503()

    try:
        res = sb.from_("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or unauthorized.",
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] delete_task error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task.",
        )


# ── Subtask Endpoints ─────────────────────────────────────────────────────────

@router.post("/{task_id}/subtasks", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED)
async def create_subtask(
    task_id: str,
    payload: CreateSubtaskRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Creates a subtask, verifying parent task ownership.
    """
    if not is_valid_uuid(task_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format.",
        )

    sb = _get_supabase_or_503()

    # Verify parent task ownership
    parent_res = sb.from_("tasks").select("id").eq("id", task_id).eq("user_id", user_id).execute()
    if not parent_res.data or len(parent_res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent task not found or unauthorized.",
        )

    subtask_row = {
        "task_id": task_id,
        "user_id": user_id,
        "title": payload.title.strip(),
        "is_completed": False,
    }

    try:
        res = sb.from_("subtasks").insert(subtask_row).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create subtask.",
            )

        created = res.data[0]
        return SubtaskResponse(
            id=str(created["id"]),
            task_id=str(created["task_id"]),
            user_id=str(created["user_id"]),
            title=created["title"],
            is_completed=bool(created.get("is_completed", False)),
            created_at=str(created.get("created_at")),
            updated_at=str(created.get("updated_at")),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] create_subtask error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subtask.",
        )


@router.patch("/subtasks/{subtask_id}", response_model=SubtaskResponse)
async def update_subtask(
    subtask_id: str,
    payload: UpdateSubtaskRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Updates a subtask owned by the authenticated user.
    """
    if not is_valid_uuid(subtask_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subtask ID format.",
        )

    sb = _get_supabase_or_503()

    update_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if payload.title is not None:
        update_data["title"] = payload.title.strip()
    if payload.is_completed is not None:
        update_data["is_completed"] = payload.is_completed

    try:
        res = (
            sb.from_("subtasks")
            .update(update_data)
            .eq("id", subtask_id)
            .eq("user_id", user_id)
            .select("*")
            .execute()
        )

        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subtask not found or unauthorized.",
            )

        row = res.data[0]
        return SubtaskResponse(
            id=str(row["id"]),
            task_id=str(row["task_id"]),
            user_id=str(row["user_id"]),
            title=row["title"],
            is_completed=bool(row.get("is_completed", False)),
            created_at=str(row.get("created_at")),
            updated_at=str(row.get("updated_at")),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] update_subtask error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update subtask.",
        )


@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtask(
    subtask_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Deletes a subtask owned by the authenticated user.
    """
    if not is_valid_uuid(subtask_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subtask ID format.",
        )

    sb = _get_supabase_or_503()

    try:
        res = sb.from_("subtasks").delete().eq("id", subtask_id).eq("user_id", user_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subtask not found or unauthorized.",
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Tasks] delete_subtask error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete subtask.",
        )
