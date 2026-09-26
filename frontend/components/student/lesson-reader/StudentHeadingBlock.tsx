"use client";

import React from "react";
import type { HeadingBlockContent } from "@/types/lesson-content";

interface StudentHeadingBlockProps {
  content: HeadingBlockContent;
}

export function StudentHeadingBlock({ content }: StudentHeadingBlockProps) {
  const level = content.level || 2;
  const text = content.text || "";

  // Strictly enforce H2, H3, H4 hierarchy; H1 is reserved for the lesson page title
  if (level === 2) {
    return (
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4 border-b border-slate-200/90 pb-2.5">
        {text}
      </h2>
    );
  }

  if (level === 3) {
    return (
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-6 mb-3">
        {text}
      </h3>
    );
  }

  return (
    <h4 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight mt-4 mb-2">
      {text}
    </h4>
  );
}
