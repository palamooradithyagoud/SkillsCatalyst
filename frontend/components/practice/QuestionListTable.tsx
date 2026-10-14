"use client";

import React from "react";
import { Building2, Loader2, Filter, Plus } from "lucide-react";
import { PracticeQuestion } from "@/lib/api";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";
import { QuestionRow } from "./QuestionRow";

interface QuestionListTableProps {
  company: string;
  periodLabel: string;
  loadingQuestions: boolean;
  filteredQuestions: PracticeQuestion[];
  totalCount: number;
  loadedCount: number;
  solvedState: Record<string, boolean>;
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
  onLoadMore: () => void;
}

export function QuestionListTable({
  company,
  periodLabel,
  loadingQuestions,
  filteredQuestions,
  totalCount,
  loadedCount,
  solvedState,
  onToggleSolved,
  onLoadMore,
}: QuestionListTableProps) {
  return (
    <div className="bg-white dark:bg-[#18191F] rounded-[28px] p-6 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 text-purple-700 dark:text-[#C084FC] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5 text-purple-700 dark:text-[#C084FC]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{formatCompanyName(company)}</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                {company}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {loadingQuestions ? (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-[#C084FC] font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading questions...</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-bold px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-neutral-700">
              Showing <strong className="text-slate-900 dark:text-white">{filteredQuestions.length}</strong> of{" "}
              <strong className="text-purple-600 dark:text-[#C084FC]">{totalCount}</strong> questions
            </span>
          )}
        </div>
      </div>

      {/* Questions Table Body */}
      {loadingQuestions ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-600 dark:text-[#C084FC] animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
            Loading question bank for {formatCompanyName(company)}...
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-50 dark:bg-[#121318] rounded-2xl border border-slate-200/80 dark:border-neutral-800">
          <Filter className="w-8 h-8 text-slate-400 dark:text-neutral-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">No questions found</h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto font-medium">
            No interview questions match your selected status, period, or difficulty filters for {formatCompanyName(company)}.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#14151C] rounded-2xl border border-slate-200/90 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800/80 overflow-hidden shadow-2xs">
          {filteredQuestions.map((q, idx) => {
            const key = `q_${company}_${q.id}_${q.title}`;
            const isDone = !!solvedState[key] || !!solvedState[q.id.toString()];

            return (
              <QuestionRow
                key={`${q.id}-${idx}`}
                q={q}
                idx={idx}
                isDone={isDone}
                company={company}
                onToggleSolved={onToggleSolved}
              />
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {!loadingQuestions && loadedCount < totalCount && (
        <div className="pt-4 text-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Load More Questions ({loadedCount} / {totalCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}
