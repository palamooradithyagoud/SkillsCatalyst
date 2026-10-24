"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { fetchSavedPlaylists, fetchPlaylistsStats, cleanPlaylistId } from "@/lib/api";

export interface SavedCourseItem {
  id: string;
  title: string;
  completedVideos: number;
  totalVideos: number;
  progressPct: number;
  isUnavailable?: boolean;
}

export type SlideItem =
  | {
      type: "course";
      id: string;
      title: string;
      progress: number;
      completed: string;
      pending: string;
      progressLabel: string;
      cardBackground: string;
      href: string;
    }
  | {
      type: "careerpath";
      id: "careerpath-slide";
    };

const PASTEL_PALETTE = ["#D1FAE5", "#E0CBFD", "#CFFAFE", "#FED7AA", "#FCE7F3", "#FEF08A"];
const CACHE_KEY = "sc_saved_yt_playlists_v1";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98,
  }),
};

// ── Reusable Standalone & Slide Careerpath Card ──
export function CareerPathCard({ onClick }: { onClick?: () => void }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.push("/roadmaps");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      style={{
        boxShadow:
          "0 12px 20px 0px rgba(0, 0, 0, 0.12), 0 6px 10px 0px rgba(0, 0, 0, 0.08), 0 2px 4px 0px rgba(0, 0, 0, 0.05), 0 1px 2px 0px rgba(0, 0, 0, 0.04)",
      }}
      className="group w-full h-full bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 hub-card-shadow transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[160px] sm:min-h-[195px] select-none"
    >
      {/* Left/Top Content */}
      <div className="relative z-10 max-w-[62%] sm:max-w-[54%] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-[#5c56df] dark:text-[#818CF8] uppercase">
              PLAN
            </span>
            <span className="w-4 sm:w-5 h-[2px] rounded-full bg-[#5c56df]/50 dark:bg-[#818CF8]/50" />
          </div>
          <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Career
            <span className="text-[#635BFF] dark:text-[#818CF8]">path</span>
          </h3>
          <p className="text-[10px] sm:text-[12.5px] text-slate-500 dark:text-neutral-400 font-medium leading-tight sm:leading-snug mt-1 hidden xs:block line-clamp-2 max-w-[190px]">
            Get a personalized roadmap to your dream career.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-2.5 sm:mt-5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#5442F6] via-[#635BFF] to-[#7B73FF] text-white flex items-center justify-center shadow-sm shadow-indigo-500/25 group-hover:scale-110 group-hover:shadow-indigo-500/40 transition-all">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Right 3D Illustration - Transparent PNG seamlessly floating on card */}
      <div className="absolute right-0 bottom-0 top-auto sm:top-0 w-[58%] h-[84%] sm:w-[50%] sm:h-full flex items-end justify-end pointer-events-none select-none overflow-hidden">
        <div className="relative w-full h-full min-h-[118px] sm:min-h-[160px] flex items-end justify-end group-hover:scale-105 transition-transform duration-500 dark:drop-shadow-[0_8px_22px_rgba(99,91,255,0.3)]">
          <Image
            src="/images/hub/careerpath_hero.png"
            alt="Careerpath 3D Stairs"
            fill
            className="object-contain object-bottom-right"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function LearningPathCarousel() {
  const router = useRouter();
  const [savedCourses, setSavedCourses] = useState<SavedCourseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const dragDistance = useRef(0);
  const isDraggingRef = useRef(false);

  // ── Load Real User Saved Playlists ──
  useEffect(() => {
    // 1. Instant Cache Hydration
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list: SavedCourseItem[] = parsed.map((item) => ({
            id: item.id,
            title: item.title || "Saved Course",
            completedVideos: item.completedVideos || 0,
            totalVideos: item.totalVideos || 0,
            progressPct: item.progressPct ?? 0,
            isUnavailable: item.isUnavailable,
          }));
          setSavedCourses(list);
        }
      }
    } catch { }

    // 2. Background Revalidation via API & Supabase
    async function loadSavedPlaylists() {
      try {
        const { saved } = await fetchSavedPlaylists();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          let statsMap: Record<string, any> = {};
          try {
            statsMap = await fetchPlaylistsStats(saved.map((p) => p.id));
          } catch { }

          const mapped: SavedCourseItem[] = saved.map((p: any) => {
            const st = statsMap[p.id] || statsMap[cleanPlaylistId(p.id)] || {};
            const completed = p.completed_videos ?? st.completed_videos ?? 0;
            const total = p.total_videos ?? st.total_videos ?? (parseInt(p.video_count) || 0);
            const progress = total > 0 ? Math.round((completed / total) * 100) : (p.progress_pct ?? 0);

            return {
              id: p.id,
              title: p.title || "Saved Course",
              completedVideos: completed,
              totalVideos: total,
              progressPct: progress,
              isUnavailable: p.isUnavailable,
            };
          });

          setSavedCourses(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch { }
        } else {
          setSavedCourses([]);
        }
      } catch { }
    }

    loadSavedPlaylists();
  }, []);

  // ── Construct Slides ──
  // If user has saved videos:
  // Show saved course progress cards AND the Careerpath card together with the scroll effect!
  // If user didn't save any videos:
  // slides will be empty, so ONLY the Careerpath card is rendered!
  const slides: SlideItem[] = React.useMemo(() => {
    if (savedCourses.length === 0) {
      return [];
    }

    const courseSlides: SlideItem[] = savedCourses.map((c, idx) => ({
      type: "course",
      id: c.id,
      title: c.title,
      progress: c.progressPct,
      completed: c.isUnavailable ? "Syncing..." : `${c.completedVideos} Completed`,
      pending: c.isUnavailable
        ? "Syncing..."
        : `${Math.max(0, c.totalVideos - c.completedVideos)} Pending`,
      progressLabel: "Your Progress",
      cardBackground: PASTEL_PALETTE[idx % PASTEL_PALETTE.length],
      href: `/learning?playlist=${encodeURIComponent(c.id)}`,
    }));

    // Append the Careerpath card as a slide in the deck so they scroll together!
    return [...courseSlides, { type: "careerpath", id: "careerpath-slide" }];
  }, [savedCourses]);

  const paginate = useCallback(
    (newDirection: number) => {
      if (slides.length <= 1) return;
      setDirection(newDirection);
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + newDirection;
        if (nextIndex < 0) nextIndex = slides.length - 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        return nextIndex;
      });
    },
    [slides.length]
  );

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // ── Auto-Swipe Timer (every 3.6s when multiple slides exist and not paused) ──
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 3600);

    return () => clearInterval(interval);
  }, [isPaused, slides.length, paginate]);

  // If user didn't save any videos: keep ONLY the Careerpath card!
  if (slides.length === 0) {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.012 }}
        transition={{ type: "spring", stiffness: 350, damping: 24 }}
        className="w-full h-full flex"
      >
        <CareerPathCard onClick={() => router.push("/roadmaps")} />
      </motion.div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];

  const handleCardClick = () => {
    if (isDraggingRef.current || Math.abs(dragDistance.current) > 8) {
      dragDistance.current = 0;
      return;
    }
    if (currentSlide.type === "course" && currentSlide.href) {
      router.push(currentSlide.href);
    } else if (currentSlide.type === "careerpath") {
      router.push("/roadmaps");
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center overflow-hidden rounded-[20px] sm:rounded-[24px] select-none group min-h-[160px] sm:min-h-[195px] bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08]"
      style={{
        boxShadow:
          "0 12px 20px 0px rgba(0, 0, 0, 0.12), 0 6px 10px 0px rgba(0, 0, 0, 0.08), 0 2px 4px 0px rgba(0, 0, 0, 0.05), 0 1px 2px 0px rgba(0, 0, 0, 0.04)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── Auto-Swiping Slide Animation Container ── */}
      <div className="relative w-full h-full min-h-[160px] sm:min-h-[195px] flex items-center justify-center overflow-hidden rounded-[20px] sm:rounded-[24px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id + currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 32 },
              opacity: { duration: 0.28 },
              scale: { duration: 0.28 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragStart={() => {
              isDraggingRef.current = true;
              dragDistance.current = 0;
            }}
            onDrag={(_, info) => {
              dragDistance.current = info.offset.x;
            }}
            onDragEnd={(_, info) => {
              const swipeThreshold = 40;
              if (info.offset.x < -swipeThreshold) {
                paginate(1);
              } else if (info.offset.x > swipeThreshold) {
                paginate(-1);
              }
              setTimeout(() => {
                isDraggingRef.current = false;
                dragDistance.current = 0;
              }, 60);
            }}
            onClick={handleCardClick}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {currentSlide.type === "course" ? (
              <CourseCard
                progress={currentSlide.progress}
                title={currentSlide.title}
                completed={currentSlide.completed}
                pending={currentSlide.pending}
                progressLabel={currentSlide.progressLabel}
                cardBackground={currentSlide.cardBackground}
                className="w-full h-full"
              />
            ) : (
              <CareerPathCard onClick={() => router.push("/roadmaps")} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Desktop Hover Prev/Next Arrows ── */}
      {slides.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-2 z-20 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              aria-label="Previous card"
              className="pointer-events-auto w-7 h-7 rounded-full bg-white/85 dark:bg-black/60 shadow-md backdrop-blur-sm border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="absolute inset-y-0 right-2 z-20 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              aria-label="Next card"
              className="pointer-events-auto w-7 h-7 rounded-full bg-white/85 dark:bg-black/60 shadow-md backdrop-blur-sm border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </>
      )}

      {/* ── Bottom Pagination Indicators (Pill Dots) ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 pointer-events-auto">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id + idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-4.5 bg-black/80 dark:bg-white/90 shadow-xs"
                    : "w-1.5 bg-black/25 dark:bg-white/30 hover:bg-black/50 dark:hover:bg-white/50"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
