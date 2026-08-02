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
SECRET_KEY = os.getenv("SECRET_KEY", "dev-local-secret-changeme-in-production").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://skills-catalyst.vercel.app").strip().rstrip("/")
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
    Fails fast with clear startup logs if key variables are missing or insecure in production.
    """
    missing_vars = [var_name for var_name, value in REQUIRED_ENV_VARS.items() if not value]

    if missing_vars:
        error_msg = f"CRITICAL [CONFIG_ERROR]: Missing required environment variables on startup: {', '.join(missing_vars)}"
        logger.error(error_msg)
        if ENVIRONMENT.lower() in ("production", "prod"):
            raise RuntimeError(error_msg)
        else:
            logger.warning("Application running in non-production mode with default/missing fallback configuration.")

    # Objective 6: Detect placeholder/insecure default secrets in production
    if ENVIRONMENT.lower() in ("production", "prod"):
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
                f"CRITICAL SECURITY CONFIGURATION FAILURE [CONFIG_ERROR]: Production deployment detected with "
                f"insecure, default, or placeholder values for environment variables: {', '.join(insecure_found)}. "
                f"Please configure strong random production credentials (min 16 chars) in Railway environment variables."
            )
            logger.error(sec_error)
            raise RuntimeError(sec_error)

    logger.info(f"Startup configuration validated successfully (Environment: {ENVIRONMENT}).")

