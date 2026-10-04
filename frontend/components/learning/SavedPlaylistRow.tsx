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

  const { data: videoData, isLoading: loadingVideos } = useQuery({
    queryKey: ["playlist-videos", ytPlaylistId, userId],
    queryFn: () => fetchPlaylistVideos(ytPlaylistId),
    enabled: !!ytPlaylistId,
    staleTime: 5 * 60 * 1000,
  });

  const hasLoaded = !!videoData;
  const videos = videoData?.videos ?? [];
  const storedCount = parseInt(pl.video_count ?? "0") || 0;
  const displayCount = videos.length > 0 ? videos.length : storedCount;
  const watchedCount = videos.filter((v) => v.watched).length;
  const pct = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

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
    ? "text-slate-500 bg-slate-100 border-slate-200"
    : pct === 100
    ? "text-white bg-black border-black font-bold shadow-xs"
    : pct > 0
    ? "text-black bg-slate-100 border-slate-300 font-bold"
    : "text-slate-600 bg-slate-100 border-slate-200 font-semibold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="course-card card-morph bg-white rounded-[24px] border border-slate-200/90 shadow-xs hover:shadow-md overflow-hidden"
    >
      {/* ── Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-black truncate">{pl.title}</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 shadow-sm cursor-pointer transition-all"
          >
            Watch Track
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(pl.id)}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 border border-black shadow-sm transition-all cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* ── Progress line */}
      <div className="flex items-center justify-between px-6 pb-3 mt-1">
        {!hasLoaded ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-black">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            <span>Syncing video progress...</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-black">
            <strong className="text-black font-bold">{watchedCount}</strong> of {displayCount} videos completed ({pct}%)
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-black hover:text-neutral-600 transition-colors cursor-pointer"
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
        <div className="mx-6 mb-4 h-2 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-black"
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
            className="overflow-hidden border-t border-slate-100"
          >
            {loadingVideos ? (
              <div className="flex items-center justify-center gap-3 py-8 text-slate-500 bg-white">
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span className="text-xs font-semibold">Loading course lessons...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-white">
                No videos found for this track.
              </div>
            ) : (
              <div className="bg-white divide-y divide-slate-100 border-t border-slate-100">
                {videos.map((v, i) => {
                  const done = v.watched;

                  return (
                    <div
                      key={v.videoId}
                      onClick={() => onWatchVideo(pl, i)}
                      className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-colors duration-150 cursor-pointer group ${
                        done ? "bg-[#f3e8ff]/60 hover:bg-[#ebd5ff]" : "bg-white hover:bg-[#f3e8ff]"
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
                              : "bg-white border-slate-300 group-hover:border-purple-400 hover:border-slate-500"
                          }`}
                          aria-label={done ? "Mark as unwatched" : "Mark as watched"}
                        >
                          {done && <Check className="w-3 h-3 stroke-[3] text-white" />}
                        </button>

                        {/* Lesson title with gray strike-off when completed */}
                        <span
                          className={`text-xs sm:text-sm leading-normal line-clamp-1 transition-colors ${
                            done
                              ? "line-through text-slate-400 font-normal decoration-slate-400"
                              : "text-black font-medium"
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
