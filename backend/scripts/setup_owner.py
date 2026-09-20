"""
backend/scripts/setup_owner.py
Secure Server-Side Owner Bootstrap Script for SkillsCatalyst.

Usage:
    python backend/scripts/setup_owner.py [email]

Examples:
    python backend/scripts/setup_owner.py
    python backend/scripts/setup_owner.py palamooradithyagoud@gmail.com
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.services.supabase_service import get_supabase
from backend.config import SUPABASE_SERVICE_KEY

DEFAULT_OWNER_EMAIL = "palamooradithyagoud@gmail.com"


def setup_owner(target_email: str = DEFAULT_OWNER_EMAIL) -> bool:
    clean_email = target_email.strip().lower()
    print("=" * 70)
    print(f"[SkillsCatalyst Owner Bootstrap] Target Account: {clean_email}")
    print("=" * 70)

    sb = get_supabase()
    if not sb:
        print("[ERROR] Supabase client could not be initialized.")
        return False

    if not SUPABASE_SERVICE_KEY:
        print("[ERROR] SUPABASE_SERVICE_KEY is required to bootstrap owner role.")
        return False

    # 1. Search for user in auth.users via admin API
    try:
        # List users and find target
        users_page = sb.auth.admin.list_users()
        user_id = None
        target_user = None

        for u in users_page:
            if u.email and u.email.strip().lower() == clean_email:
                user_id = u.id
                target_user = u
                break

        if not user_id:
            # Fallback search via profiles table
            p_res = sb.from_("profiles").select("id, email").eq("email", clean_email).execute()
            if p_res.data and len(p_res.data) > 0:
                user_id = p_res.data[0]["id"]
                target_user = sb.auth.admin.get_user_by_id(user_id).user

        if not user_id:
            print(f"[ERROR] User account with email '{clean_email}' not found in Supabase Auth or profiles.")
            print("Please log in with this Google account once first, then re-run this bootstrap script.")
            return False

        print(f"[FOUND] User ID: {user_id}")
        current_app_meta = target_user.app_metadata or {}
        print(f"[CURRENT] Existing app_metadata: {current_app_meta}")

        # 2. Update auth.users app_metadata with role = 'owner'
        new_app_meta = dict(current_app_meta)
        new_app_meta["role"] = "owner"

        admin_res = sb.auth.admin.update_user_by_id(
            user_id,
            {"app_metadata": new_app_meta}
        )

        if not admin_res or not admin_res.user:
            print("[ERROR] Failed to update auth.users app_metadata.")
            return False

        print(f"[SUCCESS] Updated auth.users app_metadata: {admin_res.user.app_metadata}")

        # 3. Synchronize profiles table role
        try:
            sb.from_("profiles").update({"role": "owner"}).eq("id", user_id).execute()
            print("[SUCCESS] Synchronized public.profiles role = 'owner'")
        except Exception as pe:
            print(f"[NOTICE] profiles table update: {pe}")
            print("Note: If 'profiles.role' column has not yet been added via SQL migration,")
            print("Supabase Auth app_metadata still provides authoritative JWT role enforcement.")

        # 4. Final verification
        verified_user = sb.auth.admin.get_user_by_id(user_id).user
        verified_role = (verified_user.app_metadata or {}).get("role")
        print("-" * 70)
        print(f"[VERIFIED] User Email: {verified_user.email}")
        print(f"[VERIFIED] User ID:    {verified_user.id}")
        print(f"[VERIFIED] Role Claim: {verified_role}")
        print("=" * 70)

        if verified_role == "owner":
            print(">>> OWNER BOOTSTRAP COMPLETE: Account is now the authoritative platform owner! <<<")
            return True
        else:
            print("[ERROR] Verification mismatch. Expected 'owner'.")
            return False

    except Exception as e:
        print(f"[FATAL] Owner bootstrap encountered an unexpected exception: {e}")
        return False


if __name__ == "__main__":
    email_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OWNER_EMAIL
    success = setup_owner(email_arg)
    sys.exit(0 if success else 1)
