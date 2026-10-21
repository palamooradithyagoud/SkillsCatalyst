"use client";

import React from "react";
import {
  Check,
  Clock,
  AlertCircle,
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

  // Format estimated minutes into human readable duration e.g. "1h 30m"
  const formatDuration = (minutes: number | null | undefined): string => {
    if (!minutes || minutes <= 0) return "Flexible";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const renderPriorityBadge = (priority: TaskPriority) => {
    if (priority === "high") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
          <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
          <span>High</span>
        </span>
      );
    }
    if (priority === "medium") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
          <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
          <span>Med</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
        <ArrowDown className="w-2.5 h-2.5 stroke-[2.5]" />
        <span>Low</span>
      </span>
    );
  };

  // Determine label for the dark status pill matching Image 2
  const getStatusPillLabel = () => {
    if (isCompleted) return "Completed";
    if (overdue || task.status === "past_due") return "Past Due";
    if (dueToday) return "Today";
    if (task.status === "in_progress") return "In Progress";
    return "Scheduled";
  };

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-[26px] sm:rounded-[30px] border transition-all duration-200 ${
        isCompleted
          ? "bg-white/60 dark:bg-[#161826]/70 border-slate-200/50 dark:border-neutral-800/50 opacity-85"
          : overdue
          ? "bg-white dark:bg-[#1A1D30] border-rose-300/80 dark:border-rose-900/50 shadow-[0_4px_24px_rgba(244,63,94,0.06)]"
          : "bg-white dark:bg-[#1A1D30] border-white/90 dark:border-neutral-800 shadow-[0_4px_24px_rgba(93,100,217,0.04)] hover:shadow-lg hover:border-[#5D64D9]/40"
      }`}
    >
      {/* ── Top Row: Time / Schedule Badge & Tags ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A82A6] dark:text-neutral-400">
          {overdue ? (
            <div className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Overdue: {formatDueDate(task.due_at)}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#5D64D9] dark:text-indigo-400" />
              <span>{task.due_at ? formatDueDate(task.due_at) : "Flexible timing"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              CATEGORY_STYLES[task.category] || CATEGORY_STYLES.Other
            }`}
          >
            {task.category}
          </span>
          {renderPriorityBadge(task.priority)}
        </div>
      </div>

      {/* ── Main Content: Title & Subtitle ── */}
      <div className="mt-2.5 space-y-1">
        <button
          type="button"
          onClick={() => onOpenDetails(task)}
          className="text-left w-full cursor-pointer group-hover:text-[#5D64D9] transition-colors"
          aria-label={`Open details for task: ${task.title}`}
        >
          <h3
            className={`text-base sm:text-lg font-black leading-snug break-words ${
              isCompleted
                ? "line-through text-slate-400 dark:text-neutral-500"
                : "text-[#15192B] dark:text-white"
            }`}
          >
            {task.title}
          </h3>
        </button>

        {task.description ? (
          <p className="text-xs sm:text-sm text-[#7A82A6] dark:text-neutral-400 line-clamp-1 font-medium">
            {task.description}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[#7A82A6] dark:text-neutral-400 font-medium">
            {task.category} track milestone
          </p>
        )}
      </div>

      {/* ── Subtasks Progress Bar (if subtasks exist) ── */}
      {totalSubtasks > 0 && (
        <div
          className="mt-3 flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-neutral-800/50 p-2 rounded-xl"
          onClick={() => onOpenDetails(task)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenDetails(task);
            }
          }}
          aria-label={`Subtasks progress: ${completedSubtasks} of ${totalSubtasks} completed.`}
        >
          <ListTree className="w-3.5 h-3.5 text-[#5D64D9] dark:text-indigo-400 shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5D64D9] to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${subtaskPct}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#15192B] dark:text-white shrink-0">
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}

      {/* ── Bottom Row: Capsule Pills & Circular Action Button ── */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-3">
        {/* Left Capsule Pills matching Image 2 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Dark Capsule */}
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#181A24] dark:bg-neutral-900 text-white shadow-xs">
            {getStatusPillLabel()}
          </span>

          {/* 2. Light Periwinkle Duration Capsule */}
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EEF1FE] dark:bg-[#252945] text-[#555E8D] dark:text-[#9AA5D8]">
            {formatDuration(task.estimated_minutes)}
          </span>
        </div>

        {/* Right Actions: Circular Action Button + Desktop Quick Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Hover Icons */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onOpenDetails(task)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label={`View details for ${task.title}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              aria-label={`Edit ${task.title}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent Circular Action Button matching Image 2 */}
          <button
            type="button"
            onClick={() => onToggleStatus(task)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#5D64D9]/25 hover:scale-105 active:scale-95 ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#5D64D9] hover:bg-[#4D54C7] text-white"
            }`}
            aria-label={
              isCompleted
                ? `Mark task as uncompleted: ${task.title}`
                : `Complete task: ${task.title}`
            }
          >
            <Check
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isCompleted ? "stroke-[3]" : "stroke-[2.5]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
