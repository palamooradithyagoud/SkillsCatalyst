"use client";

import React from "react";
import { Newspaper, Sparkles, RefreshCw } from "lucide-react";

interface TechNewsEmptyStateProps {
  onRefresh?: () => void;
  compact?: boolean;
}

export const TechNewsEmptyState: React.FC<TechNewsEmptyStateProps> = ({
  onRefresh,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Newspaper className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="text-[11px] font-medium">No 48h active stories right now. Next batch dropping shortly!</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-white">Fresh Stories Arriving Soon</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tech news stories expire automatically every 48 hours to keep your stream fresh. Check back shortly for newly published industry updates.
        </p>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Check for Updates</span>
        </button>
      )}
    </div>
  );
};
