"use client";

import React, { useRef } from "react";
import { PaymentReceiptDTO } from "@/lib/api/reporting";
import { CheckCircle2, Gift, Printer, X, ShieldCheck } from "lucide-react";

interface PaymentReceiptModalProps {
  receipt: PaymentReceiptDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const isPromo = receipt.is_promotional || receipt.receipt_type === "promotional_confirmation";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:p-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-300">
              Verified SkillsCatalyst Document
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Print receipt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close receipt modal"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={printableRef} className="p-6 md:p-8 space-y-6 text-zinc-200 bg-zinc-900 print:text-black print:bg-white print:p-4">
          {/* Platform & Receipt Banner */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-zinc-800 print:border-zinc-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white print:text-black">
                  Skills<span className="text-blue-500">Catalyst</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 print:text-zinc-600 mt-1">
                Engineering & Tech Career Acceleration Platform
              </p>
              <p className="text-xs text-zinc-500 print:text-zinc-600">
                {receipt.platform_url} • {receipt.support_email}
              </p>
            </div>

            <div className="md:text-right">
              <span
                id="receipt-dialog-title"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isPromo
                    ? "bg-purple-950/80 text-purple-300 border border-purple-800/60 print:bg-purple-100 print:text-purple-900"
                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 print:bg-emerald-100 print:text-emerald-900"
                }`}
              >
                {isPromo ? (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    Promotional Confirmation
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Payment Receipt
                  </>
                )}
              </span>
              <p className="text-xs text-zinc-400 print:text-zinc-600 mt-2 font-mono">
                {receipt.receipt_id}
              </p>
              <p className="text-xs text-zinc-500 print:text-zinc-600">
                Issued: {formatDate(receipt.generated_at)}
              </p>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-zinc-950/50 print:bg-zinc-50 border border-zinc-800/80 print:border-zinc-200 rounded-xl p-4">
            <div>
              <p className="text-zinc-500 print:text-zinc-500 font-medium">Billed To</p>
              <p className="text-sm font-semibold text-white print:text-black mt-0.5">
                {receipt.customer_name || "SkillsCatalyst Student"}
              </p>
              <p className="text-zinc-400 print:text-zinc-600">{receipt.customer_email || "N/A"}</p>
              <p className="text-[11px] text-zinc-500 print:text-zinc-400 font-mono mt-1">
                Student ID: {receipt.customer_id}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-zinc-500 print:text-zinc-500 font-medium">Payment References</p>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400 print:text-zinc-600">Order ID:</span>
                <span className="font-mono text-zinc-200 print:text-black">{receipt.merchant_order_id}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400 print:text-zinc-600">Gateway Ref:</span>
                <span className="font-mono text-zinc-200 print:text-black">
                  {receipt.provider_order_id || (isPromo ? "Promotional Grant" : "Standard Checkout")}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400 print:text-zinc-600">Payment Date:</span>
                <span className="text-zinc-200 print:text-black">{formatDate(receipt.payment_date)}</span>
              </div>
            </div>
          </div>

          {/* Subscription & Pricing Breakdown Table */}
          <div className="border border-zinc-800 print:border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-zinc-800/60 print:bg-zinc-100 text-zinc-400 print:text-zinc-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4 text-left">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Duration</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white print:text-black text-sm">{receipt.plan_name}</p>
                    <p className="text-zinc-400 print:text-zinc-600 text-[11px]">
                      Access to Pro courses, mentorship, quizzes, and live career tools.
                    </p>
                    {receipt.subscription_expires_at && (
                      <p className="text-[11px] text-emerald-400 print:text-emerald-700 mt-1">
                        Active Period: {formatDate(receipt.subscription_started_at)} – {formatDate(receipt.subscription_expires_at)}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-300 print:text-zinc-800">
                    {receipt.duration_days} Days
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-200 print:text-black">
                    ₹{receipt.original_amount_in_rupees.toFixed(2)}
                  </td>
                </tr>

                {receipt.discount_in_paise > 0 && (
                  <tr className="bg-zinc-950/30 print:bg-zinc-50">
                    <td colSpan={2} className="py-2 px-4 text-right text-zinc-400 print:text-zinc-600">
                      Promotional Discount {receipt.coupon_code ? `(${receipt.coupon_code})` : ""}:
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-emerald-400 print:text-emerald-700">
                      -₹{receipt.discount_in_rupees.toFixed(2)}
                    </td>
                  </tr>
                )}

                <tr className="bg-zinc-800/40 print:bg-zinc-100 font-bold text-sm">
                  <td colSpan={2} className="py-3 px-4 text-right text-zinc-200 print:text-black">
                    {isPromo ? "Net Amount Charged (100% Free):" : "Total Paid Amount:"}
                  </td>
                  <td className="py-3 px-4 text-right text-white print:text-black">
                    ₹{receipt.amount_paid_in_rupees.toFixed(2)} {receipt.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal / Tax Transparency Notice */}
          <div className="p-3.5 bg-zinc-950/60 print:bg-zinc-50 border border-zinc-800/80 print:border-zinc-200 rounded-xl">
            <p className="text-[11px] leading-relaxed text-zinc-400 print:text-zinc-600">
              {receipt.disclaimer}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
