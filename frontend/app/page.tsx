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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a15] text-white select-none">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse">
        INITIALIZING SKILLSCATALYST...
      </p>
    </div>
  );
}
