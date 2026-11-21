import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Saved Course Progress Banner Implementation Contract", async (t) => {
  const filePath = path.join(process.cwd(), "components/learning/SavedCourseProgressBanner.tsx");
  assert.ok(fs.existsSync(filePath), "SavedCourseProgressBanner.tsx must exist");

  const content = fs.readFileSync(filePath, "utf-8");

  await t.test("verifies that the girl image has been completely removed", () => {
    assert.strictEqual(
      content.includes("saved_student_illustration.png"),
      false,
      "Must not reference saved_student_illustration.png"
    );
    assert.strictEqual(
      content.includes("<Image"),
      false,
      "Must not render Next.js <Image /> component for photo"
    );
  });

  await t.test("verifies that completed percentage is not hardcoded to 25% or 62%", () => {
    assert.strictEqual(
      content.includes("progressPct = 25"),
      false,
      "Must not have hardcoded 25% fallback"
    );
    assert.strictEqual(
      content.includes("let progressPct = 62"),
      false,
      "Must not have hardcoded 62% fallback"
    );
  });

  await t.test("verifies that video count replaces Module 1", () => {
    assert.strictEqual(
      content.includes("Module 1"),
      false,
      "Must not contain hardcoded Module 1"
    );
    assert.strictEqual(
      content.includes("Module ${"),
      false,
      "Must not format as Module X"
    );
    assert.ok(
      content.includes("videosCountText"),
      "Must compute videosCountText for the metadata row"
    );
  });

  await t.test("verifies that duration is cleanly converted from large minutes to Hours", () => {
    assert.ok(
      content.includes("Hours"),
      "Must support converting large minute durations (>=60 min) into Hours"
    );
  });

  await t.test("verifies that banner returns null when savedList is empty", () => {
    assert.ok(
      content.includes("if (!savedList || savedList.length === 0)"),
      "Must safely guard when user has no saved playlists"
    );
  });

  await t.test("verifies mobile moving cards and carousel track implementation", () => {
    assert.ok(
      content.includes("savedList.map"),
      "Must map through savedList to support all saved video cards"
    );
    assert.ok(
      content.includes("snap-x") && content.includes("snap-mandatory"),
      "Must have CSS snap scroll for touch swipe in mobile view"
    );
    assert.ok(
      content.includes("w-[88%]") || content.includes("shrink-0"),
      "Must size cards so next card peeks and is swipeable in mobile view"
    );
    assert.ok(
      content.includes("setInterval"),
      "Must have auto-advance interval to keep moving cards periodically"
    );
    assert.ok(
      content.includes("ChevronLeft") && content.includes("ChevronRight"),
      "Must provide navigation chevron controls for moving between cards"
    );
    assert.ok(
      content.includes("#D5FF38"),
      "Must highlight active card indicator with acid lime"
    );
  });

  await t.test("verifies different curated color themes (lilac, blue, magenta, cyan)", () => {
    assert.ok(
      content.includes("SAVED_CARD_THEMES"),
      "Must export or define SAVED_CARD_THEMES"
    );
    assert.ok(
      content.includes("lilac"),
      "Must include lilac theme"
    );
    assert.ok(
      content.includes("blue"),
      "Must include blue theme"
    );
    assert.ok(
      content.includes("magenta"),
      "Must include magenta theme"
    );
    assert.ok(
      content.includes("cyan"),
      "Must include cyan theme"
    );
    assert.ok(
      content.includes("theme.bg"),
      "Must apply theme.bg to the card container"
    );
  });
});
