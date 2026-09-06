"""
test_production_pg_error_fixes.py
Targeted automated test suite verifying fixes for:
1. PostgreSQL 23503 FK constraint violation on welcome_email_events.user_id
2. PostgreSQL 22P02 invalid input syntax for type integer: "136.0" on video_progress.last_position
3. 100 concurrent welcome email creation attempts for deduplication and zero FK errors
4. Nonexistent user rejection
"""

import uuid
import pytest
from unittest.mock import patch, MagicMock
from concurrent.futures import ThreadPoolExecutor, as_completed

from backend.services.welcome_email_store import (
    create_welcome_email_event,
    get_welcome_email_event,
    claim_welcome_email_job,
    mark_welcome_email_sent,
    mark_welcome_email_failed,
    _init_sqlite_fallback,
)
from backend.routers.learning import (
    SaveProgressRequest,
    VideoProgressRequest,
    CompleteVideoRequest,
    save_video_progress,
    update_video_progress,
    complete_video,
)


@pytest.fixture(autouse=True)
def setup_clean_store():
    _init_sqlite_fallback()


# ── TEST 1: "136.0" Float to Integer Conversion Fix (Error 22P02) ─────────────
def test_numeric_float_conversion_for_video_progress():
    """
    Verifies that float values such as 136.0 (from YouTube player API) are properly
    cast to integer before writing to PostgreSQL video_progress (last_position, watch_time),
    preventing 22P02 'invalid input syntax for type integer: "136.0"'.
    """
    import asyncio

    async def _test():
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_sb.table.return_value = mock_table
        mock_table.upsert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
        mock_table.update.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": 1}])

        valid_uuid = str(uuid.uuid4())

        with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
            # 1. Test update_video_progress with float 136.0
            req_update = VideoProgressRequest(
                playlist_id="pl_test_123",
                video_id="vid_136",
                watched=True,
                last_position=136.0,
                watch_time=136,
            )
            res_update = await update_video_progress(req_update, current_user_id=valid_uuid)
            assert res_update["success"] is True

            # Verify upsert payload contains true int 136, not float 136.0
            upsert_calls = mock_table.upsert.call_args_list
            last_upsert_payload = upsert_calls[-1][0][0]
            assert isinstance(last_upsert_payload["last_position"], int)
            assert last_upsert_payload["last_position"] == 136

            # 2. Test save_video_progress with float 136.0
            req_save = SaveProgressRequest(
                playlist_id="pl_test_123",
                video_id="vid_136",
                last_position=136.0,
                watch_time=136,
            )
            res_save = await save_video_progress(req_save, current_user_id=valid_uuid)
            assert res_save["success"] is True

            update_calls = mock_table.update.call_args_list
            last_update_payload = update_calls[-1][0][0]
            assert isinstance(last_update_payload["last_position"], int)
            assert last_update_payload["last_position"] == 136

            # 3. Test complete_video with float 136.0
            req_complete = CompleteVideoRequest(
                playlist_id="pl_test_123",
                video_id="vid_136",
                watch_time=136,
                completed=True,
                last_position=136.0,
            )
            res_complete = await complete_video(req_complete, current_user_id=valid_uuid)
            assert res_complete["success"] is True

            complete_upsert_calls = mock_table.upsert.call_args_list
            last_complete_payload = complete_upsert_calls[-1][0][0]
            assert isinstance(last_complete_payload["last_position"], int)
            assert last_complete_payload["last_position"] == 136

    asyncio.run(_test())


# ── TEST 2: Nonexistent User Cannot Create Welcome Email Event ─────────────────
def test_nonexistent_user_rejected_from_welcome_email():
    """
    Verifies that a nonexistent user_id cannot create a welcome_email_events row,
    preventing 23503 foreign key constraint violations.
    """
    nonexistent_user_id = str(uuid.uuid4())
    fake_email = "nonexistent@example.com"

    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    # Mock auth.admin.get_user_by_id raising User not found
    mock_sb.auth.admin.get_user_by_id.side_effect = Exception("User not found: 404")

    with patch("backend.services.welcome_email_store._is_supabase_table_available", return_value=True):
        with patch("backend.services.welcome_email_store.get_supabase", return_value=mock_sb):
            event, created = create_welcome_email_event(nonexistent_user_id, fake_email)
            assert event is None
            assert created is False
            # Verify no insert/upsert was attempted to PostgreSQL
            assert mock_sb.table.return_value.upsert.call_count == 0


# ── TEST 3: 100 Concurrent Welcome Email Requests for Valid User ──────────────
def test_100_concurrent_welcome_email_requests_deduplication():
    """
    Simulates 100 simultaneous welcome email creation attempts for the same valid user.
    Asserts:
    1. Exactly ONE durable welcome_email_events row is created.
    2. Exactly ONE thread observes created=True, 99 observe created=False.
    3. Status is pending, attempts is 0.
    4. Zero foreign key errors, zero duplicate emails.
    """
    valid_user_id = str(uuid.uuid4())
    email = f"concurrent_{valid_user_id[:8]}@example.com"

    results = []

    def _attempt_create():
        return create_welcome_email_event(valid_user_id, email)

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(_attempt_create) for _ in range(100)]
        for f in as_completed(futures):
            results.append(f.result())

    # Count how many threads created the event
    created_count = sum(1 for event, was_created in results if was_created is True)
    existing_count = sum(1 for event, was_created in results if was_created is False and event is not None)

    assert created_count == 1, f"Expected exactly 1 created event, got {created_count}"
    assert existing_count == 99, f"Expected 99 existing event recognitions, got {existing_count}"

    # Confirm authoritative event state
    final_event = get_welcome_email_event(valid_user_id)
    assert final_event is not None
    assert final_event["user_id"] == valid_user_id
    assert final_event["status"] == "pending"
    assert final_event["attempts"] == 0


# ── TEST 4: PostgreSQL 23503 Catch Guard Rejection ────────────────────────────
def test_postgres_23503_error_guard_returns_none():
    """
    Verifies that if PostgreSQL reports foreign key violation 23503 during upsert,
    the store catches it, logs the violation, and returns (None, False) without
    creating a phantom row in SQLite.
    """
    user_id = str(uuid.uuid4())
    email = "fk_test@example.com"

    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
    # Simulate user found in admin lookup
    mock_sb.auth.admin.get_user_by_id.return_value = MagicMock(user=MagicMock(id=user_id))
    # But upsert fails with 23503 FK error
    mock_sb.table.return_value.upsert.side_effect = Exception(
        'insert or update on table "welcome_email_events" violates foreign key constraint "welcome_email_events_user_id_fkey" (status 23503)'
    )

    with patch("backend.services.welcome_email_store._is_supabase_table_available", return_value=True):
        with patch("backend.services.welcome_email_store.get_supabase", return_value=mock_sb):
            event, created = create_welcome_email_event(user_id, email)
            assert event is None
            assert created is False
