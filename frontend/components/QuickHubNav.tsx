"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import LearningPathCarousel from "@/components/LearningPathCarousel";

// QuickHubNav with white text on hover
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
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/learning"
              style={{
                boxShadow: "0 10px 18px 0px rgba(0, 0, 0, 0.10), 0 5px 10px 0px rgba(0, 0, 0, 0.06), 0 2px 4px 0px rgba(0, 0, 0, 0.04), 0 1px 2px 0px rgba(0, 0, 0, 0.03)",
              }}
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 hub-card-shadow transition-[box-shadow,border-color] duration-200 relative overflow-hidden flex flex-col justify-center cursor-pointer min-h-[76px] sm:min-h-[92px]"
            >
              {/* Left/Middle Content */}
              <div className="relative z-10 max-w-[58%] sm:max-w-[62%] flex flex-col justify-center">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                  Learn
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Curated playlists.
                </p>
              </div>

              {/* Bottom-Right Corner 3D Illustration */}
              <div className="absolute right-1 sm:right-2 bottom-0 pointer-events-none select-none flex items-end justify-end w-[46%] sm:w-[42%] h-[86%] sm:h-[92%]">
                <div className="relative w-full h-full flex items-end justify-end group-hover:scale-108 group-hover:-rotate-2 group-active:scale-92 transition-all duration-300">
                  <Image
                    src="/images/hub/learning_deck.png"
                    alt="Learning Playlists 3D Deck"
                    fill
                    sizes="(max-width: 640px) 110px, 160px"
                    priority
                    className="object-contain object-right-bottom drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card B: Practice */}
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 24 }}
            className="flex-1 flex"
          >
            <Link
              href="/practice"
              style={{
                boxShadow: "0 10px 18px 0px rgba(0, 0, 0, 0.10), 0 5px 10px 0px rgba(0, 0, 0, 0.06), 0 2px 4px 0px rgba(0, 0, 0, 0.04), 0 1px 2px 0px rgba(0, 0, 0, 0.03)",
              }}
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 hub-card-shadow transition-[box-shadow,border-color] duration-200 relative overflow-hidden flex flex-col justify-center cursor-pointer min-h-[76px] sm:min-h-[92px]"
            >
              {/* Left/Middle Content */}
              <div className="relative z-10 max-w-[58%] sm:max-w-[62%] flex flex-col justify-center">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                  Practice
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Code &amp; interview prep.
                </p>
              </div>

              {/* Bottom-Right Corner 3D Illustration */}
              <div className="absolute right-1 sm:right-2 bottom-0 pointer-events-none select-none flex items-end justify-end w-[46%] sm:w-[42%] h-[86%] sm:h-[92%]">
                <div className="relative w-full h-full flex items-end justify-end group-hover:scale-108 group-hover:rotate-2 group-active:scale-92 transition-all duration-300">
                  <Image
                    src="/images/hub/practice_checklist.png"
                    alt="Practice 3D Checklist"
                    fill
                    sizes="(max-width: 640px) 110px, 160px"
                    priority
                    className="object-contain object-right-bottom drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Tier: 4 Clean Feature Tiles (Scholarships, Competitions, DSA Sheets, Career) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5 pb-4 sm:pb-5">
        {/* Card 1: Scholarships (On mobile: 2-in-1 layout like img 2 with Scholarships + Competitions) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          {/* ── Mobile View: 2-in-1 layout like img 2 (Scholarships + Competitions) ── */}
          <div
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="sm:hidden block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] p-2 xs:p-2.5 hub-card-shadow"
          >
            <div className="grid grid-cols-2 gap-1 items-center h-full min-h-[104px] xs:min-h-[114px]">
              {/* Option A: Scholarships */}
              <Link
                href="/explore?tab=scholarships"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/scholarships_certificate.png"
                    alt="Scholarships 3D Graduation"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Scholarships
                </span>
              </Link>

              {/* Option B: Competitions */}
              <Link
                href="/explore?tab=events"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/gold_trophy.png"
                    alt="Competitions 3D Trophy"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Competitions
                </span>
              </Link>
            </div>
          </div>

          {/* ── Desktop View: Single feature card ── */}
          <Link
            href="/explore?tab=scholarships"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="hidden sm:block group bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-[box-shadow,border-color] duration-200 active:scale-98 cursor-pointer"
          >
            {/* 3D Icon */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/scholarships_certificate.png"
                    alt="Scholarships 3D Graduation"
                    width={72}
                    height={72}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label */}
            <div className="flex items-center mt-1 sm:mt-1.5 px-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Scholarships
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Card 2: Competitions (On mobile: 2-in-1 layout with DSA Sheets + Aptitude) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          {/* ── Mobile View: 2-in-1 layout (DSA Sheets + Aptitude) ── */}
          <div
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="sm:hidden block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] p-2 xs:p-2.5 hub-card-shadow"
          >
            <div className="grid grid-cols-2 gap-1 items-center h-full min-h-[104px] xs:min-h-[114px]">
              {/* Option A: DSA Sheets */}
              <Link
                href="/practice?section=dsa-sheets#dsa-sheets"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/dsa_sheets_3d.png"
                    alt="DSA Sheets 3D Checklist"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  DSA Sheets
                </span>
              </Link>

              {/* Option B: Aptitude */}
              <Link
                href="/career?prep=aptitude#placement-prep"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/aptitude_3d.png"
                    alt="Aptitude 3D Calculator and Chart"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Aptitude
                </span>
              </Link>
            </div>
          </div>

          {/* ── Desktop View: Single feature card ── */}
          <Link
            href="/explore?tab=events"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="hidden sm:block group bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-[box-shadow,border-color] duration-200 active:scale-98 cursor-pointer"
          >
            {/* 3D Icon */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/gold_trophy.png"
                    alt="Competitions 3D Trophy"
                    width={72}
                    height={72}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label */}
            <div className="flex items-center mt-1 sm:mt-1.5 px-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Competitions
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Card 3: Reasoning & Verbal Ability (Desktop: DSA Sheets) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          {/* ── Mobile View: 2-in-1 layout (Reasoning + Verbal Ability) ── */}
          <div
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="sm:hidden block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] p-2 xs:p-2.5 hub-card-shadow"
          >
            <div className="grid grid-cols-2 gap-1 items-center h-full min-h-[104px] xs:min-h-[114px]">
              {/* Option A: Reasoning */}
              <Link
                href="/career?prep=reasoning#placement-prep"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/reasoning_3d.png"
                    alt="Reasoning 3D Brain and Puzzle"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Reasoning
                </span>
              </Link>

              {/* Option B: Verbal Ability */}
              <Link
                href="/career?prep=verbal#placement-prep"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/verbal_3d.png"
                    alt="Verbal Ability 3D Book and Audio"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[9.5px] xs:text-[10.5px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Verbal Ability
                </span>
              </Link>
            </div>
          </div>

          {/* ── Desktop View: Single feature card (DSA Sheets) ── */}
          <Link
            href="/practice?section=dsa-sheets#dsa-sheets"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="hidden sm:block group bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-[box-shadow,border-color] duration-200 active:scale-98 cursor-pointer"
          >
            {/* 3D Icon */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/dsa_sheets_3d.png"
                    alt="DSA Sheets 3D Checklist"
                    width={72}
                    height={72}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label */}
            <div className="flex items-center mt-1 sm:mt-1.5 px-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                DSA Sheets
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Card 4: Career (On mobile: 2-in-1 layout with Career + Resume Build) */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="relative"
        >
          {/* ── Mobile View: 2-in-1 layout (Career + Resume Build) ── */}
          <div
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="sm:hidden block bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] p-2 xs:p-2.5 hub-card-shadow"
          >
            <div className="grid grid-cols-2 gap-1 items-center h-full min-h-[104px] xs:min-h-[114px]">
              {/* Option A: Career */}
              <Link
                href="/career"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/career_consultant.png"
                    alt="Career Goals 3D"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Career
                </span>
              </Link>

              {/* Option B: Resume Build */}
              <Link
                href="/resume-review"
                className="group/item flex flex-col items-center justify-center p-1 rounded-[14px] active:scale-95 transition-transform"
              >
                <div className="w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center p-1 transition-transform duration-300 group-hover/item:scale-108">
                  <Image
                    src="/images/hub/resume_builder_3d.png"
                    alt="Resume Build 3D"
                    width={54}
                    height={54}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 text-center truncate max-w-full">
                  Resume Build
                </span>
              </Link>
            </div>
          </div>

          {/* ── Desktop View: Single feature card ── */}
          <Link
            href="/career"
            style={{
              boxShadow: "0 16px 26px 0px rgba(0, 0, 0, 0.16), 0 8px 14px 0px rgba(0, 0, 0, 0.12), 0 3px 6px 0px rgba(0, 0, 0, 0.08), 0 1px 2px 0px rgba(0, 0, 0, 0.06)",
            }}
            className="hidden sm:block group bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-[box-shadow,border-color] duration-200 active:scale-98 cursor-pointer"
          >
            {/* 3D Icon */}
            <div className="w-full h-18 sm:h-22 md:h-24 flex items-center justify-center p-0.5 sm:p-1">
              <div className="w-15 h-15 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/hub/career_consultant.png"
                    alt="Career Goals 3D"
                    width={72}
                    height={72}
                    priority
                    className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label */}
            <div className="flex items-center mt-1 sm:mt-1.5 px-1 min-w-0">
              <span className="text-[10.5px] sm:text-[11.5px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Career
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
