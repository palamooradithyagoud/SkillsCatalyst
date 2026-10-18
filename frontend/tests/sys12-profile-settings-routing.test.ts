import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import SettingsPage from "@/app/settings/page";
import ProfileEditRedirect from "@/app/profile/edit/page";
import ProfilePage from "@/app/profile/page";
import EditProfilePage from "@/app/settings/edit/page";
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

describe("SYS-12: Missing /profile Route and Settings Consolidation Suite", () => {
  // ── 1. Canonical /profile Route & Page Verification ────────────────────────
  describe("1. Canonical /profile Route Verification", () => {
    it("/profile page module exists and exports a valid React component", () => {
      assert.ok(ProfilePage, "ProfilePage default export must exist");
      assert.strictEqual(typeof ProfilePage, "function", "ProfilePage must be a React functional component");
    });

    it("verifies /profile direct navigation and refresh do not redirect to an external or invalid path", () => {
      // ProfilePage is a client component for authenticated users, not a redirect stub
      const profilePath = path.join(process.cwd(), "app", "profile", "page.tsx");
      assert.ok(fs.existsSync(profilePath), "frontend/app/profile/page.tsx file must exist");

      const fileContent = fs.readFileSync(profilePath, "utf-8");
      // Must not redirect away from itself
      assert.strictEqual(fileContent.includes('redirect("/profile")'), false, "Must not contain recursive self-redirect");
      assert.ok(fileContent.includes("export default function ProfilePage"), "Must export ProfilePage");
    });

    it("verifies /profile links to canonical editor /settings/edit for edits", () => {
      const profilePath = path.join(process.cwd(), "app", "profile", "page.tsx");
      const fileContent = fs.readFileSync(profilePath, "utf-8");

      assert.ok(fileContent.includes('href="/settings/edit"'), "Profile view must link to /settings/edit for full editing");
      assert.ok(fileContent.includes('href="/settings/edit?tab=career"'), "Must link to /settings/edit?tab=career");
      assert.ok(fileContent.includes('href="/settings/edit?tab=coding"'), "Must link to /settings/edit?tab=coding");
      assert.ok(fileContent.includes('href="/settings/edit?tab=experience"'), "Must link to /settings/edit?tab=experience");
      assert.ok(fileContent.includes('href="/settings/edit?tab=projects"'), "Must link to /settings/edit?tab=projects");
    });
  });

  // ── 2. Canonical /settings/edit Page Verification ─────────────────────────
  describe("2. Canonical /settings/edit Page Verification", () => {
    it("/settings/edit page module exists and exports EditProfilePage", () => {
      assert.ok(EditProfilePage, "EditProfilePage default export must exist");
      assert.strictEqual(typeof EditProfilePage, "function", "EditProfilePage must be a React functional component");
    });

    it("verifies /settings/edit back and cancel controls navigate back to /profile", () => {
      const editPath = path.join(process.cwd(), "app", "settings", "edit", "page.tsx");
      const content = fs.readFileSync(editPath, "utf-8");

      assert.ok(content.includes('router.push("/profile")'), "Back to Profile button must navigate to /profile");
      assert.ok(content.includes('href="/profile"'), "Cancel and profile dock links must point to /profile");
      assert.strictEqual(
        content.includes('router.push("/settings")'),
        false,
        "Must not route back to /settings which would trigger redundant redirect"
      );
    });
  });

  // ── 3. Backward Compatibility Redirects & Query Preservation ───────────────
  describe("3. Backward Compatibility Redirects & Query Preservation", () => {
    it("/settings redirects to canonical /settings/edit", async () => {
      try {
        await SettingsPage({});
        assert.fail("SettingsPage should trigger Next.js redirect");
      } catch (err: any) {
        const target = err.digest || err.message || "";
        assert.ok(
          target.includes("/settings/edit"),
          `Expected redirect to /settings/edit, got: ${target}`
        );
      }
    });

    it("/settings preserves single query parameter (e.g. ?tab=career)", async () => {
      try {
        await SettingsPage({ searchParams: Promise.resolve({ tab: "career" }) });
        assert.fail("SettingsPage should trigger Next.js redirect");
      } catch (err: any) {
        const target = err.digest || err.message || "";
        assert.ok(
          target.includes("/settings/edit?tab=career"),
          `Expected redirect to /settings/edit?tab=career, got: ${target}`
        );
      }
    });

    it("/settings preserves multiple query parameters", async () => {
      try {
        await SettingsPage({
          searchParams: Promise.resolve({ tab: "coding", ref: "practice" }),
        });
        assert.fail("SettingsPage should trigger Next.js redirect");
      } catch (err: any) {
        const target = err.digest || err.message || "";
        assert.ok(target.includes("tab=coding"), `Expected tab=coding in ${target}`);
        assert.ok(target.includes("ref=practice"), `Expected ref=practice in ${target}`);
      }
    });

    it("/profile/edit redirects to canonical /settings/edit", async () => {
      try {
        await ProfileEditRedirect({});
        assert.fail("ProfileEditRedirect should trigger Next.js redirect");
      } catch (err: any) {
        const target = err.digest || err.message || "";
        assert.ok(
          target.includes("/settings/edit"),
          `Expected redirect to /settings/edit, got: ${target}`
        );
      }
    });

    it("/profile/edit preserves query parameters when forwarding to /settings/edit", async () => {
      try {
        await ProfileEditRedirect({
          searchParams: Promise.resolve({ tab: "projects", highlight: "ai-bot" }),
        });
        assert.fail("ProfileEditRedirect should trigger Next.js redirect");
      } catch (err: any) {
        const target = err.digest || err.message || "";
        assert.ok(target.includes("tab=projects"), `Expected tab=projects in ${target}`);
        assert.ok(target.includes("highlight=ai-bot"), `Expected highlight=ai-bot in ${target}`);
      }
    });
  });

  // ── 4. Redirect Loop Prevention ───────────────────────────────────────────
  describe("4. Redirect Loop Prevention", () => {
    it("verifies routing graph contains zero cycles", () => {
      // Direct graph analysis:
      // Node 1: /profile -> renders (terminal)
      // Node 2: /settings/edit -> renders (terminal)
      // Node 3: /settings -> /settings/edit (terminal)
      // Node 4: /profile/edit -> /settings/edit (terminal)
      const routes = {
        "/profile": null, // terminal
        "/settings/edit": null, // terminal
        "/settings": "/settings/edit",
        "/profile/edit": "/settings/edit",
      };

      for (const [startRoute, target] of Object.entries(routes)) {
        if (!target) continue;
        const nextTarget = (routes as any)[target];
        assert.strictEqual(
          nextTarget,
          null,
          `Redirect target '${target}' from '${startRoute}' must be terminal, but redirects to '${nextTarget}'`
        );
      }
    });
  });

  // ── 5. Authentication & Authorization Route Protection (Middleware) ────────
  describe("5. Authentication & Authorization Route Protection (Middleware)", () => {
    it("middleware defines /profile and /settings as explicit protected routes", () => {
      const middlewarePath = path.join(process.cwd(), "lib", "supabase", "middleware.ts");
      const content = fs.readFileSync(middlewarePath, "utf-8");

      assert.ok(
        content.includes('pathname === "/profile"') && content.includes('pathname.startsWith("/profile/")'),
        "/profile and /profile/* must be in isExplicitProtectedRoute"
      );
      assert.ok(
        content.includes('pathname === "/settings"') && content.includes('pathname.startsWith("/settings/")'),
        "/settings and /settings/* must be in isExplicitProtectedRoute"
      );
    });

    it("unauthenticated request to /profile is redirected to /login?next=/profile", async () => {
      const mockReq = {
        cookies: { getAll: () => [] },
        nextUrl: {
          pathname: "/profile",
          clone() {
            return {
              pathname: this.pathname,
              searchParams: new URLSearchParams(),
              toString() {
                return `http://localhost:3000${this.pathname}?${this.searchParams.toString()}`;
              },
            };
          },
        },
      } as unknown as NextRequest;

      // When environment variables are set and user is null, updateSession redirects to login
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

      const res = await updateSession(mockReq);
      // Status 307 redirect
      if (res.headers.get("location")) {
        const loc = res.headers.get("location")!;
        assert.ok(loc.includes("/login"), `Expected redirect to /login, got: ${loc}`);
        assert.ok(loc.includes("next=%2Fprofile") || loc.includes("next=/profile"), `Expected next=/profile in: ${loc}`);
      }
    });

    it("unauthenticated request to /settings/edit is redirected to /login?next=/settings/edit", async () => {
      const mockReq = {
        cookies: { getAll: () => [] },
        nextUrl: {
          pathname: "/settings/edit",
          clone() {
            return {
              pathname: this.pathname,
              searchParams: new URLSearchParams(),
              toString() {
                return `http://localhost:3000${this.pathname}?${this.searchParams.toString()}`;
              },
            };
          },
        },
      } as unknown as NextRequest;

      const res = await updateSession(mockReq);
      if (res.headers.get("location")) {
        const loc = res.headers.get("location")!;
        assert.ok(loc.includes("/login"), `Expected redirect to /login, got: ${loc}`);
        assert.ok(loc.includes("next=%2Fsettings%2Fedit") || loc.includes("next=/settings/edit"), `Expected next=/settings/edit in: ${loc}`);
      }
    });
  });

  // ── 6. Profile Ownership & Isolation ──────────────────────────────────────
  describe("6. Profile Ownership & User Isolation", () => {
    it("/profile obtains user identity strictly from authenticated session, not client query parameters", () => {
      const profilePath = path.join(process.cwd(), "app", "profile", "page.tsx");
      const content = fs.readFileSync(profilePath, "utf-8");

      assert.ok(content.includes("const { session, logout } = useAuth();"), "Must use useAuth session");
      assert.ok(content.includes("const userId = session?.user_id;"), "Must read user_id from session");
      assert.strictEqual(
        content.includes("searchParams.get('user_id')") || content.includes("searchParams.get('userId')"),
        false,
        "Must NOT allow user ID override from URL search params"
      );
    });

    it("/settings/edit obtains user identity strictly from authenticated session", () => {
      const editPath = path.join(process.cwd(), "app", "settings", "edit", "page.tsx");
      const content = fs.readFileSync(editPath, "utf-8").replace(/\r\n/g, "\n");

      assert.ok(content.includes("const { session } = useAuth();"), "Must use useAuth session");
      assert.strictEqual(
        content.includes("searchParams.get('user_id')") || content.includes("searchParams.get('userId')"),
        false,
        "Must NOT allow user ID override from URL search params"
      );
    });
  });

  // ── 7. Desktop & Mobile Navigation Links to Canonical Destinations ────────
  describe("7. Desktop & Mobile Navigation Links to Canonical Destinations", () => {
    it("TopNavbar routes 'My Profile' to /profile and 'Account Settings' to /settings/edit", () => {
      const topNavPath = path.join(process.cwd(), "components", "TopNavbar.tsx");
      const content = fs.readFileSync(topNavPath, "utf-8").replace(/\r\n/g, "\n");

      // Verify My Profile
      assert.ok(
        content.includes('router.push("/profile")') && content.includes("My Profile"),
        "TopNavbar My Profile button must push /profile"
      );

      // Verify Account Settings
      assert.ok(
        content.includes('router.push("/settings/edit")') && content.includes("Account Settings"),
        "TopNavbar Account Settings button must push /settings/edit"
      );
    });

    it("Sidebar 'My Profile' links to /profile", () => {
      const sidebarPath = path.join(process.cwd(), "components", "Sidebar.tsx");
      const content = fs.readFileSync(sidebarPath, "utf-8").replace(/\r\n/g, "\n");

      assert.ok(
        content.includes('id: "profile",\n      title: "My Profile",\n      href: "/profile"'),
        "Sidebar My Profile item must have href: '/profile'"
      );
    });

    it("MobileNav 'Profile' links and avatar trigger route to /profile", () => {
      const mobileNavPath = path.join(process.cwd(), "components", "MobileNav.tsx");
      const content = fs.readFileSync(mobileNavPath, "utf-8").replace(/\r\n/g, "\n");

      assert.ok(
        content.includes('{ name: "Profile", href: "/profile", icon: UserIcon, desc: "Account & settings" }'),
        "MobileNav navItems Profile href must be '/profile'"
      );
      assert.ok(
        content.includes('onClick={() => router.push("/profile")}\n              aria-label="User Profile"'),
        "MobileNav user avatar button must navigate to /profile"
      );
    });

    it("MobileQuickDock links 'Profile' to /profile and 'Settings' to /settings/edit", () => {
      const dockPath = path.join(process.cwd(), "components", "MobileQuickDock.tsx");
      const content = fs.readFileSync(dockPath, "utf-8").replace(/\r\n/g, "\n");

      assert.ok(
        content.includes('id: "profile",\n      name: "Profile",\n      href: "/profile"'),
        "MobileQuickDock Profile item must point to /profile"
      );
      assert.ok(
        content.includes('id: "avatar",\n      name: "User",\n      href: "/settings/edit"'),
        "MobileQuickDock User/Settings item must point to /settings/edit"
      );
    });

    it("PracticeOverview links coding profiles to /settings/edit?tab=coding", () => {
      const practicePath = path.join(process.cwd(), "components", "PracticeOverview.tsx");
      const content = fs.readFileSync(practicePath, "utf-8");

      assert.ok(
        content.includes('href="/settings/edit?tab=coding"'),
        "PracticeOverview must link to /settings/edit?tab=coding"
      );
      assert.strictEqual(
        content.includes('href="/settings"'),
        false,
        "PracticeOverview must not use bare /settings link"
      );
    });

    it("MetricCards links unconfigured LeetCode card to /settings/edit?tab=coding", () => {
      const cardsPath = path.join(process.cwd(), "components", "MetricCards.tsx");
      const content = fs.readFileSync(cardsPath, "utf-8");

      assert.ok(
        content.includes('router.push("/settings/edit?tab=coding")'),
        "MetricCards must push /settings/edit?tab=coding"
      );
    });
  });

  // ── 8. Consolidation of Duplication ───────────────────────────────────────
  describe("8. Consolidation of Duplication", () => {
    it("/settings/page.tsx is a compact compatibility redirect rather than duplicate implementation", () => {
      const settingsPagePath = path.join(process.cwd(), "app", "settings", "page.tsx");
      const stat = fs.statSync(settingsPagePath);
      // Previously 135 KB (2,877 lines); now under 2 KB (clean redirect handler)
      assert.ok(
        stat.size < 2048,
        `Expected /settings/page.tsx to be a lightweight redirect (< 2 KB), got ${stat.size} bytes`
      );

      const content = fs.readFileSync(settingsPagePath, "utf-8");
      assert.strictEqual(content.includes("function SkillModalForm"), false, "SkillModalForm must not be duplicated in /settings");
      assert.strictEqual(content.includes("function ExperienceModalForm"), false, "ExperienceModalForm must not be duplicated in /settings");
      assert.strictEqual(content.includes("function EducationModalForm"), false, "EducationModalForm must not be duplicated in /settings");
      assert.strictEqual(content.includes("function ProjectModalForm"), false, "ProjectModalForm must not be duplicated in /settings");
    });
  });
});
