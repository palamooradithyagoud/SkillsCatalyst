"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Play,
  ArrowRight,
  Search,
  RefreshCw,
  Newspaper,
} from "lucide-react";
import type { GroupedTechNewsSource } from "@/types/tech_news";
import { fetchStudentTechNews } from "@/lib/api/tech_news";
import { TechNewsSourceCircle } from "@/components/tech-news/TechNewsSourceCircle";
import { TechNewsStoryViewer } from "@/components/tech-news/TechNewsStoryViewer";

function getHoursRemaining(visibleUntil?: string | null): string {
  if (!visibleUntil) return "48h drop";
  const diffMs = new Date(visibleUntil).getTime() - Date.now();
  if (diffMs <= 0) return "Expiring soon";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Just now";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TechNewsWidget() {
  const [sources, setSources] = useState<GroupedTechNewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all");

  // Story Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSourceIndex, setViewerSourceIndex] = useState(0);
  const [viewerStoryIndex, setViewerStoryIndex] = useState(0);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStudentTechNews();
      setSources(data.sources || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load tech stories";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Open viewer at specific source & story
  const openStoryViewer = (sourceIdx: number, storyIdx: number = 0) => {
    setViewerSourceIndex(sourceIdx);
    setViewerStoryIndex(storyIdx);
    setViewerOpen(true);
  };

  // Flatten all stories across sources with index references
  const allStories = useMemo(() => {
    return sources.flatMap((src, srcIdx) =>
      src.stories.map((story, storyIdx) => ({
        ...story,
        sourceIdx,
        storyIdx,
        parentSource: src,
      }))
    );
  }, [sources]);

  // Filtered stories based on search query and selected publisher filter
  const filteredStories = useMemo(() => {
    return allStories.filter((item) => {
      const matchesSource =
        selectedSourceId === "all" || item.source_id === selectedSourceId;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (item.title || item.headline || "").toLowerCase().includes(q) ||
        (item.summary || "").toLowerCase().includes(q) ||
        (item.parentSource?.name || "").toLowerCase().includes(q);

      return matchesSource && matchesQuery;
    });
  }, [allStories, selectedSourceId, searchQuery]);

  const totalStoriesCount = allStories.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Top Bar: Search, Publisher Filter Pills, and Refresh ── */}
      <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3.5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Header Title + Stats */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Active Tech Stories</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  {totalStoriesCount} {totalStoriesCount === 1 ? "Story" : "Stories"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Ephemeral 48-hour tech drops uploaded by engineering teams
              </p>
            </div>
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tech stories..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>
            <button
              onClick={loadFeed}
              title="Refresh stories feed"
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-purple-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Publisher Filter Pills */}
        {sources.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setSelectedSourceId("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSourceId === "all"
                  ? "bg-purple-600 text-white shadow-xs shadow-purple-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Sources ({totalStoriesCount})
            </button>
            {sources.map((src) => {
              const count = src.stories?.length || 0;
              const isSelected = selectedSourceId === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() => setSelectedSourceId(src.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs shadow-purple-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{src.name}</span>
                  <span className={`text-[10px] px-1 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 48-Hour Stories Tray (Interactive Circular Avatars) ── */}
      {sources.length > 0 && (
        <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-colors">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Watch by Publisher
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                &bull; Tap circle to view full-screen story
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 px-1 no-scrollbar">
            {sources.map((src, idx) => (
              <TechNewsSourceCircle
                key={src.id}
                source={src}
                onClick={() => openStoryViewer(idx, 0)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Stories Feed Grid (Uploaded Tech News Story Reels) ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Uploaded Tech Stories
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"})
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1">
                    <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="w-12 h-2 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="w-3/4 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-center space-y-2">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-300">
              Failed to load stories: {error}
            </p>
            <button
              onClick={loadFeed}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#111625] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Newspaper className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Active Stories Found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery
                  ? "No tech stories match your current search filter. Try clearing the search query."
                  : "Stories expire automatically after 48 hours. Check back soon when new stories are published by tech teams!"}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredStories.map((story) => {
              const hoursLeft = getHoursRemaining(story.visible_until);
              const timeAgo = getRelativeTime(story.published_at || story.created_at);
              const publisher = story.parentSource;

              return (
                <motion.div
                  key={story.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => openStoryViewer(story.sourceIdx, story.storyIdx)}
                  className="group relative h-[360px] sm:h-[380px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between cursor-pointer select-none"
                >
                  {/* Background Cover Image / Futuristic Visual */}
                  <div className="absolute inset-0 z-0">
                    {story.cover_image_url ? (
                      <Image
                        src={story.cover_image_url}
                        alt={story.title || story.headline || "Cover"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#311042] flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/15 to-transparent" />
                      </div>
                    )}
                    {/* Dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/95 group-hover:from-black/70 group-hover:to-black/90 transition-colors" />
                  </div>

                  {/* ── Top Header: Publisher Info & 48h Countdown Badge ── */}
                  <div className="relative z-10 p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/25 p-0.5 overflow-hidden shadow-xs flex items-center justify-center shrink-0">
                        {publisher?.logo_url ? (
                          <Image
                            src={publisher.logo_url}
                            alt={publisher.name}
                            width={30}
                            height={30}
                            className="w-full h-full object-contain rounded-full"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[10px] font-black text-purple-200">
                            {(publisher?.name || "SC").slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white tracking-tight drop-shadow leading-tight">
                          {publisher?.name || story.source_name || "Tech News"}
                        </span>
                        <span className="text-[10px] text-zinc-300 font-medium leading-tight">
                          {timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* 48h Countdown Pill */}
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-cyan-300 text-[10px] font-bold flex items-center gap-1 shrink-0 drop-shadow-sm">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{hoursLeft}</span>
                    </span>
                  </div>

                  {/* ── Center Hover Play Icon ── */}
                  <div className="relative z-10 flex items-center justify-center my-auto pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-purple-600/90 group-hover:border-purple-400 transition-all duration-300">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* ── Bottom Content & CTAs ── */}
                  <div className="relative z-10 p-4 space-y-2.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>48h Curated Story</span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow">
                      {story.title || story.headline}
                    </h4>

                    <p className="text-[11px] text-zinc-300 font-normal line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>

                    {/* Action Buttons */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStoryViewer(story.sourceIdx, story.storyIdx);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch Story</span>
                      </button>

                      <Link
                        href={`/tech-news/${story.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Read full article"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Full-Screen Story Viewer Modal ── */}
      {viewerOpen && sources.length > 0 && (
        <TechNewsStoryViewer
          sources={sources}
          initialSourceIndex={viewerSourceIndex}
          initialStoryIndex={viewerStoryIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
