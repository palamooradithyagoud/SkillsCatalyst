/**
 * frontend/components/admin/lesson-editor/editors/QuoteBlockEditor.tsx
 * Editor interface for Quote blocks with optional attribution.
 */

import React from "react";
import { Quote as QuoteIcon } from "lucide-react";
import type { QuoteBlockContent } from "@/types/lesson-content";

interface Props {
  content: QuoteBlockContent;
  onChange: (content: QuoteBlockContent) => void;
  disabled?: boolean;
}

export const QuoteBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, author: e.target.value || null });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="quote-text-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <QuoteIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Quotation Text</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {(content.text || "").length.toLocaleString()}/5,000
          </span>
        </div>
        <textarea
          id="quote-text-input"
          rows={3}
          disabled={disabled}
          value={content.text || ""}
          onChange={handleTextChange}
          maxLength={5000}
          placeholder="&ldquo;Programs must be written for people to read, and only incidentally for machines to execute.&rdquo;"
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm italic focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed disabled:opacity-50 min-h-[80px] resize-y"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="quote-author-input" className="text-xs font-medium text-slate-300">
            Author / Source Attribution <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] text-slate-500">{(content.author || "").length}/200</span>
        </div>
        <input
          id="quote-author-input"
          type="text"
          disabled={disabled}
          value={content.author || ""}
          onChange={handleAuthorChange}
          maxLength={200}
          placeholder="e.g. Harold Abelson, Structure and Interpretation of Computer Programs"
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
        />
      </div>
    </div>
  );
};
