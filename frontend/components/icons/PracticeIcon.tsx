"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface PracticeIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Open concentric-ring target with center bullseye dot and top-right dart arrow.
 * Uses currentColor when inactive and #D5FF38 when active, with strict zero glow.
 */
const PracticeIcon = forwardRef<AnimatedIconHandle, PracticeIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.0, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/practice");
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
          {/* Outer open ring */}
          <path d="M 13.1 5.1 A 8.2 8.2 0 1 0 18.9 10.9" />
          {/* Inner open ring */}
          <path d="M 12.0 8.6 A 4.5 4.5 0 1 0 15.4 12.0" />
          {/* Center bullseye dot */}
          <circle cx="11" cy="13" r="1.45" fill={strokeColor} stroke="none" />
          {/* Arrow shaft into bullseye */}
          <path d="M 11.6 12.4 L 16.7 7.3" />
          {/* Symmetrical V-fletched dart flight at top-right */}
          <path d="M 16.7 7.3 L 16.7 4.3 L 19.4 1.6 L 19.4 4.6 L 22.4 4.6 L 19.7 7.3 Z" />
        </svg>
      </motion.div>
    );
  }
);

PracticeIcon.displayName = "PracticeIcon";

export default PracticeIcon;
