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
import { fetchStudentEvents } from "@/lib/api/events";
import { useSubscription } from "@/hooks/useSubscription";

interface EventHeroCardProps {
  onOpenPricing?: () => void;
}

export default function EventHeroCard({ onOpenPricing }: EventHeroCardProps) {
  const { isPremium } = useSubscription();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch student visible events from backend
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetchStudentEvents();
        if (active && res.events) {
          setEvents(res.events);
        }
      } catch {
        // Handled silently: events array will be empty
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] w-full max-w-[460px] sm:max-w-[480px] h-[165px] sm:h-[185px] md:h-[195px] shadow-sm hover:shadow-md border border-slate-200/70 select-none group bg-slate-950 transition-all flex flex-col justify-between p-4 sm:p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-purple-950/60 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] sm:text-xs font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>Upcoming Hackathons &amp; Events</span>
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-white">
            Campus Hackathons &amp; Tech Sprints
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium line-clamp-2">
            Verified collegiate hackathons, competitions, and technical sprints will be published here.
          </p>
        </div>

        <div className="relative z-10 pt-1 flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
            Stay tuned for upcoming registrations
          </span>
          {isPremium ? (
            <span
              data-testid="event-hero-pro-badge"
              className="px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-white dark:bg-purple-600 dark:border-purple-400/60 dark:text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs dark:shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all"
            >
              <Crown className="w-3 h-3 text-white dark:text-purple-100 shrink-0" />
              PRO User
            </span>
          ) : (
            onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Get PRO
              </button>
            )
          )}
        </div>
      </motion.div>
    );
  }

  // Safe current event reference
  const currentEvent = events[currentIndex] || events[0];
  if (!currentEvent) {
    return (
      <div className="w-full max-w-[460px] h-[165px] sm:h-[185px] rounded-[24px] bg-slate-900/80 animate-pulse" />
    );
  }

  // Format display date
  const startDateStr = new Date(currentEvent.start_date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] w-full max-w-[460px] sm:max-w-[480px] h-[165px] sm:h-[185px] md:h-[195px] shadow-sm hover:shadow-md border border-slate-200/70 select-none group bg-slate-950 transition-all"
    >
      {/* ── Background Event Banner Image ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {currentEvent.banner_url ? (
            <Image
              src={currentEvent.banner_url}
              alt={currentEvent.event_name}
              fill
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, 70vw"
              className="object-cover object-center"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950 to-slate-950" />
          )}

          {/* Vignette & gradient overlay for high contrast readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/45 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Top-Left Bar: Badge & Start Date ── */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold tracking-wide shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>
              {currentEvent.is_hackathon
                ? currentEvent.prize_pool
                  ? `Prize: ${currentEvent.prize_pool}`
                  : "Hackathon"
                : "Live Event"}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-semibold">{startDateStr}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Top-Right Bar: Carousel Controls ── */}
      {events.length > 1 && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 pointer-events-auto flex items-center gap-1 bg-black/55 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/20">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous event"
            className="text-white/70 hover:text-white transition-colors p-0.5 cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Indicators */}
          <div className="flex items-center gap-1 px-1">
            {events.map((ev, idx) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to ${ev.event_name}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? "w-3.5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next event"
            className="text-white/70 hover:text-white transition-colors p-0.5 cursor-pointer"
          >
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}

      {/* ── Center Content: Event Name & Host College ── */}
      <div className="absolute inset-x-3 sm:inset-x-4 top-11 sm:top-12 z-20 pointer-events-none pr-12">
        <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1 drop-shadow-md">
          {currentEvent.event_name}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium line-clamp-1 drop-shadow">
          {currentEvent.conducted_by_college} {currentEvent.location ? `• ${currentEvent.location}` : ""}
        </p>
      </div>

      {/* ── Downside Area: Register / View Event Link & Actions ── */}
      <div
        className="absolute bottom-2 sm:bottom-2.5 inset-x-0 z-20 flex items-center justify-between pointer-events-none px-3 sm:px-4"
        style={{ left: 0, right: 0 }}
      >
        <a
          href={currentEvent.event_link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Register for ${currentEvent.event_name}`}
          className="pointer-events-auto group bg-white/95 hover:bg-white text-slate-900 rounded-xl py-1.5 px-3 sm:py-2 sm:px-3.5 shadow-lg border border-white/80 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-[11px] font-black tracking-tight">
            Register / View Event
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {isPremium ? (
          <span
            data-testid="event-hero-pro-badge"
            className="pointer-events-auto px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-white dark:bg-purple-600 dark:border-purple-400/60 dark:text-white text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xs dark:shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all"
          >
            <Crown className="w-3 h-3 text-white dark:text-purple-100 shrink-0" />
            PRO User
          </span>
        ) : (
          onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="pointer-events-auto px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 border border-white/20 text-white text-[10px] font-bold transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95"
            >
              Get PRO
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
