"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type MoodType = "happy" | "angry" | "sleepy" | "bored" | "calm" | "wacky" | "pouty";

interface MoodItem {
  id: MoodType;
  label: string;
  color: string;
  bgHex: string;
  summaryTitle: string;
  summaryMessage: string;
  summaryBg: string;
}

export const MOODS: Record<MoodType, MoodItem> = {
  happy: {
    id: "happy",
    label: "Happy",
    color: "#8AE6A2",
    bgHex: "#8AE6A2",
    summaryTitle: "Happy",
    summaryMessage: "You're feeling calm and optimistic. Keep up the good vibes!",
    summaryBg: "bg-[#D2F5A6] dark:bg-[#253A18] text-[#15192B] dark:text-[#E2F8C8]",
  },
  angry: {
    id: "angry",
    label: "Angry",
    color: "#F88A58",
    bgHex: "#F88A58",
    summaryTitle: "Frustrated",
    summaryMessage: "Take a deep breath and give yourself a break. You've got this!",
    summaryBg: "bg-[#FED5B7] dark:bg-[#3D2316] text-[#15192B] dark:text-[#FEE7D6]",
  },
  sleepy: {
    id: "sleepy",
    label: "Sleepy",
    color: "#88B7FA",
    bgHex: "#88B7FA",
    summaryTitle: "Sleepy",
    summaryMessage: "Recharge your mind with good sleep. Tomorrow is a fresh start!",
    summaryBg: "bg-[#CFE2FE] dark:bg-[#1A2840] text-[#15192B] dark:text-[#E0ECFD]",
  },
  bored: {
    id: "bored",
    label: "Bored",
    color: "#E8A0E8",
    bgHex: "#E8A0E8",
    summaryTitle: "Uninspired",
    summaryMessage: "Try exploring something new today or taking a quick walk outside!",
    summaryBg: "bg-[#F5D6F5] dark:bg-[#381E38] text-[#15192B] dark:text-[#FBEBFB]",
  },
  calm: {
    id: "calm",
    label: "Calm",
    color: "#FDE278",
    bgHex: "#FDE278",
    summaryTitle: "Calm & Centered",
    summaryMessage: "Steady progress and peaceful focus. Keep up the gentle rhythm!",
    summaryBg: "bg-[#FDF1BA] dark:bg-[#3B3416] text-[#15192B] dark:text-[#FDF8D9]",
  },
  wacky: {
    id: "wacky",
    label: "Energetic",
    color: "#C6A4F9",
    bgHex: "#C6A4F9",
    summaryTitle: "Energetic",
    summaryMessage: "High momentum and curiosity driving your creative breakthroughs!",
    summaryBg: "bg-[#E6D4FC] dark:bg-[#2F1E44] text-[#15192B] dark:text-[#F2E8FD]",
  },
  pouty: {
    id: "pouty",
    label: "Tired",
    color: "#F68F8F",
    bgHex: "#F68F8F",
    summaryTitle: "A Bit Low",
    summaryMessage: "Be kind to yourself today. Small steps still count as progress.",
    summaryBg: "bg-[#FDCBCB] dark:bg-[#3C1A1A] text-[#15192B] dark:text-[#FDE3E3]",
  },
};

// ── SVG Face Vector Renderers (Authentic Image 2 & 3 Art) ──
export function HappyFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="48" fill="#8AE6A2" />
      <path d="M 28 38 Q 36 28 44 38" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 56 38 Q 64 28 72 38" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 32 54 Q 50 74 68 54" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function AngryFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect x="4" y="4" width="92" height="92" rx="28" fill="#F88A58" />
      <path d="M 24 33 L 44 42" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 76 33 L 56 42" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="34" cy="48" r="4" fill="#15192B" />
      <circle cx="66" cy="48" r="4" fill="#15192B" />
      <path d="M 36 67 Q 50 56 64 67" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function SleepyFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M 50 4 C 76 4 94 25 94 56 C 94 80 76 96 50 96 C 24 96 6 80 6 56 C 6 25 24 4 50 4 Z"
        fill="#88B7FA"
      />
      <path d="M 28 42 Q 36 34 44 42" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 56 42 Q 64 34 72 42" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <ellipse cx="50" cy="60" rx="6" ry="8" stroke="#15192B" strokeWidth="4" fill="#15192B" />
    </svg>
  );
}

export function BoredFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="48" fill="#E8A0E8" />
      <path d="M 26 36 L 43 37" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 57 39 L 74 38" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="35" cy="48" r="4" fill="#15192B" />
      <circle cx="65" cy="48" r="4" fill="#15192B" />
      <path d="M 38 64 Q 50 61 62 64" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalmFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect x="4" y="4" width="92" height="92" rx="28" fill="#FDE278" />
      <path d="M 28 40 Q 36 32 44 40" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 56 40 Q 64 32 72 40" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 36 58 Q 50 68 64 58" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export function WackyFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect x="4" y="4" width="92" height="92" rx="28" fill="#C6A4F9" />
      <circle cx="32" cy="40" r="6" fill="#15192B" />
      <circle cx="68" cy="38" r="8" fill="#15192B" />
      <circle cx="34" cy="39" r="2" fill="white" />
      <circle cx="70" cy="36" r="3" fill="white" />
      <ellipse cx="50" cy="62" rx="5" ry="6" fill="#15192B" />
    </svg>
  );
}

export function PoutyFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect x="4" y="4" width="92" height="92" rx="28" fill="#F68F8F" />
      <path d="M 28 36 L 40 44 L 28 48" stroke="#15192B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 72 36 L 60 44 L 72 48" stroke="#15192B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 38 66 Q 50 56 62 66" stroke="#15192B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

function renderMoodSvg(type: MoodType | null, className = "w-full h-full") {
  switch (type) {
    case "happy":
      return <HappyFaceSvg className={className} />;
    case "angry":
      return <AngryFaceSvg className={className} />;
    case "sleepy":
      return <SleepyFaceSvg className={className} />;
    case "bored":
      return <BoredFaceSvg className={className} />;
    case "calm":
      return <CalmFaceSvg className={className} />;
    case "wacky":
      return <WackyFaceSvg className={className} />;
    case "pouty":
      return <PoutyFaceSvg className={className} />;
    default:
      return null;
  }
}

// ── Preset Month Pattern matching Image 3 (Sun-Sat grid) ──
const INITIAL_CALENDAR_DAYS: Array<{ id: number; mood: MoodType | null }> = [
  // Row 1
  { id: 1, mood: null },
  { id: 2, mood: null },
  { id: 3, mood: "angry" },
  { id: 4, mood: "angry" },
  { id: 5, mood: "angry" },
  { id: 6, mood: "happy" },
  { id: 7, mood: "sleepy" },
  // Row 2
  { id: 8, mood: null },
  { id: 9, mood: "calm" },
  { id: 10, mood: "calm" },
  { id: 11, mood: "wacky" },
  { id: 12, mood: "sleepy" },
  { id: 13, mood: "happy" },
  { id: 14, mood: "happy" },
  // Row 3
  { id: 15, mood: "wacky" },
  { id: 16, mood: "pouty" },
  { id: 17, mood: null },
  { id: 18, mood: "calm" },
  { id: 19, mood: "calm" },
  { id: 20, mood: "sleepy" },
  { id: 21, mood: "happy" },
  // Row 4
  { id: 22, mood: "happy" }, // Today's slot (index 21)
  { id: 23, mood: "happy" },
  { id: 24, mood: null },
  { id: 25, mood: null },
  { id: 26, mood: "happy" },
  { id: 27, mood: "sleepy" },
  { id: 28, mood: "happy" },
  // Row 5
  { id: 29, mood: "wacky" },
  { id: 30, mood: "pouty" },
  { id: 31, mood: "angry" },
  { id: 32, mood: "bored" },
  { id: 33, mood: "calm" },
  { id: 34, mood: "sleepy" },
  { id: 35, mood: "happy" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SELECTOR_MOODS: MoodType[] = ["happy", "angry", "sleepy", "bored"];

export default function MoodCalendarWidget() {
  const [selectedMood, setSelectedMood] = useState<MoodType>("happy");
  const [calendarDays, setCalendarDays] = useState(INITIAL_CALENDAR_DAYS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillscatalyst_daily_mood");
      if (saved && (saved in MOODS)) {
        setSelectedMood(saved as MoodType);
        setCalendarDays((prev) =>
          prev.map((item, idx) => (idx === 21 ? { ...item, mood: saved as MoodType } : item))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    try {
      localStorage.setItem("skillscatalyst_daily_mood", mood);
    } catch {
      // ignore
    }
    setCalendarDays((prev) =>
      prev.map((item, idx) => (idx === 21 ? { ...item, mood } : item))
    );
  };

  const currentSummary = MOODS[selectedMood] || MOODS.happy;

  return (
    <div className="w-full bg-white dark:bg-[#181B2B] rounded-[24px] border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(93,100,217,0.05)] p-3.5 sm:p-4 space-y-3.5 transition-all">
      {/* ── Header: Title & Month (Compact) ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#15192B] dark:text-white tracking-tight">
            Mood Tracker
          </h3>
          <p className="text-[11px] text-[#7A82A6] dark:text-neutral-400 font-medium">
            Daily check-in & calendar
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[#555E8D] dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700">
            Oct 2026
          </span>
          <div className="flex items-center text-slate-400">
            <button
              type="button"
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 1: Daily Mood Selector (Image 2 style, Compact) ── */}
      <div className="bg-[#FAFBFD] dark:bg-[#151828]/60 p-2.5 rounded-2xl border border-slate-100 dark:border-neutral-800/80">
        <div className="grid grid-cols-4 gap-2">
          {SELECTOR_MOODS.map((mType) => {
            const mood = MOODS[mType];
            const isSelected = selectedMood === mType;
            return (
              <button
                key={mType}
                type="button"
                onClick={() => handleSelectMood(mType)}
                className="group flex flex-col items-center gap-1.5 transition-all cursor-pointer focus:outline-none"
                aria-label={`Select ${mood.label} mood`}
              >
                {/* Face Character Container */}
                <div
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-transform duration-150 group-hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "ring-2 ring-[#15192B] dark:ring-white ring-offset-2 dark:ring-offset-[#181B2B] shadow-xs"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {renderMoodSvg(mType, "w-full h-full drop-shadow-xs")}
                </div>

                {/* Pill Button Label matching Image 2 */}
                <span
                  className={`w-full py-0.5 px-1.5 rounded-lg text-center text-[10px] sm:text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-[#15192B] text-white shadow-xs"
                      : "bg-white dark:bg-neutral-800 text-[#15192B] dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700 hover:border-slate-300"
                  }`}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Mood Calendar Grid (Image 3 style, Compact) ── */}
      <div className="space-y-1">
        {/* Weekday Labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[10px] font-semibold text-[#8A92A6] dark:text-neutral-500 py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Day Squircles Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((item, idx) => {
            const isToday = idx === 21;
            const hasMood = Boolean(item.mood);

            return (
              <div
                key={item.id}
                className={`relative h-6.5 sm:h-7.5 rounded-[9px] sm:rounded-[10px] flex items-center justify-center transition-all ${
                  isToday
                    ? "ring-2 ring-[#5D64D9] dark:ring-indigo-400 ring-offset-1 dark:ring-offset-[#181B2B] shadow-xs"
                    : ""
                } ${
                  hasMood
                    ? "cursor-pointer hover:scale-105 active:scale-95"
                    : "bg-slate-100/70 dark:bg-neutral-800/60"
                }`}
                title={
                  isToday
                    ? `Today: ${selectedMood}`
                    : hasMood
                    ? `Day ${item.id}: ${item.mood}`
                    : `Day ${item.id}: Rest day`
                }
              >
                {hasMood ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 p-0.5">
                    {renderMoodSvg(item.mood, "w-full h-full")}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold select-none">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Monthly Mood Summary Card (Image 3 style, Compact) ── */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3 transition-all duration-300 ${currentSummary.summaryBg} shadow-xs`}
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-0.5 max-w-[240px]">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              Monthly Mood Summary
            </p>
            <h4 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              {currentSummary.summaryTitle}
            </h4>
            <p className="text-[11px] opacity-90 line-clamp-1 font-medium">
              {currentSummary.summaryMessage}
            </p>
          </div>

          {/* Stylized Smile Face Vector (Image 3 style) */}
          <div className="shrink-0 text-current opacity-95">
            <svg
              viewBox="0 0 130 90"
              className="w-16 sm:w-18 h-10 sm:h-11 text-current"
              fill="none"
              stroke="currentColor"
            >
              <path d="M 12 30 Q 32 8 52 30" strokeWidth="7" strokeLinecap="round" />
              <path d="M 78 24 Q 98 4 118 24" strokeWidth="7" strokeLinecap="round" />
              <path d="M 22 66 Q 65 96 108 66" strokeWidth="7.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
