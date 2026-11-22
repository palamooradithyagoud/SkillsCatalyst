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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1 max-w-5xl mx-auto items-stretch justify-items-stretch w-full">
      {/* ─────────────────────────────────────────────────────────────
          CARD 1: BEGINNER CODING ROADMAP (2-Tone Vertical Split Card)
          Top: Muted Sage (#A7B77A) | Bottom: Obsidian (#10110E)
          No borders, no bottom glow, clean icon-free typography
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelectMode("beginner")}
        className="rounded-[22px] sm:rounded-[26px] overflow-hidden transition-all duration-300 cursor-pointer group select-none flex flex-col justify-between w-full h-full hover:-translate-y-1.5"
      >
        {/* ── TOP SECTION: Muted Sage (#A7B77A) ── */}
        <div className="bg-[#A7B77A] p-5 sm:p-6 min-h-[115px] sm:min-h-[125px] flex flex-col justify-center transition-colors">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#10110E] tracking-tight leading-snug font-sans">
              Beginner Coding Roadmap
            </h2>
            <span className="inline-block text-[11px] sm:text-xs font-bold text-[#10110E]/80 tracking-wide">
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

            <div className="text-xs font-black text-[#A7B77A] group-hover:translate-x-1 transition-transform">
              <span>Practice &rarr;</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          CARD 2: COMPANY QUESTIONS (2-Tone Vertical Split Card)
          Top: Muted Sage (#A7B77A) | Bottom: Obsidian (#10110E)
          No borders, no bottom glow, clean icon-free typography
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        onClick={() => onSelectMode("company")}
        className="rounded-[22px] sm:rounded-[26px] overflow-hidden transition-all duration-300 cursor-pointer group select-none flex flex-col justify-between w-full h-full hover:-translate-y-1.5"
      >
        {/* ── TOP SECTION: Muted Sage (#A7B77A) ── */}
        <div className="bg-[#A7B77A] p-5 sm:p-6 min-h-[115px] sm:min-h-[125px] flex flex-col justify-center transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#10110E] tracking-tight leading-snug font-sans">
                Company Questions
              </h2>
              {!hasAccess && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#10110E] text-[#A7B77A] text-[9px] font-black uppercase tracking-wider">
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

            <div className="text-xs font-black text-[#A7B77A] group-hover:translate-x-1 transition-transform">
              <span>Practice &rarr;</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PracticeModeCards;
