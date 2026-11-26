"use client";

import React from "react";
import { Box, Clock, Layers } from "lucide-react";
import type { RoadmapMetricIconKey } from "@/data/roadmaps/roadmapCards";

export function SignalBarsIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="10.5" width="3" height="5" rx="1" />
      <rect x="7.5" y="6.5" width="3" height="9" rx="1" />
      <rect x="13" y="2.5" width="3" height="13" rx="1" />
    </svg>
  );
}

export function RoadmapMetricIcon({
  kind,
  className = "w-3.5 h-3.5",
}: {
  kind: RoadmapMetricIconKey;
  className?: string;
}) {
  if (kind === "level") {
    return <SignalBarsIcon className={className} />;
  }
  if (kind === "units") {
    return <Layers className={className} strokeWidth={2} aria-hidden="true" />;
  }
  if (kind === "duration") {
    return <Clock className={className} strokeWidth={2} aria-hidden="true" />;
  }
  return <Box className={className} strokeWidth={2} aria-hidden="true" />;
}
