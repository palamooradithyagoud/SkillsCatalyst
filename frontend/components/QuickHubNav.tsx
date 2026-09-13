"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function QuickHubNav() {
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* ── 1. Our Roadmaps (Careerpath & Roadmaps) ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Careerpath */}
          <Link
            href="/roadmaps"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eef2ff] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cp-stair-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="cp-stair-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4338CA" />
                  </linearGradient>
                  <linearGradient id="cp-stair-3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#3730A3" />
                  </linearGradient>
                  <linearGradient id="cp-star" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#EAB308" />
                  </linearGradient>
                </defs>
                <path d="M14 44l12-6v10l-12 6z" fill="#3730A3" />
                <path d="M26 38l12 5v10l-12-5z" fill="#4F46E5" />
                <path d="M14 44l12-6 12 5-12 6z" fill="url(#cp-stair-1)" />

                <path d="M23 35l12-6v10l-12 6z" fill="#312E81" />
                <path d="M35 29l12 5v10l-12-5z" fill="#4338CA" />
                <path d="M23 35l12-6 12 5-12 6z" fill="url(#cp-stair-2)" />

                <path d="M32 26l12-6v10l-12 6z" fill="#1E1B4B" />
                <path d="M44 20l12 5v10l-12-5z" fill="#3730A3" />
                <path d="M32 26l12-6 12 5-12 6z" fill="url(#cp-stair-3)" />

                <path d="M44 11l1.6 3.2 3.6.5-2.6 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.6-2.5 3.6-.5z" fill="url(#cp-star)" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Careerpath
            </span>
          </Link>

          {/* Item 2: Roadmaps */}
          <Link
            href="/roadmaps"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f0f9ff] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="rm-path" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                  <linearGradient id="rm-flag" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <path d="M16 48c0-9 14-8 16-18s14-8 16-17" stroke="url(#rm-path)" strokeWidth="9" strokeLinecap="round" />
                <path d="M16 48c0-9 14-8 16-18s14-8 16-17" stroke="#E0F2FE" strokeWidth="1.8" strokeDasharray="2.5 2.5" strokeLinecap="round" />
                <circle cx="16" cy="48" r="4.5" fill="#0284C7" stroke="#ffffff" strokeWidth="1.8" />
                <circle cx="28" cy="34" r="4" fill="#0EA5E9" stroke="#ffffff" strokeWidth="1.8" />
                <circle cx="48" cy="13" r="5" fill="#10B981" stroke="#ffffff" strokeWidth="1.8" />
                <path d="M48 13v-7" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M48 6l8 3.5-8 3.5z" fill="url(#rm-flag)" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Roadmaps
            </span>
          </Link>
        </motion.div>

        {/* ── 2. Top-Right (Stacked Horizontal: Courses & Events) ── */}
        <div className="flex flex-col gap-2 sm:gap-2.5 justify-between">
          {/* Card A: Courses (LEARN) */}
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
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 relative flex items-center justify-center group-hover:scale-108 transition-transform duration-300">
                <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cap-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                  <path d="M14 30l18 9 18-9-18-9z" fill="#334155" />
                  <path d="M14 30v13l18 8v-13z" fill="#1E293B" />
                  <path d="M32 38l18-8v13l-18 8z" fill="#0F172A" />
                  <path d="M16 32v10l15 6v-10z" fill="#F8FAFC" />
                  <path d="M32 14l17 7-17 7-17-7z" fill="url(#cap-grad-2)" filter="drop-shadow(0 2px 4px rgba(29,78,216,0.3))" />
                  <path d="M26 23v5.5c0 2.5 6 4 6 4s6-1.5 6-4V23" fill="#1E40AF" />
                  <circle cx="32" cy="21" r="1.8" fill="#F59E0B" />
                  <path d="M32 21c3 1.5 6.5 5 5.5 11" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="37.5" cy="32" r="1.3" fill="#D97706" />
                </svg>
              </div>
            </Link>
          </motion.div>

          {/* Card B: Events (BUILD / EXPLORE) */}
          <motion.div whileHover={{ y: -2, scale: 1.015 }} className="flex-1 flex">
            <Link
              href="/explore?tab=events"
              className="bg-white rounded-[16px] sm:rounded-[18px] px-3 py-2 sm:px-3.5 sm:py-2.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer w-full"
            >
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-tight">
                  Events
                </h4>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mt-0.5">
                  BUILD
                </span>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 relative flex items-center justify-center group-hover:scale-108 transition-transform duration-300">
                <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path d="M26 42c-3 7 6 13 6 13s9-6 6-13z" fill="url(#flame-grad)" filter="drop-shadow(0 0 6px rgba(249,115,22,0.5))" />
                  <path d="M28.5 42c-1.5 4 3.5 7 3.5 7s4.5-3 3.5-7z" fill="#FDE047" />
                  <path d="M20 35l5 5-4 5z" fill="#7E22CE" />
                  <path d="M44 35l-5 5 4 5z" fill="#7E22CE" />
                  <path d="M32 10c-6 7-8 20-6 30h12c2-10 0-23-6-30z" fill="#F8FAFC" />
                  <path d="M32 10c-2.5 3-4.5 7-4.5 11h9c0-4-2-8-4.5-11z" fill="#A855F7" />
                  <circle cx="32" cy="26" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />
                  <circle cx="30.8" cy="24.8" r="1" fill="#FFFFFF" />
                </svg>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* ── 3. Practice & Placement Prep ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Practice */}
          <Link
            href="/practice"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="term-box" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
                <rect x="13" y="16" width="38" height="32" rx="7" fill="url(#term-box)" />
                <path d="M13 23h38V16a7 7 0 0 0-7-7H20a7 7 0 0 0-7 7v7z" fill="#334155" />
                <circle cx="18" cy="19.5" r="1.6" fill="#EF4444" />
                <circle cx="23" cy="19.5" r="1.6" fill="#F59E0B" />
                <circle cx="28" cy="19.5" r="1.6" fill="#10B981" />
                <path d="M22 32l-4.5 4 4.5 4M42 32l4.5 4-4.5 4M34 29l-4 14" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="45" cy="42" r="6.5" fill="#10B981" stroke="#ffffff" strokeWidth="1.8" />
                <path d="M42.5 42l1.8 1.8 3.5-3.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Practice
            </span>
          </Link>

          {/* Item 2: Placement Prep */}
          <Link
            href="/career"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eff6ff] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pp-case" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="pp-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <path d="M25 18c0-3.5 3-5.5 7-5.5s7 2 7 5.5" stroke="url(#pp-gold)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <rect x="13" y="20" width="38" height="28" rx="6" fill="url(#pp-case)" />
                <path d="M13 28v-2a6 6 0 0 1 6-6h2" stroke="#60A5FA" strokeWidth="1.2" fill="none" />
                <path d="M51 28v-2a6 6 0 0 0-6-6h-2" stroke="#60A5FA" strokeWidth="1.2" fill="none" />
                <rect x="22" y="20" width="3.5" height="28" fill="#1E40AF" />
                <rect x="38.5" y="20" width="3.5" height="28" fill="#1E40AF" />
                <rect x="22" y="32" width="3.5" height="4.5" rx="1" fill="url(#pp-gold)" />
                <rect x="38.5" y="32" width="3.5" height="4.5" rx="1" fill="url(#pp-gold)" />
                <circle cx="32" cy="34" r="3.5" fill="url(#pp-gold)" />
                <circle cx="32" cy="34" r="1.2" fill="#78350F" />
                <circle cx="47" cy="18" r="6" fill="#10B981" stroke="#ffffff" strokeWidth="1.8" filter="drop-shadow(0 2px 4px rgba(16,185,129,0.4))" />
                <path d="M44.8 18l1.5 1.5 3-3" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight max-w-full px-0.5">
              Placement Prep
            </span>
          </Link>
        </motion.div>

        {/* ── 4. Scholarships (Scholarships & Competition) ── */}
        <motion.div
          whileHover={{ y: -2, scale: 1.015 }}
          className="bg-white rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-around"
        >
          {/* Item 1: Scholarships */}
          <Link
            href="/explore?tab=scholarships"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fffbeb] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#CA8A04" />
                  </linearGradient>
                </defs>
                <path d="M21 21c-6 0-8 7-3 11.5 3.5 3.5 6 1 7 0" stroke="url(#trophy-gold)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M43 21c6 0 8 7 3 11.5-3.5 3.5-6 1-7 0" stroke="url(#trophy-gold)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M20 16h24v13c0 7.5-5.5 12-12 12s-12-4.5-12-12V16z" fill="url(#trophy-gold)" />
                <path d="M29 41h6v6h-6z" fill="#CA8A04" />
                <path d="M23 47h18v5H23z" rx="2" fill="#1E293B" />
                <ellipse cx="32" cy="16" rx="12" ry="2.8" fill="#FEF08A" />
                <path d="M32 23l1.4 2.8 3.2.5-2.3 2.3.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.3 3.2-.5z" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Scholarships
            </span>
          </Link>

          {/* Item 2: Competition */}
          <Link
            href="/explore?tab=events"
            className="flex flex-col items-center group cursor-pointer flex-1 min-w-0"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#faf5ff] flex items-center justify-center mb-1.5 overflow-hidden group-hover:scale-108 transition-transform duration-300 shadow-xs">
              <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="med-ribbon-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="med-ribbon-2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6D28D9" />
                  </linearGradient>
                  <linearGradient id="med-coin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <path d="M25 10l5 21h-7l-4-21z" fill="url(#med-ribbon-1)" />
                <path d="M39 10l-5 21h7l4-21z" fill="url(#med-ribbon-2)" />
                <circle cx="32" cy="38" r="13" fill="url(#med-coin)" filter="drop-shadow(0 2px 5px rgba(217,119,6,0.35))" />
                <circle cx="32" cy="38" r="10.5" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2 1" fill="none" />
                <path d="M32 30.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors text-center leading-tight truncate max-w-full px-0.5">
              Competition
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
