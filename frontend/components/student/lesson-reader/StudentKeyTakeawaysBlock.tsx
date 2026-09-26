"use client";

import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { KeyTakeawaysBlockContent } from "@/types/lesson-content";

interface StudentKeyTakeawaysBlockProps {
  content: KeyTakeawaysBlockContent;
}

export function StudentKeyTakeawaysBlock({ content }: StudentKeyTakeawaysBlockProps) {
  const items = content.items || [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="my-8 rounded-2xl border border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 p-5 sm:p-7 shadow-2xs">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-purple-100">
        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
          Key Takeaways
        </h3>
      </div>

      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
            <span className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
