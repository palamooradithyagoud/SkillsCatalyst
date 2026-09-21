"""
backend/scripts/verify_phase2_live_db.py
Live Supabase Database Verification Script for Payments Phase 2.
Phase: Payments Phase 2 — PhonePe Payment Integration (Backend-First)
"""

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(root_dir / ".env")
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.services.supabase_service import get_supabase
from backend.services.subscription_service import SubscriptionService


def verify_phase2_live_db():
    print("=" * 70)
    print("VERIFYING PAYMENTS PHASE 2 IN LIVE SUPABASE DATABASE")
    print("=" * 70)

    sb = get_supabase()
    assert sb is not None, "Failed to initialize Supabase client"

    # 1. Verify payment_transactions table accessibility
    print("\n[1] Checking public.payment_transactions table...")
    try:
        res = sb.from_("payment_transactions").select("*").limit(5).execute()
        print(f"  -> SUCCESS: payment_transactions is accessible! Rows found: {len(res.data or [])}")
    except Exception as e:
        print(f"  -> NOTICE/FAIL: payment_transactions query error: {e}")
        print("     (If the SQL migration has not been applied to Supabase SQL editor yet,")
        print("      please run: supabase/migrations/20260922_create_payment_transactions_system.sql)")
        return False

    # 2. Verify unique merchant_order_id constraint
    print("\n[2] Testing unique merchant_order_id constraint and persistence...")
    test_order_id = f"test_verify_{uuid.uuid4().hex[:12]}"
    
    # Fetch a real plan ID
    plan_res = sb.from_("subscription_plans").select("id").eq("code", "premium_monthly").execute()
    if not plan_res.data:
        print("  -> ERROR: Missing premium_monthly plan in subscription_plans")
        return False
    plan_id = plan_res.data[0]["id"]

    # Fetch a dummy or real user
    user_res = sb.from_("profiles").select("id").limit(1).execute()
    user_id = user_res.data[0]["id"] if user_res.data else str(uuid.uuid4())

    tx_data = {
        "user_id": user_id,
        "plan_id": plan_id,
        "provider": "phonepe",
        "merchant_order_id": test_order_id,
        "amount_in_paise": 9900,
        "currency": "INR",
        "status": "pending",
    }

    try:
        insert_1 = sb.from_("payment_transactions").insert(tx_data).execute()
        print(f"  -> Insert 1 succeeded: created {test_order_id}")
        assert insert_1.data and len(insert_1.data) > 0

        # Try duplicate insert with same merchant_order_id
        duplicate_failed = False
        try:
            sb.from_("payment_transactions").insert(tx_data).execute()
        except Exception:
            duplicate_failed = True

        assert duplicate_failed, "Expected duplicate merchant_order_id to raise unique constraint violation!"
        print("  -> SUCCESS: Unique constraint on merchant_order_id strictly enforced!")

        # Clean up test row
        sb.from_("payment_transactions").delete().eq("merchant_order_id", test_order_id).execute()
        print("  -> Cleaned up test transaction row.")
    except Exception as e:
        print(f"  -> Test error: {e}")
        return False

    # 3. Verify user_subscriptions and subscription_events tables
    print("\n[3] Verifying user_subscriptions and subscription_events tables...")
    sub_res = sb.from_("user_subscriptions").select("id").limit(1).execute()
    evt_res = sb.from_("subscription_events").select("id").limit(1).execute()
    print(f"  -> user_subscriptions accessible ({len(sub_res.data or [])} rows)")
    print(f"  -> subscription_events accessible ({len(evt_res.data or [])} rows)")

    print("\n" + "=" * 70)
    print("LIVE SUPABASE PHASE 2 VERIFICATION PASSED (100%)")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = verify_phase2_live_db()
    sys.exit(0 if success else 1)
