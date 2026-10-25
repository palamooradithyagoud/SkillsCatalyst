"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SPLASH_SESSION_KEY = "sc_mobile_splash_shown";

/**
 * MobileAppOpeningSplash
 * 
 * Cinematic mobile opening splash screen displaying the official horizontal
 * brand logo (Penguin 'S' + KILLSCATALYST) on mobile application opening.
 * Fully responsive to bright mode (light theme) and dark mode (dark theme).
 * Protected by session storage so it fires only once per app session.
 */
export default function MobileAppOpeningSplash() {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if splash has already been shown in this browser session
    try {
      if (sessionStorage.getItem(SPLASH_SESSION_KEY) === "true") {
        setIsVisible(false);
        return;
      }
    } catch {
      // Ignore storage exceptions in restricted environments
    }

    // Determine if running on a mobile viewport, mobile device, or standalone PWA
    const checkIsMobile = () => {
      const isMobileWidth = window.innerWidth < 768;
      const isStandalonePWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      return isMobileWidth || isStandalonePWA || isMobileUserAgent;
    };

    const mobileDetected = checkIsMobile();
    if (!mobileDetected) {
      setIsVisible(false);
      return;
    }

    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    } catch {}

    // Auto-dismiss after 1.2 seconds with silky fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Dismiss early if user taps on screen
  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Do not render after dismissal
  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="mobile-app-opening-splash"
          key="mobile-app-opening-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
          }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between select-none touch-none cursor-pointer bg-white dark:bg-black transition-colors duration-200 md:hidden"
          style={{ height: "100dvh", width: "100vw" }}
          aria-label="SkillsCatalyst is loading"
        >
          {/* Subtle Branded Radial Ambient Aura */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
          >
            <div className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl animate-pulse" />
          </div>

          {/* Top spacer for optical balance */}
          <div className="w-full h-16 shrink-0" />

          {/* ── Center Stage: Official Full Brand Logo (Penguin 'S' + KILLSCATALYST) ── */}
          <div className="relative flex flex-col items-center justify-center px-6 max-w-sm sm:max-w-md w-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1200/320] flex items-center justify-center"
            >
              {/* Bright Mode Logo (Black) */}
              <Image
                src="/logo_full_black_v2.png"
                alt="SkillsCatalyst"
                fill
                sizes="(max-width: 640px) 280px, 320px"
                className="object-contain dark:hidden drop-shadow-xs"
                priority
              />

              {/* Dark Mode Logo (Crisp White) */}
              <Image
                src="/logo_full_white_v2.png"
                alt="SkillsCatalyst"
                fill
                sizes="(max-width: 640px) 280px, 320px"
                className="object-contain hidden dark:block drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                priority
              />
            </motion.div>

            {/* Glowing Shimmer Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: "120px",
                opacity: 1,
                transition: { delay: 0.25, duration: 0.6, ease: "easeOut" },
              }}
              className="h-[2px] mt-4 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            />

            {/* Micro Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.35, duration: 0.5 },
              }}
              className="mt-3 text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-slate-500 dark:text-neutral-400 uppercase text-center"
            >
              Accelerated Career Learning
            </motion.p>
          </div>

          {/* ── Bottom Section: Version / Status Hint ── */}
          <div className="w-full pb-8 shrink-0 flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 dark:text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Ready for Placement</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
