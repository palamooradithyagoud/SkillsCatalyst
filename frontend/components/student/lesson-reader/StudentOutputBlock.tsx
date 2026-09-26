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
    <div className="my-5 rounded-2xl border border-slate-200/90 bg-[#080d1a] overflow-hidden shadow-xs">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
          Expected Output
        </span>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}
