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
  Clock,
  X,
  ArrowUpRight,
  Sparkles,
  Search,
  Share2,
  SlidersHorizontal,
  Filter,
  Check,
} from "lucide-react";
import { useStudentEvents } from "@/hooks/useStudentEvents";
import type { EventItem } from "@/types/events";

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

export default function EventsWidget() {
  const { data, isLoading: loadingLiveEvents } = useStudentEvents();
  const liveEvents = data?.events ?? [];
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "hackathons" | "online" | "campus">("all");
  const [showFilterPills, setShowFilterPills] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Discover Campus Events & Hackathons | SkillsCatalyst",
          url: window.location.href,
        });
        return;
      } catch {
        // user canceled share
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-hide-bottombar");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-hide-bottombar");
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
      {/* ── Top Hero (Mobile View Only: Matches Mobile Mockup) ── */}
      <div
        suppressHydrationWarning
        className="md:hidden relative overflow-hidden rounded-[24px] sm:rounded-[36px] p-4.5 sm:p-8 bg-white border border-slate-200/80 shadow-[0_12px_45px_rgba(0,0,0,0.06)] space-y-3.5 sm:space-y-4"
      >
        {/* Animated Pastel Gradient Blobs (Peach, Lilac, Sky Blue) */}
        <motion.div
          animate={{
            x: [0, 22, -14, 0],
            y: [0, -18, 14, 0],
            scale: [1, 1.1, 0.96, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-24 -right-10 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-br from-[#FFA28B] via-[#FF7582]/65 to-[#FF99AC]/50 blur-3xl opacity-75 pointer-events-none"
        />

        <motion.div
          animate={{
            x: [0, -18, 16, 0],
            y: [0, 16, -16, 0],
            scale: [1, 0.94, 1.08, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          className="absolute top-4 right-14 w-72 sm:w-84 h-72 sm:h-84 rounded-full bg-gradient-to-tr from-[#C4B5FD] via-[#DDD6FE]/75 to-[#E9D5FF]/60 blur-3xl opacity-75 pointer-events-none"
        />

        <motion.div
          animate={{
            x: [0, 16, -20, 0],
            y: [0, -12, 16, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="absolute -bottom-24 right-4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-tl from-[#BAE6FD] via-[#93C5FD]/75 to-[#C7D2FE]/65 blur-3xl opacity-70 pointer-events-none"
        />

        {/* Ambient Warm Glow behind share button */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.4, 0.55, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-b from-[#FFD1C1]/60 to-[#DDD6FE]/50 blur-2xl pointer-events-none"
        />

        {/* Top Row: Location Tag + Share Button */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A5F] shrink-0" />
            <span className="text-xs sm:text-base font-extrabold text-slate-800 tracking-tight">
              Events near you
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share events"
            suppressHydrationWarning
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-white/80 shadow-xs flex items-center justify-center text-slate-700 transition-all active:scale-95 cursor-pointer relative"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700" />
            )}
            {copied && (
              <span className="absolute -bottom-6 text-[10px] font-bold text-emerald-600 whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>

        {/* Headline */}
        <div className="relative z-10 pt-0.5 sm:pt-1">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Discover events
          </h1>
        </div>

        {/* Pill Search Bar */}
        <div className="relative z-10 space-y-2 pt-0.5 sm:pt-1">
          <div className="flex items-center w-full min-w-0 bg-white rounded-full border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-1.5 pl-3.5 sm:p-2 sm:pl-5 gap-2 sm:gap-3 transition-all focus-within:shadow-[0_8px_30px_rgba(99,102,241,0.12)] focus-within:border-indigo-300">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Explore events"
              suppressHydrationWarning
              className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                suppressHydrationWarning
                className="text-slate-400 hover:text-slate-600 p-1 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 shrink-0 mx-0.5 sm:mx-1" />
            <button
              type="button"
              onClick={() => setShowFilterPills(!showFilterPills)}
              aria-label="Filter events"
              suppressHydrationWarning
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${showFilterPills || filterMode !== "all"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#5D5FEF]"
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
                {[
                  { id: "all", label: "All Events" },
                  { id: "hackathons", label: "Hackathons" },
                  { id: "online", label: "Online Only" },
                  { id: "campus", label: "On Campus" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterMode(f.id as any)}
                    suppressHydrationWarning
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${filterMode === f.id
                      ? "bg-[#6366F1] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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

      {/* ── Desktop View Search & Filter Bar (Matches Image 2) ── */}
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
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#121318] border border-slate-200 dark:border-neutral-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none focus:border-indigo-500 dark:focus:border-[#C084FC] transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                suppressHydrationWarning
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
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
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
              {[
                { id: "all", label: "All Events" },
                { id: "hackathons", label: "Hackathons" },
                { id: "online", label: "Online Only" },
                { id: "campus", label: "On Campus" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id as any)}
                  suppressHydrationWarning
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === f.id
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-neutral-700/80"
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
            onClick={handleShare}
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
              className="text-xs font-bold text-purple-600 dark:text-[#C084FC] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="rounded-xl sm:rounded-2xl bg-white dark:bg-[#18191F] border border-slate-200/90 dark:border-neutral-800 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer shadow-2xs"
            >
              {/* Compact Banner Thumbnail */}
              <div className="relative w-full h-24 sm:h-28 bg-slate-950 overflow-hidden">
                {ev.banner_url ? (
                  <Image
                    src={ev.banner_url}
                    alt={ev.event_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center text-white/40">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                {/* Floating Badges */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {ev.category === "online" ? "Online" : "In-Person"}
                  </span>
                  {ev.is_hackathon && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-amber-500 text-white shadow-2xs">
                      Hackathon
                    </span>
                  )}
                </div>

                {ev.is_hackathon && ev.prize_pool && (
                  <div className="absolute bottom-1.5 left-1.5 z-10 max-w-[90%]">
                    <span className="text-[8px] sm:text-[10px] font-black text-purple-300 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded border border-purple-400/40 inline-flex items-center gap-0.5 truncate">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{ev.prize_pool}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Info Body */}
              <div className="p-2.5 sm:p-3.5 space-y-1 sm:space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-[#C084FC] transition-colors line-clamp-1 leading-snug">
                    {ev.event_name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-neutral-400 truncate flex items-center gap-1">
                    <span className="text-purple-600 dark:text-[#C084FC] shrink-0">🏛</span>
                    <span className="truncate">{ev.conducted_by_college}</span>
                  </p>
                </div>

                <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[9px] sm:text-[11px]">
                  <span className="text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1 truncate pr-1">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-[#C084FC] shrink-0" />
                    <span className="truncate">
                      {formatDateShort(ev.start_date)}
                    </span>
                  </span>
                  <span className="text-purple-600 dark:text-[#C084FC] font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Details</span>
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Total Info Modal ── */}
      <AnimatePresence>
        {selectedEvent && (
          <div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-5 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-[#18191F] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-neutral-800 my-0 sm:my-auto"
            >
              {/* Mobile Drag Indicator */}
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-neutral-700 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

              {/* Modal Header: Clean, Uncluttered, Separated from Poster */}
              <div className="px-4 py-3 sm:p-5 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#18191F] flex items-start justify-between gap-3 shrink-0">
                <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 pr-1">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedEvent.is_hackathon ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-500 text-white shadow-2xs uppercase tracking-wider">
                        Hackathon
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-purple-600 text-white shadow-2xs uppercase tracking-wider">
                        Campus Event
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-purple-50 dark:bg-[#121318] text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-neutral-700">
                      {selectedEvent.category === "online" ? "🌐 Online" : "📍 In-Person"}
                    </span>
                    {selectedEvent.mode && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-slate-100 dark:bg-[#121318] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 capitalize">
                        {selectedEvent.mode}
                      </span>
                    )}
                    {selectedEvent.is_hackathon && selectedEvent.prize_pool && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Prize Pool: {selectedEvent.prize_pool}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Conducting College */}
                  <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {selectedEvent.event_name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400 flex items-center gap-1 truncate">
                    <span className="text-purple-600 dark:text-[#C084FC] shrink-0">🏛</span>
                    <span className="truncate">{selectedEvent.conducted_by_college}</span>
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#121318] hover:bg-slate-200 dark:hover:bg-[#20222A] text-slate-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 text-slate-800 dark:text-neutral-200">
                {/* Poster Display (Clean frame, full image visible) */}
                {selectedEvent.banner_url && (
                  <div className="relative w-full h-44 sm:h-52 bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-neutral-800">
                    <Image
                      src={selectedEvent.banner_url}
                      alt={selectedEvent.event_name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}

                {/* Highlights Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-xs">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600 dark:text-[#C084FC] shrink-0" />
                      <span>Event Dates</span>
                    </span>
                    <span className="font-black text-slate-900 dark:text-white block text-[11px] sm:text-xs leading-snug">
                      {formatDate(selectedEvent.start_date)}
                      {" – "}
                      {formatDate(selectedEvent.end_date)}
                    </span>
                  </div>

                  {selectedEvent.registration_deadline ? (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Register By</span>
                      </span>
                      <span className="font-black text-amber-700 dark:text-amber-300 block text-[11px] sm:text-xs leading-snug">
                        {formatDate(selectedEvent.registration_deadline)}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600 dark:text-[#C084FC] shrink-0" />
                        <span>Registration</span>
                      </span>
                      <span className="font-black text-purple-700 dark:text-purple-300 block text-[11px] sm:text-xs leading-snug">
                        Open Now
                      </span>
                    </div>
                  )}

                  {selectedEvent.team_size && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Team Size</span>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white block text-[11px] sm:text-xs leading-snug">
                        {selectedEvent.team_size}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-purple-600 dark:text-[#C084FC] shrink-0" />
                      <span>Format</span>
                    </span>
                    <span className="font-black text-slate-900 dark:text-white block text-[11px] sm:text-xs capitalize leading-snug">
                      {selectedEvent.category} {selectedEvent.mode ? `• ${selectedEvent.mode}` : ""}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 space-y-1 col-span-2">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>Venue / Location</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-neutral-200 block text-[11px] sm:text-xs leading-relaxed">
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* About Description (Sanitized & Clean) */}
                {selectedEvent.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                      About the Event
                    </h4>
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#121318] border border-slate-200/80 dark:border-neutral-700 text-xs sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-medium">
                      {cleanEventDescription(selectedEvent.description)}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer */}
              <div className="p-3 sm:px-5 bg-white dark:bg-[#18191F] border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-300 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <span className="hidden sm:inline">Registrations Open</span>
                  <span className="sm:hidden">Open</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#20222A] text-xs font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <a
                    href={selectedEvent.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm hover:shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
