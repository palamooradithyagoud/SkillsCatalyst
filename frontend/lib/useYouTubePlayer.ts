/**
 * useYouTubePlayer
 *
 * Encapsulates the YouTube IFrame Player API:
 *  - Loads the YT IFrame API script once (globally guarded)
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
import { useVideoProgress } from "@/lib/useVideoProgress";
import { getLocalVideoProgress } from "@/lib/progressRepository";

// ── YouTube IFrame API type stubs ────────────────────────────────────────────
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
    _ytApiLoading: boolean;
    _ytApiReady: boolean;
    _ytReadyCallbacks: Array<() => void>;
  }
}

declare namespace YT {
  const enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): PlayerState;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId: string;
    width?: string | number;
    height?: string | number;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number; target: Player }) => void;
    };
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    destroy(): void;
  }
}

// Player state numeric constants (safe across runtimes)
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;

// ── Script loader (global singleton) ─────────────────────────────────────────
function loadYTApi(onReady: () => void): void {
  if (typeof window === "undefined") return;

  // Already fully loaded
  if (window._ytApiReady && window.YT?.Player) {
    onReady();
    return;
  }

  // Queue the callback
  if (!window._ytReadyCallbacks) window._ytReadyCallbacks = [];
  window._ytReadyCallbacks.push(onReady);

  // Patch onYouTubeIframeAPIReady so multiple hooks are safe
  if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = () => {
      window._ytApiReady = true;
      (window._ytReadyCallbacks ?? []).forEach((cb) => cb());
      window._ytReadyCallbacks = [];
    };
  }

  // Only inject script once
  if (!window._ytApiLoading) {
    window._ytApiLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
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

  // Progress Manager
  const { tick, handlePlay, handlePause, flush } = useVideoProgress({
    videoId,
    playlistId,
    initialPosition: effectiveStartAt,
    initialWatchTime: Math.max(initialWatchTime, localRecord?.watchTime || 0),
    onProgressPct: onProgressUpdate,
    onComplete,
  });

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
          tick(cur, dur || 0);
        }
      } catch (_) {}
    }, 250);
  }, [tick]);

  useEffect(() => {
    let isMounted = true;
    hasResumedRef.current = false;

    const initPlayer = () => {
      if (!isMounted) return;

      const targetEl = document.getElementById(containerId);
      if (!targetEl) return;

      // Destroy prior player instance
      if (playerRef.current) {
        try {
          const cur = playerRef.current.getCurrentTime();
          if (typeof cur === "number" && !isNaN(cur)) {
            flush(cur);
          }
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
      }

      // Ensure videoId is a valid 11-character YouTube video ID
      const isValidVideoId = typeof videoId === "string" && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
      const safeVideoId = isValidVideoId ? videoId : "rfscVS0vtbw";

      playerRef.current = new window.YT.Player(containerId, {
        videoId: safeVideoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          start: Math.floor(effectiveStartAt),
        },
        events: {
          onReady: ({ target }) => {
            if (!isMounted) return;
            // Seek to resume position once player is ready
            if (effectiveStartAt > 0) {
              try {
                target.seekTo(effectiveStartAt, true);
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
              if (effectiveStartAt > 1 && currentTime < 1) {
                try {
                  player.seekTo(effectiveStartAt, true);
                } catch (_) {}
              }
              hasResumedRef.current = true;
            }

            if (data === YT_PLAYING) {
              handlePlay();
              startPolling();
            } else {
              stopPolling();
              if (data === YT_PAUSED) {
                // Immediate save on pause!
                handlePause(currentTime);
              } else if (data === YT_ENDED) {
                flush(currentTime);
              }
            }
          },
        },
      });
    };

    loadYTApi(initPlayer);

    return () => {
      isMounted = false;
      stopPolling();
      if (playerRef.current) {
        try {
          const cur = playerRef.current.getCurrentTime();
          if (typeof cur === "number" && !isNaN(cur)) {
            flush(cur);
          }
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
      }
    };
    // videoId, containerId, effectiveStartAt drive player re-creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId, effectiveStartAt]);
}
