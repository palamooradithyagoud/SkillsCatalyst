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

def validate_startup_config() -> None:
    """
    Validates required environment variables during application startup.
    Fails fast with clear startup logs if any key variable is missing in production.
    """
    missing_vars = [var_name for var_name, value in REQUIRED_ENV_VARS.items() if not value]

    if missing_vars:
        error_msg = f"CRITICAL: Missing required environment variables on startup: {', '.join(missing_vars)}"
        logger.error(error_msg)
        if ENVIRONMENT.lower() in ("production", "prod"):
            raise RuntimeError(error_msg)
        else:
            logger.warning("Application running in non-production mode with default/missing fallback configuration.")
    else:
        logger.info(f"Startup configuration validated successfully (Environment: {ENVIRONMENT}).")
