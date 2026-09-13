"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function QuickHubNav() {
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* ── Block 1: Top-Left (Our Roadmaps: Careerpath & Roadmaps) ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Careerpath */}
          <Link
            href="/roadmaps"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/careerpath.png"
                alt="Careerpath"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Careerpath
            </span>
          </Link>

          {/* Item 2: Roadmaps / Mock Interview */}
          <Link
            href="/roadmaps"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/roadmap_path.png"
                alt="Our Roadmaps"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Mock Interview
            </span>
          </Link>
        </motion.div>

        {/* ── Block 2: Top-Right (Stacked Horizontal: Courses & Events/Projects) ── */}
        <div className="flex flex-col gap-2 sm:gap-2.5 justify-between">
          {/* Horizontal Card 1: Courses (LEARN) */}
          <motion.div whileHover={{ y: -2, scale: 1.015 }} className="flex-1 flex">
            <Link
              href="/learning"
              className="bg-white rounded-[16px] sm:rounded-[18px] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer w-full"
            >
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-tight">
                  Courses
                </h4>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mt-0.5">
                  LEARN
                </span>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/hub/courses.png"
                  alt="Courses"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </motion.div>

          {/* Horizontal Card 2: Projects / Events (BUILD) */}
          <motion.div whileHover={{ y: -2, scale: 1.015 }} className="flex-1 flex">
            <Link
              href="/explore?tab=events"
              className="bg-white rounded-[16px] sm:rounded-[18px] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer w-full"
            >
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-tight">
                  Projects
                </h4>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mt-0.5">
                  BUILD
                </span>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/images/hub/projects_events.png"
                  alt="Events & Projects"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ── Block 3: Bottom-Left (Practice: Mock & Assessment) ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Mock */}
          <Link
            href="/practice"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/practice_mock.png"
                alt="Mock"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Mock
            </span>
          </Link>

          {/* Item 2: Assessment */}
          <Link
            href="/practice"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/practice_assessment.png"
                alt="Assessment"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Assessment
            </span>
          </Link>
        </motion.div>

        {/* ── Block 4: Bottom-Right (Scholarships & Interview) ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Scholarships / Competition */}
          <Link
            href="/explore?tab=scholarships"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/scholarships_trophy.png"
                alt="Scholarships"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Competition
            </span>
          </Link>

          {/* Item 2: Interview */}
          <Link
            href="/career"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f7] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/hub/scholarships_interview.png"
                alt="Interview"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Interview
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
