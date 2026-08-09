"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SkillsCatalystLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
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

  // Size configurations matching the new squircle brand logo
  const config = {
    sm: {
      box: "w-8 h-8 rounded-[11px]",
      svg: "w-4 h-4",
      dot: "w-2 h-2 -top-0.5 -right-0.5 border-[1.5px]",
      title: "text-base",
      sub: "text-[10px]",
      gap: "gap-2.5",
    },
    md: {
      box: "w-10 h-10 rounded-[14px]",
      svg: "w-5 h-5",
      dot: "w-2.5 h-2.5 -top-0.5 -right-0.5 border-2",
      title: "text-lg",
      sub: "text-[11px]",
      gap: "gap-3",
    },
    lg: {
      box: "w-14 h-14 rounded-[18px]",
      svg: "w-7 h-7",
      dot: "w-3.5 h-3.5 -top-1 -right-1 border-2",
      title: "text-2xl",
      sub: "text-xs",
      gap: "gap-3.5",
    },
    xl: {
      box: "w-20 h-20 rounded-[24px]",
      svg: "w-10 h-10",
      dot: "w-4.5 h-4.5 -top-1 -right-1 border-2",
      title: "text-4xl",
      sub: "text-sm",
      gap: "gap-4.5",
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none cursor-pointer group ${config.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title="SkillsCatalyst — Accelerated Learning"
    >
      {/* ── Brand Green Squircle Badge with Beacon ── */}
      <motion.div
        animate={
          animated
            ? {
                scale: isHovered ? 1.05 : 1,
                y: isHovered ? -1.5 : 0,
              }
            : {}
        }
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className={`relative bg-gradient-to-br from-[#0d6b49] via-[#09573b] to-[#043c28] text-white flex items-center justify-center shadow-md shadow-[#0d6b49]/25 border border-emerald-400/20 shrink-0 ${config.box}`}
      >
        {/* Top-Right Emerald Green Dot Beacon */}
        <span
          className={`absolute rounded-full bg-[#10b981] border-white shadow-sm ${config.dot} ${
            animated ? "animate-pulse" : ""
          }`}
        />

        {/* Crisp White Code Brackets Symbol </ > */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${config.svg} text-white transition-transform duration-300 ${
            isHovered ? "scale-110" : ""
          }`}
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      </motion.div>

      {/* ── Brand Typography: SkillsCatalyst / Accelerated Learning ── */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-slate-900 leading-none ${config.title}`}>
            SkillsCatalyst
          </span>
          <span className={`font-medium text-slate-500 leading-tight mt-0.5 ${config.sub}`}>
            Accelerated Learning
          </span>
        </div>
      )}
    </div>
  );
}
