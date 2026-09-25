/**
 * frontend/components/admin/lesson-editor/preview/YouTubeBlockPreview.tsx
 * Preview renderer for YouTube video blocks.
 */

import React from "react";
import type { YouTubeBlockContent } from "@/types/lesson-content";
import { extractYouTubeVideoId, toSafeEmbedUrl } from "../utils/youtube";

export const YouTubeBlockPreview: React.FC<{ content: YouTubeBlockContent }> = ({ content }) => {
  const videoId = extractYouTubeVideoId(content.video_id || content.url || "");
  if (!videoId) return null;

  return (
    <div className="my-5 space-y-2">
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-lg">
        <iframe
          src={toSafeEmbedUrl(videoId)}
          title={content.title || "Lesson video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
      {content.title && (
        <p className="text-xs text-slate-400 text-center font-medium">
          {content.title}
        </p>
      )}
    </div>
  );
};
