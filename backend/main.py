import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import dashboard, ai_mentor, learning, resume, practice, profile

app = FastAPI(
    title="SkillPath API",
    description="FastAPI Backend for SkillPath Career & AI Learning Platform",
    version="1.0.0"
)

# CORS — allow frontend origin via env var (set to Cloud Run URL in production)
_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or ["*"],
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
