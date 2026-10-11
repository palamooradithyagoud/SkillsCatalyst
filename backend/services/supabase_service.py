import logging
import httpx
from typing import Optional
from supabase import create_client, Client, ClientOptions
from backend.config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

logger = logging.getLogger(__name__)

supabase_client: Optional[Client] = None


class ObservableHTTPTransport(httpx.HTTPTransport):
    """
    Production-grade HTTP transport for Supabase/PostgREST.
    1. Records duration, operation, table, status_code, and row count into observability telemetry.
    2. Enforces privacy safety: never logs or inspects secrets, JWTs, query parameters, or row payloads.
    3. Provides bounded retry (max 1 retry) ONLY for idempotent GET/HEAD requests during transient network drops.
    4. Never retries mutations (POST, PATCH, DELETE) to strictly prevent duplicate writes.
    """
    def handle_request(self, request: httpx.Request) -> httpx.Response:
        import time
        from backend.services.observability import record_db_operation

        start_time = time.perf_counter()
        method = request.method.upper()
        url_path = request.url.path

        # Safely extract table or resource name from URL path
        table_name = "unknown"
        if "/rest/v1/" in url_path:
            parts = url_path.split("/rest/v1/", 1)[1].split("?", 1)[0].split("/", 1)
            table_name = parts[0] if parts and parts[0] else "unknown"
        elif "/auth/v1/" in url_path:
            parts = url_path.split("/auth/v1/", 1)[1].split("?", 1)[0].split("/", 1)
            table_name = f"auth_{parts[0]}" if parts and parts[0] else "auth"
        elif "/rpc/" in url_path:
            parts = url_path.split("/rpc/", 1)[1].split("?", 1)[0].split("/", 1)
            table_name = f"rpc_{parts[0]}" if parts and parts[0] else "rpc"

        op_label = f"{method}:{table_name}"
        is_idempotent = method in ("GET", "HEAD")
        max_attempts = 2 if is_idempotent else 1

        for attempt in range(max_attempts):
            try:
                response = super().handle_request(request)
                duration_ms = (time.perf_counter() - start_time) * 1000.0

                # Extract row count if present in Content-Range header without parsing response body
                row_count = None
                cr = response.headers.get("content-range")
                if cr and "/" in cr:
                    total_str = cr.split("/", 1)[1].strip()
                    if total_str.isdigit():
                        row_count = int(total_str)

                record_db_operation(
                    operation=op_label,
                    method=method,
                    table=table_name,
                    duration_ms=duration_ms,
                    success=(response.status_code < 400),
                    status_code=response.status_code,
                    row_count=row_count,
                )
                return response
            except (httpx.ConnectError, httpx.RemoteProtocolError, httpx.ReadTimeout) as exc:
                if attempt < max_attempts - 1:
                    time.sleep(0.1)
                    continue
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                record_db_operation(
                    operation=op_label,
                    method=method,
                    table=table_name,
                    duration_ms=duration_ms,
                    success=False,
                    status_code=None,
                    error_category=type(exc).__name__,
                )
                raise
            except Exception as exc:
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                record_db_operation(
                    operation=op_label,
                    method=method,
                    table=table_name,
                    duration_ms=duration_ms,
                    success=False,
                    status_code=None,
                    error_category=type(exc).__name__,
                )
                raise


def _create_robust_client(url: str, key: str) -> Client:
    """
    Creates a Supabase client with HTTP/1.1 explicitly enforced (http2=False).
    Instruments all PostgREST operations with privacy-safe duration telemetry and bounded read retries.
    """
    transport = ObservableHTTPTransport(
        http2=False,
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=50, keepalive_expiry=15.0),
    )
    custom_httpx = httpx.Client(
        http2=False,
        transport=transport,
        timeout=httpx.Timeout(20.0, connect=10.0),
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

