/**
 * frontend/components/admin/lesson-editor/preview/LinkBlockPreview.tsx
 * Preview renderer for External Link blocks.
 */

import React from "react";
import { ExternalLink } from "lucide-react";
import type { LinkBlockContent } from "@/types/lesson-content";

export const LinkBlockPreview: React.FC<{ content: LinkBlockContent }> = ({ content }) => {
  if (!content.url) return null;

  return (
    <div className="my-3">
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 text-sky-400 hover:text-sky-300 text-xs sm:text-sm font-medium transition-all group shadow-sm"
      >
        <span>{content.text || content.url}</span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
      </a>
    </div>
  );
};
