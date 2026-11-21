"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Clock, Video, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Playlist } from "@/lib/api";
import { extractPlaylistId } from "@/lib/learning/searchValidation";

/**
 * Curated palette for saved playlist cards:
 * Lilac, Blue, Magenta, Cyan, Warm Amber, Acid Lime
 */
export const SAVED_CARD_THEMES = [
  {
    name: "lilac",
    bg: "bg-[#DDD6FE]", // Pastel Lilac / Soft Lavender
    accent: "#A855F7",
  },
  {
    name: "blue",
    bg: "bg-[#BAE6FD]", // Sky Blue / Powder Blue
    accent: "#0EA5E9",
  },
  {
    name: "magenta",
    bg: "bg-[#FBCFE8]", // Pastel Magenta / Soft Pink
    accent: "#EC4899",
  },
  {
    name: "cyan",
    bg: "bg-[#A5F3FC]", // Vibrant Pastel Cyan
    accent: "#06B6D4",
  },
  {
    name: "yellow",
    bg: "bg-[#F6E9A3]", // Warm Amber Yellow
    accent: "#EAB308",
  },
  {
    name: "lime",
    bg: "bg-[#D9F99D]", // Soft Acid Lime
    accent: "#84CC16",
  },
];

interface SavedCourseProgressBannerProps {
  savedList?: Playlist[];
  videoProgressData?: {
    watchedCount: number;
    totalWatchTimeSeconds: number;
    raw?: any[];
  };
  onOpenPlaylist?: (pl: Playlist) => void;
  onExploreTopic?: (topic: string) => void;
}

export function SavedCourseProgressBanner({
  savedList = [],
  videoProgressData,
  onOpenPlaylist,
  onExploreTopic,
}: SavedCourseProgressBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // If the user has no saved courses, do not render the banner
  if (!savedList || savedList.length === 0) {
    return null;
  }

  // Smoothly scroll to a specific index in the card container
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const child = container.children[index] as HTMLElement | undefined;
      if (child) {
        child.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
        setActiveIndex(index);
      }
    },
    []
  );

  // Auto-advance / keep moving the cards periodically when multiple saved videos exist
  useEffect(() => {
    if (savedList.length <= 1 || isInteracting) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % savedList.length;
        scrollToIndex(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [savedList.length, isInteracting, scrollToIndex]);

  // Sync activeIndex with user's manual scroll in mobile view
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const firstChild = container.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const itemWidth = firstChild.offsetWidth + 12; // width + gap
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex >= 0 && newIndex < savedList.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Touch handlers to distinguish swipe vs tap and pause auto-advance during interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    if (dx > 8) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsDragging(false), 150);
    setTimeout(() => setIsInteracting(false), 3500);
  };

  const handleCardClick = (course: Playlist) => {
    if (isDragging) return; // Ignore click if user was swiping to move cards
    if (onOpenPlaylist) {
      onOpenPlaylist(course);
    } else if (onExploreTopic) {
      onExploreTopic(course.title || "Saved Course");
    }
  };

  return (
    <div className="relative w-full space-y-2">
      {/* ── Scrollable / Swipeable Cards Track (Keeps moving in mobile view) ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 sm:gap-4 py-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {savedList.map((course, idx) => {
          // Select color theme for this card (Lilac, Blue, Magenta, Cyan, etc.)
          const theme = SAVED_CARD_THEMES[idx % SAVED_CARD_THEMES.length];
          const title = course.title || "Saved Course";

          // Calculate total video count
          const rawVideos = (course as any)?.videos;
          const parsedCount = parseInt(String(course?.video_count || ""), 10);
          const totalVideosField =
            typeof course?.total_videos === "number" ? course.total_videos : null;

          const totalCount =
            Array.isArray(rawVideos) && rawVideos.length > 0
              ? rawVideos.length
              : totalVideosField && totalVideosField > 0
              ? totalVideosField
              : !isNaN(parsedCount) && parsedCount > 0
              ? parsedCount
              : 0;

          // Calculate actual watched videos count for this specific course
          let watchedInThis = 0;
          if (typeof course.completed_videos === "number") {
            watchedInThis = course.completed_videos;
          }
          if (Array.isArray(videoProgressData?.raw)) {
            const ytId =
              (course.playlist_url ? extractPlaylistId(course.playlist_url) : "") ||
              course.id;
            const matches = videoProgressData.raw.filter(
              (r: any) =>
                !!r.watched &&
                (String(r.playlist_id) === String(course.id) ||
                  (ytId && String(r.playlist_id) === String(ytId)) ||
                  String(r.video_id) === String(course.id))
            ).length;
            if (matches > watchedInThis) {
              watchedInThis = matches;
            }
          }

          // Calculate strictly real progress percentage (no hardcoded fallback)
          let progressPct = 0;
          if (typeof course.progress_pct === "number") {
            progressPct = Math.min(100, Math.max(0, Math.round(course.progress_pct)));
          } else if (totalCount > 0) {
            progressPct = Math.min(
              100,
              Math.max(0, Math.round((watchedInThis / totalCount) * 100))
            );
          }

          // Format videos count text
          const videosCountText =
            totalCount > 0
              ? watchedInThis > 0
                ? `${watchedInThis}/${totalCount} Videos`
                : `${totalCount} Video${totalCount !== 1 ? "s" : ""}`
              : "0 Videos";

          // Format clean human-readable duration (converts huge raw minutes like 1680 Min to Hours)
          let durationDisplay =
            course.duration && course.duration !== "?" && course.duration !== "0"
              ? String(course.duration).trim()
              : "";

          if (!durationDisplay || durationDisplay === "?") {
            const estMinutes = totalCount > 0 ? totalCount * 12 : 45;
            if (estMinutes >= 60) {
              const hours = Math.round(estMinutes / 60);
              durationDisplay = `${hours} Hours`;
            } else {
              durationDisplay = `${estMinutes} Min`;
            }
          } else {
            const minMatch = durationDisplay.match(/^(\d+)\s*(?:min|mins|minutes)?$/i);
            if (minMatch) {
              const totalMin = parseInt(minMatch[1], 10);
              if (!isNaN(totalMin) && totalMin >= 60) {
                durationDisplay = `${Math.round(totalMin / 60)} Hours`;
              } else if (!isNaN(totalMin)) {
                durationDisplay = `${totalMin} Min`;
              }
            }
          }

          return (
            <div
              key={course.id || idx}
              className={`shrink-0 snap-start transition-all duration-300 ${
                savedList.length > 1
                  ? "w-[88%] sm:w-[94%] md:w-full"
                  : "w-full"
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(course)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(course);
                  }
                }}
                className={`relative w-full rounded-[24px] sm:rounded-[28px] ${theme.bg} p-4 sm:p-6 md:p-7 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 select-none text-left h-full flex flex-col justify-between`}
              >
                {/* Subtle minimalist concentric arcs background (pure vector SVG, zero photo) */}
                <div className="absolute -right-8 -top-8 sm:-right-6 sm:-top-6 w-44 h-44 sm:w-60 sm:h-60 pointer-events-none select-none opacity-15">
                  <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    className="w-full h-full stroke-neutral-950"
                  >
                    <circle cx="150" cy="50" r="35" strokeWidth="1.5" />
                    <circle cx="150" cy="50" r="65" strokeWidth="1.5" />
                    <circle cx="150" cy="50" r="95" strokeWidth="1.5" />
                    <circle cx="150" cy="50" r="125" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* ── Content: Progress Label, Full Course Title, Duration & Videos Count ── */}
                <div className="relative z-10 flex flex-col justify-between h-full w-full">
                  <div>
                    {/* Label */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold tracking-wide text-neutral-800">
                        Progress
                      </span>
                      {savedList.length > 1 && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-950/10 text-neutral-800">
                          {idx + 1} of {savedList.length}
                        </span>
                      )}
                    </div>

                    {/* Heading */}
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight mt-1 sm:mt-1.5 line-clamp-2 font-sans pr-4">
                      {title}
                    </h3>

                    {/* Metadata Row: Duration & Videos Count */}
                    <div className="flex items-center gap-4 sm:gap-6 mt-2.5 sm:mt-3 text-neutral-800 font-semibold text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900" />
                        <span>{durationDisplay}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900" />
                        <span>{videosCountText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Dark Progress Pill + Circular Arrow */}
                  <div className="flex items-center gap-2 mt-4 sm:mt-5">
                    {/* Pill Capsule */}
                    <div className="bg-[#18191F] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex flex-col items-center justify-center shadow-none select-none min-w-[85px] sm:min-w-[95px]">
                      <span className="text-xs sm:text-sm md:text-base font-black text-white leading-none">
                        {progressPct}%
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-medium text-neutral-300 leading-tight mt-0.5">
                        Progress
                      </span>
                    </div>

                    {/* Circular Arrow Button */}
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[1.8px] sm:border-2 border-neutral-950 flex items-center justify-center bg-transparent group-hover:bg-neutral-950 transition-colors"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-950 stroke-[2.4]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Carousel Controls: Pagination Pills & Arrows (when > 1 saved course) ── */}
      {savedList.length > 1 && (
        <div className="flex items-center justify-between pt-1 px-1">
          {/* Pagination Dots / Pills */}
          <div className="flex items-center gap-1.5">
            {savedList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToIndex(i);
                }}
                aria-label={`Go to saved course ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? "w-6 bg-[#D5FF38] shadow-none"
                    : "w-2 bg-neutral-600/70 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>

          {/* Right Navigation: Counter & Chevron Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-400 tracking-wider">
              {activeIndex + 1} / {savedList.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const prev =
                    (activeIndex - 1 + savedList.length) % savedList.length;
                  scrollToIndex(prev);
                }}
                aria-label="Previous saved course"
                className="w-6 h-6 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = (activeIndex + 1) % savedList.length;
                  scrollToIndex(next);
                }}
                aria-label="Next saved course"
                className="w-6 h-6 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedCourseProgressBanner;
