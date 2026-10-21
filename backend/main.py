import asyncio
import os
import sys
import time
import uuid
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure root and backend directories are in sys.path for robust module loading
_backend_dir = Path(__file__).resolve().parent
_root_dir = _backend_dir.parent
if str(_root_dir) not in sys.path:
    sys.path.insert(0, str(_root_dir))
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import FastAPI, Request, Response, status, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.config import (
    FRONTEND_URL,
    ENVIRONMENT,
    validate_startup_config,
)
from backend.services.auth_service import require_metrics_access

# ── Structured Production Logger Configuration ────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
# Silence spammy background APScheduler logs from payment SDKs (e.g. PhonePe PG)
logging.getLogger("apscheduler").setLevel(logging.WARNING)
logger = logging.getLogger("skillscatalyst.api")

# ── Background Monitors ───────────────────────────────────────────────────────
async def _event_loop_lag_monitor(interval_sec: float = 0.1, threshold_sec: float = 0.25):
    """
    Background monitor that measures asyncio event loop delay/lag.
    Wakes up every `interval_sec` (100ms). If the loop was blocked,
    actual slept time will exceed interval_sec + threshold_sec (250ms lag).
    Emits a structured warning log.
    """
    try:
        while True:
            t0 = time.monotonic()
            await asyncio.sleep(interval_sec)
            elapsed = time.monotonic() - t0
            lag = elapsed - interval_sec
            if lag > threshold_sec:
                logger.warning(
                    f"[EVENT_LOOP_LAG] Detected event loop stall: {round(lag * 1000, 1)}ms lag "
                    f"(slept {round(elapsed * 1000, 1)}ms, expected {round(interval_sec * 1000, 1)}ms)"
                )
    except asyncio.CancelledError:
        pass


async def _redis_health_refresher_task(interval_sec: float = 30.0):
    """Periodically refreshes cached Redis health status in threadpool without blocking event loop."""
    from backend.services.cache_service import refresh_cached_redis_status
    try:
        while True:
            await asyncio.to_thread(refresh_cached_redis_status)
            await asyncio.sleep(interval_sec)
    except asyncio.CancelledError:
        pass


# ── Lifespan Handler ─────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Context Manager.
    Performs fast startup validation and manages shared application resources cleanly.
    """
    logger.info(f"Initializing SkillsCatalyst API Backend (Environment: {ENVIRONMENT})...")
    validate_startup_config()

    # Initialize AI concurrency semaphore in lifespan startup
    from backend.services.groq_service import init_ai_semaphore
    from backend.config import MAX_CONCURRENT_AI_REQUESTS
    init_ai_semaphore(max_concurrent=MAX_CONCURRENT_AI_REQUESTS)

    # Initial passive refresh of Redis status (in threadpool, non-blocking)
    from backend.services.cache_service import refresh_cached_redis_status
    await asyncio.to_thread(refresh_cached_redis_status)

    # Start background event loop lag monitor and periodic Redis health refresher
    lag_task = asyncio.create_task(_event_loop_lag_monitor())
    redis_task = asyncio.create_task(_redis_health_refresher_task())

    try:
        yield
    finally:
        logger.info("Gracefully shutting down SkillsCatalyst API Backend...")
        lag_task.cancel()
        redis_task.cancel()
        await asyncio.gather(lag_task, redis_task, return_exceptions=True)

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
    # Interim threadpool wrap for P0-1 to prevent blocking event loop; replaced by local JWT in P1-3
    user_id = await asyncio.to_thread(get_optional_user_id, auth_hdr)
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

    if isinstance(exc.detail, dict):
        detail = dict(exc.detail)
        if "detail" not in detail:
            detail["detail"] = dict(exc.detail)
    else:
        detail = {
            "success": False,
            "message": str(exc.detail),
            "detail": str(exc.detail),
        }
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
    from backend.routers import (
        dashboard, ai_mentor, learning, resume, practice, profile,
        auth, support, admin, events, scholarships, tech_news,
        subscriptions, payments, skillbits, notifications,
        certificates, tasks, moods
    )
except ModuleNotFoundError as e:
    if getattr(e, "name", None) in ("backend", "backend.routers") or "backend" in str(e):
        from routers import (
            dashboard, ai_mentor, learning, resume, practice, profile,
            auth, support, admin, events, scholarships, tech_news,
            subscriptions, payments, skillbits, notifications,
            certificates, tasks, moods
        )
    else:
        raise e

app.include_router(dashboard.router)
app.include_router(ai_mentor.router)
app.include_router(learning.router)
app.include_router(resume.router)
app.include_router(practice.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(support.router)
app.include_router(admin.router)
app.include_router(events.router)
app.include_router(scholarships.router)
app.include_router(tech_news.router)
app.include_router(subscriptions.router)
app.include_router(payments.router)
app.include_router(skillbits.router)
app.include_router(notifications.router)
# app.include_router(courses.router)        # Student courses disabled
# app.include_router(admin_courses.router)  # Admin courses disabled
app.include_router(certificates.router)
app.include_router(tasks.router)
app.include_router(moods.router)


@app.post("/api/webhooks/mux", include_in_schema=False)
async def mux_webhook_alias(request: Request):
    """Convenience alias route for Mux webhooks."""
    from backend.services.skillbits_service import process_mux_webhook
    raw_body = await request.body()
    sig = request.headers.get("Mux-Signature")
    return await process_mux_webhook(raw_body=raw_body, signature_header=sig)



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

    from backend.services.cache_service import get_cached_redis_status
    from backend.services.observability import get_system_metrics
    # Pure in-memory status check; ZERO network I/O so /health cannot block event loop
    redis_status = get_cached_redis_status()
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

@app.get(
    "/api/metrics",
    status_code=status.HTTP_200_OK,
    tags=["System"],
)
def system_metrics(
    auth: dict = Depends(require_metrics_access),
):
    """
    Returns safe, aggregated observability telemetry.
    Protected by require_metrics_access (SEC-C-7): requires valid METRICS_SECRET_KEY
    or authenticated Admin / Owner identity.
    """
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


