"use client";

import React from "react";
import { Briefcase, ArrowLeft } from "lucide-react";

interface PracticeHeaderProps {
  selectedMode: "index" | "beginner" | "company";
  onBack: () => void;
  companiesCount?: number;
}

export function PracticeHeader({
  selectedMode,
  onBack,
  companiesCount,
}: PracticeHeaderProps) {
  if (selectedMode === "index") {
    return null;
  }

  if (selectedMode === "beginner") {
    return (
      <div className="flex items-center justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back to Practice Cards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Company Wise Questions
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
              LeetCode CSV Bank
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Explore real interview questions asked by {companiesCount || "660+"} top tech companies from curated CSV datasets.
          </p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer self-start md:self-auto"
      >
        <ArrowLeft className="w-4 h-4 text-slate-600" />
        <span>Back to Practice Cards</span>
      </button>
    </div>
  );
}
