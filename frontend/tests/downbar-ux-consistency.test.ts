import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  DOWNBAR_NAV_CLASS,
  DOWNBAR_CIRCLE_SIZE_CLASS,
  DOWNBAR_PILL_BASE_CLASS,
  DOWNBAR_TAB_CLASS,
  DOWNBAR_ICON_SIZE_CLASS,
  DOWNBAR_LABEL_CLASS,
} from "@/components/mobile/downbarStyles";

describe("Unified Mobile & Tablet Downbar UX Sizing Suite", () => {
  it("defines compact UX-compliant dimensions for mobile (48px / 48dp) and tablet (54px)", () => {
    assert.ok(DOWNBAR_NAV_CLASS.includes("bottom-3.5 sm:bottom-5"), "Bottom clearance must match compact mobile/tablet UX rhythm");
    assert.ok(DOWNBAR_CIRCLE_SIZE_CLASS.includes("w-12 h-12 sm:w-[54px] sm:h-[54px]"), "Side circle button must be 48px mobile / 54px tablet");
    assert.ok(DOWNBAR_PILL_BASE_CLASS.includes("h-12 sm:h-[54px]"), "Main pill height must match 48px mobile / 54px tablet");
    assert.ok(DOWNBAR_ICON_SIZE_CLASS.includes("w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]"), "Tab icons must stay compact 17px mobile / 19px tablet");
    assert.ok(DOWNBAR_LABEL_CLASS.includes("text-[8.5px] sm:text-[10px]"), "Tab labels must fit cleanly without clipping across all tabs");
    assert.ok(DOWNBAR_TAB_CLASS.includes("h-full"), "Tabs must fill full pill vertical touch target");
  });

  it("enforces identical shared downbar sizing tokens across Dashboard, Career/Learning, Explore, and Profile", () => {
    const components = [
      path.join(process.cwd(), "components", "dashboard", "DashboardMobileDock.tsx"),
      path.join(process.cwd(), "components", "career", "CareerDownbar.tsx"),
      path.join(process.cwd(), "components", "explore", "ExploreDownbar.tsx"),
      path.join(process.cwd(), "components", "profile", "ProfileDownbar.tsx"),
    ];

    for (const filePath of components) {
      assert.ok(fs.existsSync(filePath), `${filePath} must exist`);
      const src = fs.readFileSync(filePath, "utf-8");
      const name = path.basename(filePath);

      assert.ok(src.includes("DOWNBAR_NAV_CLASS"), `${name} must use DOWNBAR_NAV_CLASS`);
      assert.ok(src.includes("DOWNBAR_CIRCLE_SIZE_CLASS"), `${name} must use DOWNBAR_CIRCLE_SIZE_CLASS`);
      assert.ok(src.includes("DOWNBAR_PILL_BASE_CLASS"), `${name} must use DOWNBAR_PILL_BASE_CLASS`);
      assert.ok(src.includes("DOWNBAR_TAB_CLASS"), `${name} must use DOWNBAR_TAB_CLASS`);
      assert.ok(src.includes("DOWNBAR_ICON_SIZE_CLASS"), `${name} must use DOWNBAR_ICON_SIZE_CLASS`);
      assert.ok(src.includes("DOWNBAR_LABEL_CLASS"), `${name} must use DOWNBAR_LABEL_CLASS`);
      assert.ok(src.includes("md:hidden"), `${name} must hide at md: breakpoint when Sidebar takes over`);
    }
  });
});
