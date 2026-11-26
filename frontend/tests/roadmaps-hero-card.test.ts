import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Dashboard Roadmaps Hero Card Suite", () => {
  it("uses tight-cropped roadmaps_hero.png and Roadmaps heading in LearningPathCarousel", () => {
    const carouselPath = path.join(process.cwd(), "components", "LearningPathCarousel.tsx");
    assert.ok(fs.existsSync(carouselPath), "LearningPathCarousel.tsx must exist");
    const src = fs.readFileSync(carouselPath, "utf-8");

    assert.ok(src.includes("/images/hub/roadmaps_hero.png"), "Must use roadmaps_hero.png");
    assert.ok(!src.includes("/images/hub/careerpath_hero.png"), "Must replace old careerpath_hero.png");
    assert.ok(src.includes("Road") && src.includes("maps"), "Must keep Roadmaps heading text");
    assert.ok(!src.includes("Career\n"), "Must replace Careerpath heading text with Roadmaps");

    const imgPath = path.join(process.cwd(), "public", "images", "hub", "roadmaps_hero.png");
    assert.ok(fs.existsSync(imgPath), "frontend/public/images/hub/roadmaps_hero.png must exist on disk");
  });
});
