"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [session, isLoading, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060a15]">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

