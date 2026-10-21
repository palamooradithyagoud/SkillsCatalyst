"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ListTodo,
  ArrowRight,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, updateTask, createTask } from "@/lib/api/tasks";
import { useAuth } from "@/lib/auth";
import { Task, TaskMetrics } from "@/types/task";
import { calculateTaskMetrics, formatDueDate, isDueToday, isOverdue } from "@/lib/tasks/dateUtils";
import TaskModal from "@/components/tasks/TaskModal";

export default function TaskDashboardWidget() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(),
    enabled: !!userId,
  });

  const toggleMutation = useMutation({
    mutationFn: (task: Task) => {
      const nextStatus = task.status === "completed" ? "todo" : "completed";
      return updateTask(task.id, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const metrics: TaskMetrics = calculateTaskMetrics(tasks);
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const displayTasks = pendingTasks.slice(0, 3);

  return (
    <>
      <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-4">
        {/* ── Widget Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#635BFF] dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                To-Do List
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                {metrics.dueTodayCount} due today • {metrics.overdueCount} overdue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              aria-label="Add new task"
            >
              <Plus className="w-4 h-4" />
            </button>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#635BFF] dark:text-indigo-400 hover:text-indigo-700 p-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              aria-label="View all tasks"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Mini Progress Bar ── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
            <span>Overall Progress</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {metrics.completionPercentage}% ({metrics.completedCount}/{metrics.totalCount})
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#635BFF] to-emerald-500 transition-all duration-500"
              style={{ width: `${metrics.completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={metrics.completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion progress"
            />
          </div>
        </div>

        {/* ── Quick Tasks List ── */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-neutral-500">
              Loading tasks...
            </div>
          ) : displayTasks.length === 0 ? (
            <div className="py-5 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-80" />
              <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                All caught up!
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                No pending tasks right now.
              </p>
            </div>
          ) : (
            displayTasks.map((t) => {
              const overdue = isOverdue(t.due_at, t.status);
              const dueToday = isDueToday(t.due_at);

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-700/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(t)}
                      className="w-4 h-4 rounded-md border border-slate-300 dark:border-neutral-600 hover:border-[#635BFF] bg-white dark:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      aria-label={`Mark task completed: ${t.title}`}
                    >
                      {t.status === "completed" && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </span>
                  </div>

                  {t.due_at && (
                    <div
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold shrink-0 ${
                        overdue
                          ? "text-rose-600 dark:text-rose-400"
                          : dueToday
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-400 dark:text-neutral-500"
                      }`}
                    >
                      {overdue ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{formatDueDate(t.due_at)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />
    </>
  );
}
