"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import StrokeText from "@/components/explore/StrokeText";

interface SkillsCatalystLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showText?: boolean;
  animated?: boolean;
  className?: string;
  textColor?: string;
  subTextColor?: string;
  useStrokeText?: boolean;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

export default function SkillsCatalystLogo({
  size = "md",
  showText = false,
  animated = true,
  className = "",
  textColor,
  subTextColor,
  useStrokeText = true,
  strokeColor,
  fillColor,
  strokeWidth,
  onClick,
}: SkillsCatalystLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generous, prominent size configurations matching the official brand logo
  const config = {
    sm: {
      dimension: 40,
      imgClass: "w-9 h-9",
      title: "text-base font-black tracking-tight",
      strokeHeight: "h-[19px] sm:h-5",
      defaultStrokeWidth: 1.6,
      sub: "text-[10px]",
      gap: "gap-2.5",
    },
    md: {
      dimension: 56,
      imgClass: "w-13 h-13 sm:w-14 sm:h-14",
      title: "text-xl font-black tracking-tight",
      strokeHeight: "h-6 sm:h-[26px]",
      defaultStrokeWidth: 1.8,
      sub: "text-xs",
      gap: "gap-3.5",
    },
    lg: {
      dimension: 80,
      imgClass: "w-18 h-18 sm:w-20 sm:h-20",
      title: "text-2xl font-black tracking-tight",
      strokeHeight: "h-8 sm:h-9",
      defaultStrokeWidth: 2,
      sub: "text-xs",
      gap: "gap-4",
    },
    xl: {
      dimension: 120,
      imgClass: "w-28 h-28 sm:w-32 sm:h-32",
      title: "text-3xl font-black tracking-tight",
      strokeHeight: "h-10 sm:h-11",
      defaultStrokeWidth: 2.2,
      sub: "text-sm",
      gap: "gap-4.5",
    },
    "2xl": {
      dimension: 160,
      imgClass: "w-36 h-36 sm:w-42 sm:h-42 md:w-46 md:h-46",
      title: "text-4xl font-black tracking-tight",
      strokeHeight: "h-12 sm:h-14",
      defaultStrokeWidth: 2.5,
      sub: "text-base",
      gap: "gap-5",
    },
    "3xl": {
      dimension: 200,
      imgClass: "w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56",
      title: "text-5xl font-black tracking-tight",
      strokeHeight: "h-16 sm:h-20",
      defaultStrokeWidth: 2.8,
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
        <div className="flex flex-col justify-center min-w-0">
          {useStrokeText ? (
            <div className="flex items-center -ml-0.5" title="SkillsCatalyst">
              <StrokeText
                text="SkillsCatalyst"
                strokeColor={strokeColor || "#A855F7"}
                fillColor={fillColor || "currentColor"}
                strokeWidth={strokeWidth ?? config.defaultStrokeWidth}
                drawDuration={1.3}
                fillDelay={0.15}
                stagger={0.035}
                ease="power2.out"
                trigger={animated ? "mount" : "none"}
                fillMode="wipe"
                fontSize={128}
                fontWeight={900}
                letterSpacing={-2.5}
                replayTrigger={isHovered}
                className={`${config.strokeHeight} w-auto ${textColor || "text-purple-600 dark:text-purple-400"}`}
              />
            </div>
          ) : (
            <span className={`leading-none font-black ${config.title} ${textColor || "text-purple-600 dark:text-purple-400"}`}>
              SkillsCatalyst
            </span>
          )}
          <span className={`font-semibold leading-tight mt-0.5 ${subTextColor || "text-slate-500 dark:text-purple-300/70"} ${config.sub}`}>
            Accelerated Learning
          </span>
        </div>
      )}
    </div>
  );
}

