/**
 * frontend/components/admin/lesson-editor/editors/HeadingBlockEditor.tsx
 * Editor interface for Heading blocks (strictly H2, H3, H4).
 */

import React from "react";
import type { HeadingBlockContent, HeadingLevel } from "@/types/lesson-content";

interface Props {
  content: HeadingBlockContent;
  onChange: (content: HeadingBlockContent) => void;
  disabled?: boolean;
}

const HEADING_LEVELS: { level: HeadingLevel; label: string; desc: string }[] = [
  { level: 2, label: "H2", desc: "Main Section" },
  { level: 3, label: "H3", desc: "Subsection" },
  { level: 4, label: "H4", desc: "Sub-topic" },
];

export const HeadingBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleLevelChange = (level: HeadingLevel) => {
    onChange({ ...content, level });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-300">
          Heading Level <span className="text-slate-500 font-normal">(H1 is reserved for lesson title)</span>
        </label>
        <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5" role="group" aria-label="Heading level selection">
          {HEADING_LEVELS.map(({ level, label, desc }) => {
            const isSelected = content.level === level;
            return (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() => handleLevelChange(level)}
                aria-pressed={isSelected}
                title={`${label} - ${desc}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer min-h-[36px] ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                } disabled:opacity-50`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="heading-text-input" className="sr-only">
          Heading text
        </label>
        <input
          id="heading-text-input"
          type="text"
          disabled={disabled}
          value={content.text || ""}
          onChange={handleTextChange}
          maxLength={500}
          placeholder={`Enter ${content.level ? `H${content.level}` : "section"} heading text...`}
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium disabled:opacity-50 min-h-[44px]"
        />
        <div className="flex justify-end mt-1 text-[11px] text-slate-500">
          <span>{(content.text || "").length}/500</span>
        </div>
      </div>
    </div>
  );
};
