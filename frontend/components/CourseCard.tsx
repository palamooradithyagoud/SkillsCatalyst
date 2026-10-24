import React from "react";

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
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  progress = 42,
  instructorImage: _instructorImage, // Strictly no images or external assets
  title = "UX Research Basics",
  duration,
  module,
  completed,
  pending,
  progressLabel = "Progress",
  outerBackground = "transparent",
  cardBackground = "#E0CBFD",
  className,
  onClick,
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Circular progress dial geometry positioned inside the cut top-left corner (enlarged & bold)
  const dialCenterX = 54;
  const dialCenterY = 54;
  const dialRadius = 46;
  const arcRadius = 31;
  const circumference = 2 * Math.PI * arcRadius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Responsive title length & typography
  const displayTitle =
    title.length > 34 ? title.slice(0, 33) + "…" : title;
  const titleFontSize =
    displayTitle.length > 28 ? 23 : displayTitle.length > 20 ? 26 : 30;

  // Format completed & pending labels
  const displayCompleted =
    completed !== undefined
      ? typeof completed === "number"
        ? `${completed} Completed`
        : completed
      : duration
      ? duration
      : "5 Completed";

  const displayPending =
    pending !== undefined
      ? typeof pending === "number"
        ? `${pending} Pending`
        : pending
      : module
      ? module
      : "7 Pending";

  // Seamless round circular scoop cutting out the top-left corner around the enlarged progress circle:
  // Circular arc (radius 58 centered at 54, 54) with smooth C1-continuous tangent fillets (radius 12)
  // blending into the top edge at (110, 0) and left edge at (0, 110).
  const cardPath =
    "M 110 0 " +
    "L 562 0 " +
    "A 32 32 0 0 1 594 32 " +
    "L 594 219 " +
    "A 32 32 0 0 1 562 251 " +
    "L 32 251 " +
    "A 32 32 0 0 1 0 219 " +
    "L 0 110 " +
    "A 12 12 0 0 1 19.2 100.4 " +
    "A 58 58 0 0 0 100.4 19.2 " +
    "A 12 12 0 0 1 110 0 " +
    "Z";

  return (
    <svg
      viewBox="0 0 594 251"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: "594px", display: "block" }}
      className={className}
      onClick={onClick}
    >
      <defs>
        {/* Subtle soft shadow for the enlarged circular progress dial */}
        <filter id="dialShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#1E1135" floodOpacity="0.10" />
        </filter>
      </defs>

      {/* Outer Background (Only rendered if explicitly requested) */}
      {outerBackground && outerBackground !== "transparent" && (
        <rect width="594" height="251" fill={outerBackground} />
      )}

      {/* Main Card — Top-left corner cut out in a smooth round circular shape; zero border/outline color */}
      <path
        d={cardPath}
        fill={cardBackground}
      />

      {/* ── Progress Circle Dial (Floats cleanly inside the round cut corner) ── */}
      {/* Pure White Circular Badge (Enlarged) with zero outer border/outline */}
      <circle
        cx={dialCenterX}
        cy={dialCenterY}
        r={dialRadius}
        fill="#ffffff"
        filter="url(#dialShadow)"
      />

      {/* Soft light track for progress ring */}
      <circle
        cx={dialCenterX}
        cy={dialCenterY}
        r={arcRadius}
        fill="none"
        stroke="#E9D5FF"
        strokeWidth="6.5"
      />

      {/* Active Bold Black Progress Arc */}
      <circle
        cx={dialCenterX}
        cy={dialCenterY}
        r={arcRadius}
        fill="none"
        stroke="#000000"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${dialCenterX} ${dialCenterY})`}
      />

      {/* Bold Black Progress percentage label */}
      <text
        x={dialCenterX}
        y={dialCenterY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#000000"
        fontSize="17"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
      >
        {`${Math.round(clampedProgress)}%`}
      </text>

      {/* ── Left-Side Metadata: Completed & Pending (Dark & Bold) ── */}
      {/* Completed Check Icon & Text */}
      <circle
        cx={54}
        cy={160}
        r={9}
        fill="none"
        stroke="#000000"
        strokeWidth="2.6"
      />
      <path
        d="M50 160.5 L53 163.5 L58 157"
        fill="none"
        stroke="#000000"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={72}
        y={166}
        fill="#000000"
        fontSize="17"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
      >
        {displayCompleted}
      </text>

      {/* Pending Clock Icon & Text */}
      <circle
        cx={54}
        cy={198}
        r={9}
        fill="none"
        stroke="#000000"
        strokeWidth="2.6"
      />
      <path
        d="M54 193.5 V198 H58"
        fill="none"
        stroke="#000000"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={72}
        y={204}
        fill="#000000"
        fontSize="17"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
      >
        {displayPending}
      </text>

      {/* ── Right-Side Content (Dark Colour & Bold) ── */}
      {/* "Progress" Section Label */}
      <text
        x="546"
        y="78"
        textAnchor="end"
        fill="#000000"
        fontSize="18"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        letterSpacing="0.6px"
      >
        {progressLabel}
      </text>

      {/* Course Title */}
      <text
        x="546"
        y="124"
        textAnchor="end"
        fill="#000000"
        fontSize={titleFontSize}
        letterSpacing="-0.5px"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
      >
        {displayTitle}
      </text>
    </svg>
  );
};

export default CourseCard;
