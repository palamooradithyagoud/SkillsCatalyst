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
 * Animated filled rounded-house Home icon with arched doorway cutout.
 * - Inactive: cleanly filled using `currentColor`.
 * - Active / Clicked: fills with Acid Lime (#D5FF38) and plays a snappy
 *   spring motion transition with strict zero glow.
 */
export default function HomeMotionIcon({
  size = 17,
  active: propActive,
  className = "",
  onClick,
}: HomeMotionIconProps) {
  const pathname = usePathname();
  const isActive = propActive !== undefined ? propActive : (pathname === "/dashboard" || pathname === "/");
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((c) => c + 1);
    if (onClick) onClick();
  };

  // Filled with Acid Lime (#D5FF38) when active, solid currentColor when inactive. Zero glow!
  const fillColor = isActive ? "#D5FF38" : "currentColor";

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
        aria-hidden="true"
        className={`overflow-visible select-none transition-colors duration-200 ${className}`}
        style={{ filter: "none" }}
      >
        {/* ── Filled Rounded House with Arched Doorway Cutout ── */}
        <motion.path
          d="M 10.6 4.1 Q 12 3.1 13.4 4.1 L 19.1 7.9 Q 20.5 8.9 20.5 10.6 L 20.5 18.0 Q 20.5 20.5 18.0 20.5 L 15.4 20.5 Q 14.6 20.5 14.6 19.7 L 14.6 14.8 A 2.6 2.6 0 0 0 9.4 14.8 L 9.4 19.7 Q 9.4 20.5 8.6 20.5 L 6.0 20.5 Q 3.5 20.5 3.5 18.0 L 3.5 10.6 Q 3.5 8.9 4.9 7.9 Z"
          strokeWidth={0.5}
          strokeLinejoin="round"
          animate={{
            fill: fillColor,
            stroke: fillColor,
          }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </motion.div>
  );
}

// Compatibility aliases
export const Home = HomeMotionIcon;
export const Home3DIcon = HomeMotionIcon;
export const HomeIcon = HomeMotionIcon;
