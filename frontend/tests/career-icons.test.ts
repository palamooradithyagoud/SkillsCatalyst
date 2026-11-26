import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import RoadmapsIcon from "@/components/icons/RoadmapsIcon";
import PracticeIcon from "@/components/icons/PracticeIcon";
import CareerIcon from "@/components/icons/CareerIcon";

describe("Roadmaps, Practice & Career Navigation Icons Suite", () => {
  it("exports valid React components for RoadmapsIcon, PracticeIcon, and CareerIcon", () => {
    assert.ok(RoadmapsIcon, "RoadmapsIcon must be exported");
    assert.ok(PracticeIcon, "PracticeIcon must be exported");
    assert.ok(CareerIcon, "CareerIcon must be exported");
  });

  it("renders crisp outline SVG geometry with #D5FF38 active state and strict zero glow", () => {
    const configs = [
      { file: "RoadmapsIcon.tsx", marker: "M 10.2 4.4 Q 12 3.2 13.8 4.4" },
      { file: "PracticeIcon.tsx", marker: "M 13.1 5.1 A 8.2 8.2" },
      { file: "CareerIcon.tsx", marker: '<rect x="10.2" y="11.4"' },
    ];
    for (const cfg of configs) {
      const iconPath = path.join(process.cwd(), "components", "icons", cfg.file);
      assert.ok(fs.existsSync(iconPath), `${cfg.file} must exist`);
      const src = fs.readFileSync(iconPath, "utf-8");
      assert.ok(src.includes('fill="none"'), `${cfg.file} must use clean outline rendering`);
      assert.ok(src.includes(cfg.marker), `${cfg.file} must contain expected SVG path geometry`);
      assert.ok(src.includes("#D5FF38"), `${cfg.file} must highlight active state in Acid Lime #D5FF38`);
      assert.ok(src.includes('filter: "none"'), `${cfg.file} must enforce strict zero glow`);
    }
  });

  it("wires RoadmapsIcon, PracticeIcon, and CareerIcon across navigation components", () => {
    const careerDownbar = fs.readFileSync(
      path.join(process.cwd(), "components", "career", "CareerDownbar.tsx"),
      "utf-8"
    );
    assert.ok(careerDownbar.includes("RoadmapsIcon"), "CareerDownbar must wire RoadmapsIcon");
    assert.ok(careerDownbar.includes("PracticeIcon"), "CareerDownbar must wire PracticeIcon");
    assert.ok(careerDownbar.includes("CareerIcon"), "CareerDownbar must wire CareerIcon");

    const sidebar = fs.readFileSync(path.join(process.cwd(), "components", "Sidebar.tsx"), "utf-8");
    assert.ok(sidebar.includes("RoadmapsIcon"), "Sidebar must wire RoadmapsIcon");
    assert.ok(sidebar.includes("PracticeIcon"), "Sidebar must wire PracticeIcon");

    const mobileNav = fs.readFileSync(path.join(process.cwd(), "components", "MobileNav.tsx"), "utf-8");
    assert.ok(mobileNav.includes("RoadmapsIcon") && mobileNav.includes("PracticeIcon") && mobileNav.includes("CareerIcon"));

    const kineticNav = fs.readFileSync(
      path.join(process.cwd(), "components", "ui", "sterling-gate-kinetic-navigation.tsx"),
      "utf-8"
    );
    assert.ok(kineticNav.includes("RoadmapsIcon") && kineticNav.includes("PracticeIcon") && kineticNav.includes("CareerIcon"));
  });
});
