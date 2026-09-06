"use client";

import React from "react";
import { Clock, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface PracticeModeCardsProps {
  onSelectMode: (mode: "beginner" | "company") => void;
  companiesCount?: number;
}

export function PracticeModeCards({
  onSelectMode,
  companiesCount,
}: PracticeModeCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-2">
      {/* Card 1: Beginner Level */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => onSelectMode("beginner")}
        className="practice-card card-morph relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-8 bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
      >
        <div className="space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 text-[#234B3B] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-[#234B3B] text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
              FOUNDATIONS
            </span>
          </div>

          <div>
            <h3 className="text-xs sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-[#234B3B] transition-colors leading-snug">
              1. Beginner Level
            </h3>
            <p className="text-[11px] sm:text-sm text-slate-500 font-normal leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
              Master foundational data structures &amp; core patterns.
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("beginner");
            }}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#234B3B] text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:bg-[#1b3b2e] cursor-pointer"
          >
            Core Concepts
          </button>

          <div className="flex items-center justify-end sm:justify-start gap-1 text-[10px] sm:text-xs font-bold text-[#234B3B] transition-colors">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>

      {/* Card 2: Company Wise Questions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        onClick={() => onSelectMode("company")}
        className="practice-card card-morph relative rounded-[20px] sm:rounded-[28px] p-3.5 sm:p-8 bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
      >
        <div className="space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
              INTERVIEW PREP
            </span>
          </div>

          <div>
            <h3 className="text-xs sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors leading-snug">
              2. Company Questions
            </h3>
            <p className="text-[11px] sm:text-sm text-slate-500 font-normal leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
              LeetCode questions from {companiesCount || "660+"} top tech companies.
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode("company");
            }}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:bg-blue-700 cursor-pointer"
          >
            Question Bank
          </button>

          <div className="flex items-center justify-end sm:justify-start gap-1 text-[10px] sm:text-xs font-bold text-blue-600 transition-colors">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
