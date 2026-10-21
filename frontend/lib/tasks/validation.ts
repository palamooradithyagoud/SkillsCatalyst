/**
 * frontend/lib/tasks/validation.ts
 * Validation utilities for the SkillsCatalyst To-Do List & Subtask management.
 * Follows the repository validation conventions (returns { isValid: boolean; error?: string }).
 */

import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/types/task";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates task title:
 * - Required, non-empty after trimming
 * - Maximum length 255 characters
 */
export function validateTaskTitle(title: string | null | undefined): ValidationResult {
  if (title === null || title === undefined) {
    return { isValid: false, error: "Task title is required." };
  }

  const clean = title.trim();
  if (clean.length === 0) {
    return { isValid: false, error: "Task title cannot be empty." };
  }

  if (clean.length > 255) {
    return { isValid: false, error: "Task title cannot exceed 255 characters." };
  }

  return { isValid: true };
}

/**
 * Validates optional task description:
 * - If provided, maximum length 4000 characters
 */
export function validateTaskDescription(description: string | null | undefined): ValidationResult {
  if (!description) {
    return { isValid: true };
  }

  if (description.length > 4000) {
    return { isValid: false, error: "Description cannot exceed 4000 characters." };
  }

  return { isValid: true };
}

/**
 * Validates task status:
 * - Must be one of 'todo', 'in_progress', 'completed'
 */
export function validateTaskStatus(status: string | null | undefined): ValidationResult {
  if (!status) {
    return { isValid: true };
  }

  if (!TASK_STATUSES.includes(status as TaskStatus)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates task priority:
 * - Must be one of 'low', 'medium', 'high'
 */
export function validateTaskPriority(priority: string | null | undefined): ValidationResult {
  if (!priority) {
    return { isValid: true };
  }

  if (!TASK_PRIORITIES.includes(priority as TaskPriority)) {
    return {
      isValid: false,
      error: `Invalid priority. Must be one of: ${TASK_PRIORITIES.join(", ")}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates task category:
 * - Must be one of Study, Assignments, Projects, Hackathons, Career, Personal, Other
 */
export function validateTaskCategory(category: string | null | undefined): ValidationResult {
  if (!category) {
    return { isValid: true };
  }

  if (!TASK_CATEGORIES.includes(category as TaskCategory)) {
    return {
      isValid: false,
      error: `Invalid category. Must be one of: ${TASK_CATEGORIES.join(", ")}.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates optional due date:
 * - If provided, must be a valid parseable ISO/date string
 */
export function validateTaskDueAt(dueAt: string | null | undefined): ValidationResult {
  if (!dueAt || dueAt.trim() === "") {
    return { isValid: true };
  }

  const parsed = new Date(dueAt);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, error: "Please provide a valid deadline date and time." };
  }

  // Reject absurd dates (e.g. year < 2000 or year > 2100)
  const year = parsed.getFullYear();
  if (year < 2000 || year > 2100) {
    return { isValid: false, error: "Deadline year must be between 2000 and 2100." };
  }

  return { isValid: true };
}

/**
 * Validates optional estimated duration in minutes:
 * - If provided, must be an integer between 0 and 10080 (7 days)
 */
export function validateTaskEstimatedMinutes(
  minutes: number | string | null | undefined
): ValidationResult {
  if (minutes === null || minutes === undefined || minutes === "") {
    return { isValid: true };
  }

  const num = typeof minutes === "string" ? Number(minutes) : minutes;
  if (!Number.isInteger(num)) {
    return { isValid: false, error: "Estimated duration must be a whole number of minutes." };
  }

  if (num < 0) {
    return { isValid: false, error: "Estimated duration cannot be negative." };
  }

  if (num > 10080) {
    return { isValid: false, error: "Estimated duration cannot exceed 7 days (10080 minutes)." };
  }

  return { isValid: true };
}

/**
 * Validates subtask title:
 * - Required, non-empty, max 255 chars
 */
export function validateSubtaskTitle(title: string | null | undefined): ValidationResult {
  if (title === null || title === undefined) {
    return { isValid: false, error: "Subtask title is required." };
  }

  const clean = title.trim();
  if (clean.length === 0) {
    return { isValid: false, error: "Subtask title cannot be empty." };
  }

  if (clean.length > 255) {
    return { isValid: false, error: "Subtask title cannot exceed 255 characters." };
  }

  return { isValid: true };
}

/**
 * Composite form validation for creating or updating a task
 */
export function validateTaskForm(
  payload: Partial<CreateTaskPayload & UpdateTaskPayload>
): FormValidationResult {
  const errors: Record<string, string> = {};

  if (payload.title !== undefined) {
    const titleRes = validateTaskTitle(payload.title);
    if (!titleRes.isValid && titleRes.error) {
      errors.title = titleRes.error;
    }
  }

  if (payload.description !== undefined) {
    const descRes = validateTaskDescription(payload.description);
    if (!descRes.isValid && descRes.error) {
      errors.description = descRes.error;
    }
  }

  if (payload.status !== undefined) {
    const statusRes = validateTaskStatus(payload.status);
    if (!statusRes.isValid && statusRes.error) {
      errors.status = statusRes.error;
    }
  }

  if (payload.priority !== undefined) {
    const priRes = validateTaskPriority(payload.priority);
    if (!priRes.isValid && priRes.error) {
      errors.priority = priRes.error;
    }
  }

  if (payload.category !== undefined) {
    const catRes = validateTaskCategory(payload.category);
    if (!catRes.isValid && catRes.error) {
      errors.category = catRes.error;
    }
  }

  if (payload.due_at !== undefined) {
    const dueRes = validateTaskDueAt(payload.due_at);
    if (!dueRes.isValid && dueRes.error) {
      errors.due_at = dueRes.error;
    }
  }

  if (payload.estimated_minutes !== undefined) {
    const minsRes = validateTaskEstimatedMinutes(payload.estimated_minutes);
    if (!minsRes.isValid && minsRes.error) {
      errors.estimated_minutes = minsRes.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
