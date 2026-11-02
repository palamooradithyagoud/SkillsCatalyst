"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { X, ChevronRight } from "lucide-react";

// Register GSAP CustomEase safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export interface LandingKineticMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
  onNavigateToPricing: () => void;
}

const MENU_ITEMS = [
  {
    id: "features",
    label: "Features",
    subtitle: "Structured tracks & AI technical rounds",
    shapeIndex: "1",
  },
  {
    id: "community",
    label: "Community",
    subtitle: "Tech study pods, Discord & alumni network",
    shapeIndex: "2",
  },
  {
    id: "career-path",
    label: "Career Path",
    subtitle: "Full Stack, AI/ML, Cloud & DevOps tracks",
    shapeIndex: "3",
  },
  {
    id: "resources",
    label: "Resources",
    subtitle: "Developer cheat sheets & ATS templates",
    shapeIndex: "4",
  },
  {
    id: "pricing",
    label: "Pricing",
    subtitle: "Student Pass (₹99) & Catalyst Pro",
    shapeIndex: "5",
  },
];

export default function LandingKineticMobileNav({
  isOpen,
  onClose,
  onNavigateToLogin,
  onNavigateToPricing,
}: LandingKineticMobileNavProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup CustomEase and Ambient Shape Hover/Touch Effects
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      if (!gsap.parseEase("main")) {
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.65 });
      }
    } catch {
      gsap.defaults({ ease: "power3.out", duration: 0.65 });
    }

    const ctx = gsap.context(() => {
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
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.55,
              stagger: 0.07,
              ease: "back.out(1.7)",
              overwrite: "auto",
            }
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.28,
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

  // Menu Open/Close Kinetic GSAP Animation: Coming From TOP to DOWN
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector(".landing-top-down-menu");
      const menu = containerRef.current!.querySelector(".menu-content");
      const overlay = containerRef.current!.querySelector(".overlay");
      const bgPanels = containerRef.current!.querySelectorAll(".backdrop-layer");
      const menuLinks = containerRef.current!.querySelectorAll(".nav-link");
      const fadeTargets = containerRef.current!.querySelectorAll("[data-menu-fade]");
      const closeBtnIcon = containerRef.current!.querySelector(".nav-close-btn-icon");

      const tl = gsap.timeline();

      if (isOpen) {
        // Prevent body scroll when menu is open
        document.body.style.overflow = "hidden";

        // OPEN: Cascade from TOP to DOWN
        if (navWrap) navWrap.setAttribute("data-nav", "open");

        tl.set(navWrap, { display: "block" })
          .set(menu, { yPercent: 0 }, "<")
          .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, "<")
          // Kinetic Top-to-Down Cascading Layers
          .fromTo(
            bgPanels,
            { yPercent: -101 },
            { yPercent: 0, stagger: 0.1, duration: 0.55, ease: "main" },
            "<"
          )
          // Menu links roll into place
          .fromTo(
            menuLinks,
            { yPercent: 70, opacity: 0, rotate: 4 },
            { yPercent: 0, opacity: 1, rotate: 0, stagger: 0.045, ease: "main" },
            "<+=0.28"
          )
          .fromTo(closeBtnIcon, { rotate: -90, scale: 0.8 }, { rotate: 0, scale: 1, duration: 0.4 }, "<");

        if (fadeTargets.length) {
          tl.fromTo(
            fadeTargets,
            { autoAlpha: 0, yPercent: 30 },
            { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "all" },
            "<+=0.1"
          );
        }
      } else {
        // Restore body scroll
        document.body.style.overflow = "";

        // CLOSE: Cascade back UP to the TOP
        if (navWrap) navWrap.setAttribute("data-nav", "closed");

        tl.to(overlay, { autoAlpha: 0, duration: 0.3 })
          .to(
            bgPanels,
            { yPercent: -101, stagger: -0.06, duration: 0.38, ease: "power2.in" },
            "<"
          )
          .to(menu, { yPercent: -100, duration: 0.38, ease: "power2.in" }, "<")
          .to(closeBtnIcon, { rotate: 90, duration: 0.3 }, "<")
          .set(navWrap, { display: "none" });
      }
    }, containerRef);

    return () => {
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [isOpen]);

  // Escape key handling
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleItemClick = (id: string) => {
    onClose();
    if (id === "pricing") {
      onNavigateToPricing();
    } else {
      onNavigateToLogin();
    }
  };

  return (
    <div ref={containerRef}>
      <div data-nav="closed" className="landing-top-down-menu">
        {/* Backdrop overlay */}
        <div className="overlay" onClick={onClose} aria-label="Close menu backdrop" />

        {/* Top-to-Down Menu Panel */}
        <nav className="menu-content" aria-label="Mobile Navigation">
          {/* Animated Multi-Layer Background (Top to Down Kinetic Curtains) */}
          <div className="menu-bg">
            <div className="backdrop-layer first" />
            <div className="backdrop-layer second" />
            <div className="backdrop-layer" />

            {/* Ambient Animated Background Shapes */}
            <div className="ambient-background-shapes">
              {/* Shape 1: Floating circles */}
              <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                <circle className="shape-element" cx="80" cy="120" r="40" fill="rgba(104,53,148,0.18)" />
                <circle className="shape-element" cx="300" cy="80" r="60" fill="rgba(139,92,246,0.15)" />
                <circle className="shape-element" cx="200" cy="300" r="80" fill="rgba(236,72,153,0.12)" />
                <circle className="shape-element" cx="350" cy="280" r="30" fill="rgba(104,53,148,0.16)" />
              </svg>

              {/* Shape 2: Wave pattern */}
              <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                <path
                  className="shape-element"
                  d="M0 200 Q100 100, 200 200 T 400 200"
                  stroke="rgba(104,53,148,0.22)"
                  strokeWidth="50"
                  fill="none"
                />
                <path
                  className="shape-element"
                  d="M0 280 Q100 180, 200 280 T 400 280"
                  stroke="rgba(168,85,247,0.18)"
                  strokeWidth="35"
                  fill="none"
                />
              </svg>

              {/* Shape 3: Grid dots */}
              <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                <circle className="shape-element" cx="60" cy="60" r="8" fill="rgba(104,53,148,0.3)" />
                <circle className="shape-element" cx="160" cy="60" r="8" fill="rgba(139,92,246,0.3)" />
                <circle className="shape-element" cx="260" cy="60" r="8" fill="rgba(236,72,153,0.3)" />
                <circle className="shape-element" cx="100" cy="160" r="12" fill="rgba(139,92,246,0.25)" />
                <circle className="shape-element" cx="200" cy="160" r="12" fill="rgba(236,72,153,0.25)" />
                <circle className="shape-element" cx="300" cy="160" r="12" fill="rgba(104,53,148,0.25)" />
                <circle className="shape-element" cx="60" cy="260" r="10" fill="rgba(236,72,153,0.3)" />
                <circle className="shape-element" cx="160" cy="260" r="10" fill="rgba(104,53,148,0.3)" />
                <circle className="shape-element" cx="260" cy="260" r="10" fill="rgba(139,92,246,0.3)" />
              </svg>

              {/* Shape 4: Organic blobs */}
              <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                <path
                  className="shape-element"
                  d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                  fill="rgba(104,53,148,0.14)"
                />
                <path
                  className="shape-element"
                  d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                  fill="rgba(236,72,153,0.12)"
                />
              </svg>

              {/* Shape 5: Diagonal lines */}
              <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                <line
                  className="shape-element"
                  x1="0"
                  y1="100"
                  x2="300"
                  y2="400"
                  stroke="rgba(104,53,148,0.18)"
                  strokeWidth="25"
                />
                <line
                  className="shape-element"
                  x1="100"
                  y1="0"
                  x2="400"
                  y2="300"
                  stroke="rgba(168,85,247,0.14)"
                  strokeWidth="20"
                />
              </svg>
            </div>
          </div>

          {/* Menu Content Wrapper */}
          <div className="menu-content-wrapper">
            {/* Top Bar inside Menu Header */}
            <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md">
                  <Image
                    src="/logo_white_v2.png"
                    alt="SkillsCatalyst Logo"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  SkillsCatalyst
                </span>
              </div>

              {/* Close Button with crisp rotation */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-800 transition-all shadow-sm"
                aria-label="Close navigation menu"
              >
                <X size={20} strokeWidth={2.6} className="nav-close-btn-icon" />
              </button>
            </div>

            {/* Menu List Items */}
            <ul className="menu-list">
              {MENU_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="menu-list-item"
                  data-shape={item.shapeIndex}
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="nav-link cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-slate-900 leading-snug">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        {item.subtitle}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                    <div className="nav-link-hover-bg" />
                  </div>
                </li>
              ))}
            </ul>

            {/* Bottom Actions Row */}
            <div className="pt-3.5 mt-2 border-t border-slate-100 flex flex-col gap-2.5" data-menu-fade>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToLogin();
                }}
                className="w-full py-3 rounded-full bg-[#683594] hover:bg-[#54287a] active:scale-[0.98] text-white font-bold text-center shadow-lg shadow-purple-900/30 transition-all text-sm"
              >
                Login to SkillsCatalyst
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPricing();
                }}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-semibold text-center text-xs transition-colors"
              >
                Student Pass: ₹99
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
