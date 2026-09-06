import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env file from root directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "SkillsCatalyst <welcome@skillscatalyst.in>").strip()
RESEND_REPLY_TO = os.getenv("RESEND_REPLY_TO", "skillscatalyst5@gmail.com").strip()
ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT", os.getenv("ENVIRONMENT", "development")).strip()
IS_PRODUCTION = ENVIRONMENT.lower() in ("production", "prod")

# Development-only fallback secret key. Strictly isolated to non-production environments.
DEV_SECRET_KEY_FALLBACK = "dev-insecure-secret-key-do-not-use-in-production-only-local"

_raw_secret_key = os.getenv("SECRET_KEY", "").strip()
if not _raw_secret_key:
    if IS_PRODUCTION:
        SECRET_KEY = ""
    else:
        logger.warning(
            "SECRET_KEY environment variable is not set. Using development-only fallback key. "
            "Set SECRET_KEY environment variable for production."
        )
        SECRET_KEY = DEV_SECRET_KEY_FALLBACK
else:
    SECRET_KEY = _raw_secret_key

REDIS_URL = os.getenv("REDIS_URL", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://www.skillscatalyst.in").strip().rstrip("/")

REQUIRED_ENV_VARS = {
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_ANON_KEY": SUPABASE_ANON_KEY,
    "SUPABASE_SERVICE_KEY": SUPABASE_SERVICE_KEY,
    "SUPABASE_JWT_SECRET": SUPABASE_JWT_SECRET,
    "SECRET_KEY": SECRET_KEY,
    "GROQ_API_KEY": GROQ_API_KEY,
    "FRONTEND_URL": FRONTEND_URL,
}

INSECURE_SECRET_DEFAULTS = {
    "skills-catalyst-prod-sec-key-8f4b9c1d2e3f4a5b6c7d8e9f",
    DEV_SECRET_KEY_FALLBACK,
    "dev-local-secret-changeme-in-production",
    "secret",
    "secret_key",
    "changeme",
    "123456",
    "password",
    "dev-secret",
}

def _is_placeholder_secret(val: str) -> bool:
    """Checks if a secret value matches common placeholder or template strings."""
    if not val:
        return True
    val_lower = val.lower().strip()
    if val_lower in INSECURE_SECRET_DEFAULTS:
        return True
    placeholder_patterns = ("changeme", "placeholder", "your_", "example", "default", "test_key", "dummy")
    return any(pattern in val_lower for pattern in placeholder_patterns)

def validate_startup_config() -> None:
    """
    Validates required environment variables and checks for insecure default secrets on startup.
    In production environments, fails fast if critical security configuration is missing or insecure.
    In non-production environments, logs clear startup warnings.
    """
    current_env = os.getenv("RAILWAY_ENVIRONMENT", os.getenv("ENVIRONMENT", ENVIRONMENT)).strip().lower()
    is_prod = current_env in ("production", "prod")
    current_secret = os.getenv("SECRET_KEY", SECRET_KEY).strip()

    missing_vars = [var_name for var_name, value in REQUIRED_ENV_VARS.items() if not value]

    if missing_vars:
        error_msg = f"CRITICAL [CONFIG_ERROR]: Missing required environment variables on startup: {', '.join(missing_vars)}"
        logger.error(error_msg)
        if is_prod and not current_secret:
            raise RuntimeError("CRITICAL SECURITY ERROR: SECRET_KEY must be configured in production. Startup aborted.")
        logger.warning("Application running with some missing configuration. Endpoints requiring missing keys may fail gracefully.")

    # In production, enforce hard fail-fast on SECRET_KEY security
    if is_prod:
        if not current_secret or _is_placeholder_secret(current_secret) or len(current_secret) < 32:
            sec_fatal = (
                "CRITICAL SECURITY ERROR [CONFIG_ERROR]: SECRET_KEY must be set to a secure, "
                "unique value of at least 32 characters in production. Startup aborted."
            )
            logger.critical(sec_fatal)
            raise RuntimeError(sec_fatal)

    # Detect placeholder/insecure default secrets
    critical_secrets = {
        "SECRET_KEY": current_secret,
        "SUPABASE_JWT_SECRET": SUPABASE_JWT_SECRET,
        "SUPABASE_SERVICE_KEY": SUPABASE_SERVICE_KEY,
        "SUPABASE_ANON_KEY": SUPABASE_ANON_KEY,
        "GROQ_API_KEY": GROQ_API_KEY,
    }

    insecure_found = []
    for sec_name, sec_val in critical_secrets.items():
        if _is_placeholder_secret(sec_val) or len(sec_val) < 16:
            insecure_found.append(sec_name)

    if insecure_found:
        sec_error = (
            f"SECURITY CONFIGURATION WARNING [CONFIG_WARNING]: Insecure or placeholder values detected for: {', '.join(insecure_found)}. "
            f"Please configure strong production credentials in environment variables."
        )
        logger.warning(sec_error)

    logger.info(f"Startup configuration validation complete (Environment: {current_env}).")

