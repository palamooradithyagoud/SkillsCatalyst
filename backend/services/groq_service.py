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


def chat_with_groq(
    prompt: str,
    system_prompt: str = "You are SkillsCatalyst AI Mentor, an expert career coach and tech interviewer.",
) -> str:
    """
    Sends a prompt to the Groq LLM and returns the text response.

    Args:
        prompt: The user-facing message to send.
        system_prompt: The system context to set AI behaviour.

    Returns:
        The model's reply as a plain string, or an error string if the call fails.
    """
    if not groq_client:
        logger.error("Groq client is not initialised. Cannot process prompt.")
        return "Groq AI key not configured. Please contact your administrator."

    try:
        logger.debug(f"Sending prompt to Groq (length={len(prompt)} chars).")
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            # 8192 tokens allows thorough review of long resumes without truncation.
            max_tokens=8192,
        )
        reply = response.choices[0].message.content or "No response from AI."
        logger.debug(f"Groq responded with {len(reply)} chars.")
        return reply
    except Exception as e:
        logger.error(f"Groq API error: {e}", exc_info=True)
        return f"AI Mentor error: {str(e)}"
