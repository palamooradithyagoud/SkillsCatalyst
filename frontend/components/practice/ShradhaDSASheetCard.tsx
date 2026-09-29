"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { TOTAL_SHRADHA_PROBLEMS } from "@/data/practice/shradhaDsaSheetData";

interface ShradhaDSASheetCardProps {
  onSelect?: () => void;
}

export function ShradhaDSASheetCard({ onSelect }: ShradhaDSASheetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      onClick={onSelect}
      className="w-full max-w-[320px] sm:max-w-[335px] rounded-[20px] bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(234,88,12,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group select-none relative"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP BANNER / THUMBNAIL (USING USER'S SHRADHA DIDI IMAGE)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[185px] sm:h-[195px] bg-[#120502] overflow-hidden flex items-center justify-center">
        {/* Ambient blurred glow from the image itself to fill banner borders seamlessly */}
        <Image
          src="/images/practice/shradha_dsa_30_days.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover blur-2xl opacity-45 scale-125 pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Full uncropped image fitted crisply */}
        <div className="relative w-full h-full">
          <Image
            src="/images/practice/shradha_dsa_30_days.jpg"
            alt="Shradha Didi DSA 30 Days Sheet Series"
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-contain object-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] group-hover:scale-104 transition-transform duration-300 ease-out"
            priority
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CARD BODY (PARALLEL TO PENGUIN CARD)
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 pt-3.5 sm:pt-4 bg-white flex flex-col justify-between flex-1 text-left">
        <div>
          {/* Title */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-slate-900 font-extrabold text-[17px] sm:text-[18px] tracking-tight group-hover:text-orange-600 transition-colors leading-snug">
              Shradha Didi&apos;s 30 Days Sheet
            </h3>
          </div>

          {/* Subtitle / Curated By */}
          <p className="text-slate-500 font-medium text-xs sm:text-[13px] mt-1 flex items-center gap-1.5">
            <span>Curated by Apna College</span>
            <span className="text-slate-300">•</span>
            <span className="text-orange-600 font-bold">Ex-Microsoft</span>
          </p>

          {/* Company Badges Strip */}
          <div className="flex items-center gap-1 mt-2.5 flex-wrap">
            {["Microsoft", "Apple", "Amazon", "Netflix", "Google"].map((co) => (
              <span
                key={co}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60"
              >
                {co}
              </span>
            ))}
          </div>
        </div>

        {/* Problems Count with Bookmark/Book Icon */}
        <div className="flex items-center gap-1.5 text-slate-700 text-xs sm:text-[13px] font-semibold mt-3.5 pt-2.5 border-t border-slate-100">
          <Bookmark className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-slate-900 font-bold">{TOTAL_SHRADHA_PROBLEMS} Problems</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">30 Days</span>
        </div>
      </div>
    </motion.div>
  );
}
