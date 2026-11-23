"use client";

import React from "react";

interface ArchedCloseIconProps {
  className?: string;
  size?: number;
  borderColor?: string;
  fillColor?: string;
  xColor?: string;
}

export default function ArchedCloseIcon({
  className = "",
  size = 44,
  borderColor = "#3A3D46",
  fillColor = "#20222A",
  xColor = "#D5FF38",
}: ArchedCloseIconProps) {
  // Proportions matching the reference notch: viewBox="0 0 52 44"
  // Baseline starts right on the navbar line (y = 43)
  return (
    <svg
      width={Math.round(size * (52 / 44))}
      height={size}
      viewBox="0 0 52 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Tab Body (Dark Charcoal Filled) */}
      <path
        d="M 0 43 C 6 43, 9 39, 9 32 L 9 14 C 9 6, 16 2, 23 2 L 29 2 C 36 2, 43 6, 43 14 L 43 32 C 43 39, 46 43, 52 43 L 52 44 L 0 44 Z"
        fill={fillColor}
      />

      {/* Realistic Curved Outline Border Lines in Dark Charcoal */}
      <path
        d="M 0 43 C 6 43, 9 39, 9 32 L 9 14 C 9 6, 16 2, 23 2 L 29 2 C 36 2, 43 6, 43 14 L 43 32 C 43 39, 46 43, 52 43"
        stroke={borderColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Close 'X' in Vibrant Acid Lime */}
      <path
        d="M 21 17 L 31 27 M 31 17 L 21 27"
        stroke={xColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
