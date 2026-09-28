"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trees, List, Share2, Cog } from "lucide-react";

export function BeginnerLaptopIllustration() {
  return (
    <div className="relative w-[170px] sm:w-[185px] h-[135px] sm:h-[145px] flex items-center justify-center select-none shrink-0 overflow-visible">
      {/* ── Soft Ambient Backlight Glow ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 via-indigo-300/15 to-transparent blur-2xl rounded-full pointer-events-none" />

      {/* ── 3D Isometric Laptop Built in Pure Vector SVG ── */}
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
            {/* Soft Clay Shadow underneath Chassis */}
            <filter id="laptopDropShadow" x="0" y="140" width="280" height="60" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="9" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.28 0 0 0 0 0.85 0 0 0 0.25 0" />
            </filter>

            {/* Laptop Screen Gloss Glare */}
            <linearGradient id="screenGlare" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Chassis Metallic Bevel */}
            <linearGradient id="baseTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="85%" stopColor="#F1F3F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="baseFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            {/* Screen Bezel Gradient */}
            <linearGradient id="screenBezelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EAEFF5" />
            </linearGradient>

            {/* Screen Inner Background */}
            <linearGradient id="screenBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#252438" />
              <stop offset="50%" stopColor="#1E1C2F" />
              <stop offset="100%" stopColor="#171526" />
            </linearGradient>

            {/* Bracket Syntax Glow */}
            <linearGradient id="codeBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#E879F9" />
            </linearGradient>
          </defs>

          {/* ── 1. Soft Diffused Base Shadow ── */}
          <ellipse
            cx="140"
            cy="170"
            rx="105"
            ry="18"
            fill="#6366F1"
            filter="url(#laptopDropShadow)"
          />

          {/* ── 2. Screen Outer Bezel (Tilted Back) ── */}
          <g transform="translate(0, 5)">
            {/* Outer Bezel */}
            <rect
              x="52"
              y="22"
              width="176"
              height="114"
              rx="12"
              fill="url(#screenBezelGrad)"
              stroke="#DDE3EC"
              strokeWidth="1.5"
            />

            {/* Subtle Screen Bezel Rim Highlight */}
            <rect
              x="53"
              y="23"
              width="174"
              height="112"
              rx="11"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
              opacity="0.8"
            />

            {/* Webcam Lens */}
            <circle cx="140" cy="27.5" r="1.5" fill="#4B5563" />

            {/* Dark Code Editor Display */}
            <rect
              x="59"
              y="33"
              width="162"
              height="96"
              rx="7"
              fill="url(#screenBgGrad)"
            />

            {/* Screen Diagonal Glare Layer */}
            <rect
              x="59"
              y="33"
              width="162"
              height="96"
              rx="7"
              fill="url(#screenGlare)"
            />

            {/* ── Code Display Syntax Elements ── */}
            {/* Left Bracket Symbol: </> */}
            <g transform="translate(68, 54)">
              <text
                x="0"
                y="30"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="26"
                fontWeight="900"
                fill="url(#codeBracketGrad)"
                style={{ letterSpacing: "-1px" }}
              >
                &lt;/&gt;
              </text>
            </g>

            {/* Right Side Syntax Code Lines */}
            <g transform="translate(136, 48)">
              {/* Line 1: Cyan / Blue */}
              <rect x="0" y="6" width="34" height="4.5" rx="2.2" fill="#38BDF8" />
              <rect x="38" y="6" width="32" height="4.5" rx="2.2" fill="#818CF8" />

              {/* Line 2: Purple / Pink */}
              <rect x="0" y="16" width="68" height="4.5" rx="2.2" fill="#A855F7" />

              {/* Line 3: Violet Indented */}
              <rect x="8" y="26" width="46" height="4.5" rx="2.2" fill="#C084FC" />
              <rect x="58" y="26" width="16" height="4.5" rx="2.2" fill="#F472B6" />

              {/* Line 4: Bright Sky Bar */}
              <rect x="8" y="36" width="36" height="4.5" rx="2.2" fill="#60A5FA" />

              {/* Line 5: Indigo Bar */}
              <rect x="0" y="46" width="58" height="4.5" rx="2.2" fill="#818CF8" />

              {/* Line 6: Emerald Accent */}
              <rect x="0" y="56" width="28" height="4.5" rx="2.2" fill="#34D399" />
              <rect x="32" y="56" width="22" height="4.5" rx="2.2" fill="#FBBF24" />
            </g>
          </g>

          {/* ── 3. Laptop Chassis Hinge ── */}
          <rect
            x="110"
            y="138"
            width="60"
            height="5"
            rx="2.5"
            fill="#94A3B8"
          />

          {/* ── 4. Laptop Lower Base Surface (Isometric Perspective) ── */}
          {/* Base Top Surface */}
          <path
            d="M 36 142 L 244 142 C 255 142 265 148 262 158 L 248 168 C 245 170 238 172 230 172 L 50 172 C 42 172 35 170 32 168 L 18 158 C 15 148 25 142 36 142 Z"
            fill="url(#baseTopGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Trackpad Area */}
          <rect
            x="118"
            y="152"
            width="44"
            height="15"
            rx="3"
            fill="#EBF0F7"
            stroke="#D5DFEC"
            strokeWidth="0.8"
          />

          {/* Base Front Edge Thickness */}
          <path
            d="M 18 158 L 32 168 C 35 170 42 172 50 172 L 230 172 C 238 172 245 170 248 168 L 262 158 C 263 162 258 167 248 170 L 230 174 L 50 174 L 32 170 C 22 167 17 162 18 158 Z"
            fill="url(#baseFrontGrad)"
          />

          {/* Center Finger Notch */}
          <rect
            x="130"
            y="171"
            width="20"
            height="2"
            rx="1"
            fill="#94A3B8"
          />
        </svg>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          THE 4 FLOATING 3D PILL BADGES (COMPACT SIZING)
          ───────────────────────────────────────────────────────────── */}

      {/* ── 1. Trees Badge (Top Right) ── */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform cursor-default"
      >
        <div className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Trees className="w-2.5 h-2.5 text-emerald-600" />
        </div>
        <span className="text-[10px] font-black text-slate-800 tracking-tight">Trees</span>
      </motion.div>

      {/* ── 2. Arrays Badge (Middle Left) ── */}
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [-8, -6, -8] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 left-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#E1D7FD] via-[#D5C6FB] to-[#C9B4FA] border border-white/80 shadow-[0_4px_12px_rgba(124,58,237,0.18)] hover:scale-105 transition-transform cursor-default"
        style={{ transformOrigin: "center" }}
      >
        <div className="w-4 h-4 rounded-md bg-white/70 flex items-center justify-center shrink-0">
          <List className="w-2.5 h-2.5 text-purple-700" />
        </div>
        <span className="text-[10px] font-black text-purple-900 tracking-tight">Arrays</span>
      </motion.div>

      {/* ── 3. Graphs Badge (Middle Right) ── */}
      <motion.div
        animate={{ y: [0, 4, 0], rotate: [6, 8, 6] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-0 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#FFE4E8] via-[#FFD6DC] to-[#FCC5CE] border border-white/80 shadow-[0_4px_12px_rgba(244,63,94,0.15)] hover:scale-105 transition-transform cursor-default"
        style={{ transformOrigin: "center" }}
      >
        <div className="w-4 h-4 rounded-md bg-white/70 flex items-center justify-center shrink-0">
          <Share2 className="w-2.5 h-2.5 text-rose-600" />
        </div>
        <span className="text-[10px] font-black text-rose-950 tracking-tight">Graphs</span>
      </motion.div>

      {/* ── 4. DP Badge (Bottom Right) ── */}
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [3, 5, 3] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1 right-1 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D] border border-white/80 shadow-[0_4px_12px_rgba(245,158,11,0.18)] hover:scale-105 transition-transform cursor-default"
        style={{ transformOrigin: "center" }}
      >
        <div className="w-4 h-4 rounded-md bg-white/70 flex items-center justify-center shrink-0">
          <Cog className="w-2.5 h-2.5 text-amber-600" />
        </div>
        <span className="text-[10px] font-black text-amber-950 tracking-tight">DP</span>
      </motion.div>
    </div>
  );
}
