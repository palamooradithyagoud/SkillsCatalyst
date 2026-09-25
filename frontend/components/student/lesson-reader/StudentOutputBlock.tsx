"use client";

import React from "react";
import { Terminal } from "lucide-react";
import type { OutputBlockContent } from "@/types/lesson-content";

interface StudentOutputBlockProps {
  content: OutputBlockContent;
}

export function StudentOutputBlock({ content }: StudentOutputBlockProps) {
  const text = content.text || "";

  return (
    <div className="my-5 rounded-2xl border border-emerald-500/20 bg-slate-950/90 overflow-hidden shadow-lg shadow-emerald-950/10">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border-b border-emerald-500/10">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 font-mono">
          Expected Output
        </span>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-emerald-400/95 font-mono leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
