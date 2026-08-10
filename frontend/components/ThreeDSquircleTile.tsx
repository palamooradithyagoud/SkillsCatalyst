"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ThreeDSquircleTileProps {
  icon?: any;
  text?: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  badge?: boolean | string;
  badgeColor?: string;
  filled?: boolean;
  label?: string;
  className?: string;
}

export default function ThreeDSquircleTile({
  icon: IconComponent,
  text,
  isActive = false,
  onClick,
  size = "md",
  badge = false,
  badgeColor = "bg-emerald-500",
  filled = false,
  label,
  className = "",
}: ThreeDSquircleTileProps) {
  const [isRippling, setIsRippling] = useState(false);

  // Size dimensions mapping
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const iconPxSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  const handleClick = (e: React.MouseEvent) => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 500);
    if (onClick) onClick();
  };

  // Determine icon color classes
  const iconColorClass = filled
    ? "text-white"
    : isActive
    ? "text-[#234B3B] font-bold"
    : "text-slate-600 group-hover:text-slate-900";

  return (
    <motion.button
      type="button"
      aria-label={label || text || "Navigation Item"}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.88, rotate: -4 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={`relative bg-transparent outline-none border-none cursor-pointer ${sizeClasses[size]} [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group flex items-center justify-center select-none ${className}`}
    >
      {/* ── Ripple Pulse Ring on Tap ── */}
      <AnimatePresence>
        {isRippling && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl bg-emerald-500/30 border border-emerald-400/50 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* ── 3D Back Layer (Offset shadow/card pill) ── */}
      <span
        className={`absolute top-0 left-0 w-full h-full rounded-[1.15em] block border transition-all duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] [will-change:transform] ${
          filled
            ? "bg-[#0b462c] border-[#105637] rotate-[18deg] scale-105 opacity-100"
            : isActive
            ? "bg-gradient-to-br from-[#234B3B] to-[#163328] border-[#234B3B]/40 rotate-[20deg] scale-105 opacity-100 group-hover:[transform:rotate(26deg)_translate3d(-0.35em,-0.35em,0.35em)]"
            : "bg-slate-100/90 border-slate-200/90 rotate-[15deg] opacity-70 group-hover:opacity-100 group-hover:bg-slate-200/80 group-hover:border-slate-300 group-hover:[transform:rotate(24deg)_translate3d(-0.3em,-0.3em,0.3em)]"
        }`}
        style={{
          boxShadow: filled
            ? "0.35em -0.35em 0.9em rgba(11, 70, 44, 0.4), 0 0 12px rgba(16, 185, 129, 0.2)"
            : isActive
            ? "0.4em -0.4em 1em rgba(35, 75, 59, 0.35), 0 0 15px rgba(35, 75, 59, 0.2)"
            : "0.35em -0.35em 0.75em rgba(0,0,0,0.06)",
        }}
      />

      {/* ── 3D Front Glass Layer ── */}
      <span
        className={`absolute top-0 left-0 w-full h-full rounded-[1.15em] transition-all duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-xl [will-change:transform] transform ${
          filled
            ? "bg-[#084227] border border-[#166542] text-white [transform:translate3d(0,0,0.6em)] group-hover:[transform:translate3d(0,0,1.8em)]"
            : isActive
            ? "bg-white/95 border border-white text-[#234B3B] [transform:translate3d(0,0,0.8em)] group-hover:[transform:translate3d(0,0,2em)]"
            : "bg-white/80 border border-white/90 text-slate-600 group-hover:text-slate-900 group-hover:bg-white/95 group-hover:[transform:translate3d(0,0,1.8em)]"
        }`}
        style={{
          boxShadow: filled
            ? "inset 0 0 0 0.1em rgba(255, 255, 255, 0.2), 0 4px 14px rgba(8, 66, 39, 0.3)"
            : isActive
            ? "inset 0 0 0 0.12em rgba(255, 255, 255, 0.9), 0 6px 18px rgba(35, 75, 59, 0.18)"
            : "inset 0 0 0 0.1em rgba(255, 255, 255, 0.9), 0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <span className="m-auto flex items-center justify-center relative z-10">
          {text ? (
            <span className={`font-black tracking-tight ${filled ? "text-white" : isActive ? "text-[#234B3B]" : "text-slate-800"}`}>
              {text}
            </span>
          ) : React.isValidElement(IconComponent) ? (
            React.cloneElement(IconComponent as React.ReactElement<any>, {
              className: `transition-transform duration-200 group-hover:scale-110 ${iconColorClass}`,
              size: iconPxSizes[size],
            })
          ) : IconComponent ? (
            <IconComponent
              size={iconPxSizes[size]}
              className={`transition-transform duration-200 group-hover:scale-110 ${iconColorClass}`}
            />
          ) : null}
        </span>

        {/* Badge / Notification Dot */}
        {badge && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 z-20">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badgeColor} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${badgeColor} ring-2 ring-white`} />
          </span>
        )}
      </span>
    </motion.button>
  );
}
