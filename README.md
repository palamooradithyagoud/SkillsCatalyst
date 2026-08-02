# 🚀 SkillsCatalyst

> **AI-Powered Career & Learning Platform** — Accelerate your tech career with personalized AI roadmaps, intelligent mentoring, ATS resume analysis, and placement preparation.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
- [Deployment](#-deployment)
- [API Route Overview](#-api-route-overview)
- [License](#-license)

---

## 🌟 Overview

**SkillsCatalyst** is an all-in-one AI career development platform built to help students, job seekers, and developers gain market-relevant skills. By combining real-time AI guidance with structured learning roadmaps, interactive coding practice, and automated resume feedback, SkillsCatalyst bridges the gap between learning and employment.

---

## 🔥 Key Features

- 🗺️ **Personalized AI Learning Roadmaps**
  - AI-generated structured learning paths customized to individual target roles.
  - Granular module breakdowns with curated YouTube video integrations, documentation, and quizzes.
  - Real-time progress tracking and skill mastery badges.

- 🤖 **AI Mentor & Career Assistant**
  - Instant context-aware AI chat powered by high-speed LLM inference (Groq / Gemini).
  - Assistance with technical concepts, code debugging, and interview preparation.
  - Interactive prompt templates for targeted career guidance and off-topic guardrails.

- 📄 **ATS Resume Parser & Evaluator**
  - Upload PDF, DOCX, TXT, and MD resumes for instant plain-text extraction via PyMuPDF and `python-docx`.
  - Automatic extraction of technical skills, experience, and education.
  - Comprehensive ATS scoring with actionable recommendations for resume optimization.

- 💻 **Placement & Coding Practice**
  - Curated coding problems, aptitude tests, and interview readiness modules.
  - External platform sync with LeetCode, GitHub, Codeforces, CodeChef, and GeeksforGeeks.
  - Practice trackers to monitor performance and consistency over time.

- 📊 **Analytics & Personal Readiness Index (PRI)**
  - Visual metrics tracking current learning streaks, completed courses, and target skill completion.
  - Dynamic skill gap analysis comparing user profiles against target industry roles.

- 🔐 **Authentication & User Profiles**
  - Secure user management powered by Supabase Auth (JWT & RLS policies).
  - Academic and coding profile management with automated public profile scraping and live statistics extraction.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State & Data Fetching**: TanStack React Query v5
- **Icons**: Lucide React
- **Authentication**: `@supabase/supabase-js`

### **Backend**
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn / Gunicorn
- **AI Services**: Groq SDK (`llama-3`), Google Generative AI (Gemini)
- **Document Processing**: PyMuPDF (`fitz`), PyPDF, `python-docx`
- **Scraping & Data Utility**: BeautifulSoup4, `httpx`
- **Database & Auth Integration**: Supabase Python SDK, PyJWT, Passlib

### **Infrastructure & Deployment**
- **Containerization**: Docker (`Dockerfile.backend`, `Dockerfile.frontend`)
- **Cloud Infrastructure**: Google Cloud Run / Vercel
- **Configuration**: Nixpacks (`nixpacks.toml`), shell automation (`deploy.sh`)

---

## 📂 Project Architecture

```
SKILLSCATALYST/
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # API entry point & CORS configuration
│   ├── config.py             # Environment configuration & settings
│   ├── requirements.txt      # Python dependencies
│   ├── routers/              # Modular API Endpoints
│   │   ├── ai_mentor.py      # AI Mentor & LLM Chat logic
│   │   ├── dashboard.py      # Analytics & User Dashboard endpoints
│   │   ├── learning.py       # Roadmaps, Courses & Quiz management
│   │   ├── practice.py       # Placement & Coding practice endpoints
│   │   ├── profile.py        # Profile & Settings management
│   │   └── resume.py         # Resume upload, parsing & ATS scoring
│   └── services/             # Core Backend Services
│       ├── auth_service.py   # JWT verification & auth dependencies
│       ├── groq_service.py   # Groq LLM integration
│       ├── resume_extractor.py # Document parsing engine
│       ├── supabase_service.py # Supabase client wrapper
│       └── youtube_service.py # YouTube Data API integration
├── frontend/                 # Next.js 16 App Router Frontend
│   ├── app/                  # Application Routes
│   │   ├── ai-mentor/        # AI Mentor interface
│   │   ├── analytics/        # Progress analytics page
│   │   ├── career/           # Career goal setting & target roles
│   │   ├── dashboard/        # Main User Dashboard
│   │   ├── learning/         # Interactive learning viewer
│   │   ├── practice/         # Placement prep portal
│   │   └── settings/         # User settings
│   ├── components/           # Reusable UI Components
│   ├── lib/                  # API clients & utility functions
│   └── package.json          # Frontend dependencies & scripts
├── data/                     # Local data stores & static reference JSONs
├── deploy.sh                 # Google Cloud Run deployment script
├── Dockerfile.backend        # Dockerfile for FastAPI Backend
├── Dockerfile.frontend       # Dockerfile for Next.js Frontend
└── .env                      # Environment variables configuration
```

---

## 🔑 Environment Variables

Configure the following environment variables in a `.env` file at the root directory:

```env
# ── Supabase Configuration ───────────────────────────────────────────────────
SUPABASE_URL=https://<your-supabase-id>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>

# ── AI APIs ──────────────────────────────────────────────────────────────────
GROQ_API_KEY=<your-groq-api-key>

# ── YouTube Data API v3 ───────────────────────────────────────────────────────
YOUTUBE_API_KEY=<your-google-youtube-api-key>

# ── Backend & Security Settings ───────────────────────────────────────────────
SECRET_KEY=<your-app-secret-key>
PORT=8000
FRONTEND_URL=http://localhost:3000
```

And in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## ⚡ Local Development Setup

### **Prerequisites**
- **Node.js**: v18.x or higher
- **npm** or **pnpm**
- **Python**: v3.11 or higher
- **Supabase Account** with active project

---

### **1. Backend Setup (FastAPI)**

1. Navigate to the root directory:
   ```bash
   cd c:/STARTUP/SKILLSCATALYST
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000` (Swagger API docs at `http://localhost:8000/docs`).

---

### **2. Frontend Setup (Next.js)**

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

### **Google Cloud Run (Automated Script)**

A production deployment script [`deploy.sh`](file:///c:/STARTUP/SKILLSCATALYST/deploy.sh) is included for Google Cloud Run:

1. Ensure the `gcloud` CLI is installed and authenticated.
2. Edit project variables inside [`deploy.sh`](file:///c:/STARTUP/SKILLSCATALYST/deploy.sh) (`PROJECT_ID`, `REGION`, etc.).
3. Run the script:
   ```bash
   bash deploy.sh
   ```

### **Docker Setup (Manual)**

- **Backend**:
  ```bash
  docker build -f Dockerfile.backend -t skillscatalyst-backend .
  docker run -p 8080:8080 --env-file .env skillscatalyst-backend
  ```

- **Frontend**:
  ```bash
  docker build -f Dockerfile.frontend -t skillscatalyst-frontend .
  docker run -p 3000:8080 skillscatalyst-frontend
  ```

---

## 🛰️ API Route Overview

| Router | File Link | Key Responsibilities |
| :--- | :--- | :--- |
| **Dashboard** | [`dashboard.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/dashboard.py) | User analytics, activity tracking, Personal Readiness Index (PRI) metrics |
| **AI Mentor** | [`ai_mentor.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/ai_mentor.py) | LLM chat sessions, career guidance, resume review via Groq LLM |
| **Learning** | [`learning.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/learning.py) | Learning roadmaps, YouTube course fetching, quizzes & progress |
| **Resume** | [`resume.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/resume.py) | PDF, DOCX, TXT, MD document text extraction & cleaning |
| **Practice** | [`practice.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/practice.py) | Coding problem sets, placement practice tests |
| **Profile** | [`profile.py`](file:///c:/STARTUP/SKILLSCATALYST/backend/routers/profile.py) | User target role updates, academic profile, coding handle stats extraction |

---

## 📄 License

This project is proprietary and built as part of the **SkillsCatalyst** AI initiative. All rights reserved.
