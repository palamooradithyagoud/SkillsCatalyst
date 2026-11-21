"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import KineticGrid from "@/components/ui/kinetic-grid";
import {
  Playlist,
  fetchPlaylistVideos,
  markVideoWatched,
  completeVideo,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  resolveActiveLessonIndex,
  saveLocalPlaylistActiveLesson,
  flushPendingSync,
} from "@/lib/progress";
import { extractPlaylistId } from "@/lib/learning/searchValidation";
import { VideoPlayerContainer } from "./VideoPlayerContainer";

export function FullPlayerView({
  pl,
  initialVideoIndex,
  onBack,
}: {
  pl: Playlist;
  initialVideoIndex?: number;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const ytPlaylistId = extractPlaylistId(pl.playlist_url ?? "") ?? pl.id;

  const { session } = useAuth();
  const userId = session?.user_id;

  const { data: videoData, isLoading: loadingVideos } = useQuery({
    queryKey: ["playlist-videos", ytPlaylistId, userId],
    queryFn: () => fetchPlaylistVideos(ytPlaylistId),
    enabled: !!ytPlaylistId,
    staleTime: 5 * 60 * 1000,
  });

  const videos = videoData?.videos ?? [];

  // Active lesson resolution:
  // 1. Explicit request
  // 2. Previously active lesson
  // 3. First incomplete lesson
  // 4. First lesson (index 0)
  const [currentIdx, setCurrentIdx] = useState<number>(initialVideoIndex ?? 0);
  const resolvedInitialRef = useRef<boolean>(initialVideoIndex !== undefined);

  useEffect(() => {
    if (!resolvedInitialRef.current && videos.length > 0) {
      resolvedInitialRef.current = true;
      const targetIdx = resolveActiveLessonIndex(ytPlaylistId, videos, initialVideoIndex);
      if (targetIdx !== currentIdx) {
        setCurrentIdx(targetIdx);
      }
    }
  }, [videos, ytPlaylistId, initialVideoIndex, currentIdx]);

  const currentVideo = videos[currentIdx] ?? null;

  // Persist active lesson index whenever currentIdx changes
  useEffect(() => {
    if (currentVideo) {
      saveLocalPlaylistActiveLesson(ytPlaylistId, currentIdx, currentVideo.videoId);
    }
  }, [currentIdx, currentVideo, ytPlaylistId]);

  const [activeTab, setActiveTab] = useState<"Overview" | "Instructor" | "FAQ">("Overview");

  // Sync active player view state to document body attribute for MobileNav detection
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-learning-player", "true");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.removeAttribute("data-learning-player");
      }
    };
  }, []);

  // ── Auto-completion UI state
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [watchedPct, setWatchedPct] = useState(0);   // live 0-100
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Watched count = DB rows + optimistic local set
  const watchedCount = videos.filter(
    (v) => v.watched || completedVideoIds.has(v.videoId)
  ).length;
  const pct = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const markMut = useMutation({
    mutationFn: ({ videoId, watched }: { videoId: string; watched: boolean }) =>
      markVideoWatched(ytPlaylistId, videoId, watched),
    onMutate: async ({ videoId, watched }) => {
      setCompletedVideoIds((prev) => {
        const next = new Set(prev);
        if (watched) {
          next.add(videoId);
        } else {
          next.delete(videoId);
        }
        return next;
      });

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

  const completeMut = useMutation({
    mutationFn: ({ videoId, watchTime }: { videoId: string; watchTime: number }) =>
      completeVideo(ytPlaylistId, videoId, watchTime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist-videos", ytPlaylistId, userId] });
      qc.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  // Reset live progress when video changes
  useEffect(() => {
    setWatchedPct(0);
    setShowCompletionBanner(false);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, [currentIdx]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  /** Called by the hook when >= 75% genuinely watched */
  const handleVideoComplete = useCallback((watchedSeconds: number) => {
    if (!currentVideo) return;
    const vid = currentVideo.videoId;

    setCompletedVideoIds((prev) => new Set([...prev, vid]));
    setShowCompletionBanner(true);
    bannerTimerRef.current = setTimeout(() => setShowCompletionBanner(false), 3500);

    completeMut.mutate({ videoId: vid, watchTime: Math.round(watchedSeconds) });

    setTimeout(() => {
      const nextBtn = sidebarRef.current?.querySelector(
        `[data-idx="${currentIdx}"]`
      ) as HTMLElement | null;
      nextBtn?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 400);
  }, [currentVideo, currentIdx, completeMut]);

  const changeLesson = useCallback((nextIdx: number) => {
    if (nextIdx === currentIdx || nextIdx < 0 || nextIdx >= videos.length) return;
    flushPendingSync();
    setCurrentIdx(nextIdx);
  }, [currentIdx, videos.length]);

  const goNext = () => changeLesson(currentIdx + 1);
  const goPrev = () => changeLesson(currentIdx - 1);

  const isCompleted = (vid: string) =>
    completedVideoIds.has(vid) || (videos.find((v) => v.videoId === vid)?.watched ?? false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto pb-12 space-y-6"
    >
      {/* ── Completion Banner Toast */}
      <AnimatePresence>
        {showCompletionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl bg-neutral-900 text-white border border-neutral-700"
          >
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
              className="text-xl"
            >
              🎉
            </motion.div>
            <div>
              <div className="font-bold text-white text-sm">Lesson Completed!</div>
              <div className="text-neutral-400 text-xs font-medium">75% threshold reached ✓</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#D5FF38]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Course Header Banner with KineticGrid */}
      <KineticGrid
        className="rounded-[20px] sm:rounded-[28px] border border-neutral-800 p-4 sm:p-8 text-white shadow-xl"
        globalColor="default"
      >
        <div className="max-w-3xl space-y-2.5 sm:space-y-3">
          {/* Breadcrumb + Back Button */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/60 min-w-0 overflow-hidden">
            <button
              onClick={onBack}
              className="hover:text-[#D5FF38] transition-colors flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#D5FF38] shrink-0" /> My playlists
            </button>
            <span className="text-white/40 shrink-0">&gt;</span>
            <span className="text-white font-bold truncate">{pl.title}</span>
          </div>

          {/* Big Course Title */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold sm:font-black text-white tracking-tight leading-snug sm:leading-tight">
            {pl.title}
          </h1>

          {/* Course description */}
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal line-clamp-2">
            {pl.description || `This course will help you quickly get started with ${pl.skill_query || "this topic"}: setting up the environment, project structure, syntax, data types, functions, DOM, and basic debugging.`}
          </p>

          {/* Progress & Lessons Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-6 pt-1 text-xs sm:text-sm font-semibold text-white/80">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-28 sm:w-36 h-2 sm:h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/15 shrink-0">
                <div
                  className="h-full rounded-full bg-[#D5FF38] shadow-none transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[#D5FF38] font-bold whitespace-nowrap">{pct}% complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D5FF38] shrink-0" />
              <span>{videos.length - watchedCount} videos left</span>
            </div>
          </div>
        </div>
      </KineticGrid>

      {/* ── Main Player Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN: Player + Tab Controls + About */}
        <div className="space-y-6">
          {/* Embedded Video Card */}
          <div className="bg-white dark:bg-[#18191F] rounded-[28px] border border-slate-200/90 dark:border-neutral-800 shadow-sm p-4 space-y-4 overflow-hidden transition-colors">
            <div className="flex items-center justify-between gap-3 px-1 sm:px-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate min-w-0">
                {currentVideo ? `${currentIdx + 1}. ${currentVideo.title}` : pl.title}
              </h2>
              <span className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800/90 px-2.5 sm:px-3 py-1 rounded-full border border-slate-200/80 dark:border-neutral-700/80">
                {currentIdx + 1} of {videos.length}
              </span>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner border border-transparent dark:border-neutral-800/60">
              {currentVideo ? (
                <VideoPlayerContainer
                  key={currentVideo.videoId}
                  videoId={currentVideo.videoId}
                  startAt={currentVideo.last_position ?? 0}
                  playlistId={ytPlaylistId}
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 dark:text-neutral-500">
                  Select a video to start learning
                </div>
              )}
            </div>

            {/* Prev / Next / Complete */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800/90 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-slate-200/80 dark:border-neutral-700/80 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={currentIdx >= videos.length - 1}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-black bg-[#D5FF38] hover:bg-[#c4ec32] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shadow-none whitespace-nowrap"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {currentVideo && (
                <button
                  onClick={() => markMut.mutate({ videoId: currentVideo.videoId, watched: !isCompleted(currentVideo.videoId) })}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${isCompleted(currentVideo.videoId)
                      ? "bg-[#D5FF38] text-black border-[#D5FF38] font-black shadow-none"
                      : "bg-slate-100 dark:bg-neutral-800/90 text-slate-700 dark:text-neutral-300 border-slate-200/80 dark:border-neutral-700/80 hover:bg-[#D5FF38]/20 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted(currentVideo.videoId) ? "text-black" : "text-slate-500 dark:text-neutral-400"}`} />
                  {isCompleted(currentVideo.videoId) ? "Completed ✓" : "Mark Complete"}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Pills below Video */}
          <div className="bg-white dark:bg-[#18191F] rounded-[28px] border border-slate-200/90 dark:border-neutral-800 p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-4 flex-wrap">
              {(["Overview", "Instructor", "FAQ"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                      ? "bg-[#D5FF38] text-black font-extrabold shadow-none"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/80"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Details */}
            {activeTab === "Overview" && (
              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">About this Course</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                  {pl.description || `This module shows how to apply ${pl.skill_query || "concepts"} in real-world tasks: setting up the environment, organizing project structure, writing and debugging code. After viewing it, you will be able to create simple interactivity without frameworks.`}
                </p>
                <div className="flex items-center gap-4 pt-3 text-xs text-slate-500 dark:text-neutral-400 flex-wrap">
                  <span>Instructor: <strong className="text-slate-800 dark:text-white">{pl.channel || "Verified Top Educator"}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-800 dark:text-[#D5FF38]">{pl.skill_query || "General"}</strong></span>
                  <span>•</span>
                  <span>Level: <strong className="text-slate-800 dark:text-white">{pl.level || "All Levels"}</strong></span>
                </div>
              </div>
            )}

            {activeTab === "Instructor" && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-100 dark:border-neutral-800 pt-1">
                <div className="w-12 h-12 rounded-full bg-neutral-800 text-[#D5FF38] border border-neutral-700 font-black flex items-center justify-center text-base shadow-none">
                  {pl.channel ? pl.channel.slice(0, 2).toUpperCase() : "IN"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pl.channel || "Expert Instructor"}</h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Curated Top Educator on YouTube</p>
                </div>
              </div>
            )}

            {activeTab === "FAQ" && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-neutral-300 pt-1">
                <p><strong className="text-slate-900 dark:text-white">Q: How is my learning progress tracked?</strong><br />Progress marks complete automatically when watching over 75% of a lesson video.</p>
                <p><strong className="text-slate-900 dark:text-white">Q: Can I rewatch videos anytime?</strong><br />Yes, saved playlists remain available indefinitely in your account.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Course Content Playlist */}
        <div>
          {/* Course Content Playlist */}
          <div className="bg-white dark:bg-[#18191F] rounded-[28px] border border-slate-200/90 dark:border-neutral-800 p-5 shadow-sm space-y-4 flex flex-col max-h-[680px] transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Course content</h3>
              <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 px-2.5 py-0.5 rounded-full">
                {videos.length} Videos
              </span>
            </div>

            {/* Videos List */}
            <div ref={sidebarRef} className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {videos.map((v, i) => {
                const done = isCompleted(v.videoId);
                const isCurrent = i === currentIdx;

                return (
                  <button
                    key={v.videoId}
                    data-idx={i}
                    onClick={() => changeLesson(i)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${isCurrent
                        ? "bg-slate-100 dark:bg-neutral-800 border-2 border-[#D5FF38] text-slate-900 dark:text-white font-bold shadow-none ring-0"
                        : done
                          ? "bg-slate-50 dark:bg-neutral-900/90 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800/70"
                          : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 font-medium hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${done
                          ? "bg-[#D5FF38] text-black font-black border border-[#D5FF38]"
                          : isCurrent
                            ? "bg-[#D5FF38] text-black font-black border border-[#D5FF38]"
                            : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 font-bold"
                        }`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={`text-xs leading-snug line-clamp-2 transition-colors ${isCurrent
                          ? "text-slate-900 dark:text-white font-bold"
                          : done
                            ? "line-through text-slate-400 dark:text-neutral-400 font-normal decoration-slate-400 dark:decoration-neutral-500"
                            : "text-slate-800 dark:text-neutral-200 font-medium"
                        }`}>
                        {v.title}
                      </span>
                    </div>

                    {done && !isCurrent && (
                      <CheckCircle2 className="w-4 h-4 text-[#D5FF38] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
