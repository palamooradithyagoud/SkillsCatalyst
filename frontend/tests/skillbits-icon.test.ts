import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import SkillBitsIcon from "@/components/icons/SkillBitsIcon";

describe("SkillBits Rounded Play-Squircle Icon Suite", () => {
  it("exports a valid React component for SkillBitsIcon", () => {
    assert.ok(SkillBitsIcon, "SkillBitsIcon must be exported");
  });

  it("renders rounded squircle + rounded play triangle with Acid Lime #D5FF38 active highlight", () => {
    const iconPath = path.join(process.cwd(), "components", "icons", "SkillBitsIcon.tsx");
    assert.ok(fs.existsSync(iconPath), "SkillBitsIcon.tsx must exist");
    const src = fs.readFileSync(iconPath, "utf-8");

    assert.ok(src.includes('fill="none"'), "SkillBitsIcon must use clean outline strokes");
    assert.ok(src.includes('rx="5.2"'), "SkillBitsIcon must use generous rounded squircle frame");
    assert.ok(src.includes("#D5FF38"), "SkillBitsIcon must highlight active state in #D5FF38");
  });

  it("wires SkillBitsIcon into DashboardMobileDock, Sidebar, MobileNav, MobileQuickDock, and KineticNav", () => {
    const targets = [
      "components/dashboard/DashboardMobileDock.tsx",
      "components/Sidebar.tsx",
      "components/MobileNav.tsx",
      "components/MobileQuickDock.tsx",
      "components/ui/sterling-gate-kinetic-navigation.tsx",
    ];
    for (const rel of targets) {
      const fullPath = path.join(process.cwd(), rel);
      const src = fs.readFileSync(fullPath, "utf-8");
      assert.ok(src.includes("SkillBitsIcon"), `${rel} must use SkillBitsIcon`);
    }
  });
});
