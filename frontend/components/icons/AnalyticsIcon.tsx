"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { AnimatedIconHandle } from "./types";

export interface AnalyticsIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * Pie-chart Analytics icon with detached top-right wedge.
 * - Inactive: crisp rounded outline (`currentColor`).
 * - Active / Clicked: fills solidly with Acid Lime (#D5FF38), plays a subtle
 *   wedge-pop transition, and enforces strict zero glow.
 */
const AnalyticsIcon = forwardRef<AnimatedIconHandle, AnalyticsIconProps>(
  ({ size = 22, active: propActive, className = "", strokeWidth = 2, onClick }, ref) => {
    const pathname = usePathname();
    const isActive = propActive !== undefined ? propActive : pathname.startsWith("/analytics");
    const [clickCount, setClickCount] = useState(0);

    const handleTrigger = () => {
      setClickCount((c) => c + 1);
      if (onClick) onClick();
    };

    useImperativeHandle(ref, () => ({
      startAnimation: () => setClickCount((c) => c + 1),
      stopAnimation: () => {},
    }));

    const strokeColor = isActive ? "#D5FF38" : "currentColor";
    const fillColor = isActive ? "#D5FF38" : "transparent";

    return (
      <motion.div
        key={clickCount}
        onClick={handleTrigger}
        whileTap={{ scale: 0.88 }}
        animate={
          isActive || clickCount > 0
            ? { scale: [1, 0.9, 1.1, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: 0.34,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="inline-flex items-center justify-center shrink-0 cursor-pointer select-none"
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
          className={`overflow-visible select-none transition-colors duration-200 ${className}`}
          style={{ filter: "none" }}
        >
          {/* Main 270° sector (bottom-left) */}
          <motion.path
            d="M 10.2 6.2 L 10.2 12.1 Q 10.2 13.8 11.9 13.8 L 17.8 13.8 A 7.6 7.6 0 1 1 10.2 6.2 Z"
            animate={{
              fill: fillColor,
              stroke: strokeColor,
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Detached quarter wedge (top-right) with subtle pop transition on click/active */}
          <motion.path
            d="M 13.2 10.8 L 13.2 3.2 A 7.6 7.6 0 0 1 20.8 10.8 Z"
            animate={
              isActive || clickCount > 0
                ? {
                    fill: fillColor,
                    stroke: strokeColor,
                    x: [0, 1.5, 0.4],
                    y: [0, -1.5, -0.4],
                  }
                : {
                    fill: fillColor,
                    stroke: strokeColor,
                    x: 0,
                    y: 0,
                  }
            }
            transition={{
              duration: 0.32,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        </svg>
      </motion.div>
    );
  }
);

AnalyticsIcon.displayName = "AnalyticsIcon";

export default AnalyticsIcon;
