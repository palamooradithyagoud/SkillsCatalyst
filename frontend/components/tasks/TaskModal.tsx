"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Clock,
  Users,
  Lock,
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
  AVAILABLE_STUDY_BUDDIES,
} from "@/types/task";
import { validateTaskForm } from "@/lib/tasks/validation";
import { toDateTimeLocalString } from "@/lib/tasks/dateUtils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  initialTask?: Task | null;
}

const TIME_RANGE_PRESETS = [
  "10:00-11:30 PM",
  "12:00-01:00 PM",
  "02:00-03:30 PM",
  "04:00-05:00 PM",
  "06:30-08:00 PM",
];

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
  const [timeRange, setTimeRange] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || "");
        setDescription(initialTask.description || "");
        setStatus(initialTask.status || "todo");
        setPriority(initialTask.priority || "medium");
        setCategory(initialTask.category || "Study");
        setDueAt(toDateTimeLocalString(initialTask.due_at));
        setTimeRange(initialTask.time_range || "");
        setCollaborators(initialTask.collaborators || []);
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
        setTimeRange("10:00-11:30 PM");
        setCollaborators([]);
        setEstimatedMinutes("");
      }
      setErrors({});
      setIsSubmitting(false);

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialTask]);

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
      time_range: timeRange.trim() || null,
      collaborators,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18191F] rounded-[28px] border border-slate-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* ── Fixed Sticky Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0 bg-white dark:bg-[#18191F]">
          <div>
            <h2
              id="task-modal-title"
              className="text-base sm:text-lg font-black text-[#15192B] dark:text-white"
            >
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#7A82A6] dark:text-neutral-400 mt-0.5">
              {isEditing
                ? "Update task details, schedule, and study buddies"
                : "Add a task with scheduled time and peer study buddies"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#121318] transition-colors cursor-pointer"
            aria-label="Close task modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Form with Scrollable Body & Sticky Footer ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {errors.form && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs font-semibold"
              >
                {errors.form}
              </div>
            )}

            {/* Task Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="task-title-input"
                  className="text-xs font-bold text-[#15192B] dark:text-neutral-200"
                >
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                  {title.length}/255
                </span>
              </div>
              <input
                ref={titleInputRef}
                id="task-title-input"
                type="text"
                required
                maxLength={255}
                placeholder=""
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#121318] border ${
                  errors.title
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200/80 dark:border-neutral-800 focus:border-[#5D64D9] dark:focus:border-[#B892FF]"
                } text-[#15192B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D64D9]/20 dark:focus:ring-[#B892FF]/20 transition-all`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Subtitle / Description */}
            <div>
              <label
                htmlFor="task-desc-input"
                className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
              >
                Subtitle / Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="task-desc-input"
                type="text"
                maxLength={4000}
                placeholder=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5D64D9]/20 dark:focus:ring-[#B892FF]/20 focus:border-[#5D64D9] dark:focus:border-[#B892FF] transition-all"
              />
            </div>

            {/* ── Time Range / Schedule ── */}
            <div className="p-3.5 rounded-2xl bg-[#EEF1FE]/40 dark:bg-[#121318] border border-[#5D64D9]/20 dark:border-[#B892FF]/20 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="task-time-range-input"
                  className="text-xs font-bold text-[#15192B] dark:text-white flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-[#5D64D9] dark:text-[#C4A1FF]" />
                  <span>Time Range / Schedule</span>
                </label>
                <span className="text-[10px] text-[#7A82A6] dark:text-neutral-400">
                  Shown on top of task card
                </span>
              </div>

              <input
                id="task-time-range-input"
                type="text"
                placeholder="10:00-11:30 PM"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18191F] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF]"
              />

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-semibold text-[#7A82A6] dark:text-neutral-400 mr-1">
                  Presets:
                </span>
                {TIME_RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTimeRange(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                      timeRange === preset
                        ? "bg-[#5D64D9] text-white dark:bg-[#B892FF] dark:text-[#0F0A1C] dark:font-bold"
                        : "bg-white dark:bg-[#18191F] text-[#555E8D] dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-800 hover:border-[#5D64D9] dark:hover:border-[#B892FF]/50"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Study Buddies / Collaborators (Locked & Coming Soon) ── */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#5D64D9] dark:text-[#C4A1FF]" />
                  <span className="text-xs font-bold text-[#15192B] dark:text-white">
                    Study Buddies / Collaborators
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" />
                  Coming Soon
                </span>
              </div>

              {/* 3-column locked buddy cards preview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 opacity-60 pointer-events-none select-none">
                {AVAILABLE_STUDY_BUDDIES.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white/80 dark:bg-[#18191F] text-left"
                  >
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${buddy.avatarBg} text-white flex items-center justify-center text-[10px] font-black shrink-0`}
                    >
                      {buddy.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#15192B] dark:text-white truncate">
                        {buddy.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                        {buddy.role}
                      </p>
                    </div>
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Locked custom peer input */}
              <div className="flex items-center gap-2 pt-0.5 opacity-60">
                <input
                  type="text"
                  disabled
                  placeholder="Study buddy collaboration coming soon..."
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#18191F] border border-slate-200/90 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#18191F] border dark:border-neutral-800 text-slate-400 dark:text-neutral-500 cursor-not-allowed flex items-center gap-1 shrink-0"
                >
                  <Lock className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* ── Category & Priority ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="task-category-select"
                  className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
                >
                  Category
                </label>
                <select
                  id="task-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
                >
                  {TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-priority-select"
                  className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
                >
                  Priority
                </label>
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
                >
                  {TASK_PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>
                      {TASK_PRIORITY_LABELS[pr]} Priority
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Calendar Deadline & Duration ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="task-due-input"
                  className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
                >
                  Calendar Deadline <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="task-due-input"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => {
                    setDueAt(e.target.value);
                    if (errors.due_at) setErrors((prev) => ({ ...prev, due_at: "" }));
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="task-duration-input"
                    className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
                  >
                    Est. Duration
                  </label>
                  <input
                    id="task-duration-input"
                    type="number"
                    min="0"
                    max="10080"
                    step="5"
                    placeholder="Minutes"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF]"
                  />
                </div>

                {isEditing && (
                  <div className="flex-1">
                    <label
                      htmlFor="task-status-select"
                      className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="task-status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
                    >
                      {TASK_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {TASK_STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Fixed Sticky Modal Footer ── */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-neutral-800 shrink-0 bg-white/95 dark:bg-[#18191F]/95 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:text-[#15192B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121318] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-md shadow-[#5D64D9]/25 dark:bg-[#B892FF] dark:hover:bg-[#A87FFF] dark:text-[#0F0A1C] dark:font-bold dark:shadow-[0_4px_20px_rgba(184,146,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
