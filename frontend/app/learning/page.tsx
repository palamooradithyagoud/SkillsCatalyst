"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Loader2,
  Sparkles,
  CheckCircle,
  X,
  ShieldAlert,
  Search,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import MagnifierIcon from "@/components/icons/MagnifierIcon";
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
import { ActiveCard, LANGUAGES, extractPlaylistId } from "@/lib/learning/searchValidation";
import { SelectDropdown } from "@/components/learning/SelectDropdown";
import { SearchResults } from "@/components/learning/SearchResults";
import { SavedPlaylistRow } from "@/components/learning/SavedPlaylistRow";
import { FullPlayerView } from "@/components/learning/FullPlayerView";
import { LearningProgressCard } from "@/components/learning/LearningProgressCard";
import { PopularSkillPills } from "@/components/learning/PopularSkillPills";
import { useLearningSearch } from "@/hooks/useLearningSearch";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import { UsageLimitIndicator } from "@/components/premium";

export default function LearningPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();
  const { isPremium, getLimit } = useSubscription();
  const { openPricingModal } = usePricingModal();
  const savedLimit = isPremium ? null : (getLimit("saved_videos") ?? 1);

  const [activeCard, setActiveCard] = useState<ActiveCard>("explore");
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

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
        "View Saved →",
        () => setActiveCard("saved")
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
          "Free plan limit reached (1 saved course). Upgrade to Premium for unlimited saved courses!",
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
      className="max-w-6xl mx-auto space-y-5"
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
                ? "bg-emerald-900/85 border-emerald-500/30 text-emerald-200"
                : "bg-rose-900/85 border-rose-500/30 text-rose-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
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

      {/* ── Text Sub-Navigation Tabs: Explore Skills & Saved Videos ── */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/80 pb-3 pt-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCard("explore")}
          className={`relative pb-2.5 text-sm sm:text-base font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCard === "explore"
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <MagnifierIcon
            size={18}
            className={activeCard === "explore" ? "text-purple-600" : "text-slate-400"}
          />
          <span>Explore Skills</span>
          {activeCard === "explore" && (
            <motion.div
              layoutId="learningActiveTabIndicator"
              className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveCard("saved")}
          className={`relative pb-2.5 text-sm sm:text-base font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCard === "saved"
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Bookmark
            className={`w-[18px] h-[18px] ${activeCard === "saved" ? "text-purple-600" : "text-slate-400"}`}
          />
          <span>Saved Videos</span>
          {savedList.length > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-extrabold transition-colors ${
                activeCard === "saved"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {savedList.length}
            </span>
          )}
          {activeCard === "saved" && (
            <motion.div
              layoutId="learningActiveTabIndicator"
              className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
            />
          )}
        </button>
      </div>

      {/* ── EXPLORE Content */}
      <AnimatePresence mode="wait">
        {activeCard === "explore" && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* ── Your Learning Progress Hero Card (Explore Only) ── */}
            <LearningProgressCard
              dashboardData={dashboardData}
              videoProgressData={videoProgressData}
              userProgressData={userProgressData}
              savedList={savedList}
              onOpenPlaylist={(pl) => handleOpenPlayer(pl)}
              onOpenSavedTab={() => setActiveCard("saved")}
              onExploreClick={() => setActiveCard("explore")}
            />

            {/* Search bar matching Image 2 */}
            <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none"
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
                    className={`w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold bg-slate-50/70 border border-slate-200/90 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all shadow-2xs ${
                      queryError ? "border-rose-500" : ""
                    }`}
                  />
                </div>
                <SelectDropdown value={language} options={LANGUAGES} onChange={setLanguage} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSearch()}
                  disabled={searching || !query.trim()}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 whitespace-nowrap bg-gradient-to-r from-[#5f13e7] to-[#7928ca] hover:from-[#530dd4] hover:to-[#6b20b8] shadow-md shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Find Resources</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </motion.button>
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

        {/* ── SAVED Content */}
        {activeCard === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* ── Stats header matching user screenshot ── */}
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[32px] border border-purple-200/80 shadow-xs p-4 sm:p-7 md:p-8 bg-gradient-to-r from-white via-[#faf5ff] to-[#d8b4fe]/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
              {/* Background ambient orbs & luminous purple aura */}
              <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />
              <div className="absolute right-1/4 -bottom-10 w-72 h-72 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

              {/* Left Content */}
              <div className="space-y-2 max-w-lg z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100/90 border border-purple-200/70 text-purple-700 text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase inline-flex items-center gap-1.5 shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 3-8 4.5v9L12 21l8-4.5v-9L12 3z" />
                    </svg>
                    <span>LEARNING TRACKS</span>
                  </span>
                  {loadingSaved && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />}
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  Saved Playlists &amp; <span className="text-purple-600">Progress</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Watch your saved video playlists, track real video completion progress, and resume learning anytime.
                </p>
              </div>

              {/* Center Floating 3D Player Card Graphic */}
              <div className="hidden md:flex items-center justify-center relative z-10 shrink-0 mx-auto lg:mx-0">
                {/* Ambient Sparkles */}
                <span className="absolute -top-3 left-4 text-purple-200/90 text-xl font-bold select-none animate-pulse">
                  ✦
                </span>
                <span
                  className="absolute top-8 -right-4 text-purple-200/90 text-2xl font-bold select-none animate-pulse"
                  style={{ animationDelay: "1s" }}
                >
                  ✦
                </span>

                {/* Floating Tilted 3D Glass Card */}
                <div
                  className="relative w-36 h-28 sm:w-44 sm:h-34 rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-xl shadow-purple-900/10 flex flex-col items-center justify-center p-3 transition-transform duration-500 hover:scale-105"
                  style={{
                    transform: "perspective(700px) rotateY(-10deg) rotateX(6deg) rotate(-14deg)",
                  }}
                >
                  {/* Subtle inner glass reflection */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/30 to-white/60 pointer-events-none" />

                  {/* Play triangle */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <svg className="w-9 h-9 drop-shadow-sm" viewBox="0 0 24 24" fill="#7c3aed">
                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                    </svg>
                  </div>

                  {/* Bottom progress bar line */}
                  <div className="w-full mt-4 px-2">
                    <div className="w-full h-1.5 rounded-full bg-purple-100/80 overflow-hidden">
                      <div className="h-full w-2/5 rounded-full bg-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Stats Card with Dynamic Real User Data - Balanced for Mobile and Desktop */}
              <div className="relative z-10 w-full lg:w-auto grid grid-cols-2 divide-x divide-slate-200/80 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/90 shadow-xs shadow-purple-900/5 p-3 sm:px-6 sm:py-4 shrink-0">
                {/* Column 1: Saved Tracks */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 pr-2 sm:pr-6 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">
                      Saved Tracks
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {savedList.length}
                    </div>
                  </div>
                </div>

                {/* Column 2: Videos Watched */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 pl-3 sm:pl-6 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">
                      Videos Watched
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {completedSavedVideosCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Usage Limit Banner */}
            <UsageLimitIndicator
              used={savedList.length}
              limit={savedLimit}
              unitName="Saved Playlists"
              isPremium={isPremium}
            />

            {/* ── Playlist rows */}
            {savedList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl py-16 sm:py-20 px-6 border border-slate-200/80 shadow-xs flex flex-col items-center gap-3.5 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-1 shadow-2xs">
                  <Bookmark className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-slate-800 font-bold text-base sm:text-lg">No saved playlists yet</div>
                <div className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
                  Search for a skill in Explore Skills and click the{" "}
                  <strong className="text-purple-600 font-semibold">Save</strong> button to build your personal learning track.
                </div>
                <button
                  onClick={() => setActiveCard("explore")}
                  className="mt-3 px-6 py-2.5 rounded-xl text-sm text-white font-bold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" /> Explore Skills
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {savedList.map((pl, i) => (
                  <SavedPlaylistRow
                    key={pl.id}
                    pl={pl}
                    onWatch={(p) => handleOpenPlayer(p)}
                    onDelete={(id) => unsaveMut.mutate(id)}
                    onWatchVideo={(p, idx) => handleOpenPlayer(p, idx)}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
