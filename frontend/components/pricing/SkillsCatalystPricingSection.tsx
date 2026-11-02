"use client";

import React, { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { CheckCheck } from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { cn } from "@/lib/utils";

const PricingSwitch = ({
  button1,
  button2,
  onSwitch,
  className,
  layoutId,
}: {
  button1: string;
  button2: string;
  onSwitch: (value: string) => void;
  className?: string;
  layoutId?: string;
}) => {
  const [selected, setSelected] = useState("0");
  const uniqueId = useId();
  const switchLayoutId = layoutId || `switch-${uniqueId}`;

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div
      className={cn(
        "relative z-10 w-full flex rounded-full bg-neutral-50 border border-gray-200 p-1",
        className
      )}
    >
      <button
        type="button"
        onClick={() => handleSwitch("0")}
        className={cn(
          "relative z-10 w-full sm:h-14 h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap",
          selected === "0"
            ? "text-white"
            : "text-muted-foreground hover:text-black"
        )}
      >
        {selected === "0" && (
          <motion.span
            layoutId={switchLayoutId}
            className="absolute top-0 left-0 sm:h-14 h-10 w-full rounded-full border-4 shadow-sm shadow-black border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative">{button1}</span>
      </button>

      <button
        type="button"
        onClick={() => handleSwitch("1")}
        className={cn(
          "relative z-10 w-full sm:h-14 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap",
          selected === "1"
            ? "text-white"
            : "text-muted-foreground hover:text-black"
        )}
      >
        {selected === "1" && (
          <motion.span
            layoutId={switchLayoutId}
            className="absolute top-0 left-0 sm:h-14 h-10 w-full rounded-full border-4 shadow-sm shadow-black border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative flex justify-center items-center gap-1 sm:gap-2">
          {button2}
        </span>
      </button>
    </div>
  );
};

export default function SkillsCatalystPricingSection() {
  const router = useRouter();
  const [isThreeMonths, setIsThreeMonths] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const timelineVaraints = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.08,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const toggleDuration = (value: string) =>
    setIsThreeMonths(Number.parseInt(value) === 1);

  const calculatePrice = () => (isThreeMonths ? 250 : 99);
  const calculateOriginalPrice = () => (isThreeMonths ? 399 : 199);

  const currentPrice = calculatePrice();
  const originalPrice = calculateOriginalPrice();

  // SkillsCatalyst Placement Prep Features (Exact 9 Context Items)
  const features = [
    "660+ Company-Specific Technical Rounds & Questions",
    "Structured Career Tracks (Full Stack, AI/ML, Cloud & DevOps)",
    "DSA Sheets",
    "Aptitude, Reasoning and Verbal Ability",
    "AI Mock Technical Interviews with Real-Time Feedback",
    "ATS Resume Reviewer & Keyword Optimization",
    "Skill Bits: 30 Seconds Reels",
    "Daily Tech Hackathon & Off-Campus Hiring Alerts",
    "Scholarship Alerts",
  ];

  const handlePurchase = () => {
    router.push("/login");
  };

  return (
    <div className="px-4 pb-20 w-full mx-auto relative bg-transparent" ref={pricingRef}>
      {/* Product Features & Pricing Switcher Grid */}
      <div className="px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:gap-12 gap-8 items-center">
            {/* Left: What's inside (Description shown down on mobile, left on desktop) */}
            <div className="order-2 sm:order-1">
              <TimelineContent
                as="h3"
                animationNum={0}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="text-3xl font-medium text-gray-900 mb-6"
              >
                What&apos;s inside
              </TimelineContent>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <TimelineContent
                    key={index}
                    as="div"
                    animationNum={1 + index}
                    timelineRef={pricingRef}
                    customVariants={timelineVaraints}
                    className="flex items-center"
                  >
                    <div className="w-6 h-6 bg-blue-500 shadow-md shadow-blue-500 rounded-full flex items-center justify-center mr-3 shrink-0">
                      <CheckCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </TimelineContent>
                ))}
              </div>
            </div>

            {/* Right: Switcher & Pricing Purchase (Shown first on mobile, right on desktop) */}
            <div className="space-y-8 order-1 sm:order-2">
              <TimelineContent
                as="div"
                animationNum={1}
                timelineRef={pricingRef}
                customVariants={revealVariants}
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  Plan Duration
                </h4>
                <PricingSwitch
                  button1="1 Month"
                  button2="3 Months (Best Value)"
                  onSwitch={toggleDuration}
                  className="grid grid-cols-2 w-full"
                />
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={2}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="text-center grid grid-cols-2 items-center gap-2 px-2"
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl sm:text-5xl font-semibold text-gray-900 flex items-baseline">
                    <span>₹</span>
                    <NumberFlow
                      value={currentPrice}
                      className="text-4xl sm:text-5xl font-semibold"
                    />
                  </span>
                  <span className="text-lg sm:text-xl text-gray-600 line-through ml-2 relative before:content-[''] before:absolute before:left-0 before:top-3.5 before:w-full before:h-0.5 before:bg-gray-800 before:z-10 flex items-baseline">
                    <span>₹</span>
                    <NumberFlow
                      value={originalPrice}
                      className="text-lg sm:text-xl font-semibold line-through"
                    />
                  </span>
                </div>
                <TimelineContent
                  as="button"
                  animationNum={3}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                  onClick={handlePurchase}
                  className="text-white text-xl font-semibold h-10 sm:h-16 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-600 cursor-pointer flex items-center justify-center transition-transform active:scale-95"
                >
                  Purchase
                </TimelineContent>
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
