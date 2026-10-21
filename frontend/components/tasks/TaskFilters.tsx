"use client";

import React from "react";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskFilterOptions,
  TaskSortField,
  TaskSortOrder,
} from "@/types/task";

interface TaskFiltersProps {
  filters: TaskFilterOptions;
  onChange: (updated: Partial<TaskFilterOptions>) => void;
  onReset: () => void;
}

export default function TaskFilters({
  filters,
  onChange,
  onReset,
}: TaskFiltersProps) {
  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.status && filters.status !== "all") ||
      (filters.priority && filters.priority !== "all") ||
      (filters.category && filters.category !== "all") ||
      (filters.completion && filters.completion !== "all") ||
      (filters.sortBy && filters.sortBy !== "created_at") ||
      (filters.sortOrder && filters.sortOrder !== "desc")
  );

  return (
    <div className="w-full space-y-2.5 bg-white dark:bg-neutral-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
      {/* ── Top Bar: Search Input + Reset Button ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            id="task-search-input"
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white rounded-md cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer shrink-0"
            aria-label="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* ── Filters Row: Status, Priority, Category, Sorting ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800/80">
        {/* Status Filter */}
        <div>
          <label
            htmlFor="filter-status"
            className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1"
          >
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status || "all"}
            onChange={(e) =>
              onChange({ status: e.target.value as "all" | TaskStatus })
            }
            aria-label="Filter tasks by status"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {TASK_STATUSES.map((st) => (
              <option key={st} value={st}>
                {TASK_STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label
            htmlFor="filter-priority"
            className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1"
          >
            Priority
          </label>
          <select
            id="filter-priority"
            value={filters.priority || "all"}
            onChange={(e) =>
              onChange({ priority: e.target.value as "all" | TaskPriority })
            }
            aria-label="Filter tasks by priority"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
          >
            <option value="all">All Priorities</option>
            {TASK_PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {TASK_PRIORITY_LABELS[pr]}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor="filter-category"
            className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category || "all"}
            onChange={(e) =>
              onChange({ category: e.target.value as "all" | TaskCategory })
            }
            aria-label="Filter tasks by category"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {TASK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By & Order */}
        <div>
          <label
            htmlFor="sort-field"
            className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1"
          >
            Sort By
          </label>
          <div className="flex items-center gap-1">
            <select
              id="sort-field"
              value={filters.sortBy || "created_at"}
              onChange={(e) =>
                onChange({ sortBy: e.target.value as TaskSortField })
              }
              aria-label="Sort tasks by field"
              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF] cursor-pointer"
            >
              <option value="created_at">Date Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onChange({
                  sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                })
              }
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
              aria-label={`Toggle sort direction. Currently ${
                filters.sortOrder === "asc" ? "ascending" : "descending"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
