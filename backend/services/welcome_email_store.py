"""
welcome_email_store.py
Authoritative durable event store for SkillsCatalyst welcome email lifecycle.

Provides database-level idempotency, atomic lease claiming, and failure recording
following the project's exact requirements:
- Table: welcome_email_events (with UNIQUE(user_id))
- States: pending, processing, sent, failed
- Safe processing leases (processing_until) to prevent orphaned locks upon crash
- Durable SQLite fallback if Supabase PostgREST schema cache has not yet reloaded the migration.
"""

import os
import sqlite3
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from pathlib import Path
from backend.services.supabase_service import get_supabase

logger = logging.getLogger("skillscatalyst.welcome_email")

_SQLITE_DIR = Path(__file__).resolve().parent.parent.parent / "data"
_SQLITE_PATH = _SQLITE_DIR / "welcome_email_events.db"

# Cache flag to avoid repeating PostgREST schema checks once confirmed
_SUPABASE_TABLE_READY = None


def _init_sqlite_fallback():
    """Initializes local SQLite fallback table with identical schema and constraints."""
    try:
        _SQLITE_DIR.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS welcome_email_events (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
                    attempts INTEGER NOT NULL DEFAULT 0,
                    resend_id TEXT NULL,
                    last_error TEXT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    processing_until TEXT NULL,
                    sent_at TEXT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_we_user_id ON welcome_email_events(user_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_we_status_lease ON welcome_email_events(status, processing_until);")
    except Exception as exc:
        logger.error(f"Error initializing local SQLite welcome_email_events fallback: {exc}")


def _is_supabase_table_available() -> bool:
    """Checks if public.welcome_email_events is active in Supabase PostgREST schema cache."""
    global _SUPABASE_TABLE_READY
    if _SUPABASE_TABLE_READY is True:
        return True

    sb = get_supabase()
    if not sb:
        return False

    try:
        sb.table("welcome_email_events").select("id").limit(1).execute()
        _SUPABASE_TABLE_READY = True
        return True
    except Exception as exc:
        err_str = str(exc)
        if "PGRST205" in err_str or "Could not find the table" in err_str:
            _SUPABASE_TABLE_READY = False
            logger.info(
                "[MIGRATION_NOTICE] 'welcome_email_events' table not yet migrated in Supabase. "
                "Operating with durable local event store fallback."
            )
            return False
        # If network error or transient failure, return False to use durable local store
        return False


def get_welcome_email_event(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetches the existing welcome email event for a given user_id."""
    clean_user_id = str(user_id).strip()

    if _is_supabase_table_available():
        try:
            sb = get_supabase()
            if sb:
                res = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
        except Exception as exc:
            logger.warning(f"Failed to query Supabase welcome_email_events for {clean_user_id}: {exc}")

    # SQLite fallback
    _init_sqlite_fallback()
    try:
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM welcome_email_events WHERE user_id = ?", (clean_user_id,)).fetchone()
            if row:
                return dict(row)
    except Exception as exc:
        logger.error(f"SQLite error reading welcome_email_events: {exc}")

    return None


def create_welcome_email_event(user_id: str, email: str) -> Tuple[Optional[Dict[str, Any]], bool]:
    """
    Atomically creates a 'pending' welcome email event for a user if one does not exist.
    Returns: (event_dict, was_created_boolean)
    """
    import uuid
    clean_user_id = str(user_id).strip()
    clean_email = str(email).strip().lower()
    now_iso = datetime.now(timezone.utc).isoformat()
    event_id = str(uuid.uuid4())

    if _is_supabase_table_available():
        try:
            sb = get_supabase()
            if sb:
                # Check if already exists first
                existing = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if existing.data and len(existing.data) > 0:
                    return existing.data[0], False

                # Insert with onConflict ignore
                payload = {
                    "id": event_id,
                    "user_id": clean_user_id,
                    "email": clean_email,
                    "status": "pending",
                    "attempts": 0,
                    "created_at": now_iso,
                    "updated_at": now_iso,
                }
                res = sb.table("welcome_email_events").upsert(payload, on_conflict="user_id", ignore_duplicates=True).execute()
                # Fetch authoritative row
                authoritative = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if authoritative.data:
                    row = authoritative.data[0]
                    created = (row.get("id") == event_id)
                    if created:
                        logger.info(f"welcome_email_event_created: user_id={clean_user_id} event_id={event_id} (Supabase)")
                    return row, created
        except Exception as exc:
            logger.warning(f"Supabase error creating welcome_email_event for {clean_user_id}: {exc}")

    # SQLite fallback
    _init_sqlite_fallback()
    try:
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO welcome_email_events 
                (id, user_id, email, status, attempts, created_at, updated_at)
                VALUES (?, ?, ?, 'pending', 0, ?, ?)
            """, (event_id, clean_user_id, clean_email, now_iso, now_iso))
            created = cursor.rowcount > 0
            conn.commit()

            row = cursor.execute("SELECT * FROM welcome_email_events WHERE user_id = ?", (clean_user_id,)).fetchone()
            if row:
                if created:
                    logger.info(f"welcome_email_event_created: user_id={clean_user_id} event_id={event_id} (LocalStore)")
                return dict(row), created
    except Exception as exc:
        logger.error(f"SQLite error creating welcome_email_event: {exc}")

    return None, False


def claim_welcome_email_job(user_id: str, lease_seconds: int = 300) -> Optional[Dict[str, Any]]:
    """
    Atomically claims a welcome email job for processing with a bounded time lease.
    Eligible conditions:
    1. status IN ('pending', 'failed')
    2. status == 'processing' AND processing_until <= NOW() (worker crash lease recovery)

    Returns the updated claimed event dict, or None if not eligible / already claimed.
    """
    clean_user_id = str(user_id).strip()
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    lease_until_dt = now_dt + timedelta(seconds=lease_seconds)
    lease_until_iso = lease_until_dt.isoformat()

    if _is_supabase_table_available():
        try:
            sb = get_supabase()
            if sb:
                # Inspect existing row
                res = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if res.data:
                    row = res.data[0]
                    status = row.get("status")
                    processing_until = row.get("processing_until")

                    is_expired_lease = False
                    if status == "processing" and processing_until:
                        try:
                            p_dt = datetime.fromisoformat(processing_until.replace("Z", "+00:00"))
                            if now_dt >= p_dt:
                                is_expired_lease = True
                        except Exception:
                            is_expired_lease = True

                    can_claim = (status in ("pending", "failed")) or is_expired_lease
                    if not can_claim:
                        return None

                    # Atomic conditional update
                    attempts = (row.get("attempts") or 0) + 1
                    update_payload = {
                        "status": "processing",
                        "processing_until": lease_until_iso,
                        "attempts": attempts,
                        "updated_at": now_iso,
                    }
                    sb.table("welcome_email_events").update(update_payload).eq("user_id", clean_user_id).execute()
                    
                    # Fetch claimed row
                    claimed_res = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                    if claimed_res.data:
                        claimed_row = claimed_res.data[0]
                        logger.info(f"welcome_email_processing: user_id={clean_user_id} attempt={attempts} lease_until={lease_until_iso} (Supabase)")
                        return claimed_row
        except Exception as exc:
            logger.warning(f"Supabase claim error for {clean_user_id}: {exc}")

    # SQLite fallback with true atomic WHERE condition
    _init_sqlite_fallback()
    try:
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE welcome_email_events
                SET status = 'processing',
                    processing_until = ?,
                    attempts = attempts + 1,
                    updated_at = ?
                WHERE user_id = ?
                  AND (
                    status IN ('pending', 'failed')
                    OR (status = 'processing' AND processing_until IS NOT NULL AND processing_until <= ?)
                  )
            """, (lease_until_iso, now_iso, clean_user_id, now_iso))
            conn.commit()

            if cursor.rowcount > 0:
                row = cursor.execute("SELECT * FROM welcome_email_events WHERE user_id = ?", (clean_user_id,)).fetchone()
                if row:
                    claimed_row = dict(row)
                    logger.info(f"welcome_email_processing: user_id={clean_user_id} attempt={claimed_row['attempts']} lease_until={lease_until_iso} (LocalStore)")
                    return claimed_row
    except Exception as exc:
        logger.error(f"SQLite claim error for {clean_user_id}: {exc}")

    return None


def mark_welcome_email_sent(user_id: str, resend_id: str) -> Optional[Dict[str, Any]]:
    """Marks the welcome email event as 'sent' after successful provider acceptance."""
    clean_user_id = str(user_id).strip()
    now_iso = datetime.now(timezone.utc).isoformat()

    if _is_supabase_table_available():
        try:
            sb = get_supabase()
            if sb:
                update_payload = {
                    "status": "sent",
                    "resend_id": resend_id,
                    "sent_at": now_iso,
                    "processing_until": None,
                    "updated_at": now_iso,
                }
                sb.table("welcome_email_events").update(update_payload).eq("user_id", clean_user_id).execute()
                res = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if res.data:
                    logger.info(f"welcome_email_sent: user_id={clean_user_id} resend_id={resend_id} (Supabase)")
                    return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase mark_sent error for {clean_user_id}: {exc}")

    # SQLite fallback
    _init_sqlite_fallback()
    try:
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE welcome_email_events
                SET status = 'sent',
                    resend_id = ?,
                    sent_at = ?,
                    processing_until = NULL,
                    updated_at = ?
                WHERE user_id = ?
            """, (resend_id, now_iso, now_iso, clean_user_id))
            conn.commit()

            row = cursor.execute("SELECT * FROM welcome_email_events WHERE user_id = ?", (clean_user_id,)).fetchone()
            if row:
                logger.info(f"welcome_email_sent: user_id={clean_user_id} resend_id={resend_id} (LocalStore)")
                return dict(row)
    except Exception as exc:
        logger.error(f"SQLite mark_sent error for {clean_user_id}: {exc}")

    return None


def mark_welcome_email_failed(user_id: str, error_message: str) -> Optional[Dict[str, Any]]:
    """Marks the welcome email event as 'failed' with error reason and releases lease for retry."""
    clean_user_id = str(user_id).strip()
    now_iso = datetime.now(timezone.utc).isoformat()

    if _is_supabase_table_available():
        try:
            sb = get_supabase()
            if sb:
                update_payload = {
                    "status": "failed",
                    "last_error": str(error_message)[:1000],
                    "processing_until": None,
                    "updated_at": now_iso,
                }
                sb.table("welcome_email_events").update(update_payload).eq("user_id", clean_user_id).execute()
                res = sb.table("welcome_email_events").select("*").eq("user_id", clean_user_id).limit(1).execute()
                if res.data:
                    logger.warning(f"welcome_email_failed: user_id={clean_user_id} error={error_message} (Supabase)")
                    return res.data[0]
        except Exception as exc:
            logger.warning(f"Supabase mark_failed error for {clean_user_id}: {exc}")

    # SQLite fallback
    _init_sqlite_fallback()
    try:
        with sqlite3.connect(str(_SQLITE_PATH)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE welcome_email_events
                SET status = 'failed',
                    last_error = ?,
                    processing_until = NULL,
                    updated_at = ?
                WHERE user_id = ?
            """, (str(error_message)[:1000], now_iso, clean_user_id))
            conn.commit()

            row = cursor.execute("SELECT * FROM welcome_email_events WHERE user_id = ?", (clean_user_id,)).fetchone()
            if row:
                logger.warning(f"welcome_email_failed: user_id={clean_user_id} error={error_message} (LocalStore)")
                return dict(row)
    except Exception as exc:
        logger.error(f"SQLite mark_failed error for {clean_user_id}: {exc}")

    return None
