"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MobilePosterHero() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/login");
  };

  // Keyboard shortcut: Press Enter or Space to Get Started
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
      <div className="scMobilePosterWrapper">
        {/* Exact Vertical Skills Catalyst Mobile Poster */}
        <Image
          src="/images/skills_catalyst_mobile.jpg"
          alt="Skills Catalyst — Learn Anything, Go Further"
          fill
          priority
          sizes="(max-width: 860px) 100vw, 420px"
          className="scMobilePosterImage"
        />

        {/* Interactive "Get Started →" CTA Overlay */}
        <motion.button
          id="mobile-get-started-cta"
          type="button"
          onClick={handleGetStarted}
          whileTap={{ scale: 0.95 }}
          className="scMobileCTA"
          aria-label="Get Started and continue to Login"
        >
          <span className="scMobileCTAPulse" />
        </motion.button>
      </div>
    </div>
  );
}
