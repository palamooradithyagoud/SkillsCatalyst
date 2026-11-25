"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface ExploreIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Clean outline Explore icon: open-crescent magnifying glass framing a 4-point rounded star.
 * Uses currentColor when inactive and #D5FF38 when active, with strict zero glow.
 */
const ExploreIcon = forwardRef<AnimatedIconHandle, ExploreIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.1, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/explore");
    const strokeColor = isActive ? "#D5FF38" : "currentColor";

    return (
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        animate={isActive ? { scale: 1.06 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="inline-flex items-center justify-center shrink-0 select-none"
        style={{ filter: "none" }}
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
          className={`transition-colors duration-200 ${className}`}
          style={{ filter: "none" }}
        >
          {/* Nestled 4-point sparkle/star on left */}
          <path d="M 6.5 6.5 Q 7.45 9.55 10.5 10.5 Q 7.45 11.45 6.5 14.5 Q 5.55 11.45 2.5 10.5 Q 5.55 9.55 6.5 6.5 Z" />
          {/* Open magnifying-glass crescent ring */}
          <path d="M 9.4 4.1 A 7.25 7.25 0 1 1 9.4 16.9" />
          {/* Diagonal handle */}
          <path d="M 17.9 15.6 L 21.2 19.0" />
        </svg>
      </motion.div>
    );
  }
);

ExploreIcon.displayName = "ExploreIcon";

export default ExploreIcon;
