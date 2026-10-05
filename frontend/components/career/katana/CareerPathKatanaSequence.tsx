"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Zap } from "lucide-react";
import ParticleField, { ParticleState } from "./ParticleField";
import SlashEffect from "./SlashEffect";
import { soundEngine } from "./SoundEngine";

export interface CareerPathKatanaSequenceProps {
  isActive: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

export const KATANA_FRAMES = [
  {
    id: 1,
    src: "/assets/katana/katana-frame-01-ready.jpg",
    label: "SHEATHED // STANDBY",
    duration: 250,
    cameraScale: 1.0,
    cameraX: 0,
    blur: "none",
  },
  {
    id: 2,
    src: "/assets/katana/katana-frame-02-grip.jpg",
    label: "GRIP // COILING TENSION",
    duration: 250,
    cameraScale: 1.015,
    cameraX: -2,
    blur: "none",
  },
  {
    id: 3,
    src: "/assets/katana/katana-frame-03-draw.jpg",
    label: "⚡ RAPID UNSHEATHING ⚡",
    duration: 150,
    cameraScale: 1.03,
    cameraX: 3,
    blur: "blur(0.4px)",
  },
  {
    id: 4,
    src: "/assets/katana/katana-frame-04-full-draw.jpg",
    label: "BLADE 100% EXPOSED // PEAK DRAW",
    duration: 120,
    cameraScale: 1.045,
    cameraX: -3,
    blur: "none",
  },
  {
    id: 5,
    src: "/assets/katana/katana-frame-05-slash.jpg",
    label: "THUNDER SLASH // IMPACT",
    duration: 180,
    cameraScale: 1.06,
    cameraX: 4,
    blur: "none",
  },
];

/**
 * Preload all 5 katana animation keyframe images ahead of time
 */
export function preloadKatanaFrames() {
  if (typeof window === "undefined") return;
  KATANA_FRAMES.forEach((frame) => {
    const img = new window.Image();
    img.src = frame.src;
  });
}

export default function CareerPathKatanaSequence({
  isActive,
  onComplete,
  onCancel,
}: CareerPathKatanaSequenceProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [slashEffectState, setSlashEffectState] = useState<"idle" | "slash" | "impact" | "wipe">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCurtainSplit, setIsCurtainSplit] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasTriggeredRef = useRef(false);

  // Preload on mount
  useEffect(() => {
    preloadKatanaFrames();
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const handleFinish = useCallback(() => {
    clearAllTimers();
    onComplete();
  }, [clearAllTimers, onComplete]);

  const handleCancel = useCallback(() => {
    clearAllTimers();
    hasTriggeredRef.current = false;
    setCurrentFrameIndex(0);
    setSlashEffectState("idle");
    setIsCurtainSplit(false);
    if (onCancel) {
      onCancel();
    } else {
      onComplete();
    }
  }, [clearAllTimers, onCancel, onComplete]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Keyboard shortcut: Escape to cancel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, handleCancel]);

  // Main 5-Frame Sequential Animation Timeline
  useEffect(() => {
    if (!isActive) {
      clearAllTimers();
      hasTriggeredRef.current = false;
      setCurrentFrameIndex(0);
      setSlashEffectState("idle");
      setIsCurtainSplit(false);
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Accessibility check: prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) {
        const t = setTimeout(() => {
          handleFinish();
        }, 150);
        timersRef.current.push(t);
        return;
      }
    }

    // Safety failsafe: never leave user hanging beyond 2.4s
    const failsafeTimer = setTimeout(() => {
      handleFinish();
    }, 2400);
    timersRef.current.push(failsafeTimer);

    // ── Frame 1: Sheathed (0ms -> 250ms) ──
    setCurrentFrameIndex(0);
    soundEngine.playClick();

    // ── Frame 2: Grip Tighten & Guard Pop (250ms -> 500ms) ──
    const t1 = setTimeout(() => {
      setCurrentFrameIndex(1);
      soundEngine.playCharge();
    }, 250);
    timersRef.current.push(t1);

    // ── Frame 3: Violent Unsheathing / Blade Leaves Sheath (500ms -> 650ms) ──
    const t2 = setTimeout(() => {
      setCurrentFrameIndex(2);
      soundEngine.playKatanaDraw();
    }, 500);
    timersRef.current.push(t2);

    // ── Frame 4: Peak Full Draw / Completely Unsheathed (650ms -> 770ms) ──
    const t3 = setTimeout(() => {
      setCurrentFrameIndex(3);
    }, 650);
    timersRef.current.push(t3);

    // ── Frame 5: Explosive Horizontal Slash (770ms -> 950ms) ──
    const t4 = setTimeout(() => {
      setCurrentFrameIndex(4);
      setSlashEffectState("slash");
      soundEngine.playSlash();
    }, 770);
    timersRef.current.push(t4);

    // ── Impact Flash & Optical Shockwave (920ms) ──
    const t5 = setTimeout(() => {
      setSlashEffectState("impact");
    }, 920);
    timersRef.current.push(t5);

    // ── Screen Cut / Curtain Split into CareerPath (1050ms) ──
    const t6 = setTimeout(() => {
      setIsCurtainSplit(true);
      setSlashEffectState("wipe");
    }, 1050);
    timersRef.current.push(t6);

    // ── Complete & Navigate to CareerPath (1300ms) ──
    const t7 = setTimeout(() => {
      handleFinish();
    }, 1300);
    timersRef.current.push(t7);

    return () => {
      clearAllTimers();
    };
  }, [isActive, clearAllTimers, handleFinish]);

  if (!isActive) return null;

  const currentFrame = KATANA_FRAMES[currentFrameIndex] || KATANA_FRAMES[0];

  // Particle state mapped to action
  const particleState: ParticleState =
    currentFrameIndex === 1 || currentFrameIndex === 2
      ? "charge"
      : currentFrameIndex >= 3
      ? "burst"
      : "calm";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-[#050408] flex flex-col items-center justify-center overflow-hidden select-none touch-none">
        {/* ── Background Film Atmosphere ── */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,_rgba(30,27,75,0.5)_0%,_rgba(5,4,8,0.98)_72%)] pointer-events-none" />

        {/* ── 60 FPS Canvas Ember Particles ── */}
        <ParticleField state={particleState} />

        {/* ── Top Cinematic Anamorphic Letterbox Bar ── */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[6dvh] sm:h-[7.5dvh] bg-black/90 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-8 border-b border-white/10"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-200 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> SkillsCatalyst // CareerPath
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={handleCancel}
              aria-label="Skip animation"
              className="text-[10px] sm:text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              SKIP <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* ── Main Stage: 5-Frame Sequential Keyframe Viewer ── */}
        <div className="relative z-20 w-full max-w-[1240px] px-2 sm:px-6 flex flex-col items-center justify-center">
          {/* Action Subtitle */}
          <motion.div
            className="text-center mb-2 sm:mb-3"
            animate={{
              opacity: currentFrameIndex >= 2 ? 1 : 0.6,
              scale: currentFrameIndex >= 3 ? 1.04 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-[10px] sm:text-[12px] font-mono tracking-[0.35em] uppercase text-amber-400 font-extrabold flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              {currentFrame.label}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
          </motion.div>

          {/* ── 16:9 Cinematic Keyframe Display ── */}
          <motion.div
            className="relative w-full aspect-[16/9] max-h-[74dvh] rounded-xl sm:rounded-2xl overflow-hidden border border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.15)] bg-black"
            animate={{
              scale: isCurtainSplit ? 1.08 : currentFrame.cameraScale,
              x: currentFrame.cameraX,
            }}
            transition={{
              type: "spring",
              stiffness: currentFrameIndex >= 3 ? 500 : 350,
              damping: 25,
            }}
          >
            {/* Top Reality Curtain Split */}
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 z-30 overflow-hidden"
              animate={
                isCurtainSplit
                  ? {
                      y: "-100%",
                      opacity: [1, 0.8, 0],
                      skewX: -2,
                    }
                  : { y: 0 }
              }
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full h-[200%] top-0">
                <Image
                  src={currentFrame.src}
                  alt={`Katana Draw Frame ${currentFrame.id}`}
                  fill
                  priority
                  sizes="(max-width: 1240px) 100vw, 1240px"
                  className="object-contain sm:object-cover w-full h-full"
                />
              </div>
            </motion.div>

            {/* Bottom Reality Curtain Split */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 z-30 overflow-hidden"
              animate={
                isCurtainSplit
                  ? {
                      y: "100%",
                      opacity: [1, 0.8, 0],
                      skewX: 2,
                    }
                  : { y: 0 }
              }
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full h-[200%] -top-full">
                <Image
                  src={currentFrame.src}
                  alt={`Katana Draw Frame ${currentFrame.id}`}
                  fill
                  priority
                  sizes="(max-width: 1240px) 100vw, 1240px"
                  className="object-contain sm:object-cover w-full h-full"
                />
              </div>
            </motion.div>

            {/* Hidden Preload Elements to guarantee instant memory paint */}
            <div className="hidden" aria-hidden="true">
              {KATANA_FRAMES.map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={f.id} src={f.src} alt="" />
              ))}
            </div>

            {/* Speed Streak Lines on Frames 3, 4, 5 */}
            {currentFrameIndex >= 2 && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-50 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.2)_0%,_transparent_75%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.3] }}
                transition={{ duration: 0.15 }}
              />
            )}
          </motion.div>

          {/* Bottom Title Bar */}
          <motion.div
            className="text-center mt-2 sm:mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-slate-300">
              ENTERING CAREER ROADMAP // SHAPING YOUR PATH
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Anamorphic Letterbox Bar ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[6dvh] sm:h-[7.5dvh] bg-black/90 backdrop-blur-md z-40 flex items-center justify-center border-t border-white/10"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            {KATANA_FRAMES.map((f, idx) => (
              <div
                key={f.id}
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  idx === currentFrameIndex
                    ? "w-8 sm:w-10 bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                    : idx < currentFrameIndex
                    ? "w-3 sm:w-4 bg-amber-400/50"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Screen-Wide Thunder Slash and Optical Curtain Tear ── */}
        <SlashEffect state={slashEffectState} />
      </div>
    </AnimatePresence>
  );
}
