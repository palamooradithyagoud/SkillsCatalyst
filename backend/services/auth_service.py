import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Strict Production Authentication Dependency.
    Extracts & validates Supabase JWT Bearer token.
    Returns authenticated user's UUID or raises HTTP 401 Unauthorized.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            sb = get_supabase()
            if sb:
                try:
                    res = sb.auth.get_user(jwt=token)
                    if res and res.user and res.user.id:
                        return str(res.user.id)
                except Exception as e:
                    logger.warning(f"Supabase token validation failed: {e}")

    # No fallback — raise 401 Unauthorized for unauthenticated requests
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_session_or_user_id(
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None, alias="x-session-id"),
) -> str:
    """
    Session Identity Resolver for Supabase Storage.
    Returns authenticated user's Supabase UUID if Bearer JWT is valid.
    Otherwise returns x_session_id header or guest session ID.
    Guarantees that every request (guest or logged-in) has a valid session_id for Supabase DB storage.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            sb = get_supabase()
            if sb:
                try:
                    res = sb.auth.get_user(jwt=token)
                    if res and res.user and res.user.id:
                        return str(res.user.id)
                except Exception as e:
                    logger.warning(f"Supabase token validation failed: {e}")

    if x_session_id and x_session_id.strip() and x_session_id.strip() not in ("undefined", "null", ""):
        return x_session_id.strip()

    return "guest_session_default"


def get_optional_user_id(
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    """
    Optional auth helper for public routes. Returns UUID if valid Bearer token provided, else None.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            sb = get_supabase()
            if sb:
                try:
                    res = sb.auth.get_user(jwt=token)
                    if res and res.user and res.user.id:
                        return str(res.user.id)
                except Exception:
                    pass
    return None

