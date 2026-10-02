"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import Image from "next/image";

interface StriverA2ZDSASheetCardProps {
  onSelect?: () => void;
}

export function StriverA2ZDSASheetCard({ onSelect }: StriverA2ZDSASheetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onClick={onSelect}
      className="w-full sm:max-w-[335px] rounded-2xl sm:rounded-[20px] bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.22)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group select-none relative h-full"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP BANNER / THUMBNAIL (USING STRIVER A2Z DSA SHEET IMAGE)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[95px] xs:h-[115px] sm:h-[195px] bg-[#03140a] overflow-hidden flex items-center justify-center">
        {/* Ambient blurred glow from the image itself to fill banner borders seamlessly */}
        <Image
          src="/images/practice/striver_a2z_sheet.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover blur-2xl opacity-45 scale-125 pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Full uncropped image fitted crisply */}
        <div className="relative w-full h-full">
          <Image
            src="/images/practice/striver_a2z_sheet.jpg"
            alt="Striver A2Z DSA Sheet"
            fill
            sizes="(max-width: 768px) 50vw, 340px"
            className="object-contain object-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] group-hover:scale-104 transition-transform duration-300 ease-out"
            priority
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CARD BODY (CONSISTENT WITH OTHER DSA SHEET CARDS)
          ───────────────────────────────────────────────────────────── */}
      <div className="p-2.5 sm:p-5 pt-2 sm:pt-4 bg-white flex flex-col justify-between flex-1 text-left">
        <div>
          {/* Title */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-slate-900 font-extrabold text-[13px] sm:text-[18px] tracking-tight group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
              Striver&apos;s A2Z DSA Sheet
            </h3>
          </div>

          {/* Subtitle / Curated By */}
          <p className="text-slate-500 font-medium text-[10px] sm:text-[13px] mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
            <span>Curated by take U-forward</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-bold hidden sm:inline">Ex-Google</span>
            <span className="text-emerald-600 font-bold sm:hidden">Ex-Googler</span>
          </p>
        </div>

        {/* Problems Count with Bookmark/Book Icon */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-700 text-[10px] sm:text-[13px] font-semibold mt-2 sm:mt-3.5 pt-1.5 sm:pt-2.5 border-t border-slate-100">
          <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
          <span className="text-slate-900 font-bold">455 Problems</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">18 Steps</span>
        </div>
      </div>
    </motion.div>
  );
}
