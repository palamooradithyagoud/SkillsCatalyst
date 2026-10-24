"use client";

import React, { useRef, useState, useEffect } from "react";

export interface CourseCardProps {
  progress?: number;
  instructorImage?: string;
  title?: string;
  duration?: string;
  module?: string;
  completed?: string | number;
  pending?: string | number;
  progressLabel?: string;
  outerBackground?: string;
  cardBackground?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  progress = 42,
  instructorImage: _instructorImage,
  title = "UX Research Basics",
  duration,
  module,
  completed,
  pending,
  progressLabel = "Progress",
  outerBackground: _outerBackground,
  cardBackground = "#D1FAE5",
  className = "",
  style,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 195 });

  // Measure container dimensions dynamically so the SVG path fills 100% of any card size
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  // Format completed & pending labels
  const displayCompleted =
    completed !== undefined
      ? typeof completed === "number"
        ? `${completed} Completed`
        : completed
      : duration
      ? duration
      : "3 Completed";

  const displayPending =
    pending !== undefined
      ? typeof pending === "number"
        ? `${pending} Pending`
        : pending
      : module
      ? module
      : "135 Pending";

  const W = Math.max(dimensions.width, 160);
  const H = Math.max(dimensions.height, 150);
  const R = 24; // standard corner radius for top-right, bottom-right, bottom-left

  // ── Exact C1-Continuous Concave Round Cutout Geometry ──
  // Scoop center at (48, 48), scoop radius 48, with 12px tangent fillets into the top & left edges.
  // The path dynamically spans from (0, 0) to (W, H) to fill 100% of the card area seamlessly.
  const cardPath =
    `M 96 0 ` +
    `L ${W - R} 0 ` +
    `A ${R} ${R} 0 0 1 ${W} ${R} ` +
    `L ${W} ${H - R} ` +
    `A ${R} ${R} 0 0 1 ${W - R} ${H} ` +
    `L ${R} ${H} ` +
    `A ${R} ${R} 0 0 1 0 ${H - R} ` +
    `L 0 96 ` +
    `A 12 12 0 0 1 19.2 86.4 ` +
    `A 48 48 0 0 0 86.4 19.2 ` +
    `A 12 12 0 0 1 96 0 ` +
    `Z`;

  // Ring arc calculations (Radius 26 inside 76x76 dial, centered at 38, 38)
  const arcRadius = 26;
  const circumference = 2 * Math.PI * arcRadius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={style}
      className={`w-full h-full relative overflow-hidden select-none cursor-pointer rounded-[20px] sm:rounded-[24px] ${className}`}
    >
      {/* ── Dynamic Scaled SVG Background with Pristine Round Top-Left Cutout ── */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={cardPath} fill={cardBackground} />
      </svg>

      {/* ── Floating White Circular Progress Dial (Nested perfectly inside the round cut) ── */}
      <div
        style={{
          position: "absolute",
          left: "10px",
          top: "10px",
          width: "76px",
          height: "76px",
          boxShadow: "0 4px 14px rgba(30, 17, 53, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
        className="rounded-full bg-white flex items-center justify-center z-10 transition-transform group-hover:scale-105"
      >
        <svg className="w-[76px] h-[76px] -rotate-90" viewBox="0 0 76 76">
          {/* Soft light track for progress ring */}
          <circle
            cx="38"
            cy="38"
            r={arcRadius}
            fill="none"
            stroke="#E9D5FF"
            strokeWidth="5.5"
          />
          {/* Active Bold Black Progress Arc */}
          <circle
            cx="38"
            cy="38"
            r={arcRadius}
            fill="none"
            stroke="#000000"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Bold Black Progress Percentage */}
        <span className="absolute inset-0 flex items-center justify-center text-[14px] sm:text-[15px] font-black text-black tracking-tight font-sans">
          {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* ── Top-Right Header: Tag & Course Title ── */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "18px",
          left: "98px",
        }}
        className="flex flex-col items-end text-right z-10 pointer-events-none"
      >
        <span className="text-[10px] sm:text-[11.5px] font-black tracking-wide uppercase text-slate-900 leading-tight">
          {progressLabel}
        </span>
        <h3
          title={title}
          className="text-[13.5px] sm:text-[15.5px] md:text-[16.5px] font-black text-slate-950 tracking-tight leading-snug line-clamp-2 mt-0.5 sm:mt-1"
        >
          {title}
        </h3>
      </div>

      {/* ── Bottom-Left Status: Completed & Pending Badges ── */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "18px",
        }}
        className="flex flex-col gap-1.5 sm:gap-2 z-10 pointer-events-none"
      >
        {/* Completed Row */}
        <div className="flex items-center gap-2 text-slate-950 font-black text-[12px] sm:text-[13px] leading-tight">
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border-[2.2px] border-slate-950 flex items-center justify-center shrink-0">
            <svg
              className="w-2.5 h-2.5 sm:w-2.8 sm:h-2.8 stroke-slate-950 stroke-[3]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="truncate">{displayCompleted}</span>
        </div>

        {/* Pending Row */}
        <div className="flex items-center gap-2 text-slate-950 font-black text-[12px] sm:text-[13px] leading-tight">
          <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border-[2.2px] border-slate-950 flex items-center justify-center shrink-0">
            <svg
              className="w-2.5 h-2.5 sm:w-2.8 sm:h-2.8 stroke-slate-950 stroke-[2.8]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="truncate">{displayPending}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
