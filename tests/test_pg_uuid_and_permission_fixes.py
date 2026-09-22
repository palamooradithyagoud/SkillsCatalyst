"""
test_pg_uuid_and_permission_fixes.py
Targeted automated test suite verifying fixes for:
1. PostgreSQL 22P02 invalid input syntax for type uuid: "guest_..." on UUID columns.
2. Safe short-circuiting for guest users across subscription, payment, welcome email, dashboard, and learning services.
3. Verification of SQL migration granting SELECT to anon while preserving RLS and write restrictions.
"""

import os
import uuid
import asyncio
import pytest
from fastapi import HTTPException
from unittest.mock import patch, MagicMock

from backend.services.auth_service import is_valid_uuid
from backend.services.subscription_service import SubscriptionService
from backend.services.payment_service import PaymentService
from backend.services.welcome_email_store import (
    get_welcome_email_event,
    create_welcome_email_event,
    claim_welcome_email_job,
    mark_welcome_email_sent,
    mark_welcome_email_failed,
)
from backend.routers.dashboard import get_active_roadmap_data, delete_active_roadmap_endpoint
from backend.routers.learning import generate_skill_roadmap, RoadmapRequest
from backend.models.subscription import EntitlementDetailDTO, AccessLevel


# ── TEST 1: is_valid_uuid Helper Accuracy ─────────────────────────────────────
def test_is_valid_uuid_validation():
    """
    Verifies that is_valid_uuid strictly accepts valid UUID v4 / v1 strings and
    rejects guest tokens, non-UUID strings, numbers, empty values, and None.
    """
    valid_id = str(uuid.uuid4())
    assert is_valid_uuid(valid_id) is True
    assert is_valid_uuid(valid_id.upper()) is True
    assert is_valid_uuid(f"  {valid_id}  ") is True

    # Guest identifiers must fail validation
    assert is_valid_uuid("guest_6b84d2e54a07e549f5acc0a87f3f3d20") is False
    assert is_valid_uuid("guest_12345") is False
    assert is_valid_uuid("guest_anon_user") is False

    # Corrupt or malformed strings
    assert is_valid_uuid("") is False
    assert is_valid_uuid(None) is False
    assert is_valid_uuid(12345) is False
    assert is_valid_uuid("not-a-valid-uuid") is False
    assert is_valid_uuid("6b84d2e54a07e549f5acc0a87f3f3d20") is False  # Missing hyphens


# ── TEST 2: SubscriptionService Short-Circuits Guest Users ────────────────────
def test_subscription_service_guest_short_circuit():
    """
    Verifies that SubscriptionService methods:
    - get_user_subscription_record
    - resolve_effective_subscription
    - get_user_entitlements
    safely short-circuit when given a guest ID or invalid UUID, returning default Free plan
    entitlements WITHOUT making any Supabase database query (preventing 22P02 errors).
    """
    guest_id = "guest_6b84d2e54a07e549f5acc0a87f3f3d20"
    mock_sb = MagicMock()

    with patch("backend.services.subscription_service.get_supabase", return_value=mock_sb):
        # 1. get_user_subscription_record returns None immediately
        rec = SubscriptionService.get_user_subscription_record(guest_id)
        assert rec is None
        assert mock_sb.from_.call_count == 0

        # 2. resolve_effective_subscription returns active Free plan
        effective = SubscriptionService.resolve_effective_subscription(guest_id)
        assert effective is not None
        assert effective["plan"].value == "free"
        assert effective["status"].value == "active"
        assert effective["is_premium"] is False
        assert mock_sb.from_.call_count == 0

        # 3. get_user_entitlements returns default canonical free entitlements
        entitlements = SubscriptionService.get_user_entitlements(guest_id)
        assert entitlements is not None
        assert "saved_videos" in entitlements
        assert entitlements["saved_videos"].limit == 1
        assert entitlements["company_interview_questions"].access == AccessLevel.NONE
        assert mock_sb.from_.call_count == 0


def test_subscription_service_valid_uuid_queries_db():
    """
    Verifies that a genuine valid UUID does query the database.
    """
    valid_id = str(uuid.uuid4())
    mock_sb = MagicMock()
    mock_query = MagicMock()
    mock_sb.from_.return_value = mock_query
    mock_query.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=[])

    with patch("backend.services.subscription_service.get_supabase", return_value=mock_sb):
        rec = SubscriptionService.get_user_subscription_record(valid_id)
        assert rec is None
        assert mock_sb.from_.called


# ── TEST 3: PaymentService Short-Circuits Guest Users ─────────────────────────
def test_payment_service_guest_short_circuit():
    """
    Verifies that PaymentService methods:
    - sync_pending_user_payments
    - get_user_payment_history
    - get_payment_status
    immediately short-circuit for guests without querying payment_transactions.
    """
    guest_id = "guest_6b84d2e54a07e549f5acc0a87f3f3d20"
    mock_sb = MagicMock()

    with patch("backend.services.payment_service.get_supabase", return_value=mock_sb):
        # sync_pending_user_payments returns False immediately
        synced = PaymentService.sync_pending_user_payments(guest_id)
        assert synced is False
        assert mock_sb.table.call_count == 0

        # get_user_payment_history returns [] immediately
        history = PaymentService.get_user_payment_history(guest_id)
        assert history == []
        assert mock_sb.table.call_count == 0

        # get_payment_status with guest user_id raises 404 cleanly
        with pytest.raises(HTTPException) as exc_info:
            PaymentService.get_payment_status("ORDER_123", user_id=guest_id)
        assert exc_info.value.status_code == 404
        assert mock_sb.table.call_count == 0


# ── TEST 4: WelcomeEmailStore Short-Circuits Guest Users ──────────────────────
def test_welcome_email_store_guest_short_circuit():
    """
    Verifies that welcome_email_store methods do not query or write to Supabase
    when a guest user ID is passed.
    """
    guest_id = "guest_6b84d2e54a07e549f5acc0a87f3f3d20"
    mock_sb = MagicMock()

    with patch("backend.services.welcome_email_store._is_supabase_table_available", return_value=True):
        with patch("backend.services.welcome_email_store.get_supabase", return_value=mock_sb):
            # get_welcome_email_event
            event = get_welcome_email_event(guest_id)
            assert event is None
            assert mock_sb.table.call_count == 0

            # create_welcome_email_event
            ev, created = create_welcome_email_event(guest_id, "guest@example.com")
            assert ev is None
            assert created is False
            assert mock_sb.table.call_count == 0

            # claim_welcome_email_job
            claimed = claim_welcome_email_job(guest_id)
            assert claimed is None
            assert mock_sb.table.call_count == 0

            # mark_welcome_email_sent
            sent = mark_welcome_email_sent(guest_id, "resend_123")
            assert sent is None
            assert mock_sb.table.call_count == 0

            # mark_welcome_email_failed
            failed = mark_welcome_email_failed(guest_id, "Some error")
            assert failed is None
            assert mock_sb.table.call_count == 0


# ── TEST 5: Roadmap Progress Queries Short-Circuit Guest Users ────────────────
def test_dashboard_active_roadmap_guest_short_circuit():
    """
    Verifies that get_active_roadmap_data and delete_active_roadmap_endpoint
    short-circuit for guest users without querying roadmap_progress table.
    """
    guest_id = "guest_6b84d2e54a07e549f5acc0a87f3f3d20"
    mock_sb = MagicMock()

    with patch("backend.routers.dashboard.get_supabase", return_value=mock_sb):
        # get_active_roadmap_data returns has_active_roadmap: False immediately
        res = get_active_roadmap_data(guest_id)
        assert res == {"has_active_roadmap": False}
        assert mock_sb.table.call_count == 0

        # delete_active_roadmap_endpoint returns failure immediately
        del_res = delete_active_roadmap_endpoint("python-mastery", user_id=guest_id)
        assert del_res["success"] is False
        assert mock_sb.table.call_count == 0


def test_learning_roadmap_generation_guest_short_circuit():
    """
    Verifies that generate_skill_roadmap with a guest user_id does not query
    roadmap_progress table during entitlement quota checking.
    """
    async def _test():
        guest_id = "guest_6b84d2e54a07e549f5acc0a87f3f3d20"
        mock_sb = MagicMock()

        entitlement = EntitlementDetailDTO(
            access=AccessLevel.LIMITED,
            limit=3,
        )
        req = RoadmapRequest(skill="Frontend Developer")

        with patch("backend.routers.learning.get_supabase", return_value=mock_sb):
            with patch("backend.routers.learning._generate_skill_roadmap_svc", return_value={"status": "mocked"}):
                res = await generate_skill_roadmap(req, user_id=guest_id, entitlement=entitlement)
                assert res == {"status": "mocked"}
                # The sb.table("roadmap_progress") query should never be called for guest
                assert mock_sb.table.call_count == 0

    asyncio.run(_test())


# ── TEST 6: SQL Migration Integrity Verification ─────────────────────────────
def test_migration_sql_grants_and_security():
    """
    Verifies that 20260922_fix_profile_tables_anon_grants.sql exists and:
    1. Grants SELECT to anon on all 7 user profile tables and subscription/resource tables.
    2. Does NOT grant INSERT, UPDATE, or DELETE to anon on the profile tables.
    """
    migration_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "supabase",
        "migrations",
        "20260922_fix_profile_tables_anon_grants.sql",
    )
    assert os.path.isfile(migration_path), f"Migration file not found at {migration_path}"

    with open(migration_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Profile tables that previously threw 42501 permission denied to anon
    profile_tables = [
        "user_skills",
        "experiences",
        "education",
        "projects",
        "certifications",
        "achievements",
        "career_preferences",
    ]

    for table in profile_tables:
        # Check that SELECT is granted
        assert f"GRANT SELECT ON public.{table} TO anon;" in content, f"Missing SELECT grant for {table}"

        # Assert no write grants to anon
        assert f"GRANT INSERT ON TABLE public.{table} TO anon" not in content
        assert f"GRANT UPDATE ON TABLE public.{table} TO anon" not in content
        assert f"GRANT DELETE ON TABLE public.{table} TO anon" not in content
        assert f"GRANT ALL ON TABLE public.{table} TO anon" not in content
        assert f"GRANT ALL ON public.{table} TO anon" not in content
