/**
 * frontend/components/admin/lesson-editor/editors/CalloutBlockEditor.tsx
 * Editor interface for Callout boxes (info, tip, warning, important).
 */

import React from "react";
import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";
import type { CalloutBlockContent, CalloutVariant } from "@/types/lesson-content";

interface Props {
  content: CalloutBlockContent;
  onChange: (content: CalloutBlockContent) => void;
  disabled?: boolean;
}

const VARIANTS: {
  variant: CalloutVariant;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
}[] = [
  {
    variant: "info",
    label: "Info",
    icon: Info,
    accentColor: "border-sky-500 text-sky-400",
    bgColor: "bg-sky-950/40",
  },
  {
    variant: "tip",
    label: "Tip",
    icon: Lightbulb,
    accentColor: "border-emerald-500 text-emerald-400",
    bgColor: "bg-emerald-950/40",
  },
  {
    variant: "warning",
    label: "Warning",
    icon: AlertTriangle,
    accentColor: "border-amber-500 text-amber-400",
    bgColor: "bg-amber-950/40",
  },
  {
    variant: "important",
    label: "Important",
    icon: AlertCircle,
    accentColor: "border-rose-500 text-rose-400",
    bgColor: "bg-rose-950/40",
  },
];

export const CalloutBlockEditor: React.FC<Props> = ({ content, onChange, disabled }) => {
  const currentVariant = content.variant || "info";

  const handleVariantChange = (variant: CalloutVariant) => {
    onChange({ ...content, variant });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...content, title: e.target.value || null });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, text: e.target.value });
  };

  return (
    <div className="space-y-3">
      {/* Variant Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-300">Callout Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="group">
          {VARIANTS.map(({ variant, label, icon: Icon, accentColor }) => {
            const isSelected = currentVariant === variant;
            return (
              <button
                key={variant}
                type="button"
                disabled={disabled}
                onClick={() => handleVariantChange(variant)}
                aria-pressed={isSelected}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
                  isSelected
                    ? `${accentColor} bg-slate-900 shadow-sm border-current`
                    : "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="callout-title-input" className="text-xs font-medium text-slate-300">
            Callout Title <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] text-slate-500">{(content.title || "").length}/200</span>
        </div>
        <input
          id="callout-title-input"
          type="text"
          disabled={disabled}
          value={content.title || ""}
          onChange={handleTitleChange}
          maxLength={200}
          placeholder="e.g. Pro Tip: Edge Case Warning..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 min-h-[44px]"
        />
      </div>

      {/* Body Text */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="callout-body-input" className="text-xs font-medium text-slate-300">
            Callout Body Text <span className="text-rose-400">*</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {(content.text || "").length.toLocaleString()}/10,000
          </span>
        </div>
        <textarea
          id="callout-body-input"
          rows={3}
          disabled={disabled}
          value={content.text || ""}
          onChange={handleTextChange}
          maxLength={10000}
          placeholder="Enter informative or cautionary text here..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed disabled:opacity-50 min-h-[80px] resize-y"
        />
      </div>
    </div>
  );
};
