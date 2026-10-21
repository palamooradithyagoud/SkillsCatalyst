/**
 * frontend/types/task.ts
 * Type definitions and constants for the SkillsCatalyst To-Do List & Task Management system.
 */

export type TaskStatus = "todo" | "in_progress" | "completed" | "past_due";

export type TaskPriority = "low" | "medium" | "high";

export type TaskCategory =
  | "Study"
  | "Assignments"
  | "Projects"
  | "Hackathons"
  | "Career"
  | "Personal"
  | "Other";

export type TaskView =
  | "all"
  | "today"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "past_due";

export type TaskSortField = "due_date" | "priority" | "created_at";
export type TaskSortOrder = "asc" | "desc";

export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_at: string | null;
  time_range?: string | null;
  collaborators?: string[];
  estimated_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_at?: string | null;
  time_range?: string | null;
  collaborators?: string[];
  estimated_minutes?: number | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_at?: string | null;
  time_range?: string | null;
  collaborators?: string[];
  estimated_minutes?: number | null;
  completed_at?: string | null;
}

export interface StudyBuddy {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
}

export const AVAILABLE_STUDY_BUDDIES: readonly StudyBuddy[] = [
  { id: "buddy-1", name: "Sarah Jenkins", initials: "SJ", avatarBg: "from-rose-400 to-pink-500", role: "Frontend Peer" },
  { id: "buddy-2", name: "Alex Chen", initials: "AC", avatarBg: "from-blue-400 to-indigo-500", role: "DSA Partner" },
  { id: "buddy-3", name: "Liam Vance", initials: "LV", avatarBg: "from-amber-400 to-orange-500", role: "System Design" },
  { id: "buddy-4", name: "Priya Patel", initials: "PP", avatarBg: "from-emerald-400 to-teal-500", role: "AI Mentor" },
  { id: "buddy-5", name: "Marcus Wong", initials: "MW", avatarBg: "from-purple-400 to-violet-500", role: "Backend Peer" },
] as const;

export interface CreateSubtaskPayload {
  task_id: string;
  title: string;
}

export interface UpdateSubtaskPayload {
  title?: string;
  is_completed?: boolean;
}

export interface TaskFilterOptions {
  search?: string;
  status?: "all" | TaskStatus;
  priority?: "all" | TaskPriority;
  category?: "all" | TaskCategory;
  completion?: "all" | "active" | "completed";
  sortBy?: TaskSortField;
  sortOrder?: TaskSortOrder;
  view?: TaskView;
}

export interface TaskMetrics {
  dueTodayCount: number;
  overdueCount: number;
  inProgressCount: number;
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

export const TASK_CATEGORIES: readonly TaskCategory[] = [
  "Study",
  "Assignments",
  "Projects",
  "Hackathons",
  "Career",
  "Personal",
  "Other",
] as const;

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  "low",
  "medium",
  "high",
] as const;

export const TASK_STATUSES: readonly TaskStatus[] = [
  "todo",
  "in_progress",
  "completed",
  "past_due",
] as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  past_due: "Past Due",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_VIEW_LABELS: Record<TaskView, string> = {
  all: "All Tasks",
  today: "Today",
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  past_due: "Past Due",
};
