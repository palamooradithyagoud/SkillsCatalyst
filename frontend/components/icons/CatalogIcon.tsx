"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import type { AnimatedIconHandle } from "./types";

export interface CatalogIconProps {
  size?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

/**
 * 2x2 grid Catalog icon: three rounded squares + bottom-right 4-point star outline.
 * Renders white/currentColor outline strokes when inactive and #D5FF38 when active.
 */
const CatalogIcon = forwardRef<AnimatedIconHandle, CatalogIconProps>(
  ({ size = 17, active = false, className = "", strokeWidth = 2.1, onClick }, _ref) => {
    const strokeColor = active ? "#D5FF38" : "currentColor";

    return (
      <motion.div
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        animate={active ? { scale: 1.06 } : { scale: 1 }}
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
          {/* Top-left rounded square */}
          <rect x="3" y="3" width="7" height="7" rx="1.8" />
          {/* Top-right rounded square */}
          <rect x="14" y="3" width="7" height="7" rx="1.8" />
          {/* Bottom-left rounded square */}
          <rect x="3" y="14" width="7" height="7" rx="1.8" />
          {/* Bottom-right 4-point star */}
          <path d="M 17.5 13.7 Q 18.4 16.6 21.3 17.5 Q 18.4 18.4 17.5 21.3 Q 16.6 18.4 13.7 17.5 Q 16.6 16.6 17.5 13.7 Z" />
        </svg>
      </motion.div>
    );
  }
);

CatalogIcon.displayName = "CatalogIcon";

export default CatalogIcon;
