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
} from "lucide-react";
import MagnifierIcon from "@/components/icons/MagnifierIcon";
import SaveIcon from "@/components/icons/SaveIcon";
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

      {/* ── Your Learning Progress Hero Card ── */}
      <LearningProgressCard
        dashboardData={dashboardData}
        videoProgressData={videoProgressData}
        userProgressData={userProgressData}
        savedList={savedList}
        onOpenPlaylist={(pl) => handleOpenPlayer(pl)}
        onOpenSavedTab={() => setActiveCard("saved")}
        onExploreClick={() => setActiveCard("explore")}
      />

      {/* ── Text Sub-Navigation Tabs: Explore Skills & Saved Videos ── */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/80 pb-3 pt-2">
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
          <SaveIcon
            size={18}
            className={activeCard === "saved" ? "text-purple-600" : "text-slate-400"}
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
            {/* Search bar */}
            <div className="bg-white rounded-[28px] p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifierIcon
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
                    className={`w-full pl-11 pr-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-200/90 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 transition-all shadow-xs ${
                      queryError ? "border-rose-500" : ""
                    }`}
                  />
                </div>
                <SelectDropdown value={language} options={LANGUAGES} onChange={setLanguage} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  disabled={searching || !query.trim()}
                  className="px-7 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" /> Find Resources
                    </>
                  )}
                </motion.button>
              </div>

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
            {/* ── Stats header */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-3.5 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-md shadow-emerald-900/10">
              <div className="space-y-1 sm:space-y-2 max-w-md text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase shadow-xs">
                    LEARNING TRACKS
                  </span>
                  {loadingSaved && <Loader2 className="w-3 h-3 animate-spin text-emerald-200" />}
                </div>
                <h2 className="text-base sm:text-3xl font-extrabold tracking-tight">
                  Saved Playlists &amp; Progress
                </h2>
                <p className="text-[11px] sm:text-sm text-emerald-100/90 font-medium leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Watch your saved video playlists, track real video completion progress, and resume learning anytime.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider mb-0.5">
                    SAVED TRACKS
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">{savedList.length}</div>
                </div>
                <div className="text-center px-4 py-2 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider mb-0.5">
                    VIDEOS WATCHED
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-300">{completedSavedVideosCount}</div>
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
                className="rounded-2xl py-24 flex flex-col items-center gap-4 text-center"
                style={{ background: "rgba(14,22,44,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Bookmark className="w-14 h-14 text-slate-700" />
                <div className="text-slate-400 font-semibold">No saved playlists yet.</div>
                <div className="text-slate-600 text-sm">
                  Search for a skill in Explore Skills and click the{" "}
                  <strong className="text-slate-400">Save</strong> button.
                </div>
                <button
                  onClick={() => setActiveCard("explore")}
                  className="mt-2 px-5 py-2.5 rounded-xl text-sm text-white font-bold flex items-center gap-2 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
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
