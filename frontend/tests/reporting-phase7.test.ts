/**
 * frontend/tests/reporting-phase7.test.ts
 * Comprehensive frontend test suite for Phase 7:
 * Financial Reporting, Receipts, Secure CSV Exports, and Payment Reconciliation.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as FacadeAPI from "@/lib/api";
import * as ReportingAPI from "@/lib/api/reporting";
import type {
  PaymentReceiptDTO,
  ReconciliationOutcome,
  ReconciliationItemDTO,
  ReconciliationSummaryDTO,
  SingleReconciliationResponse,
} from "@/lib/api/reporting";

describe("Phase 7 — Financial Reporting, Receipts, CSV Exports & Payment Reconciliation Suite", () => {
  describe("1. Module Exports & Facade Integrity", () => {
    it("preserves identical export references between facade and reporting module", () => {
      assert.strictEqual(
        FacadeAPI.getPaymentReceipt,
        ReportingAPI.getPaymentReceipt
      );
      assert.strictEqual(
        FacadeAPI.getAdminPaymentReceipt,
        ReportingAPI.getAdminPaymentReceipt
      );
      assert.strictEqual(
        FacadeAPI.getFinancialReport,
        ReportingAPI.getFinancialReport
      );
      assert.strictEqual(
        FacadeAPI.downloadTransactionsCsv,
        ReportingAPI.downloadTransactionsCsv
      );
      assert.strictEqual(
        FacadeAPI.downloadRevenueSummaryCsv,
        ReportingAPI.downloadRevenueSummaryCsv
      );
      assert.strictEqual(
        FacadeAPI.runReconciliationBatch,
        ReportingAPI.runReconciliationBatch
      );
      assert.strictEqual(
        FacadeAPI.reconcileSingleOrder,
        ReportingAPI.reconcileSingleOrder
      );
    });
  });

  describe("2. Payment Receipt DTO & Promotional Distinction Contract", () => {
    it("validates successful paid payment receipt structure", () => {
      const mockReceipt: PaymentReceiptDTO = {
        receipt_id: "rcpt_order_sc_test1",
        receipt_type: "payment_receipt",
        merchant_order_id: "order_sc_test1",
        provider_order_id: "PP_ORD_1001",
        payment_date: "2026-10-18T10:00:00Z",
        customer_id: "00000000-0000-4000-8000-000000000001",
        customer_name: "Adithya Student",
        customer_email: "adithya@example.com",
        plan_code: "pro_monthly",
        plan_name: "Pro Monthly",
        duration_days: 30,
        original_amount_in_paise: 49900,
        original_amount_in_rupees: 499.0,
        discount_in_paise: 0,
        discount_in_rupees: 0.0,
        amount_paid_in_paise: 49900,
        amount_paid_in_rupees: 499.0,
        currency: "INR",
        payment_status: "PAID",
        subscription_id: "sub-12345",
        subscription_started_at: "2026-10-18T10:00:00Z",
        subscription_expires_at: "2026-11-17T10:00:00Z",
        generated_at: "2026-10-18T10:00:01Z",
        is_promotional: false,
        disclaimer: "SkillsCatalyst electronic payment receipt. No GST registration is claimed.",
        platform_name: "SkillsCatalyst",
        platform_url: "https://skillscatalyst.in",
        support_email: "support@skillscatalyst.in",
      };

      assert.strictEqual(mockReceipt.receipt_type, "payment_receipt");
      assert.strictEqual(mockReceipt.payment_status, "PAID");
      assert.strictEqual(mockReceipt.is_promotional, false);
      assert.strictEqual(mockReceipt.amount_paid_in_rupees, 499.0);
      assert.strictEqual(mockReceipt.currency, "INR");
      assert.ok(mockReceipt.receipt_id.startsWith("rcpt_"));
      assert.ok(mockReceipt.disclaimer.includes("No GST"));
    });

    it("validates zero-value promotional pass confirmation structure", () => {
      const mockPromoReceipt: PaymentReceiptDTO = {
        receipt_id: "rcpt_order_sc_promo",
        receipt_type: "promotional_confirmation",
        merchant_order_id: "order_sc_promo",
        provider_order_id: null,
        payment_date: "2026-10-18T12:00:00Z",
        customer_id: "00000000-0000-4000-8000-000000000002",
        customer_name: "Promotional User",
        customer_email: "promo@example.com",
        plan_code: "pro_monthly",
        plan_name: "Pro Monthly",
        duration_days: 30,
        original_amount_in_paise: 49900,
        original_amount_in_rupees: 499.0,
        discount_in_paise: 49900,
        discount_in_rupees: 499.0,
        coupon_code: "FREEPASS100",
        amount_paid_in_paise: 0,
        amount_paid_in_rupees: 0.0,
        currency: "INR",
        payment_status: "PROMOTIONAL_GRANT",
        subscription_id: "sub-promo-1",
        subscription_started_at: "2026-10-18T12:00:00Z",
        subscription_expires_at: "2026-11-17T12:00:00Z",
        generated_at: "2026-10-18T12:00:01Z",
        is_promotional: true,
        disclaimer: "Promotional Confirmation: No cash payment was collected.",
        platform_name: "SkillsCatalyst",
        platform_url: "https://skillscatalyst.in",
        support_email: "support@skillscatalyst.in",
      };

      assert.strictEqual(mockPromoReceipt.receipt_type, "promotional_confirmation");
      assert.strictEqual(mockPromoReceipt.payment_status, "PROMOTIONAL_GRANT");
      assert.strictEqual(mockPromoReceipt.is_promotional, true);
      assert.strictEqual(mockPromoReceipt.amount_paid_in_paise, 0);
      assert.strictEqual(mockPromoReceipt.amount_paid_in_rupees, 0.0);
      assert.strictEqual(mockPromoReceipt.coupon_code, "FREEPASS100");
      assert.ok(mockPromoReceipt.disclaimer.includes("No cash payment"));
    });
  });

  describe("3. Payment Reconciliation Contracts & Anomaly Classifications", () => {
    it("validates ReconciliationOutcome types and item structure", () => {
      const outcomes: ReconciliationOutcome[] = [
        "matched",
        "pending_recovered_success",
        "pending_marked_failed",
        "amount_mismatch",
        "currency_mismatch",
        "status_mismatch_review",
        "missing_provider_ref",
        "missing_subscription_recovered",
        "coupon_inconsistency",
        "provider_unavailable",
      ];
      assert.strictEqual(outcomes.length, 10);

      const mockItem: ReconciliationItemDTO = {
        merchant_order_id: "order_sc_mismatch",
        user_id: "00000000-0000-4000-8000-000000000001",
        user_email: "test@example.com",
        plan_code: "pro_monthly",
        local_status: "success",
        local_amount_in_paise: 49900,
        local_currency: "INR",
        provider_status: "COMPLETED",
        provider_amount_in_paise: 100, // mismatch!
        provider_currency: "INR",
        provider_order_id: "PP_ORD_999",
        outcome: "amount_mismatch",
        action_taken: "Amount mismatch detected. Flagged for review.",
        requires_review: true,
        reconciled_at: "2026-10-19T14:00:00Z",
        error_detail: "Expected 49900 paise, PhonePe reported 100 paise.",
      };

      assert.strictEqual(mockItem.outcome, "amount_mismatch");
      assert.strictEqual(mockItem.requires_review, true);
      assert.ok(mockItem.action_taken.includes("mismatch"));
      assert.ok(mockItem.error_detail?.includes("paise"));
    });

    it("validates ReconciliationSummaryDTO contract", () => {
      const mockSummary: ReconciliationSummaryDTO = {
        total_checked: 25,
        matched_count: 20,
        recovered_count: 3,
        mismatches_count: 1,
        unresolved_count: 1,
        review_required_count: 2,
        started_at: "2026-10-19T14:00:00Z",
        completed_at: "2026-10-19T14:00:05Z",
        items: [],
      };

      assert.strictEqual(mockSummary.total_checked, 25);
      assert.strictEqual(mockSummary.matched_count, 20);
      assert.strictEqual(mockSummary.recovered_count, 3);
      assert.strictEqual(mockSummary.mismatches_count, 1);
      assert.strictEqual(mockSummary.unresolved_count, 1);
      assert.strictEqual(mockSummary.review_required_count, 2);
    });
  });
});
