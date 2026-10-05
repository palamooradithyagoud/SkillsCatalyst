"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import KatanaMechanism, { DrawState } from "./KatanaMechanism";
import SwordTrail from "./SwordTrail";

interface AnimeSwordsmanProps {
  state: DrawState;
}

export default function AnimeSwordsman({ state }: AnimeSwordsmanProps) {
  const isTighten = state === "tighten";
  const isUnsheathing = state === "unsheathing";
  const isFullDraw = state === "full_draw";
  const isSlash = state === "slash" || state === "impact";
  const isCharging = isTighten || isUnsheathing;

  return (
    <div className="relative w-full max-w-[940px] aspect-[16/10] flex items-center justify-center select-none pointer-events-none">
      {/* ── Dynamic Ambient Rim Lighting (Amber & Deep Violet) ── */}
      <motion.div
        className="absolute -inset-10 rounded-full blur-[85px] pointer-events-none"
        animate={{
          background: isCharging
            ? "radial-gradient(ellipse at 50% 60%, rgba(251,191,36,0.65) 0%, rgba(245,158,11,0.3) 45%, rgba(124,58,237,0.2) 75%, transparent 100%)"
            : isSlash
            ? "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.5) 40%, transparent 80%)"
            : "radial-gradient(ellipse at 50% 60%, rgba(245,158,11,0.18) 0%, rgba(99,102,241,0.12) 50%, transparent 80%)",
          scale: isCharging ? [1, 1.15, 1.05] : isSlash ? 1.25 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* ── Virtual Camera & Body Tension Wrapper ── */}
      <motion.div
        className="relative w-full h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 1.12, y: 30, filter: "blur(10px) brightness(0.4)" }}
        animate={{
          opacity: 1,
          scale:
            isTighten
              ? 1.03
              : isUnsheathing
              ? 1.07
              : isFullDraw
              ? 1.09
              : isSlash
              ? 1.12
              : 1,
          y: isTighten ? 6 : isUnsheathing ? 2 : 0, // Body slightly lowers into drawing stance
          filter:
            state === "impact"
              ? "contrast(180%) brightness(1.7) blur(0px)"
              : isCharging
              ? "contrast(125%) brightness(1.2) blur(0px)"
              : "contrast(105%) brightness(1) blur(0px)",
          x: isCharging ? [-1.5, 1.5, -1, 1, 0] : 0,
        }}
        transition={{
          duration: isUnsheathing ? 0.22 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* ── Master Layered Vector Anime Character SVG ── */}
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 1000 680"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Skin Tone Gradient */}
            <linearGradient id="skin-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="60%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Hair Primary Golden Gradient */}
            <linearGradient id="hair-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Hair Spike Tip Orange Gradient */}
            <linearGradient id="hair-tips" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Haori Warm Amber Fabric Gradient */}
            <linearGradient id="haori-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="30%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Dark Inner Demon Slayer Uniform Gradient */}
            <linearGradient id="uniform-dark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Dramatic Eye Shadow Gradient */}
            <linearGradient id="eye-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#0F172A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </linearGradient>

            {/* Golden Eye Flash Glow */}
            <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ══════════════════════════════════════════════
              LAYER 1: OUTER HAORI (Yellow-Orange Robes)
              ══════════════════════════════════════════════ */}
          <g id="clothing-haori">
            {/* Left Shoulder Haori Wing */}
            <path
              d="M 120 480 Q 240 330 380 340 L 370 540 Q 230 520 120 480 Z"
              fill="url(#haori-yellow)"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Right Shoulder Haori Wing */}
            <path
              d="M 880 480 Q 760 330 620 340 L 630 540 Q 770 520 880 480 Z"
              fill="url(#haori-yellow)"
              stroke="#B45309"
              strokeWidth="2"
            />

            {/* Triangular Anime Pattern on Haori Shoulders */}
            <g id="haori-triangles" opacity="0.85">
              <polygon points="210,380 235,420 185,420" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="260,350 285,390 235,390" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="160,430 185,470 135,470" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="790,380 765,420 815,420" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="740,350 715,390 765,390" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="840,430 815,470 865,470" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
            </g>

            {/* Haori Center Lapels */}
            <path
              d="M 380 340 L 460 480 L 440 680 L 330 680 L 350 490 Z"
              fill="url(#haori-yellow)"
              stroke="#9A3412"
              strokeWidth="1.5"
            />
            <path
              d="M 620 340 L 540 480 L 560 680 L 670 680 L 650 490 Z"
              fill="url(#haori-yellow)"
              stroke="#9A3412"
              strokeWidth="1.5"
            />
          </g>

          {/* ══════════════════════════════════════════════
              LAYER 2: INNER UNIFORM & TORSO
              ══════════════════════════════════════════════ */}
          <g id="clothing-uniform">
            <path
              d="M 440 370 L 560 370 L 580 620 L 420 620 Z"
              fill="url(#uniform-dark)"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* White Collar Band */}
            <path d="M 460 350 L 540 350 L 545 375 L 455 375 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
            {/* Center Buttons */}
            <circle cx="500" cy="410" r="7" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="500" cy="410" r="3.5" fill="#FFFFFF" />
            <circle cx="500" cy="460" r="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
          </g>

          {/* ══════════════════════════════════════════════
              LAYER 3: HEAD, NECK & FACE
              ══════════════════════════════════════════════ */}
          <g id="head-and-face">
            {/* Neck */}
            <path d="M 468 315 L 532 315 L 540 360 L 460 360 Z" fill="url(#skin-base)" />
            <path d="M 475 325 L 525 325 L 500 355 Z" fill="#EA580C" opacity="0.3" />

            {/* Anime Jawline / Chin Base */}
            <path
              d="M 425 210 Q 420 270 455 310 L 500 338 L 545 310 Q 580 270 575 210 Z"
              fill="url(#skin-base)"
              stroke="#C2410C"
              strokeWidth="1.5"
            />

            {/* Gritted Anime Mouth */}
            <path
              d="M 476 295 Q 500 304 524 295 Q 500 299 476 295 Z"
              fill="#7C2D12"
              stroke="#431407"
              strokeWidth="1.2"
            />
            <rect x="490" y="296" width="20" height="3" rx="1" fill="#FFFFFF" opacity="0.9" />

            {/* Nose Shadow */}
            <path d="M 498 265 L 502 278 L 496 280 Z" fill="#C2410C" opacity="0.6" />

            {/* Eye Shadow Mask */}
            <path
              d="M 418 190 Q 500 185 582 190 L 575 255 Q 500 270 425 255 Z"
              fill="url(#eye-shadow)"
            />

            {/* Piercing Eye Glint (Flashes during Tighten and Unsheathe) */}
            <AnimatePresence>
              {isCharging && (
                <g filter="url(#eye-glow)">
                  <motion.path
                    d="M 445 228 Q 465 220 478 226"
                    stroke="#FDE047"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0.6, 1, 0.8] }}
                    transition={{ duration: 0.15 }}
                  />
                  <circle cx="462" cy="225" r="2.5" fill="#FFFFFF" />

                  <motion.path
                    d="M 522 226 Q 535 220 555 228"
                    stroke="#FDE047"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0.6, 1, 0.8] }}
                    transition={{ duration: 0.15, delay: 0.03 }}
                  />
                  <circle cx="538" cy="225" r="2.5" fill="#FFFFFF" />
                </g>
              )}
            </AnimatePresence>
          </g>

          {/* ══════════════════════════════════════════════
              LAYER 4: LAYERED SPIKY GOLDEN/ORANGE HAIR
              ══════════════════════════════════════════════ */}
          <g id="hair-spikes">
            <ellipse cx="500" cy="165" rx="145" ry="110" fill="url(#hair-gold)" />

            {/* Top Spikes */}
            <path d="M 480 65 L 505 130 L 465 125 Z" fill="url(#hair-gold)" />
            <path d="M 505 55 L 530 135 L 490 130 Z" fill="url(#hair-gold)" />
            <path d="M 450 78 L 475 140 L 430 135 Z" fill="url(#hair-gold)" />
            <path d="M 535 72 L 565 140 L 520 142 Z" fill="url(#hair-gold)" />

            {/* Left Hair Spikes */}
            <motion.path
              d="M 370 120 L 430 170 L 380 190 Z"
              fill="url(#hair-gold)"
              animate={isCharging ? { rotate: [-1, 2, -1] } : {}}
              transition={{ duration: 0.12, repeat: Infinity }}
              style={{ originX: "430px", originY: "170px" }}
            />
            <path d="M 340 160 L 415 195 L 360 225 Z" fill="url(#hair-gold)" />
            <path d="M 320 210 L 405 230 L 350 265 Z" fill="url(#hair-tips)" />
            <path d="M 345 260 L 420 265 L 370 310 Z" fill="url(#hair-tips)" />
            <path d="M 390 290 L 440 280 L 405 335 Z" fill="url(#hair-tips)" />

            {/* Right Hair Spikes */}
            <motion.path
              d="M 630 120 L 570 170 L 620 190 Z"
              fill="url(#hair-gold)"
              animate={isCharging ? { rotate: [1, -2, 1] } : {}}
              transition={{ duration: 0.12, repeat: Infinity }}
              style={{ originX: "570px", originY: "170px" }}
            />
            <path d="M 660 160 L 585 195 L 640 225 Z" fill="url(#hair-gold)" />
            <path d="M 680 210 L 595 230 L 650 265 Z" fill="url(#hair-tips)" />
            <path d="M 655 260 L 580 265 L 630 310 Z" fill="url(#hair-tips)" />
            <path d="M 610 290 L 560 280 L 595 335 Z" fill="url(#hair-tips)" />

            {/* Fringe & Bangs */}
            <path d="M 435 155 L 452 230 L 440 225 Z" fill="url(#hair-tips)" />
            <path d="M 455 160 L 478 245 L 465 240 Z" fill="url(#hair-gold)" />
            <path d="M 480 165 L 498 250 L 488 245 Z" fill="url(#hair-tips)" />
            <path d="M 502 165 L 512 250 L 522 245 Z" fill="url(#hair-gold)" />
            <path d="M 525 160 L 545 245 L 535 240 Z" fill="url(#hair-tips)" />
            <path d="M 548 155 L 568 230 L 555 225 Z" fill="url(#hair-tips)" />
          </g>

          {/* ══════════════════════════════════════════════
              LAYER 5: FOREARMS (Left arm steady, Right arm extends)
              ══════════════════════════════════════════════ */}
          <g id="forearms">
            {/* Left Forearm connected to sheath grip */}
            <path
              d="M 230 460 Q 290 480 345 470 L 350 495 Q 260 505 210 490 Z"
              fill="url(#skin-base)"
              stroke="#C2410C"
              strokeWidth="1.2"
            />
            {/* Right Forearm extends rightward with handle */}
            <motion.path
              d="M 770 460 Q 700 480 500 470 L 505 495 Q 710 505 760 490 Z"
              fill="url(#skin-base)"
              stroke="#C2410C"
              strokeWidth="1.2"
              animate={
                isSlash
                  ? { x: 380, rotate: 12 }
                  : isFullDraw
                  ? { x: 260, rotate: 6 }
                  : isUnsheathing
                  ? { x: 220, rotate: 4 }
                  : isTighten
                  ? { x: 12 }
                  : { x: 0 }
              }
              transition={{
                duration: isSlash ? 0.12 : isUnsheathing ? 0.24 : 0.15,
                ease: [0.12, 0.98, 0.22, 1],
              }}
            />
          </g>

          {/* ══════════════════════════════════════════════
              LAYER 6: PHYSICAL MECHANICAL KATANA & HANDS
              ══════════════════════════════════════════════ */}
          <KatanaMechanism state={state} />
        </svg>

        {/* ── Motion Trail Afterimages on Explosive Draw ── */}
        <SwordTrail isDrawn={isUnsheathing || isFullDraw || isSlash} />
      </motion.div>
    </div>
  );
}
