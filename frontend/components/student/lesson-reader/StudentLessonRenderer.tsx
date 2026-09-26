"use client";

import React from "react";
import type {
  LessonBlock,
  HeadingBlockContent,
  ParagraphBlockContent,
  ImageBlockContent,
  CodeBlockContent,
  OutputBlockContent,
  ListBlockContent,
  TableBlockContent,
  CalloutBlockContent,
  QuoteBlockContent,
  YouTubeBlockContent,
  LinkBlockContent,
  KeyTakeawaysBlockContent,
} from "@/types/lesson-content";

import { StudentHeadingBlock } from "./StudentHeadingBlock";
import { StudentParagraphBlock } from "./StudentParagraphBlock";
import { StudentImageBlock } from "./StudentImageBlock";
import { StudentCodeBlock } from "./StudentCodeBlock";
import { StudentOutputBlock } from "./StudentOutputBlock";
import { StudentListBlock } from "./StudentListBlock";
import { StudentTableBlock } from "./StudentTableBlock";
import { StudentCalloutBlock } from "./StudentCalloutBlock";
import { StudentQuoteBlock } from "./StudentQuoteBlock";
import { StudentYouTubeBlock } from "./StudentYouTubeBlock";
import { StudentLinkBlock } from "./StudentLinkBlock";
import { StudentKeyTakeawaysBlock } from "./StudentKeyTakeawaysBlock";

interface StudentLessonRendererProps {
  blocks: LessonBlock[];
}

export function StudentLessonRenderer({ blocks }: StudentLessonRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="my-12 p-8 text-center rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <p className="text-slate-500 text-sm font-medium">
          This lesson has no content published yet.
        </p>
      </div>
    );
  }

  return (
    <article className="w-full max-w-4xl mx-auto space-y-4">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <StudentHeadingBlock
                key={block.id}
                content={block.content as HeadingBlockContent}
              />
            );
          case "paragraph":
            return (
              <StudentParagraphBlock
                key={block.id}
                content={block.content as ParagraphBlockContent}
              />
            );
          case "image":
            return (
              <StudentImageBlock
                key={block.id}
                content={block.content as ImageBlockContent}
              />
            );
          case "code":
            return (
              <StudentCodeBlock
                key={block.id}
                content={block.content as CodeBlockContent}
              />
            );
          case "output":
            return (
              <StudentOutputBlock
                key={block.id}
                content={block.content as OutputBlockContent}
              />
            );
          case "list":
            return (
              <StudentListBlock
                key={block.id}
                content={block.content as ListBlockContent}
              />
            );
          case "table":
            return (
              <StudentTableBlock
                key={block.id}
                content={block.content as TableBlockContent}
              />
            );
          case "callout":
            return (
              <StudentCalloutBlock
                key={block.id}
                content={block.content as CalloutBlockContent}
              />
            );
          case "quote":
            return (
              <StudentQuoteBlock
                key={block.id}
                content={block.content as QuoteBlockContent}
              />
            );
          case "youtube":
            return (
              <StudentYouTubeBlock
                key={block.id}
                content={block.content as YouTubeBlockContent}
              />
            );
          case "link":
            return (
              <StudentLinkBlock
                key={block.id}
                content={block.content as LinkBlockContent}
              />
            );
          case "key_takeaways":
            return (
              <StudentKeyTakeawaysBlock
                key={block.id}
                content={block.content as KeyTakeawaysBlockContent}
              />
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
