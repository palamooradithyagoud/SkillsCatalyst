"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  Ticket,
  ShieldCheck,
  RefreshCw,
  Clock,
  HeartHandshake,
  Headset,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Lightweight Lenis-compatible wrapper
const ReactLenis = ({ children }: { children: React.ReactNode; root?: boolean }) => {
  return <div className="w-full">{children}</div>;
};

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
  className?: string;
};

// ── 1. Character Kinetic Convergence ──────────────────────────────────────────
const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
  className,
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 45, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 45, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.5], [0.35, 0.85, 1]);

  return (
    <motion.span
      className={cn(
        "inline-block bg-gradient-to-r from-[#6B21A8] via-[#7E22CE] to-[#EC4899] bg-clip-text text-transparent font-black drop-shadow-xs will-change-transform",
        isSpace && "w-3 sm:w-5 md:w-6",
        className
      )}
      style={{ x, rotateX, opacity }}
    >
      {char}
    </motion.span>
  );
};

// ── 2. Support Channel Cards Convergence ──────────────────────────────────────
type SupportChannel = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  accent: "purple" | "pink";
};

type ChannelItemProps = {
  item: SupportChannel;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
};

const SupportChannelItem = ({
  item,
  index,
  centerIndex,
  scrollYProgress,
}: ChannelItemProps) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [Math.abs(distanceFromCenter) * 35, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.5], [0.3, 0.85, 1]);

  const Icon = item.icon;
  const isPink = item.accent === "pink";

  return (
    <motion.div
      style={{ x, scale, y, opacity, transformOrigin: "center" }}
      className={`will-change-transform flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border shadow-md transition-all select-none w-full sm:w-[270px] ${
        isPink
          ? "border-pink-200/80 shadow-pink-500/5 hover:border-pink-400 hover:shadow-pink-500/15"
          : "border-purple-200/80 shadow-purple-500/5 hover:border-purple-400 hover:shadow-purple-500/15"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          isPink
            ? "bg-pink-50 text-pink-600 border border-pink-100"
            : "bg-purple-50 text-purple-700 border border-purple-100"
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
            {item.title}
          </span>
          {item.badge && (
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                isPink ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"
              }`}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
          {item.subtitle}
        </p>
      </div>
    </motion.div>
  );
};

// ── 3. Support Guarantees / Service Pillars 3D Perspective Convergence ────────
type SupportPillar = {
  icon: React.ElementType;
  title: string;
  description: string;
  stat: string;
  accent: "purple" | "pink";
};

type PillarItemProps = {
  item: SupportPillar;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
};

const SupportPillarItem = ({
  item,
  index,
  centerIndex,
  scrollYProgress,
}: PillarItemProps) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 70, 0]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 30, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [-Math.abs(distanceFromCenter) * 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.5], [0.3, 0.85, 1]);

  const Icon = item.icon;
  const isPink = item.accent === "pink";

  return (
    <motion.div
      style={{ x, rotate, y, scale, opacity, transformOrigin: "center" }}
      className={`will-change-transform flex-1 min-w-[220px] max-w-[270px] p-5 rounded-3xl bg-white border shadow-lg transition-all select-none ${
        isPink
          ? "border-pink-200/80 shadow-pink-500/5 hover:border-pink-400 hover:shadow-pink-500/15"
          : "border-purple-200/80 shadow-purple-500/5 hover:border-purple-400 hover:shadow-purple-500/15"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isPink
              ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20"
              : "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-md shadow-purple-500/20"
          }`}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
            isPink
              ? "bg-pink-50 text-pink-700 border border-pink-200/60"
              : "bg-purple-50 text-purple-700 border border-purple-200/60"
          }`}
        >
          {item.stat}
        </span>
      </div>

      <h4 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
        {item.title}
      </h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1.5">
        {item.description}
      </p>
    </motion.div>
  );
};

// ── SVG Decorative Bracket ────────────────────────────────────────────────────
const Bracket = ({ className }: { className: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
};

// ── Service Support Data Set ──────────────────────────────────────────────────
const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    icon: Phone,
    title: "Direct Phone Call",
    subtitle: "+91 7330602101",
    badge: "Instant Call",
    accent: "purple",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Chat",
    subtitle: "Fastest turnaround time",
    badge: "Instant Chat",
    accent: "pink",
  },
  {
    icon: Mail,
    title: "Founder Email",
    subtitle: "palamooradithyagoud@gmail.com",
    badge: "Direct Inbox",
    accent: "purple",
  },
  {
    icon: Ticket,
    title: "Ticket Portal",
    subtitle: "Trackable support tickets",
    badge: "24h SLA",
    accent: "pink",
  },
  {
    icon: ShieldCheck,
    title: "DPDP 2023 Security",
    subtitle: "AES-256 encrypted learner data",
    badge: "Verified",
    accent: "purple",
  },
  {
    icon: RefreshCw,
    title: "7-Day Refund",
    subtitle: "100% money-back guarantee",
    badge: "No Questions",
    accent: "pink",
  },
];

const SUPPORT_PILLARS: SupportPillar[] = [
  {
    icon: Clock,
    title: "24-Hour Resolution SLA",
    description: "Every support query is acknowledged within 2-4 hours and fully resolved within 24 hours.",
    stat: "< 24h SLA",
    accent: "purple",
  },
  {
    icon: HeartHandshake,
    title: "Personal Founder Review",
    description: "Every ticket and curriculum request is personally evaluated by founder Palamoor Adithya Goud.",
    stat: "Personal",
    accent: "pink",
  },
  {
    icon: ShieldCheck,
    title: "DPDP Act & GDPR Privacy",
    description: "Strict zero-data-selling pledge. All resumes, coding credentials, and profiles remain strictly confidential.",
    stat: "Encrypted",
    accent: "purple",
  },
  {
    icon: RefreshCw,
    title: "Fair 7-Day Money Back",
    description: "100% money-back guarantee for all 1-Month and 3-Month Pro passes with prompt UPI/card processing.",
    stat: "100% Refund",
    accent: "pink",
  },
];

interface Skiper31Props {
  text?: string;
  subtitle?: string;
  className?: string;
}

const Skiper31 = ({
  text = "DIRECT FOUNDER SUPPORT",
  subtitle = "direct student care & multi-channel assistance",
  className,
}: Skiper31Props) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start end", "end start"] });
  const { scrollYProgress: scrollYProgress2 } = useScroll({ target: targetRef2, offset: ["start end", "end start"] });
  const { scrollYProgress: scrollYProgress3 } = useScroll({ target: targetRef3, offset: ["start end", "end start"] });

  const characters = text.toUpperCase().split("");
  const centerIndex = Math.floor(characters.length / 2);
  const channelCenterIndex = Math.floor(SUPPORT_CHANNELS.length / 2);
  const pillarCenterIndex = Math.floor(SUPPORT_PILLARS.length / 2);

  return (
    <ReactLenis root>
      <section className={cn("w-full relative overflow-hidden rounded-[28px] my-6 space-y-4", className)}>
        {/* ── Block 1: 3D Perspective Service Support Typography ── */}
        <div
          ref={targetRef}
          className="relative box-border flex min-h-[60vh] sm:min-h-[75vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF8FD] via-white to-[#FDF4F8] p-6 sm:p-12 border border-purple-100 rounded-[28px]"
        >
          {/* Ambient Glow Orbs in Pink & Purple */}
          <div className="absolute top-1/4 left-1/4 w-[320px] h-[320px] rounded-full bg-purple-400/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-pink-400/10 blur-[80px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold uppercase tracking-wider mb-5">
            <Headset className="w-3.5 h-3.5 text-pink-600" />
            <span>Customer Service Promise</span>
          </div>

          <div
            className="w-full max-w-5xl text-center text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-none select-none"
            style={{ perspective: "600px" }}
          >
            {characters.map((char, index) => (
              <CharacterV1
                key={index}
                char={char}
                index={index}
                centerIndex={centerIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-xl text-center mt-6">
            Personal student care, fast turnaround time & statutory grievance redressal.
          </p>
        </div>

        {/* ── Block 2: Service Channels Convergence ── */}
        <div
          ref={targetRef2}
          className="relative box-border flex min-h-[60vh] sm:min-h-[75vh] flex-col items-center justify-center gap-7 overflow-hidden bg-gradient-to-b from-[#FDF4F8] via-white to-[#FAF8FD] p-6 sm:p-12 border border-purple-100 rounded-[28px]"
        >
          <div className="flex items-center justify-center gap-3 text-base sm:text-2xl font-extrabold tracking-tight text-slate-900 text-center">
            <Bracket className="h-8 sm:h-11 text-purple-600 shrink-0" />
            <span className="bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              choose your preferred support channel
            </span>
            <Bracket className="h-8 sm:h-11 scale-x-[-1] text-pink-600 shrink-0" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 max-w-5xl">
            {SUPPORT_CHANNELS.map((item, index) => (
              <SupportChannelItem
                key={item.title}
                item={item}
                index={index}
                centerIndex={channelCenterIndex}
                scrollYProgress={scrollYProgress2}
              />
            ))}
          </div>
        </div>

        {/* ── Block 3: Student-First Service Commitments (3D Perspective Tilting) ── */}
        <div
          ref={targetRef3}
          className="relative box-border flex min-h-[60vh] sm:min-h-[75vh] flex-col items-center justify-center gap-7 overflow-hidden bg-gradient-to-b from-[#FAF8FD] via-white to-white p-6 sm:p-12 border border-pink-100 rounded-[28px]"
        >
          <div className="flex items-center justify-center gap-3 text-base sm:text-2xl font-extrabold tracking-tight text-slate-900 text-center">
            <Bracket className="h-8 sm:h-11 text-pink-600 shrink-0" />
            <span className="bg-gradient-to-r from-pink-600 to-purple-700 bg-clip-text text-transparent">
              our student-first service commitments
            </span>
            <Bracket className="h-8 sm:h-11 scale-x-[-1] text-purple-600 shrink-0" />
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-5xl"
            style={{ perspective: "600px" }}
          >
            {SUPPORT_PILLARS.map((item, index) => (
              <SupportPillarItem
                key={item.title}
                item={item}
                index={index}
                centerIndex={pillarCenterIndex}
                scrollYProgress={scrollYProgress3}
              />
            ))}
          </div>
        </div>
      </section>
    </ReactLenis>
  );
};

export { CharacterV1, SupportChannelItem, SupportPillarItem, Bracket, Skiper31 };
export default Skiper31;
