"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSundayOfWeek,
  computeWeekRow,
  fetchWeeklyMoods,
  logUserDailyMood,
  getTodayDateString,
  WeekCell,
} from "@/lib/api/moods";
import { MoodType, WeeklyMoodSummary } from "@/types/mood";

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
    summaryBg: "bg-[#8AE6A2] dark:bg-[#8AE6A2] text-[#15192B] dark:text-[#15192B]",
  },
  angry: {
    id: "angry",
    label: "Angry",
    color: "#F88A58",
    bgHex: "#F88A58",
    summaryTitle: "Frustrated",
    summaryMessage: "Take a deep breath and give yourself a break. You've got this!",
    summaryBg: "bg-[#F88A58] dark:bg-[#F88A58] text-[#15192B] dark:text-[#15192B]",
  },
  sleepy: {
    id: "sleepy",
    label: "Sleepy",
    color: "#88B7FA",
    bgHex: "#88B7FA",
    summaryTitle: "Sleepy",
    summaryMessage: "Recharge your mind with good sleep. Tomorrow is a fresh start!",
    summaryBg: "bg-[#88B7FA] dark:bg-[#88B7FA] text-[#15192B] dark:text-[#15192B]",
  },
  bored: {
    id: "bored",
    label: "Bored",
    color: "#E8A0E8",
    bgHex: "#E8A0E8",
    summaryTitle: "Uninspired",
    summaryMessage: "Try exploring something new today or taking a quick walk outside!",
    summaryBg: "bg-[#E8A0E8] dark:bg-[#E8A0E8] text-[#15192B] dark:text-[#15192B]",
  },
  calm: {
    id: "calm",
    label: "Calm",
    color: "#FDE278",
    bgHex: "#FDE278",
    summaryTitle: "Calm & Centered",
    summaryMessage: "Steady progress and peaceful focus. Keep up the gentle rhythm!",
    summaryBg: "bg-[#FDE278] dark:bg-[#FDE278] text-[#15192B] dark:text-[#15192B]",
  },
  wacky: {
    id: "wacky",
    label: "Energetic",
    color: "#C6A4F9",
    bgHex: "#C6A4F9",
    summaryTitle: "Energetic",
    summaryMessage: "High momentum and curiosity driving your creative breakthroughs!",
    summaryBg: "bg-[#C6A4F9] dark:bg-[#C6A4F9] text-[#15192B] dark:text-[#15192B]",
  },
  pouty: {
    id: "pouty",
    label: "Tired",
    color: "#F68F8F",
    bgHex: "#F68F8F",
    summaryTitle: "A Bit Low",
    summaryMessage: "Be kind to yourself today. Small steps still count as progress.",
    summaryBg: "bg-[#F68F8F] dark:bg-[#F68F8F] text-[#15192B] dark:text-[#15192B]",
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

export function renderSummarySvg(type: MoodType, className = "w-16 sm:w-18 h-10 sm:h-11 text-current") {
  switch (type) {
    case "angry":
      return (
        <svg viewBox="0 0 130 90" className={className} fill="none" stroke="currentColor">
          <path d="M 18 36 L 50 26" strokeWidth="7" strokeLinecap="round" />
          <path d="M 112 36 L 80 26" strokeWidth="7" strokeLinecap="round" />
          <circle cx="34" cy="46" r="4.5" fill="currentColor" />
          <circle cx="96" cy="46" r="4.5" fill="currentColor" />
          <path d="M 32 74 Q 65 52 98 74" strokeWidth="7.5" strokeLinecap="round" />
        </svg>
      );
    case "sleepy":
      return (
        <svg viewBox="0 0 130 90" className={className} fill="none" stroke="currentColor">
          <path d="M 18 36 Q 34 26 50 36" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 80 36 Q 96 26 112 36" strokeWidth="6.5" strokeLinecap="round" />
          <ellipse cx="65" cy="62" rx="9" ry="12" strokeWidth="6.5" fill="currentColor" />
        </svg>
      );
    case "bored":
      return (
        <svg viewBox="0 0 130 90" className={className} fill="none" stroke="currentColor">
          <path d="M 20 34 L 50 35" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 80 37 L 110 35" strokeWidth="6.5" strokeLinecap="round" />
          <circle cx="35" cy="48" r="4" fill="currentColor" />
          <circle cx="95" cy="48" r="4" fill="currentColor" />
          <path d="M 38 67 L 92 67" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 130 90" className={className} fill="none" stroke="currentColor">
          <path d="M 12 30 Q 32 8 52 30" strokeWidth="7" strokeLinecap="round" />
          <path d="M 78 24 Q 98 4 118 24" strokeWidth="7" strokeLinecap="round" />
          <path d="M 22 66 Q 65 96 108 66" strokeWidth="7.5" strokeLinecap="round" />
        </svg>
      );
  }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SELECTOR_MOODS: MoodType[] = ["happy", "angry", "sleepy", "bored"];

export default function MoodCalendarWidget() {
  const { session } = useAuth();
  const userId = session?.user_id || "anonymous_user";
  const queryClient = useQueryClient();

  const todayStr = useMemo(() => getTodayDateString(), []);
  const today = useMemo(() => new Date(), []);
  const thisWeekSunday = useMemo(() => getSundayOfWeek(today), [today]);

  // ── Week Navigation State (Browses Week-by-Week) ──
  const [currentSunday, setCurrentSunday] = useState<Date>(() => getSundayOfWeek(new Date()));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateString());
  const [activeMood, setActiveMood] = useState<MoodType | null>(null);

  // Compute 7-day week row starting Sunday
  const weekCells = useMemo(() => {
    return computeWeekRow(currentSunday);
  }, [currentSunday]);

  const startDateStr = weekCells[0]?.dateStr || "";
  const endDateStr = weekCells[6]?.dateStr || "";

  // Is current week or older week?
  const isCurrentWeek = useMemo(() => {
    return currentSunday.getTime() >= thisWeekSunday.getTime();
  }, [currentSunday, thisWeekSunday]);

  // Dynamic Week Header Label (e.g. "Oct 18 – 24", "Oct 25 – Nov 1")
  const weekHeaderLabel = useMemo(() => {
    if (weekCells.length < 7) return "";
    const first = weekCells[0].date;
    const last = weekCells[6].date;
    const sameYear = first.getFullYear() === last.getFullYear();
    const sameMonth = first.getMonth() === last.getMonth();

    if (sameMonth && sameYear) {
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(first);
      return `${month} ${first.getDate()} – ${last.getDate()}`;
    } else if (sameYear) {
      const m1 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(first);
      const m2 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(last);
      return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}`;
    } else {
      const m1 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(first);
      const m2 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(last);
      return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}`;
    }
  }, [weekCells]);

  // Selected date human readable label
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

  // ── Database Query (Weekly range) ──
  const { data: weeklyData } = useQuery<WeeklyMoodSummary>({
    queryKey: ["weekly-moods", userId, startDateStr, endDateStr],
    queryFn: () => fetchWeeklyMoods(userId, startDateStr, endDateStr),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Map of dateStr -> mood
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodType>();
    if (weeklyData?.logs) {
      for (const log of weeklyData.logs) {
        if (log.mood) {
          map.set(log.log_date, log.mood);
        }
      }
    }
    return map;
  }, [weeklyData?.logs]);

  // Current mood for selected date
  const selectedDateMood = moodMap.get(selectedDateStr) || null;

  // ── Mutation: Log Mood ──
  const logMutation = useMutation({
    mutationFn: (mood: MoodType) =>
      logUserDailyMood(userId, { mood, log_date: selectedDateStr }),
    onMutate: async (newMood: MoodType) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: ["weekly-moods", userId, startDateStr, endDateStr],
      });
      const previous = queryClient.getQueryData<WeeklyMoodSummary>([
        "weekly-moods",
        userId,
        startDateStr,
        endDateStr,
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

        // Recompute dominant mood
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

        queryClient.setQueryData<WeeklyMoodSummary>(
          ["weekly-moods", userId, startDateStr, endDateStr],
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
          ["weekly-moods", userId, startDateStr, endDateStr],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-moods", userId],
      });
    },
  });

  const handleSelectMood = (mood: MoodType) => {
    setActiveMood(mood);
    logMutation.mutate(mood);
  };

  // ── Week Navigation Handlers ──
  const handlePrevWeek = () => {
    setCurrentSunday((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
  };

  const handleNextWeek = () => {
    if (isCurrentWeek) return;
    setCurrentSunday((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
  };

  const handleJumpToToday = () => {
    setCurrentSunday(getSundayOfWeek(new Date()));
    setSelectedDateStr(getTodayDateString());
    setActiveMood(null);
  };

  // ── Mood Summary Content ──
  const predominantMood = weeklyData?.predominant_mood;
  const displayMood: MoodType = activeMood || selectedDateMood || predominantMood || "happy";
  const currentSummary = MOODS[displayMood];

  return (
    <div className="w-full bg-white dark:bg-[#18191F] rounded-[24px] border border-slate-200/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none p-3.5 sm:p-4 space-y-3 transition-all">
      {/* ── Header: Title & Dynamic Week Navigation ── */}
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
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
              !isCurrentWeek
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#5D64D9] dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                : "bg-slate-100 dark:bg-neutral-800 text-[#555E8D] dark:text-neutral-300 border-slate-200/80 dark:border-neutral-700 hover:border-slate-300"
            }`}
            title={!isCurrentWeek ? "Click to jump to current week" : "Current week"}
          >
            {weekHeaderLabel}
          </button>
          <div className="flex items-center text-slate-400">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Previous week"
              title="View previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={isCurrentWeek}
              className={`p-1 rounded-md transition-colors ${
                isCurrentWeek
                  ? "opacity-30 cursor-not-allowed text-slate-300 dark:text-neutral-600"
                  : "hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer text-slate-600 dark:text-neutral-300"
              }`}
              aria-label="Next week"
              title={isCurrentWeek ? "Current week" : "View next week"}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 1: Daily Mood Selector ── */}
      <div className="bg-[#FAFBFD] dark:bg-[#121318] p-2.5 rounded-2xl border border-slate-100 dark:border-neutral-800">
        <div className="grid grid-cols-4 gap-2">
          {SELECTOR_MOODS.map((mType) => {
            const mood = MOODS[mType];
            const isSelected = displayMood === mType;
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
                      ? "ring-2 ring-[#15192B] dark:ring-white ring-offset-2 dark:ring-offset-[#18191F] shadow-xs"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {renderMoodSvg(mType, "w-full h-full drop-shadow-xs")}
                </div>

                {/* Pill Button Label */}
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

      {/* ── Section 2: Weekly Mood Calendar Row (Compact Single Row) ── */}
      <div className="space-y-1">
        {/* Weekday Labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[10px] sm:text-[11px] font-semibold text-[#8A92A6] dark:text-neutral-500 py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Dynamic 7-day Week Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekCells.map((cell: WeekCell) => {
            const cellMood = moodMap.get(cell.dateStr) || null;
            const hasMood = Boolean(cellMood);
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = cell.isToday;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDateStr(cell.dateStr);
                  if (cellMood) {
                    setActiveMood(cellMood);
                  }
                }}
                className={`relative h-8 sm:h-9 rounded-[10px] sm:rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? "ring-2 ring-[#15192B] dark:ring-white ring-offset-1 dark:ring-offset-[#18191F] z-10"
                    : isToday
                    ? "border-2 border-[#15192B] dark:border-white shadow-xs"
                    : "border border-transparent"
                } ${
                  hasMood
                    ? "hover:scale-105 active:scale-95"
                    : "bg-[#F8F9FD] dark:bg-[#121318] hover:bg-slate-100 dark:hover:bg-neutral-800"
                } ${cell.isFuture ? "opacity-40" : "opacity-100"}`}
                title={
                  isToday
                    ? `Today (${cell.dateStr}): ${cellMood || "No check-in"}`
                    : `${cell.dayName} ${cell.dayNumber} (${cell.dateStr}): ${cellMood || "No check-in"}`
                }
              >
                {hasMood ? (
                  <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 p-0.5">
                    {renderMoodSvg(cellMood, "w-full h-full")}
                  </div>
                ) : (
                  <span
                    className={`text-[11px] select-none ${
                      isToday
                        ? "font-black text-[#15192B] dark:text-white"
                        : "font-semibold text-slate-500 dark:text-neutral-400"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Weekly Mood Summary Card ── */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3 transition-all duration-300 ${
          currentSummary
            ? currentSummary.summaryBg
            : "bg-[#8AE6A2] text-[#15192B]"
        } shadow-xs`}
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-0.5 max-w-[240px]">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              Weekly Mood Summary
            </p>
            <h4 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              {currentSummary ? currentSummary.summaryTitle : "Happy"}
            </h4>
            <p className="text-[11px] opacity-90 line-clamp-1 font-medium">
              {currentSummary
                ? currentSummary.summaryMessage
                : "No check-ins yet for this week. Tap an emotion to record today!"}
            </p>
          </div>

          {/* Dynamic Mood Vector */}
          <div className="shrink-0 text-current opacity-95">
            {renderSummarySvg(displayMood)}
          </div>
        </div>
      </div>
    </div>
  );
}
