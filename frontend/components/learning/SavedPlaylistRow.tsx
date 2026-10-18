"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Playlist, fetchPlaylistVideos, markVideoWatched } from "@/lib/api";
import { extractPlaylistId } from "@/lib/learning/searchValidation";

export function SavedPlaylistRow({
  pl,
  onWatch,
  onDelete,
  onWatchVideo,
  delay = 0,
}: {
  pl: Playlist;
  onWatch: (pl: Playlist) => void;
  onDelete: (id: string) => void;
  onWatchVideo: (pl: Playlist, idx: number) => void;
  delay?: number;
}) {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  // Use the actual YouTube playlist ID from the URL, not the row rank
  const ytPlaylistId = extractPlaylistId(pl.playlist_url ?? "") ?? pl.id;

  const storedCount = parseInt(pl.video_count ?? "0") || 0;
  const initialTotal = (typeof pl.total_videos === "number" && pl.total_videos > 0) ? pl.total_videos : storedCount;
  const initialWatched = typeof pl.completed_videos === "number" ? pl.completed_videos : null;
  const initialPct = typeof pl.progress_pct === "number" ? pl.progress_pct : null;
  const isStatsUnavailable = pl.stats_status === "unavailable" || (pl.stats_status === "partial" && initialWatched === null);

  const { data: videoData, isLoading: loadingVideos } = useQuery({
    queryKey: ["playlist-videos", ytPlaylistId, userId],
    queryFn: () => fetchPlaylistVideos(ytPlaylistId),
    enabled: !!ytPlaylistId && (expanded || initialWatched === null || isStatsUnavailable),
    staleTime: 5 * 60 * 1000,
  });

  const hasLoaded = !!videoData || (initialWatched !== null && !isStatsUnavailable);
  const videos = videoData?.videos ?? [];
  const displayCount = videos.length > 0 ? videos.length : initialTotal;
  const watchedCount = videos.length > 0 ? videos.filter((v) => v.watched).length : (initialWatched ?? 0);
  const pct = videos.length > 0
    ? (displayCount > 0 ? Math.round((watchedCount / displayCount) * 100) : 0)
    : (initialPct ?? (displayCount > 0 && initialWatched !== null ? Math.round((initialWatched / displayCount) * 100) : 0));

  const markMut = useMutation({
    mutationFn: ({ videoId, watched }: { videoId: string; watched: boolean }) =>
      markVideoWatched(ytPlaylistId, videoId, watched),
    onMutate: async ({ videoId, watched }) => {
      qc.setQueryData(
        ["playlist-videos", ytPlaylistId, userId],
        (old: { videos: any[]; count: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            videos: old.videos.map((v) =>
              v.videoId === videoId ? { ...v, watched } : v
            ),
          };
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const status = !hasLoaded
    ? "Syncing"
    : pct === 100
    ? "Completed"
    : pct > 0
    ? "In Progress"
    : "Not Started";

  const statusStyle = !hasLoaded
    ? "text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700"
    : pct === 100
    ? "text-white dark:text-[#C084FC] bg-black dark:bg-purple-950/60 border-black dark:border-purple-800/60 font-bold shadow-xs"
    : pct > 0
    ? "text-black dark:text-[#C084FC] bg-slate-100 dark:bg-purple-950/40 border-slate-300 dark:border-purple-800/40 font-bold"
    : "text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 font-semibold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="course-card card-morph bg-white dark:bg-[#18191F] rounded-[24px] border border-slate-200/90 dark:border-neutral-800 shadow-xs hover:shadow-md overflow-hidden"
    >
      {/* ── Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-black dark:text-white truncate">{pl.title}</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-[#C084FC]/85 mt-0.5">
            {[pl.channel, pl.language, pl.skill_query, pl.level].filter(Boolean).join(" • ")}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-xs px-3 py-1 rounded-full border ${statusStyle}`}>
            {!hasLoaded ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                Syncing
              </span>
            ) : (
              status
            )}
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onWatch(pl)}
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-black dark:bg-gradient-to-r dark:from-[#5f13e7] dark:to-[#7928ca] hover:bg-neutral-800 dark:hover:from-[#530dd4] dark:hover:to-[#6b20b8] active:bg-neutral-900 shadow-sm cursor-pointer transition-all"
          >
            Watch Track
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(pl.id)}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-black dark:bg-white/[0.08] hover:bg-neutral-800 dark:hover:bg-rose-950/50 border border-black dark:border-neutral-700 dark:hover:border-rose-800 dark:text-neutral-200 dark:hover:text-rose-400 shadow-sm transition-all cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* ── Progress line */}
      <div className="flex items-center justify-between px-6 pb-3 mt-1">
        {isStatsUnavailable && !videoData ? (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Progress temporarily unavailable
          </span>
        ) : !hasLoaded ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-black dark:text-neutral-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black dark:text-neutral-400" />
            <span>Syncing video progress...</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-black dark:text-neutral-300">
            <strong className="text-black dark:text-white font-bold">{watchedCount}</strong> of {displayCount} videos completed ({pct}%)
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-black dark:text-[#C084FC] hover:text-neutral-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
        >
          {expanded
            ? "Hide Lessons ▲"
            : hasLoaded
            ? `Show Lessons (${displayCount}) ▼`
            : "Show Lessons ▼"}
        </button>
      </div>

      {/* ── Progress bar */}
      {pct > 0 && (
        <div className="mx-6 mb-4 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-neutral-900 p-0.5 border border-slate-200 dark:border-neutral-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-black dark:bg-gradient-to-r dark:from-[#A855F7] dark:to-[#C084FC] dark:shadow-[0_0_8px_rgba(192,132,252,0.4)]"
          />
        </div>
      )}

      {/* ── Expandable video list (Matches Image 2) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100 dark:border-neutral-800"
          >
            {loadingVideos ? (
              <div className="flex items-center justify-center gap-3 py-8 text-slate-500 dark:text-neutral-400 bg-white dark:bg-[#18191F]">
                <Loader2 className="w-5 h-5 animate-spin text-black dark:text-[#C084FC]" />
                <span className="text-xs font-semibold">Loading course lessons...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-neutral-400 bg-white dark:bg-[#18191F]">
                No videos found for this track.
              </div>
            ) : (
              <div className="bg-white dark:bg-[#18191F] divide-y divide-slate-100 dark:divide-neutral-800 border-t border-slate-100 dark:border-neutral-800">
                {videos.map((v, i) => {
                  const done = v.watched;

                  return (
                    <div
                      key={v.videoId}
                      onClick={() => onWatchVideo(pl, i)}
                      className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer group ${
                        done
                          ? "bg-[#f3e8ff]/60 dark:bg-purple-950/20 hover:bg-[#ebd5ff] dark:hover:bg-purple-950/40"
                          : "bg-white dark:bg-[#18191F] hover:bg-[#f3e8ff] dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4 flex-1">
                        {/* Checkbox matching Image 2 reference */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markMut.mutate({ videoId: v.videoId, watched: !v.watched });
                          }}
                          className={`w-4.5 h-4.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            done
                              ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                              : "bg-white dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 group-hover:border-purple-400 hover:border-slate-500"
                          }`}
                          aria-label={done ? "Mark as unwatched" : "Mark as watched"}
                        >
                          {done && <Check className="w-3 h-3 stroke-[3] text-white" />}
                        </button>

                        {/* Lesson title with gray strike-off when completed */}
                        <span
                          className={`text-xs sm:text-sm leading-normal line-clamp-1 transition-colors ${
                            done
                              ? "line-through text-slate-400 dark:text-neutral-500 font-normal decoration-slate-400 dark:decoration-neutral-500"
                              : "text-black dark:text-white font-medium"
                          }`}
                        >
                          {v.title}
                        </span>
                      </div>

                      {/* Official YouTube red icon on the right matching Image 2 */}
                      <div className="flex items-center shrink-0 ml-3">
                        <svg
                          className="w-5 h-3.5 transition-transform duration-150 group-hover:scale-110"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fill="#FF0000"
                            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                          />
                          <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
