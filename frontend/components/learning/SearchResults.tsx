"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search } from "lucide-react";
import { Playlist, SearchResult } from "@/lib/api";
import { PlaylistCard } from "./PlaylistCard";

export function PlaylistCardSkeleton() {
  return (
    <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#121318] border border-slate-200/80 dark:border-[#24271F] flex flex-col justify-between gap-2 sm:gap-3 h-full animate-pulse select-none shadow-none">
      <div className="space-y-1.5 sm:space-y-2">
        {/* 16:9 Thumbnail skeleton matching Reference Image 2 */}
        <div className="relative aspect-video rounded-lg sm:rounded-xl bg-slate-200/80 dark:bg-neutral-800" />
        {/* Title skeleton */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3.5 sm:h-4 w-[90%] rounded-md bg-slate-200/80 dark:bg-neutral-800" />
          <div className="h-3.5 sm:h-4 w-[60%] rounded-md bg-slate-200/80 dark:bg-neutral-800" />
        </div>
        {/* Channel skeleton */}
        <div className="h-3 w-24 rounded-md bg-slate-200/80 dark:bg-neutral-800" />
      </div>

      {/* Progress & Buttons skeleton */}
      <div className="space-y-2 pt-1.5 sm:pt-2 border-t border-slate-200/70 dark:border-[#24271F]">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-12 rounded bg-slate-200/80 dark:bg-neutral-800" />
          <div className="h-2.5 w-6 rounded bg-slate-200/80 dark:bg-neutral-800" />
        </div>
        <div className="w-full h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800" />
        <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
          <div className="flex-1 h-7 sm:h-8 rounded-lg sm:rounded-xl bg-slate-200/80 dark:bg-neutral-800" />
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg sm:rounded-xl bg-slate-200/80 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

export function SearchResults({
  searching,
  hasSearched,
  searchTerm,
  query,
  queryError,
  results,
  searchData,
  savedIds,
  videoProgressData,
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
  videoProgressData?: any;
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
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4"
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <PlaylistCardSkeleton key={`skeleton-${idx}`} />
          ))}
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
              <span className="text-[#D5FF38] font-extrabold ml-1.5">{searchTerm}</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {results.map((pl, i) => (
              <PlaylistCard
                key={pl.id + i}
                pl={pl}
                rank={i + 1}
                savedIds={savedIds}
                videoProgressData={videoProgressData}
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
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#18191F] border border-slate-200 dark:border-neutral-800 flex items-center justify-center mb-1 shadow-none">
            <Search className="w-8 h-8 text-[#D5FF38]" />
          </div>
          <div className="text-slate-800 dark:text-white font-bold text-base sm:text-lg">
            Search
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
