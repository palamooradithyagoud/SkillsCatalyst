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
  glowColor?: string; // e.g. "rgba(99,102,241,0.2)" or "rgba(59,130,246,0.2)"
  className?: string;
}

export default function AntigravityHeroCard({
  children,
  glowColor = "rgba(99,102,241,0.2)",
  className = "",
}: AntigravityHeroCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Normalized mouse coordinates from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Pixel coordinates for specular spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for natural weightless response
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 26 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 26 });

  // 3D Tilt transforms (controlled angle for elegance)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // Subtle floating elevation on hover
  const translateZ = useTransform(mouseXSpring, [-0.5, 0.5], ["10px", "10px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const xPct = currentX / rect.width - 0.5;
    const yPct = currentY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);

    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const specularBackground = useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12), transparent 75%)`;

  return (
    <div
      style={{ perspective: 1200 }}
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
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`group relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-[0_24px_55px_rgba(15,23,42,0.25)] hover:border-slate-700/80 transition-colors ${className}`}
      >
        {/* Living Ambient Gradient Background */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          style={{ background: glowColor }}
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl"
        />

        {/* Dynamic Specular Light Glare that follows cursor */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30"
          style={{ background: specularBackground }}
        />

        {/* Antigravity isometric micro-grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 z-0" />

        {/* Content with Z-axis depth */}
        <div
          style={{ transform: "translateZ(26px)" }}
          className="relative z-10 w-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
