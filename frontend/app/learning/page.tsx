"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Loader2,
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
import { PopularSkillPills } from "@/components/learning/PopularSkillPills";
import { useLearningSearch } from "@/hooks/useLearningSearch";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";

export default function LearningPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();
  const { openPricingModal } = usePricingModal();

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

      {/* ── Text Sub-Navigation Tabs: Explore Skills & Saved Videos ── */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/80 dark:border-neutral-800 pb-3 pt-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCard("explore")}
          className={`relative pb-2.5 text-sm sm:text-base font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCard === "explore"
              ? "text-slate-900 dark:text-white"
              : "text-slate-400 dark:text-white/80 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          <MagnifierIcon
            size={18}
            className={activeCard === "explore" ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-white/80"}
          />
          <span className={activeCard === "explore" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-400 dark:text-white/80 hover:dark:text-white font-bold"}>
            Explore Skills
          </span>
          {activeCard === "explore" && (
            <motion.div
              layoutId="learningActiveTabIndicator"
              className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveCard("saved")}
          className={`relative pb-2.5 text-sm sm:text-base font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeCard === "saved"
              ? "text-slate-900 dark:text-white"
              : "text-slate-400 dark:text-white/80 hover:text-slate-700 dark:hover:text-white"
          }`}
        >
          <Bookmark
            className={`w-[18px] h-[18px] ${activeCard === "saved" ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-white/80"}`}
          />
          <span className={activeCard === "saved" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-400 dark:text-white/80 hover:dark:text-white font-bold"}>
            Saved Videos
          </span>
          {savedList.length > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-extrabold transition-colors ${
                activeCard === "saved"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-white"
              }`}
            >
              {savedList.length}
            </span>
          )}
          {activeCard === "saved" && (
            <motion.div
              layoutId="learningActiveTabIndicator"
              className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 rounded-full"
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
            {/* Search bar matching Image 2 */}
            <div className="bg-white dark:bg-[#18191F] rounded-[28px] p-4 sm:p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3">
                {/* 1. Full-width Search Bar */}
                <div className="relative w-full">
                  <Search
                    className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#A478D8] dark:text-[#C4A3F0] pointer-events-none"
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
                    className={`w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold bg-slate-50/70 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-700/80 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-900 focus:border-[#A478D8] dark:focus:border-[#C4A3F0] focus:ring-2 focus:ring-[#A478D8]/20 dark:focus:ring-[#C4A3F0]/20 focus:outline-none transition-all shadow-2xs ${
                      queryError ? "border-rose-500" : ""
                    }`}
                  />
                </div>

                {/* 2. Downside: Language Dropdown and Find Resources together in one place */}
                <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full">
                  <div className="shrink-0">
                    <SelectDropdown value={language} options={LANGUAGES} onChange={setLanguage} />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSearch()}
                    disabled={searching || !query.trim()}
                    className="flex-1 sm:flex-initial sm:px-8 py-3 sm:py-3.5 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap bg-[#A478D8] hover:bg-[#9364CB] active:bg-[#8352BE] shadow-md shadow-[#A478D8]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Searching...
                      </>
                    ) : (
                      <>
                        <span>Find Resources</span>
                        <ArrowRight className="w-4 h-4 text-white" />
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
            {/* ── Playlist rows */}
            {savedList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-[#18191F] rounded-3xl py-16 sm:py-20 px-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col items-center gap-3.5 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-[#C084FC] mb-1 shadow-2xs">
                  <Bookmark className="w-7 h-7 text-purple-600 dark:text-[#C084FC]" />
                </div>
                <div className="text-slate-800 dark:text-white font-bold text-base sm:text-lg">No saved playlists yet</div>
                <div className="text-slate-500 dark:text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                  Search for a skill in Explore Skills and click the{" "}
                  <strong className="text-purple-600 dark:text-[#C084FC] font-semibold">Save</strong> button to build your personal learning track.
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
