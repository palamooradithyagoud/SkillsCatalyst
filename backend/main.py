from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import dashboard, ai_mentor, learning

app = FastAPI(
    title="SkillPath API",
    description="FastAPI Backend for SkillPath Career & AI Learning Platform",
    version="1.0.0"
)

# Enable CORS for Next.js frontend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(ai_mentor.router)
app.include_router(learning.router)

@app.get("/")
def root():
    return {"status": "online", "message": "SkillPath API is running"}
