"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import AnimatedFlameMascot from "./AnimatedFlameMascot";

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

    // Indefinite hold: Modal NEVER closes automatically without user clicking Continue or Skip
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
          className={`w-full h-full min-h-[100dvh] lg:min-h-0 lg:h-auto lg:max-w-[400px] lg:min-h-[580px] lg:rounded-[36px] relative flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-700 ${
            phase === "face"
              ? "bg-[#FE851C]"
              : "bg-[#0d0702] border-0 lg:border lg:border-white/10"
          }`}
          style={
            phase === "flame"
              ? {
                  background:
                    "radial-gradient(ellipse at 50% 38%, rgba(255, 140, 30, 0.25) 0%, rgba(28, 14, 4, 0.96) 55%, #0a0501 100%)",
                }
              : undefined
          }
        >
          {/* ── Ambient Radial Warmth Glow behind Code Flame in Phase 2 ── */}
          {phase === "flame" && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
              style={{
                background:
                  "radial-gradient(circle at 50% 36%, rgba(255, 120, 0, 0.35) 0%, rgba(255, 75, 0, 0.12) 48%, transparent 70%)",
              }}
            />
          )}

          {/* ── TOP HEADER / SKIP (Clean header without streak badge) ── */}
          <div className="relative z-10 w-full flex items-center justify-end p-6 pt-10 sm:pt-6">
            <button
              type="button"
              onClick={onContinue}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                phase === "face"
                  ? "text-white/80 hover:text-white hover:bg-black/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              Skip
            </button>
          </div>

          {/* ── CENTER AREA: Morph from Image 1 (Cute Face) to Code Flame Mascot ── */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
            <AnimatePresence mode="wait">
              {phase === "face" ? (
                /* ── PHASE 1: Full Orange Screen with Adorable Kawaii Face ── */
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
                /* ── PHASE 2: Code Vector Flame Mascot with Streak Counter ── */
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
                    className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#e0914c] mb-1"
                  >
                    Keep it going
                  </motion.p>

                  {/* 100% Code-Driven Animated Flame Mascot */}
                  <div
                    className="relative flex items-center justify-center my-2 cursor-pointer"
                    onClick={() => {
                      setIsCelebrating(true);
                      setTimeout(() => setIsCelebrating(false), 1700);
                    }}
                    title="Tap to celebrate"
                  >
                    <AnimatedFlameMascot
                      size={210}
                      celebrating={isCelebrating}
                    />
                  </div>

                  {/* Streak Count & Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-3 space-y-1.5 w-full"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-8 h-8 text-[#FF7A00] fill-[#FF7A00] animate-bounce" />
                      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {streakDays} Day Streak!
                      </h2>
                    </div>

                    <p className="text-sm text-neutral-300 max-w-[280px] mx-auto leading-relaxed pt-1">
                      {streakDays === 1
                        ? "Great job checking in today! Build your habit by practicing daily."
                        : "You're on fire! Keep showing up to unlock higher badges and level up."}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── BOTTOM ACTION AREA: Pure White Button (Clean & High Contrast) ── */}
          <div className="relative z-10 w-full p-6 pb-10 sm:pb-6">
            <button
              type="button"
              onClick={onContinue}
              className={`w-full py-4 px-6 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                phase === "face"
                  ? "bg-white text-[#FE851C] hover:bg-white/95"
                  : "bg-white hover:bg-neutral-100 text-black shadow-white/10 active:bg-neutral-200"
              }`}
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
