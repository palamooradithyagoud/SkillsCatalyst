import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("PracticeModeCards Palette Distinction Suite", () => {
  it("uses #6A3FEA violet for Beginner Coding Roadmap and soft lilac (#C4B5FD) for Company Questions instead of muted sage", () => {
    const cardsPath = path.resolve(__dirname, "../components/practice/PracticeModeCards.tsx");
    const src = fs.readFileSync(cardsPath, "utf-8");

    assert.ok(!src.includes("#A7B77A"), "PracticeModeCards must replace muted sage #A7B77A on both cards");
    assert.ok(src.includes("bg-[#6A3FEA]"), "Beginner Coding Roadmap card must use #6A3FEA");
    assert.ok(src.includes("text-white"), "Beginner Coding Roadmap header text must stay crisp white on #6A3FEA");
    assert.ok(src.includes("bg-[#C4B5FD]"), "Company Questions card must use soft pastel lilac #C4B5FD");
    assert.ok(src.includes("text-[#10110E]"), "Company Questions header text must remain obsidian #10110E on soft lilac");
  });
});
