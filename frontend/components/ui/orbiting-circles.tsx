"use client"

import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export interface OrbitingCirclesProps {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  isHighlighted?: boolean
  highlightRing?: string
  highlightGlow?: string
}

export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true,
  isHighlighted = false,
  highlightRing = "ring-purple-500",
  highlightGlow = "rgba(104, 53, 148, 0.6)",
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
          "absolute inset-0 m-auto flex transform-gpu items-center justify-center rounded-full bg-white transition-all duration-300",
          isHighlighted
            ? cn("scale-125 z-30 ring-4 shadow-xl", highlightRing)
            : "border border-black/15 shadow-md opacity-85 hover:opacity-100 hover:scale-110",
          className,
        )}
      >
        {children}
        {isHighlighted && (
          <span
            className="absolute -inset-1 rounded-full animate-ping pointer-events-none opacity-75"
            style={{
              boxShadow: `0 0 16px ${highlightGlow}`,
              border: `2px solid ${highlightGlow}`,
            }}
          />
        )}
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

// ── Pinned Cards Effect ("What student is going through?") ──
export interface Step {
  title: string
  description: string
  colorTheme?: "orange" | "blue" | "purple"
  colors?: {
    bg: string
    text: string
    border: string
  }
}

export interface StepPosition {
  className?: string
  rotate?: string
}

export interface HowItWorksProps {
  features?: Step[]
  className?: string
  stepPositions?: StepPosition[]
  activeStep?: number
  onStepSelect?: (index: number) => void
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
)

interface CardProps {
  number: string
  title: string
  description: string
  colorTheme?: "orange" | "blue" | "purple"
  className?: string
  colors?: {
    bg: string
    text: string
    border: string
  }
  isHighlighted?: boolean
  onClick?: () => void
}

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className = "",
  colors: customColors,
  isHighlighted = false,
  onClick,
}: CardProps) => {
  const defaultBgColors = {
    orange: "bg-orange-50/95 dark:bg-orange-500/10",
    blue: "bg-blue-50/95 dark:bg-blue-500/10",
    purple: "bg-purple-50/95 dark:bg-purple-500/10",
  }
  const defaultTextColors = {
    orange: "text-orange-500 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  }
  const defaultBorderColors = {
    orange: "border-orange-200 dark:border-orange-500/20",
    blue: "border-blue-200 dark:border-blue-500/20",
    purple: "border-purple-200 dark:border-purple-500/20",
  }

  const highlightBorderGlow = {
    orange: "ring-2 ring-orange-500 shadow-[0px_20px_42px_-4px_rgba(249,115,22,0.45)] border-orange-300 scale-[1.04]",
    blue: "ring-2 ring-blue-500 shadow-[0px_20px_42px_-4px_rgba(59,130,246,0.45)] border-blue-300 scale-[1.04]",
    purple: "ring-2 ring-purple-500 shadow-[0px_20px_42px_-4px_rgba(168,85,247,0.45)] border-purple-300 scale-[1.04]",
  }

  const bgColor = customColors?.bg || defaultBgColors[colorTheme]
  const textColor = customColors?.text || defaultTextColors[colorTheme]
  const borderColor = customColors?.border || defaultBorderColors[colorTheme]

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-neutral-900 p-2 rounded-[18px] border transition-all duration-300",
        isHighlighted
          ? highlightBorderGlow[colorTheme]
          : "shadow-[0px_6px_18px_0px_rgba(0,0,0,0.06)] border-neutral-100 dark:border-neutral-800 opacity-75 hover:opacity-100",
        className
      )}
    >
      <div className={cn("transition-transform duration-300", isHighlighted && "-translate-y-1 scale-110")}>
        <Pin className={cn("w-5 h-5 z-20 mb-1.5 mx-auto drop-shadow-sm", textColor)} />
      </div>

      <div
        className={cn(
          bgColor,
          "border",
          borderColor,
          "rounded-[12px] p-2.5 h-full flex flex-col relative overflow-hidden transition-colors"
        )}
      >

        <span
          className={cn(textColor, "text-2xl font-bold mb-1")}
          style={{
            fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif',
          }}
        >
          {number}
        </span>
        <h3 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-snug mb-1">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-snug">
          {description}
        </p>
      </div>
    </div>
  )
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-1", rotate: "rotate-3" },
  { className: "md:absolute md:top-[75px] md:right-1", rotate: "-rotate-3" },
  { className: "md:absolute md:top-[170px] md:left-3", rotate: "rotate-3" },
  { className: "md:absolute md:top-[265px] md:right-2", rotate: "-rotate-3" },
  { className: "md:absolute md:top-[360px] md:left-1", rotate: "rotate-2" },
]

export function HowItWorks({
  features,
  className = "",
  stepPositions,
  activeStep = 0,
  onStepSelect,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Tutorial Hell & Overwhelm",
      description:
        "Drowning in endless YouTube playlists without knowing what builds hiring-grade skills.",
      colorTheme: "orange",
    },
    {
      title: "Scattered Tools & Chaos",
      description:
        "Switching between ChatGPT, LeetCode, GitHub, and notes with zero structured roadmap.",
      colorTheme: "blue",
    },
    {
      title: "Missed Opportunities",
      description:
        "Missing verified national scholarships, hackathons, and high-value internships.",
      colorTheme: "purple",
    },
    {
      title: "Interview & Placement Fear",
      description:
        "Freezing in live coding simulators, system design, and placement aptitude rounds.",
      colorTheme: "orange",
    },
    {
      title: "Resume Black Hole",
      description:
        "Sending 100+ applications without replies, mentorship, or actionable feedback.",
      colorTheme: "blue",
    },
  ]

  const data = features && features.length > 0 ? features : defaultFeatures
  const positions = stepPositions || DEFAULT_CARD_POSITIONS
  const height = 490

  return (
    <div className={cn("w-full max-w-[500px] relative py-2", className)}>
      {/* Subtle notebook grid lines background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
          backgroundSize: "100% 28px",
          marginTop: "4px",
        }}
      />

      <div
        className="relative w-full mx-auto flex flex-col space-y-4 md:space-y-0 md:block h-auto md:h-[var(--md-height)] z-10"
        style={{ "--md-height": `${height}px` } as React.CSSProperties}
      >
        {/* Connecting dashed line weaving across cards */}
        {data.length > 1 && (
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
            viewBox="0 0 500 490"
            preserveAspectRatio="none"
          >
            <path
              d="M 108 55 C 260 55, 260 130, 408 130 C 408 180, 260 180, 120 225 C 120 270, 260 270, 402 320 C 402 370, 260 370, 108 415"
              stroke="currentColor"
              className="text-neutral-300 dark:text-neutral-700"
              strokeWidth="2"
              strokeDasharray="6 5"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {data.map((step, index) => {
          const position = positions[index % positions.length]
          const isHighlighted = index === activeStep

          return (
            <div
              key={step.title}
              className={cn(
                `card-stack-item card-stack-item-${index}`,
                "relative w-full md:w-[215px] cursor-pointer select-none transition-all duration-300",
                position.rotate,
                position.className
              )}
              style={{
                zIndex: isHighlighted ? 35 : 10 + index,
                // Card 0 visible initially; cards 1..4 animated progressively by GSAP ScrollTrigger
                opacity: index === 0 ? 1 : 0,
                transform: index === 0 ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 40px, 0) scale(0.85)",
                willChange: "transform, opacity",
              }}
              onClick={() => onStepSelect?.(index)}
            >
              <Card
                number={`0${index + 1}`}
                title={step.title}
                description={step.description}
                colorTheme={step.colorTheme || "blue"}
                colors={step.colors}
                isHighlighted={isHighlighted}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const STUDENT_THOUGHTS = [
  "Which YouTube tutorial is actually worth it? 😵‍💫",
  "Lost between ChatGPT, LeetCode & 50 tabs... 🤯",
  "Missed another verified scholarship deadline! 😔",
  "Blanking out in live technical interviews... 😰",
  "100+ job applications sent, zero human replies 🕳️",
]

/**
 * Ecosystem Orbiting Section:
 * Left column:
 *   - Top: "What student is going through?" in dark lilac (#683594)
 *   - 5-step smooth scroll timeline pill indicator
 *   - Directly downside the text: 5 Pinned Process Cards stacking progressively via GSAP ScrollTrigger
 * Right column:
 *   - Revolving orbit with confused student sitting with laptop in the center
 *   - Dynamic thought bubble & Orbit icons sync-highlight to each scroll stage
 */
export function EcosystemOrbitingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop & Tablet: Smooth scroll-pinned card stacking animation
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            id: "student-orbit-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=2200",
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate: (self) => {
              const clamped = Math.min(0.999, Math.max(0, self.progress))
              const step = Math.floor(clamped * 5)
              setActiveStep(step)
            },
          },
        })

        // Cards 1 through 4 smoothly pop in one after another
        tl.to(".card-stack-item-1", {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        })
        .to(".card-stack-item-2", {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        })
        .to(".card-stack-item-3", {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        })
        .to(".card-stack-item-4", {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        })
        // Hold on the 5th card so user can absorb the completed board before unpinning
        .to({}, { duration: 0.6 })
      })

      // Mobile: Compact pin distance with progressive stack reveal
      mm.add("(max-width: 767px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            id: "student-orbit-trigger",
            trigger: sectionRef.current,
            start: "top top",
            end: "+=1500",
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => {
              const clamped = Math.min(0.999, Math.max(0, self.progress))
              const step = Math.floor(clamped * 5)
              setActiveStep(step)
            },
          },
        })

        tl.to(".card-stack-item-1", { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" })
          .to(".card-stack-item-2", { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" })
          .to(".card-stack-item-3", { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" })
          .to(".card-stack-item-4", { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" })
          .to({}, { duration: 0.4 })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Smooth click-to-step scroll helper
  const scrollToStep = (stepIndex: number) => {
    setActiveStep(stepIndex)
    const st = ScrollTrigger.getById("student-orbit-trigger")
    if (st) {
      const targetScroll = st.start + (st.end - st.start) * ((stepIndex + 0.5) / 5)
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      })
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white text-slate-900 min-h-screen flex flex-col justify-center items-center pt-16 sm:pt-20 pb-12 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* ── LEFT COLUMN: Text at Top-Left & 5 Pinned Stack Cards downside it ── */}
        <div className="lg:col-span-7 flex flex-col items-start text-left w-full">
          {/* Top-Left Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#683594] tracking-tight leading-tight mb-5">
            What student is going through?
          </h2>

          {/* 5 Stacking Cards directly downside the text */}
          <HowItWorks
            activeStep={activeStep}
            onStepSelect={scrollToStep}
          />
        </div>

        {/* ── RIGHT COLUMN: The Orbiting Circles Effect with Confused Student ── */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center lg:items-end w-full pt-4">
          {/* Dynamic Confused Thought Bubble syncing with current step */}
          <div className="mb-2 max-w-[320px] bg-white dark:bg-neutral-900 border-2 border-[#683594]/30 shadow-md rounded-2xl px-3.5 py-1.5 flex items-center gap-2 animate-bounce select-none">
            <span className="text-sm">💭</span>
            <p className="text-[11px] sm:text-xs font-semibold text-[#683594] leading-snug">
              {STUDENT_THOUGHTS[activeStep]}
            </p>
          </div>

          <div className="relative flex size-[380px] sm:size-[430px] items-center justify-center">
            {/* Central Figure: Confused human sitting with laptop */}
            <div className="relative z-20 flex flex-col items-center justify-center select-none pointer-events-none">
              <div className="relative size-[150px] sm:size-[170px] flex items-center justify-center">
                <Image
                  src="/confused_student.png"
                  alt="Confused student navigating career choices"
                  width={170}
                  height={170}
                  priority
                  className="object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* Inner Circle (radius: 108px) */}
            <OrbitingCircles
              className="size-[40px] sm:size-[44px] p-2"
              duration={20}
              delay={0}
              radius={108}
              path={true}
              isHighlighted={activeStep === 1}
              highlightRing="ring-emerald-500"
              highlightGlow="rgba(16, 185, 129, 0.8)"
            >
              <EcosystemIcons.chatgpt />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[40px] sm:size-[44px] p-2"
              duration={20}
              delay={6.666}
              radius={108}
              path={false}
              isHighlighted={activeStep === 2}
              highlightRing="ring-amber-500"
              highlightGlow="rgba(245, 158, 11, 0.8)"
            >
              <EcosystemIcons.scholarships />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[40px] sm:size-[44px] p-2"
              duration={20}
              delay={13.333}
              radius={108}
              path={false}
              isHighlighted={activeStep === 3}
              highlightRing="ring-purple-500"
              highlightGlow="rgba(168, 85, 247, 0.8)"
            >
              <EcosystemIcons.interview />
            </OrbitingCircles>

            {/* Outer Circle (reverse direction, radius: 172px) */}
            <OrbitingCircles
              className="size-[46px] sm:size-[50px] p-2"
              radius={172}
              duration={24}
              delay={0}
              reverse
              path={true}
              isHighlighted={activeStep === 4}
              highlightRing="ring-fuchsia-500"
              highlightGlow="rgba(217, 70, 239, 0.8)"
            >
              <EcosystemIcons.instagram />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[46px] sm:size-[50px] p-2"
              radius={172}
              duration={24}
              delay={8}
              reverse
              path={false}
              isHighlighted={activeStep === 0}
              highlightRing="ring-red-500"
              highlightGlow="rgba(239, 68, 68, 0.8)"
            >
              <EcosystemIcons.youtube />
            </OrbitingCircles>

            <OrbitingCircles
              className="size-[46px] sm:size-[50px] p-2"
              radius={172}
              duration={24}
              delay={16}
              reverse
              path={false}
              isHighlighted={activeStep === 4}
              highlightRing="ring-sky-500"
              highlightGlow="rgba(56, 189, 248, 0.8)"
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
