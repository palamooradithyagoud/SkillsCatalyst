/**
 * frontend/components/admin/lesson-editor/preview/ImageBlockPreview.tsx
 * Preview renderer for Image blocks.
 */

import React from "react";
import type { ImageBlockContent } from "@/types/lesson-content";

export const ImageBlockPreview: React.FC<{ content: ImageBlockContent }> = ({ content }) => {
  if (!content.url) return null;

  return (
    <figure className="my-5 flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-1.5 max-w-2xl w-full shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.url}
          alt={content.alt || "Lesson diagram"}
          className="w-full h-auto max-h-[480px] rounded-lg object-contain mx-auto"
          loading="lazy"
        />
      </div>
      {content.caption && (
        <figcaption className="text-xs text-slate-400 italic text-center mt-2 px-4 max-w-xl">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
};
