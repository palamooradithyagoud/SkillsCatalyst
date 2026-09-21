"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  ArrowRight,
  Sparkles,
  Pause,
} from "lucide-react";
import type { GroupedTechNewsSource, TechNewsStory } from "@/types/tech_news";
import { TechNewsStoryProgress } from "./TechNewsStoryProgress";

interface TechNewsStoryViewerProps {
  sources: GroupedTechNewsSource[];
  initialSourceIndex: number;
  initialStoryIndex?: number;
  onClose: () => void;
}

function getHoursRemaining(visibleUntil?: string | null): string {
  if (!visibleUntil) return "48h window";
  const diffMs = new Date(visibleUntil).getTime() - Date.now();
  if (diffMs <= 0) return "Expiring soon";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Just now";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const TechNewsStoryViewer: React.FC<TechNewsStoryViewerProps> = ({
  sources,
  initialSourceIndex,
  initialStoryIndex = 0,
  onClose,
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sourceIdx, setSourceIdx] = useState(initialSourceIndex);
  const [storyIdx, setStoryIdx] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      setMounted(false);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const currentSource: GroupedTechNewsSource | undefined = sources[sourceIdx];
  const stories: TechNewsStory[] = currentSource?.stories || [];
  const currentStory: TechNewsStory | undefined = stories[storyIdx];

  // Press-and-hold pause timer tracking
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navigate to next story or next source
  const handleNext = useCallback(() => {
    if (storyIdx + 1 < stories.length) {
      setStoryIdx((prev) => prev + 1);
      setCoverError(false);
    } else if (sourceIdx + 1 < sources.length) {
      setSourceIdx((prev) => prev + 1);
      setStoryIdx(0);
      setCoverError(false);
      setLogoError(false);
    } else {
      // Reached the end of all stories in all sources
      onClose();
    }
  }, [storyIdx, stories.length, sourceIdx, sources.length, onClose]);

  // Navigate to previous story or previous source
  const handlePrev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((prev) => prev - 1);
      setCoverError(false);
    } else if (sourceIdx > 0) {
      const prevSource = sources[sourceIdx - 1];
      const prevStoriesCount = prevSource?.stories?.length || 1;
      setSourceIdx((prev) => prev - 1);
      setStoryIdx(prevStoriesCount - 1);
      setCoverError(false);
      setLogoError(false);
    }
  }, [storyIdx, sourceIdx, sources]);

  // Keyboard accessibility: Left, Right, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const origStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origStyle;
    };
  }, []);

  if (!mounted || !currentSource || !currentStory) {
    return null;
  }

  const hoursRemaining = getHoursRemaining(currentStory.visible_until);
  const timeAgo = getRelativeTime(currentStory.published_at || currentStory.created_at);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${currentSource.name} Tech News Story`}
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Desktop Floating Close Button */}
      <button
        onClick={onClose}
        aria-label="Close story viewer"
        className="hidden md:flex absolute top-5 right-6 z-[100000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-xl"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Desktop Prev Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        disabled={sourceIdx === 0 && storyIdx === 0}
        aria-label="Previous story"
        className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all mr-4 cursor-pointer focus:outline-none shrink-0"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Main Story Phone / Card Frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] h-[92vh] max-h-[760px] rounded-3xl overflow-hidden shadow-2xl bg-[#090D16] border border-white/10 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          {currentStory.cover_image_url && !coverError ? (
            <Image
              src={currentStory.cover_image_url}
              alt={currentStory.title || currentStory.headline || "Story Cover"}
              fill
              onError={() => setCoverError(true)}
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            // High-tech futuristic abstract gradient fallback
            <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#311042] flex items-center justify-center p-6 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-purple-500/10 to-transparent" />
            </div>
          )}
          {/* Dark scrim overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/95" />
        </div>

        {/* ── TOP HEADER SECTION ── */}
        <div className="relative z-20 flex flex-col space-y-2">
          {/* Progress Bar Segments */}
          <TechNewsStoryProgress
            count={stories.length}
            currentIndex={storyIdx}
            isPaused={isPaused}
            onComplete={handleNext}
            durationMs={25000}
          />

          {/* Publisher Info & Close Button */}
          <div className="flex items-center justify-between px-4 pt-2">
            <div className="flex items-center gap-2.5">
              {/* Publisher Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/20 p-0.5 overflow-hidden shadow-sm flex items-center justify-center">
                {currentSource.logo_url && !logoError ? (
                  <Image
                    src={currentSource.logo_url}
                    alt={currentSource.name}
                    width={34}
                    height={34}
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-purple-900/60 flex items-center justify-center text-xs font-bold text-purple-200">
                    {currentSource.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight drop-shadow">
                    {currentSource.name}
                  </span>
                  <span className="text-white/60 text-xs">&bull;</span>
                  <span className="text-xs text-white/70 font-medium">{timeAgo}</span>
                </div>
                {/* 48-Hour Active Badge */}
                <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-semibold drop-shadow-sm">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{hoursRemaining}</span>
                </div>
              </div>
            </div>

            {/* Top Right Controls: Pause Indicator & Close */}
            <div className="flex items-center gap-2">
              {isPaused && (
                <div className="px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-white/80 text-[10px] font-semibold flex items-center gap-1 animate-pulse">
                  <Pause className="w-2.5 h-2.5" />
                  <span>Paused</span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close story viewer"
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE TAP ZONES ── */}
        <div className="absolute inset-y-20 inset-x-0 z-10 flex">
          {/* Left 35% tap area: Previous */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous story tap zone"
            className="w-[35%] h-full cursor-pointer"
          />
          {/* Right 65% tap area: Next */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next story tap zone"
            className="w-[65%] h-full cursor-pointer"
          />
        </div>

        {/* ── BOTTOM CONTENT & CTA SECTION ── */}
        <div className="relative z-20 p-5 space-y-4">
          {/* Story Card Backdrop */}
          <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>48h Curated Tech Story</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {currentStory.title || currentStory.headline}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-200 line-clamp-3 leading-relaxed font-normal">
              {currentStory.summary}
            </p>
          </div>

          {/* Action CTAs: Read Full News */}
          <div className="space-y-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                router.push(`/tech-news/${currentStory.id}`);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Read Full News</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Optional Original Source Link */}
            {currentStory.source_url && (
              <a
                href={currentStory.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Visit Original Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        disabled={
          sourceIdx === sources.length - 1 && storyIdx === stories.length - 1
        }
        aria-label="Next story"
        className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all ml-4 cursor-pointer focus:outline-none shrink-0"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>,
    document.body
  );
};
