# SkillsCatalyst — Comprehensive Repository Architecture Audit

**Audit Date:** October 18, 2026  
**Auditor:** Senior Software Architect  
**Classification:** Read-Only Architectural Inspection & Repository Audit  
**Workspace:** `c:\STARTUP\SKILLSCATALYST`  
**Target Environment:** Hybrid (FastAPI Container on Railway / GCP Cloud Run + Next.js App Router on Vercel / Railway + Supabase Cloud PostgreSQL)

---

## Executive Summary

SkillsCatalyst is an AI-powered career accelerator and placement preparation platform tailored for engineering students and job seekers in India. The application combines personalized AI learning roadmaps, curated educational video tracks, an interactive coding & aptitude test question bank, an ATS resume parser, peer microlearning video reels ("SkillBits"), and commercial subscription billing via PhonePe.

The platform is designed as a **decoupled two-tier architecture**:
1. **Frontend:** Next.js 16 (React 19) App Router providing server-side session validation, dynamic responsive client interfaces, and direct Supabase database subscriptions.
2. **Backend:** FastAPI (Python 3.11+) acting as an authenticated API gateway, orchestrating high-concurrency LLM inference (Groq), document parsing (PyMuPDF), payment gateway webhooks (PhonePe), transactional emails (Resend), browser push notifications (VAPID/Web Push), and distributed caching (Upstash Redis).
3. **Database & Auth:** Supabase PostgreSQL with 29 production tables/views, Row Level Security (RLS), custom database triggers for role escalation protection, and JWT-based authentication.

---

## 1. Technology Stack

### 1.1 Frontend
* **Core Framework:** Next.js `16.2.12` (App Router) + React `19.2.4` + TypeScript `5.x` ([frontend/package.json:31-35](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L31-L35))
* **Styling & Motion:** Tailwind CSS `^4.0.0` ([frontend/package.json:48](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L48)), Framer Motion `^12.43.0` ([frontend/package.json:25](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L25)), GSAP `^3.15.0` with `@gsap/react` ([frontend/package.json:13,26](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L13-L26)), `tw-animate-css`
* **Data Fetching & State:** TanStack React Query `v5.101.4` ([frontend/package.json:21](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L21))
* **Authentication Client:** `@supabase/ssr` `^0.12.6` and `@supabase/supabase-js` `^2.111.0` ([frontend/package.json:19-20](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L19-L20))
* **Media & Graphics:** `@mux/mux-player-react` `^3.13.4`, `ogl` `^1.0.11` (WebGL), `canvas-confetti`, `jspdf`, `html2canvas-pro`
* **Testing:** Node.js test runner via `tsx` (`"test": "tsx --test \"tests/**/*.test.ts\""`) and Playwright `@playwright/test` `^1.63.0` ([frontend/package.json:10,40](file:///c:/STARTUP/SKILLSCATALYST/frontend/package.json#L10-L40))

### 1.2 Backend
* **Core Framework:** FastAPI `0.135.1` ([backend/requirements.txt:1](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L1))
* **ASGI / Production Servers:** Uvicorn `0.42.0`, Gunicorn `25.1.0` ([backend/requirements.txt:2,20](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L2-L20))
* **HTTP Client & Networking:** HTTPX `0.28.1` ([backend/requirements.txt:3](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L3))
* **Schema Validation & Settings:** Pydantic `2.12.5`, Pydantic Settings `2.14.2` ([backend/requirements.txt:4-5](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L4-L5))
* **Authentication & Cryptography:** PyJWT `2.13.0`, Passlib `1.7.4`, standard library `hmac`, `hashlib` ([backend/requirements.txt:18-19](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L18-L19))
* **Document Parsing Engine:** PyMuPDF `1.27.2` (`fitz`), pypdf `6.10.2`, python-docx `1.2.0`, docx2txt `0.9` ([backend/requirements.txt:14-17](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L14-L17))
* **Web Scraping & DOM Processing:** BeautifulSoup4 `4.14.3` ([backend/requirements.txt:13](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L13))
* **Caching & Queues:** Redis `5.0.0+` ([backend/requirements.txt:21](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L21))
* **Notification & Push Services:** PyWebPush `2.5.0+` (VAPID), Resend SDK `2.40.0+` ([backend/requirements.txt:23,26](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L23-L26))
* **Payment Gateway SDK:** PhonePe PG Python SDK `3.0.0` (`phonepe-pg-sdk-python`) ([backend/requirements.txt:24](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L24))
* **Load Testing:** Locust `2.30.0+` ([backend/requirements.txt:22](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L22))

### 1.3 Database & Storage Layer
* **Primary Database:** Supabase PostgreSQL (Managed cloud instance, project ref `zzjxprhapptjoziwdcro`)
* **Database Driver / API:** PostgREST HTTP/1.1 API instrumented via `ObservableHTTPTransport` ([backend/services/supabase_service.py:12-94](file:///c:/STARTUP/SKILLSCATALYST/backend/services/supabase_service.py#L12-L94)) and `@supabase/ssr` on frontend
* **Local Fallback Storage:** SQLite 3 WAL database (`data/welcome_email_events.db`) used as a resilient fallback for transactional email deduplication ([backend/services/welcome_email_store.py:24-56](file:///c:/STARTUP/SKILLSCATALYST/backend/services/welcome_email_store.py#L24-L56))
* **Static Datasets:** Local CSVs and JSONs in `data/` and `backend/data/` for company interview questions, curated YouTube learning tracks, and aptitude questions.

### 1.4 External Cloud Services & APIs
1. **Supabase Cloud:** Authentication, PostgreSQL, Row Level Security, Storage Buckets (for banners, resumes, certificate assets)
2. **Groq Cloud:** High-speed LLM inference (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`, `qwen/qwen3.6-27b`) with automatic fallback cascading ([backend/services/groq_service.py:214-222](file:///c:/STARTUP/SKILLSCATALYST/backend/services/groq_service.py#L214-L222))
3. **Upstash Redis:** Distributed cache, session tracking, sliding window rate limiter, and persistent AI quota reservations ([backend/services/cache_service.py:40-54](file:///c:/STARTUP/SKILLSCATALYST/backend/services/cache_service.py#L40-L54))
4. **PhonePe PG v2:** Server-to-server payments and redirect checkout for commercial subscription passes ([backend/services/phonepe_service.py:48-72](file:///c:/STARTUP/SKILLSCATALYST/backend/services/phonepe_service.py#L48-L72))
5. **Mux Video:** Video processing, transcoding, HLS streaming, and webhooks for SkillBits microlearning reels ([backend/services/mux_service.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/mux_service.py))
6. **YouTube Data API v3:** Fallback video playlist search and metadata fetching ([backend/services/youtube_service.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/youtube_service.py))
7. **Resend:** Transactional email delivery for onboarding welcome sequences and customer support escalation ([backend/services/email_service.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/email_service.py))
8. **Web Push Protocol (VAPID):** Direct browser push notification pipeline for daily learning streak reminders and new content announcements ([backend/services/web_push_service.py:98-106](file:///c:/STARTUP/SKILLSCATALYST/backend/services/web_push_service.py#L98-L106))

### 1.5 Hosting & Deployment Infrastructure
* **Container Specifications:** Dual Docker containers (`Dockerfile.backend`, `Dockerfile.frontend`) running under unprivileged user `UID 1001` (`appuser` / `nextjs`)
* **Primary Hosting Setup:**
  - Backend: Containerized on Railway (detected via `RAILWAY_ENVIRONMENT` check in [backend/config.py:19](file:///c:/STARTUP/SKILLSCATALYST/backend/config.py#L19) and [Procfile:1](file:///c:/STARTUP/SKILLSCATALYST/Procfile#L1))
  - Frontend: Next.js standalone output deployed to Vercel or Railway container
* **Alternative GCP Setup:** Automated deployment script [`deploy.sh`](file:///c:/STARTUP/SKILLSCATALYST/deploy.sh) configured for Google Cloud Run in `asia-south1` (Mumbai).

---

## 2. Architecture Map & System Interaction

```
                                    +-----------------------------------------+
                                    |               CLIENT BROWSER            |
                                    |   Next.js 16 (React 19) Single-Page App |
                                    +-----------------------------------------+
                                         |                                |
                        (1) SSR Session  |                                | (2) Direct Client Queries
                         & Page Requests |                                |     (Anon RLS-Gated)
                                         v                                v
                         +-------------------------------+  +-----------------------------+
                         |      NEXT.JS MIDDLEWARE       |  |     SUPABASE CLIENT (SDK)   |
                         | (lib/supabase/middleware.ts)  |  |   - Auth Sessions & Sign-in |
                         |   - SSR Cookie Session Sync   |  |   - Public Read Queries     |
                         |   - Route Protection & RBAC   |  |   - Real-time Subscriptions |
                         +-------------------------------+  +-----------------------------+
                                         |                                |
                                         | Rewrites & API calls           |
                                         v                                |
+-----------------------------------------------------------------------------------------+
|                               FASTAPI APPLICATION GATEWAY                               |
|                                     (backend/main.py)                                   |
|                                                                                         |
|  [Middleware Pipeline]                                                                  |
|   1. CORS Middleware (Domain allowlists + Vercel regex)                                  |
|   2. Production Hardening Middleware:                                                   |
|      - Generates X-Request-ID (ContextVar bound)                                        |
|      - Enforces Security Headers (COOP, CORP, HSTS, Permissions-Policy)                 |
|      - Issues signed HMAC Guest Session Tokens (X-Guest-Session-Token)                  |
|      - Telemetry recorder (latency, error metrics)                                      |
|                                                                                         |
|  [Centralized Handlers]                                                                 |
|   - HTTPException Handler (Standardized error envelope + request_id)                    |
|   - RequestValidationError Handler (Protects internal schema details)                   |
|   - Catch-all 500 Handler (Redacts stack traces and secrets)                            |
+-----------------------------------------------------------------------------------------+
       |                  |                  |                  |                  |
       v                  v                  v                  v                  v
+--------------+   +--------------+   +--------------+   +--------------+   +-------------+
| AUTH SERVICE |   | SUBSCRIPTION |   |  AI MENTOR   |   |   LEARNING   |   |   PAYMENT   |
| & RBAC CHECK |   | & ENTITLEMENT|   |   PIPELINE   |   |   SERVICES   |   |   SERVICE   |
+--------------+   +--------------+   +--------------+   +--------------+   +-------------+
       |                  |                  |                  |                  |
       +---------+--------+---------+--------+---------+--------+                  |
                 |                  |                  |                           |
                 v                  v                  v                           v
   +---------------------+  +----------------+  +--------------+          +----------------+
   |   SUPABASE POSTGRES |  |  UPSTASH REDIS |  | GROQ LLM API |          | PHONEPE PG v2  |
   | (ObservableHTTPTr.) |  | (Distributed   |  | (Fallback    |          | (Redirect      |
   | 29 Tables, RLS, RPC |  |  Cache, Quota, |  |  Cascade,    |          |  Checkout &    |
   | DB Triggers, Grants |  |  Rate Limiting)|  |  Semaphore)  |          |  S2S Webhook)  |
   +---------------------+  +----------------+  +--------------+          +----------------+
                 |
                 +-------------------+--------------------+
                 v                   v                    v
         +---------------+   +---------------+    +----------------+
         |  RESEND EMAIL |   | MUX VIDEO HLS |    | VAPID WEB PUSH |
         | (Welcome &    |   | (SkillBits    |    | (Browser Push  |
         |  Support)     |   |  Reels & Webh)|    |  Notifications)|
         +---------------+   +---------------+    +----------------+
```

---

## 3. Repository Structure & Module Responsibilities

```
c:/STARTUP/SKILLSCATALYST/
├── .agents/                        # Specialized agent customization rules and skills
├── .env.example                    # Reference environment configuration schema (58 variables)
├── Dockerfile                      # Root container build definition (Python 3.11-slim)
├── Dockerfile.backend              # Cloud Run backend container specification
├── Dockerfile.frontend             # Cloud Run multi-stage frontend container specification
├── Procfile                        # Railway process runner configuration
├── README.md                       # High-level product overview and development setup
├── deploy.sh                       # Shell automation script for Google Cloud Run deployment
├── nixpacks.toml                   # Nixpacks build/start instructions for Railway
├── pyrightconfig.json              # Python static type analysis settings
│
├── backend/                        # FastAPI Backend Application Root
│   ├── config.py                   # Centralized settings, env parsing, and fail-fast startup validator
│   ├── main.py                     # App factory, lifespan context, middlewares, router mounting
│   ├── requirements.txt            # Pinned Python package dependencies
│   ├── dependencies/               # Shared route dependencies
│   │   └── subscription.py         # Authoritative plan & feature entitlement dependency checks
│   ├── models/                     # Domain Pydantic schemas and DTOs
│   │   ├── certificate.py          # Certificate issuance and public verification schemas
│   │   ├── course.py               # LMS course, module, lesson, and quiz models (deactivated)
│   │   ├── course_media.py         # Media upload and storage models
│   │   ├── event.py                # Tech events and hackathons schema
│   │   ├── lesson_content.py       # Rich block editor schema (Text, Code, Quiz, Image)
│   │   ├── notification.py         # Push notification and subscription models
│   │   ├── payment.py              # Commercial order creation and transaction models
│   │   ├── quiz_attempt.py         # Quiz evaluation and scoring models
│   │   ├── scholarship.py          # Scholarship listing and eligibility models
│   │   ├── skillbits.py            # Microlearning video reels models
│   │   ├── subscription.py         # Commercial subscription plans and entitlement models
│   │   └── tech_news.py            # Curated tech news stories and sources models
│   ├── routers/                    # Modular API Endpoints
│   │   ├── admin.py                # Platform Owner CMS endpoints (Events, Scholarships, News, Users)
│   │   ├── admin_courses.py        # Admin LMS Course Management (disabled in main.py)
│   │   ├── ai_mentor.py            # Multi-turn conversational AI mentor & resume reviewer
│   │   ├── auth.py                 # Welcome emails, profile identity, and streak sync
│   │   ├── certificates.py         # Student certificate retrieval and public verification
│   │   ├── courses.py              # Student LMS courses reader (disabled in main.py)
│   │   ├── dashboard.py            # Personal Readiness Index (PRI), analytics, aggregated metrics
│   │   ├── events.py               # Student events and hackathons directory
│   │   ├── learning.py             # YouTube search, playlist CRUD, video resume progress, roadmaps
│   │   ├── notifications.py        # Web Push subscription registration, VAPID key delivery
│   │   ├── payments.py             # Commercial order creation, transaction status, history
│   │   ├── practice.py             # LeetCode company questions & Aptitude question bank
│   │   ├── profile.py              # Academic, coding handles, resume score, and profile sync
│   │   ├── resume.py               # File upload, magic-byte validation, and document text extraction
│   │   ├── scholarships.py         # Student scholarship opportunities directory
│   │   ├── skillbits.py            # Video reels discovery, feed pagination, Mux webhooks
│   │   ├── subscriptions.py        # Subscription catalog, current plan status, PhonePe webhook
│   │   ├── support.py              # Customer support ticket submission and founder dispatch
│   │   └── tech_news.py            # Tech news stories and source feeds
│   ├── scripts/                    # Maintenance, seeding, and database migration utilities
│   │   ├── compare_integrity.py    # Database schema drift detection script
│   │   ├── production_migration.sql# Cumulative production SQL migration script
│   │   ├── seed_question_bank.py   # Seeder for Quantitative Aptitude questions
│   │   ├── seed_all_logical_*.py   # Seeder for Logical Reasoning questions
│   │   ├── seed_all_verbal_*.py    # Seeder for Verbal Ability questions
│   │   ├── setup_owner.py          # CLI tool to bootstrap authoritative platform owner
│   │   └── sync_certificate_scores.py # Score sync utility across certificates
│   └── services/                   # Decoupled business logic layer
│       ├── ai_mentor/              # Subpackage: Context aggregator, memory, prompt builder
│       ├── ai_mentor_quota_service.py # Persistent Redis/DB AI quota reservation engine
│       ├── auth_service.py         # Cryptographic JWT validation, guest session HMAC, RBAC
│       ├── cache_service.py        # Pooled Upstash Redis client with in-memory fallback
│       ├── certificate_service.py  # Tamper-proof certificate generator & verification service
│       ├── course_media_service.py # Media storage and CDN management for LMS
│       ├── course_service.py       # Course lifecycle management (deactivated)
│       ├── email_service.py        # Resend transactional email client
│       ├── event_service.py        # Hackathons and technical events service
│       ├── groq_service.py         # Bounded concurrency Groq client with model fallback chain
│       ├── learning/               # Subpackage: Content guards, search ranking, progress, playlists
│       ├── mux_service.py          # Mux direct upload URL generator and asset polling
│       ├── notification_service.py # Web push dispatcher with stale token eviction
│       ├── observability.py        # In-memory Prometheus-like telemetry and metrics recorder
│       ├── payment_service.py      # PhonePe order lifecycle, transaction state machine, webhooks
│       ├── phonepe_service.py      # Low-level PhonePe PG v2 SDK client wrapper
│       ├── quiz_attempt_service.py # Quiz evaluation, answer hiding, and attempt recording
│       ├── rate_limiter.py         # Distributed Redis sliding-window & thread-safe local rate limiter
│       ├── resume_extractor.py     # Document parser engine (PyMuPDF, docx, txt)
│       ├── scholarship_service.py  # Scholarship database operations
│       ├── skillbits_service.py    # Microlearning feed, video metadata, and progress service
│       ├── subscription_service.py # Commercial subscription state, validity, and entitlement checks
│       ├── supabase_service.py     # Singleton Supabase client with ObservableHTTPTransport
│       ├── tech_news_service.py    # Tech news aggregation and story publishing service
│       ├── web_push_service.py     # VAPID payload encryption and pywebpush dispatch
│       ├── welcome_email_store.py  # Durable SQLite/PostgreSQL welcome email idempotency store
│       └── youtube_service.py      # YouTube Data API v3 playlist search and item extractor
│
├── frontend/                       # Next.js 16 Application Root
│   ├── package.json                # Frontend dependencies, scripts, and dev packages
│   ├── middleware.ts               # Root Next.js middleware delegator
│   ├── next.config.ts              # Next.js build config, redirects (courses -> roadmaps), image domains
│   ├── app/                        # Next.js App Router Routes
│   │   ├── admin/                  # Platform Owner CMS management portal
│   │   ├── ai-mentor/              # Interactive AI Mentor chat interface
│   │   ├── analytics/              # Student progress analytics & Personal Readiness Index (PRI)
│   │   ├── auth/callback/          # Supabase OAuth redirect & callback handler
│   │   ├── career/                 # Career goals & Resume builder (115KB client studio)
│   │   ├── certificate-preview/    # Dynamic client preview of earned certificates
│   │   ├── certificates/           # Student certificates dashboard
│   │   ├── dashboard/              # Primary student learning dashboard & activity feed
│   │   ├── explore/                # Platform features exploration hub
│   │   ├── learning/               # YouTube playlist player, interactive curriculum, video notes
│   │   ├── login/                  # Authentication portal (Email/Password, Google OAuth, 3D character)
│   │   ├── practice/               # Placement prep portal (Quantitative, Logical, Verbal, LeetCode)
│   │   ├── pricing/                # Commercial plans catalog, benefit matrices, FAQ, checkout CTA
│   │   ├── profile/                # Unified student profile editor (Academic, Coding Handles, Target Roles)
│   │   ├── roadmaps/               # 5-tier AI skill learning roadmaps viewer
│   │   ├── scholarships/           # Student scholarships directory & deadline tracker
│   │   ├── settings/               # Account security, session management, notification toggles
│   │   ├── skillbits/              # TikTok/Reels-style vertical microlearning video player
│   │   ├── support/                # Customer grievance desk & ticket submission form
│   │   ├── tech-news/              # Tech news feed with article read status
│   │   └── verify/                 # Public certificate verification search portal
│   ├── components/                 # 36 top-level UI components and 15 sub-component directories
│   ├── contexts/                   # React Contexts (NotificationContext, PricingModalContext)
│   ├── hooks/                      # Custom hooks (useSubscription, useVideoProgress, useYouTubePlayer)
│   ├── lib/                        # Client libraries & utilities
│   │   ├── api/                    # Typed API client modules matching backend endpoints (19 modules)
│   │   ├── auth.tsx                # AuthContext provider, session sync, mode switching
│   │   ├── supabase/               # Supabase browser client, server client, and SSR middleware
│   │   └── pushNotifications.ts    # Service worker registration and VAPID subscription manager
│   └── tests/                      # 26 unit & integration test suites + Playwright E2E specs
│
├── data/                           # Local Data & Assets
│   ├── certifications/             # CSV files for Top 10 Certifications (C, C++, Java, Python)
│   ├── leetcode-companywise-.../   # 660+ company folders containing interview question CSVs
│   ├── welcome_email_events.db     # SQLite 3 WAL database for fallback welcome email events
│   └── youtube data/               # Curated CSV files for learning playlists
│
├── docs/                           # System Architecture & Runbooks
│   ├── UNIFIED_AUTH_AND_OWNER_SYSTEM.md # Authoritative Auth, RBAC, and Owner bootstrap specification
│   ├── production-runbook.md       # Operational runbook for production triage and degradation
│   ├── question-bank-database-...md# Relational database schema specification for Placement Question Bank
│   └── phase-3.3-report.md         # Production audit and security report
│
├── supabase/                       # Supabase PostgreSQL Database Specifications
│   ├── PRODUCTION_SCHEMA_AUDIT.md  # Detailed live schema audit (29 tables, types, RLS status)
│   ├── migrations/                 # 31 SQL migration scripts (Sept–Oct 2026)
│   └── production/                 # Hardening SQL scripts
│
└── tests/                          # Backend Test Suite (78 test files)
    ├── conftest.py                 # Shared pytest fixtures, Redis cache isolators
    ├── benchmark_ai_load.py        # Concurrency & latency benchmarks for Groq AI
    ├── locustfile.py               # Distributed load testing scenarios
    └── test_*.py                   # 75 unit, integration, and security test files
```

---

## 4. Core Workflows Traced End-to-End

### 4.1 User Authentication, Role Resolution & Welcome Email
1. **User Action:** The student navigates to `/login` ([frontend/app/login/page.tsx](file:///c:/STARTUP/SKILLSCATALYST/frontend/app/login/page.tsx)) and signs in via Google OAuth or Email/Password.
2. **Supabase Auth Exchange:** Supabase Auth authenticates the user, issuing an access token (JWT) containing `sub` (UUID) and `app_metadata.role`.
3. **SSR Middleware Interception:** Next.js middleware ([frontend/lib/supabase/middleware.ts:41-43](file:///c:/STARTUP/SKILLSCATALYST/frontend/lib/supabase/middleware.ts#L41-L43)) captures the session cookies via `@supabase/ssr` `createServerClient`. If accessing `/admin`, it strictly verifies `user.app_metadata.role === 'owner'`. If unauthorized, it redirects to `/dashboard` without destroying the session.
4. **Client Auth Context:** `frontend/lib/auth.tsx:55-89` intercepts the session. If this is an initial signup session, it dispatches `sendWelcomeEmail` to `POST /api/auth/welcome-email`.
5. **Backend Welcome Email Deduplication:** In [backend/services/welcome_email_store.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/welcome_email_store.py), the backend attempts to record the event in `welcome_email_events` with `UNIQUE(user_id)`. If Supabase is momentarily unreachable, it falls back to local SQLite (`welcome_email_events.db`).
6. **Delivery:** The email is rendered and sent via Resend API ([backend/services/email_service.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/email_service.py)).

### 4.2 AI Mentor Multi-Turn Chat & Quota Enforcement
1. **User Action:** The student inputs a career/coding question into the AI Mentor interface at `/ai-mentor`.
2. **Frontend Request:** The frontend calls `apiFetch(`${API_BASE}/api/ai-mentor/chat`)` with `Authorization: Bearer <JWT>`.
3. **Backend Middleware & Rate Limiting:**
   - `production_hardening_middleware` assigns an `X-Request-ID` ([backend/main.py:169-172](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L169-L172)).
   - `enforce_rate_limit(RATE_LIMIT_AI_RPM)` checks sliding window usage in Redis ([backend/services/rate_limiter.py:82-100](file:///c:/STARTUP/SKILLSCATALYST/backend/services/rate_limiter.py#L82-L100)).
4. **Subscription Entitlement Check:** `require_entitlement("ai_mentor")` resolves the user's plan. If on the `free` plan and numeric limit is active, `reserve_ai_mentor_slot()` performs an atomic quota reservation ([backend/routers/ai_mentor.py:350-372](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py#L350-L372)).
5. **Off-Topic Guardrail:** Regex patterns inspect prompt text ([backend/routers/ai_mentor.py:62-100](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py#L62-L100)). Non-skill/entertainment queries immediately return a polite redirect without consuming AI quota or calling Groq.
6. **Context Aggregator & Concurrency Gating:**
   - Background student profile data (academic branch, target role, LeetCode rank, active roadmap) is aggregated via `build_student_mentor_context()` ([backend/services/ai_mentor/context_aggregator.py](file:///c:/STARTUP/SKILLSCATALYST/backend/services/ai_mentor/context_aggregator.py)).
   - `acquire_ai_slot()` gates execution against `MAX_CONCURRENT_AI_REQUESTS = 6` semaphore to prevent threadpool exhaustion ([backend/services/groq_service.py:72-98](file:///c:/STARTUP/SKILLSCATALYST/backend/services/groq_service.py#L72-L98)).
7. **Groq Model Fallback Chain:** The prompt executes within `run_bounded_ai_call()` with a 25.0s hard ceiling. If the primary model fails or times out, it cascades through candidate models:
   `llama-3.3-70b-versatile` &rarr; `openai/gpt-oss-120b` &rarr; `llama-3.1-8b-instant` &rarr; `qwen/qwen3.6-27b` ([backend/services/groq_service.py:214-222](file:///c:/STARTUP/SKILLSCATALYST/backend/services/groq_service.py#L214-L222)).
8. **Persistence:** The user message and AI response are persisted to `ai_mentor_messages` in Supabase, and quota commit is executed.

### 4.3 Learning Video Search, Playback & Automated Progress Verification
1. **Search Request:** User searches for a skill at `/learning` (e.g. "React in Telugu").
2. **Search Service Execution:** `GET /api/learning/search` invokes `search_learning_content()`:
   - Evaluates content guard against inappropriate or non-skill queries.
   - Searches local curated CSV datasets first (`data/youtube data/`).
   - If not found or insufficient, falls back to YouTube Data API v3.
   - Ranks results using channel reputation, title relevance, and language match score ([backend/services/learning/search_service.py:50-72](file:///c:/STARTUP/SKILLSCATALYST/backend/services/learning/search_service.py#L50-L72)).
3. **Playback Resume Position:** Every 10 seconds of playback, `useVideoProgress.ts` on the frontend sends `POST /api/learning/save-progress` ([backend/routers/learning.py:214-225](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/learning.py#L214-L225)), updating the playback head position in `video_progress` without marking as watched.
4. **Auto-Completion Trigger:** When the player reaches &ge;75% watched duration, it fires `POST /api/learning/complete-video`. The backend validates the watch percentage, updates `video_progress.watched = true`, increments experience points (XP), and updates the daily learning streak in `user_progress`.

### 4.4 Placement & Aptitude Question Bank Attempt Validation
1. **Question Catalog Retrieval:** Student browses topics at `/practice` (e.g., "Percentages" or "Blood Relations").
2. **Entitlement Verification:** `require_entitlement("placement_prep")` verifies caller has active access ([backend/routers/practice.py:192-196](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/practice.py#L192-L196)).
3. **Client Submits Answer:** Student answers a question and the frontend posts `POST /api/practice/aptitude/attempt`.
4. **Server-Side Evaluation & Tamper Prevention:**
   - The client payload passes `question_id`, `topic_id`, and `selected_option_index`.
   - The backend **ignores** any client-supplied `is_correct` boolean.
   - The backend queries `aptitude_questions` for `correct_index` ([backend/routers/practice.py:257-280](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/practice.py#L257-L280)).
   - Evaluates `is_correct = (selected_option_index == correct_index)` entirely on the server.
   - Persists the verified attempt to `user_aptitude_attempts` bound to the authenticated JWT `user_id`.

### 4.5 Commercial Payments & Subscription Lifecycle (PhonePe PG)
1. **Order Initiation:** User selects a plan on `/pricing` (e.g. `premium_monthly` for ₹99).
2. **Checkout Request:** Frontend calls `createPaymentOrder("premium_monthly")` &rarr; `POST /api/payments/create-order` ([backend/routers/payments.py:25-40](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/payments.py#L25-L40)).
3. **Canonical Price Derivation:** `PaymentService.create_order()` queries `subscription_plans` from database to derive canonical price in Indian paise (e.g., 9900 paise = ₹99.00). Client-supplied prices are strictly ignored.
4. **PhonePe Standard Checkout:** Backend initializes `StandardCheckoutClient` ([backend/services/phonepe_service.py:48-72](file:///c:/STARTUP/SKILLSCATALYST/backend/services/phonepe_service.py#L48-L72)) and requests an order redirect URL.
5. **Pending Transaction Created:** A record is inserted into `payment_transactions` with status `pending`.
6. **User Checkout:** Browser redirects to PhonePe payment gateway.
7. **S2S Webhook Handling:**
   - On payment completion, PhonePe sends a signed Server-to-Server callback to `POST /api/subscriptions/webhook/phonepe` ([backend/routers/subscriptions.py:56-74](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/subscriptions.py#L56-L74)).
   - `PaymentService.process_webhook()` verifies the SHA authorization or HMAC signature.
   - Enforces idempotency: verifies transaction is not already marked `success`.
   - On verified success, inserts/updates `subscriptions` table setting `status = 'active'`, `started_at = now()`, `expires_at = now() + interval '30 days'`.
   - Invalidates cached user entitlement key in Redis (`user:subscription:<user_id>`).
   - Browser returns to `/dashboard?payment=complete` where `useSubscription()` refetches new entitlements.

---

## 5. Existing Implementation Analysis

### 5.1 Authentication & Role Authorization
* **Unified Auth Design:** Exactly one authentication flow managed via Supabase Auth ([docs/UNIFIED_AUTH_AND_OWNER_SYSTEM.md](file:///c:/STARTUP/SKILLSCATALYST/docs/UNIFIED_AUTH_AND_OWNER_SYSTEM.md)).
* **Authoritative Role Claim:** Derived from Supabase Auth JWT `app_metadata.role` rather than client local storage or simple database column edits.
* **Roles Recognized:** `owner`, `student` (plus schema support for `admin`, `editor`, `moderator`).
* **Privilege Escalation Protection:** PostgreSQL database trigger `prevent_profile_role_escalation` on `public.profiles` prevents non-service-role callers from updating their own `role` column ([supabase/migrations/20260920_add_user_roles_and_owner.sql](file:///c:/STARTUP/SKILLSCATALYST/supabase/migrations/20260920_add_user_roles_and_owner.sql)).
* **Owner Designation:** Server-side CLI bootstrap script [`backend/scripts/setup_owner.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/scripts/setup_owner.py) used to promote primary owner (`palamooradithyagoud@gmail.com`).

### 5.2 Pricing & Commercial Plans
* **Plan Codes & Canonical Pricing:**
  - `free`: ₹0 / lifetime duration
  - `premium_monthly`: ₹99 (9,900 paise) / 30-day duration
  - `premium_3_month`: ₹250 (25,000 paise) / 90-day duration (~16% discount)
  ([backend/models/subscription.py:117-148](file:///c:/STARTUP/SKILLSCATALYST/backend/models/subscription.py#L117-L148))
* **Database Catalog:** Stored in `subscription_plans` table and queried dynamically with hardcoded fallback defaults if DB is temporarily unreachable.

### 5.3 Feature Access & Entitlement Enforcement
* **7 Governed Features:** Defined in `FeatureKey` enum ([backend/models/subscription.py:31-39](file:///c:/STARTUP/SKILLSCATALYST/backend/models/subscription.py#L31-L39)):
  1. `saved_videos`: Free limit = 1, Premium = Unlimited
  2. `company_interview_questions`: Free = None (Locked), Premium = Full access (660+ companies)
  3. `placement_prep`: Free = None (Locked), Premium = Full access (44 topics, 910+ questions)
  4. `scholarships`: Free = Limited preview, Premium = Full access
  5. `tech_news`: Free limit = 2 articles, Premium = Unlimited
  6. `ai_mentor`: Free = Limited preview queries, Premium = Full conversational access
  7. `roadmaps`: Free = Limited preview, Premium = Full 5-tier roadmap generation
* **Enforcement Layer:** FastAPI route dependency `require_entitlement(feature_key)` in [backend/dependencies/subscription.py:60-84](file:///c:/STARTUP/SKILLSCATALYST/backend/dependencies/subscription.py#L60-L84). Frontend hook `useSubscription()` provides presentation badges, but the backend is the authoritative enforcement point.

### 5.4 Admin Functionality & Content Management
* **Route Prefix:** `/api/admin/*` mounted in [backend/main.py:317](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L317).
* **Security Dependency:** All endpoints strictly require `Depends(require_owner)` or `Depends(require_admin)` ([backend/routers/admin.py:109,179](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/admin.py#L109-L179)).
* **Supported Operations:**
  - Platform overview telemetry (`/api/admin/overview`)
  - User directory & role assignment (`/api/admin/users`, `/api/admin/assign-role`)
  - Tech Events & Hackathons CMS: Create, publish, archive, delete, banner upload
  - Scholarships CMS: Create, publish, archive, delete, logo upload
  - Tech News CMS: Source management, article creation, publish, cover upload
  - SkillBits Video CMS: Direct upload requests to Mux, video status synchronization

### 5.5 Deactivated / Commented Modules (Custom Courses LMS)
* **Evidence:** In [backend/main.py:325-326](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L325-L326):
  ```python
  # app.include_router(courses.router)        # Student courses disabled
  # app.include_router(admin_courses.router)  # Admin courses disabled
  ```
* **Frontend Alignment:** In [frontend/next.config.ts:31-41](file:///c:/STARTUP/SKILLSCATALYST/frontend/next.config.ts#L31-L41), Next.js redirects all `/courses` and `/courses/*` traffic directly to `/roadmaps`.
* **State Assessment:** The custom LMS course creator/player codebase exists in `backend/routers/courses.py`, `backend/routers/admin_courses.py`, `backend/services/course_service.py`, and `frontend/tests/courses-admin.test.ts`, but has been superseded by the YouTube-backed Roadmaps & SkillBits architectures.

---

## 6. Risks, Unknowns, and Architecture Findings

| Category | Finding / Observation | Evidence / Reference | Impact & Architectural Severity | Fact vs. Assumption |
| :--- | :--- | :--- | :--- | :--- |
| **Dependencies** | `google-generativeai==0.8.6` is pinned in `requirements.txt` and mentioned in `README.md`, but is never imported or called in backend code. | [backend/requirements.txt:10](file:///c:/STARTUP/SKILLSCATALYST/backend/requirements.txt#L10) | Low: Unused dependency increases Docker image build weight (~100MB) without providing utility. | **Verified Fact** |
| **Dead Code / Feature Drift** | LMS Course routers are fully implemented (over 50KB code) but commented out in `backend/main.py` and redirected in `next.config.ts`. | [backend/main.py:325-326](file:///c:/STARTUP/SKILLSCATALYST/backend/main.py#L325-L326), [frontend/next.config.ts:29-42](file:///c:/STARTUP/SKILLSCATALYST/frontend/next.config.ts#L29-L42) | Medium: Confusing architectural footprint; maintenance overhead for unmaintained routes and tests. | **Verified Fact** |
| **Database Resiliency** | Welcome email idempotency uses a local SQLite database (`data/welcome_email_events.db`) as a fallback when Supabase PostgREST cache lags. In multi-container/serverless environments (Cloud Run/Railway), local disk is ephemeral. | [backend/services/welcome_email_store.py:24-56](file:///c:/STARTUP/SKILLSCATALYST/backend/services/welcome_email_store.py#L24-L56) | High (if scaled horizontally): Ephemeral container restarts or multiple instances will not share local SQLite state, potentially permitting duplicate welcome emails if Supabase is down. | **Verified Fact** |
| **External API Rate Limits** | Public competitive programming statistics (LeetCode, Codeforces, CodeChef, GFG) are scraped on demand during profile updates. | [backend/routers/profile.py:71-385](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/profile.py#L71-L385) | Medium: High traffic or aggressive user updates can lead to IP blocks or Cloudflare challenge failures from target coding sites. | **Verified Fact** |
| **Secrets & Configuration** | Startup config enforces fail-fast checking only when `ENVIRONMENT=production`. In development, an insecure fallback key is logged as a warning. | [backend/config.py:23-34, 120-129](file:///c:/STARTUP/SKILLSCATALYST/backend/config.py#L23-L34) | Low/Standard: Standard dev convenience; securely prevented from leaking into production by hard assertions in `validate_startup_config()`. | **Verified Fact** |
| **Database Migrations** | 31 migration files exist in `supabase/migrations/`, but migrations are executed via raw SQL scripts or setup tools rather than a formal tool like Alembic or Supabase CLI CI/CD pipelines. | [supabase/migrations/](file:///c:/STARTUP/SKILLSCATALYST/supabase/migrations/) | Medium: Risk of environment drift between local development and live Supabase projects if migrations are applied manually. | **Verified Fact** |
| **LLM Inference Ceiling** | Groq AI requests are bounded by a 25.0s hard ceiling across the fallback chain and a 6-worker concurrency semaphore. | [backend/services/groq_service.py:22-35](file:///c:/STARTUP/SKILLSCATALYST/backend/services/groq_service.py#L22-L35) | Well-Engineered: Prevents reverse-proxy 504 timeouts, threadpool starvation, and uncontrolled API cost spikes. | **Verified Fact** |
| **Client Code Monolith** | `career/resume-builder/page.tsx` is 115 KB and `PlacementPrepModal.tsx` is 110 KB in single files. | [frontend/app/career/resume-builder/page.tsx](file:///c:/STARTUP/SKILLSCATALYST/frontend/app/career/resume-builder/page.tsx), [frontend/components/PlacementPrepModal.tsx](file:///c:/STARTUP/SKILLSCATALYST/frontend/components/PlacementPrepModal.tsx) | Medium: Maintainability risk; potential client bundle bloat and harder unit test decomposition. | **Verified Fact** |

---

## 7. Prioritized Next Audit & Investigation Steps

Based on empirical findings from this read-only inspection, the following sequential investigation steps are recommended:

### Priority 1 (High): Migration Management & Multi-Instance State
1. **Audit Supabase Migration Execution State:** Verify whether all 31 migration scripts in `supabase/migrations/` match the remote live schema, particularly recent changes (October 2026 question bank hardening and user profile RPCs).
2. **Review SQLite Fallback in Container Orchestration:** Determine if `welcome_email_events.db` should be replaced with Redis keys or Supabase directly to ensure multi-instance safety on Railway/Cloud Run.

### Priority 2 (Medium): Codebase Cleanliness & Dead Code Elimination
1. **Assess Formal Deprecation of Custom LMS Courses:**
   - Since `/courses` is commented out in `main.py` and redirected in `next.config.ts`, verify with product stakeholders if `backend/routers/courses.py`, `backend/routers/admin_courses.py`, and related models can be formally deprecated or archived to reduce cognitive load.
2. **Remove Unused `google-generativeai` Dependency:**
   - Remove `google-generativeai` from `backend/requirements.txt` to save Docker build time and image size, or wire it into `backend/services/groq_service.py` as a secondary LLM provider fallback.

### Priority 3 (Medium): Large Client Component Decomposition
1. **Refactor Monolithic Frontend Modules:**
   - Decompose `frontend/app/career/resume-builder/page.tsx` (115KB) into modular subcomponents (e.g. `ResumeHeaderEditor`, `ResumeExperienceEditor`, `ResumeSkillsEditor`).
   - Decompose `frontend/components/PlacementPrepModal.tsx` (110KB) into separate question presentation and timer components.

### Priority 4 (Low): Scraper Resilience & Caching
1. **Profile Scraper Circuit Breaking:**
   - Add explicit response caching in Redis for scraped coding profile stats (LeetCode, CodeChef, Codeforces) with a minimum 6-hour TTL to prevent third-party rate limits during repeated user profile visits.

---

## 8. Audit Confirmation & Environment Integrity

**Read-Only Audit Guarantee:**
- No production database records were altered, created, or deleted.
- No database migrations, SQL modifications, or schema altering commands were executed.
- No packages or dependencies were installed, updated, or removed.
- No environment files (`.env`, `frontend/.env.local`) or secrets were exposed or altered.
- All application source files remain completely untouched and unmodified.
- This report has been written exclusively to the designated audit documentation directory as requested.
