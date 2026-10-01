"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { GroupedTechNewsSource } from "@/types/tech_news";

interface TechNewsSourceCircleProps {
  source: GroupedTechNewsSource;
  onClick: () => void;
  hasUnviewed?: boolean;
  unwatchedCount?: number;
}

export const TechNewsSourceCircle: React.FC<TechNewsSourceCircleProps> = ({
  source,
  onClick,
  hasUnviewed = true,
  unwatchedCount,
}) => {
  const [imgError, setImgError] = useState(false);
  const totalCount = source.stories?.length || 0;
  const displayCount = unwatchedCount !== undefined ? unwatchedCount : totalCount;

  // Extract initials for fallback
  const initials = source.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-shrink-0 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl p-0.5 transition-all ${
        hasUnviewed ? "" : "opacity-75 hover:opacity-100"
      }`}
      title={`${source.name} - ${displayCount} ${hasUnviewed ? "unwatched" : "watched"} ${totalCount === 1 ? "story" : "stories"}`}
    >
      {/* Circle with Gradient Ring (Compact Icon Size) */}
      <div className="relative">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${
            hasUnviewed
              ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_14px_rgba(244,63,94,0.5)]"
              : "bg-slate-200 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600/60"
          }`}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-[#0D111D] p-[1.5px] flex items-center justify-center overflow-hidden">
            {source.logo_url && !imgError ? (
              <Image
                src={source.logo_url}
                alt={source.name}
                width={44}
                height={44}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain rounded-full p-0.5 transition-opacity duration-200"
                unoptimized
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center text-[10px] font-black tracking-wider text-white">
                {initials || "SC"}
              </div>
            )}
          </div>
        </div>

        {/* Story Count Pill Badge: only shown if there are unwatched stories */}
        {hasUnviewed && displayCount > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border border-white dark:border-slate-900 text-[8.5px] font-black text-white flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
            {displayCount}
          </span>
        )}
      </div>

      {/* Company Name Label */}
      <span
        className={`text-[10px] sm:text-[10.5px] font-semibold max-w-[54px] sm:max-w-[58px] truncate tracking-tight text-center transition-colors ${
          hasUnviewed
            ? "text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-300"
            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        }`}
      >
        {source.name}
      </span>
    </button>
  );
};
