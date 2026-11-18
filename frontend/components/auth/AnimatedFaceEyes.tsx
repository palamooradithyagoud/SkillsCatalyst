"use client";

import React, { useState, useEffect, useRef } from "react";

interface EyeProps {
  isClosed: boolean;
  size: number;
}

function Eye({ isClosed, size }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  const eyeW = Math.round(size * 1.45); // e.g. 44px
  const eyeH = size;                   // e.g. 30px
  const pupilR = Math.round(size * 0.52); // e.g. 16px
  const maxTravelX = size * 0.22;
  const maxTravelY = size * 0.18;

  // Track mouse coordinates across the screen
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!eyeRef.current || isClosed) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const clampX = Math.min(maxTravelX / dist, 1);
      const clampY = Math.min(maxTravelY / dist, 1);
      setPupil({ x: dx * clampX, y: dy * clampY });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isClosed, size]);

  // When closing, smoothly snap pupil back to center
  useEffect(() => {
    if (isClosed) {
      setPupil({ x: 0, y: 0 });
    }
  }, [isClosed]);

  return (
    <div
      ref={eyeRef}
      className="relative select-none pointer-events-none flex items-center justify-center"
      style={{
        width: eyeW,
        height: eyeH,
      }}
    >
      {/* ── STATE 1: OPEN EYE (White eyeball with pupil tracking cursor) ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: eyeH * 0.5,
          background: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
          opacity: isClosed ? 0 : 1,
          transform: isClosed ? "scaleY(0.1)" : "scaleY(1)",
          transition: "opacity 0.18s ease-in-out, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center center",
        }}
      >
        {/* Pupil with Specular Catchlight */}
        <div
          style={{
            position: "absolute",
            width: pupilR,
            height: pupilR,
            borderRadius: "50%",
            background: "#111111",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))`,
            transition: isClosed ? "transform 0.15s ease" : "transform 0.04s linear",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: pupilR * 0.32,
              height: pupilR * 0.32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.8)",
              top: "14%",
              left: "18%",
            }}
          />
        </div>
      </div>

      {/* ── STATE 2: CLOSED EYE (Graceful curved sleeping/shy eyelid line) ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: isClosed ? 1 : 0,
          transform: isClosed ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.2s ease-in-out, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <svg
          width={eyeW}
          height={eyeH}
          viewBox={`0 0 ${eyeW} ${eyeH}`}
          fill="none"
          className="overflow-visible"
        >
          {/* Expressive closed eyelid arc */}
          <path
            d={`M ${eyeW * 0.14},${eyeH * 0.62} Q ${eyeW * 0.5},${eyeH * 0.28} ${eyeW * 0.86},${eyeH * 0.62}`}
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))",
            }}
          />
        </svg>
      </div>
    </div>
  );
}

interface AnimatedFaceEyesProps {
  isPasswordFocused?: boolean;
  size?: number;
  bgColor?: string;
  className?: string;
}

/**
 * Animated Face Eyes Component
 * Implements Framer interactive eyes:
 * - When open: Tracks cursor movement across the viewport with pupil catchlights.
 * - When password focused / closed: Smoothly transitions into clean, expressive curved closed eyelid arcs without black hole/halo artifacts.
 */
export default function AnimatedFaceEyes({
  isPasswordFocused = false,
  size = 30,
  className = "",
}: AnimatedFaceEyesProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic natural blink
  useEffect(() => {
    if (isPasswordFocused) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4200 + Math.random() * 2200);

    return () => clearInterval(interval);
  }, [isPasswordFocused]);

  const effectiveClosed = isPasswordFocused || isBlinking;

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{
        gap: size * 0.45,
      }}
      aria-hidden="true"
    >
      <Eye isClosed={effectiveClosed} size={size} />
      <Eye isClosed={effectiveClosed} size={size} />
    </div>
  );
}
