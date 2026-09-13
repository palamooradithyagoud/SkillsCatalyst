"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  location: string;
  date: string;
  badge: string;
  image: string;
  alt: string;
}

const EVENTS: EventItem[] = [
  {
    id: "hacker-house-goa",
    title: "Hacker House Goa",
    location: "Goa, India",
    date: "28 - 31 OCT 2026",
    badge: "Featured Residency",
    image: "/images/events/hacker_house_goa.jpg",
    alt: "Hacker House Goa 2026",
  },
  {
    id: "ai-buildathon",
    title: "AI Buildathon 2026",
    location: "Bengaluru, India",
    date: "14 - 16 NOV 2026",
    badge: "AI Hackathon",
    image: "/images/events/ai_buildathon_bengaluru.jpg",
    alt: "AI Buildathon Bengaluru 2026",
  },
  {
    id: "global-devcon",
    title: "Global DevCon",
    location: "Hyderabad, India",
    date: "04 - 07 DEC 2026",
    badge: "Developer Conclave",
    image: "/images/events/global_devcon_hyderabad.jpg",
    alt: "Global DevCon Hyderabad 2026",
  },
];

interface EventHeroCardProps {
  onOpenPricing: () => void;
}

export default function EventHeroCard({ onOpenPricing }: EventHeroCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slideshow every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % EVENTS.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % EVENTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + EVENTS.length) % EVENTS.length);
  };

  const currentEvent = EVENTS[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] w-full max-w-[460px] sm:max-w-[480px] h-[165px] sm:h-[185px] md:h-[195px] shadow-sm hover:shadow-md border border-slate-200/70 select-none group bg-slate-950 transition-all"
    >
      {/* ── Background Moving Event Images (Animated Crossfade & Glide) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={currentEvent.image}
            alt={currentEvent.alt}
            fill
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover object-center"
          />

          {/* Vignette & soft bottom gradient overlay for card readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* ── Top-Left Bar: Dynamic Event Location & Badge ── */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold tracking-wide shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>{currentEvent.badge}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-semibold">{currentEvent.date}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Top-Right Bar: Carousel Indicators & Next/Prev Controls ── */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 pointer-events-auto flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/20">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous event"
          className="text-white/70 hover:text-white transition-colors p-0.5 cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1 px-1">
          {EVENTS.map((event, idx) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to ${event.title}`}
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

      {/* ── Downside Middle Area: Floating 'Get PRO' Subscription Component (Exactly in the Middle) ── */}
      <div
        className="absolute bottom-2 sm:bottom-2.5 inset-x-0 z-20 flex items-center justify-center pointer-events-none px-3"
        style={{ left: 0, right: 0 }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenPricing}
          type="button"
          aria-label="Get PRO - One membership for all benefits"
          className="pointer-events-auto group bg-white hover:bg-white/95 text-left rounded-xl sm:rounded-2xl py-1.5 px-3 sm:py-2 sm:px-3.5 shadow-xl shadow-black/40 border border-slate-100/90 flex items-center justify-between gap-2.5 sm:gap-3 transition-all cursor-pointer backdrop-blur-md w-auto max-w-[270px] sm:max-w-[300px]"
        >
          {/* Left: Magenta/Violet Rounded Square with Trophy Icon */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] sm:rounded-[9px] bg-[#d81b60] bg-gradient-to-tr from-[#c2185b] via-[#d81b60] to-[#e91e63] flex items-center justify-center shrink-0 shadow-xs shadow-pink-600/30">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2]" />
          </div>

          {/* Center: Title & Subtitle */}
          <div className="min-w-0 pr-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 tracking-tight leading-tight">
                Get PRO
              </h4>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate mt-0.5 leading-tight">
              One membership for all benefits
            </p>
          </div>

          {/* Right: Chevron Arrow */}
          <div className="shrink-0 pl-0.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all" />
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
