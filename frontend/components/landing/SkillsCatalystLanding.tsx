"use client";

import React from "react";
import TechsnapDesktopHero from "./TechsnapDesktopHero";
import MobilePosterHero from "./MobilePosterHero";
import "@/app/skills-landing.css";

export default function SkillsCatalystLanding() {
  return (
    <main className="scLandingRoot">
      {/* Laptop / PC Desktop Presentation (Inspired by Techsnap with Penguin Theme) */}
      <TechsnapDesktopHero />

      {/* Mobile Smartphone Presentation (Exact Vertical Visual Poster) */}
      <MobilePosterHero />
    </main>
  );
}
