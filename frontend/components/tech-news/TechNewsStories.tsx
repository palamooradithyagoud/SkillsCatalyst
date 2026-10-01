"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Sparkles, ChevronLeft, ChevronRight, RefreshCw, Zap } from "lucide-react";
import type { GroupedTechNewsSource } from "@/types/tech_news";
import { useStudentTechNews } from "@/hooks/useStudentTechNews";
import { useWatchedStories } from "@/hooks/useWatchedStories";
import { TechNewsSourceCircle } from "./TechNewsSourceCircle";
import { TechNewsStoryViewer } from "./TechNewsStoryViewer";
import { TechNewsEmptyState } from "./TechNewsEmptyState";

interface TechNewsStoriesProps {
  className?: string;
}

export const TechNewsStories: React.FC<TechNewsStoriesProps> = ({ className = "" }) => {
  const { data, isLoading, error: queryError, refetch } = useStudentTechNews();
  const sources = data?.sources || [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load stories feed") : null;
  const { watchedIds } = useWatchedStories();

  // Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [viewerSources, setViewerSources] = useState<GroupedTechNewsSource[]>([]);

  // Sort sources: unwatched sources come first, completely watched sources move to the end
  const sortedSources = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    return [...sources].sort((a, b) => {
      const aHasUnwatched = a.stories?.some((s) => !watchedIds.has(s.id)) ?? false;
      const bHasUnwatched = b.stories?.some((s) => !watchedIds.has(s.id)) ?? false;

      // Unwatched sources come first (-1), watched sources go to last (+1)
      if (aHasUnwatched && !bHasUnwatched) return -1;
      if (!aHasUnwatched && bHasUnwatched) return 1;

      // Secondary sorting: keep consistent display order
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [sources, watchedIds]);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const loadFeed = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    // Proactively unlock body overflow if previously stuck
    if (typeof document !== "undefined" && document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }
  }, []);

  // Check scroll position for chevrons
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons, { passive: true });
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        el.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [sortedSources, updateScrollButtons]);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const openViewerForSource = (index: number) => {
    setSelectedSourceIndex(index);
    setViewerSources(sortedSources);
    setViewerOpen(true);
  };

  return (
    <div
      className={`w-full bg-white dark:bg-[#111625] rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors relative group/tray ${className}`}
    >
      {/* ── Top Bar: Title, 48h Badge, Refresh ── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
            </span>
            <h3 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Tech Stories
            </h3>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[9.5px] font-bold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
            <span>48h Drops</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium hidden xs:inline">
            Tap to view
          </span>
          <button
            onClick={loadFeed}
            title="Refresh Stories"
            aria-label="Refresh Stories"
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-purple-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Content: Loading, Error, Empty, or Horizontal Tray ── */}
      {isLoading ? (
        // Skeleton circles
        <div className="flex items-center gap-3 overflow-hidden py-1 px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <div className="w-10 h-2 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>Failed to load tech stories: {error}</span>
          <button
            onClick={loadFeed}
            className="text-xs font-semibold underline hover:text-rose-800 dark:hover:text-white ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : sortedSources.length === 0 ? (
        <TechNewsEmptyState compact={true} onRefresh={loadFeed} />
      ) : (
        <div className="relative">
          {/* Left scroll chevron */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy(-180)}
              aria-label="Scroll left"
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto py-1 px-1 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sortedSources.map((src, idx) => {
              const unwatchedStories = src.stories?.filter((s) => !watchedIds.has(s.id)) || [];
              const hasUnviewed = unwatchedStories.length > 0;
              return (
                <TechNewsSourceCircle
                  key={src.id}
                  source={src}
                  hasUnviewed={hasUnviewed}
                  unwatchedCount={unwatchedStories.length}
                  onClick={() => openViewerForSource(idx)}
                />
              );
            })}
          </div>

          {/* Right scroll chevron */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy(180)}
              aria-label="Scroll right"
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Story Viewer Fullscreen Modal ── */}
      {viewerOpen && sortedSources.length > 0 && (
        <TechNewsStoryViewer
          sources={viewerSources.length > 0 ? viewerSources : sortedSources}
          initialSourceIndex={selectedSourceIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};
