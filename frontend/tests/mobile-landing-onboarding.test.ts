import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import MobileLandingOnboarding, { ONBOARDING_SLIDES } from "@/components/landing/MobileLandingOnboarding";

describe("Mobile Landing Onboarding Feature Suite", () => {
  it("MobileLandingOnboarding component exists and exports a valid React functional component", () => {
    assert.ok(MobileLandingOnboarding, "MobileLandingOnboarding must exist");
    assert.strictEqual(typeof MobileLandingOnboarding, "function", "MobileLandingOnboarding must be a component function");
  });

  it("verifies the 3 required onboarding slides with images exist and match product features", () => {
    assert.strictEqual(ONBOARDING_SLIDES.length, 3, "Must have exactly 3 onboarding slides");

    const [slide1, slide2, slide3] = ONBOARDING_SLIDES;

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
    for (const slide of ONBOARDING_SLIDES) {
      const relativeImg = slide.image.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativeImg);
      assert.ok(fs.existsSync(fullPath), `Image file public/${relativeImg} must exist on disk`);
    }
  });

  it("verifies required UI elements in MobileLandingOnboarding component source code", () => {
    const compPath = path.join(process.cwd(), "components", "landing", "MobileLandingOnboarding.tsx");
    assert.ok(fs.existsSync(compPath), "MobileLandingOnboarding.tsx must exist");
    const content = fs.readFileSync(compPath, "utf-8");

    // 1. Top right corner: Skip text button without neon badge
    assert.ok(content.includes('id="onboarding-skip-btn"'), "Must have skip button with id 'onboarding-skip-btn'");
    assert.ok(content.includes("handleSkip"), "Skip button must invoke skip handler");
    assert.ok(content.includes("text-white"), "Skip button text must be white");

    // 2. Bottom left corner: Slider indicator with white color
    assert.ok(content.includes('id="onboarding-slider-indicator"'), "Must have slider indicator with id 'onboarding-slider-indicator'");
    assert.ok(content.includes("bg-white"), "Sliders must be white color");

    // 3. Bottom right corner: Circular Prev and Next buttons in acid lime & black
    assert.ok(content.includes('id="onboarding-prev-btn"'), "Must have prev button with id 'onboarding-prev-btn'");
    assert.ok(content.includes('id="onboarding-next-btn"'), "Must have next button with id 'onboarding-next-btn'");
    assert.ok(content.includes("rounded-full"), "Prev and Next buttons must be circular");
    assert.ok(content.includes("bg-[#D5FF38]"), "Prev and Next buttons must be acid lime");
    assert.ok(content.includes("text-black"), "Navigation arrows must be black");
  });

  it("verifies landing hero integration triggers mobile onboarding on mobile view", () => {
    const heroPath = path.join(process.cwd(), "components", "landing", "SkillsCatalystDesktopHero.tsx");
    assert.ok(fs.existsSync(heroPath), "SkillsCatalystDesktopHero.tsx must exist");
    const heroContent = fs.readFileSync(heroPath, "utf-8");

    // Must import and render MobileLandingOnboarding
    assert.ok(heroContent.includes("MobileLandingOnboarding"), "Must import MobileLandingOnboarding");
    assert.ok(heroContent.includes("<MobileLandingOnboarding"), "Must render <MobileLandingOnboarding />");

    // Must handle mobile onboarding state
    assert.ok(heroContent.includes("isMobileOnboardingOpen"), "Must maintain isMobileOnboardingOpen state");
    assert.ok(heroContent.includes("window.innerWidth <= 860"), "Must detect mobile view viewport threshold");
    assert.ok(heroContent.includes("handleOnboardingComplete"), "Must define handleOnboardingComplete");
    assert.ok(heroContent.includes("handleOnboardingSkip"), "Must define handleOnboardingSkip");
  });
});
