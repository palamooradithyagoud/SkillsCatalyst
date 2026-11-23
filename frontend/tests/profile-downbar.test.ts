import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ProfileDownbar, { PROFILE_TABS } from "@/components/profile/ProfileDownbar";

describe("Profile Downbar Navigation Verification Suite", () => {
  it("verifies ProfileDownbar component exists and is a valid React functional component", () => {
    assert.ok(ProfileDownbar, "ProfileDownbar default export must exist");
    assert.strictEqual(typeof ProfileDownbar, "function", "ProfileDownbar must be a React component function");
  });

  it("verifies PROFILE_TABS contains ONLY 'My Profile', 'Edit Profile', and 'Settings'", () => {
    assert.strictEqual(PROFILE_TABS.length, 3, "PROFILE_TABS must contain exactly 3 items");

    const tabIds = PROFILE_TABS.map((t) => t.id);
    const tabLabels = PROFILE_TABS.map((t) => t.label);

    assert.deepStrictEqual(tabIds, ["profile", "edit", "settings"]);
    assert.deepStrictEqual(tabLabels, ["My Profile", "Edit Profile", "Settings"]);

    // Exclude Orgs and Referral
    assert.strictEqual(tabIds.includes("orgs" as any), false, "Must not include Orgs tab");
    assert.strictEqual(tabIds.includes("referral" as any), false, "Must not include Referral tab");
  });

  it("verifies ProfileDownbar source code contains circular Back button and #D5FF38 acid lime active highlight", () => {
    const downbarPath = path.join(process.cwd(), "components", "profile", "ProfileDownbar.tsx");
    assert.ok(fs.existsSync(downbarPath), "frontend/components/profile/ProfileDownbar.tsx must exist");

    const content = fs.readFileSync(downbarPath, "utf-8");

    // Check for Back button with CircleArrowLeft and dashboard direct navigation
    assert.ok(content.includes("CircleArrowLeft"), "Must render CircleArrowLeft icon");
    assert.ok(content.includes(">Back<") || content.includes("Back"), "Must render Back text label");
    assert.ok(content.includes('router.push("/dashboard")'), "Back button must direct into /dashboard directly");

    // Check for #D5FF38 acid lime active color (zero magenta)
    assert.ok(content.includes("#D5FF38"), "Must use acid lime #D5FF38 active highlight");
    assert.strictEqual(content.includes("#FF007A"), false, "Must remove magenta #FF007A");

    // Check for mobile constraint
    assert.ok(content.includes("md:hidden"), "Must be hidden on desktop (md:hidden)");
  });

  it("verifies MobileNav renders ProfileDownbar on /profile and /settings/edit, hiding generic NavBar", () => {
    const mobileNavPath = path.join(process.cwd(), "components", "MobileNav.tsx");
    const content = fs.readFileSync(mobileNavPath, "utf-8");

    assert.ok(content.includes('import ProfileDownbar from "@/components/profile/ProfileDownbar";'), "MobileNav must import ProfileDownbar");
    assert.ok(content.includes("<ProfileDownbar"), "MobileNav must render <ProfileDownbar />");
    assert.ok(content.includes("isProfileGroup"), "MobileNav must check isProfileGroup");
    assert.ok(content.includes("isHideBottomBar") && content.includes("isProfileGroup"), "MobileNav must hide generic NavBar on profile routes via isHideBottomBar");
  });
});
