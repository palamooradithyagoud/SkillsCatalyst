import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Explore Trending SkillsCatalyst Hero Card Suite", () => {
  it("renders blended text-free illustration carousel on mobile and compact SkillsCatalyst card on desktop", () => {
    const explorePath = path.resolve(__dirname, "../app/explore/page.tsx");
    const cardPath = path.resolve(
      __dirname,
      "../components/explore/TrendingJobReadyCard.tsx"
    );

    const exploreSrc = fs.readFileSync(explorePath, "utf-8");
    const cardSrc = fs.readFileSync(cardPath, "utf-8");

    for (const filename of [
      "trending-job-ready-desk.png",
      "trending-tech-stack.png",
      "trending-skill-steps.png",
    ]) {
      const pngPath = path.resolve(
        __dirname,
        "../public/images/explore",
        filename
      );
      assert.ok(fs.existsSync(pngPath), `${filename} asset must exist`);
      assert.ok(
        cardSrc.includes(`/images/explore/${filename}`),
        `Must include ${filename} in rotation`
      );
    }

    assert.ok(
      exploreSrc.includes('activeTab === "trending"'),
      "explore/page.tsx must wire trending tab"
    );
    assert.ok(
      exploreSrc.includes("<TrendingJobReadyCard />"),
      "explore/page.tsx must render TrendingJobReadyCard on trending tab"
    );

    // Ensure old hardcoded mock trending arrays remain absent
    for (const token of [
      "AI_PICKS",
      "PROGRAMMING_LANGUAGES",
      "TRENDING_SKILLS",
      "CAREER_TRACKS",
      "POPULAR_TRACKS",
      "TOP_COMPANIES",
    ]) {
      assert.ok(
        !exploreSrc.includes(token),
        `explore/page.tsx must not contain hardcoded ${token}`
      );
    }

    // Desktop retains SkillsCatalyst branding & Get Job Ready copy inside compact card
    assert.ok(cardSrc.includes("SkillsCatalyst"), "Must brand desktop card as SkillsCatalyst");
    assert.ok(!/Techsnap/i.test(cardSrc), "Must not leak Techsnap brand copy");
    assert.ok(cardSrc.includes("Get Job"), "Must render Get Job Ready headline on desktop");
    assert.ok(
      cardSrc.includes("hidden md:flex"),
      "Must hide promo text block completely on mobile view"
    );

    // Mobile view blends seamlessly without a card container
    assert.ok(
      cardSrc.includes("rounded-none md:rounded-[24px]"),
      "Mobile must use blended unboxed surface while desktop uses compact rounded card"
    );
    assert.ok(
      cardSrc.includes("bg-transparent md:bg-[#111214]"),
      "Mobile must blend into page canvas with transparent background"
    );
    assert.ok(
      cardSrc.includes("border-0 md:border"),
      "Mobile must omit card border"
    );

    // Rotation every 1.5 seconds emerging smoothly from bottom right corner
    assert.ok(
      cardSrc.includes("SLIDE_INTERVAL_MS = 1500"),
      "Must rotate artwork every 1.5 seconds (1500ms)"
    );
    assert.ok(
      cardSrc.includes('transformOrigin: "bottom right"'),
      "Slides must pop up smoothly from the bottom-right corner"
    );
    assert.ok(
      cardSrc.includes("AnimatePresence"),
      "Must animate slide transitions with AnimatePresence"
    );
  });
});
