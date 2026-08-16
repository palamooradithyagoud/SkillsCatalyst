"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTransition } from "@/providers/TransitionProvider";

export default function LogoTransitionOverlay() {
  const { isTransitionActive, dashboardReady, finishLogoTransition } = useTransition();
  const [mounted, setMounted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Total stroke animation duration: 2.6s draw + 0.4s hold = 3.0s minimum duration
  const drawDuration = 2.6;
  const holdDuration = 0.4;
  const minDuration = drawDuration + holdDuration; // 3.0s

  useEffect(() => {
    setMounted(true);
    // Check user reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Timer loop for 3.0s minimum animation duration
  useEffect(() => {
    if (!isTransitionActive) {
      setAnimationComplete(false);
      setIsFadingOut(false);
      return;
    }

    if (prefersReducedMotion) {
      setAnimationComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, minDuration * 1000);

    return () => clearTimeout(timer);
  }, [isTransitionActive, minDuration, prefersReducedMotion]);

  // Safety fallback timeout (7 seconds max) in case API fails
  useEffect(() => {
    if (!isTransitionActive) return;

    const safetyTimer = setTimeout(() => {
      triggerFadeOut();
    }, 7000);

    return () => clearTimeout(safetyTimer);
  }, [isTransitionActive]);

  // Trigger 300ms fade-out once BOTH animation complete (3.0s) AND dashboard data is ready
  useEffect(() => {
    if (isTransitionActive && (animationComplete || prefersReducedMotion) && dashboardReady && !isFadingOut) {
      triggerFadeOut();
    }
  }, [isTransitionActive, animationComplete, dashboardReady, isFadingOut, prefersReducedMotion]);

  const triggerFadeOut = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      finishLogoTransition();
      setIsFadingOut(false);
      setAnimationComplete(false);
    }, 320); // 300ms fade duration
  };

  if (!mounted || !isTransitionActive) return null;

  // Path geometry for the white V/W ascending growth line
  // P0: (60, 420)   - 0.00s
  // P1: (220, 270)  - 0.45s (Person 1 revealed)
  // P2: (310, 330)  - 0.95s (Person 2 revealed)
  // P3: (470, 190)  - 1.45s (Person 3 revealed)
  // P4: (550, 250)  - 1.90s
  // P5: (760, 90)   - 2.15s - 2.60s (Person 4 with Red Flag revealed at 735, 109)
  // Tip: (795, 65)  - Final Arrowhead
  const arrowPath = "M 60,420 L 220,270 L 310,330 L 470,190 L 550,250 L 760,90";

  // Coordinates for the subtle cyan light drawing tip traveling at current stroke front
  const orbX = [60, 220, 310, 470, 550, 760, 795];
  const orbY = [420, 270, 330, 190, 250, 90, 65];
  const orbTimes = [0, 0.17, 0.35, 0.55, 0.72, 0.93, 1];

  const overlayContent = (
    <AnimatePresence>
      <motion.div
        key="logo-transition-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-gradient-to-br from-[#e8f1f9] via-[#e2edf7] to-[#d6e5f3] select-none overflow-hidden"
        style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
      >
        {/* Main 16:9 Artwork Canvas Box */}
        <div className="w-full max-w-4xl px-4 sm:px-8 aspect-[16/9] flex items-center justify-center relative">
          <svg viewBox="0 0 900 500" className="w-full h-full overflow-visible">
            <defs>
              {/* Natural Soft Drop Shadow for White Arrow Line */}
              <filter id="pathShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0c355e" floodOpacity="0.18" />
              </filter>

              {/* Subtle Cyan Light Drawing Tip Radial Glow */}
              <radialGradient id="cyanTipGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#38bdf8" />
                <stop offset="85%" stopColor="#0284c7" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Background Cyan Accent Chevrons ── */}
            <g className="opacity-40">
              <path d="M 100,430 L 115,420 L 100,410" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <path d="M 115,430 L 130,420 L 115,410" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <path d="M 130,430 L 145,420 L 130,410" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

              <path d="M 430,270 L 442,262 L 430,254" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 442,270 L 454,262 L 442,254" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* ── White Ascending Path (Progressively draws left → right over 2.6s, then holds 1.0) ── */}
            <motion.path
              d={arrowPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#pathShadow)"
              initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: drawDuration,
                      ease: [0.4, 0, 0.2, 1],
                    }
              }
            />

            {/* ── Final Arrowhead (Completes at 2.60s) ── */}
            <motion.path
              d="M 740,110 L 795,65 L 750,60 Z"
              fill="#ffffff"
              filter="url(#pathShadow)"
              initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      delay: 2.45,
                      duration: 0.15,
                      ease: "easeOut",
                    }
              }
            />

            {/* ────────────── STATIC HUMAN SILHOUETTES REVEAL SEQUENCE ────────────── */}

            {/* ── Person 1: Static reveal at ~0.45s ── */}
            <motion.g
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.45, duration: 0.2 }}
              transform="translate(134, 263)"
            >
              <g fill="#1e293b">
                <circle cx="16" cy="12" r="7" />
                <path d="M 10,14 C 6,17 4,22 5,26 C 8,25 11,22 13,18 Z" />
                <path d="M 10,21 L 22,21 L 25,48 L 7,48 Z" />
                <path d="M 9,48 L 4,72 L 8,73 L 15,50 Z" />
                <path d="M 21,48 L 27,70 L 22,72 L 15,50 Z" />
                <path d="M 20,24 L 27,36 L 24,38 L 17,26 Z" stroke="#1e293b" strokeWidth="2" />
              </g>
              <path
                d="M 32,25 L 42,15 M 42,15 L 34,15 M 42,15 L 42,23"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

            {/* ── Person 2: Man with Briefcase static reveal at ~0.95s ── */}
            <motion.g
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.95, duration: 0.2 }}
              transform="translate(362, 196)"
            >
              <g fill="#1e293b">
                <circle cx="18" cy="11" r="7" />
                <path d="M 10,20 L 26,20 L 28,48 L 8,48 Z" />
                <rect x="27" y="36" width="12" height="10" rx="2" fill="#0f172a" />
                <path d="M 31,34 L 35,34 L 35,36 L 31,36 Z" fill="#0f172a" />
                <path d="M 11,48 L 5,72 L 10,73 L 17,50 Z" />
                <path d="M 23,48 L 30,70 L 25,72 L 18,50 Z" />
              </g>
              <path
                d="M 36,20 L 46,10 M 46,10 L 38,10 M 46,10 L 46,18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

            {/* ── Person 3: Woman with Briefcase static reveal at ~1.45s ── */}
            <motion.g
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 1.45, duration: 0.2 }}
              transform="translate(594, 131)"
            >
              <g fill="#1e293b">
                <circle cx="16" cy="11" r="7" />
                <path d="M 10,13 C 6,16 4,21 5,25 C 8,24 11,21 13,17 Z" />
                <path d="M 9,20 L 23,20 L 25,48 L 7,48 Z" />
                <rect x="-3" y="34" width="11" height="9" rx="2" fill="#0f172a" />
                <path d="M 9,48 L 4,72 L 9,73 L 15,50 Z" />
                <path d="M 21,48 L 27,70 L 22,72 L 15,50 Z" />
              </g>
              <path
                d="M 30,18 L 40,8 M 40,8 L 32,8 M 40,8 L 40,16"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

            {/* ── Person 4: Waving BRIGHT RED FLAG static reveal at ~2.15s ── */}
            <motion.g
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 2.15, duration: 0.2 }}
              transform="translate(717, 37)"
            >
              <g fill="#1e293b">
                <circle cx="18" cy="12" r="7" />
                <path d="M 10,21 L 26,21 L 27,48 L 9,48 Z" />
                <path d="M 11,48 L 7,72 L 12,72 L 17,50 Z" />
                <path d="M 23,48 L 27,72 L 22,72 L 18,50 Z" />
                <path d="M 24,24 L 38,4 L 34,2 L 20,22 Z" />
              </g>
              <line x1="36" y1="0" x2="36" y2="48" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

              {/* 🚩 ORIGINAL BRIGHT RED FLAG */}
              <path
                d="M 36,2 L 72,12 L 36,24 Z"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth="1.5"
              />

              <g>
                <path d="M 80,25 L 90,15 M 90,15 L 82,15 M 90,15 L 90,23" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 92,42 L 102,32 M 102,32 L 94,32 M 102,32 L 102,40" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              </g>
            </motion.g>

            {/* ── Subtle Cyan Light Drawing Tip (Disappears at 2.60s when stroke completes) ── */}
            {!prefersReducedMotion && (
              <motion.g
                animate={{
                  x: orbX,
                  y: orbY,
                  opacity: [1, 1, 1, 1, 1, 1, 0],
                }}
                transition={{
                  duration: drawDuration,
                  ease: [0.4, 0, 0.2, 1],
                  times: orbTimes,
                }}
              >
                <circle cx="0" cy="0" r="22" fill="url(#cyanTipGlow)" opacity="0.85" />
                <circle cx="0" cy="0" r="7" fill="#ffffff" />
              </motion.g>
            )}
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(overlayContent, document.body);
}
