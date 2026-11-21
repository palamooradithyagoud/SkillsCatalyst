"use client";

import React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { QuestionPeriod } from "@/lib/api";
import { PERIODS, DIFFICULTIES, STATUS_OPTIONS, PracticeStatus } from "@/data/practice/constants";

interface CompanyQuestionFiltersProps {
  selectedPeriod: QuestionPeriod;
  onSelectPeriod: (period: QuestionPeriod) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  selectedStatus: PracticeStatus;
  onSelectStatus: (status: PracticeStatus) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function CompanyQuestionFilters({
  selectedPeriod,
  onSelectPeriod,
  selectedDifficulty,
  onSelectDifficulty,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchQueryChange,
}: CompanyQuestionFiltersProps) {
  const hasActiveFilters =
    selectedPeriod !== "all" ||
    selectedDifficulty !== "All" ||
    selectedStatus !== "All" ||
    searchQuery.trim().length > 0;

  const handleReset = () => {
    onSelectPeriod("all");
    onSelectDifficulty("All");
    onSelectStatus("All");
    onSearchQueryChange("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 select-none">
      {/* Left: Dropdowns row (Guaranteed single line on mobile) */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 flex-1 sm:flex-initial">
          {/* Time Frame Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => onSelectPeriod(e.target.value as QuestionPeriod)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-[#18191F] border border-slate-300/90 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38]/20 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold pl-2 sm:pl-3.5 pr-6 sm:pr-8 py-2 rounded-xl outline-none shadow-none transition-all cursor-pointer truncate sm:min-w-[125px]"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value} className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">
                  {p.value === "all" ? "All Time" : p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Difficulty Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => onSelectDifficulty(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-[#18191F] border border-slate-300/90 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38]/20 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold pl-2 sm:pl-3.5 pr-6 sm:pr-8 py-2 rounded-xl outline-none shadow-none transition-all cursor-pointer truncate sm:min-w-[125px]"
            >
              <option value="All" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Difficulty</option>
              <option value="Easy" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Easy</option>
              <option value="Medium" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Medium</option>
              <option value="Hard" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Hard</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value as PracticeStatus)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-[#18191F] border border-slate-300/90 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38]/20 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold pl-2 sm:pl-3.5 pr-6 sm:pr-8 py-2 rounded-xl outline-none shadow-none transition-all cursor-pointer truncate sm:min-w-[115px]"
            >
              <option value="All" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Status: All</option>
              <option value="Unsolved" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Unsolved</option>
              <option value="Completed" className="bg-white dark:bg-[#18191F] text-slate-900 dark:text-white">Completed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#24271F] transition-colors cursor-pointer shrink-0"
            title="Reset filters"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Right: Search question title */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search question title..."
          className="w-full bg-white dark:bg-[#18191F] border border-slate-300/90 dark:border-[#24271F] hover:border-slate-400 dark:hover:border-neutral-600 focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:bg-white dark:focus:bg-[#18191F] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs font-bold pl-10 pr-8 py-2 rounded-xl transition-all shadow-none outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
