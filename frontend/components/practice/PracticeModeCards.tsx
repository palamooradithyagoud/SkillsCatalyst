"use client";

import React from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Filter,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";
import { CompanyCardsIllustration } from "./CompanyCardsIllustration";

interface PracticeModeCardsProps {
  onSelectMode: (mode: "beginner" | "company") => void;
  companiesCount?: number;
}

export function PracticeModeCards({
  onSelectMode,
  companiesCount = 660,
}: PracticeModeCardsProps) {
  const { canAccess } = useSubscription();
  const hasAccess = canAccess("company_interview_questions");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
      {/* ─────────────────────────────────────────────────────────────
          CARD 1: BEGINNER LEVEL (IMAGE 2 REDESIGN - PURE VECTOR & CODE)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelectMode("beginner")}
        className="relative rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 bg-gradient-to-r from-[#14072f] via-[#1e0a44] to-[#2d0e65] border border-purple-500/25 shadow-[0_8px_24px_rgba(20,7,47,0.35),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_14px_32px_rgba(124,58,237,0.3)] hover:border-purple-400/40 transition-all duration-300 cursor-pointer overflow-hidden group select-none flex flex-col justify-between h-full min-h-[220px]"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-8 w-56 h-56 bg-[#7C3AED]/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-[#4F46E5]/18 blur-3xl rounded-full pointer-events-none" />

        {/* Ambient Curved Light Swoosh Arc (Pure SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 500 240"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -20 30 C 120 60, 240 20, 360 100 C 420 140, 480 170, 520 220"
            stroke="url(#beginnerSwoosh1)"
            strokeWidth="1.5"
          />
          <path
            d="M 80 -10 C 200 40, 320 90, 420 160 C 460 190, 490 220, 530 250"
            stroke="url(#beginnerSwoosh2)"
            strokeWidth="1.2"
          />
          <defs>
            <linearGradient id="beginnerSwoosh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
              <stop offset="40%" stopColor="#C084FC" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#818CF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beginnerSwoosh2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4 my-auto">
          {/* Left Details */}
          <div className="flex-1 space-y-2.5 sm:space-y-3 min-w-0">
            {/* Top Pill: Beginner Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              {/* 3-Bar Signal / Level Icon */}
              <svg
                className="w-3.5 h-3.5 text-purple-300"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="2" y="9.5" width="2.5" height="4.5" rx="1.2" />
                <rect x="6.5" y="6" width="2.5" height="8" rx="1.2" />
                <rect x="11" y="2.5" width="2.5" height="11.5" rx="1.2" />
              </svg>
              <span className="text-white text-xs sm:text-[13px] font-semibold tracking-wide">
                Beginner
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg sm:text-xl lg:text-[22px] font-black text-white tracking-tight leading-tight group-hover:text-purple-200 transition-colors">
                Beginner Coding Roadmap
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-medium text-purple-200/90 leading-snug">
              From zero coding to solving real problems.
            </p>

            {/* Steps: 1 Learn — 2 Practice — 3 Solve */}
            <div className="flex items-center flex-wrap gap-2 pt-1 sm:pt-1.5">
              {/* Step 1 */}
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_2px_6px_rgba(124,58,237,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)] flex items-center justify-center text-white text-[10px] sm:text-[11px] font-black">
                  1
                </div>
                <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
                  Learn
                </span>
              </div>

              {/* Connecting Line */}
              <div className="w-3 sm:w-4.5 h-[1.5px] bg-purple-400/35 rounded-full" />

              {/* Step 2 */}
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_2px_6px_rgba(124,58,237,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)] flex items-center justify-center text-white text-[10px] sm:text-[11px] font-black">
                  2
                </div>
                <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
                  Practice
                </span>
              </div>

              {/* Connecting Line */}
              <div className="w-3 sm:w-4.5 h-[1.5px] bg-purple-400/35 rounded-full" />

              {/* Step 3 */}
              <div className="flex items-center gap-1.5">
                <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_2px_6px_rgba(124,58,237,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)] flex items-center justify-center text-white text-[10px] sm:text-[11px] font-black">
                  3
                </div>
                <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
                  Solve
                </span>
              </div>
            </div>
          </div>

          {/* Right: Pure Code Vector 3D Code Window + Floating Squircle */}
          <div className="shrink-0 flex items-center justify-center relative pt-2">
            {/* Floating < / > Code Badge */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              className="absolute -top-3 sm:-top-3.5 right-1 sm:right-1.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-0.5 shadow-[0_8px_18px_rgba(99,102,241,0.5),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-white/30 backdrop-blur-md flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="7 8 3 12 7 16" />
                <line x1="14" y1="5" x2="10" y2="19" />
                <polyline points="17 8 21 12 17 16" />
              </svg>
            </motion.div>

            {/* 3D Tilted Code Window */}
            <div
              style={{
                transform: "perspective(600px) rotateY(-13deg) rotateX(7deg) rotateZ(1deg)",
                transformStyle: "preserve-3d",
              }}
              className="w-[125px] sm:w-[145px] md:w-[160px] h-[115px] sm:h-[130px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#130f26] via-[#0d0919] to-[#080512] border border-purple-500/30 shadow-[0_14px_30px_rgba(0,0,0,0.7),0_0_24px_rgba(124,58,237,0.22)] p-2.5 flex flex-col justify-between overflow-hidden"
            >
              {/* macOS Window Controls */}
              <div className="flex items-center gap-1.5 pb-1 border-b border-purple-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              </div>

              {/* Code Lines Placeholder */}
              <div className="space-y-1.5 pt-1 flex-1">
                {/* Line 1 */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-12 sm:w-16 h-1.5 rounded-full bg-purple-300/25" />
                </div>

                {/* Line 2 */}
                <div className="flex items-center gap-1.5 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-18 sm:w-22 h-1.5 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 3 — Glowing Neon Violet Accent Line */}
                <div className="flex items-center gap-1.5 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 shrink-0" />
                  <div className="w-16 sm:w-20 h-2 rounded-full bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-[#F472B6] shadow-[0_0_8px_rgba(192,132,252,0.95)]" />
                </div>

                {/* Line 4 */}
                <div className="flex items-center gap-1.5 pl-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/25 shrink-0" />
                  <div className="w-14 sm:w-18 h-1.5 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 5 */}
                <div className="flex items-center gap-1.5 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-10 sm:w-12 h-1.5 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 6 */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/30 shrink-0" />
                  <div className="w-8 h-1.5 rounded-full bg-purple-300/25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: COMPANY WISE QUESTIONS (COMPACT, PURE CODE & BUTTON)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        onClick={() => onSelectMode("company")}
        className="relative rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-[#F8FAFF] via-[#EEF4FF] to-[#E5EDFD] border border-[#D5E2F9] shadow-[0_8px_24px_rgba(37,99,235,0.06),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_14px_32px_rgba(37,99,235,0.12)] hover:border-[#BFDBFE] transition-all duration-300 cursor-pointer overflow-hidden group select-none flex flex-col justify-between h-full"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-300/20 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Main Content & 3D Illustration Area */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Details */}
            <div className="flex-1 space-y-2.5 min-w-0">
              {/* Squircle Briefcase Icon & Badges */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DBEAFE] via-[#BFDBFE] to-[#93C5FD] shadow-[0_4px_10px_rgba(37,99,235,0.18),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(29,78,216,0.25)] border border-white/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4 text-blue-700" />
                </div>
                <div className="flex items-center gap-1">
                  {!hasAccess && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase tracking-wider shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                      <span>PREMIUM</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-blue-700 text-[9px] font-black tracking-widest uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-[#BFDBFE]">
                    INTERVIEW PREP
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                  2. Company Questions
                </h2>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>{companiesCount || 660}+ Tech Firms</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Filter className="w-3 h-3 text-indigo-500" />
                  <span>30-Day &amp; All-Time</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Real Frequencies</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200/80 text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Live Solved Tracker</span>
                </div>
              </div>
            </div>

            {/* Right: Pure Code Vector 3D Terminal with Animated Badges */}
            <div className="shrink-0 flex items-center justify-center">
              <CompanyCardsIllustration />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Practice Button Only (Total Metrics Removed) */}
        <div className="relative z-10 mt-3.5 pt-3 border-t border-blue-200/60 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("company");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-[0_4px_12px_rgba(37,99,235,0.28)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer active:scale-95 group/btn"
          >
            <span>Practice</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </button>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition-all">
            <span>Question Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
