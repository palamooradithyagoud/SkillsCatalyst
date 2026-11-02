"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLElement> {
  as?: any;
  animationNum?: number;
  timelineRef?: React.RefObject<any>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<any>;
}

export function TimelineContent({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const Component = (motion as any)[as] || motion.div;

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <Component
      custom={animationNum}
      variants={customVariants || defaultVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default TimelineContent;

