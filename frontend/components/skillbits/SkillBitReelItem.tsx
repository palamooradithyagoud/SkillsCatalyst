"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { StudentSkillBit } from "@/types/skillbits";
import { fetchSkillBitProgress, saveSkillBitProgress } from "@/lib/api/skillbits";

// Dynamically import MuxPlayer to ensure optimal client-side hydration
const MuxPlayer = dynamic(
  () => import("@mux/mux-player-react"),
  { ssr: false }
);

interface SkillBitReelItemProps {
  skillbit: StudentSkillBit;
  isActive: boolean;
  isNext: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
}

export function resolveLearnMoreDestination(
  bit: StudentSkillBit
): { label: string; href: string } | null {
  if (Array.isArray(bit.lessons) && bit.lessons.length > 0) {
    const lesson = bit.lessons[0] as Record<string, unknown>;
    const id = lesson?.id || lesson?.slug;
    if (id) {
      return {
        label: "Learn More in Lesson →",
        href: `/learning?lesson=${encodeURIComponent(String(id))}`,
      };
    }
  }

  if (Array.isArray(bit.courses) && bit.courses.length > 0) {
    const course = bit.courses[0] as Record<string, unknown>;
    const id = course?.id || course?.slug;
    if (id) {
      return {
        label: "Learn More in Course →",
        href: `/courses?id=${encodeURIComponent(String(id))}`,
      };
    }
  }

  if (Array.isArray(bit.roadmaps) && bit.roadmaps.length > 0) {
    const roadmap = bit.roadmaps[0] as Record<string, unknown>;
    const id = roadmap?.id || roadmap?.slug;
    if (id) {
      return {
        label: "Explore Roadmap →",
        href: `/roadmaps?id=${encodeURIComponent(String(id))}`,
      };
    }
  }

  return null;
}

export default function SkillBitReelItem({
  skillbit,
  isActive,
  isNext,
  isMuted,
  onToggleMute,
  onBack,
}: SkillBitReelItemProps) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const [showPlayFeedback, setShowPlayFeedback] = useState<"play" | "pause" | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [expandedDesc, setExpandedDesc] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const watchedSecondsRef = useRef<number>(0);
  const lastPositionRef = useRef<number>(0);
  const lastSavedTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const hasInitialSeekRef = useRef<boolean>(false);
  const durationRef = useRef<number>(skillbit.duration_seconds || 0);
  const isCompletedRef = useRef<boolean>(false);

  const learnMore = resolveLearnMoreDestination(skillbit);

  // Save progress helper (non-blocking)
  const persistProgress = useCallback(
    (pos: number, watched: number, pct: number) => {
      if (!skillbit.id) return;
      saveSkillBitProgress(skillbit.id, {
        watched_seconds: Math.round(watched),
        last_position_seconds: Math.round(pos * 100) / 100,
        completion_percentage: Math.min(100, Math.max(0, Math.round(pct * 10) / 10)),
      })
        .then((res) => {
          if (res.completed) {
            setIsCompleted(true);
            isCompletedRef.current = true;
          }
        })
        .catch(() => {
          // Safe fallback: keeps in-memory progress without breaking playback
        });
    },
    [skillbit.id]
  );

  // Load progress when slide becomes active
  useEffect(() => {
    if (!isActive) return;

    fetchSkillBitProgress(skillbit.id)
      .then((p) => {
        if (p.completed) {
          setIsCompleted(true);
          isCompletedRef.current = true;
        }
        watchedSecondsRef.current = p.watched_seconds || 0;
        lastPositionRef.current = p.last_position_seconds || 0;

        // Resume from saved position if not completed and position > 0
        if (p.last_position_seconds > 0 && !p.completed && !hasInitialSeekRef.current) {
          hasInitialSeekRef.current = true;
          const player = playerRef.current;
          if (player) {
            player.currentTime = p.last_position_seconds;
          }
        }
      })
      .catch(() => {
        // Resilience: fallback to 0:00 on unauthenticated or network error
      });
  }, [isActive, skillbit.id]);

  // Synchronize playback with active slide state
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isActive) {
      lastTickTimeRef.current = Date.now();
      const playPromise = player.play?.();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay with sound might be blocked by browser policy
          if (player.muted !== true) {
            player.muted = true;
            player.play?.().catch(() => {});
          }
        });
      }
    } else {
      player.pause?.();
      // Immediately save position when leaving slide
      if (lastPositionRef.current > 0) {
        const curTime = lastPositionRef.current;
        const dur = durationRef.current || skillbit.duration_seconds || 0;
        const pct = dur > 0 ? (curTime / dur) * 100 : 0;
        persistProgress(curTime, watchedSecondsRef.current, pct);
      }
    }
  }, [isActive, skillbit.duration_seconds, persistProgress]);

  // Synchronize mute state
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Best effort save on window beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive && lastPositionRef.current > 0) {
        const curTime = lastPositionRef.current;
        const dur = durationRef.current || skillbit.duration_seconds || 0;
        const pct = dur > 0 ? (curTime / dur) * 100 : 0;
        persistProgress(curTime, watchedSecondsRef.current, pct);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, skillbit.duration_seconds, persistProgress]);

  // Throttled time update & completion check
  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const curTime = player.currentTime || 0;
    lastPositionRef.current = curTime;
    const dur = durationRef.current || player.duration || skillbit.duration_seconds || 0;
    if (dur > 0 && durationRef.current <= 0) {
      durationRef.current = dur;
    }

    const now = Date.now();
    if (lastTickTimeRef.current > 0) {
      const delta = (now - lastTickTimeRef.current) / 1000;
      if (delta > 0 && delta < 3) {
        watchedSecondsRef.current += Math.round(delta);
      }
    }
    lastTickTimeRef.current = now;

    const pct = dur > 0 ? Math.min(100, Math.round((curTime / dur) * 1000) / 10) : 0;
    if (pct >= 90 && !isCompletedRef.current) {
      setIsCompleted(true);
      isCompletedRef.current = true;
      persistProgress(curTime, watchedSecondsRef.current, pct);
    } else if (now - lastSavedTimeRef.current >= 7000) {
      lastSavedTimeRef.current = now;
      persistProgress(curTime, watchedSecondsRef.current, pct);
    }
  }, [skillbit.duration_seconds, persistProgress]);

  // Tap video to toggle play/pause
  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (player.paused) {
      lastTickTimeRef.current = Date.now();
      player.play?.();
      setShowPlayFeedback("play");
    } else {
      player.pause?.();
      setShowPlayFeedback("pause");
      // Save immediately on pause
      const curTime = player.currentTime || lastPositionRef.current;
      const dur = durationRef.current || skillbit.duration_seconds || 0;
      const pct = dur > 0 ? Math.min(100, (curTime / dur) * 100) : 0;
      persistProgress(curTime, watchedSecondsRef.current, pct);
    }

    setTimeout(() => {
      setShowPlayFeedback(null);
    }, 600);
  }, [skillbit.duration_seconds, persistProgress]);

  const handleEnded = useCallback(() => {
    setIsEnded(true);
    setIsCompleted(true);
    isCompletedRef.current = true;
    const dur = durationRef.current || skillbit.duration_seconds || lastPositionRef.current;
    persistProgress(dur, watchedSecondsRef.current, 100);
  }, [skillbit.duration_seconds, persistProgress]);

  const handleReplay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime = 0;
    lastPositionRef.current = 0;
    lastTickTimeRef.current = Date.now();
    player.play?.();
    setIsEnded(false);
  }, []);

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "advanced":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "intermediate":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-black snap-start select-none overflow-hidden"
      data-skillbit-id={skillbit.id}
    >
      {/* 9:16 Video Container */}
      <div className="relative w-full h-full max-w-[440px] aspect-[9/16] bg-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
        {/* MUX VIDEO PLAYER */}
        {skillbit.playback_id && !videoError ? (
          <div
            className="w-full h-full cursor-pointer relative"
            onClick={handleTogglePlay}
          >
            <MuxPlayer
              ref={playerRef}
              playbackId={skillbit.playback_id}
              streamType="on-demand"
              preload={isActive ? "auto" : isNext ? "metadata" : "none"}
              muted={isMuted}
              playsInline
              loop={false}
              thumbnailTime={0}
              className="w-full h-full object-cover"
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "9/16",
                objectFit: "cover",
              }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={() => setVideoError(true)}
            />

            {/* Tap Feedback Animation Indicator */}
            {showPlayFeedback && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="p-4 bg-black/60 backdrop-blur-md rounded-full text-white animate-out fade-out zoom-out-90 duration-500">
                  {showPlayFeedback === "play" ? (
                    <Play className="w-8 h-8 fill-current text-purple-400" />
                  ) : (
                    <Pause className="w-8 h-8 fill-current text-white" />
                  )}
                </div>
              </div>
            )}

            {/* Replay Overlay when video finishes */}
            {isEnded && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 cursor-pointer z-25 text-white animate-in fade-in duration-200"
              >
                <div className="p-3.5 bg-purple-600/80 hover:bg-purple-600 rounded-full transition-transform hover:scale-110 shadow-lg">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold tracking-wide">Replay Video</span>
              </div>
            )}
          </div>
        ) : (
          /* Video Error or Missing playback_id Fallback */
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Video temporarily unavailable</p>
            <p className="text-xs text-slate-500 max-w-xs">
              This SkillBit is currently transcoding or buffering. Swipe up for the next lesson.
            </p>
          </div>
        )}

        {/* Minimal Gradient Protection Layers for Readability */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

        {/* TOP OVERLAY BAR */}
        <div className="absolute top-0 inset-x-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold tracking-tight text-white drop-shadow">
              SkillBits
            </span>
          </div>

          <button
            onClick={onBack}
            aria-label="Close and return"
            className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-slate-200 hover:text-white transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FLOATING ACTION: MUTE/UNMUTE BUTTON */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-4">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white border border-white/10 transition-transform active:scale-95 shadow-lg"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-300" />
            ) : (
              <Volume2 className="w-5 h-5 text-purple-400" />
            )}
          </button>
        </div>

        {/* BOTTOM LEARNING OVERLAY */}
        <div className="absolute bottom-0 inset-x-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-2 z-20 text-left pointer-events-auto">
          {/* Metadata Badges: Topic, Difficulty, Duration */}
          <div className="flex flex-wrap items-center gap-2">
            {skillbit.topic && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                #{skillbit.topic}
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border capitalize ${getDifficultyBadge(
                skillbit.difficulty
              )}`}
            >
              {skillbit.difficulty}
            </span>
            {skillbit.duration_seconds && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/10 text-slate-200 backdrop-blur-sm border border-white/10">
                <Clock className="w-3 h-3" />
                {skillbit.duration_seconds}s
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Completed
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md">
            {skillbit.title}
          </h2>

          {/* Description (expandable) */}
          {skillbit.description && (
            <p
              onClick={() => setExpandedDesc(!expandedDesc)}
              className={`text-xs text-slate-300/90 leading-relaxed cursor-pointer drop-shadow ${
                expandedDesc ? "" : "line-clamp-2"
              }`}
            >
              {skillbit.description}
            </p>
          )}

          {/* Skills tags if available */}
          {Array.isArray(skillbit.skills) && skillbit.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skillbit.skills.map((s) => (
                <span
                  key={s.id || s.skill_key}
                  className="text-[10px] px-2 py-0.5 bg-slate-900/60 text-slate-300 rounded border border-slate-700/60 backdrop-blur-sm"
                >
                  {s.skill_name || s.skill_key}
                </span>
              ))}
            </div>
          )}

          {/* CONDITIONAL LEARN MORE CTA (Only when a real destination exists!) */}
          {learnMore && (
            <div className="pt-2">
              <a
                href={learnMore.href}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-950/50 transition-all active:scale-95"
              >
                <span>{learnMore.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
