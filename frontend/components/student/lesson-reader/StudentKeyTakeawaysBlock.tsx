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
    <div className="my-8 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-purple-950/20 p-5 sm:p-7 shadow-xl shadow-purple-950/10">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-purple-500/20">
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
          Key Takeaways
        </h3>
      </div>

      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
            <span className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
