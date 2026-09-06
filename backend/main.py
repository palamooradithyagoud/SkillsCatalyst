import os
import sys
import time
import uuid
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure root directory is in sys.path for robust module loading
_root_dir = Path(__file__).resolve().parent.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))

from fastapi import FastAPI, Request, Response, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.config import (
    FRONTEND_URL,
    ENVIRONMENT,
    validate_startup_config,
)

# ── Structured Production Logger Configuration ────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skillscatalyst.api")

# ── Lifespan Handler ─────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Context Manager.
    Performs fast startup validation and manages shared application resources cleanly.
    """
    logger.info(f"Initializing SkillsCatalyst API Backend (Environment: {ENVIRONMENT})...")
    validate_startup_config()
    yield
    logger.info("Gracefully shutting down SkillsCatalyst API Backend...")

# ── FastAPI App Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="SkillsCatalyst API",
    description="FastAPI Backend for SkillsCatalyst Career & AI Learning Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if ENVIRONMENT.lower() != "production" else None,
    redoc_url=None,
)

import contextvars

# ContextVar for request correlation tracking across async tasks
request_id_ctx_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="n/a")

# ── CORS Configuration ────────────────────────────────────────────────────────
_allowed_origins = [
    "https://www.skillscatalyst.in",
    "https://skillscatalyst.in",
    "https://skills-catalyst.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

_env_frontend = FRONTEND_URL.strip().rstrip("/")
if _env_frontend:
    if _env_frontend not in _allowed_origins:
        _allowed_origins.append(_env_frontend)
    # Auto-pair www and apex domains
    if _env_frontend.startswith("https://www."):
        apex_origin = _env_frontend.replace("https://www.", "https://")
        if apex_origin not in _allowed_origins:
            _allowed_origins.append(apex_origin)
    elif _env_frontend.startswith("https://") and not _env_frontend.startswith("https://www."):
        www_origin = _env_frontend.replace("https://", "https://www.")
        if www_origin not in _allowed_origins:
            _allowed_origins.append(www_origin)

_extra_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
for _orig in _extra_origins:
    _o = _orig.strip().rstrip("/")
    if _o and _o not in _allowed_origins:
        _allowed_origins.append(_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"^https://skills-catalyst.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Guest-Session-Token", "x-session-id"],
)

# ── Production Security & Telemetry Middlewares ────────────────────────────────
@app.middleware("http")
async def production_hardening_middleware(request: Request, call_next):
    """
    Production Telemetry & Security Headers Middleware.
    - Generates and attaches X-Request-ID (ContextVar bound).
    - Measures request processing latency.
    - Emits structured Railway-friendly log telemetries without exposing secrets/PII.
    - Attaches modern production security headers (COOP, CORP, Permissions-Policy, HSTS).
    - Resolves and attaches X-Guest-Session-Token for guest users.
    """
    start_time = time.time()
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request_id_ctx_var.set(req_id)
    
    # Process request
    try:
        response: Response = await call_next(request)
    except Exception as e:
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.error(
            f"[SYSTEM_ERROR] Unhandled Request Error | ID: {req_id} | Method: {request.method} | Path: {request.url.path} | Latency: {process_time_ms}ms | Error: {str(e)}",
            exc_info=True
        )
        raise e

    process_time_ms = round((time.time() - start_time) * 1000, 2)

    # Attach Request ID & Modern Production Security Headers
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Objective 4: Modern Security Headers
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    if ENVIRONMENT.lower() in ("production", "prod"):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Auto-issue signed guest session token for non-authenticated guest requests
    auth_hdr = request.headers.get("authorization")
    from backend.services.auth_service import get_optional_user_id, sanitize_or_generate_guest_id
    user_id = get_optional_user_id(authorization=auth_hdr)
    if not user_id:
        raw_sid = request.headers.get("x-session-id")
        _, signed_token = sanitize_or_generate_guest_id(raw_sid)
        response.headers["X-Guest-Session-Token"] = signed_token

    # Record telemetry into observability recorder
    from backend.services.observability import record_request
    record_request(request.method, request.url.path, response.status_code, process_time_ms)

    # Structured Railway Telemetry Log
    logger.info(
        f"HTTP {request.method} {request.url.path} -> {response.status_code} | Latency: {process_time_ms}ms | ID: {req_id} | Env: {ENVIRONMENT}"
    )

    return response

# ── Global Exception Handlers ─────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Centralized HTTP Exception Handler. Returns clean JSON error payload with correlation ID.
    """
    req_id = request_id_ctx_var.get()
    logger.warning(f"HTTPException [{exc.status_code}] on {request.url.path} | ID: {req_id}: {exc.detail}")
    
    headers = dict(exc.headers or {})
    headers["X-Request-ID"] = req_id

    detail = exc.detail if isinstance(exc.detail, dict) else {"success": False, "message": str(exc.detail)}
    if isinstance(detail, dict) and "request_id" not in detail:
        detail["request_id"] = req_id

    return JSONResponse(
        status_code=exc.status_code,
        content=detail,
        headers=headers,
    )

from fastapi.encoders import jsonable_encoder

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Centralized Request Validation Exception Handler. Protects internal schema details.
    """
    req_id = request_id_ctx_var.get()
    logger.warning(f"ValidationError on {request.url.path} | ID: {req_id}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({
            "success": False,
            "message": "Invalid request parameter format.",
            "errors": exc.errors(),
            "request_id": req_id,
        }),
        headers={"X-Request-ID": req_id},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """
    Centralized Catch-All Exception Handler.
    Prevents stack trace, file path, and internal environment variable exposure to client.
    """
    req_id = request_id_ctx_var.get()
    logger.error(f"[SYSTEM_ERROR] Unhandled Exception on {request.url.path} | ID: {req_id}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "request_id": req_id,
        },
        headers={"X-Request-ID": req_id},
    )

# ── Router Registrations ──────────────────────────────────────────────────────
try:
    from backend.routers import dashboard, ai_mentor, learning, resume, practice, profile, auth, support
except ModuleNotFoundError:
    from routers import dashboard, ai_mentor, learning, resume, practice, profile, auth, support

app.include_router(dashboard.router)
app.include_router(ai_mentor.router)
app.include_router(learning.router)
app.include_router(resume.router)
app.include_router(practice.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(support.router)

# ── Railway Probes & System Endpoints ─────────────────────────────────────────
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
@app.get("/api/health", status_code=status.HTTP_200_OK, tags=["System"])
def health_check():
    """Multi-service health check endpoint (never exposes secrets/credentials)."""
    db_status = "unconfigured"
    try:
        from backend.services.supabase_service import get_supabase
        sb = get_supabase()
        if sb:
            db_status = "ok"
    except Exception:
        db_status = "error"

    from backend.services.cache_service import get_redis_health_status
    from backend.services.observability import get_system_metrics
    redis_status = get_redis_health_status()
    yt_status = "configured" if os.getenv("YOUTUBE_API_KEY") else "unconfigured"
    ai_status = "configured" if os.getenv("GROQ_API_KEY") else "unconfigured"
    email_status = "configured" if os.getenv("RESEND_API_KEY") else "unconfigured"

    metrics = get_system_metrics()

    return {
        "status": "healthy",
        "services": {
            "database": db_status,
            "redis": redis_status,
            "youtube": yt_status,
            "groq_ai": ai_status,
            "resend_email": email_status,
        },
        "metrics": {
            "uptime_seconds": metrics.get("uptime_seconds", 0),
            "redis_hit_rate_pct": metrics.get("redis_cache", {}).get("hit_rate_pct", 0),
            "total_requests": metrics.get("requests", {}).get("total", 0),
        }
    }

@app.get("/ready", status_code=status.HTTP_200_OK, tags=["System"])
def readiness_check():
    """Railway Readiness Probe Endpoint."""
    return {"status": "ready"}

@app.get("/api/metrics", status_code=status.HTTP_200_OK, tags=["System"])
def system_metrics():
    """Returns safe, aggregated observability telemetry."""
    from backend.services.observability import get_system_metrics
    return get_system_metrics()

@app.get("/", status_code=status.HTTP_200_OK, tags=["System"])
def root():
    """Root status endpoint."""
    return {"status": "online", "message": "SkillsCatalyst API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)


