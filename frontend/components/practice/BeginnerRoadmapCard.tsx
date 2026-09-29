"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ALL_BEGINNER_PROBLEM_IDS, TOTAL_BEGINNER_QUESTIONS } from "@/data/practice/dsaTreeData";
import { PixelSwap } from "./PixelSwap";

interface BeginnerRoadmapCardProps {
  drawerSolved?: Record<number, boolean>;
}

export function BeginnerRoadmapCard({
  drawerSolved = {},
}: BeginnerRoadmapCardProps) {
  // Compute true live progress for our beginner level questions (129 unique problems)
  const totalQuestions = TOTAL_BEGINNER_QUESTIONS;

  const solvedCount = useMemo(() => {
    return ALL_BEGINNER_PROBLEM_IDS.filter((id) => !!drawerSolved[id]).length;
  }, [drawerSolved]);

  const attemptedCount = solvedCount;

  const pct = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((solvedCount / totalQuestions) * 100);
  }, [solvedCount, totalQuestions]);

  const accuracy = useMemo(() => {
    if (!attemptedCount) return "0.00";
    return ((solvedCount / attemptedCount) * 100).toFixed(2);
  }, [solvedCount, attemptedCount]);

  // SVG Circular Gauge parameters
  const size = 80;
  const strokeWidth = 6.5;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  // ── First Content: Dark Mode Card (Default State) ──
  const darkCard = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-[26px] p-5 sm:p-7 md:p-8 bg-gradient-to-r from-[#0C0B14] via-[#100E1D] to-[#0A0912] border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(168,85,247,0.08)] overflow-hidden select-none flex flex-col justify-between">
      {/* Soft Ambient Glow */}
      <div className="absolute -top-16 left-12 w-72 h-72 bg-purple-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 right-16 w-72 h-72 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
        {/* Left Column: Roadmap Info */}
        <div className="flex-1 space-y-2.5 max-w-2xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#24173D] border border-purple-500/35 text-[#D8B4FE] shadow-xs">
            <span>Practice Track</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight pt-0.5">
            Beginner Coding Roadmap
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-[14px] font-medium text-zinc-300 leading-snug">
            From &ldquo;I Don&apos;t Know Coding&rdquo; &rarr; &ldquo;I Can Solve Real DSA Problems&rdquo;
          </p>

          {/* Hierarchy Description */}
          <p className="text-xs sm:text-[13px] text-zinc-400 font-normal leading-relaxed pt-0.5">
            This roadmap is the BEST structure for first-year students because it follows: Confidence &rarr; Logic &rarr; Practice &rarr; Pattern Recognition &rarr; Problem Solving &rarr; DSA Thinking
          </p>
        </div>

        {/* Right Column: YOUR PROGRESS Box */}
        <div className="w-full lg:w-[330px] shrink-0 bg-[#131222]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
          {/* Box Header */}
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-3.5 pb-2 border-b border-white/5 flex items-center justify-between">
            <span>YOUR PROGRESS</span>
            {pct === 100 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* Circular Progress Gauge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width={size} height={size} className="transform -rotate-90">
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#232136"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#progressGradientDark)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradientDark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-black text-white leading-none">
                  {pct}%
                </span>
                <span className="text-[9px] text-zinc-400 font-medium mt-1 leading-none">
                  Complete
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Solved</span>
                <span className="font-bold text-white tabular-nums">
                  {solvedCount} / {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Attempted</span>
                <span className="font-bold text-white tabular-nums">
                  {attemptedCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Accuracy</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Second Content: Crisp White Mode Card (Hover State via PixelSwap) ──
  const whiteCard = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-[26px] p-5 sm:p-7 md:p-8 bg-gradient-to-r from-white via-[#FCFAFF] to-white border border-purple-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_40px_rgba(147,51,234,0.06)] overflow-hidden select-none flex flex-col justify-between">
      {/* Soft Ambient Light Glow */}
      <div className="absolute -top-16 left-12 w-72 h-72 bg-purple-200/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 right-16 w-72 h-72 bg-fuchsia-200/30 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
        {/* Left Column: Roadmap Info */}
        <div className="flex-1 space-y-2.5 max-w-2xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/80 border border-purple-300/70 text-purple-800 shadow-xs">
            <span>Practice Track</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-zinc-950 tracking-tight leading-tight pt-0.5">
            Beginner Coding Roadmap
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-[14px] font-semibold text-zinc-700 leading-snug">
            From &ldquo;I Don&apos;t Know Coding&rdquo; &rarr; &ldquo;I Can Solve Real DSA Problems&rdquo;
          </p>

          {/* Hierarchy Description */}
          <p className="text-xs sm:text-[13px] text-zinc-500 font-normal leading-relaxed pt-0.5">
            This roadmap is the BEST structure for first-year students because it follows: Confidence &rarr; Logic &rarr; Practice &rarr; Pattern Recognition &rarr; Problem Solving &rarr; DSA Thinking
          </p>
        </div>

        {/* Right Column: YOUR PROGRESS Box */}
        <div className="w-full lg:w-[330px] shrink-0 bg-white/95 border border-purple-100/90 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-sm">
          {/* Box Header */}
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-3.5 pb-2 border-b border-zinc-100 flex items-center justify-between">
            <span>YOUR PROGRESS</span>
            {pct === 100 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* Circular Progress Gauge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width={size} height={size} className="transform -rotate-90">
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="#EDE9FE"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#progressGradientWhite)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradientWhite" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-black text-zinc-950 leading-none">
                  {pct}%
                </span>
                <span className="text-[9px] text-zinc-500 font-medium mt-1 leading-none">
                  Complete
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Solved</span>
                <span className="font-bold text-zinc-950 tabular-nums">
                  {solvedCount} / {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Attempted</span>
                <span className="font-bold text-zinc-950 tabular-nums">
                  {attemptedCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Accuracy</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <PixelSwap
        firstContent={darkCard}
        secondContent={whiteCard}
        pixelSize={48}
        gap={0}
        pixelRadius={0}
        pixelScale={0.15}
        pixelSpin={0}
        duration={750}
        pixelDuration={380}
        pattern="diagonal"
        randomness={0.05}
        easing="cubic-bezier(0.16, 1, 0.3, 1)"
        trigger="hover"
        aspectRatio="auto"
        className="w-full rounded-2xl sm:rounded-[26px] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(147,51,234,0.14)]"
      />
    </motion.div>
  );
}
