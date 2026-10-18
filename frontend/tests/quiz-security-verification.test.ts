import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { toLegacyQuestions } from "../lib/aptitude/questions";
import { QuestionDTO } from "../types/aptitude";

describe("SYS-01: Quiz Answer Key Confidentiality & Authoritative Scoring Suite", () => {
  const FRONTEND_DIR = path.resolve(__dirname, "..");
  const DATA_DIR = path.join(FRONTEND_DIR, "data");
  const COMPONENTS_DIR = path.join(FRONTEND_DIR, "components");

  it("1. PlacementPrepModal has ZERO imports from @/data/aptitudeQuestions", () => {
    const modalPath = path.join(COMPONENTS_DIR, "PlacementPrepModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");

    assert.ok(
      !content.includes('from "@/data/aptitudeQuestions"'),
      "SECURITY VIOLATION: PlacementPrepModal must not import from @/data/aptitudeQuestions"
    );
    assert.ok(
      !content.includes("QUANTITATIVE_APTITUDE_MAP"),
      "SECURITY VIOLATION: QUANTITATIVE_APTITUDE_MAP must not be referenced in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("PERCENTAGES_QUESTIONS"),
      "SECURITY VIOLATION: PERCENTAGES_QUESTIONS must not be referenced in PlacementPrepModal"
    );
  });

  it("2. PlacementPrepModal does not evaluate correctness using client question properties", () => {
    const modalPath = path.join(COMPONENTS_DIR, "PlacementPrepModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");

    assert.ok(
      !content.includes("targetQ.correctIndex"),
      "SECURITY VIOLATION: targetQ.correctIndex found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("currentQ.correctIndex"),
      "SECURITY VIOLATION: currentQ.correctIndex found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("currentQ.solution"),
      "SECURITY VIOLATION: currentQ.solution found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("currentQ.answerText"),
      "SECURITY VIOLATION: currentQ.answerText found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("q.correctIndex"),
      "SECURITY VIOLATION: q.correctIndex found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("q.solution"),
      "SECURITY VIOLATION: q.solution found in PlacementPrepModal"
    );
    assert.ok(
      !content.includes("q.answerText"),
      "SECURITY VIOLATION: q.answerText found in PlacementPrepModal"
    );
  });

  it("3. Solution toggles in PlacementPrepModal are strictly guarded behind server submission", () => {
    const modalPath = path.join(COMPONENTS_DIR, "PlacementPrepModal.tsx");
    const content = fs.readFileSync(modalPath, "utf-8");

    // Must check userAnswers AND revealedSolutions before showing solution controls
    assert.ok(
      content.includes("userAnswers[currentQ.id] !== undefined && revealedSolutions[currentQ.id]"),
      "SECURITY VIOLATION: Solution toggles must be guarded behind answer submission and server response"
    );
  });

  it("4. percentagesQuestions.ts contains zero answer keys or solutions", () => {
    const percPath = path.join(DATA_DIR, "percentagesQuestions.ts");
    const content = fs.readFileSync(percPath, "utf-8");

    assert.ok(
      !content.includes("correctIndex:"),
      "SECURITY VIOLATION: correctIndex found in percentagesQuestions.ts"
    );
    assert.ok(
      !content.includes("answerText:"),
      "SECURITY VIOLATION: answerText found in percentagesQuestions.ts"
    );
    assert.ok(
      !content.includes("solution:"),
      "SECURITY VIOLATION: solution found in percentagesQuestions.ts"
    );
  });

  it("5. aptitudeQuestions.ts contains zero answer keys or solutions", () => {
    const aptPath = path.join(DATA_DIR, "aptitudeQuestions.ts");
    const content = fs.readFileSync(aptPath, "utf-8");

    assert.ok(
      !content.includes("correctIndex:"),
      "SECURITY VIOLATION: correctIndex found in aptitudeQuestions.ts"
    );
    assert.ok(
      !content.includes("answerText:"),
      "SECURITY VIOLATION: answerText found in aptitudeQuestions.ts"
    );
    assert.ok(
      !content.includes("solution:"),
      "SECURITY VIOLATION: solution found in aptitudeQuestions.ts"
    );
    assert.ok(
      !content.includes("allAptitudeQuestions.json"),
      "SECURITY VIOLATION: allAptitudeQuestions.json imported in aptitudeQuestions.ts"
    );
  });

  it("6. LegacyPlacementQuestion type in aptitude.ts strictly excludes answer fields", () => {
    const typesPath = path.join(FRONTEND_DIR, "types", "aptitude.ts");
    const content = fs.readFileSync(typesPath, "utf-8");

    // Find LegacyPlacementQuestion interface definition
    const match = content.match(/export interface LegacyPlacementQuestion \{([^}]+)\}/);
    assert.ok(match, "LegacyPlacementQuestion interface must exist");
    const body = match[1];

    assert.ok(!body.includes("correctIndex"), "LegacyPlacementQuestion must not have correctIndex");
    assert.ok(!body.includes("answerText"), "LegacyPlacementQuestion must not have answerText");
    assert.ok(!body.includes("solution"), "LegacyPlacementQuestion must not have solution");
  });

  it("7. toLegacyQuestions maps QuestionDTO to safe LegacyPlacementQuestion without answers", () => {
    const mockDTOs: QuestionDTO[] = [
      {
        id: "d9f8e7a6-b5c4-4321-9876-abcdef012345",
        topic_id: "0bbfb5da-4537-4018-9fab-c1c3b311bc0d",
        question_code: "QA_PERC_001",
        legacy_id: 1,
        question_text: "What is 20% of 500?",
        difficulty: "easy",
        source: "indiabix",
        options: [
          { id: "opt-1", key: "A", text: "80", display_order: 0 },
          { id: "opt-2", key: "B", text: "100", display_order: 1 },
          { id: "opt-3", key: "C", text: "120", display_order: 2 },
          { id: "opt-4", key: "D", text: "140", display_order: 3 },
        ],
      },
    ];

    const legacy = toLegacyQuestions(mockDTOs);
    assert.equal(legacy.length, 1);
    const q = legacy[0];

    assert.equal(q.id, 1);
    assert.equal(q.dbId, "d9f8e7a6-b5c4-4321-9876-abcdef012345");
    assert.equal(q.question, "1. What is 20% of 500?");
    assert.equal(q.options.length, 4);
    assert.equal(q.options[0], "a) 80");
    assert.equal(q.options[1], "b) 100");

    // Critical security invariants:
    assert.equal((q as any).correctIndex, undefined);
    assert.equal((q as any).answerText, undefined);
    assert.equal((q as any).solution, undefined);
    assert.equal((q as any).is_correct, undefined);
  });
});
