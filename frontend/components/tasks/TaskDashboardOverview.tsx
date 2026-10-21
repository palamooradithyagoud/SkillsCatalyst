"use client";

import React from "react";
import {
  Calendar,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { TaskMetrics } from "@/types/task";

interface TaskDashboardOverviewProps {
  metrics: TaskMetrics;
  onViewChange?: (view: "all" | "today" | "upcoming" | "in_progress" | "completed") => void;
  activeView?: string;
}

export default function TaskDashboardOverview({
  metrics,
  onViewChange,
  activeView = "all",
}: TaskDashboardOverviewProps) {
  const {
    dueTodayCount,
    overdueCount,
    inProgressCount,
    completedCount,
    totalCount,
    completionPercentage,
  } = metrics;

  return (
    <div className="w-full space-y-3.5">
      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Due Today */}
        <button
          type="button"
          onClick={() => onViewChange?.("today")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeView === "today"
              ? "bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-500/50 shadow-sm"
              : "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-800/60"
          }`}
          aria-label={`View ${dueTodayCount} tasks due today`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              Due Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {dueTodayCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              tasks
            </span>
          </div>
        </button>

        {/* 2. Overdue */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            overdueCount > 0
              ? "bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-500/50"
              : "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              Overdue
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {overdueCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              requiring attention
            </span>
          </div>
        </div>

        {/* 3. In Progress */}
        <button
          type="button"
          onClick={() => onViewChange?.("in_progress")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeView === "in_progress"
              ? "bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-500/50 shadow-sm"
              : "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800/60"
          }`}
          aria-label={`View ${inProgressCount} tasks in progress`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              active
            </span>
          </div>
        </button>

        {/* 4. Completed */}
        <button
          type="button"
          onClick={() => onViewChange?.("completed")}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeView === "completed"
              ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/50 shadow-sm"
              : "bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-800/60"
          }`}
          aria-label={`View ${completedCount} completed tasks`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {completedCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              finished
            </span>
          </div>
        </button>
      </div>

      {/* ── Completion Progress Bar Card ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#635BFF] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Overall Task Completion
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              {completedCount} of {totalCount} task{totalCount === 1 ? "" : "s"} completed
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#635BFF] to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall task completion progress"
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-200 shrink-0 w-11 text-right">
            {completionPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
