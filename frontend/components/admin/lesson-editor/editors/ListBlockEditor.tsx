/**
 * frontend/components/admin/lesson-editor/editors/ListBlockEditor.tsx
 * Editor interface for Ordered / Unordered List blocks.
 */

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, ListOrdered, List as ListIcon } from "lucide-react";
import type { ListBlockContent } from "@/types/lesson-content";

interface Props {
  content: ListBlockContent;
  onChange: (content: ListBlockContent) => void;
  disabled?: boolean;
}

export const ListBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const items = content.items && content.items.length > 0 ? content.items : [""];

  const handleTypeToggle = (ordered: boolean) => {
    onChange({ ...content, ordered });
  };

  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange({ ...content, items: next });
  };

  const handleAddItem = () => {
    if (items.length >= 100) return;
    onChange({ ...content, items: [...items, ""] });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const next = items.filter((_, i) => i !== index);
    onChange({ ...content, items: next });
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange({ ...content, items: next });
  };

  return (
    <div className="space-y-3">
      {/* List style selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-300">List Style</label>
        <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5" role="group">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleTypeToggle(false)}
            aria-pressed={!content.ordered}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              !content.ordered
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>Unordered (Bullets)</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleTypeToggle(true)}
            aria-pressed={content.ordered}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              content.ordered
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Ordered (Numbered)</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 w-6 text-right shrink-0">
              {content.ordered ? `${idx + 1}.` : "•"}
            </span>

            <input
              type="text"
              disabled={disabled}
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              placeholder={`List item #${idx + 1}...`}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
            />

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={disabled || idx === 0}
                onClick={() => handleMoveItem(idx, "up")}
                title="Move up"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={disabled || idx === items.length - 1}
                onClick={() => handleMoveItem(idx, "down")}
                title="Move down"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={disabled || items.length <= 1}
                onClick={() => handleRemoveItem(idx)}
                title="Delete item"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || items.length >= 100}
        onClick={handleAddItem}
        className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-sky-500/60 bg-slate-900/40 hover:bg-sky-950/20 text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add List Item ({items.length}/100)</span>
      </button>
    </div>
  );
};
