"use client";

import React, { useState, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Loader2,
  AlertCircle,
  RotateCcw,
  Search,
  Home,
  CheckSquare,
  BarChart3,
  User,
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
    <div className="relative min-h-screen bg-gradient-to-b from-[#CCD5FA]/50 via-[#DDE4FC]/40 to-[#EEF3FE] dark:from-[#0E111E] dark:via-[#111425] dark:to-[#0A0C16] text-[#15192B] dark:text-neutral-100 font-sans pb-28 md:pb-16 selection:bg-[#5D64D9]/20">
      {/* ── Ambient Background Blur Shapes ── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#B8C6F9]/30 dark:bg-[#1D2447]/20 blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#D4DCFC]/30 dark:bg-[#1A2040]/20 blur-3xl" />
      </div>

      <div className="max-w-[1060px] xl:max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* ── Top Bar: Back Button ── */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1D30] border border-white/80 dark:border-neutral-800 shadow-xs flex items-center justify-center text-[#15192B] dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* ── Headline: "Your tasks" matching Image 3 ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#15192B] dark:text-white tracking-tight">
              Your tasks
            </h1>
            <p className="text-xs sm:text-sm text-[#7A82A6] dark:text-neutral-400 font-medium mt-1">
              Organize study sessions, assignments, coding practice, and project milestones.
            </p>
          </div>

          {/* Desktop "+ New Task" Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-lg shadow-[#5D64D9]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>

        {/* ── Action Error Alert ── */}
        {actionError && (
          <div
            role="alert"
            className="p-3.5 rounded-[20px] bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs"
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
            className="text-xs sm:text-sm font-bold text-[#5D64D9] dark:text-indigo-400 hover:text-[#4A50BC] hover:underline cursor-pointer transition-colors"
          >
            View All
          </button>
        </div>

        {/* ── 4. Main Tasks Content Area ── */}
        <div className="space-y-3">
          {isLoading || isAuthLoading ? (
            <div className="py-16 text-center space-y-3 bg-white/75 dark:bg-[#1A1D30]/80 backdrop-blur-md rounded-[28px] border border-white/80 dark:border-white/10 shadow-xs">
              <Loader2 className="w-7 h-7 text-[#5D64D9] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-[#7A82A6] dark:text-neutral-400">
                Loading your tasks...
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3 bg-white/75 dark:bg-[#1A1D30]/80 backdrop-blur-md rounded-[28px] border border-rose-200/80 dark:border-rose-950/50 p-6 shadow-xs">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#5D64D9] bg-[#EEF1FE] hover:bg-[#DDE4FC] dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            </div>
          ) : allTasks.length === 0 ? (
            /* Empty Database State */
            <div className="py-16 text-center space-y-3 bg-white/80 dark:bg-[#1A1D30]/85 backdrop-blur-md rounded-[28px] border border-white/80 dark:border-white/10 p-6 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#5D64D9]/10 text-[#5D64D9] dark:text-indigo-400 flex items-center justify-center mx-auto">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#5D64D9] hover:bg-[#4D54C7] shadow-md shadow-[#5D64D9]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create your first task</span>
              </button>
            </div>
          ) : visibleTasks.length === 0 ? (
            /* No Search/Filter Results State */
            <div className="py-12 text-center space-y-3 bg-white/80 dark:bg-[#1A1D30]/85 backdrop-blur-md rounded-[28px] border border-white/80 dark:border-white/10 p-6 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 text-[#7A82A6] dark:text-neutral-400 flex items-center justify-center mx-auto">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5D64D9] bg-[#EEF1FE] hover:bg-[#DDE4FC] dark:bg-indigo-950/50 transition-colors cursor-pointer"
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

      {/* ── Fixed Mobile Bottom Navigation Bar (Image 3 Style) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#151828]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-neutral-800/80 py-2 px-6 flex items-center justify-around md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => handleViewChange("all")}
          className="flex flex-col items-center gap-0.5 text-[#8C93B3] hover:text-[#15192B] dark:hover:text-white cursor-pointer"
          aria-label="Home"
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* 2. Tasks (Active) */}
        <button
          type="button"
          onClick={() => handleViewChange("all")}
          className="flex flex-col items-center gap-0.5 text-[#5D64D9] dark:text-indigo-400 font-bold cursor-pointer"
          aria-label="Tasks"
        >
          <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px]">Tasks</span>
        </button>

        {/* 3. Center Floating (+) Action Button */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="w-12 h-12 rounded-full bg-[#5D64D9] hover:bg-[#4D54C7] text-white flex items-center justify-center shadow-xl shadow-[#5D64D9]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer -mt-6 border-4 border-[#DCE3FB] dark:border-[#0E111E]"
          aria-label="Create new task"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Progress */}
        <button
          type="button"
          onClick={() => handleViewChange("completed")}
          className="flex flex-col items-center gap-0.5 text-[#8C93B3] hover:text-[#15192B] dark:hover:text-white cursor-pointer"
          aria-label="Progress"
        >
          <BarChart3 className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-semibold">Progress</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 text-[#8C93B3] hover:text-[#15192B] dark:hover:text-white cursor-pointer"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
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
