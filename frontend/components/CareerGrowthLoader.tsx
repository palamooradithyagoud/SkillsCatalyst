"use client";

// CareerGrowthLoader is obsolete and replaced by LogoTransitionOverlay.
// This wrapper ensures backward compatibility if any legacy component imports it.
import LogoTransitionOverlay from "./LogoTransitionOverlay";

export default function CareerGrowthLoader() {
  return <LogoTransitionOverlay />;
}
