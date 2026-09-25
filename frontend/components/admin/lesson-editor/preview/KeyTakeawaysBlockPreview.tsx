/**
 * frontend/components/admin/lesson-editor/preview/KeyTakeawaysBlockPreview.tsx
 * Preview renderer for Key Takeaways summary cards.
 */

import React from "react";
import { CheckSquare } from "lucide-react";
import type { KeyTakeawaysBlockContent } from "@/types/lesson-content";

export const KeyTakeawaysBlockPreview: React.FC<{ content: KeyTakeawaysBlockContent }> = ({ content }) => {
  const items = content.items || [];
  if (items.length === 0) return null;

  return (
    <div className="my-5 p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-emerald-900/40 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
        <CheckSquare className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
          Key Takeaways
        </h4>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
