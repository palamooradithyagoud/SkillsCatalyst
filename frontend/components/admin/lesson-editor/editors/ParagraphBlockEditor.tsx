/**
 * frontend/components/admin/lesson-editor/editors/ParagraphBlockEditor.tsx
 * Editor interface for Paragraph blocks (plain structured text).
 */

import React from "react";
import type { ParagraphBlockContent } from "@/types/lesson-content";

interface Props {
  content: ParagraphBlockContent;
  onChange: (content: ParagraphBlockContent) => void;
  disabled?: boolean;
}

export const ParagraphBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <label htmlFor="paragraph-text" className="font-medium text-slate-300">
          Paragraph Text
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {(content.text || "").length.toLocaleString()}/20,000
        </span>
      </div>

      <textarea
        id="paragraph-text"
        rows={4}
        disabled={disabled}
        value={content.text || ""}
        onChange={handleChange}
        maxLength={20000}
        placeholder="Write educational paragraph content here. Line breaks are preserved in student preview..."
        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent leading-relaxed disabled:opacity-50 min-h-[100px] resize-y"
      />

      <p className="text-[11px] text-slate-500">
        Enter plain structured text. Markdown-like spacing is respected. Raw HTML tags are disallowed for security.
      </p>
    </div>
  );
};
