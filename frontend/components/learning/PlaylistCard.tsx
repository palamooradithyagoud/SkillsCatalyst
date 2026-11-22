"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Bookmark } from "lucide-react";
import { Playlist } from "@/lib/api";
import { extractPlaylistId } from "@/lib/learning/searchValidation";

export function PlaylistCard({
  pl,
  rank,
  savedIds,
  videoProgressData,
  onSave,
  onUnsave,
  onWatch,
  delay = 0,
}: {
  pl: Playlist;
  rank?: number;
  savedIds: Set<string>;
  videoProgressData?: any;
  onSave?: (pl: Playlist) => void;
  onUnsave?: (id: string) => void;
  onWatch: (pl: Playlist) => void;
  delay?: number;
}) {
  const isSaved = savedIds?.has(pl.id);
  const [imgError, setImgError] = useState(false);

  // ── Calculate Real Dynamic Progress from Supabase / Backend Activity ──
  const plId = pl.id || (pl as any).playlist_id;
  const cleanId = extractPlaylistId(pl.playlist_url || pl.id || "");
  const watchedCount =
    videoProgressData?.raw?.filter(
      (r: any) =>
        !!r.watched &&
        (String(r.playlist_id) === String(plId) ||
          (cleanId && String(r.playlist_id) === String(cleanId)))
    ).length || 0;

  const rawNum = pl.video_count ? String(pl.video_count).replace(/[^0-9]/g, "") : "";
  const totalVideos = Number(rawNum) || 1;
  const pct = Math.min(100, Math.round((watchedCount / totalVideos) * 100));

  // ── Clean Dynamic Video Count Label ──
  const videoCountText = rawNum ? `${rawNum} Videos` : (pl.video_count || "Videos");

  // ── Dynamic Thumbnail Source with Fallback ──
  const thumbnailSrc =
    !imgError && pl.thumbnail
      ? pl.thumbnail
      : cleanId
      ? `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="h-full select-none"
    >
      <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/80 dark:border-[#24271F] flex flex-col justify-between gap-2 sm:gap-3 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors group h-full shadow-none">
        <div className="space-y-1.5 sm:space-y-2">
          {/* 1. Dynamic Video Thumbnail with 16:9 Aspect Ratio matching Reference Image 2 */}
          <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black/40">
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={pl.title || "Course thumbnail"}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 opacity-40 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1 px-2 text-center">
                  {pl.channel || "Course"}
                </span>
              </div>
            )}

            {/* Video Count Badge in Bottom-Right Corner */}
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-xs">
              {videoCountText}
            </div>

            {/* Rank Badge in Top-Left Corner */}
            {typeof rank === "number" && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[9px] sm:text-[10px] font-black text-white border border-white/20 backdrop-blur-xs">
                #{rank}
              </div>
            )}
          </div>

          {/* 2. Dynamic Course Title */}
          <h3
            className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-tight sm:leading-snug group-hover:text-black dark:group-hover:text-[#D5FF38] transition-colors"
            title={pl.title}
          >
            {pl.title}
          </h3>

          {/* 3. Dynamic Channel Name */}
          {pl.channel && (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 font-medium truncate">
              {pl.channel}
            </p>
          )}
        </div>

        {/* 4. Progress Section & Actions matching Reference Image 2 */}
        <div className="space-y-1.5 sm:space-y-2.5 pt-1.5 sm:pt-2 border-t border-slate-200/70 dark:border-[#24271F]">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
            <span>Progress</span>
            <span className="text-slate-900 dark:text-white font-bold">{pct}%</span>
          </div>

          {/* Thin Progress Bar */}
          <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#D5FF38] transition-all duration-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Action Buttons: Resume/Start + Bookmark */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            <button
              type="button"
              onClick={() => onWatch(pl)}
              className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <Play className="w-3 h-3 fill-current shrink-0" />
              <span className="truncate">{pct > 0 ? "Resume" : "Start"}</span>
            </button>

            {onSave && onUnsave && (
              <button
                type="button"
                onClick={() => (isSaved ? onUnsave(pl.id) : onSave(pl))}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0 border ${
                  isSaved
                    ? "bg-[#D5FF38]/20 border-[#D5FF38]/50 text-[#D5FF38] hover:bg-[#D5FF38]/30"
                    : "text-slate-400 hover:text-white border-slate-200 dark:border-[#24271F] bg-slate-100 dark:bg-[#18191F] hover:border-slate-300 dark:hover:border-neutral-600"
                }`}
                title={isSaved ? "Saved to your space (click to unsave)" : "Save to your space"}
                aria-label={isSaved ? "Saved" : "Save"}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-90 ${
                    isSaved ? "fill-[#D5FF38]" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlaylistCard;
