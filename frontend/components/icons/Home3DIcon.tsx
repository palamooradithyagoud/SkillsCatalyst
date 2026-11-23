"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export interface HomeMotionIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Animated 2D Motion Home Icon for mobile view.
 * Displays the 2D front house from Image 1 with clean rounded borders.
 * On click / when active:
 *  - Borders smoothly transition from black/neutral to Acid Lime (#D5FF38) with ZERO glow.
 *  - Plays a snappy, lively spring motion transition (tilt angle, squish, hop, and door bounce).
 */
export default function HomeMotionIcon({
  size = 22,
  active: propActive,
  className = "",
  strokeWidth = 2.2,
  onClick,
}: HomeMotionIconProps) {
  const pathname = usePathname();
  const isActive = propActive !== undefined ? propActive : (pathname === "/dashboard" || pathname === "/");
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((c) => c + 1);
    if (onClick) onClick();
  };

  // Color: Acid Lime (#D5FF38) when active, dark/current when inactive. Zero glow!
  const strokeColor = isActive ? "#D5FF38" : "currentColor";

  return (
    <motion.div
      key={clickCount}
      onClick={handleClick}
      whileTap={{ scale: 0.86 }}
      animate={
        isActive
          ? {
              scale: [1, 0.88, 1.15, 0.96, 1.04, 1],
              rotate: [0, -9, 4, -2, 0],
              y: [0, -3.5, 0.5, 0],
            }
          : {
              scale: 1,
              rotate: 0,
              y: 0,
            }
      }
      transition={{
        duration: 0.45,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="inline-flex items-center justify-center shrink-0 cursor-pointer select-none"
      style={{
        filter: "none", // Strict zero glow
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`overflow-visible select-none transition-colors duration-200 ${className}`}
        style={{ filter: "none" }}
      >
        {/* ── 2D House Pentagonal Outer Outline (Image 1) ── */}
        <motion.path
          d="M 4.5 19.5 L 4.5 9.8 L 12 3.5 L 19.5 9.8 L 19.5 19.5 Z"
          animate={{
            stroke: strokeColor,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* ── Center Arched Doorway with Elastic Spring Micro-Lift ── */}
        <motion.path
          d="M 9.5 19.5 L 9.5 13.5 C 9.5 11.5 14.5 11.5 14.5 13.5 L 14.5 19.5"
          animate={
            isActive
              ? {
                  stroke: strokeColor,
                  scaleY: [1, 1.15, 0.94, 1],
                  originY: 0.85,
                }
              : {
                  stroke: strokeColor,
                  scaleY: 1,
                }
          }
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.04,
          }}
        />
      </svg>
    </motion.div>
  );
}

// Compatibility aliases
export const Home = HomeMotionIcon;
export const Home3DIcon = HomeMotionIcon;
export const HomeIcon = HomeMotionIcon;
