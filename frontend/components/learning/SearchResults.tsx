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
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <div className="text-slate-600 text-sm font-medium">
            Searching CSV database &amp; YouTube API for{" "}
            <span className="text-slate-900 font-bold">"{query}"</span>...
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
          <Globe className="w-12 h-12 text-slate-400" />
          <div className="text-slate-600 text-sm font-medium">
            No results found for "<span className="text-slate-900 font-bold">{searchTerm}</span>"
          </div>
          <div className="text-slate-500 text-xs">Try a broader term like "Python", "Java", or "DSA"</div>
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
            <h2 className="text-lg font-bold text-slate-900">
              {results.length} Playlist{results.length !== 1 ? "s" : ""} for
              <span className="text-emerald-700 font-extrabold ml-2">"{searchTerm}"</span>
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-xs ${
                searchData?.source === "csv"
                  ? "bg-emerald-50 border-emerald-200/90 text-emerald-700"
                  : "bg-indigo-50 border-indigo-200/90 text-indigo-700"
              }`}
            >
              {searchData?.source === "csv" ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> From local CSV database
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 text-indigo-600" /> Fetched from YouTube API
                </>
              )}
            </span>
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2 shadow-sm">
            <Search className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="text-slate-800 font-bold text-base">
            Search for a programming skill or technology to get started.
          </div>
          <div className="text-slate-500 text-xs mt-0.5 mb-2 font-medium">
            Only skills, frameworks, and tools — no movies or entertainment.
          </div>
          <div className="text-slate-600 text-sm flex items-center gap-2 flex-wrap justify-center font-medium">
            Try:{" "}
            {["Python", "Java", "C++", "DSA", "React", "System Design", "Machine Learning", "SQL"].map((s) => (
              <button
                key={s}
                onClick={() => onSelectSuggestion(s)}
                className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline underline-offset-2 transition-colors px-2 py-0.5 rounded-md bg-emerald-50/60 border border-emerald-200/60"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
