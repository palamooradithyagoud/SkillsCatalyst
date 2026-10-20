"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function ResetPasswordRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    const params = new URLSearchParams(search);
    params.set("mode", "reset");

    router.replace(`/login?${params.toString()}${hash}`);
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-white text-[#18191F] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
        <span className="text-sm font-medium text-zinc-600">Redirecting to login reset...</span>
      </div>
    </div>
  );
}
