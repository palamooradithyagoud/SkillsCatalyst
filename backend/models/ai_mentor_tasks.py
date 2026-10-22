"""
backend/models/ai_mentor_tasks.py
Pydantic contracts for Phase 2A: AI Mentor + To-Do List Integration.
Defines structured task proposals, approval tokens, and execution contracts.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from backend.models.task import TaskStatus, TaskPriority, TaskCategory


class TaskActionType(str, Enum):
    CREATE_TASK = "create_task"
    BATCH_CREATE_TASKS = "batch_create_tasks"
    UPDATE_TASK = "update_task"
    COMPLETE_TASK = "complete_task"
    REOPEN_TASK = "reopen_task"
    DELETE_TASK = "delete_task"
    APPLY_SCHEDULE_PLAN = "apply_schedule_plan"


MAX_BATCH_TASKS_LIMIT = 20


class ProposedTaskItem(BaseModel):
    temp_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=4000)
    category: Optional[TaskCategory] = TaskCategory.Other
    priority: Optional[TaskPriority] = TaskPriority.medium
    status: Optional[TaskStatus] = TaskStatus.todo
    due_at: Optional[str] = None
    time_range: Optional[str] = None
    collaborators: Optional[List[str]] = []
    estimated_minutes: Optional[int] = Field(default=None, ge=0, le=10080)


class ScheduledPlanItem(BaseModel):
    task_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    start_time: str = Field(..., description="e.g. '09:00' or ISO time")
    end_time: str = Field(..., description="e.g. '10:30' or ISO time")
    time_range: Optional[str] = None
    due_at: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.medium
    estimated_minutes: Optional[int] = Field(default=None, ge=0, le=10080)
    reason: Optional[str] = Field(default="", max_length=1000)
    warnings: Optional[List[str]] = Field(default_factory=list)
    is_conflict: Optional[bool] = False


class SchedulePlanData(BaseModel):
    plan_period: str = Field(default="today", description="'today', 'tomorrow', 'week', 'custom'")
    target_date: Optional[str] = None
    total_allocated_minutes: int = Field(default=0, ge=0)
    conflicts_detected: bool = False
    warnings: List[str] = Field(default_factory=list)
    items: List[ScheduledPlanItem] = Field(default_factory=list, max_length=MAX_BATCH_TASKS_LIMIT)
    overload_warning: Optional[str] = None


class TaskActionProposal(BaseModel):
    action_id: str
    action_type: TaskActionType
    task_id: Optional[str] = None
    existing_task: Optional[Dict[str, Any]] = None
    proposed_data: Optional[Dict[str, Any]] = None
    proposed_tasks: Optional[List[ProposedTaskItem]] = Field(default=None, max_length=MAX_BATCH_TASKS_LIMIT)
    proposed_plan: Optional[SchedulePlanData] = None
    schedule_plan: Optional[SchedulePlanData] = None
    approval_token: str
    expires_at: str
    status: str = "pending"  # "pending" | "approved" | "rejected" | "expired"
    description: Optional[str] = None


class ExecuteTaskActionRequest(BaseModel):
    action_id: str
    approval_token: str
    idempotency_key: str = Field(..., min_length=8, max_length=128)
    edited_data: Optional[Dict[str, Any]] = None
    edited_tasks: Optional[List[ProposedTaskItem]] = Field(default=None, max_length=MAX_BATCH_TASKS_LIMIT)
    edited_plan: Optional[SchedulePlanData] = None


class ExecuteTaskActionResponse(BaseModel):
    success: bool
    action_id: str
    action_type: str
    message: str
    created_tasks: Optional[List[Dict[str, Any]]] = None
    updated_task: Optional[Dict[str, Any]] = None
    deleted_task_id: Optional[str] = None
    scheduled_plan: Optional[SchedulePlanData] = None
    applied_tasks_count: Optional[int] = None


class CancelTaskActionRequest(BaseModel):
    action_id: str
    approval_token: str
