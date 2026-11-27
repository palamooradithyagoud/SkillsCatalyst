import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Explore Events Horizontal Card Layout & Data-Driven Theme Suite", () => {
  it("renders dynamic horizontal split event cards with zero hardcoding and zero purple styles", () => {
    const filePath = path.resolve(
      __dirname,
      "..",
      "components",
      "explore",
      "EventsWidget.tsx"
    );
    assert.ok(fs.existsSync(filePath), "EventsWidget.tsx must exist");
    const src = fs.readFileSync(filePath, "utf8");

    const cardStart = src.indexOf("Small / Compact Cards Grid");
    const cardEnd = src.indexOf("Total Info Modal");
    assert.ok(cardStart !== -1 && cardEnd > cardStart, "Must locate cards grid block");

    const cardBlock = src.slice(cardStart, cardEnd);
    assert.ok(!cardBlock.includes("border-purple"), "Event card must not use purple borders");
    assert.ok(!cardBlock.includes("text-purple"), "Event card must not use purple text or icons");
    assert.ok(!cardBlock.includes("#C084FC"), "Event card must not use #C084FC purple accent");
    assert.ok(!cardBlock.includes("from-purple"), "Event card fallback thumbnail must not use purple gradient");

    // Compact 2-column horizontal split structure with sharp rectangular poster & acid-lime accents
    assert.ok(cardBlock.includes("md:grid-cols-2"), "Must render compact 2-column grid on tablet/desktop");
    assert.ok(cardBlock.includes("flex-row"), "Must use compact horizontal split card layout");
    assert.ok(cardBlock.includes("rounded-none"), "Event poster container must stay rectangular without rounded corners");
    assert.ok(cardBlock.includes("object-contain"), "Event poster image must fit cleanly without cropping banner edges");
    assert.ok(cardBlock.includes("bg-[#D5FF38]"), "Must style Hackathon badge and Details CTA in brand acid lime");
    assert.ok(cardBlock.includes("ev.event_name"), "Must bind title dynamically from EventItem");
    assert.ok(cardBlock.includes("ev.conducted_by_college"), "Must bind organizer dynamically from EventItem");
    assert.ok(cardBlock.includes("summaryText"), "Must bind summary description dynamically from EventItem");
    assert.ok(cardBlock.includes("prizeInfo"), "Must bind prize pool dynamically from EventItem");

    // Strictly zero hardcoded event copy
    assert.ok(!src.includes("Imagine Cup"), "Must not hardcode specific hackathon titles");
    assert.ok(!src.includes("$250,000"), "Must not hardcode specific prize pools");
    assert.ok(!src.includes("global student innovation challenge"), "Must not hardcode event descriptions");
    assert.ok(!src.includes("Designathon"), "Must not hardcode reference event titles");
    assert.ok(!src.includes("Greater Noida"), "Must not hardcode reference event locations");

    // Mobile Discover Events hero must use dark charcoal surface (zero bright ivory/purple)
    const heroStart = src.indexOf("Top Hero (Mobile View Only");
    assert.ok(heroStart !== -1 && heroStart < cardStart, "Must locate mobile hero block");
    const heroBlock = src.slice(heroStart, cardStart);
    assert.ok(heroBlock.includes("#14171D"), "Mobile hero must use dark charcoal base");
    assert.ok(!heroBlock.includes("#FAF9F6"), "Mobile hero must not use bright ivory background");
    assert.ok(!heroBlock.includes("#EDE9FE"), "Mobile hero filter button must not use purple tint");
    assert.ok(!heroBlock.includes("bg-purple-"), "Events filter bar must not use purple styling");

    // Full-screen event detail view (Desktop Img 2 + Mobile Img 3 structure, zero purple)
    const detailBlock = src.slice(cardEnd);
    assert.ok(!detailBlock.includes("bg-purple-"), "Event detail view must not use purple backgrounds");
    assert.ok(!detailBlock.includes("text-purple-"), "Event detail view must not use purple text");
    assert.ok(detailBlock.includes("getUtcCalendarBadge"), "Must render stacked calendar month/day badge");
    assert.ok(detailBlock.includes("aria-label=\"Back to events\""), "Must provide accessible back button for desktop and mobile");
    assert.ok(detailBlock.includes("aria-label=\"Open event website\""), "Must include external website link button");
    assert.ok(detailBlock.includes("aria-label=\"Share event\""), "Must include share button");

    // Verify stable event query caching to prevent frequent re-loading flickers
    const hookSrc = fs.readFileSync(
      path.resolve(__dirname, "..", "hooks", "useStudentEvents.ts"),
      "utf8"
    );
    assert.ok(hookSrc.includes("refetchOnWindowFocus: false"), "Must disable refetchOnWindowFocus");
    assert.ok(hookSrc.includes("refetchOnMount: false"), "Must disable refetchOnMount");
    assert.ok(hookSrc.includes("placeholderData"), "Must preserve previous event data during transitions");
    assert.ok(src.includes("EVENTS_CACHE_KEY"), "EventsWidget must hydrate warm cached events immediately");
  });
});
