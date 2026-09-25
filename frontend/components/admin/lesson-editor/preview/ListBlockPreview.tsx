/**
 * frontend/components/admin/lesson-editor/preview/ListBlockPreview.tsx
 * Preview renderer for List blocks (ordered or unordered).
 */

import React from "react";
import type { ListBlockContent } from "@/types/lesson-content";

export const ListBlockPreview: React.FC<{ content: ListBlockContent }> = ({ content }) => {
  const items = content.items || [];
  const isOrdered = Boolean(content.ordered);

  if (items.length === 0) return null;

  if (isOrdered) {
    return (
      <ol className="my-3 space-y-2 list-none counter-reset-[item]">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 font-mono text-[11px] font-semibold shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="my-3 space-y-2 list-none">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
};
