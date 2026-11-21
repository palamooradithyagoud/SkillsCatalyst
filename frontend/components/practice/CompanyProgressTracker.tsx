"use client";

import React, { useMemo } from "react";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";
import GlowCursor from "./GlowCursor";

interface CompanyProgressTrackerProps {
  company: string;
  solvedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function CompanyProgressTracker({
  company,
  solvedCount,
  totalCount,
  progressPercent,
}: CompanyProgressTrackerProps) {
  // Compute attempted & accuracy
  const attemptedCount = solvedCount;
  const accuracy = useMemo(() => {
    if (!attemptedCount) return "0.00";
    return "100.00";
  }, [attemptedCount]);

  // SVG Circular Gauge parameters matching Image 2
  const size = 76;
  const strokeWidth = 6.5;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative w-full rounded-2xl sm:rounded-[24px] border border-slate-200/90 dark:border-[#24271F] overflow-hidden bg-white dark:bg-[#18191F] shadow-none">
      <GlowCursor
        color="#D5FF38"
        secondaryColor="#24271F"
        trailLength={40}
        trailWidth={8}
        trailTaper={0.8}
        followSpeed={0.16}
        glowIntensity={1.2}
        glowSpread={1.0}
        hotspot={0.5}
        brightness={1.0}
        opacity={0.7}
        pulseSpeed={1.0}
        noiseStrength={0.02}
        idleFade
        idleTimeout={700}
        fadeDuration={900}
        blendMode="screen"
        className="w-full"
      >
        <div className="relative w-full p-5 sm:p-6 md:p-7 select-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Track Info */}
        <div className="relative z-10 flex-1 space-y-2 max-w-xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] text-slate-800 dark:text-[#D5FF38] shadow-none">
            <span>Practice Track</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {formatCompanyName(company)}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Real interview questions asked by top tech firms. Check off questions to track your live progress.
          </p>
        </div>

        {/* Right Column: YOUR PROGRESS Box (Exact match with Image 2) */}
        <div className="relative z-10 w-full sm:w-[310px] md:w-[320px] shrink-0 bg-slate-50 dark:bg-[#121318] border border-slate-200 dark:border-[#24271F] rounded-2xl p-4 sm:p-5 shadow-none">
          {/* Box Header */}
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-3.5 pb-2 border-b border-[#24271F] flex items-center justify-between">
            <span>YOUR PROGRESS</span>
            {progressPercent === 100 && (
              <span className="text-[10px] font-bold text-black bg-[#D5FF38] px-2 py-0.5 rounded-full border border-[#D5FF38]">
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
                  stroke="#24271F"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#companyProgressGaugeGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="companyProgressGaugeGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#D5FF38" />
                    <stop offset="100%" stopColor="#B4E61F" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-black text-white leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[9px] text-[#D5FF38] font-bold mt-1 leading-none">
                  Complete
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Solved</span>
                <span className="font-bold text-white tabular-nums">
                  {solvedCount} / {totalCount}
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
    </GlowCursor>
  </div>
);
}

