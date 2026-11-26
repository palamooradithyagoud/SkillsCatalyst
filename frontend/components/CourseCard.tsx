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
  progressLabel: _progressLabel = "Progress",
  outerBackground: _outerBackground,
  cardBackground = "#D1FAE5",
  className = "",
  style,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 195 });

  // Measure container dimensions dynamically so the cutout and typography scale cleanly across every size
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

  const W = Math.max(dimensions.width, 150);
  const H = Math.max(dimensions.height, 150);

  const isCompact = W < 245;
  const isMedium = W >= 245 && W < 310;
  const R = isCompact ? 20 : 24;

  // Responsive C1-continuous cutout radius scaled via exact 3-4-5 tangent geometry
  const scoopR = isCompact
    ? Math.round(Math.max(29, Math.min(34, W * 0.19)))
    : isMedium
    ? 40
    : 48;
  const cutSpan = scoopR * 2;
  const fillet = Number((scoopR * 0.25).toFixed(2));
  const ptNear = Number((scoopR * 0.4).toFixed(2));
  const ptFar = Number((scoopR * 1.8).toFixed(2));

  const cardPath =
    `M ${cutSpan} 0 ` +
    `L ${W - R} 0 ` +
    `A ${R} ${R} 0 0 1 ${W} ${R} ` +
    `L ${W} ${H - R} ` +
    `A ${R} ${R} 0 0 1 ${W - R} ${H} ` +
    `L ${R} ${H} ` +
    `A ${R} ${R} 0 0 1 0 ${H - R} ` +
    `L 0 ${cutSpan} ` +
    `A ${fillet} ${fillet} 0 0 1 ${ptNear} ${ptFar} ` +
    `A ${scoopR} ${scoopR} 0 0 0 ${ptFar} ${ptNear} ` +
    `A ${fillet} ${fillet} 0 0 1 ${cutSpan} 0 ` +
    `Z`;

  // Nested white progress dial inside the scaled cutout
  const dialMargin = isCompact ? 6 : isMedium ? 8 : 10;
  const dialSize = cutSpan - dialMargin * 2;

  // Ring arc calculations (scaled inside SVG viewBox 0..76)
  const arcRadius = 26;
  const circumference = 2 * Math.PI * arcRadius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Top-right zone (beside the dial): Completed & Pending badges anchored cleanly without text truncation
  const topMetaLeft = cutSpan + (isCompact ? 0 : isMedium ? 6 : 14);
  const topMetaRight = isCompact ? 6 : isMedium ? 12 : 20;
  const topMetaTop = isCompact ? Math.round(cutSpan * 0.5) : isMedium ? 32 : 26;

  // Bottom full-width zone: Video / Course title (clears mobile carousel dots cleanly)
  const bottomSide = isCompact ? 12 : isMedium ? 16 : 22;
  const bottomOffset = isCompact ? 22 : 18;

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
          left: `${dialMargin}px`,
          top: `${dialMargin}px`,
          width: `${dialSize}px`,
          height: `${dialSize}px`,
          boxShadow: "0 4px 14px rgba(30, 17, 53, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
        className="rounded-full bg-white flex items-center justify-center z-10 transition-transform group-hover:scale-105"
      >
        <svg
          style={{ width: `${dialSize}px`, height: `${dialSize}px` }}
          className="-rotate-90"
          viewBox="0 0 76 76"
        >
          {/* Soft neutral track for progress ring */}
          <circle
            cx="38"
            cy="38"
            r={arcRadius}
            fill="none"
            stroke="#E2E8F0"
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
        <span
          className={`absolute inset-0 flex items-center justify-center font-black text-black tracking-tight font-sans ${
            isCompact ? "text-[11px]" : isMedium ? "text-[13px]" : "text-[15px] md:text-[17px]"
          }`}
        >
          {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* ── Top-Right Slot: Completed & Pending Status Rows (lowered cleanly beside dial at larger size) ── */}
      <div
        style={{
          position: "absolute",
          top: `${topMetaTop}px`,
          left: `${topMetaLeft}px`,
          right: `${topMetaRight}px`,
        }}
        className={`flex flex-col items-start justify-start z-10 pointer-events-none overflow-hidden min-w-0 ${
          isCompact ? "gap-1.5" : isMedium ? "gap-2" : "gap-2.5"
        }`}
      >
        {/* Completed Row */}
        <div
          className={`flex items-center text-slate-950 font-extrabold sm:font-black tracking-tight leading-tight min-w-0 max-w-full ${
            isCompact ? "gap-1 text-[10.5px]" : isMedium ? "gap-2 text-[13px]" : "gap-3 text-[17px] lg:text-[19px]"
          }`}
        >
          <div
            className={`rounded-full border-slate-950 flex items-center justify-center shrink-0 ${
              isCompact ? "w-3.5 h-3.5 border-[1.8px]" : isMedium ? "w-4.5 h-4.5 border-[2.1px]" : "w-6 h-6 border-[2.5px]"
            }`}
          >
            <svg
              className={`stroke-slate-950 stroke-[3] ${isCompact ? "w-2 h-2" : isMedium ? "w-3 h-3" : "w-3.5 h-3.5"}`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="whitespace-nowrap">{displayCompleted}</span>
        </div>

        {/* Pending Row */}
        <div
          className={`flex items-center text-slate-950 font-extrabold sm:font-black tracking-tight leading-tight min-w-0 max-w-full ${
            isCompact ? "gap-1 text-[10.5px]" : isMedium ? "gap-2 text-[13px]" : "gap-3 text-[17px] lg:text-[19px]"
          }`}
        >
          <div
            className={`rounded-full border-slate-950 flex items-center justify-center shrink-0 ${
              isCompact ? "w-3.5 h-3.5 border-[1.8px]" : isMedium ? "w-4.5 h-4.5 border-[2.1px]" : "w-6 h-6 border-[2.5px]"
            }`}
          >
            <svg
              className={`stroke-slate-950 stroke-[2.8] ${isCompact ? "w-2 h-2" : isMedium ? "w-3 h-3" : "w-3.5 h-3.5"}`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="whitespace-nowrap">{displayPending}</span>
        </div>
      </div>

      {/* ── Bottom Full-Width Slot: Video / Course Title (plenty of horizontal space across all screens) ── */}
      <div
        style={{
          position: "absolute",
          bottom: `${bottomOffset}px`,
          left: `${bottomSide}px`,
          right: `${bottomSide}px`,
        }}
        className="flex flex-col items-start justify-end z-10 pointer-events-none overflow-hidden min-w-0"
      >
        <h3
          title={title}
          className={`w-full max-w-full overflow-hidden text-left font-black text-slate-950 tracking-tight break-words line-clamp-2 ${
            isCompact
              ? "text-[12.5px] leading-[1.22]"
              : isMedium
              ? "text-[14.5px] leading-snug"
              : "text-[18px] lg:text-[20px] leading-snug"
          }`}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};

export default CourseCard;
