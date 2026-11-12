import Link from "next/link";
import { ArrowLeft, Home, Tag, ShieldCheck, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06070d] text-white flex flex-col items-center justify-center px-4 py-16 selection:bg-[#d5ff38] selection:text-black">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Subtle Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141b05] border border-[#d5ff38]/30 text-[#d5ff38] text-xs font-bold tracking-widest uppercase">
          <Compass className="w-3.5 h-3.5 text-[#d5ff38]" />
          <span>SkillsCatalyst Directory</span>
        </div>

        {/* 404 Hero Number */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-white">
          4<span className="text-[#d5ff38]">0</span>4
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
            The link you visited does not exist or may have been moved. Let&apos;s get you back on track with your learning and career goals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#d5ff38] hover:bg-[#c4ec32] text-[#0C0D12] font-black text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>View Pricing</span>
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Credential</span>
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-6">
          Need assistance? Contact our team at{" "}
          <a
            href="mailto:support@skillscatalyst.in"
            className="text-[#d5ff38] hover:underline font-semibold"
          >
            support@skillscatalyst.in
          </a>
        </p>
      </div>
    </div>
  );
}
