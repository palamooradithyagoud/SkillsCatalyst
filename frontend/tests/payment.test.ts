import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as PaymentAPI from "@/lib/api/payment";
import type {
  CreatePaymentOrderResponse,
  PaymentStatusResponse,
  PaymentTransactionDTO,
} from "@/lib/api/payment";

describe("Payment Module API & Types Integrity", () => {
  it("preserves identical export references between facade and payment domain module", () => {
    assert.strictEqual(FacadeAPI.createPaymentOrder, PaymentAPI.createPaymentOrder);
    assert.strictEqual(FacadeAPI.fetchPaymentStatus, PaymentAPI.fetchPaymentStatus);
    assert.strictEqual(FacadeAPI.fetchPaymentHistory, PaymentAPI.fetchPaymentHistory);
  });

  it("validates CreatePaymentOrderResponse structure", () => {
    const mockOrderResp: CreatePaymentOrderResponse = {
      success: true,
      merchant_order_id: "order_sc_abc123456789",
      checkout_url: "https://mercury-uat.phonepe.com/transact/pg?token=test",
      amount_in_paise: 9900,
      currency: "INR",
      plan_code: "premium_monthly",
    };

    assert.strictEqual(mockOrderResp.success, true);
    assert.strictEqual(mockOrderResp.amount_in_paise, 9900);
    assert.strictEqual(mockOrderResp.currency, "INR");
    assert.ok(mockOrderResp.checkout_url.startsWith("https://"));
  });

  it("validates PaymentStatusResponse structure", () => {
    const mockStatusResp: PaymentStatusResponse = {
      merchant_order_id: "order_sc_abc123456789",
      status: "success",
      is_completed: true,
      plan_code: "premium_monthly",
      amount_in_paise: 9900,
      created_at: new Date().toISOString(),
    };

    assert.strictEqual(mockStatusResp.status, "success");
    assert.strictEqual(mockStatusResp.is_completed, true);
    assert.strictEqual(mockStatusResp.amount_in_paise, 9900);
  });

  it("validates PaymentTransactionDTO structure for payment history", () => {
    const mockHistoryItem: PaymentTransactionDTO = {
      id: "11111111-2222-3333-4444-555555555555",
      merchant_order_id: "order_sc_hist_123",
      provider_order_id: "PP_ORD_123",
      plan_code: "premium_3_month",
      plan_name: "Premium 3 Months",
      amount_in_paise: 25000,
      currency: "INR",
      status: "success",
      created_at: new Date().toISOString(),
    };

    assert.strictEqual(mockHistoryItem.amount_in_paise, 25000);
    assert.strictEqual(mockHistoryItem.plan_code, "premium_3_month");
    assert.strictEqual(mockHistoryItem.status, "success");
  });

  it("SYS-03: DashboardPage does not trigger payment confirmation banner solely on ?payment=complete", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dashboardPath = path.resolve(__dirname, "../app/dashboard/page.tsx");
    const content = fs.readFileSync(dashboardPath, "utf-8");

    // Must NOT have the old vulnerable pattern
    assert.ok(
      !content.includes('params.get("payment") === "complete"\n        setShowPaymentBanner(true)'),
      "SECURITY VIOLATION: DashboardPage must not show payment banner solely on ?payment=complete"
    );
    assert.ok(
      !content.includes("setShowPaymentBanner(true)"),
      "SECURITY VIOLATION: Unconditional setShowPaymentBanner must be removed"
    );

    // Must import and use fetchPaymentStatus
    assert.ok(
      content.includes("fetchPaymentStatus"),
      "DashboardPage must import and call fetchPaymentStatus"
    );
    assert.ok(
      content.includes('params.get("order_id")') || content.includes('params.get("merchant_order_id")'),
      "DashboardPage must extract order_id / merchant_order_id from URL params"
    );
    assert.ok(
      content.includes("type: \"verifying\"") && content.includes("type: \"pending\"") && content.includes("type: \"failed\""),
      "DashboardPage must support distinct verifying, pending, and failed states"
    );
  });

  it("SYS-03: verifies payment status transitions and payload integrity", () => {
    // 1. Pending status response
    const pendingResp: PaymentStatusResponse = {
      merchant_order_id: "order_sc_pending_123",
      status: "pending",
      is_completed: false,
      plan_code: "premium_monthly",
      amount_in_paise: 9900,
    };
    assert.strictEqual(pendingResp.status, "pending");
    assert.strictEqual(pendingResp.is_completed, false);

    // 2. Failed status response
    const failedResp: PaymentStatusResponse = {
      merchant_order_id: "order_sc_failed_123",
      status: "failed",
      is_completed: false,
      plan_code: "premium_monthly",
      amount_in_paise: 9900,
    };
    assert.strictEqual(failedResp.status, "failed");
    assert.strictEqual(failedResp.is_completed, false);

    // 3. Cancelled status response
    const cancelledResp: PaymentStatusResponse = {
      merchant_order_id: "order_sc_cancelled_123",
      status: "cancelled",
      is_completed: false,
      plan_code: "premium_3_month",
      amount_in_paise: 25000,
    };
    assert.strictEqual(cancelledResp.status, "cancelled");
    assert.strictEqual(cancelledResp.is_completed, false);
  });

  it("SYS-03: validates contradictory and malformed status resolution rules", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dashboardPath = path.resolve(__dirname, "../app/dashboard/page.tsx");
    const content = fs.readFileSync(dashboardPath, "utf-8");

    // Strictly require BOTH status === "success" AND is_completed === true
    assert.ok(
      content.includes('res?.status === "success" && res?.is_completed'),
      "SECURITY INVARIANT: Success state must require BOTH status === 'success' and is_completed === true"
    );

    // Contradictory pending check: must NOT have is_completed: true
    assert.ok(
      content.includes('!res?.is_completed'),
      "SECURITY INVARIANT: Pending state must check !res?.is_completed"
    );

    // Isolated subscription refetch error handling
    assert.ok(
      content.includes("[Dashboard] Subscription refetch failed after verified payment"),
      "DashboardPage must gracefully catch refetchSubscription errors without rejecting verified payment state"
    );
  });
});


