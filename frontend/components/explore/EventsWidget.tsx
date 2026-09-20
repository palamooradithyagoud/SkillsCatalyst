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
} from "lucide-react";
import { fetchStudentEvents } from "@/lib/api/events";
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
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [loadingLiveEvents, setLoadingLiveEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetchStudentEvents();
        if (active && res.events) {
          setLiveEvents(res.events);
        }
      } catch {
        // Silently handled
      } finally {
        if (active) setLoadingLiveEvents(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

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
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-2xs">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Live Campus Events &amp; Hackathons
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Click on any event card to view complete details, prizes, and registration.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
          {liveEvents.length} Active
        </span>
      </div>

      {/* ── Small / Compact Cards Grid ── */}
      {loadingLiveEvents ? (
        <div className="p-8 text-center text-xs font-semibold text-slate-400 bg-white border border-slate-200/90 rounded-2xl">
          Loading active events...
        </div>
      ) : liveEvents.length === 0 ? (
        <div className="p-8 text-center bg-white border border-dashed border-slate-200/90 rounded-2xl space-y-2">
          <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No active events published at this moment</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            New college hackathons, hiring challenges, and tech symposia will be published here directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {liveEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer shadow-2xs"
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
                    <span className="text-[8px] sm:text-[10px] font-black text-emerald-300 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded border border-emerald-400/40 inline-flex items-center gap-0.5 truncate">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{ev.prize_pool}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Info Body */}
              <div className="p-2.5 sm:p-3.5 space-y-1 sm:space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 leading-snug">
                    {ev.event_name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate flex items-center gap-1">
                    <span className="text-purple-600 shrink-0">🏛</span>
                    <span className="truncate">{ev.conducted_by_college}</span>
                  </p>
                </div>

                <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1 truncate pr-1">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 shrink-0" />
                    <span className="truncate">
                      {formatDateShort(ev.start_date)}
                    </span>
                  </span>
                  <span className="text-purple-600 font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
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
              className="w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 my-0 sm:my-auto"
            >
              {/* Mobile Drag Indicator */}
              <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mt-2.5 mb-0.5 sm:hidden shrink-0" />

              {/* Modal Header: Clean, Uncluttered, Separated from Poster */}
              <div className="px-4 py-3 sm:p-5 border-b border-slate-100 bg-white flex items-start justify-between gap-3 shrink-0">
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
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200/80">
                      {selectedEvent.category === "online" ? "🌐 Online" : "📍 In-Person"}
                    </span>
                    {selectedEvent.mode && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {selectedEvent.mode}
                      </span>
                    )}
                    {selectedEvent.is_hackathon && selectedEvent.prize_pool && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Prize Pool: {selectedEvent.prize_pool}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Conducting College */}
                  <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                    {selectedEvent.event_name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1 truncate">
                    <span className="text-purple-600 shrink-0">🏛</span>
                    <span className="truncate">{selectedEvent.conducted_by_college}</span>
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 text-slate-800">
                {/* Poster Display (Clean frame, full image visible) */}
                {selectedEvent.banner_url && (
                  <div className="relative w-full h-44 sm:h-52 bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80">
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
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>Event Dates</span>
                    </span>
                    <span className="font-black text-slate-900 block text-[11px] sm:text-xs leading-snug">
                      {formatDate(selectedEvent.start_date)}
                      {" – "}
                      {formatDate(selectedEvent.end_date)}
                    </span>
                  </div>

                  {selectedEvent.registration_deadline ? (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Register By</span>
                      </span>
                      <span className="font-black text-amber-700 block text-[11px] sm:text-xs leading-snug">
                        {formatDate(selectedEvent.registration_deadline)}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Registration</span>
                      </span>
                      <span className="font-black text-emerald-700 block text-[11px] sm:text-xs leading-snug">
                        Open Now
                      </span>
                    </div>
                  )}

                  {selectedEvent.team_size && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Team Size</span>
                      </span>
                      <span className="font-black text-slate-900 block text-[11px] sm:text-xs leading-snug">
                        {selectedEvent.team_size}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>Format</span>
                    </span>
                    <span className="font-black text-slate-900 block text-[11px] sm:text-xs capitalize leading-snug">
                      {selectedEvent.category} {selectedEvent.mode ? `• ${selectedEvent.mode}` : ""}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 col-span-2">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>Venue / Location</span>
                      </span>
                      <span className="font-semibold text-slate-800 block text-[11px] sm:text-xs leading-relaxed">
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* About Description (Sanitized & Clean) */}
                {selectedEvent.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      About the Event
                    </h4>
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {cleanEventDescription(selectedEvent.description)}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer */}
              <div className="p-3 sm:px-5 bg-white border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="hidden sm:inline">Registrations Open</span>
                  <span className="sm:hidden">Open</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
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
