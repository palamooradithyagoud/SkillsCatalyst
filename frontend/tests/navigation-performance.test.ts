import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

describe("Navigation Performance & Auth Middleware Optimizations Suite", () => {
  it("short-circuits public routes and cookieless requests before invoking Supabase Auth", async () => {
    const mwPath = path.resolve(__dirname, "../lib/supabase/middleware.ts");
    const mwSrc = fs.readFileSync(mwPath, "utf8");

    assert.ok(mwSrc.includes("hasAuthCookie"), "Middleware must check for sb- cookie before Supabase client setup");
    assert.ok(mwSrc.includes("supabase.auth.getClaims()"), "Middleware must verify non-admin JWT claims locally via getClaims()");
    assert.ok(mwSrc.includes("supabase.auth.getUser()"), "Admin routes must still enforce live server-side getUser() verification");

    const buildReq = (pathname: string) =>
      ({
        cookies: { getAll: () => [] },
        nextUrl: {
          pathname,
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
      }) as unknown as NextRequest;

    // Public route returns immediately with zero redirect
    const pubRes = await updateSession(buildReq("/pricing"));
    assert.equal(pubRes.headers.get("location"), null);

    // Protected route without sb- cookie redirects immediately to /login
    const privRes = await updateSession(buildReq("/explore"));
    assert.ok(privRes.headers.get("location")?.includes("/login"));

    // Admin route without sb- cookie redirects immediately to /login
    const adminRes = await updateSession(buildReq("/admin"));
    assert.ok(adminRes.headers.get("location")?.includes("/login"));
  });

  it("avoids Explore tab server round-trips and sidebar prefetch stampedes", () => {
    const exploreSrc = fs.readFileSync(
      path.resolve(__dirname, "../app/explore/page.tsx"),
      "utf8"
    );
    assert.ok(
      exploreSrc.includes("window.history.replaceState"),
      "Explore tab switching on /explore must use shallow replaceState"
    );

    const sidebarSrc = fs.readFileSync(
      path.resolve(__dirname, "../components/Sidebar.tsx"),
      "utf8"
    );
    assert.ok(
      sidebarSrc.includes("prefetch={false}"),
      "Sidebar must disable mass Link prefetching to avoid queueing browser sockets"
    );
    assert.ok(
      sidebarSrc.includes("router.prefetch(item.href)"),
      "Sidebar should warm routes on hover before click"
    );

    const nextConfigSrc = fs.readFileSync(
      path.resolve(__dirname, "../next.config.ts"),
      "utf8"
    );
    assert.ok(
      nextConfigSrc.includes("optimizePackageImports"),
      "next.config.ts must configure optimizePackageImports"
    );

    const practiceSrc = fs.readFileSync(
      path.resolve(__dirname, "../app/practice/page.tsx"),
      "utf8"
    );
    assert.ok(
      practiceSrc.includes("dynamic(") && practiceSrc.includes("useQuery"),
      "PracticePage must code-split heavy subviews with dynamic() and cache fetches with useQuery"
    );
  });
});
