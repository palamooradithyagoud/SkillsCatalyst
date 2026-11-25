import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ExploreIcon from "@/components/icons/ExploreIcon";

describe("Explore Magnifying-Glass + Star Icon Suite", () => {
  it("exports a valid React component for ExploreIcon", () => {
    assert.ok(ExploreIcon, "ExploreIcon must be exported");
  });

  it("renders open crescent magnifying glass with 4-point star outline, Acid Lime #D5FF38 active state, and zero glow", () => {
    const iconPath = path.join(process.cwd(), "components", "icons", "ExploreIcon.tsx");
    assert.ok(fs.existsSync(iconPath), "ExploreIcon.tsx must exist");
    const src = fs.readFileSync(iconPath, "utf-8");

    assert.ok(src.includes('fill="none"'), "ExploreIcon must use clean outline strokes");
    assert.ok(src.includes("M 6.5 6.5"), "ExploreIcon must render nestled 4-point star");
    assert.ok(src.includes("M 9.4 4.1 A 7.25 7.25"), "ExploreIcon must render open magnifying-glass arc");
    assert.ok(src.includes("M 17.9 15.6 L 21.2 19.0"), "ExploreIcon must render handle");
    assert.ok(src.includes("#D5FF38"), "ExploreIcon must highlight active state in #D5FF38");
    assert.ok(src.includes('filter: "none"'), "ExploreIcon must enforce strict zero glow");
  });

  it("wires ExploreIcon into DashboardMobileDock, MobileNav, KineticNav, and ExploreButton", () => {
    const targets = [
      "components/dashboard/DashboardMobileDock.tsx",
      "components/MobileNav.tsx",
      "components/ui/sterling-gate-kinetic-navigation.tsx",
      "components/ExploreButton.tsx",
    ];
    for (const rel of targets) {
      const fullPath = path.join(process.cwd(), rel);
      const src = fs.readFileSync(fullPath, "utf-8");
      assert.ok(src.includes("ExploreIcon"), `${rel} must use ExploreIcon`);
    }
  });
});
