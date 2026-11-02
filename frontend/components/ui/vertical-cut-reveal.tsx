"use client";

import React from "react";
import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

export interface VerticalCutRevealProps {
  children: string;
  splitBy?: "words" | "characters" | "lines";
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  reverse?: boolean;
  containerClassName?: string;
  wordClassName?: string;
  transition?: Transition;
}

export function VerticalCutReveal({
  children,
  splitBy = "words",
  staggerDuration = 0.1,
  staggerFrom = "first",
  reverse = false,
  containerClassName,
  wordClassName,
  transition = {
    type: "spring",
    stiffness: 250,
    damping: 35,
  },
}: VerticalCutRevealProps) {
  const words = typeof children === "string" ? children.split(" ") : [String(children)];

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-[0.28em] overflow-visible",
        containerClassName
      )}
    >
      {words.map((word, index) => {
        const delay =
          staggerFrom === "last"
            ? (words.length - 1 - index) * staggerDuration
            : index * staggerDuration;

        return (
          <span
            key={index}
            className={cn("inline-block overflow-hidden pb-[0.08em] align-baseline", wordClassName)}
          >
            <motion.span
              className="inline-block"
              initial={{ y: reverse ? "-110%" : "110%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                ...transition,
                delay: (transition?.delay || 0) + delay,
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

export default VerticalCutReveal;

