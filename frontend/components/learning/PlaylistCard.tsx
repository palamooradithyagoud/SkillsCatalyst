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
  const [dimensions, setDimensions] = useState({ width: 320, height: 210 });

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

  const W = Math.max(dimensions.width || 320, 140);
  const H = Math.max(dimensions.height || 195, 160);
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
        className="relative w-full h-full min-h-[190px] sm:min-h-[225px] group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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
            className="fill-white dark:fill-[#18191F] stroke-slate-200/90 dark:stroke-neutral-800 group-hover:stroke-[#D5FF38]/60 transition-colors"
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
          }}
          className="w-[36px] h-[36px] sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#121316] border border-slate-200/90 dark:border-neutral-700/80 shadow-sm flex items-center justify-center z-20 select-none group-hover:scale-105 transition-transform"
        >
          <span className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white tracking-tight font-sans">
            #{rank}
          </span>
        </div>

        {/* ── Card Content Container ── */}
        <div className="relative z-10 flex flex-col justify-between h-full p-3 sm:p-4 md:p-5">
          {/* 1. Channel Name in the Top Left Side Corner (spaced cleanly to the right of the #rank cutout) */}
          <div className="flex items-center h-7 sm:h-8 pl-[50px] sm:pl-14 pr-1">
            <p
              className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-700 dark:text-neutral-300 group-hover:text-[#D5FF38] transition-colors truncate leading-tight"
              title={pl.channel}
            >
              {pl.channel}
            </p>
          </div>

          {/* 2. Video Title: Moved down with ample breathing room below the top badge */}
          <div className="my-auto pt-2.5 sm:pt-3 pb-1">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#D5FF38] transition-colors leading-[1.3] sm:leading-snug line-clamp-2">
              {pl.title}
            </h3>
          </div>

          {/* 3. Downside: Language Badge Kept Down + Footer Buttons */}
          <div className="pt-1">
            {/* Language Badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 px-2 sm:px-2.5 py-0.5 rounded-full shadow-none">
                {displayLanguage}
              </span>
            </div>

            {/* 4. Footer: Watch & Save Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-neutral-800/80">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onWatch(pl)}
                className="flex-1 py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-full flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-black bg-[#D5FF38] hover:bg-[#cbf526] active:bg-[#bfe820] shadow-none transition-all cursor-pointer select-none whitespace-nowrap"
              >
                <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-black text-black shrink-0" />
                <span>Watch</span>
              </motion.button>

              {onSave && onUnsave && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => (isSaved ? onUnsave(pl.id) : onSave(pl))}
                  className={`flex-1 py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer select-none text-center whitespace-nowrap ${
                    isSaved
                      ? "text-black bg-[#D5FF38] border-[#D5FF38] font-black shadow-none"
                      : "text-slate-700 dark:text-neutral-200 border-slate-200/90 dark:border-neutral-700/80 bg-slate-100/80 dark:bg-neutral-800/80 hover:bg-slate-200/80 dark:hover:bg-neutral-700/80 hover:text-slate-900 dark:hover:text-white shadow-none"
                  }`}
                >
                  {isSaved ? "Saved ✓" : "Save"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlaylistCard;
