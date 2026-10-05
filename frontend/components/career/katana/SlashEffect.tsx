"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
export type SlashState = "idle" | "slash" | "impact" | "wipe";

interface SlashEffectProps {
  state: SlashState;
}

export default function SlashEffect({ state }: SlashEffectProps) {
  const isSlashing = state === "slash" || state === "impact" || state === "wipe";
  const isImpact = state === "impact";

  if (!isSlashing) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* ── Impact White/Gold Optical Flash ── */}
      <AnimatePresence>
        {isImpact && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: [0.95, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Screen Shake & Chromatic Aberration Container ── */}
      <motion.div
        className="relative w-full h-full"
        animate={
          isImpact
            ? {
                x: [-12, 14, -8, 6, -3, 0],
                y: [-6, 7, -4, 3, -1, 0],
              }
            : {}
        }
        transition={{ duration: 0.2 }}
      >
        {/* ── Main Slash SVG Path (Cutting across screen at slight 14deg angle) ── */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 1920 1080"
        >
          <defs>
            {/* Supercharged Lightning Glow Filters */}
            <filter id="slash-outer-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="slash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="15%" stopColor="#FFFBEB" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="85%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="aura-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Wide Atmospheric Aura Wave */}
          <motion.path
            d="M -100 640 Q 960 520 2020 420"
            fill="none"
            stroke="url(#aura-grad)"
            strokeWidth="38"
            strokeLinecap="round"
            filter="url(#slash-outer-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.85, 0],
              strokeWidth: [8, 42, 2],
            }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* 2. Razor-Sharp Electric Core Beam */}
          <motion.path
            d="M -100 640 Q 960 520 2020 420"
            fill="none"
            stroke="url(#slash-grad)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#slash-outer-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 1, 0],
              strokeWidth: [2, 10, 0.5],
            }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* 3. Pure White Knife Edge (Instantaneous velocity line) */}
          <motion.path
            d="M -80 638 Q 960 520 2000 422"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="square"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* 4. Jagged Lightning Discharge Forks */}
          <motion.path
            d="M 450 560 L 520 530 L 590 565 L 660 525 L 750 545 M 1050 510 L 1120 480 L 1180 520 L 1280 470 L 1380 500"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="2.5"
            filter="url(#slash-outer-glow)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.7, 0],
              strokeWidth: [1, 3.5, 0.5],
            }}
            transition={{ duration: 0.16, delay: 0.04 }}
          />
        </svg>

        {/* ── Sliced Reality Curtain Wipe (Top & Bottom halves split open) ── */}
        <AnimatePresence>
          {state === "wipe" && (
            <div className="absolute inset-0 z-40">
              {/* Top Half peels up */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1/2 bg-black origin-top"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: "-105%", opacity: 0.9 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Bottom Half peels down */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/2 bg-black origin-bottom"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: "105%", opacity: 0.9 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
