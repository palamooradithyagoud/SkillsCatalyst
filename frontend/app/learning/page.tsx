"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  X,
  ShieldAlert,
  Search,
  ArrowRight,
  BarChart3,
  Compass,
  BookOpen,
  Bookmark,
  Play,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  savePlaylist,
  unsavePlaylist,
  fetchSavedPlaylists,
  fetchDashboardData,
  Playlist,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { LANGUAGES, extractPlaylistId } from "@/lib/learning/searchValidation";
import { SelectDropdown } from "@/components/learning/SelectDropdown";
import { SearchResults } from "@/components/learning/SearchResults";
import { FullPlayerView } from "@/components/learning/FullPlayerView";
import { PopularSkillPills } from "@/components/learning/PopularSkillPills";
import { SavedCourseProgressBanner } from "@/components/learning/SavedCourseProgressBanner";
import { useLearningSearch } from "@/hooks/useLearningSearch";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";

export default function LearningPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();
  const { openPricingModal } = usePricingModal();

  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

  // ── Active Section Mode: "explore" (Explore section) | "learning-space" (Your Learning Space)
  const [activeSection, setActiveSection] = useState<"explore" | "learning-space">("explore");

  // ── Player state
  const [playerPlaylist, setPlayerPlaylist] = useState<Playlist | null>(null);
  const [playerVideoIndex, setPlayerVideoIndex] = useState<number | undefined>(undefined);

  // ── Search Hook
  const {
    query,
    setQuery,
    language,
    setLanguage,
    searchTerm,
    hasSearched,
    queryError,
    setQueryError,
    searchData,
    searching,
    handleSearch,
    handleSelectSuggestion,
  } = useLearningSearch();

  // ── Toast Helper
  const showNotif = useCallback((msg: string, type: "success" | "error", actionText?: string, onAction?: () => void) => {
    setNotification({ msg, type, actionText, onAction });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ── Saved Playlists Query
  const { data: savedData, isFetching: loadingSaved } = useQuery({
    queryKey: ["saved-playlists", userId],
    queryFn: () => fetchSavedPlaylists(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ── Real User Dashboard Data (Streak, Roadmap, Learning Metrics)
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboardData(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  // ── Real User Video Progress (Watched Videos, Watch Time) directly from Supabase
  const { data: videoProgressData } = useQuery({
    queryKey: ["user-video-progress", userId],
    queryFn: async () => {
      if (!userId) return { watchedCount: 0, totalWatchTimeSeconds: 0 };
      const { data, error } = await supabase
        .from("video_progress")
        .select("playlist_id, video_id, watched, watch_time, last_position, updated_at, completed_at")
        .eq("user_id", userId);
      if (error || !data) return { watchedCount: 0, totalWatchTimeSeconds: 0 };
      const watchedCount = data.filter((r) => !!r.watched).length;
      const totalWatchTimeSeconds = data.reduce(
        (acc, r) => acc + Math.max(Number(r.watch_time) || 0, Number(r.last_position) || 0),
        0
      );
      return { watchedCount, totalWatchTimeSeconds, raw: data };
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  // ── Real User Progress (Streak Days) directly from Supabase
  const { data: userProgressData } = useQuery({
    queryKey: ["user-progress", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_progress")
        .select("streak_days, total_xp, level")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const savedIds = new Set(savedData?.saved?.map((p: Playlist) => p.id) ?? []);
  const savedList: Playlist[] = savedData?.saved ?? [];
  const results: Playlist[] = searchData?.results ?? [];

  const completedSavedVideosCount = React.useMemo(() => {
    if (!videoProgressData?.raw || savedList.length === 0) return 0;
    const allSavedIds = new Set<string>();
    savedList.forEach((pl) => {
      if (pl.id) allSavedIds.add(String(pl.id));
      if ((pl as any).playlist_id) allSavedIds.add(String((pl as any).playlist_id));
      const ext = extractPlaylistId(pl.playlist_url ?? "");
      if (ext) allSavedIds.add(String(ext));
    });
    return videoProgressData.raw.filter(
      (r: any) =>
        !!r.watched &&
        (allSavedIds.has(String(r.playlist_id)) || allSavedIds.has(String(r.video_id)))
    ).length;
  }, [savedList, videoProgressData]);

  // ── Mutations
  const saveMut = useMutation({
    mutationFn: (pl: Playlist) => savePlaylist(pl, searchTerm),
    onSuccess: (_, pl) => {
      showNotif(
        `"${pl.title.slice(0, 35)}..." saved to Supabase!`,
        "success",
        "View in Learning Space →",
        () => setActiveSection("learning-space")
      );
      qc.invalidateQueries({ queryKey: ["saved-playlists"] });
      qc.refetchQueries({ queryKey: ["saved-playlists"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      const isLimit =
        err?.status === 403 ||
        err?.code === "LIMIT_REACHED" ||
        err?.detail?.code === "LIMIT_REACHED" ||
        err?.code === "PREMIUM_REQUIRED" ||
        err?.detail?.code === "PREMIUM_REQUIRED";

      if (isLimit) {
        showNotif(
          "Free plan limit reached (1 saved playlist). Upgrade to Premium for unlimited saved playlists!",
          "error",
          "Upgrade →",
          () => openPricingModal()
        );
      } else {
        const msg = err?.detail?.message || err?.message || "Failed to save. Check backend connection.";
        showNotif(msg, "error");
      }
    },
  });

  const unsaveMut = useMutation({
    mutationFn: (id: string) => unsavePlaylist(id),
    onSuccess: () => {
      showNotif("Removed from Supabase saved playlists.", "success");
      qc.invalidateQueries({ queryKey: ["saved-playlists"] });
      qc.refetchQueries({ queryKey: ["saved-playlists"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => showNotif("Failed to remove.", "error"),
  });

  const handleOpenPlayer = useCallback((pl: Playlist, idx?: number) => {
    setPlayerVideoIndex(idx);
    setPlayerPlaylist(pl);
  }, []);

  // ── Full Player Mode — replaces entire page
  if (playerPlaylist) {
    return (
      <FullPlayerView
        pl={playerPlaylist}
        initialVideoIndex={playerVideoIndex}
        onBack={() => setPlayerPlaylist(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-5 pb-28 sm:pb-12"
    >
      {/* ── Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-[60] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl text-sm font-semibold border backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-purple-950/90 border-purple-500/40 text-purple-200"
                : "bg-rose-900/85 border-rose-500/30 text-rose-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-[#C084FC]" />
            ) : (
              <X className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.msg}</span>
            {notification.actionText && notification.onAction && (
              <button
                onClick={notification.onAction}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/40 transition-colors cursor-pointer"
              >
                {notification.actionText}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section Switcher: 1. Explore section | 2. Your Learning Space ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] self-start shadow-none">
          <button
            type="button"
            onClick={() => setActiveSection("explore")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeSection === "explore"
                ? "bg-[#D5FF38] text-black shadow-none scale-100"
                : "text-slate-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("learning-space")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeSection === "learning-space"
                ? "bg-[#D5FF38] text-black shadow-none scale-100"
                : "text-slate-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Your Learning Space</span>
            {savedList.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                  activeSection === "learning-space"
                    ? "bg-black text-[#D5FF38]"
                    : "bg-slate-200 dark:bg-[#18191F] text-slate-800 dark:text-[#D5FF38] border border-slate-300 dark:border-[#24271F]"
                }`}
              >
                {savedList.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick helper when in Explore if user has in-progress courses */}
        {activeSection === "explore" && savedList.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveSection("learning-space")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#D5FF38] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#D5FF38] animate-pulse" />
            <span>{savedList.length} active course{savedList.length > 1 ? "s" : ""} in Your Learning Space</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── SECTION 1: EXPLORE SECTION ── */}
      {activeSection === "explore" && (
        <motion.div
          key="explore-section"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Search bar & Topics Card */}
          <div className="bg-white dark:bg-[#18191F] rounded-[28px] p-4 sm:p-6 border border-slate-200/80 dark:border-[#24271F] shadow-none space-y-4">
            <div className="flex flex-col gap-3">
              {/* 1. Full-width Search Bar */}
              <div className="relative w-full">
                <Search
                  className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setQueryError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search a programming skill, tool, or technology (e.g. Python, React, DSA)"
                  className={`w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold bg-slate-50/70 dark:bg-[#121318] border border-slate-200/90 dark:border-[#24271F] rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-[#121318] focus:border-[#D5FF38] dark:focus:border-[#D5FF38] focus:ring-1 focus:ring-[#D5FF38] focus:outline-none transition-all shadow-none ${
                    queryError ? "border-rose-500" : ""
                  }`}
                />
              </div>

              {/* 2. Language Dropdown and Find Resources together */}
              <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full">
                <div className="shrink-0">
                  <SelectDropdown value={language} options={LANGUAGES} onChange={setLanguage} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch()}
                  disabled={searching || !query.trim()}
                  className="flex-1 sm:flex-initial sm:px-8 py-3 sm:py-3.5 rounded-2xl text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap bg-[#D5FF38] hover:bg-[#cbf526] active:bg-[#bfe820] shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" /> Searching...
                    </>
                  ) : (
                    <>
                      <span>Find Resources</span>
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Popular Skill Pills with authentic logos & Browse all */}
            <PopularSkillPills
              onSelectSkill={(skillName) => handleSearch(skillName)}
              activeSkill={searchTerm}
            />

            {/* Inline query error */}
            <AnimatePresence>
              {queryError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2 mt-1 px-4 py-3 rounded-xl text-sm text-rose-700 bg-rose-50 border border-rose-200"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{queryError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Grid / Loading / Empty / Idle Suggestions */}
          <SearchResults
            searching={searching}
            hasSearched={hasSearched}
            searchTerm={searchTerm}
            query={query}
            queryError={queryError}
            results={results}
            searchData={searchData}
            savedIds={savedIds}
            onSave={(p) => saveMut.mutate(p)}
            onUnsave={(id) => unsaveMut.mutate(id)}
            onWatch={(p) => handleOpenPlayer(p)}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </motion.div>
      )}

      {/* ── SECTION 2: YOUR LEARNING SPACE (Keep the saved progress here!) ── */}
      {activeSection === "learning-space" && (
        <motion.div
          key="learning-space-section"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-[#18191F] rounded-[24px] border border-slate-200/80 dark:border-[#24271F] shadow-none">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] text-slate-800 dark:text-[#D5FF38]">
                <Sparkles className="w-3.5 h-3.5 text-[#D5FF38]" />
                <span>Personal Learning Space</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Your Learning Space
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 font-medium">
                Track your active courses, continue where you left off, and manage your saved playlists.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveSection("explore")}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#24271F] border border-slate-200 dark:border-[#24271F] text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#D5FF38]" />
                <span>Explore More Courses</span>
              </button>
            </div>
          </div>

          {/* ── Saved Course Progress Banner (Keep the saved progress here!) ── */}
          {savedList.length > 0 ? (
            <div className="space-y-6">
              <SavedCourseProgressBanner
                savedList={savedList}
                videoProgressData={videoProgressData}
                onOpenPlaylist={(pl) => handleOpenPlayer(pl)}
                onExploreTopic={(topic) => {
                  setActiveSection("explore");
                  handleSearch(topic);
                }}
              />

              {/* Saved Playlists Detailed Shelf */}
              <div className="bg-white dark:bg-[#18191F] rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-[#24271F] shadow-none space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24271F] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#D5FF38]" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Saved Playlists &amp; Courses
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-[#24271F]">
                      {savedList.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedList.map((pl) => {
                    const plId = pl.id || (pl as any).playlist_id;
                    const watchedCount =
                      videoProgressData?.raw?.filter(
                        (r: any) =>
                          !!r.watched &&
                          (String(r.playlist_id) === String(plId) ||
                            (pl.playlist_url &&
                              String(r.playlist_id) === String(extractPlaylistId(pl.playlist_url))))
                      ).length || 0;
                    const totalVideos = Number(pl.video_count) || 1;
                    const pct = Math.min(100, Math.round((watchedCount / totalVideos) * 100));

                    return (
                      <div
                        key={pl.id}
                        className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/80 dark:border-[#24271F] flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors group"
                      >
                        <div className="space-y-2">
                          {pl.thumbnail && (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
                              <img
                                src={pl.thumbnail}
                                alt={pl.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                                {pl.video_count || 0} Videos
                              </div>
                            </div>
                          )}

                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-[#D5FF38] transition-colors">
                            {pl.title}
                          </h3>

                          {pl.channel && (
                            <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                              {pl.channel}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-slate-200/70 dark:border-[#24271F]">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                            <span>Progress</span>
                            <span className="text-slate-900 dark:text-white font-bold">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full bg-[#D5FF38] transition-all duration-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenPlayer(pl)}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{watchedCount > 0 ? "Resume" : "Start Learning"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => unsaveMut.mutate(pl.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#18191F] transition-colors cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-[28px] bg-white dark:bg-[#18191F] border border-slate-200/80 dark:border-[#24271F] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] flex items-center justify-center mx-auto text-slate-600 dark:text-[#D5FF38]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  No courses in Your Learning Space yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto font-medium">
                  Search and save high-yield playlists or full programming roadmaps in the Explore section to track your progress here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection("explore")}
                className="px-6 py-2.5 rounded-xl bg-[#D5FF38] text-black font-extrabold text-xs inline-flex items-center gap-2 hover:bg-[#cbf526] transition-all cursor-pointer shadow-none active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Go to Explore Section</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
      </motion.div>
  );
}
