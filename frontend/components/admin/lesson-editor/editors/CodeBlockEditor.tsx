/**
 * frontend/components/admin/lesson-editor/editors/CodeBlockEditor.tsx
 * Monospace code editor interface supporting 20 strictly controlled programming languages.
 */

import React from "react";
import type { CodeBlockContent, SupportedCodeLanguage } from "@/types/lesson-content";
import { SUPPORTED_LANGUAGES } from "../types";

interface Props {
  content: CodeBlockContent;
  onChange: (content: CodeBlockContent) => void;
  disabled?: boolean;
}

export const CodeBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...content, language: e.target.value as SupportedCodeLanguage });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, code: e.target.value });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label htmlFor="code-language-select" className="text-xs font-medium text-slate-300">
          Programming Language
        </label>
        <select
          id="code-language-select"
          disabled={disabled}
          value={content.language || "python"}
          onChange={handleLanguageChange}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer min-h-[36px]"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label} ({lang.value})
            </option>
          ))}
        </select>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950">
        <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{content.language || "code"}</span>
          <span>{(content.code || "").length.toLocaleString()}/100,000 chars</span>
        </div>
        <textarea
          id="code-body-input"
          rows={7}
          disabled={disabled}
          value={content.code || ""}
          onChange={handleCodeChange}
          maxLength={100000}
          spellCheck={false}
          placeholder="// Paste or write source code here..."
          className="w-full p-3.5 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y disabled:opacity-50 min-h-[140px]"
        />
      </div>

      <p className="text-[11px] text-slate-500">
        Monospace code snippet. Executable environment is intentionally isolated; code is rendered safely for students.
      </p>
    </div>
  );
};
