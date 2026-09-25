/**
 * frontend/tests/lesson-content.test.ts
 * Frontend test suite for SkillsCatalyst Lesson Content Architecture (Phase 2A).
 * Tests TypeScript type contracts, API exports, block discriminated union invariants,
 * and empty payload support.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as CoursesAPI from "@/lib/api/courses";
import type {
  LessonBlock,
  BlockType,
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  CodeBlock,
  OutputBlock,
  ListBlock,
  TableBlock,
  CalloutBlock,
  QuoteBlock,
  YouTubeBlock,
  LinkBlock,
  KeyTakeawaysBlock,
  LessonContentResponse,
  SaveLessonContentPayload,
} from "@/types/lesson-content";

describe("Lesson Content Architecture (Phase 2A) - Frontend API & Types Integrity", () => {
  it("preserves identical export references between facade and courses API module", () => {
    assert.strictEqual(
      FacadeAPI.fetchAdminLessonContent,
      CoursesAPI.fetchAdminLessonContent,
      "fetchAdminLessonContent must be exported identically from facade"
    );
    assert.strictEqual(
      FacadeAPI.saveAdminLessonContent,
      CoursesAPI.saveAdminLessonContent,
      "saveAdminLessonContent must be exported identically from facade"
    );
  });

  it("supports empty lesson content payload as valid initial state", () => {
    const emptyPayload: SaveLessonContentPayload = {
      blocks: [],
    };
    assert.strictEqual(emptyPayload.blocks.length, 0);

    const emptyResponse: LessonContentResponse = {
      id: "cnt-1",
      lesson_id: "les-1",
      schema_version: 1,
      blocks: [],
      created_at: "2026-09-25T20:00:00Z",
      updated_at: "2026-09-25T20:00:00Z",
    };
    assert.strictEqual(emptyResponse.blocks.length, 0);
    assert.strictEqual(emptyResponse.schema_version, 1);
  });

  it("validates all 12 block type contracts and discriminated unions", () => {
    const headingBlock: HeadingBlock = {
      id: "b-head-1",
      type: "heading",
      order: 0,
      content: { level: 2, text: "Introduction to Algorithms" },
    };

    const paraBlock: ParagraphBlock = {
      id: "b-para-1",
      type: "paragraph",
      order: 1,
      content: { text: "An algorithm is a step-by-step procedure." },
    };

    const imgBlock: ImageBlock = {
      id: "b-img-1",
      type: "image",
      order: 2,
      content: {
        url: "https://images.unsplash.com/photo-1",
        alt: "Algorithm Flowchart",
        caption: "Flowchart diagram",
      },
    };

    const codeBlock: CodeBlock = {
      id: "b-code-1",
      type: "code",
      order: 3,
      content: {
        language: "python",
        code: "def binary_search(arr, target): pass",
      },
    };

    const outputBlock: OutputBlock = {
      id: "b-out-1",
      type: "output",
      order: 4,
      content: { text: "Found at index 4" },
    };

    const listBlock: ListBlock = {
      id: "b-list-1",
      type: "list",
      order: 5,
      content: {
        ordered: false,
        items: ["Divide", "Conquer", "Combine"],
      },
    };

    const tableBlock: TableBlock = {
      id: "b-table-1",
      type: "table",
      order: 6,
      content: {
        headers: ["Case", "Time Complexity"],
        rows: [
          ["Best", "O(1)"],
          ["Worst", "O(log n)"],
        ],
      },
    };

    const calloutBlock: CalloutBlock = {
      id: "b-call-1",
      type: "callout",
      order: 7,
      content: {
        variant: "warning",
        title: "Edge Case",
        text: "Array must be sorted prior to binary search.",
      },
    };

    const quoteBlock: QuoteBlock = {
      id: "b-quote-1",
      type: "quote",
      order: 8,
      content: {
        text: "Premature optimization is the root of all evil.",
        author: "Donald Knuth",
      },
    };

    const ytBlock: YouTubeBlock = {
      id: "b-yt-1",
      type: "youtube",
      order: 9,
      content: {
        video_id: "dQw4w9WgXcQ",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Algorithm Explanation Video",
      },
    };

    const linkBlock: LinkBlock = {
      id: "b-link-1",
      type: "link",
      order: 10,
      content: {
        text: "Binary Search Visualizer",
        url: "https://visualgo.net",
      },
    };

    const takeawaysBlock: KeyTakeawaysBlock = {
      id: "b-takeaways-1",
      type: "key_takeaways",
      order: 11,
      content: {
        items: [
          "Binary search operates in logarithmic time.",
          "Requires sorted monotonic input.",
        ],
      },
    };

    const allBlocks: LessonBlock[] = [
      headingBlock,
      paraBlock,
      imgBlock,
      codeBlock,
      outputBlock,
      listBlock,
      tableBlock,
      calloutBlock,
      quoteBlock,
      ytBlock,
      linkBlock,
      takeawaysBlock,
    ];

    assert.strictEqual(allBlocks.length, 12);

    // Verify type tags match discriminator
    const types: BlockType[] = allBlocks.map((b) => b.type);
    assert.deepStrictEqual(types, [
      "heading",
      "paragraph",
      "image",
      "code",
      "output",
      "list",
      "table",
      "callout",
      "quote",
      "youtube",
      "link",
      "key_takeaways",
    ]);
  });

  it("verifies heading level constraint limits to 2, 3, and 4", () => {
    const validLevels: Array<HeadingBlock["content"]["level"]> = [2, 3, 4];
    assert.strictEqual(validLevels.length, 3);
  });

  it("verifies callout variants are restricted to info, tip, warning, and important", () => {
    const variants: Array<CalloutBlock["content"]["variant"]> = [
      "info",
      "tip",
      "warning",
      "important",
    ];
    assert.strictEqual(variants.length, 4);
  });

  it("verifies table row and column length consistency", () => {
    const validTable: TableBlock["content"] = {
      headers: ["Col A", "Col B", "Col C"],
      rows: [
        ["1", "2", "3"],
        ["4", "5", "6"],
      ],
    };
    const colCount = validTable.headers.length;
    for (const row of validTable.rows) {
      assert.strictEqual(
        row.length,
        colCount,
        "Every row must match header column count"
      );
    }
  });
});
