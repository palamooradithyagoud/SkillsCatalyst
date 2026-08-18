"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Lock, X } from "lucide-react";

interface PaymentPosSwipeAnimationProps {
  planId: "1month" | "3months";
  planName: string;
  price: string;
  numericPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentPosSwipeAnimation({
  planId,
  planName,
  price,
  numericPrice,
  onSuccess,
  onCancel,
}: PaymentPosSwipeAnimationProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleTriggerPayment = () => {
    if (isSwiping || isSuccess) return;
    setIsSwiping(true);

    // After animation completes (1.4s), trigger success
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1600);
    }, 1400);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto text-white">
      {/* Top Header */}
      <div className="text-center space-y-1.5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted POS Gateway</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          {isSuccess ? "Payment Approved! 🎉" : `Activate ${planName}`}
        </h3>
        <p className="text-xs text-slate-300">
          {isSuccess
            ? "Your Pro pass is active. Unlocking all roadmaps & practice..."
            : "Hover or click the terminal below to swipe card & complete payment."}
        </p>
      </div>

      {/* ── Exact CSS Card & POS Machine Terminal Animation ── */}
      <div className="relative my-4 flex items-center justify-center">
        <style jsx>{`
          .pos-container {
            background-color: #1e1e2f;
            display: flex;
            width: 460px;
            height: 120px;
            position: relative;
            border-radius: 12px;
            transition: 0.3s ease-in-out;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
            user-select: none;
          }

          .pos-container:hover,
          .pos-container.active {
            transform: scale(1.03);
            width: 220px;
          }

          .pos-container:hover .pos-left-side,
          .pos-container.active .pos-left-side {
            width: 100%;
          }

          .pos-left-side {
            background-color: #3b82f6;
            width: 130px;
            height: 120px;
            border-radius: 10px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: 0.3s;
            flex-shrink: 0;
            overflow: hidden;
          }

          .pos-right-side {
            width: calc(100% - 130px);
            display: flex;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            justify-content: space-between;
            white-space: nowrap;
            transition: 0.3s;
            padding-right: 15px;
          }

          .pos-right-side:hover {
            background-color: #2a2a3d;
          }

          .pos-arrow {
            width: 22px;
            height: 22px;
            margin-right: 15px;
            color: #93c5fd;
            transition: transform 0.2s;
          }

          .pos-right-side:hover .pos-arrow {
            transform: translateX(4px);
          }

          .pos-new {
            font-size: 20px;
            font-family: inherit;
            font-weight: 800;
            margin-left: 20px;
            color: #f3f4f6;
          }

          .pos-card {
            width: 70px;
            height: 46px;
            background-color: #93c5fd;
            border-radius: 6px;
            position: absolute;
            display: flex;
            z-index: 10;
            flex-direction: column;
            align-items: center;
            box-shadow: 9px 9px 9px -2px rgba(59, 130, 246, 0.5);
          }

          .pos-card-line {
            width: 65px;
            height: 13px;
            background-color: #60a5fa;
            border-radius: 2px;
            margin-top: 7px;
          }

          @media only screen and (max-width: 480px) {
            .pos-container {
              transform: scale(0.72);
              transform-origin: center center;
            }

            .pos-container:hover,
            .pos-container.active {
              transform: scale(0.76);
            }

            .pos-new {
              font-size: 17px;
            }
          }

          .pos-buttons {
            width: 8px;
            height: 8px;
            background-color: #1e40af;
            box-shadow:
              0 -10px 0 0 #1e3a8a,
              0 10px 0 0 #3b82f6;
            border-radius: 50%;
            margin-top: 5px;
            transform: rotate(90deg);
            margin: 10px 0 0 -30px;
          }

          .pos-container:hover .pos-card,
          .pos-container.active .pos-card {
            animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
          }

          .pos-container:hover .pos-post,
          .pos-container.active .pos-post {
            animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
          }

          @keyframes slide-top {
            0% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-70px) rotate(90deg);
            }

            60% {
              transform: translateY(-70px) rotate(90deg);
            }

            100% {
              transform: translateY(-8px) rotate(90deg);
            }
          }

          .pos-post {
            width: 63px;
            height: 75px;
            background-color: #4b5563;
            position: absolute;
            z-index: 11;
            bottom: 10px;
            top: 120px;
            border-radius: 6px;
            overflow: hidden;
          }

          .pos-post-line {
            width: 47px;
            height: 9px;
            background-color: #1f2937;
            position: absolute;
            border-radius: 0px 0px 3px 3px;
            right: 8px;
            top: 8px;
          }

          .pos-post-line:before {
            content: "";
            position: absolute;
            width: 47px;
            height: 9px;
            background-color: #374151;
            top: -8px;
          }

          .pos-screen {
            width: 47px;
            height: 23px;
            background-color: #0f172a;
            position: absolute;
            top: 22px;
            right: 8px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }

          .pos-numbers {
            width: 12px;
            height: 12px;
            background-color: #6b7280;
            box-shadow:
              0 -18px 0 0 #6b7280,
              0 18px 0 0 #6b7280;
            border-radius: 2px;
            position: absolute;
            transform: rotate(90deg);
            left: 25px;
            top: 52px;
          }

          .pos-numbers-line2 {
            width: 12px;
            height: 12px;
            background-color: #9ca3af;
            box-shadow:
              0 -18px 0 0 #9ca3af,
              0 18px 0 0 #9ca3af;
            border-radius: 2px;
            position: absolute;
            transform: rotate(90deg);
            left: 25px;
            top: 68px;
          }

          @keyframes slide-post {
            50% {
              transform: translateY(0);
            }

            100% {
              transform: translateY(-70px);
            }
          }

          .pos-dollar {
            position: absolute;
            font-size: 11px;
            font-weight: 900;
            width: 100%;
            left: 0;
            top: 4px;
            color: #34d399;
            text-align: center;
            font-family: monospace;
          }

          .pos-container:hover .pos-dollar,
          .pos-container.active .pos-dollar {
            animation: fade-in-fwd 0.3s 1s backwards;
          }

          @keyframes fade-in-fwd {
            0% {
              opacity: 0;
              transform: translateY(-5px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div
          className={`pos-container ${isSwiping || isHovered ? "active" : ""}`}
          onClick={handleTriggerPayment}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Side with Card & POS Machine */}
          <div className="pos-left-side">
            <div className="pos-card">
              <div className="pos-card-line" />
              <div className="pos-buttons" />
            </div>

            <div className="pos-post">
              <div className="pos-post-line" />
              <div className="pos-screen">
                <div className="pos-dollar">{price}</div>
              </div>
              <div className="pos-numbers" />
              <div className="pos-numbers-line2" />
            </div>
          </div>

          {/* Right Side with Text & Arrow */}
          <div className="pos-right-side">
            <div className="pos-new">Pay {price}</div>
            <svg
              className="pos-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transaction Status Pill */}
      <div className="mt-4 flex flex-col items-center gap-3">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Success! {planName} Activated</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={handleTriggerPayment}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>{isSwiping ? "Processing Card Swipe..." : `Swipe Card to Pay ${price}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          Cancel & Return to Plans
        </button>
      </div>
    </div>
  );
}
