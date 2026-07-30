"use client";

import React, { useRef, useEffect } from "react";

interface PythonGrowthCanvasProps {
  progressPct: number; // 0 to 100
  phaseIndex: number; // 0: Embryo, 1: Hatchling, 2: Juvenile, 3: Legendary Adult
}

export default function PythonGrowthCanvas({ progressPct, phaseIndex }: PythonGrowthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Device Pixel Ratio scaling for smooth 90fps rendering
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = 280;
    const height = 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Particle system for ambient energy motes
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // ── 1. Draw Ambient Background Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 110);
      if (phaseIndex === 0) {
        bgGlow.addColorStop(0, "rgba(6, 182, 212, 0.25)");
        bgGlow.addColorStop(1, "rgba(6, 182, 212, 0)");
      } else if (phaseIndex === 1) {
        bgGlow.addColorStop(0, "rgba(16, 185, 129, 0.3)");
        bgGlow.addColorStop(1, "rgba(16, 185, 129, 0)");
      } else if (phaseIndex === 2) {
        bgGlow.addColorStop(0, "rgba(245, 158, 11, 0.35)");
        bgGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
      } else {
        bgGlow.addColorStop(0, "rgba(234, 179, 8, 0.45)");
        bgGlow.addColorStop(1, "rgba(234, 179, 8, 0)");
      }
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. Update and Draw Ambient Energy Motes
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.05;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pAlpha = (Math.sin(p.pulse) * 0.3 + 0.7) * p.alpha;
        ctx.fillStyle = phaseIndex === 3 ? `rgba(250, 204, 21, ${pAlpha})` : `rgba(52, 211, 153, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 3. Render Based on Phase
      if (phaseIndex === 0) {
        // ── PHASE 1: DORMANT PYTHON EMBRYO (Glowing Cosmic Egg)
        const breathe = Math.sin(time * 2) * 3;
        const eggW = 40 + breathe;
        const eggH = 54 + breathe * 0.5;

        // Outer Aura Ring
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, 65 + Math.sin(time * 1.5) * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Egg Base Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + eggH * 0.85, eggW * 0.7, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Egg Body
        const eggGrad = ctx.createRadialGradient(cx - 10, cy - 15, 5, cx, cy, eggH);
        eggGrad.addColorStop(0, "#a5f3fc");
        eggGrad.addColorStop(0.4, "#0891b2");
        eggGrad.addColorStop(1, "#0f172a");

        ctx.fillStyle = eggGrad;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 20 + breathe * 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, eggW, eggH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing Energy Crack Patterns
        ctx.strokeStyle = "rgba(165, 243, 252, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx - 2, cy + 5);
        ctx.lineTo(cx + 8, cy - 2);
        ctx.lineTo(cx + 12, cy + 12);
        ctx.stroke();
      } else if (phaseIndex === 1) {
        // ── PHASE 2: HATCHLING SERPENT (Emerging Baby Python)
        // Shell bottom
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 30, 38, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Slithering Hatchling Snake Body
        const numJoints = 14;
        const headX = cx + Math.cos(time * 2) * 15;
        const headY = cy - 25 + Math.sin(time * 3) * 6;

        for (let i = numJoints - 1; i >= 0; i--) {
          const tFactor = i / numJoints;
          const segX = cx + (headX - cx) * (1 - tFactor) + Math.sin(time * 4 - i * 0.5) * (12 * tFactor);
          const segY = headY + i * 4;
          const segRadius = Math.max(3, 9 * (1 - tFactor * 0.6));

          ctx.fillStyle = `hsl(${150 + i * 4}, 85%, ${55 - i * 1.5}%)`;
          ctx.beginPath();
          ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head and Eyes
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(headX, headY, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing Eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(headX - 4, headY - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(headX + 4, headY - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#065f46";
        ctx.beginPath();
        ctx.arc(headX - 4, headY - 3, 1, 0, Math.PI * 2);
        ctx.arc(headX + 4, headY - 3, 1, 0, Math.PI * 2);
        ctx.fill();
      } else if (phaseIndex === 2) {
        // ── PHASE 3: JUVENILE MASTERY (Winding Emerald/Gold Serpent)
        const segments = 22;
        const points: { x: number; y: number; r: number }[] = [];

        for (let i = 0; i < segments; i++) {
          const angle = time * 2.5 - i * 0.22;
          const radiusScale = 45 + Math.sin(time + i * 0.1) * 10;
          const px = cx + Math.cos(angle) * radiusScale;
          const py = cy + Math.sin(angle * 1.8) * 25;
          const r = Math.max(3, (1 - i / segments) * 11 + 3);
          points.push({ x: px, y: py, r });
        }

        // Draw Body Joints with Gradient Scales
        for (let i = points.length - 1; i >= 0; i--) {
          const pt = points[i];
          const colorHue = 140 + (i / segments) * 45; // Emerald to Gold
          ctx.fillStyle = `hsl(${colorHue}, 90%, 50%)`;
          ctx.shadowColor = `hsl(${colorHue}, 90%, 50%)`;
          ctx.shadowBlur = i === 0 ? 18 : 6;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Snake Head Details
        const head = points[0];
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 13, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(head.x - 4, head.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(head.x + 4, head.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(head.x - 4, head.y - 3, 1.2, 0, Math.PI * 2);
        ctx.arc(head.x + 4, head.y - 3, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ── PHASE 4: LEGENDARY ADULT PYTHON (Majestic Golden Dragon Python)
        // 3D Rotating Gold Aura Rings
        for (let rIdx = 0; rIdx < 3; rIdx++) {
          const ringRad = 70 + rIdx * 15;
          const ringRot = time * (1.5 + rIdx * 0.5);
          ctx.strokeStyle = `rgba(234, 179, 8, ${0.4 - rIdx * 0.1})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, ringRad, ringRad * 0.4, ringRot, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Full Coiling Serpent Body (Figure 8 Curve)
        const totalSegs = 32;
        const points: { x: number; y: number; r: number }[] = [];

        for (let i = 0; i < totalSegs; i++) {
          const tAngle = time * 2 - i * 0.16;
          const scaleA = 60 + Math.sin(time * 2 + i * 0.1) * 8;
          const scaleB = 35 + Math.cos(time * 1.5 + i * 0.1) * 10;
          const px = cx + Math.sin(tAngle) * scaleA;
          const py = cy + Math.sin(tAngle * 2) * scaleB;
          const r = Math.max(4, Math.sin((i / totalSegs) * Math.PI) * 14 + 4);
          points.push({ x: px, y: py, r });
        }

        // Render Scales with Golden Metallic Gradient
        for (let i = points.length - 1; i >= 0; i--) {
          const pt = points[i];
          const grad = ctx.createRadialGradient(pt.x - 3, pt.y - 3, 1, pt.x, pt.y, pt.r);
          grad.addColorStop(0, "#fef08a");
          grad.addColorStop(0.5, "#eab308");
          grad.addColorStop(1, "#854d0e");

          ctx.fillStyle = grad;
          ctx.shadowColor = "#eab308";
          ctx.shadowBlur = i === 0 ? 25 : 8;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Head & Crown Glow
        const head = points[0];
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing Red Eyes of Mastery
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(head.x - 5, head.y - 4, 3.5, 0, Math.PI * 2);
        ctx.arc(head.x + 5, head.y - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [progressPct, phaseIndex]);

  return (
    <div className="relative flex items-center justify-center w-full">
      <canvas
        ref={canvasRef}
        style={{ width: "280px", height: "220px" }}
        className="w-[280px] h-[220px] pointer-events-none drop-shadow-2xl"
      />
    </div>
  );
}
