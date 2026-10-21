"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  computeCalendarGrid,
  fetchMonthlyMoods,
  logUserDailyMood,
  getTodayDateString,
  CalendarCell,
} from "@/lib/api/moods";
import { MoodType, MonthlyMoodSummary } from "@/types/mood";

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

export function renderMoodSvg(type: MoodType | null, className = "w-full h-full") {
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SELECTOR_MOODS: MoodType[] = ["happy", "angry", "sleepy", "bored"];

export default function MoodCalendarWidget() {
  const { session } = useAuth();
  const userId = session?.user_id || "anonymous_user";
  const queryClient = useQueryClient();

  const todayStr = useMemo(() => getTodayDateString(), []);

  // ── Month Navigation State ──
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateString());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Month & Year header label (e.g. "Oct 2026", "Nov 2026")
  const monthHeaderLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(currentDate);
  }, [currentDate]);

  // Selected date human label
  const selectedDateLabel = useMemo(() => {
    if (selectedDateStr === todayStr) return "Today";
    try {
      const [y, m, d] = selectedDateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt);
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr, todayStr]);

  // Dynamic Calendar Grid Cells
  const calendarCells = useMemo(() => {
    return computeCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // ── Database Query ──
  const { data: monthlyData, isLoading } = useQuery<MonthlyMoodSummary>({
    queryKey: ["monthly-moods", userId, currentYear, currentMonth],
    queryFn: () => fetchMonthlyMoods(userId, currentYear, currentMonth),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Map of dateStr -> mood
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodType>();
    if (monthlyData?.logs) {
      for (const log of monthlyData.logs) {
        if (log.mood) {
          map.set(log.log_date, log.mood);
        }
      }
    }
    return map;
  }, [monthlyData?.logs]);

  // Current mood for selected date
  const selectedDateMood = moodMap.get(selectedDateStr) || null;

  // ── Mutation: Log Mood ──
  const logMutation = useMutation({
    mutationFn: (mood: MoodType) =>
      logUserDailyMood(userId, { mood, log_date: selectedDateStr }),
    onMutate: async (newMood: MoodType) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: ["monthly-moods", userId, currentYear, currentMonth],
      });
      const previous = queryClient.getQueryData<MonthlyMoodSummary>([
        "monthly-moods",
        userId,
        currentYear,
        currentMonth,
      ]);

      if (previous) {
        const existingIdx = previous.logs.findIndex((l) => l.log_date === selectedDateStr);
        let updatedLogs = [...previous.logs];
        if (existingIdx >= 0) {
          updatedLogs[existingIdx] = { ...updatedLogs[existingIdx], mood: newMood };
        } else {
          updatedLogs.push({
            id: `temp_${Date.now()}`,
            user_id: userId,
            log_date: selectedDateStr,
            mood: newMood,
          });
        }

        // Recompute dominant
        const counts: Record<string, number> = {};
        for (const l of updatedLogs) counts[l.mood] = (counts[l.mood] || 0) + 1;
        let dominant: MoodType | null = null;
        let maxC = 0;
        for (const [k, v] of Object.entries(counts)) {
          if (v > maxC) {
            maxC = v;
            dominant = k as MoodType;
          }
        }

        queryClient.setQueryData<MonthlyMoodSummary>(
          ["monthly-moods", userId, currentYear, currentMonth],
          {
            ...previous,
            logs: updatedLogs,
            predominant_mood: dominant,
            total_logged: updatedLogs.length,
            mood_counts: counts,
          }
        );
      }

      return { previous };
    },
    onError: (_err, _newMood, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["monthly-moods", userId, currentYear, currentMonth],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["monthly-moods", userId, currentYear, currentMonth],
      });
    },
  });

  const handleSelectMood = (mood: MoodType) => {
    logMutation.mutate(mood);
  };

  // ── Month Navigation Handlers ──
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayDateString());
  };

  // ── Monthly Summary Card Content ──
  const predominantMood = monthlyData?.predominant_mood;
  const currentSummary = predominantMood ? MOODS[predominantMood] : null;

  return (
    <div className="w-full bg-white dark:bg-[#181B2B] rounded-[24px] border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(93,100,217,0.05)] p-3.5 sm:p-4 space-y-3.5 transition-all">
      {/* ── Header: Title & Dynamic Month Navigation ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#15192B] dark:text-white tracking-tight">
            Mood Tracker
          </h3>
          <p className="text-[11px] text-[#7A82A6] dark:text-neutral-400 font-medium">
            Daily check-in for <span className="font-semibold text-[#5D64D9] dark:text-indigo-400">{selectedDateLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[#555E8D] dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700 hover:border-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Click to jump to current month"
          >
            {monthHeaderLabel}
          </button>
          <div className="flex items-center text-slate-400">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
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
            const isSelected = selectedDateMood === mType;
            return (
              <button
                key={mType}
                type="button"
                onClick={() => handleSelectMood(mType)}
                className="group flex flex-col items-center gap-1.5 transition-all cursor-pointer focus:outline-none"
                aria-label={`Select ${mood.label} mood for ${selectedDateLabel}`}
              >
                {/* Face Container */}
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

      {/* ── Section 2: Mood Calendar Grid (Image 3 style, Dynamic) ── */}
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

        {/* Dynamic Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarCells.map((cell: CalendarCell) => {
            const cellMood = moodMap.get(cell.dateStr) || null;
            const hasMood = Boolean(cellMood);
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = cell.isToday;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative h-6.5 sm:h-7.5 rounded-[9px] sm:rounded-[10px] flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? "ring-2 ring-[#15192B] dark:ring-white ring-offset-1 dark:ring-offset-[#181B2B] z-10"
                    : isToday
                    ? "ring-2 ring-[#5D64D9] dark:ring-indigo-400 ring-offset-1 dark:ring-offset-[#181B2B]"
                    : ""
                } ${
                  hasMood
                    ? "hover:scale-105 active:scale-95"
                    : "bg-slate-100/70 dark:bg-neutral-800/60 hover:bg-slate-200/80 dark:hover:bg-neutral-700/60"
                } ${!cell.isCurrentMonth ? "opacity-30" : "opacity-100"}`}
                title={
                  isToday
                    ? `Today (${cell.dateStr}): ${cellMood || "No check-in"}`
                    : `Day ${cell.dayNumber} (${cell.dateStr}): ${cellMood || "No check-in"}`
                }
              >
                {hasMood ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 p-0.5">
                    {renderMoodSvg(cellMood, "w-full h-full")}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold select-none">
                    {cell.dayNumber}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Monthly Mood Summary Card (Image 3 style, Dynamic) ── */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3 transition-all duration-300 ${
          currentSummary
            ? currentSummary.summaryBg
            : "bg-[#F3F4F6] dark:bg-[#1E2235] text-[#15192B] dark:text-[#E2E8F0]"
        } shadow-xs`}
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-0.5 max-w-[240px]">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              Monthly Mood Summary
            </p>
            <h4 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              {currentSummary ? currentSummary.summaryTitle : "Fresh Month Ahead"}
            </h4>
            <p className="text-[11px] opacity-90 line-clamp-1 font-medium">
              {currentSummary
                ? currentSummary.summaryMessage
                : "No check-ins yet for this month. Tap an emotion to record today!"}
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
