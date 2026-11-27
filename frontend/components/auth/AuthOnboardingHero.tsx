"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface AuthOnboardingSlide {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
}

export const AUTH_ONBOARDING_SLIDES: AuthOnboardingSlide[] = [
  {
    id: "roadmaps",
    image: "/images/onboarding_1.jpg",
    alt: "Personalized Learning Paths",
    title: "Personalized Learning Paths",
    description:
      "Curated playlists and company-wise DSA questions to take your skills to the next level.",
  },
  {
    id: "skillbits",
    image: "/images/onboarding_2.jpg",
    alt: "Turn Every Scroll Into Learning",
    title: "Turn Every Scroll Into Learning.",
    description:
      "Learn tech concepts, coding tips, and career insights through quick 30–40 second videos.",
  },
  {
    id: "explore",
    image: "/images/onboarding_3.jpg",
    alt: "Discover Tech Opportunities",
    title: "Discover Tech Opportunities",
    description:
      "Discover hackathons, tech events, scholarships, and opportunities to level up your career.",
  },
];

export default function AuthOnboardingHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % AUTH_ONBOARDING_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(
      (prev) => (prev - 1 + AUTH_ONBOARDING_SLIDES.length) % AUTH_ONBOARDING_SLIDES.length
    );
  }, []);

  const handleGoToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Automatically cycle slides every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 2000);
    return () => clearInterval(timer);
  }, [handleNext]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const slide = AUTH_ONBOARDING_SLIDES[currentSlide];

  return (
    <aside
      aria-label="SkillsCatalyst Feature Highlights"
      className="w-full lg:w-1/2 min-h-screen bg-black text-white shrink-0 relative overflow-hidden self-stretch hidden lg:flex flex-col justify-between p-8 lg:p-12 select-none border-r border-zinc-900"
    >
      {/* ── Top-Left: Logo & Brand Name ── */}
      <div className="w-full flex items-center justify-between z-20">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Back to SkillsCatalyst home"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center p-2 shadow-sm">
            <Image
              src="/logo_white_v2.png"
              alt="SkillsCatalyst Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            SkillsCatalyst
          </span>
        </Link>
      </div>

      {/* ── Center: Slide Illustration and Typography ── */}
      <div className="relative flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Illustration with seamless pitch black background */}
            <div className="relative w-full flex-1 min-h-[340px] max-h-[54vh] flex items-center justify-center my-auto">
              <div className="relative w-full h-full max-w-[380px] flex items-center justify-center">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1024px) 500px, 380px"
                  priority
                  className="object-contain object-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>

            {/* Slide Typography: Clean white, zero neon badge slop */}
            <div className="w-full max-w-md text-center mt-3 mb-2 px-2 shrink-0">
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                {slide.title}
              </h2>
              <p className="text-sm lg:text-base text-white/85 mt-2 leading-relaxed max-w-sm mx-auto font-normal">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls: Sliders Centered in the Middle (Zero Navigation Buttons) ── */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-center z-20 shrink-0 pt-4 border-t border-white/[0.08]">
        {/* Flat White Slider Indicators Centered */}
        <div
          id="auth-onboarding-sliders"
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Onboarding Slide Indicators"
        >
          {AUTH_ONBOARDING_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleGoToSlide(idx)}
                suppressHydrationWarning
                className={`transition-all duration-300 rounded-full cursor-pointer shadow-none ${
                  isActive
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}: ${s.title}`}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}
