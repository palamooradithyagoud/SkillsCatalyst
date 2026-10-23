"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CareerPathKatanaSequence, preloadKatanaFrames } from "@/components/career/katana";

export default function QuickHubNav() {
  const router = useRouter();
  const [isCareerTransitionActive, setIsCareerTransitionActive] = useState(false);

  // Katana anime sequence feature toggle (turned off for now, preserved for later)
  const ENABLE_KATANA_ANIMATION = false;

  useEffect(() => {
    if (ENABLE_KATANA_ANIMATION) {
      preloadKatanaFrames();
    }
  }, []);

  const handleCareerPathClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (ENABLE_KATANA_ANIMATION) {
      if (isCareerTransitionActive) return;
      setIsCareerTransitionActive(true);
    } else {
      router.push("/roadmaps");
    }
  };

  return (
    <div className="w-full select-none space-y-3 sm:space-y-4">
      {/* ── Top Tier: Hero Careerpath Card (Square on Mobile) + Beside it Stacked Courses & Projects ── */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3.5 items-stretch relative">
        {/* 1. Hero Card: Careerpath (PLAN) - Square proportion on mobile, full width hero on desktop */}
        <motion.div
          whileHover={isCareerTransitionActive ? {} : { y: -3, scale: 1.012 }}
          animate={
            isCareerTransitionActive
              ? {
                  scale: 0.965,
                  filter: "brightness(1.15) contrast(1.1)",
                  boxShadow: "0 0 35px rgba(245,158,11,0.45)",
                }
              : {}
          }
          transition={{ type: "spring", stiffness: 350, damping: 24 }}
          className="col-span-1 md:col-span-7 flex"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={handleCareerPathClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCareerPathClick(e as unknown as React.MouseEvent);
              }
            }}
            style={{
              boxShadow: "0 12px 20px 0px rgba(0, 0, 0, 0.12), 0 6px 10px 0px rgba(0, 0, 0, 0.08), 0 2px 4px 0px rgba(0, 0, 0, 0.05), 0 1px 2px 0px rgba(0, 0, 0, 0.04)",
            }}
            className="group flex-1 bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 hub-card-shadow transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[155px] sm:min-h-[195px]"
          >
            {/* Left/Top Content */}
            <div className="relative z-10 max-w-[65%] sm:max-w-[54%] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-[#5c56df] dark:text-[#818CF8] uppercase">
                    PLAN
                  </span>
                  <span className="w-4 sm:w-5 h-[2px] rounded-full bg-[#5c56df]/50 dark:bg-[#818CF8]/50" />
                </div>
                <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Career
                  <span className="text-[#635BFF] dark:text-[#818CF8]">path</span>
                </h3>
                <p className="text-[10px] sm:text-[12.5px] text-slate-500 dark:text-neutral-400 font-medium leading-tight sm:leading-snug mt-1 hidden xs:block line-clamp-2 max-w-[190px]">
                  Get a personalized roadmap to your dream career.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-2.5 sm:mt-5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#5442F6] via-[#635BFF] to-[#7B73FF] text-white flex items-center justify-center shadow-sm shadow-indigo-500/25 group-hover:scale-110 group-hover:shadow-indigo-500/40 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Right 3D Illustration - Transparent PNG seamlessly floating on card */}
            <div className="absolute right-0 bottom-0 top-auto sm:top-0 w-[54%] h-[78%] sm:w-[50%] sm:h-full flex items-end justify-end pointer-events-none select-none overflow-hidden">
              <div className="relative w-full h-full min-h-[110px] sm:min-h-[160px] flex items-end justify-end group-hover:scale-104 transition-transform duration-500">
                <Image
                  src="/images/hub/careerpath_hero.png"
                  alt="Careerpath 3D Stairs"
                  fill
                  className="object-contain object-bottom-right"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

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
              className="group flex-1 bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
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
                {/* Shining Circular Pod matching Image 2 reference */}
                <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center shrink-0 p-1 group-hover:scale-108 transition-all duration-300 overflow-hidden">
                  <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)]">
                    <Image
                      src="/images/hub/courses.png"
                      alt="Learning 3D Cap"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
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
              className="group flex-1 bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-4 sm:py-3.5 hub-card-shadow transition-all flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer relative overflow-hidden"
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
                {/* Shining Circular Pod matching Image 2 reference */}
                <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center shrink-0 p-1 group-hover:scale-108 transition-all duration-300 overflow-hidden">
                  <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)]">
                    <Image
                      src="/images/hub/projects.png"
                      alt="Practice 3D Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
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
            className="group block bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-15 sm:h-20 md:h-22 flex items-center justify-center p-1 sm:p-1.5">
              <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center p-2 overflow-hidden group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]">
                  <Image
                    src="/images/hub/scholarships.png"
                    alt="Scholarships 3D Graduation"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1 gap-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Scholarships
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
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
            className="group block bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-15 sm:h-20 md:h-22 flex items-center justify-center p-1 sm:p-1.5">
              <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center p-2 overflow-hidden group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]">
                  <Image
                    src="/images/hub/competition.png"
                    alt="Competitions 3D Trophy"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1 gap-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Competitions
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
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
            className="group block bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-15 sm:h-20 md:h-22 flex items-center justify-center p-1 sm:p-1.5">
              <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center p-2 overflow-hidden group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]">
                  <Image
                    src="/images/hub/mock.png"
                    alt="DSA Sheets 3D Checklist"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1 gap-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                DSA Sheets
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
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
            className="group block bg-white dark:bg-[#18191F] rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3.5 hub-card-shadow transition-all cursor-pointer"
          >
            {/* 3D Shining Circular Pod */}
            <div className="w-full h-15 sm:h-20 md:h-22 flex items-center justify-center p-1 sm:p-1.5">
              <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-[#EEF2F6] dark:bg-neutral-800 flex items-center justify-center p-2 overflow-hidden group-hover:scale-108 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]">
                  <Image
                    src="/images/hub/interview.png"
                    alt="Career Goals 3D"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Label & Chevron */}
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1 gap-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                Career
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-neutral-800 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700 flex items-center justify-center text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>


      {/* ── 5-Frame Cinematic Anime Katana Unsheathing CareerPath Transition (Turned off via flag) ── */}
      {ENABLE_KATANA_ANIMATION && (
        <CareerPathKatanaSequence
          isActive={isCareerTransitionActive}
          onComplete={() => {
            router.push("/roadmaps");
            setTimeout(() => setIsCareerTransitionActive(false), 500);
          }}
          onCancel={() => setIsCareerTransitionActive(false)}
        />
      )}
    </div>
  );
}
