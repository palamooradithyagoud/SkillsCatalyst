"use client";

import React, { useEffect, useRef } from "react";

export type ParticleState = "calm" | "charge" | "burst" | "fade";

interface ParticleFieldProps {
  state: ParticleState;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
}

export default function ParticleField({ state }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const colors = ["#FDE047", "#F59E0B", "#FBBF24", "#FEF08A", "#FFF"];
    const count = 55;
    const particles: Particle[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.4 - Math.random() * 0.8,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.1 + Math.random() * 0.6,
      maxAlpha: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height * 0.58; // sword center height

      particles.forEach((p) => {
        if (state === "charge") {
          // Gravitational pull toward sword center
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 3.5 / Math.max(dist * 0.05, 1);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vx *= 0.94;
          p.vy *= 0.94;
        } else if (state === "burst") {
          // Explosive outward impulse
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx = (dx / dist) * (18 + Math.random() * 14);
          p.vy = (dy / dist) * (18 + Math.random() * 14);
          p.alpha *= 0.93;
        } else {
          // Calm upward drift
          p.y += p.vy;
          p.x += p.vx;
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (state === "fade") {
          p.alpha *= 0.88;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
