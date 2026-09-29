"use client";

import React from "react";
import { motion } from "framer-motion";

export function CompanyCardsIllustration() {
  return (
    <div className="relative w-[150px] sm:w-[170px] h-[115px] sm:h-[125px] flex items-center justify-center select-none shrink-0 overflow-visible">
      {/* ── Ambient Backlight Glow ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/25 via-indigo-500/20 to-transparent blur-xl rounded-full pointer-events-none" />

      {/* ── Glowing Connection Nodes & Lines in Background ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-50"
        viewBox="0 0 170 125"
        fill="none"
      >
        <path
          d="M 35 25 Q 75 40 85 65 Q 115 50 140 25"
          stroke="#A855F7"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <path
          d="M 30 95 Q 60 75 85 65 Q 115 75 145 95"
          stroke="#818CF8"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx="85" cy="65" r="2" fill="#C084FC" />
        <circle cx="120" cy="45" r="1.5" fill="#818CF8" />
        <circle cx="50" cy="55" r="1.5" fill="#C084FC" />
      </svg>

      {/* ── Center 3D Dark Laptop in Pure Vector SVG ── */}
      <motion.div
        animate={{ y: [0, -2.5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-[110px] sm:w-[125px]"
      >
        <svg
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <filter id="compDropShadowDark" x="0" y="140" width="280" height="60" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="9" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.5 0 0 0 0 0.2 0 0 0 0 0.9 0 0 0 0.35 0" />
            </filter>

            <linearGradient id="compDarkScreenBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15102a" />
              <stop offset="50%" stopColor="#0d091a" />
              <stop offset="100%" stopColor="#080512" />
            </linearGradient>

            <linearGradient id="compDarkBezel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2e2452" />
              <stop offset="100%" stopColor="#1a1433" />
            </linearGradient>

            <linearGradient id="compDarkBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d316a" />
              <stop offset="50%" stopColor="#251c44" />
              <stop offset="100%" stopColor="#150f29" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="140" cy="172" rx="105" ry="18" fill="#7C3AED" filter="url(#compDropShadowDark)" />

          {/* Laptop Screen Body */}
          <g transform="translate(0, 5)">
            <rect
              x="52"
              y="22"
              width="176"
              height="114"
              rx="10"
              fill="url(#compDarkBezel)"
              stroke="#58458c"
              strokeWidth="1.2"
            />

            {/* Dark Screen Display */}
            <rect
              x="58"
              y="32"
              width="164"
              height="98"
              rx="6"
              fill="url(#compDarkScreenBg)"
            />

            {/* macOS Top Window Dots */}
            <circle cx="68" cy="40" r="2.2" fill="#EF4444" />
            <circle cx="75" cy="40" r="2.2" fill="#F59E0B" />
            <circle cx="82" cy="40" r="2.2" fill="#10B981" />

            {/* Code Question Prompt Lines */}
            <g transform="translate(68, 50)">
              <rect x="0" y="4" width="70" height="3" rx="1.5" fill="#38BDF8" />
              <rect x="0" y="11" width="115" height="3" rx="1.5" fill="#A855F7" />
              <rect x="0" y="18" width="90" height="3.5" rx="1.75" fill="#E879F9" />
              <rect x="0" y="26" width="125" height="3" rx="1.5" fill="#818CF8" />
              <rect x="0" y="34" width="60" height="3" rx="1.5" fill="#34D399" />
              <rect x="0" y="42" width="105" height="3" rx="1.5" fill="#F472B6" />
              <rect x="0" y="50" width="80" height="3" rx="1.5" fill="#60A5FA" />
            </g>
          </g>

          {/* Laptop Base Keyboard Chassis */}
          <path
            d="M 36 142 L 244 142 C 255 142 265 148 262 158 L 248 168 C 245 170 238 172 230 172 L 50 172 C 42 172 35 170 32 168 L 18 158 C 15 148 25 142 36 142 Z"
            fill="url(#compDarkBase)"
            stroke="#5c4a91"
            strokeWidth="1.2"
          />
          <rect x="118" y="152" width="44" height="12" rx="3" fill="#191333" stroke="#483777" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* ── 4 Floating Company Badges in Dark Glassmorphism ── */}

      {/* 1. Google (Top Left) */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0.5 left-1 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-[9px] bg-[#1a1236]/90 backdrop-blur-md border border-purple-500/35 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span className="text-[9px] font-bold text-white tracking-tight">Google</span>
      </motion.div>

      {/* 2. Amazon (Top Right) */}
      <motion.div
        animate={{ y: [0, -3.5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute top-0 right-1 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-[9px] bg-[#1a1236]/90 backdrop-blur-md border border-purple-500/35 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <span className="text-[9px] font-black text-amber-400 tracking-tight">amazon</span>
      </motion.div>

      {/* 3. LeetCode (Bottom Left) */}
      <motion.div
        animate={{ y: [0, 2.5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-1 left-1 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-[9px] bg-[#1a1236]/90 backdrop-blur-md border border-purple-500/35 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="w-2.5 h-2.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="text-[9px] font-bold text-white tracking-tight">LeetCode</span>
      </motion.div>

      {/* 4. Meta (Bottom Right) */}
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="absolute bottom-2 right-1 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-[9px] bg-[#1a1236]/90 backdrop-blur-md border border-purple-500/35 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="w-2.5 h-2.5 text-[#0081FB] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C10.855 5.31 9.14 4.03 7.172 4.03c-3.454 0-6.172 2.766-6.172 6.643 0 4.148 3.037 7.777 6.472 7.777 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 3.435 0 6.472-3.629 6.472-7.777 0-3.877-2.718-6.643-6.444-6.643z"/>
        </svg>
        <span className="text-[9px] font-bold text-white tracking-tight">Meta</span>
      </motion.div>
    </div>
  );
}
