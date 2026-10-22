"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  Layers,
  X,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  TaskActionProposal,
  ProposedTaskItem,
  ScheduledPlanItem,
  SchedulePlanData,
} from "@/types/ai-mentor-tasks";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TaskCategory,
  TaskPriority,
} from "@/types/task";
import {
  validateTaskTitle,
  validateTaskCategory,
  validateTaskPriority,
  validateTaskDueAt,
  validateTaskEstimatedMinutes,
} from "@/lib/tasks/validation";
import { executeTaskAction, cancelTaskAction } from "@/lib/api/ai-mentor-tasks";

interface TaskActionCardProps {
  proposal: TaskActionProposal;
  onActionComplete?: (actionId: string, resultMessage: string) => void;
  onActionCancel?: (actionId: string) => void;
}

export function TaskActionCard({
  proposal,
  onActionComplete,
  onActionCancel,
}: TaskActionCardProps) {
  // State machine: pending | submitting | completed | canceled | expired | error
  const [cardStatus, setCardStatus] = useState<
    "pending" | "submitting" | "completed" | "canceled" | "expired" | "error"
  >(() =>
    proposal.status ||
      (new Date(proposal.expires_at).getTime() < Date.now() ? "expired" : "pending")
  );

  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    proposal.result_message || ""
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    proposal.error_message || ""
  );

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Editable single proposal data
  const [editedTitle, setEditedTitle] = useState(
    String(proposal.proposed_data?.title || proposal.existing_task?.title || "")
  );
  const [editedDescription, setEditedDescription] = useState(
    String(proposal.proposed_data?.description || proposal.existing_task?.description || "")
  );
  const [editedCategory, setEditedCategory] = useState<TaskCategory>(
    (proposal.proposed_data?.category || proposal.existing_task?.category || "Other") as TaskCategory
  );
  const [editedPriority, setEditedPriority] = useState<TaskPriority>(
    (proposal.proposed_data?.priority || proposal.existing_task?.priority || "medium") as TaskPriority
  );
  const [editedDueAt, setEditedDueAt] = useState<string>(
    String(proposal.proposed_data?.due_at || proposal.existing_task?.due_at || "")
  );
  const [editedEstimatedMinutes, setEditedEstimatedMinutes] = useState<string>(
    proposal.proposed_data?.estimated_minutes != null
      ? String(proposal.proposed_data.estimated_minutes)
      : ""
  );

  // Editable batch proposals
  const [batchTasks, setBatchTasks] = useState<ProposedTaskItem[]>(
    proposal.proposed_tasks || []
  );

  // Editable schedule plan proposals
  const [schedulePlan] = useState<SchedulePlanData | undefined>(
    proposal.schedule_plan
  );
  const [planItems, setPlanItems] = useState<ScheduledPlanItem[]>(
    proposal.schedule_plan?.items || []
  );

  // Stable client-side idempotency key generated once per card instance
  const [idempotencyKey] = useState<string>(() => {
    return `idemp_${proposal.action_id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });

  // Client-side field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateEditedFields = (): boolean => {
    const errs: Record<string, string> = {};

    const titleCheck = validateTaskTitle(editedTitle);
    if (!titleCheck.isValid && titleCheck.error) {
      errs.title = titleCheck.error;
    }

    const catCheck = validateTaskCategory(editedCategory);
    if (!catCheck.isValid && catCheck.error) {
      errs.category = catCheck.error;
    }

    const priCheck = validateTaskPriority(editedPriority);
    if (!priCheck.isValid && priCheck.error) {
      errs.priority = priCheck.error;
    }

    if (editedDueAt) {
      const dueCheck = validateTaskDueAt(editedDueAt);
      if (!dueCheck.isValid && dueCheck.error) {
        errs.due_at = dueCheck.error;
      }
    }

    if (editedEstimatedMinutes) {
      const minsCheck = validateTaskEstimatedMinutes(editedEstimatedMinutes);
      if (!minsCheck.isValid && minsCheck.error) {
        errs.estimated_minutes = minsCheck.error;
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = async () => {
    if (new Date(proposal.expires_at).getTime() < Date.now()) {
      setCardStatus("expired");
      setErrorMessage("This proposal has expired. Please ask again.");
      return;
    }

    if (
      proposal.action_type === "create_task" ||
      proposal.action_type === "update_task"
    ) {
      if (!validateEditedFields()) return;
    }

    setCardStatus("submitting");
    setErrorMessage("");

    try {
      let editedData: Record<string, unknown> | undefined = undefined;
      let editedTasksPayload: ProposedTaskItem[] | undefined = undefined;
      let editedPlanPayload: SchedulePlanData | undefined = undefined;

      if (
        proposal.action_type === "create_task" ||
        proposal.action_type === "update_task"
      ) {
        editedData = {
          title: editedTitle.trim(),
          description: editedDescription.trim(),
          category: editedCategory,
          priority: editedPriority,
          due_at: editedDueAt.trim() || null,
          estimated_minutes: editedEstimatedMinutes ? Number(editedEstimatedMinutes) : null,
        };
      } else if (proposal.action_type === "batch_create_tasks") {
        if (batchTasks.length === 0) {
          throw new Error("No tasks selected to create.");
        }
        editedTasksPayload = batchTasks;
      } else if (proposal.action_type === "apply_schedule_plan") {
        if (planItems.length === 0) {
          throw new Error("No tasks remaining in the schedule plan.");
        }
        editedPlanPayload = {
          ...schedulePlan,
          items: planItems,
        };
      }

      const res = await executeTaskAction({
        action_id: proposal.action_id,
        approval_token: proposal.approval_token,
        idempotency_key: idempotencyKey,
        edited_data: editedData,
        edited_tasks: editedTasksPayload,
        edited_plan: editedPlanPayload,
      });

      setCardStatus("completed");
      const msg = res.message || "Operation executed successfully.";
      setFeedbackMessage(msg);
      if (onActionComplete) {
        onActionComplete(proposal.action_id, msg);
      }
    } catch (err: unknown) {
      setCardStatus("error");
      const error = err as Error;
      setErrorMessage(error?.message || "Failed to execute approved action.");
    }
  };

  const handleCancel = async () => {
    setCardStatus("canceled");
    setFeedbackMessage("Action canceled. No changes were made.");
    try {
      await cancelTaskAction(proposal.action_id, proposal.approval_token);
    } catch {
      // Local cancel state preserved
    }
    if (onActionCancel) {
      onActionCancel(proposal.action_id);
    }
  };

  const handleRemoveBatchItem = (index: number) => {
    setBatchTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePlanItem = (index: number) => {
    setPlanItems((prev) => prev.filter((_, i) => i !== index));
  };

  const formatIsoDate = (isoStr?: string | null): string => {
    if (!isoStr) return "No deadline";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "low":
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  // Completed State View
  if (cardStatus === "completed") {
    return (
      <div className="my-3 p-3.5 sm:p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-neutral-900 dark:text-neutral-100 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Approved and Executed
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {feedbackMessage || "Task operation completed successfully."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Canceled State View
  if (cardStatus === "canceled") {
    return (
      <div className="my-3 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400 text-xs flex items-center gap-2">
        <X className="h-4 w-4 text-neutral-400 shrink-0" />
        <span>Action canceled. No changes were made to your To-Do List.</span>
      </div>
    );
  }

  // Expired State View
  if (cardStatus === "expired") {
    return (
      <div className="my-3 p-3 sm:p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <span>This proposal has expired. Please request the action again.</span>
      </div>
    );
  }

  return (
    <div className="my-3.5 w-full max-w-full rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-white dark:bg-[#13141a] shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-4 py-2.5 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {proposal.action_type === "create_task" && (
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          )}
          {proposal.action_type === "batch_create_tasks" && (
            <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          )}
          {proposal.action_type === "update_task" && (
            <Edit3 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          )}
          {proposal.action_type === "complete_task" && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          {proposal.action_type === "reopen_task" && (
            <RotateCcw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          )}
          {proposal.action_type === "delete_task" && (
            <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          )}
          {proposal.action_type === "apply_schedule_plan" && (
            <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          )}
          <span className="text-[11.5px] font-semibold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
            {proposal.action_type === "create_task" && "Proposed Task Creation"}
            {proposal.action_type === "batch_create_tasks" && `Proposed Batch (${batchTasks.length} Tasks)`}
            {proposal.action_type === "update_task" && "Proposed Task Update"}
            {proposal.action_type === "complete_task" && "Confirm Task Completion"}
            {proposal.action_type === "reopen_task" && "Confirm Task Reopening"}
            {proposal.action_type === "delete_task" && "Confirm Task Deletion"}
            {proposal.action_type === "apply_schedule_plan" && `Proposed Schedule (${planItems.length} Tasks)`}
          </span>
        </div>

        {/* Edit toggle for single creation or update */}
        {(proposal.action_type === "create_task" || proposal.action_type === "update_task") && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            <span>{isEditing ? "View summary" : "Edit fields"}</span>
          </button>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-3.5 text-xs text-neutral-800 dark:text-neutral-200">
        {/* Error notification if submission failed */}
        {cardStatus === "error" && errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SINGLE TASK CREATION / UPDATE */}
        {(proposal.action_type === "create_task" || proposal.action_type === "update_task") && (
          <>
            {isEditing ? (
              /* Editable Input Form */
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    placeholder="Task title"
                  />
                  {fieldErrors.title && (
                    <span className="text-[11px] text-rose-500 mt-0.5 block">{fieldErrors.title}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
                    placeholder="Add any notes or context..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value as TaskCategory)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                    >
                      {TASK_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer capitalize"
                    >
                      {TASK_PRIORITIES.map((pri) => (
                        <option key={pri} value={pri} className="capitalize">
                          {pri}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Deadline (Due Date)
                    </label>
                    <input
                      type="text"
                      value={editedDueAt}
                      onChange={(e) => setEditedDueAt(e.target.value)}
                      placeholder="e.g. 2026-10-23T18:00:00"
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    {fieldErrors.due_at && (
                      <span className="text-[11px] text-rose-500 mt-0.5 block">{fieldErrors.due_at}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Est. Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={editedEstimatedMinutes}
                      onChange={(e) => setEditedEstimatedMinutes(e.target.value)}
                      placeholder="e.g. 60"
                      min={0}
                      max={10080}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    {fieldErrors.estimated_minutes && (
                      <span className="text-[11px] text-rose-500 mt-0.5 block">
                        {fieldErrors.estimated_minutes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Read-Only Summary Preview */
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-white leading-snug">
                    {editedTitle || "Untitled Task"}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium border capitalize ${getPriorityBadgeClass(
                      editedPriority
                    )}`}
                  >
                    {editedPriority}
                  </span>
                </div>

                {editedDescription && (
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs line-clamp-2">
                    {editedDescription}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-purple-500" />
                    <span>{editedCategory}</span>
                  </span>

                  {editedDueAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-purple-500" />
                      <span>{formatIsoDate(editedDueAt)}</span>
                    </span>
                  )}

                  {editedEstimatedMinutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-purple-500" />
                      <span>{editedEstimatedMinutes} mins</span>
                    </span>
                  )}
                </div>

                {/* If update action, show what changed */}
                {proposal.action_type === "update_task" && proposal.existing_task && (
                  <div className="mt-2.5 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-400 block">
                      Target task:
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {proposal.existing_task.title}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 2. BATCH TASK CREATION PREVIEW */}
        {proposal.action_type === "batch_create_tasks" && (
          <div className="space-y-2">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              The following {batchTasks.length} tasks will be created upon your confirmation:
            </p>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {batchTasks.map((t, idx) => (
                <div
                  key={t.temp_id || idx}
                  className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-neutral-400">#{idx + 1}</span>
                      <span className="font-medium text-xs text-neutral-900 dark:text-white truncate">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span className="px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800">
                        {t.category}
                      </span>
                      <span className={`capitalize ${getPriorityBadgeClass(t.priority)} px-1.5 rounded`}>
                        {t.priority}
                      </span>
                      {t.due_at && <span>{formatIsoDate(t.due_at)}</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBatchItem(idx)}
                    className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove from batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TASK COMPLETION PREVIEW */}
        {proposal.action_type === "complete_task" && proposal.existing_task && (
          <div className="space-y-1.5">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Mark the following task as completed in your To-Do List?
            </p>
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {proposal.existing_task.title}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                {proposal.existing_task.status}
              </span>
            </div>
          </div>
        )}

        {/* 4. TASK REOPEN PREVIEW */}
        {proposal.action_type === "reopen_task" && proposal.existing_task && (
          <div className="space-y-1.5">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Reopen this completed task back to your active list?
            </p>
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {proposal.existing_task.title}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Completed
              </span>
            </div>
          </div>
        )}

        {/* 5. TASK DELETION PREVIEW */}
        {proposal.action_type === "delete_task" && proposal.existing_task && (
          <div className="space-y-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
            <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
              Are you sure you want to permanently delete this task?
            </p>
            <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60">
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {proposal.existing_task.title}
              </span>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              This operation cannot be undone once confirmed.
            </p>
          </div>
        )}

        {/* 6. SMART SCHEDULE PLAN PREVIEW */}
        {proposal.action_type === "apply_schedule_plan" && schedulePlan && (
          <div className="space-y-3">
            {/* Plan Header Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-950 dark:text-purple-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-800/60">
                  {schedulePlan.plan_period || "Daily Plan"}
                </span>
                {schedulePlan.target_date && (
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3 text-purple-500" />
                    <span>{schedulePlan.target_date}</span>
                  </span>
                )}
              </div>
              {schedulePlan.total_allocated_minutes != null && schedulePlan.total_allocated_minutes > 0 && (
                <span className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  <span>{schedulePlan.total_allocated_minutes} mins allocated</span>
                </span>
              )}
            </div>

            {/* Overload Warning Callout */}
            {schedulePlan.overload_warning && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Workload Advisory:</span>
                  <p className="leading-relaxed">{schedulePlan.overload_warning}</p>
                </div>
              </div>
            )}

            {/* Global Schedule Warnings */}
            {schedulePlan.warnings && schedulePlan.warnings.length > 0 && (
              <div className="p-2.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] space-y-1">
                <span className="font-semibold block text-neutral-800 dark:text-neutral-200">Schedule Notes:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {schedulePlan.warnings.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scheduled Tasks Timeline */}
            <div className="space-y-2">
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Planned Time Blocks ({planItems.length} tasks):
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {planItems.map((item, idx) => {
                  const hasConflict = item.is_conflict || (item.warnings && item.warnings.length > 0);
                  return (
                    <div
                      key={item.task_id || idx}
                      className={`p-3 rounded-xl border transition-all ${
                        hasConflict
                          ? "border-amber-300/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/15"
                          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(item.time_range || item.start_time) && (
                              <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40">
                                {item.time_range || (item.start_time ? formatIsoDate(item.start_time) : "")}
                              </span>
                            )}
                            <span className={`capitalize text-[10px] px-1.5 py-0.5 rounded font-medium ${getPriorityBadgeClass(String(item.priority || "medium"))}`}>
                              {String(item.priority || "medium")}
                            </span>
                            {item.estimated_minutes != null && (
                              <span className="text-[10.5px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.estimated_minutes}m</span>
                              </span>
                            )}
                          </div>

                          <h5 className="font-semibold text-xs text-neutral-900 dark:text-white truncate pt-0.5">
                            {item.title}
                          </h5>

                          {item.reason && (
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {item.reason}
                            </p>
                          )}

                          {item.warnings && item.warnings.length > 0 && (
                            <div className="pt-1 space-y-0.5">
                              {item.warnings.map((w, wIdx) => (
                                <div key={wIdx} className="flex items-center gap-1.5 text-[10.5px] text-amber-700 dark:text-amber-400">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>{w}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePlanItem(idx)}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                          title="Remove from plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="px-4 py-3 border-t border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={cardStatus === "submitting"}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={
            cardStatus === "submitting" ||
            (proposal.action_type === "batch_create_tasks" && batchTasks.length === 0) ||
            (proposal.action_type === "apply_schedule_plan" && planItems.length === 0)
          }
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${
            proposal.action_type === "delete_task"
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {cardStatus === "submitting" ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>
                {proposal.action_type === "create_task" && "Confirm and Create"}
                {proposal.action_type === "batch_create_tasks" && `Confirm and Create All (${batchTasks.length})`}
                {proposal.action_type === "update_task" && "Confirm Changes"}
                {proposal.action_type === "complete_task" && "Confirm Complete"}
                {proposal.action_type === "reopen_task" && "Confirm Reopen"}
                {proposal.action_type === "delete_task" && "Confirm Deletion"}
                {proposal.action_type === "apply_schedule_plan" && `Confirm Schedule (${planItems.length})`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
