import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SKILL_ROADMAPS,
  CAREER_ROADMAPS,
  ROADMAP_CARDS,
} from "@/data/roadmaps";
import {
  fetchActiveRoadmap,
  getFallbackActiveRoadmapData,
} from "@/lib/api/roadmaps";

const FRONTEND_ROOT = path.resolve(__dirname, "..");

function readFrontend(relPath: string): string {
  return fs.readFileSync(path.join(FRONTEND_ROOT, relPath), "utf8");
}

describe("Roadmaps Showcase Card, Data & System Cleanup", () => {
  it("provides generic data-driven ROADMAP_CARDS starting with UI/UX Designer", () => {
    assert.ok(ROADMAP_CARDS.length >= 1, "ROADMAP_CARDS should contain card data");
    const uiux = ROADMAP_CARDS.find((c) => c.id === "ui-ux-designer");
    assert.ok(uiux, "ui-ux-designer card entry must exist");
    assert.strictEqual(uiux.titleAccent, "UI/UX");
    assert.strictEqual(uiux.titlePrimary, "Designer");
    assert.strictEqual(uiux.ctaLabel, "Explore Roadmap");
    assert.strictEqual(uiux.imageSrc, "/images/roadmaps/ui-ux-designer.png");
    assert.strictEqual(uiux.metrics.length, 3);

    const publicImgPath = path.join(
      FRONTEND_ROOT,
      "public",
      uiux.imageSrc.replace(/^\//, "")
    );
    assert.ok(
      fs.existsSync(publicImgPath),
      "UI/UX Designer illustration PNG must exist in public/images/roadmaps/"
    );
  });

  it("keeps RoadmapSpotlightCard compact, top-aligned, and strictly data-driven with zero hardcoded card copy", () => {
    const cardComponent = readFrontend("components/roadmaps/RoadmapSpotlightCard.tsx");
    assert.ok(!cardComponent.includes("badgeLabel"), "Must not render the top Roadmap badge pill");
    assert.ok(!cardComponent.includes("line-clamp-3"), "Must not clip description text with line-clamp");
    assert.ok(!cardComponent.includes("UI/UX"), "Must not hardcode UI/UX");
    assert.ok(!cardComponent.includes("Designer"), "Must not hardcode Designer");
    assert.ok(!cardComponent.includes("29 Units"), "Must not hardcode 29 Units");
    assert.ok(!cardComponent.includes("4 Projects"), "Must not hardcode 4 Projects");
    assert.ok(!cardComponent.includes("Beginner"), "Must not hardcode Beginner");
    assert.ok(
      !cardComponent.includes("Explore Roadmap"),
      "Must not hardcode Explore Roadmap CTA"
    );
    assert.ok(
      !cardComponent.includes("ui-ux-designer"),
      "Must not hardcode asset path"
    );
  });

  it("keeps legacy skill/career syllabus arrays cleared and removes enrolling/progress UI", () => {
    assert.strictEqual(SKILL_ROADMAPS.length, 0);
    assert.strictEqual(CAREER_ROADMAPS.length, 0);

    const roadmapsPage = readFrontend("app/roadmaps/page.tsx");
    assert.ok(roadmapsPage.includes("ROADMAP_CARDS"));
    assert.ok(roadmapsPage.includes("RoadmapSpotlightCard"));
    assert.ok(!roadmapsPage.includes("SKILL_ROADMAPS"));
    assert.ok(!roadmapsPage.includes("RoadmapDetailView"));
    assert.ok(!roadmapsPage.includes("RoadmapCurriculumView"));
    assert.ok(!roadmapsPage.includes("handleEnroll"));
    assert.ok(!roadmapsPage.includes("enrolledIds"));
    assert.ok(!roadmapsPage.includes("roadmap_progress"));
    assert.ok(!roadmapsPage.includes("skillscatalyst_enrolled_roadmaps"));
    assert.ok(!roadmapsPage.includes("skillscatalyst_roadmap_completed_nodes"));
  });

  it("keeps the dashboard Roadmaps widget intact", () => {
    const carousel = readFrontend("components/LearningPathCarousel.tsx");
    assert.ok(carousel.includes("/images/hub/roadmaps_hero.png"));
    assert.ok(carousel.includes('"/roadmaps"'));
    assert.ok(carousel.includes("Road"));
    assert.ok(carousel.includes("maps"));
  });

  it("disables active roadmap and progress sync in roadmap/dashboard APIs", async () => {
    const active = await fetchActiveRoadmap();
    const fallback = await getFallbackActiveRoadmapData();
    assert.deepStrictEqual(active, { has_active_roadmap: false });
    assert.deepStrictEqual(fallback, { has_active_roadmap: false });

    const roadmapsApi = readFrontend("lib/api/roadmaps.ts");
    assert.ok(!roadmapsApi.includes('from("roadmap_progress")'));

    const dashboardApi = readFrontend("lib/api/dashboard.ts");
    assert.ok(!dashboardApi.includes('from("roadmap_progress")'));
    assert.ok(!dashboardApi.includes("skillscatalyst_active_roadmap"));
  });
});
