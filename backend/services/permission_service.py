"""
backend/services/permission_service.py
Authoritative, granular RBAC permission and audit service for SkillsCatalyst.
Enforces owner-only role governance, least-privilege administrative access,
cryptographic user-ID verification, and comprehensive security audit logging.
"""

import time
import json
import logging
from typing import List, Set, Dict, Any, Optional, Callable
from fastapi import HTTPException, status, Depends, Request

from backend.config import OWNER_USER_ID, OWNER_USERNAME, OWNER_EMAIL
from backend.services.supabase_service import get_supabase
from backend.services.cache_service import get_redis_client

logger = logging.getLogger("skillscatalyst.permissions")

# ── Granular Permissions Catalog ──────────────────────────────────────────────
# Granular permissions for administrative content-management sections:
# scholarships, events, hackathons, and tech news.
SCHOLARSHIPS_PERMISSIONS = frozenset({
    "scholarships.read",
    "scholarships.create",
    "scholarships.update",
    "scholarships.publish",
    "scholarships.delete",
})

EVENTS_PERMISSIONS = frozenset({
    "events.read",
    "events.create",
    "events.update",
    "events.publish",
    "events.delete",
})

HACKATHONS_PERMISSIONS = frozenset({
    "hackathons.read",
    "hackathons.create",
    "hackathons.update",
    "hackathons.publish",
    "hackathons.delete",
})

TECH_NEWS_PERMISSIONS = frozenset({
    "tech_news.read",
    "tech_news.create",
    "tech_news.update",
    "tech_news.publish",
    "tech_news.delete",
})

ALL_VALID_PERMISSIONS: Set[str] = set(
    SCHOLARSHIPS_PERMISSIONS
    | EVENTS_PERMISSIONS
    | HACKATHONS_PERMISSIONS
    | TECH_NEWS_PERMISSIONS
)

SECTION_PERMISSIONS_MAP: Dict[str, List[str]] = {
    "scholarships": sorted(list(SCHOLARSHIPS_PERMISSIONS)),
    "events": sorted(list(EVENTS_PERMISSIONS)),
    "hackathons": sorted(list(HACKATHONS_PERMISSIONS)),
    "tech_news": sorted(list(TECH_NEWS_PERMISSIONS)),
}

# In-memory TTL cache fallback when Redis is unconfigured/unavailable
_IN_MEMORY_PERMS_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


# ── Owner Account Verification ────────────────────────────────────────────────

def is_authoritative_owner(user_id: Optional[str]) -> bool:
    """
    Verifies that the caller's immutable UUID matches the configured OWNER_USER_ID.
    
    Security rules:
    - Never trusts a username, email, or role submitted by the client.
    - If user_id is missing or doesn't match OWNER_USER_ID, returns False.
    - Fails closed if OWNER_USER_ID is not configured.
    """
    if not user_id or not OWNER_USER_ID:
        return False
    return str(user_id).strip().lower() == str(OWNER_USER_ID).strip().lower()


def validate_permissions_list(permissions: List[str], allow_empty: bool = False) -> List[str]:
    """
    Strictly validates a list of requested permissions against ALL_VALID_PERMISSIONS.
    Rejects any unknown, malformed, or injected permission strings.
    Returns deduplicated, sorted list of valid permissions.
    """
    if not isinstance(permissions, (list, tuple, set)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Permissions payload must be a list of strings.",
        )

    if not permissions and not allow_empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one permission must be specified.",
        )

    validated = set()
    invalid_perms = []

    for p in permissions:
        clean_p = str(p).strip().lower()
        if not clean_p:
            continue
        if clean_p in ALL_VALID_PERMISSIONS:
            validated.add(clean_p)
        else:
            invalid_perms.append(str(p))

    if invalid_perms:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid permission(s) requested: {', '.join(invalid_perms)}. "
                f"Valid permissions are: {', '.join(sorted(ALL_VALID_PERMISSIONS))}"
            ),
        )

    return sorted(list(validated))


# ── Cache Layer & Invalidation ────────────────────────────────────────────────

def _cache_key(user_id: str) -> str:
    return f"sc:admin:perms:{user_id}"


def get_cached_permissions(user_id: str) -> Optional[List[str]]:
    """Checks Redis or in-memory cache for user permissions."""
    r = get_redis_client()
    if r:
        try:
            cached = r.get(_cache_key(user_id))
            if cached is not None:
                return json.loads(cached)
        except Exception as e:
            logger.debug(f"Redis permission cache read error: {e}")

    # Fallback to in-memory cache
    entry = _IN_MEMORY_PERMS_CACHE.get(user_id)
    if entry:
        if time.time() < entry["expires_at"]:
            return entry["perms"]
        else:
            _IN_MEMORY_PERMS_CACHE.pop(user_id, None)

    return None


def set_cached_permissions(user_id: str, permissions: List[str], ttl: int = CACHE_TTL_SECONDS) -> None:
    """Sets user permissions in Redis and in-memory cache."""
    r = get_redis_client()
    if r:
        try:
            r.setex(_cache_key(user_id), ttl, json.dumps(permissions))
        except Exception as e:
            logger.debug(f"Redis permission cache write error: {e}")

    _IN_MEMORY_PERMS_CACHE[user_id] = {
        "perms": permissions,
        "expires_at": time.time() + ttl,
    }


def invalidate_permission_cache(user_id: str) -> None:
    """
    Immediately purges permission caches for the target user across Redis and in-memory.
    Guarantees that role or permission revocations take effect on the next request.
    """
    r = get_redis_client()
    if r:
        try:
            r.delete(_cache_key(user_id))
        except Exception as e:
            logger.debug(f"Redis cache delete error: {e}")

    _IN_MEMORY_PERMS_CACHE.pop(user_id, None)


# ── Permission Retrieval ──────────────────────────────────────────────────────

def get_user_permissions(user_id: str) -> List[str]:
    """
    Authoritative resolution of granular administrative permissions.
    1. If user is authoritative owner -> returns all valid permissions.
    2. Check Redis / in-memory cache.
    3. Query Supabase public.admin_permissions.
    4. If not found or empty -> returns empty list [].
    """
    if not user_id:
        return []

    # Owner implicitly holds all administrative permissions
    if is_authoritative_owner(user_id):
        return sorted(list(ALL_VALID_PERMISSIONS))

    # Check cache
    cached = get_cached_permissions(user_id)
    if cached is not None:
        return cached

    sb = get_supabase()
    permissions: List[str] = []

    if sb:
        try:
            res = sb.from_("admin_permissions").select("permissions").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                raw_perms = res.data[0].get("permissions") or []
                permissions = [p for p in raw_perms if p in ALL_VALID_PERMISSIONS]
        except Exception as e:
            logger.warning(f"Failed to query admin_permissions for user {user_id}: {e}")

    set_cached_permissions(user_id, permissions)
    return permissions


def check_has_permission(user_id: str, permission: str) -> bool:
    """
    Checks if user_id possesses the specified granular permission.
    Handles mutual alias for Events & Hackathons since they share the CMS event router.
    """
    if is_authoritative_owner(user_id):
        return True

    perms = get_user_permissions(user_id)
    if permission in perms:
        return True

    # Section-level aliasing for events & hackathons
    if permission.startswith("events."):
        hackathon_alias = permission.replace("events.", "hackathons.", 1)
        if hackathon_alias in perms:
            return True
    elif permission.startswith("hackathons."):
        event_alias = permission.replace("hackathons.", "events.", 1)
        if event_alias in perms:
            return True

    return False


# ── Role & Permission Management (Owner-Controlled) ───────────────────────────

def record_audit_log(
    actor_id: str,
    target_id: str,
    action: str,
    previous_role: str,
    new_role: str,
    previous_permissions: List[str],
    new_permissions: List[str],
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> None:
    """
    Appends an immutable audit record to public.admin_role_audit_logs.
    Captures actor ID, target ID, action, role transition, permission delta, and timestamp.
    """
    sb = get_supabase()
    if not sb:
        logger.warning("Supabase client unavailable for admin audit log recording.")
        return

    try:
        sb.from_("admin_role_audit_logs").insert({
            "actor_id": actor_id,
            "target_id": target_id,
            "action": action,
            "previous_role": previous_role,
            "new_role": new_role,
            "previous_permissions": previous_permissions,
            "new_permissions": new_permissions,
            "reason": reason,
            "ip_address": ip_address,
        }).execute()
        logger.info(
            f"ADMIN_AUDIT: actor={actor_id} target={target_id} action={action} "
            f"role=({previous_role} -> {new_role}) perms_count=({len(previous_permissions)} -> {len(new_permissions)})"
        )
    except Exception as e:
        logger.error(f"Failed to write admin role audit log: {e}")


def grant_admin_access(
    actor_id: str,
    target_id: str,
    permissions: List[str],
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Grants Admin access and granular permissions to a target user.
    Strictly restricted to authoritative platform owner.
    """
    if not is_authoritative_owner(actor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the authoritative platform owner can grant Admin access.",
        )

    if is_authoritative_owner(target_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform owner access cannot be modified through role management.",
        )

    valid_perms = validate_permissions_list(permissions)
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    # 1. Inspect existing profile
    prof_res = sb.from_("profiles").select("id, email, full_name, role").eq("id", target_id).execute()
    if not prof_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user '{target_id}' does not exist.",
        )

    target_profile = prof_res.data[0]
    previous_role = target_profile.get("role") or "student"
    previous_perms = get_user_permissions(target_id)

    # 2. Update profiles.role to 'admin'
    sb.from_("profiles").update({"role": "admin"}).eq("id", target_id).execute()

    # 3. Synchronize Supabase Auth app_metadata if admin API is accessible
    try:
        sb.auth.admin.update_user_by_id(target_id, {"app_metadata": {"role": "admin"}})
    except Exception as e:
        logger.debug(f"Notice: Supabase auth.admin metadata sync: {e}")

    # 4. Upsert admin_permissions
    sb.from_("admin_permissions").upsert({
        "user_id": target_id,
        "permissions": valid_perms,
        "granted_by": actor_id,
        "updated_at": "NOW()",
    }).execute()

    # 5. Invalidate caches immediately
    invalidate_permission_cache(target_id)

    # 6. Record audit log
    record_audit_log(
        actor_id=actor_id,
        target_id=target_id,
        action="grant_admin",
        previous_role=previous_role,
        new_role="admin",
        previous_permissions=previous_perms,
        new_permissions=valid_perms,
        reason=reason,
        ip_address=ip_address,
    )

    return {
        "user_id": target_id,
        "role": "admin",
        "permissions": valid_perms,
        "granted_by": actor_id,
        "message": f"Successfully granted Admin access with {len(valid_perms)} permissions.",
    }


def revoke_admin_access(
    actor_id: str,
    target_id: str,
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Revokes Admin access from a user, restoring their role to 'student' and clearing permissions.
    Strictly restricted to authoritative platform owner.
    """
    if not is_authoritative_owner(actor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the authoritative platform owner can revoke Admin access.",
        )

    if is_authoritative_owner(target_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform owner access cannot be revoked through role management.",
        )

    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    prof_res = sb.from_("profiles").select("id, email, full_name, role").eq("id", target_id).execute()
    if not prof_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user '{target_id}' does not exist.",
        )

    target_profile = prof_res.data[0]
    previous_role = target_profile.get("role") or "student"
    previous_perms = get_user_permissions(target_id)

    # 1. Update profiles.role to 'student'
    sb.from_("profiles").update({"role": "student"}).eq("id", target_id).execute()

    # 2. Update Supabase Auth app_metadata
    try:
        sb.auth.admin.update_user_by_id(target_id, {"app_metadata": {"role": "student"}})
    except Exception as e:
        logger.debug(f"Notice: Supabase auth.admin metadata sync: {e}")

    # 3. Clear admin_permissions
    sb.from_("admin_permissions").delete().eq("user_id", target_id).execute()

    # 4. Invalidate caches immediately
    invalidate_permission_cache(target_id)

    # 5. Record audit log
    record_audit_log(
        actor_id=actor_id,
        target_id=target_id,
        action="revoke_admin",
        previous_role=previous_role,
        new_role="student",
        previous_permissions=previous_perms,
        new_permissions=[],
        reason=reason,
        ip_address=ip_address,
    )

    return {
        "user_id": target_id,
        "role": "student",
        "permissions": [],
        "message": "Successfully revoked Admin access. User reverted to student.",
    }


def update_admin_permissions(
    actor_id: str,
    target_id: str,
    permissions: List[str],
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Updates the granular permission set for an existing Admin.
    Strictly restricted to authoritative platform owner.
    """
    if not is_authoritative_owner(actor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the authoritative platform owner can update Admin permissions.",
        )

    if is_authoritative_owner(target_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform owner permissions cannot be modified through role management.",
        )

    valid_perms = validate_permissions_list(permissions)
    sb = get_supabase()
    if not sb:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable.",
        )

    prof_res = sb.from_("profiles").select("id, email, full_name, role").eq("id", target_id).execute()
    if not prof_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user '{target_id}' does not exist.",
        )

    current_role = prof_res.data[0].get("role") or "student"
    previous_perms = get_user_permissions(target_id)

    # Update admin_permissions
    sb.from_("admin_permissions").upsert({
        "user_id": target_id,
        "permissions": valid_perms,
        "granted_by": actor_id,
        "updated_at": "NOW()",
    }).execute()

    invalidate_permission_cache(target_id)

    record_audit_log(
        actor_id=actor_id,
        target_id=target_id,
        action="update_permissions",
        previous_role=current_role,
        new_role=current_role,
        previous_permissions=previous_perms,
        new_permissions=valid_perms,
        reason=reason,
        ip_address=ip_address,
    )

    return {
        "user_id": target_id,
        "role": current_role,
        "permissions": valid_perms,
        "message": f"Successfully updated permissions ({len(valid_perms)} active).",
    }


def get_audit_logs(
    actor_id: str,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    Fetches administrative role and permission change audit logs.
    Strictly restricted to authoritative platform owner.
    """
    if not is_authoritative_owner(actor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the authoritative platform owner can review audit logs.",
        )

    sb = get_supabase()
    if not sb:
        return []

    try:
        res = (
            sb.from_("admin_role_audit_logs")
            .select("id, actor_id, target_id, action, previous_role, new_role, previous_permissions, new_permissions, reason, ip_address, created_at")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error(f"Failed to query audit logs: {e}")
        return []


# ── Centralized Authorization Dependencies ────────────────────────────────────

from backend.services.auth_service import require_authenticated_user


def require_permission(required_permission: str) -> Callable:
    """
    FastAPI dependency factory enforcing a specific granular permission.
    
    Authorization flow:
    1. Authenticates caller via require_authenticated_user.
    2. If caller is authoritative owner -> authorized immediately.
    3. If caller's role is not 'admin' or 'owner' -> HTTP 403 Forbidden.
    4. Resolves caller's granular permissions from DB/cache.
    5. Checks if required_permission is present (with event/hackathon aliasing).
    6. If missing -> raises HTTP 403 Forbidden with exact missing permission detail.
    """
    clean_req = required_permission.strip().lower()

    def _dependency(
        current_user: Dict[str, Any] = Depends(require_authenticated_user)
    ) -> Dict[str, Any]:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        # Platform owner holds unrestricted administrative access
        if is_authoritative_owner(user_id) or current_user.get("is_owner"):
            return current_user

        user_role = current_user.get("role")
        if user_role not in ("owner", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Administrative access required for {clean_req}.",
            )

        if not check_has_permission(user_id, clean_req):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Missing required administrative permission '{clean_req}'.",
            )

        return current_user

    return _dependency


def require_any_permission(*permissions: str) -> Callable:
    """
    FastAPI dependency factory enforcing that caller possesses at least ONE of the specified permissions.
    """
    clean_perms = [p.strip().lower() for p in permissions]

    def _dependency(
        current_user: Dict[str, Any] = Depends(require_authenticated_user)
    ) -> Dict[str, Any]:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        if is_authoritative_owner(user_id) or current_user.get("is_owner"):
            return current_user

        user_role = current_user.get("role")
        if user_role not in ("owner", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Administrative access required.",
            )

        has_any = any(check_has_permission(user_id, p) for p in clean_perms)
        if not has_any:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Forbidden: Missing required administrative permission. "
                    f"Requires at least one of: {', '.join(clean_perms)}."
                ),
            )

        return current_user

    return _dependency
