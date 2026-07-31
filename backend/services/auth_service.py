import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Extracts and validates the authenticated Supabase user UUID from a Bearer JWT token.

    SECURITY CONTRACT:
    - The ONLY accepted identity source is a valid Supabase Bearer JWT.
    - query-param ?user_id is NEVER trusted for authentication.
    - request body user_id is NEVER trusted for authentication.
    - 'default_user' fallback is NEVER returned.
    - jwt.decode with verify_signature=False is NEVER used.
    - Any missing, malformed, invalid, expired, or forged token returns HTTP 401.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()

    if not token or token in ("undefined", "null", ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or empty authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate token against Supabase Auth (cryptographically verified server-side)
    sb = get_supabase()
    if sb:
        try:
            res = sb.auth.get_user(jwt=token)
            if res and res.user and res.user.id:
                return str(res.user.id)
        except Exception as e:
            logger.warning(f"Supabase token validation failed: {e}")

    # If Supabase validation failed or client unavailable → reject with 401
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication token is invalid or expired. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_optional_user_id(
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    """
    Optional auth dependency — returns UUID if valid token provided, None otherwise.
    Use ONLY for endpoints that have meaningful unauthenticated behaviour (e.g. public search).
    Do NOT use for any user-data endpoints.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    if not token or token in ("undefined", "null", ""):
        return None
    sb = get_supabase()
    if sb:
        try:
            res = sb.auth.get_user(jwt=token)
            if res and res.user and res.user.id:
                return str(res.user.id)
        except Exception:
            pass
    return None
