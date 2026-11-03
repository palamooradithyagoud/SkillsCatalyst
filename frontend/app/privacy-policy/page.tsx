import React from "react";
import type { Metadata } from "next";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | SkillsCatalyst",
  description: "Official Privacy Policy for SkillsCatalyst — DPDP Act 2023 & GDPR compliant student data protection.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
