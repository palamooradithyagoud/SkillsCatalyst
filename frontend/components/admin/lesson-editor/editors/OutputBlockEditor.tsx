/**
 * frontend/components/admin/lesson-editor/editors/OutputBlockEditor.tsx
 * Editor interface for Expected Output blocks (terminal / console stdout).
 */

import React from "react";
import { Terminal } from "lucide-react";
import type { OutputBlockContent } from "@/types/lesson-content";

interface Props {
  content: OutputBlockContent;
  onChange: (content: OutputBlockContent) => void;
  disabled?: boolean;
}

export const OutputBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <label htmlFor="output-text-area" className="flex items-center gap-1.5 font-medium">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Expected Execution Output</span>
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {(content.text || "").length.toLocaleString()}/50,000 chars
        </span>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
        <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">stdout / terminal</span>
        </div>
        <textarea
          id="output-text-area"
          rows={4}
          disabled={disabled}
          value={content.text || ""}
          onChange={handleChange}
          maxLength={50000}
          spellCheck={false}
          placeholder="e.g. Hello, World!&#10;Process finished with exit code 0"
          className="w-full p-3 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y disabled:opacity-50 min-h-[90px]"
        />
      </div>

      <p className="text-[11px] text-slate-500">
        Displays expected console output below code blocks for learners to verify their exercises.
      </p>
    </div>
  );
};
