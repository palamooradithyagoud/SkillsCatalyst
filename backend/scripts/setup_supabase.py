"""
Supabase Schema Generator & Setup Script
"""
from pathlib import Path
from backend.services.supabase_service import get_supabase

SCHEMA_FILE = Path(__file__).resolve().parent / "supabase_schema.sql"

if __name__ == "__main__":
    if SCHEMA_FILE.exists():
        sql_content = SCHEMA_FILE.read_text(encoding="utf-8")
        sb = get_supabase()
        if sb:
            try:
                sb.rpc("exec_sql", {"sql": sql_content}).execute()
                print("[SUCCESS] All Supabase tables created successfully via RPC!")
            except Exception:
                print("[INFO] Please copy and paste the SQL script below into your Supabase SQL Editor:")
                print("=" * 70)
                print(sql_content)
                print("=" * 70)
        else:
            print("[INFO] Supabase client not initialized. Copy and paste the SQL script into your Supabase SQL Editor:")
            print("=" * 70)
            print(sql_content)
            print("=" * 70)
    else:
        print("[ERROR] Schema file not found.")
