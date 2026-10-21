"""
backend/models/task.py
Pydantic data models for SkillsCatalyst To-Do List & Subtask management.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"
    past_due = "past_due"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskCategory(str, Enum):
    Study = "Study"
    Assignments = "Assignments"
    Projects = "Projects"
    Hackathons = "Hackathons"
    Career = "Career"
    Personal = "Personal"
    Other = "Other"


class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(default="", max_length=4000)
    status: Optional[TaskStatus] = TaskStatus.todo
    priority: Optional[TaskPriority] = TaskPriority.medium
    category: Optional[TaskCategory] = TaskCategory.Other
    due_at: Optional[datetime] = None
    time_range: Optional[str] = None
    collaborators: Optional[List[str]] = []
    estimated_minutes: Optional[int] = Field(default=None, ge=0, le=10080)


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None
    due_at: Optional[datetime] = None
    time_range: Optional[str] = None
    collaborators: Optional[List[str]] = None
    estimated_minutes: Optional[int] = Field(default=None, ge=0, le=10080)
    completed_at: Optional[datetime] = None


class CreateSubtaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class UpdateSubtaskRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    is_completed: Optional[bool] = None


class SubtaskResponse(BaseModel):
    id: str
    task_id: str
    user_id: str
    title: str
    is_completed: bool
    created_at: str
    updated_at: str


class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    category: TaskCategory
    due_at: Optional[str] = None
    time_range: Optional[str] = None
    collaborators: Optional[List[str]] = []
    estimated_minutes: Optional[int] = None
    completed_at: Optional[str] = None
    created_at: str
    updated_at: str
    subtasks: List[SubtaskResponse] = []


class TaskMetricsResponse(BaseModel):
    dueTodayCount: int
    overdueCount: int
    inProgressCount: int
    completedCount: int
    totalCount: int
    completionPercentage: int
