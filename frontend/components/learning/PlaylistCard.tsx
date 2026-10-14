"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle, Database } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import { Playlist } from "@/lib/api";
import { getLevelStyle } from "@/lib/learning/searchValidation";

export function PlaylistCard({
  pl,
  rank,
  savedIds,
  onSave,
  onUnsave,
  onWatch,
  delay = 0,
}: {
  pl: Playlist;
  rank: number;
  savedIds: Set<string>;
  onSave?: (pl: Playlist) => void;
  onUnsave?: (id: string) => void;
  onWatch: (pl: Playlist) => void;
  delay?: number;
}) {
  const isSaved = savedIds.has(pl.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <SpotlightCard
        spotlightColor="rgba(192, 132, 252, 0.15)"
        className="rounded-[20px] sm:rounded-[24px] border border-slate-200/90 dark:border-neutral-800 dark:bg-[#18191F] shadow-sm hover:shadow-xl hover:border-purple-300/80 dark:hover:border-purple-500/50 transition-all duration-300 p-3.5 sm:p-6 flex flex-col justify-between group h-full"
      >
        <div>
          {/* ── Meta Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-neutral-200 bg-slate-100 dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700 px-2 py-0.5 rounded-full shadow-xs">
              #{rank}
            </span>
            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${getLevelStyle(pl.level)}`}>
              {pl.level || "All Levels"}
            </span>
            {pl.language && (
              <span className="text-[10px] sm:text-xs font-bold text-violet-700 dark:text-purple-300 bg-violet-50 dark:bg-purple-950/60 border border-violet-200/90 dark:border-purple-800/60 px-2 py-0.5 rounded-full shadow-xs">
                {pl.language}
              </span>
            )}
          </div>

          {/* ── Body */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#C084FC] transition-colors leading-snug line-clamp-2">
              {pl.title}
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-[#C084FC]/90 truncate">{pl.channel}</p>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-neutral-400 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2 font-normal hidden sm:block">
              {pl.description || "No description available."}
            </p>
          </div>
        </div>

        {/* ── Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-3 pt-3 sm:pt-5 mt-3 sm:mt-4 border-t border-slate-100 dark:border-neutral-800/80">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onWatch(pl)}
            className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#5f13e7] to-[#7928ca] hover:from-[#530dd4] hover:to-[#6b20b8] shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> Watch
          </motion.button>

          {onSave && onUnsave && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => isSaved ? onUnsave(pl.id) : onSave(pl)}
              className={`w-full sm:flex-1 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                isSaved
                  ? "text-purple-700 dark:text-[#C084FC] border-purple-300 dark:border-purple-600/60 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-xs"
                  : "text-slate-700 dark:text-white border-slate-200/90 dark:border-neutral-700 bg-slate-100/80 dark:bg-neutral-800/90 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-[#C084FC] shadow-xs"
              }`}
            >
              {isSaved ? "Saved ✓" : "Save"}
            </motion.button>
          )}
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
