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
  Sparkles,
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
    actionHint: "Lesson complete! Quizzes ready",
  },
];

function RoadmapScrollShowcase({
  step = 0,
  direction = 1,
  onStepChange,
}: {
  step?: number;
  direction?: number;
  onStepChange?: (index: number) => void;
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

  // Click on phone advances to next screen
  const handlePhoneClick = () => {
    const next = (step + 1) % roadmapSteps.length;
    onStepChange?.(next);
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
        title="Click or scroll wheel to advance"
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

// ── 1. SkillBits Interactive Reel Mockup ───────────────────────────────────────
function SkillBitsPreview() {
  return (
    <div className="relative flex items-center justify-center select-none py-2 w-full">
      {/* Background ambient lighting directly behind the phone - no card box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-purple-600/25 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Realistic Compact Smartphone Frame */}
      <div className="relative z-10 w-[230px] sm:w-[245px] lg:w-[255px] aspect-[462/875] flex items-center justify-center">
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
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-20 flex items-center justify-end px-1.5 border border-white/10 shadow-sm pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Cropped Real SkillBits Screenshot */}
            <Image
              src="/images/skillbits_preview.png"
              alt="SkillBits Mobile Reel Preview"
              fill
              sizes="(max-width: 768px) 100vw, 450px"
              className="object-cover object-top"
              priority
            />

            {/* Subtle Glass Glare Sheen Reflection */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Scholarships, Events & Tech News Mockup ─────────────────────────────────
function ScholarshipsEventsPreview() {
  return (
    <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl border border-[#C8B6FF]/30 bg-black/85 backdrop-blur-xl p-5 sm:p-7 flex flex-col justify-between select-none overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),_0_0_35px_rgba(200,182,255,0.12)]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Verified Student Portal</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live Deadlines
        </span>
      </div>

      {/* Featured Event Card */}
      <div className="relative z-10 my-auto flex flex-col gap-3 py-2">
        <div className="rounded-2xl bg-black/60 border border-white/15 p-4 backdrop-blur-xl hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              National Hackathon
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">₹5,00,000 Pool</span>
          </div>
          <h4 className="text-sm font-bold text-white">AI Innovation Buildathon 2026</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-zinc-500" /> Bengaluru & Hybrid · Closes in 4 Days
          </p>
        </div>

        <div className="rounded-2xl bg-black/60 border border-white/15 p-4 backdrop-blur-xl hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              Scholarship Grant
            </span>
            <span className="text-xs font-bold text-[#C8B6FF] font-mono">100% Tuition</span>
          </div>
          <h4 className="text-sm font-bold text-white">Future Tech Leaders Scholarship</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <Award className="w-3 h-3 text-zinc-500" /> Open for Computer Science Undergrads
          </p>
        </div>

        {/* Tech News Item */}
        <div className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium text-zinc-300 truncate">
              Tech News: OpenAI announces new Agentic Web Standards
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0">12m ago</span>
        </div>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Updated daily with direct apply links</span>
        <span className="text-blue-400 font-medium">Explore All →</span>
      </div>
    </div>
  );
}

// ── 3. Learning, Videos, Tracking & Roadmaps Mockup ────────────────────────────
function LearningRoadmapsPreview() {
  return (
    <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl border border-[#C8B6FF]/30 bg-black/85 backdrop-blur-xl p-5 sm:p-7 flex flex-col justify-between select-none overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),_0_0_35px_rgba(200,182,255,0.12)]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#C8B6FF]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
          <GraduationCap className="w-3.5 h-3.5 text-[#C8B6FF]" />
          <span>Full-Stack AI Career Roadmap</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
          <Flame className="w-3 h-3 fill-amber-400" />
          <span>14-Day Streak</span>
        </div>
      </div>

      {/* Center Roadmap Tracking Modules */}
      <div className="relative z-10 my-auto flex flex-col gap-2.5 py-2">
        {/* Module 1: Completed */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">Module 1: Modern Frontend Core</p>
            <p className="text-[10px] text-zinc-400">React 19, TypeScript & Tailwind CSS</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            100%
          </span>
        </div>

        {/* Module 2: In Progress */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/70 border border-[#C8B6FF]/50 shadow-md shadow-[#C8B6FF]/10">
          <div className="w-4 h-4 rounded-full border-2 border-[#C8B6FF] border-t-transparent animate-spin shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white">Module 2: High-Performance FastAPI</p>
            <p className="text-[10px] text-zinc-400">Async Workers, Redis Cache & Microservices</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-[#C8B6FF] bg-[#C8B6FF]/20 px-2 py-0.5 rounded-md">
            78%
          </span>
        </div>

        {/* Module 3: Up Next */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 opacity-70">
          <div className="w-4 h-4 rounded-full border border-zinc-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-300">Module 3: LLMs & AI Agent Pipelines</p>
            <p className="text-[10px] text-zinc-500">Groq, LangChain & Vector Embeddings</p>
          </div>
          <span className="text-[10px] font-medium text-zinc-500">Upcoming</span>
        </div>
      </div>

      {/* Footer Video Badge */}
      <div className="relative z-10 flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-zinc-400">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Play className="w-3 h-3 text-[#C8B6FF] fill-[#C8B6FF]" />
          Curated YouTube 4K Lessons
        </span>
        <span className="text-[#C8B6FF] font-medium">View Full Path →</span>
      </div>
    </div>
  );
}

// ── Feature Items Configuration ───────────────────────────────────────────────
const items: FeatureItem[] = [
  {
    title: "Roadmaps with Resources & Curated Videos.",
    alt: "Explore step-by-step career pathways from main dashboard to full curriculum tree and verified YouTube 4K video lessons.",
    badge: "Interactive Flow",
    content: <RoadmapScrollShowcase />,
  },
  {
    title: "SkillBits — High-Impact Video Reels.",
    alt: "Bite-sized, zero-fluff coding concepts and architectural insights in 45-second interactive clips.",
    badge: "Bite-Sized",
    content: <SkillBitsPreview />,
  },
  {
    title: "Scholarships, Events & Tech News.",
    alt: "Direct access to top hackathons, verified student scholarships, and daily engineering breakthroughs.",
    badge: "Opportunities",
    content: <ScholarshipsEventsPreview />,
  },
];

export default function FeaturesWithPanel() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [roadmapStep, setRoadmapStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  // Exact same scroll transition as Ecosystem Orbiting Circles (GSAP ScrollTrigger pin & scrub)
  React.useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop & Tablet: Smooth scroll-pinned 5-step animation (buttery smooth scrub)
      mm.add("(min-width: 768px)", () => {
        gsap.timeline({
          scrollTrigger: {
            id: "features-roadmap-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=2400",
            pin: true,
            pinSpacing: true,
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => {
              const clamped = Math.min(0.999, Math.max(0, self.progress));
              const step = Math.floor(clamped * 5);
              setRoadmapStep((prev) => {
                if (prev !== step) {
                  setDirection(step > prev ? 1 : -1);
                  return step;
                }
                return prev;
              });
            },
          },
        });
      });

      // Mobile: Compact pin distance with fluid scrub
      mm.add("(max-width: 767px)", () => {
        gsap.timeline({
          scrollTrigger: {
            id: "features-roadmap-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=1600",
            pin: true,
            pinSpacing: true,
            scrub: 1.0,
            anticipatePin: 1,
            onUpdate: (self) => {
              const clamped = Math.min(0.999, Math.max(0, self.progress));
              const step = Math.floor(clamped * 5);
              setRoadmapStep((prev) => {
                if (prev !== step) {
                  setDirection(step > prev ? 1 : -1);
                  return step;
                }
                return prev;
              });
            },
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToRoadmapStep = (stepIndex: number) => {
    setRoadmapStep(stepIndex);
    const st = ScrollTrigger.getById("features-roadmap-trigger");
    if (st) {
      const targetScroll = st.start + (st.end - st.start) * ((stepIndex + 0.5) / 5);
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Dynamic feature items with controlled RoadmapScrollShowcase
  const featureList: FeatureItem[] = [
    {
      title: "Roadmaps with Resources & Curated Videos.",
      alt: "Explore step-by-step career pathways from main dashboard to full curriculum tree and verified YouTube 4K video lessons.",
      badge: "Interactive Flow",
      content: (
        <RoadmapScrollShowcase
          step={roadmapStep}
          direction={direction}
          onStepChange={scrollToRoadmapStep}
        />
      ),
    },
    {
      title: "SkillBits — High-Impact Video Reels.",
      alt: "Bite-sized, zero-fluff coding concepts and architectural insights in 45-second interactive clips.",
      badge: "Bite-Sized",
      content: <SkillBitsPreview />,
    },
    {
      title: "Scholarships, Events & Tech News.",
      alt: "Direct access to top hackathons, verified student scholarships, and daily engineering breakthroughs.",
      badge: "Opportunities",
      content: <ScholarshipsEventsPreview />,
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
                  onClick={() => setActive(index)}
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

                  {/* Progressive Roadmap Milestones inside Step 1 (same as Orbit cards) */}
                  {active === 0 && index === 0 && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-1.5 w-full">
                      {roadmapSteps.map((s, sIdx) => (
                        <div
                          key={s.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToRoadmapStep(sIdx);
                          }}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 text-xs border",
                            roadmapStep === sIdx
                              ? "bg-white/10 border-[#C8B6FF]/50 text-white shadow-sm"
                              : "bg-black/20 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          )}
                        >
                          <span
                            className={cn(
                              "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                              roadmapStep === sIdx
                                ? "bg-[#C8B6FF] text-black"
                                : "bg-white/10 text-zinc-500"
                            )}
                          >
                            {sIdx + 1}
                          </span>
                          <span className="font-semibold truncate text-[11px]">{s.title}</span>
                          {roadmapStep === sIdx && (
                            <span className="ml-auto text-[9px] uppercase tracking-wider text-[#C8B6FF] font-bold">
                              Live
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

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
