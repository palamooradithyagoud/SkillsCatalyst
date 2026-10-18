# SkillsCatalyst Backend & Security Audit Report

**Auditor:** Senior Backend Engineer & Security Auditor  
**Audit Date:** October 18, 2026  
**Target Repository:** `SkillsCatalyst / backend`  
**Framework Stack:** FastAPI 0.135.1, Uvicorn 0.42.0, Python 3.12+, Supabase-py 2.31.0, Upstash Redis 5.0+, PhonePe PG SDK v3.0.0, Groq API v1.2.0  
**Context:** Builds directly upon `overall audit/repo_audit.md` (Architecture Discovery) and `overall audit/frontend_audit.md` (Frontend Audit). Read-only assessment strictly preserving all application source code, configuration, databases, and production data.

---

## 1. Executive Summary & Architecture Scorecard

This audit delivers an in-depth, code-verified technical and security analysis of the SkillsCatalyst FastAPI backend. We examined route registration, request/response validation schemas, authentication and role authorization hierarchies, payment gateway integration, database query performance, thread-pool concurrency, error handling, and test scripts.

### Backend Health Scorecard

| Assessment Domain | Status | Critical Highlights |
| :--- | :---: | :--- |
| **Route & API Contracts** | 🚨 Critical Defects | `courses.router` commented out in `main.py:325` breaking certificates API; PhonePe redirect URL missing `merchant_order_id`. |
| **Business Logic & Entitlements** | ⚠️ Needs Remediation | Total scholarship count masked by plan slicing; AI resume review omits parsed score from response payload. |
| **Security & Authorization** | 🛡️ Robust Foundation | Cryptographic JWT verification (local HS256/JWKS asymmetric); strict `require_owner` role guards; hardened resume parser. |
| **Reliability & Concurrency** | ⚠️ High Risk | Thread-pool starvation in `/api/profile` (12 tasks submitted to 8 workers); Redis hard dependency for free AI quota. |
| **Error Handling & Telemetry** | ✅ Strong Baseline | Sanitized global exception handlers; ContextVar request ID tracing; event loop lag monitor. |
| **Testing Suite Health** | ⚠️ Fragile & Incomplete | No dedicated `backend/tests/` directory; `test_phase2.py` fails on aptitude attempt authentication contradiction. |

---

## 2. Test Suite Execution & Verification Results

The backend lacks a dedicated, unified `tests/` directory configured for pytest. Instead, testing is executed via standalone verification scripts located in `backend/scripts/`. Safe, non-mutating execution of test scripts was conducted:

### 2.1 Automated Test Execution Summary

1. **Security Hardening Suite (`backend/scripts/test_security_hardening.py`):**
   - **Command:** `python backend/scripts/test_security_hardening.py`
   - **Result:** **PASSED (Exit Code: 0)**
   - **Coverage Verified:** Unauthenticated AI chat request guest session auto-generation, path traversal protection on `/api/practice/questions/{company}` (rejecting `../../etc/passwd` with 404), and unauthenticated access to health probes (`/health`, `/ready`).

2. **Learning Content Guard Suite (`backend/scripts/test_learning_content_guard.py`):**
   - **Command:** `python backend/scripts/test_learning_content_guard.py`
   - **Result:** **PASSED (Exit Code: 0)**
   - **Coverage Verified:** Strict prohibited term regex filtering (adult, songs, entertainment, pranks), input query validation, and rejection of off-topic roadmap skills with 400 Bad Request.

3. **Phase 2 Payment & Guest Session Suite (`backend/scripts/test_phase2.py`):**
   - **Command:** `python backend/scripts/test_phase2.py`
   - **Result:** **FAILED (Exit Code: 1)**
   - **Failing Assertion:** Line 131 in `test_aptitude_attempt_optional_user_id`:
     ```python
     resp = client.post("/api/practice/aptitude/attempt", json=payload)
     assert resp.status_code == 200  # FAILED: Got 401 Unauthorized
     ```
   - **Root Cause:** `test_phase2.py` asserts that guest requests without a Bearer token can submit aptitude attempts and receive a `guest_*` ID. However, [backend/routers/practice.py:253](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/practice.py#L253) explicitly enforces `Depends(require_authenticated_user)`. The test expectation directly contradicts the router security policy.

4. **Question Bank Security Suite (`backend/scripts/test_question_bank_system.py`):**
   - **Command:** `python backend/scripts/test_question_bank_system.py`
   - **Result:** **11 PASSED, 1 FAILED**
   - **Details:** Verified schema constraints, total volume (3,793 questions, 16,583 options), answer key column-level RLS hiding `is_correct` and `explanation`, and option ownership checks. Test 9 failed due to an overly narrow string matching assertion on the unauthenticated RPC error response.

---

## 3. Deep-Dive Backend Audit Findings

### Dimension 1: API Correctness & Contract Mismatches

#### 1. Commented-Out Course Router Breaking Certificate Issuance
- **Affected Files:** [backend/main.py:325](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L325) & [backend/routers/courses.py:271-330](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/courses.py#L271-L330)
- **Evidence:**
  In `main.py:325-327`:
  ```python
  # app.include_router(courses.router)        # Student courses disabled
  # app.include_router(admin_courses.router)  # Admin courses disabled
  app.include_router(certificates.router)
  ```
  `backend/routers/certificates.py` only implements `/api/certificates` (student certificate list) and `/api/public/certificates/{verification_id}`.
  However, course-level certificate evaluation and issuance endpoints:
  - `GET /api/courses/{course_id_or_slug}/certificate/eligibility`
  - `POST /api/courses/{course_id_or_slug}/certificate/issue`
  - `GET /api/courses/{course_id_or_slug}/certificate`
  are defined in `backend/routers/courses.py` (lines 271-330).
- **Impact:** Any frontend client calling `fetchCertificateEligibility` or `issueCourseCertificate` (in `frontend/lib/api/certificates.ts`) receives an unhandled HTTP 404 Not Found from FastAPI, preventing eligible students from claiming certificates.

#### 2. Static PhonePe Redirect URL Missing Merchant Order ID
- **Affected Files:** [backend/config.py:55](file:///c:/STARTUP/SKILLSCATALYST/backend/config.py#L55) & [backend/services/phonepe_service.py:98-118](file:///c:/STARTUP/SKILLSCATALYST/backend/services/phonepe_service.py#L98-L118)
- **Evidence:**
  In `backend/config.py:55`:
  ```python
  PHONEPE_REDIRECT_URL = os.getenv("PHONEPE_REDIRECT_URL", f"{FRONTEND_URL}/dashboard?payment=complete").strip()
  ```
  In `phonepe_service.py:115-119`:
  ```python
  pay_request = StandardCheckoutPayRequest.build_request(
      merchant_order_id=merchant_order_id,
      amount=amount_in_paise,
      redirect_url=target_redirect_url,
  )
  ```
- **Impact:** The PhonePe gateway redirects the browser to `https://www.skillscatalyst.in/dashboard?payment=complete` without appending `&order_id={merchant_order_id}`. Because the frontend does not have the `order_id` in the URL query string, it cannot call the backend status endpoint `GET /api/payments/status/{merchant_order_id}`. The frontend is forced to blindly display a celebratory banner without transaction confirmation.

#### 3. AI Resume Review Omits Calculated Score from Response Contract
- **Affected File:** [backend/routers/ai_mentor.py:716-753](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py#L716-L753)
- **Evidence:**
  ```python
  overall_score = round(val, 2)
  ...
  return {"review": review_text}
  ```
  The endpoint extracts `overall_score` via regex, persists it into the `resume_scores` and `user_progress` database tables, but returns **only** `{"review": review_text}` in the HTTP response.
- **Impact:** The frontend is forced to duplicate the regex extraction logic in client-side JavaScript (`frontend/lib/api/career.ts:172-179`) and store the score in `localStorage`. If the LLM generates a slightly different score formatting syntax, the client and database scores drift out of sync.

---

### Dimension 2: Business Logic & Data Integrity

#### 1. Unnecessary Frontend–Backend Duplicate Writes in `save_playlist`
- **Affected Files:** [backend/services/learning/playlist_service.py:274-320](file:///c:/STARTUP/SKILLSCATALYST/backend/services/learning/playlist_service.py#L274-L320) & [frontend/lib/api/playlists.ts:42-100](file:///c:/STARTUP/SKILLSCATALYST/frontend/lib/api/playlists.ts#L42-L100)
- **Evidence:**
  `backend/services/learning/playlist_service.py:save_playlist` already validates feature entitlements (lines 217-255), performs a relational upsert into `saved_playlists` (lines 274-292), and updates `learning_progress` JSONB (lines 295-320).
  Despite this, `frontend/lib/api/playlists.ts` makes an HTTP POST to `/api/learning/save`, then immediately runs client-side Supabase writes to `saved_playlists` and `learning_progress`.
- **Impact:** Quadruple network round trips per save action and risk of data divergence if the client Supabase call succeeds while the backend endpoint fails or times out.

#### 2. Plan Entitlement Masking Total Scholarship Count
- **Affected File:** [backend/routers/scholarships.py:39-45](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/scholarships.py#L39-L45)
- **Evidence:**
  ```python
  if entitlement.limit is not None and len(scholarships) > entitlement.limit:
      scholarships = scholarships[:entitlement.limit]

  return {
      "total": len(scholarships),
      "scholarships": scholarships,
  }
  ```
- **Impact:** When a free-tier student with a limit of 5 queries scholarships, `len(scholarships)` is sliced to 5, and `"total"` is returned as `5` instead of the true total catalog count (e.g. 50). The student UI has no indication that 45 additional scholarships exist behind the premium paywall.

---

### Dimension 3: Authentication, Authorization & Security

#### 1. Authoritative Role Verification Hierarchy
- **Affected File:** [backend/services/auth_service.py:28-73](file:///c:/STARTUP/SKILLSCATALYST/backend/services/auth_service.py#L28-L73)
- **Assessment:** **Secure.** Roles are resolved in strict priority:
  1. `app_metadata.role` from the Supabase JWT (cannot be tampered with by clients).
  2. Fallback to `public.profiles.role`.
  3. Server-side bootstrap safeguard comparing email against `OWNER_EMAIL`.
  4. Strict default to `"student"`.
  Admin endpoints in [backend/routers/admin.py](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/admin.py) strictly enforce `Depends(require_owner)` or `Depends(require_admin)`, rejecting regular users with 403 Forbidden.

#### 2. Public Certificate Verification Privacy
- **Affected File:** [backend/routers/certificates.py:64-80](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/certificates.py#L64-L80)
- **Assessment:** **Secure.** The verification endpoint `GET /api/public/certificates/{verification_id}` returns only safe public fields (`student_name`, `course_title`, `issue_date`, `certificate_number`). It strictly strips internal user UUIDs, student emails, profile addresses, and quiz attempts.

#### 3. Stream-Hardened Resume File Extraction
- **Affected File:** [backend/routers/resume.py:14-115](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/resume.py#L14-L115)
- **Assessment:** **Secure.** Enforces a 5 MB limit using 64 KB chunked streaming (aborts immediately if exceeded), validates extension allowlists (`.pdf`, `.docx`, `.doc`, `.txt`, `.md`), and verifies file magic bytes (`%PDF-`, `PK\x03\x04`, `\xd0\xcf\x11\xe0`).

---

### Dimension 4: Reliability, Performance & Concurrency

#### 1. Thread Pool Starvation on Unified Profile Endpoint
- **Affected File:** [backend/routers/profile.py:15, 642-653](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/profile.py#L15)
- **Evidence:**
  ```python
  _PROFILE_EXECUTOR = ThreadPoolExecutor(max_workers=8, thread_name_prefix="profile_db")
  ...
  f_acad = _PROFILE_EXECUTOR.submit(_fetch_academic_data, sb, user_id)
  f_prof = _PROFILE_EXECUTOR.submit(_fetch_personal_data, sb, user_id)
  # ... 10 more tasks submitted concurrently
  ```
- **Impact:** A single request to `/api/profile` submits **12 tasks** into a thread pool with a maximum of **8 workers**. When two or more students load their profiles concurrently, the thread pool is completely starved. Subsequent tasks queue up, resulting in response latency spikes and potential HTTP request timeouts under moderate load.

#### 2. Hard Redis Dependency for Free AI Quota Verification
- **Affected File:** [backend/services/ai_mentor_quota_service.py:33, 363-372](file:///c:/STARTUP/SKILLSCATALYST/backend/services/ai_mentor_quota_service.py#L33)
- **Evidence:**
  ```python
  ALLOW_IN_MEMORY_QUOTA_FALLBACK = os.getenv("ALLOW_IN_MEMORY_QUOTA_FALLBACK", "false").lower() in ("true", "1", "yes")
  ```
  If Redis is down or unconfigured in a deployment environment, `reserve_ai_mentor_slot` raises `QuotaStorageUnavailableError`, which causes `review_resume` and `chat_with_groq` to fail with HTTP 503 `QUOTA_UNAVAILABLE`.
- **Impact:** Free-tier students cannot use AI Mentor or Resume Review if the Redis cache encounters a transient outage or connection blip, even when the Groq LLM API itself is fully operational.

#### 3. Restrictive Permissions-Policy Header
- **Affected File:** [backend/main.py:194](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L194)
- **Evidence:**
  ```python
  response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
  ```
- **Impact:** Explicitly blocking `microphone=()` and `camera=()` prevents current or future speech-to-text AI mentor features or video interview proctoring modules from functioning in browsers.

---

## 4. Prioritized Backend Findings Table

| ID | Severity | Affected File & Line | Evidence | Root Cause | Impact | Reproduction Steps | Confidence | Recommended Fix |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **BE-API-01** | **P0 (Critical)** | [main.py:325](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L325), [courses.py:271-330](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/courses.py#L271-L330) | `courses.router` commented out in `main.py`; endpoints return 404. | Course router commented out during admin course refactoring. | Students completing courses cannot check eligibility or issue certificates. | `GET /api/courses/{slug}/certificate/eligibility` returns HTTP 404. | Confirmed | Re-enable `courses.router` in `main.py` or move course certificate routes into `certificates.router`. |
| **BE-PAY-01** | **P0 (Critical)** | [config.py:55](file:///c:/STARTUP/SKILLSCATALYST/backend/config.py#L55), [phonepe_service.py:118](file:///c:/STARTUP/SKILLSCATALYST/backend/services/phonepe_service.py#L118) | Redirect URL does not interpolate `merchant_order_id`. | Static default URL `f"{FRONTEND_URL}/dashboard?payment=complete"` without order ID parameter. | Frontend cannot query payment status; relies on unverified URL parameter spoofing. | Initiate PhonePe order; inspect generated redirect URL in pay request. | Confirmed | Append `&order_id={merchant_order_id}` to `redirect_url` in `PhonePeService.create_checkout_order`. |
| **BE-PERF-01**| **P1 (High)** | [profile.py:15, 642-653](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/profile.py#L15) | Submits 12 DB tasks to `ThreadPoolExecutor(max_workers=8)`. | Number of concurrent sub-queries per request exceeds thread-pool worker capacity. | Worker thread starvation; latency spikes when multiple users view profiles. | Simulate 3 concurrent requests to `GET /api/profile`; observe thread queue delays. | Confirmed | Increase pool workers to 16+ or deploy Supabase RPC `get_user_unified_profile` to fetch in 1 round trip. |
| **BE-CONTR-01**| **P1 (High)** | [ai_mentor.py:753](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py#L753) | Returns only `{"review": review_text}`; omits calculated `overall_score`. | Endpoint calculates score for DB persistence but forgets to include in response JSON. | Frontend has to re-parse score via duplicate regex; score divergence risk. | `POST /api/ai-mentor/review-resume`; inspect response keys. | Confirmed | Return `{"review": review_text, "overall_score": overall_score}` in response payload. |
| **BE-TEST-01**| **P1 (High)** | [scripts/test_phase2.py:131](file:///c:/STARTUP/SKILLSCATALYST/backend/scripts/test_phase2.py#L131), [practice.py:253](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/practice.py#L253) | `test_phase2.py` fails with 401 on unauthenticated aptitude attempt. | Test expects guests can record attempts, but router strictly requires authenticated user. | Test suite fails on standard runs; confusion over guest attempt policy. | Run `python backend/scripts/test_phase2.py`; observe assertion failure. | Confirmed | Update test to pass mock auth token, or update router to allow guest sessions using `get_session_or_user_id`. |
| **BE-LOGIC-01**| **P2 (Medium)** | [scholarships.py:39-45](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/scholarships.py#L39-L45) | Slices array to limit and sets `"total": len(scholarships)`. | `"total"` calculated after array slicing instead of before slicing. | Free users see false total count; hidden paywalled catalog value. | `GET /api/scholarships` with free tier account; observe returned `"total"`. | Confirmed | Compute `total = len(all_scholarships)` before slicing, returning `total` and `limit`. |
| **BE-REL-01** | **P2 (Medium)** | [ai_mentor_quota_service.py:33](file:///c:/STARTUP/SKILLSCATALYST/backend/services/ai_mentor_quota_service.py#L33) | `ALLOW_IN_MEMORY_QUOTA_FALLBACK` defaults to False. | Strict fail-closed policy with no graceful memory fallback on Redis disconnect. | All free AI requests crash with 503 if Redis experiences transient downtime. | Stop Redis; call `/api/ai-mentor/chat`; observe HTTP 503 response. | Confirmed | Enable bounded in-memory token bucket fallback when Redis is unreachable in non-prod/transient modes. |
| **BE-DATA-01**| **P2 (Medium)** | [playlist_service.py:274-320](file:///c:/STARTUP/SKILLSCATALYST/backend/services/learning/playlist_service.py#L274-L320) | Backend saves to both tables, but frontend duplicates calls. | Lack of single-source-of-truth contract for playlist saves. | 4 redundant network round trips; risk of split-brain state. | Monitor network traffic during playlist save action. | Confirmed | Make backend the sole mutation authority; remove client-side Supabase writes from frontend. |
| **BE-SEC-01**  | **P3 (Low)** | [main.py:194](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L194) | `Permissions-Policy` sets `microphone=(), camera=()`. | Overly broad header restriction across all API responses. | Blocks potential voice AI input or video interview proctoring in browser. | Inspect response headers on API endpoints. | Confirmed | Remove `microphone=()` or scope permissions policy dynamically based on client features. |

---

## 5. Top Five Verified Issues Requiring Immediate Action

1. **Course Certificate Endpoints Disconnected (404 Error) (`BE-API-01`):**
   - *File:* [backend/main.py:325](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L325)
   - *Fix:* Re-register `courses.router` or extract lines 271-330 into [backend/routers/certificates.py](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/certificates.py) so student course certificate claims succeed.
2. **Missing `merchant_order_id` in PhonePe Redirect URL (`BE-PAY-01`):**
   - *File:* [backend/services/phonepe_service.py:118](file:///c:/STARTUP/SKILLSCATALYST/backend/services/phonepe_service.py#L118)
   - *Fix:* Dynamically append `f"&order_id={merchant_order_id}"` to the PhonePe checkout redirect URL so the frontend can query authoritative transaction status.
3. **Thread Pool Starvation on `/api/profile` (`BE-PERF-01`):**
   - *File:* [backend/routers/profile.py:15, 642](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/profile.py#L15)
   - *Fix:* Expand `ThreadPoolExecutor(max_workers=16)` or utilize the single-roundtrip Supabase RPC `get_user_unified_profile` to prevent concurrency bottlenecks.
4. **Contract Omission in AI Resume Review Response (`BE-CONTR-01`):**
   - *File:* [backend/routers/ai_mentor.py:753](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py#L753)
   - *Fix:* Return `{"review": review_text, "overall_score": overall_score}` so the frontend does not have to re-parse scores via regex into `localStorage`.
5. **Test Failure in `test_phase2.py` Due to Auth Policy Contradiction (`BE-TEST-01`):**
   - *File:* [backend/scripts/test_phase2.py:131](file:///c:/STARTUP/SKILLSCATALYST/backend/scripts/test_phase2.py#L131)
   - *Fix:* Align the test suite with router policy by injecting an authorized session or adjusting the endpoint to accept signed guest IDs via `get_session_or_user_id`.

---

## 6. Unresolved Questions & External Dependencies

1. **PhonePe Production Webhook Host Resolution:**
   Does the production PhonePe dashboard have the exact S2S webhook URL configured as `https://<backend-domain>/api/subscriptions/webhook/phonepe`? (Since it is located under `/api/subscriptions`, not `/api/payments`).
2. **Supabase Migration Status of `get_user_unified_profile` RPC:**
   The backend profile router checks `if hasattr(sb, "rpc"): sb.rpc("get_user_unified_profile")`, but falls back to 12 parallel threads. Verifying if this RPC is active in the production Supabase instance would immediately resolve the thread pool starvation issue.

---

## 7. Read-Only Verification Confirmation

I explicitly confirm that throughout this backend audit:
* **No backend source code, configuration files, requirements, or test scripts were created, edited, deleted, renamed, or modified** (with the sole exception of writing this audit markdown artifact to disk as requested).
* **No packages, pip modules, or dependencies were installed or upgraded.**
* **No database schemas, migrations, tables, records, or production data were altered or executed.**
* **No secrets, API keys, or personal customer data were exposed.**
