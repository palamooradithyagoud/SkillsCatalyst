"use client";

import React from "react";

export interface SpeederLoaderProps {
  /** Optional message or status text shown below the loader */
  label?: string;
  /** Whether the loader should be rendered as a full-screen fixed overlay */
  fullscreen?: boolean;
  /** Custom color for the speeder and fazers (defaults to CSS variable or #000 / theme) */
  color?: string;
  /** Scale factor (e.g. 0.8 for compact, 1 for default, 1.2 for large) */
  scale?: number;
  /** Additional CSS class names */
  className?: string;
  /** Force dark or light mode color palette */
  theme?: "light" | "dark" | "auto";
}

export default function SpeederLoader({
  label,
  fullscreen = false,
  color,
  scale = 1,
  className = "",
  theme = "auto",
}: SpeederLoaderProps) {
  const containerStyle: React.CSSProperties = {
    ...(color ? ({ "--speeder-color": color } as React.CSSProperties) : {}),
  };

  const content = (
    <div
      className={`speeder-container ${theme === "light" ? "force-light" : theme === "dark" ? "dark-theme" : ""} ${className}`}
      style={containerStyle}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading..."}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
          width: "240px",
          height: "140px",
        }}
      >
        {/* Speeder & Pilot */}
        <div className="loader">
          <span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <div className="base">
            <span></span>
            <div className="face"></div>
          </div>
        </div>

        {/* Speed streak lines */}
        <div className="longfazers">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {label && (
        <p className="mt-4 text-xs sm:text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 animate-pulse text-center">
          {label}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
}
