"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Check, ExternalLink } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 group shadow-xs ${
        isDone
          ? "bg-emerald-50/60 border-emerald-200"
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        {/* Interactive Checkbox Button with Live Supabase Sync */}
        <button
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none shrink-0 ${
            isDone
              ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold"
          }`}
          title={isDone ? "Click to mark as incomplete" : "Click to mark as completed"}
        >
          {isDone ? (
            <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="text-[11px] font-extrabold tracking-wide">
            {isDone ? "Completed" : "Mark Solved"}
          </span>
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 font-bold">
              #{q.id || idx + 1}
            </span>
            <a
              href={leetCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                isDone
                  ? "text-slate-400 line-through"
                  : "text-slate-900 group-hover:text-[#234B3B]"
              }`}
            >
              <span>{q.title}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#234B3B] transition-opacity" />
            </a>

            {isDone && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-700" />
                Solved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Acceptance Rate */}
        {q.acceptance && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {q.acceptance} Acc.
          </span>
        )}

        {/* Frequency Rate */}
        {q.frequency && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            {q.frequency} Freq.
          </span>
        )}

        {/* Difficulty Badge */}
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            q.difficulty === "Easy"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : q.difficulty === "Medium"
              ? "bg-amber-100 text-amber-900 border border-amber-200"
              : "bg-rose-100 text-rose-800 border border-rose-200"
          }`}
        >
          {q.difficulty}
        </span>

        {/* Direct LeetCode External Link Button */}
        <a
          href={leetCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#234B3B] hover:bg-[#1b3b2e] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Solve</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
