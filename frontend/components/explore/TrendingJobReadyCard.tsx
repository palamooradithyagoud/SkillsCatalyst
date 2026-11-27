"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SLIDE_INTERVAL_MS = 1500;

interface TrendingSlide {
  id: "desk" | "stack" | "steps";
  src: string;
  alt: string;
}

const TRENDING_SLIDES: TrendingSlide[] = [
  {
    id: "desk",
    src: "/images/explore/trending-job-ready-desk.png",
    alt: "Developer desk setup with plant, coding laptop, books, and coffee mug",
  },
  {
    id: "stack",
    src: "/images/explore/trending-tech-stack.png",
    alt: "Modern full-stack engineering skills including TypeScript, React, JavaScript, PostgreSQL, and Docker",
  },
  {
    id: "steps",
    src: "/images/explore/trending-skill-steps.png",
    alt: "Skill progression path from Beginner to Intermediate to Advanced",
  },
];

function getSlideMotionProps(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.25 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }

  return {
    initial: { opacity: 0, x: 76, y: 52, scale: 0.78, zIndex: 20 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      zIndex: 20,
      transition: {
        type: "spring" as const,
        stiffness: 190,
        damping: 24,
        mass: 0.92,
      },
    },
    exit: {
      opacity: 0,
      x: -18,
      y: 14,
      scale: 0.94,
      zIndex: 10,
      transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
    },
  };
}

/**
 * Showcase banner for the Trending tab in Explore.
 * - Mobile (< md): Compact, borderless artwork scene blending smoothly into the page canvas with no promotional copy.
 * - Desktop (md+): Compact matte dark charcoal card pairing SkillsCatalyst copy with rotating workspace illustrations.
 * Rotates smoothly every 1.5 seconds, emerging from the bottom-right corner.
 */
export default function TrendingJobReadyCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TRENDING_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = TRENDING_SLIDES[activeIndex];
  const slideMotion = getSlideMotionProps(prefersReducedMotion);

  return (
    <section
      aria-label="SkillsCatalyst Trending Career Prep Card"
      className="relative max-w-5xl mx-auto -mx-3.5 sm:-mx-6 md:mx-auto w-[calc(100%+1.75rem)] sm:w-[calc(100%+3rem)] md:w-full overflow-hidden rounded-none md:rounded-[24px] bg-transparent md:bg-[#111214] border-0 md:border md:border-white/[0.08] shadow-none md:shadow-[0_18px_48px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center md:justify-between md:min-h-[265px] lg:min-h-[295px] select-none"
    >
      {/* Keep all slide textures decoded cleanly for zero-flicker 1.5s transitions */}
      <div className="sr-only" aria-hidden="true">
        {TRENDING_SLIDES.map((slide) => (
          <Image
            key={slide.id}
            src={slide.src}
            alt=""
            width={64}
            height={64}
            unoptimized
            priority
          />
        ))}
      </div>

      {/* Left Editorial Copy (Desktop / Tablet Only) */}
      <div className="hidden md:flex relative z-20 md:w-[54%] md:p-7 lg:p-9 flex-col justify-center">
        {/* Brand Row */}
        <div className="flex items-center gap-2 mb-2.5 lg:mb-3.5">
          <svg
            width="18"
            height="20"
            viewBox="0 0 20 22"
            fill="none"
            aria-hidden="true"
            className="w-4 h-4.5 lg:w-4.5 lg:h-5 shrink-0"
          >
            <path
              d="M11.6 1.2L2.4 12.1H9.7L8.4 20.8L17.6 9.9H10.3L11.6 1.2Z"
              fill="#C7F200"
            />
          </svg>
          <span className="text-white font-bold tracking-tight text-sm lg:text-base">
            SkillsCatalyst
          </span>
        </div>

        {/* Display Headline */}
        <h2 className="text-[28px] lg:text-[36px] font-extrabold tracking-[-0.025em] leading-[1.12] text-white">
          <span className="inline-block">
            Get Job{" "}
            <span className="relative inline-block">
              Ready
              <svg
                width="26"
                height="22"
                viewBox="0 0 28 24"
                fill="none"
                aria-hidden="true"
                className="absolute -top-2.5 -right-5 w-5.5 h-4.5 lg:w-6 lg:h-5"
              >
                <path
                  d="M5 15L2.5 5M12.5 13L17.5 3.5M17.5 18L25.5 14"
                  stroke="#C7F200"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
          <br />
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span>with</span>
            <span className="inline-block bg-[#C7F200] text-[#101215] px-3 lg:px-3.5 py-0.5 rounded-lg lg:rounded-xl leading-[1.08]">
              SkillsCatalyst
            </span>
          </span>
        </h2>

        {/* Supporting Copy */}
        <p className="mt-2.5 lg:mt-3.5 text-[13px] lg:text-[14.5px] text-[#D0D5DD] leading-relaxed max-w-[345px] font-normal">
          Master today&apos;s most in-demand skills in AI, Data, Programming and beyond.
        </p>
      </div>

      {/* Right / Mobile Animated Illustration Stage */}
      <div
        aria-hidden="true"
        className="relative w-full h-[205px] sm:h-[230px] md:h-auto md:self-stretch md:w-[46%] md:flex-1 pointer-events-none overflow-hidden"
      >
        <AnimatePresence initial={false} mode="sync">
          {currentSlide.id === "desk" && (
            <motion.div
              key="desk"
              style={{ transformOrigin: "bottom right" }}
              {...slideMotion}
              className="absolute inset-0 will-change-transform"
            >
              {/* Sweeping Acid-Lime Crescent Backdrop */}
              <svg
                viewBox="0 0 500 260"
                preserveAspectRatio="none"
                className="md:hidden absolute inset-0 w-full h-full z-0"
              >
                <path
                  d="M 226 16 C 142 74, 86 154, 82 260 L 210 260 C 202 172, 224 90, 256 26 C 263 14, 240 6, 226 16 Z"
                  fill="#C7F200"
                />
              </svg>
              <svg
                viewBox="0 0 500 400"
                preserveAspectRatio="none"
                className="hidden md:block absolute inset-0 w-full h-full z-0"
              >
                <path
                  d="M 244 0 C 122 86, 54 190, 62 400 L 218 400 C 206 250, 246 118, 304 0 Z"
                  fill="#C7F200"
                />
              </svg>

              {/* Top-Right Wall Props: Sticky Note + Wire Memo Grid */}
              <div className="absolute top-2.5 right-4 sm:top-4 sm:right-6 md:top-4 md:right-5 z-10 flex items-start gap-2 sm:gap-3">
                <div className="relative mt-3 sm:mt-4 -rotate-[10deg] bg-[#F1C94B] text-[#141518] w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[2px] shadow-[0_6px_14px_rgba(0,0,0,0.4)] px-1 pt-1.5 flex flex-col items-center justify-center">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#1C1E24] ring-1 ring-white/20" />
                  <span className="font-caveat font-bold text-[11px] sm:text-[13px] leading-[0.95] text-center">
                    Job
                    <br />
                    <span className="underline decoration-[#141518]/75 decoration-1 underline-offset-2">
                      Ready
                    </span>{" "}
                    ✓
                  </span>
                </div>

                <div className="relative w-[62px] h-[54px] sm:w-[74px] sm:h-[64px] border border-[#2C3038] rounded-[2px] shadow-[0_6px_14px_rgba(0,0,0,0.32)]">
                  <div
                    className="w-full h-full opacity-80"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #2C3038 1px, transparent 1px), linear-gradient(to bottom, #2C3038 1px, transparent 1px)",
                      backgroundSize: "15px 15px",
                    }}
                  />
                  <div className="absolute bottom-1 left-1.5 sm:bottom-1.5 sm:left-2.5 w-5 h-6.5 sm:w-6 sm:h-7.5 bg-[#ECEEF2] rounded-[1px] shadow-sm px-1 pt-1.5 flex flex-col gap-0.5">
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-[1px] bg-[#6B7280]" />
                    <span className="h-[1.5px] w-full bg-[#9CA3AF]" />
                    <span className="h-[1.5px] w-4/5 bg-[#9CA3AF]" />
                    <span className="h-[1.5px] w-full bg-[#9CA3AF]" />
                  </div>
                  <div className="absolute top-2.5 right-1.5 sm:top-3 sm:right-2 w-4 h-5 sm:w-5 sm:h-6 bg-[#C7F200] rounded-[1px] shadow-sm">
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-[1px] bg-[#6B7280]" />
                  </div>
                </div>
              </div>

              {/* Desk Illustration PNG anchored flush bottom-right */}
              <div className="absolute inset-0 z-10 flex items-end justify-end">
                <div className="relative w-[82%] sm:w-[74%] md:w-[94%] max-w-[325px] sm:max-w-[365px] md:max-w-[385px] aspect-[920/551]">
                  <Image
                    src={currentSlide.src}
                    alt={currentSlide.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 84vw, 390px"
                    priority
                    className="object-contain object-right-bottom"
                  />
                </div>
              </div>

              {/* Mobile edge fades to blend cropped desk legs & chair seamlessly */}
              <div className="md:hidden absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-black dark:via-black/70 dark:to-transparent z-20 pointer-events-none" />
              <div className="md:hidden absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/75 dark:from-black/80 to-transparent z-20 pointer-events-none" />
              <div className="md:hidden absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-white/80 dark:from-black/85 to-transparent z-20 pointer-events-none" />
            </motion.div>
          )}

          {currentSlide.id === "stack" && (
            <motion.div
              key="stack"
              style={{ transformOrigin: "bottom right" }}
              {...slideMotion}
              className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-6 lg:pr-8 will-change-transform"
            >
              <div className="relative w-[68%] sm:w-[58%] md:w-[78%] max-w-[235px] sm:max-w-[265px] md:max-w-[305px] aspect-[699/555]">
                <Image
                  src={currentSlide.src}
                  alt={currentSlide.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 68vw, 310px"
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>
          )}

          {currentSlide.id === "steps" && (
            <motion.div
              key="steps"
              style={{ transformOrigin: "bottom right" }}
              {...slideMotion}
              className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-5 lg:pr-8 will-change-transform"
            >
              <div className="relative w-[88%] sm:w-[78%] md:w-[92%] max-w-[345px] sm:max-w-[380px] md:max-w-[420px] aspect-[618/287]">
                <Image
                  src={currentSlide.src}
                  alt={currentSlide.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 88vw, 420px"
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
