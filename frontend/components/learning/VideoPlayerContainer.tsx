"use client";

import React, { useRef } from "react";
import { useYouTubePlayer } from "@/lib/useYouTubePlayer";
import { getLocalVideoProgress, resolveVideoProgress } from "@/lib/progressRepository";

export const VideoPlayerContainer = React.memo(function VideoPlayerContainer({
  videoId,
  startAt,
  playlistId,
  onProgressUpdate,
  onComplete,
}: {
  videoId: string;
  startAt: number;
  playlistId: string;
  onProgressUpdate?: (pct: number) => void;
  onComplete?: (watchedSeconds: number) => void;
}) {
  const isValidYTId = typeof videoId === "string" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  const safeVideoId = isValidYTId ? videoId : "rfscVS0vtbw";
  const containerId = `yt-player-${safeVideoId}`;

  // Deterministic conflict resolution for resume position: computed ONCE on initial mount
  const startRef = useRef<number | null>(null);
  if (startRef.current === null) {
    const localProg = typeof window !== "undefined" ? getLocalVideoProgress(safeVideoId) : null;
    const resolved = resolveVideoProgress(localProg, {
      videoId: safeVideoId,
      playlistId,
      lastPosition: startAt,
    });
    startRef.current = resolved ? resolved.lastPosition : startAt;
  }

  useYouTubePlayer({
    containerId,
    videoId: safeVideoId,
    startAt: startRef.current,
    playlistId,
    onProgressUpdate,
    onComplete,
  });

  return (
    <div className="w-full relative" style={{ height: 420 }}>
      <div
        id={containerId}
        className="w-full h-full"
      />
    </div>
  );
});
