"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search } from "lucide-react";
import { Playlist, SearchResult } from "@/lib/api";
import { PlaylistCard } from "./PlaylistCard";

export function PlaylistCardSkeleton() {
  return (
    <div className="relative w-full h-full min-h-[190px] sm:min-h-[225px] rounded-[22px] bg-white dark:bg-[#18191F] border border-slate-200/90 dark:border-[#24271F] p-3 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden animate-pulse select-none">
      {/* Top Header: Rank Circle & Channel Name Skeleton */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        <div className="w-[36px] h-[36px] sm:w-10 sm:h-10 rounded-full bg-slate-200/80 dark:bg-neutral-800 shrink-0" />
        <div className="h-3 w-20 sm:w-28 rounded-md bg-slate-200/80 dark:bg-neutral-800" />
      </div>

      {/* Video Title Lines Skeleton: Moved down into middle */}
      <div className="space-y-1.5 my-auto pt-2.5 sm:pt-3 pb-1">
        <div className="h-3.5 sm:h-4 w-[92%] rounded-md bg-slate-200/80 dark:bg-neutral-800" />
        <div className="h-3.5 sm:h-4 w-[65%] rounded-md bg-slate-200/80 dark:bg-neutral-800" />
      </div>

      {/* Bottom: Language Badge Kept Down & Buttons Skeleton */}
      <div className="pt-1">
        <div className="mb-2">
          <div className="h-4.5 w-14 rounded-full bg-slate-200/80 dark:bg-neutral-800" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-[#24271F]">
          <div className="flex-1 h-7 sm:h-8 rounded-full bg-slate-200/80 dark:bg-neutral-800" />
          <div className="flex-1 h-7 sm:h-8 rounded-full bg-slate-200/80 dark:bg-neutral-800" />
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
