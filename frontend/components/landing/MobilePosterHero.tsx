"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Play,
  Briefcase,
  Users,
  Trophy,
  ArrowRight,
} from "lucide-react";

interface FeatureNode {
  id: string;
  line1: string;
  line2: string;
  icon: React.ElementType;
  iconFill?: boolean;
  accentColor: string;
  glowColor: string;
  badgeClass: string;
  isApex?: boolean;
}

const FEATURES: FeatureNode[] = [
  {
    id: "community",
    line1: "Community",
    line2: "& Events",
    icon: Users,
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.45)",
    badgeClass: "scArcNode-1",
  },
  {
    id: "resources",
    line1: "Curated",
    line2: "Resources",
    icon: Play,
    iconFill: true,
    accentColor: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.45)",
    badgeClass: "scArcNode-2",
  },
  {
    id: "learning",
    line1: "Structured",
    line2: "Learning",
    icon: GraduationCap,
    accentColor: "#f0abfc",
    glowColor: "rgba(240, 171, 252, 0.6)",
    badgeClass: "scArcNode-3 scArcNode-apex",
    isApex: true,
  },
  {
    id: "interview",
    line1: "Interview",
    line2: "Preparation",
    icon: Briefcase,
    accentColor: "#fb7185",
    glowColor: "rgba(251, 113, 133, 0.45)",
    badgeClass: "scArcNode-4",
  },
  {
    id: "mentorship",
    line1: "Mentorship",
    line2: "from Experts",
    icon: Trophy,
    accentColor: "#fde047",
    glowColor: "rgba(253, 224, 71, 0.5)",
    badgeClass: "scArcNode-5",
  },
];

export default function MobilePosterHero() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/login");
  };

  // Keyboard accessibility: Enter or Space to Get Started
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.code === "Space") {
        if (e.code === "Space" && e.target === document.body) {
          e.preventDefault();
        }
        handleGetStarted();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="scMobileView">
      <div className="scMobileContainer">
        {/* 1. Header Bar: Script note, Logo, Motto */}
        <header className="scMobileHeader">
          {/* Top-Left Handwritten Accent */}
          <div className="scMobileScriptLeft">
            <span className="scScriptLine">Learn</span>
            <span className="scScriptLine">Connect</span>
            <span className="scScriptLine">Grow</span>
            <span className="scScriptLine">Succeed</span>
            <svg className="scMobileSquiggle" viewBox="0 0 46 10" fill="none">
              <path
                d="M 2 3 Q 12 7 24 3 T 44 4"
                stroke="#818cf8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 6 7 Q 16 10 28 6 T 40 7"
                stroke="#818cf8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Center Brand Emblem */}
          <div className="scMobileBrand">
            <div className="scMobileLogoWrap">
              <Image
                src="/logo_white.png"
                alt="Skills Catalyst Logo"
                width={84}
                height={84}
                priority
                className="scMobileLogoImg"
              />
            </div>
            <span className="scMobileLogoTagline">
              LEARN • BUILD • GROW • TOGETHER
            </span>
          </div>

          {/* Top-Right Motto with Vertical Line */}
          <div className="scMobileMottoRight">
            <div className="scMobileMottoLine" />
            <div className="scMobileMottoContent">
              <span>SAME</span>
              <span>LEARNING</span>
              <span>A BRIGHTER</span>
              <span>YOU</span>
            </div>
          </div>
        </header>

        {/* 2. Hero Typography: Crisp Headline + Centered Subtitle */}
        <section className="scMobileTypography">
          <motion.h1
            className="scMobileTitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="scMobileTitleWhite">Learn Anything,</span>
            <span className="scMobileTitleGradient">Go Further</span>
          </motion.h1>

          <motion.p
            className="scMobileSubtitle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your all-in-one platform for learning, practice,<br />
            mentorship and real opportunities.
          </motion.p>
        </section>

        {/* 3. Mountain Summit Scene with Penguin and Constellation Arc */}
        <div className="scMobileStage">
          {/* 5-Feature Glowing Constellation Arc */}
          <section className="scMobileArcSection" aria-label="Key Platform Features">
            {/* Curved Glowing SVG Connecting Arc - 100% Mathematically Centered */}
            <svg
              className="scMobileArcSvg"
              viewBox="0 0 100 100"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scArcGrad" x1="0%" y1="100%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="25%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f0abfc" stopOpacity="1" />
                  <stop offset="75%" stopColor="#fb7185" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0.7" />
                </linearGradient>
                <filter id="scArcGlow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 11,80 C 15.5,70.67 20.5,54 27,44 C 33.5,34 42.33,20 50,20 C 57.67,20 66.5,34 73,44 C 79.5,54 84.5,70.67 89,80"
                stroke="url(#scArcGrad)"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                filter="url(#scArcGlow)"
              />
            </svg>

            {/* 5 Feature Interactive Badges */}
            <div className="scMobileArcNodes">
              {FEATURES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className={`scArcNode ${item.badgeClass}`}
                    initial={{ opacity: 0.3, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
                    whileTap={{ scale: 1.12 }}
                    style={{
                      ["--node-accent" as string]: item.accentColor,
                      ["--node-glow" as string]: item.glowColor,
                    }}
                  >
                    <div className="scArcIconCircle">
                      <Icon
                        size={item.isApex ? 17 : 14}
                        fill={item.iconFill ? "currentColor" : "none"}
                        className="scArcIconSvg"
                      />
                    </div>
                    <div className="scArcNodeLabel">
                      <span>{item.line1}</span>
                      <span>{item.line2}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Clean Explorer Penguin Summit Illustration */}
          <div
            className="scMobilePenguinContainer"
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src="/images/penguin_mobile_clean.jpg"
              alt="Skills Catalyst Penguin Explorer atop mountain summit"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 500px"
              className="scMobilePenguinImg"
            />
            {/* Top Fade Gradient for seamless sky transition */}
            <div className="scMobileSkyOverlay" />
          </div>

          {/* Centered CTA Button Container (Guarantees zero horizontal shifting) */}
          <div className="scMobileCTAWrapper">
            <motion.button
              id="mobile-get-started-cta"
              type="button"
              onClick={handleGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="scMobileGetStartedBtn"
              aria-label="Get Started and continue to Login"
            >
              <span className="scMobileBtnText">Get Started</span>
              <ArrowRight size={17} className="scMobileBtnArrow" />
              <span className="scMobileBtnGlowHalo" />
            </motion.button>
          </div>

          {/* Bottom-Right Handwritten Script Accent */}
          <div className="scMobileBottomScript">
            <span>More</span>
            <span>Than</span>
            <span>Learning</span>
            <svg className="scMobileBottomSquiggle" viewBox="0 0 42 8" fill="none">
              <path
                d="M 2 3 Q 12 7 24 3 T 40 4"
                stroke="#94a3b8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M 6 6 Q 16 8 26 5 T 38 6"
                stroke="#94a3b8"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
