/**
 * frontend/components/admin/lesson-editor/editors/KeyTakeawaysBlockEditor.tsx
 * Editor interface for Key Takeaways summary cards.
 */

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, CheckSquare } from "lucide-react";
import type { KeyTakeawaysBlockContent } from "@/types/lesson-content";

interface Props {
  content: KeyTakeawaysBlockContent;
  onChange: (content: KeyTakeawaysBlockContent) => void;
  disabled?: boolean;
}

export const KeyTakeawaysBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const items = content.items && content.items.length > 0 ? content.items : [""];

  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange({ ...content, items: next });
  };

  const handleAddItem = () => {
    if (items.length >= 30) return;
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
      <div className="flex items-center justify-between text-xs text-slate-300">
        <label className="flex items-center gap-1.5 font-medium">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Core Lesson Takeaways</span>
        </label>
        <span className="text-[11px] text-slate-500">{items.length}/30 points</span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm w-5 text-center shrink-0">
              ✓
            </span>

            <input
              type="text"
              disabled={disabled}
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              placeholder={`Key takeaway point #${idx + 1}...`}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
            />

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={disabled || idx === 0}
                onClick={() => handleMoveItem(idx, "up")}
                title="Move point up"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={disabled || idx === items.length - 1}
                onClick={() => handleMoveItem(idx, "down")}
                title="Move point down"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={disabled || items.length <= 1}
                onClick={() => handleRemoveItem(idx)}
                title="Delete point"
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
        disabled={disabled || items.length >= 30}
        onClick={handleAddItem}
        className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/40 hover:bg-emerald-950/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Takeaway Point ({items.length}/30)</span>
      </button>
    </div>
  );
};
