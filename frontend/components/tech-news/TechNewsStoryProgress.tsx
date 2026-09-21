"use client";

import React, { useEffect, useState, useRef } from "react";

interface TechNewsStoryProgressProps {
  count: number;
  currentIndex: number;
  isPaused: boolean;
  onComplete: () => void;
  durationMs?: number; // default 25000 (25 seconds)
}

export const TechNewsStoryProgress: React.FC<TechNewsStoryProgressProps> = ({
  count,
  currentIndex,
  isPaused,
  onComplete,
  durationMs = 25000,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Reset progress when active story index changes
  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    lastTimeRef.current = null;
  }, [currentIndex]);

  useEffect(() => {
    if (count <= 0) return;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isPaused) {
        const increment = (delta / durationMs) * 100;
        const next = Math.min(progressRef.current + increment, 100);
        progressRef.current = next;
        setProgress(next);

        if (next >= 100) {
          onComplete();
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [currentIndex, isPaused, count, durationMs, onComplete]);

  if (count <= 0) return null;

  return (
    <div
      role="progressbar"
      aria-label={`Story ${currentIndex + 1} of ${count}`}
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full flex items-center gap-1.5 px-3 pt-3 z-30"
    >
      {Array.from({ length: count }).map((_, idx) => {
        let widthPct = 0;
        if (idx < currentIndex) {
          widthPct = 100;
        } else if (idx === currentIndex) {
          widthPct = progress;
        } else {
          widthPct = 0;
        }

        return (
          <div
            key={idx}
            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-sm"
          >
            <div
              className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${widthPct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
};
