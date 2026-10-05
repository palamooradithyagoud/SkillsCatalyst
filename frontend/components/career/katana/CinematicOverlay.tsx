"use client";

import React from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import AnimeSwordsman from "./AnimeSwordsman";
import { DrawState } from "./KatanaMechanism";
import SlashEffect from "./SlashEffect";
import ParticleField, { ParticleState } from "./ParticleField";

export type CinematicSequenceState =
  | "sheathed"
  | "tighten"
  | "unsheathing"
  | "full_draw"
  | "slash"
  | "impact"
  | "reveal"
  | "complete";

interface CinematicOverlayProps {
  state: CinematicSequenceState;
  isMuted: boolean;
  onToggleMute: () => void;
  onCancel: () => void;
}

export default function CinematicOverlay({
  state,
  isMuted,
  onToggleMute,
  onCancel,
}: CinematicOverlayProps) {
  // Map to Swordsman DrawState
  const swordsmanDrawState: DrawState =
    state === "tighten"
      ? "tighten"
      : state === "unsheathing"
      ? "unsheathing"
      : state === "full_draw"
      ? "full_draw"
      : state === "slash" || state === "impact" || state === "reveal"
      ? "slash"
      : "sheathed";

  // Map to Canvas Particle state
  const particleState: ParticleState =
    state === "tighten" || state === "unsheathing"
      ? "charge"
      : state === "full_draw" || state === "slash"
      ? "burst"
      : state === "impact" || state === "reveal"
      ? "fade"
      : "calm";

  return (
    <div className="fixed inset-0 z-[9999] bg-[#07060A] flex flex-col items-center justify-center overflow-hidden select-none touch-none">
      {/* ── Background Film Grain & Cinematic Atmosphere ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,_rgba(30,27,75,0.45)_0%,_rgba(7,6,10,0.98)_70%)] pointer-events-none" />

      {/* ── High-Performance Canvas Particle Engine ── */}
      <ParticleField state={particleState} />

      {/* ── Top Cinematic Anamorphic Letterbox Bar ── */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[6dvh] sm:h-[8dvh] bg-black z-40 flex items-center justify-between px-4 sm:px-8 border-b border-white/5"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-widest text-slate-300 uppercase">
            SkillsCatalyst // CareerPath
          </span>
        </div>

        {/* Audio Toggle & Skip */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={onCancel}
            aria-label="Skip animation"
            className="text-[10px] sm:text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            SKIP <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* ── Center Stage: Swordsman with Physical Katana Unsheathing ── */}
      <div className="relative z-20 w-full max-w-[1100px] px-3 sm:px-8 flex flex-col items-center justify-center">
        {/* Top Typographic Whisper */}
        <motion.div
          className="text-center mb-2 sm:mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: state === "tighten" || state === "unsheathing" ? 0.95 : 0.4,
            y: 0,
          }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-[9px] sm:text-[11.5px] font-mono tracking-[0.35em] uppercase text-amber-400 font-bold">
            {state === "sheathed"
              ? "SHEATHED // STANDBY"
              : state === "tighten"
              ? "HANDS TIGHTEN // TENSION"
              : state === "unsheathing"
              ? "⚡ DRAWING BLADE ⚡"
              : state === "full_draw"
              ? "BLADE FULLY EXPOSED"
              : "DECISION · MOMENTUM · ASCENT"}
          </div>
        </motion.div>

        {/* The Authentic Anime Swordsman with Real Mechanical Unsheathe */}
        <AnimeSwordsman state={swordsmanDrawState} />

        {/* Bottom Anime Title Card Accent */}
        <motion.div
          className="text-center mt-2 sm:mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: state === "unsheathing" || state === "full_draw" ? 1 : 0.6,
            y: 0,
          }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-xs sm:text-sm font-black tracking-widest text-slate-200">
            ENTERING CAREER ROADMAP
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Cinematic Anamorphic Letterbox Bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[6dvh] sm:h-[8dvh] bg-black z-40 flex items-center justify-between px-4 sm:px-8 border-t border-white/5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <span className="text-[9px] sm:text-[11px] font-mono text-slate-500 tracking-wider">
          INITIATING NEURAL PATHWAY // 60 FPS
        </span>
        <span className="text-[9px] sm:text-[11px] font-mono text-amber-500 font-bold tracking-wider">
          FORM 1: THUNDERCLAP UNSHEATHE
        </span>
      </motion.div>

      {/* ── Slash Beam and Reality Split Overlay ── */}
      <SlashEffect
        state={
          state === "slash"
            ? "slash"
            : state === "impact"
            ? "impact"
            : state === "reveal"
            ? "wipe"
            : "idle"
        }
      />
    </div>
  );
}
