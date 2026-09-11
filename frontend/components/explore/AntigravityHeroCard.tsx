"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

interface AntigravityHeroCardProps {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

export default function AntigravityHeroCard({
  children,
  glowColor = "rgba(99,102,241,0.22)",
  className = "",
}: AntigravityHeroCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Normalized mouse coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spotlight coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Lightweight snappy spring
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // 3D Tilt transforms
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    x.set(currentX / rect.width - 0.5);
    y.set(currentY / rect.height - 0.5);

    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const specularBackground = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.09), transparent 75%)`;

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={`group relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-[0_20px_45px_rgba(15,23,42,0.2)] hover:border-slate-700/80 transition-colors [transform:translateZ(0)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] ${className}`}
      >
        {/* Zero-Lag Hardware-Accelerated Static Radial Aura */}
        <div
          style={{ background: `radial-gradient(circle at 85% 15%, ${glowColor}, transparent 65%)` }}
          className="pointer-events-none absolute inset-0 z-0"
        />

        {/* Dynamic Specular Light Glare that follows cursor on desktop */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20 hidden md:block"
          style={{ background: specularBackground }}
        />

        {/* Antigravity isometric micro-grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px] opacity-35 z-0" />

        {/* Content with Z-axis depth */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="relative z-10 w-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
