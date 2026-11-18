import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import GlowingButterfly from "@/components/auth/GlowingButterfly";

describe("Glowing Butterfly Suite", () => {
  it("GlowingButterfly component exists and exports a valid React component", () => {
    assert.ok(GlowingButterfly, "GlowingButterfly export must exist");
    assert.strictEqual(typeof GlowingButterfly, "function", "GlowingButterfly must be a component function");
  });

  it("verifies GlowingButterfly source code contains 3D flapping, blue styling, and glow filters", () => {
    const butterflyPath = path.join(process.cwd(), "components", "auth", "GlowingButterfly.tsx");
    assert.ok(fs.existsSync(butterflyPath), "GlowingButterfly.tsx must exist on disk");
    const content = fs.readFileSync(butterflyPath, "utf-8");

    // Blue color specification (#0000FF)
    assert.ok(content.includes("#0000FF"), "Must use #0000FF pure blue color");
    assert.ok(content.includes("blueWingGradLeft"), "Must define left wing blue gradient");
    assert.ok(content.includes("blueWingGradRight"), "Must define right wing blue gradient");

    // Luminous glow effects
    assert.ok(content.includes("drop-shadow"), "Must apply drop-shadow glow filters");
    assert.ok(content.includes("radial-gradient"), "Must apply glowing halo aura");

    // 3D wing flapping animation
    assert.ok(content.includes("butterflyFlapLeft"), "Must have 3D left wing flap keyframe");
    assert.ok(content.includes("butterflyFlapRight"), "Must have 3D right wing flap keyframe");
    assert.ok(content.includes("rotateY"), "Must flap along 3D Y-axis");

    // Small and non-blocking
    assert.ok(content.includes("pointer-events-none"), "Must be non-blocking for user clicks");
    assert.ok(content.includes("w-12 h-12") || content.includes("w-10 h-10") || content.includes("w-22") || content.includes("scale"), "Must be compact/small in size");

    // Moving here and there (trajectory animation)
    assert.ok(content.includes("x:") && content.includes("y:") && content.includes("rotate:"), "Must have multi-point flight trajectory");
    assert.ok(content.includes("repeat: Infinity"), "Must loop flight path infinitely");
  });

  it("verifies login page has butterfly disabled for now per user request", () => {
    const loginPagePath = path.join(process.cwd(), "app", "login", "page.tsx");
    assert.ok(fs.existsSync(loginPagePath), "frontend/app/login/page.tsx must exist");
    const loginContent = fs.readFileSync(loginPagePath, "utf-8");

    // Must be disabled in active JSX
    assert.strictEqual(loginContent.includes("<GlowingButterfly />"), false, "GlowingButterfly should be disabled for now in login page");
  });
});
