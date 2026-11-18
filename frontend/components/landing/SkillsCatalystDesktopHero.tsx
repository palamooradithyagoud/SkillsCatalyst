"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LandingPricingModal, { LandingPricingTier } from "./LandingPricingModal";
import StructuredCareerPathSection from "./StructuredCareerPathSection";
import MobileLandingOnboarding from "./MobileLandingOnboarding";

// Bespoke minimal chevron icon (Zero stock lucide-react dependency)
function NavChevronIcon({ isOpen, className = "" }: { isOpen?: boolean; className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="3.5 5 7 8.5 10.5 5" />
    </svg>
  );
}


import SkillsCatalystFooterSection from "./SkillsCatalystFooterSection";
import LandingKineticMobileNav from "./LandingKineticMobileNav";

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
      { title: "About SkillsCatalyst", description: "Our campus origin, team, and engineering mission" },
      { title: "Contact & Community", description: "Direct student support, grievance desk & community" },
      { title: "Developer Cheat Sheets", description: "Instant syntax, algorithms & CLI commands" },
      { title: "System Design Playbook", description: "Scalable architecture guides & interview decks" },
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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

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
  const [isMobileOnboardingOpen, setIsMobileOnboardingOpen] = useState(false);
  const [onboardingTarget, setOnboardingTarget] = useState("/login");

  const handleNavigateToLogin = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 860) {
      setOnboardingTarget("/login");
      setIsMobileOnboardingOpen(true);
    } else {
      router.push("/login");
    }
  };

  const handleNavigateToSignUp = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 860) {
      setOnboardingTarget("/login?mode=signup");
      setIsMobileOnboardingOpen(true);
    } else {
      router.push("/login?mode=signup");
    }
  };

  const handleOnboardingComplete = () => {
    setIsMobileOnboardingOpen(false);
    router.push(onboardingTarget);
  };

  const handleOnboardingSkip = () => {
    setIsMobileOnboardingOpen(false);
    router.push(onboardingTarget);
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
    if (subItemTitle === "About SkillsCatalyst") {
      router.push("/about");
      setActiveDropdown(null);
    } else if (subItemTitle === "Contact & Community") {
      router.push("/contact");
      setActiveDropdown(null);
    } else if (itemId === "pricing") {
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
                  src="/logo_white_v2.png"
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
                      <NavChevronIcon
                        isOpen={isOpen}
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

            {/* Right: Login & Sign Up Actions (Desktop only) */}
            <div className={`scNavRightActions ${isScrolled ? "scNavRightActionsScrolled" : ""}`}>
              <button
                id="desktop-nav-login"
                type="button"
                onClick={handleNavigateToLogin}
                className={`scNavLoginBtn liquid-glass ${isScrolled ? "scNavLoginBtnScrolled" : ""} hover:scale-[1.03] transition-transform`}
              >
                Log In
              </button>
              <button
                id="desktop-nav-signup"
                type="button"
                onClick={handleNavigateToSignUp}
                className={`scNavSignUpBtn ${isScrolled ? "scNavSignUpBtnScrolled" : ""} hover:scale-[1.03] transition-transform`}
              >
                Sign Up
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

      {/* Mobile Top-to-Down Kinetic Navigation (GSAP Staggered Layer Cascade) */}
      <LandingKineticMobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToSignUp={handleNavigateToSignUp}
        onNavigateToPricing={() => router.push("/pricing")}
      />

      {/* ── Grand Framed Hero Section with Looping Video Background Extending Behind Navbar ── */}
      <section className="scDesktopHeroCard">
          {/* Looping Fullscreen Cinematic Video Background */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              type="video/mp4"
            />
          </video>

          {/* Hero Central Typography & Actions */}
          <div className="scDesktopHeroContent">
            {/* Giant Bold Headline with Fade-Rise Animation */}
            <h1 className="scHeadline animate-fade-rise">
              <span className="block text-white" style={{ color: "#FFFFFF" }}>
                India&apos;s <span className="whitespace-nowrap">Next-Generation</span>
              </span>
              <span className="block mt-1 sm:mt-2 text-white" style={{ color: "#FFFFFF" }}>
                <span className="whitespace-nowrap">AI-Powered</span> Career
              </span>
              <span
                className="block mt-1 sm:mt-2 font-black text-[#d5ff38] drop-shadow-[0_0_35px_rgba(213,255,56,0.55)]"
                style={{ color: "#d5ff38" }}
              >
                Platform
              </span>
            </h1>

            {/* Hero Subtitle with Fade-Rise Delay */}
            <p
              className="scHeroSubtitle animate-fade-rise-delay text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-8 px-4"
              style={{ color: "#D1CDD8" }}
            >
              One platform. Every opportunity. Your entire career journey.
            </p>

            {/* CTA Row with Fade-Rise Delay 2 & Liquid Glass Styling */}
            <div className="scCTARow animate-fade-rise-delay-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                id="desktop-hero-start-learning"
                type="button"
                onClick={handleNavigateToSignUp}
                className="scPrimaryCTA cursor-pointer hover:scale-[1.03] transition-transform"
              >
                <span>Start learning for free</span>
              </button>
              <Link
                id="desktop-hero-explore-pro"
                href="/pricing"
                className="scSecondaryCTA liquid-glass cursor-pointer hover:scale-[1.03] transition-transform"
              >
                <span>Explore pro benefits</span>
              </Link>
            </div>
          </div>
        </section>

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

      {/* ── Mobile Landing Onboarding Flow (Product Features Carousel) ── */}
      <MobileLandingOnboarding
        isOpen={isMobileOnboardingOpen}
        onClose={() => setIsMobileOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </div>
  );
}
