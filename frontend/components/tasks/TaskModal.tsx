"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Calendar,
  Clock,
  Flag,
  Tag,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/types/task";
import { validateTaskForm } from "@/lib/tasks/validation";
import { toDateTimeLocalString } from "@/lib/tasks/dateUtils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  initialTask?: Task | null;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
}: TaskModalProps) {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<TaskCategory>("Study");
  const [dueAt, setDueAt] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state whenever modal opens or initialTask changes
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || "");
        setDescription(initialTask.description || "");
        setStatus(initialTask.status || "todo");
        setPriority(initialTask.priority || "medium");
        setCategory(initialTask.category || "Study");
        setDueAt(toDateTimeLocalString(initialTask.due_at));
        setEstimatedMinutes(
          initialTask.estimated_minutes !== null &&
            initialTask.estimated_minutes !== undefined
            ? String(initialTask.estimated_minutes)
            : ""
        );
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setCategory("Study");
        setDueAt("");
        setEstimatedMinutes("");
      }
      setErrors({});
      setIsSubmitting(false);

      // Autofocus title after animation frame
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialTask]);

  // Handle escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const payload: CreateTaskPayload & UpdateTaskPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      estimated_minutes: estimatedMinutes.trim() ? parseInt(estimatedMinutes, 10) : null,
    };

    const validation = validateTaskForm(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to save task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h2
              id="task-modal-title"
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white"
            >
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              {isEditing
                ? "Update task details, deadline, and priority"
                : "Add a new task to your personal study and career checklist"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close task modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Form ── */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.form && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs font-semibold"
            >
              {errors.form}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="task-title-input"
                className="text-xs font-bold text-slate-700 dark:text-neutral-300"
              >
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                {title.length}/255
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g., Complete Dynamic Programming problems"
              maxLength={255}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-neutral-800/80 border ${
                errors.title
                  ? "border-rose-400 dark:border-rose-600 focus:ring-rose-500/20"
                  : "border-slate-200/80 dark:border-neutral-700 focus:border-[#635BFF] focus:ring-[#635BFF]/20"
              } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.title && (
              <p id="task-title-error" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="task-desc-input"
                className="text-xs font-bold text-slate-700 dark:text-neutral-300"
              >
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                {description.length}/4000
              </span>
            </div>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Add additional context, notes, or references..."
              maxLength={4000}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] transition-all resize-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label
                htmlFor="task-category-select"
                className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1"
              >
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="task-priority-select"
                className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1"
              >
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
              >
                {TASK_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {TASK_PRIORITY_LABELS[pr]} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <div>
              <label
                htmlFor="task-due-input"
                className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1"
              >
                Deadline <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="task-due-input"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => {
                  setDueAt(e.target.value);
                  if (errors.due_at) setErrors((prev) => ({ ...prev, due_at: "" }));
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border ${
                  errors.due_at
                    ? "border-rose-400"
                    : "border-slate-200/80 dark:border-neutral-700"
                } text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer`}
              />
              {errors.due_at && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.due_at}
                </p>
              )}
            </div>

            {/* Estimated Duration */}
            <div>
              <label
                htmlFor="task-duration-input"
                className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1"
              >
                Est. Minutes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="task-duration-input"
                type="number"
                min="0"
                max="10080"
                step="5"
                placeholder="e.g. 45"
                value={estimatedMinutes}
                onChange={(e) => {
                  setEstimatedMinutes(e.target.value);
                  if (errors.estimated_minutes)
                    setErrors((prev) => ({ ...prev, estimated_minutes: "" }));
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border ${
                  errors.estimated_minutes
                    ? "border-rose-400"
                    : "border-slate-200/80 dark:border-neutral-700"
                } text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF]`}
              />
              {errors.estimated_minutes && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.estimated_minutes}
                </p>
              )}
            </div>
          </div>

          {/* Status (when editing or creating) */}
          <div>
            <label
              htmlFor="task-status-select"
              className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1"
            >
              Initial Status
            </label>
            <select
              id="task-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
            >
              {TASK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {TASK_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* ── Modal Footer ── */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5442F6] to-[#635BFF] hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
