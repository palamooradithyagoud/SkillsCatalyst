"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {
  LayoutGrid,
  BookOpen,
  Map,
  Target,
  Briefcase,
  Compass,
  BarChart3,
  User,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Sparkles,
} from "lucide-react";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import { useAuth } from "@/lib/auth";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export interface NavFeatureItem {
  id: string;
  shapeIndex: number;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  accentColor?: string;
}

const defaultFeatures: NavFeatureItem[] = [
  {
    id: "dashboard",
    shapeIndex: 1,
    title: "Dashboard",
    subtitle: "Overview & Real-time Metrics",
    href: "/dashboard",
    icon: LayoutGrid,
    accentColor: "rgba(99, 102, 241, 0.2)",
  },
  {
    id: "learning",
    shapeIndex: 2,
    title: "Learning",
    subtitle: "Courses & Curated Playlists",
    href: "/learning",
    icon: BookOpen,
    accentColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    id: "roadmaps",
    shapeIndex: 3,
    title: "Roadmaps",
    subtitle: "Interactive Career Tracks",
    href: "/roadmaps",
    icon: Map,
    badge: "AI Powered",
    accentColor: "rgba(59, 130, 246, 0.2)",
  },
  {
    id: "practice",
    shapeIndex: 4,
    title: "Practice",
    subtitle: "Aptitude & Coding Drills",
    href: "/practice",
    icon: Target,
    accentColor: "rgba(236, 72, 153, 0.2)",
  },
  {
    id: "career",
    shapeIndex: 5,
    title: "Career",
    subtitle: "AI Resume & ATS Review",
    href: "/career",
    icon: Briefcase,
    badge: "94% Match",
    accentColor: "rgba(234, 179, 8, 0.2)",
  },
  {
    id: "explore",
    shapeIndex: 6,
    title: "Explore Hub",
    subtitle: "Trending Skills & Grants",
    href: "/explore",
    icon: Compass,
    accentColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "analytics",
    shapeIndex: 7,
    title: "Analytics",
    subtitle: "Readiness & Performance",
    href: "/analytics",
    icon: BarChart3,
    accentColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    id: "settings",
    shapeIndex: 8,
    title: "Profile & Settings",
    subtitle: "Account & Preferences",
    href: "/settings",
    icon: User,
    accentColor: "rgba(99, 102, 241, 0.2)",
  },
];

export interface SterlingGateKineticNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
  features?: NavFeatureItem[];
}

export function Component({
  isOpen,
  onClose,
  showTrigger = true,
  features = defaultFeatures,
}: SterlingGateKineticNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const router = useRouter();
  const { session, logout } = useAuth();

  const isControlled = typeof isOpen === "boolean";
  const isMenuOpen = isControlled ? isOpen : internalMenuOpen;

  const toggleMenu = () => {
    if (isControlled) {
      if (isMenuOpen && onClose) {
        onClose();
      }
    } else {
      setInternalMenuOpen((prev) => !prev);
    }
  };

  const closeMenu = () => {
    if (onClose) onClose();
    if (!isControlled) setInternalMenuOpen(false);
  };

  const handleNavigate = (href: string) => {
    closeMenu();
    router.push(href);
  };

  // Initial Setup & Hover Effects
  useEffect(() => {
    if (!containerRef.current) return;

    // Create custom easing safely
    try {
      if (!gsap.parseEase("main")) {
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.7 });
      }
    } catch (e) {
      console.warn("CustomEase failed to load, falling back to default.", e);
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }

    const ctx = gsap.context(() => {
      // 1. Arrow Animation (Safe check if arrowLine exists)
      const arrowLine = document.querySelector(".arrow-line");
      if (arrowLine) {
        const pathLength = (arrowLine as SVGPathElement).getTotalLength();
        gsap.set(arrowLine, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        const arrowTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        arrowTl
          .to(arrowLine, { strokeDashoffset: 0, duration: 1, ease: "power2.out" })
          .to({}, { duration: 1.2 })
          .to(arrowLine, { strokeDashoffset: -pathLength, duration: 0.6, ease: "power2.in" })
          .set(arrowLine, { strokeDashoffset: pathLength });
      }

      // 2. Shape Hover & Active Reaction
      const menuItems = containerRef.current!.querySelectorAll(".menu-list-item[data-shape]");
      const shapesContainer = containerRef.current!.querySelector(".ambient-background-shapes");

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape = shapesContainer ? shapesContainer.querySelector(`.bg-shape-${shapeIndex}`) : null;

        if (!shape) return;

        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          if (shapesContainer) {
            shapesContainer.querySelectorAll(".bg-shape").forEach((s) => s.classList.remove("active"));
          }
          shape.classList.add("active");

          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)", overwrite: "auto" }
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);
        item.addEventListener("touchstart", onEnter, { passive: true });

        (item as any)._cleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
          item.removeEventListener("touchstart", onEnter);
        };
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll(".menu-list-item[data-shape]");
        items.forEach((item: any) => item._cleanup && item._cleanup());
      }
    };
  }, []);

  // Menu Open/Close Kinetic GSAP Animation Effect
  useEffect(() => {
    if (!containerRef.current) return;

    // Manage bottom dock hide attribute on document body
    if (typeof document !== "undefined") {
      if (isMenuOpen) {
        document.body.setAttribute("data-hide-bottombar", "true");
      } else {
        document.body.removeAttribute("data-hide-bottombar");
      }
    }

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector(".nav-overlay-wrapper");
      const menu = containerRef.current!.querySelector(".menu-content");
      const overlay = containerRef.current!.querySelector(".overlay");
      const bgPanels = containerRef.current!.querySelectorAll(".backdrop-layer");
      const menuLinks = containerRef.current!.querySelectorAll(".nav-link");
      const fadeTargets = containerRef.current!.querySelectorAll("[data-menu-fade]");

      const menuButtons = containerRef.current!.querySelectorAll(".nav-close-btn");

      const tl = gsap.timeline();

      if (isMenuOpen) {
        // OPEN KINETIC TIMELINE
        if (navWrap) navWrap.setAttribute("data-nav", "open");

        tl.set(navWrap, { display: "block" })
          .set(menu, { xPercent: 0 }, "<");

        // Animate Button Texts and Icons Swapping
        menuButtons.forEach((btn) => {
          const texts = btn.querySelectorAll("p");
          const icon = btn.querySelector(".menu-button-icon");
          if (texts.length) {
            tl.fromTo(texts, { yPercent: 0 }, { yPercent: -100, stagger: 0.15 }, "<");
          }
          if (icon) {
            tl.fromTo(icon, { rotate: 0 }, { rotate: 315 }, "<");
          }
        });

        tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
          .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
          .fromTo(menuLinks, { yPercent: 140, rotate: 8 }, { yPercent: 0, rotate: 0, stagger: 0.045 }, "<+=0.3");

        if (fadeTargets.length) {
          tl.fromTo(
            fadeTargets,
            { autoAlpha: 0, yPercent: 40 },
            { autoAlpha: 1, yPercent: 0, stagger: 0.03, clearProps: "all" },
            "<+=0.15"
          );
        }
      } else {
        // CLOSE TIMELINE
        if (navWrap) navWrap.setAttribute("data-nav", "closed");

        tl.to(overlay, { autoAlpha: 0, duration: 0.35 })
          .to(menu, { xPercent: 120, duration: 0.4 }, "<");

        // Animate Button Texts and Icons Back
        menuButtons.forEach((btn) => {
          const texts = btn.querySelectorAll("p");
          const icon = btn.querySelector(".menu-button-icon");
          if (texts.length) {
            tl.to(texts, { yPercent: 0, duration: 0.3 }, "<");
          }
          if (icon) {
            tl.to(icon, { rotate: 0, duration: 0.3 }, "<");
          }
        });

        tl.set(navWrap, { display: "none" });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMenuOpen]);

  // keydown Escape handling
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const userEmail = session?.email || "adithya@skillscatalyst.io";
  const userInitial = userEmail.split("@")[0].substring(0, 2).toUpperCase() || "AD";

  return (
    <div ref={containerRef}>
      {/* Optional Standalone Trigger / Site Header */}
      {showTrigger && (
        <div className="site-header-wrapper">
          <header className="header">
            <div className="container is--full">
              <nav className="nav-row">
                <a href="/dashboard" aria-label="home" className="nav-logo-row w-inline-block">
                  <SkillsCatalystLogo size="sm" showText animated />
                </a>
                <div className="nav-row__right">
                  {/* Clean Menu Indicator */}
                  <div className="nav-toggle-label" onClick={toggleMenu} style={{ cursor: "pointer", pointerEvents: "auto" }}>
                    <span className="toggle-text">Explore Menu</span>
                  </div>

                  {/* Restored Kinetic Menu Button */}
                  <button role="button" aria-label="Toggle Menu" className="nav-close-btn" onClick={toggleMenu} style={{ pointerEvents: "auto" }}>
                    <div className="menu-button-text">
                      <p className="p-large">Menu</p>
                      <p className="p-large">Close</p>
                    </div>
                    <div className="icon-wrap">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="menu-button-icon"
                      >
                        <path
                          d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                          fill="currentColor"
                        />
                        <path
                          d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z"
                          fill="currentColor"
                        />
                        <path
                          d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </nav>
            </div>
          </header>
        </div>
      )}

      {/* ── Kinetic Fullscreen Menu ── */}
      <section className="fullscreen-menu-container">
        <div data-nav="closed" className="nav-overlay-wrapper">
          {/* Backdrop Click Dismiss */}
          <div className="overlay" onClick={closeMenu} aria-label="Close navigation overlay" />

          <nav className="menu-content" aria-label="Mobile Navigation">
            {/* Sliding Curtain Layers & Shapes */}
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              {/* Ambient Background Shapes Container */}
              <div className="ambient-background-shapes">
                {/* Shape 1: Dashboard - Orbiting Spheres */}
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="80" cy="120" r="45" fill="rgba(99,102,241,0.25)" />
                  <circle className="shape-element" cx="300" cy="90" r="65" fill="rgba(168,85,247,0.22)" />
                  <circle className="shape-element" cx="220" cy="280" r="85" fill="rgba(236,72,153,0.18)" />
                  <circle className="shape-element" cx="340" cy="310" r="32" fill="rgba(99,102,241,0.25)" />
                </svg>

                {/* Shape 2: Learning - Harmonic Waves */}
                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M0 180 Q100 80, 200 180 T 400 180"
                    stroke="rgba(168,85,247,0.3)"
                    strokeWidth="50"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 270 Q100 170, 200 270 T 400 270"
                    stroke="rgba(99,102,241,0.24)"
                    strokeWidth="35"
                    fill="none"
                  />
                </svg>

                {/* Shape 3: Roadmaps - Tech Matrix Dots */}
                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="50" cy="60" r="8" fill="rgba(59,130,246,0.35)" />
                  <circle className="shape-element" cx="150" cy="60" r="8" fill="rgba(99,102,241,0.35)" />
                  <circle className="shape-element" cx="250" cy="60" r="8" fill="rgba(147,51,234,0.35)" />
                  <circle className="shape-element" cx="350" cy="60" r="8" fill="rgba(59,130,246,0.35)" />
                  <circle className="shape-element" cx="100" cy="160" r="14" fill="rgba(59,130,246,0.3)" />
                  <circle className="shape-element" cx="200" cy="160" r="14" fill="rgba(168,85,247,0.3)" />
                  <circle className="shape-element" cx="300" cy="160" r="14" fill="rgba(99,102,241,0.3)" />
                  <circle className="shape-element" cx="60" cy="260" r="10" fill="rgba(147,51,234,0.35)" />
                  <circle className="shape-element" cx="160" cy="260" r="10" fill="rgba(59,130,246,0.35)" />
                  <circle className="shape-element" cx="260" cy="260" r="10" fill="rgba(99,102,241,0.35)" />
                  <circle className="shape-element" cx="360" cy="260" r="10" fill="rgba(147,51,234,0.35)" />
                </svg>

                {/* Shape 4: Practice - Morphing Coding Nodes */}
                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M90 110 Q140 40, 210 110 Q280 180, 210 250 Q140 320, 90 250 Q40 180, 90 110"
                    fill="rgba(236,72,153,0.2)"
                  />
                  <path
                    className="shape-element"
                    d="M240 210 Q290 140, 360 210 Q410 270, 360 330 Q300 370, 240 330 Q190 270, 240 210"
                    fill="rgba(168,85,247,0.18)"
                  />
                </svg>

                {/* Shape 5: Career - Velocity Diagonal Lines */}
                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <line className="shape-element" x1="0" y1="90" x2="320" y2="410" stroke="rgba(234,179,8,0.25)" strokeWidth="32" />
                  <line className="shape-element" x1="90" y1="0" x2="410" y2="320" stroke="rgba(245,158,11,0.22)" strokeWidth="24" />
                  <line className="shape-element" x1="190" y1="0" x2="410" y2="220" stroke="rgba(251,191,36,0.18)" strokeWidth="18" />
                </svg>

                {/* Shape 6: Explore - Radar Rings & Horizon */}
                <svg className="bg-shape bg-shape-6" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="200" cy="200" r="140" stroke="rgba(16,185,129,0.25)" strokeWidth="3" strokeDasharray="8 8" />
                  <circle className="shape-element" cx="200" cy="200" r="90" stroke="rgba(52,211,153,0.3)" strokeWidth="4" />
                  <circle className="shape-element" cx="200" cy="200" r="35" fill="rgba(16,185,129,0.24)" />
                </svg>

                {/* Shape 7: Analytics - Frequency Bars */}
                <svg className="bg-shape bg-shape-7" viewBox="0 0 400 400" fill="none">
                  <rect className="shape-element" x="50" y="160" width="24" height="180" rx="8" fill="rgba(139,92,246,0.25)" />
                  <rect className="shape-element" x="110" y="100" width="24" height="240" rx="8" fill="rgba(99,102,241,0.3)" />
                  <rect className="shape-element" x="170" y="140" width="24" height="200" rx="8" fill="rgba(168,85,247,0.25)" />
                  <rect className="shape-element" x="230" y="70" width="24" height="270" rx="8" fill="rgba(139,92,246,0.35)" />
                  <rect className="shape-element" x="290" y="120" width="24" height="220" rx="8" fill="rgba(99,102,241,0.28)" />
                </svg>

                {/* Shape 8: Settings - Concentric Dials */}
                <svg className="bg-shape bg-shape-8" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="200" cy="200" r="130" stroke="rgba(99,102,241,0.25)" strokeWidth="8" strokeDasharray="16 12" />
                  <circle className="shape-element" cx="200" cy="200" r="75" stroke="rgba(168,85,247,0.3)" strokeWidth="6" />
                  <circle className="shape-element" cx="200" cy="200" r="28" fill="rgba(99,102,241,0.3)" />
                </svg>
              </div>
            </div>

            {/* Menu Content Wrapper */}
            <div className="menu-content-wrapper">
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-100 dark:border-purple-900/30 shrink-0">
                <div className="flex items-center gap-2">
                  <SkillsCatalystLogo size="sm" showText animated />
                </div>

                {/* Kinetic Close Button */}
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close navigation"
                  className="nav-close-btn"
                >
                  <div className="menu-button-text">
                    <p className="p-large">Close</p>
                    <p className="p-large">Close</p>
                  </div>
                  <div className="icon-wrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="menu-button-icon"
                    >
                      <path
                        d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Feature Navigation List */}
              <div className="py-2 overflow-y-auto my-auto scrollbar-none">
                <ul className="menu-list">
                  {features.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id} className="menu-list-item" data-shape={item.shapeIndex}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigate(item.href);
                          }}
                          className="nav-link w-inline-block group"
                        >
                          <div className="flex items-center gap-3 relative z-10 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100/80 dark:border-purple-700/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white dark:group-hover:text-white transition-all shrink-0 shadow-xs">
                              <Icon className="w-5 h-5" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="nav-link-text truncate">{item.title}</p>
                                {item.badge && (
                                  <span
                                    data-menu-fade
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-700/60 shrink-0"
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span
                                data-menu-fade
                                className="text-[11px] text-slate-500 dark:text-purple-300/80 block -mt-0.5 tracking-normal font-medium truncate"
                              >
                                {item.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="nav-link-hover-bg" />
                          <ChevronRight
                            className="w-4 h-4 text-slate-400 dark:text-purple-400/60 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-all group-hover:translate-x-0.5 shrink-0"
                            data-menu-fade
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Drawer Bottom Bar: User Info & Support */}
              <div data-menu-fade className="pt-3 border-t border-slate-100 dark:border-purple-900/30 shrink-0 flex items-center justify-between gap-2">
                <div
                  onClick={() => handleNavigate("/settings")}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-purple-950/30 transition-colors min-w-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-purple-100 truncate max-w-[130px] sm:max-w-[170px]">
                      {userEmail}
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Pro Explorer</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href="/support"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/support");
                    }}
                    aria-label="Support desk"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-purple-950/50 hover:bg-slate-200 dark:hover:bg-purple-900/60 text-slate-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-purple-100 transition-colors border border-slate-200/60 dark:border-purple-800/50"
                  >
                    <LifeBuoy className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      closeMenu();
                      if (logout) logout();
                      router.push("/login");
                    }}
                    aria-label="Sign out"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-purple-950/50 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-700 dark:text-purple-300 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200/60 dark:border-purple-800/50 hover:border-red-200 dark:hover:border-red-800/50"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}

export default Component;
