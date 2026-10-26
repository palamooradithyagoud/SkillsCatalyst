"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo, type Variants } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Calendar,
  Crown,
} from "lucide-react";
import { useStudentEvents } from "@/hooks/useStudentEvents";
import { useSubscription } from "@/hooks/useSubscription";

interface EventHeroCardProps {
  onOpenPricing?: () => void;
}

function formatEventDate(dateStr?: string | null): string {
  if (!dateStr) return "Aug 26, 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Aug 26, 2026";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Aug 26, 2026";
  }
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.25 },
    },
  }),
};

export default function EventHeroCard({ onOpenPricing }: EventHeroCardProps) {
  const { isPremium } = useSubscription();
  const { data, isLoading } = useStudentEvents();
  const events = data?.events ?? [];
  const loading = isLoading;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const isNavigatingRef = useRef<boolean>(false);

  const handleOpenPricing = () => {
    if (onOpenPricing) {
      onOpenPricing();
    } else {
      window.dispatchEvent(new CustomEvent("open-pricing-modal"));
    }
  };

  const paginate = useCallback(
    (newDirection: number) => {
      if (events.length <= 1 || isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        if (newDirection > 0) {
          return (prev + 1) % events.length;
        }
        return (prev - 1 + events.length) % events.length;
      });
      setTimeout(() => {
        isNavigatingRef.current = false;
        isSwipingRef.current = false;
      }, 350);
    },
    [events.length]
  );

  const handleNext = useCallback(() => paginate(1), [paginate]);
  const handlePrev = useCallback(() => paginate(-1), [paginate]);

  // Auto-advance slideshow every 5 seconds if multiple events exist
  useEffect(() => {
    if (isPaused || events.length <= 1) return;

    timerRef.current = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, events.length, paginate]);

  // Direct touch handlers for reliable finger swiping on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwipingRef.current = false;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Detect if finger gesture is primarily horizontal
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;

    // Trigger swipe if horizontal delta exceeds threshold (or quick flick)
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      (Math.abs(deltaX) > 30 || (Math.abs(deltaX) > 15 && elapsed < 300))
    ) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Framer Motion drag end handler for fluid tactile physics
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsPaused(false);
    const swipeThreshold = 35;
    const velocityThreshold = 180;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      handlePrev();
    }
  };

  // If no live events published yet
  if (!loading && events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ aspectRatio: "2.55 / 1" }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl w-full max-w-[540px] aspect-[2.55/1] shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-800 select-none group bg-slate-950 transition-all flex flex-col justify-between p-3 sm:p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-purple-950/40 pointer-events-none" />

        {/* ── Top-Left Metadata Pill ── */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 dark:bg-white/90 border border-slate-200/60 shadow-xs backdrop-blur-md">
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
            <span className="text-[8.5px] sm:text-[10px] font-medium text-slate-800 leading-none">Upcoming 2026</span>
          </div>
        </div>

        {/* ── Main Content Hierarchy ── */}
        <div className="relative z-10 space-y-0.5 sm:space-y-1">
          <h3 className="text-xs sm:text-base md:text-[17px] font-extrabold text-purple-400 tracking-tight leading-snug">
            Campus Hackathons &amp; Tech Sprints
          </h3>
          <p className="text-[10px] sm:text-xs text-purple-300 font-medium line-clamp-1">
            Verified collegiate hackathons, competitions, and technical sprints will be published here.
          </p>
        </div>

        {/* ── Bottom Actions (Register only) ── */}
        <div className="relative z-10 flex items-center justify-between pt-0.5 sm:pt-1">
          <button
            type="button"
            className="pointer-events-auto group/btn inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-[11px] sm:text-[13px] shadow-sm shadow-purple-950/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            <span>Register</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {isPremium ? (
            <span
              data-testid="event-hero-pro-badge"
              className="pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/60 text-slate-800 text-[9px] sm:text-xs font-semibold shadow-xs"
            >
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
              <span>PRO User</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleOpenPricing}
              data-testid="event-hero-get-pro-btn"
              className="pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-white/90 hover:bg-purple-50/90 active:bg-purple-100 backdrop-blur-md border border-slate-200/60 hover:border-purple-300 text-slate-800 hover:text-purple-700 text-[9px] sm:text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
              <span>Get PRO</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Safe current event reference
  const currentEvent = events[currentIndex] || events[0];
  if (!currentEvent) {
    return (
      <div
        style={{ aspectRatio: "2.55 / 1" }}
        className="w-full max-w-[540px] aspect-[2.55/1] rounded-2xl sm:rounded-3xl bg-slate-900/80 animate-pulse"
      />
    );
  }

  const startDateStr = formatEventDate(currentEvent.start_date);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        touchStartX.current = null;
        touchStartY.current = null;
        setIsPaused(false);
      }}
      style={{ touchAction: "pan-y", aspectRatio: "2.55 / 1" }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl w-full max-w-[540px] aspect-[2.55/1] shadow-sm hover:shadow-md border border-slate-200/70 dark:border-neutral-800 select-none group bg-slate-950 dark:bg-black transition-all cursor-grab active:cursor-grabbing"
    >
      {/* ── Background Event Banner with Tactile Drag & Swipe Animation ── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentEvent.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag={events.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragStart={() => {
            isSwipingRef.current = true;
            setIsPaused(true);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: "pan-y" }}
        >
          {currentEvent.banner_url ? (
            <Image
              src={currentEvent.banner_url}
              alt={currentEvent.event_name}
              fill
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, 540px"
              className="object-cover object-center pointer-events-none select-none"
              draggable={false}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950 to-slate-950" />
          )}

          {/* Gentle gradient scrim to ensure high contrast for text and badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Top-Left Bar: Date Metadata Pill ── */}
      <div className="absolute top-2 sm:top-3 left-2.5 sm:left-4 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 dark:bg-black/90 border border-slate-200/60 dark:border-neutral-800 shadow-xs backdrop-blur-md"
          >
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-[8.5px] sm:text-[10px] font-medium text-slate-800 dark:text-slate-200 leading-none">
              {startDateStr}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>


      {/* ── Desktop Hover Chevron Buttons (Left & Right) ── */}
      {events.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous event"
            className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next event"
            className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white items-center justify-center backdrop-blur-md border border-white/10 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* ── Downside Area: Primary CTA (Register) & PRO Badge ── */}
      <div
        className="absolute bottom-2 sm:bottom-3.5 inset-x-0 z-20 flex items-center justify-between pointer-events-none px-2.5 sm:px-5"
        style={{ left: 0, right: 0 }}
      >
        {/* Primary CTA: Register only */}
        <a
          href={currentEvent.event_link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Register for ${currentEvent.event_name}`}
          onClick={(e) => {
            if (isSwipingRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="pointer-events-auto group/btn inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-[11px] sm:text-[13px] shadow-sm shadow-purple-950/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          <span>Register</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>

        {/* Secondary Status Badge (PRO User vs Get PRO) */}
        {isPremium ? (
          <span
            data-testid="event-hero-pro-badge"
            className="pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-md border border-slate-200/60 dark:border-neutral-800 text-slate-800 dark:text-white text-[9px] sm:text-xs font-semibold shadow-xs"
          >
            <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
            <span>PRO User</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleOpenPricing}
            data-testid="event-hero-get-pro-btn"
            className="pointer-events-auto inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-white/90 dark:bg-black/90 hover:bg-purple-50/90 dark:hover:bg-neutral-900 active:bg-purple-100 backdrop-blur-md border border-slate-200/60 dark:border-neutral-800 hover:border-purple-300 text-slate-800 dark:text-white hover:text-purple-700 text-[9px] sm:text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
            <span>Get PRO</span>
          </button>
        )}
      </div>
    </div>
  );
}
