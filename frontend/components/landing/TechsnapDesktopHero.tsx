"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Play,
  Briefcase,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface NavDropdownItem {
  title: string;
  description: string;
}

interface NavItem {
  id: string;
  label: string;
  items: NavDropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "features",
    label: "Features",
    items: [
      { title: "Structured Learning", description: "Step-by-step career tracks tailored to modern tech hiring bars" },
      { title: "Interactive Compilers", description: "Run and debug code directly in your browser" },
      { title: "AI Mock Interviews", description: "Real-time AI voice & technical coding rounds" },
      { title: "Skill Analytics", description: "Granular readiness scores & verified skill metrics" },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      { title: "Discord Tech Community", description: "Connect with 10,000+ ambitious developers" },
      { title: "Weekly Hackathons", description: "Build real projects and win industry awards" },
      { title: "Peer Study Pods", description: "Collaborate on DSA, System Design & Full Stack" },
      { title: "Alumni Network", description: "Direct referrals to top tier software teams" },
    ],
  },
  {
    id: "career-path",
    label: "Career Path",
    items: [
      { title: "Full Stack Developer", description: "React, Next.js, Node.js, TypeScript & PostgreSQL" },
      { title: "AI & Machine Learning", description: "Python, PyTorch, LLMs, Agents & RAG pipelines" },
      { title: "Cloud & DevOps", description: "Docker, Kubernetes, AWS, CI/CD & Terraform" },
      { title: "Data Engineering", description: "ETL pipelines, Spark, BigQuery & Data Warehousing" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { title: "Developer Cheat Sheets", description: "Instant syntax, algorithms & CLI commands" },
      { title: "System Design Playbook", description: "Scalable architecture guides & interview decks" },
      { title: "ATS Resume Templates", description: "Battle-tested templates optimized for recruiter screeners" },
      { title: "Starter Repositories", description: "Production-ready boilerplates and architectures" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    items: [
      { title: "Student Free Tier", description: "Access free tracks, compilers and public pods" },
      { title: "Catalyst Pro", description: "Unlimited AI mentorship, mock rounds & certificates" },
      { title: "University Campus", description: "Enterprise dashboards & institutional curriculum" },
    ],
  },
];

const FEATURES = [
  {
    id: "structured",
    title: "Structured Learning",
    description: "Step-by-step career tracks tailored to modern tech hiring bars.",
    Icon: GraduationCap,
  },
  {
    id: "resources",
    title: "Curated Resources",
    description: "Zero fluff. High-impact video lessons, repositories & cheat sheets.",
    Icon: Play,
  },
  {
    id: "interview",
    title: "Interview Preparation",
    description: "Live mock interviews, technical challenge suites & resume feedback.",
    Icon: Briefcase,
  },
  {
    id: "community",
    title: "Community & Events",
    description: "Collaborate with ambitious peers, join hackathons & weekly sessions.",
    Icon: Users,
  },
  {
    id: "mentorship",
    title: "Mentorship from Experts",
    description: "1-on-1 strategy sessions with verified senior tech engineers.",
    Icon: Trophy,
  },
];

export default function TechsnapDesktopHero() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="scDesktopView">
      {/* ── Fixed Floating Top Navigation Bar (Morphs into unified pill on scroll) ── */}
      <nav className="scDesktopNavFixed">
        <div className={`scDesktopNavContainer ${isScrolled ? "scNavContainerScrolled" : ""}`}>
          {/* White pill backdrop that smoothly fades in upon scrolling */}
          <div
            className={`scNavScrolledBackdrop ${isScrolled ? "scNavScrolledBackdropActive" : ""}`}
            aria-hidden="true"
          />

          {/* Navigation Items Row */}
          <div className="scNavbarContentRow">
            {/* Left: Brand Logo Area (Switches to compact square icon on scroll, like Techsnap) */}
            <div
              className="scNavBrandArea"
              onClick={() => router.push("/")}
              role="button"
              tabIndex={0}
            >
              {/* Full Brand Logo & Title (Top View) */}
              <div className={`scBrandFull ${isScrolled ? "scBrandFullHidden" : ""}`}>
                <Image
                  src="/logo_black.png"
                  alt="Skills Catalyst Logo"
                  width={40}
                  height={40}
                  priority
                  className="scNavBrandLogo"
                />
                <span className="scNavBrandTitle">SkillsCatalyst</span>
              </div>

              {/* Compact Square Badge Icon + Brand Name (Scrolled View) */}
              <div className={`scBrandCompact ${isScrolled ? "scBrandCompactVisible" : ""}`}>
                <div className="scCompactLogoSquare">
                  <Image
                    src="/logo_white.png"
                    alt="Skills Catalyst Logo Icon"
                    width={24}
                    height={24}
                    priority
                    className="scCompactLogoImg"
                  />
                </div>
                <span className="scNavBrandTitle scNavBrandTitleScrolled">SkillsCatalyst</span>
              </div>
            </div>

            {/* Center: White Pill Navigation Bar with 5 Buttons */}
            <div
              className={`scNavCenterBar ${isScrolled ? "scNavCenterBarScrolled" : ""}`}
              aria-label="Main Navigation"
            >
              {NAV_ITEMS.map((item) => {
                const isOpen = activeDropdown === item.id;
                return (
                  <div
                    key={item.id}
                    className="scNavItemWrapper"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={handleNavigateToLogin}
                      className="scNavPillBtn"
                      aria-expanded={isOpen}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={14}
                        strokeWidth={2.6}
                        className={`scNavChevron ${isOpen ? "scNavChevronOpen" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="scNavDropdown"
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                        >
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.title}
                              type="button"
                              onClick={handleNavigateToLogin}
                              className="scDropdownItem"
                            >
                              <span className="scDropdownItemTitle">{subItem.title}</span>
                              <span className="scDropdownItemDesc">{subItem.description}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right: Login & Register Buttons */}
            <div className="scNavRightActions">
              <button
                id="desktop-nav-login"
                type="button"
                onClick={handleNavigateToLogin}
                className="scNavLoginBtn"
              >
                Login
              </button>
              <button
                id="desktop-nav-start"
                type="button"
                onClick={handleNavigateToLogin}
                className="scNavStartBtn"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Desktop Layout: Techsnap 3-Segment Notch + Grand Hero Card ── */}
      <div className="scDesktopNotchWrapper">
        {/* Techsnap Exact 3-Segment Notch Header */}
        <div className="scNotchRow">
          <div className="scNotchLeftWing">
            <div className="scNotchLeftCutout" />
          </div>
          <div className="scNotchCenterTab" />
          <div className="scNotchRightWing">
            <div className="scNotchRightCutout" />
          </div>
        </div>

        {/* Grand Framed Hero Card Connected directly to the Notch */}
        <section className="scDesktopHeroCard">
          {/* 16:9 Panoramic Wallpaper of Explorer Penguin at Mountain Summit */}
          <div className="scDesktopHeroWallpaper">
            <Image
              src="/images/penguin_desktop_hero.jpg"
              alt="Skills Catalyst Explorer Penguin Summit Hero"
              fill
              priority
              sizes="(max-width: 1600px) 100vw, 1600px"
              className="scDesktopHeroImg"
            />
          </div>

          {/* Hero Central Typography & Actions */}
          <div className="scDesktopHeroContent">
            {/* Subtle Top Pill Badge */}
            <motion.div
              className="scPillBadge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles size={14} />
              <span>Accelerate Your Career · AI-Powered Learning</span>
            </motion.div>

            {/* Giant Bold Headline */}
            <motion.h1
              className="scHeadline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="scHeadlineWhite">Learn Anything,</span>
              <span className="scHeadlineGradient">Go Further</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="scSubtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your all-in-one platform for learning, practice, mentorship and real opportunities.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              className="scCTARow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button
                id="desktop-hero-get-started"
                type="button"
                onClick={handleNavigateToLogin}
                className="scPrimaryCTA"
              >
                <span>Get Started</span>
                <ArrowRight size={18} strokeWidth={2.6} />
              </button>
              <button
                type="button"
                onClick={handleNavigateToLogin}
                className="scSecondaryCTA"
              >
                <span>Explore Platform</span>
              </button>
            </motion.div>
          </div>

          {/* ── 5 Feature Showcase Cards Along the Bottom (Like Techsnap) ── */}
          <motion.div
            className="scFeaturesGrid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="scFeatureCard"
                onClick={handleNavigateToLogin}
              >
                <div className="scFeatureIconWrap">
                  <feature.Icon size={22} strokeWidth={2.2} />
                </div>
                <h4 className="scFeatureTitle">{feature.title}</h4>
                <p className="scFeatureDesc">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
