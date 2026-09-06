"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@/lib/progressRepository";
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

  const [activeTab, setActiveTab] = useState<"Overview" | "Notes" | "Instructor" | "FAQ">("Overview");

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
            className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white border border-emerald-400/40"
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
              <div className="text-emerald-100 text-xs">75% threshold reached ✓</div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Course Header Banner (Matches Screenshot) */}
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] bg-gradient-to-r from-[#173e32] via-[#12362b] to-[#0d2a21] p-3.5 sm:p-8 text-white shadow-md">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none hidden md:block">
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-pink-400 to-amber-300 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          {/* Breadcrumb + Back Button */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200/80">
            <button
              onClick={onBack}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> My courses
            </button>
            <span>&gt;</span>
            <span className="text-white font-bold">{pl.title}</span>
          </div>

          {/* Big Course Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {pl.title}
          </h1>

          {/* Course description */}
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal line-clamp-2">
            {pl.description || `This course will help you quickly get started with ${pl.skill_query || "this topic"}: setting up the environment, project structure, syntax, data types, functions, DOM, and basic debugging.`}
          </p>

          {/* Progress & Lessons Info */}
          <div className="flex items-center gap-6 pt-2 flex-wrap text-xs sm:text-sm font-semibold text-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-40 h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span>{pct}% complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{videos.length - watchedCount} videos left</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Player Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT COLUMN: Player + Tab Controls + About */}
        <div className="space-y-6">
          {/* Embedded Video Card */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-4 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                {currentVideo ? `${currentIdx + 1}. ${currentVideo.title}` : pl.title}
              </h2>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                {currentIdx + 1} of {videos.length}
              </span>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
              {currentVideo ? (
                <VideoPlayerContainer
                  key={currentVideo.videoId}
                  videoId={currentVideo.videoId}
                  startAt={currentVideo.last_position ?? 0}
                  playlistId={ytPlaylistId}
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400">
                  Select a video to start learning
                </div>
              )}
            </div>

            {/* Prev / Next / Complete */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={goNext}
                  disabled={currentIdx >= videos.length - 1}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-600/20 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {currentVideo && (
                <button
                  onClick={() => markMut.mutate({ videoId: currentVideo.videoId, watched: !isCompleted(currentVideo.videoId) })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompleted(currentVideo.videoId)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isCompleted(currentVideo.videoId) ? "Completed ✓" : "Mark Complete"}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Pills below Video */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              {(["Overview", "Notes", "Instructor", "FAQ"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-amber-400 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Details */}
            {activeTab === "Overview" && (
              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900">About this Course</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pl.description || `This module shows how to apply ${pl.skill_query || "concepts"} in real-world tasks: setting up the environment, organizing project structure, writing and debugging code. After viewing it, you will be able to create simple interactivity without frameworks.`}
                </p>
                <div className="flex items-center gap-4 pt-3 text-xs text-slate-500 flex-wrap">
                  <span>Instructor: <strong className="text-slate-800">{pl.channel || "Verified Top Educator"}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-800">{pl.skill_query || "General"}</strong></span>
                  <span>•</span>
                  <span>Level: <strong className="text-slate-800">{pl.level || "All Levels"}</strong></span>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div className="space-y-3 pt-1">
                <h3 className="text-base font-bold text-slate-900">Key Timestamps</h3>
                <div className="space-y-2">
                  {[
                    { time: "2:10", text: "Arrays: map, filter, reduce — short examples." },
                    { time: "3:10", text: "Functions: declarations and expressions; default parameters." },
                    { time: "5:14", text: "Primitives vs objects; type conversion." },
                    { time: "6:12", text: "Variables let/const; when not to use var." },
                  ].map((n, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg font-mono">{n.time}</span>
                      <span className="text-xs text-slate-700 font-medium">{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Instructor" && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 pt-1">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  {pl.channel ? pl.channel.slice(0, 2).toUpperCase() : "IN"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{pl.channel || "Expert Instructor"}</h4>
                  <p className="text-xs text-slate-500 font-medium">Curated Top Educator on YouTube</p>
                </div>
              </div>
            )}

            {activeTab === "FAQ" && (
              <div className="space-y-3 text-xs text-slate-600 pt-1">
                <p><strong>Q: How is my learning progress tracked?</strong><br />Progress marks complete automatically when watching over 75% of a lesson video.</p>
                <p><strong>Q: Can I rewatch videos anytime?</strong><br />Yes, saved playlists remain available indefinitely in your account.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Course Content Playlist */}
        <div>
          {/* Course Content Playlist */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 p-5 shadow-sm space-y-4 flex flex-col max-h-[680px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Course content</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
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
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-400 border-amber-400 text-slate-900 shadow-md font-bold"
                        : done
                        ? "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100"
                        : "bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? "border border-slate-900 text-slate-900 bg-amber-300"
                          : done
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="text-xs font-semibold line-clamp-2 leading-snug">
                        {v.title}
                      </span>
                    </div>

                    {done && !isCurrent && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
