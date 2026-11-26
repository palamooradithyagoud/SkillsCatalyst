import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SKILL_ROADMAPS,
  CAREER_ROADMAPS,
  ROADMAP_CARDS,
  getRoadmapCardById,
  getRoadmapLessonGroups,
  getRoadmapLessonCount,
} from "@/data/roadmaps";
import {
  fetchActiveRoadmap,
  getFallbackActiveRoadmapData,
} from "@/lib/api/roadmaps";

const FRONTEND_ROOT = path.resolve(__dirname, "..");

function readFrontend(relPath: string): string {
  return fs.readFileSync(path.join(FRONTEND_ROOT, relPath), "utf8");
}

describe("Roadmaps Showcase Card, Lesson Catalog & System Cleanup", () => {
  it("loads exact 29 user lessons across 6 color-coded groups from lessonsCatalog without dummy Img 2 items", () => {
    const groups = getRoadmapLessonGroups("ui-ux-designer");
    assert.strictEqual(groups.length, 6, "UI/UX Designer should have 6 lesson color groups");
    assert.strictEqual(getRoadmapLessonCount("ui-ux-designer"), 29, "Must preserve all 29 numbered lessons");

    const flatLessons = groups.flatMap((g) => g.lessons);
    assert.strictEqual(flatLessons[0].number, 1);
    assert.strictEqual(flatLessons[0].title, "Your AI design studio");
    assert.strictEqual(flatLessons[28].number, 29);
    assert.strictEqual(flatLessons[28].title, "Prompt engineering for design");

    const catalogFile = readFrontend("data/roadmaps/lessonsCatalog.ts");
    assert.ok(!catalogFile.includes("Pip's Big Day"), "Must remove placeholder practice items");
    assert.ok(!catalogFile.includes("Sleepify"), "Must remove placeholder practice items");
    assert.ok(!catalogFile.includes("UI/UX Basics"), "Must remove dummy step titles");
    assert.ok(!catalogFile.includes("Figma Mastery"), "Must remove dummy step titles");
  });

  it("derives ROADMAP_CARDS metrics dynamically from lessonsCatalog", () => {
    assert.ok(ROADMAP_CARDS.length >= 1, "ROADMAP_CARDS should contain card data");
    const uiux = getRoadmapCardById("ui-ux-designer");
    assert.ok(uiux, "ui-ux-designer card entry must exist");
    assert.strictEqual(uiux.titleAccent, "UI/UX");
    assert.strictEqual(uiux.titlePrimary, "Designer");
    assert.strictEqual(uiux.ctaLabel, "Explore Roadmap");
    assert.strictEqual(uiux.href, "/roadmaps/ui-ux-designer");
    assert.strictEqual(uiux.imageSrc, "/images/roadmaps/ui-ux-designer.png");
    assert.strictEqual(uiux.metrics.length, 3);
    assert.strictEqual(uiux.detail.completedUnits, 0);
    assert.strictEqual(uiux.detail.totalUnits, 29);
    assert.strictEqual(uiux.detail.actionLabel, "Continue Learning");

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

  it("keeps RoadmapSpotlightCard compact, mobile-streamlined, and strictly data-driven", () => {
    const cardComponent = readFrontend("components/roadmaps/RoadmapSpotlightCard.tsx");
    assert.ok(!cardComponent.includes("badgeLabel"), "Must not render the top Roadmap badge pill");
    assert.ok(!cardComponent.includes("line-clamp-3"), "Must not clip description text with line-clamp");
    assert.ok(cardComponent.includes("hidden sm:block text-[12.5px]"), "Description must be hidden on mobile view");
    assert.ok(cardComponent.includes("hidden sm:block space-y-3.5 mt-auto"), "Metrics row and bottom bar must be hidden on mobile view");
    assert.ok(cardComponent.includes('variant="mobile-inline"'), "Mobile view must place Explore CTA in place of description");
    assert.ok(!cardComponent.includes("UI/UX"), "Must not hardcode UI/UX");
    assert.ok(!cardComponent.includes("29 Units"), "Must not hardcode 29 Units");
    assert.ok(!cardComponent.includes("Explore Roadmap"), "Must not hardcode Explore Roadmap CTA");
  });

  it("keeps RoadmapDetailHero and RoadmapFlowchartTree strictly data-driven with dot background and mobile back nav", () => {
    const detailHero = readFrontend("components/roadmaps/RoadmapDetailHero.tsx");
    assert.ok(!detailHero.includes("Back to Roadmaps"), "Detail hero must not render a top Back button");
    assert.ok(!detailHero.includes("categoryLabel"), "Detail hero must not render the career roadmap eyebrow");
    assert.ok(!detailHero.includes("levelLabel"), "Detail hero must not render the Beginner level pill");
    assert.ok(!detailHero.includes("benefits"), "Detail hero must not render the What you'll get strip");
    assert.ok(!detailHero.includes("rounded-2xl bg-slate-50 dark:bg-[#16191F]"), "Avg. CTC, Key Tools, and Progress should render without nested boxes");
    assert.ok(detailHero.includes("getRoadmapLessonGroups"), "Detail hero must load lessons dynamically via getRoadmapLessonGroups");
    assert.ok(detailHero.includes("RoadmapFlowchartTree"), "Detail hero should render RoadmapFlowchartTree");

    const tree = readFrontend("components/roadmaps/RoadmapFlowchartTree.tsx");
    assert.ok(tree.includes("[background-image:radial-gradient("), "Must preserve the dot-grid canvas background");
    assert.ok(tree.includes("max-w-[1080px]"), "Must utilize full laptop canvas width bilaterally");
    assert.ok(tree.includes("MOBILE_SERPENTINE_STOPS"), "Must use right-labeled serpentine stops with right-margin U-loops on mobile");
    assert.ok(tree.includes("loopRightOut"), "Must include dramatic right-side U-turn loops matching the mobile reference design");
    assert.ok(tree.includes("WIDE_WAVE_STOPS"), "Must alternate bilateral left/right serpentine stops on wide viewports");
    assert.ok(tree.includes("getTotalLength"), "Must measure SVG segment path lengths for progressive scroll line reveal");
    assert.ok(tree.includes("strokeDashoffset"), "Must progressively animate path stroke reveal along scroll");
    assert.ok(tree.includes("revealedCount"), "Must synchronize node and color reveal state with scroll progress");
    assert.ok(!tree.includes("Your AI design studio"), "Flowchart tree component must not hardcode lesson titles");
    assert.ok(!tree.includes("Figma fluency"), "Flowchart tree component must not hardcode lesson titles");
    assert.ok(!tree.includes("Prompt engineering for design"), "Flowchart tree component must not hardcode lesson titles");
    assert.ok(!tree.includes("UI/UX Basics"), "Flowchart tree component must not hardcode Img 2 titles");

    const detailPage = readFrontend("app/roadmaps/[id]/page.tsx");
    assert.ok(detailPage.includes("getRoadmapCardById"));
    assert.ok(detailPage.includes("RoadmapDetailHero"));

    const mobileNav = readFrontend("components/MobileNav.tsx");
    assert.ok(mobileNav.includes('pathname.startsWith("/roadmaps/")'));
    assert.ok(mobileNav.includes("isActiveRoadmapView"));
    assert.ok(mobileNav.includes('aria-label="Back to Roadmaps"'));
    assert.ok(mobileNav.includes("!isActiveRoadmapView"));
  });

  it("keeps legacy skill/career syllabus arrays cleared and removes enrolling/progress DB UI", () => {
    assert.strictEqual(SKILL_ROADMAPS.length, 0);
    assert.strictEqual(CAREER_ROADMAPS.length, 0);

    const roadmapsPage = readFrontend("app/roadmaps/page.tsx");
    assert.ok(roadmapsPage.includes("ROADMAP_CARDS"));
    assert.ok(roadmapsPage.includes("RoadmapSpotlightCard"));
    assert.ok(!roadmapsPage.includes("SKILL_ROADMAPS"));
    assert.ok(!roadmapsPage.includes("handleEnroll"));
    assert.ok(!roadmapsPage.includes("roadmap_progress"));
  });

  it("keeps the dashboard Roadmaps widget intact and disables roadmap DB tracking", async () => {
    const carousel = readFrontend("components/LearningPathCarousel.tsx");
    assert.ok(carousel.includes("/images/hub/roadmaps_hero.png"));
    assert.ok(carousel.includes('"/roadmaps"'));

    const active = await fetchActiveRoadmap();
    const fallback = await getFallbackActiveRoadmapData();
    assert.deepStrictEqual(active, { has_active_roadmap: false });
    assert.deepStrictEqual(fallback, { has_active_roadmap: false });
  });
});
