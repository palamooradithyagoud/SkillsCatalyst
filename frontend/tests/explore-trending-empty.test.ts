import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Explore Trending Empty State Suite", () => {
  it("removes hardcoded mock arrays and renders an empty Trending container", () => {
    const explorePath = path.resolve(__dirname, "../app/explore/page.tsx");
    const src = fs.readFileSync(explorePath, "utf-8");

    for (const token of [
      "AI_PICKS",
      "PROGRAMMING_LANGUAGES",
      "TRENDING_SKILLS",
      "CAREER_TRACKS",
      "POPULAR_TRACKS",
      "TOP_COMPANIES",
    ]) {
      assert.ok(!src.includes(token), `explore/page.tsx must not contain hardcoded ${token}`);
    }

    assert.ok(src.includes('activeTab === "trending"'), "explore/page.tsx must keep trending tab slot");
    assert.ok(src.includes("No Trending Items Found"), "trending tab must render clean empty state");
  });
});
