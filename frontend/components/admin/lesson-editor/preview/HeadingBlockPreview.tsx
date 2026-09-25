/**
 * frontend/components/admin/lesson-editor/preview/HeadingBlockPreview.tsx
 * Preview renderer for Heading blocks.
 */

import React from "react";
import type { HeadingBlockContent } from "@/types/lesson-content";

export const HeadingBlockPreview: React.FC<{ content: HeadingBlockContent }> = ({ content }) => {
  const level = content.level || 2;
  const text = content.text || "";

  if (level === 2) {
    return (
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-3 pb-2 border-b border-slate-800">
        {text}
      </h2>
    );
  }

  if (level === 3) {
    return (
      <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mt-5 mb-2">
        {text}
      </h3>
    );
  }

  return (
    <h4 className="text-base sm:text-lg font-medium text-slate-200 mt-4 mb-2">
      {text}
    </h4>
  );
};
