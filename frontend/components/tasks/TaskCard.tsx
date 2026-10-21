"use client";

import React from "react";
import {
  Check,
  Clock,
  AlertCircle,
  Calendar,
  Timer,
  Edit3,
  Trash2,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ListTree,
} from "lucide-react";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/types/task";
import { formatDueDate, isDueToday, isOverdue } from "@/lib/tasks/dateUtils";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onOpenDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Study: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
  Assignments: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60",
  Projects: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60",
  Hackathons: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
  Career: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
  Personal: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
  Other: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
};

export default function TaskCard({
  task,
  onToggleStatus,
  onOpenDetails,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const overdue = isOverdue(task.due_at, task.status);
  const dueToday = isDueToday(task.due_at);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;
  const subtaskPct =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Render priority icon and style
  const renderPriorityBadge = (priority: TaskPriority) => {
    if (priority === "high") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
          <ArrowUp className="w-3 h-3 stroke-[2.5]" />
          <span>High</span>
        </span>
      );
    }
    if (priority === "medium") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          <span>Med</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
        <ArrowDown className="w-3 h-3 stroke-[2.5]" />
        <span>Low</span>
      </span>
    );
  };

  return (
    <div
      className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? "bg-slate-50/70 dark:bg-neutral-900/40 border-slate-200/60 dark:border-neutral-800/60 opacity-80"
          : overdue
          ? "bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/40 hover:border-rose-300"
          : "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 hover:border-[#635BFF]/40 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* ── Checkbox Toggle ── */}
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isCompleted
              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
              : "border-slate-300 dark:border-neutral-700 hover:border-[#635BFF] bg-white dark:bg-neutral-800"
          }`}
          aria-label={
            isCompleted
              ? `Reopen task: ${task.title}`
              : `Mark task as completed: ${task.title}`
          }
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* ── Main Content Area ── */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top Line: Category, Priority, and Status Pill */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                CATEGORY_STYLES[task.category] || CATEGORY_STYLES.Other
              }`}
            >
              {task.category}
            </span>

            {renderPriorityBadge(task.priority)}

            {task.status === "in_progress" && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-300">
                In Progress
              </span>
            )}
          </div>

          {/* Title */}
          <button
            type="button"
            onClick={() => onOpenDetails(task)}
            className="text-left w-full cursor-pointer group-hover:text-[#635BFF] transition-colors"
          >
            <h3
              className={`text-sm sm:text-base font-bold leading-snug break-words ${
                isCompleted
                  ? "line-through text-slate-400 dark:text-neutral-500"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {task.title}
            </h3>
          </button>

          {/* Description Preview (if present) */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Subtasks Progress Bar (if subtasks exist) */}
          {totalSubtasks > 0 && (
            <div
              className="pt-1 flex items-center gap-2 cursor-pointer"
              onClick={() => onOpenDetails(task)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenDetails(task);
                }
              }}
              aria-label={`View subtasks. ${completedSubtasks} of ${totalSubtasks} completed.`}
            >
              <ListTree className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden max-w-[120px]">
                <div
                  className="h-full bg-[#635BFF] rounded-full transition-all"
                  style={{ width: `${subtaskPct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Metadata Row: Deadlines and Estimated Duration */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-500 dark:text-neutral-400">
            {task.due_at && (
              <div
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  overdue
                    ? "text-rose-600 dark:text-rose-400 font-semibold"
                    : dueToday
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-slate-500 dark:text-neutral-400"
                }`}
              >
                {overdue ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span>
                  {overdue ? "Overdue: " : ""}
                  {formatDueDate(task.due_at)}
                </span>
              </div>
            )}

            {task.estimated_minutes !== null && task.estimated_minutes !== undefined && (
              <div className="inline-flex items-center gap-1 text-[11px]">
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.estimated_minutes} min</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Quick Actions ── */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => onOpenDetails(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label={`View details and subtasks for: ${task.title}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
            aria-label={`Edit task: ${task.title}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            aria-label={`Delete task: ${task.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
