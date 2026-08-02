"use client";

import React from "react";
import ExploreIcon from "@/components/icons/ExploreIcon";

interface ExploreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
}

export default function ExploreButton({
  text = "Explore",
  className = "",
  ...props
}: ExploreButtonProps) {
  return (
    <button className={`Explore-Button ${className}`} {...props}>
      <ExploreIcon />
      {text && <span className="text">{text}</span>}
    </button>
  );
}
