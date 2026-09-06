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
        spotlightColor="rgba(16, 185, 129, 0.2)"
        className="rounded-[20px] sm:rounded-[24px] border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 p-3.5 sm:p-6 flex flex-col justify-between group h-full"
      >
        <div>
          {/* ── Meta Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full shadow-xs">
              #{rank}
            </span>
            <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${getLevelStyle(pl.level)}`}>
              {pl.level || "All Levels"}
            </span>
            {pl.language && (
              <span className="text-[10px] sm:text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200/90 px-2 py-0.5 rounded-full shadow-xs">
                {pl.language}
              </span>
            )}
            {pl.source === "csv" ? (
              <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full ml-auto shadow-xs">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" /> CSV
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-2 py-0.5 rounded-full ml-auto shadow-xs">
                <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" /> YouTube
              </span>
            )}
          </div>

          {/* ── Body */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
              {pl.title}
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">{pl.channel}</p>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2 font-normal hidden sm:block">
              {pl.description || "No description available."}
            </p>
          </div>
        </div>

        {/* ── Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-3 pt-3 sm:pt-5 mt-3 sm:mt-4 border-t border-slate-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onWatch(pl)}
            className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
                  ? "text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 shadow-xs"
                  : "text-slate-700 border-slate-200/90 bg-slate-100/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 shadow-xs"
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
