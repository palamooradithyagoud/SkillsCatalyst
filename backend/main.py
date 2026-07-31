import os
import sys
from pathlib import Path

# Ensure root directory is in sys.path for robust module loading
_root_dir = Path(__file__).resolve().parent.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routers import dashboard, ai_mentor, learning, resume, practice, profile
except ModuleNotFoundError:
    from routers import dashboard, ai_mentor, learning, resume, practice, profile

app = FastAPI(
    title="SkillPath API",
    description="FastAPI Backend for SkillPath Career & AI Learning Platform",
    version="1.0.0"
)

# ── CORS Configuration ────────────────────────────────────────────────────────
_frontend_url = os.getenv("FRONTEND_URL", "").strip()

_allowed_origins = [
    "https://skills-catalyst.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if _frontend_url and _frontend_url not in _allowed_origins:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(ai_mentor.router)
app.include_router(learning.router)
app.include_router(resume.router)
app.include_router(practice.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"status": "online", "message": "SkillPath API is running"}
