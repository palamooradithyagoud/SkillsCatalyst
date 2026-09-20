import hmac
import hashlib
import secrets
import re
import uuid
import logging
from typing import Optional, Tuple, Any, Dict
from fastapi import Header, HTTPException, status, Depends
from backend.services.supabase_service import get_supabase
from backend.config import SECRET_KEY, OWNER_EMAIL

logger = logging.getLogger(__name__)

# Valid session ID pattern: UUID v4 format or sanitized guest prefix (min 16 chars)
_UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
_SAFE_GUEST_REGEX = re.compile(r"^guest_[a-zA-Z0-9_-]{12,128}$")


def get_user_role(user_id: str, supa_user: Any = None) -> str:
    """
    Authoritative Role Resolution:
    1. Reads server-controlled app_metadata.role from Supabase Auth (encoded in JWT).
    2. Fallback: reads public.profiles.role if populated.
    3. Server-side bootstrap safeguard: if user email matches configured OWNER_EMAIL,
       ensures role is promoted in Supabase Auth & profiles, returning 'owner'.
    4. Defaults strictly to 'student'.
    """
    # 1. Authoritative check: app_metadata.role in Supabase Auth JWT
    if supa_user:
        app_meta = getattr(supa_user, "app_metadata", None) or {}
        if isinstance(app_meta, dict) and app_meta.get("role"):
            return str(app_meta["role"]).strip().lower()

    sb = get_supabase()
    if sb and user_id:
        # 2. Check public.profiles.role
        try:
            res = sb.from_("profiles").select("role, email").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                p_row = res.data[0]
                db_role = p_row.get("role")
                if db_role and str(db_role).strip():
                    return str(db_role).strip().lower()
                # Server-side bootstrap safeguard for configured owner
                if p_row.get("email") and p_row.get("email").strip().lower() == OWNER_EMAIL:
                    try:
                        sb.auth.admin.update_user_by_id(user_id, {"app_metadata": {"role": "owner"}})
                    except Exception:
                        pass
                    return "owner"
        except Exception as e:
            logger.debug(f"profiles role query notice: {e}")

    # Fallback check against configured OWNER_EMAIL on supa_user object
    if supa_user and getattr(supa_user, "email", None):
        if str(supa_user.email).strip().lower() == OWNER_EMAIL:
            return "owner"

    return "student"


def require_authenticated_user(
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    Strict Production Authentication Dependency.
    Extracts & validates Supabase JWT Bearer token.
    Resolves authoritative user identity and role.
    Returns user dict: {user_id, email, name, role, is_owner} or raises HTTP 401 Unauthorized.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            sb = get_supabase()
            if sb:
                try:
                    res = sb.auth.get_user(jwt=token)
                    if res and res.user and res.user.id:
                        u = res.user
                        u_id = str(u.id)
                        u_email = str(u.email or "").strip().lower()
                        user_meta = getattr(u, "user_metadata", {}) or {}
                        u_name = (
                            user_meta.get("full_name")
                            or user_meta.get("name")
                            or (u_email.split("@")[0] if u_email else "Learner")
                        )
                        role = get_user_role(u_id, u)
                        return {
                            "user_id": u_id,
                            "email": u_email,
                            "name": u_name,
                            "role": role,
                            "is_owner": (role == "owner"),
                        }
                except Exception as e:
                    logger.warning(f"Supabase token validation failed [AUTH_ERROR]: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_owner(
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
) -> Dict[str, Any]:
    """
    Strict Owner Authorization Dependency.
    Enforces that the authenticated user possesses authoritative 'owner' role.
    Raises HTTP 403 Forbidden if the user is a normal student or unauthorized.
    """
    if current_user.get("role") != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Platform Owner privileges required.",
        )
    return current_user


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Strict Production Authentication Dependency.
    Extracts & validates Supabase JWT Bearer token.
    Returns authenticated user's UUID or raises HTTP 401 Unauthorized.
    """
    user_info = require_authenticated_user(authorization=authorization)
    return user_info["user_id"]


def _sign_guest_id(guest_hex: str) -> str:
    """Signs a guest identifier with HMAC-SHA256 using server SECRET_KEY."""
    signature = hmac.new(SECRET_KEY.encode("utf-8"), guest_hex.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    return f"{guest_hex}.{signature}"


def _verify_guest_id(signed_guest_id: str) -> Optional[str]:
    """
    Verifies HMAC signature of a guest session ID token.
    Returns the underlying raw guest ID if valid, else None.
    """
    if not signed_guest_id or "." not in signed_guest_id:
        return None
    parts = signed_guest_id.rsplit(".", 1)
    if len(parts) != 2:
        return None
    guest_hex, sig = parts[0], parts[1]
    expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), guest_hex.encode("utf-8"), hashlib.sha256).hexdigest()[:16]
    if hmac.compare_digest(sig, expected_sig):
        return guest_hex
    return None


def sanitize_or_generate_guest_id(raw_session_id: Optional[str]) -> Tuple[str, str]:
    """
    Sanitizes client-provided x-session-id or generates a cryptographically isolated signed guest ID.
    Returns (raw_session_id_for_db, signed_session_token_for_client).

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
                raw_id = _verify_guest_id(cleaned)
                if raw_id:
                    return raw_id, cleaned

            # 2. Legacy guest token support (backward compatibility for active guest sessions)
            # CLEANUP_PHASE_3: In Phase 3 after all active clients have migrated, remove unsigned legacy token support.
            if cleaned.startswith("guest_") and _SAFE_GUEST_REGEX.match(cleaned):
                signed_token = _sign_guest_id(cleaned)
                return cleaned, signed_token

            # 3. Unauthenticated raw UUID attempt — namespace to guest to prevent IDOR spoofing
            if _UUID_REGEX.match(cleaned):
                namespaced_guest_hex = f"guest_{cleaned.replace('-', '')[:24]}"
                signed_token = _sign_guest_id(namespaced_guest_hex)
                return namespaced_guest_hex, signed_token

    # 4. Generate fresh HMAC-signed guest session token
    new_guest_hex = f"guest_{secrets.token_hex(16)}"
    signed_token = _sign_guest_id(new_guest_hex)
    return new_guest_hex, signed_token


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

    raw_db_id, _ = sanitize_or_generate_guest_id(x_session_id)
    return raw_db_id


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

