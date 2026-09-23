"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Film, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { StudentSkillBit } from "@/types/skillbits";
import { fetchStudentSkillBits } from "@/lib/api/skillbits";
import SkillBitReelItem from "@/components/skillbits/SkillBitReelItem";

export default function SkillBitsPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [skillbits, setSkillbits] = useState<StudentSkillBit[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted for reliable mobile autoplay
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BATCH_SIZE = 10;
  const isFetchingMoreRef = useRef<boolean>(false);

  // Return to previous page or fallback to /explore
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/explore");
    }
  }, [router]);

  // Initial Data Fetch
  const loadInitialSkillBits = useCallback(() => {
    fetchStudentSkillBits({
      limit: BATCH_SIZE,
      offset: 0,
    })
      .then((res) => {
        const items = res.items || [];
        setSkillbits(items);
        setHasMore(items.length >= BATCH_SIZE);
        setActiveIndex(0);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load SkillBits.";
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadInitialSkillBits();
  }, [loadInitialSkillBits]);

  // Infinite Scroll Pagination Fetch
  const loadMoreSkillBits = useCallback(() => {
    if (isFetchingMoreRef.current || !hasMore) return;
    isFetchingMoreRef.current = true;
    setLoadingMore(true);

    const offset = skillbits.length;
    fetchStudentSkillBits({
      limit: BATCH_SIZE,
      offset,
    })
      .then((res) => {
        const newItems = res.items || [];
        if (newItems.length > 0) {
          setSkillbits((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const uniqueNew = newItems.filter((b) => !existingIds.has(b.id));
            return [...prev, ...uniqueNew];
          });
        }
        setHasMore(newItems.length >= BATCH_SIZE);
      })
      .catch(() => {
        // Silently catch pagination error so current feed stays uninterrupted
      })
      .finally(() => {
        setLoadingMore(false);
        isFetchingMoreRef.current = false;
      });
  }, [hasMore, skillbits.length]);

  // Check if approaching end of loaded items to trigger pagination
  useEffect(() => {
    if (activeIndex >= skillbits.length - 2 && hasMore && !loadingMore && !isFetchingMoreRef.current) {
      loadMoreSkillBits();
    }
  }, [activeIndex, skillbits.length, hasMore, loadingMore, loadMoreSkillBits]);

  // IntersectionObserver to determine active slide from scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container || skillbits.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexStr = (entry.target as HTMLElement).dataset.index;
            if (indexStr !== undefined) {
              const idx = parseInt(indexStr, 10);
              if (!isNaN(idx)) {
                setActiveIndex(idx);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6, // Trigger when slide is 60% in view
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [skillbits]);

  // Scroll to a specific index
  const scrollToIndex = useCallback((index: number) => {
    if (index < 0 || index >= skillbits.length) return;
    const targetEl = slideRefs.current[index];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  }, [skillbits.length]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          scrollToIndex(activeIndex + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          scrollToIndex(activeIndex - 1);
          break;
        case "m":
        case "M":
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          handleBack();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, scrollToIndex, handleBack]);

  // ── LOADING STATE ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading SkillBits...
        </p>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white p-6 space-y-4 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Unable to Load SkillBits</h2>
          <p className="text-xs text-slate-400 max-w-sm">{error}</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadInitialSkillBits();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── EMPTY STATE ───────────────────────────────────────────────────────────
  if (skillbits.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white p-6 space-y-4 text-center">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-purple-400">
          <Film className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">No SkillBits Available Yet</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Our educators are transcoding fresh micro-learning reels. Check back soon for quick skill breakdowns!
          </p>
        </div>
        <button
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/40"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  // ── VERTICAL FEED ─────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex items-center justify-center">
      {/* DESKTOP SIDE NAVIGATION HINTS */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-30">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous SkillBit"
          className="p-3 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-full text-white backdrop-blur-md transition-all hover:scale-105"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-mono font-medium text-slate-400">
          {activeIndex + 1} / {skillbits.length}
        </span>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === skillbits.length - 1}
          aria-label="Next SkillBit"
          className="p-3 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-full text-white backdrop-blur-md transition-all hover:scale-105"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* FULL-SCREEN VERTICAL SNAP CONTAINER */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {skillbits.map((bit, index) => (
          <div
            key={bit.id}
            data-index={index}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="w-full h-[100dvh] snap-start"
          >
            <SkillBitReelItem
              skillbit={bit}
              isActive={index === activeIndex}
              isNext={index === activeIndex + 1}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onBack={handleBack}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
