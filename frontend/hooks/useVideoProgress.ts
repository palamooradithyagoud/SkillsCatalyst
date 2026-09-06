/**
 * useVideoProgress
 *
 * Encapsulates playback progress tracking and connects the YouTube Player
 * to ProgressRepository:
 *  - Anti-cheat cumulative watchTime computation (preserves initial watchTime on resume)
 *  - Immediate LocalStorage updates on ticks and pauses
 *  - Debounced remote API/database synchronization while playing (10–12s)
 *  - Immediate remote sync on pause and lesson switches
 *  - Best-effort beacon sync on pagehide/beforeunload
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  VideoProgress,
  getLocalVideoProgress,
  saveLocalVideoProgress,
  syncVideoProgress,
  syncVideoProgressBeacon,
} from "@/lib/progress";

export interface UseVideoProgressOptions {
  videoId: string;
  playlistId: string;
  initialPosition?: number;
  initialWatchTime?: number;
  onProgressPct?: (pct: number) => void;
  onComplete?: (totalWatchSeconds: number) => void;
  completionThresholdPct?: number; // default: 75%
}

export function useVideoProgress({
  videoId,
  playlistId,
  initialPosition = 0,
  initialWatchTime = 0,
  onProgressPct,
  onComplete,
  completionThresholdPct = 75,
}: UseVideoProgressOptions) {
  // Check local cache for accumulated watchTime if not provided
  const localCache = typeof window !== "undefined" ? getLocalVideoProgress(videoId) : null;
  const startingWatchTime = Math.max(initialWatchTime, localCache?.watchTime || 0);

  const currentPosRef = useRef<number>(initialPosition);
  const watchTimeRef = useRef<number>(startingWatchTime);
  const lastTickTimeRef = useRef<number>(-1);
  const completedRef = useRef<boolean>(localCache?.completed || false);
  const durationRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onProgressPctRef = useRef(onProgressPct);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onProgressPctRef.current = onProgressPct; }, [onProgressPct]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Record current progress to LocalStorage immediately and dispatch to backend
  const persistProgress = useCallback(
    (immediate = false, overrideTime?: number) => {
      const pos = typeof overrideTime === "number" ? overrideTime : currentPosRef.current;
      const progress: Omit<VideoProgress, "updatedAt"> & { updatedAt?: string } = {
        videoId,
        playlistId,
        lastPosition: Math.max(0, pos),
        watchTime: Math.round(watchTimeRef.current),
        completed: completedRef.current,
        updatedAt: new Date().toISOString(),
      };

      // Synchronous LocalStorage write
      saveLocalVideoProgress(progress);

      // Remote sync
      syncVideoProgress(progress, immediate).catch(() => {});
    },
    [videoId, playlistId]
  );

  // 250ms anti-cheat tick from player
  const tick = useCallback(
    (currentTime: number, duration: number) => {
      currentPosRef.current = currentTime;
      if (duration > 0) durationRef.current = duration;

      const last = lastTickTimeRef.current;
      if (last >= 0) {
        const delta = currentTime - last;
        // Anti-cheat: count smooth forward playback only (0 < delta < 3s)
        if (delta > 0 && delta < 3) {
          watchTimeRef.current += delta;
        }
      }
      lastTickTimeRef.current = currentTime;

      // Update UI progress percentage
      if (durationRef.current > 0) {
        const pct = Math.min(100, (watchTimeRef.current / durationRef.current) * 100);
        onProgressPctRef.current?.(pct);

        if (pct >= completionThresholdPct && !completedRef.current) {
          completedRef.current = true;
          persistProgress(true);
          onCompleteRef.current?.(Math.round(watchTimeRef.current));
        }
      }
    },
    [completionThresholdPct, persistProgress]
  );

  // Called when video starts playing
  const handlePlay = useCallback(() => {
    isPlayingRef.current = true;
    lastTickTimeRef.current = -1;

    // Periodic sync every 10s while actively playing
    if (!syncTimerRef.current) {
      syncTimerRef.current = setInterval(() => {
        if (isPlayingRef.current) {
          persistProgress(false);
        }
      }, 10_000);
    }
  }, [persistProgress]);

  // Called when video pauses or buffers
  const handlePause = useCallback(
    (pausedTime?: number) => {
      isPlayingRef.current = false;
      lastTickTimeRef.current = -1;
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      if (typeof pausedTime === "number") {
        currentPosRef.current = pausedTime;
      }
      // Immediate sync on pause!
      persistProgress(true, pausedTime);
    },
    [persistProgress]
  );

  // Flush on unmount, lesson switch, or beforeunload
  const flush = useCallback(
    (currentTime?: number) => {
      if (typeof currentTime === "number") {
        currentPosRef.current = currentTime;
      }
      persistProgress(true, currentTime);
    },
    [persistProgress]
  );

  // Window unload handlers
  useEffect(() => {
    const handleUnload = () => {
      const record: VideoProgress = {
        videoId,
        playlistId,
        lastPosition: currentPosRef.current,
        watchTime: Math.round(watchTimeRef.current),
        completed: completedRef.current,
        updatedAt: new Date().toISOString(),
      };
      syncVideoProgressBeacon(record);
    };

    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      // Save on hook unmount
      flush();
    };
  }, [videoId, playlistId, flush]);

  return {
    tick,
    handlePlay,
    handlePause,
    flush,
    currentPosRef,
    watchTimeRef,
  };
}
