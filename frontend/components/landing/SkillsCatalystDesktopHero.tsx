"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  X,
  ChevronRight,
} from "lucide-react";
import LandingPricingModal, { LandingPricingTier } from "./LandingPricingModal";
import StructuredCareerPathSection from "./StructuredCareerPathSection";
import { EcosystemOrbitingSection } from "@/components/ui/orbiting-circles";
import FeaturesWithPanel from "@/components/ui/features-with-panel";
import SkillsCatalystFooterSection from "./SkillsCatalystFooterSection";

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

export default function SkillsCatalystDesktopHero() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingInitialTier, setPricingInitialTier] = useState<LandingPricingTier>("all");

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const handleNavPillClick = (item: NavItem) => {
    if (item.id === "pricing") {
      router.push("/pricing");
      setActiveDropdown(null);
    } else {
      handleNavigateToLogin();
    }
  };

  const handleDropdownItemClick = (itemId: string, subItemTitle: string) => {
    if (itemId === "pricing") {
      router.push("/pricing");
      setActiveDropdown(null);
    } else {
      handleNavigateToLogin();
    }
  };

  return (
    <div className="scDesktopView">
      {/* ── Fixed Floating Top Navigation Bar (Morphs into unified pill on scroll) ── */}
      <nav className={`scDesktopNavFixed ${isScrolled ? "scNavFixedScrolled" : ""}`}>
        <div className={`scDesktopNavContainer ${isScrolled ? "scNavContainerScrolled" : ""}`}>
          {/* White pill backdrop that smoothly fades in upon scrolling */}
          <div
            className={`scNavScrolledBackdrop ${isScrolled ? "scNavScrolledBackdropActive" : ""}`}
            aria-hidden="true"
          />

          {/* Navigation Items Row */}
          <div className={`scNavbarContentRow ${isScrolled ? "scNavbarContentRowScrolled" : ""}`}>
            {/* Left: Brand Logo Area (Switches to compact square icon on scroll) */}
            <div
              className={`scNavBrandArea ${isScrolled ? "scNavBrandAreaScrolled" : ""}`}
              onClick={() => router.push("/")}
              role="button"
              tabIndex={0}
            >
              {/* Full Brand Logo & Title (Top View) */}
              <div className={`scBrandFull ${isScrolled ? "scBrandFullHidden" : ""}`}>
                <Image
                  src="/logo_black_v2.png"
                  alt="SkillsCatalyst Logo"
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
                    src="/logo_white_v2.png"
                    alt="SkillsCatalyst Logo Icon"
                    width={24}
                    height={24}
                    priority
                    className="scCompactLogoImg"
                  />
                </div>
                <span className="scNavBrandTitle scNavBrandTitleScrolled">SkillsCatalyst</span>
              </div>
            </div>

            {/* Center: White Pill Navigation Bar with Buttons */}
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
                      onClick={() => handleNavPillClick(item)}
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
                              onClick={() => handleDropdownItemClick(item.id, subItem.title)}
                              className="scDropdownItem cursor-pointer"
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

            {/* Right: Login Button (Desktop only) */}
            <div className={`scNavRightActions ${isScrolled ? "scNavRightActionsScrolled" : ""}`}>
              <button
                id="desktop-nav-login"
                type="button"
                onClick={handleNavigateToLogin}
                className={isScrolled ? "scNavLoginBtn scNavLoginBtnScrolled" : "scNavLoginBtn"}
              >
                Login
              </button>
            </div>

            {/* Mobile 3-Lines Hamburger Button (Matching Image 2 & Image 3) */}
            <button
              id="mobile-nav-hamburger"
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="scMobileMenuBtn"
              aria-label="Open mobile navigation menu"
            >
              <span className="scMobileMenuLine" />
              <span className="scMobileMenuLine" />
              <span className="scMobileMenuLine" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="scMobileDrawerOverlay fixed inset-0 z-[999999] flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="relative z-10 w-full bg-white shadow-2xl rounded-b-3xl px-6 py-6 border-b border-slate-200"
            >
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-md">
                    <Image
                      src="/logo_white_v2.png"
                      alt="SkillsCatalyst"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    SkillsCatalyst
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.id === "pricing") router.push("/pricing");
                      else handleNavigateToLogin();
                    }}
                    className="w-full text-left py-3 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between font-semibold text-slate-800 text-base transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                ))}
              </div>

              {/* Action Buttons in Drawer */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavigateToLogin();
                  }}
                  className="w-full py-3.5 rounded-full bg-[#683594] hover:bg-[#54287a] text-white font-bold text-center shadow-lg shadow-purple-900/25 transition-all text-base"
                >
                  Login to SkillsCatalyst
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/pricing");
                  }}
                  className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-center text-sm transition-colors"
                >
                  View Student Pass (₹99)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Desktop Layout: 3-Segment Notch + Grand Hero Card ── */}
      <div className="scDesktopNotchWrapper">
        {/* Precision 3-Segment Notch Header */}
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
          {/* Background Pattern (Replacing Penguin Image while preserving exact framed card shape) */}
          <div className="scDesktopHeroWallpaper">
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
                style={{ background: "radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)" }}
              />
            </div>
          </div>

          {/* Hero Central Typography & Actions */}
          <div className="scDesktopHeroContent">

            {/* Giant Bold Headline */}
            <motion.h1
              className="scHeadline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="scHeadlineWhite">Learn anything.</span>
              <span className="scHeadlineGradient">Go further.</span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-8 px-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Pick a career goal. Get the exact roadmap. Practise until you&apos;re interview-ready — with an AI mentor checking your resume on the way.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              className="scCTARow flex flex-wrap items-center justify-center gap-3 sm:gap-4"
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
                <span>Get Started Free</span>
                <ArrowRight size={18} strokeWidth={2.6} />
              </button>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="scSecondaryCTA"
              >
                <span>View Pricing (₹99)</span>
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ── Section 2: Ecosystem Orbiting Circles (5 cards and round orbit effect) ── */}
      <EcosystemOrbitingSection />

      {/* ── Section 3: Features with Side Panel (SkillBits, Scholarships/Events, Learning & Roadmaps) ── */}
      <FeaturesWithPanel />

      {/* ── Section 4: Animated Structured Career Path ── */}
      <StructuredCareerPathSection />

      {/* ── Section 5: Community CTA & Multi-Column Directory (Lilac Theme, matching Image 2 & 3) ── */}
      <SkillsCatalystFooterSection />

      {/* ── SkillsCatalyst Landing Pricing Modal ── */}
      <LandingPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        initialTier={pricingInitialTier}
      />
    </div>
  );
}
