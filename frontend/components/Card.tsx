"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "neu" | "glass" | "solid" | "plain";
  className?: string;
  fixedSize?: boolean;
}

/**
 * Morphing Card Component
 * Features smooth cubic-bezier 1s morphing corner border-radius and scale on hover.
 */
export default function Card({
  children,
  variant = "glass",
  className = "",
  fixedSize = false,
  ...props
}: CardProps) {
  const variantClass =
    variant === "neu"
      ? "card"
      : variant === "glass"
      ? "glass card-morph"
      : "card-morph";

  const sizeClass = fixedSize ? "w-[200px] h-[260px]" : "";

  return (
    <div
      className={`${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
