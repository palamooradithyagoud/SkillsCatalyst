/**
 * frontend/components/admin/lesson-editor/preview/CodeBlockPreview.tsx
 * Preview renderer for Code blocks with language tag and clipboard copy.
 */

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CodeBlockContent } from "@/types/lesson-content";

export const CodeBlockPreview: React.FC<{ content: CodeBlockContent }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content.code) return;
    try {
      await navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-sky-400">
          {content.language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed">
        <pre className="whitespace-pre">
          <code>{content.code || ""}</code>
        </pre>
      </div>
    </div>
  );
};
