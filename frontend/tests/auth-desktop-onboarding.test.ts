import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import AuthOnboardingHero, { AUTH_ONBOARDING_SLIDES } from "@/components/auth/AuthOnboardingHero";

describe("Desktop Auth Onboarding Hero Suite", () => {
  it("AuthOnboardingHero component exists and exports a valid React component", () => {
    assert.ok(AuthOnboardingHero, "AuthOnboardingHero export must exist");
    assert.strictEqual(typeof AuthOnboardingHero, "function", "AuthOnboardingHero must be a component function");
  });

  it("verifies the 3 required onboarding slides match product features", () => {
    assert.strictEqual(AUTH_ONBOARDING_SLIDES.length, 3, "Must have 3 onboarding slides");

    const [slide1, slide2, slide3] = AUTH_ONBOARDING_SLIDES;

    // Slide 1: Personalized Learning Paths
    assert.strictEqual(slide1.id, "roadmaps");
    assert.strictEqual(slide1.image, "/images/onboarding_1.jpg");
    assert.strictEqual(slide1.title, "Personalized Learning Paths");
    assert.strictEqual(
      slide1.description,
      "Curated playlists and company-wise DSA questions to take your skills to the next level."
    );

    // Slide 2: Turn Every Scroll Into Learning
    assert.strictEqual(slide2.id, "skillbits");
    assert.strictEqual(slide2.image, "/images/onboarding_2.jpg");
    assert.strictEqual(slide2.title, "Turn Every Scroll Into Learning.");
    assert.strictEqual(
      slide2.description,
      "Learn tech concepts, coding tips, and career insights through quick 30–40 second videos."
    );

    // Slide 3: Discover Tech Opportunities
    assert.strictEqual(slide3.id, "explore");
    assert.strictEqual(slide3.image, "/images/onboarding_3.jpg");
    assert.strictEqual(slide3.title, "Discover Tech Opportunities");
    assert.strictEqual(
      slide3.description,
      "Discover hackathons, tech events, scholarships, and opportunities to level up your career."
    );

    // Verify all 3 image files exist in public/images
    for (const slide of AUTH_ONBOARDING_SLIDES) {
      const relativeImg = slide.image.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativeImg);
      assert.ok(fs.existsSync(fullPath), `Image file public/${relativeImg} must exist on disk`);
    }
  });

  it("verifies required UI elements in AuthOnboardingHero source code", () => {
    const heroPath = path.join(process.cwd(), "components", "auth", "AuthOnboardingHero.tsx");
    assert.ok(fs.existsSync(heroPath), "AuthOnboardingHero.tsx must exist");
    const content = fs.readFileSync(heroPath, "utf-8");

    // Sliders in flat white centered in the middle
    assert.ok(content.includes('id="auth-onboarding-sliders"'), "Must have sliders indicator");
    assert.ok(content.includes("bg-white"), "Sliders must be white");
    assert.ok(content.includes("justify-center"), "Sliders must be centered in the middle");

    // Navigation buttons removed on desktop
    assert.strictEqual(content.includes('id="auth-onboarding-prev-btn"'), false, "Must not have prev button on desktop");
    assert.strictEqual(content.includes('id="auth-onboarding-next-btn"'), false, "Must not have next button on desktop");

    // Auto-cycle every 2 seconds
    assert.ok(content.includes("2000"), "Must automatically cycle every 2 seconds");

    // Logo & brand
    assert.ok(content.includes("logo_white_v2.png"), "Must render white logo");
    assert.ok(content.includes("SkillsCatalyst"), "Must render brand title");
  });

  it("verifies login page renders AuthOnboardingHero instead of penguins", () => {
    const loginPagePath = path.join(process.cwd(), "app", "login", "page.tsx");
    assert.ok(fs.existsSync(loginPagePath), "frontend/app/login/page.tsx must exist");
    const loginContent = fs.readFileSync(loginPagePath, "utf-8");

    assert.ok(loginContent.includes("AuthOnboardingHero"), "Must import AuthOnboardingHero");
    assert.ok(loginContent.includes("<AuthOnboardingHero />"), "Must render <AuthOnboardingHero />");
    assert.strictEqual(loginContent.includes("<InteractiveCharacter"), false, "Penguins must not be rendered on login page");
  });
});
