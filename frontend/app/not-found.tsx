import Link from "next/link";
import { ArrowLeft, Home, Tag, ShieldCheck, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06070d] text-white flex flex-col items-center justify-center px-4 py-16 selection:bg-purple-600 selection:text-white">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Subtle Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-widest uppercase">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>SkillsCatalyst Directory</span>
        </div>

        {/* 404 Hero Number */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">
          404
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <Tag className="w-4 h-4 text-purple-400" />
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
            className="text-purple-400 hover:text-purple-300 font-semibold underline"
          >
            support@skillscatalyst.in
          </a>
        </p>
      </div>
    </div>
  );
}
