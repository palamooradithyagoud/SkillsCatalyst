"use client";

import React, { useState, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Loader2,
  AlertCircle,
  RotateCcw,
  Search,
  ChevronLeft,
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
  isOverdue,
} from "@/lib/tasks/dateUtils";

import TaskDashboardOverview from "@/components/tasks/TaskDashboardOverview";
import TaskViewTabs from "@/components/tasks/TaskViewTabs";
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
    const pastDueCount = allTasks.filter(
      (t) => isOverdue(t.due_at, t.status)
    ).length;

    return {
      all: allTasks.length,
      today: todayCount,
      upcoming: upcomingCount,
      in_progress: inProgressCount,
      completed: completedCount,
      past_due: pastDueCount,
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

  // Section title based on active view
  const sectionTitle = useMemo(() => {
    if (activeView === "today") return "Today's tasks";
    if (activeView === "completed") return "Completed tasks";
    if (activeView === "upcoming") return "Upcoming tasks";
    if (activeView === "past_due") return "Past Due tasks";
    if (activeView === "in_progress") return "In Progress tasks";
    return "All tasks";
  }, [activeView]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#CCD5FA]/50 via-[#DDE4FC]/40 to-[#EEF3FE] dark:bg-black dark:from-black dark:via-black dark:to-black text-[#15192B] dark:text-neutral-100 font-sans pb-28 md:pb-16 selection:bg-[#5D64D9]/20 dark:selection:bg-[#B892FF]/30">
      {/* ── Ambient Background Blur Shapes ── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#B8C6F9]/30 dark:bg-[#B892FF]/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#D4DCFC]/30 dark:bg-[#C4A1FF]/5 blur-3xl pointer-events-none" />
      </div>

      <div className="w-full max-w-[1060px] xl:max-w-[1100px] mx-auto px-0.5 sm:px-4 md:px-6 pt-0 sm:pt-3 space-y-3.5 sm:space-y-5">
        {/* ── Top Bar: Back Button ── */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#18191F] border border-white/80 dark:border-neutral-800 shadow-xs flex items-center justify-center text-[#15192B] dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#202128] dark:hover:border-[#B892FF]/40 dark:hover:text-[#C4A1FF] transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* ── Headline: "Your tasks" matching Image 3 ── */}
        <div className="flex items-center justify-between gap-3 pt-0.5 sm:pt-1">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#15192B] dark:text-white tracking-tight">
              Your tasks
            </h1>
            <p className="text-xs sm:text-sm text-[#7A82A6] dark:text-neutral-400 font-medium mt-0.5 sm:mt-1">
              Organize study sessions, assignments, coding practice, and project milestones.
            </p>
          </div>

          {/* "+ New Task" Button (Single prominent button for both mobile and desktop) */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-lg shadow-[#5D64D9]/25 dark:bg-[#B892FF] dark:hover:bg-[#A87FFF] dark:text-[#0F0A1C] dark:font-black dark:shadow-[0_4px_24px_rgba(184,146,255,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>

        {/* ── Action Error Alert ── */}
        {actionError && (
          <div
            role="alert"
            className="p-3.5 rounded-[20px] bg-rose-50 border border-rose-200 text-rose-800 dark:bg-[#18191F] dark:border-rose-900/60 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs"
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

        {/* ── 1. Bento Dashboard Overview (Today, Completed, Upcoming, Past Due) ── */}
        <TaskDashboardOverview
          metrics={metrics}
          upcomingCount={tabCounts.upcoming}
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        {/* ── 2. Filter Pills Tabs Matching Image 3 (All Tasks, In Progress, Completed, etc.) ── */}
        <TaskViewTabs
          activeView={activeView}
          onSelectView={handleViewChange}
          counts={tabCounts}
        />

        {/* ── 3. Section Header: Active View Name & "View All" ── */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-black text-[#15192B] dark:text-white tracking-tight">
            {sectionTitle}
          </h2>
          <button
            type="button"
            onClick={() => handleViewChange("all")}
            className="text-xs sm:text-sm font-bold text-[#5D64D9] dark:text-[#C4A1FF] hover:text-[#4A50BC] dark:hover:text-[#D8B4FE] hover:underline cursor-pointer transition-colors"
          >
            View All
          </button>
        </div>

        {/* ── 4. Main Tasks Content Area ── */}
        <div className="space-y-3">
          {isLoading || isAuthLoading ? (
            <div className="py-16 text-center space-y-3 bg-white/75 dark:bg-[#18191F] backdrop-blur-md rounded-[28px] border border-white/80 dark:border-neutral-800 shadow-xs">
              <Loader2 className="w-7 h-7 text-[#5D64D9] dark:text-[#C4A1FF] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-[#7A82A6] dark:text-neutral-400">
                Loading your tasks...
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3 bg-white/75 dark:bg-[#18191F] backdrop-blur-md rounded-[28px] border border-rose-200/80 dark:border-rose-900/50 p-6 shadow-xs">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
              <h3 className="text-sm sm:text-base font-bold text-[#15192B] dark:text-white">
                Unable to load tasks
              </h3>
              <p className="text-xs text-[#7A82A6] dark:text-neutral-400 max-w-sm mx-auto">
                {(error as any)?.message || "A database connectivity issue occurred."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#5D64D9] bg-[#EEF1FE] hover:bg-[#DDE4FC] dark:bg-[#121318] dark:border dark:border-[#B892FF]/30 dark:text-[#C4A1FF] dark:hover:bg-[#B892FF]/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            </div>
          ) : allTasks.length === 0 ? (
            /* Empty Database State */
            <div className="py-16 text-center space-y-3 bg-white/80 dark:bg-[#18191F] backdrop-blur-md rounded-[28px] border border-white/80 dark:border-neutral-800 p-6 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5D64D9]/10 text-[#5D64D9] dark:bg-[#121318] dark:border dark:border-neutral-800 dark:text-[#C4A1FF] flex items-center justify-center mx-auto">
                <ListTodo className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#15192B] dark:text-white">
                No tasks yet
              </h3>
              <p className="text-xs sm:text-sm text-[#7A82A6] dark:text-neutral-400 max-w-md mx-auto">
                Your to-do list is empty. Create tasks with due dates, priorities, time ranges, and study buddies to keep your prep on track.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-md shadow-[#5D64D9]/25 dark:bg-[#B892FF] dark:hover:bg-[#A87FFF] dark:text-[#0F0A1C] dark:font-black dark:shadow-[0_4px_24px_rgba(184,146,255,0.35)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create your first task</span>
              </button>
            </div>
          ) : visibleTasks.length === 0 ? (
            /* No Search/Filter Results State */
            <div className="py-12 text-center space-y-3 bg-white/80 dark:bg-[#18191F] backdrop-blur-md rounded-[28px] border border-white/80 dark:border-neutral-800 p-6 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#121318] dark:border dark:border-neutral-800 text-[#7A82A6] dark:text-neutral-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#15192B] dark:text-white">
                No matching tasks found
              </h3>
              <p className="text-xs text-[#7A82A6] dark:text-neutral-400 max-w-sm mx-auto">
                No tasks match your selected view or active filter parameters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5D64D9] bg-[#EEF1FE] hover:bg-[#DDE4FC] dark:bg-[#121318] dark:border dark:border-[#B892FF]/30 dark:text-[#C4A1FF] dark:hover:bg-[#B892FF]/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            </div>
          ) : (
            /* Task Cards List (Image 3 design with time ranges, avatars, and arrow action) */
            <div className="space-y-3">
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
