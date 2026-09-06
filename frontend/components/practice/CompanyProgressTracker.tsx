"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";

interface CompanyProgressTrackerProps {
  company: string;
  solvedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function CompanyProgressTracker({
  company,
  solvedCount,
  totalCount,
  progressPercent,
}: CompanyProgressTrackerProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#234B3B] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#234B3B] flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6 text-[#234B3B]" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>{formatCompanyName(company)} Progress Tracker</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">
              ({solvedCount} / {totalCount} Solved)
            </span>
          </h4>
          <p className="text-xs text-emerald-100/80 font-medium">
            Check off questions to save your progress directly into Supabase DB.
          </p>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full md:w-64 space-y-1.5">
        <div className="flex justify-between text-xs font-extrabold">
          <span className="text-emerald-100">Completion Rate</span>
          <span className="text-amber-300">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden p-0.5 backdrop-blur-xs">
          <div
            className="h-full rounded-full bg-amber-300 transition-all duration-500 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
