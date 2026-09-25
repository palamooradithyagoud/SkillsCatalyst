/**
 * frontend/components/admin/lesson-editor/preview/LessonBlockPreview.tsx
 * Top-level renderer for lesson preview mode. Dispatches to individual block previewers.
 */

import React from "react";
import type { LessonBlock } from "@/types/lesson-content";
import { HeadingBlockPreview } from "./HeadingBlockPreview";
import { ParagraphBlockPreview } from "./ParagraphBlockPreview";
import { ImageBlockPreview } from "./ImageBlockPreview";
import { CodeBlockPreview } from "./CodeBlockPreview";
import { OutputBlockPreview } from "./OutputBlockPreview";
import { ListBlockPreview } from "./ListBlockPreview";
import { TableBlockPreview } from "./TableBlockPreview";
import { CalloutBlockPreview } from "./CalloutBlockPreview";
import { QuoteBlockPreview } from "./QuoteBlockPreview";
import { YouTubeBlockPreview } from "./YouTubeBlockPreview";
import { LinkBlockPreview } from "./LinkBlockPreview";
import { KeyTakeawaysBlockPreview } from "./KeyTakeawaysBlockPreview";

interface Props {
  blocks: LessonBlock[];
  lessonTitle: string;
}

export const LessonBlockPreview: React.FC<Props> = ({ blocks, lessonTitle }) => {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Lesson Title as H1 (semantic document heading) */}
      <header className="mb-8 pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {lessonTitle}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <span>Lesson Content Preview</span>
          <span>&bull;</span>
          <span>{sortedBlocks.length} block{sortedBlocks.length === 1 ? "" : "s"}</span>
        </div>
      </header>

      {/* Blocks sequence */}
      {sortedBlocks.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 p-8">
          <p className="text-sm text-slate-400">This lesson has no content blocks yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBlocks.map((block) => {
            switch (block.type) {
              case "heading":
                return <HeadingBlockPreview key={block.id} content={block.content} />;
              case "paragraph":
                return <ParagraphBlockPreview key={block.id} content={block.content} />;
              case "image":
                return <ImageBlockPreview key={block.id} content={block.content} />;
              case "code":
                return <CodeBlockPreview key={block.id} content={block.content} />;
              case "output":
                return <OutputBlockPreview key={block.id} content={block.content} />;
              case "list":
                return <ListBlockPreview key={block.id} content={block.content} />;
              case "table":
                return <TableBlockPreview key={block.id} content={block.content} />;
              case "callout":
                return <CalloutBlockPreview key={block.id} content={block.content} />;
              case "quote":
                return <QuoteBlockPreview key={block.id} content={block.content} />;
              case "youtube":
                return <YouTubeBlockPreview key={block.id} content={block.content} />;
              case "link":
                return <LinkBlockPreview key={block.id} content={block.content} />;
              case "key_takeaways":
                return <KeyTakeawaysBlockPreview key={block.id} content={block.content} />;
              default:
                return null;
            }
          })}
        </div>
      )}
    </article>
  );
};
