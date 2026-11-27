"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CareerPathCard({ onClick }: { onClick?: () => void }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.push("/roadmaps");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      style={{
        boxShadow:
          "0 12px 20px 0px rgba(0, 0, 0, 0.12), 0 6px 10px 0px rgba(0, 0, 0, 0.08), 0 2px 4px 0px rgba(0, 0, 0, 0.05), 0 1px 2px 0px rgba(0, 0, 0, 0.04)",
      }}
      className="group w-full h-full bg-white dark:bg-[#1D1D1D] dark:border dark:border-white/[0.08] rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 hub-card-shadow transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[160px] sm:min-h-[195px] select-none"
    >
      {/* Left/Top Content */}
      <div className="relative z-10 max-w-[60%] sm:max-w-[50%] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-lime-700 dark:text-[#D5FF38] uppercase">
              PLAN
            </span>
            <span className="w-4 sm:w-5 h-[2px] rounded-full bg-lime-600/40 dark:bg-[#D5FF38]/50" />
          </div>
          <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Road
            <span className="text-lime-600 dark:text-[#D5FF38]">maps</span>
          </h3>
          <p className="text-[10px] sm:text-[12.5px] text-slate-500 dark:text-neutral-400 font-medium leading-tight sm:leading-snug mt-1 hidden xs:block line-clamp-2 max-w-[190px]">
            Get a personalized roadmap to your dream career.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-2.5 sm:mt-5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#D5FF38] text-black flex items-center justify-center shadow-sm shadow-black/15 group-hover:scale-110 transition-all">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Right 3D Illustration - Tight-cropped transparent Roadmaps PNG */}
      <div className="absolute right-1 bottom-1 sm:right-2 sm:top-1 sm:bottom-1 w-[64%] h-[72%] sm:w-[49%] sm:h-auto flex items-end sm:items-center justify-end pointer-events-none select-none overflow-hidden">
        <div className="relative w-full h-full flex items-end sm:items-center justify-end group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]">
          <Image
            src="/images/hub/roadmaps_hero.png"
            alt="Roadmaps 3D Illustration"
            fill
            unoptimized
            sizes="(max-width: 640px) 160px, 280px"
            priority
            className="object-contain object-right-bottom sm:object-right"
          />
        </div>
      </div>
    </div>
  );
}

export default function LearningPathCarousel() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="w-full h-full flex"
    >
      <CareerPathCard onClick={() => router.push("/roadmaps")} />
    </motion.div>
  );
}
