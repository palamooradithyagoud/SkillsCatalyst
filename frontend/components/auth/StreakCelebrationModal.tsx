"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Flame } from "lucide-react";
import AnimatedFlameMascot from "./AnimatedFlameMascot";

export interface WeeklyCalendarDay {
  label: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  isCompleted: boolean;
}

export interface WeeklyStreakCalendar {
  days: WeeklyCalendarDay[];
  streakStartCol: number;
  streakSpan: number;
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Builds the Monday-Sunday streak calendar strip for the week containing `referenceDate`. */
export function buildWeeklyStreakCalendar(
  streakDays: number,
  referenceDate: Date = new Date()
): WeeklyStreakCalendar {
  const safeStreak = Math.max(0, Math.floor(Number.isFinite(streakDays) ? streakDays : 0));
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const dayOfMonth = referenceDate.getDate();
  const todayIdx = (referenceDate.getDay() + 6) % 7;

  const days: WeeklyCalendarDay[] = WEEKDAY_LABELS.map((label, idx) => {
    const cellDate = new Date(year, month, dayOfMonth - todayIdx + idx);
    const isToday = idx === todayIdx;
    const isFuture = idx > todayIdx;
    const daysAgo = todayIdx - idx;
    const isCompleted = !isFuture && daysAgo < safeStreak;

    return {
      label,
      dayNumber: cellDate.getDate(),
      isToday,
      isFuture,
      isCompleted,
    };
  });

  if (safeStreak <= 0) {
    return { days, streakStartCol: todayIdx, streakSpan: 0 };
  }

  const streakStartCol = Math.max(0, todayIdx - (safeStreak - 1));
  const streakSpan = todayIdx - streakStartCol + 1;

  return { days, streakStartCol, streakSpan };
}

interface StreakCelebrationModalProps {
  streakDays: number;
  isOpen: boolean;
  onContinue: () => void;
}

export default function StreakCelebrationModal({
  streakDays,
  isOpen,
  onContinue,
}: StreakCelebrationModalProps) {
  // Phase 1: "face" (warm orange #FE851C face), Phase 2: "flame" (100% code animated flame mascot)
  const [phase, setPhase] = useState<"face" | "flame">("face");
  const [isBlinking, setIsBlinking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const weeklyCalendar = useMemo(
    () => buildWeeklyStreakCalendar(streakDays),
    [streakDays]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPhase("face");
      setIsBlinking(false);
      setIsCelebrating(false);
      return;
    }

    // 1. Cute blink during face phase
    const blinkTimer = setTimeout(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 600);

    // 2. Morph from Face to Code-Generated Flame Mascot at 1.4s
    const morphTimer = setTimeout(() => {
      setPhase("flame");
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 1700);
    }, 1400);

    // Indefinite hold: Modal stays open until the user clicks Continue
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(morphTimer);
    };
  }, [isOpen, onContinue]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {/* ── Responsive Backdrop: Edge-to-edge overlay with z-[99999] mounted to document.body ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-0 lg:p-6 bg-black/90 lg:backdrop-blur-md select-none overflow-hidden touch-none"
        style={{
          width: "100vw",
          height: "100dvh",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* ── Main Frame: Fullscreen on mobile, Centered Card on Laptop ── */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className={`w-full h-full min-h-[100dvh] lg:min-h-0 lg:h-auto lg:max-w-[400px] lg:min-h-[600px] lg:rounded-[36px] relative flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-700 ${
            phase === "face"
              ? "bg-[#FE851C]"
              : "bg-[#14171D] border-0 lg:border lg:border-white/[0.08]"
          }`}
        >
          {/* ── CENTER AREA: Morph from Phase 1 (Welcome Face) to Phase 2 (Dark Charcoal Flame + Calendar) ── */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 sm:pt-7 pb-4">
            <AnimatePresence mode="wait">
              {phase === "face" ? (
                /* ── PHASE 1: Warm Orange Welcome Back Splash ── */
                <motion.div
                  key="face-stage"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="flex items-center gap-6 sm:gap-7 my-2">
                    {/* Left Eye */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-md relative overflow-hidden">
                      <motion.div
                        animate={{
                          scaleY: isBlinking ? 0.1 : 1,
                        }}
                        transition={{ duration: 0.1 }}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black"
                      />
                    </div>

                    {/* Cute curved smile between eyes */}
                    <div className="flex items-center justify-center -mb-2">
                      <svg
                        width="30"
                        height="16"
                        viewBox="0 0 30 16"
                        fill="none"
                        className="overflow-visible"
                      >
                        <path
                          d="M 3,4 Q 15,16 27,4"
                          stroke="#111111"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Right Eye */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-md relative overflow-hidden">
                      <motion.div
                        animate={{
                          scaleY: isBlinking ? 0.1 : 1,
                        }}
                        transition={{ duration: 0.1 }}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black"
                      />
                    </div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 text-white text-base sm:text-lg font-bold tracking-tight"
                  >
                    Welcome back!
                  </motion.p>
                </motion.div>
              ) : (
                /* ── PHASE 2: Dark Charcoal Flame Mascot + Weekly Streak Calendar (Acid Lime & Dark Charcoal) ── */
                <motion.div
                  key="flame-stage"
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 18, stiffness: 260 }}
                  className="flex flex-col items-center justify-center text-center w-full"
                >
                  {/* Eyebrow Label */}
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#D5FF38] mb-1"
                  >
                    Keep it going
                  </motion.p>

                  {/* 100% Code-Driven Animated Flame Mascot */}
                  <div
                    className="relative flex items-center justify-center my-1 cursor-pointer"
                    onClick={() => {
                      setIsCelebrating(true);
                      setTimeout(() => setIsCelebrating(false), 1700);
                    }}
                    title="Tap to celebrate"
                  >
                    <AnimatedFlameMascot
                      size={175}
                      celebrating={isCelebrating}
                    />
                  </div>

                  {/* Streak Count & Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-2 space-y-1.5 w-full"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF7A00] fill-[#FF7A00] animate-bounce" />
                      <h2 className="text-3xl sm:text-[34px] font-black text-white tracking-tight">
                        {streakDays} Day Streak!
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-300 max-w-[280px] mx-auto leading-relaxed pt-0.5">
                      {streakDays === 1
                        ? "Great job checking in today! Build your habit by practicing daily."
                        : "You're on fire! Keep showing up to unlock higher badges and level up."}
                    </p>
                  </motion.div>

                  {/* ── Weekly Streak Calendar Card (Dark Charcoal + Acid Lime) ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="mt-5 w-full rounded-[22px] bg-[#1B1F27] border border-white/[0.08] px-3 py-3.5 sm:px-4 sm:py-4"
                  >
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 items-center text-center">
                      {weeklyCalendar.days.map((day, idx) => (
                        <span
                          key={`${day.label}-${idx}`}
                          className={`text-[11px] font-extrabold tracking-wide ${
                            day.isToday ? "text-white" : "text-neutral-400"
                          }`}
                        >
                          {day.label}
                        </span>
                      ))}
                    </div>

                    {/* Checkmarks / Date Circles with Connected Acid Lime Streak Capsule */}
                    <div className="relative mt-2.5 h-9 sm:h-10 grid grid-cols-7 items-center">
                      {weeklyCalendar.streakSpan >= 1 && (
                        <div
                          className="absolute inset-y-0 rounded-full bg-[#D5FF38]/15 border border-[#D5FF38]/20 pointer-events-none transition-all duration-300"
                          style={{
                            left: `${(weeklyCalendar.streakStartCol / 7) * 100}%`,
                            width: `${(weeklyCalendar.streakSpan / 7) * 100}%`,
                          }}
                        />
                      )}

                      {weeklyCalendar.days.map((day, idx) => (
                        <div
                          key={`${day.label}-${day.dayNumber}-${idx}`}
                          className="relative z-10 flex items-center justify-center"
                        >
                          {day.isToday && day.isCompleted ? (
                            <span
                              aria-label={`Today (${day.dayNumber}) completed`}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D5FF38] text-[#10110E] flex items-center justify-center shadow-[0_0_16px_rgba(213,255,56,0.28)]"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          ) : day.isCompleted ? (
                            <span
                              aria-label={`Day ${day.dayNumber} completed`}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-[#D5FF38] flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 stroke-[2.75]" />
                            </span>
                          ) : (
                            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#242833] text-neutral-300 text-xs font-bold flex items-center justify-center tabular-nums">
                              {day.dayNumber}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── BOTTOM ACTION AREA (Phase 2 Only): Acid Lime Continue Button keeping user here ── */}
          {phase === "flame" && (
            <div className="relative z-10 w-full px-6 pb-8 sm:pb-6 pt-2">
              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#D5FF38] hover:bg-[#c6f028] active:bg-[#b8e022] text-[#10110E] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#D5FF38]/15 active:scale-[0.98]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
