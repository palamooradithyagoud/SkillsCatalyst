import hmac
import hashlib
import secrets
import re
import uuid
import logging
import jwt
from jwt import PyJWKClient
from typing import Optional, Tuple, Any, Dict
from fastapi import Header, HTTPException, status, Depends
from backend.services.supabase_service import get_supabase
from backend.config import SECRET_KEY, OWNER_EMAIL, SUPABASE_JWT_SECRET, SUPABASE_URL, METRICS_SECRET_KEY

logger = logging.getLogger(__name__)

# Valid session ID pattern: UUID v4 format or sanitized guest prefix (min 16 chars)
_UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
_SAFE_GUEST_REGEX = re.compile(r"^guest_[a-zA-Z0-9_-]{12,128}$")


def is_valid_uuid(val: Any) -> bool:
    """Returns True if val is a valid RFC 4122 UUID string, preventing 22P02 database errors."""
    if not val:
        return False
    return bool(_UUID_REGEX.match(str(val).strip()))


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
        if isinstance(supa_user, dict):
            app_meta = supa_user.get("app_metadata") or {}
        else:
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

    # Fallback check against configured OWNER_EMAIL on supa_user object or dict
    if supa_user:
        u_email = (supa_user.get("email") if isinstance(supa_user, dict) else getattr(supa_user, "email", None)) or ""
        if u_email and str(u_email).strip().lower() == OWNER_EMAIL:
            return "owner"

    return "student"


_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> Optional[PyJWKClient]:
    """Returns singleton PyJWKClient with key caching for Supabase Auth asymmetric public keys."""
    global _jwks_client
    if _jwks_client is None and SUPABASE_URL:
        try:
            jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
            _jwks_client = PyJWKClient(jwks_url, cache_keys=True, max_cached_keys=16, lifespan=3600, timeout=10)
        except Exception as e:
            logger.debug(f"Failed to initialize Supabase JWKS client: {e}")
    return _jwks_client


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Authoritative Cryptographic Token Verification.
    1. Inspects token header to determine signing algorithm (HS256, ES256, RS256).
    2. Validates signatures locally:
       - HS256: verified against SUPABASE_JWT_SECRET.
       - ES256 / RS256: verified against Supabase JWKS public keys (supporting key rotation).
    3. Enforces expiration (exp), audience (aud), issuer (iss), and valid UUID subject (sub).
    4. Falls back to remote Supabase Auth API if verification keys are not available locally.
    5. Raises HTTPException 401 Unauthorized immediately if token is expired, tampered, or invalid.
    """
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    clean_token = token.strip()
    if clean_token in ("undefined", "null", ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    decoded = None
    header = None
    try:
        header = jwt.get_unverified_header(clean_token)
    except Exception:
        # Not a standard JWT format or unparseable local header.
        # Fall through to remote Supabase Auth verification fallback (supports test mocks & edge tokens).
        header = None

    if header:
        alg = header.get("alg")
        if alg and str(alg).lower() == "none":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unsupported token algorithm.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if alg in ("HS256", "ES256", "RS256"):
            key = None
            if alg == "HS256":
                key = SUPABASE_JWT_SECRET
            elif alg in ("ES256", "RS256"):
                jwks = _get_jwks_client()
                if jwks:
                    try:
                        signing_key = jwks.get_signing_key_from_jwt(clean_token)
                        key = signing_key.key
                    except Exception as jwks_err:
                        logger.debug(f"Local JWKS key resolution notice: {jwks_err}")

            if key:
                try:
                    decoded = jwt.decode(
                        clean_token,
                        key,
                        algorithms=[alg],
                        options={
                            "verify_signature": True,
                            "verify_exp": True,
                            "verify_aud": False,
                        },
                    )
                except jwt.ExpiredSignatureError:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication token has expired.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                except jwt.InvalidSignatureError:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication token signature.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                except jwt.DecodeError:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Malformed authentication token.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                except jwt.InvalidTokenError as ite:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Invalid authentication token: {ite}",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

    # Fallback to remote Supabase Auth verification if local key could not be resolved
    if decoded is None:
        sb = get_supabase()
        if sb:
            for attempt in range(2):
                try:
                    res = sb.auth.get_user(jwt=clean_token)
                    if res and res.user and res.user.id:
                        u = res.user
                        decoded = {
                            "sub": str(u.id),
                            "email": str(u.email or "").strip().lower(),
                            "user_metadata": getattr(u, "user_metadata", {}) or {},
                            "app_metadata": getattr(u, "app_metadata", {}) or {},
                        }
                        break
                except Exception as e:
                    err_msg = str(e)
                    if attempt == 0 and any(kw in err_msg for kw in ("ConnectionTerminated", "ConnectError", "RemoteProtocolError", "getaddrinfo")):
                        logger.warning(f"Supabase connection dropped during token validation, retrying: {e}")
                        sb = get_supabase(force_refresh=True)
                        continue
                    logger.warning(f"Supabase token validation failed [AUTH_ERROR]: {e}")
                    break

    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate audience if claim exists in token
    if "aud" in decoded:
        aud = decoded["aud"]
        if isinstance(aud, str) and aud not in ("authenticated", "anon"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif isinstance(aud, list) and not any(a in ("authenticated", "anon") for a in aud):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Validate issuer if claim exists in token and SUPABASE_URL configured
    if "iss" in decoded and SUPABASE_URL:
        expected_iss = f"{SUPABASE_URL.rstrip('/')}/auth/v1"
        if str(decoded["iss"]).rstrip("/") != expected_iss:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    u_id = str(decoded.get("sub") or "").strip()
    if not u_id or not is_valid_uuid(u_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identity in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return decoded


def require_authenticated_user(
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    Strict Production Authentication Dependency.
    Extracts & validates Supabase JWT Bearer token:
    1. Attempts ultra-fast local cryptographic JWT verification using SUPABASE_JWT_SECRET (HS256).
    2. Falls back to remote Supabase Auth API verification with automatic reconnection retry on network drops.
    Resolves authoritative user identity and role.
    Returns user dict: {user_id, email, name, role, is_owner} or raises HTTP 401 Unauthorized.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            decoded = verify_jwt_token(token)
            u_id = str(decoded["sub"])
            u_email = str(decoded.get("email") or "").strip().lower()
            user_meta = decoded.get("user_metadata") or {}
            u_name = (
                user_meta.get("full_name")
                or user_meta.get("name")
                or (u_email.split("@")[0] if u_email else "Learner")
            )
            role = get_user_role(u_id, decoded)
            return {
                "user_id": u_id,
                "email": u_email,
                "name": u_name,
                "role": role,
                "is_owner": (role == "owner"),
            }

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


def require_admin(
    current_user: Dict[str, Any] = Depends(require_authenticated_user),
) -> Dict[str, Any]:
    """
    Strict Admin & Content Manager Authorization Dependency.
    Enforces that the authenticated user possesses an authoritative privileged role:
    'owner', 'admin', or 'editor'.
    Raises HTTP 403 Forbidden if the user is a normal student or unauthorized.
    """
    if current_user.get("role") not in ("owner", "admin", "editor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin or content manager privileges required.",
        )
    return current_user


def require_metrics_access(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_monitoring_key: Optional[str] = Header(None, alias="X-Monitoring-Key"),
) -> Dict[str, Any]:
    """
    Authoritative Metrics Access Authorization Dependency (SEC-C-7).
    Protects /api/metrics from unauthenticated exposure.

    Permitted callers:
      1. Server-side monitoring identities presenting a valid METRICS_SECRET_KEY
         (via 'X-Monitoring-Key' header or 'Authorization: Bearer <METRICS_SECRET_KEY>').
      2. Authenticated Platform Owners or Administrators presenting a verified Supabase JWT
         ('owner' or 'admin' role).

    Rejection policy:
      - Missing or empty credentials -> HTTP 401 Unauthorized.
      - Invalid or malformed credentials -> HTTP 401 Unauthorized.
      - Authenticated students or unprivileged accounts -> HTTP 403 Forbidden.
    """
    # 1. Check dedicated X-Monitoring-Key header
    if x_monitoring_key is not None:
        clean_key = str(x_monitoring_key).strip()
        if clean_key and METRICS_SECRET_KEY and hmac.compare_digest(clean_key, METRICS_SECRET_KEY):
            return {"auth_type": "monitoring_key", "role": "monitor"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid monitoring credential.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if not token or token in ("undefined", "null", ""):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 2a. Check if Bearer token matches configured monitoring secret key
        if METRICS_SECRET_KEY and hmac.compare_digest(token, METRICS_SECRET_KEY):
            return {"auth_type": "monitoring_key", "role": "monitor"}

        # 2b. Authoritative Supabase JWT verification
        try:
            decoded = verify_jwt_token(token)
            u_id = str(decoded["sub"])
            role = get_user_role(u_id, decoded)
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Unexpected token verification exception [AUTH_ERROR]: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if role in ("owner", "admin"):
            return {
                "user_id": u_id,
                "email": str(decoded.get("email") or ""),
                "role": role,
                "auth_type": "jwt",
            }

        # Authenticated student or unprivileged caller
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative or monitoring privileges required.",
        )

    # 3. No valid credentials provided
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required to access metrics.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Strict Production Authentication Dependency.
    Extracts & validates Supabase JWT Bearer token cryptographically.
    Returns authenticated user's UUID or raises HTTP 401 Unauthorized.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token and token not in ("undefined", "null", ""):
            decoded = verify_jwt_token(token)
            return str(decoded["sub"])

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


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
    if raw_session_id and isinstance(raw_session_id, str):
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
    - If valid Bearer JWT provided: returns authenticated user's Supabase UUID via local cryptographic verification.
    - If invalid, expired, or malformed Bearer JWT provided: raises HTTP 401 Unauthorized (does not silently degrade to guest).
    - If no Bearer JWT provided (authorization is None or empty): resolves client x-session-id to verified guest token or namespaced guest session ID.
    Guarantees backward compatibility while preventing unauthenticated UUID spoofing.
    """
    if authorization and authorization.strip():
        if authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1].strip()
            if token and token not in ("undefined", "null", ""):
                # Cryptographically verify token; do NOT catch HTTPException (fail closed on invalid/expired credentials)
                decoded = verify_jwt_token(token)
                if decoded and decoded.get("sub"):
                    return str(decoded["sub"])
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid user identity in token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme. Bearer token required.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    raw_session = x_session_id if isinstance(x_session_id, str) else None
    raw_db_id, _ = sanitize_or_generate_guest_id(raw_session)
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
            try:
                decoded = verify_jwt_token(token)
                if decoded and decoded.get("sub"):
                    return str(decoded["sub"])
            except Exception:
                pass
    return None

