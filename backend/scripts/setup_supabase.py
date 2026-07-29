"""
Run this once to create the saved_playlists table in Supabase.
Execute: python -m backend.scripts.setup_supabase
"""
from backend.services.supabase_service import get_supabase

SQL = """
create table if not exists public.saved_playlists (
    id            bigserial primary key,
    user_id       text not null default 'default_user',
    playlist_id   text not null,
    title         text not null,
    channel       text,
    description   text,
    level         text,
    video_count   text,
    duration      text,
    playlist_url  text,
    thumbnail     text,
    source        text default 'youtube',
    skill_query   text,
    created_at    timestamptz not null default now(),
    unique(playlist_id, user_id)
);
"""

if __name__ == "__main__":
    sb = get_supabase()
    if sb:
        try:
            sb.rpc("exec_sql", {"sql": SQL}).execute()
            print("✅ saved_playlists table created (or already exists).")
        except Exception as e:
            print(f"Could not auto-create table via rpc (normal): {e}")
            print("👉 Please run the SQL above manually in your Supabase SQL Editor.")
    else:
        print("❌ Supabase client not available. Check your .env keys.")
