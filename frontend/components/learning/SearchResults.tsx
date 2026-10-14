"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, CheckCircle, Database, Search } from "lucide-react";
import { Playlist, SearchResult } from "@/lib/api";
import { PlaylistCard } from "./PlaylistCard";

export function SearchResults({
  searching,
  hasSearched,
  searchTerm,
  query,
  queryError,
  results,
  searchData,
  savedIds,
  onSave,
  onUnsave,
  onWatch,
  onSelectSuggestion,
}: {
  searching: boolean;
  hasSearched: boolean;
  searchTerm: string;
  query: string;
  queryError: string | null;
  results: Playlist[];
  searchData?: SearchResult;
  savedIds: Set<string>;
  onSave: (pl: Playlist) => void;
  onUnsave: (id: string) => void;
  onWatch: (pl: Playlist) => void;
  onSelectSuggestion: (s: string) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {searching && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-24 gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-[#A855F7] dark:text-[#C084FC]" />
          <div className="text-slate-600 dark:text-neutral-400 text-sm font-medium">
            Searching curated playlists &amp; YouTube API for{" "}
            <span className="text-slate-900 dark:text-white font-bold">"{query}"</span>...
          </div>
        </motion.div>
      )}

      {!searching && hasSearched && results.length === 0 && (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-20 gap-3 text-center"
        >
          <Globe className="w-12 h-12 text-slate-400 dark:text-neutral-500" />
          <div className="text-slate-600 dark:text-neutral-400 text-sm font-medium">
            No results found for "<span className="text-slate-900 dark:text-white font-bold">{searchTerm}</span>"
          </div>
          <div className="text-slate-500 dark:text-neutral-500 text-xs">Try a broader term like "Python", "Java", or "DSA"</div>
        </motion.div>
      )}

      {!searching && results.length > 0 && (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {results.length} Playlist{results.length !== 1 ? "s" : ""} for
              <span className="text-[#A855F7] dark:text-[#C084FC] font-extrabold ml-2">"{searchTerm}"</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {results.map((pl, i) => (
              <PlaylistCard
                key={pl.id + i}
                pl={pl}
                rank={i + 1}
                savedIds={savedIds}
                onSave={onSave}
                onUnsave={onUnsave}
                onWatch={onWatch}
                delay={i * 0.06}
              />
            ))}
          </div>
        </motion.div>
      )}

      {!hasSearched && !queryError && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-20 gap-3 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-[#18191F] border border-purple-100 dark:border-neutral-800 flex items-center justify-center mb-1 shadow-sm">
            <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-slate-800 dark:text-white font-bold text-base sm:text-lg">
            Search
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
