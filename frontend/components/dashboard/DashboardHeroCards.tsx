"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export interface HeroVisualCardItem {
  id: string;
  image: string;
  alt: string;
  href: string;
  glowColor: string;
  podBg: string;
  podBorder: string;
  podShadow: string;
  gradientFrom: string;
}

const defaultCards: HeroVisualCardItem[] = [
  {
    id: "learning",
    image: "/images/hub/courses.png",
    alt: "Learning",
    href: "/learning",
    glowColor: "rgba(245, 158, 11, 0.28)",
    podBg: "bg-amber-500/[0.12]",
    podBorder: "border-amber-400/30",
    podShadow: "shadow-[0_0_24px_rgba(245,158,11,0.22)]",
    gradientFrom: "from-amber-500/[0.08]",
  },
  {
    id: "practice",
    image: "/images/hub/projects.png",
    alt: "Practice",
    href: "/practice",
    glowColor: "rgba(59, 130, 246, 0.28)",
    podBg: "bg-blue-500/[0.12]",
    podBorder: "border-blue-400/30",
    podShadow: "shadow-[0_0_24px_rgba(59,130,246,0.22)]",
    gradientFrom: "from-blue-500/[0.08]",
  },
  {
    id: "explore",
    image: "/images/hub/competition.png",
    alt: "Competitions",
    href: "/explore",
    glowColor: "rgba(236, 72, 153, 0.28)",
    podBg: "bg-pink-500/[0.12]",
    podBorder: "border-pink-400/30",
    podShadow: "shadow-[0_0_24px_rgba(236,72,153,0.22)]",
    gradientFrom: "from-pink-500/[0.08]",
  },
];

export default function DashboardHeroCards({
  cards = defaultCards,
  className = "",
}: {
  cards?: HeroVisualCardItem[];
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-[540px] grid grid-cols-3 gap-2.5 sm:gap-3.5 select-none ${className}`}
    >
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 * idx }}
          whileHover={{ y: -4, scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex-1"
        >
          <Link
            href={card.href}
            aria-label={card.alt}
            style={{
              boxShadow:
                "0 14px 24px 0px rgba(0, 0, 0, 0.12), 0 6px 12px 0px rgba(0, 0, 0, 0.08), 0 2px 4px 0px rgba(0, 0, 0, 0.04)",
            }}
            className={`group relative flex items-center justify-center w-full h-[135px] sm:h-[175px] lg:h-[212px] rounded-[20px] sm:rounded-[24px] lg:rounded-[26px] bg-white dark:bg-[#18191E] bg-gradient-to-b ${card.gradientFrom} to-transparent border border-slate-200/70 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] transition-all duration-300 overflow-hidden cursor-pointer p-2 sm:p-3`}
          >
            {/* Subtle Ambient Backlight Glow on Hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${card.glowColor} 0%, transparent 70%)`,
              }}
            />

            {/* 3D Shining Circular Pod */}
            <div
              className={`relative z-10 w-16 h-16 sm:w-22 sm:h-22 lg:w-26 lg:h-26 rounded-full ${card.podBg} dark:${card.podBg} border ${card.podBorder} ${card.podShadow} flex items-center justify-center p-2 sm:p-2.5 group-hover:scale-108 transition-all duration-300`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={card.image}
                  alt={card.alt}
                  width={96}
                  height={96}
                  priority
                  className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
