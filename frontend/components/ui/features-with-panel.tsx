"use client";

import * as React from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Play,
  Film,
  Calendar,
  GraduationCap,
  Award,
  Flame,
  CheckCircle2,
  Bookmark,
  Share2,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

interface FeatureItem {
  title: string;
  alt?: string;
  badge?: string;
  content: string | React.ReactNode;
}

function FeatureMedia({
  content,
  alt,
}: {
  content: string | React.ReactNode;
  alt?: string;
}) {
  if (typeof content !== "string") {
    return <div className="w-full h-full">{content}</div>;
  }

  const isVideo = /\.(mp4|webm|ogg)$/i.test(content);
  const isImage =
    /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(content) ||
    /unsplash|images\./i.test(content);

  if (isVideo) {
    return (
      <video
        src={content}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  if (isImage) {
    return (
      <img src={content} alt={alt} className="w-full h-full object-cover" />
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
    </div>
  );
}

// ── 0. 5-Step 3D Mobile Roadmap Interactive Journey ────────────────────────────
const roadmapSteps = [
  {
    id: 1,
    title: "Main Dashboard",
    tag: "Student Hub",
    description: "Personalized student hub with 48h drops, Tech Stories, active tracks, and quick navigation.",
    image: "/images/roadmap_step1_dashboard.png",
    actionHint: "Tap phone or scroll to visit Career Path",
  },
  {
    id: 2,
    title: "Career Path & Roadmaps",
    tag: "Curated Pathways",
    description: "Browse comprehensive career roadmaps across modern engineering domains like Python, Full-Stack and AI.",
    image: "/images/roadmap_step2_careerpath.png",
    actionHint: "Tap Python to inspect roadmap",
  },
  {
    id: 3,
    title: "Python Roadmap Overview",
    tag: "13 Stations & Milestones",
    description: "Structured 40 hours of content, 100 curated videos, 25 interactive quizzes, and 3 production projects.",
    image: "/images/roadmap_step3_overview.png",
    actionHint: "Scroll down to curriculum tree",
  },
  {
    id: 4,
    title: "Python Learning Tree",
    tag: "54 Lessons & Stations",
    description: "Modular curriculum tree breaking down Introduction, Strings, Data Structures, OOP, and advanced concepts.",
    image: "/images/roadmap_step4_tree.png",
    actionHint: "Tap Topic 1 to launch video lesson",
  },
  {
    id: 5,
    title: "Curated 4K Video Lessons",
    tag: "Telusko Video & Docs",
    description: "Zero-fluff YouTube video lessons from top instructors, syntax guides & official documentation.",
    image: "/images/roadmap_step5_video.png",
    actionHint: "Complete! Tap for SkillBits →",
  },
];

function RoadmapScrollShowcase({
  step = 0,
  direction = 1,
  onStepChange,
  onNextCard,
}: {
  step?: number;
  direction?: number;
  onStepChange?: (index: number) => void;
  onNextCard?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-9, 9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Click on phone advances to next screen or next card if complete
  const handlePhoneClick = () => {
    if (step < roadmapSteps.length - 1) {
      onStepChange?.(step + 1);
    } else {
      onNextCard?.();
    }
  };

  // Wheel Scroll Cycling with Cooldown
  const lastWheelTime = React.useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 380) return;
    if (e.deltaY > 18) {
      if (step < roadmapSteps.length - 1) {
        onStepChange?.(step + 1);
        lastWheelTime.current = now;
      } else {
        onNextCard?.();
        lastWheelTime.current = now;
      }
    } else if (e.deltaY < -18) {
      if (step > 0) {
        onStepChange?.(step - 1);
        lastWheelTime.current = now;
      }
    }
  };

  const current = roadmapSteps[step] || roadmapSteps[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full perspective-[1200px]"
    >
      {/* Background ambient lighting directly behind the phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Step Badge Above Phone */}
      <div className="relative z-20 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C8B6FF]/30 text-xs text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#C8B6FF] animate-pulse" />
        <span className="font-bold text-[#C8B6FF]">Step 0{step + 1} of 05</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-200 font-medium">{current.title}</span>
      </div>

      {/* 3D Interactive Smartphone Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={handlePhoneClick}
        title={step < 4 ? "Click or scroll wheel to advance" : "Click to go to SkillBits"}
        className="relative z-10 cursor-pointer w-[230px] sm:w-[245px] lg:w-[255px] aspect-[500/1020] flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_25px_60px_-15px_rgba(200,182,255,0.25)]"
      >
        {/* Physical side buttons */}
        <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-25 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-37 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-zinc-600 rounded-r" />

        {/* Outer Phone Bezel Chassis */}
        <div className="relative w-full h-full rounded-[38px] p-[5px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-[2px] border-zinc-600/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),_0_0_40px_rgba(200,182,255,0.2)] ring-1 ring-white/10">
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black shadow-inner">
            {/* Dynamic Island Pill Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Buttery Smooth Concurrent 3D Crossfade & Layer Transition */}
            <div className="relative w-full h-full">
              {roadmapSteps.map((s, idx) => {
                const isActive = step === idx;
                const isPast = idx < step;
                return (
                  <motion.div
                    key={s.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.95,
                      rotateY: isActive ? 0 : isPast ? -8 : 8,
                      y: isActive ? 0 : isPast ? -8 : 8,
                      filter: isActive ? "blur(0px)" : "blur(3px)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                    style={{
                      zIndex: isActive ? 10 : 1,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-top"
                      priority
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />

            {/* Click Tap Helper Prompt on Screen Bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium pointer-events-none whitespace-nowrap shadow-lg">
              <span>{current.actionHint}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── 1. SkillBits Interactive Reel Showcase (Images 1 & 2) ─────────────────────
const skillbitsSteps = [
  {
    id: 1,
    title: "Student Hub & 48h Drops",
    tag: "Discover & Drop-ins",
    image: "/images/skillbits_step1_home.jpg",
    actionHint: "Tap phone to launch SkillBit Reel →",
  },
  {
    id: 2,
    title: "Interactive SkillBits Reel",
    tag: "Python vs JavaScript",
    image: "/images/skillbits_step2_reel.png",
    actionHint: "Complete! Tap for Scholarships & Events →",
  },
];

function SkillBitsShowcase({
  step = 0,
  onStepChange,
  onNextCard,
}: {
  step?: number;
  onStepChange?: (index: number) => void;
  onNextCard?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-9, 9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePhoneClick = () => {
    if (step < skillbitsSteps.length - 1) {
      onStepChange?.(step + 1);
    } else {
      onNextCard?.();
    }
  };

  const lastWheelTime = React.useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 380) return;
    if (e.deltaY > 18) {
      if (step < skillbitsSteps.length - 1) {
        onStepChange?.(step + 1);
        lastWheelTime.current = now;
      } else {
        onNextCard?.();
        lastWheelTime.current = now;
      }
    } else if (e.deltaY < -18) {
      if (step > 0) {
        onStepChange?.(step - 1);
        lastWheelTime.current = now;
      }
    }
  };

  const current = skillbitsSteps[step] || skillbitsSteps[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full perspective-[1200px]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Step Badge Above Phone */}
      <div className="relative z-20 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C8B6FF]/30 text-xs text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#C8B6FF] animate-pulse" />
        <span className="font-bold text-[#C8B6FF]">Reel 0{step + 1} of 02</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-200 font-medium">{current.title}</span>
      </div>

      {/* 3D Interactive Smartphone Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={handlePhoneClick}
        title={step < 1 ? "Click to view SkillBit Reel" : "Click to advance to Scholarships & Events"}
        className="relative z-10 cursor-pointer w-[230px] sm:w-[245px] lg:w-[255px] aspect-[500/1020] flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_25px_60px_-15px_rgba(200,182,255,0.25)]"
      >
        {/* Physical side buttons */}
        <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-25 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-37 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-zinc-600 rounded-r" />

        {/* Outer Phone Bezel Chassis */}
        <div className="relative w-full h-full rounded-[38px] p-[5px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-[2px] border-zinc-600/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),_0_0_40px_rgba(200,182,255,0.2)] ring-1 ring-white/10">
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black shadow-inner">
            {/* Dynamic Island Pill Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Concurrent Crossfade Transition */}
            <div className="relative w-full h-full">
              {skillbitsSteps.map((s, idx) => {
                const isActive = step === idx;
                const isPast = idx < step;
                return (
                  <motion.div
                    key={s.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.95,
                      rotateY: isActive ? 0 : isPast ? -8 : 8,
                      y: isActive ? 0 : isPast ? -8 : 8,
                      filter: isActive ? "blur(0px)" : "blur(3px)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                    style={{
                      zIndex: isActive ? 10 : 1,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-top"
                      priority
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />

            {/* Click Tap Helper Prompt on Screen Bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium pointer-events-none whitespace-nowrap shadow-lg">
              <span>{current.actionHint}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── 2. Scholarships, Events & Tech News Showcase (Images 3, 4, 5) ─────────────
const eventsSteps = [
  {
    id: 1,
    title: "Tech Stories & 48h Drops",
    tag: "Daily Tech Insights",
    image: "/images/events_step1_techstories.jpg",
    actionHint: "Tap phone for Scholarships →",
  },
  {
    id: 2,
    title: "Verified Scholarships",
    tag: "Tuition Grants & Programs",
    image: "/images/events_step2_scholarships.jpg",
    actionHint: "Tap phone for Events & Hackathons →",
  },
  {
    id: 3,
    title: "Events & Hackathons",
    tag: "NVIDIA & Amazon Summits",
    image: "/images/events_step3_events.jpg",
    actionHint: "Complete! Tap for DSA Practice →",
  },
];

function EventsScholarshipsShowcase({
  step = 0,
  onStepChange,
  onNextCard,
}: {
  step?: number;
  onStepChange?: (index: number) => void;
  onNextCard?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-9, 9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePhoneClick = () => {
    if (step < eventsSteps.length - 1) {
      onStepChange?.(step + 1);
    } else {
      onNextCard?.();
    }
  };

  const lastWheelTime = React.useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 380) return;
    if (e.deltaY > 18) {
      if (step < eventsSteps.length - 1) {
        onStepChange?.(step + 1);
        lastWheelTime.current = now;
      } else {
        onNextCard?.();
        lastWheelTime.current = now;
      }
    } else if (e.deltaY < -18) {
      if (step > 0) {
        onStepChange?.(step - 1);
        lastWheelTime.current = now;
      }
    }
  };

  const current = eventsSteps[step] || eventsSteps[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full perspective-[1200px]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-blue-600/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Step Badge Above Phone */}
      <div className="relative z-20 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C8B6FF]/30 text-xs text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#C8B6FF] animate-pulse" />
        <span className="font-bold text-[#C8B6FF]">Update 0{step + 1} of 03</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-200 font-medium">{current.title}</span>
      </div>

      {/* 3D Interactive Smartphone Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={handlePhoneClick}
        title={step < 2 ? "Click to advance" : "Click to view DSA Practice"}
        className="relative z-10 cursor-pointer w-[230px] sm:w-[245px] lg:w-[255px] aspect-[500/1020] flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_25px_60px_-15px_rgba(200,182,255,0.25)]"
      >
        {/* Physical side buttons */}
        <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-25 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-37 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-zinc-600 rounded-r" />

        {/* Outer Phone Bezel Chassis */}
        <div className="relative w-full h-full rounded-[38px] p-[5px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-[2px] border-zinc-600/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),_0_0_40px_rgba(200,182,255,0.2)] ring-1 ring-white/10">
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black shadow-inner">
            {/* Dynamic Island Pill Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Concurrent Crossfade Transition */}
            <div className="relative w-full h-full">
              {eventsSteps.map((s, idx) => {
                const isActive = step === idx;
                const isPast = idx < step;
                return (
                  <motion.div
                    key={s.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.95,
                      rotateY: isActive ? 0 : isPast ? -8 : 8,
                      y: isActive ? 0 : isPast ? -8 : 8,
                      filter: isActive ? "blur(0px)" : "blur(3px)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                    style={{
                      zIndex: isActive ? 10 : 1,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-top"
                      priority
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />

            {/* Click Tap Helper Prompt on Screen Bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium pointer-events-none whitespace-nowrap shadow-lg">
              <span>{current.actionHint}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── 3. DSA Practice & Learning Track Showcase (Images 1, 2, 3, 4) ─────────────
const dsaSteps = [
  {
    id: 1,
    title: "Practice Hub & Navigation",
    tag: "Concept to Mastery",
    image: "/images/dsa_step1_hub.jpg",
    actionHint: "Tap phone to view Coding Practice →",
  },
  {
    id: 2,
    title: "Coding Practice & Top Companies",
    tag: "Amazon, Google & FAANG Patterns",
    image: "/images/dsa_step2_coding.jpg",
    actionHint: "Tap phone to view Learning Progress →",
  },
  {
    id: 3,
    title: "Skill Explorer & Progress",
    tag: "Saved Videos & Day Streaks",
    image: "/images/dsa_step3_progress.jpg",
    actionHint: "Tap phone to view Learning Tracks →",
  },
  {
    id: 4,
    title: "Saved Playlists & Video Tracks",
    tag: "Curated CodeWithHarry & Telusko Tracks",
    image: "/images/dsa_step4_playlists.jpg",
    actionHint: "Complete! Tap for Interview Prep →",
  },
];

function DsaPracticeShowcase({
  step = 0,
  onStepChange,
  onNextCard,
}: {
  step?: number;
  onStepChange?: (index: number) => void;
  onNextCard?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-9, 9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handlePhoneClick = () => {
    if (step < dsaSteps.length - 1) {
      onStepChange?.(step + 1);
    } else {
      onNextCard?.();
    }
  };

  const lastWheelTime = React.useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 380) return;
    if (e.deltaY > 18) {
      if (step < dsaSteps.length - 1) {
        onStepChange?.(step + 1);
        lastWheelTime.current = now;
      } else {
        onNextCard?.();
        lastWheelTime.current = now;
      }
    } else if (e.deltaY < -18) {
      if (step > 0) {
        onStepChange?.(step - 1);
        lastWheelTime.current = now;
      }
    }
  };

  const current = dsaSteps[step] || dsaSteps[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full perspective-[1200px]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-emerald-600/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Step Badge Above Phone */}
      <div className="relative z-20 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C8B6FF]/30 text-xs text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#C8B6FF] animate-pulse" />
        <span className="font-bold text-[#C8B6FF]">Module 0{step + 1} of 04</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-200 font-medium">{current.title}</span>
      </div>

      {/* 3D Interactive Smartphone Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={handlePhoneClick}
        title={step < 3 ? "Click to advance" : "Click to view Interview Prep"}
        className="relative z-10 cursor-pointer w-[230px] sm:w-[245px] lg:w-[255px] aspect-[500/1020] flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_25px_60px_-15px_rgba(200,182,255,0.25)]"
      >
        {/* Physical side buttons */}
        <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-25 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-37 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-zinc-600 rounded-r" />

        {/* Outer Phone Bezel Chassis */}
        <div className="relative w-full h-full rounded-[38px] p-[5px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-[2px] border-zinc-600/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),_0_0_40px_rgba(200,182,255,0.2)] ring-1 ring-white/10">
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black shadow-inner">
            {/* Dynamic Island Pill Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Concurrent Crossfade Transition */}
            <div className="relative w-full h-full">
              {dsaSteps.map((s, idx) => {
                const isActive = step === idx;
                const isPast = idx < step;
                return (
                  <motion.div
                    key={s.id}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.95,
                      rotateY: isActive ? 0 : isPast ? -8 : 8,
                      y: isActive ? 0 : isPast ? -8 : 8,
                      filter: isActive ? "blur(0px)" : "blur(3px)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                    style={{
                      zIndex: isActive ? 10 : 1,
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-top"
                      priority
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />

            {/* Click Tap Helper Prompt on Screen Bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium pointer-events-none whitespace-nowrap shadow-lg">
              <span>{current.actionHint}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── 4. Placement & Interview Prep Showcase (Image 5) ──────────────────────────
function InterviewPrepShowcase({
  onNextCard,
}: {
  onNextCard?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 3D Mouse Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-9, 9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center select-none py-2 w-full perspective-[1200px]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Step Badge Above Phone */}
      <div className="relative z-20 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C8B6FF]/30 text-xs text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-[#C8B6FF] animate-pulse" />
        <span className="font-bold text-[#C8B6FF]">Career Prep</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-200 font-medium">Placement & AI Interviews</span>
      </div>

      {/* 3D Interactive Smartphone Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onClick={onNextCard}
        title="Tap to restart flow"
        className="relative z-10 cursor-pointer w-[230px] sm:w-[245px] lg:w-[255px] aspect-[500/1020] flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_25px_60px_-15px_rgba(200,182,255,0.25)]"
      >
        {/* Physical side buttons */}
        <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-25 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -left-[3px] top-37 w-[3px] h-9 bg-zinc-600 rounded-l" />
        <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-zinc-600 rounded-r" />

        {/* Outer Phone Bezel Chassis */}
        <div className="relative w-full h-full rounded-[38px] p-[5px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-[2px] border-zinc-600/80 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),_0_0_40px_rgba(200,182,255,0.2)] ring-1 ring-white/10">
          {/* Inner Phone Screen */}
          <div className="relative w-full h-full rounded-[33px] overflow-hidden bg-black shadow-inner">
            {/* Dynamic Island Pill Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            <div className="relative w-full h-full">
              <Image
                src="/images/interview_step1_placement.jpg"
                alt="Placement & Career Acceleration"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />

            {/* Click Tap Helper Prompt on Screen Bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium pointer-events-none whitespace-nowrap shadow-lg">
              <span>Restart Flow ↻</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeaturesWithPanel() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [roadmapStep, setRoadmapStep] = React.useState(0);
  const [skillbitsStep, setSkillbitsStep] = React.useState(0);
  const [eventsStep, setEventsStep] = React.useState(0);
  const [dsaStep, setDsaStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  // Exact same scroll transition as Ecosystem Orbiting Circles (GSAP ScrollTrigger pin & scrub)
  React.useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const updateStageFromProgress = (progress: number) => {
      const clamped = Math.min(0.999, Math.max(0, progress));
      // 15 stages total across 5 cards:
      // 0-4 (Roadmap 5 steps)
      // 5-6 (SkillBits 2 steps)
      // 7-9 (Events / Scholarships / Tech Stories 3 steps)
      // 10-13 (DSA Practice & Learning Track 4 steps)
      // 14 (Placement & Interview Prep 1 step)
      const stage = Math.floor(clamped * 15);

      if (stage <= 4) {
        setActive(0);
        setRoadmapStep((prev) => {
          if (prev !== stage) {
            setDirection(stage > prev ? 1 : -1);
            return stage;
          }
          return prev;
        });
      } else if (stage <= 6) {
        setActive(1);
        setSkillbitsStep(stage - 5);
      } else if (stage <= 9) {
        setActive(2);
        setEventsStep(stage - 7);
      } else if (stage <= 13) {
        setActive(3);
        setDsaStep(stage - 10);
      } else {
        setActive(4);
      }
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop & Tablet: Smooth scroll-pinned continuous sequence across all 5 cards (15 total stages)
      mm.add("(min-width: 768px)", () => {
        gsap.timeline({
          scrollTrigger: {
            id: "features-roadmap-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=4500",
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => updateStageFromProgress(self.progress),
          },
        });
      });

      // Mobile: Compact pin distance with fluid scrub across cards
      mm.add("(max-width: 767px)", () => {
        gsap.timeline({
          scrollTrigger: {
            id: "features-roadmap-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=3200",
            pin: true,
            pinSpacing: true,
            scrub: 1.0,
            anticipatePin: 1,
            onUpdate: (self) => updateStageFromProgress(self.progress),
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const goToStage = (targetStage: number) => {
    const st = ScrollTrigger.getById("features-roadmap-trigger");
    if (st) {
      const targetScroll = st.start + (st.end - st.start) * ((targetStage + 0.5) / 15);
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (cardIndex: number) => {
    setActive(cardIndex);
    if (cardIndex === 0) {
      goToStage(roadmapStep);
    } else if (cardIndex === 1) {
      goToStage(5 + skillbitsStep);
    } else if (cardIndex === 2) {
      goToStage(7 + eventsStep);
    } else if (cardIndex === 3) {
      goToStage(10 + dsaStep);
    } else if (cardIndex === 4) {
      goToStage(14);
    }
  };

  const handleNextFromRoadmap = () => {
    setActive(1);
    setSkillbitsStep(0);
    goToStage(5);
  };

  const handleNextFromSkillbits = () => {
    setActive(2);
    setEventsStep(0);
    goToStage(7);
  };

  const handleNextFromEvents = () => {
    setActive(3);
    setDsaStep(0);
    goToStage(10);
  };

  const handleNextFromDsa = () => {
    setActive(4);
    goToStage(14);
  };

  const handleNextFromInterview = () => {
    setActive(0);
    setRoadmapStep(0);
    goToStage(0);
  };

  // Dynamic feature items with controlled previews and continuous progression across 5 cards
  const featureList: FeatureItem[] = [
    {
      title: "Roadmaps with Resources & Curated Videos.",
      alt: "Explore step-by-step career pathways from main dashboard to full curriculum tree and verified YouTube 4K video lessons.",
      badge: "Interactive Flow",
      content: (
        <RoadmapScrollShowcase
          step={roadmapStep}
          direction={direction}
          onStepChange={(stepIdx) => {
            setRoadmapStep(stepIdx);
            goToStage(stepIdx);
          }}
          onNextCard={handleNextFromRoadmap}
        />
      ),
    },
    {
      title: "SkillBits — High-Impact Video Reels.",
      alt: "Bite-sized, zero-fluff coding concepts and architectural insights in 45-second interactive clips.",
      badge: "Bite-Sized",
      content: (
        <SkillBitsShowcase
          step={skillbitsStep}
          onStepChange={(sIdx) => {
            setSkillbitsStep(sIdx);
            goToStage(5 + sIdx);
          }}
          onNextCard={handleNextFromSkillbits}
        />
      ),
    },
    {
      title: "Scholarships, Events & Tech News.",
      alt: "Direct access to top hackathons, verified student scholarships, and daily engineering breakthroughs.",
      badge: "Opportunities",
      content: (
        <EventsScholarshipsShowcase
          step={eventsStep}
          onStepChange={(eIdx) => {
            setEventsStep(eIdx);
            goToStage(7 + eIdx);
          }}
          onNextCard={handleNextFromEvents}
        />
      ),
    },
    {
      title: "DSA Practice & Learning Track.",
      alt: "Structured problem solving, pattern mastery for top tech firms, and curated video learning tracks.",
      badge: "Practice & Tracks",
      content: (
        <DsaPracticeShowcase
          step={dsaStep}
          onStepChange={(dIdx) => {
            setDsaStep(dIdx);
            goToStage(10 + dIdx);
          }}
          onNextCard={handleNextFromDsa}
        />
      ),
    },
    {
      title: "Placement & Interview Prep.",
      alt: "ATS resume reviews, quantitative & logical reasoning drills, and real-time AI interview practice.",
      badge: "Career Ready",
      content: (
        <InterviewPrepShowcase onNextCard={handleNextFromInterview} />
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center bg-[#06070D] text-white overflow-hidden border-t border-white/10 select-none py-10 lg:py-14"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-900/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#C8B6FF]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header positioned towards left side corner */}
      <div className="w-full max-w-[1440px] xl:max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14 mb-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Features in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C8B6FF] to-purple-400">
            SkillsCatalyst
          </span>
        </h2>
      </div>

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-14 lg:items-center">
          {/* Left: Feature List */}
          <div>
            <ul className="flex flex-col gap-2.5">
              {featureList.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  onClick={() => handleCardClick(index)}
                  className={cn(
                    "flex flex-col px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200 border",
                    active === index
                      ? "bg-white/[0.08] border-[#C8B6FF]/50 ring-1 ring-[#C8B6FF]/40 shadow-xl shadow-[#C8B6FF]/10"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  )}
                >
                  <div className="flex flex-row items-center gap-4 w-full">
                    <span
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200",
                        active === index
                          ? "bg-[#C8B6FF] text-black shadow-md shadow-[#C8B6FF]/30"
                          : "bg-white/10 text-zinc-400"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-base font-bold transition-colors duration-200",
                          active === index ? "text-white" : "text-zinc-300"
                        )}
                      >
                        {item.title}
                      </span>
                      {item.alt && (
                        <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed hidden sm:block">
                          {item.alt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Preview Accordion Dropdown */}
                  <AnimatePresence initial={false}>
                    {active === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full overflow-hidden lg:hidden mt-4 flex items-center justify-center py-2"
                      >
                        <FeatureMedia
                          content={item.content}
                          alt={item.alt}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right: Sticky Media Panel (Desktop) - No Card Backside */}
          <div className="hidden lg:flex items-center justify-center sticky top-20 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="w-full flex items-center justify-center"
              >
                <FeatureMedia
                  content={featureList[active].content}
                  alt={featureList[active].alt}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
