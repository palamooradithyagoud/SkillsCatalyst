"use client";

import React from "react";
import { Building2, Search, ChevronDown } from "lucide-react";
import { QuestionPeriod } from "@/lib/api";
import {
  TOP_COMPANIES,
  PERIODS,
  DIFFICULTIES,
  STATUS_OPTIONS,
  PracticeDifficulty,
  PracticeStatus,
} from "@/data/practice/constants";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";

interface CompanyControlsPanelProps {
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  filteredCompaniesDropdown: string[];
  companySearchInput: string;
  onCompanySearchChange: (val: string) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  selectedPeriod: QuestionPeriod;
  onSelectPeriod: (period: QuestionPeriod) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  selectedStatus: PracticeStatus;
  onSelectStatus: (status: PracticeStatus) => void;
}

export function CompanyControlsPanel({
  selectedCompany,
  onSelectCompany,
  filteredCompaniesDropdown,
  companySearchInput,
  onCompanySearchChange,
  searchQuery,
  onSearchQueryChange,
  selectedPeriod,
  onSelectPeriod,
  selectedDifficulty,
  onSelectDifficulty,
  selectedStatus,
  onSelectStatus,
}: CompanyControlsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Select Any Company Dropdown + Search bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
        {/* Dropdown for 660+ companies */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="relative w-full max-w-md">
            <select
              value={selectedCompany}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none cursor-pointer appearance-none pr-10 shadow-md transition-all"
            >
              {filteredCompaniesDropdown.map((comp) => (
                <option key={comp} value={comp} className="bg-slate-900 text-white font-semibold">
                  {formatCompanyName(comp)} ({comp})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Company Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={companySearchInput}
            onChange={(e) => onCompanySearchChange(e.target.value)}
            placeholder="Filter 660+ companies..."
            className="w-full bg-slate-50 border border-slate-200/90 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-2xs outline-none"
          />
        </div>

        {/* Question Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search question title..."
            className="w-full bg-slate-50 border border-slate-200/90 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl transition-all shadow-2xs outline-none"
          />
        </div>
      </div>

      {/* Popular Companies Quick Selector Pills */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin relative z-10">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">
          POPULAR:
        </span>
        {TOP_COMPANIES.map((slug) => {
          const isSelected = selectedCompany === slug;
          return (
            <button
              key={slug}
              onClick={() => onSelectCompany(slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400 font-black scale-105"
                  : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
              }`}
            >
              {formatCompanyName(slug)}
            </button>
          );
        })}
      </div>

      {/* Filter Row: Time Periods & Difficulties & Status */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 relative z-10">
        {/* Time Period Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1 shrink-0">
            TIME FRAME:
          </span>
          {PERIODS.map((p) => {
            const isActive = selectedPeriod === p.value;
            return (
              <button
                key={p.value}
                onClick={() => onSelectPeriod(p.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs font-black border border-sky-400"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">
              DIFFICULTY:
            </span>
            {DIFFICULTIES.map((d) => {
              const isActive = selectedDifficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => onSelectDifficulty(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? d === "Easy"
                        ? "bg-emerald-500 text-white font-black shadow-xs border border-emerald-400"
                        : d === "Medium"
                        ? "bg-amber-500 text-white font-black shadow-xs border border-amber-400"
                        : d === "Hard"
                        ? "bg-rose-500 text-white font-black shadow-xs border border-rose-400"
                        : "bg-indigo-600 text-white font-black shadow-xs border border-indigo-400"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Completion Status Filter (All / Unsolved / Completed) */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">
              STATUS:
            </span>
            {STATUS_OPTIONS.map((st) => {
              const isActive = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => onSelectStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? st === "Completed"
                        ? "bg-emerald-600 text-white font-black shadow-xs border border-emerald-400"
                        : st === "Unsolved"
                        ? "bg-indigo-600 text-white font-black shadow-xs border border-indigo-400"
                        : "bg-slate-800 text-white font-black shadow-xs border border-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/70"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
