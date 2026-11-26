"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface RoadmapsIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Isometric layered diamond card with bottom cradle curve and navigation pointer.
 * Uses currentColor when inactive and #D5FF38 when active, with strict zero glow.
 */
const RoadmapsIcon = forwardRef<AnimatedIconHandle, RoadmapsIconProps>(
  ({ size = 18, active: propActive, className = "", strokeWidth = 2.0, onClick }, _ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/roadmaps");
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
          {/* Top isometric rounded diamond card */}
          <path d="M 10.2 4.4 Q 12 3.2 13.8 4.4 L 19.0 8.0 Q 21.0 9.3 19.0 10.6 L 13.8 14.2 Q 12 15.4 10.2 14.2 L 5.0 10.6 Q 3.0 9.3 5.0 8.0 Z" />

          {/* Bottom stacked cradle layer */}
          <path d="M 4.1 13.4 Q 3.7 14.8 5.2 15.8 L 10.2 19.4 Q 12 20.6 13.8 19.4 L 18.8 15.8 Q 20.3 14.8 19.9 13.4" />

          {/* Center navigation pointer */}
          <path
            d="M 14.6 7.3 L 9.1 9.1 L 11.3 9.7 L 12.0 11.9 Z"
            fill={strokeColor}
            stroke={strokeColor}
            strokeWidth={1.1}
          />
        </svg>
      </motion.div>
    );
  }
);

RoadmapsIcon.displayName = "RoadmapsIcon";

export default RoadmapsIcon;
