"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import CinematicOverlay, { CinematicSequenceState } from "./CinematicOverlay";
import { soundEngine } from "./SoundEngine";

interface CareerPathTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function CareerPathTransition({
  isActive,
  onComplete,
  onCancel,
}: CareerPathTransitionProps) {
  const [state, setState] = useState<CinematicSequenceState>("sheathed");
  const [isMuted, setIsMuted] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasTriggeredRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const handleFinish = useCallback(() => {
    clearAllTimers();
    setState("complete");
    onComplete();
  }, [clearAllTimers, onComplete]);

  const handleCancel = useCallback(() => {
    clearAllTimers();
    setState("sheathed");
    hasTriggeredRef.current = false;
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, handleCancel]);

  useEffect(() => {
    if (!isActive) {
      clearAllTimers();
      setState("sheathed");
      hasTriggeredRef.current = false;
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
        }, 120);
        timersRef.current.push(t);
        return;
      }
    }

    // ── Genuine Physical Katana Draw Timeline (~1.48s Total) ──
    soundEngine.playClick();
    setState("sheathed"); // 0ms: Initial pose, sword 100% sheathed, no blade exposed

    // Phase 1: Hands Tighten & Left Thumb pops Tsuba guard (220ms)
    timersRef.current.push(
      setTimeout(() => {
        setState("tighten");
        soundEngine.playCharge();
      }, 220)
    );

    // Phase 2: Rapid Unsheathing - Blade actively slides OUT of sheath (360ms)
    timersRef.current.push(
      setTimeout(() => {
        setState("unsheathing");
        soundEngine.playKatanaDraw();
      }, 360)
    );

    // Phase 3: Blade Completely Clears Sheath - Full Draw (680ms)
    timersRef.current.push(
      setTimeout(() => {
        setState("full_draw");
      }, 680)
    );

    // Phase 4: Character Swings Sword & Slashes (760ms, after 80ms pause)
    timersRef.current.push(
      setTimeout(() => {
        setState("slash");
        soundEngine.playSlash();
      }, 760)
    );

    // Phase 5: Optical Impact Flash & Screen Shake (920ms)
    timersRef.current.push(
      setTimeout(() => {
        setState("impact");
        soundEngine.playImpact();
      }, 920)
    );

    // Phase 6: Sliced Reality Curtain Split (1050ms)
    timersRef.current.push(
      setTimeout(() => {
        setState("reveal");
      }, 1050)
    );

    // Phase 7: Sequence Complete & Open CareerPath (1450ms)
    timersRef.current.push(
      setTimeout(() => {
        handleFinish();
      }, 1450)
    );

    // Watchdog Failsafe Timer (2400ms)
    timersRef.current.push(
      setTimeout(() => {
        handleFinish();
      }, 2400)
    );

    return () => {
      clearAllTimers();
    };
  }, [isActive, clearAllTimers, handleFinish]);

  if (!isActive && state === "sheathed") return null;

  return (
    <AnimatePresence>
      {isActive && (
        <CinematicOverlay
          state={state}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onCancel={handleCancel}
        />
      )}
    </AnimatePresence>
  );
}
