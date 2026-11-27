"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import AnalyticsIcon from "@/components/icons/AnalyticsIcon";
import LearnIcon from "@/components/icons/LearnIcon";
import SkillBitsIcon from "@/components/icons/SkillBitsIcon";
import ExploreIcon from "@/components/icons/ExploreIcon";
import RoadmapsIcon from "@/components/icons/RoadmapsIcon";
import PracticeIcon from "@/components/icons/PracticeIcon";
import CareerIcon from "@/components/icons/CareerIcon";
import {
  LayoutGrid,
  User,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Sparkles,
  Crown,
  Calendar,
  ListTodo,
} from "lucide-react";
import SkillsCatalystLogo from "@/components/SkillsCatalystLogo";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePricingModal } from "@/contexts/PricingModalContext";
import ThemeSwitch from "@/components/ThemeSwitch";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

// Pale light pastel palette (Blue, Yellow, Pink) — zero glass, zero purple
function getPaleAvatarTheme(initial: string) {
  const code = (initial || "U").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = [
    {
      bg: "bg-[#FEF9C3] hover:bg-[#FEF08A]",
      text: "text-[#854D0E]",
      border: "border-[#FDE047]/80",
    }, // Pale Yellow
    {
      bg: "bg-[#E0F2FE] hover:bg-[#BAE6FD]",
      text: "text-[#0369A1]",
      border: "border-[#BAE6FD]",
    }, // Pale Blue
    {
      bg: "bg-[#FCE7F3] hover:bg-[#FBCFE8]",
      text: "text-[#9D174D]",
      border: "border-[#FBCFE8]",
    }, // Pale Pink
  ];
  return palettes[code % palettes.length];
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
    id: "tasks",
    shapeIndex: 1,
    title: "To-Do List",
    subtitle: "Study Sessions & Tasks",
    href: "/tasks",
    icon: ListTodo,
    accentColor: "rgba(184, 146, 255, 0.2)",
  },
  {
    id: "skillbits",
    shapeIndex: 2,
    title: "SkillBits",
    subtitle: "Bite-Sized Video Reels",
    href: "/skillbits",
    icon: SkillBitsIcon,
    accentColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    id: "learning",
    shapeIndex: 3,
    title: "Learning",
    subtitle: "Curated Playlists & Tracks",
    href: "/learning",
    icon: LearnIcon,
    accentColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    id: "roadmaps",
    shapeIndex: 3,
    title: "Roadmaps",
    subtitle: "Interactive Career Tracks",
    href: "/roadmaps",
    icon: RoadmapsIcon,
    accentColor: "rgba(59, 130, 246, 0.2)",
  },
  {
    id: "practice",
    shapeIndex: 4,
    title: "Practice",
    subtitle: "Aptitude & Coding Drills",
    href: "/practice",
    icon: PracticeIcon,
    accentColor: "rgba(236, 72, 153, 0.2)",
  },
  {
    id: "career",
    shapeIndex: 5,
    title: "Career",
    subtitle: "AI Resume & ATS Review",
    href: "/career",
    icon: CareerIcon,
    accentColor: "rgba(234, 179, 8, 0.2)",
  },
  {
    id: "explore",
    shapeIndex: 6,
    title: "Explore Hub",
    subtitle: "Trending Skills & Grants",
    href: "/explore",
    icon: ExploreIcon,
    accentColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "analytics",
    shapeIndex: 7,
    title: "Analytics",
    subtitle: "Readiness & Performance",
    href: "/analytics",
    icon: AnalyticsIcon,
    accentColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    id: "settings",
    shapeIndex: 8,
    title: "Profile & Settings",
    subtitle: "Account & Preferences",
    href: "/profile",
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
  const arrowTlRef = useRef<gsap.core.Timeline | null>(null);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();
  const { isPremium, expiresAt } = useSubscription();
  const { openPricingModal } = usePricingModal();

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
        const arrowTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: !isMenuOpen });
        arrowTlRef.current = arrowTl;
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
      arrowTlRef.current?.kill();
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
        // Resume arrow timeline when drawer opens
        arrowTlRef.current?.play();

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
        // Pause arrow timeline when drawer closes to free CPU / RAF
        arrowTlRef.current?.pause();

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

  const userEmail = session?.email || (isLoading ? "Loading account..." : "Guest User");
  const userInitial = session?.name
    ? session.name.split(/\s+/).filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : session?.email
      ? session.email.split("@")[0].substring(0, 2).toUpperCase()
      : isLoading
        ? ".."
        : "GU";
  const avatarTheme = getPaleAvatarTheme(userInitial);

  return (
    <div ref={containerRef}>
      {/* Optional Standalone Trigger / Site Header */}
      {showTrigger && (
        <div className="site-header-wrapper">
          <header className="header">
            <div className="container is--full">
              <nav className="nav-row">
                <a href="/dashboard" aria-label="home" className="nav-logo-row w-inline-block">
                  <SkillsCatalystLogo
                    size="sm"
                    showText
                    animated
                    strokeColor="#A7B77A"
                    textColor="text-[#A7B77A]"
                  />
                </a>
                <div className="nav-row__right">
                  {/* Clean Menu Indicator */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Explore Menu"
                    aria-expanded={isMenuOpen}
                    className="nav-toggle-label"
                    onClick={toggleMenu}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleMenu();
                      }
                    }}
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                  >
                    <span className="toggle-text">Explore Menu</span>
                  </div>

                  {/* Restored Kinetic Menu Button */}
                  <button
                    type="button"
                    aria-label="Toggle Menu"
                    aria-expanded={isMenuOpen}
                    className="nav-close-btn"
                    onClick={toggleMenu}
                    style={{ pointerEvents: "auto" }}
                  >
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
          <div className="overlay" onClick={closeMenu} aria-hidden="true" />

          <nav className="menu-content" aria-label="Mobile Navigation">
            {/* Sliding Curtain Layers & Shapes */}
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              {/* Ambient Background Shapes Container (Glass shapes removed) */}
              <div className="ambient-background-shapes" />
            </div>

            {/* Menu Content Wrapper */}
            <div className="menu-content-wrapper">
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-100 dark:border-[#24271F] shrink-0 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SkillsCatalystLogo
                    size="sm"
                    showText
                    animated
                    strokeColor="#A7B77A"
                    textColor="text-[#A7B77A]"
                  />
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
                          <div className="flex items-center gap-2.5 sm:gap-3 relative z-10 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-[#18191E] border border-slate-200/80 dark:border-[#24271F] flex items-center justify-center text-slate-700 dark:text-neutral-200 group-hover:scale-105 group-hover:bg-[#d5ff38] group-hover:text-black dark:group-hover:bg-[#d5ff38] dark:group-hover:text-black group-hover:border-[#d5ff38] transition-all shrink-0 shadow-xs">
                              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="nav-link-text truncate">{item.title}</p>
                                {item.badge && (
                                  <span
                                    data-menu-fade
                                    className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#d5ff38]/10 text-slate-700 dark:text-[#d5ff38] border border-slate-200/80 dark:border-[#d5ff38]/30 shrink-0"
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span
                                data-menu-fade
                                className="text-[10px] sm:text-[11px] text-slate-500 dark:text-neutral-400 block -mt-0.5 tracking-normal font-medium truncate"
                              >
                                {item.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="nav-link-hover-bg" />
                          <ChevronRight
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-neutral-500 group-hover:text-[#d5ff38] dark:group-hover:text-[#d5ff38] transition-all group-hover:translate-x-0.5 shrink-0"
                            data-menu-fade
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Drawer Bottom Bar: User Info & Support */}
              <div data-menu-fade className="pt-3 border-t border-slate-100 dark:border-[#24271F] shrink-0 flex items-center justify-between gap-2">
                <div
                  onClick={() => handleNavigate("/profile")}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#18191E] transition-colors min-w-0"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl ${avatarTheme.bg} ${avatarTheme.text} border ${avatarTheme.border} flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0 select-none`}
                  >
                    <span>{userInitial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[170px]">
                      {userEmail}
                    </p>
                    {isPremium ? (
                      <div className="flex flex-col mt-0.5">
                        <span className="text-[10px] font-semibold text-[#d5ff38] flex items-center gap-1 leading-tight">
                          Pro Explorer
                          <Crown className="w-2.5 h-2.5 text-[#d5ff38] shrink-0" />
                        </span>
                        {formattedExpiry && (
                          <span className="text-[9.5px] font-medium text-slate-400 flex items-center gap-1 mt-0.5 leading-tight">
                            <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            Renews {formattedExpiry}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                          Free Explorer
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeMenu();
                            if (openPricingModal) {
                              openPricingModal();
                            } else {
                              window.dispatchEvent(new CustomEvent("open-pricing-modal"));
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d5ff38] hover:bg-[#c4ec32] border border-[#d5ff38] text-black font-bold text-[9.5px] shadow-2xs transition-all active:scale-95 cursor-pointer leading-tight"
                        >
                          <Crown className="w-2.5 h-2.5 text-black shrink-0" />
                          <span>Buy PRO</span>
                        </button>
                      </div>
                    )}
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
                    className="p-2 rounded-xl bg-slate-100 dark:bg-[#18191E] hover:bg-slate-200 dark:hover:bg-[#24262E] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/60 dark:border-[#24271F]"
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
                    className="p-2 rounded-xl bg-slate-100 dark:bg-[#18191E] hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-700 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200/60 dark:border-[#24271F] hover:border-red-200 dark:hover:border-red-800/50"
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
