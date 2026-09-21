"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  useMemo,
} from "react";
import gsap from "gsap";

export interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: "mount" | "hover" | "scroll" | "loop";
  fillMode?: "wipe" | "fade" | "none";
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  className?: string;
  style?: React.CSSProperties;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function StrokeText({
  text,
  strokeColor = "#A78BFA",
  fillColor = "#A855F7",
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = "power2.out",
  trigger = "mount",
  fillMode = "wipe",
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  className = "",
  style = {},
}: StrokeTextProps) {
  const reactId = useId();
  const clipId = `stroke-clip-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const containerRef = useRef<SVGSVGElement | null>(null);
  const measureTextRef = useRef<SVGTextElement | null>(null);
  const wipeRectRef = useRef<SVGRectElement | null>(null);
  const fillTextRef = useRef<SVGTextElement | null>(null);
  const charRefs = useRef<(SVGTextElement | null)[]>([]);

  const chars = useMemo(() => text.split(""), [text]);

  // Initial heuristic character layout for immediate SSR render
  const [charPositions, setCharPositions] = useState<number[]>(() => {
    let currentX = 0;
    return chars.map((char) => {
      const x = currentX;
      const w = char === " " ? fontSize * 0.35 : fontSize * 0.62 + letterSpacing;
      currentX += Math.max(w, fontSize * 0.2);
      return x;
    });
  });

  const [svgDimensions, setSvgDimensions] = useState({
    width: Math.max(200, chars.length * (fontSize * 0.62 + letterSpacing) + 30),
    height: fontSize * 1.25,
  });

  const baselineY = fontSize * 0.92;

  // Reset charRefs on text change
  useEffect(() => {
    charRefs.current = charRefs.current.slice(0, chars.length);
  }, [chars]);

  // Measure exact character positions and glyph bounding box on client
  useIsomorphicLayoutEffect(() => {
    if (!measureTextRef.current) return;

    try {
      const positions: number[] = [];
      const len = chars.length;
      for (let i = 0; i < len; i++) {
        if (typeof measureTextRef.current.getStartPositionOfChar === "function") {
          const startPos = measureTextRef.current.getStartPositionOfChar(i);
          positions.push(startPos.x);
        } else {
          // Heuristic fallback
          const prev = positions[i - 1] ?? 0;
          const w = chars[i - 1] === " " ? fontSize * 0.35 : fontSize * 0.62 + letterSpacing;
          positions.push(prev + w);
        }
      }

      let totalWidth = chars.length * (fontSize * 0.62 + letterSpacing) + 20;
      let totalHeight = fontSize * 1.25;

      if (typeof measureTextRef.current.getBBox === "function") {
        const bbox = measureTextRef.current.getBBox();
        const padding = strokeWidth * 4;
        totalWidth = Math.ceil(bbox.width + padding * 2 + 16);
        totalHeight = Math.ceil(bbox.height + padding * 2 + 10);
      }

      setCharPositions(positions);
      setSvgDimensions({
        width: Math.max(totalWidth, 100),
        height: Math.max(totalHeight, Math.ceil(fontSize * 1.25)),
      });
    } catch {
      // Keep SSR heuristic if SVG measurement fails in headless env
    }
  }, [text, fontSize, fontWeight, letterSpacing, strokeWidth, chars]);

  // GSAP animation engine
  const playAnimation = () => {
    const validCharEls = charRefs.current.filter(Boolean) as SVGTextElement[];
    const strokeEls = validCharEls.filter((_, idx) => chars[idx] !== " ");

    gsap.killTweensOf(strokeEls);
    if (wipeRectRef.current) gsap.killTweensOf(wipeRectRef.current);
    if (fillTextRef.current) gsap.killTweensOf(fillTextRef.current);

    const tl = gsap.timeline({
      repeat: trigger === "loop" ? -1 : 0,
      repeatDelay: 1,
    });

    const dashLength = Math.max(600, fontSize * 5);

    gsap.set(strokeEls, {
      strokeDasharray: dashLength,
      strokeDashoffset: dashLength,
      opacity: 1,
    });

    if (wipeRectRef.current) {
      gsap.set(wipeRectRef.current, {
        attr: { width: 0 },
      });
    }

    if (fillTextRef.current) {
      gsap.set(fillTextRef.current, {
        opacity: fillMode === "fade" ? 0 : 1,
      });
    }

    // 1. Draw character strokes with stagger
    tl.to(strokeEls, {
      strokeDashoffset: 0,
      duration: drawDuration,
      stagger: stagger,
      ease: ease,
    });

    // 2. Flood with fill color
    const fillStartTime = Math.max(0, drawDuration * 0.35 + fillDelay);

    if (fillMode === "wipe" && wipeRectRef.current) {
      tl.to(
        wipeRectRef.current,
        {
          attr: { width: svgDimensions.width + 40 },
          duration: drawDuration * 0.75,
          ease: ease,
        },
        fillStartTime
      );
    } else if (fillMode === "fade" && fillTextRef.current) {
      tl.to(
        fillTextRef.current,
        {
          opacity: 1,
          duration: drawDuration * 0.6,
          ease: ease,
        },
        fillStartTime
      );
    }

    return tl;
  };

  useEffect(() => {
    let animTimeline: gsap.core.Timeline | null = null;

    if (trigger === "mount" || trigger === "loop") {
      const raf = requestAnimationFrame(() => {
        animTimeline = playAnimation();
      });
      return () => {
        cancelAnimationFrame(raf);
        animTimeline?.kill();
      };
    }
  }, [
    text,
    svgDimensions.width,
    trigger,
    drawDuration,
    fillDelay,
    stagger,
    ease,
    fillMode,
  ]);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      playAnimation();
    }
  };

  return (
    <svg
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      preserveAspectRatio="xMinYMid meet"
      className={`overflow-visible inline-block select-none ${className}`}
      style={{
        ...style,
      }}
      aria-label={text}
      role="img"
    >
      <defs>
        {fillMode === "wipe" && (
          <clipPath id={clipId}>
            <rect
              ref={wipeRectRef}
              x="0"
              y="0"
              width="0"
              height={svgDimensions.height + 20}
            />
          </clipPath>
        )}
      </defs>

      {/* Hidden measurement element */}
      <text
        ref={measureTextRef}
        x="0"
        y={baselineY}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        opacity="0"
        pointerEvents="none"
        style={{ fontFamily: "inherit" }}
      >
        {text}
      </text>

      {/* Flood Fill Layer */}
      {fillMode !== "none" && (
        <text
          ref={fillTextRef}
          x="0"
          y={baselineY}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          fill={fillColor}
          clipPath={fillMode === "wipe" ? `url(#${clipId})` : undefined}
          style={{
            fontFamily: "inherit",
          }}
        >
          {text}
        </text>
      )}

      {/* Stroke Outlines */}
      <g>
        {chars.map((char, i) => {
          if (char === " ") return null;
          return (
            <text
              key={`${char}-${i}`}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              x={charPositions[i] ?? 0}
              y={baselineY}
              fontSize={fontSize}
              fontWeight={fontWeight}
              letterSpacing={letterSpacing}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                fontFamily: "inherit",
              }}
            >
              {char}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
