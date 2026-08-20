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
SECRET_KEY = os.getenv("SECRET_KEY", "skills-catalyst-prod-sec-key-8f4b9c1d2e3f4a5b6c7d8e9f").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://www.skillscatalyst.in").strip().rstrip("/")
ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT", os.getenv("ENVIRONMENT", "development")).strip()

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
    Logs clear startup errors and warnings if key variables are missing or insecure.
    """
    missing_vars = [var_name for var_name, value in REQUIRED_ENV_VARS.items() if not value]

    if missing_vars:
        error_msg = f"CRITICAL [CONFIG_ERROR]: Missing required environment variables on startup: {', '.join(missing_vars)}"
        logger.error(error_msg)
        logger.warning("Application running with some missing configuration. Endpoints requiring missing keys may fail gracefully.")

    # Detect placeholder/insecure default secrets
    critical_secrets = {
        "SECRET_KEY": SECRET_KEY,
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

    logger.info(f"Startup configuration validation complete (Environment: {ENVIRONMENT}).")

