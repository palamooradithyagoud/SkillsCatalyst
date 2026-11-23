import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import Home3DIcon from "@/components/icons/Home3DIcon";

describe("Home 3D Icon Transition & Mobile View Verification Suite", () => {
  it("verifies Home3DIcon exists and is a valid React functional component", () => {
    assert.ok(Home3DIcon, "Home3DIcon default export must exist");
    assert.strictEqual(typeof Home3DIcon, "function", "Home3DIcon must be a React component function");
  });

  it("verifies HomeMotionIcon source code implements 2D motion transition with Acid Lime and zero glow", () => {
    const iconPath = path.join(process.cwd(), "components", "icons", "Home3DIcon.tsx");
    assert.ok(fs.existsSync(iconPath), "frontend/components/icons/Home3DIcon.tsx must exist on disk");

    const content = fs.readFileSync(iconPath, "utf-8");

    // Must define 2D house outline and doorway (Image 1)
    assert.ok(content.includes("M 4.5 19.5 L 4.5 9.8 L 12 3.5"), "Must define 2D house outline matching Image 1");
    assert.ok(content.includes("M 9.5 19.5 L 9.5 13.5"), "Must define arched doorway matching Image 1");

    // Must implement spring motion animation (scale, rotate tilt, hop)
    assert.ok(content.includes("rotate: [0, -9, 4, -2, 0]"), "Must implement playful spring tilt motion");
    assert.ok(content.includes("scale: [1, 0.88, 1.15"), "Must implement squish and spring scale motion");

    // Must use acid lime #D5FF38 when active
    assert.ok(content.includes("#D5FF38"), "Must use acid lime #D5FF38 color");

    // Must have zero glow
    assert.ok(content.includes('filter: "none"'), "Must strictly disable glow filters (zero glow)");
    assert.strictEqual(content.includes("drop-shadow"), false, "Must not contain drop-shadow glow");
  });

  it("verifies DashboardMobileDock uses Home3DIcon without glow or solid fill", () => {
    const dockPath = path.join(process.cwd(), "components", "dashboard", "DashboardMobileDock.tsx");
    const content = fs.readFileSync(dockPath, "utf-8");

    assert.ok(content.includes("Home3DIcon"), "DashboardMobileDock must import Home3DIcon");
    assert.ok(content.includes('{ id: "home", name: "Home", url: "/dashboard", icon: Home3DIcon }'), "Home item must use Home3DIcon");
    assert.ok(content.includes("active={active}"), "Must pass active status to icon");
  });

  it("verifies MobileNav and NavBar use Home3DIcon with zero glow", () => {
    const mobileNavPath = path.join(process.cwd(), "components", "MobileNav.tsx");
    const navContent = fs.readFileSync(mobileNavPath, "utf-8");

    assert.ok(navContent.includes("Home3DIcon"), "MobileNav must import Home3DIcon");
    assert.ok(navContent.includes('{ name: "Home", url: "/dashboard", icon: Home3DIcon }'), "mobileNavItems must wire Home3DIcon");

    const navBarPath = path.join(process.cwd(), "components", "ui", "tubelight-navbar.tsx");
    const barContent = fs.readFileSync(navBarPath, "utf-8");
    assert.strictEqual(barContent.includes("drop-shadow"), false, "NavBar must remove drop-shadow glow");
  });
});
