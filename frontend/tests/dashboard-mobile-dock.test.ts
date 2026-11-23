import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import DashboardMobileDock from "@/components/dashboard/DashboardMobileDock";

describe("Dashboard Mobile Dock (Capsule + FAB) Suite", () => {
  it("verifies DashboardMobileDock exists and is a valid React component", () => {
    assert.ok(DashboardMobileDock, "DashboardMobileDock must be exported");
    assert.strictEqual(typeof DashboardMobileDock, "function", "DashboardMobileDock must be a component function");
  });

  it("verifies DashboardMobileDock source implements capsule pill with Career & Explore, and acid lime FAB", () => {
    const dockPath = path.join(process.cwd(), "components", "dashboard", "DashboardMobileDock.tsx");
    assert.ok(fs.existsSync(dockPath), "DashboardMobileDock.tsx must exist on disk");
    const content = fs.readFileSync(dockPath, "utf-8");

    // Must define core navigation items for SkillsCatalyst: Home, SkillBits, Career, Explore
    assert.ok(content.includes("/dashboard"), "Must link to /dashboard (Home)");
    assert.ok(content.includes("/skillbits"), "Must link to /skillbits (SkillBits)");
    assert.ok(content.includes("/career"), "Must link to /career (Career)");
    assert.ok(content.includes("/explore"), "Must link to /explore (Explore)");

    // Must render vertical icon + label layout with acid lime active highlight (#D5FF38), zero pink
    assert.ok(content.includes("#D5FF38"), "Must highlight active item in acid lime #D5FF38");
    assert.ok(!content.includes("#ee11bd"), "Must remove pink color #ee11bd completely");
    assert.ok(content.includes("backdrop-blur-2xl"), "Must use glassmorphism blur backdrop-blur-2xl");
    assert.ok(content.includes("bg-black/"), "Must use transparent blur glass background");
    assert.ok(content.includes("flex-col"), "Must stack icon on top and label underneath");
    assert.ok(content.includes("{item.name}"), "Must render labels underneath each item");

    // Must define quick actions sheet
    assert.ok(content.includes("/ai-mentor"), "Must support AI Mentor quick action");
    assert.ok(content.includes("/tasks"), "Must support To-Do Checklist quick action");
    assert.ok(content.includes("/practice"), "Must support Daily Practice quick action");
    assert.ok(content.includes("/learning"), "Must support Learning Tracks quick action");

    // Quick action clean styling: no flower icon, no colored glass square tiles
    assert.ok(!content.includes("Sparkles"), "Must remove flower/sparkles icon from Quick Actions header");
    assert.ok(!content.includes("text-purple-400"), "Must remove colored glass tiles below the icons");
    assert.ok(!content.includes("bg-purple-500/10"), "Must remove colored background below the icons");

    // Acid lime FAB without glow effect
    assert.ok(content.includes("#D5FF38"), "Must use acid lime color #D5FF38 for FAB button");
    assert.ok(content.includes("text-black"), "Must use black icon on acid lime button");
    assert.ok(!content.includes("rgba(255,66,66"), "Must not use coral red glow");
    assert.ok(content.includes("md:hidden"), "Must be hidden on desktop views");
  });

  it("verifies MobileNav renders modern DashboardMobileDock and has completely removed old NavBar", () => {
    const mobileNavPath = path.join(process.cwd(), "components", "MobileNav.tsx");
    assert.ok(fs.existsSync(mobileNavPath), "MobileNav.tsx must exist on disk");
    const content = fs.readFileSync(mobileNavPath, "utf-8");

    assert.ok(content.includes("DashboardMobileDock"), "MobileNav must import DashboardMobileDock");
    assert.ok(!content.includes("<NavBar"), "MobileNav must completely remove old NavBar");
    assert.ok(!content.includes("tubelight-navbar"), "MobileNav must not import old tubelight-navbar");
    assert.ok(content.includes("<DashboardMobileDock"), "MobileNav must render modern DashboardMobileDock");
  });
});
