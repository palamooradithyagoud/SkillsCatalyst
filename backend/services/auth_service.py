import hmac
import hashlib
import secrets
import re
import uuid
import logging
from typing import Optional, Tuple
from fastapi import Header, HTTPException, status
from backend.services.supabase_service import get_supabase
from backend.config import SECRET_KEY

logger = logging.getLogger(__name__)

# Valid session ID pattern: UUID v4 format or sanitized guest prefix (min 16 chars)
_UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
_SAFE_GUEST_REGEX = re.compile(r"^guest_[a-zA-Z0-9_-]{12,128}$")


def _sign_guest_id(guest_hex: str) -> str:
    """Signs a guest identifier with HMAC-SHA256 using server SECRET_KEY."""
    signature = hmac.new(SECRET_KEY.encode("utf-8"), guest_hex.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    return f"{guest_hex}.{signature}"


def _verify_guest_id(signed_guest_id: str) -> Optional[str]:
    """Verifies HMAC signature of a guest session ID token."""
    if not signed_guest_id or "." not in signed_guest_id:
        return None
    parts = signed_guest_id.rsplit(".", 1)
    if len(parts) != 2:
        return None
    guest_hex, sig = parts[0], parts[1]
    expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), guest_hex.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    if hmac.compare_digest(sig, expected_sig):
        return signed_guest_id
    return None


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
                    logger.warning(f"Supabase token validation failed [AUTH_ERROR]: {e}")

    # No fallback — raise 401 Unauthorized for unauthenticated requests
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def sanitize_or_generate_guest_id(raw_session_id: Optional[str]) -> Tuple[str, bool]:
    """
    Sanitizes client-provided x-session-id or generates a cryptographically isolated signed guest ID.
    Returns (resolved_session_id, is_newly_issued).
    - Checks HMAC signature for modern signed guest tokens (`guest_<hex>.<sig>`).
    - Accepts legacy unauthenticated guest IDs (`guest_...`) for full backward compatibility & zero data loss.
    - Prevents raw UUID impersonation without Bearer JWT (maps raw unauthenticated UUIDs to guest namespace).
    - Generates isolated HMAC-signed guest token if missing, invalid, or generic placeholder string.
    """
    if raw_session_id:
        cleaned = raw_session_id.strip()
        if cleaned not in ("undefined", "null", "", "guest_session_default"):
            # 1. Verify signed HMAC guest token
            if "." in cleaned and cleaned.startswith("guest_"):
                verified = _verify_guest_id(cleaned)
                if verified:
                    return verified, False

            # 2. Legacy guest token support (backward compatibility for active guest sessions)
            if cleaned.startswith("guest_") and _SAFE_GUEST_REGEX.match(cleaned):
                return cleaned, False

            # 3. Unauthenticated raw UUID attempt — namespace to guest to prevent IDOR spoofing
            if _UUID_REGEX.match(cleaned):
                namespaced_guest_hex = f"guest_{cleaned.replace('-', '')[:24]}"
                signed_id = _sign_guest_id(namespaced_guest_hex)
                return signed_id, True

    # 4. Generate fresh HMAC-signed guest session token
    new_guest_hex = f"guest_{secrets.token_hex(16)}"
    signed_id = _sign_guest_id(new_guest_hex)
    return signed_id, True


def get_session_or_user_id(
    authorization: Optional[str] = Header(None),
    x_session_id: Optional[str] = Header(None, alias="x-session-id"),
) -> str:
    """
    Secure Session Identity Resolver.
    - If valid Bearer JWT provided: returns authenticated user's Supabase UUID.
    - Else: resolves client x-session-id to verified guest token or namespaced guest session ID.
    Guarantees backward compatibility while preventing unauthenticated UUID spoofing.
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
                    logger.warning(f"Supabase token validation failed [AUTH_ERROR]: {e}")

    session_id, _ = sanitize_or_generate_guest_id(x_session_id)
    return session_id


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

