/**
 * frontend/components/admin/lesson-editor/BlockPickerModal.tsx
 * Modal / Bottom-Sheet Block Picker allowing the admin to select from 12 structured block types.
 */

import React, { useEffect, useRef } from "react";
import {
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Code2,
  Terminal,
  List,
  Table,
  AlertCircle,
  Quote,
  Video,
  Link2,
  CheckSquare,
  X,
} from "lucide-react";
import type { BlockType } from "@/types/lesson-content";
import { BLOCK_TYPE_DESCRIPTORS } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlockType: (type: BlockType) => void;
  insertIndex?: number | null;
}

const ICON_MAP: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  heading: Heading,
  paragraph: AlignLeft,
  image: ImageIcon,
  code: Code2,
  output: Terminal,
  list: List,
  table: Table,
  callout: AlertCircle,
  quote: Quote,
  youtube: Video,
  link: Link2,
  key_takeaways: CheckSquare,
};

export const BlockPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectBlockType,
  insertIndex,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-picker-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-2xl bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 id="block-picker-title" className="text-base font-bold text-white">
              Add Content Block
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {insertIndex !== null && insertIndex !== undefined
                ? `Insert new block after position #${insertIndex + 1}`
                : "Select a structured block type to append to your lesson"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close block picker"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 12 Block Types Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BLOCK_TYPE_DESCRIPTORS.map((descriptor) => {
            const Icon = ICON_MAP[descriptor.type] || AlignLeft;
            return (
              <button
                key={descriptor.type}
                type="button"
                onClick={() => {
                  onSelectBlockType(descriptor.type);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-sky-500/60 bg-slate-950/60 hover:bg-sky-950/20 text-left transition-all group cursor-pointer min-h-[56px]"
              >
                <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-sky-900/40 text-slate-300 group-hover:text-sky-300 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white group-hover:text-sky-200 transition-colors">
                      {descriptor.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                    {descriptor.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
