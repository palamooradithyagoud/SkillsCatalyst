/**
 * frontend/components/admin/lesson-editor/preview/ParagraphBlockPreview.tsx
 * Preview renderer for Paragraph blocks.
 */

import React from "react";
import type { ParagraphBlockContent } from "@/types/lesson-content";

export const ParagraphBlockPreview: React.FC<{ content: ParagraphBlockContent }> = ({ content }) => {
  const text = content.text || "";

  return (
    <p className="text-sm sm:text-base text-slate-300 leading-relaxed my-3 whitespace-pre-line font-normal">
      {text}
    </p>
  );
};
