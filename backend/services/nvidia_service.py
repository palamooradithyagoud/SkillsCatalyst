"""
NVIDIA Integrate AI Service for SkillsCatalyst AI Mentor.
Integrates NVIDIA Cloud / NIM APIs (including Moonshot AI Kimi K3, Vision, and Reasoning models)
with seamless switching and automatic fallback support.
"""

import json
import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from backend.config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL
from backend.services.observability import record_ai_call
from backend.services.groq_service import (
    AIProviderAuthError,
    AIProviderError,
    AIProviderInvalidResponseError,
    AIProviderQuotaExhaustedError,
    AIProviderRateLimitError,
    AIProviderTimeoutError,
    AIProviderUnavailableError,
)

logger = logging.getLogger(__name__)


def chat_with_nvidia(
    prompt: Optional[str] = None,
    system_prompt: str = "You are SkillsCatalyst AI Mentor, an expert career coach and tech interviewer.",
    messages: Optional[List[Dict[str, Any]]] = None,
    model: Optional[str] = None,
    temperature: float = 1.0,
    max_tokens: int = 16384,
    reasoning_effort: str = "max",
    timeout: float = 18.0,
    stream: bool = False,
) -> str:
    """
    Sends a chat completion request to the NVIDIA Integrate API.
    Supports Moonshot AI Kimi K3, multimodal vision payloads, and reasoning effort controls.
    """
    if not NVIDIA_API_KEY:
        logger.error("NVIDIA_API_KEY is not configured.")
        record_ai_call(success=False, provider="nvidia", error_category="client_uninitialized")
        raise AIProviderUnavailableError("NVIDIA AI provider service is not configured.")

    target_model = model or NVIDIA_MODEL or "moonshotai/kimi-k3"

    # Assemble messages payload
    if messages is not None:
        completion_messages = messages
    else:
        completion_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt or ""},
        ]

    # Map reasoning effort cleanly (low, medium, max)
    norm_effort = str(reasoning_effort).strip().lower()
    if norm_effort in ("max", "high", "max effort"):
        effort_val = "max"
    elif norm_effort in ("medium", "med"):
        effort_val = "medium"
    else:
        effort_val = "low"

    payload: Dict[str, Any] = {
        "messages": completion_messages,
        "model": target_model,
        "max_tokens": max_tokens,
        "seed": 0,
        "stream": stream,
        "temperature": temperature,
        "top_p": 0.95,
    }

    if "nemotron" in target_model.lower():
        payload["chat_template_kwargs"] = {"enable_thinking": True}
    else:
        payload["reasoning_effort"] = effort_val

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Accept": "text/event-stream" if stream else "application/json",
        "Content-Type": "application/json",
    }

    invoke_url = f"{NVIDIA_BASE_URL}/chat/completions"
    t_start = time.monotonic()

    logger.info(
        f"Invoking NVIDIA Integrate API for model '{target_model}' "
        f"(messages={len(completion_messages)}, effort={effort_val}, stream={stream})."
    )

    try:
        with httpx.Client(timeout=timeout) as client:
            if stream:
                # Handle SSE stream if requested
                reply_parts: List[str] = []
                reasoning_parts: List[str] = []
                with client.stream("POST", invoke_url, headers=headers, json=payload) as response:
                    status_code = response.status_code
                    if status_code == 410:
                        err_text = response.read().decode("utf-8", errors="replace")
                        logger.warning(f"NVIDIA model '{target_model}' returned 410 Gone (EOL): {err_text}")
                        raise AIProviderUnavailableError(f"Model '{target_model}' has reached end of life or is unavailable.")
                    if status_code == 429:
                        raise AIProviderRateLimitError(f"NVIDIA rate limit reached on model '{target_model}'.")
                    if status_code in (401, 403):
                        raise AIProviderAuthError("NVIDIA API authentication failed. Please check your credentials.")
                    if status_code >= 400:
                        err_text = response.read().decode("utf-8", errors="replace")
                        raise AIProviderUnavailableError(f"NVIDIA API HTTP {status_code}: {err_text[:200]}")

                    for line in response.iter_lines():
                        line_str = line.strip()
                        if not line_str or line_str.startswith(":"):
                            continue
                        if line_str == "data: [DONE]":
                            break
                        if line_str.startswith("data: "):
                            data_str = line_str[6:].strip()
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content")
                                reasoning = delta.get("reasoning_content")
                                if content:
                                    reply_parts.append(content)
                                if reasoning:
                                    reasoning_parts.append(reasoning)
                            except Exception:
                                continue

                reply = "".join(reply_parts).strip()
                if not reply and reasoning_parts:
                    reply = "".join(reasoning_parts).strip()
            else:
                # Standard JSON completion request
                response = client.post(invoke_url, headers=headers, json=payload)
                status_code = response.status_code

                if status_code == 410:
                    err_body = response.text
                    logger.warning(f"NVIDIA model '{target_model}' returned 410 Gone (EOL): {err_body}")
                    raise AIProviderUnavailableError(
                        f"NVIDIA model '{target_model}' has reached end of life or is unavailable."
                    )
                if status_code == 429:
                    raise AIProviderRateLimitError(f"NVIDIA rate limit reached on model '{target_model}'.")
                if status_code in (401, 403):
                    raise AIProviderAuthError("NVIDIA API authentication failed. Please check credentials.")
                if status_code >= 400:
                    raise AIProviderUnavailableError(f"NVIDIA API error HTTP {status_code}: {response.text[:200]}")

                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise AIProviderInvalidResponseError("Received empty choices list from NVIDIA API.")

                message_obj = choices[0].get("message", {})
                reply = (message_obj.get("content") or "").strip()
                if not reply and message_obj.get("reasoning_content"):
                    reply = (message_obj.get("reasoning_content") or "").strip()

            if not reply:
                raise AIProviderInvalidResponseError("Received empty reply text from NVIDIA API.")

            latency_ms = round((time.monotonic() - t_start) * 1000, 1)
            logger.info(f"NVIDIA model '{target_model}' succeeded in {latency_ms}ms ({len(reply)} chars).")
            record_ai_call(success=True, provider="nvidia", model=target_model, latency_ms=latency_ms)
            return reply

    except httpx.TimeoutException as e:
        latency_ms = round((time.monotonic() - t_start) * 1000, 1)
        logger.warning(f"NVIDIA API timeout on model '{target_model}' after {latency_ms}ms: {e}")
        record_ai_call(success=False, provider="nvidia", model=target_model, error_category="timeout", timed_out=True)
        raise AIProviderTimeoutError(f"NVIDIA AI service request timed out on model '{target_model}'.")

    except AIProviderError as e:
        latency_ms = round((time.monotonic() - t_start) * 1000, 1)
        record_ai_call(success=False, provider="nvidia", model=target_model, error_category=e.code)
        raise

    except Exception as e:
        latency_ms = round((time.monotonic() - t_start) * 1000, 1)
        logger.warning(f"NVIDIA API unexpected error on model '{target_model}': {e}")
        record_ai_call(success=False, provider="nvidia", model=target_model, error_category=type(e).__name__.lower())
        raise AIProviderUnavailableError(f"NVIDIA AI provider error: {str(e)}")
