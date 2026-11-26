"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  Award,
  Bot,
  Brain,
  Briefcase,
  ClipboardCheck,
  Compass,
  Cpu,
  Eye,
  Film,
  GitBranch,
  GitMerge,
  Glasses,
  LayoutGrid,
  Lightbulb,
  Mic,
  Package,
  Palette,
  PenTool,
  PlayCircle,
  Rocket,
  Shapes,
  Sparkles,
  SwatchBook,
  Terminal,
  Type,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type {
  RoadmapLessonGroup,
  RoadmapLessonIconKey,
  RoadmapLessonItem,
} from "@/data/roadmaps/lessonsCatalog";

export interface RoadmapFlowchartTreeProps {
  groups: RoadmapLessonGroup[];
  emptyLessonMessage?: string;
}

interface FlattenedLessonNode {
  lesson: RoadmapLessonItem;
  group: RoadmapLessonGroup;
  flatIndex: number;
  accentHex: string;
  badgeTextDark: boolean;
}

interface NodeFrame {
  node: FlattenedLessonNode;
  tileX: number;
  tileY: number;
  tileSize: number;
  pillX: number;
  pillY: number;
  labelMaxW: number;
  labelSide: "left" | "right";
  loopRightOut?: boolean;
}

interface PathSegment {
  id: string;
  d: string;
  fromColor: string;
  toColor: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  yStart: number;
  yEnd: number;
  isTail?: boolean;
}

function LessonNodeIcon({
  icon,
  className = "w-[22px] h-[22px] sm:w-7 sm:h-7",
}: {
  icon: RoadmapLessonIconKey;
  className?: string;
}) {
  if (icon === "figma") {
    return (
      <svg viewBox="0 0 38 57" className="w-[22px] h-[26px] sm:w-7 sm:h-8" fill="none" aria-hidden="true">
        <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
        <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
        <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
        <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
        <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
      </svg>
    );
  }

  const iconMap: Record<Exclude<RoadmapLessonIconKey, "figma">, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    studio: Sparkles,
    eye: Eye,
    typography: Type,
    palette: Palette,
    layout: LayoutGrid,
    brain: Brain,
    shapes: Shapes,
    badge: Award,
    package: Package,
    motion: Film,
    compass: Compass,
    merge: GitMerge,
    flow: GitBranch,
    bulb: Lightbulb,
    craft: PenTool,
    tokens: SwatchBook,
    accessibility: Accessibility,
    prototype: PlayCircle,
    bot: Bot,
    cpu: Cpu,
    wearables: Glasses,
    voice: Mic,
    clipboard: ClipboardCheck,
    rocket: Rocket,
    briefcase: Briefcase,
    users: Users,
    workflow: Workflow,
    terminal: Terminal,
  };

  const IconComp = iconMap[icon] || Sparkles;
  return <IconComp className={className} strokeWidth={1.85} aria-hidden="true" />;
}

function buildRoundedPolylinePath(points: Array<{ x: number; y: number }>, radius: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const cmds: string[] = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 0.01 || len2 < 0.01) {
      cmds.push(`L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`);
      continue;
    }

    const r = Math.min(radius, len1 / 2, len2 / 2);
    const p1x = curr.x - (v1x / len1) * r;
    const p1y = curr.y - (v1y / len1) * r;
    const p2x = curr.x + (v2x / len2) * r;
    const p2y = curr.y + (v2y / len2) * r;

    cmds.push(`L ${p1x.toFixed(1)} ${p1y.toFixed(1)}`);
    cmds.push(`Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`);
  }

  const last = points[points.length - 1];
  cmds.push(`L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`);
  return cmds.join(" ");
}

const MOBILE_SERPENTINE_STOPS: ReadonlyArray<{
  ratio: number;
  loopRightOut?: boolean;
}> = [
  { ratio: 0.0 },
  { ratio: 0.48 },
  { ratio: 1.0 },
  { ratio: 0.12, loopRightOut: true },
  { ratio: 0.28 },
  { ratio: 0.6 },
  { ratio: 0.04, loopRightOut: true },
  { ratio: 0.24 },
];

const WIDE_WAVE_STOPS: ReadonlyArray<{
  ratio: number;
  labelSide: "left" | "right";
}> = [
  { ratio: 0.03, labelSide: "right" },
  { ratio: 0.38, labelSide: "right" },
  { ratio: 0.97, labelSide: "left" },
  { ratio: 0.62, labelSide: "left" },
];

export default function RoadmapFlowchartTree({
  groups,
  emptyLessonMessage = "Lesson content will appear here soon.",
}: RoadmapFlowchartTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const segPathRefs = useRef<Array<SVGPathElement | null>>([]);
  const segLengthsRef = useRef<number[]>([]);
  const currentBeamRef = useRef<number>(0);

  const [containerWidth, setContainerWidth] = useState(1080);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<FlattenedLessonNode | null>(null);
  const gradIdPrefix = useId().replace(/:/g, "");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerWidth(Math.round(rect.width));
      }
    };
    update();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.round(entry.contentRect.width));
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedNode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNode(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNode]);

  const flattenedNodes = useMemo<FlattenedLessonNode[]>(() => {
    const list: FlattenedLessonNode[] = [];
    groups.forEach((group) => {
      group.lessons.forEach((lesson) => {
        list.push({
          lesson,
          group,
          flatIndex: list.length,
          accentHex: group.accentHex,
          badgeTextDark: Boolean(group.badgeTextDark),
        });
      });
    });
    return list;
  }, [groups]);

  const layout = useMemo(() => {
    const W = Math.max(containerWidth, 260);
    const isMicro = W < 340;
    const isMobile = W < 540;
    const isTablet = W >= 540 && W < 780;

    const tileSize = isMicro ? 46 : isMobile ? 52 : isTablet ? 66 : 76;
    const normalRowH = isMicro ? 92 : isMobile ? 98 : isTablet ? 138 : 152;
    const loopRowH = isMicro ? 132 : 144;
    const loopClearance = isMicro ? 20 : 22;
    const strokeWidth = isMobile ? 8 : isTablet ? 9 : 10;
    const leftEdgeX = isMicro ? 14 : isMobile ? 18 : isTablet ? 28 : 44;
    const rightEdgeX = isMobile ? W - (isMicro ? 10 : 14) : W - leftEdgeX;
    const topPad = isMobile ? 16 : isTablet ? 24 : 28;
    const rCorner = isMicro ? 16 : isMobile ? 20 : isTablet ? 24 : 30;

    const pillGap = isMobile ? 5 : 6;
    const pillHalf = isMobile ? 13 : 18;
    const labelGap = isMicro ? 10 : isMobile ? 12 : isTablet ? 18 : 20;
    const mobileLabelReserve = isMicro ? 112 : 132;

    const minTileX = leftEdgeX + pillGap + pillHalf;
    const maxTileX = isMobile
      ? Math.max(minTileX + 40, rightEdgeX - tileSize - labelGap - mobileLabelReserve)
      : Math.max(minTileX, rightEdgeX - pillGap - pillHalf - tileSize);
    const horizontalSpan = Math.max(0, maxTileX - minTileX);

    let cursorY = topPad;

    const frames: NodeFrame[] = flattenedNodes.map((node, idx) => {
      if (idx > 0) {
        const prevLoop =
          isMobile &&
          MOBILE_SERPENTINE_STOPS[(idx - 1) % MOBILE_SERPENTINE_STOPS.length]
            .loopRightOut;
        cursorY += prevLoop ? loopRowH : normalRowH;
      }

      if (isMobile) {
        const stop = MOBILE_SERPENTINE_STOPS[idx % MOBILE_SERPENTINE_STOPS.length];
        const tileX = Math.round(minTileX + stop.ratio * horizontalSpan);
        const tileY = cursorY;
        const pillX = tileX - pillGap;
        const pillY = tileY + tileSize / 2;
        const labelMaxW = Math.max(108, rightEdgeX - (tileX + tileSize + labelGap));

        return {
          node,
          tileX,
          tileY,
          tileSize,
          pillX,
          pillY,
          labelMaxW,
          labelSide: "right",
          loopRightOut: stop.loopRightOut,
        };
      }

      const stop = WIDE_WAVE_STOPS[idx % WIDE_WAVE_STOPS.length];
      const tileX = Math.round(minTileX + stop.ratio * horizontalSpan);
      const tileY = cursorY;
      const pillX =
        stop.labelSide === "left"
          ? tileX + tileSize + pillGap
          : tileX - pillGap;
      const pillY = tileY + tileSize / 2;
      const labelMaxW =
        stop.labelSide === "left"
          ? Math.max(120, tileX - labelGap - leftEdgeX)
          : Math.max(120, rightEdgeX - (tileX + tileSize + labelGap));

      return {
        node,
        tileX,
        tileY,
        tileSize,
        pillX,
        pillY,
        labelMaxW,
        labelSide: stop.labelSide,
      };
    });

    const segments: PathSegment[] = [];
    const detourX = rightEdgeX - (isMicro ? 14 : 18);

    for (let i = 0; i < frames.length - 1; i++) {
      const curr = frames[i];
      const next = frames[i + 1];

      let pts: Array<{ x: number; y: number }>;
      if (isMobile && curr.loopRightOut) {
        const topRailY = Math.round(curr.tileY + curr.tileSize + loopClearance);
        const botRailY = Math.round(next.tileY - loopClearance);
        pts = [
          { x: curr.pillX, y: curr.pillY },
          { x: curr.pillX, y: topRailY },
          { x: detourX, y: topRailY },
          { x: detourX, y: botRailY },
          { x: next.pillX, y: botRailY },
          { x: next.pillX, y: next.pillY },
        ];
      } else {
        const midY = Math.round((curr.pillY + next.pillY) / 2);
        pts = [
          { x: curr.pillX, y: curr.pillY },
          { x: curr.pillX, y: midY },
          { x: next.pillX, y: midY },
          { x: next.pillX, y: next.pillY },
        ];
      }

      segments.push({
        id: `seg-${curr.node.lesson.number}-${next.node.lesson.number}`,
        d: buildRoundedPolylinePath(pts, rCorner),
        fromColor: curr.node.accentHex,
        toColor: next.node.accentHex,
        x1: curr.pillX,
        y1: curr.pillY,
        x2: next.pillX,
        y2: next.pillY,
        yStart: curr.pillY,
        yEnd: next.pillY,
      });
    }

    const totalH =
      frames.length > 0 ? frames[frames.length - 1].tileY + tileSize + 56 : topPad;

    if (frames.length > 0) {
      const last = frames[frames.length - 1];
      const tailEndY = totalH - 4;
      segments.push({
        id: "seg-tail",
        d: `M ${last.pillX} ${last.pillY} L ${last.pillX} ${tailEndY}`,
        fromColor: last.node.accentHex,
        toColor: last.node.accentHex,
        x1: last.pillX,
        y1: last.pillY,
        x2: last.pillX,
        y2: tailEndY,
        yStart: last.pillY,
        yEnd: tailEndY,
        isTail: true,
      });
    }

    return {
      width: W,
      height: totalH,
      strokeWidth,
      frames,
      segments,
    };
  }, [containerWidth, flattenedNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || layout.frames.length === 0) return;

    const mql =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const applyImmediateRevealAll = () => {
      layout.segments.forEach((_, idx) => {
        const pathEl = segPathRefs.current[idx];
        if (!pathEl) return;
        pathEl.style.strokeDasharray = "none";
        pathEl.style.strokeDashoffset = "0";
        pathEl.style.opacity = "1";
      });
      setRevealedCount(layout.frames.length);
    };

    if (mql?.matches) {
      applyImmediateRevealAll();
      return;
    }

    // Measure SVG curve lengths after layout changes so dashoffset maps 1:1 with scroll
    segLengthsRef.current = layout.segments.map((_, idx) => {
      const el = segPathRefs.current[idx];
      if (!el || typeof el.getTotalLength !== "function") return 0;
      try {
        return el.getTotalLength();
      } catch {
        return 0;
      }
    });

    const computeTargetBeamY = (): number => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const baseAnchor = vh * (vh < 760 ? 0.8 : 0.76);
      const distFromBottom = rect.bottom - vh;
      const boostRatio =
        distFromBottom < 200
          ? Math.min(1, Math.max(0, (200 - distFromBottom) / 220))
          : 0;
      const bottomBoost = boostRatio * (vh * 0.34);
      const rawBeam = baseAnchor + bottomBoost - rect.top;
      return Math.max(0, Math.min(layout.height + 24, rawBeam));
    };

    const applyBeam = (beamY: number) => {
      const pillRevealLead = containerWidth < 540 ? 14 : 18;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 900;

      // Guarantee the entry unit reveals gently once the canvas top enters view
      let nextCount = rect.top < vh * 0.96 ? 1 : 0;
      for (let i = 0; i < layout.frames.length; i++) {
        if (beamY >= layout.frames[i].pillY - pillRevealLead) {
          nextCount = i + 1;
        }
      }
      setRevealedCount((prev) => (prev === nextCount ? prev : nextCount));

      layout.segments.forEach((seg, idx) => {
        const pathEl = segPathRefs.current[idx];
        const len = segLengthsRef.current[idx] ?? 0;
        if (!pathEl || len <= 0) return;

        const span = Math.max(1, seg.yEnd - seg.yStart);
        const segProgress = Math.min(1, Math.max(0, (beamY - seg.yStart) / span));

        if (segProgress <= 0.002) {
          pathEl.style.opacity = "0";
          pathEl.style.strokeDasharray = `${len + 4} ${len + 8}`;
          pathEl.style.strokeDashoffset = `${len}`;
        } else if (segProgress >= 0.999) {
          pathEl.style.opacity = "1";
          pathEl.style.strokeDasharray = "none";
          pathEl.style.strokeDashoffset = "0";
        } else {
          pathEl.style.opacity = "1";
          pathEl.style.strokeDasharray = `${len + 4} ${len + 8}`;
          pathEl.style.strokeDashoffset = `${(len * (1 - segProgress)).toFixed(2)}`;
        }
      });
    };

    let rafId = 0;
    const step = () => {
      rafId = 0;
      if (mql?.matches) {
        applyImmediateRevealAll();
        return;
      }
      const target = computeTargetBeamY();
      const curr = currentBeamRef.current;
      const diff = target - curr;

      if (Math.abs(diff) <= 0.6) {
        currentBeamRef.current = target;
        applyBeam(target);
        return;
      }

      const next = curr + diff * 0.22;
      currentBeamRef.current = next;
      applyBeam(next);
      rafId = window.requestAnimationFrame(step);
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    const scrollTargets: Array<Window | HTMLElement> = [window];
    let parent: HTMLElement | null = container.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflow === "auto" ||
        style.overflow === "scroll"
      ) {
        scrollTargets.push(parent);
      }
      parent = parent.parentElement;
    }

    scrollTargets.forEach((t) =>
      t.addEventListener("scroll", schedule, { passive: true })
    );
    window.addEventListener("resize", schedule, { passive: true });
    mql?.addEventListener("change", schedule);

    schedule();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      scrollTargets.forEach((t) => t.removeEventListener("scroll", schedule));
      window.removeEventListener("resize", schedule);
      mql?.removeEventListener("change", schedule);
    };
  }, [layout, containerWidth]);

  if (flattenedNodes.length === 0) return null;

  return (
    <section
      aria-label="Roadmap Curriculum Path"
      className="relative rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#111317] border border-slate-200/90 dark:border-white/[0.08] px-3 py-5 sm:p-8 lg:p-12 shadow-sm dark:shadow-[0_18px_44px_rgba(0,0,0,0.48)] [background-image:radial-gradient(rgba(15,23,42,0.09)_1px,transparent_1px)] dark:[background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden"
    >
      {/* ── Winding Serpentine Track Container ── */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[1080px] mx-auto select-none"
        style={{ height: `${layout.height}px` }}
      >
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {layout.segments.map((seg) => {
              if (!seg.isTail && seg.fromColor === seg.toColor) return null;
              return (
                <linearGradient
                  key={seg.id}
                  id={`${gradIdPrefix}-${seg.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                >
                  <stop offset="0%" stopColor={seg.fromColor} stopOpacity={1} />
                  <stop
                    offset="100%"
                    stopColor={seg.toColor}
                    stopOpacity={seg.isTail ? 0 : 1}
                  />
                </linearGradient>
              );
            })}
          </defs>

          {/* Muted Unrevealed Blueprint Base Track */}
          {layout.segments.map((seg) => (
            <path
              key={`${seg.id}-base`}
              d={seg.d}
              fill="none"
              strokeWidth={layout.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-slate-300/75 dark:stroke-white/[0.10]"
            />
          ))}

          {/* Scroll-Revealed Vibrant Colored Track Overlay */}
          {layout.segments.map((seg, idx) => {
            const usesGradient = seg.isTail || seg.fromColor !== seg.toColor;
            return (
              <path
                key={seg.id}
                ref={(el) => {
                  segPathRefs.current[idx] = el;
                }}
                d={seg.d}
                fill="none"
                stroke={
                  usesGradient
                    ? `url(#${gradIdPrefix}-${seg.id})`
                    : seg.fromColor
                }
                strokeWidth={layout.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0 }}
              />
            );
          })}
        </svg>

        {/* ── Number Pills & Station Nodes (1 through N) ── */}
        {layout.frames.map((frame) => {
          const {
            node,
            tileX,
            tileY,
            tileSize,
            pillX,
            pillY,
            labelMaxW,
            labelSide,
          } = frame;
          const { lesson, accentHex, badgeTextDark } = node;
          const isLabelOnLeft = labelSide === "left";
          const isRevealed = node.flatIndex < revealedCount;

          return (
            <React.Fragment key={lesson.number}>
              {/* Numbered Badge Pill Anchored Directly on Track */}
              <div
                style={{
                  left: `${pillX}px`,
                  top: `${pillY}px`,
                  backgroundColor: isRevealed ? accentHex : undefined,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-[10px] sm:rounded-xl font-black text-[11px] sm:text-[13px] flex items-center justify-center ring-2 ring-white/95 dark:ring-[#111317] shadow-md pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRevealed
                    ? `scale-100 opacity-100 ${badgeTextDark ? "text-[#0D0F12]" : "text-white"}`
                    : "scale-90 opacity-75 bg-slate-200 dark:bg-[#232834] text-slate-400 dark:text-neutral-500"
                }`}
                aria-hidden="true"
              >
                {lesson.number}
              </div>

              {/* Station Tile + Accent Bar + Lesson Title */}
              <button
                type="button"
                onClick={() => setSelectedNode(node)}
                style={
                  isLabelOnLeft
                    ? {
                        right: `${layout.width - (tileX + tileSize)}px`,
                        top: `${tileY}px`,
                      }
                    : {
                        left: `${tileX}px`,
                        top: `${tileY}px`,
                      }
                }
                aria-label={`${lesson.number}. ${lesson.title}`}
                className={`group absolute z-10 flex items-center rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111317] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isLabelOnLeft ? "flex-row-reverse text-right" : "text-left"
                } ${
                  isRevealed
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-45 translate-y-3 scale-[0.96]"
                }`}
              >
                <div
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    borderColor: isRevealed ? accentHex : undefined,
                  }}
                  className={`relative shrink-0 rounded-2xl sm:rounded-[20px] border-2 bg-white dark:bg-[#15181F] flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.14)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.52)] transition-all duration-500 ease-out group-hover:scale-[1.04] group-active:scale-95 ${
                    isRevealed
                      ? "text-slate-800 dark:text-white"
                      : "border-slate-200 dark:border-white/[0.10] text-slate-400 dark:text-neutral-500"
                  }`}
                >
                  <span
                    style={{ backgroundColor: accentHex }}
                    className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${
                      isRevealed ? "opacity-[0.07]" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                  <div
                    className={`relative z-10 transition-all duration-500 ${
                      isRevealed
                        ? "scale-100 opacity-100 grayscale-0"
                        : "scale-90 opacity-60 grayscale"
                    }`}
                  >
                    <LessonNodeIcon icon={lesson.icon} />
                  </div>
                </div>

                <div
                  style={{ maxWidth: `${labelMaxW}px` }}
                  className={`flex items-center gap-2 sm:gap-3.5 ${
                    isLabelOnLeft
                      ? "mr-3 sm:mr-5 flex-row-reverse"
                      : "ml-3 sm:ml-5"
                  }`}
                >
                  <span
                    style={{
                      backgroundColor: isRevealed ? accentHex : undefined,
                    }}
                    className={`w-[2.5px] sm:w-[3px] h-5 sm:h-7 rounded-full shrink-0 transition-all duration-500 ease-out ${
                      isRevealed
                        ? "scale-y-100 opacity-100"
                        : "scale-y-50 opacity-45 bg-slate-300 dark:bg-white/[0.14]"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-xs sm:text-[15px] lg:text-base font-bold tracking-tight leading-snug transition-colors duration-500 group-hover:opacity-85 ${
                      isRevealed
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-neutral-500"
                    }`}
                  >
                    {lesson.title}
                  </span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Lightweight Lesson Preview Modal ── */}
      {selectedNode && (
        <div
          onClick={() => setSelectedNode(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-preview-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#14171D] border border-slate-200 dark:border-white/[0.1] p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  style={{ backgroundColor: selectedNode.accentHex }}
                  className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                    selectedNode.badgeTextDark ? "text-[#0D0F12]" : "text-white"
                  }`}
                >
                  {selectedNode.lesson.number}
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                    {selectedNode.group.rangeLabel}
                  </span>
                  <h3
                    id="lesson-preview-title"
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight"
                  >
                    {selectedNode.lesson.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                aria-label="Close lesson preview"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
              {emptyLessonMessage}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
