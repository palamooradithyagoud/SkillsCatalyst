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
} from "lucide-react";
import { fetchStudentEvents } from "@/lib/api/events";
import type { EventItem } from "@/types/events";

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
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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
              Click on any event to view complete details, prizes, and registration.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {liveEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              {/* Compact Banner Thumbnail */}
              <div className="relative w-full h-28 bg-slate-950 overflow-hidden">
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
                    <Trophy className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {ev.category === "online" ? "Online" : "In-Person"}
                  </span>
                  {ev.is_hackathon && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-white shadow-2xs">
                      Hackathon
                    </span>
                  )}
                </div>

                {ev.is_hackathon && ev.prize_pool && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="text-[10px] font-black text-emerald-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-400/40 inline-flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{ev.prize_pool}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Info Body */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                    {ev.event_name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-600 truncate flex items-center gap-1">
                    <span className="text-purple-600">🏛</span>
                    <span>{ev.conducted_by_college}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>
                      {formatDateShort(ev.start_date)} – {formatDateShort(ev.end_date)}
                    </span>
                  </span>
                  <span className="text-purple-600 font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    <span>Details</span>
                    <ArrowUpRight className="w-3 h-3" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
              {/* Modal Banner */}
              <div className="relative w-full h-48 sm:h-56 bg-slate-950 shrink-0 overflow-hidden">
                {selectedEvent.banner_url ? (
                  <Image
                    src={selectedEvent.banner_url}
                    alt={selectedEvent.event_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center text-white/40">
                    <Trophy className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {selectedEvent.category === "online" ? "Online" : "In-Person"}
                  </span>
                  {selectedEvent.is_hackathon && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs">
                      Hackathon
                    </span>
                  )}
                  {selectedEvent.mode && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white capitalize shadow-xs">
                      {selectedEvent.mode}
                    </span>
                  )}
                </div>

                {/* Banner Title & College */}
                <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
                  {selectedEvent.is_hackathon && selectedEvent.prize_pool && (
                    <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-300 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-emerald-400/40 mb-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prize Pool: {selectedEvent.prize_pool}</span>
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {selectedEvent.event_name}
                  </h3>
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5 truncate">
                    <span>🏛 {selectedEvent.conducted_by_college}</span>
                  </p>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      <span>Event Dates</span>
                    </span>
                    <span className="font-extrabold text-slate-900 block text-xs">
                      {formatDate(selectedEvent.start_date)}
                      {" – "}
                      {formatDate(selectedEvent.end_date)}
                    </span>
                  </div>

                  {selectedEvent.registration_deadline && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Register By</span>
                      </span>
                      <span className="font-extrabold text-amber-700 block text-xs">
                        {formatDate(selectedEvent.registration_deadline)}
                      </span>
                    </div>
                  )}

                  {selectedEvent.team_size && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span>Team Size</span>
                      </span>
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {selectedEvent.team_size}
                      </span>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>Venue / Location</span>
                      </span>
                      <span className="font-semibold text-slate-800 block text-xs">
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detailed Description */}
                {selectedEvent.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      About the Event
                    </h4>
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Registrations Open</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <a
                    href={selectedEvent.event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                  >
                    <span>Register / Official Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
