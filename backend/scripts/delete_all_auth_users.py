"""
SkillsCatalyst - Supabase Auth User Cleanup Script
Deletes all registered Auth users safely via the Supabase Admin API.
"""

import os
import sys
from supabase import create_client

def delete_all_users():
    url = os.environ.get("SUPABASE_URL") or "https://zzjxprhapptjoziwdcro.supabase.co"
    service_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not service_key:
        print("ERROR: SUPABASE_SERVICE_KEY environment variable is required to access Admin API.")
        print("Set SUPABASE_SERVICE_KEY and rerun: python backend/scripts/delete_all_auth_users.py")
        sys.exit(1)

    print(f"Connecting to Supabase Admin API at {url}...")
    sb = create_client(url, service_key)

    try:
        users = sb.auth.admin.list_users()
        print(f"Found {len(users)} registered auth user(s). Deleting...")
        
        for u in users:
            uid = u.id
            email = u.email
            print(f"Deleting Auth User: {email} (ID: {uid})...")
            sb.auth.admin.delete_user(uid)

        remaining = sb.auth.admin.list_users()
        print(f"Cleanup complete. Remaining auth users: {len(remaining)}")
    except Exception as e:
        print(f"Error executing Auth user cleanup: {e}")

if __name__ == "__main__":
    delete_all_users()
