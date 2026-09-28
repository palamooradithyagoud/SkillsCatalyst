"use client";

import React from "react";
import {
  BookOpen,
  Layers,
  List,
  Clock,
  Lightbulb,
  Code2,
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
import { BeginnerLaptopIllustration } from "./BeginnerLaptopIllustration";
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
          CARD 1: BEGINNER LEVEL (COMPACT, PURE CODE & PRACTICE BUTTON)
          ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelectMode("beginner")}
        className="relative rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 bg-gradient-to-br from-[#FAF8FF] via-[#F4EFFE] to-[#EFE7FC] border border-[#E5DCF9] shadow-[0_8px_24px_rgba(118,60,241,0.06),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_14px_32px_rgba(118,60,241,0.12)] hover:border-[#D6C4F7] transition-all duration-300 cursor-pointer overflow-hidden group select-none flex flex-col justify-between h-full"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-300/20 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Main Content & 3D Illustration Area */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Details */}
            <div className="flex-1 space-y-2.5 min-w-0">
              {/* Squircle Book Icon & FOUNDATIONS Pill */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E4D7FD] via-[#D5C2FC] to-[#C4ACF9] shadow-[0_4px_10px_rgba(124,58,237,0.18),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(109,40,217,0.25)] border border-white/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4 text-[#6D28D9]" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAE0FD] text-[#6E2FE5] text-[9px] font-black tracking-widest uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-[#DFD1F8]">
                  FOUNDATIONS
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#6D28D9] transition-colors">
                  1. Beginner Level
                </h2>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E3DCF7] text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Layers className="w-3 h-3 text-blue-500" />
                  <span>DSA Basics</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E3DCF7] text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <List className="w-3 h-3 text-purple-600" />
                  <span>Pattern Problems</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E3DCF7] text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  <span>Step-by-Step Solutions</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E3DCF7] text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Lightbulb className="w-3 h-3 text-blue-500" />
                  <span>Concept Notes</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E3DCF7] text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <Code2 className="w-3 h-3 text-indigo-600" />
                  <span>Practice Sets</span>
                </div>
              </div>
            </div>

            {/* Right: Pure Code Vector 3D Laptop with Animated Floating Badges */}
            <div className="shrink-0 flex items-center justify-center">
              <BeginnerLaptopIllustration />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Practice Button Only (Total Metrics Removed) */}
        <div className="relative z-10 mt-3.5 pt-3 border-t border-[#E6DCF8]/70 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("beginner");
            }}
            className="px-4 py-2 rounded-xl bg-[#6E38F7] hover:bg-[#602CE5] text-white font-bold text-xs sm:text-sm transition-all shadow-[0_4px_12px_rgba(110,56,247,0.28)] hover:shadow-[0_6px_16px_rgba(110,56,247,0.4)] flex items-center gap-2 cursor-pointer active:scale-95 group/btn"
          >
            <span>Practice</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </button>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#6E38F7] group-hover:translate-x-0.5 transition-all">
            <span>Core Concepts</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
