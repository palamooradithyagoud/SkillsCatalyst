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
  Users,
  Check,
  Plus,
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
  StudyBuddy,
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
  const [customBuddy, setCustomBuddy] = useState("");
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
        setCollaborators(["Sarah Jenkins", "Alex Chen"]);
        setEstimatedMinutes("");
      }
      setCustomBuddy("");
      setErrors({});
      setIsSubmitting(false);

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

  const toggleBuddy = (name: string) => {
    setCollaborators((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  const handleAddCustomBuddy = () => {
    const trimmed = customBuddy.trim();
    if (trimmed && !collaborators.includes(trimmed)) {
      setCollaborators((prev) => [...prev, trimmed]);
      setCustomBuddy("");
    }
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181B2B] rounded-[28px] border border-slate-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2
              id="task-modal-title"
              className="text-base sm:text-lg font-black text-[#15192B] dark:text-white"
            >
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-xs text-[#7A82A6] dark:text-neutral-400 mt-0.5">
              {isEditing
                ? "Update task details, time slot, and study buddies"
                : "Add a task with scheduled time and peer study buddies"}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
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
                className="text-xs font-bold text-[#15192B] dark:text-neutral-200"
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
              required
              maxLength={255}
              placeholder="e.g. Discussion Flow or LeetCode DP Practice"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-neutral-800/80 border ${
                errors.title
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200/80 dark:border-neutral-700 focus:border-[#5D64D9]"
              } text-[#15192B] dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5D64D9]/20 transition-all`}
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
              placeholder="e.g. Stay connected, effortlessly or Work smarter and faster."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 text-[#15192B] dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5D64D9]/20 focus:border-[#5D64D9] transition-all"
            />
          </div>

          {/* ── Time Range (e.g. 10:00-11:30 PM) Matching Image 3 ── */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#EEF1FE]/50 dark:bg-[#1E2238]/60 border border-[#5D64D9]/20">
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-time-range-input"
                className="text-xs font-bold text-[#15192B] dark:text-white flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#5D64D9] dark:text-indigo-400" />
                <span>Time Range / Schedule</span>
              </label>
              <span className="text-[10px] text-[#7A82A6] dark:text-neutral-400">
                Shown on top of task card
              </span>
            </div>

            <input
              id="task-time-range-input"
              type="text"
              placeholder="e.g. 10:00-11:30 PM or 12:00-01:00 PM"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-[#15192B] dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#5D64D9]"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-[#7A82A6]">Presets:</span>
              {TIME_RANGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTimeRange(preset)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    timeRange === preset
                      ? "bg-[#5D64D9] text-white"
                      : "bg-white dark:bg-neutral-800 text-[#555E8D] dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 hover:border-[#5D64D9]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* ── Study Buddies / Collaborators Avatars Matching Image 3 ── */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#5D64D9] dark:text-indigo-400" />
                <span className="text-xs font-bold text-[#15192B] dark:text-white">
                  Study Buddies / Collaborators
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#5D64D9] dark:text-indigo-400">
                {collaborators.length} selected
              </span>
            </div>

            {/* Buddy Avatars Picker */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {AVAILABLE_STUDY_BUDDIES.map((buddy) => {
                const isSelected = collaborators.includes(buddy.name);
                return (
                  <button
                    key={buddy.id}
                    type="button"
                    onClick={() => toggleBuddy(buddy.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#1E2238] border-[#5D64D9] ring-2 ring-[#5D64D9]/20 shadow-xs"
                        : "bg-white/80 dark:bg-neutral-800/80 border-slate-200/80 dark:border-neutral-700 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${buddy.avatarBg} text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs`}
                    >
                      {buddy.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#15192B] dark:text-white truncate leading-tight">
                        {buddy.name}
                      </p>
                      <p className="text-[9px] text-[#7A82A6] dark:text-neutral-400 truncate">
                        {buddy.role}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 text-[#5D64D9] dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom buddy input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Or type a custom peer name..."
                value={customBuddy}
                onChange={(e) => setCustomBuddy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomBuddy();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-[#15192B] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5D64D9]"
              />
              <button
                type="button"
                onClick={handleAddCustomBuddy}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#5D64D9] text-white hover:bg-[#4D54C7] transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
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
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] cursor-pointer"
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
                className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
              >
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] cursor-pointer"
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
                className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border ${
                  errors.due_at
                    ? "border-rose-400"
                    : "border-slate-200/80 dark:border-neutral-700"
                } text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] cursor-pointer`}
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
                className="block text-xs font-bold text-[#15192B] dark:text-neutral-200 mb-1"
              >
                Est. Minutes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="task-duration-input"
                type="number"
                min="0"
                max="10080"
                step="5"
                placeholder="e.g. 90"
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
                } text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9]`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
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
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] cursor-pointer"
            >
              {TASK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {TASK_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* ── Modal Footer ── */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:text-[#15192B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-md shadow-[#5D64D9]/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
