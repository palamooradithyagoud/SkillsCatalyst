"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function GlowingButterfly() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Graceful fallback for reduced motion: stationary small glowing butterfly in corner
  if (shouldReduceMotion) {
    return (
      <div
        className="fixed top-8 right-8 z-30 pointer-events-none select-none opacity-80"
        aria-hidden="true"
      >
        <ButterflyGraphic />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Macro Flight Trajectory: Wanders gracefully across viewport ── */}
      <motion.div
        className="absolute w-12 h-12 flex items-center justify-center"
        initial={{
          x: "15vw",
          y: "28vh",
          rotate: -10,
        }}
        animate={{
          x: [
            "15vw",
            "34vw",
            "56vw",
            "76vw",
            "84vw",
            "64vw",
            "42vw",
            "22vw",
            "15vw",
          ],
          y: [
            "28vh",
            "16vh",
            "30vh",
            "18vh",
            "50vh",
            "70vh",
            "56vh",
            "66vh",
            "28vh",
          ],
          rotate: [
            -10,
            24,
            36,
            -12,
            68,
            140,
            -155,
            -75,
            -10,
          ],
          scale: [
            0.88,
            0.98,
            0.84,
            0.96,
            1.02,
            0.88,
            0.96,
            0.86,
            0.88,
          ],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* ── High-frequency Wing Flutter & Flight Bob ── */}
        <motion.div
          animate={{
            y: [-3, 3, -3],
            x: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 0.36,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center"
        >
          <ButterflyGraphic />
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * 3D Fluttering Butterfly with Vibrant #0000FF Blue Glow
 */
function ButterflyGraphic() {
  return (
    <div className="relative flex items-center justify-center [perspective:600px]">
      {/* ── Ambient Radial #0000FF Glow Halo ── */}
      <div
        className="absolute -inset-4 rounded-full pointer-events-none animate-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 0, 255, 0.6) 0%, rgba(0, 0, 255, 0.35) 42%, rgba(0, 0, 255, 0.12) 65%, transparent 75%)",
          filter: "blur(6px)",
          transform: "scale(1.2)",
        }}
      />

      {/* ── 3D Butterfly Container with Multi-layer #0000FF Glow Filter ── */}
      <div
        className="relative flex items-center justify-center [transform-style:preserve-3d]"
        style={{
          filter:
            "drop-shadow(0 0 6px #0000FF) drop-shadow(0 0 12px #0000FF) drop-shadow(0 0 24px rgba(0, 0, 255, 0.9)) drop-shadow(0 0 40px rgba(0, 0, 255, 0.6))",
        }}
      >
        {/* ── LEFT WING (Flaps in 3D along Y-axis from right origin) ── */}
        <div
          className="relative origin-right"
          style={{
            animation: "butterflyFlapLeft 0.32s infinite ease-in-out alternate",
            transformOrigin: "100% 50%",
          }}
        >
          <svg
            width="22"
            height="34"
            viewBox="0 0 40 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible block"
          >
            {/* Upper Left Wing Outer Lobe */}
            <path
              d="M 38,24 C 30,8 14,4 6,16 C 0,25 4,38 20,42 C 32,44 36,34 38,28 Z"
              fill="url(#blueWingGradLeft)"
              stroke="#0000FF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Upper Left Wing Inner Highlight */}
            <path
              d="M 22,18 C 16,12 10,20 12,28 C 14,33 24,35 28,30 C 31,24 26,22 22,18 Z"
              fill="url(#blueInnerHighlight)"
              opacity="0.85"
            />

            {/* Lower Left Wing Outer Lobe */}
            <path
              d="M 36,34 C 28,40 14,44 16,54 C 18,62 28,62 34,52 C 37,47 38,40 38,36 Z"
              fill="url(#blueWingGradLeft)"
              stroke="#0000FF"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Lower Left Wing Inner Highlight */}
            <path
              d="M 24,46 C 20,48 20,54 24,58 C 27,60 31,56 30,50 C 29,46 26,45 24,46 Z"
              fill="url(#blueInnerHighlight)"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* ── CENTER BODY & ANTENNAE ── */}
        <div className="relative z-10 -mx-[2px]">
          <svg
            width="10"
            height="34"
            viewBox="0 0 16 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible block"
          >
            <defs>
              {/* #0000FF Blue Wing Gradient */}
              <linearGradient id="blueWingGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#0000FF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0000AA" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="blueWingGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#0000FF" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0000AA" stopOpacity="0.95" />
              </linearGradient>
              {/* Inner Glowing Highlight */}
              <linearGradient id="blueInnerHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0000FF" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Left Antenna */}
            <path
              d="M 7,16 Q 3,6 -2,7"
              stroke="#93C5FD"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="-2" cy="7" r="1.3" fill="#0000FF" />

            {/* Right Antenna */}
            <path
              d="M 9,16 Q 13,6 18,7"
              stroke="#93C5FD"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="18" cy="7" r="1.3" fill="#0000FF" />

            {/* Head */}
            <circle cx="8" cy="18" r="2.8" fill="#BFDBFE" />

            {/* Thorax */}
            <ellipse cx="8" cy="27" rx="2.4" ry="5.5" fill="#2563EB" />

            {/* Abdomen */}
            <ellipse cx="8" cy="40" rx="1.8" ry="8" fill="#0000FF" />
          </svg>
        </div>

        {/* ── RIGHT WING (Flaps in 3D along Y-axis from left origin) ── */}
        <div
          className="relative origin-left"
          style={{
            animation: "butterflyFlapRight 0.32s infinite ease-in-out alternate",
            transformOrigin: "0% 50%",
          }}
        >
          <svg
            width="22"
            height="34"
            viewBox="0 0 40 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible block"
          >
            {/* Upper Right Wing Outer Lobe */}
            <path
              d="M 2,24 C 10,8 26,4 34,16 C 40,25 36,38 20,42 C 8,44 4,34 2,28 Z"
              fill="url(#blueWingGradRight)"
              stroke="#0000FF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Upper Right Wing Inner Highlight */}
            <path
              d="M 18,18 C 24,12 30,20 28,28 C 26,33 16,35 12,30 C 9,24 14,22 18,18 Z"
              fill="url(#blueInnerHighlight)"
              opacity="0.85"
            />

            {/* Lower Right Wing Outer Lobe */}
            <path
              d="M 4,34 C 12,40 26,44 24,54 C 22,62 12,62 6,52 C 3,47 2,40 2,36 Z"
              fill="url(#blueWingGradRight)"
              stroke="#0000FF"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Lower Right Wing Inner Highlight */}
            <path
              d="M 16,46 C 20,48 20,54 16,58 C 13,60 9,56 10,50 C 11,46 14,45 16,46 Z"
              fill="url(#blueInnerHighlight)"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* ── Keyframe styles for 3D Wing Flapping ── */}
      <style jsx global>{`
        @keyframes butterflyFlapLeft {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(72deg) rotateZ(-6deg);
          }
        }
        @keyframes butterflyFlapRight {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(-72deg) rotateZ(6deg);
          }
        }
      `}</style>
    </div>
  );
}
