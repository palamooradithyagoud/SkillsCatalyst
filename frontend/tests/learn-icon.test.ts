import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import LearnIcon from "@/components/icons/LearnIcon";

describe("Learn Notebook Spine Icon Suite", () => {
  it("exports a valid React component for LearnIcon", () => {
    assert.ok(LearnIcon, "LearnIcon must be exported");
  });

  it("renders rounded spine notebook SVG paths with Acid Lime #D5FF38 active state", () => {
    const iconPath = path.join(process.cwd(), "components", "icons", "LearnIcon.tsx");
    assert.ok(fs.existsSync(iconPath), "LearnIcon.tsx must exist");
    const src = fs.readFileSync(iconPath, "utf-8");

    assert.ok(src.includes('fill="none"'), "LearnIcon must use crisp outline strokes");
    assert.ok(src.includes("#D5FF38"), "LearnIcon must highlight active state in Acid Lime #D5FF38");
    assert.ok(src.includes("M 9 17.5 L 16 17.5"), "LearnIcon must render the inner page divider line");
  });

  it("wires LearnIcon into CareerDownbar, Sidebar, DashboardMobileDock, MobileNav, MobileQuickDock, and KineticNav", () => {
    const targets = [
      "components/career/CareerDownbar.tsx",
      "components/Sidebar.tsx",
      "components/dashboard/DashboardMobileDock.tsx",
      "components/MobileNav.tsx",
      "components/MobileQuickDock.tsx",
      "components/ui/sterling-gate-kinetic-navigation.tsx",
    ];
    for (const rel of targets) {
      const fullPath = path.join(process.cwd(), rel);
      const src = fs.readFileSync(fullPath, "utf-8");
      assert.ok(src.includes("LearnIcon"), `${rel} must use LearnIcon`);
    }
  });
});
