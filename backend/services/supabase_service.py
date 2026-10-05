import logging
import httpx
from typing import Optional
from supabase import create_client, Client, ClientOptions
from backend.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

logger = logging.getLogger(__name__)

supabase_client: Optional[Client] = None


def _create_robust_client(url: str, key: str) -> Client:
    """
    Creates a Supabase client with HTTP/1.1 explicitly enforced (http2=False).
    This prevents `h2.exceptions.ConnectionTerminated: <ConnectionTerminated error_code:0>` 
    which occurs when Supabase/Cloudflare edge proxies gracefully terminate idle HTTP/2 streams.
    """
    custom_httpx = httpx.Client(
        http2=False,
        timeout=httpx.Timeout(20.0, connect=10.0),
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=50, keepalive_expiry=15.0),
    )
    options = ClientOptions(httpx_client=custom_httpx)
    return create_client(url, key, options=options)


def _init_client():
    global supabase_client
    if SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY):
        if not SUPABASE_SERVICE_KEY and SUPABASE_ANON_KEY:
            logger.warning("SUPABASE_SERVICE_KEY is not configured! Backend is running with anon key; admin operations and RLS bypass will not work.")
        key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
        try:
            supabase_client = _create_robust_client(SUPABASE_URL, key)
            logger.info("Supabase client initialized with HTTP/1.1 keep-alive protection.")
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}")


_init_client()


def get_supabase(force_refresh: bool = False) -> Optional[Client]:
    """
    Returns the singleton Supabase client, re-initializing if force_refresh is True
    or if the client has not yet been initialized.
    """
    global supabase_client
    if force_refresh or supabase_client is None:
        _init_client()
    return supabase_client

