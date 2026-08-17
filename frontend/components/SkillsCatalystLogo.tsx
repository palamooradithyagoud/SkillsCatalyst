"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface SkillsCatalystLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showText?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function SkillsCatalystLogo({
  size = "md",
  showText = false,
  animated = true,
  className = "",
  onClick,
}: SkillsCatalystLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generous, prominent size configurations matching the official brand logo
  const config = {
    sm: {
      dimension: 40,
      imgClass: "w-9 h-9",
      title: "text-base font-black tracking-tight",
      sub: "text-[10px]",
      gap: "gap-2.5",
    },
    md: {
      dimension: 56,
      imgClass: "w-13 h-13 sm:w-14 sm:h-14",
      title: "text-xl font-black tracking-tight",
      sub: "text-xs",
      gap: "gap-3.5",
    },
    lg: {
      dimension: 80,
      imgClass: "w-18 h-18 sm:w-20 sm:h-20",
      title: "text-2xl font-black tracking-tight",
      sub: "text-xs",
      gap: "gap-4",
    },
    xl: {
      dimension: 120,
      imgClass: "w-28 h-28 sm:w-32 sm:h-32",
      title: "text-3xl font-black tracking-tight",
      sub: "text-sm",
      gap: "gap-4.5",
    },
    "2xl": {
      dimension: 160,
      imgClass: "w-36 h-36 sm:w-42 sm:h-42 md:w-46 md:h-46",
      title: "text-4xl font-black tracking-tight",
      sub: "text-base",
      gap: "gap-5",
    },
    "3xl": {
      dimension: 200,
      imgClass: "w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56",
      title: "text-5xl font-black tracking-tight",
      sub: "text-lg",
      gap: "gap-6",
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none cursor-pointer group ${config.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title="SkillsCatalyst — Accelerated Career Learning"
    >
      {/* ── Official Brand Logo Emblem ── */}
      <motion.div
        animate={
          animated
            ? {
                scale: isHovered ? 1.05 : 1,
                y: isHovered ? -1.5 : 0,
              }
            : {}
        }
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className={`relative shrink-0 flex items-center justify-center`}
      >
        <Image
          src="/logo.png"
          alt="SkillsCatalyst Official Logo"
          width={config.dimension}
          height={config.dimension}
          className={`${config.imgClass} object-contain drop-shadow-sm transition-all duration-300`}
          priority
        />
      </motion.div>

      {/* ── Brand Typography: SkillsCatalyst / Accelerated Learning ── */}
      {showText && (
        <div className="flex flex-col">
          <span className={`text-[#18191F] dark:text-white leading-none ${config.title}`}>
            SkillsCatalyst
          </span>
          <span className={`font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5 ${config.sub}`}>
            Accelerated Learning
          </span>
        </div>
      )}
    </div>
  );
}

