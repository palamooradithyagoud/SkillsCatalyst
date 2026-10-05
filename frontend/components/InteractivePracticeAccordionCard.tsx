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
      className={`w-full h-full select-none bg-[#101523] p-5 sm:p-6 lg:p-7 flex flex-col justify-start gap-4 ${className}`}
    >
      {/* Horizontal Card 1 (White) */}
      <div className="w-full h-24 sm:h-28 rounded-2xl bg-white shadow-md border border-slate-100/80 transition-all hover:shadow-lg cursor-pointer" />

      {/* Horizontal Card 2 (White) */}
      <div className="w-full h-24 sm:h-28 rounded-2xl bg-white shadow-md border border-slate-100/80 transition-all hover:shadow-lg cursor-pointer" />

      {/* Downside Space kept at the bottom */}
      <div className="flex-1" />
    </div>
  );
}
