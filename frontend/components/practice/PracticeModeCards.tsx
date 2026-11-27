"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";

interface PracticeModeCardsProps {
  onSelectMode: (mode: "beginner" | "company") => void;
  companiesCount?: number;
}

export function PracticeModeCards({
  onSelectMode,
  companiesCount = 662,
}: PracticeModeCardsProps) {
  const { canAccess } = useSubscription();
  const hasAccess = canAccess("company_interview_questions");

  return (
    <div className="pt-1 max-w-5xl mx-auto w-full">
      {/* ─────────────────────────────────────────────────────────────
          MOBILE COMPACT LIST CARDS (< sm): Colored dot label + slim rounded pill row
          Matching mobile reference layout strictly for Beginner & Company Questions
          ───────────────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-4">
        {/* Mobile Row 1: Beginner Coding Roadmap */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6A3FEA] shrink-0" />
            <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
              Beginner Track
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode("beginner")}
            className="w-full rounded-[18px] border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#10110E] hover:bg-slate-50 dark:hover:bg-[#161814] p-2.5 pr-4 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-[12px] bg-[#6A3FEA] shrink-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.15px, transparent 1.15px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Beginner Coding Roadmap
              </span>
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-neutral-400 shrink-0 tabular-nums">
              6 Tests
            </span>
          </button>
        </div>

        {/* Mobile Row 2: Company Questions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD] shrink-0" />
            <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
              Company Wise
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode("company")}
            className="w-full rounded-[18px] border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#10110E] hover:bg-slate-50 dark:hover:bg-[#161814] p-2.5 pr-4 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-[12px] bg-[#C4B5FD] shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Company Questions
                </span>
                {!hasAccess && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#C4B5FD]/20 text-[#C4B5FD] border border-[#C4B5FD]/30 text-[9px] font-black uppercase tracking-wider shrink-0">
                    PRO
                  </span>
                )}
              </div>
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-neutral-400 shrink-0 tabular-nums">
              {companiesCount || 662}+
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP / TABLET 2-TONE SPLIT CARDS (>= sm)
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-4 sm:gap-6 items-stretch justify-items-stretch w-full">
        {/* ─────────────────────────────────────────────────────────────
            CARD 1: BEGINNER CODING ROADMAP (2-Tone Vertical Split Card)
            Top: Electric Violet (#6A3FEA) with subtle dot grid | Bottom: Obsidian (#10110E)
            No borders, no bottom glow, clean icon-free typography
            ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onSelectMode("beginner")}
          className="rounded-[22px] sm:rounded-[26px] overflow-hidden transition-all duration-300 cursor-pointer group select-none flex flex-col justify-between w-full h-full hover:-translate-y-1.5"
        >
          {/* ── TOP SECTION: Electric Violet (#6A3FEA) ── */}
          <div
            className="bg-[#6A3FEA] p-5 sm:p-6 min-h-[115px] sm:min-h-[125px] flex flex-col justify-center transition-colors"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.25px, transparent 1.25px)",
              backgroundSize: "26px 26px",
            }}
          >
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug font-sans">
                Beginner Coding Roadmap
              </h2>
              <span className="inline-block text-[11px] sm:text-xs font-bold text-white/85 tracking-wide">
                Step-by-step logic &amp; problem solving
              </span>
            </div>
          </div>

          {/* ── BOTTOM SECTION: Obsidian (#10110E) ── */}
          <div className="bg-[#10110E] p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
            {/* Description */}
            <p className="text-xs sm:text-sm font-medium text-neutral-300 leading-relaxed">
              A structured learning roadmap for first-year students that builds fundamentals from zero coding to solving real interview problems.
            </p>

            {/* Footer Metadata & Action */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="text-xs font-bold text-neutral-300">
                <span>6 Tests</span>
              </div>

              <div className="text-xs font-black text-[#9B7BFF] group-hover:translate-x-1 transition-transform">
                <span>Practice &rarr;</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            CARD 2: COMPANY QUESTIONS (2-Tone Vertical Split Card)
            Top: Soft Pastel Lilac (#C4B5FD) | Bottom: Obsidian (#10110E)
            No borders, no bottom glow, clean icon-free typography
            ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          onClick={() => onSelectMode("company")}
          className="rounded-[22px] sm:rounded-[26px] overflow-hidden transition-all duration-300 cursor-pointer group select-none flex flex-col justify-between w-full h-full hover:-translate-y-1.5"
        >
          {/* ── TOP SECTION: Soft Pastel Lilac (#C4B5FD) ── */}
          <div className="bg-[#C4B5FD] p-5 sm:p-6 min-h-[115px] sm:min-h-[125px] flex flex-col justify-center transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#10110E] tracking-tight leading-snug font-sans">
                  Company Questions
                </h2>
                {!hasAccess && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#10110E] text-[#C4B5FD] text-[9px] font-black uppercase tracking-wider">
                    PRO
                  </span>
                )}
              </div>
              <span className="inline-block text-[11px] sm:text-xs font-bold text-[#10110E]/80 tracking-wide">
                Top tech firms &amp; real frequencies
              </span>
            </div>
          </div>

          {/* ── BOTTOM SECTION: Obsidian (#10110E) ── */}
          <div className="bg-[#10110E] p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
            {/* Description */}
            <p className="text-xs sm:text-sm font-medium text-neutral-300 leading-relaxed">
              Practice curated tests and real company questions asked in top tech firms to sharpen your interview readiness.
            </p>

            {/* Footer Metadata & Action */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="text-xs font-bold text-neutral-300">
                <span>{companiesCount || 662}+ Tech Firms</span>
              </div>

              <div className="text-xs font-black text-[#C4B5FD] group-hover:translate-x-1 transition-transform">
                <span>Practice &rarr;</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PracticeModeCards;
