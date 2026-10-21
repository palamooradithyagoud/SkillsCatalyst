"use client";

import React, { useState, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Loader2,
  AlertCircle,
  RotateCcw,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  Task,
  TaskFilterOptions,
  TaskView,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/types/task";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "@/lib/api/tasks";
import {
  calculateTaskMetrics,
  filterAndSortTasks,
  isDueToday,
  isUpcoming,
} from "@/lib/tasks/dateUtils";

import TaskDashboardOverview from "@/components/tasks/TaskDashboardOverview";
import TaskViewTabs from "@/components/tasks/TaskViewTabs";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import TaskDetailDrawer from "@/components/tasks/TaskDetailDrawer";
import DeleteConfirmDialog from "@/components/tasks/DeleteConfirmDialog";

const DEFAULT_FILTERS: TaskFilterOptions = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  completion: "all",
  sortBy: "created_at",
  sortOrder: "desc",
  view: "all",
};

export default function TasksPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const userId = session?.user_id;
  const queryClient = useQueryClient();

  // State
  const [activeView, setActiveView] = useState<TaskView>("all");
  const [filters, setFilters] = useState<TaskFilterOptions>(DEFAULT_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Queries
  const {
    data: allTasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(),
    enabled: !!userId,
  });

  // Calculate metrics directly from actual authorized records
  const metrics = useMemo(() => {
    return calculateTaskMetrics(allTasks);
  }, [allTasks]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const todayCount = allTasks.filter(
      (t) => t.status !== "completed" && isDueToday(t.due_at)
    ).length;
    const upcomingCount = allTasks.filter(
      (t) => t.status !== "completed" && isUpcoming(t.due_at)
    ).length;
    const inProgressCount = allTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const completedCount = allTasks.filter(
      (t) => t.status === "completed"
    ).length;

    return {
      all: allTasks.length,
      today: todayCount,
      upcoming: upcomingCount,
      in_progress: inProgressCount,
      completed: completedCount,
    };
  }, [allTasks]);

  // Filtered & sorted tasks based on active view and filters
  const visibleTasks = useMemo(() => {
    const combinedOptions: TaskFilterOptions = {
      ...filters,
      view: activeView,
    };
    return filterAndSortTasks(allTasks, combinedOptions);
  }, [allTasks, filters, activeView]);

  // Keep selectedTask in sync when allTasks data updates
  const activeDetailTask = useMemo(() => {
    if (!selectedTask) return null;
    return allTasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [allTasks, selectedTask]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to create task.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
      }
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to update task.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      if (selectedTask?.id === deletedId) {
        setSelectedTask(null);
      }
      setTaskToDelete(null);
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to delete task.");
    },
  });

  // Subtask mutations
  const createSubtaskMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      createSubtask({ task_id: taskId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({
      subtaskId,
      taskId,
      isCompleted,
      title,
    }: {
      subtaskId: string;
      taskId: string;
      isCompleted: boolean;
      title?: string;
    }) =>
      updateSubtask(subtaskId, taskId, {
        is_completed: isCompleted,
        ...(title ? { title } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, taskId }: { subtaskId: string; taskId: string }) =>
      deleteSubtask(subtaskId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  // Action Handlers
  const handleToggleStatus = (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    updateMutation.mutate({
      id: task.id,
      payload: { status: nextStatus },
    });
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: TaskView) => {
    setActiveView(view);
  };

  const handleFilterChange = (updated: Partial<TaskFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="max-w-[1060px] xl:max-w-[1100px] mx-auto space-y-5 pb-16 sm:pb-24">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#5c56df] dark:text-[#818CF8] uppercase">
              STUDY & CAREER PLANNER
            </span>
            <span className="w-4 h-[2px] rounded-full bg-[#5c56df]/50 dark:bg-[#818CF8]/50" />
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            To-Do List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium mt-0.5">
            Organize study sessions, assignments, coding practice, and project milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5442F6] to-[#635BFF] hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* ── Action Error Alert ── */}
      {actionError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 1. Compact Dashboard Overview ── */}
      <TaskDashboardOverview
        metrics={metrics}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* ── 2. Views Navigation Tabs ── */}
      <TaskViewTabs
        activeView={activeView}
        onSelectView={handleViewChange}
        counts={tabCounts}
      />

      {/* ── 3. Filters Bar ── */}
      <TaskFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* ── 4. Main Tasks Content Area ── */}
      <div className="space-y-3">
        {isLoading || isAuthLoading ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800">
            <Loader2 className="w-7 h-7 text-[#635BFF] animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400">
              Loading your tasks...
            </p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-rose-200/80 dark:border-rose-950/50 p-6">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Unable to load tasks
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              {(error as any)?.message || "A database connectivity issue occurred."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#635BFF] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
          </div>
        ) : allTasks.length === 0 ? (
          /* Empty Database State */
          <div className="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#635BFF] dark:text-indigo-400 flex items-center justify-center mx-auto">
              <ListTodo className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No tasks yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
              Your to-do list is empty. Create tasks with due dates, priorities, and subtasks to keep your prep on track.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#635BFF] hover:bg-[#5442F6] shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first task</span>
            </button>
          </div>
        ) : visibleTasks.length === 0 ? (
          /* No Search/Filter Results State */
          <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800 p-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              No matching tasks found
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
              No tasks match your selected view or active filter parameters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#635BFF] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        ) : (
          /* Task Cards List */
          <div className="space-y-2.5">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onOpenDetails={(t) => setSelectedTask(t)}
                onEdit={handleOpenEditModal}
                onDelete={(t) => setTaskToDelete(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals & Drawers ── */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTask={editingTask}
        onSubmit={async (payload) => {
          if (editingTask) {
            await updateMutation.mutateAsync({
              id: editingTask.id,
              payload,
            });
          } else {
            await createMutation.mutateAsync(payload as CreateTaskPayload);
          }
        }}
      />

      <TaskDetailDrawer
        task={activeDetailTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onToggleStatus={handleToggleStatus}
        onEditTask={(t) => {
          setSelectedTask(null);
          handleOpenEditModal(t);
        }}
        onDeleteTask={(t) => {
          setSelectedTask(null);
          setTaskToDelete(t);
        }}
        onCreateSubtask={async (taskId, title) => {
          await createSubtaskMutation.mutateAsync({ taskId, title });
        }}
        onUpdateSubtask={async (subtaskId, taskId, isCompleted, title) => {
          await updateSubtaskMutation.mutateAsync({
            subtaskId,
            taskId,
            isCompleted,
            title,
          });
        }}
        onDeleteSubtask={async (subtaskId, taskId) => {
          await deleteSubtaskMutation.mutateAsync({ subtaskId, taskId });
        }}
      />

      <DeleteConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? All associated subtasks will also be deleted.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteMutation.mutateAsync(taskToDelete.id);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
