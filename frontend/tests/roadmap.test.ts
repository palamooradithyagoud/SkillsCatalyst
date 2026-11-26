import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SKILL_ROADMAPS, CAREER_ROADMAPS } from "@/data/roadmaps";
import {
  fetchActiveRoadmap,
  getFallbackActiveRoadmapData,
} from "@/lib/api/roadmaps";

const FRONTEND_ROOT = path.resolve(__dirname, "..");

function readFrontend(relPath: string): string {
  return fs.readFileSync(path.join(FRONTEND_ROOT, relPath), "utf8");
}

describe("Roadmaps Content & Enrollment/Progress Removal", () => {
  it("clears all skill and career roadmap catalog content", () => {
    assert.strictEqual(SKILL_ROADMAPS.length, 0);
    assert.strictEqual(CAREER_ROADMAPS.length, 0);
  });

  it("keeps the /roadmaps page shell without curriculum content, enrolling, or progress UI", () => {
    const roadmapsPage = readFrontend("app/roadmaps/page.tsx");
    assert.ok(roadmapsPage.includes("Developer Roadmaps"));
    assert.ok(roadmapsPage.includes("Roadmaps Content Coming Soon"));

    assert.ok(!roadmapsPage.includes("SKILL_ROADMAPS"));
    assert.ok(!roadmapsPage.includes("CAREER_ROADMAPS"));
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

  it("removes enrolling and progress controls from roadmap helper views", () => {
    const accordion = readFrontend("components/InteractivePracticeAccordionCard.tsx");
    assert.ok(!accordion.includes("onEnroll"));
    assert.ok(!accordion.includes("isEnrolled"));
    assert.ok(!accordion.includes(">Enroll<"));

    const curriculum = readFrontend("components/RoadmapCurriculumView.tsx");
    assert.ok(!curriculum.includes("onEnroll"));
    assert.ok(!curriculum.includes("isEnrolled"));
    assert.ok(!curriculum.includes("PROGRESS"));
    assert.ok(!curriculum.includes("progressPct"));

    const tree = readFrontend("components/RoadmapTreeView.tsx");
    assert.ok(!tree.includes("Mark as Completed"));
    assert.ok(!tree.includes("completedSubtopics"));
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
