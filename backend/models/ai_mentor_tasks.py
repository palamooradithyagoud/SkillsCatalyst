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


class TaskActionProposal(BaseModel):
    action_id: str
    action_type: TaskActionType
    task_id: Optional[str] = None
    existing_task: Optional[Dict[str, Any]] = None
    proposed_data: Optional[Dict[str, Any]] = None
    proposed_tasks: Optional[List[ProposedTaskItem]] = Field(default=None, max_length=MAX_BATCH_TASKS_LIMIT)
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


class ExecuteTaskActionResponse(BaseModel):
    success: bool
    action_id: str
    action_type: str
    message: str
    created_tasks: Optional[List[Dict[str, Any]]] = None
    updated_task: Optional[Dict[str, Any]] = None
    deleted_task_id: Optional[str] = None


class CancelTaskActionRequest(BaseModel):
    action_id: str
    approval_token: str
