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
      <blockquote className="relative p-5 sm:p-6 rounded-2xl bg-purple-950/20 border-l-4 border-purple-500 border-y border-r border-white/5 text-slate-200 italic shadow-inner">
        <QuoteIcon className="w-6 h-6 text-purple-400/40 mb-2" />
        <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium text-slate-100">
          “{text}”
        </p>
        {author && (
          <figcaption className="mt-3.5 not-italic text-xs sm:text-sm font-semibold tracking-wide text-purple-300">
            — {author}
          </figcaption>
        )}
      </blockquote>
    </figure>
  );
}
