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
      {/* Left: Dropdowns matching Image 2 */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Time Frame Dropdown */}
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(e.target.value as QuestionPeriod)}
            className="appearance-none bg-white border border-slate-300/90 hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm font-semibold pl-3.5 pr-8 py-2 rounded-xl outline-none shadow-2xs transition-all cursor-pointer min-w-[125px]"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.value === "all" ? "All Time" : p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Difficulty Dropdown (matching Image 2) */}
        <div className="relative">
          <select
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value)}
            className="appearance-none bg-white border border-slate-300/90 hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm font-semibold pl-3.5 pr-8 py-2 rounded-xl outline-none shadow-2xs transition-all cursor-pointer min-w-[125px]"
          >
            <option value="All">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value as PracticeStatus)}
            className="appearance-none bg-white border border-slate-300/90 hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm font-semibold pl-3.5 pr-8 py-2 rounded-xl outline-none shadow-2xs transition-all cursor-pointer min-w-[115px]"
          >
            <option value="All">Status: All</option>
            <option value="Unsolved">Unsolved</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Reset Filter Button if active */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right: Search question title */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search question title..."
          className="w-full bg-white border border-slate-300/90 hover:border-slate-400 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-8 py-2 rounded-xl transition-all shadow-2xs outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
