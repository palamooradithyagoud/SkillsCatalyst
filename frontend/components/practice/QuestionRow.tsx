"use client";

import React from "react";
import { Check, ExternalLink } from "lucide-react";
import { PracticeQuestion } from "@/lib/api";
import { getLeetCodeUrl } from "@/lib/practice/practiceHelpers";

interface QuestionRowProps {
  q: PracticeQuestion;
  idx: number;
  isDone: boolean;
  company: string;
  onToggleSolved: (
    key: string,
    details: {
      company: string;
      id: number;
      title: string;
      difficulty: string;
      acceptance?: string;
      frequency?: string;
    }
  ) => void;
}

export function QuestionRow({
  q,
  idx,
  isDone,
  company,
  onToggleSolved,
}: QuestionRowProps) {
  const key = `q_${company}_${q.id}_${q.title}`;
  const leetCodeUrl = getLeetCodeUrl(q);

  return (
    <div
      className={`flex items-center justify-between py-3 px-3.5 sm:px-4.5 transition-colors gap-3 group ${
        isDone ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-slate-50/80"
      }`}
    >
      {/* Left: Minimal Checkbox + Title (matching Image 2) */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() =>
            onToggleSolved(key, {
              company,
              id: q.id,
              title: q.title,
              difficulty: q.difficulty,
              acceptance: q.acceptance,
              frequency: q.frequency,
            })
          }
          className={`w-4.5 h-4.5 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isDone
              ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
              : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
          aria-label={isDone ? "Mark unsolved" : "Mark solved"}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Number & Question Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-slate-400 font-semibold shrink-0">
            #{q.id || idx + 1}
          </span>
          <a
            href={leetCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium transition-colors truncate flex items-center gap-1.5 group/link ${
              isDone
                ? "text-slate-400 hover:text-slate-600"
                : "text-slate-900 hover:text-indigo-600"
            }`}
          >
            <span className={`truncate ${isDone ? "line-through decoration-slate-400" : ""}`}>
              {q.title}
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
          </a>
        </div>
      </div>

      {/* Right: Metadata & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Acceptance Rate */}
        {q.acceptance && (
          <span className="text-xs text-slate-500 font-medium hidden md:inline-block tabular-nums">
            {q.acceptance} Acc.
          </span>
        )}

        {/* Frequency */}
        {q.frequency && (
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100/80 px-2 py-0.5 rounded-md hidden sm:inline-block tabular-nums">
            {q.frequency} Freq
          </span>
        )}

        {/* Difficulty Badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            q.difficulty === "Easy"
              ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
              : q.difficulty === "Medium"
              ? "text-amber-700 bg-amber-50 border border-amber-200/60"
              : "text-rose-700 bg-rose-50 border border-rose-200/60"
          }`}
        >
          {q.difficulty}
        </span>

        {/* Clean Solve Link Button */}
        <a
          href={leetCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer"
          title="Solve on LeetCode"
        >
          <span>Solve</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
