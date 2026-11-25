"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface SkillBitsIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Rounded squircle + centered play-triangle outline icon for SkillBits.
 */
const SkillBitsIcon = forwardRef<AnimatedIconHandle, SkillBitsIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.1, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/skillbits");
    const strokeColor = isActive ? "#D5FF38" : "currentColor";

    return (
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        animate={isActive ? { scale: 1.06 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="inline-flex items-center justify-center shrink-0 select-none"
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
        >
          {/* Outer rounded squircle container */}
          <rect x="3" y="3" width="18" height="18" rx="5.2" />
          {/* Centered rounded play triangle */}
          <path d="M 9.8 9.2 C 9.8 8.4 10.6 8.1 11.2 8.5 L 15.6 11.3 C 16.2 11.7 16.2 12.3 15.6 12.7 L 11.2 15.5 C 10.6 15.9 9.8 15.6 9.8 14.8 Z" />
        </svg>
      </motion.div>
    );
  }
);

SkillBitsIcon.displayName = "SkillBitsIcon";

export default SkillBitsIcon;
