"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Calendar,
  Crown,
} from "lucide-react";
import type { EventItem } from "@/types/events";
import { useStudentEvents } from "@/hooks/useStudentEvents";
import { useSubscription } from "@/hooks/useSubscription";

interface EventHeroCardProps {
  onOpenPricing?: () => void;
}

function formatPrizePool(prize?: string | null): string {
  if (!prize) return "$50,000";
  const cleaned = prize.replace(/^prize\s*[:\-]?\s*/i, "").trim();
  if (!cleaned) return "$50,000";
  if (/^\d+$/.test(cleaned)) {
    return `$${Number(cleaned).toLocaleString()}`;
  }
  return cleaned;
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

export default function EventHeroCard({ onOpenPricing }: EventHeroCardProps) {
  const { isPremium } = useSubscription();
  const { data, isLoading } = useStudentEvents();
  const events = data?.events ?? [];
  const loading = isLoading;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenPricing = () => {
    if (onOpenPricing) {
      onOpenPricing();
    } else {
      window.dispatchEvent(new CustomEvent("open-pricing-modal"));
    }
  };

  // Auto-advance slideshow every 4.5 seconds if multiple events exist
  useEffect(() => {
    if (isPaused || events.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, events.length]);

  const handleNext = () => {
    if (events.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }
  };

  const handlePrev = () => {
    if (events.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    }
  };

  // If no live events published yet
  if (!loading && events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl w-full max-w-[540px] h-[190px] sm:h-[205px] md:h-[215px] shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-800 select-none group bg-slate-950 transition-all flex flex-col justify-between p-4 sm:p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-purple-950/40 pointer-events-none" />

        {/* ── Top-Left Metadata Pill ── */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/95 dark:bg-white/90 border border-slate-200/60 shadow-xs backdrop-blur-md">
            <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-900 leading-none">Prize:</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-purple-600 leading-none">$50,000</span>
            <span className="text-slate-300 font-light text-[9px] leading-none mx-0.5">|</span>
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-800 leading-none">Upcoming 2026</span>
          </div>
        </div>

        {/* ── Main Content Hierarchy ── */}
        <div className="relative z-10 space-y-0.5 sm:space-y-1">
          <h3 className="text-sm sm:text-base md:text-[17px] font-extrabold text-purple-400 tracking-tight leading-snug">
            Campus Hackathons &amp; Tech Sprints
          </h3>
          <p className="text-[11px] sm:text-xs text-purple-300 font-medium line-clamp-1">
            Verified collegiate hackathons, competitions, and technical sprints will be published here.
          </p>
        </div>

        {/* ── Bottom Actions (12-16px breathing room) ── */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <button
            type="button"
            className="pointer-events-auto group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs sm:text-[13px] shadow-sm shadow-purple-950/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            <span>Register / View Event</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {isPremium ? (
            <span
              data-testid="event-hero-pro-badge"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/60 text-slate-800 text-[10px] sm:text-xs font-semibold shadow-xs"
            >
              <Crown className="w-3 h-3 text-purple-600 shrink-0" />
              <span>PRO User</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleOpenPricing}
              data-testid="event-hero-get-pro-btn"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 hover:bg-purple-50/90 active:bg-purple-100 backdrop-blur-md border border-slate-200/60 hover:border-purple-300 text-slate-800 hover:text-purple-700 text-[10px] sm:text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
            >
              <Crown className="w-3 h-3 text-purple-600 shrink-0" />
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
      <div className="w-full max-w-[540px] h-[190px] sm:h-[205px] md:h-[215px] rounded-2xl sm:rounded-3xl bg-slate-900/80 animate-pulse" />
    );
  }

  const startDateStr = formatEventDate(currentEvent.start_date);
  const cleanPrize = formatPrizePool(currentEvent.prize_pool);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl w-full max-w-[540px] h-[190px] sm:h-[205px] md:h-[215px] shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-800 select-none group bg-slate-950 transition-all"
    >
      {/* ── Background Event Banner Image with Adaptive Readability Scrim ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {currentEvent.banner_url ? (
            <Image
              src={currentEvent.banner_url}
              alt={currentEvent.event_name}
              fill
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, 540px"
              className="object-cover object-center"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950 to-slate-950" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Top-Left Bar: Compact Prize + Date Metadata Pill ── */}
      <div className="absolute top-2.5 sm:top-3 left-3.5 sm:left-4 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/95 dark:bg-white/90 border border-slate-200/60 shadow-xs backdrop-blur-md"
          >
            <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-900 leading-none">Prize:</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-purple-600 leading-none">{cleanPrize}</span>
            <span className="text-slate-300 font-light text-[9px] leading-none mx-0.5">|</span>
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600 shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-800 leading-none">{startDateStr}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Vertically Centered Edge Arrows ── */}
      {events.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous event"
            className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-30 pointer-events-auto w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all duration-150 cursor-pointer border border-white/10 hover:border-white/25 active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next event"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-auto w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center transition-all duration-150 cursor-pointer border border-white/10 hover:border-white/25 active:scale-90"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </>
      )}


      {/* ── Downside Area: Breathing room, Primary CTA, Pagination Dots, PRO Badge ── */}
      <div
        className="absolute bottom-3 sm:bottom-3.5 inset-x-0 z-20 flex items-center justify-between pointer-events-none px-4 sm:px-5"
        style={{ left: 0, right: 0 }}
      >
        {/* Primary CTA */}
        <a
          href={currentEvent.event_link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Register for ${currentEvent.event_name}`}
          className="pointer-events-auto group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs sm:text-[13px] shadow-sm shadow-purple-950/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          <span>Register / View Event</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>


        {/* Secondary Status Badge (PRO User vs Get PRO) */}
        {isPremium ? (
          <span
            data-testid="event-hero-pro-badge"
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/60 text-slate-800 text-[10px] sm:text-xs font-semibold shadow-xs"
          >
            <Crown className="w-3 h-3 text-purple-600 shrink-0" />
            <span>PRO User</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleOpenPricing}
            data-testid="event-hero-get-pro-btn"
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/90 hover:bg-purple-50/90 active:bg-purple-100 backdrop-blur-md border border-slate-200/60 hover:border-purple-300 text-slate-800 hover:text-purple-700 text-[10px] sm:text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Crown className="w-3 h-3 text-purple-600 shrink-0" />
            <span>Get PRO</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
