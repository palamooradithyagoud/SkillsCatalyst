import React from "react";

export interface CourseCardProps {
  progress?: number;
  instructorImage?: string;
  title?: string;
  duration?: string;
  module?: string;
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
  duration = "35 Min",
  module = "Module 5",
  progressLabel = "Progress",
  outerBackground = "transparent",
  cardBackground = "#E0CBFD",
  className,
  onClick,
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Circular progress dial geometry positioned inside the cut top-left corner
  const dialCenterX = 48;
  const dialCenterY = 48;
  const dialRadius = 36;
  const arcRadius = 24;
  const circumference = 2 * Math.PI * arcRadius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Responsive title length & typography
  const displayTitle =
    title.length > 34 ? title.slice(0, 33) + "…" : title;
  const titleFontSize =
    displayTitle.length > 28 ? 23 : displayTitle.length > 20 ? 26 : 30;

  // Smooth notched path cutting out the top-left corner:
  // Starts at top edge (110, 0), wraps card perimeter,
  // then scoops seamlessly around the (48, 48) progress circle with inverted corner fillets.
  const cardPath =
    "M 110 0 " +
    "L 562 0 " +
    "A 32 32 0 0 1 594 32 " +
    "L 594 219 " +
    "A 32 32 0 0 1 562 251 " +
    "L 32 251 " +
    "A 32 32 0 0 1 0 219 " +
    "L 0 110 " +
    "A 14 14 0 0 1 14 96 " +
    "L 80 96 " +
    "A 16 16 0 0 0 96 80 " +
    "L 96 14 " +
    "A 14 14 0 0 1 110 0 " +
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
        {/* Subtle soft shadow for the circular progress dial */}
        <filter id="dialShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1E1135" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Outer Background (Only rendered if explicitly requested) */}
      {outerBackground && outerBackground !== "transparent" && (
        <rect width="594" height="251" fill={outerBackground} />
      )}

      {/* Main Card — Top-left corner cut out with smooth inverted scoop fillets; zero border/outline color */}
      <path
        d={cardPath}
        fill={cardBackground}
      />

      {/* ── Progress Circle Dial (Floats cleanly inside the cut top-left corner) ── */}
      {/* Pure White Circular Badge with zero outer border/outline */}
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
        strokeWidth="4.5"
      />

      {/* Active Progress Arc */}
      <circle
        cx={dialCenterX}
        cy={dialCenterY}
        r={arcRadius}
        fill="none"
        stroke="#1E1135"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${dialCenterX} ${dialCenterY})`}
      />

      {/* Progress percentage label */}
      <text
        x={dialCenterX}
        y={dialCenterY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1E1135"
        fontSize="14"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
      >
        {`${Math.round(clampedProgress)}%`}
      </text>

      {/* ── Right-Side Content (Clean & Borderless) ── */}
      {/* "Progress" Section Label */}
      <text
        x="546"
        y="78"
        textAnchor="end"
        fill="#3B2063"
        fontSize="18"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        letterSpacing="0.5px"
      >
        {progressLabel}
      </text>

      {/* Course Title */}
      <text
        x="546"
        y="124"
        textAnchor="end"
        fill="#1E1135"
        fontSize={titleFontSize}
        letterSpacing="-0.5px"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
      >
        {displayTitle}
      </text>

      {/* ── Course Metadata Groups ── */}
      {/* Clock Icon */}
      <circle
        cx="348"
        cy="168"
        r="8"
        fill="none"
        stroke="#1E1135"
        strokeWidth="2.2"
      />
      <path
        d="M348 163.5 V168 H352"
        fill="none"
        stroke="#1E1135"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Duration Text */}
      <text
        x="364"
        y="174"
        fill="#1E1135"
        fontSize="18"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
      >
        {duration}
      </text>

      {/* Video Module Camera Icon */}
      <rect
        x="456"
        y="160.5"
        width="17"
        height="15"
        rx="2"
        fill="none"
        stroke="#1E1135"
        strokeWidth="2.2"
      />
      <polygon
        points="473,164.5 479,161.5 479,174.5 473,171.5"
        fill="#1E1135"
      />

      {/* Module Text */}
      <text
        x="488"
        y="174"
        fill="#1E1135"
        fontSize="18"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
      >
        {module}
      </text>
    </svg>
  );
};

export default CourseCard;
