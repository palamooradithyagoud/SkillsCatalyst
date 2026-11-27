import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Tech News Card Theme & Parity with Learn Card Suite", () => {
  it("verifies TechNewsStories uses the Learn card theme (#1D1D1D) and not dark charcoal (#18191F)", () => {
    const storiesPath = path.resolve(__dirname, "../components/tech-news/TechNewsStories.tsx");
    assert.ok(fs.existsSync(storiesPath), "TechNewsStories.tsx must exist");
    const src = fs.readFileSync(storiesPath, "utf-8");

    // Must use Learn card background and border
    assert.ok(src.includes("dark:bg-[#1D1D1D]"), "TechNewsStories must use dark:bg-[#1D1D1D] matching Learn card");
    assert.ok(src.includes("dark:border-white/[0.08]"), "TechNewsStories must use dark:border-white/[0.08] matching Learn card");
    assert.ok(src.includes("rounded-[20px] sm:rounded-[24px]"), "TechNewsStories must use rounded-[20px] sm:rounded-[24px] matching Learn card");
    assert.ok(src.includes("hub-card-shadow"), "TechNewsStories must use hub-card-shadow");

    // Must not contain old dark charcoal #18191F
    assert.ok(!src.includes("#18191F"), "TechNewsStories must not contain old dark charcoal #18191F");
  });

  it("verifies TechNewsSourceCircle uses dark:bg-[#1D1D1D] for inner circle cutout and pill border", () => {
    const circlePath = path.resolve(__dirname, "../components/tech-news/TechNewsSourceCircle.tsx");
    assert.ok(fs.existsSync(circlePath), "TechNewsSourceCircle.tsx must exist");
    const src = fs.readFileSync(circlePath, "utf-8");

    assert.ok(src.includes("dark:bg-[#1D1D1D]"), "TechNewsSourceCircle must use dark:bg-[#1D1D1D]");
    assert.ok(src.includes("dark:border-[#1D1D1D]"), "TechNewsSourceCircle must use dark:border-[#1D1D1D]");
    assert.ok(!src.includes("#18191F"), "TechNewsSourceCircle must not contain old #18191F");
  });

  it("verifies TechNewsWidget uses dark:bg-[#1D1D1D] and dark:border-white/[0.08]", () => {
    const widgetPath = path.resolve(__dirname, "../components/explore/TechNewsWidget.tsx");
    assert.ok(fs.existsSync(widgetPath), "TechNewsWidget.tsx must exist");
    const src = fs.readFileSync(widgetPath, "utf-8");

    assert.ok(src.includes("dark:bg-[#1D1D1D]"), "TechNewsWidget must use dark:bg-[#1D1D1D]");
    assert.ok(src.includes("dark:border-white/[0.08]"), "TechNewsWidget must use dark:border-white/[0.08]");
    assert.ok(!src.includes("#18191F"), "TechNewsWidget must not contain old #18191F");
    assert.ok(!src.includes("<Newspaper"), "TechNewsWidget empty state must not render the removed Newspaper purple icon");
    assert.ok(!src.includes("bg-purple-900/30"), "TechNewsWidget empty state must not render the purple icon container");
  });
});
