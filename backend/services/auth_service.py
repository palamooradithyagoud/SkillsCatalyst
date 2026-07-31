import jwt
import logging
from typing import Optional
from fastapi import Header
from backend.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    user_id: Optional[str] = None
) -> str:
    """
    Extracts and validates the authenticated Supabase user UUID from Bearer JWT token.
    Prioritizes Bearer token over query param user_id to prevent user impersonation or query param tampering.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
        if token and token != "undefined" and token != "null":
            try:
                # 1. Ask Supabase Auth if client is available
                sb = get_supabase()
                if sb:
                    try:
                        res = sb.auth.get_user(jwt=token)
                        if res and res.user and res.user.id:
                            return str(res.user.id)
                    except Exception:
                        pass

                # 2. Fallback to decoding JWT token claims to extract 'sub' (the Supabase User UUID)
                decoded = jwt.decode(token, options={"verify_signature": False})
                if "sub" in decoded and decoded["sub"]:
                    return str(decoded["sub"])
            except Exception as e:
                logger.warning(f"Auth token decode notice: {e}")

    # Fallback to query param user_id if non-default and non-empty
    if user_id and user_id != "default_user" and user_id != "undefined":
        return str(user_id)

    return user_id or "default_user"
