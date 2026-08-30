import os
import logging
from groq import Groq
from backend.config import GROQ_API_KEY

logger = logging.getLogger(__name__)

groq_client: Groq | None = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialized successfully.")
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
    """
    if not groq_client:
        logger.error("Groq client is not initialised. Cannot process prompt.")
        return "Groq AI key not configured. Please contact your administrator."

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            logger.debug(f"Sending prompt to Groq model {model_name} (length={len(prompt)} chars).")
            response = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                model=model_name,
                temperature=0.6,
                max_tokens=8192,
            )
            reply = response.choices[0].message.content or "No response from AI."
            logger.debug(f"Groq ({model_name}) responded with {len(reply)} chars.")
            return reply
        except Exception as e:
            last_error = e
            logger.warning(f"Groq model {model_name} failed: {e}. Trying fallback...")
            continue

    logger.error(f"All Groq models failed. Last error: {last_error}", exc_info=True)
    return f"AI Mentor error: {str(last_error)}"
