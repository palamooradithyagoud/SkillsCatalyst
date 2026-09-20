import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin CMS | SkillsCatalyst",
  description: "Platform Governance & Content Management System for SkillsCatalyst",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {children}
    </div>
  );
}
