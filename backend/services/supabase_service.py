import logging
from supabase import create_client, Client
from backend.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

logger = logging.getLogger(__name__)

supabase_client: Client | None = None

if SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY):
    key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
    try:
        supabase_client = create_client(SUPABASE_URL, key)
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}")

def get_supabase() -> Client | None:
    return supabase_client
