"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LearningPathCarousel from "@/components/LearningPathCarousel";

export default function QuickHubNav() {
  return (
    <div className="w-full select-none space-y-3 sm:space-y-4">
      {/* ── Top Tier: Auto-Swiping Learning Path Deck + Beside it Stacked Courses & Projects ── */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3.5 items-stretch relative">
        {/* 1. Hero Card: Auto-Swiping Learning Path Deck */}
        <div className="col-span-1 md:col-span-7 flex">
          <LearningPathCarousel />
        </div>

        {/* 2. Right Stack: Courses (LEARN) & Projects (BUILD) - Beside Careerpath on mobile */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-2.5 sm:gap-3.5 justify-between">
          {/* Card A: Learn */}
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/learning"
              style={{
                boxShadow: "0 10px 18px 0px rgba(0, 0, 0, 0.10), 0 5px 10px 0px rgba(0, 0, 0, 0.06), 0 2px 4px 0px rgba(0, 0, 0, 0.04), 0 1px 2px 0px rgba(0, 0, 0, 0.03)",
              }}
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  Learn
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Curated playlists.
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* 3D Circular Pod */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EEF2F6] dark:bg-blue-500/[0.12] dark:border dark:border-blue-400/25 dark:shadow-[0_0_16px_rgba(59,130,246,0.22)] flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/hub/courses.png"
                      alt="Learning 3D Cap"
                      fill
                      className="object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card B: Practice */}
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/practice"
              style={{
                boxShadow: "0 10px 18px 0px rgba(0, 0, 0, 0.10), 0 5px 10px 0px rgba(0, 0, 0, 0.06), 0 2px 4px 0px rgba(0, 0, 0, 0.04), 0 1px 2px 0px rgba(0, 0, 0, 0.03)",
              }}
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#e11d48] dark:group-hover:text-rose-400 transition-colors truncate">
                  Practice
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Code &amp; interview prep.
                </p>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* 3D Circular Pod */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EEF2F6] dark:bg-rose-500/[0.12] dark:border dark:border-rose-400/25 dark:shadow-[0_0_16px_rgba(244,63,94,0.22)] flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/hub/projects.png"
                      alt="Practice 3D Code"
                      fill
                      className="object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Tier: 4 Clean Feature Tiles (Scholarships, Competitions, DSA Sheets, Career) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5 pb-4 sm:pb-5">
        {/* Card 1: Scholarships */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          <Link
            href="/explore?tab=scholarships"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="group block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#EEF2F6] dark:bg-amber-500/[0.12] dark:border dark:border-amber-400/25 dark:shadow-[0_0_20px_rgba(245,158,11,0.22)] flex items-center justify-center p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/scholarships.png"
                    alt="Scholarships 3D Graduation"
                    fill
                    className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1 sm:mt-1.5 px-1 gap-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Scholarships
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card 2: Competitions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          <Link
            href="/explore?tab=events"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="group block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#EEF2F6] dark:bg-yellow-500/[0.12] dark:border dark:border-yellow-400/25 dark:shadow-[0_0_20px_rgba(234,179,8,0.22)] flex items-center justify-center p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/competition.png"
                    alt="Competitions 3D Trophy"
                    fill
                    className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1 sm:mt-1.5 px-1 gap-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Competitions
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card 3: DSA Sheets */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          <Link
            href="/practice?section=dsa-sheets#dsa-sheets"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="group block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#EEF2F6] dark:bg-indigo-500/[0.12] dark:border dark:border-indigo-400/25 dark:shadow-[0_0_20px_rgba(99,102,241,0.22)] flex items-center justify-center p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/mock.png"
                    alt="DSA Sheets 3D Checklist"
                    fill
                    className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1 sm:mt-1.5 px-1 gap-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                DSA Sheets
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card 4: Career */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          <Link
            href="/career"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="group block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#EEF2F6] dark:bg-sky-500/[0.12] dark:border dark:border-sky-400/25 dark:shadow-[0_0_20px_rgba(14,165,233,0.22)] flex items-center justify-center p-1 sm:p-1.5 group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/interview.png"
                    alt="Career Goals 3D"
                    fill
                    className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1 sm:mt-1.5 px-1 gap-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Career
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-white/[0.08] dark:border dark:border-white/[0.06] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.14] flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
