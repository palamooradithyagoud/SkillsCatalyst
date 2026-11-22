"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface LearningSkillsBannerProps {
  onExplore?: () => void;
}

export function LearningSkillsBanner({ onExplore }: LearningSkillsBannerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-none rounded-b-[28px] sm:rounded-b-[34px] border-b border-[#4A1E11]/60 select-none shadow-2xl">
      {/* ── Background: Rich Warm Copper / Chestnut Gradient with Ambient Radial Center Glow ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, #8E3E23 0%, #5A2616 42%, #32130B 80%, #200B06 100%)",
        }}
      />

      {/* Subtle Warm Amber Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] bg-amber-500/18 blur-3xl pointer-events-none rounded-full" />

      {/* ── Concentric Orbital Radar Track Lines ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] rounded-full border border-orange-200/25" />
        <div className="absolute w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] rounded-full border border-orange-200/20" />
        <div className="absolute w-[390px] h-[390px] sm:w-[460px] sm:h-[460px] rounded-full border border-orange-200/15" />
      </div>

      {/* ── Floating 3D Vector Icons Around the Perimeter ── */}

      {/* 1. Top Left: Python 3D Logo */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-14, -10, -14] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-4 sm:top-6 sm:left-7 z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="w-9 h-9 sm:w-11 sm:h-11" viewBox="0 0 128 128" fill="none">
          {/* Blue top snake */}
          <path
            d="M63.4 8C38.6 8 40.2 18.7 40.2 18.7l.1 11.2h23.7v3.4H30.4S15 31.5 15 56.4s13.4 24.1 13.4 24.1h8v-11.4s-.4-13.6 13.4-13.6h23.3s12.9-.2 12.9-12.7V19.7S87.4 8 63.4 8zM50.6 15.6c2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4z"
            fill="url(#py-blue)"
          />
          {/* Yellow bottom snake */}
          <path
            d="M64.6 120c24.8 0 23.2-10.7 23.2-10.7l-.1-11.2H64v-3.4h33.6s15.4 1.8 15.4-23.1-13.4-24.1-13.4-24.1h-8v11.4s.4 13.6-13.4 13.6H44.9s-12.9.2-12.9 12.7v23.1s-1.4 11.7 22.6 11.7zm12.8-7.6c-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4 2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4z"
            fill="url(#py-yellow)"
          />
          <defs>
            <linearGradient id="py-blue" x1="15" y1="8" x2="86" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#387EB8" />
              <stop offset="1" stopColor="#2D6392" />
            </linearGradient>
            <linearGradient id="py-yellow" x1="44" y1="56" x2="113" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFE052" />
              <stop offset="1" stopColor="#E5B800" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* 2. Bottom Left: 3D Code Brackets </> */}
      <motion.div
        animate={{ y: [0, 6, 0], rotate: [-18, -13, -18] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute bottom-4 left-4 sm:bottom-6 sm:left-7 z-10"
      >
        <svg
          className="w-12 h-10 sm:w-14 sm:h-12 drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
          viewBox="0 0 64 48"
          fill="none"
        >
          {/* Left bracket */}
          <path
            d="M20 10 L6 24 L20 38"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Middle slash */}
          <path
            d="M36 8 L28 40"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Right bracket */}
          <path
            d="M44 10 L58 24 L44 38"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* 3. Top Right: Java Coffee Logo with Glowing Steam */}
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [12, 16, 12] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="absolute top-4 right-4 sm:top-5 sm:right-7 z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 64 64" fill="none">
          {/* Orange glowing steam flames */}
          <path
            d="M32 6 C35 11 31 15 35 19 C38 14 36 10 32 6 Z"
            fill="url(#java-flame)"
          />
          <path
            d="M26 9 C28 13 25 16 28 20 C31 16 29 12 26 9 Z"
            fill="url(#java-flame)"
          />
          {/* White coffee cup saucer ripples */}
          <path
            d="M16 26 C22 23 42 23 48 26 C43 31 21 31 16 26 Z"
            fill="#FFFFFF"
          />
          <path
            d="M18 33 C23 30 39 30 44 33 C39 38 23 38 18 33 Z"
            fill="#FFFFFF"
          />
          <path
            d="M14 40 C22 36 44 36 50 40 C43 46 21 46 14 40 Z"
            fill="#FFFFFF"
          />
          <defs>
            <linearGradient id="java-flame" x1="26" y1="6" x2="38" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7A00" />
              <stop offset="1" stopColor="#E52E00" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* 4. Middle Right: 3D Open Book */}
      <motion.div
        animate={{ y: [0, 4, 0], rotate: [6, 10, 6] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute top-[44%] right-3 sm:right-5 -translate-y-1/2 z-10 drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)]"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none">
          {/* Blue spine and cover */}
          <path
            d="M24 14 C20 10 10 10 4 13 L4 37 C10 34 20 34 24 38 C28 34 38 34 44 37 L44 13 C38 10 28 10 24 14 Z"
            fill="#2563EB"
            stroke="#1D4ED8"
            strokeWidth="1.5"
          />
          {/* White pages left */}
          <path
            d="M23 15 C19 11.5 10 11.5 6 14 L6 35 C10 32.5 19 32.5 23 36 Z"
            fill="#FFFFFF"
          />
          {/* White pages right */}
          <path
            d="M25 15 C29 11.5 38 11.5 42 14 L42 35 C38 32.5 29 32.5 25 36 Z"
            fill="#F8FAFC"
          />
        </svg>
      </motion.div>

      {/* 5. Bottom Right: Isometric 3D Laptop with </> Screen */}
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [-10, -6, -10] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-3 right-4 sm:bottom-4 sm:right-7 z-10 drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]"
      >
        <svg className="w-13 h-11 sm:w-16 sm:h-13" viewBox="0 0 68 56" fill="none">
          {/* Base bottom */}
          <path
            d="M10 42 L34 52 L58 42 L34 33 Z"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Keyboard recessed area */}
          <path
            d="M16 41 L34 48 L52 41 L34 35 Z"
            fill="#94A3B8"
          />
          {/* Screen upright casing */}
          <path
            d="M16 35 L52 35 L48 10 L20 10 Z"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Blue screen display */}
          <path
            d="M19 33 L49 33 L46 13 L22 13 Z"
            fill="#1D4ED8"
          />
          {/* </> on screen */}
          <path
            d="M28 20 L25 23 L28 26"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M37 20 L40 23 L37 26"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 19 L31 27"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* ── Center Content: The LEARNING SKILLS Sign & Explore Button ── */}
      <div className="relative z-20 flex flex-col items-center justify-center py-7 sm:py-9 px-4">
        {/* 1. The Hanging Clip Board with "LEARNING" */}
        <div className="relative mb-[-10px] sm:mb-[-14px] z-10">
          {/* 4 Hanging clips/pins along top border */}
          <div className="absolute -top-1.5 inset-x-0 flex justify-between px-5 pointer-events-none z-20">
            <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
            <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
            <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
            <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
          </div>

          {/* Under-card shadow layer peeking out (Navy/Blue block shadow matching reference) */}
          <div className="absolute top-1.5 left-1.5 w-full h-full rounded-xl bg-[#1E3A5F] border-2 border-black" />

          {/* Main peach/cardboard tag */}
          <div className="relative px-6 sm:px-8 pt-2 pb-2.5 rounded-xl bg-[#F6AE77] border-2 border-black shadow-md">
            <span className="block font-black text-xs sm:text-sm md:text-base tracking-[0.14em] text-neutral-900 font-sans uppercase">
              LEARNING
            </span>
          </div>
        </div>

        {/* 2. Giant Bold 3D White "SKILLS" with Heavy Comic Black Drop Shadow */}
        <h2
          className="relative text-[46px] sm:text-[58px] md:text-[68px] font-black tracking-tight text-white select-none leading-none z-20 my-1"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Montserrat", sans-serif',
            textShadow: `
              -2.5px -2.5px 0 #000,
               2.5px -2.5px 0 #000,
              -2.5px  2.5px 0 #000,
               2.5px  2.5px 0 #000,
               0px    4px   0 #000,
               0px    6px   0 #000,
               0px    8px   0 #000,
               1px    8px   0 #000,
              -1px    8px   0 #000,
               2px    8px   0 #000,
              -2px    8px   0 #000,
               0px    12px  18px rgba(0, 0, 0, 0.75)
            `,
          }}
        >
          SKILLS
        </h2>

        {/* 3. Black "Explore now >" Pill Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExplore}
          className="mt-2.5 inline-flex items-center gap-1.5 px-5 sm:px-6 py-2 rounded-full bg-black/95 hover:bg-black text-white text-xs sm:text-sm font-bold border border-white/80 shadow-[0_6px_16px_rgba(0,0,0,0.6)] cursor-pointer transition-transform active:scale-95"
        >
          <span>Explore now</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.8]" />
        </motion.button>
      </div>
    </div>
  );
}

export default LearningSkillsBanner;
