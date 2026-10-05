"use client";

import React from "react";
import { motion } from "framer-motion";

export type DrawState =
  | "sheathed"
  | "tighten"
  | "unsheathing"
  | "full_draw"
  | "slash"
  | "impact";

interface KatanaMechanismProps {
  state: DrawState;
}

export default function KatanaMechanism({ state }: KatanaMechanismProps) {
  // Mechanical constants in SVG coordinate space (ViewBox: 0 0 1000 680)
  // Sheath Mouth (Koiguchi) is at X = 420, Y = 460
  // Blade Length = 290px
  // When sheathed, Handle is at X = 425 (right against sheath mouth)
  // When unsheathing, Handle moves from X = 425 -> X = 745 (travel = 320px)

  const isTightening = state === "tighten";
  const isUnsheathing = state === "unsheathing";
  const isFullDraw = state === "full_draw";
  const isSlash = state === "slash" || state === "impact";

  // Calculate handle travel offset (X translation)
  // 0 = fully sheathed, 320 = blade tip fully cleared the sheath
  const handleOffsetX =
    state === "sheathed"
      ? 0
      : state === "tighten"
      ? 12 // Popping the guard 12px out of the sheath mouth! (Koiguchi pop)
      : state === "unsheathing"
      ? 280 // Blade is sliding out fast
      : state === "full_draw"
      ? 330 // Blade is completely exposed outside the sheath
      : 480; // Slashed forward

  // Sheath recoil (moves slightly left as sword is pulled right)
  const sheathOffsetX =
    state === "sheathed"
      ? 0
      : state === "tighten"
      ? -3
      : state === "unsheathing"
      ? -18
      : state === "full_draw"
      ? -22
      : -15;

  return (
    <g id="katana-mechanism">
      <defs>
        {/* Mirror Steel Blade Gradient */}
        <linearGradient id="mech-blade-steel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F1F5F9" />
          <stop offset="60%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Razor Edge Hamon & Lightning Glint */}
        <linearGradient id="mech-blade-edge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
        </linearGradient>

        {/* White Lacquer Sheath Gradient */}
        <linearGradient id="mech-sheath" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Traditional Brass / Gold Fittings */}
        <linearGradient id="mech-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Tsuba Guard Glow Filter */}
        <filter id="mech-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 
          CRITICAL PHYSICAL CLIP PATH:
          Only renders the blade when it has physically EXITED the sheath mouth (X >= 420).
          Anything to the left of the sheath mouth remains clipped/inside the sheath!
        */}
        <clipPath id="outside-sheath-clip">
          {/* This clip box starts precisely at the sheath mouth and extends infinitely to the right */}
          <rect x="420" y="420" width="1000" height="100" />
        </clipPath>
      </defs>

      {/* ══════════════════════════════════════════════════════
          1. SHEATH (Saya) - Stays on the left, held by left hand
          ══════════════════════════════════════════════════════ */}
      <motion.g
        id="sheath-group"
        animate={{
          x: sheathOffsetX,
          rotate: isSlash ? -1.5 : 0,
        }}
        transition={{
          duration: isUnsheathing ? 0.22 : 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Scabbard Body (Lacquer White) - Extends from X = 135 to X = 420 */}
        <path
          d="M 135 452 C 128 454 128 466 135 468 L 418 468 L 418 452 Z"
          fill="url(#mech-sheath)"
          stroke="#94A3B8"
          strokeWidth="1.2"
        />
        {/* Sheath Chrome Spine Reflection */}
        <line x1="145" y1="460" x2="415" y2="460" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />

        {/* Kojiri (Brass Tip on Far Left) */}
        <path
          d="M 134 452 C 128 454 128 466 134 468 L 150 468 L 150 452 Z"
          fill="url(#mech-gold)"
        />

        {/* Koiguchi (Brass Mouth Collar at X = 412..420) */}
        <rect
          x="412"
          y="449"
          width="10"
          height="22"
          rx="2"
          fill="url(#mech-gold)"
          stroke="#78350F"
          strokeWidth="1"
        />

        {/* ── LEFT HAND: Firmly clasps sheath mouth and pushes guard ── */}
        <g id="left-hand-grip">
          {/* Hand Palm wrapped around scabbard */}
          <rect x="350" y="445" width="55" height="52" rx="8" fill="url(#skin-base)" stroke="#9A3412" strokeWidth="1.2" />
          {/* Fingers 1 to 4 */}
          <rect x="355" y="450" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="355" y="461" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="355" y="472" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="355" y="483" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />

          {/* Left Thumb: Tightly positioned on scabbard top */}
          <motion.path
            d="M 390 440 Q 412 443 416 453 L 396 454 Z"
            fill="url(#skin-base)"
            stroke="#9A3412"
            strokeWidth="1"
            animate={
              isTightening || isUnsheathing
                ? { x: 4, scale: 1.05 } // Thumb actively nudging tsuba
                : { x: 0, scale: 1 }
            }
            transition={{ duration: 0.12 }}
          />
        </g>
      </motion.g>

      {/* ══════════════════════════════════════════════════════
          2. THE BLADE (Fixed to Handle, Slides out through Sheath Mouth)
          ══════════════════════════════════════════════════════ */}
      <motion.g
        id="blade-moving-unit"
        animate={{
          x: handleOffsetX,
          rotate: isSlash ? 22 : 0,
        }}
        transition={{
          duration: isSlash ? 0.12 : isUnsheathing ? 0.24 : isTightening ? 0.1 : 0.2,
          ease: [0.12, 0.98, 0.22, 1], // Explosive instant draw curve
        }}
        style={{ originX: "425px", originY: "460px" }}
      >
        {/*
          THE PHYSICAL BLADE ITSELF:
          Extends backwards from the Tsuba Guard at X = 425 to X = 135 (Length = 290px).
          When sheathed (x=0), the entire blade is to the left of X=420, so it is INSIDE the sheath!
          As the unit moves right, the portion of the blade that passes X=420 emerges into the open!
        */}
        <g clipPath="url(#outside-sheath-clip)">
          {/* Habaki (Blade Brass Collar connecting blade to tsuba) */}
          <rect x="415" y="451" width="12" height="18" rx="1.5" fill="url(#mech-gold)" stroke="#78350F" strokeWidth="0.8" />

          {/* Polished Mirror Steel Blade (Blade curve and taper) */}
          <path
            d="M 135 453 L 415 453 L 415 467 L 165 467 Q 140 466 135 453 Z"
            fill="url(#mech-blade-steel)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
          />

          {/* Razor Cutting Edge (Hamon Line with electric gleam) */}
          <path
            d="M 135 453 L 415 453"
            stroke="url(#mech-blade-edge)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Shinogi Ridge Mirror Highlight */}
          <line x1="150" y1="460" x2="415" y2="460" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.95" />

          {/* Blade Exit Sparkle Reflection (Glides down the blade as it emerges) */}
          {(isUnsheathing || isFullDraw) && (
            <motion.ellipse
              cx="428"
              cy="458"
              rx="6"
              ry="10"
              fill="#FFFFFF"
              filter="url(#mech-glow)"
              animate={{ opacity: [0.4, 1, 0.7] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
          )}
        </g>

        {/* ══════════════════════════════════════════════════════
            3. GUARD (Tsuba), HANDLE (Tsuka), & RIGHT HAND
            ══════════════════════════════════════════════════════ */}
        {/* Tsuba (Golden Disc Guard at X = 425) */}
        <ellipse
          cx="425"
          cy="460"
          rx="6"
          ry="24"
          fill="url(#mech-gold)"
          stroke="#78350F"
          strokeWidth="1.5"
          filter="url(#mech-glow)"
        />
        <ellipse cx="425" cy="460" rx="3" ry="14" fill="#92400E" opacity="0.6" />

        {/* Tsuka (Handle Core from X = 428 to X = 595) */}
        <rect x="428" y="453" width="168" height="14" rx="2" fill="#0F172A" />

        {/* Diamond Ito Braided Handle Wrap Pattern */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const hx = 434 + idx * 18;
          return (
            <g key={idx}>
              <polygon
                points={`${hx},460 ${hx + 8},454 ${hx + 16},460 ${hx + 8},466`}
                fill="url(#mech-gold)"
                stroke="#78350F"
                strokeWidth="0.8"
              />
              <circle cx={hx + 8} cy={460} r="1.3" fill="#FFFFFF" opacity="0.85" />
            </g>
          );
        })}

        {/* Kashira (Handle Pommel Cap on Right) */}
        <path
          d="M 596 452 C 602 454 604 466 596 468 Z"
          fill="url(#mech-gold)"
          stroke="#78350F"
          strokeWidth="1"
        />

        {/* Hanging Knot Tassel */}
        <motion.path
          d="M 600 462 Q 618 474 628 468"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="2.2"
          strokeLinecap="round"
          animate={isSlash ? { d: "M 600 462 Q 635 486 655 464" } : {}}
          transition={{ duration: 0.15 }}
        />

        {/* ── RIGHT HAND: Clenched tightly around the Handle, pulls right ── */}
        <g id="right-hand-grip">
          {/* Hand Palm wrapped around Tsuka diamonds */}
          <rect x="440" y="445" width="56" height="52" rx="8" fill="url(#skin-base)" stroke="#9A3412" strokeWidth="1.2" />
          {/* Fingers 1 to 4 */}
          <rect x="445" y="450" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="445" y="461" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="445" y="472" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />
          <rect x="445" y="483" width="46" height="9" rx="3" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.8" />

          {/* Right Thumb wrapped across handle top */}
          <path d="M 444 440 Q 424 444 422 454 L 444 454 Z" fill="url(#skin-base)" stroke="#9A3412" strokeWidth="1" />
        </g>

        {/* Blade Tip Flare when blade fully exits sheath */}
        {isFullDraw && (
          <motion.circle
            cx="135"
            cy="460"
            r="18"
            fill="#FFFFFF"
            filter="url(#mech-glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.15 }}
          />
        )}
      </motion.g>

      {/* ══════════════════════════════════════════════════════
          4. ELECTRIC CHARGE ARCS (Right at Sheath Opening)
          ══════════════════════════════════════════════════════ */}
      {(isTightening || isUnsheathing) && (
        <g id="electric-mouth-discharge">
          <motion.path
            d="M 412 438 L 424 450 L 416 468 L 428 480"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            filter="url(#mech-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.3, 1, 0] }}
            transition={{ duration: 0.08, repeat: Infinity }}
          />
          <motion.path
            d="M 426 432 L 434 452 L 420 464 L 430 484"
            fill="none"
            stroke="#FDE047"
            strokeWidth="2.5"
            filter="url(#mech-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.2, 1, 0] }}
            transition={{ duration: 0.1, repeat: Infinity, delay: 0.03 }}
          />
        </g>
      )}
    </g>
  );
}
