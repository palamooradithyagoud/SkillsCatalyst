"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export interface OrbitingCirclesProps {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
}

export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-black/35 stroke-1"
            strokeDasharray="4 4"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        style={
          {
            "--radius": radius,
            animationName: "orbit",
            animationDuration: `${duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${-delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
        className={cn(
          "absolute inset-0 m-auto flex transform-gpu items-center justify-center rounded-full border border-black/15 bg-white shadow-md transition-transform hover:scale-110",
          className,
        )}
      >
        {children}
      </div>
    </>
  )
}

// ── The 6 Requested Icons: instagram, chatgpt, youtube, scholarships, events, interview ──
export const EcosystemIcons = {
  instagram: () => (
    <svg viewBox="0 0 24 24" className="size-full" fill="none">
      <defs>
        <radialGradient id="ig-grad-clean" cx="0.2" cy="1" r="1">
          <stop offset="0%" stopColor="#ffd521" />
          <stop offset="25%" stopColor="#f50000" />
          <stop offset="65%" stopColor="#b900b4" />
          <stop offset="100%" stopColor="#7024c4" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad-clean)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#ffffff" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.8" fill="none" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#ffffff" />
    </svg>
  ),

  chatgpt: () => (
    <svg viewBox="0 0 24 24" className="size-full" fill="#10a37f">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),

  youtube: () => (
    <svg viewBox="0 0 24 24" className="size-full">
      <rect x="2" y="4.5" width="20" height="15" rx="4" fill="#FF0000" />
      <polygon points="10,8.5 16,12 10,15.5" fill="#FFFFFF" />
    </svg>
  ),

  scholarships: () => (
    <svg viewBox="0 0 24 24" className="size-full" fill="none">
      <defs>
        <linearGradient id="schol-grad-clean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#schol-grad-clean)" />
      <path d="M12 6L4 10.5L12 15L20 10.5L12 6Z" fill="#ffffff" />
      <path d="M7 12.3V16C7 17.5 9.2 18.7 12 18.7C14.8 18.7 17 17.5 17 16V12.3" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.5 11.5V16" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19.5" cy="16.5" r="1" fill="#fef08a" />
    </svg>
  ),

  events: () => (
    <svg viewBox="0 0 24 24" className="size-full" fill="none">
      <defs>
        <linearGradient id="event-grad-clean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#event-grad-clean)" />
      <rect x="5.5" y="7" width="13" height="12" rx="2.5" fill="#ffffff" />
      <path d="M5.5 10.5H18.5" stroke="#6366f1" strokeWidth="1.4" />
      <line x1="8.5" y1="5.5" x2="8.5" y2="8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15.5" y1="5.5" x2="15.5" y2="8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="13.5" r="1" fill="#6366f1" />
      <circle cx="12" cy="13.5" r="1" fill="#6366f1" />
      <circle cx="15" cy="13.5" r="1" fill="#6366f1" />
      <circle cx="9" cy="16.5" r="1" fill="#6366f1" />
      <circle cx="12" cy="16.5" r="1" fill="#ec4899" />
    </svg>
  ),

  interview: () => (
    <svg viewBox="0 0 24 24" className="size-full" fill="none">
      <defs>
        <linearGradient id="intr-grad-clean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#intr-grad-clean)" />
      <rect x="6" y="9.5" width="12" height="9" rx="2" fill="#ffffff" />
      <path d="M9.5 9.5V7.5C9.5 6.7 10.1 6 11 6H13C13.9 6 14.5 6.7 14.5 7.5V9.5" stroke="#ffffff" strokeWidth="1.6" />
      <line x1="6" y1="13" x2="18" y2="13" stroke="#8b5cf6" strokeWidth="1.3" />
      <rect x="10.5" y="11.5" width="3" height="3" rx="0.8" fill="#ec4899" />
    </svg>
  ),
}

/**
 * Ecosystem Orbiting Section:
 * Pure clean white background, black dashed orbit rings,
 * with content on the left and the Orbiting Circles effect on the RIGHT side!
 */
export function EcosystemOrbitingSection() {
  const router = useRouter()

  return (
    <section className="relative w-full bg-white text-slate-900 py-16 sm:py-24 px-6 sm:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* ── LEFT SIDE: Compelling Story & Feature Highlights ── */}
        <div className="flex flex-col items-start text-left max-w-xl">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-5">
            <span>Connected Career Orbit</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Everything you need for your career,{" "}
            <span className="text-[#683594]">in one orbit.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            SkillsCatalyst unifies interactive AI mentoring, YouTube video roadmaps, mock interview engines, 
            verified scholarships, and live hackathons into a single cohesive ecosystem.
          </p>

          <div className="mt-8 space-y-3.5 w-full">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Real-time AI Mentorship & code debugging with Groq & Gemini</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Verified national & international scholarships matched to your profile</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Placement question bank with 910+ questions & mock interview simulators</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Active tech community events, workshops, and peer networks</span>
            </div>
          </div>

          <div className="mt-9 flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#683594] hover:bg-[#54287a] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Explore The Platform</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-all cursor-pointer"
            >
              <span>Join Community</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDE: The Orbiting Circles Effect with Black Rings ── */}
        <div className="relative flex h-[480px] sm:h-[540px] w-full items-center justify-center lg:justify-end">
          <div className="relative flex size-[440px] sm:size-[480px] items-center justify-center lg:translate-x-10 xl:translate-x-16">
            {/* Central Brand Hub Emblem */}
            <div className="relative z-20 flex flex-col items-center justify-center size-24 rounded-full bg-black text-white shadow-xl ring-8 ring-black/5 text-center p-2">
              <Image
                src="/logo_white.png"
                alt="SkillsCatalyst Emblem"
                width={34}
                height={34}
                priority
                className="object-contain mb-0.5"
              />
              <span className="text-[9px] font-black tracking-wider uppercase">Catalyst</span>
            </div>

            {/* Inner Circle (Black dashed ring, radius: 105px) */}
            <OrbitingCircles
              className="size-[44px] sm:size-[48px] p-2.5"
              duration={20}
              delay={0}
              radius={105}
              path={true}
            >
              <EcosystemIcons.chatgpt />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[44px] sm:size-[48px] p-2.5"
              duration={20}
              delay={6.666}
              radius={105}
              path={false}
            >
              <EcosystemIcons.scholarships />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[44px] sm:size-[48px] p-2.5"
              duration={20}
              delay={13.333}
              radius={105}
              path={false}
            >
              <EcosystemIcons.interview />
            </OrbitingCircles>

            {/* Outer Circle (Black dashed ring, reverse direction, radius: 200px) */}
            <OrbitingCircles
              className="size-[50px] sm:size-[54px] p-2.5"
              radius={200}
              duration={24}
              delay={0}
              reverse
              path={true}
            >
              <EcosystemIcons.instagram />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[50px] sm:size-[54px] p-2.5"
              radius={200}
              duration={24}
              delay={8}
              reverse
              path={false}
            >
              <EcosystemIcons.youtube />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[50px] sm:size-[54px] p-2.5"
              radius={200}
              duration={24}
              delay={16}
              reverse
              path={false}
            >
              <EcosystemIcons.events />
            </OrbitingCircles>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrbitingCircles
