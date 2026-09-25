"use client";

import React from "react";
import type { YouTubeBlockContent } from "@/types/lesson-content";

interface StudentYouTubeBlockProps {
  content: YouTubeBlockContent;
}

export function StudentYouTubeBlock({ content }: StudentYouTubeBlockProps) {
  const videoId = content.video_id?.trim();

  if (!videoId) {
    return null;
  }

  // Canonical privacy-enhanced YouTube embed
  const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  return (
    <div className="my-6 max-w-3xl mx-auto">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl shadow-black/40">
        <iframe
          src={embedUrl}
          title="Course YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
}
