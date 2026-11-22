"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface LearningSkillsBannerProps {
  onExplore?: (category?: string) => void;
}

export function LearningSkillsBanner({ onExplore }: LearningSkillsBannerProps) {
  // 0 = Programming Languages (Python, Java, C, C++, C#)
  // 1 = Web Development Skills (HTML, CSS, JS, React, Next.js)
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleManualToggle = () => {
    setActiveSlide((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div
      onClick={handleManualToggle}
      className={`relative w-full overflow-hidden rounded-none border-b select-none shadow-xl cursor-pointer transition-colors duration-700 ${
        activeSlide === 0
          ? "border-[#7D341D]/60 dark:border-[#5C2413]/80"
          : "border-[#15803D]/60 dark:border-[#0F3820]/80"
      }`}
    >
      {/* ── Background: Smoothly Crossfading Theme Gradients ── */}
      <AnimatePresence mode="wait">
        {activeSlide === 0 ? (
          <motion.div
            key="bg-programming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, #8E3E23 0%, #5A2616 44%, #32130B 82%, #1F0B06 100%)",
            }}
          />
        ) : (
          <motion.div
            key="bg-webdev"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, #166534 0%, #14532D 44%, #0F3820 82%, #051A0D 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient Spotlight Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] blur-3xl pointer-events-none rounded-full transition-colors duration-700 ${
          activeSlide === 0 ? "bg-amber-500/18" : "bg-emerald-400/20"
        }`}
      />

      {/* ── Concentric Orbital Radar Track Lines matching reference ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div
          className={`w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border transition-colors duration-700 ${
            activeSlide === 0 ? "border-orange-200/25" : "border-emerald-200/25"
          }`}
        />
        <div
          className={`absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border transition-colors duration-700 ${
            activeSlide === 0 ? "border-orange-200/20" : "border-emerald-200/20"
          }`}
        />
        <div
          className={`absolute w-[460px] h-[460px] sm:w-[540px] sm:h-[540px] rounded-full border transition-colors duration-700 ${
            activeSlide === 0 ? "border-orange-200/15" : "border-emerald-200/15"
          }`}
        />
      </div>

      {/* ── 5 FLOATING 3D ICONS AROUND PERIMETER (Icons drop down & new icons pop in) ── */}

      {/* ── SLOT 1: Top Left (Python vs HTML5) ── */}
      <div className="absolute top-7 left-4 sm:top-9 sm:left-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="icon-python"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-14, -10, -14] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 1. Python 3D Logo */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 128 128" fill="none">
                  <path
                    d="M63.4 8C38.6 8 40.2 18.7 40.2 18.7l.1 11.2h23.7v3.4H30.4S15 31.5 15 56.4s13.4 24.1 13.4 24.1h8v-11.4s-.4-13.6 13.4-13.6h23.3s12.9-.2 12.9-12.7V19.7S87.4 8 63.4 8zM50.6 15.6c2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4z"
                    fill="url(#py-blue-v5)"
                  />
                  <path
                    d="M64.6 120c24.8 0 23.2-10.7 23.2-10.7l-.1-11.2H64v-3.4h33.6s15.4 1.8 15.4-23.1-13.4-24.1-13.4-24.1h-8v11.4s.4 13.6-13.4 13.6H44.9s-12.9.2-12.9 12.7v23.1s-1.4 11.7 22.6 11.7zm12.8-7.6c-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4 2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4z"
                    fill="url(#py-yellow-v5)"
                  />
                  <defs>
                    <linearGradient id="py-blue-v5" x1="15" y1="8" x2="86" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#387EB8" />
                      <stop offset="1" stopColor="#2D6392" />
                    </linearGradient>
                    <linearGradient id="py-yellow-v5" x1="44" y1="56" x2="113" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFE052" />
                      <stop offset="1" stopColor="#E5B800" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-html"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-12, -8, -12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 1. HTML5 3D Shield */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  {/* Outer shield */}
                  <path d="M10 6 L14 50 L32 58 L50 50 L54 6 Z" fill="#E44D26" />
                  {/* Right half darker */}
                  <path d="M32 9 L32 54.5 L46.5 47.8 L50 9 Z" fill="#F16529" />
                  {/* Stylized '5' white ribbon */}
                  <path d="M18 16 L46 16 L45 22 L24 22 L24.5 28 L44 28 L42.5 43 L32 46.5 L21.5 43 L21 35 L26.5 35 L27 39.5 L32 41.2 L37 39.5 L37.5 33 L19.5 33 Z" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 2: Bottom Left (C vs CSS3) ── */}
      <div className="absolute bottom-8 left-4 sm:bottom-10 sm:left-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="icon-c"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.05 }}
              className="drop-shadow-[0_10px_18px_rgba(0,0,0,0.7)]"
            >
              <motion.div
                animate={{ y: [0, 6, 0], rotate: [-16, -11, -16] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 3. C 3D Hexagonal Shield */}
                <svg className="w-13 h-11 sm:w-15 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#c-grad-v5)" stroke="#6C87C1" strokeWidth="2.5" />
                  <path d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z" fill="#1C2D5A" />
                  {/* Bold 3D White 'C' */}
                  <text
                    x="32"
                    y="43"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="32"
                    style={{ textShadow: "0 4px 6px rgba(0,0,0,0.8)" }}
                  >
                    C
                  </text>
                  <defs>
                    <linearGradient id="c-grad-v5" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3949AB" />
                      <stop offset="1" stopColor="#1A237E" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-css"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.05 }}
              className="drop-shadow-[0_10px_18px_rgba(0,0,0,0.7)]"
            >
              <motion.div
                animate={{ y: [0, 6, 0], rotate: [-16, -11, -16] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 2. CSS3 3D Shield */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  {/* Outer shield */}
                  <path d="M10 6 L14 50 L32 58 L50 50 L54 6 Z" fill="#1572B6" />
                  {/* Right half lighter */}
                  <path d="M32 9 L32 54.5 L46.5 47.8 L50 9 Z" fill="#33A9DC" />
                  {/* Stylized '3' white ribbon */}
                  <path d="M18 16 L46 16 L45 22 L32 22 L32 28 L44 28 L42.5 43 L32 46.5 L21.5 43 L21 35 L26.5 35 L27 39.5 L32 41.2 L37 39.5 L37.5 33 L24.5 33 L24 22 Z" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 3: Top Right (Java vs JavaScript) ── */}
      <div className="absolute top-7 right-4 sm:top-9 sm:right-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="icon-java"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.08 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [12, 16, 12] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 2. Java Coffee & Steam Logo */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <path d="M32 6 C35 11 31 15 35 19 C38 14 36 10 32 6 Z" fill="url(#java-flame-v5)" />
                  <path d="M26 9 C28 13 25 16 28 20 C31 16 29 12 26 9 Z" fill="url(#java-flame-v5)" />
                  <path d="M16 26 C22 23 42 23 48 26 C43 31 21 31 16 26 Z" fill="#FFFFFF" />
                  <path d="M18 33 C23 30 39 30 44 33 C39 38 23 38 18 33 Z" fill="#FFFFFF" />
                  <path d="M14 40 C22 36 44 36 50 40 C43 46 21 46 14 40 Z" fill="#FFFFFF" />
                  <defs>
                    <linearGradient id="java-flame-v5" x1="26" y1="6" x2="38" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7A00" />
                      <stop offset="1" stopColor="#E52E00" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-js"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.08 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [10, 15, 10] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 3. JavaScript Gold Squircle */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <rect x="4" y="4" width="56" height="56" rx="14" fill="#F7DF1E" stroke="#E5CB00" strokeWidth="2" />
                  <text
                    x="34"
                    y="45"
                    textAnchor="middle"
                    fill="#000000"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="28"
                    letterSpacing="1"
                  >
                    JS
                  </text>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 4: Middle Right (C# vs React) ── */}
      <div className="absolute top-[48%] right-3 sm:right-6 -translate-y-1/2 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="icon-csharp"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.12 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, 5, 0], rotate: [6, 11, 6] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 5. C# 3D Purple Hexagon */}
                <svg className="w-12 h-11 sm:w-14 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#cs-grad-v5)" stroke="#B388FF" strokeWidth="2.2" />
                  <path d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z" fill="#3B1254" />
                  <text
                    x="32"
                    y="42"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="25"
                    style={{ textShadow: "0 3px 6px rgba(0,0,0,0.8)" }}
                  >
                    C#
                  </text>
                  <defs>
                    <linearGradient id="cs-grad-v5" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8E24AA" />
                      <stop offset="1" stopColor="#4A148C" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-react"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.12 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, 5, 0], rotate: [0, 360] }}
                transition={{
                  y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                }}
              >
                {/* 4. React Cyan Atom Logo */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  {/* Nucleus */}
                  <circle cx="32" cy="32" r="5" fill="#61DAFB" />
                  {/* 3 Orbital Ellipses */}
                  <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#61DAFB" strokeWidth="2.4" fill="none" />
                  <g transform="rotate(60 32 32)">
                    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#61DAFB" strokeWidth="2.4" fill="none" />
                  </g>
                  <g transform="rotate(120 32 32)">
                    <ellipse cx="32" cy="32" rx="26" ry="10" stroke="#61DAFB" strokeWidth="2.4" fill="none" />
                  </g>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 5: Bottom Right (C++ vs Next.js) ── */}
      <div className="absolute bottom-7 right-4 sm:bottom-9 sm:right-6 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="icon-cpp"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.15 }}
              className="drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]"
            >
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [-10, -5, -10] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 4. C++ 3D Blue Hexagon */}
                <svg className="w-13 h-12 sm:w-15 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#cpp-grad-v5)" stroke="#38BDF8" strokeWidth="2.5" />
                  <path d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z" fill="#0C3466" />
                  <text
                    x="32"
                    y="42"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="24"
                    style={{ textShadow: "0 4px 6px rgba(0,0,0,0.8)" }}
                  >
                    C++
                  </text>
                  <defs>
                    <linearGradient id="cpp-grad-v5" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#007ACC" />
                      <stop offset="1" stopColor="#004481" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-nextjs"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20, delay: 0.15 }}
              className="drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]"
            >
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [-8, -4, -8] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 5. Next.js 3D Dark Circular Emblem */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#000000" stroke="#FFFFFF" strokeWidth="2.2" />
                  {/* Next.js 'N' with cut gradient stroke */}
                  <path d="M21 18 L21 46 L27 46 L27 28.5 L41.5 46.5 L46 46.5 L46 18 L40 18 L40 35.5 L25.5 18 Z" fill="url(#next-n-v5)" />
                  <defs>
                    <linearGradient id="next-n-v5" x1="21" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="0.65" stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#888888" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CENTER CONTENT: Animated Hanging Clipboard Tag + 3D Headline + Explore Button ── */}
      <div className="relative z-20 flex flex-col items-center justify-center py-14 sm:py-18 px-4 min-h-[310px] sm:min-h-[350px]">
        <AnimatePresence mode="wait">
          {activeSlide === 0 ? (
            <motion.div
              key="content-programming"
              initial={{ opacity: 0, y: -18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              {/* 1. Hanging Clip Board with "PROGRAMMING" */}
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
                    PROGRAMMING
                  </span>
                </div>
              </div>

              {/* 2. Giant Bold 3D White "LANGUAGES" with Heavy Comic Black Drop Shadow */}
              <h2
                className="relative text-[36px] sm:text-[48px] md:text-[58px] font-black tracking-tight text-white select-none leading-none z-20 my-1"
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
                LANGUAGES
              </h2>
            </motion.div>
          ) : (
            <motion.div
              key="content-webdev"
              initial={{ opacity: 0, y: -18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              {/* 1. Hanging Clip Board with "WEB DEVELOPMENT" */}
              <div className="relative mb-[-10px] sm:mb-[-14px] z-10">
                {/* 4 Hanging clips/pins along top border */}
                <div className="absolute -top-1.5 inset-x-0 flex justify-between px-5 pointer-events-none z-20">
                  <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                  <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                  <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                  <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                </div>

                {/* Under-card shadow layer peeking out (Forest Green block shadow) */}
                <div className="absolute top-1.5 left-1.5 w-full h-full rounded-xl bg-[#064E3B] border-2 border-black" />

                {/* Main mint/lime tag */}
                <div className="relative px-6 sm:px-8 pt-2 pb-2.5 rounded-xl bg-[#86EFAC] border-2 border-black shadow-md">
                  <span className="block font-black text-xs sm:text-sm md:text-base tracking-[0.14em] text-neutral-900 font-sans uppercase">
                    WEB DEVELOPMENT
                  </span>
                </div>
              </div>

              {/* 2. Giant Bold 3D White "SKILLS" with Heavy Comic Black Drop Shadow */}
              <h2
                className="relative text-[48px] sm:text-[62px] md:text-[72px] font-black tracking-tight text-white select-none leading-none z-20 my-1"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Black "Explore now >" Pill Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onExplore?.(activeSlide === 0 ? "Programming Languages" : "Web Development");
          }}
          className="mt-3 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black/95 hover:bg-black text-white text-xs sm:text-sm font-bold border border-white/80 shadow-[0_6px_16px_rgba(0,0,0,0.6)] cursor-pointer transition-transform active:scale-95"
        >
          <span>Explore now</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.8]" />
        </motion.button>
      </div>
    </div>
  );
}

export default LearningSkillsBanner;
