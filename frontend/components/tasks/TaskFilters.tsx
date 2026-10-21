"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TaskFilterOptions,
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <div className="w-full space-y-2.5 bg-white/75 dark:bg-[#18191F] backdrop-blur-md p-3.5 sm:p-4 rounded-[24px] border border-white/80 dark:border-neutral-800 shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* ── Top Bar: Search Input + Toggle Advanced + Reset ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C93B3] dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            id="task-search-input"
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#121318] border border-slate-200/70 dark:border-neutral-800 text-[#15192B] dark:text-white placeholder-[#8C93B3] dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#5D64D9]/30 dark:focus:ring-[#B892FF]/20 focus:border-[#5D64D9] dark:focus:border-[#B892FF] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C93B3] hover:text-[#15192B] dark:hover:text-white rounded-md cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              showAdvanced || hasActiveFilters
                ? "bg-[#EEF1FE] text-[#5D64D9] border-[#5D64D9]/30 dark:bg-[#B892FF]/15 dark:text-[#E9D5FF] dark:border-[#B892FF]/40"
                : "bg-white dark:bg-[#121318] border-slate-200/80 dark:border-neutral-800 text-[#7A82A6] hover:text-[#15192B] dark:hover:text-white"
            }`}
            aria-label="Toggle advanced filters"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 dark:bg-[#121318] transition-colors cursor-pointer"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Collapsible Advanced Filters Row ── */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="filter-status"
              className="block text-[11px] font-semibold text-[#7A82A6] dark:text-neutral-400 mb-1"
            >
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status || "all"}
              onChange={(e) =>
                onChange({ status: e.target.value as "all" | any })
              }
              aria-label="Filter tasks by status"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
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
              className="block text-[11px] font-semibold text-[#7A82A6] dark:text-neutral-400 mb-1"
            >
              Priority
            </label>
            <select
              id="filter-priority"
              value={filters.priority || "all"}
              onChange={(e) =>
                onChange({ priority: e.target.value as "all" | any })
              }
              aria-label="Filter tasks by priority"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
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
              className="block text-[11px] font-semibold text-[#7A82A6] dark:text-neutral-400 mb-1"
            >
              Category
            </label>
            <select
              id="filter-category"
              value={filters.category || "all"}
              onChange={(e) =>
                onChange({ category: e.target.value as "all" | any })
              }
              aria-label="Filter tasks by category"
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {TASK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label
              htmlFor="filter-sort-by"
              className="block text-[11px] font-semibold text-[#7A82A6] dark:text-neutral-400 mb-1"
            >
              Sort By
            </label>
            <div className="flex items-center gap-1.5">
              <select
                id="filter-sort-by"
                value={filters.sortBy || "created_at"}
                onChange={(e) =>
                  onChange({ sortBy: e.target.value as any })
                }
                aria-label="Sort tasks by field"
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#15192B] dark:text-white focus:outline-none focus:border-[#5D64D9] dark:focus:border-[#B892FF] cursor-pointer"
              >
                <option value="created_at">Date Created</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority Level</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                  })
                }
                className="p-1.5 rounded-lg bg-white dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-800 text-[#7A82A6] hover:text-[#15192B] dark:hover:text-[#C4A1FF] transition-colors cursor-pointer shrink-0"
                aria-label={`Current sort order: ${filters.sortOrder}. Click to toggle.`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
