"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  ListTree,
  Clock,
  Calendar,
  Timer,
  Flag,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Task,
  Subtask,
  TaskPriority,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/types/task";
import { formatDueDate, isDueToday, isOverdue } from "@/lib/tasks/dateUtils";
import { validateSubtaskTitle } from "@/lib/tasks/validation";

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateSubtask: (taskId: string, title: string) => Promise<void>;
  onUpdateSubtask: (subtaskId: string, taskId: string, isCompleted: boolean, title?: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string, taskId: string) => Promise<void>;
}

export default function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: TaskDetailDrawerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [subtaskError, setSubtaskError] = useState("");

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const isCompleted = task.status === "completed";
  const overdue = isOverdue(task.due_at, task.status);
  const dueToday = isDueToday(task.due_at);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;
  const subtaskPct =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateSubtaskTitle(newSubtaskTitle);
    if (!val.isValid) {
      setSubtaskError(val.error || "Invalid subtask title.");
      return;
    }

    try {
      setIsAddingSubtask(true);
      setSubtaskError("");
      await onCreateSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    } catch (err: any) {
      setSubtaskError(err.message || "Failed to add subtask.");
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleSaveSubtaskTitle = async (subtaskId: string) => {
    const val = validateSubtaskTitle(editingTitle);
    if (!val.isValid) {
      setSubtaskError(val.error || "Invalid subtask title.");
      return;
    }

    try {
      setSubtaskError("");
      const sub = subtasks.find((s) => s.id === subtaskId);
      await onUpdateSubtask(subtaskId, task.id, sub?.is_completed || false, editingTitle.trim());
      setEditingSubtaskId(null);
      setEditingTitle("");
    } catch (err: any) {
      setSubtaskError(err.message || "Failed to update subtask.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-task-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border-l border-slate-200/80 dark:border-neutral-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250">
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Task Details
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#635BFF] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              aria-label={`Edit task: ${task.title}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteTask(task)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              aria-label={`Delete task: ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close task details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Title & Checkbox */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isCompleted
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-slate-300 dark:border-neutral-700 hover:border-[#635BFF] bg-white dark:bg-neutral-800"
              }`}
              aria-label={isCompleted ? "Reopen task" : "Mark task as completed"}
            >
              {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <div className="flex-1 min-w-0">
              <h2
                id="drawer-task-title"
                className={`text-lg sm:text-xl font-black leading-snug break-words ${
                  isCompleted
                    ? "line-through text-slate-400 dark:text-neutral-500"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {task.title}
              </h2>
              <span
                className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  task.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : task.status === "in_progress"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Notes & Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Category */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Category
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {task.category}
              </p>
            </div>

            {/* Priority */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Flag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Priority
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {TASK_PRIORITY_LABELS[task.priority]}
              </p>
            </div>

            {/* Deadline */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Deadline
                </span>
              </div>
              <p
                className={`text-xs sm:text-sm font-bold ${
                  overdue
                    ? "text-rose-600 dark:text-rose-400"
                    : dueToday
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {formatDueDate(task.due_at)}
              </p>
            </div>

            {/* Est. Duration */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Timer className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Estimated Time
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {task.estimated_minutes !== null && task.estimated_minutes !== undefined
                  ? `${task.estimated_minutes} min`
                  : "Not set"}
              </p>
            </div>
          </div>

          {/* ── Subtasks Section ── */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTree className="w-4 h-4 text-[#635BFF] dark:text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Subtasks
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({completedSubtasks}/{totalSubtasks})
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {totalSubtasks > 0 && (
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskPct}%` }}
                />
              </div>
            )}

            {/* Subtask Error alert */}
            {subtaskError && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs font-semibold"
              >
                {subtaskError}
              </div>
            )}

            {/* Subtasks List */}
            <div className="space-y-1.5">
              {subtasks.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-neutral-500 py-1">
                  No subtasks added yet. Break down this task into smaller steps below.
                </p>
              ) : (
                subtasks.map((sub) => {
                  const isEditingThis = editingSubtaskId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="group/sub flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-700/60 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSubtask(sub.id, task.id, !sub.is_completed)
                        }
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          sub.is_completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                        }`}
                        aria-label={
                          sub.is_completed
                            ? `Mark subtask incomplete: ${sub.title}`
                            : `Mark subtask complete: ${sub.title}`
                        }
                      >
                        {sub.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {isEditingThis ? (
                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveSubtaskTitle(sub.id);
                              } else if (e.key === "Escape") {
                                setEditingSubtaskId(null);
                              }
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSubtaskTitle(sub.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded-md cursor-pointer"
                            aria-label="Save subtask title"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubtaskId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                            aria-label="Cancel editing subtask title"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`flex-1 text-xs break-words ${
                            sub.is_completed
                              ? "line-through text-slate-400 dark:text-neutral-500"
                              : "text-slate-800 dark:text-neutral-200"
                          }`}
                        >
                          {sub.title}
                        </span>
                      )}

                      {!isEditingThis && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubtaskId(sub.id);
                              setEditingTitle(sub.title);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-md cursor-pointer"
                            aria-label={`Edit subtask title: ${sub.title}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSubtask(sub.id, task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                            aria-label={`Delete subtask: ${sub.title}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => {
                  setNewSubtaskTitle(e.target.value);
                  if (subtaskError) setSubtaskError("");
                }}
                placeholder="Add a new subtask..."
                maxLength={255}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#635BFF]"
              />
              <button
                type="submit"
                disabled={isAddingSubtask || !newSubtaskTitle.trim()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#635BFF] hover:bg-[#5442F6] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label="Add subtask"
              >
                {isAddingSubtask ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Created {new Date(task.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
