"use client";

import React, { useMemo } from "react";
import { formatCompanyName } from "@/lib/practice/practiceHelpers";
import GlareHover from "./GlareHover";

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
    <GlareHover
      glareColor="#ffffff"
      glareOpacity={0.25}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      playOnce={false}
      borderRadius="24px"
      background="#0C0B14"
      className="w-full rounded-2xl sm:rounded-[24px] border border-purple-500/20 shadow-[0_16px_45px_rgba(0,0,0,0.5),0_0_50px_rgba(168,85,247,0.06)]"
    >
      <div className="relative w-full p-5 sm:p-6 md:p-7 select-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-16 left-12 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 right-16 w-64 h-64 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Left Column: Track Info */}
        <div className="relative z-10 flex-1 space-y-2 max-w-xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#24173D] border border-purple-500/35 text-[#D8B4FE] shadow-xs">
            <span>Practice Track</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {formatCompanyName(company)}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            Real interview questions asked by top tech firms. Check off questions to track your live progress.
          </p>
        </div>

        {/* Right Column: YOUR PROGRESS Box (Exact match with Image 2) */}
        <div className="relative z-10 w-full sm:w-[310px] md:w-[320px] shrink-0 bg-[#131222]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
          {/* Box Header */}
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-3.5 pb-2 border-b border-white/5 flex items-center justify-between">
            <span>YOUR PROGRESS</span>
            {progressPercent === 100 && (
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
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-black text-white leading-none">
                  {progressPercent}%
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
    </GlareHover>
  );
}

