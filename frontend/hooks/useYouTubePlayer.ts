/**
 * useYouTubePlayer
 *
 * Encapsulates the YouTube IFrame Player API:
 *  - Loads the YT IFrame API script once (globally guarded via youtubeLoader)
 *  - Creates/destroys a YT.Player instance on a given container div
 *  - Resumes reliably from resolved startAt timestamp
 *  - Corrects autoplay zero-reset via hasResumedRef check on first PLAYING/BUFFERING
 *  - Anti-cheat cumulative watchTime computation via useVideoProgress
 *  - Immediate LocalStorage write & remote sync on PAUSED, lesson change, and unmount
 *  - Fires onComplete when threshold met
 *  - Fires onProgressUpdate every 250 ms (for live progress bar)
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { getLocalVideoProgress } from "@/lib/progress";
import {
  loadYTApi,
  YT,
  YT_ENDED,
  YT_PLAYING,
  YT_PAUSED,
  YT_BUFFERING,
} from "@/lib/player/youtubeLoader";

export interface UseYouTubePlayerOptions {
  /** The id attribute of the <div> that will host the player */
  containerId: string;
  videoId: string;
  /** Resume from this many seconds when player is ready (0 = start) */
  startAt?: number;
  /** Prior accumulated watch time */
  initialWatchTime?: number;
  userId?: string;
  playlistId: string;
  /** Called every 250 ms while playing — percentage 0-100 */
  onProgressUpdate?: (pct: number) => void;
  /** Called once when threshold is genuinely watched */
  onComplete?: (watchedSeconds: number) => void;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  startAt = 0,
  initialWatchTime = 0,
  playlistId,
  onProgressUpdate,
  onComplete,
}: UseYouTubePlayerOptions): void {
  const playerRef = useRef<YT.Player | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasResumedRef = useRef<boolean>(false);

  // Check local cache for immediate resume position if startAt is 0
  const localRecord = typeof window !== "undefined" ? getLocalVideoProgress(videoId) : null;
  const effectiveStartAt = startAt > 0 ? startAt : (localRecord?.lastPosition || 0);

  // Store the initial start position for this video mount once so it doesn't change during playback
  const initialStartRef = useRef<number>(effectiveStartAt);
  const prevVideoIdRef = useRef<string>(videoId);
  if (prevVideoIdRef.current !== videoId) {
    prevVideoIdRef.current = videoId;
    initialStartRef.current = effectiveStartAt;
  }

  // Progress Manager
  const { tick, handlePlay, handlePause, flush } = useVideoProgress({
    videoId,
    playlistId,
    initialPosition: initialStartRef.current,
    initialWatchTime: Math.max(initialWatchTime, localRecord?.watchTime || 0),
    onProgressPct: onProgressUpdate,
    onComplete,
  });

  // Keep latest callbacks in refs so event listeners and timers never cause player re-instantiation
  const tickRef = useRef(tick);
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const handlePlayRef = useRef(handlePlay);
  useEffect(() => { handlePlayRef.current = handlePlay; }, [handlePlay]);

  const handlePauseRef = useRef(handlePause);
  useEffect(() => { handlePauseRef.current = handlePause; }, [handlePause]);

  const flushRef = useRef(flush);
  useEffect(() => { flushRef.current = flush; }, [flush]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        if (typeof cur === "number" && !isNaN(cur)) {
          tickRef.current(cur, dur || 0);
        }
      } catch (_) {}
    }, 500);
  }, []);

  useEffect(() => {
    let isMounted = true;
    hasResumedRef.current = false;

    const initPlayer = () => {
      if (!isMounted) return;

      const targetEl = document.getElementById(containerId);
      if (!targetEl) return;

      // Ensure videoId is a valid 11-character YouTube video ID
      const isValidVideoId = typeof videoId === "string" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      const safeVideoId = isValidVideoId ? videoId : "rfscVS0vtbw";
      const startSeconds = Math.max(0, Math.floor(initialStartRef.current));

      try {
        playerRef.current = new window.YT.Player(containerId, {
          videoId: safeVideoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            start: startSeconds,
          },
          events: {
            onReady: ({ target }) => {
              if (!isMounted) return;
              // Seek to resume position once player is ready
              if (startSeconds > 0) {
                try {
                  target.seekTo(startSeconds, true);
                } catch (_) {}
              }
            },
            onStateChange: ({ data, target }) => {
              if (!isMounted) return;

              const player = playerRef.current || target;
              let currentTime = 0;
              try {
                currentTime = player?.getCurrentTime ? player.getCurrentTime() : 0;
              } catch (_) {}

              // YouTube autoplay zero-reset correction on first PLAYING or BUFFERING
              if (
                !hasResumedRef.current &&
                (data === YT_PLAYING || data === YT_BUFFERING)
              ) {
                if (startSeconds > 1 && currentTime < 1) {
                  try {
                    player.seekTo(startSeconds, true);
                  } catch (_) {}
                }
                hasResumedRef.current = true;
              }

              if (data === YT_PLAYING) {
                handlePlayRef.current();
                startPolling();
              } else {
                stopPolling();
                if (data === YT_PAUSED) {
                  // Immediate save on pause
                  handlePauseRef.current(currentTime);
                } else if (data === YT_ENDED) {
                  flushRef.current(currentTime);
                }
              }
            },
          },
        });
      } catch (err) {
        console.warn("YouTube player init error:", err);
      }
    };

    loadYTApi(initPlayer);

    return () => {
      isMounted = false;
      stopPolling();
      if (playerRef.current) {
        try {
          const cur = playerRef.current.getCurrentTime();
          if (typeof cur === "number" && !isNaN(cur)) {
            flushRef.current(cur);
          }
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
      }
    };
    // ONLY videoId and containerId control player lifecycle.
    // Progress and start timestamps are fixed at mount and must NEVER tear down the player.
  }, [videoId, containerId]);
}
