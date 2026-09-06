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
  Playlist,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ActiveCard, LANGUAGES } from "@/lib/learning/searchValidation";
import { SelectDropdown } from "@/components/learning/SelectDropdown";
import { SearchResults } from "@/components/learning/SearchResults";
import { SavedPlaylistRow } from "@/components/learning/SavedPlaylistRow";
import { FullPlayerView } from "@/components/learning/FullPlayerView";
import { useLearningSearch } from "@/hooks/useLearningSearch";

export default function LearningPage() {
  const { session } = useAuth();
  const userId = session?.user_id;
  const qc = useQueryClient();

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

  const savedIds = new Set(savedData?.saved?.map((p: Playlist) => p.id) ?? []);
  const savedList: Playlist[] = savedData?.saved ?? [];
  const results: Playlist[] = searchData?.results ?? [];

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
    onError: () => showNotif("Failed to save. Check backend connection.", "error"),
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
      className="max-w-7xl mx-auto space-y-6"
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

      {/* ── Top Two Cards (Side-by-Side on Mobile Grid) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Card 1 — Explore */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
          onClick={() => setActiveCard("explore")}
          className={`relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-6 cursor-pointer transition-all overflow-hidden bg-white border ${
            activeCard === "explore"
              ? "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-transparent shadow-md shadow-emerald-600/10"
              : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase mb-2">
            CARD 1
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/30">
              <MagnifierIcon size={20} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 leading-snug">
                Explore Skills
              </h3>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-normal line-clamp-2 sm:line-clamp-none">
                AI-curated video playlists &amp; roadmaps.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 2 — Saved */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          onClick={() => setActiveCard("saved")}
          className={`relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-6 cursor-pointer transition-all overflow-hidden bg-white border ${
            activeCard === "saved"
              ? "border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-transparent shadow-md shadow-emerald-600/10"
              : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md"
          }`}
        >
          {/* Saved count badge */}
          <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 shadow-xs">
            <SaveIcon size={12} className="w-3 h-3 text-emerald-700" />
            <span>{savedData?.count ?? 0} Saved</span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 tracking-widest uppercase mb-2">
            CARD 2
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm shadow-emerald-600/30">
              <SaveIcon size={20} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 leading-snug">
                Saved Playlists
              </h3>
              <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-normal line-clamp-2 sm:line-clamp-none">
                Access saved tracks &amp; video progress.
              </p>
            </div>
          </div>
        </motion.div>
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
                    COMPLETED
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-300">0</div>
                </div>
              </div>
            </div>

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
                  Search for a skill in Card 1 and click the{" "}
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
