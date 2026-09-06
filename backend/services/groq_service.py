import os
import time
import logging
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
# Protects Uvicorn workers from hanging indefinitely on a stalled provider.
# Per-call timeout: connect 5s, read 25s, total 30s.
_GROQ_CONNECT_TIMEOUT = 5.0   # seconds to establish TCP connection
_GROQ_READ_TIMEOUT    = 25.0  # seconds to wait for first response bytes
_GROQ_TOTAL_TIMEOUT   = 30.0  # per-model attempt timeout ceiling
_GROQ_HARD_CEILING    = 55.0  # total wall-clock ceiling across all model fallbacks

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
            ),
            max_retries=0,  # We handle retries ourselves via model fallback chain
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
    prompt: str,
    system_prompt: str = "You are SkillsCatalyst AI Mentor, an expert career coach and tech interviewer.",
) -> str:
    """
    Sends a prompt to the Groq LLM and returns the text response.
    Attempts candidate models in order until one succeeds.

    Failure behaviour:
      - Connection timeout (5s): moves to next model, logs warning.
      - Read timeout (25s): moves to next model, logs warning.
      - Rate-limit (429): moves to next model, logs warning.
      - Hard ceiling (55s): halts fallback loop before reverse proxy timeout.
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
        # Check hard ceiling before making next attempt
        elapsed_so_far = time.monotonic() - t_start
        if elapsed_so_far >= _GROQ_HARD_CEILING:
            logger.warning(
                f"Groq hard ceiling reached ({elapsed_so_far:.1f}s >= {_GROQ_HARD_CEILING}s). "
                f"Aborting further fallbacks to prevent worker hang."
            )
            last_error_category = "hard_ceiling_timeout"
            break

        model_start = time.monotonic()
        try:
            logger.debug(
                f"Sending prompt to Groq model '{model_name}' "
                f"(prompt_length={len(prompt)} chars)."
            )
            response = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": prompt},
                ],
                model=model_name,
                temperature=0.6,
                max_tokens=8192,
                timeout=Timeout(
                    timeout=_GROQ_TOTAL_TIMEOUT,
                    connect=_GROQ_CONNECT_TIMEOUT,
                    read=_GROQ_READ_TIMEOUT,
                ),
            )
            reply = response.choices[0].message.content or "No response from AI."
            latency_ms = round((time.monotonic() - model_start) * 1000, 1)
            logger.info(
                f"Groq model '{model_name}' succeeded in {latency_ms}ms "
                f"({len(reply)} chars returned)."
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

