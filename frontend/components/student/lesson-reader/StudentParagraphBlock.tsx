"use client";

import React from "react";
import type { ParagraphBlockContent } from "@/types/lesson-content";

interface StudentParagraphBlockProps {
  content: ParagraphBlockContent;
}

export function StudentParagraphBlock({ content }: StudentParagraphBlockProps) {
  const text = content.text || "";

  return (
    <p className="text-slate-300 text-base sm:text-[17px] leading-relaxed mb-5 whitespace-pre-line font-normal max-w-prose">
      {text}
    </p>
  );
}
