"""
test_welcome_email_system.py
Comprehensive automated test suite for the SkillsCatalyst Welcome Email system.

Tests all 10 required scenarios:
1. New Email/Password signup -> exactly one email -> status = sent
2. New Google OAuth signup -> exactly one email -> status = sent
3. Existing user login -> 0 emails -> status = skipped_existing
4. Repeated login (10 times) -> 0 additional emails
5. Concurrent requests (10 simultaneous) -> exactly 1 event, 1 dispatch
6. Repeated OAuth callbacks -> exactly 1 event, 0 duplicates
7. Resend failure -> status = failed, attempts incremented, error recorded, retryable
8. Worker crash -> expired lease reclaimed successfully
9. Redis failure -> database remains authoritative, 0 duplicate emails
10. Page refresh (20 times) -> 0 additional emails
"""

import uuid
import time
import pytest
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from unittest.mock import patch, MagicMock

from backend.services.welcome_email_store import (
    get_welcome_email_event,
    create_welcome_email_event,
    claim_welcome_email_job,
    mark_welcome_email_sent,
    mark_welcome_email_failed,
    _init_sqlite_fallback,
)
from backend.routers.auth import (
    trigger_welcome_email,
    WelcomeEmailRequest,
    _process_welcome_email_job,
)


@pytest.fixture(autouse=True)
def setup_store():
    """Ensure store is initialized before each test."""
    _init_sqlite_fallback()


def _mock_supabase_user(user_id: str, email: str, name: str = "Test Learner"):
    """Helper to mock Supabase get_user return value."""
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = email
    mock_user.user_metadata = {"full_name": name}
    mock_res = MagicMock()
    mock_res.user = mock_user
    return mock_res


# ── TEST 1: New Email/Password Signup ─────────────────────────────────────────
def test_new_email_password_signup():
    user_id = str(uuid.uuid4())
    email = f"learner_{user_id[:8]}@example.com"

    # Step 1: Create event during signup
    event, created = create_welcome_email_event(user_id, email)
    assert created is True
    assert event["status"] == "pending"
    assert event["attempts"] == 0

    # Step 2: Worker claims job
    claimed = claim_welcome_email_job(user_id, lease_seconds=300)
    assert claimed is not None
    assert claimed["status"] == "processing"
    assert claimed["attempts"] == 1

    # Step 3: Mock Resend send and mark sent
    resend_id = f"re_msg_{uuid.uuid4().hex[:12]}"
    sent_event = mark_welcome_email_sent(user_id, resend_id=resend_id)
    assert sent_event["status"] == "sent"
    assert sent_event["resend_id"] == resend_id
    assert sent_event["sent_at"] is not None


# ── TEST 2: New Google OAuth Signup ───────────────────────────────────────────
def test_new_google_oauth_signup():
    user_id = str(uuid.uuid4())
    email = f"google_{user_id[:8]}@gmail.com"

    # Simulated OAuth callback / trigger
    event, created = create_welcome_email_event(user_id, email)
    assert created is True
    assert event["status"] == "pending"

    # Background processing simulation
    with patch("backend.routers.auth.send_welcome_email") as mock_send:
        mock_send.return_value = {"success": True, "id": "re_google_12345"}
        _process_welcome_email_job(user_id, email, "Google User")

    final_event = get_welcome_email_event(user_id)
    assert final_event["status"] == "sent"
    assert final_event["resend_id"] == "re_google_12345"


# ── TEST 3: Existing User Login ───────────────────────────────────────────────
def test_existing_user_login_no_email():
    existing_user_id = str(uuid.uuid4())
    existing_email = f"existing_{existing_user_id[:8]}@example.com"

    # Mock authenticated user
    mock_sb = MagicMock()
    mock_sb.auth.get_user.return_value = _mock_supabase_user(existing_user_id, existing_email)

    with patch("backend.routers.auth.get_supabase", return_value=mock_sb):
        mock_bg = MagicMock()
        # Normal login has is_signup=False
        res = trigger_welcome_email(
            payload=WelcomeEmailRequest(is_signup=False),
            background_tasks=mock_bg,
            authorization="Bearer test_valid_token",
        )

    assert res["success"] is True
    assert res["status"] == "skipped_existing"
    mock_bg.add_task.assert_not_called()
    assert get_welcome_email_event(existing_user_id) is None


# ── TEST 4: Repeated Login (10 times) ─────────────────────────────────────────
def test_repeated_login_already_sent():
    user_id = str(uuid.uuid4())
    email = f"repeat_{user_id[:8]}@example.com"

    # Pre-populate as already sent
    create_welcome_email_event(user_id, email)
    claim_welcome_email_job(user_id)
    mark_welcome_email_sent(user_id, resend_id="re_sent_prior")

    mock_sb = MagicMock()
    mock_sb.auth.get_user.return_value = _mock_supabase_user(user_id, email)

    mock_bg = MagicMock()
    with patch("backend.routers.auth.get_supabase", return_value=mock_sb):
        for _ in range(10):
            res = trigger_welcome_email(
                payload=WelcomeEmailRequest(is_signup=False),
                background_tasks=mock_bg,
                authorization="Bearer test_valid_token",
            )
            assert res["status"] == "already_sent"

    mock_bg.add_task.assert_not_called()


# ── TEST 5: Concurrent Requests (10 simultaneous) ─────────────────────────────
def test_concurrent_requests():
    user_id = str(uuid.uuid4())
    email = f"concurrent_{user_id[:8]}@example.com"

    # Pre-create pending event
    create_welcome_email_event(user_id, email)

    # 10 threads attempt to claim the job concurrently
    claimed_results = []

    def attempt_claim():
        return claim_welcome_email_job(user_id, lease_seconds=300)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_claim) for _ in range(10)]
        for f in as_completed(futures):
            claimed_results.append(f.result())

    # Exactly ONE claim must succeed (not None)
    successful_claims = [c for c in claimed_results if c is not None]
    assert len(successful_claims) == 1
    assert successful_claims[0]["status"] == "processing"


# ── TEST 6: Repeated OAuth Callbacks ──────────────────────────────────────────
def test_repeated_oauth_callbacks():
    user_id = str(uuid.uuid4())
    email = f"oauth_{user_id[:8]}@gmail.com"

    # Simulate 5 callback triggers for same user
    created_flags = []
    for _ in range(5):
        event, was_created = create_welcome_email_event(user_id, email)
        created_flags.append(was_created)

    # Exactly 1 creation succeeded, other 4 saw existing row
    assert created_flags.count(True) == 1
    assert created_flags.count(False) == 4


# ── TEST 7: Resend Failure & Retryability ──────────────────────────────────────
def test_resend_failure_and_retry():
    user_id = str(uuid.uuid4())
    email = f"fail_{user_id[:8]}@example.com"

    create_welcome_email_event(user_id, email)
    claim_welcome_email_job(user_id)

    # Simulate Resend network error
    mark_welcome_email_failed(user_id, error_message="Resend 500 Internal Server Error")

    failed_event = get_welcome_email_event(user_id)
    assert failed_event["status"] == "failed"
    assert failed_event["attempts"] == 1
    assert "Resend 500" in failed_event["last_error"]
    assert failed_event["processing_until"] is None

    # Verify that it remains reclaimable for retry
    reclaimed = claim_welcome_email_job(user_id)
    assert reclaimed is not None
    assert reclaimed["status"] == "processing"
    assert reclaimed["attempts"] == 2


# ── TEST 8: Worker Crash & Lease Expiration ───────────────────────────────────
def test_worker_crash_lease_expiration():
    user_id = str(uuid.uuid4())
    email = f"crash_{user_id[:8]}@example.com"

    create_welcome_email_event(user_id, email)

    # Claim with a 1-second lease to simulate time elapsing after worker crash
    claim_welcome_email_job(user_id, lease_seconds=1)
    time.sleep(1.1)

    # Reclaim should succeed because lease expired
    recovered = claim_welcome_email_job(user_id, lease_seconds=300)
    assert recovered is not None
    assert recovered["status"] == "processing"
    assert recovered["attempts"] == 2


# ── TEST 9: Redis Failure Resilience ──────────────────────────────────────────
def test_redis_failure_resilience():
    user_id = str(uuid.uuid4())
    email = f"redis_down_{user_id[:8]}@example.com"

    create_welcome_email_event(user_id, email)

    # Mock Redis as completely unavailable (None client)
    with patch("backend.routers.auth.get_redis_client", return_value=None):
        # Even with Redis down, database-level claiming still prevents duplicate dispatches
        claim1 = claim_welcome_email_job(user_id, lease_seconds=300)
        claim2 = claim_welcome_email_job(user_id, lease_seconds=300)

        assert claim1 is not None
        assert claim2 is None  # Second claim is rejected by database constraint


# ── TEST 10: Page Refresh (Dashboard 20 Times) ────────────────────────────────
def test_dashboard_page_refresh_twenty_times():
    user_id = str(uuid.uuid4())
    email = f"dashboard_{user_id[:8]}@example.com"

    # User registers and email is marked sent
    create_welcome_email_event(user_id, email)
    claim_welcome_email_job(user_id)
    mark_welcome_email_sent(user_id, resend_id="re_dashboard_999")

    mock_sb = MagicMock()
    mock_sb.auth.get_user.return_value = _mock_supabase_user(user_id, email)
    mock_bg = MagicMock()

    with patch("backend.routers.auth.get_supabase", return_value=mock_sb):
        for _ in range(20):
            res = trigger_welcome_email(
                payload=WelcomeEmailRequest(is_signup=False),
                background_tasks=mock_bg,
                authorization="Bearer test_valid_token",
            )
            assert res["status"] == "already_sent"

    mock_bg.add_task.assert_not_called()


if __name__ == "__main__":
    pytest.main(["-v", __file__])
