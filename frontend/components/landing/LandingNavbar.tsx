"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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

export interface LandingNavbarProps {
  solid?: boolean;
}

export default function LandingNavbar({ solid = false }: LandingNavbarProps) {
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

  const effectiveScrolled = solid || isScrolled;

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const handleNavigateToSignUp = () => {
    router.push("/login?mode=signup");
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
    <>
      {/* ── Fixed Floating Top Navigation Bar (Morphs into unified pill on scroll / solid mode) ── */}
      <nav className={`scDesktopNavFixed ${effectiveScrolled ? "scNavFixedScrolled" : ""}`}>
        <div className={`scDesktopNavContainer ${effectiveScrolled ? "scNavContainerScrolled" : ""}`}>
          {/* White pill backdrop that smoothly fades in upon scrolling / solid mode */}
          <div
            className={`scNavScrolledBackdrop ${effectiveScrolled ? "scNavScrolledBackdropActive" : ""}`}
            aria-hidden="true"
          />

          {/* Navigation Items Row */}
          <div className={`scNavbarContentRow ${effectiveScrolled ? "scNavbarContentRowScrolled" : ""}`}>
            {/* Left: Brand Logo Area (Switches to compact square icon on scroll / solid mode) */}
            <div
              className={`scNavBrandArea ${effectiveScrolled ? "scNavBrandAreaScrolled" : ""}`}
              onClick={() => router.push("/")}
              role="button"
              tabIndex={0}
            >
              {/* Full Brand Logo & Title (Top View) */}
              <div className={`scBrandFull ${effectiveScrolled ? "scBrandFullHidden" : ""}`}>
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

              {/* Compact Square Badge Icon + Brand Name (Scrolled / Solid View) */}
              <div className={`scBrandCompact ${effectiveScrolled ? "scBrandCompactVisible" : ""}`}>
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
              className={`scNavCenterBar ${effectiveScrolled ? "scNavCenterBarScrolled" : ""}`}
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

            {/* Right: Login & Signup Buttons (Desktop only) */}
            <div className={`scNavRightActions ${effectiveScrolled ? "scNavRightActionsScrolled" : ""}`}>
              <button
                id="desktop-nav-login"
                type="button"
                onClick={handleNavigateToLogin}
                className={effectiveScrolled ? "scNavLoginBtn scNavLoginBtnScrolled" : "scNavLoginBtn"}
              >
                Log In
              </button>
              <button
                id="desktop-nav-signup"
                type="button"
                onClick={handleNavigateToSignUp}
                className={effectiveScrolled ? "scNavSignUpBtn scNavSignUpBtnScrolled" : "scNavSignUpBtn"}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile 3-Lines Hamburger Button */}
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
    </>
  );
}
