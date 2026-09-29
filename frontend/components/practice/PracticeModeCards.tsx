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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5 pt-1 max-w-5xl mx-auto items-stretch justify-items-center">
      {/* ─────────────────────────────────────────────────────────────
          CARD 1: BEGINNER LEVEL (COMPACT LENGTH & SIZE)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelectMode("beginner")}
        className="relative rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4 bg-gradient-to-r from-[#14072f] via-[#1e0a44] to-[#2d0e65] border border-purple-500/25 shadow-[0_6px_20px_rgba(20,7,47,0.3)] hover:shadow-[0_10px_26px_rgba(124,58,237,0.28)] hover:border-purple-400/40 transition-all duration-300 cursor-pointer overflow-hidden group select-none flex flex-col justify-between w-full max-w-[460px] h-full"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-8 -right-4 w-36 h-36 bg-[#7C3AED]/20 blur-xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-[#4F46E5]/15 blur-xl rounded-full pointer-events-none" />

        {/* Ambient Curved Light Swoosh Arc (Pure SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
          viewBox="0 0 500 240"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -20 30 C 120 60, 240 20, 360 100 C 420 140, 480 170, 520 220"
            stroke="url(#beginnerSwooshSmall1)"
            strokeWidth="1.2"
          />
          <path
            d="M 80 -10 C 200 40, 320 90, 420 160 C 460 190, 490 220, 530 250"
            stroke="url(#beginnerSwooshSmall2)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="beginnerSwooshSmall1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
              <stop offset="40%" stopColor="#C084FC" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#818CF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beginnerSwooshSmall2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Left Details */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Top Pill: Beginner Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
              {/* 3-Bar Signal / Level Icon */}
              <svg
                className="w-3 h-3 text-purple-300"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="2" y="9.5" width="2.5" height="4.5" rx="1.2" />
                <rect x="6.5" y="6" width="2.5" height="8" rx="1.2" />
                <rect x="11" y="2.5" width="2.5" height="11.5" rx="1.2" />
              </svg>
              <span className="text-white text-[10px] sm:text-[11px] font-semibold tracking-wide">
                Beginner
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors">
                Beginner Coding Roadmap
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-[10px] sm:text-[11px] font-medium text-purple-200/85 leading-tight">
              From zero coding to solving real problems.
            </p>

            {/* Steps: 1 Learn — 2 Practice — 3 Solve */}
            <div className="flex items-center gap-1.5 pt-1">
              {/* Step 1 */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_1px_3px_rgba(124,58,237,0.5)] flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">
                  1
                </div>
                <span className="text-white text-[11px] sm:text-xs font-bold tracking-tight">
                  Learn
                </span>
              </div>

              {/* Connecting Line */}
              <div className="w-2.5 sm:w-3.5 h-[1px] bg-purple-400/40 rounded-full shrink-0" />

              {/* Step 2 */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_1px_3px_rgba(124,58,237,0.5)] flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">
                  2
                </div>
                <span className="text-white text-[11px] sm:text-xs font-bold tracking-tight">
                  Practice
                </span>
              </div>

              {/* Connecting Line */}
              <div className="w-2.5 sm:w-3.5 h-[1px] bg-purple-400/40 rounded-full shrink-0" />

              {/* Step 3 */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_1px_3px_rgba(124,58,237,0.5)] flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">
                  3
                </div>
                <span className="text-white text-[11px] sm:text-xs font-bold tracking-tight">
                  Solve
                </span>
              </div>
            </div>
          </div>

          {/* Right: Pure Code Vector 3D Code Window + Floating Squircle */}
          <div className="shrink-0 flex items-center justify-center relative pt-1">
            {/* Floating < / > Code Badge */}
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              className="absolute -top-2 right-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-[9px] sm:rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-0.5 shadow-[0_4px_12px_rgba(99,102,241,0.45)] border border-white/30 backdrop-blur-md flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white drop-shadow-sm"
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
                transform: "perspective(500px) rotateY(-13deg) rotateX(7deg) rotateZ(1deg)",
                transformStyle: "preserve-3d",
              }}
              className="w-[105px] sm:w-[118px] md:w-[128px] h-[85px] sm:h-[94px] rounded-xl bg-gradient-to-b from-[#130f26] via-[#0d0919] to-[#080512] border border-purple-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.65),0_0_16px_rgba(124,58,237,0.2)] p-2 flex flex-col justify-between overflow-hidden"
            >
              {/* macOS Window Controls */}
              <div className="flex items-center gap-1 pb-0.5 border-b border-purple-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              </div>

              {/* Code Lines Placeholder */}
              <div className="space-y-1 pt-0.5 flex-1">
                {/* Line 1 */}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-9 sm:w-12 h-1 rounded-full bg-purple-300/25" />
                </div>

                {/* Line 2 */}
                <div className="flex items-center gap-1 pl-1.5">
                  <div className="w-1 h-1 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-13 sm:w-16 h-1 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 3 — Glowing Neon Violet Accent Line */}
                <div className="flex items-center gap-1 pl-1.5">
                  <div className="w-1 h-1 rounded-full bg-purple-400/60 shrink-0" />
                  <div className="w-12 sm:w-15 h-1 rounded-full bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-[#F472B6] shadow-[0_0_6px_rgba(192,132,252,0.95)]" />
                </div>

                {/* Line 4 */}
                <div className="flex items-center gap-1 pl-2.5">
                  <div className="w-1 h-1 rounded-full bg-purple-400/25 shrink-0" />
                  <div className="w-10 sm:w-13 h-1 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 5 */}
                <div className="flex items-center gap-1 pl-1.5">
                  <div className="w-1 h-1 rounded-full bg-purple-400/35 shrink-0" />
                  <div className="w-8 sm:w-10 h-1 rounded-full bg-purple-300/20" />
                </div>

                {/* Line 6 */}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-purple-400/30 shrink-0" />
                  <div className="w-6 h-1 rounded-full bg-purple-300/25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Practice Button & Core Concepts */}
        <div className="relative z-10 mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("beginner");
            }}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-[10px] sm:text-[11px] transition-all shadow-[0_3px_10px_rgba(109,40,217,0.35)] flex items-center gap-1.5 cursor-pointer active:scale-95 group/btn"
          >
            <span>Practice</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
          </button>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-purple-300 group-hover:translate-x-0.5 transition-all">
            <span>Core Concepts</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: COMPANY WISE QUESTIONS (IMAGE REDESIGN - MATCHES CARD 1)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        onClick={() => onSelectMode("company")}
        className="relative rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4 bg-gradient-to-r from-[#14072f] via-[#1e0a44] to-[#2d0e65] border border-purple-500/25 shadow-[0_6px_20px_rgba(20,7,47,0.3)] hover:shadow-[0_10px_26px_rgba(124,58,237,0.28)] hover:border-purple-400/40 transition-all duration-300 cursor-pointer overflow-hidden group select-none flex flex-col justify-between w-full max-w-[460px] h-full"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-8 -right-4 w-36 h-36 bg-[#7C3AED]/20 blur-xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-[#4F46E5]/15 blur-xl rounded-full pointer-events-none" />

        {/* Ambient Curved Light Swoosh Arc (Pure SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
          viewBox="0 0 500 240"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -20 30 C 120 60, 240 20, 360 100 C 420 140, 480 170, 520 220"
            stroke="url(#companySwoosh1)"
            strokeWidth="1.2"
          />
          <path
            d="M 80 -10 C 200 40, 320 90, 420 160 C 460 190, 490 220, 530 250"
            stroke="url(#companySwoosh2)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="companySwoosh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
              <stop offset="40%" stopColor="#C084FC" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#818CF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="companySwoosh2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Left Details */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Top Row: Squircle Briefcase & Badges */}
            <div className="flex items-center gap-1.5">
              <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[9px] bg-[#2b1754]/80 border border-purple-500/35 shadow-[0_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center shrink-0">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-purple-200 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                INTERVIEW PREP
              </span>
              {!hasAccess && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[8px] font-black uppercase tracking-wider">
                  <Lock className="w-2 h-2 text-amber-400" />
                  <span>PRO</span>
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                <span className="text-purple-400">2. </span>
                <span className="text-white group-hover:text-purple-200 transition-colors">Company Questions</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-[10px] sm:text-[11px] font-medium text-purple-200/85 leading-tight">
              Practice real company questions asked in top tech firms.
            </p>

            {/* 2x2 Feature Pills */}
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[9px] sm:text-[10px] font-semibold">
                <Building2 className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                <span className="truncate">{companiesCount || 662}+ Tech Firms</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[9px] sm:text-[10px] font-semibold">
                <Filter className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                <span className="truncate">30-Day &amp; All-Time</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[9px] sm:text-[10px] font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-pink-300 shrink-0" />
                <span className="truncate">Real Frequencies</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[9px] sm:text-[10px] font-semibold">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">Live Solved Tracker</span>
              </div>
            </div>
          </div>

          {/* Right: Vector 3D Laptop with Floating Company Badges */}
          <div className="shrink-0 flex items-center justify-center pt-1">
            <CompanyCardsIllustration />
          </div>
        </div>

        {/* Bottom Bar: Practice Button & Question Bank */}
        <div className="relative z-10 mt-2 pt-2 border-t border-purple-500/20 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("company");
            }}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-[10px] sm:text-[11px] transition-all shadow-[0_3px_10px_rgba(109,40,217,0.35)] flex items-center gap-1.5 cursor-pointer active:scale-95 group/btn"
          >
            <span>Practice</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
          </button>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-purple-300 group-hover:translate-x-0.5 transition-all">
            <span>Question Bank</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
