"use client";

import React from "react";

export const OUTER_FLAME_PATH =
  "M110 12 C105 52 84 67 62 91 C55 73 55 66 55 57 C43 77 14 107 12 151 C8 202 48 236 110 237 C172 236 212 202 208 151 C206 115 185 86 165 68 C168 92 158 104 150 110 C160 72 145 43 110 12Z";

export const INNER_FLAME_PATH =
  "M110 23 C104 62 88 76 70 99 C64 91 62 86 60 78 C48 101 26 123 26 157 C25 198 58 222 109 224 C157 224 192 199 193 161 C194 132 179 108 164 91 C163 108 154 120 146 124 C151 91 139 57 110 23Z";

export const INNER_LICK_1 =
  "M104 145 C91 130 101 111 111 91 C110 111 130 119 124 135 C121 141 113 145 104 145Z";

export const INNER_LICK_2 =
  "M143 139 C134 127 143 111 151 98 C150 112 163 120 158 132 C155 137 149 139 143 139Z";

interface AnimatedFlameMascotProps {
  className?: string;
  size?: number;
  celebrating?: boolean;
}

const FLAME_CSS = `
  .flame-mascot-stage {
    position: relative;
    width: 220px;
    height: 220px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    isolation: isolate;
  }
  .flame-glow {
    position: absolute;
    z-index: -1;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: #ff9c32;
    filter: blur(48px);
    opacity: 0.28;
    animation: flameGlow 2.4s ease-in-out infinite alternate;
  }
  .flame-wrap {
    width: 190px;
    transform-origin: 50% 88%;
    filter: drop-shadow(0 12px 18px rgba(255, 107, 22, 0.4));
    animation: flameBob 2.35s ease-in-out infinite;
  }
  .flame-svg {
    display: block;
    width: 100%;
    overflow: visible;
  }
  .flame-shape {
    transform-origin: 50% 90%;
    animation: flameFlicker 1.1s ease-in-out infinite alternate;
  }
  .inner-lick {
    transform-box: fill-box;
    transform-origin: 50% 95%;
    animation: flameLick 0.72s ease-in-out infinite alternate;
  }
  .inner-lick.secondary {
    animation-delay: -0.31s;
    animation-duration: 0.94s;
  }
  .eye {
    transform-box: fill-box;
    transform-origin: center;
    animation: flameBlink 5.3s infinite;
  }
  .eye.right {
    animation-delay: 0.08s;
  }
  .spark {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 2px 5px 2px 5px;
    background: #ffb52e;
    opacity: 0;
    filter: drop-shadow(0 0 5px rgba(255, 164, 33, 0.85));
    animation: flameDrift 2.8s ease-out infinite;
  }
  .spark.s1 {
    top: 53px;
    left: 37px;
    animation-delay: 0.3s;
  }
  .spark.s2 {
    top: 83px;
    right: 27px;
    width: 5px;
    height: 5px;
    animation-delay: 1.45s;
  }
  .spark.s3 {
    top: 34px;
    right: 57px;
    width: 4px;
    height: 4px;
    animation-delay: 2.05s;
  }

  .celebrating .flame-wrap {
    animation: flameCelebrate 0.72s cubic-bezier(0.2, 0.8, 0.25, 1) 2;
  }
  .celebrating .flame-glow {
    animation: flameGlowPop 0.72s ease-out 2;
  }
  .celebrating .spark {
    animation: flameBurst 0.85s ease-out both;
  }

  @keyframes flameBob {
    0%, 100% {
      transform: translateY(1px) rotate(-1deg);
    }
    50% {
      transform: translateY(-7px) rotate(1deg);
    }
  }

  @keyframes flameFlicker {
    0% {
      transform: translateX(-2px) scaleX(1) scaleY(1) skewX(-1deg) rotate(-0.5deg);
    }
    36% {
      transform: translateX(1px) scaleX(0.96) scaleY(1.045) skewX(1.5deg) rotate(0.5deg);
    }
    70% {
      transform: translateX(-1px) scaleX(1.035) scaleY(0.98) skewX(-1.2deg) rotate(-0.3deg);
    }
    100% {
      transform: translateX(1px) scaleX(0.985) scaleY(1.025) skewX(0.8deg) rotate(0.7deg);
    }
  }

  @keyframes flameLick {
    0% {
      transform: scaleX(0.72) scaleY(0.78) translateY(5px);
      opacity: 0.28;
    }
    55% {
      transform: scaleX(1.08) scaleY(1.12) translateY(-2px);
      opacity: 0.68;
    }
    100% {
      transform: scaleX(0.86) scaleY(0.92) translateY(-5px);
      opacity: 0.44;
    }
  }

  @keyframes flameGlow {
    from {
      transform: scale(0.9);
      opacity: 0.18;
    }
    to {
      transform: scale(1.15);
      opacity: 0.35;
    }
  }

  @keyframes flameBlink {
    0%, 43%, 46%, 80%, 83%, 100% {
      transform: scaleY(1);
    }
    44.5%, 81.5% {
      transform: scaleY(0.08);
    }
  }

  @keyframes flameDrift {
    0%, 12% {
      transform: translate(0, 12px) scale(0.35) rotate(0);
      opacity: 0;
    }
    32% {
      opacity: 0.85;
    }
    75% {
      transform: translate(10px, -33px) scale(1) rotate(65deg);
      opacity: 0.7;
    }
    100% {
      transform: translate(13px, -48px) scale(0.5) rotate(100deg);
      opacity: 0;
    }
  }

  @keyframes flameCelebrate {
    0%, 100% {
      transform: translateY(0) scale(1) rotate(0);
    }
    38% {
      transform: translateY(-23px) scale(1.1, 0.94) rotate(-5deg);
    }
    68% {
      transform: translateY(0) scale(0.94, 1.08) rotate(4deg);
    }
  }

  @keyframes flameGlowPop {
    0%, 100% {
      transform: scale(1);
      opacity: 0.2;
    }
    45% {
      transform: scale(1.5);
      opacity: 0.48;
    }
  }

  @keyframes flameBurst {
    0% {
      transform: translate(0, 12px) scale(0.3) rotate(0);
      opacity: 0;
    }
    28% {
      opacity: 1;
    }
    100% {
      transform: translate(8px, -74px) scale(1.1) rotate(110deg);
      opacity: 0;
    }
  }
`;

export default function AnimatedFlameMascot({
  className = "",
  size = 220,
  celebrating = false,
}: AnimatedFlameMascotProps) {
  const scale = size / 220;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className} ${
        celebrating ? "celebrating" : ""
      }`}
      style={{
        width: size,
        height: size,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FLAME_CSS }} />

      <div className="flame-mascot-stage">
        {/* Ambient Glowing Aura */}
        <div className="flame-glow" />

        {/* Floating Sparks / Embers */}
        <i className="spark s1" />
        <i className="spark s2" />
        <i className="spark s3" />

        {/* Dynamic Animated Flame Mascot */}
        <div className="flame-wrap">
          <svg
            className="flame-svg"
            viewBox="0 0 220 250"
            role="img"
            aria-label="A smiling orange flame mascot"
          >
            <defs>
              <linearGradient
                id="flameFill"
                x1=".15"
                y1=".9"
                x2=".83"
                y2=".08"
              >
                <stop offset="0" stopColor="#ff9a16" />
                <stop offset=".55" stopColor="#ff7418" />
                <stop offset="1" stopColor="#ff5316" />
              </linearGradient>
              <linearGradient id="flameInner" x1=".1" y1="1" x2=".8" y2="0">
                <stop offset="0" stopColor="#ffbd45" stopOpacity=".62" />
                <stop offset="1" stopColor="#ffd66c" stopOpacity=".06" />
              </linearGradient>
            </defs>

            {/* Flame Silhouette Body + Licking Inner Flames */}
            <g className="flame-shape">
              <path
                d={OUTER_FLAME_PATH}
                fill="url(#flameFill)"
                stroke="#ef6513"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d={INNER_FLAME_PATH}
                fill="url(#flameInner)"
                opacity=".85"
              />
              <path
                className="inner-lick"
                d={INNER_LICK_1}
                fill="#ffe08a"
                opacity=".55"
              />
              <path
                className="inner-lick secondary"
                d={INNER_LICK_2}
                fill="#ffd36a"
                opacity=".42"
              />
            </g>

            {/* Kawaii Eyes with Specular Highlights and Synchronized Blinking */}
            <g className="eye">
              <ellipse cx="72" cy="169" rx="22" ry="25" fill="#fff9ee" />
              <ellipse cx="74" cy="171" rx="15" ry="17" fill="#17191c" />
              <ellipse cx="69" cy="165" rx="5" ry="6" fill="white" />
            </g>
            <g className="eye right">
              <ellipse cx="148" cy="169" rx="22" ry="25" fill="#fff9ee" />
              <ellipse cx="146" cy="171" rx="15" ry="17" fill="#17191c" />
              <ellipse cx="141" cy="165" rx="5" ry="6" fill="white" />
            </g>

            {/* Adorable Rounded Curved Smile */}
            <path
              d="M95 188 C100 196 119 196 125 188"
              fill="none"
              stroke="#342317"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function MiniFlameMascot({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const height = size * (250 / 220);
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .mini-flame-bob {
              transform-origin: 50% 90%;
              animation: miniFlameBob 2.4s ease-in-out infinite;
            }
            @keyframes miniFlameBob {
              0%, 100% { transform: translateY(0) rotate(-1deg); }
              50% { transform: translateY(-2px) rotate(1deg); }
            }
          `,
        }}
      />
      <div className="mini-flame-bob">
        <svg
          viewBox="0 0 220 250"
          width={size}
          height={height}
          role="img"
          aria-label="Streak flame mascot"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="miniFlameFill" x1=".15" y1=".9" x2=".83" y2=".08">
              <stop offset="0" stopColor="#ff9a16" />
              <stop offset=".55" stopColor="#ff7418" />
              <stop offset="1" stopColor="#ff5316" />
            </linearGradient>
            <linearGradient id="miniFlameInner" x1=".1" y1="1" x2=".8" y2="0">
              <stop offset="0" stopColor="#ffbd45" stopOpacity=".65" />
              <stop offset="1" stopColor="#ffd66c" stopOpacity=".1" />
            </linearGradient>
          </defs>
          <path
            d={OUTER_FLAME_PATH}
            fill="url(#miniFlameFill)"
            stroke="#ef6513"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d={INNER_FLAME_PATH}
            fill="url(#miniFlameInner)"
          />
          <path
            d={INNER_LICK_1}
            fill="#ffe08a"
            opacity=".6"
          />
          <g>
            <ellipse cx="72" cy="169" rx="22" ry="25" fill="#fff9ee" />
            <ellipse cx="74" cy="171" rx="15" ry="17" fill="#17191c" />
            <ellipse cx="69" cy="165" rx="5" ry="6" fill="white" />
          </g>
          <g>
            <ellipse cx="148" cy="169" rx="22" ry="25" fill="#fff9ee" />
            <ellipse cx="146" cy="171" rx="15" ry="17" fill="#17191c" />
            <ellipse cx="141" cy="165" rx="5" ry="6" fill="white" />
          </g>
          <path
            d="M95 188 C100 196 119 196 125 188"
            fill="none"
            stroke="#342317"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
