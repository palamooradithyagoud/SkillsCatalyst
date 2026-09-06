"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
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
    ? "text-emerald-800 bg-emerald-100 border-emerald-200 font-bold"
    : pct > 0
    ? "text-amber-900 bg-amber-100 border-amber-200 font-bold"
    : "text-slate-600 bg-slate-100 border-slate-200 font-semibold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="course-card card-morph bg-white rounded-[24px] border border-slate-100 shadow-xs hover:shadow-md overflow-hidden"
    >
      {/* ── Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 truncate">{pl.title}</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
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
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Watch Track
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(pl.id)}
            className="px-3.5 py-2 rounded-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* ── Progress line */}
      <div className="flex items-center justify-between px-6 pb-3 mt-1">
        {!hasLoaded ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Syncing video progress...</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-600">
            {watchedCount} of {displayCount} videos completed ({pct}%)
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
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
        <div className="mx-6 mb-4 h-2 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500"
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
              <div className="flex items-center justify-center gap-3 py-8 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">Loading course lessons...</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No videos found for this track.
              </div>
            ) : (
              <div className="p-4 space-y-2.5 bg-slate-50/70">
                {videos.map((v, i) => {
                  const done = v.watched;

                  return (
                    <div
                      key={v.videoId}
                      onClick={() => onWatchVideo(pl, i)}
                      className={`w-full flex items-center justify-between p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                        done
                          ? "bg-amber-400 border-amber-400 text-slate-900 shadow-sm font-extrabold"
                          : "bg-white border-slate-200/90 text-slate-900 font-bold hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                        {/* Circular badge icon matching Image 2 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markMut.mutate({ videoId: v.videoId, watched: !v.watched });
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-transform active:scale-95 ${
                            done
                              ? "bg-slate-900/15 border border-slate-900/20 text-slate-900"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="w-5 h-5 text-slate-900" />
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </button>

                        {/* Lesson title matching Image 2 */}
                        <span className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                          {v.title}
                        </span>
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
