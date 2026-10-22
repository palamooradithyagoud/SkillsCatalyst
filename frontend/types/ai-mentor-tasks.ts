/**
 * frontend/types/ai-mentor-tasks.ts
 * TypeScript contracts for Phase 2A: AI Mentor + To-Do List Integration.
 * Strictly zero emojis.
 */

import { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

export const MAX_BATCH_TASKS_LIMIT = 20;

export type TaskActionType =
  | "create_task"
  | "batch_create_tasks"
  | "update_task"
  | "complete_task"
  | "reopen_task"
  | "delete_task"
  | "apply_schedule_plan";

export type ActionStatus =
  | "pending"
  | "submitting"
  | "completed"
  | "canceled"
  | "expired"
  | "error";

export interface ProposedTaskItem {
  temp_id?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  due_at?: string | null;
  time_range?: string | null;
  collaborators?: string[];
  estimated_minutes?: number | null;
}

export interface ScheduledPlanItem {
  task_id: string;
  title: string;
  start_time?: string | null;
  end_time?: string | null;
  time_range?: string | null;
  due_at?: string | null;
  priority?: TaskPriority | string;
  estimated_minutes?: number | null;
  reason?: string;
  warnings?: string[];
  is_conflict?: boolean;
}

export interface SchedulePlanData {
  plan_period?: string;
  target_date?: string;
  total_allocated_minutes?: number;
  conflicts_detected?: boolean;
  warnings?: string[];
  items: ScheduledPlanItem[];
  overload_warning?: string | null;
}

export interface TaskActionProposal {
  action_id: string;
  action_type: TaskActionType;
  task_id?: string;
  existing_task?: Partial<Task> | Record<string, any>;
  proposed_data?: Partial<Task> | Record<string, any>;
  proposed_tasks?: ProposedTaskItem[];
  schedule_plan?: SchedulePlanData;
  approval_token: string;
  expires_at: string;
  status?: ActionStatus;
  description?: string;
  result_message?: string;
  error_message?: string;
}

export interface ExecuteTaskActionPayload {
  action_id: string;
  approval_token: string;
  idempotency_key: string;
  edited_data?: Record<string, unknown>;
  edited_tasks?: ProposedTaskItem[];
  edited_plan?: SchedulePlanData;
}

export interface ExecuteTaskActionResponse {
  success: boolean;
  action_id: string;
  action_type: string;
  message: string;
  created_tasks?: Record<string, unknown>[];
  updated_task?: Record<string, unknown>;
  deleted_task_id?: string;
}
