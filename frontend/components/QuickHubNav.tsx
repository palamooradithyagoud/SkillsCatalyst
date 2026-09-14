"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import PlacementPrepModal from "@/components/PlacementPrepModal";

export default function QuickHubNav() {
  const [isPlacementPrepOpen, setIsPlacementPrepOpen] = useState(false);
  return (
    <div className="w-full select-none space-y-2.5 sm:space-y-3">
      {/* ── Top Tier: Hero Careerpath Card + Stacked Courses & Projects ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        {/* 1. Hero Card: Careerpath (PLAN) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.012 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="md:col-span-7 flex"
        >
          <Link
            href="/roadmaps"
            className="group flex-1 bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[185px] sm:min-h-[195px]"
          >
            {/* Left Content */}
            <div className="relative z-10 max-w-[55%] sm:max-w-[58%] flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-[#5c56df] uppercase block mb-1">
                  PLAN
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-[#4f46e5] transition-colors">
                  Careerpath
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed mt-1.5">
                  Discover roles, skills and roadmaps for your future.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 sm:mt-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center shadow-md shadow-indigo-200/80 group-hover:scale-108 group-hover:bg-[#4338ca] transition-all">
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Right 3D Illustration - Transparent PNG seamlessly floating on card */}
            <div className="absolute -right-1 sm:right-1 bottom-0 top-0 w-[47%] sm:w-[49%] flex items-end justify-end pointer-events-none select-none overflow-hidden">
              <div className="relative w-full h-full min-h-[150px] flex items-end justify-end group-hover:scale-103 transition-transform duration-500">
                <Image
                  src="/images/hub/careerpath_hero.png"
                  alt="Careerpath 3D Stairs"
                  fill
                  className="object-contain object-bottom-right"
                  priority
                />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 2. Right Stack: Courses (LEARN) & Projects (BUILD) */}
        <div className="md:col-span-5 flex flex-col gap-2.5 sm:gap-3">
          {/* Card A: Courses (LEARN) */}
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/learning"
              className="group flex-1 bg-white rounded-[20px] sm:rounded-[22px] px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold tracking-wider text-blue-600 uppercase block">
                  LEARN
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                  Courses
                </h4>
                <p className="text-[10.5px] sm:text-[11.5px] text-slate-400 font-medium mt-0.5 leading-tight">
                  Upskill with curated courses.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[15px] bg-[#f0f5ff] flex items-center justify-center shrink-0 overflow-hidden p-1 group-hover:scale-106 transition-transform duration-300">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hub/courses.png"
                      alt="Courses 3D Cap"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card B: Projects (BUILD) */}
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/practice"
              className="group flex-1 bg-white rounded-[20px] sm:rounded-[22px] px-3.5 py-2.5 sm:px-4 sm:py-3 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[9.5px] sm:text-[10px] font-extrabold tracking-wider text-[#e11d48] uppercase block">
                  BUILD
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#e11d48] transition-colors">
                  Projects
                </h4>
                <p className="text-[10.5px] sm:text-[11.5px] text-slate-400 font-medium mt-0.5 leading-tight">
                  Apply what you learn.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[15px] bg-[#fff1f4] flex items-center justify-center shrink-0 overflow-hidden p-1 group-hover:scale-106 transition-transform duration-300">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hub/projects.png"
                      alt="Projects 3D Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Tier: 4 Clean Feature Tiles (Mock, Assessment, Competition, Interview) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Mock -> Opens Placement Prep */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
        >
          <div
            onClick={() => setIsPlacementPrepOpen(true)}
            className="group block bg-white rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
          >
            {/* 3D Illustration Container */}
            <div className="w-full h-20 sm:h-22 rounded-[14px] sm:rounded-[16px] bg-[#f0f4fa] flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-103 transition-transform duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/hub/mock.png"
                  alt="Mock 3D Checklist"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-2 px-0.5 gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#4f46e5] transition-colors whitespace-nowrap">
                Mock
              </span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                <ChevronRight className="w-3 h-3 stroke-[2.2]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Assessment */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
        >
          <Link
            href="/practice?tab=assessment"
            className="group block bg-white rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
          >
            {/* 3D Illustration Container */}
            <div className="w-full h-20 sm:h-22 rounded-[14px] sm:rounded-[16px] bg-[#f0f5fb] flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-103 transition-transform duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/hub/assessment.png"
                  alt="Assessment 3D Clipboard"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-2 px-0.5 gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#4f46e5] transition-colors whitespace-nowrap">
                Assessment
              </span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                <ChevronRight className="w-3 h-3 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card 3: Competition */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
        >
          <Link
            href="/explore?tab=events"
            className="group block bg-white rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
          >
            {/* 3D Illustration Container */}
            <div className="w-full h-20 sm:h-22 rounded-[14px] sm:rounded-[16px] bg-[#fffbeb] flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-103 transition-transform duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/hub/competition.png"
                  alt="Competition 3D Trophy"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-2 px-0.5 gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#4f46e5] transition-colors whitespace-nowrap">
                Competition
              </span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                <ChevronRight className="w-3 h-3 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card 4: Interview */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
        >
          <Link
            href="/ai-mentor"
            className="group block bg-white rounded-[18px] sm:rounded-[20px] p-2.5 sm:p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
          >
            {/* 3D Illustration Container */}
            <div className="w-full h-20 sm:h-22 rounded-[14px] sm:rounded-[16px] bg-[#f1f3fd] flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-103 transition-transform duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/images/hub/interview.png"
                  alt="Interview 3D Meeting"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-2 px-0.5 gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#4f46e5] transition-colors whitespace-nowrap">
                Interview
              </span>
              <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-slate-100/90 group-hover:bg-slate-200/90 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                <ChevronRight className="w-3 h-3 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* ── Placement Preparation Interactive Modal ── */}
      <PlacementPrepModal
        isOpen={isPlacementPrepOpen}
        onClose={() => setIsPlacementPrepOpen(false)}
      />
    </div>
  );
}
