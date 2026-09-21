"use client";

import { buttonVariants } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice?: string;
  period: string;
  billingNote?: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  currency?: string;
  currencySymbol?: string;
  onAction?: () => void;
}

export interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  currencySymbol?: string;
  currency?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  currencySymbol = "$",
  currency = "USD",
}: PricingProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [
        "hsl(var(--primary))",
        "hsl(var(--accent))",
        "hsl(var(--secondary))",
        "hsl(var(--muted))",
      ],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      shapes: ["circle"],
    });
  };

  return (
    <div className="container py-6 sm:py-12 md:py-16 px-4 sm:px-6 mx-auto max-w-7xl">
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {title}
        </h2>
        <p className="text-slate-200 text-sm sm:text-base md:text-lg whitespace-pre-line max-w-2xl mx-auto font-medium">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan, index) => {
          const sym = plan.currencySymbol || currencySymbol;
          const curr = plan.currency || currency;

          return (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 1 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -20 : 0,
                      opacity: 1,
                      x: index === 2 ? -30 : index === 0 ? 30 : 0,
                      scale: index === 0 || index === 2 ? 0.94 : 1.0,
                    }
                  : {}
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.6,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: 0.4,
                opacity: { duration: 0.5 },
              }}
              className={cn(
                `rounded-2xl border p-6 bg-white/95 dark:bg-[#11131f]/90 backdrop-blur-xl text-center lg:flex lg:flex-col lg:justify-between relative shadow-xl transition-all hover:scale-[1.01]`,
                plan.isPopular ? "border-emerald-400 border-2 shadow-2xl ring-2 ring-emerald-400/30" : "border-white/20 dark:border-white/10",
                "flex flex-col",
                !plan.isPopular && "mt-0 md:mt-5",
                index === 0 || index === 2
                  ? "z-0 transform translate-x-0 translate-y-0"
                  : "z-10",
                index === 0 && "origin-right",
                index === 2 && "origin-left"
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400 text-black py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-md font-bold text-xs">
                  <Star className="text-black h-3.5 w-3.5 fill-black" />
                  <span>Popular</span>
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <p className="text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    <NumberFlow
                      value={Number(plan.price)}
                      prefix={sym}
                      locales={curr === "INR" ? "en-IN" : "en-US"}
                      format={{
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-xs sm:text-sm font-semibold leading-6 tracking-wide text-slate-500 dark:text-slate-400">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {plan.billingNote || (plan.name.toLowerCase().includes("3 month") ? "Billed every 3 months • ₹83/mo" : plan.name.toLowerCase().includes("free") ? "Free forever • No credit card required" : "Billed monthly • Cancel anytime")}
                </p>

                <ul className="mt-6 gap-3 flex flex-col text-sm">
                  {plan.features.map((feature, idx) => {
                    const isExcluded = feature.startsWith("❌") || feature.includes("❌");
                    return (
                      <li key={idx} className="flex items-start gap-2.5">
                        {isExcluded ? (
                          <span className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0 font-bold text-xs">✕</span>
                        ) : (
                          <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0 font-bold" />
                        )}
                        <span className={cn("text-left text-xs sm:text-sm", isExcluded ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-200 font-medium")}>
                          {feature.replace(/^[❌✅]\s*/, "")}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <hr className="w-full my-6 border-slate-200 dark:border-white/10" />

                {plan.onAction ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (plan.isPopular) fireConfetti();
                      plan.onAction?.();
                    }}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                      }),
                      "group relative w-full gap-2 overflow-hidden text-base font-bold tracking-tight cursor-pointer",
                      "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1",
                      plan.isPopular
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold hover:brightness-105 shadow-md border-0"
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold"
                    )}
                  >
                    {plan.buttonText}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                      }),
                      "group relative w-full gap-2 overflow-hidden text-base font-bold tracking-tight",
                      "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1",
                      plan.isPopular
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold hover:brightness-105 shadow-md border-0"
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold"
                    )}
                  >
                    {plan.buttonText}
                  </Link>
                )}

                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
