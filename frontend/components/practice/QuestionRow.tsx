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
          ? "bg-slate-50/40 dark:bg-neutral-900/30 hover:bg-amber-50/20 dark:hover:bg-amber-950/10"
          : isDone
          ? "bg-purple-50/20 dark:bg-purple-950/20 hover:bg-purple-50/40 dark:hover:bg-purple-950/30"
          : "hover:bg-slate-50/80 dark:hover:bg-neutral-800/40"
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
                ? "bg-purple-600 dark:bg-purple-600 border-purple-600 dark:border-purple-500 text-white shadow-2xs"
                : "border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500 bg-white dark:bg-[#121318]"
            }`}
            aria-label={isDone ? "Mark unsolved" : "Mark solved"}
          >
            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
                  : "text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-[#C084FC]"
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
          <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-100/80 dark:border-purple-800/50 px-2 py-0.5 rounded-md hidden sm:inline-block tabular-nums">
            {q.frequency} Freq
          </span>
        )}

        {/* Difficulty Badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            q.difficulty === "Easy"
              ? "text-purple-700 dark:text-[#C084FC] bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/50"
              : q.difficulty === "Medium"
              ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50"
              : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50"
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
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-[#C084FC] hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
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
