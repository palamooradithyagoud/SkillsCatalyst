"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Playlist } from "@/lib/api";

export function PlaylistCard({
  pl,
  rank,
  savedIds,
  onSave,
  onUnsave,
  onWatch,
  delay = 0,
}: {
  pl: Playlist;
  rank: number;
  savedIds: Set<string>;
  onSave?: (pl: Playlist) => void;
  onUnsave?: (id: string) => void;
  onWatch: (pl: Playlist) => void;
  delay?: number;
}) {
  const isSaved = savedIds.has(pl.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 320, height: 230 });

  // Dynamically measure container dimensions for pixel-perfect SVG path rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(dimensions.width || 320, 160);
  const H = Math.max(dimensions.height || 230, 180);
  const R = 20; // Corner radius for top-right, bottom-right, bottom-left
  const Rs = 28; // Concave scoop radius
  const rf = 8; // Tangent fillet radius

  // ── Exact C1-Continuous Concave Cutout Path for Top-Left Corner ──
  // Scoop center at (28, 28) with 8px tangent fillets into top edge (at x=58) and left edge (at y=58).
  const cardPath =
    `M 58 0 ` +
    `L ${W - R} 0 ` +
    `A ${R} ${R} 0 0 1 ${W} ${R} ` +
    `L ${W} ${H - R} ` +
    `A ${R} ${R} 0 0 1 ${W - R} ${H} ` +
    `L ${R} ${H} ` +
    `A ${R} ${R} 0 0 1 0 ${H - R} ` +
    `L 0 58 ` +
    `A ${rf} ${rf} 0 0 1 12.5 51.3 ` +
    `A ${Rs} ${Rs} 0 0 0 51.3 12.5 ` +
    `A ${rf} ${rf} 0 0 1 58 0 ` +
    `Z`;

  const displayLanguage = pl.language && pl.language !== "All" ? pl.language : "English";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="h-full select-none"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full min-h-[220px] sm:min-h-[235px] group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        {/* ── Dynamic Scaled SVG Background with Concave Top-Left Cutout & Crisp Border ── */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={cardPath}
            className="fill-white dark:fill-[#18191F] stroke-slate-200/90 dark:stroke-neutral-800 group-hover:stroke-purple-300/80 dark:group-hover:stroke-purple-500/50 transition-colors"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* ── Floating Circular Badge Nested in the Top-Left Round Cutout ── */}
        <div
          style={{
            position: "absolute",
            left: "8px",
            top: "8px",
            width: "40px",
            height: "40px",
          }}
          className="rounded-full bg-white dark:bg-[#121316] border border-slate-200/90 dark:border-neutral-700/80 shadow-sm flex items-center justify-center z-20 select-none group-hover:scale-105 transition-transform"
        >
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight font-sans">
            #{rank}
          </span>
        </div>

        {/* ── Card Content Container ── */}
        <div className="relative z-10 flex flex-col justify-between h-full p-3.5 sm:p-5">
          <div>
            {/* 1. Channel Name in the Top Left Side Corner (beside the #rank cutout) */}
            <div className="flex items-center h-8 sm:h-9 pl-12 sm:pl-14 pr-1 mb-2">
              <p
                className="text-xs sm:text-sm font-bold text-purple-600 dark:text-[#C4A3F0] truncate leading-tight"
                title={pl.channel}
              >
                {pl.channel}
              </p>
            </div>

            {/* 2. Video Title */}
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#C4A3F0] transition-colors leading-snug line-clamp-2 mt-0.5">
              {pl.title}
            </h3>

            {/* 3. Downside the Title: Language Badge */}
            <div className="flex items-center gap-1.5 mt-2.5 sm:mt-3">
              <span className="text-[10px] sm:text-xs font-bold text-violet-700 dark:text-[#C4A3F0] bg-violet-50 dark:bg-purple-950/60 border border-violet-200/90 dark:border-purple-800/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                {displayLanguage}
              </span>
            </div>
          </div>

          {/* 4. Footer: Watch & Save Buttons */}
          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800/80">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onWatch(pl)}
              className="flex-1 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#A478D8] hover:bg-[#9364CB] active:bg-[#8352BE] shadow-md shadow-[#A478D8]/25 transition-all cursor-pointer select-none"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
              <span>Watch</span>
            </motion.button>

            {onSave && onUnsave && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => (isSaved ? onUnsave(pl.id) : onSave(pl))}
                className={`flex-1 py-2 sm:py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none ${
                  isSaved
                    ? "text-purple-700 dark:text-[#C4A3F0] border-purple-300 dark:border-purple-600/60 bg-purple-50 dark:bg-purple-950/60 shadow-xs"
                    : "text-slate-700 dark:text-neutral-200 border-slate-200/90 dark:border-neutral-700/80 bg-slate-100/80 dark:bg-neutral-800/80 hover:bg-slate-200/80 dark:hover:bg-neutral-700/80 hover:text-slate-900 dark:hover:text-white shadow-xs"
                }`}
              >
                {isSaved ? "Saved ✓" : "Save"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
