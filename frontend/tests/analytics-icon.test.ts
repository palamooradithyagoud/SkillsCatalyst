import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import AnalyticsIcon from "@/components/icons/AnalyticsIcon";

describe("Analytics Pie Chart Icon & Acid Lime Transition Suite", () => {
  it("exports a valid React component for AnalyticsIcon", () => {
    assert.ok(AnalyticsIcon, "AnalyticsIcon must be exported");
  });

  it("implements pie-chart sectors with Acid Lime #D5FF38 fill on active/click, small pop transition, and zero glow", () => {
    const iconPath = path.join(process.cwd(), "components", "icons", "AnalyticsIcon.tsx");
    assert.ok(fs.existsSync(iconPath), "AnalyticsIcon.tsx must exist");
    const src = fs.readFileSync(iconPath, "utf-8");

    assert.ok(src.includes("#D5FF38"), "Must fill active/clicked state with Acid Lime #D5FF38");
    assert.ok(src.includes("fill: fillColor"), "Must animate/fill SVG sectors with fillColor");
    assert.ok(src.includes('filter: "none"'), "Must enforce strict zero glow");
    assert.ok(!src.includes("drop-shadow"), "Must not use drop-shadow glow");
    assert.ok(src.includes("whileTap"), "Must play tap feedback on click");
    assert.ok(src.includes("clickCount"), "Must trigger transition effect on click");
  });

  it("wires AnalyticsIcon into CareerDownbar, Sidebar, MobileNav, MobileQuickDock, and KineticNav", () => {
    const targets = [
      "components/career/CareerDownbar.tsx",
      "components/Sidebar.tsx",
      "components/MobileNav.tsx",
      "components/MobileQuickDock.tsx",
      "components/ui/sterling-gate-kinetic-navigation.tsx",
    ];
    for (const rel of targets) {
      const fullPath = path.join(process.cwd(), rel);
      const src = fs.readFileSync(fullPath, "utf-8");
      assert.ok(src.includes("AnalyticsIcon"), `${rel} must use AnalyticsIcon`);
    }
  });
});
