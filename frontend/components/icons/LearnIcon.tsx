"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface LearnIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Rounded bound-notebook / book-spine icon for the Learn section.
 * Outline strokes use currentColor when inactive and #D5FF38 when active.
 */
const LearnIcon = forwardRef<AnimatedIconHandle, LearnIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.1, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/learning");
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
          {/* Upper cover + continuous curved left spine + lower binding wrap */}
          <path d="M 5 17.5 L 5 6 A 3 3 0 0 1 8 3 L 15.5 3 A 1.5 1.5 0 0 1 17 4.5 L 17 13 A 1.5 1.5 0 0 1 15.5 14.5 L 8 14.5 A 3 3 0 0 0 5 17.5 A 3 3 0 0 0 8 20.5 L 18 20.5 A 1.5 1.5 0 0 0 19.5 19 L 19.5 6.5" />
          {/* Inner bottom page line */}
          <path d="M 9 17.5 L 16 17.5" />
        </svg>
      </motion.div>
    );
  }
);

LearnIcon.displayName = "LearnIcon";

export default LearnIcon;
