"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface CareerIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Rounded briefcase / satchel icon with curved flap and center buckle clasp.
 * Uses currentColor when inactive and #D5FF38 when active, with strict zero glow.
 */
const CareerIcon = forwardRef<AnimatedIconHandle, CareerIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.0, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/career");
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
          {/* Rounded top handle */}
          <path d="M 8.5 6.5 L 8.5 4.8 Q 8.5 3.2 10.1 3.2 L 13.9 3.2 Q 15.5 3.2 15.5 4.8 L 15.5 6.5" />
          {/* Rounded briefcase body */}
          <rect x="2.5" y="6.5" width="19" height="14" rx="4" />
          {/* Curved flap line on left & right of center clasp */}
          <path d="M 2.5 11.2 Q 6.4 13.2 10.2 13.5" />
          <path d="M 13.8 13.5 Q 17.6 13.2 21.5 11.2" />
          {/* Center vertical rounded clasp buckle */}
          <rect x="10.2" y="11.4" width="3.6" height="4.2" rx="1.1" />
        </svg>
      </motion.div>
    );
  }
);

CareerIcon.displayName = "CareerIcon";

export default CareerIcon;
