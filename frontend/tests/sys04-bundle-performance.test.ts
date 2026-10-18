import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(FRONTEND_DIR, "components");
const APP_DIR = path.join(FRONTEND_DIR, "app");
const DATA_DIR = path.join(FRONTEND_DIR, "data");

describe("SYS-04: PlacementPrepModal Bundle Performance & Code Splitting Suite", () => {
  it("1. QuickHubNav does NOT import PlacementPrepModal", () => {
    const quickHubPath = path.join(COMPONENTS_DIR, "QuickHubNav.tsx");
    assert.ok(fs.existsSync(quickHubPath), "QuickHubNav.tsx must exist");
    const content = fs.readFileSync(quickHubPath, "utf-8");

    assert.ok(
      !content.includes("PlacementPrepModal"),
      "PERFORMANCE REGRESSION: QuickHubNav must not import or reference PlacementPrepModal"
    );
    assert.ok(
      !content.includes("isPlacementPrepOpen"),
      "DEAD STATE REGRESSION: QuickHubNav must not maintain unused isPlacementPrepOpen state"
    );
  });

  it("2. Career page uses dynamic code-splitting for PlacementPrepModal", () => {
    const careerPagePath = path.join(APP_DIR, "career", "page.tsx");
    assert.ok(fs.existsSync(careerPagePath), "career/page.tsx must exist");
    const content = fs.readFileSync(careerPagePath, "utf-8");

    // Must import next/dynamic
    assert.ok(
      content.includes('import dynamic from "next/dynamic";') ||
      content.includes("import dynamic from 'next/dynamic';"),
      "PERFORMANCE REGRESSION: career/page.tsx must import dynamic from next/dynamic"
    );

    // Must not have top-level static import of PlacementPrepModal
    assert.ok(
      !content.match(/^import\s+PlacementPrepModal\s+from/m),
      "PERFORMANCE REGRESSION: career/page.tsx must not statically import PlacementPrepModal"
    );

    // Must use dynamic(() => import("@/components/PlacementPrepModal")
    assert.ok(
      content.includes('import("@/components/PlacementPrepModal")'),
      "PERFORMANCE REGRESSION: career/page.tsx must dynamically import PlacementPrepModal"
    );

    // Must gate rendering on isPlacementPrepOpen
    assert.ok(
      content.includes("isPlacementPrepOpen &&"),
      "PERFORMANCE REGRESSION: career/page.tsx must conditionally mount PlacementPrepModal on isPlacementPrepOpen"
    );
  });

  it("3. PlacementPrepModal does NOT import static question JSON datasets", () => {
    const modalPath = path.join(COMPONENTS_DIR, "PlacementPrepModal.tsx");
    assert.ok(fs.existsSync(modalPath), "PlacementPrepModal.tsx must exist");
    const content = fs.readFileSync(modalPath, "utf-8");

    const prohibitedDatasets = [
      "allAptitudeQuestions.json",
      "logicalReasoningQuestions.json",
      "verbalAbilityQuestions.json",
      "logicalReasoningQuestions",
      "verbalAbilityQuestions",
      "aptitudeQuestions",
    ];

    for (const dataset of prohibitedDatasets) {
      assert.ok(
        !content.includes(dataset),
        `PERFORMANCE & SECURITY REGRESSION: PlacementPrepModal must not import '${dataset}'`
      );
    }
  });

  it("4. PlacementPrepModal uses dynamic question loading via getQuestionsByTopicName", () => {
    const modalPath = path.join(COMPONENTS_DIR, "PlacementPrepModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");

    assert.ok(
      content.includes("getQuestionsByTopicName"),
      "FUNCTIONALITY REGRESSION: PlacementPrepModal must use getQuestionsByTopicName for on-demand topic question loading"
    );
    assert.ok(
      content.includes("toLegacyQuestions"),
      "FUNCTIONALITY REGRESSION: PlacementPrepModal must use toLegacyQuestions adapter"
    );
  });
});
