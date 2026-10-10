import asyncio
import os
import time
import logging
from typing import Optional
from groq import (
    Groq,
    Timeout,
    APITimeoutError,
    APIConnectionError,
    RateLimitError,
    AuthenticationError,
    APIStatusError,
    GroqError,
)
from backend.config import GROQ_API_KEY
from backend.services.observability import record_ai_call

logger = logging.getLogger(__name__)

# Groq timeout specifications:
# Enforces strict request-level timeouts to prevent threadpool starvation.
# Per-call timeout: connect 3s, read 12s, write 5s, pool 3s.
# Total fallback chain hard ceiling: 25.0s.
_GROQ_CONNECT_TIMEOUT = 3.0   # seconds to establish TCP connection
_GROQ_READ_TIMEOUT    = 12.0  # seconds to wait for first response bytes
_GROQ_WRITE_TIMEOUT   = 5.0   # seconds to send request payload
_GROQ_POOL_TIMEOUT    = 3.0   # seconds to acquire connection from pool
_GROQ_TOTAL_TIMEOUT   = 15.0  # default model attempt timeout ceiling
_GROQ_HARD_CEILING    = float(os.getenv("GROQ_CHAIN_TIMEOUT_SECONDS", "25.0"))  # total wall-clock ceiling across all model fallbacks

# Global AI request concurrency limiter (initialized in FastAPI lifespan)
_ai_semaphore: Optional[asyncio.Semaphore] = None
_ai_executor: Optional[ThreadPoolExecutor] = None


def get_ai_executor() -> ThreadPoolExecutor:
    """Returns dedicated AI threadpool executor sized to MAX_CONCURRENT_AI_REQUESTS."""
    global _ai_executor
    if _ai_executor is None:
        max_workers = int(os.getenv("MAX_CONCURRENT_AI_REQUESTS", "6"))
        _ai_executor = ThreadPoolExecutor(
            max_workers=max_workers,
            thread_name_prefix="groq_ai_worker"
        )
    return _ai_executor


def init_ai_semaphore(max_concurrent: int = 6) -> asyncio.Semaphore:
    """Initializes the AI request concurrency semaphore in lifespan context."""
    global _ai_semaphore
    _ai_semaphore = asyncio.Semaphore(max_concurrent)
    logger.info(f"Initialized AI concurrency semaphore with capacity {max_concurrent}.")
    return _ai_semaphore


def get_ai_semaphore() -> asyncio.Semaphore:
    """Retrieves the active AI semaphore, falling back to lazy initialization if called outside lifespan."""
    global _ai_semaphore
    if _ai_semaphore is None:
        max_concurrent = int(os.getenv("MAX_CONCURRENT_AI_REQUESTS", "6"))
        _ai_semaphore = asyncio.Semaphore(max_concurrent)
    return _ai_semaphore


from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException


@asynccontextmanager
async def acquire_ai_slot(timeout: float = 5.0):
    """
    Acquires a concurrency slot on the AI semaphore with a strict timeout.
    If a slot cannot be acquired within `timeout` seconds, raises an HTTP 503
    in the standard SkillsCatalyst error schema.
    """
    sem = get_ai_semaphore()
    try:
        await asyncio.wait_for(sem.acquire(), timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(
            f"AI request concurrency capacity saturated (exceeded {timeout}s acquire wait). Returning HTTP 503."
        )
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "message": "AI Mentor service is currently experiencing high load. Please try again in a moment.",
                "detail": f"AI concurrency limit reached (acquire timeout {timeout}s)"
            }
        )
    try:
        yield
    finally:
        sem.release()


async def run_bounded_ai_call(
    func,
    *args,
    acquire_timeout: float = 5.0,
    ceiling_timeout: Optional[float] = None,
    **kwargs,
) -> str:
    """
    Executes an AI call with strict concurrency gating and a true wall-clock deadline watchdog.

    Mechanisms:
      1. Concurrency limit: Acquires a slot from _ai_semaphore. If not acquired
         within `acquire_timeout` (default 5s), raises HTTP 503.
      2. True Deadline Enforcement:
         HTTPX timeouts are per-phase, not overall request deadlines. A remote server
         that trickles bytes slowly can keep an HTTP read alive past individual socket limits.
         To enforce a true hard deadline, we run the blocking call in a dedicated AI
         worker threadpool and wrap the caller awaiting it in `asyncio.wait_for`.
      3. Thread Lifetime & Slot Accounting:
         Python threads cannot be forcefully killed once started. If `wait_for`
         times out or a client disconnects, the abandoned thread continues in the background
         until its socket read terminates or hits OS limits.
         To prevent resource exhaustion:
         a) We hold the semaphore slot until the worker thread actually finishes (via
            a done callback), preventing abandoned trickling threads from exceeding
            the max concurrency ceiling.
         b) We isolate AI calls in a dedicated ThreadPoolExecutor sized to
            MAX_CONCURRENT_AI_REQUESTS so abandoned AI threads never starve general
            AnyIO threadpool operations (DB queries, auth, cache).
      4. Standard Error Shape:
         If the hard ceiling expires, returns standard HTTP 503 error payload.
    """
    sem = get_ai_semaphore()
    try:
        await asyncio.wait_for(sem.acquire(), timeout=acquire_timeout)
    except asyncio.TimeoutError:
        logger.warning(
            f"AI request concurrency capacity saturated (exceeded {acquire_timeout}s acquire wait). Returning HTTP 503."
        )
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "message": "AI Mentor service is currently experiencing high load. Please try again in a moment.",
                "detail": f"AI concurrency limit reached (acquire timeout {acquire_timeout}s)",
            },
        )

    loop = asyncio.get_running_loop()
    executor = get_ai_executor()
    slot_released = False

    def _release_slot():
        nonlocal slot_released
        if not slot_released:
            slot_released = True
            sem.release()

    def _worker():
        try:
            return func(*args, **kwargs)
        finally:
            loop.call_soon_threadsafe(_release_slot)

    try:
        fut = loop.run_in_executor(executor, _worker)
    except Exception:
        _release_slot()
        raise

    ceiling = ceiling_timeout if ceiling_timeout is not None else _GROQ_HARD_CEILING
    grace = 0.5
    try:
        return await asyncio.wait_for(asyncio.shield(fut), timeout=ceiling + grace)
    except asyncio.TimeoutError:
        logger.warning(
            f"AI request exceeded hard ceiling deadline ({ceiling}s + {grace}s grace). "
            f"Worker thread will release its slot when underlying socket closes. Returning HTTP 503."
        )
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "message": "AI Mentor service is currently experiencing high load. Please try again in a moment.",
                "detail": f"AI request exceeded hard deadline ({ceiling}s)",
            },
        )

# Safe user-facing message when all models fail (NO internal exceptions or stack traces).
_AI_UNAVAILABLE_MSG = (
    "AI Mentor is temporarily unavailable. Please try again in a moment."
)

groq_client: Groq | None = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(
            api_key=GROQ_API_KEY,
            timeout=Timeout(
                timeout=_GROQ_TOTAL_TIMEOUT,
                connect=_GROQ_CONNECT_TIMEOUT,
                read=_GROQ_READ_TIMEOUT,
                write=_GROQ_WRITE_TIMEOUT,
                pool=_GROQ_POOL_TIMEOUT,
            ),
            max_retries=0,  # Deliberate: we handle retries via model fallback cascade
        )
        logger.info("Groq client initialized successfully with robust timeouts.")
    except Exception as e:
        logger.warning(f"Failed to initialize Groq client: {e}")
else:
    logger.warning("GROQ_API_KEY is not set — Groq AI features will be disabled.")

FALLBACK_MODELS = [
    os.getenv("GROQ_MODEL", "").strip(),
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "qwen/qwen3.6-27b",
]
FALLBACK_MODELS = [m for m in FALLBACK_MODELS if m]


def chat_with_groq(
    prompt: Optional[str] = None,
    system_prompt: str = "You are SkillsCatalyst AI Mentor, an expert career coach and tech interviewer.",
    messages: Optional[list] = None,
) -> str:
    """
    Sends a prompt or structured message list to the Groq LLM and returns the text response.
    Attempts candidate models in order until one succeeds within the 25.0s total chain ceiling.

    Failure behaviour:
      - Connection timeout (3s): moves to next model, logs warning.
      - Read timeout (min(12s, remaining budget)): moves to next model, logs warning.
      - Rate-limit (429): moves to next model, logs warning.
      - Hard ceiling (25s): halts fallback loop before reverse proxy timeout.
      - All models fail: returns safe user-facing _AI_UNAVAILABLE_MSG.

    Observability:
      - record_ai_call(success=True, model=..., latency_ms=...) on success.
      - record_ai_call(success=False, model=..., error_category=..., timed_out=...) on each failure.
    """
    if not groq_client:
        logger.error("Groq client is not initialised. Cannot process prompt.")
        record_ai_call(success=False, provider="groq", error_category="client_uninitialized")
        return _AI_UNAVAILABLE_MSG

    last_error_category = "unknown"
    t_start = time.monotonic()

    for model_name in FALLBACK_MODELS:
        # Check hard ceiling and compute remaining budget before making next attempt
        elapsed_so_far = time.monotonic() - t_start
        remaining_budget = _GROQ_HARD_CEILING - elapsed_so_far
        if remaining_budget < 2.0:
            logger.warning(
                f"Groq remaining budget insufficient for attempt ({remaining_budget:.1f}s < 2.0s). "
                f"Skipping further model fallbacks to maintain hard ceiling of {_GROQ_HARD_CEILING}s."
            )
            last_error_category = "hard_ceiling_timeout"
            break

        per_attempt_timeout = min(_GROQ_READ_TIMEOUT, remaining_budget)
        per_attempt_connect = min(_GROQ_CONNECT_TIMEOUT, per_attempt_timeout)

        model_start = time.monotonic()
        try:
            if messages is not None:
                completion_messages = messages
            else:
                completion_messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": prompt or ""},
                ]
            prompt_len = sum(len(m.get("content", "")) for m in completion_messages)
            logger.debug(
                f"Sending prompt to Groq model '{model_name}' "
                f"(prompt_length={prompt_len} chars, budget={per_attempt_timeout:.1f}s, turns={len(completion_messages)})."
            )
            response = groq_client.chat.completions.create(
                messages=completion_messages,
                model=model_name,
                temperature=0.6,
                max_tokens=8192,
                timeout=Timeout(
                    timeout=per_attempt_timeout,
                    connect=per_attempt_connect,
                    read=per_attempt_timeout,
                    write=_GROQ_WRITE_TIMEOUT,
                    pool=_GROQ_POOL_TIMEOUT,
                ),
            )
            reply = response.choices[0].message.content or "No response from AI."
            latency_ms = round((time.monotonic() - model_start) * 1000, 1)
            total_chain_ms = round((time.monotonic() - t_start) * 1000, 1)
            logger.info(
                f"Groq model '{model_name}' succeeded in {latency_ms}ms (total fallback chain: {total_chain_ms}ms, {len(reply)} chars returned)."
            )
            record_ai_call(
                success=True,
                provider="groq",
                model=model_name,
                latency_ms=latency_ms,
            )
            return reply

        except APITimeoutError as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            last_error_category = "timeout"
            logger.warning(
                f"Groq model '{model_name}' timed out after {model_latency}ms. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category="timeout",
                timed_out=True,
            )
            continue

        except RateLimitError as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            last_error_category = "rate_limit"
            logger.warning(
                f"Groq model '{model_name}' rate-limited (429) after {model_latency}ms. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category="rate_limit",
            )
            continue

        except AuthenticationError as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            last_error_category = "auth_error"
            logger.error(
                f"Groq model '{model_name}' authentication error. Check GROQ_API_KEY. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category="auth_error",
            )
            continue

        except APIConnectionError as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            last_error_category = "connection_error"
            logger.warning(
                f"Groq model '{model_name}' connection error after {model_latency}ms. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category="connection_error",
            )
            continue

        except APIStatusError as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            status_code = getattr(e, "status_code", "unknown")
            last_error_category = f"status_{status_code}"
            logger.warning(
                f"Groq model '{model_name}' HTTP {status_code} error after {model_latency}ms. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category=last_error_category,
            )
            continue

        except Exception as e:
            model_latency = round((time.monotonic() - model_start) * 1000, 1)
            err_type = type(e).__name__
            last_error_category = err_type.lower()
            logger.warning(
                f"Groq model '{model_name}' unexpected error [{err_type}] after {model_latency}ms. Trying next fallback."
            )
            record_ai_call(
                success=False,
                provider="groq",
                model=model_name,
                latency_ms=model_latency,
                error_category=last_error_category,
            )
            continue

    # All models exhausted or hard ceiling reached
    total_latency_ms = round((time.monotonic() - t_start) * 1000, 1)
    logger.error(
        f"All {len(FALLBACK_MODELS)} Groq models failed after {total_latency_ms}ms. "
        f"Last failure category: '{last_error_category}'."
    )

    # Return safe user-facing message — NO internal details or stack traces exposed
    return _AI_UNAVAILABLE_MSG

