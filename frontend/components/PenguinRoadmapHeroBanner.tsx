"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mountain,
  Zap,
  Code2,
  Briefcase,
  Compass,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  ArrowDown,
  Layers,
} from "lucide-react";

interface PenguinRoadmapHeroBannerProps {
  skillCount: number;
  careerCount: number;
  onExploreSkills?: () => void;
  onExploreCareers?: () => void;
}

export default function PenguinRoadmapHeroBanner({
  skillCount = 7,
  careerCount = 7,
  onExploreSkills,
  onExploreCareers,
}: PenguinRoadmapHeroBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [penguinJump, setPenguinJump] = useState(false);
  const [activeEasterEgg, setActiveEasterEgg] = useState(false);

  // 60FPS Interactive Alpine Mountain & Penguin Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let cssWidth = canvas.parentElement?.clientWidth || 420;
    let cssHeight = canvas.parentElement?.clientHeight || 280;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = canvas.parentElement.clientWidth || 420;
      cssHeight = canvas.parentElement.clientHeight || 280;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Snowflakes particle system
    const snowflakes = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * cssWidth,
      y: Math.random() * cssHeight,
      speedY: Math.random() * 0.7 + 0.3,
      speedX: Math.random() * 0.4 - 0.2,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.6 + 0.3,
      sway: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // ── 1. Atmospheric Sky & Aurora Glow ──
      const skyGrad = ctx.createLinearGradient(0, 0, 0, cssHeight);
      skyGrad.addColorStop(0, "rgba(6, 44, 33, 0.95)");
      skyGrad.addColorStop(0.5, "rgba(11, 61, 46, 0.85)");
      skyGrad.addColorStop(1, "rgba(4, 29, 22, 0.95)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Glowing Aurora Borealis Waves
      const auroraGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight * 0.6);
      auroraGrad.addColorStop(0, "rgba(52, 211, 153, 0.15)");
      auroraGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.18)");
      auroraGrad.addColorStop(1, "rgba(251, 191, 36, 0.12)");
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      for (let x = 0; x <= cssWidth; x += 20) {
        const wave = Math.sin(x * 0.015 + time) * 16 + Math.cos(x * 0.03 - time * 0.5) * 8;
        ctx.lineTo(x, 60 + wave);
      }
      ctx.lineTo(cssWidth, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Cold Sun / Moon Disk
      ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
      ctx.beginPath();
      ctx.arc(cssWidth * 0.78, 50, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FEF08A";
      ctx.beginPath();
      ctx.arc(cssWidth * 0.78, 50, 18, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. Distant Snowcapped Mountain Peaks ──
      ctx.fillStyle = "rgba(15, 76, 58, 0.75)";
      ctx.beginPath();
      ctx.moveTo(0, cssHeight);
      ctx.lineTo(cssWidth * 0.2, 105);
      ctx.lineTo(cssWidth * 0.45, 175);
      ctx.lineTo(cssWidth * 0.75, 80);
      ctx.lineTo(cssWidth, 160);
      ctx.lineTo(cssWidth, cssHeight);
      ctx.closePath();
      ctx.fill();

      // Snowcaps on Distant Peaks
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.moveTo(cssWidth * 0.2, 105);
      ctx.lineTo(cssWidth * 0.14, 135);
      ctx.lineTo(cssWidth * 0.26, 135);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cssWidth * 0.75, 80);
      ctx.lineTo(cssWidth * 0.67, 120);
      ctx.lineTo(cssWidth * 0.83, 120);
      ctx.closePath();
      ctx.fill();

      // ── 3. Foreground Snowy Alpine Slope ──
      const slopeGrad = ctx.createLinearGradient(0, 120, 0, cssHeight);
      slopeGrad.addColorStop(0, "#F8FAFC");
      slopeGrad.addColorStop(0.4, "#E2E8F0");
      slopeGrad.addColorStop(1, "#CBD5E1");
      ctx.fillStyle = slopeGrad;

      ctx.beginPath();
      ctx.moveTo(0, cssHeight);
      ctx.lineTo(0, cssHeight * 0.7);
      // Slope climbing up from left to right
      ctx.bezierCurveTo(
        cssWidth * 0.35,
        cssHeight * 0.68,
        cssWidth * 0.65,
        cssHeight * 0.52,
        cssWidth,
        cssHeight * 0.42
      );
      ctx.lineTo(cssWidth, cssHeight);
      ctx.closePath();
      ctx.fill();

      // Crisp Sunlit Snow Ridge Highlight
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, cssHeight * 0.7);
      ctx.bezierCurveTo(
        cssWidth * 0.35,
        cssHeight * 0.68,
        cssWidth * 0.65,
        cssHeight * 0.52,
        cssWidth,
        cssHeight * 0.42
      );
      ctx.stroke();

      // ── 4. Pine Trees on Ridge ──
      const treePositions = [
        { x: cssWidth * 0.15, y: cssHeight * 0.69, scale: 0.75 },
        { x: cssWidth * 0.28, y: cssHeight * 0.65, scale: 0.9 },
        { x: cssWidth * 0.88, y: cssHeight * 0.44, scale: 0.65 },
      ];

      treePositions.forEach((tp) => {
        ctx.fillStyle = "#064E3B";
        ctx.beginPath();
        ctx.moveTo(tp.x, tp.y - 36 * tp.scale);
        ctx.lineTo(tp.x - 14 * tp.scale, tp.y);
        ctx.lineTo(tp.x + 14 * tp.scale, tp.y);
        ctx.closePath();
        ctx.fill();

        // Snow on Pine
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(tp.x, tp.y - 36 * tp.scale);
        ctx.lineTo(tp.x - 8 * tp.scale, tp.y - 20 * tp.scale);
        ctx.lineTo(tp.x + 8 * tp.scale, tp.y - 20 * tp.scale);
        ctx.closePath();
        ctx.fill();
      });

      // ── 5. Summit Victory Waypoint Flag (Right Side) ──
      const summitX = cssWidth * 0.84;
      const summitY = cssHeight * 0.46;

      // Flag pole
      ctx.strokeStyle = "#451A03";
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(summitX, summitY);
      ctx.lineTo(summitX, summitY - 55);
      ctx.stroke();

      // Flapping Flag
      const flagFlutter = Math.sin(time * 3) * 3.5;
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.moveTo(summitX, summitY - 55);
      ctx.lineTo(summitX + 28, summitY - 45 + flagFlutter);
      ctx.lineTo(summitX, summitY - 35);
      ctx.closePath();
      ctx.fill();

      // Flag Text / Star
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 7.5px sans-serif";
      ctx.fillText("SUMMIT", summitX + 2, -43 + summitY + flagFlutter * 0.5);

      // ── 6. Mountaineer Emperor Penguin Climbing Slope ──
      const penguinX = cssWidth * 0.54;
      const penguinBaseY = cssHeight * 0.57;
      const waddleCycle = time * 3.5;
      const waddleRoll = Math.sin(waddleCycle) * 0.07;
      const stepLift = Math.abs(Math.sin(waddleCycle)) * 4.5;
      const jumpOffset = penguinJump ? Math.sin(time * 12) * 12 : 0;

      ctx.save();
      ctx.translate(penguinX, penguinBaseY - jumpOffset);
      ctx.rotate(waddleRoll);

      // Contact Shadow
      ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 4 + jumpOffset * 0.2, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Webbed Foot
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(-4, -stepLift, 10, 5, 2);
      ctx.fill();

      // Mountaineering Backpack & Ice Axe
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.roundRect(-16, -20, 10, 16, 3.5);
      ctx.fill();
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Sleeping Mat Roll
      ctx.fillStyle = "#D97706";
      ctx.beginPath();
      ctx.roundRect(-15, -24, 8, 4, 2);
      ctx.fill();

      // Ice Axe
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-11, -16);
      ctx.lineTo(-6, 2);
      ctx.stroke();

      // Emperor Penguin Torso (Obsidian Tuxedo)
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.moveTo(-7, -24);
      ctx.bezierCurveTo(-14, -18, -14, 2, -5, 6);
      ctx.bezierCurveTo(0, 8, 8, 8, 11, 4);
      ctx.bezierCurveTo(15, -3, 14, -20, 5, -25);
      ctx.closePath();
      ctx.fill();

      // Golden Auroral Neck Plume
      const neckPlume = ctx.createLinearGradient(3, -24, 12, -12);
      neckPlume.addColorStop(0, "#F59E0B");
      neckPlume.addColorStop(0.5, "#FDE047");
      neckPlume.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = neckPlume;
      ctx.beginPath();
      ctx.moveTo(2, -22);
      ctx.bezierCurveTo(10, -20, 12, -12, 7, -8);
      ctx.bezierCurveTo(3, -12, 1, -18, 2, -22);
      ctx.closePath();
      ctx.fill();

      // Pearlescent White Belly
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(2, -19);
      ctx.bezierCurveTo(10, -15, 11, -1, 9, 4);
      ctx.bezierCurveTo(3, 6, -1, 5, -1, -2);
      ctx.bezierCurveTo(-1, -13, 0, -18, 2, -19);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(6.5, -19, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.arc(7.2, -19, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(7.8, -19.8, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Beak with Mandibular Stripe
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.moveTo(9, -18);
      ctx.lineTo(19, -15);
      ctx.lineTo(9, -12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#F97316";
      ctx.beginPath();
      ctx.moveTo(9.5, -15);
      ctx.lineTo(17, -15);
      ctx.lineTo(10, -12.5);
      ctx.closePath();
      ctx.fill();

      // Red Thermal Wool Scarf
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.roundRect(-3, -15, 13, 5, 2.5);
      ctx.fill();

      const scarfWave = Math.sin(time * 4) * 3;
      ctx.beginPath();
      ctx.moveTo(-3, -13);
      ctx.lineTo(-12, -10 + scarfWave);
      ctx.lineTo(-11, -5 + scarfWave);
      ctx.lineTo(-3, -9);
      ctx.closePath();
      ctx.fill();

      // Front Flipper Wing
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(0, -10, 6, 14, 3);
      ctx.fill();

      // Front Webbed Foot
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(1, 2, 11, 5, 2);
      ctx.fill();

      // Goggles on Forehead
      ctx.fillStyle = "#38BDF8";
      ctx.beginPath();
      ctx.roundRect(2, -24, 8, 3.5, 1.5);
      ctx.fill();

      ctx.restore();

      // ── 7. Drifting Atmospheric Snowflakes ──
      ctx.fillStyle = "#FFFFFF";
      snowflakes.forEach((sf) => {
        sf.y += sf.speedY;
        sf.x += sf.speedX + Math.sin(time + sf.sway) * 0.3;

        if (sf.y > cssHeight) {
          sf.y = -6;
          sf.x = Math.random() * cssWidth;
        }
        if (sf.x > cssWidth) sf.x = 0;
        if (sf.x < 0) sf.x = cssWidth;

        ctx.globalAlpha = sf.alpha;
        ctx.beginPath();
        ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [penguinJump]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062c21] via-[#0b3d2e] to-[#041d16] border border-emerald-500/30 text-white shadow-xl">
      {/* Aurora Ambient Glow Meshes */}
      <div className="absolute -left-20 -top-20 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-9 items-center">
        {/* ── Left Content: Title, Badges, Description & Stats ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Live Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-xs font-black tracking-wider uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🏔️ EXPEDITION LEARNING • 14 VERIFIED PATHWAYS</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2D Mountain Mode</span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Developer{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                Roadmaps
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium max-w-xl">
              Embark on an interactive mountain expedition. Master technology stacks and conquer
              curated milestones from novice basecamp (~1,200m) to principal architect summit
              (8,848m).
            </p>
          </div>

          {/* Stat Badges Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-lg">
            {/* Skill Tracks */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5" />
                <span>Skill Tracks</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {skillCount}
              </div>
              <div className="text-[10px] text-emerald-200/70 font-medium">Languages & Core</div>
            </div>

            {/* Career Paths */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Career Paths</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                {careerCount}
              </div>
              <div className="text-[10px] text-amber-200/70 font-medium">Job Ready Roles</div>
            </div>

            {/* Summit Altitude */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-sky-300 uppercase tracking-wider">
                <Mountain className="w-3.5 h-3.5" />
                <span>Max Altitude</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-sky-200 mt-1">8,848m</div>
              <div className="text-[10px] text-sky-200/70 font-medium">Everest Peak</div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <button
              type="button"
              onClick={onExploreSkills}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Skill Roadmaps</span>
            </button>

            <button
              type="button"
              onClick={onExploreCareers}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Career Tracks</span>
            </button>
          </div>
        </div>

        {/* ── Right Content: Interactive 2D Mountain & Penguin Expedition Showcase ── */}
        <div className="lg:col-span-5 relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden border border-emerald-400/30 bg-emerald-950/60 shadow-inner group">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Floating Interactive Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-md"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Hike to Summit ➔</span>
            </motion.div>
          </div>

          {/* Interactive Easter Egg / Jump Trigger */}
          <button
            type="button"
            onClick={() => {
              setPenguinJump(true);
              setTimeout(() => setPenguinJump(false), 900);
            }}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 backdrop-blur-md text-slate-950 text-[11px] font-black transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-90"
            title="Make the Penguin Jump!"
          >
            <span>🐧 Cheer Penguin!</span>
            <Zap className="w-3 h-3 fill-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
