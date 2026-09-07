"use client";

import React from "react";
import SkillsCatalystDesktopHero from "./SkillsCatalystDesktopHero";
import MobilePosterHero from "./MobilePosterHero";
import "@/app/skills-landing.css";

export default function SkillsCatalystLanding() {
  return (
    <main className="scLandingRoot">
      {/* Laptop / PC Desktop Presentation (Penguin Summit Theme) */}
      <SkillsCatalystDesktopHero />

      {/* Mobile Smartphone Presentation (Exact Vertical Visual Poster) */}
      <MobilePosterHero />
    </main>
  );
}
