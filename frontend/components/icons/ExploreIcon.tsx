"use client";

import React from "react";

interface ExploreIconProps {
  className?: string;
  size?: number;
}

export default function ExploreIcon({ className = "", size = 22 }: ExploreIconProps) {
  return (
    <div className={`IconContainer ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      {/* 1. Telescope SVG */}
      <svg
        className="telescope"
        viewBox="0 0 24 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="telescopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>
        {/* Segment 1: Eyepiece Section (Left) */}
        <rect x="1" y="4" width="4" height="6" rx="1" fill="url(#telescopeGrad)" />
        {/* Segment 2: Middle Barrel Section */}
        <rect x="5.5" y="2.5" width="5" height="9" rx="1" fill="url(#telescopeGrad)" />
        {/* Segment 3: Objective Lens Section (Right) */}
        <rect x="11" y="1" width="12" height="12" rx="2" fill="url(#telescopeGrad)" />
      </svg>

      {/* 2. Tripod Stand SVG */}
      <svg
        className="tripod"
        viewBox="0 0 24 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tripodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <g stroke="url(#tripodGrad)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="1" x2="3" y2="15" />
          <line x1="12" y1="1" x2="12" y2="15" />
          <line x1="12" y1="1" x2="21" y2="15" />
        </g>
      </svg>
    </div>
  );
}
