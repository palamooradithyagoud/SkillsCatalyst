"use client";

import React from "react";

export interface InteractivePracticeAccordionCardProps {
  className?: string;
}

export default function InteractivePracticeAccordionCard({
  className = "",
}: InteractivePracticeAccordionCardProps) {
  return (
    <div
      className={`w-full h-full select-none bg-[#101523] ${className}`}
    />
  );
}
