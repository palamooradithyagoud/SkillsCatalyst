# 🚀 SkillsCatalyst

> **Next-Generation AI Career Acceleration & Personalized Learning Ecosystem**
> Empowering students, job seekers, and engineers with real-time AI mentoring, intelligent skill roadmaps, ATS resume optimization, placement aptitude mastery, microlearning feeds, and verifiable credentials.

---

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20(Turbopack)-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/UI-React%2019-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama--3.3-F05A28?style=flat)](https://groq.com)
[![Redis](https://img.shields.io/badge/Cache-Upstash%20Redis-FF4438?style=flat&logo=redis&logoColor=white)](https://upstash.com)
[![PhonePe](https://img.shields.io/badge/Payments-PhonePe%20PG-5f259f?style=flat)](https://phonepe.com)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#-license)

---

## 📌 Table of Contents

- [🌟 Platform Overview](#-platform-overview)
- [🔥 Comprehensive Feature Suite](#-comprehensive-feature-suite)
  - [1. 🤖 AI Career Mentor & Copilot](#1--ai-career-mentor--copilot)
  - [2. 🗺️ Personalized AI Learning Roadmaps](#2-️-personalized-ai-learning-roadmaps)
  - [3. 📺 Video Courses & Interactive Learning](#3--video-courses--interactive-learning)
  - [4. ⚡ SkillBits — Microlearning Feed](#4--skillbits--microlearning-feed)
  - [5. 📄 ATS Resume Parser & Analyzer](#5--ats-resume-parser--analyzer)
  - [6. 💻 Placement & Aptitude Question Bank](#6--placement--aptitude-question-bank)
  - [7. 🔗 External Coding Profile Integration](#7--external-coding-profile-integration)
  - [8. 📜 Verifiable Certificates & Digital Credentials](#8--verifiable-certificates--digital-credentials)
  - [9. 📊 Analytics & Personal Readiness Index (PRI)](#9--analytics--personal-readiness-index-pri)
  - [10. 🎯 Daily Task & Habit Management](#10--daily-task--habit-management)
  - [11. 🧠 Student Mood & Wellness Tracker](#11--student-mood--wellness-tracker)
  - [12. 🎓 Scholarships & Opportunities Directory](#12--scholarships--opportunities-directory)
  - [13. 📰 Curated Real-Time Tech News](#13--curated-real-time-tech-news)
  - [14. 💳 Subscriptions, Pricing & PhonePe Payments](#14--subscriptions-pricing--phonepe-payments)
  - [15. 🔔 Web Push Notifications & Alerts](#15--web-push-notifications--alerts)
  - [16. 🛡️ Comprehensive Admin & Instructor Suite](#16-️-comprehensive-admin--instructor-suite)
- [🛠️ Tech Stack](#-tech-stack)
- [📂 Project Architecture](#-project-architecture)
- [🔑 Environment Variables Guide](#-environment-variables-guide)
- [⚡ Local Development Setup](#-local-development-setup)
- [🛰️ API Route Catalog](#-api-route-catalog)
- [🛡️ Observability, Security & Caching](#-observability-security--caching)
- [🚀 Deployment](#-deployment)
- [📄 License](#-license)

---

## 🌟 Platform Overview

**SkillsCatalyst** bridges the gap between academic education and industry readiness. It combines state-of-the-art Generative AI with automated skills assessment, comprehensive placement preparation, and verified micro-credentials.

Whether preparing for campus placements, upskilling in cutting-edge tech stacks, or seeking personalized career direction, SkillsCatalyst equips users with real-time feedback, customized curriculum pathways, and verifiable proof of their skills.

---

## 🔥 Comprehensive Feature Suite

### 1. 🤖 AI Career Mentor & Copilot
- **Real-Time Streaming AI**: Powered by Groq's high-throughput `llama-3.3-70b-versatile` inference engine with automatic NVIDIA NIM / Gemini fallbacks.
- **Dynamic Role Personas**: Tailor conversations between **Technical Mentor**, **Mock Interviewer**, **Career Coach**, and **Resume Evaluator**.
- **Context Injection**: Automatically leverages the user's target role, enrolled courses, current learning streaks, and uploaded resume data for hyper-personalized answers.
- **Smart Guardrails & Prompts**: Pre-configured career prompt library, domain guardrails preventing off-topic drift, and daily quota tracking based on subscription tiers.

### 2. 🗺️ Personalized AI Learning Roadmaps
- **Target Role Pathways**: Dynamic roadmap generation customized to roles such as *Full Stack Developer*, *AI/ML Engineer*, *DevOps Specialist*, *Data Analyst*, and *Cloud Architect*.
- **Visual Milestone Trees**: Interactive step-by-step progress graphs, milestone dependencies, completion checklists, and achievement badges.
- **Dynamic Skill Gap Matching**: Cross-examines student background and targets against live industry requirements to highlight priority areas.

### 3. 📺 Video Courses & Interactive Learning
- **Dual Video Infrastructure**: High-definition video streaming via **Mux Video** integration alongside curated **YouTube Data API v3** learning tracks.
- **Structured Curriculum**: Multi-module breakdowns containing video lectures, chapter marks, study notes, downloadable materials, and interactive transcripts.
- **Per-Module Checkpoint Quizzes**: Automated quiz verification to enforce retention before unlocking sequential learning nodes.

### 4. ⚡ SkillBits — Microlearning Feed
- **Short-Form Learning**: Byte-sized, swipeable cards delivering core concepts, code syntax snippets, and architectural fundamentals in under 60 seconds.
- **Instant Knowledge Checks**: Interactive inline polls and mini-quizzes embedded directly inside micro-lessons.
- **Personal Bookmarks & Feeds**: Categorized discovery feed by technology (Python, JavaScript, System Design, SQL, Docker, etc.) with personal bookmarking.

### 5. 📄 ATS Resume Parser & Analyzer
- **Multi-Format Ingestion**: High-precision text extraction from PDF, DOCX, TXT, and Markdown files using PyMuPDF (`fitz`) and `python-docx`.
- **Comprehensive ATS Scoring**: Granular scoring breakdowns evaluating keyword density, formatting hygiene, experience impact verbs, and education relevance.
- **Actionable Bullet Rewrites**: AI-suggested bullet rewrites tailored specifically to user's targeted job descriptions and requirements.

### 6. 💻 Placement & Aptitude Question Bank
- **910+ Vetted Questions**: Extensive placement question bank covering **44 high-frequency topics** across:
  - *Quantitative Aptitude* (Percentages, Profit & Loss, Time & Work, Permutations, Probability, etc.)
  - *Logical Reasoning* (Blood Relations, Coding-Decoding, Syllogisms, Seating Arrangements, etc.)
  - *Verbal Ability* (Reading Comprehension, Sentence Correction, Vocabulary, Para Jumbles, etc.)
- **Normalized Supabase Architecture**: Robust relational database modeling with secure server-side answer evaluation via PostgreSQL stored procedures.
- **Timed Practice & Mock Tests**: Realistic placement exam simulations with countdown timers, question bookmarks, solution explanations, and topic-wise mastery analytics.

### 7. 🔗 External Coding Profile Integration
- **Multi-Platform Statistics Aggregation**: Connects and pulls public profile metrics directly from:
  - **LeetCode**: Solved counts (Easy / Medium / Hard), global ranking, contest ratings.
  - **GitHub**: Repositories, public contributions, commit streaks, top languages.
  - **Codeforces**: Current rating, rank title, max rating, problem counts.
  - **CodeChef**: Stars, global rank, contest points.
  - **GeeksforGeeks**: Coding score, articles, solved count.
- **Unified Coding Identity**: Showcase verified competitive programming achievements directly on the student profile.

### 8. 📜 Verifiable Certificates & Digital Credentials
- **Automated Issuance**: Digital certificates generated upon completing roadmaps, courses, or placement milestones.
- **Public Verification Portal**: Unique verifiable URLs and cryptographic IDs at `/verify/[certificateId]` with embedded QR codes.
- **High-Resolution PDF Export**: Client-side vector-grade certificate rendering and download via `jspdf` and `html2canvas-pro`.

### 9. 📊 Analytics & Personal Readiness Index (PRI)
- **Personal Readiness Index (PRI)**: Dynamic composite score evaluating interview readiness based on aptitude performance, course completion, project activity, and coding handles.
- **GitHub-Style Activity Heatmaps**: Visual day-by-day learning streak tracker, study hours logging, and milestone achievements.
- **Categorical Skill Radar**: Interactive breakdowns contrasting current skill mastery with industry benchmarks.

### 10. 🎯 Daily Task & Habit Management
- **Personalized Study Planner**: Daily task checklists, milestone deadlines, and prioritization tags.
- **Streak Preservation**: Streak freeze items and daily check-ins to build consistent learning discipline.

### 11. 🧠 Student Mood & Wellness Tracker
- **Daily Mindset & Energy Check-ins**: Quick mood ratings (Productive, Focused, Neutral, Tired, Overwhelmed).
- **Burnout Prevention**: Smart suggestions and restorative reminders when high stress or prolonged study sessions are detected.

### 12. 🎓 Scholarships & Opportunities Directory
- **Curated Financial Aid**: Up-to-date repository of undergraduate, postgraduate, and engineering scholarships.
- **Smart Filtering**: Filter opportunities by eligibility criteria, deadlines, education level, gender criteria, and funding amounts.

### 13. 📰 Curated Real-Time Tech News
- **Live Tech Aggregation**: Automated industry updates spanning AI/ML, Cloud Computing, Cybersecurity, Startups, and Software Engineering.
- **AI Executive Summaries**: Concise 3-bullet executive takeaways generated for rapid daily scanning.

### 14. 💳 Subscriptions, Pricing & PhonePe Payments
- **Multi-Tier Plans**: Free, Pro Monthly, and Campus / Annual subscriptions with transparent feature gates.
- **PhonePe Payment Gateway Integration**: Native checkout flows supporting UPI, Net Banking, and Credit/Debit cards.
- **Automated Reconciliations**: Robust webhook signatures verification (`phonepe_service.py`), automated order status polling, and payment reconciliation cron tasks.
- **Coupons & Promotional Codes**: Admin-configured discount vouchers with usage limits, expiry controls, and instant checkout discounts.

### 15. 🔔 Web Push Notifications & Alerts
- **Production VAPID Web Push**: Native browser push notifications configured via `pywebpush` and browser service workers.
- **Smart Triggers**: Streak freeze alerts, practice reminders, course release notifications, and critical platform updates.

### 16. 🛡️ Comprehensive Admin & Instructor Suite
- **Instructor Course Studio**: Create and edit courses, upload videos to Mux, configure curriculum chapters, and attach quizzes.
- **Revenue & User Analytics**: Track real-time MRR, active subscribers, transaction histories, and user growth curves.
- **Platform Governance**: User role management (Student, Instructor, Admin, Owner), plan override permissions, coupon management, and ticket support system.

---

## 🛠️ Tech Stack

### **Frontend**
| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) with Turbopack |
| **Library** | React 19, TypeScript |
| **Styling & FX** | Tailwind CSS v4, Framer Motion, GSAP, `@gsap/react` |
| **State & Data Fetching** | TanStack React Query v5 |
| **Media & Video** | `@mux/mux-player-react` |
| **Document Generation** | `jspdf`, `html2canvas-pro`, `html-to-image` |
| **Icons & UI** | Lucide React, Radix UI Primitives, NumberFlow |
| **Authentication** | `@supabase/ssr`, `@supabase/supabase-js` |

### **Backend**
| Layer | Technologies |
| :--- | :--- |
| **Framework** | FastAPI 0.115+ (Python 3.11+) |
| **Server Engine** | Uvicorn (ASGI) / Gunicorn |
| **Database Client** | Supabase Python SDK, PostgreSQL client |
| **Caching & Messaging** | Upstash Redis (Connection pooling, fallback failover) |
| **AI Inference** | Groq Python SDK, Google Generative AI (Gemini), NVIDIA NIM |
| **Document Engines** | PyMuPDF (`fitz`), PyPDF, `python-docx` |
| **Payment Gateway** | PhonePe PG API SDK |
| **Transactional Email** | Resend Python API |
| **Push Notifications** | `pywebpush`, VAPID specifications |
| **Web Scraping** | BeautifulSoup4, `httpx` |

---

## 📂 Project Architecture

```
SKILLSCATALYST/
├── backend/
│   ├── main.py                     # FastAPI entry point, CORS, and lifespan config
│   ├── config.py                   # Central environment & validation logic
│   ├── requirements.txt            # Python dependencies
│   ├── database.py                 # Supabase client initialization
│   ├── routers/                    # Modular API router controllers
│   │   ├── admin.py                # Admin dashboard, stats, user governance
│   │   ├── admin_courses.py        # Course & module creation, Mux uploads
│   │   ├── ai_mentor.py            # AI Mentor chat, streaming, prompt injection
│   │   ├── auth.py                 # Auth session & user verification
│   │   ├── certificates.py         # Certificate issuing & verification
│   │   ├── courses.py              # Public courses, curriculum, module progress
│   │   ├── dashboard.py            # Dashboard metrics, PRI score, streak heatmaps
│   │   ├── events.py               # User activity event streams
│   │   ├── learning.py             # Roadmaps, YouTube curation, quiz logic
│   │   ├── moods.py                # Daily mood and wellness tracking
│   │   ├── notifications.py        # In-app notifications & Web Push management
│   │   ├── payments.py             # PhonePe checkout & webhook handlers
│   │   ├── practice.py             # Aptitude bank, topic practice & attempts
│   │   ├── profile.py              # User profiles & external coding stats sync
│   │   ├── resume.py               # ATS resume parser & analysis
│   │   ├── scholarships.py         # Scholarship listings & filters
│   │   ├── skillbits.py            # Bite-sized microlearning feed
│   │   ├── subscriptions.py        # User tier, plan upgrades, checkout
│   │   ├── support.py              # Support tickets & user inquiries
│   │   ├── tasks.py                # Daily task checklists & study goals
│   │   └── tech_news.py            # Curated tech news aggregation
│   └── services/                   # Business logic & 3rd-party services
│       ├── ai_mentor_quota_service.py # Tier-based daily question quotas
│       ├── auth_service.py         # JWT verification & role authorization
│       ├── cache_service.py        # Upstash Redis cache layer
│       ├── certificate_service.py  # Credential issuing and verification
│       ├── coupon_service.py       # Discount coupon lifecycle
│       ├── email_service.py        # Resend transactional emails
│       ├── groq_service.py         # Groq LLM inference service
│       ├── mux_service.py          # Mux video asset management
│       ├── notification_service.py # In-app alerts & push dispatch
│       ├── observability.py        # Telemetry & system metrics
│       ├── payment_service.py      # Transaction billing engine
│       ├── phonepe_service.py      # PhonePe gateway integration
│       ├── resume_extractor.py     # PDF/DOCX parsing engine
│       ├── scholarship_service.py  # Scholarship database service
│       ├── skillbits_service.py    # Microlearning feed service
│       ├── tech_news_service.py    # RSS & tech news aggregators
│       └── youtube_service.py      # YouTube Data API integrations
│
├── frontend/
│   ├── app/                        # Next.js 16 App Router
│   │   ├── admin/                  # Admin & Instructor Management Suite
│   │   ├── ai-mentor/              # Interactive AI Mentor Chat interface
│   │   ├── analytics/              # Skill Analytics & PRI Breakdown
│   │   ├── auth/                   # Authentication (Login, Signup, Callback)
│   │   ├── career/                 # Career Goal Setting & Skill Gap Analysis
│   │   ├── certificates/           # User Earned Certificates
│   │   ├── dashboard/              # Student Dashboard & Control Center
│   │   ├── explore/                # Course & Roadmap Discovery
│   │   ├── learning/               # Course Player & Lesson Modules
│   │   ├── practice/               # Placement Question Bank & Practice Tests
│   │   ├── pricing/                # Subscription Pricing & Plan Comparison
│   │   ├── profile/                # Profile, Resume & Coding Handle Sync
│   │   ├── resume-review/          # ATS Resume Scanner & Optimizer
│   │   ├── roadmaps/               # Career Skill Trees & Roadmaps
│   │   ├── scholarships/           # Scholarship Explorer
│   │   ├── settings/               # User Settings & Theme Preferences
│   │   ├── skillbits/              # Swipeable Microlearning Reels
│   │   ├── support/                # Help Desk & Ticket Support
│   │   ├── tasks/                  # Daily Study Tasks & Habits
│   │   ├── tech-news/              # Tech Industry News Feed
│   │   └── verify/                 # Public Certificate Verification Portal
│   ├── components/                 # Reusable UI & Layout Components
│   └── lib/                        # Supabase clients, API callers, utilities
│
├── docs/                           # Architectural guides & documentation
├── supabase/                       # Supabase database migrations & schemas
├── Dockerfile.backend              # Production container for FastAPI backend
├── Dockerfile.frontend             # Production container for Next.js frontend
├── deploy.sh                       # Google Cloud Run automated deployment script
└── .env.example                    # Reference environment configuration
```

---

## 🔑 Environment Variables Guide

### 1. Root `.env` (Backend & Shared Infrastructure)
Create a `.env` file in the project root:

```bash
# ── Supabase (Database, Auth, Storage) ──
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>

# ── Core Server & Security ──
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
SECRET_KEY=your-strong-production-secret-min-32-chars
PORT=8000
OWNER_EMAIL=admin@skillscatalyst.in

# ── AI Services ──
GROQ_API_KEY=gsk_...

# ── YouTube Data API v3 ──
YOUTUBE_API_KEY=AIzaSy...

# ── Redis Cache (Upstash) ──
REDIS_URL=rediss://default:...@upstash.io:6379

# ── Mux Video Pipeline (Courses & SkillBits) ──
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
MUX_WEBHOOK_SECRET=...

# ── PhonePe Payment Gateway ──
PHONEPE_ENV=SANDBOX
PHONEPE_CLIENT_ID=...
PHONEPE_CLIENT_SECRET=...
PHONEPE_CLIENT_VERSION=1
PHONEPE_WEBHOOK_USERNAME=...
PHONEPE_WEBHOOK_PASSWORD=...
PHONEPE_WEBHOOK_SECRET=...
PHONEPE_REDIRECT_URL=http://localhost:3000/dashboard?payment=complete

# ── Resend Email Service ──
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="SkillsCatalyst <welcome@skillscatalyst.in>"
RESEND_REPLY_TO=support@skillscatalyst.in

# ── Web Push Notifications (VAPID) ──
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:notifications@skillscatalyst.in
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Observability & Monitoring Probe ──
METRICS_SECRET_KEY=your-strong-monitoring-secret-min-32-chars
```

### 2. Frontend `.env.local`
Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-vapid-public-key>
```

---

## ⚡ Local Development Setup

### **Prerequisites**
- **Node.js**: v18.x or higher
- **npm** or **pnpm**
- **Python**: v3.11+
- **Supabase Account** with initialized PostgreSQL project

---

### **1. Backend Setup (FastAPI)**

1. Activate your Python virtual environment from the project root:
   ```bash
   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Launch the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

---

### **2. Frontend Setup (Next.js)**

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install frontend packages:
   ```bash
   npm install
   ```

3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛰️ API Route Catalog

The FastAPI backend exposes modular REST endpoints organized across specialized routers:

| Domain | Router File | Core Capabilities |
| :--- | :--- | :--- |
| **AI Mentor** | [`backend/routers/ai_mentor.py`](backend/routers/ai_mentor.py) | Real-time chat streaming, persona coaching, career prompt templates, quota enforcement |
| **Dashboard** | [`backend/routers/dashboard.py`](backend/routers/dashboard.py) | PRI computation, streak stats, activity heatmap, recent progress |
| **Practice** | [`backend/routers/practice.py`](backend/routers/practice.py) | Placement question bank (Quantitative, Logical, Verbal), test submissions, bookmarks |
| **Courses** | [`backend/routers/courses.py`](backend/routers/courses.py) | Course catalog, video lesson streams, chapter tracking, module quizzes |
| **Learning** | [`backend/routers/learning.py`](backend/routers/learning.py) | AI roadmaps, milestone progress, YouTube course integration |
| **SkillBits** | [`backend/routers/skillbits.py`](backend/routers/skillbits.py) | Swipeable bite-sized microlearning feed, interactive cards, polls |
| **Resume** | [`backend/routers/resume.py`](backend/routers/resume.py) | Multi-format file parsing (PDF/DOCX), text sanitization, ATS scoring |
| **Profile** | [`backend/routers/profile.py`](backend/routers/profile.py) | User settings, academic record, LeetCode / GitHub / Codeforces live stats sync |
| **Certificates** | [`backend/routers/certificates.py`](backend/routers/certificates.py) | Automated credential issuance, metadata generation, public verification |
| **Payments** | [`backend/routers/payments.py`](backend/routers/payments.py) | PhonePe PG checkout, payment callbacks, webhook signature validation |
| **Subscriptions** | [`backend/routers/subscriptions.py`](backend/routers/subscriptions.py) | User plan status, tier feature limits, billing history |
| **Tasks** | [`backend/routers/tasks.py`](backend/routers/tasks.py) | Daily study task checklists, priorities, streak preservation |
| **Moods** | [`backend/routers/moods.py`](backend/routers/moods.py) | Daily wellness check-in, burnout detection, energy level logging |
| **Scholarships** | [`backend/routers/scholarships.py`](backend/routers/scholarships.py) | Search, filter, and track scholarship opportunities and deadlines |
| **Tech News** | [`backend/routers/tech_news.py`](backend/routers/tech_news.py) | Real-time industry news feed with AI-generated summary bullet points |
| **Notifications** | [`backend/routers/notifications.py`](backend/routers/notifications.py) | In-app alerts, VAPID push subscriptions, notification read state |
| **Admin Overview** | [`backend/routers/admin.py`](backend/routers/admin.py) | Platform telemetry, revenue stats, user management, plan overrides |
| **Admin Courses** | [`backend/routers/admin_courses.py`](backend/routers/admin_courses.py) | Course builder, Mux direct video uploads, quiz authoring |
| **Support** | [`backend/routers/support.py`](backend/routers/support.py) | Student inquiries, support ticket management, feedback forms |
| **Events** | [`backend/routers/events.py`](backend/routers/events.py) | Telemetry and platform usage event streaming |
| **Auth** | [`backend/routers/auth.py`](backend/routers/auth.py) | Supabase session sync and authenticated user state verification |

---

## 🛡️ Observability, Security & Caching

- **Upstash Redis Caching**: Pooled connection cache for heavy database queries, leaderboards, and rate limiters with graceful fallback.
- **Event Loop Stall Monitoring**: Automated background watchdog measuring event loop lag (>250ms alerts) to prevent async bottlenecks.
- **Prometheus Observability (`/api/metrics`)**: Protected telemetry endpoint tracking uptime, Redis hit ratios, request throughput, and system health.
- **Supabase Row-Level Security (RLS)**: Fine-grained security policies on all tables ensuring students can only access authorized records.
- **HMAC Webhook Verification**: Cryptographic validation for PhonePe payment events and Mux video transcoding notifications.

---

## 🚀 Deployment

### **Automated Google Cloud Run Deployment**
A deployment automation script [`deploy.sh`](deploy.sh) is included:
```bash
bash deploy.sh
```

### **Docker Production Containers**
- **FastAPI Backend**:
  ```bash
  docker build -f Dockerfile.backend -t skillscatalyst-backend .
  docker run -p 8080:8080 --env-file .env skillscatalyst-backend
  ```

- **Next.js Frontend**:
  ```bash
  docker build -f Dockerfile.frontend -t skillscatalyst-frontend .
  docker run -p 3000:8080 skillscatalyst-frontend
  ```

---

## 📄 License

This project is proprietary and built as part of the **SkillsCatalyst** AI initiative. All rights reserved.
