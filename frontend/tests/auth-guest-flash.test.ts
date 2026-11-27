import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function readFrontend(relPath: string): string {
  return fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8").replace(/\r\n/g, "\n");
}

describe("Auth session stability & Guest flash prevention", () => {
  it("MobileNav defers rendering while auth isLoading so Guest User / GU never flashes before session resolves", () => {
    const src = readFrontend("components/MobileNav.tsx");
    assert.ok(
      src.includes("if (pathname === \"/login\" || isLoading)"),
      "MobileNavContent must gate on isLoading like Sidebar.tsx"
    );
    assert.ok(
      src.includes('onClick={() => router.push("/profile")}\n              aria-label="User Profile"'),
      "MobileNav avatar trigger accessibility & /profile navigation preserved"
    );
  });

  it("TopNavbar and KineticNavigation avoid hardcoded identities or Guest User label while isLoading", () => {
    const topNav = readFrontend("components/TopNavbar.tsx");
    assert.ok(topNav.includes("isLoading"), "TopNavbar must consume isLoading from useAuth");
    assert.ok(!topNav.includes("Adithya goud Palamoor"), "TopNavbar must not hardcode a personal display name fallback");
    assert.ok(!topNav.includes("learner@skillscatalyst.in"), "TopNavbar must not hardcode a personal email fallback");

    const kineticNav = readFrontend("components/ui/sterling-gate-kinetic-navigation.tsx");
    assert.ok(kineticNav.includes("isLoading"), "KineticNavigation must consume isLoading from useAuth");
    assert.ok(
      kineticNav.includes('isLoading ? "Loading account..." : "Guest User"'),
      "KineticNavigation must wait for auth loading before displaying Guest User"
    );
  });

  it("AuthProvider warms session from local cookies and preserves session across transient network errors", () => {
    const authSrc = readFrontend("lib/auth.tsx");
    assert.ok(
      authSrc.includes("supabase.auth.getSession()"),
      "initAuth must warm up from local cookie session before remote getUser verification"
    );
    assert.ok(
      authSrc.includes("isExplicitAuthRejection"),
      "initAuth must only clear local session on explicit auth rejection or absent local session"
    );
  });

  it("frontend dev script uses webpack bundler to prevent Turbopack restart reload loops and OOM", () => {
    const pkg = JSON.parse(readFrontend("package.json")) as { scripts?: Record<string, string> };
    assert.strictEqual(pkg.scripts?.dev, "next dev --webpack");
  });
});
