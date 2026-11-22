"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface LearningSkillsBannerProps {
  onExplore?: (query?: string) => void;
}

export function LearningSkillsBanner({ onExplore }: LearningSkillsBannerProps) {
  // 0 = Programming (Python, Java, C, C++, C#)
  // 1 = Web Development (HTML, CSS, JavaScript, React, Next.js)
  // 2 = Mobile App Development (Kotlin, Swift, Flutter, Dart, React Native)
  // 3 = Backend Development (Node.js, Express.js, Django, Spring Boot, FastAPI)
  // 4 = Database Management (MySQL, PostgreSQL, MongoDB, SQLite, Redis)
  const [activeCategory, setActiveCategory] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleManualNext = () => {
    setActiveCategory((prev) => (prev + 1) % 5);
  };

  // ── 5 Category Configurations ──
  const categories = [
    {
      id: "programming",
      tag: "PROGRAMMING",
      headline: "LANGUAGES",
      tagBg: "#F6AE77",
      tagShadow: "#1E3A5F",
      bgGradient:
        "radial-gradient(circle at 50% 48%, #8E3E23 0%, #5A2616 44%, #32130B 82%, #1F0B06 100%)",
      borderColor: "border-[#7D341D]/60 dark:border-[#5C2413]/80",
      glowColor: "bg-amber-500/18",
      ringColor: "border-orange-200/25",
      exploreQuery: "Python",
    },
    {
      id: "webdev",
      tag: "WEB DEVELOPMENT",
      headline: "SKILLS",
      tagBg: "#86EFAC",
      tagShadow: "#064E3B",
      bgGradient:
        "radial-gradient(circle at 50% 48%, #166534 0%, #14532D 44%, #0F3820 82%, #051A0D 100%)",
      borderColor: "border-[#15803D]/60 dark:border-[#0F3820]/80",
      glowColor: "bg-emerald-400/20",
      ringColor: "border-emerald-200/25",
      exploreQuery: "React",
    },
    {
      id: "mobile",
      tag: "MOBILE APP",
      headline: "DEVELOPMENT",
      tagBg: "#FDE047",
      tagShadow: "#0369A1",
      bgGradient:
        "radial-gradient(circle at 50% 48%, #0369A1 0%, #075985 44%, #082F49 82%, #021422 100%)",
      borderColor: "border-[#0284C7]/60 dark:border-[#082F49]/80",
      glowColor: "bg-sky-400/20",
      ringColor: "border-sky-200/25",
      exploreQuery: "Flutter",
    },
    {
      id: "backend",
      tag: "BACKEND",
      headline: "DEVELOPMENT",
      tagBg: "#F472B6",
      tagShadow: "#4C0519",
      bgGradient:
        "radial-gradient(circle at 50% 48%, #6B21A8 0%, #581C87 44%, #3B0764 82%, #1E0338 100%)",
      borderColor: "border-[#7E22CE]/60 dark:border-[#3B0764]/80",
      glowColor: "bg-purple-400/20",
      ringColor: "border-purple-200/25",
      exploreQuery: "Node.js",
    },
    {
      id: "database",
      tag: "DATABASE",
      headline: "MANAGEMENT",
      tagBg: "#FDBA74",
      tagShadow: "#7C2D12",
      bgGradient:
        "radial-gradient(circle at 50% 48%, #9A3412 0%, #7C2D12 44%, #431407 82%, #220803 100%)",
      borderColor: "border-[#EA580C]/60 dark:border-[#431407]/80",
      glowColor: "bg-orange-500/20",
      ringColor: "border-amber-200/25",
      exploreQuery: "PostgreSQL",
    },
  ];

  const current = categories[activeCategory];

  return (
    <div
      onClick={handleManualNext}
      className={`relative w-full overflow-hidden rounded-none border-b select-none shadow-xl cursor-pointer transition-colors duration-700 ${current.borderColor}`}
    >
      {/* ── Background: Smoothly Crossfading Theme Gradients matching reference images ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full"
          style={{ background: current.bgGradient }}
        />
      </AnimatePresence>

      {/* Ambient Spotlight Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] blur-3xl pointer-events-none rounded-full transition-colors duration-700 ${current.glowColor}`}
      />

      {/* ── Concentric Orbital Radar Track Lines matching reference ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div
          className={`w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border transition-colors duration-700 ${current.ringColor}`}
        />
        <div
          className={`absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border transition-colors duration-700 ${current.ringColor}`}
        />
        <div
          className={`absolute w-[460px] h-[460px] sm:w-[540px] sm:h-[540px] rounded-full border transition-colors duration-700 ${current.ringColor}`}
        />
      </div>

      {/* ── 5 FLOATING 3D ICONS AROUND PERIMETER (Icons drop down on exit & new icons pop in on entrance) ── */}

      {/* ── SLOT 1: Top Left ── */}
      <div className="absolute top-7 left-4 sm:top-9 sm:left-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeCategory === 0 && (
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
                {/* 1. Python */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 128 128" fill="none">
                  <path
                    d="M63.4 8C38.6 8 40.2 18.7 40.2 18.7l.1 11.2h23.7v3.4H30.4S15 31.5 15 56.4s13.4 24.1 13.4 24.1h8v-11.4s-.4-13.6 13.4-13.6h23.3s12.9-.2 12.9-12.7V19.7S87.4 8 63.4 8zM50.6 15.6c2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4z"
                    fill="url(#py-blue-v6)"
                  />
                  <path
                    d="M64.6 120c24.8 0 23.2-10.7 23.2-10.7l-.1-11.2H64v-3.4h33.6s15.4 1.8 15.4-23.1-13.4-24.1-13.4-24.1h-8v11.4s.4 13.6-13.4 13.6H44.9s-12.9.2-12.9 12.7v23.1s-1.4 11.7 22.6 11.7zm12.8-7.6c-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4 2.4 0 4.4 2 4.4 4.4 0 2.4-2 4.4-4.4 4.4z"
                    fill="url(#py-yellow-v6)"
                  />
                  <defs>
                    <linearGradient id="py-blue-v6" x1="15" y1="8" x2="86" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#387EB8" />
                      <stop offset="1" stopColor="#2D6392" />
                    </linearGradient>
                    <linearGradient id="py-yellow-v6" x1="44" y1="56" x2="113" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFE052" />
                      <stop offset="1" stopColor="#E5B800" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 1 && (
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
                  <path d="M10 6 L14 50 L32 58 L50 50 L54 6 Z" fill="#E44D26" />
                  <path d="M32 9 L32 54.5 L46.5 47.8 L50 9 Z" fill="#F16529" />
                  <path d="M18 16 L46 16 L45 22 L24 22 L24.5 28 L44 28 L42.5 43 L32 46.5 L21.5 43 L21 35 L26.5 35 L27 39.5 L32 41.2 L37 39.5 L37.5 33 L19.5 33 Z" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 2 && (
            <motion.div
              key="icon-kotlin"
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
                {/* 1. Kotlin Geometric Ribbon */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M60 4 L4 60 L4 4 Z" fill="url(#kt-grad1)" />
                  <path d="M60 60 L32 32 L60 4 Z" fill="url(#kt-grad2)" />
                  <path d="M4 60 L32 32 L4 4 Z" fill="url(#kt-grad3)" />
                  <defs>
                    <linearGradient id="kt-grad1" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7F52FF" />
                      <stop offset="1" stopColor="#C757BC" />
                    </linearGradient>
                    <linearGradient id="kt-grad2" x1="32" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F88909" />
                      <stop offset="1" stopColor="#E03F34" />
                    </linearGradient>
                    <linearGradient id="kt-grad3" x1="4" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7F52FF" />
                      <stop offset="1" stopColor="#00AFFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 3 && (
            <motion.div
              key="icon-node"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-10, -6, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 1. Node.js Hexagon */}
                <svg className="w-12 h-11 sm:w-14 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="#339933" stroke="#539E43" strokeWidth="2.5" />
                  <path d="M32 10 L50 20.5 L50 43.5 L32 54 L14 43.5 L14 20.5 Z" fill="#215732" />
                  <path d="M32 20 L42 26 L42 38 L32 44 L22 38 L22 26 Z" fill="#FFFFFF" />
                  <path d="M32 24 L38 27.5 L38 36.5 L32 40 L26 36.5 L26 27.5 Z" fill="#339933" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 4 && (
            <motion.div
              key="icon-mysql"
              initial={{ y: -40, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 55, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 360, damping: 20 }}
              className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-10, -6, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* 1. MySQL Dolphin Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#00758F" stroke="#F29111" strokeWidth="2.5" />
                  {/* Leaping Dolphin Silhouette */}
                  <path d="M16 38 C18 30 26 22 38 22 C42 22 47 24 50 27 C46 29 42 32 40 36 C38 40 39 44 42 46 C34 47 28 44 26 40 C24 43 20 46 16 48 C18 45 19 41 16 38 Z" fill="#FFFFFF" />
                  <path d="M32 16 C34 20 33 23 31 25 C29 23 28 19 32 16 Z" fill="#F29111" />
                  <circle cx="43" cy="26" r="2" fill="#00758F" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 2: Bottom Left ── */}
      <div className="absolute bottom-8 left-4 sm:bottom-10 sm:left-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeCategory === 0 && (
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
                {/* 3. C Hexagonal Shield */}
                <svg className="w-13 h-11 sm:w-15 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#c-grad-v6)" stroke="#6C87C1" strokeWidth="2.5" />
                  <path d="M32 10 L50 21 L50 43 L32 54 L14 43 L14 21 Z" fill="#1C2D5A" />
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
                    <linearGradient id="c-grad-v6" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3949AB" />
                      <stop offset="1" stopColor="#1A237E" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 1 && (
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
                  <path d="M10 6 L14 50 L32 58 L50 50 L54 6 Z" fill="#1572B6" />
                  <path d="M32 9 L32 54.5 L46.5 47.8 L50 9 Z" fill="#33A9DC" />
                  <path d="M18 16 L46 16 L45 22 L32 22 L32 28 L44 28 L42.5 43 L32 46.5 L21.5 43 L21 35 L26.5 35 L27 39.5 L32 41.2 L37 39.5 L37.5 33 L24.5 33 L24 22 Z" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 2 && (
            <motion.div
              key="icon-dart"
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
                {/* 4. Dart Multi-color Chevron */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M8 8 L44 8 L56 20 L20 56 L8 44 Z" fill="#0175C2" />
                  <path d="M20 56 L56 20 L56 44 L32 56 Z" fill="#00B4AB" />
                  <path d="M8 8 L32 8 L56 32 L44 44 L8 8 Z" fill="#58B750" />
                  <path d="M22 22 L42 22 L42 42 L22 42 Z" fill="#FFFFFF" opacity="0.9" />
                  <path d="M26 26 L38 26 L38 38 L26 38 Z" fill="#0175C2" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 3 && (
            <motion.div
              key="icon-express"
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
                {/* 2. Express.js Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#18191F" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text
                    x="32"
                    y="41"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="800"
                    fontSize="22"
                    letterSpacing="-1"
                  >
                    ex
                  </text>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 4 && (
            <motion.div
              key="icon-sqlite"
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
                {/* 4. SQLite Feather & DB */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#003B57" stroke="#00A3E0" strokeWidth="2.5" />
                  {/* Database Cylinder Stack */}
                  <ellipse cx="32" cy="22" rx="16" ry="6" fill="#00A3E0" />
                  <path d="M16 22 L16 32 C16 35 23 38 32 38 C41 38 48 35 48 32 L48 22 Z" fill="#0284C7" />
                  <path d="M16 32 L16 42 C16 45 23 48 32 48 C41 48 48 45 48 42 L48 32 Z" fill="#0369A1" />
                  <ellipse cx="32" cy="32" rx="16" ry="6" fill="#38BDF8" opacity="0.6" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 3: Top Right ── */}
      <div className="absolute top-7 right-4 sm:top-9 sm:right-7 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeCategory === 0 && (
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
                  <path d="M32 6 C35 11 31 15 35 19 C38 14 36 10 32 6 Z" fill="url(#java-flame-v6)" />
                  <path d="M26 9 C28 13 25 16 28 20 C31 16 29 12 26 9 Z" fill="url(#java-flame-v6)" />
                  <path d="M16 26 C22 23 42 23 48 26 C43 31 21 31 16 26 Z" fill="#FFFFFF" />
                  <path d="M18 33 C23 30 39 30 44 33 C39 38 23 38 18 33 Z" fill="#FFFFFF" />
                  <path d="M14 40 C22 36 44 36 50 40 C43 46 21 46 14 40 Z" fill="#FFFFFF" />
                  <defs>
                    <linearGradient id="java-flame-v6" x1="26" y1="6" x2="38" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7A00" />
                      <stop offset="1" stopColor="#E52E00" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 1 && (
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

          {activeCategory === 2 && (
            <motion.div
              key="icon-swift"
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
                {/* 2. Apple Swift Bird */}
                <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#sw-grad)" stroke="#FF8A65" strokeWidth="2" />
                  {/* Swift Bird Silhouette */}
                  <path
                    d="M48 42 C42 48 30 50 20 44 C30 42 36 36 38 32 C32 32 26 28 22 22 C30 26 38 27 42 24 C40 20 34 16 26 14 C38 12 48 20 50 28 C52 24 50 18 46 14 C54 20 54 34 48 42 Z"
                    fill="#FFFFFF"
                  />
                  <defs>
                    <linearGradient id="sw-grad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF6E40" />
                      <stop offset="1" stopColor="#F4511E" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 3 && (
            <motion.div
              key="icon-spring"
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
                {/* 4. Spring Boot Leaf */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#6DB33F" stroke="#8AE052" strokeWidth="2.5" />
                  {/* Spring Leaf Silhouette */}
                  <path d="M46 18 C32 18 20 28 20 42 C28 44 42 38 46 18 Z" fill="#FFFFFF" />
                  <path d="M26 36 C34 32 40 26 44 20" stroke="#6DB33F" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 4 && (
            <motion.div
              key="icon-postgres"
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
                {/* 2. PostgreSQL Slonik Elephant Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#336791" stroke="#5C93C4" strokeWidth="2.5" />
                  {/* Elephant Face Silhouette */}
                  <path d="M24 20 C20 20 16 26 18 34 C20 42 24 44 26 44 C26 48 29 50 32 50 C35 50 38 48 38 44 C40 44 44 42 46 34 C48 26 44 20 40 20 C36 18 28 18 24 20 Z" fill="#FFFFFF" />
                  <path d="M30 32 L30 46 C30 48 34 48 34 46 L34 32 Z" fill="#336791" />
                  <circle cx="26" cy="28" r="2" fill="#336791" />
                  <circle cx="38" cy="28" r="2" fill="#336791" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 4: Middle Right ── */}
      <div className="absolute top-[48%] right-3 sm:right-6 -translate-y-1/2 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeCategory === 0 && (
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
                {/* 5. C# Purple Hexagon */}
                <svg className="w-12 h-11 sm:w-14 sm:h-13" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#cs-grad-v6)" stroke="#B388FF" strokeWidth="2.2" />
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
                    <linearGradient id="cs-grad-v6" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8E24AA" />
                      <stop offset="1" stopColor="#4A148C" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 1 && (
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
                  <circle cx="32" cy="32" r="5" fill="#61DAFB" />
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

          {activeCategory === 2 && (
            <motion.div
              key="icon-reactnative"
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
                {/* 5. React Native Phone & Atom */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <rect x="18" y="8" width="28" height="48" rx="6" fill="#0F172A" stroke="#61DAFB" strokeWidth="2" />
                  <circle cx="32" cy="51" r="2" fill="#61DAFB" />
                  <circle cx="32" cy="28" r="3" fill="#61DAFB" />
                  <ellipse cx="32" cy="28" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" />
                  <g transform="rotate(60 32 28)">
                    <ellipse cx="32" cy="28" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" />
                  </g>
                  <g transform="rotate(120 32 28)">
                    <ellipse cx="32" cy="28" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" fill="none" />
                  </g>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 3 && (
            <motion.div
              key="icon-django"
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
                {/* 3. Django Green Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <rect x="6" y="6" width="52" height="52" rx="14" fill="#092E20" stroke="#44B78B" strokeWidth="2" />
                  <text
                    x="32"
                    y="43"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="900"
                    fontSize="28"
                  >
                    dj
                  </text>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 4 && (
            <motion.div
              key="icon-redis"
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
                {/* 5. Redis Ruby Data Stack */}
                <svg className="w-13 h-12 sm:w-15 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <path d="M32 8 L54 18 L32 28 L10 18 Z" fill="#DC382D" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M10 18 L10 32 L32 42 L32 28 Z" fill="#B91C1C" />
                  <path d="M54 18 L54 32 L32 42 L32 28 Z" fill="#991B1B" />
                  {/* Lower Stack Tier */}
                  <path d="M10 36 L10 46 L32 56 L32 46 Z" fill="#B91C1C" />
                  <path d="M54 36 L54 46 L32 56 L32 46 Z" fill="#991B1B" />
                  <circle cx="32" cy="18" r="3" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLOT 5: Bottom Right ── */}
      <div className="absolute bottom-7 right-4 sm:bottom-9 sm:right-6 z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeCategory === 0 && (
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
                {/* 4. C++ Hexagon */}
                <svg className="w-13 h-12 sm:w-15 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill="url(#cpp-grad-v6)" stroke="#38BDF8" strokeWidth="2.5" />
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
                    <linearGradient id="cpp-grad-v6" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#007ACC" />
                      <stop offset="1" stopColor="#004481" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 1 && (
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
                {/* 5. Next.js Dark Emblem */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#000000" stroke="#FFFFFF" strokeWidth="2.2" />
                  <path d="M21 18 L21 46 L27 46 L27 28.5 L41.5 46.5 L46 46.5 L46 18 L40 18 L40 35.5 L25.5 18 Z" fill="url(#next-n-v6)" />
                  <defs>
                    <linearGradient id="next-n-v6" x1="21" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="0.65" stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#888888" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 2 && (
            <motion.div
              key="icon-flutter"
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
                {/* 3. Google Flutter Wing Chevrons */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#042B59" stroke="#54C5F8" strokeWidth="2" />
                  <path d="M38 12 L20 30 L26 36 L48 14 Z" fill="#54C5F8" />
                  <path d="M32 36 L24 44 L32 52 L48 36 Z" fill="#02569B" />
                  <path d="M26 36 L34 44 L44 34 L36 26 Z" fill="#0175C2" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 3 && (
            <motion.div
              key="icon-fastapi"
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
                {/* 5. FastAPI Lightning Bolt Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#059669" stroke="#34D399" strokeWidth="2.5" />
                  {/* Sharp White Lightning Bolt */}
                  <path d="M36 12 L18 34 L30 34 L26 52 L46 28 L34 28 Z" fill="#FFFFFF" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {activeCategory === 4 && (
            <motion.div
              key="icon-mongodb"
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
                {/* 3. MongoDB Leaf Sprout Badge */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#116149" stroke="#13AA52" strokeWidth="2.5" />
                  {/* Organic Leaf Blade */}
                  <path d="M32 10 C32 10 20 22 20 34 C20 44 26 50 32 54 C38 50 44 44 44 34 C44 22 32 10 32 10 Z" fill="#13AA52" />
                  <path d="M32 10 L32 54 C35 52 44 44 44 34 C44 22 32 10 32 10 Z" fill="#00ED64" opacity="0.6" />
                  <path d="M32 18 L32 50" stroke="#001E2B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CENTER CONTENT: Animated Hanging Clipboard Tag + 3D Headline + Explore Button ── */}
      <div className="relative z-20 flex flex-col items-center justify-center py-14 sm:py-18 px-4 min-h-[310px] sm:min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current.id}`}
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
          >
            {/* 1. Hanging Clip Board */}
            <div className="relative mb-[-10px] sm:mb-[-14px] z-10">
              {/* 4 Hanging clips/pins along top border */}
              <div className="absolute -top-1.5 inset-x-0 flex justify-between px-5 pointer-events-none z-20">
                <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
                <span className="w-1.5 h-3.5 bg-black rounded-full ring-1 ring-white/50" />
              </div>

              {/* Under-card shadow layer peeking out matching category shadow */}
              <div
                className="absolute top-1.5 left-1.5 w-full h-full rounded-xl border-2 border-black"
                style={{ backgroundColor: current.tagShadow }}
              />

              {/* Main clipboard tag */}
              <div
                className="relative px-6 sm:px-8 pt-2 pb-2.5 rounded-xl border-2 border-black shadow-md"
                style={{ backgroundColor: current.tagBg }}
              >
                <span className="block font-black text-xs sm:text-sm md:text-base tracking-[0.14em] text-neutral-900 font-sans uppercase">
                  {current.tag}
                </span>
              </div>
            </div>

            {/* 2. Giant Bold 3D White Headline with Comic Drop Shadow */}
            <h2
              className="relative text-[34px] sm:text-[46px] md:text-[56px] font-black tracking-tight text-white select-none leading-none z-20 my-1"
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
              {current.headline}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* 3. Black "Explore now >" Pill Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onExplore?.(current.exploreQuery);
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
