/**
 * frontend/components/admin/lesson-editor/BlockCard.tsx
 * Card container for an editable lesson block, housing header controls, validation errors, and block editors.
 */

import React from "react";
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
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import type { LessonBlock, BlockType } from "@/types/lesson-content";
import { HeadingBlockEditor } from "./editors/HeadingBlockEditor";
import { ParagraphBlockEditor } from "./editors/ParagraphBlockEditor";
import { ImageBlockEditor } from "./editors/ImageBlockEditor";
import { CodeBlockEditor } from "./editors/CodeBlockEditor";
import { OutputBlockEditor } from "./editors/OutputBlockEditor";
import { ListBlockEditor } from "./editors/ListBlockEditor";
import { TableBlockEditor } from "./editors/TableBlockEditor";
import { CalloutBlockEditor } from "./editors/CalloutBlockEditor";
import { QuoteBlockEditor } from "./editors/QuoteBlockEditor";
import { YouTubeBlockEditor } from "./editors/YouTubeBlockEditor";
import { LinkBlockEditor } from "./editors/LinkBlockEditor";
import { KeyTakeawaysBlockEditor } from "./editors/KeyTakeawaysBlockEditor";

interface Props {
  block: LessonBlock;
  index: number;
  totalBlocks: number;
  errors?: string[];
  disabled?: boolean;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  onUpdateContent: (newContent: LessonBlock["content"]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertAfter: () => void;
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

const LABEL_MAP: Record<BlockType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  image: "Image",
  code: "Code Snippet",
  output: "Execution Output",
  list: "List",
  table: "Table",
  callout: "Callout Box",
  quote: "Quote",
  youtube: "YouTube Video",
  link: "External Link",
  key_takeaways: "Key Takeaways",
};

export const BlockCard: React.FC<Props> = ({
  block,
  index,
  totalBlocks,
  errors = [],
  disabled,
  courseId,
  moduleId,
  lessonId,
  onUpdateContent,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertAfter,
}) => {

  const Icon = ICON_MAP[block.type] || AlignLeft;
  const label = LABEL_MAP[block.type] || block.type;
  const hasErrors = errors.length > 0;

  return (
    <div
      id={`block-${block.id}`}
      className={`rounded-xl border bg-slate-900/90 transition-all shadow-sm ${
        hasErrors
          ? "border-rose-700/80 shadow-rose-950/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Block Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
            #{index + 1}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Icon className="w-3.5 h-3.5 text-sky-400" />
            <span>{label}</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">
            ({block.id})
          </span>
        </div>

        {/* Header Action Menu */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || index === 0}
            onClick={onMoveUp}
            title="Move block up"
            aria-label={`Move block ${index + 1} up`}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled || index === totalBlocks - 1}
            onClick={onMoveDown}
            title="Move block down"
            aria-label={`Move block ${index + 1} down`}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDuplicate}
            title="Duplicate block"
            aria-label={`Duplicate block ${index + 1}`}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onInsertAfter}
            title="Insert block after this"
            aria-label={`Insert block after ${index + 1}`}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-950/60 text-slate-300 hover:text-sky-300 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            title="Delete block"
            aria-label={`Delete block ${index + 1}`}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Validation Errors Alert Box */}
      {hasErrors && (
        <div className="mx-3.5 sm:mx-4 mt-3 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-rose-300">Validation Error:</span>
            <ul className="list-disc list-inside space-y-0.5 text-rose-200">
              {errors.map((err, errIdx) => (
                <li key={errIdx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Block Editor Content */}
      <div className="p-3.5 sm:p-4">
        {block.type === "heading" && (
          <HeadingBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "paragraph" && (
          <ParagraphBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "image" && (
          <ImageBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
            courseId={courseId}
            moduleId={moduleId}
            lessonId={lessonId}
          />
        )}

        {block.type === "code" && (
          <CodeBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "output" && (
          <OutputBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "list" && (
          <ListBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "table" && (
          <TableBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "callout" && (
          <CalloutBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "quote" && (
          <QuoteBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "youtube" && (
          <YouTubeBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "link" && (
          <LinkBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
        {block.type === "key_takeaways" && (
          <KeyTakeawaysBlockEditor
            content={block.content}
            onChange={onUpdateContent}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
