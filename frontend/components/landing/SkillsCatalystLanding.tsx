"use client";

import React from "react";
import SkillsCatalystDesktopHero from "./SkillsCatalystDesktopHero";
import MobilePosterHero from "./MobilePosterHero";
import "@/app/skills-landing.css";

export default function SkillsCatalystLanding() {
  return (
    <main className="scLandingRoot">
      {/* Unified responsive landing presentation (Single DOM tree & single H1) */}
      <SkillsCatalystDesktopHero />
    </main>
  );
}
