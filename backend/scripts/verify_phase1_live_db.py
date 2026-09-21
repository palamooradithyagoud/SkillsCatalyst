"""
backend/scripts/verify_phase1_live_db.py
Live Supabase Database Verification for Payments Phase 1.
"""
import sys
from pathlib import Path
from dotenv import load_dotenv

root_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(root_dir / ".env")
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.services.supabase_service import get_supabase


def verify_live_db():
    print("=" * 70)
    print("VERIFYING PAYMENTS PHASE 1 IN LIVE SUPABASE DATABASE")
    print("=" * 70)

    sb = get_supabase()
    assert sb is not None, "Failed to initialize Supabase client"

    # 1. Verify subscription_plans
    plans_res = sb.from_("subscription_plans").select("*").order("price_in_paise", desc=False).execute()
    plans = plans_res.data or []
    print(f"\n[1] subscription_plans table ({len(plans)} plans):")
    plan_codes = {}
    for p in plans:
        plan_codes[p["code"]] = p
        print(f"  • {p['code']:16} | Name: {p['name']:18} | Price: {p['price_in_paise']} paise | Duration: {p['duration_days']} days | Active: {p['is_active']}")

    assert "free" in plan_codes, "Missing 'free' plan"
    assert "premium_monthly" in plan_codes, "Missing 'premium_monthly' plan"
    assert "premium_3_month" in plan_codes, "Missing 'premium_3_month' plan"

    assert plan_codes["free"]["price_in_paise"] == 0
    assert plan_codes["free"]["duration_days"] is None
    assert plan_codes["premium_monthly"]["price_in_paise"] == 9900
    assert plan_codes["premium_monthly"]["duration_days"] == 30
    assert plan_codes["premium_3_month"]["price_in_paise"] == 25000
    assert plan_codes["premium_3_month"]["duration_days"] == 90
    print("  --> ALL PLANS VERIFIED WITH CANONICAL PAISE & DURATION!")

    # 2. Verify plan_entitlements
    ent_res = sb.from_("plan_entitlements").select("*, subscription_plans(code)").execute()
    entitlements = ent_res.data or []
    print(f"\n[2] plan_entitlements table ({len(entitlements)} entries seeded):")
    
    expected_features = {
        "saved_videos",
        "company_interview_questions",
        "placement_prep",
        "scholarships",
        "tech_news",
        "ai_mentor",
        "roadmaps",
    }

    by_plan = {}
    for e in entitlements:
        plan_code = e["subscription_plans"]["code"]
        by_plan.setdefault(plan_code, {})[e["feature_key"]] = e

    for p_code in ["free", "premium_monthly", "premium_3_month"]:
        assert p_code in by_plan, f"Missing entitlements for {p_code}"
        assert set(by_plan[p_code].keys()) == expected_features, f"Missing features in {p_code}: {expected_features - set(by_plan[p_code].keys())}"

    # Verify specific free limits
    assert by_plan["free"]["saved_videos"]["access_level"] == "limited"
    assert by_plan["free"]["saved_videos"]["limit_value"] == 1
    assert by_plan["free"]["company_interview_questions"]["access_level"] == "none"
    assert by_plan["free"]["placement_prep"]["access_level"] == "none"
    assert by_plan["free"]["tech_news"]["access_level"] == "limited"
    assert by_plan["free"]["tech_news"]["limit_value"] == 2

    # Verify premium full access
    for p_code in ["premium_monthly", "premium_3_month"]:
        for feat in expected_features:
            assert by_plan[p_code][feat]["access_level"] == "full", f"Expected full for {feat} in {p_code}"
            assert by_plan[p_code][feat]["limit_value"] is None

    print("  --> ALL 21 ENTITLEMENT ROWS VERIFIED ACCORDING TO SOURCE OF TRUTH!")

    # 3. Verify user_subscriptions table
    sub_res = sb.from_("user_subscriptions").select("*").limit(5).execute()
    print(f"\n[3] user_subscriptions table: Accessible, {len(sub_res.data or [])} rows found.")

    # 4. Verify subscription_events table
    events_res = sb.from_("subscription_events").select("*").limit(5).execute()
    print(f"[4] subscription_events table: Accessible, {len(events_res.data or [])} rows found.")

    print("\n" + "=" * 70)
    print("LIVE SUPABASE VERIFICATION COMPLETED SUCCESSFULLY (100% PASS)")
    print("=" * 70)


if __name__ == "__main__":
    verify_live_db()
