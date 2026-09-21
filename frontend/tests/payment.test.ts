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
});
