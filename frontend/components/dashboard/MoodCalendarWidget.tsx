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
    color: "#7844E3",
    bgHex: "#EFE7FD",
    summaryTitle: "Happy",
    summaryMessage: "You're feeling calm and optimistic. Keep up the good vibes!",
    summaryBg: "bg-[#D8F353] text-[#15192B]",
  },
  angry: {
    id: "angry",
    label: "Angry",
    color: "#F88A58",
    bgHex: "#FFE4D6",
    summaryTitle: "Frustrated",
    summaryMessage: "Take a deep breath and give yourself a break. You've got this!",
    summaryBg: "bg-[#F88A58] text-[#15192B] dark:bg-[#FFA07A]",
  },
  sleepy: {
    id: "sleepy",
    label: "Sleepy",
    color: "#88B7FA",
    bgHex: "#E1EEFE",
    summaryTitle: "Sleepy",
    summaryMessage: "Recharge your mind with good sleep. Tomorrow is a fresh start!",
    summaryBg: "bg-[#88B7FA] text-[#15192B]",
  },
  bored: {
    id: "bored",
    label: "Bored",
    color: "#E8A0E8",
    bgHex: "#FBE6FB",
    summaryTitle: "Uninspired",
    summaryMessage: "Try exploring something new today or taking a quick walk outside!",
    summaryBg: "bg-[#E8A0E8] text-[#15192B]",
  },
  calm: {
    id: "calm",
    label: "Calm",
    color: "#FFE785",
    bgHex: "#FFF7D4",
    summaryTitle: "Calm & Centered",
    summaryMessage: "Steady progress and peaceful focus. Keep up the gentle rhythm!",
    summaryBg: "bg-[#FDE278] text-[#15192B] dark:bg-[#FFE785]",
  },
  wacky: {
    id: "wacky",
    label: "Energetic",
    color: "#D6BAFF",
    bgHex: "#EDE0FF",
    summaryTitle: "Energetic",
    summaryMessage: "High momentum and curiosity driving your creative breakthroughs!",
    summaryBg: "bg-[#C6A4F9] text-[#15192B] dark:bg-[#D6BAFF]",
  },
  pouty: {
    id: "pouty",
    label: "Tired",
    color: "#FFA8A8",
    bgHex: "#FFE4E4",
    summaryTitle: "A Bit Low",
    summaryMessage: "Be kind to yourself today. Small steps still count as progress.",
    summaryBg: "bg-[#F68F8F] text-[#15192B] dark:bg-[#FFA8A8]",
  },
};

// ── SVG Face Vector Renderers (Authentic Image 2 & 3 Art) ──
export function HappyFaceSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="48" fill="#D8F353" />
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

const MOOD_ACTIVE_CLASSES: Record<MoodType, string> = {
  happy: "bg-[#D8F353] text-[#15192B]",
  angry: "bg-[#F88A58] text-[#15192B] dark:bg-[#FFA07A]",
  sleepy: "bg-[#88B7FA] text-[#15192B]",
  bored: "bg-[#E8A0E8] text-[#15192B]",
  calm: "bg-[#FDE278] text-[#15192B] dark:bg-[#FFE785]",
  wacky: "bg-[#C6A4F9] text-[#15192B] dark:bg-[#D6BAFF]",
  pouty: "bg-[#F68F8F] text-[#15192B] dark:bg-[#FFA8A8]",
};

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

  // Dynamic Month & Year Header (matching "March 2026" from reference)
  const monthHeaderLabel = useMemo(() => {
    if (weekCells.length < 7) return "";
    const first = weekCells[0].date;
    const last = weekCells[6].date;
    const sameYear = first.getFullYear() === last.getFullYear();
    const sameMonth = first.getMonth() === last.getMonth();

    if (sameMonth && sameYear) {
      return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(first);
    } else if (sameYear) {
      const m1 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(first);
      const m2 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(last);
      return `${m1} / ${m2} ${first.getFullYear()}`;
    } else {
      const m1 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(first);
      const m2 = new Intl.DateTimeFormat("en-US", { month: "short" }).format(last);
      return `${m1} ${first.getFullYear()} / ${m2} ${last.getFullYear()}`;
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

  // Selected day column index (0 to 6, defaults to 0 if outside week)
  const selectedColIndex = useMemo(() => {
    const idx = weekCells.findIndex((c) => c.dateStr === selectedDateStr);
    return idx >= 0 ? idx : 0;
  }, [weekCells, selectedDateStr]);

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
    <div className="w-full bg-white dark:bg-[#18191E] rounded-[22px] border border-[#E8DFF8] dark:border-white/10 shadow-[0_8px_30px_rgba(120,68,227,0.06)] dark:shadow-lg p-3 sm:p-3.5 space-y-2.5 transition-all text-[#221738] dark:text-white">
      {/* ── Header: Month Title & Peanut Pill Navigation ── */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={handleJumpToToday}
            className="text-left group cursor-pointer focus:outline-none"
            title={!isCurrentWeek ? "Click to return to today" : undefined}
          >
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#221738] dark:text-white group-hover:text-[#7844E3] dark:group-hover:text-[#D8F353] transition-colors leading-tight">
                {monthHeaderLabel}
              </h3>
              {!isCurrentWeek && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F3ECFF] text-[#7844E3] group-hover:bg-[#7844E3] group-hover:text-white dark:bg-white/15 dark:text-white dark:group-hover:bg-[#D8F353] dark:group-hover:text-black transition-all">
                  Today
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#756A8F] dark:text-neutral-400 font-medium leading-tight">
              Daily check-in for <span className="font-semibold text-[#7844E3] dark:text-[#D8F353]">{selectedDateLabel}</span>
            </p>
          </button>
        </div>

        {/* ── Top-Right Peanut Pill Navigation ── */}
        <div className="flex items-center bg-white dark:bg-white text-[#7844E3] dark:text-black rounded-full px-2 py-0.5 gap-1.5 shadow-xs border border-[#E6DEF7] dark:border-transparent shrink-0">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-0.5 rounded-full hover:bg-[#F3ECFF] dark:hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous week"
            title="View previous week"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            disabled={isCurrentWeek}
            className={`p-0.5 rounded-full transition-all ${
              isCurrentWeek
                ? "opacity-25 cursor-not-allowed text-[#B2A7D1] dark:text-neutral-400"
                : "hover:bg-[#F3ECFF] dark:hover:bg-neutral-200 active:scale-95 cursor-pointer text-[#7844E3] dark:text-black"
            }`}
            aria-label="Next week"
            title={isCurrentWeek ? "Current week" : "View next week"}
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ── Section 1: Daily Mood Selector ── */}
      <div className="bg-[#F8F4FF] dark:bg-[#202127] p-1.5 sm:p-2 rounded-xl border border-[#EDE4FC] dark:border-white/5">
        <div className="grid grid-cols-4 gap-1.5">
          {SELECTOR_MOODS.map((mType) => {
            const mood = MOODS[mType];
            const isSelected = displayMood === mType;
            return (
              <button
                key={mType}
                type="button"
                onClick={() => handleSelectMood(mType)}
                className="group flex flex-col items-center gap-1 transition-all cursor-pointer focus:outline-none"
                aria-label={`Select ${mood.label} mood for ${selectedDateLabel}`}
              >
                {/* Face Container */}
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform duration-150 group-hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "ring-2 ring-[#7844E3] dark:ring-white ring-offset-1 ring-offset-[#F8F4FF] dark:ring-offset-[#202127] shadow-xs scale-105"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {renderMoodSvg(mType, "w-full h-full drop-shadow-xs")}
                </div>

                {/* Pill Button Label */}
                <span
                  className={`w-full py-0.5 px-1 rounded-md text-center text-[9px] sm:text-[10px] font-bold transition-all leading-tight ${
                    isSelected
                      ? "bg-[#7844E3] text-white shadow-xs dark:bg-white dark:text-black"
                      : "bg-white text-[#564B74] border border-[#E9E0F8] hover:border-[#D6C5F3] hover:text-[#221738] dark:bg-white/10 dark:text-neutral-300 dark:border-white/5 dark:hover:bg-white/20 dark:hover:text-white"
                  }`}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Weekly Calendar Strip (Compact Single Row) ── */}
      <div className="space-y-1 pt-0.5">
        {/* Weekday Labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[10px] sm:text-[11px] font-semibold text-[#80759B] dark:text-neutral-400 py-0.5"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Dynamic 7-day Dates Row */}
        <div className="grid grid-cols-7 gap-1 text-center items-center">
          {weekCells.map((cell: WeekCell) => {
            const cellMood = moodMap.get(cell.dateStr) || null;
            const hasMood = Boolean(cellMood);
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = cell.isToday;

            return (
              <div key={cell.dateStr} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateStr(cell.dateStr);
                    if (cellMood) {
                      setActiveMood(cellMood);
                    }
                  }}
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? `${MOOD_ACTIVE_CLASSES[displayMood] || "bg-[#D8F353] text-[#15192B]"} font-black shadow-sm z-20`
                      : isToday
                      ? "ring-1.5 ring-[#7844E3] text-[#7844E3] font-bold bg-[#F4EEFF] dark:ring-white/60 dark:text-white dark:bg-white/5 hover:bg-[#ECE3FE] dark:hover:bg-white/15"
                      : "text-[#2A2045] dark:text-white font-medium hover:bg-[#F3EDFD] dark:hover:bg-white/10 text-xs sm:text-sm"
                  } ${hasMood && !isSelected ? "hover:scale-105" : ""} ${
                    cell.isFuture ? "opacity-35" : "opacity-100"
                  }`}
                  title={
                    isToday
                      ? `Today (${cell.dateStr}): ${cellMood || "No check-in"}`
                      : `${cell.dayName} ${cell.dayNumber} (${cell.dateStr}): ${cellMood || "No check-in"}`
                  }
                >
                  {hasMood && !isSelected ? (
                    <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 p-0.5">
                      {renderMoodSvg(cellMood, "w-full h-full")}
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm select-none leading-none">
                      {cell.dayNumber}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Weekly Mood Summary Card with Connected Notch Cutout ── */}
      <div
        className={`relative overflow-hidden rounded-[20px] p-3 sm:p-3.5 -mt-1.5 transition-all duration-300 border-0 ${
          currentSummary
            ? currentSummary.summaryBg
            : "bg-[#D8F353] text-[#15192B]"
        } shadow-xs`}
      >
        {/* Curved Scoop Notch aligned directly under the active day column */}
        {selectedColIndex >= 0 && (
          <svg
            viewBox="0 0 64 22"
            className="absolute -top-[2px] w-14 sm:w-16 h-4.5 sm:h-5 fill-white dark:fill-[#18191E] pointer-events-none transition-all duration-300 z-10"
            style={{
              left: `calc((100% / 7) * ${selectedColIndex} + (100% / 14))`,
              transform: "translateX(-50%)",
            }}
            aria-hidden="true"
          >
            <path d="M 0 0 L 0 2 C 14 2 18 21 32 21 C 46 21 50 2 64 2 L 64 0 Z" />
          </svg>
        )}

        <div className="relative z-10 flex items-center justify-between gap-2.5 pt-0.5">
          <div className="space-y-0.5 max-w-[260px]">
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider opacity-65 text-inherit">
              Weekly Mood Summary
            </p>
            <h4 className="text-base sm:text-lg font-black tracking-tight leading-tight text-inherit">
              {currentSummary ? currentSummary.summaryTitle : "Happy"}
            </h4>
            <p className="text-[10px] sm:text-[11px] font-medium opacity-85 text-inherit line-clamp-1 leading-tight">
              {currentSummary
                ? currentSummary.summaryMessage
                : "No check-ins yet for this week. Tap an emotion above to record today!"}
            </p>
          </div>

          {/* Minimalist Line Expression SVG */}
          <div className="shrink-0 text-current opacity-90 pr-0.5">
            {renderSummarySvg(displayMood, "w-12 sm:w-14 h-9 sm:h-10 text-current")}
          </div>
        </div>
      </div>
    </div>
  );
}
