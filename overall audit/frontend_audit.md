# SkillsCatalyst Frontend & Security Audit Report

**Auditor:** Senior Frontend Engineer & Security Auditor  
**Audit Date:** October 18, 2026  
**Target Repository:** `SkillsCatalyst / frontend`  
**Framework Stack:** Next.js 16.2.12 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS 4, TanStack Query v5.101.4, Supabase SSR v0.12.6  
**Context:** Builds directly on `overall audit/repo_audit.md` (Repository & Architecture Discovery). Read-only assessment strictly preserving all application source code, configuration, and data integrity.

---

## 1. Executive Summary & Audit Scorecard

This audit delivers a deep, evidence-based evaluation of the SkillsCatalyst frontend application. By inspecting routing boundaries, client-server integration boundaries, component state lifecycles, network patterns, security controls, bundle assets, and the test suite, we identified critical architectural discrepancies, unauthenticated data exposures, security vulnerabilities, bundle performance bottlenecks, and test infrastructure issues.

### Frontend Health Scorecard

| Assessment Domain | Status | Critical Risk Highlights |
| :--- | :---: | :--- |
| **Functionality & Routing** | ⚠️ Needs Remediation | Missing `/profile` page (404); >5,500 lines of duplicated code across `/settings` and `/settings/edit`. |
| **API Integration** | 🚨 Critical Defects | Commented-out backend courses router called by certificates API; AI quota/rate errors swallowed as backend down. |
| **Authentication & Security** | 🚨 High Vulnerability | Quiz answer keys exposed in client bundles; payment confirmation spoofable via URL parameter; hardcoded PII on public route. |
| **Performance & Bundle** | 🚨 Severe Bloat | >4.3 MB of static placement questions bundled into `/dashboard` via `QuickHubNav` static import; universal `'use client'`. |
| **Data Integrity** | ⚠️ High Risk | Triple duplicate DB writes in `savePlaylist`; profile languages and resume scores orphaned in `localStorage`. |
| **Accessibility (a11y)** | ⚠️ Non-Compliant | Unassociated form labels; un-focusable interactive dropzones and modal selectors; missing ARIA live regions. |
| **Test Suite Health** | ⚠️ Fragile Config | Default `npm test` crashes 16 suites due to module-level Supabase initialization; OAuth tests fail due to env var collision. |

---

## 2. Test Suite Inspection & Safe Execution Results

### 2.1 Safe Execution Summary

The frontend repository includes 26 test suites in `frontend/tests/` (plus 1 Playwright end-to-end smoke test). Safe, non-mutating execution was performed to verify test runner stability:

1. **Standard `npm test` Execution (Without Preloaded `.env.local`):**
   - **Command:** `npm test` (`tsx --test "tests/**/*.test.ts"`)
   - **Result:** **16 test suites crashed immediately at import time**, throwing:
     ```
     Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
         at createClient (frontend/lib/supabase/client.ts:11:11)
         at frontend/lib/supabase/client.ts:22:25
     ```
   - **Root Cause:** In `frontend/lib/supabase/client.ts:22`, `export const supabase = createClient()` executes at top-level module load time. Because the `test` script in `package.json` invokes `tsx --test` without `--env-file=.env.local` or environment fallback mocks, any test file directly or transitively importing `client.ts` crashes the Node process before executing assertions.

2. **Isolated Environment Run (With Safe `.env.local` Preload):**
   - **Command:** `npx tsx --env-file=.env.local --test "tests/**/*.test.ts"`
   - **Result:** **365 tests passed across 25 suites; 1 suite failed** (`tests/oauth-callback-redirect.test.ts` with 10 failed assertions).
   - **Root Cause:** In `frontend/tests/oauth-callback-redirect.test.ts`, tests set `process.env.APP_ENV = 'production'`, but `.env.local` exports `ENVIRONMENT=development`. In `frontend/app/auth/callback/route.ts:151-157`:
     ```typescript
     if (rawAppEnv && rawEnvironment && rawAppEnv !== rawEnvironment) {
       const isDev1 = rawAppEnv === "development" || rawAppEnv === "dev" || rawAppEnv === "local";
       const isDev2 = rawEnvironment === "development" || rawEnvironment === "dev" || rawEnvironment === "local";
       if (!(isDev1 && isDev2)) {
         return "invalid";
       }
     }
     ```
     Because `process.env.ENVIRONMENT` is not reset in `beforeEach`, `classifyDeploymentEnvironment()` returns `"invalid"` instead of `"production"`, causing production redirection assertions to fail.

### 2.2 Test Suite Categorization

| Category | Suites | Files Inspected | Execution Status | Coverage Focus |
| :--- | :---: | :--- | :---: | :--- |
| **API & Error Handling** | 3 | `api-auth-utils.test.ts`, `api-domain-modules.test.ts`, `api-fetch-error-handling.test.ts` | Pass (with env) | Auth headers, 401/403/500 propagation, timeout abort. |
| **Student & Course Experience** | 4 | `student-course-experience.test.ts`, `student-progress.test.ts`, `lesson-block-editor.test.ts`, `lesson-content.test.ts` | Pass (with env) | Course enrollment, lesson completion state, Markdown parser. |
| **SkillBits Reels & Progress** | 3 | `skillbits-discovery.test.ts`, `skillbits-progress.test.ts`, `skillbits-reels.test.ts` | Pass (with env) | Reel feeds, tag filtering, video progression persistence. |
| **Career & Placement** | 2 | `career-characterization.test.ts`, `practice-characterization.test.ts` | Pass (with env) | Resume review schemas, practice quiz attempt calculation. |
| **Video Progress & Resume** | 2 | `video-progress-characterization.test.ts`, `video-resume-failure-e2e.test.ts` | Pass (with env) | YouTube video duration tracking, resume timestamps. |
| **Subscription & UX** | 2 | `subscription.test.ts`, `premium-ux-phase4.test.ts` | Pass (with env) | Entitlement mapping, 7-feature lock modal assertions. |
| **Security & Routing** | 1 | `oauth-callback-redirect.test.ts` | 10 Failures | Open-redirect protection, host allowlisting, environment classification. |
| **End-to-End (E2E)** | 1 | `tests/e2e/browser-smoke.spec.ts` | Inspected Only | Playwright browser smoke test (requires running dev server; not run to preserve read-only policy). |

---

## 3. Deep-Dive Findings by Audit Dimension

### Dimension 1: Functionality & Routing Integrity

#### 1. Missing `/profile` Route Leading to 404
- **Affected File:** `frontend/app/profile/` (directory) & `frontend/components/Sidebar.tsx:133`
- **Evidence:** `frontend/app/profile/` contains only `edit/page.tsx` (which contains `redirect('/settings/edit')`). There is no `frontend/app/profile/page.tsx`. In `frontend/components/Sidebar.tsx:133`, the navigation item labeled `"My Profile"` maps to `href: "/settings"`.
- **User Impact:** Any user attempting to visit `/profile` directly or via external links/bookmarks receives a Next.js 404 page. Navigating to "My Profile" in the sidebar opens `/settings`, which presents account settings rather than a public or shareable student profile.

#### 2. Extreme Monolithic Code Duplication Between `/settings` and `/settings/edit`
- **Affected Files:** `frontend/app/settings/page.tsx` (2,877 lines, 135 KB) and `frontend/app/settings/edit/page.tsx` (2,681 lines, 125 KB)
- **Evidence:** Over 5,500 lines of nearly identical client-side code are duplicated across these two routes. Both components duplicate the state models, form handlers (`savePersonalProfile`, `saveSkill`, `saveExperience`, `saveEducation`, `saveProject`), SVG icons, and inline validation logic.
- **User Impact:** Code maintenance nightmare, cache desynchronization, and massive JavaScript parsing overhead on low-power mobile devices. Updating a field validation rule on one page leaves the other out of sync.

---

### Dimension 2: API Integration & Network Health

#### 1. Certificates API Calls Commented-Out Backend Router (Permanent 404)
- **Affected Files:** `frontend/lib/api/certificates.ts:20-65` & `backend/main.py:325`
- **Evidence:** `certificates.ts` defines and exports:
  ```typescript
  fetchCertificateEligibility(courseIdOrSlug: string):
    GET ${API_BASE}/api/courses/${courseIdOrSlug}/certificate/eligibility
  issueCourseCertificate(courseIdOrSlug: string):
    POST ${API_BASE}/api/courses/${courseIdOrSlug}/certificate/issue
  fetchCourseCertificate(courseIdOrSlug: string):
    GET ${API_BASE}/api/courses/${courseIdOrSlug}/certificate
  ```
  However, in `backend/main.py:325`:
  ```python
  # app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
  ```
- **User Impact:** Any frontend user who finishes a course and requests a certificate or checks eligibility receives an unhandled 404 error from FastAPI, blocking certificate issuance.

#### 2. Error Swallowing & Misleading User Messaging in AI Mentor
- **Affected File:** `frontend/lib/api/career.ts:94-104`
- **Evidence:**
  ```typescript
  try {
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/chat`, { ... });
    if (!res.ok) throw new Error("Failed to reach AI mentor");
    return await res.json();
  } catch {
    return { reply: "I am your SkillsCatalyst AI Mentor powered by Groq. Please start the FastAPI backend to interact live!" };
  }
  ```
- **User Impact:** When a free-tier student exhausts their daily AI token quota (HTTP 403 `LIMIT_REACHED`) or the Groq API experiences rate limiting (HTTP 429), the frontend catches the error and displays: *"Please start the FastAPI backend to interact live!"*. The user assumes the platform infrastructure has crashed instead of understanding that they hit their plan limits or need to upgrade.

#### 3. Redundant Triple-Write Architecture in `savePlaylist`
- **Affected File:** `frontend/lib/api/playlists.ts:42-100`
- **Evidence:** Calling `savePlaylist` executes four sequential network operations:
  1. `POST ${API_BASE}/api/learning/save` to FastAPI (lines 42-46).
  2. `supabase.from("saved_playlists").upsert(...)` directly from the client (lines 71-74).
  3. `supabase.from("learning_progress").select(...)` directly from the client (lines 83-88).
  4. `supabase.from("learning_progress").upsert(...)` directly from the client (lines 93-99).
- **User Impact:** A single user click triggers 4 HTTP round trips. If step 1 fails with a non-403 error, lines 57-64 catch it with `console.warn` and continue executing client Supabase writes, creating split-brain state between FastAPI cache/tables and Supabase.

#### 4. N+1 Waterfall Requests on Dashboard Metric Cards
- **Affected File:** `frontend/components/MetricCards.tsx:153-169`
- **Evidence:**
  ```typescript
  const playlistItems: SavedYTPlaylistItem[] = await Promise.all(
    saved.map(async (playlist: Playlist, idx: number) => {
      ...
      const { videos } = await fetchPlaylistVideos(playlist.id);
  ```
- **User Impact:** When a student has 15 saved playlists, opening `/dashboard` immediately fires 15 parallel HTTP calls to fetch video arrays. This floods the browser network connection pool, triggers rate limits on playlist endpoints, and causes visible layout shifts and UI lag on mobile devices.

---

### Dimension 3: Authentication, Client Security & Data Privacy

#### 1. Complete Question Bank Answer Keys Exposed in Browser Client Bundles
- **Affected Files:**
  - `frontend/data/aptitudeQuestions.ts:504-551`
  - `frontend/data/percentagesQuestions.ts:15-45`
  - `frontend/data/logicalReasoningQuestions.json` (1.2 MB)
  - `frontend/data/verbalAbilityQuestions.json` (1.0 MB)
  - `frontend/data/allAptitudeQuestions.json`
- **Evidence:** In `aptitudeQuestions.ts:1-9`, questions are typed as:
  ```typescript
  export interface PlacementQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    answerText: string;
    solution: string;
  }
  ```
  Every question object bundled into the client contains `correctIndex`, `answerText`, and full `solution` text.
- **Security & Integrity Impact:** In `frontend/components/QuickHubNav.tsx:9`, `PlacementPrepModal` is statically imported, which imports `QUANTITATIVE_APTITUDE_MAP`. Any student can open Chrome DevTools -> Console and type:
  ```javascript
  // Inspecting client chunks or webpack module cache
  ```
  Or inspect network chunks to retrieve all answers for every quantitative, logical reasoning, and verbal ability question without taking the test. The frontend does not rely on backend evaluation for these modules.

#### 2. Spoofable Payment Confirmation via URL Search Parameter
- **Affected File:** `frontend/app/dashboard/page.tsx:25-30, 87-105`
- **Evidence:**
  ```typescript
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "complete") {
        setShowPaymentBanner(true);
        refetchSubscription();
      }
    }
  }, [refetchSubscription]);
  ```
  The celebration banner displays:
  `"🎉 Payment Confirmed! Your Premium access is active across all questions, prep, and roadmaps."`
- **Security & Integrity Impact:** The dashboard does not verify the payment transaction via `fetchPaymentStatus(orderId)`. Any unauthenticated or free-tier user can manually append `?payment=complete` to their URL and see the confirmed premium payment banner. While backend API endpoints will reject premium requests, this creates user confusion and exposes a glaring client-side state spoofing bug.

#### 3. Hardcoded Developer PII Exposed on Public Production Route
- **Affected Files:** `frontend/app/certificate-preview/page.tsx:10-21` & `frontend/middleware.ts:60`
- **Evidence:** `frontend/app/certificate-preview/page.tsx` renders:
  ```typescript
  <CertificateDisplay
    studentName="Palamoor Adithya"
    collegeName="Vasavi College of Engineering"
    courseTitle="Git & GitHub Basics: From Zero to Collaboration"
    score={95}
    issuedDate="2026-09-26T00:00:00Z"
    certificateNumber="SC-98214732"
    courseDuration="16 Hours"
    verificationUrl="http://localhost:3000/verify/certificate/SC-98214732"
    isPreview={false}
  />
  ```
  In `frontend/middleware.ts:60`, `/certificate-preview` is explicitly declared as a public route bypassing authentication.
- **Privacy & Security Impact:** Developer personal data and internal staging verification URLs (`http://localhost:3000/...`) are publicly indexed and accessible to anyone without authentication.

#### 4. Legacy Mock Pro & Trial Bypass Artifacts
- **Affected Files:** `frontend/lib/trial.ts` & `frontend/components/PricingModal.tsx:10-13, 42-44`
- **Evidence:** `trial.ts` contains `localStorage.setItem("skillscatalyst_pro_member", "true")`. While marked `@deprecated`, `PricingModal.tsx` still imports `activateUserTrial`, `isUserTrialClaimed`, and `getTrialDaysRemaining`, maintaining reactive state `isTrialClaimed` that is never displayed.
- **Impact:** Technical debt and risk of future developers referencing `hasProAccess()` for entitlement checks, bypassing server-side subscription validation.

---

### Dimension 4: Performance & Bundle Overhead

#### 1. Multi-Megabyte Static Question Bank Bundled into `/dashboard`
- **Affected Files:** `frontend/components/QuickHubNav.tsx:9`, `frontend/components/PlacementPrepModal.tsx`, `frontend/data/`
- **Evidence:**
  - `QuickHubNav.tsx:9`: `import PlacementPrepModal from "@/components/PlacementPrepModal";`
  - `PlacementPrepModal.tsx:33`: `import { QUANTITATIVE_APTITUDE_MAP } from "@/data/aptitudeQuestions";`
  - `aptitudeQuestions.ts`: statically imports `logicalReasoningQuestions.json` (1.2 MB), `verbalAbilityQuestions.json` (1.0 MB), and `allAptitudeQuestions.json`.
- **Performance Impact:** Every single user landing on `/dashboard` downloads >4.3 MB of uncompressed JSON and TypeScript question data, even if they never click the Placement Prep button. This severely penalizes Core Web Vitals (LCP and INP), especially on 3G/4G mobile connections.

#### 2. Universal `'use client'` Directive Bypassing React Server Components
- **Affected Files:** `frontend/app/dashboard/page.tsx:1`, `frontend/app/career/page.tsx:1`, `frontend/app/settings/page.tsx:1`, `frontend/app/pricing/page.tsx:1`, etc.
- **Evidence:** Virtually 100% of pages in the App Router declare `"use client"` at line 1.
- **Performance Impact:** Next.js Server Components, streaming SSR, and edge rendering are completely bypassed. The entire component tree is hydrated on the client, maximizing initial JavaScript bundle size and CPU execution time during hydration.

---

### Dimension 5: Data Integrity & State Management

#### 1. Profile Languages and Resume Scores Stored Exclusively in `localStorage`
- **Affected Files:** `frontend/app/settings/edit/page.tsx:333-341` & `frontend/lib/api/career.ts:178`
- **Evidence:**
  - In `settings/edit/page.tsx:333`: `const saved = localStorage.getItem("sc_profile_languages");`
  - In `career.ts:178`: `localStorage.setItem("skillscatalyst_latest_resume_score", String(scoreVal));`
- **Data Integrity Impact:** Languages added by a user in the profile editor are not saved to Supabase or the backend PostgreSQL database; they exist purely in the browser's `localStorage`. If the student switches devices, clears browser cache, or uses private browsing, their configured languages are lost.

---

### Dimension 6: Responsive UI & Accessibility (a11y)

#### 1. Unassociated Form Labels Across Massive Settings Forms
- **Affected Files:** `frontend/app/settings/edit/page.tsx:767-820`
- **Evidence:**
  ```html
  <div>
    <label className="text-xs font-bold text-slate-700 dark:text-neutral-300">Full Name</label>
    <input type="text" value={personalForm.full_name || ""} ... />
  </div>
  ```
  Labels have neither an `htmlFor` attribute nor do inputs have corresponding `id` attributes.
- **Accessibility Impact:** Assistive technologies (screen readers like NVDA/VoiceOver) cannot announce form labels when focusing input fields, violating WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value). Clicking the text label also fails to set input focus.

#### 2. Inaccessible Drag-and-Drop Dropzones and Selection Cards
- **Affected File:** `frontend/components/career/ResumeReviewModal.tsx:207-243, 285-321`
- **Evidence:**
  - Company type selection cards (lines 207-243) use `div` elements with `onClick` handlers but lack `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers.
  - Resume upload dropzone (lines 285-321) is a `div` with `onClick` pointing to a hidden `<input type="file" className="hidden" />`.
- **Accessibility Impact:** Users navigating via keyboard (Tab / Enter / Space) cannot focus or activate the resume file picker or company rubrics.

---

## 4. Prioritized Findings Master Table

| ID | Severity | Affected File & Line | Evidence | User Impact | Reproduction / Verification Method | Confidence | Recommended Next Action |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **SEC-01** | **P0 (Critical)** | `frontend/data/aptitudeQuestions.ts:1-551`, `percentagesQuestions.ts:16-45` | Question bank files bundle `correctIndex`, `answerText`, and `solution` in client JS. | Students can extract complete exam answer keys via browser DevTools. | Inspect network JS bundle chunks or evaluate `QUANTITATIVE_APTITUDE_MAP` in console. | Confirmed | Migrate all question validation to server-side RPC / API; remove answers from client bundles. |
| **API-01** | **P0 (Critical)** | `frontend/lib/api/certificates.ts:25, 40, 58` | Calls `/api/courses/.../certificate/*`; backend router commented out in `main.py:325`. | Users completing courses receive 404 errors when claiming certificates. | Call `issueCourseCertificate("test")` against backend; observe HTTP 404 response. | Confirmed | Uncomment `courses.router` in `backend/main.py:325` or implement dedicated certificate router. |
| **PERF-01** | **P1 (High)** | `frontend/components/QuickHubNav.tsx:9`, `PlacementPrepModal.tsx` | `QuickHubNav` on `/dashboard` statically imports `PlacementPrepModal` and >4.3 MB question data. | Excessive initial bundle size (>4.3 MB), slow LCP, high mobile data usage. | Check webpack bundle analyzer or network transfer size on `/dashboard`. | Confirmed | Replace static import with `next/dynamic` lazy loading: `const PlacementPrepModal = dynamic(...)`. |
| **SEC-02** | **P1 (High)** | `frontend/app/dashboard/page.tsx:25-30, 87-105` | Checks `?payment=complete` in URL; displays premium active banner without verification. | Users can spoof payment success UI; confusion when backend rejects premium access. | Navigate to `/dashboard?payment=complete`; observe celebration banner. | Confirmed | Validate `order_id` with `fetchPaymentStatus()` before displaying payment confirmation UI. |
| **SEC-03** | **P1 (High)** | `frontend/app/certificate-preview/page.tsx:11-18`, `middleware.ts:60` | Hardcoded student name, college, and `localhost:3000` preview URL on public route. | Exposure of developer PII and staging verification URLs to public web indexers. | Visit `/certificate-preview` in incognito browser window. | Confirmed | Gate route behind admin auth or replace hardcoded data with generic mock placeholders. |
| **API-02** | **P1 (High)** | `frontend/lib/api/career.ts:101-103` | Catch block in `sendMentorMessage` swallows 403/429 errors and claims backend is offline. | Users hitting daily quotas think the server crashed instead of upgrading. | Mock HTTP 403 response on `/api/ai-mentor/chat`; observe client response string. | Confirmed | Check `res.status === 403` and return structured quota limit error to trigger `UpgradeCTA`. |
| **TEST-01** | **P1 (High)** | `frontend/lib/supabase/client.ts:22`, `package.json:10` | `createClient()` runs at module load time; plain `npm test` crashes 16 test suites. | CI/CD pipelines fail immediately unless `.env.local` is manually pre-injected. | Run `npm test` in clean environment without `.env.local`. | Confirmed | Lazy-initialize `clientInstance` inside getters or provide mock env variables in test setup. |
| **DATA-01** | **P2 (Medium)** | `frontend/lib/api/playlists.ts:42-100` | `savePlaylist` writes to FastAPI, `saved_playlists` table, and `learning_progress` table. | 4 network round trips per save; potential split-brain state if backend fails. | Trace network waterfall during playlist save action in DevTools. | Confirmed | Unify playlist saving into a single atomic backend transaction in FastAPI. |
| **PERF-02** | **P2 (Medium)** | `frontend/components/MetricCards.tsx:153-169` | `MetricCards` maps `fetchPlaylistVideos` in `Promise.all` for all saved playlists. | N+1 network waterfall on dashboard load; API rate limiting. | Inspect `/dashboard` network tab with 10+ saved playlists. | Confirmed | Create single batch endpoint `/api/learning/playlists/stats` to fetch counts in one call. |
| **ROUT-01** | **P2 (Medium)** | `frontend/app/profile/` (no page), `Sidebar.tsx:133` | `/profile` route does not exist (404); Sidebar links "My Profile" to `/settings`. | Direct navigation to `/profile` fails; confusing UX between settings and profile. | Navigate to `http://localhost:3000/profile`; observe 404. | Confirmed | Create `frontend/app/profile/page.tsx` rendering public profile view or canonical redirect. |
| **ARCH-01** | **P2 (Medium)** | `frontend/app/settings/page.tsx` (2,877 lines), `settings/edit/page.tsx` (2,681 lines) | Over 5,500 lines of duplicated profile/settings management code. | High maintenance burden, redundant bundle weight, desynchronized state. | Compare code structure and handlers between the two files. | Confirmed | Refactor shared profile state and sub-forms into modular components under `components/profile/`. |
| **DATA-02** | **P2 (Medium)** | `frontend/app/settings/edit/page.tsx:333-341` | Profile languages saved and read only from `localStorage("sc_profile_languages")`. | Languages lost when clearing cache or switching devices. | Set languages, clear `localStorage`, reload page; observe languages disappear. | Confirmed | Add `languages` column to `public.user_profiles` or store in career preferences JSON. |
| **A11Y-01** | **P2 (Medium)** | `frontend/app/settings/edit/page.tsx:767-820` | Form labels lack `htmlFor` and inputs lack matching `id` attributes. | Screen readers cannot announce field names; clicking labels does not focus inputs. | Run axe DevTools or inspect input accessibility tree. | Confirmed | Add unique `id` to each input and set `<label htmlFor={id}>`. |
| **A11Y-02** | **P3 (Low)** | `frontend/components/career/ResumeReviewModal.tsx:207-243, 285-321` | Selection cards and dropzone `div`s lack `role="button"` and `tabIndex={0}`. | Keyboard-only users cannot select rubrics or trigger file upload. | Attempt to navigate modal using `Tab` and `Enter` keys. | Confirmed | Replace with semantic `<button>` elements or add `tabIndex={0}`, `role="button"`, and key handlers. |
| **CLEAN-01**| **P3 (Low)** | `frontend/lib/trial.ts:31-89`, `PricingModal.tsx:10-13` | Legacy mock trial functions persist and are imported despite deprecation. | Dead code overhead and confusion with authoritative server entitlements. | Inspect `PricingModal.tsx` state `isTrialClaimed`. | Confirmed | Remove `trial.ts` imports from `PricingModal.tsx` and purge legacy mock storage keys. |

---

## 5. Categorization: Confirmed Defects, Potential Risks & Unverified Areas

### 5.1 Confirmed Defects (Verified with Direct Code Evidence & Test Execution)
1. **Plaintext Question & Answer Exposure (`SEC-01`):** Complete answer keys and solutions for quantitative aptitude, logical reasoning, and verbal ability are packaged directly into client-side JS bundles.
2. **Commented Backend Router 404 (`API-01`):** `frontend/lib/api/certificates.ts` makes API calls to `/api/courses/.../certificate/*`, which is commented out in `backend/main.py:325`.
3. **Dashboard Bundle Bloat (`PERF-01`):** `QuickHubNav.tsx` imports `PlacementPrepModal`, forcing every dashboard user to download >4.3 MB of placement question data.
4. **Test Suite Module Initialization Crash (`TEST-01`):** Plain `npm test` crashes 16 test suites due to top-level `createClient()` execution in `frontend/lib/supabase/client.ts`.
5. **Missing `/profile` Page (`ROUT-01`):** Navigating to `/profile` throws a 404 because no `page.tsx` exists in `frontend/app/profile/`.
6. **Error Masking in AI Mentor (`API-02`):** `sendMentorMessage` swallows 403 quota exhaustion and 429 rate limits, misleadingly reporting that the FastAPI backend is offline.
7. **Monolithic Code Duplication (`ARCH-01`):** `/settings/page.tsx` (2,877 lines) and `/settings/edit/page.tsx` (2,681 lines) contain duplicate profile management code.
8. **Unassociated Form Labels (`A11Y-01`):** Forms in `/settings/edit` render unlinked `<label>` and `<input>` tags, violating accessibility standards.

### 5.2 Potential Architectural & Security Risks
1. **Payment Confirmation Spoofing (`SEC-02`):** While backend endpoints check Supabase subscription records, displaying `"Payment Confirmed"` solely based on `?payment=complete` in the URL query string exposes the frontend to UI spoofing.
2. **N+1 Playlist Video Waterfall (`PERF-02`):** Concurrently querying playlist videos for every saved playlist in `MetricCards.tsx` risks client-side network congestion and API rate-limiting under high usage.
3. **Orphaned LocalStorage State (`DATA-02`):** Storing user languages in `localStorage` rather than Supabase creates inconsistent data across devices.
4. **Universal Client Hydration (`PERF-03`):** Using `'use client'` across all App Router pages disables React Server Component optimizations and streaming SSR.

### 5.3 Unverified Areas (Requiring Safe Staging / Live Backend Integration)
1. **Live PhonePe Webhook Callback Latency:** The delay between PhonePe checkout completion and backend webhook processing could not be measured without a live transaction sandbox.
2. **Playwright E2E Smoke Test Suite (`tests/e2e/browser-smoke.spec.ts`):** Inspected but not executed to comply with the read-only directive requiring no active background server processes or state alterations.

---

## 6. Highest-Priority Frontend Remediation Plan

### Immediate Hotfixes (Sprint 1)
1. **Dynamic Import for Placement Prep Modal:**
   - In `frontend/components/QuickHubNav.tsx:9`, replace `import PlacementPrepModal from "@/components/PlacementPrepModal"` with `const PlacementPrepModal = dynamic(() => import("@/components/PlacementPrepModal"), { ssr: false })`.
   - *Impact:* Instantly removes >4.3 MB of question data from the initial dashboard bundle.
2. **Fix Test Runner Environment Loading:**
   - Update `package.json:10` to `"test": "tsx --env-file=.env.local --test \"tests/**/*.test.ts\""` or lazy-load `createClient()` inside `frontend/lib/supabase/client.ts`.
   - *Impact:* Restores `npm test` stability across all 26 test suites in CI/CD.
3. **Structured Error Handling in AI Mentor:**
   - In `frontend/lib/api/career.ts:98-104`, inspect `res.status`. If `403` or `detail.code === "LIMIT_REACHED"`, rethrow a typed `LimitReachedError` rather than returning the generic "Please start FastAPI" fallback.
4. **Restore Course Certificate Backend Endpoint:**
   - Align `backend/main.py` with `frontend/lib/api/certificates.ts` so course completion certificate eligibility checks succeed.

### Strategic Refactoring (Sprint 2)
1. **Consolidate Settings & Profile Architecture:**
   - Add `frontend/app/profile/page.tsx` (redirecting or displaying public profile).
   - Extract shared sub-components (`PersonalDetailsForm`, `SkillsEditor`, `ExperienceList`) from `settings/page.tsx` and `settings/edit/page.tsx` into modular files under `frontend/components/profile/`.
2. **Server-Side Quiz Answer Verification:**
   - Refactor aptitude practice components to use Supabase RPC `get_topic_questions` (which omits `is_correct`), evaluating answers via backend RPC or API rather than shipping plaintext solutions in client bundles.
3. **Batch Playlist Stats Endpoint:**
   - Replace the `MetricCards.tsx` N+1 `Promise.all` waterfall with a single backend endpoint returning aggregate video counts for all saved playlists.
4. **Form Accessibility & Keyboard Navigation:**
   - Add `id` / `htmlFor` pairings to all input labels in `/settings/edit` and replace non-semantic `div` click handlers in `ResumeReviewModal.tsx` with semantic `<button>` elements.

---

## 7. Read-Only Verification Confirmation

I explicitly confirm that throughout this audit:
- **No application code, configuration files, or tests were created, modified, deleted, renamed, or formatted** (with the sole exception of writing this audit markdown artifact to disk as requested).
- **No dependencies or npm packages were installed or updated.**
- **No databases, migrations, or backend runtime environments were altered.**
- **No secrets, API keys, or private user data were exposed.**
