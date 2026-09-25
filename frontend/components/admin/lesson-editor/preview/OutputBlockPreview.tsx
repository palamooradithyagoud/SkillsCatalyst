/**
 * frontend/components/admin/lesson-editor/preview/OutputBlockPreview.tsx
 * Preview renderer for Expected Output blocks.
 */

import React from "react";
import { Terminal } from "lucide-react";
import type { OutputBlockContent } from "@/types/lesson-content";

export const OutputBlockPreview: React.FC<{ content: OutputBlockContent }> = ({ content }) => {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner">
      <div className="px-3.5 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>Output</span>
        </span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
        <pre className="whitespace-pre">
          <code>{content.text || ""}</code>
        </pre>
      </div>
    </div>
  );
};
