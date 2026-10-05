"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SwordTrailProps {
  isDrawn: boolean;
}

export default function SwordTrail({ isDrawn }: SwordTrailProps) {
  if (!isDrawn) return null;

  const trails = [
    { id: 1, delay: 0.0, opacity: 0.85, width: "70%", blur: "2px", color: "#FFFFFF" },
    { id: 2, delay: 0.03, opacity: 0.6, width: "85%", blur: "6px", color: "#FEF08A" },
    { id: 3, delay: 0.06, opacity: 0.35, width: "95%", blur: "12px", color: "#F59E0B" },
    { id: 4, delay: 0.09, opacity: 0.18, width: "100%", blur: "18px", color: "#7C3AED" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25 flex items-center justify-center">
      <AnimatePresence>
        {trails.map((t) => (
          <motion.div
            key={t.id}
            className="absolute h-[5px] rounded-full origin-left"
            style={{
              top: "56%",
              left: "40%",
              width: t.width,
              backgroundColor: t.color,
              filter: `blur(${t.blur})`,
              boxShadow: `0 0 20px 4px ${t.color}`,
            }}
            initial={{ scaleX: 0, opacity: 0, x: -40 }}
            animate={{
              scaleX: [0, 1.2, 0.9],
              opacity: [0, t.opacity, 0],
              x: [0, 120, 200],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.24,
              delay: t.delay,
              ease: [0.12, 0.98, 0.22, 1],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
