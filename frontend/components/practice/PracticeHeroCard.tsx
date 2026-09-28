"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Zap } from "lucide-react";
import CursorGrid from "./CursorGrid";

interface PracticeHeroCardProps {
  onSelectCompany?: (company: string) => void;
}

export function PracticeHeroCard({ onSelectCompany }: PracticeHeroCardProps) {
  const companies = [
    {
      id: "colgate",
      name: "Colgate",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#D61B28] flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <span className="text-white font-black text-xs sm:text-sm tracking-tight italic font-serif">
            Colgate
          </span>
        </div>
      ),
    },
    {
      id: "gartner",
      name: "Gartner",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#002856] flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <span className="text-white font-black text-xs sm:text-sm tracking-tight">
            Gartner
          </span>
        </div>
      ),
    },
    {
      id: "microsoft",
      name: "Microsoft",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <div className="grid grid-cols-2 gap-1 w-5 h-5 sm:w-6 sm:h-6">
            <div className="bg-[#F25022] rounded-xs" />
            <div className="bg-[#7FBA00] rounded-xs" />
            <div className="bg-[#00A4EF] rounded-xs" />
            <div className="bg-[#FFB900] rounded-xs" />
          </div>
        </div>
      ),
    },
    {
      id: "meta",
      name: "Meta",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <span className="text-[#0668E1] font-black text-lg sm:text-xl tracking-tighter">
            m
          </span>
        </div>
      ),
    },
    {
      id: "goldman sachs",
      name: "Goldman Sachs",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex flex-col items-center justify-center p-1.5 shadow-md hover:scale-108 transition-all text-center leading-none">
          <span className="text-[#002D62] font-black text-[9px] sm:text-[10px]">
            Goldman
          </span>
          <span className="text-[#002D62] font-black text-[9px] sm:text-[10px] mt-0.5">
            Sachs
          </span>
        </div>
      ),
    },
    {
      id: "bcg",
      name: "BCG",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#00875A] flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <span className="text-white font-black text-xs sm:text-sm tracking-wider">
            BCG
          </span>
        </div>
      ),
    },
    {
      id: "mckinsey",
      name: "McKinsey",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#051C2C] flex flex-col items-center justify-center p-1.5 shadow-md hover:scale-108 transition-all text-center leading-tight">
          <span className="text-white font-bold text-[8.5px] sm:text-[9.5px]">
            McKinsey
          </span>
          <span className="text-slate-300 font-medium text-[7px] sm:text-[8px]">
            &amp; Company
          </span>
        </div>
      ),
    },
    {
      id: "mastercard",
      name: "Mastercard",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <div className="flex items-center -space-x-1.5 sm:-space-x-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#EB001B]" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F79E1B] opacity-90" />
          </div>
        </div>
      ),
    },
    {
      id: "bain",
      name: "Bain",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#CC0000] flex flex-col items-center justify-center p-1.5 shadow-md hover:scale-108 transition-all text-center leading-tight">
          <span className="text-white font-black text-[9px] sm:text-[10px]">
            BAIN
          </span>
          <span className="text-white/90 font-bold text-[6px] sm:text-[7px] tracking-tighter">
            &amp; COMPANY
          </span>
        </div>
      ),
    },
    {
      id: "unilever",
      name: "Unilever",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <span className="text-[#1F36C7] font-black text-xl sm:text-2xl font-serif">
            U
          </span>
        </div>
      ),
    },
    {
      id: "razorpay",
      name: "Razorpay",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md hover:scale-108 transition-all text-center">
          <span className="text-[#0C2340] font-black text-[9px] sm:text-[10px] tracking-tight">
            razorpay
          </span>
        </div>
      ),
    },
    {
      id: "google",
      name: "Google",
      render: (
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md hover:scale-108 transition-all">
          <div className="flex items-center text-[11px] sm:text-xs font-black tracking-tighter">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 md:p-11 bg-gradient-to-r from-[#0C0916] via-[#130E22] to-[#0A0713] border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(168,85,247,0.1)] overflow-hidden select-none min-h-[380px]"
    >
      {/* ── Interactive Cursor Grid Background Canvas ── */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <CursorGrid
          cellSize={70}
          color="#D946EF"
          radius={140}
          falloff="smooth"
          holdTime={400}
          fadeDuration={800}
          lineWidth={1.2}
          maxOpacity={1}
          fillOpacity={0}
          gridOpacity={0}
          cellRadius={0}
          clickPulse
          pulseSpeed={600}
        />
      </div>

      {/* ── Soft Ambient Purple Glow Behind Grid ── */}
      <div className="absolute -top-16 left-12 w-80 h-80 bg-purple-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 right-16 w-80 h-80 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* ── Foreground Content ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 pointer-events-none">
        {/* ── Left Content Column ── */}
        <div className="flex-1 space-y-3 sm:space-y-4 max-w-2xl pointer-events-none">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#F0ABFC] via-[#E879F9] to-[#C084FC] bg-clip-text text-transparent">
              Coding Practice!
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
            Over{" "}
            <span className="text-[#D8B4FE]">1000+ questions</span> to choose from!
          </h2>

          {/* Paragraph */}
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl">
            From basic loops to advanced algorithmic puzzles, our coding challenges will give your coding practice an upgrade!
          </p>

          {/* Category Eyebrow */}
          <div className="pt-2 sm:pt-3">
            <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-[#F0ABFC]">
              PRACTICE CODING WITH CHALLENGES THAT:
            </span>
          </div>

          {/* 3 Feature Bullets */}
          <div className="space-y-2.5 pt-1">
            {/* Bullet 1 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#231A38] border border-purple-500/25 flex items-center justify-center text-[#D8B4FE] shrink-0 shadow-2xs">
                <div className="w-3.5 h-3.5 rounded-full border border-[#D8B4FE] overflow-hidden flex">
                  <div className="w-1/2 h-full bg-[#D8B4FE]" />
                  <div className="w-1/2 h-full bg-transparent" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                Sharpen your logic.
              </span>
            </div>

            {/* Bullet 2 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#231A38] border border-purple-500/25 flex items-center justify-center text-[#D8B4FE] shrink-0 shadow-2xs">
                <Lightbulb className="w-3.5 h-3.5 text-[#D8B4FE]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                Enhance your creativity.
              </span>
            </div>

            {/* Bullet 3 */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#231A38] border border-purple-500/25 flex items-center justify-center text-[#D8B4FE] shrink-0 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#D8B4FE]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                Boost your coding speed.
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Target Top Companies 4x3 Grid ── */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end shrink-0 pt-2 lg:pt-0 pointer-events-auto">
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-[#94A3B8] mb-3 self-center lg:self-center">
            TARGET TOP COMPANIES
          </span>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-1">
            {companies.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onSelectCompany && onSelectCompany(comp.id)}
                title={`Target ${comp.name} Questions`}
                className="cursor-pointer"
              >
                {comp.render}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
