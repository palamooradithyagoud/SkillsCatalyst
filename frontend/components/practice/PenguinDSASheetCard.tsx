"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { TOTAL_PENGUIN_PROBLEMS } from "@/data/practice/penguinDsaSheetData";

interface PenguinDSASheetCardProps {
  onSelect?: () => void;
}

export function PenguinDSASheetCard({ onSelect }: PenguinDSASheetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className="w-full max-w-[320px] sm:max-w-[335px] rounded-[20px] bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP BANNER / THUMBNAIL (IDENTICAL PROPORTIONS TO REFERENCE)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[185px] sm:h-[195px] bg-[#0c051f] overflow-hidden">
        <svg
          viewBox="0 0 340 195"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Background Rich Gradient */}
            <linearGradient id="cardCoverBg" x1="0" y1="0" x2="340" y2="195" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0b041c" />
              <stop offset="0.5" stopColor="#18072c" />
              <stop offset="1" stopColor="#250730" />
            </linearGradient>

            {/* Red Ambient Flare Glow */}
            <filter id="redAmbientGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="22" />
            </filter>

            {/* Purple Ambient Flare Glow */}
            <filter id="purpleAmbientGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" />
            </filter>

            {/* Glowing 3D Red Badge Shadow */}
            <filter id="redBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.55" />
            </filter>

            {/* Red Badge Gradient */}
            <linearGradient id="redBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="45%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>

            {/* Tilted Sheet Shadow */}
            <filter id="sheetDropShadow" x="150" y="5" width="130" height="170" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="6" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
            </filter>

            {/* Penguin Body Gradient */}
            <linearGradient id="pBodyGrad" x1="50" y1="40" x2="150" y2="180" gradientUnits="userSpaceOnUse">
              <stop stopColor="#26253b" />
              <stop offset="0.45" stopColor="#151424" />
              <stop offset="1" stopColor="#090812" />
            </linearGradient>

            {/* Penguin Belly Gradient */}
            <linearGradient id="pBellyGrad" x1="100" y1="75" x2="100" y2="165" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.88" stopColor="#F1F3F9" />
              <stop offset="1" stopColor="#DFE3EE" />
            </linearGradient>

            {/* Book Gradient */}
            <linearGradient id="pBookGrad" x1="55" y1="110" x2="155" y2="175" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#4F46E5" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>

            {/* Feet Gradient */}
            <linearGradient id="pFootGrad" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#FB923C" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>

          {/* ── Background Base ── */}
          <rect width="340" height="195" fill="url(#cardCoverBg)" />

          {/* ── Tech Mesh / Circuit Traces Lines in Red & Purple ── */}
          <g opacity="0.22" stroke="#EF4444" strokeWidth="1">
            <line x1="0" y1="35" x2="340" y2="35" strokeDasharray="3 6" />
            <line x1="0" y1="85" x2="340" y2="85" strokeDasharray="2 8" />
            <line x1="0" y1="145" x2="340" y2="145" strokeDasharray="4 6" />
            <line x1="60" y1="0" x2="60" y2="195" strokeDasharray="2 6" />
            <line x1="150" y1="0" x2="150" y2="195" strokeDasharray="3 7" />
            <line x1="260" y1="0" x2="260" y2="195" strokeDasharray="2 6" />
          </g>

          {/* ── Ambient Glow Flares (Red Left + Purple Right) ── */}
          <circle cx="85" cy="100" r="55" fill="#EF4444" opacity="0.32" filter="url(#redAmbientGlow)" />
          <circle cx="260" cy="95" r="65" fill="#8B5CF6" opacity="0.26" filter="url(#purpleAmbientGlow)" />

          {/* ─────────────────────────────────────────────────────────────
              LEFT SIDE: "PENGUIN" + GLOWING RED "DSA SHEET" BADGE
              ───────────────────────────────────────────────────────────── */}
          <g transform="translate(18, 48)">
            {/* White Title "PENGUIN" */}
            <text
              x="3"
              y="16"
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="900"
              letterSpacing="1.8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              PENGUIN
            </text>

            {/* Glowing Red Rounded Box */}
            <g filter="url(#redBadgeShadow)">
              <rect
                x="0"
                y="27"
                width="134"
                height="46"
                rx="10"
                fill="url(#redBadgeGrad)"
                stroke="#FECACA"
                strokeWidth="1.2"
                strokeOpacity="0.45"
              />
            </g>

            {/* Text inside Red Badge: "DSA" (White) + "SHEET" (Yellow) */}
            <text
              x="10"
              y="59"
              fill="#FFFFFF"
              fontSize="23"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              DSA
            </text>
            <text
              x="62"
              y="59"
              fill="#FDE047"
              fontSize="23"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              SHEET
            </text>
          </g>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT SIDE: 3D PENGUIN + TILTED DSA CHECKLIST SHEET
              ───────────────────────────────────────────────────────────── */}
          <g transform="translate(160, 5)">
            {/* 1. Tilted White "DSA" Checklist Sheet */}
            <g transform="rotate(13 115 70)">
              {/* Sheet Shadow */}
              <rect
                x="68"
                y="10"
                width="78"
                height="115"
                rx="10"
                fill="black"
                opacity="0.3"
                filter="url(#sheetDropShadow)"
              />
              {/* White Sheet Surface */}
              <rect
                x="68"
                y="10"
                width="78"
                height="115"
                rx="10"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1.2"
              />
              {/* "DSA" Heading on Sheet */}
              <text
                x="80"
                y="29"
                fill="#64748B"
                fontSize="11"
                fontWeight="900"
                letterSpacing="1"
                fontFamily="system-ui, sans-serif"
              >
                DSA
              </text>
              {/* Checkmark Circle 1 */}
              <circle cx="85" cy="41" r="5" fill="#7C3AED" />
              <path
                d="M83 41L84.5 42.5L87.5 39.5"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="94" y="39.5" width="42" height="3" rx="1.5" fill="#E2E8F0" />

              {/* Checklist Lines */}
              <rect x="80" y="52" width="56" height="3.5" rx="1.75" fill="#F1F5F9" />
              <rect x="80" y="62" width="46" height="3.5" rx="1.75" fill="#F1F5F9" />
              <rect x="80" y="72" width="52" height="3.5" rx="1.75" fill="#F1F5F9" />
              <rect x="80" y="82" width="40" height="3.5" rx="1.75" fill="#F1F5F9" />
              <rect x="80" y="92" width="48" height="3.5" rx="1.75" fill="#F1F5F9" />
              <rect x="80" y="102" width="34" height="3.5" rx="1.75" fill="#F1F5F9" />
            </g>

            {/* 2. Purple Spark Rays above Penguin (\ | /) */}
            <g opacity="0.85">
              <rect x="18" y="38" width="3" height="10" rx="1.5" fill="#C084FC" transform="rotate(-38 20 43)" />
              <rect x="27" y="27" width="3" height="11" rx="1.5" fill="#A855F7" />
              <rect x="40" y="34" width="3" height="10" rx="1.5" fill="#C084FC" transform="rotate(35 42 39)" />
            </g>

            {/* 3. Penguin Feet */}
            <path
              d="M38 148 C32 148 27 153 30 161 C32 167 41 169 47 165 C51 162 52 154 48 149 C45 148 42 148 38 148 Z"
              fill="url(#pFootGrad)"
            />
            <path
              d="M89 148 C85 148 81 152 82 157 C84 165 92 169 97 165 C101 161 102 154 98 149 C95 148 92 148 89 148 Z"
              fill="url(#pFootGrad)"
            />

            {/* 4. Penguin Torso & Face */}
            <ellipse cx="64" cy="112" rx="38" ry="44" fill="url(#pBodyGrad)" />
            <ellipse cx="64" cy="74" rx="30" ry="10" fill="#FFFFFF" opacity="0.08" />

            {/* White Face & Belly Mask */}
            <path
              d="M64 78 C51 78 42 88 42 103 C42 123 50 148 64 148 C78 148 86 123 86 103 C86 88 77 78 64 78 Z"
              fill="url(#pBellyGrad)"
            />

            {/* Eyes */}
            <ellipse cx="54" cy="99" rx="3.8" ry="5" fill="#111827" />
            <circle cx="52.8" cy="97.5" r="1.6" fill="#FFFFFF" />
            <circle cx="55.2" cy="101.5" r="0.6" fill="#FFFFFF" />

            <ellipse cx="74" cy="99" rx="3.8" ry="5" fill="#111827" />
            <circle cx="72.8" cy="97.5" r="1.6" fill="#FFFFFF" />
            <circle cx="75.2" cy="101.5" r="0.6" fill="#FFFFFF" />

            {/* Pink Cheek Blush */}
            <ellipse cx="48" cy="107" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.4" />
            <ellipse cx="80" cy="107" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.4" />

            {/* Beak */}
            <path
              d="M59 101 C59 101 64 110 64 110 C64 110 69 101 69 101 C71 98 57 98 59 101 Z"
              fill="#FB923C"
            />
            <ellipse cx="64" cy="101.5" rx="4" ry="1.5" fill="#FDBA74" opacity="0.6" />

            {/* 5. Open Book with </> Symbol */}
            <path
              d="M26 121 L64 129 L102 121 L99 156 L64 164 L28 156 Z"
              fill="url(#pBookGrad)"
              stroke="#4338CA"
              strokeWidth="1.2"
            />
            {/* Left Page */}
            <path
              d="M28 123 C39 120 52 123 63 128 L62 161 C51 157 39 154 30 155 Z"
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="0.6"
            />
            {/* Right Page */}
            <path
              d="M65 128 C76 123 89 120 100 123 L98 155 C89 154 77 157 66 161 Z"
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="0.6"
            />
            {/* Spine */}
            <line x1="64" y1="127" x2="64" y2="162" stroke="#CBD5E1" strokeWidth="1" />

            {/* Code Symbol "</>" */}
            <path
              d="M47 138 L42 141.5 L47 145"
              stroke="#4338CA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="61.5"
              y1="137"
              x2="66.5"
              y2="146"
              stroke="#4338CA"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M81 138 L86 141.5 L81 145"
              stroke="#4338CA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 6. Flippers Holding Book */}
            <path
              d="M36 120 C28 123 24 131 27 138 C29 143 37 142 39 135 C41 128 39 122 36 120 Z"
              fill="#151424"
            />
            <path
              d="M92 120 C100 123 104 131 101 138 C99 143 91 142 89 135 C87 128 89 122 92 120 Z"
              fill="#151424"
            />
          </g>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CARD BODY (MATCHES STRIVER REFERENCE EXACTLY)
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 pt-3.5 sm:pt-4 bg-white flex flex-col justify-between flex-1 text-left">
        <div>
          {/* Title */}
          <h3 className="text-slate-900 font-extrabold text-[17px] sm:text-[18px] tracking-tight group-hover:text-purple-600 transition-colors leading-snug">
            Penguin&apos;s A2Z DSA Sheet
          </h3>

          {/* Subtitle / Curated By */}
          <p className="text-slate-500 font-medium text-xs sm:text-[13px] mt-1">
            Curated by SkillsCatalyst
          </p>
        </div>

        {/* Problems Count with Bookmark/Book Icon */}
        <div className="flex items-center gap-1.5 text-slate-700 text-xs sm:text-[13px] font-semibold mt-3.5 pt-2.5 border-t border-slate-100">
          <Bookmark className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{TOTAL_PENGUIN_PROBLEMS} Problems</span>
        </div>
      </div>
    </motion.div>
  );
}
