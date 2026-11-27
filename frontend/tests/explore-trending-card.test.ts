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
    assert.ok(
      exploreSrc.includes("<TrendingSearchesSection />"),
      "explore/page.tsx must render TrendingSearchesSection on trending tab"
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

  it("renders Trending section in order Programming, Web Development, Data Analysis without icons", () => {
    const searchesPath = path.resolve(
      __dirname,
      "../components/explore/TrendingSearchesSection.tsx"
    );
    assert.ok(fs.existsSync(searchesPath), "TrendingSearchesSection.tsx must exist");
    const src = fs.readFileSync(searchesPath, "utf8");

    assert.ok(src.includes("Trending\n      </h3>"), "Must show Trending heading");
    assert.ok(!src.includes("Trending searches"), "Must not show Trending searches heading");

    // Verify strict category order: Programming first, Web Development second, Data Analysis third
    const progIdx = src.indexOf('title: "Programming"');
    const webIdx = src.indexOf('title: "Web Development"');
    const dataIdx = src.indexOf('title: "Data Analysis"');
    assert.ok(progIdx !== -1 && webIdx > progIdx && dataIdx > webIdx, "Categories must appear in order: Programming, Web Development, Data Analysis");

    // Verify all 9 items in expected order within categories
    for (const item of [
      "Python",
      "FastAPI",
      "Java",
      "React JS",
      "Node.js",
      "MongoDB",
      "MongoDB Beginners",
      "MongoDB Advanced",
      "PostgreSQL",
    ]) {
      assert.ok(src.includes(`title: "${item}"`), `Must include item ${item}`);
    }

    // Must not keep icons inside the trending search cards
    assert.ok(!src.includes("<svg"), "Must not render SVG icons inside Trending searches cards");
    assert.ok(!src.includes("lucide-react"), "Must not import lucide icons in Trending searches");
    assert.ok(!src.includes("<Image"), "Must not render thumbnail images inside Trending searches cards");
    assert.ok(!src.includes("<img"), "Must not render thumbnail imgs inside Trending searches cards");
  });

  it("wires Trending navigation link into desktop Sidebar right after Tech News", () => {
    const sidebarPath = path.resolve(
      __dirname,
      "../components/Sidebar.tsx"
    );
    const sidebarSrc = fs.readFileSync(sidebarPath, "utf8");

    const newsIdx = sidebarSrc.indexOf('id: "news"');
    const trendingIdx = sidebarSrc.indexOf('id: "trending"');
    const aiMentorIdx = sidebarSrc.indexOf('id: "ai-mentor"');

    assert.ok(newsIdx !== -1 && trendingIdx > newsIdx && aiMentorIdx > trendingIdx, "Sidebar must place Trending right after Tech News and before AI Mentor");
    assert.ok(sidebarSrc.includes('href: "/explore?tab=trending"'), "Sidebar Trending item must route to /explore?tab=trending");
    assert.ok(sidebarSrc.includes('currentExploreTab === "trending"'), "Sidebar must detect active Trending explore tab");
  });
});
