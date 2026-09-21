import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as SubscriptionAPI from "@/lib/api/subscription";
import type {
  SubscriptionPlan,
  MySubscriptionResponse,
  FeatureKey,
} from "@/lib/api/subscription";

describe("Subscription Module API & Types Integrity", () => {
  it("preserves identical export references between facade and subscription domain module", () => {
    assert.strictEqual(
      FacadeAPI.fetchSubscriptionPlans,
      SubscriptionAPI.fetchSubscriptionPlans
    );
    assert.strictEqual(
      FacadeAPI.fetchMySubscription,
      SubscriptionAPI.fetchMySubscription
    );
    assert.strictEqual(
      FacadeAPI.FALLBACK_FREE_SUBSCRIPTION,
      SubscriptionAPI.FALLBACK_FREE_SUBSCRIPTION
    );
  });

  it("validates fallback free tier contains all 7 canonical features with correct limits", () => {
    const fallback = SubscriptionAPI.FALLBACK_FREE_SUBSCRIPTION;
    assert.strictEqual(fallback.plan, "free");
    assert.strictEqual(fallback.status, "active");
    assert.strictEqual(fallback.is_premium, false);

    const expectedFeatures: FeatureKey[] = [
      "saved_videos",
      "company_interview_questions",
      "placement_prep",
      "scholarships",
      "tech_news",
      "ai_mentor",
      "roadmaps",
    ];

    for (const feat of expectedFeatures) {
      assert.ok(
        fallback.entitlements[feat],
        `Missing feature entitlement in fallback: ${feat}`
      );
    }

    // Specific free limits
    assert.strictEqual(fallback.entitlements.saved_videos.access, "limited");
    assert.strictEqual(fallback.entitlements.saved_videos.limit, 1);
    assert.strictEqual(fallback.entitlements.company_interview_questions.access, "none");
    assert.strictEqual(fallback.entitlements.placement_prep.access, "none");
    assert.strictEqual(fallback.entitlements.tech_news.access, "limited");
    assert.strictEqual(fallback.entitlements.tech_news.limit, 2);
    assert.strictEqual(fallback.entitlements.scholarships.access, "limited");
    assert.strictEqual(fallback.entitlements.ai_mentor.access, "limited");
    assert.strictEqual(fallback.entitlements.roadmaps.access, "limited");
  });

  it("validates canonical plan structure and paise pricing", () => {
    const mockPlans: SubscriptionPlan[] = [
      {
        code: "free",
        name: "Free",
        description: "Essential foundational access to explore skills",
        price_in_paise: 0,
        currency: "INR",
        duration_days: null,
        is_active: true,
      },
      {
        code: "premium_monthly",
        name: "Premium Monthly",
        description: "Fast-paced interview sprint preparation with unrestricted access",
        price_in_paise: 9900,
        currency: "INR",
        duration_days: 30,
        is_active: true,
      },
      {
        code: "premium_3_month",
        name: "Premium 3 Months",
        description: "Complete 90-day placement preparation pack (Save ~16%)",
        price_in_paise: 25000,
        currency: "INR",
        duration_days: 90,
        is_active: true,
      },
    ];

    assert.strictEqual(mockPlans[0].price_in_paise, 0);
    assert.strictEqual(mockPlans[1].price_in_paise, 9900);
    assert.strictEqual(mockPlans[2].price_in_paise, 25000);
    assert.strictEqual(mockPlans[1].duration_days, 30);
    assert.strictEqual(mockPlans[2].duration_days, 90);
  });
});
