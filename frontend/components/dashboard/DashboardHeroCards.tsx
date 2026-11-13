"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Gamepad2, Users, Trophy } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";

export default function DashboardHeroCards({
  className = "",
  onOpenPricing,
}: {
  className?: string;
  onOpenPricing?: () => void;
}) {
  const { isPremium } = useSubscription();
  const { openPricingModal } = usePricingModal();
  const [isBlinking, setIsBlinking] = useState(false);
  const [showHiBubble, setShowHiBubble] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [upcomingPopup, setUpcomingPopup] = useState<string | null>(null);
  const hiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const upcomingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Left Card Slides: ONLY moves when the user manually swipes/drags or clicks arrows/dots (No auto-play)
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      src: "/images/dashboard/penguin_slide_1.jpg",
      alt: "Gaming Penguin",
      btnLabel: "Game Zone",
      icon: Gamepad2,
    },
    {
      id: 2,
      src: "/images/dashboard/penguin_slide_2.jpg",
      alt: "Community Collaboration Penguins",
      btnLabel: "Find Mates",
      icon: Users,
    },
    {
      id: 3,
      src: "/images/dashboard/penguin_slide_3.jpg",
      alt: "Daily Challenges Trophy Penguin",
      btnLabel: "Daily Challenges",
      icon: Trophy,
    },
  ];

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 30;
    if (info.offset.x < -threshold) {
      handleNextSlide();
    } else if (info.offset.x > threshold) {
      handlePrevSlide();
    }
  };

  // Pop up "Upcoming" notification when button is pressed
  const handleUpcomingClick = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUpcomingPopup(label);

    if (upcomingTimeoutRef.current) clearTimeout(upcomingTimeoutRef.current);
    upcomingTimeoutRef.current = setTimeout(() => {
      setUpcomingPopup(null);
    }, 2400);
  };

  // Natural lifelike eye-blinking loop (blinks for ~180ms every 3.5s)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const interval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 180);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
      if (hiTimeoutRef.current) clearTimeout(hiTimeoutRef.current);
      if (upcomingTimeoutRef.current) clearTimeout(upcomingTimeoutRef.current);
    };
  }, []);

  const handleProAction = () => {
    if (onOpenPricing) {
      onOpenPricing();
    } else {
      openPricingModal();
    }
  };

  // Interactive Penguin Tap: waves hand, bobs happily, and says "Hi! 👋"
  const handlePenguinPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHiBubble(true);
    setIsWaving(true);

    if (hiTimeoutRef.current) clearTimeout(hiTimeoutRef.current);
    hiTimeoutRef.current = setTimeout(() => {
      setShowHiBubble(false);
      setIsWaving(false);
    }, 2600);
  };

  return (
    <div
      className={`w-full max-w-[540px] grid grid-cols-2 gap-3 sm:gap-3.5 select-none ${className}`}
    >
      {/* ── Card 1 (Left): Interactive Mascot Showcase (Slides ONLY when user moves them) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        whileHover={{ y: -3, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="group relative flex items-center justify-center w-full h-[155px] sm:h-[185px] lg:h-[212px] rounded-[22px] sm:rounded-[26px] bg-[#1D1D1D] dark:bg-[#1D1D1D] border border-white/10 dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-[box-shadow,border-color] duration-300 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      >
        {/* Draggable Slide Image */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              fill
              sizes="(max-width: 768px) 200px, 270px"
              priority
              draggable={false}
              className="object-cover object-center pointer-events-none select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle Vignette & Inner Border Ring */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-[22px] sm:rounded-[26px] pointer-events-none" />

        {/* Top-Right Indicator Dots (User Can Click to Switch) */}
        <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-30 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-200 cursor-pointer rounded-full ${
                currentSlide === idx
                  ? "w-3 sm:w-3.5 h-1 sm:h-1.5 bg-white shadow-sm"
                  : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrow Left (Appears on Hover, User-Triggered) */}
        <button
          type="button"
          onClick={handlePrevSlide}
          aria-label="Previous image"
          className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Navigation Arrow Right (Appears on Hover, User-Triggered) */}
        <button
          type="button"
          onClick={handleNextSlide}
          aria-label="Next image"
          className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/55 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Upcoming Toast Popup Notification (Clean White Text, Zero Icon, Simple Pill) */}
        <AnimatePresence>
          {upcomingPopup && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="absolute bottom-11 sm:bottom-12 left-2.5 sm:left-3 z-40 px-3 py-1 rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-xl text-[11px] sm:text-xs font-semibold select-none pointer-events-none tracking-wide"
            >
              <span>Upcoming</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom-Left Slide Action Button: Pops with "Upcoming" on Press */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => handleUpcomingClick(slides[currentSlide].btnLabel, e)}
            className="group/btn inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            {React.createElement(slides[currentSlide].icon, {
              className: "w-3 h-3 text-emerald-400 sm:w-3.5 sm:h-3.5 shrink-0",
            })}
            <span>{slides[currentSlide].btnLabel}</span>
            <ChevronRight className="w-3 h-3 text-white/70 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </motion.div>

      {/* ── Card 2 (Right): Dark Charcoal Pro Status Card with Interactive Mascot ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        whileHover={{ y: -3, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={handleProAction}
        className="group relative flex flex-col justify-between w-full h-[155px] sm:h-[185px] lg:h-[212px] rounded-[22px] sm:rounded-[26px] bg-[#1D1D1D] dark:bg-[#1D1D1D] border border-white/10 dark:border-white/[0.08] shadow-sm hover:shadow-xl transition-[box-shadow,border-color] duration-300 overflow-hidden cursor-pointer p-3 sm:p-4 select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_70%)] pointer-events-none" />

        {/* Left Content Area (Nicely Proportioned Title & Small Compact Explore Button) */}
        <div className="relative z-10 flex flex-col justify-between h-full max-w-[54%] sm:max-w-[52%]">
          {/* Well-Proportioned Pro Title & Subtitle */}
          <div className="space-y-0.5 pt-0.5 sm:pt-1">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
              {isPremium ? "Pro User" : "Buy Pro"}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-medium leading-tight">
              Explore features
            </p>
          </div>

          {/* Small, Compact, Perfectly Adjusted Explore Button */}
          <div className="pb-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProAction();
              }}
              className={`group/btn inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shadow-sm transition-all duration-200 cursor-pointer w-fit shrink-0 ${
                isPremium
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                  : "bg-white hover:bg-zinc-100 text-black hover:scale-[1.02]"
              }`}
            >
              <span>Explore features</span>
              <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* 3D Penguin Mascot (Interactive: Press to Wave & Say "Hi!") */}
        <div
          onClick={handlePenguinPress}
          className="absolute -bottom-1 -right-0.5 sm:bottom-0 sm:right-1 h-[82%] sm:h-[88%] aspect-[791/979] z-20 flex items-end justify-center cursor-pointer pointer-events-auto"
        >
          {/* Interactive Speech Bubble: ONLY appears when user presses on the penguin */}
          <AnimatePresence>
            {showHiBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 6 }}
                transition={{ type: "spring", stiffness: 450, damping: 24 }}
                className="absolute -top-3.5 sm:-top-4 -left-1 sm:-left-2 z-30 flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-white text-zinc-950 shadow-xl border border-black/10 select-none pointer-events-none"
              >
                <span className="text-[11px] sm:text-xs font-black tracking-tight text-zinc-950">
                  Hi!
                </span>
                <motion.span
                  animate={{ rotate: [0, 18, -10, 18, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-block text-xs origin-bottom-right"
                >
                  👋
                </motion.span>
                {/* Tail pointing toward penguin */}
                <div className="absolute -bottom-1 right-3 w-1.5 h-1.5 bg-white rotate-45 border-r border-b border-black/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Mascot Body (Idle Swaying + Active Excited Wave Bounce) */}
          <motion.div
            animate={{
              y: isWaving ? [0, -6, 0, -3, 0] : [0, -3, 0, -2, 0],
              rotate: isWaving ? [0, 3, -3, 3, 0] : [0, 0.8, 0, -0.8, 0],
            }}
            transition={{
              duration: isWaving ? 1.3 : 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-full h-full flex items-end justify-center transform-gpu will-change-transform"
          >
            {/* Open Eyes Mascot Body Image */}
            <Image
              src="/images/dashboard/penguin_body_base.png"
              alt="Pro Mascot"
              width={791}
              height={979}
              priority
              className={`w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-opacity duration-150 ${
                isBlinking ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* Blinking Eyes Mascot Body Image */}
            <Image
              src="/images/dashboard/penguin_body_base_blink.png"
              alt="Pro Mascot Blinking"
              width={791}
              height={979}
              className={`absolute inset-0 w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-opacity duration-150 ${
                isBlinking ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Mascot Hand / Flipper (Waves dynamically when user presses on the penguin) */}
            <motion.div
              style={{
                position: "absolute",
                left: "0%",
                top: "51.58%",
                width: "20.86%",
                height: "23.90%",
                transformOrigin: "87.9% 12.8%",
              }}
              animate={{
                rotate: isWaving
                  ? [0, -24, -6, -26, -8, -22, 0]
                  : [0, -3, 0, -2, 0],
              }}
              transition={{
                duration: isWaving ? 1.3 : 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="z-20 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] transform-gpu will-change-transform"
            >
              <Image
                src="/images/dashboard/penguin_flipper_joint.png"
                alt="Waving Mascot Hand"
                width={165}
                height={234}
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
