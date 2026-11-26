import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("CourseCard Multi-Dimension Alignment & Swapped Slot Layout Suite", () => {
  it("places Completed & Pending in the top-right slot beside the dial and renders full-width video title at the bottom across all dimensions", () => {
    const cardPath = path.join(process.cwd(), "components", "CourseCard.tsx");
    assert.ok(fs.existsSync(cardPath), "CourseCard.tsx must exist");
    const src = fs.readFileSync(cardPath, "utf-8");

    // Responsive dimension breakpoints
    assert.ok(src.includes("const isCompact = W < 245"), "Must detect narrow mobile cards < 245px");
    assert.ok(src.includes("const isMedium = W >= 245 && W < 310"), "Must detect medium cards 245px-309px");
    assert.ok(src.includes("const cutSpan = scoopR * 2"), "Must dynamically scale scoop cutout span");
    assert.ok(src.includes("const topMetaLeft = cutSpan"), "Completed & Pending slot must align cleanly right of dial cutout");

    // Top-right status badges positioned cleanly at enlarged desktop scale without truncating "Completed" / "Pending"
    assert.ok(src.includes("const topMetaTop = isCompact ? Math.round(cutSpan * 0.5) : isMedium ? 32 : 26"), "Status rows must anchor cleanly across sizes");
    assert.ok(src.includes("text-[10.5px]") && src.includes("text-[17px] lg:text-[19px]"), "Status rows must scale up prominently on desktop while keeping compact full spelling");
    assert.ok(src.includes('<span className="whitespace-nowrap">{displayCompleted}</span>'), "Completed label must never ellipsis-truncate");
    const topMetaIdx = src.indexOf("Top-Right Slot: Completed & Pending Status Rows");
    const bottomTitleIdx = src.indexOf("Bottom Full-Width Slot: Video / Course Title");
    const displayCompletedIdx = src.indexOf("{displayCompleted}");
    const titleIdx = src.indexOf("{title}");

    assert.ok(topMetaIdx !== -1 && bottomTitleIdx !== -1, "Must define both swapped layout regions");
    assert.ok(displayCompletedIdx > topMetaIdx && displayCompletedIdx < bottomTitleIdx, "Completed/Pending must sit in top-right slot");
    assert.ok(titleIdx > bottomTitleIdx, "Video/course title must sit in bottom full-width slot");

    // Strict containment & bottom pagination dot clearance
    assert.ok(src.includes("const bottomOffset = isCompact ? 22 : 18"), "Compact bottom title must clear carousel pagination dots");
    assert.ok(src.includes("line-clamp-2"), "Long video titles must clamp gracefully to 2 lines");
  });
});
