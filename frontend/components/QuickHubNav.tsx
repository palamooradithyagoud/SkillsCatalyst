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
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                  Learn
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Curated playlists.
                </p>
              </div>

              <div className="flex items-center shrink-0">
                {/* 3D Icon with click & tap animation */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.88, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/hub/learning_deck.png"
                      alt="Learning Playlists 3D Deck"
                      width={52}
                      height={52}
                      priority
                      className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-200"
                    />
                  </div>
                </motion.div>
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
              className="group flex-1 bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                  Practice
                </h4>
                <p className="text-[9.5px] sm:text-[11.5px] text-slate-400 dark:text-neutral-400 font-medium mt-0.5 leading-tight truncate hidden xs:block">
                  Code &amp; interview prep.
                </p>
              </div>

              <div className="flex items-center shrink-0">
                {/* 3D Icon with click & tap animation */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.88, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/hub/practice_checklist.png"
                      alt="Practice 3D Checklist"
                      width={52}
                      height={52}
                      priority
                      className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] transition-transform duration-200"
                    />
                  </div>
                </motion.div>
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
          whileTap={{ scale: 0.96 }}
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

        {/* Card 2: Competitions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          whileTap={{ scale: 0.96 }}
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

        {/* Card 3: DSA Sheets */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          whileTap={{ scale: 0.96 }}
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

        {/* Card 4: Career */}
        <motion.div
          whileHover={{ y: -3, scale: 1.018 }}
          whileTap={{ scale: 0.96 }}
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
