"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import SkillsCatalystLanding from "@/components/landing/SkillsCatalystLanding";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/dashboard");
    }
  }, [session, isLoading, router]);

  // If already authenticated and redirecting, avoid flash
  if (!isLoading && session) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#06070d" }} />
    );
  }

  return <SkillsCatalystLanding />;
}

