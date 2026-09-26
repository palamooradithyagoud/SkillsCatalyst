"use client";

import React, { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import type { CodeBlockContent } from "@/types/lesson-content";

interface StudentCodeBlockProps {
  content: CodeBlockContent;
}

export function StudentCodeBlock({ content }: StudentCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = content.code || "";
  const language = (content.language || "code").toLowerCase();

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Graceful fallback if clipboard permission is restricted
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-200/90 bg-[#070a16] shadow-sm overflow-hidden">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1428] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code"}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            copied
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 hover:text-white cursor-pointer"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 sm:p-5 overflow-x-auto text-sm text-slate-200 font-mono leading-relaxed selection:bg-purple-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}
