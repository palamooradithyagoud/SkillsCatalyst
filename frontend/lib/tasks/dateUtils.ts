/**
 * frontend/lib/tasks/dateUtils.ts
 * Timezone-aware date calculations, formatting, view filters, and task metrics.
 * Uses local calendar day comparisons to prevent UTC/local-time shifts.
 */

import {
  Task,
  TaskFilterOptions,
  TaskMetrics,
  TaskPriority,
  TaskStatus,
  TaskView,
} from "@/types/task";

/**
 * Returns whether a given due date falls on the current local calendar day.
 */
export function isDueToday(
  dueAt: string | null | undefined,
  refDate: Date = new Date()
): boolean {
  if (!dueAt) return false;
  const d = new Date(dueAt);
  if (isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === refDate.getFullYear() &&
    d.getMonth() === refDate.getMonth() &&
    d.getDate() === refDate.getDate()
  );
}

/**
 * Returns whether a task is overdue:
 * - Deadline is present and in the past
 * - Status is NOT 'completed'
 */
export function isOverdue(
  dueAt: string | null | undefined,
  status: TaskStatus,
  refDate: Date = new Date()
): boolean {
  if (status === "completed" || !dueAt) return false;
  const d = new Date(dueAt);
  if (isNaN(d.getTime())) return false;

  return d.getTime() < refDate.getTime();
}

/**
 * Returns whether a task deadline is upcoming (strictly after the current local calendar day).
 */
export function isUpcoming(
  dueAt: string | null | undefined,
  refDate: Date = new Date()
): boolean {
  if (!dueAt) return false;
  const d = new Date(dueAt);
  if (isNaN(d.getTime())) return false;

  const tomorrowStart = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return d.getTime() >= tomorrowStart.getTime();
}

/**
 * Converts a date or ISO string to format suitable for HTML datetime-local input (YYYY-MM-DDTHH:mm).
 */
export function toDateTimeLocalString(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formats a due date for display with local time and relative calendar hints.
 */
export function formatDueDate(
  dueAt: string | null | undefined,
  refDate: Date = new Date()
): string {
  if (!dueAt) return "No deadline";
  const d = new Date(dueAt);
  if (isNaN(d.getTime())) return "Invalid date";

  const isToday = isDueToday(dueAt, refDate);

  // Check tomorrow
  const tomorrow = new Date(refDate);
  tomorrow.setDate(refDate.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  // Check yesterday
  const yesterday = new Date(refDate);
  yesterday.setDate(refDate.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;

  const sameYear = d.getFullYear() === refDate.getFullYear();
  const dateStr = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Priority numeric rank for deterministic sorting.
 * high (3) > medium (2) > low (1)
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Computes dashboard overview statistics strictly from authorized task records.
 * Avoids division-by-zero.
 */
export function calculateTaskMetrics(
  tasks: Task[],
  refDate: Date = new Date()
): TaskMetrics {
  const totalCount = tasks.length;
  let completedCount = 0;
  let inProgressCount = 0;
  let dueTodayCount = 0;
  let overdueCount = 0;

  for (const t of tasks) {
    if (t.status === "completed") {
      completedCount++;
    } else {
      if (t.status === "in_progress") {
        inProgressCount++;
      }
      if (isDueToday(t.due_at, refDate)) {
        dueTodayCount++;
      }
      if (isOverdue(t.due_at, t.status, refDate)) {
        overdueCount++;
      }
    }
  }

  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    dueTodayCount,
    overdueCount,
    inProgressCount,
    completedCount,
    totalCount,
    completionPercentage,
  };
}

/**
 * Filters and sorts an array of tasks according to the active view and user filter options.
 */
export function filterAndSortTasks(
  tasks: Task[],
  options: TaskFilterOptions,
  refDate: Date = new Date()
): Task[] {
  const {
    search = "",
    status = "all",
    priority = "all",
    category = "all",
    completion = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    view = "all",
  } = options;

  const cleanSearch = search.trim().toLowerCase();

  return tasks
    .filter((task) => {
      // 1. View filtering
      if (view === "today") {
        if (!isDueToday(task.due_at, refDate)) return false;
      } else if (view === "upcoming") {
        if (!isUpcoming(task.due_at, refDate)) return false;
      } else if (view === "in_progress") {
        if (task.status !== "in_progress") return false;
      } else if (view === "completed") {
        if (task.status !== "completed") return false;
      }

      // 2. Search query by title (and optionally description)
      if (cleanSearch) {
        const titleMatch = task.title.toLowerCase().includes(cleanSearch);
        const descMatch = (task.description || "").toLowerCase().includes(cleanSearch);
        if (!titleMatch && !descMatch) return false;
      }

      // 3. Status filter
      if (status !== "all" && task.status !== status) {
        return false;
      }

      // 4. Priority filter
      if (priority !== "all" && task.priority !== priority) {
        return false;
      }

      // 5. Category filter
      if (category !== "all" && task.category !== category) {
        return false;
      }

      // 6. Completion filter
      if (completion === "active" && task.status === "completed") {
        return false;
      }
      if (completion === "completed" && task.status !== "completed") {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const orderFactor = sortOrder === "asc" ? 1 : -1;

      if (sortBy === "due_date") {
        // Nulls always sort to the end regardless of sort direction
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        const diff = new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        return diff * orderFactor;
      }

      if (sortBy === "priority") {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
        const diff = weightA - weightB;
        return diff * orderFactor;
      }

      // Default: created_at
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return (timeA - timeB) * orderFactor;
    });
}
