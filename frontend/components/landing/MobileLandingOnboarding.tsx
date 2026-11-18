"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface MobileLandingOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export interface OnboardingSlide {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
  features: string[];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "roadmaps",
    image: "/images/onboarding_1.jpg",
    alt: "Personalized Learning Paths",
    title: "Personalized Learning Paths",
    description: "Curated playlists and company-wise DSA questions to take your skills to the next level.",
    features: ["Curated Playlists", "Company-wise DSA", "Skill Mastery"],
  },
  {
    id: "skillbits",
    image: "/images/onboarding_2.jpg",
    alt: "Turn Every Scroll Into Learning",
    title: "Turn Every Scroll Into Learning.",
    description: "Learn tech concepts, coding tips, and career insights through quick 30–40 second videos.",
    features: ["Tech Concepts", "Coding Tips", "30–40s Videos"],
  },
  {
    id: "explore",
    image: "/images/onboarding_3.jpg",
    alt: "Discover Tech Opportunities",
    title: "Discover Tech Opportunities",
    description: "Discover hackathons, tech events, scholarships, and opportunities to level up your career.",
    features: ["Hackathons", "Tech Events", "Scholarships", "Career Opportunities"],
  },
];

function MobileLandingOnboardingDialog({
  onClose,
  onComplete,
  onSkip,
}: Omit<MobileLandingOnboardingProps, "isOpen">) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleComplete = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    onComplete();
  }, [isNavigating, onComplete]);

  const handleNext = useCallback(() => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentSlide, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const handleSkip = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
  }, [isNavigating, onSkip, onClose]);

  const handleGoToSlide = (index: number) => {
    if (index === currentSlide) return;
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Touch Swipe Handling for Native Mobile Feel
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    // Trigger only if horizontal swipe dominates vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swipe Left -> Next
        handleNext();
      } else {
        // Swipe Right -> Prev
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleSkip]);

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product Features Onboarding"
      className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-between select-none overflow-hidden touch-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* ── Top Bar: Logo on Left, Clean White Text Skip on Right (No Button Pill) ── */}
      <header className="w-full max-w-md mx-auto px-6 pt-4 pb-2 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center p-1.5 shadow-md">
            <Image
              src="/logo_white_v2.png"
              alt="SkillsCatalyst"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white">
            SkillsCatalyst
          </span>
        </div>

        {/* Top-Right Corner: Clean White Text "Skip" (No button background/border) */}
        <button
          id="onboarding-skip-btn"
          type="button"
          onClick={handleSkip}
          className="text-sm font-semibold text-white hover:text-white/80 transition-colors bg-transparent border-none p-1 cursor-pointer tracking-wide"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </header>

      {/* ── Center Stage: Moved Image Up, Clean White Typography Below ── */}
      <main
        className="relative flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-start px-4 pt-1 pb-2 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? "100%" : "-100%",
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
                transition: {
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.25, ease: "easeOut" },
                },
              },
              exit: (dir: number) => ({
                x: dir > 0 ? "-100%" : "100%",
                opacity: 0,
                transition: {
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.2, ease: "easeIn" },
                },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex flex-col items-center justify-between"
          >
            {/* Poster Illustration shifted UP right below header */}
            <div className="relative w-full flex-1 min-h-[300px] max-h-[57vh] flex items-center justify-center pt-0 my-0">
              <div className="relative w-full h-full max-w-[340px] flex items-center justify-center">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  priority
                  className="object-contain object-center drop-shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>

            {/* Slide Text directly below image: Zero neon badge, pure clean white typography */}
            <div className="w-full max-w-[350px] text-center mb-4 px-2 shrink-0">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {slide.title}
              </h2>
              <p className="text-sm text-white/90 mt-2 leading-relaxed max-w-[320px] mx-auto font-normal">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom Controls: Sliders on Left in White, Circular Prev & Next with Acid Lime & Black ── */}
      <footer className="w-full max-w-md mx-auto px-6 py-4 flex items-center justify-between z-30 shrink-0 border-t border-white/[0.08] bg-black">
        {/* Left Side: White Color Slider Indicators (Flat, zero glow) */}
        <div
          id="onboarding-slider-indicator"
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Onboarding Slide Slider"
        >
          {ONBOARDING_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleGoToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer shadow-none ${
                  isActive
                    ? "w-8 h-2.5 bg-white"
                    : "w-2.5 h-2.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}: ${s.title}`}
              />
            );
          })}
        </div>

        {/* Right Side: Circular Next and Prev Buttons (Acid Lime & Black Navigation, zero glow) */}
        <div className="flex items-center gap-3">
          {/* Circular Prev Button: Acid Lime with Black Arrow (Zero glow) */}
          <button
            id="onboarding-prev-btn"
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-none transition-all ${
              currentSlide === 0
                ? "opacity-0 pointer-events-none"
                : "bg-[#D5FF38] hover:bg-[#c6f028] text-black active:scale-95 cursor-pointer"
            }`}
            aria-label="Previous slide"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Circular Next Button: Acid Lime with Black Arrow (Zero glow) */}
          <button
            id="onboarding-next-btn"
            type="button"
            onClick={isLastSlide ? handleComplete : handleNext}
            disabled={isNavigating}
            className="w-11 h-11 rounded-full bg-[#D5FF38] hover:bg-[#c6f028] text-black shadow-none active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-85"
            aria-label={isLastSlide ? "Get started and proceed to login" : "Next slide"}
          >
            {isNavigating ? (
              <svg className="animate-spin w-5 h-5 text-black" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function MobileLandingOnboarding({
  isOpen,
  onClose,
  onComplete,
  onSkip,
}: MobileLandingOnboardingProps) {
  if (!isOpen) return null;
  return (
    <MobileLandingOnboardingDialog
      onClose={onClose}
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
}
