/**
 * useYouTubePlayer
 *
 * Encapsulates the YouTube IFrame Player API:
 *  - Loads the YT IFrame API script once (globally guarded)
 *  - Creates/destroys a YT.Player instance on a given container div
 *  - Anti-cheat: only counts forward-seeking-free playback deltas
 *  - Fires onComplete when >= 95% genuinely watched
 *  - Fires onProgressUpdate every 250 ms (for live progress bar)
 *  - Calls saveVideoProgress every 10 s while playing
 *  - Calls onComplete on ENDED state when threshold met
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { saveVideoProgress } from "@/lib/api";

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
      onStateChange?: (event: { data: number }) => void;
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

// Player state numeric constants (avoids const enum issues at runtime)
const YT_PLAYING = 1;
const YT_ENDED = 0;

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
  userId?: string;
  playlistId: string;
  /** Called every 250 ms while playing — percentage 0-100 */
  onProgressUpdate?: (pct: number) => void;
  /** Called once when >= 95% is genuinely watched */
  onComplete?: (watchedSeconds: number) => void;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  startAt = 0,
  userId = "default_user",
  playlistId,
  onProgressUpdate,
  onComplete,
}: UseYouTubePlayerOptions): void {
  const playerRef = useRef<YT.Player | null>(null);
  const watchedSecondsRef = useRef(0);
  const lastKnownTimeRef = useRef(-1);
  const completedRef = useRef(false);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  // Stable callbacks via refs so stale closures are never an issue
  const onProgressRef = useRef(onProgressUpdate);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onProgressRef.current = onProgressUpdate; }, [onProgressUpdate]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  /** Fires the completion callback exactly once */
  const fireComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.(watchedSecondsRef.current);
  }, []);

  /** Stop polling + auto-save */
  const stopTracking = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  }, []);

  /** Tick — called every 250 ms while video is playing */
  const tick = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.getCurrentTime();
    const duration = durationRef.current || player.getDuration();
    if (duration > 0) durationRef.current = duration;

    const last = lastKnownTimeRef.current;
    if (last >= 0) {
      const delta = currentTime - last;
      // Count only smooth forward-playback deltas (0 < delta < 3 s = no seek/buffering jump)
      if (delta > 0 && delta < 3) {
        watchedSecondsRef.current += delta;
      }
    }
    lastKnownTimeRef.current = currentTime;

    // Live progress bar update
    if (duration > 0) {
      const pct = Math.min(100, (watchedSecondsRef.current / duration) * 100);
      onProgressRef.current?.(pct);

      // Auto-completion threshold
      if (pct >= 95 && !completedRef.current) {
        fireComplete();
      }
    }
  }, [fireComplete]);

  /** Start polling + auto-save */
  const startTracking = useCallback(() => {
    if (pollIntervalRef.current) return;

    // 250 ms poll for anti-cheat tracking
    pollIntervalRef.current = setInterval(tick, 250);

    // 10 s periodic resume save
    saveIntervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      saveVideoProgress(
        userId,
        playlistId,
        videoId,
        player.getCurrentTime(),
        Math.round(watchedSecondsRef.current),
      );
    }, 10_000);
  }, [tick, userId, playlistId, videoId]);

  useEffect(() => {
    // Reset anti-cheat state on videoId change
    watchedSecondsRef.current = 0;
    lastKnownTimeRef.current = -1;
    completedRef.current = false;
    durationRef.current = 0;

    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted) return;

      const targetEl = document.getElementById(containerId);
      if (!targetEl) return;

      // Destroy any prior player
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) { /* ignore */ }
        playerRef.current = null;
      }
      stopTracking();

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          start: Math.floor(startAt),
        },
        events: {
          onReady: ({ target }) => {
            if (!isMounted) return;
            // Seek to resume position once player is ready
            if (startAt > 1) {
              target.seekTo(startAt, true);
            }
          },
          onStateChange: ({ data }) => {
            if (!isMounted) return;
            if (data === YT_PLAYING) {
              startTracking();
            } else {
              stopTracking();
              // Video ended naturally
              if (data === YT_ENDED) {
                const duration = durationRef.current;
                if (duration > 0) {
                  const pct = (watchedSecondsRef.current / duration) * 100;
                  if (pct >= 95) fireComplete();
                }
              }
            }
          },
        },
      });
    };

    loadYTApi(initPlayer);

    return () => {
      isMounted = false;
      stopTracking();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) { /* ignore */ }
        playerRef.current = null;
      }
    };
    // videoId and containerId drive player re-creation; others are stable within a render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId]);
}
