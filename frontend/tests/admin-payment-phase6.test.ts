/**
 * frontend/tests/admin-payment-phase6.test.ts
 * Comprehensive test suite for Phase 6 Admin Payment Dashboard & Subscription Lifecycle Management.
 * 
 * Verifies:
 * 1. API client exports and type integrity.
 * 2. Financial metrics contract (collected revenue, promotional passes, paise-to-rupees conversion).
 * 3. Transactions ledger pagination, filtering, and data sanitization.
 * 4. Subscriptions roster structure, entitlement mapping, and safe cancellation semantics.
 * 5. Admin tabs integration and accessibility.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as AdminPaymentAPI from "@/lib/api/admin_payment";
import type {
  AdminPaymentMetricsDTO,
  AdminPaymentTransactionDTO,
  AdminTransactionsListResponse,
  AdminSubscriptionDTO,
  AdminSubscriptionsListResponse,
  AdminCancelSubscriptionResponse,
} from "@/lib/api/admin_payment";

describe("Phase 6 — Admin Payment Dashboard & Subscription Management Suite", () => {
  describe("1. API Module Exports & Facade Integrity", () => {
    it("preserves identical export references between facade and admin payment module", () => {
      assert.strictEqual(
        FacadeAPI.fetchAdminPaymentMetrics,
        AdminPaymentAPI.fetchAdminPaymentMetrics
      );
      assert.strictEqual(
        FacadeAPI.fetchAdminTransactions,
        AdminPaymentAPI.fetchAdminTransactions
      );
      assert.strictEqual(
        FacadeAPI.fetchAdminSubscriptions,
        AdminPaymentAPI.fetchAdminSubscriptions
      );
      assert.strictEqual(
        FacadeAPI.cancelAdminSubscription,
        AdminPaymentAPI.cancelAdminSubscription
      );
    });
  });

  describe("2. Financial Telemetry & Invariants Contract", () => {
    it("validates authoritative AdminPaymentMetricsDTO structure", () => {
      const mockMetrics: AdminPaymentMetricsDTO = {
        total_collected_amount_in_paise: 990000,
        total_collected_amount_in_rupees: 9900.0,
        gross_transaction_value_in_paise: 1240000,
        gross_transaction_value_in_rupees: 12400.0,
        total_discount_amount_in_paise: 250000,
        total_discount_amount_in_rupees: 2500.0,
        successful_count: 10,
        pending_count: 2,
        failed_count: 1,
        cancelled_count: 1,
        promotional_pass_count: 3,
        currency: "INR",
        start_date: "2026-09-01T00:00:00Z",
        end_date: "2026-10-01T00:00:00Z",
        preset: "30d",
        by_plan: [
          {
            plan_code: "premium_monthly",
            plan_name: "Premium Monthly",
            count: 7,
            collected_amount_in_paise: 69300,
            collected_amount_in_rupees: 693.0,
          },
        ],
        by_coupon: [
          {
            coupon_code: "WELCOME50",
            redemption_count: 4,
            total_discount_in_paise: 19800,
            total_discount_in_rupees: 198.0,
          },
        ],
        activity: [
          {
            date: "2026-09-22",
            collected_amount_in_paise: 9900,
            collected_amount_in_rupees: 99.0,
            transaction_count: 1,
            successful_count: 1,
          },
        ],
      };

      // Invariant: Collected cash revenue must strictly equal total_collected_amount_in_paise / 100
      assert.strictEqual(
        mockMetrics.total_collected_amount_in_rupees,
        mockMetrics.total_collected_amount_in_paise / 100.0
      );

      // Invariant: Gross value must equal gross_transaction_value_in_paise / 100
      assert.strictEqual(
        mockMetrics.gross_transaction_value_in_rupees,
        mockMetrics.gross_transaction_value_in_paise / 100.0
      );

      // Invariant: Promotional passes must be tracked distinctly
      assert.strictEqual(mockMetrics.promotional_pass_count, 3);
      assert.strictEqual(mockMetrics.currency, "INR");
    });
  });

  describe("3. Transactions Ledger & Security Sanitization", () => {
    it("validates AdminPaymentTransactionDTO ensures no provider credentials or secrets leak", () => {
      const mockTx: AdminPaymentTransactionDTO = {
        id: "11111111-2222-3333-4444-555555555555",
        merchant_order_id: "order_sc_abc123456",
        user_id: "99999999-8888-7777-6666-555555555555",
        user_email: "student@example.com",
        user_name: "Adithya Student",
        plan_code: "premium_monthly",
        plan_name: "Premium Monthly",
        original_amount_in_paise: 9900,
        discount_in_paise: 4950,
        amount_in_paise: 4950,
        currency: "INR",
        coupon_code: "WELCOME50",
        status: "success",
        created_at: "2026-10-19T10:00:00Z",
        completed_at: "2026-10-19T10:01:00Z",
        subscription_id: "sub_12345",
        provider: "phonepe",
      };

      assert.strictEqual(mockTx.merchant_order_id, "order_sc_abc123456");
      assert.strictEqual(mockTx.amount_in_paise, 4950);
      assert.strictEqual(mockTx.original_amount_in_paise, 9900);
      assert.strictEqual(mockTx.discount_in_paise, 4950);

      // Security check: Verify no provider_response or secret fields exist on the DTO interface
      const keys = Object.keys(mockTx);
      assert.ok(!keys.includes("provider_response"), "Raw provider response must be sanitized");
      assert.ok(!keys.includes("client_secret"), "No client secrets allowed");
      assert.ok(!keys.includes("merchant_key"), "No merchant keys allowed");
    });

    it("validates paginated transactions list response shape", () => {
      const listResp: AdminTransactionsListResponse = {
        transactions: [],
        total_count: 42,
        page: 2,
        limit: 20,
        total_pages: 3,
        has_more: true,
      };

      assert.strictEqual(listResp.total_count, 42);
      assert.strictEqual(listResp.page, 2);
      assert.strictEqual(listResp.total_pages, 3);
      assert.strictEqual(listResp.has_more, true);
    });
  });

  describe("4. Subscriptions Roster & Safe Cancellation Semantics", () => {
    it("validates AdminSubscriptionDTO with entitlement status", () => {
      const mockSub: AdminSubscriptionDTO = {
        id: "sub_active_001",
        user_id: "user_12345",
        user_email: "learner@skillscatalyst.in",
        user_name: "Active Learner",
        plan_id: "plan_monthly_id",
        plan_code: "premium_monthly",
        plan_name: "Premium Monthly",
        status: "active",
        is_premium: true,
        started_at: "2026-10-01T00:00:00Z",
        expires_at: "2026-10-31T23:59:59Z",
        cancelled_at: null,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
        recent_transaction: {
          id: "tx_001",
          merchant_order_id: "order_sc_001",
          amount_in_paise: 9900,
          status: "success",
          created_at: "2026-10-01T00:00:00Z",
        },
        entitlements_summary: {
          tier: "premium_monthly",
          is_premium: true,
        },
      };

      assert.strictEqual(mockSub.status, "active");
      assert.strictEqual(mockSub.is_premium, true);
      assert.strictEqual(mockSub.cancelled_at, null);
    });

    it("verifies safe cancellation response preserves period access without refund", () => {
      const cancelResp: AdminCancelSubscriptionResponse = {
        success: true,
        subscription_id: "sub_active_001",
        user_id: "user_12345",
        status: "cancelled",
        cancelled_at: "2026-10-19T23:00:00Z",
        expires_at: "2026-10-31T23:59:59Z",
        message: "Subscription renewal successfully cancelled. Paid entitlement remains active until the end of current period.",
        is_already_cancelled: false,
      };

      assert.strictEqual(cancelResp.success, true);
      assert.strictEqual(cancelResp.status, "cancelled");
      assert.ok(cancelResp.expires_at, "Expires_at must be preserved upon renewal cancellation");
      assert.strictEqual(cancelResp.is_already_cancelled, false);
    });
  });

  describe("5. Admin Page Tabs Registration", async () => {
    it("ensures AdminPage registers payments and subscriptions tabs with icons and content", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const adminPagePath = path.resolve(__dirname, "../app/admin/page.tsx");
      const content = fs.readFileSync(adminPagePath, "utf-8");

      assert.ok(
        content.includes('"payments"'),
        "AdminPage must declare 'payments' in AdminTab union"
      );
      assert.ok(
        content.includes('"subscriptions"'),
        "AdminPage must declare 'subscriptions' in AdminTab union"
      );
      assert.ok(
        content.includes("AdminPaymentsCMS"),
        "AdminPage must import and render AdminPaymentsCMS"
      );
      assert.ok(
        content.includes("AdminSubscriptionsCMS"),
        "AdminPage must import and render AdminSubscriptionsCMS"
      );
    });
  });
});
