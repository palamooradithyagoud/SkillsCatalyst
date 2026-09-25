/**
 * frontend/components/admin/lesson-editor/preview/QuoteBlockPreview.tsx
 * Preview renderer for Quote blocks.
 */

import React from "react";
import type { QuoteBlockContent } from "@/types/lesson-content";

export const QuoteBlockPreview: React.FC<{ content: QuoteBlockContent }> = ({ content }) => {
  return (
    <blockquote className="my-5 pl-4 sm:pl-5 border-l-4 border-sky-500 py-1 space-y-1.5">
      <p className="text-sm sm:text-base italic text-slate-200 leading-relaxed">
        &ldquo;{content.text}&rdquo;
      </p>
      {content.author && (
        <cite className="block text-xs sm:text-sm font-medium text-slate-400 not-italic">
          &mdash; {content.author}
        </cite>
      )}
    </blockquote>
  );
};
