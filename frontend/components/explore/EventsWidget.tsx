"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Trophy,
  Award,
  Calendar,
  MapPin,
  Users,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  Share2,
  Filter,
  Check,
  Globe,
} from "lucide-react";
import { useStudentEvents } from "@/hooks/useStudentEvents";
import type { EventItem } from "@/types/events";

function formatEventModeLabel(ev: EventItem): string {
  if (ev.mode === "hybrid") return "Hybrid";
  if (ev.category === "online" || ev.mode === "online") return "Online";
  return "In-Person";
}

function splitPrizeDisplay(prizePool: string): { primary: string; suffix: string | null } {
  const trimmed = prizePool.trim();
  return {
    primary: trimmed,
    suffix: /prize/i.test(trimmed) ? null : "in prizes",
  };
}

function getUtcCalendarBadge(d: string): { month: string; day: string } | null {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return {
      month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
      day: String(date.getUTCDate()),
    };
  } catch {
    return null;
  }
}

function formatEventDateRange(startIso: string, endIso?: string | null): string {
  try {
    const start = new Date(startIso);
    if (isNaN(start.getTime())) return startIso;
    const fmt = (dt: Date) =>
      dt.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
    if (!endIso) return fmt(start);
    const end = new Date(endIso);
    if (isNaN(end.getTime())) return fmt(start);
    return start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)
      ? fmt(start)
      : `${fmt(start)} – ${fmt(end)}`;
  } catch {
    return startIso;
  }
}

function cleanEventDescription(text: string): string {
  if (!text) return "";
  return text
    // Replace typical UTF-8 / mojibake corrupted patterns
    .replace(/d\?{2,3}[\u0085\u00A0]?/g, "")
    .replace(/d\?\?/g, "")
    .replace(/\?{2,}/g, " — ")
    .replace(/Don\?+t/gi, "Don't")
    .replace(/WE\?+RE/gi, "WE'RE")
    .replace(/team\?+s/gi, "team's")
    .replace(/Hyderabad\?+s/gi, "Hyderabad's")
    .replace(/what\?+s/gi, "what's")
    .replace(/it\?+s/gi, "it's")
    .replace(/can\?+t/gi, "can't")
    .replace(/PRIZE POOL [^a-zA-Z0-9₹]+ (?=[0-9₹])/gi, "PRIZE POOL: ₹")
    .replace(/\?\s*(?=[0-9])/g, "₹")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const EVENTS_CACHE_KEY = "sc_cached_student_events_v1";

const EVENT_FILTER_OPTIONS = [
  { id: "all", label: "All Events" },
  { id: "hackathons", label: "Hackathons" },
  { id: "online", label: "Online Only" },
  { id: "campus", label: "On Campus" },
] as const;

export default function EventsWidget() {
  const { data, isLoading } = useStudentEvents();
  const [cachedEvents, setCachedEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EVENTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCachedEvents(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (data?.events && Array.isArray(data.events)) {
      try {
        localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(data.events));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [data?.events]);

  const liveEvents = data?.events ?? cachedEvents;
  const loadingLiveEvents = isLoading && liveEvents.length === 0;
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "hackathons" | "online" | "campus">("all");
  const [showFilterPills, setShowFilterPills] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailCopied, setDetailCopied] = useState(false);

  const handleShare = async (targetEvent?: EventItem | null) => {
    const shareTitle = targetEvent
      ? `${targetEvent.event_name} | SkillsCatalyst`
      : "Discover Campus Events & Hackathons | SkillsCatalyst";
    const shareUrl = targetEvent?.event_link || window.location.href;

    const markCopied = () => {
      if (targetEvent) {
        setDetailCopied(true);
        setTimeout(() => setDetailCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch {
        // user canceled share
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      markCopied();
    }
  };

  const filteredEvents = liveEvents.filter((ev) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      ev.event_name.toLowerCase().includes(q) ||
      ev.conducted_by_college.toLowerCase().includes(q) ||
      (ev.location && ev.location.toLowerCase().includes(q)) ||
      (ev.description && ev.description.toLowerCase().includes(q));

    const matchesFilter =
      filterMode === "all" ||
      (filterMode === "hackathons" && ev.is_hackathon) ||
      (filterMode === "online" && (ev.category === "online" || ev.mode === "online")) ||
      (filterMode === "campus" && (ev.category === "offline" || ev.mode === "offline"));

    return matchesSearch && matchesFilter;
  });

  // Close modal on ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedEvent(null);
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-hide-bottombar", "true");
      document.body.setAttribute("data-hide-appbars", "true");
      setDetailCopied(false);
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-hide-bottombar");
      document.body.removeAttribute("data-hide-appbars");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-hide-bottombar");
      document.body.removeAttribute("data-hide-appbars");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent, handleKeyDown]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return d;
    }
  };

  const formatDateShort = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Top Hero (Mobile View Only: Dark Charcoal Surface) ── */}
      <div
        suppressHydrationWarning
        className="md:hidden relative overflow-hidden rounded-[24px] sm:rounded-[36px] p-4.5 sm:p-8 border border-white/[0.08] shadow-[0_14px_38px_rgba(0,0,0,0.45)] space-y-3.5 sm:space-y-4"
        style={{
          backgroundColor: "#14171D",
          backgroundImage: `
            radial-gradient(ellipse 75% 65% at 95% 5%, rgba(213, 255, 56, 0.11) 0%, transparent 62%),
            radial-gradient(ellipse 65% 65% at 12% 95%, rgba(148, 163, 184, 0.09) 0%, transparent 60%),
            linear-gradient(145deg, #1B1F27 0%, #14171D 52%, #0F1217 100%)
          `,
        }}
      >
        {/* Subtle restrained ambient highlight in dark charcoal corner */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-[#D5FF38]/[0.08] blur-[52px] pointer-events-none"
        />

        {/* Top Row: Location Tag + Share Button */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#D5FF38] shrink-0" />
            <span className="text-xs sm:text-base font-bold text-neutral-300 tracking-tight">
              Events near you
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleShare()}
            aria-label="Share events"
            suppressHydrationWarning
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1E222B] hover:bg-[#272C37] border border-white/[0.1] shadow-xs flex items-center justify-center text-neutral-200 transition-all active:scale-95 cursor-pointer relative"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#D5FF38]" />
            ) : (
              <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-200" />
            )}
            {copied && (
              <span className="absolute -bottom-6 text-[10px] font-bold text-[#D5FF38] whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>

        {/* Headline */}
        <div className="relative z-10 pt-0.5 sm:pt-1">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Discover events
          </h1>
        </div>

        {/* Pill Search Bar */}
        <div className="relative z-10 space-y-2 pt-0.5 sm:pt-1">
          <div className="flex items-center w-full min-w-0 bg-[#0B0D11] rounded-full border border-white/[0.1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] p-1.5 pl-3.5 sm:p-2 sm:pl-5 gap-2 sm:gap-3 transition-all focus-within:border-[#D5FF38]/55 focus-within:ring-1 focus-within:ring-[#D5FF38]/20">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Explore events"
              suppressHydrationWarning
              className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-semibold text-white placeholder:text-neutral-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                suppressHydrationWarning
                aria-label="Clear search"
                className="text-neutral-400 hover:text-white p-1 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="h-5 sm:h-6 w-[1px] bg-white/[0.12] shrink-0 mx-0.5 sm:mx-1" />
            <button
              type="button"
              onClick={() => setShowFilterPills(!showFilterPills)}
              aria-label="Filter events"
              suppressHydrationWarning
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                showFilterPills || filterMode !== "all"
                  ? "bg-[#D5FF38] text-[#0D0F12] shadow-xs"
                  : "bg-[#1E222B] hover:bg-[#272C37] text-neutral-200 border border-white/[0.08]"
              } active:scale-95`}
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Quick Filter Chips (Mobile) */}
          <AnimatePresence>
            {showFilterPills && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar"
              >
                {EVENT_FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterMode(f.id)}
                    suppressHydrationWarning
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      filterMode === f.id
                        ? "bg-[#D5FF38] text-[#0D0F12] shadow-xs"
                        : "bg-[#1E222B] text-neutral-300 hover:bg-[#272C37] hover:text-white border border-white/[0.08]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Desktop View Search & Filter Bar ── */}
      <div className="hidden md:block space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events"
              suppressHydrationWarning
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none focus:border-slate-400 dark:focus:border-[#D5FF38]/55 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                suppressHydrationWarning
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterPills(!showFilterPills)}
            aria-label="Filter events"
            suppressHydrationWarning
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              showFilterPills || filterMode !== "all"
                ? "bg-[#D5FF38] text-[#0D0F12] border-[#D5FF38] shadow-xs"
                : "bg-white dark:bg-[#121318] border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-neutral-700 shadow-2xs"
            } active:scale-95`}
          >
            <Filter className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Quick Filter Chips (Desktop) */}
        <AnimatePresence>
          {showFilterPills && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 pt-1 pb-0.5"
            >
              {EVENT_FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id)}
                  suppressHydrationWarning
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === f.id
                      ? "bg-[#D5FF38] text-[#0D0F12] shadow-xs"
                      : "bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 dark:bg-[#181920] border border-amber-500/20 dark:border-neutral-800 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-2xs">
            <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 -rotate-12 transition-transform duration-200" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            Live Campus Events &amp; Hackathons
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-extrabold text-slate-400 dark:text-neutral-500">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          </span>
          <button
            type="button"
            onClick={() => handleShare()}
            aria-label="Share events"
            suppressHydrationWarning
            className="hidden md:flex w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181920] hover:bg-slate-200 dark:hover:bg-[#252630] border border-slate-200/80 dark:border-neutral-700/80 items-center justify-center text-slate-700 dark:text-neutral-200 transition-all active:scale-95 cursor-pointer relative"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copied && (
              <span className="absolute -bottom-6 text-[10px] font-bold text-emerald-500 whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Small / Compact Cards Grid ── */}
      {loadingLiveEvents ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-400 dark:text-neutral-400 bg-white dark:bg-[#18191F] border border-slate-200/90 dark:border-neutral-800 rounded-2xl">
          Loading active events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#18191F] border border-dashed border-slate-200/90 dark:border-neutral-800 rounded-2xl space-y-2">
          <Trophy className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-white">
            {searchQuery.trim()
              ? `No events matching "${searchQuery}"`
              : "No active events published at this moment"}
          </p>
          {(searchQuery || filterMode !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
              }}
              className="text-xs font-bold text-slate-800 dark:text-neutral-200 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredEvents.map((ev, idx) => {
            const summaryText = ev.description ? cleanEventDescription(ev.description) : "";
            const modeLabel = formatEventModeLabel(ev);
            const prizeInfo =
              ev.prize_pool && ev.prize_pool.trim().length > 0
                ? splitPrizeDisplay(ev.prize_pool)
                : null;

            return (
              <article
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="rounded-[16px] sm:rounded-[20px] bg-white dark:bg-[#111317] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] p-2.5 sm:p-3 shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all flex flex-row items-stretch gap-3 sm:gap-3.5 group cursor-pointer"
              >
                {/* Rectangular Left Event Poster Frame (non-rounded, full banner fit) */}
                <div className="relative w-[104px] sm:w-[162px] md:w-[152px] lg:w-[184px] min-h-[76px] sm:min-h-[98px] rounded-none bg-[#0B0D11] border border-slate-200/70 dark:border-white/[0.08] overflow-hidden shrink-0">
                  {ev.banner_url ? (
                    <>
                      <Image
                        src={ev.banner_url}
                        alt=""
                        fill
                        aria-hidden="true"
                        className="object-cover object-center scale-110 blur-md opacity-45 pointer-events-none select-none"
                        unoptimized
                      />
                      <Image
                        src={ev.banner_url}
                        alt={ev.event_name}
                        fill
                        priority={idx === 0}
                        className="z-10 object-contain object-center group-hover:scale-[1.03] transition-transform duration-500"
                        unoptimized
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-[#1A1C24] dark:to-[#111318] flex items-center justify-center text-white/40">
                      <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  )}
                </div>

                {/* Right Details Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div className="space-y-1">
                    {/* Top Pills Row */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-slate-100 dark:bg-[#1E222B] text-slate-800 dark:text-white border border-slate-200/90 dark:border-white/[0.08]">
                        {modeLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold ${
                          ev.is_hackathon
                            ? "bg-[#D5FF38] text-[#0D0F12]"
                            : "bg-slate-900 dark:bg-white text-white dark:text-[#0D0F12]"
                        }`}
                      >
                        {ev.is_hackathon ? "Hackathon" : "Campus Event"}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <div className="space-y-0.5">
                      <h3 className="text-sm sm:text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2">
                        {ev.event_name}
                      </h3>
                      {summaryText && (
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-neutral-400 leading-snug line-clamp-1">
                          {summaryText}
                        </p>
                      )}
                    </div>

                    {/* Organizer & Date Row */}
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs pt-0.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[110px] sm:max-w-[165px]">
                        {ev.conducted_by_college}
                      </span>
                      <span
                        className="w-px h-3 bg-slate-300 dark:bg-white/20 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-neutral-200 whitespace-nowrap">
                        <Calendar
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-neutral-300 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{formatDateShort(ev.start_date)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Prize / CTA Footer */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="min-w-0 truncate">
                      {prizeInfo ? (
                        <div className="flex items-baseline gap-x-1 truncate">
                          <span className="text-sm sm:text-[15px] font-black text-slate-900 dark:text-white tracking-tight">
                            {prizeInfo.primary}
                          </span>
                          {prizeInfo.suffix && (
                            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-neutral-400 truncate">
                              {prizeInfo.suffix}
                            </span>
                          )}
                        </div>
                      ) : ev.team_size ? (
                        <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-neutral-300">
                          Team: {ev.team_size}
                        </span>
                      ) : (
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-neutral-400">
                          Registrations Open
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(ev);
                      }}
                      className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#D5FF38] text-[#0D0F12] font-bold text-[11px] sm:text-xs inline-flex items-center gap-1 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                    >
                      <span>Details</span>
                      <ArrowRight
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Total Info Modal ── */}
      <AnimatePresence>
        {selectedEvent && (() => {
          const calendarBadge = getUtcCalendarBadge(selectedEvent.start_date);
          const dateRangeLabel = formatEventDateRange(selectedEvent.start_date, selectedEvent.end_date);
          const modeLabel = formatEventModeLabel(selectedEvent);
          const fallbackInitial = selectedEvent.event_name.trim().charAt(0).toUpperCase() || "E";
          const locationText =
            selectedEvent.location && selectedEvent.location.trim().length > 0
              ? selectedEvent.location.trim()
              : selectedEvent.category === "online" || selectedEvent.mode === "online"
                ? "Online Event"
                : selectedEvent.mode === "hybrid"
                  ? "Hybrid Event"
                  : "On Campus / Venue TBA";

          return (
            <motion.div
              key={selectedEvent.id}
              role="dialog"
              aria-modal="true"
              aria-label={selectedEvent.event_name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-[80] bg-white dark:bg-[#0B0D11] text-slate-900 dark:text-white overflow-y-auto"
            >
              {/* Desktop Editorial Header (Img 2: Top-left Back + Top-right Website & Share) */}
              <div className="hidden md:flex max-w-5xl mx-auto px-6 lg:px-10 pt-6 pb-4 items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Back to events"
                  className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedEvent.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open event website"
                    className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 transition-colors"
                  >
                    <Globe className="w-[18px] h-[18px]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleShare(selectedEvent)}
                    aria-label="Share event"
                    className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {detailCopied ? (
                      <Check className="w-[18px] h-[18px] text-emerald-500" />
                    ) : (
                      <Share2 className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main Responsive Content */}
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-2 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] lg:grid-cols-[400px_1fr] gap-6 md:gap-10 lg:gap-12 items-start">
                  {/* Left Poster Visual (Img 2 Desktop Square/Card, Img 3 Mobile with Floating Top Controls) */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-[22px] sm:rounded-[26px] overflow-hidden bg-[#11141B] border border-slate-200/80 dark:border-white/[0.08] shadow-xl shrink-0">
                    {/* Mobile Top Floating Controls inside Poster (Img 3) */}
                    <div className="md:hidden absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        aria-label="Back to events"
                        className="pointer-events-auto w-9 h-9 rounded-full bg-white/85 dark:bg-black/55 backdrop-blur-md border border-black/10 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white shadow-sm active:scale-95 transition-transform cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <div className="pointer-events-auto flex items-center gap-2">
                        <a
                          href={selectedEvent.event_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open event website"
                          className="w-9 h-9 rounded-full bg-white/85 dark:bg-black/55 backdrop-blur-md border border-black/10 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white shadow-sm active:scale-95 transition-transform"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleShare(selectedEvent)}
                          aria-label="Share event"
                          className="w-9 h-9 rounded-full bg-white/85 dark:bg-black/55 backdrop-blur-md border border-black/10 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white shadow-sm active:scale-95 transition-transform cursor-pointer"
                        >
                          {detailCopied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {selectedEvent.banner_url ? (
                      <>
                        <Image
                          src={selectedEvent.banner_url}
                          alt=""
                          fill
                          aria-hidden="true"
                          className="object-cover object-center scale-110 blur-xl opacity-50 pointer-events-none select-none"
                          unoptimized
                        />
                        <Image
                          src={selectedEvent.banner_url}
                          alt={selectedEvent.event_name}
                          fill
                          className="z-10 object-contain object-center"
                          unoptimized
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2B6BF3] to-[#3B42F6] flex items-center justify-center select-none">
                        <span className="text-6xl sm:text-7xl font-black text-white tracking-tight">
                          {fallbackInitial}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Details Column (Img 2 Desktop / Below Poster on Img 3 Mobile) */}
                  <div className="flex flex-col items-start space-y-5 md:pt-2 min-w-0">
                    {/* Mode & Hackathon Pills */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                        {modeLabel}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          selectedEvent.is_hackathon
                            ? "bg-[#D5FF38] text-[#0D0F12]"
                            : "bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/[0.1]"
                        }`}
                      >
                        {selectedEvent.is_hackathon ? "Hackathon" : "Campus Event"}
                      </span>
                    </div>

                    {/* Title & Host */}
                    <div className="space-y-1.5 w-full">
                      <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                        {selectedEvent.event_name}
                      </h1>
                      <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
                        Hosted by{" "}
                        <span className="text-slate-900 dark:text-white font-bold">
                          {selectedEvent.conducted_by_college}
                        </span>
                      </p>
                    </div>

                    {/* Stacked Calendar Badge + Dates Row */}
                    <div className="flex items-center gap-3.5">
                      {calendarBadge && (
                        <div className="w-11 h-11 rounded-xl border border-slate-200/90 dark:border-white/[0.12] bg-slate-50 dark:bg-[#14171D] overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="w-full py-0.5 text-[9px] font-black tracking-wider text-center bg-slate-200/80 dark:bg-white/[0.08] text-slate-600 dark:text-neutral-300 leading-none">
                            {calendarBadge.month}
                          </span>
                          <span className="text-[15px] font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                            {calendarBadge.day}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                          {dateRangeLabel}
                        </div>
                        <div className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-neutral-400 mt-0.5">
                          {selectedEvent.registration_deadline
                            ? `Register by ${formatDate(selectedEvent.registration_deadline)}`
                            : "Registrations Open"}
                        </div>
                      </div>
                    </div>

                    {/* Primary & Secondary Actions */}
                    <div className="flex items-center flex-wrap gap-3 pt-1">
                      <a
                        href={selectedEvent.event_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-[#D5FF38] text-white dark:text-[#0D0F12] font-extrabold text-sm inline-flex items-center gap-2 shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                      >
                        <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                        <span>Register</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleShare(selectedEvent)}
                        className="px-4 py-2.5 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-700 dark:text-neutral-200 border border-slate-200/90 dark:border-white/[0.12] font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {detailCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Link Copied</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Details Section (Location, Prize, Team Size & Description) */}
                <div className="mt-10 pt-8 border-t border-slate-200/80 dark:border-white/[0.08] space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Location</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                        {locationText}
                      </p>
                    </div>

                    {selectedEvent.prize_pool && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>Prize Pool</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                          {selectedEvent.prize_pool}
                        </p>
                      </div>
                    )}

                    {selectedEvent.team_size && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>Team Size</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                          {selectedEvent.team_size}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <div className="max-w-3xl space-y-2.5">
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                        About the Event
                      </h2>
                      <div className="text-sm sm:text-[15px] text-slate-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-normal">
                        {cleanEventDescription(selectedEvent.description)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
