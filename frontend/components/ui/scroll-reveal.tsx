"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  triggerHook?: number; // default: 0.9 (triggers when scrolled 10% into view from bottom)
  durationPercent?: number; // default: 80% (duration of visibility across viewport height)
  transitionDuration?: string; // default: "1s"
  id?: string;
}

/**
 * ScrollReveal Component
 * Replicates the ScrollMagic "Reveal on Scroll" effect:
 * - Hidden state: opacity 0, scale(0.9) with 1s ease-in-out transition
 * - Visible state: opacity 1, scale(1)
 * - Reveals when entering triggerHook (default 0.9)
 * - Hides when scrolled past the top (matching ScrollMagic duration)
 */
export function ScrollReveal({
  children,
  className,
  triggerHook = 0.9,
  durationPercent = 80,
  transitionDuration = "1s",
  id,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check visibility based on element position relative to viewport
    const updateVisibility = () => {
      if (!el) return;
      const bRect = el.getBoundingClientRect();
      const wHeight = window.innerHeight || document.documentElement.clientHeight;

      // triggerHook: 0.9 -> trigger when element top enters 90% of viewport height
      const enteredBottom = bRect.top <= wHeight * triggerHook;
      // exit threshold: element bottom scrolled past top margin (10% of viewport)
      const exitLimit = wHeight * Math.max(0.04, 1 - (triggerHook - (1 - durationPercent / 100)));
      const exitedTop = bRect.bottom <= exitLimit;

      if (enteredBottom && !exitedTop) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Run on initial mount (with double RAF to ensure accurate DOM rect after layout)
    requestAnimationFrame(() => {
      requestAnimationFrame(updateVisibility);
    });

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [triggerHook, durationPercent]);

  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        "scroll-magic-reveal",
        isVisible && "visible",
        className
      )}
      style={{
        ...style,
        WebkitTransition: `all ${transitionDuration} ease-in-out`,
        MozTransition: `all ${transitionDuration} ease-in-out`,
        msTransition: `all ${transitionDuration} ease-in-out`,
        OTransition: `all ${transitionDuration} ease-in-out`,
        transition: `all ${transitionDuration} ease-in-out`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;

