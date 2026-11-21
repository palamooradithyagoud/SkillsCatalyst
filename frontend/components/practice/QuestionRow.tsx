"use client";

import React from "react";
import { Check, ExternalLink, Lock } from "lucide-react";
import { PracticeQuestion } from "@/lib/api";
import { getLeetCodeUrl } from "@/lib/practice/practiceHelpers";
import { usePricingModal } from "@/contexts/PricingModalContext";

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
  const { openPricingModal } = usePricingModal();
  const key = `q_${company}_${q.id}_${q.title}`;
  const isLocked = Boolean(q.is_locked);
  const leetCodeUrl = isLocked ? "#" : getLeetCodeUrl(q);

  return (
    <div
      className={`flex items-center justify-between py-3 px-3.5 sm:px-4.5 transition-colors gap-3 group ${
        isLocked
          ? "bg-slate-50/40 dark:bg-[#121318] hover:bg-amber-50/20 dark:hover:bg-amber-950/10"
          : isDone
          ? "bg-slate-50/60 dark:bg-[#18191F]/70 hover:bg-slate-100/60 dark:hover:bg-[#18191F]"
          : "hover:bg-slate-50/80 dark:hover:bg-[#18191F]/40"
      }`}
    >
      {/* Left: Minimal Checkbox + Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        {isLocked ? (
          <button
            type="button"
            onClick={openPricingModal}
            className="w-4.5 h-4.5 rounded-[4px] border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 flex items-center justify-center transition-all cursor-pointer shrink-0 hover:border-amber-400"
            aria-label="Unlock with PRO"
            title="Unlock with PRO"
          >
            <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
          </button>
        ) : (
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
                ? "bg-[#D5FF38] border-[#D5FF38] text-black font-black shadow-none"
                : "border-slate-300 dark:border-[#24271F] hover:border-[#D5FF38] dark:hover:border-[#D5FF38] bg-white dark:bg-[#121318]"
            }`}
            aria-label={isDone ? "Mark unsolved" : "Mark solved"}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3] text-black" />}
          </button>
        )}

        {/* Number & Question Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-slate-400 dark:text-neutral-500 font-semibold shrink-0">
            #{q.id || idx + 1}
          </span>
          {isLocked ? (
            <button
              type="button"
              onClick={openPricingModal}
              className="text-sm font-medium transition-colors truncate flex items-center gap-2 text-slate-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-left cursor-pointer"
            >
              <span className="truncate">{q.title}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                <Lock className="w-2.5 h-2.5" />
                PRO
              </span>
            </button>
          ) : (
            <a
              href={leetCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors truncate flex items-center gap-1.5 group/link ${
                isDone
                  ? "text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                  : "text-slate-900 dark:text-white hover:text-black dark:hover:text-[#D5FF38]"
              }`}
            >
              <span className={`truncate ${isDone ? "line-through decoration-slate-400 dark:decoration-neutral-500" : ""}`}>
                {q.title}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 dark:text-neutral-500 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* Right: Metadata & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Acceptance Rate */}
        {q.acceptance && (
          <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium hidden md:inline-block tabular-nums">
            {q.acceptance} Acc.
          </span>
        )}

        {/* Frequency */}
        {q.frequency && (
          <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium hidden sm:inline-block tabular-nums">
            {q.frequency} Freq
          </span>
        )}

        {/* Difficulty */}
        <span
          className={`text-xs font-bold min-w-[56px] text-center sm:text-left ${
            q.difficulty === "Easy"
              ? "text-emerald-600 dark:text-emerald-400"
              : q.difficulty === "Medium"
              ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {q.difficulty}
        </span>

        {/* Clean Solve Link or Unlock PRO Button */}
        {isLocked ? (
          <button
            type="button"
            onClick={openPricingModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
            title="Unlock with SkillsCatalyst PRO"
          >
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Unlock</span>
          </button>
        ) : (
          <a
            href={leetCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-black dark:hover:text-[#D5FF38] hover:bg-slate-100 dark:hover:bg-[#24271F] transition-all cursor-pointer"
            title="Solve on LeetCode"
          >
            <span>Solve</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
