import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import StreakCelebrationModal, { buildWeeklyStreakCalendar } from "@/components/auth/StreakCelebrationModal";
import AnimatedFlameMascot from "@/components/auth/AnimatedFlameMascot";

describe("Streak Celebration Modal (Img 1 -> Img 3 Code Mascot) Suite", () => {
  it("StreakCelebrationModal and AnimatedFlameMascot components exist and export valid React components", () => {
    assert.ok(StreakCelebrationModal, "StreakCelebrationModal export must exist");
    assert.strictEqual(typeof StreakCelebrationModal, "function", "StreakCelebrationModal must be a component function");
    assert.ok(AnimatedFlameMascot, "AnimatedFlameMascot export must exist");
    assert.strictEqual(typeof AnimatedFlameMascot, "function", "AnimatedFlameMascot must be a component function");
  });

  it("verifies AnimatedFlameMascot renders the mascot purely in code (100% vector SVG + Framer Motion, zero image tags)", () => {
    const mascotPath = path.join(process.cwd(), "components", "auth", "AnimatedFlameMascot.tsx");
    assert.ok(fs.existsSync(mascotPath), "AnimatedFlameMascot.tsx must exist on disk");
    const content = fs.readFileSync(mascotPath, "utf-8");

    // Pure code verification: 100% SVG, no cut images, animated flame motion
    assert.ok(content.includes("<svg"), "Must render vector SVG");
    assert.ok(content.includes("OUTER_FLAME_PATH"), "Must define exact mathematical Bezier flame path in code");
    assert.ok(content.includes("rotate"), "Must animate organic flame rotation sway");
    assert.ok(content.includes("scaleY"), "Must animate kawaii eye blinks in code");
    assert.ok(!content.includes("<img"), "Must NOT use <img> tag");
    assert.ok(!content.includes("<Image"), "Must NOT use next/image component");
  });

  it("verifies StreakCelebrationModal uses createPortal and integrates AnimatedFlameMascot", () => {
    const modalPath = path.join(process.cwd(), "components", "auth", "StreakCelebrationModal.tsx");
    assert.ok(fs.existsSync(modalPath), "StreakCelebrationModal.tsx must exist on disk");
    const content = fs.readFileSync(modalPath, "utf-8").replace(/\r\n/g, "\n");

    // Img 1: Warm orange background and cute face
    assert.ok(content.includes("#FE851C"), "Must use #FE851C warm orange background for Image 1");
    assert.ok(content.includes("rounded-full bg-white"), "Must render white round eyes");
    assert.ok(content.includes("rounded-full bg-black"), "Must render black pupils");
    assert.ok(content.includes("stroke=\"#111111\""), "Must draw cute curved smile between eyes");

    // Code-generated Mascot in Phase 2
    assert.ok(content.includes("AnimatedFlameMascot"), "Must render code-generated AnimatedFlameMascot");
    assert.ok(content.includes("Day Streak!"), "Must display streak counter header");

    // Portal & High Stacking: Must breakout of parent stacking contexts to cover full viewport on mobile
    assert.ok(content.includes("createPortal"), "Must use createPortal to mount to document.body");
    assert.ok(content.includes("z-[99999]"), "Must use maximum z-index z-[99999]");

    // Responsive design: Mobile fullscreen vs Laptop centered card
    assert.ok(content.includes("min-h-[100dvh]"), "Must support full-screen takeover on mobile");
    assert.ok(content.includes("lg:max-w-") && content.includes("lg:rounded-"), "Must render as centered floating card on laptop view");

    // Dark charcoal backside + acid lime calendar & CTA in Phase 2 (no Skip or Continue to Dashboard)
    assert.ok(content.includes("bg-[#14171D]"), "Phase 2 backside must use dark charcoal #14171D");
    assert.ok(content.includes("bg-[#1B1F27]"), "Phase 2 calendar card must use dark charcoal #1B1F27");
    assert.ok(content.includes("#D5FF38"), "Phase 2 calendar and CTA must use acid lime #D5FF38");
    assert.ok(content.includes('phase === "flame" &&'), "Bottom Continue button must only show on Phase 2");
    assert.ok(content.includes("<span>Continue</span>"), "Phase 2 button must use Continue rather than Continue to Dashboard");
    assert.ok(!content.includes("Continue to Dashboard"), "Continue to Dashboard label must be removed");
    assert.ok(!/\bSkip\b/.test(content), "Skip button must be removed");
    assert.ok(!content.includes("Streak Active"), "Top-left Streak Active text badge must be removed");
    assert.ok(!content.includes("redirectTimer"), "Auto-redirect timer must be removed so modal never disappears without pressing continue");
  });

  it("computes the Monday-Sunday weekly calendar dynamically for the current streak", () => {
    // Friday Nov 27, 2026 with 18-day streak -> Mon..Fri completed, Sat 28 & Sun 29 upcoming
    const cal = buildWeeklyStreakCalendar(18, new Date(2026, 10, 27));
    assert.strictEqual(cal.days.length, 7);
    assert.deepStrictEqual(
      cal.days.map((d) => d.label),
      ["M", "T", "W", "T", "F", "S", "S"]
    );
    assert.strictEqual(cal.streakStartCol, 0);
    assert.strictEqual(cal.streakSpan, 5);
    assert.strictEqual(cal.days[4].isToday, true);
    assert.strictEqual(cal.days[4].isCompleted, true);
    assert.strictEqual(cal.days[5].dayNumber, 28);
    assert.strictEqual(cal.days[5].isCompleted, false);
    assert.strictEqual(cal.days[6].dayNumber, 29);
    assert.strictEqual(cal.days[6].isCompleted, false);

    // Mid-week 2-day streak -> only Thu & Fri completed
    const partial = buildWeeklyStreakCalendar(2, new Date(2026, 10, 27));
    assert.strictEqual(partial.streakStartCol, 3);
    assert.strictEqual(partial.streakSpan, 2);
    assert.strictEqual(partial.days[2].dayNumber, 25);
    assert.strictEqual(partial.days[2].isCompleted, false);
    assert.strictEqual(partial.days[3].isCompleted, true);
    assert.strictEqual(partial.days[4].isCompleted, true);
  });

  it("verifies login page integrates StreakCelebrationModal upon successful login", () => {
    const loginPagePath = path.join(process.cwd(), "app", "login", "page.tsx");
    assert.ok(fs.existsSync(loginPagePath), "frontend/app/login/page.tsx must exist");
    const loginContent = fs.readFileSync(loginPagePath, "utf-8");

    assert.ok(loginContent.includes("StreakCelebrationModal"), "Must import StreakCelebrationModal in login page");
    assert.ok(loginContent.includes("<StreakCelebrationModal"), "Must render <StreakCelebrationModal /> in login page");
    assert.ok(loginContent.includes("showStreakCelebration"), "Must manage celebration open state");
    assert.ok(loginContent.includes("syncDailyLoginStreak"), "Must sync real daily login streak on sign in");
  });

  it("verifies dashboard page integrates StreakCelebrationModal as universal fallback", () => {
    const dashboardPagePath = path.join(process.cwd(), "app", "dashboard", "page.tsx");
    assert.ok(fs.existsSync(dashboardPagePath), "frontend/app/dashboard/page.tsx must exist");
    const dashboardContent = fs.readFileSync(dashboardPagePath, "utf-8");

    assert.ok(dashboardContent.includes("StreakCelebrationModal"), "Must import StreakCelebrationModal in dashboard");
    assert.ok(dashboardContent.includes("<StreakCelebrationModal"), "Must render <StreakCelebrationModal /> in dashboard");
    assert.ok(dashboardContent.includes("showStreakModal"), "Must manage celebration open state in dashboard");
    assert.ok(dashboardContent.includes("sc_streak_celebrated"), "Must track daily celebration status");
  });

  it("verifies auth provider guards against premature redirection during streak celebration", () => {
    const authPath = path.join(process.cwd(), "lib", "auth.tsx");
    assert.ok(fs.existsSync(authPath), "frontend/lib/auth.tsx must exist");
    const authContent = fs.readFileSync(authPath, "utf-8");

    assert.ok(authContent.includes("isStreakPending"), "AuthContext must check if streak celebration is pending");
    assert.ok(authContent.includes("sc_pending_streak_modal"), "AuthContext must inspect sc_pending_streak_modal session key");
  });

  it("verifies TopNavbar renders the small streak mascot icon in desktop view", () => {
    const topNavPath = path.join(process.cwd(), "components", "TopNavbar.tsx");
    assert.ok(fs.existsSync(topNavPath), "TopNavbar.tsx must exist on disk");
    const topNavContent = fs.readFileSync(topNavPath, "utf-8");

    assert.ok(topNavContent.includes("MiniFlameMascot"), "TopNavbar must import and render MiniFlameMascot");
    assert.ok(topNavContent.includes("streakDays"), "TopNavbar must display streakDays count");
    assert.ok(topNavContent.includes("StreakCelebrationModal"), "TopNavbar must integrate StreakCelebrationModal");
  });
});
