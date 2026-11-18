import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import AnimatedFaceEyes from "@/components/auth/AnimatedFaceEyes";

describe("Animated Face Eyes (Framer Face) Suite", () => {
  it("AnimatedFaceEyes component exists and exports a valid React component", () => {
    assert.ok(AnimatedFaceEyes, "AnimatedFaceEyes export must exist");
    assert.strictEqual(typeof AnimatedFaceEyes, "function", "AnimatedFaceEyes must be a component function");
  });

  it("verifies AnimatedFaceEyes source code implements Framer Face eye tracking and eyelid closures", () => {
    const eyesPath = path.join(process.cwd(), "components", "auth", "AnimatedFaceEyes.tsx");
    assert.ok(fs.existsSync(eyesPath), "AnimatedFaceEyes.tsx must exist on disk");
    const content = fs.readFileSync(eyesPath, "utf-8");

    // Cursor tracking
    assert.ok(content.includes("mousemove"), "Must listen to mousemove events for gaze tracking");
    assert.ok(content.includes("getBoundingClientRect"), "Must calculate pupil offset relative to eye bounding box");
    assert.ok(content.includes("maxTravel"), "Must clamp pupil displacement to maxTravel boundary");

    // Eyelid closing on password focus: clean curved arc without halo/black socket artifacts
    assert.ok(content.includes("isClosed"), "Must support isClosed/isPasswordFocused state");
    assert.ok(content.includes("scaleY(0.1)") || content.includes("opacity: isClosed"), "Must smoothly transition open eye away on close");
    assert.ok(content.includes("strokeLinecap=\"round\""), "Must draw curved closed eyelid arc with rounded caps");
    assert.ok(content.includes("cubic-bezier"), "Must use smooth cubic-bezier easing for blinking/eyelid transitions");

    // Pupil specular highlight
    assert.ok(content.includes("pupilR"), "Must calculate pupil dimensions proportionally");
  });

  it("verifies login page renders AnimatedFaceEyes directly above details with penguin logo removed", () => {
    const loginPagePath = path.join(process.cwd(), "app", "login", "page.tsx");
    assert.ok(fs.existsSync(loginPagePath), "frontend/app/login/page.tsx must exist");
    const loginContent = fs.readFileSync(loginPagePath, "utf-8");

    // Face eyes integration
    assert.ok(loginContent.includes("AnimatedFaceEyes"), "Must import AnimatedFaceEyes in login page");
    assert.ok(loginContent.includes("<AnimatedFaceEyes"), "Must render <AnimatedFaceEyes />");
    assert.ok(loginContent.includes("passwordFocused"), "Must pass passwordFocused state to eyes");

    // Penguin logo removed from login page
    assert.strictEqual(loginContent.includes("<SkillsCatalystLogo"), false, "Penguin logo must be removed from login page");

    // Desktop Back to Home positioning
    assert.ok(
      loginContent.includes("lg:absolute") && loginContent.includes("lg:top-") && loginContent.includes("lg:left-"),
      "Back to Home must be positioned at top left in desktop view (lg:absolute lg:top-... lg:left-...)"
    );
  });
});
