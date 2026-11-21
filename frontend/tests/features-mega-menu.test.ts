import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import FeaturesMegaMenu, {
  FEATURE_CATEGORIES,
} from "@/components/landing/FeaturesMegaMenu";

describe("Features Mega Menu Suite (Reference Image 2 Contract)", () => {
  it("verifies FeaturesMegaMenu is exported and is a valid component function", () => {
    assert.ok(FeaturesMegaMenu, "FeaturesMegaMenu must be exported");
    assert.strictEqual(
      typeof FeaturesMegaMenu,
      "function",
      "FeaturesMegaMenu must be a component function"
    );
  });

  it("verifies all 8 required categories exist matching user specifications", () => {
    assert.strictEqual(FEATURE_CATEGORIES.length, 8, "Must define exactly 8 feature categories");

    const categoryIds = FEATURE_CATEGORIES.map((c) => c.id);
    assert.deepStrictEqual(categoryIds, [
      "roadmaps",
      "courses",
      "practice",
      "interview-prep",
      "resume-prep",
      "scholarships",
      "events",
      "tech-news",
    ]);

    const categoryLabels = FEATURE_CATEGORIES.map((c) => c.label);
    assert.deepStrictEqual(categoryLabels, [
      "Roadmaps",
      "Courses",
      "Practice",
      "Interview prep",
      "Resume prep",
      "Scholarships",
      "Events",
      "Tech news",
    ]);

    // Explicit check: compilers removed for now
    assert.strictEqual(categoryIds.includes("compilers"), false, "Compilers must be removed for now");
  });

  it("verifies Roadmaps category contains the 6 cards and metadata without LPA", () => {
    const roadmaps = FEATURE_CATEGORIES.find((c) => c.id === "roadmaps");
    assert.ok(roadmaps, "Roadmaps category must exist");
    assert.strictEqual(roadmaps.title, "Roadmaps");
    assert.strictEqual(
      roadmaps.description,
      "Step-by-step roadmaps showing what to learn, which projects to build and key milestones for each tech role."
    );
    assert.strictEqual(roadmaps.subheading, "Popular roadmaps");
    assert.strictEqual(roadmaps.viewAllText, "View all roadmaps");
    assert.strictEqual(roadmaps.viewAllHref, "/roadmaps");

    assert.strictEqual(roadmaps.cards.length, 6, "Must contain exactly 6 popular roadmaps");

    const expectedCards = [
      {
        title: "Frontend Developer Roadmap",
        subtitle: "Beginner · React, Next.js & Modern UI",
      },
      {
        title: "Backend Developer Roadmap",
        subtitle: "Beginner · Node.js, Python & Cloud APIs",
      },
      {
        title: "Full Stack Developer Roadmap",
        subtitle: "Beginner · End-to-end full stack architecture",
      },
      {
        title: "DevOps Engineer Roadmap",
        subtitle: "Intermediate · Docker, Kubernetes & CI/CD",
      },
      {
        title: "Data Analyst Roadmap",
        subtitle: "Beginner · Python, SQL & Data Insights",
      },
      {
        title: "AI Engineer Roadmap",
        subtitle: "Intermediate · PyTorch, LLMs & AI Systems",
      },
    ];

    expectedCards.forEach((expected, idx) => {
      assert.strictEqual(roadmaps.cards[idx].title, expected.title);
      assert.strictEqual(roadmaps.cards[idx].subtitle, expected.subtitle);
      assert.strictEqual(roadmaps.cards[idx].subtitle.includes("LPA"), false, "Card must not contain LPA");
    });
  });

  it("verifies LandingNavbar and SkillsCatalystDesktopHero integrate FeaturesMegaMenu", () => {
    const heroPath = path.join(
      process.cwd(),
      "components",
      "landing",
      "SkillsCatalystDesktopHero.tsx"
    );
    const navPath = path.join(
      process.cwd(),
      "components",
      "landing",
      "LandingNavbar.tsx"
    );

    const heroContent = fs.readFileSync(heroPath, "utf-8");
    const navContent = fs.readFileSync(navPath, "utf-8");

    assert.ok(
      heroContent.includes("FeaturesMegaMenu"),
      "SkillsCatalystDesktopHero must import FeaturesMegaMenu"
    );
    assert.ok(
      heroContent.includes('item.id === "features"'),
      "SkillsCatalystDesktopHero must check item.id === 'features' for mega menu"
    );

    assert.ok(
      navContent.includes("FeaturesMegaMenu"),
      "LandingNavbar must import FeaturesMegaMenu"
    );
    assert.ok(
      navContent.includes('item.id === "features"'),
      "LandingNavbar must check item.id === 'features' for mega menu"
    );
  });
});
