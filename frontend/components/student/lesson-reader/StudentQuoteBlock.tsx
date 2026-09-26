"use client";

import React from "react";
import { Quote as QuoteIcon } from "lucide-react";
import type { QuoteBlockContent } from "@/types/lesson-content";

interface StudentQuoteBlockProps {
  content: QuoteBlockContent;
}

export function StudentQuoteBlock({ content }: StudentQuoteBlockProps) {
  const text = content.text || "";
  const author = content.author?.trim();

  return (
    <figure className="my-6">
      <blockquote className="relative p-5 sm:p-6 rounded-2xl bg-purple-50/50 border-l-4 border-purple-600 border-y border-r border-purple-200/80 text-slate-800 italic shadow-2xs">
        <QuoteIcon className="w-6 h-6 text-purple-500/60 mb-2" />
        <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium text-slate-800">
          “{text}”
        </p>
        {author && (
          <figcaption className="mt-3.5 not-italic text-xs sm:text-sm font-bold tracking-wide text-purple-700">
            — {author}
          </figcaption>
        )}
      </blockquote>
    </figure>
  );
}
