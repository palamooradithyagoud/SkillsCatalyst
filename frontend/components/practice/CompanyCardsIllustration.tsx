"use client";

import React from "react";
import { motion } from "framer-motion";

export function CompanyCardsIllustration() {
  return (
    <div className="relative w-[170px] sm:w-[185px] h-[135px] sm:h-[145px] flex items-center justify-center select-none shrink-0 overflow-visible">
      {/* ── Soft Ambient Backlight Glow ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-transparent blur-2xl rounded-full pointer-events-none" />

      {/* ── Center 3D Isometric Placement Hub in SVG ── */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-[130px] sm:w-[145px]"
      >
        <svg
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <filter id="companyDropShadow" x="0" y="140" width="280" height="60" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="9" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.15 0 0 0 0 0.35 0 0 0 0 0.85 0 0 0 0.22 0" />
            </filter>

            <linearGradient id="compScreenBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="compBezel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* Diffused shadow */}
          <ellipse cx="140" cy="170" rx="105" ry="18" fill="#3B82F6" filter="url(#companyDropShadow)" />

          {/* Screen Body */}
          <g transform="translate(0, 5)">
            <rect
              x="52"
              y="22"
              width="176"
              height="114"
              rx="12"
              fill="url(#compBezel)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Dark Terminal */}
            <rect
              x="59"
              y="33"
              width="162"
              height="96"
              rx="7"
              fill="url(#compScreenBg)"
            />

            {/* Terminal Top Window Dots */}
            <circle cx="70" cy="42" r="2.5" fill="#EF4444" />
            <circle cx="78" cy="42" r="2.5" fill="#F59E0B" />
            <circle cx="86" cy="42" r="2.5" fill="#10B981" />

            {/* Code Question Prompt Lines */}
            <g transform="translate(70, 56)">
              <text x="0" y="10" fontFamily="monospace" fontSize="10" fontWeight="bold" fill="#60A5FA">
                # LeetCode 660+
              </text>
              <rect x="0" y="18" width="85" height="4" rx="2" fill="#94A3B8" />
              <rect x="0" y="27" width="120" height="4" rx="2" fill="#38BDF8" />
              <rect x="0" y="36" width="95" height="4" rx="2" fill="#818CF8" />
              <rect x="0" y="45" width="110" height="4" rx="2" fill="#A855F7" />
              <rect x="0" y="54" width="70" height="4" rx="2" fill="#34D399" />
            </g>
          </g>

          {/* Base */}
          <path
            d="M 36 142 L 244 142 C 255 142 265 148 262 158 L 248 168 C 245 170 238 172 230 172 L 50 172 C 42 172 35 170 32 168 L 18 158 C 15 148 25 142 36 142 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <rect x="118" y="152" width="44" height="15" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* ── 4 Floating Company Badges in 3D Space ── */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform cursor-default"
      >
        <span className="text-[10px] font-black text-blue-600 tracking-tight">Google</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -5, 0], rotate: [-8, -6, -8] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 left-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-white/80 shadow-[0_4px_12px_rgba(245,158,11,0.18)] hover:scale-105 transition-transform cursor-default"
      >
        <span className="text-[10px] font-black text-amber-950 tracking-tight">Amazon</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0], rotate: [6, 8, 6] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] border border-white/80 shadow-[0_4px_12px_rgba(37,99,235,0.18)] hover:scale-105 transition-transform cursor-default"
      >
        <span className="text-[10px] font-black text-blue-950 tracking-tight">Meta</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -3, 0], rotate: [3, 5, 3] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1 right-1 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#FED7AA] to-[#FDBA74] border border-white/80 shadow-[0_4px_12px_rgba(234,88,12,0.18)] hover:scale-105 transition-transform cursor-default"
      >
        <span className="text-[10px] font-black text-orange-950 tracking-tight">LeetCode</span>
      </motion.div>
    </div>
  );
}
