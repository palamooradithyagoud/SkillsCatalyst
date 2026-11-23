import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath, resolveRedirectOrigin } from "@/lib/authRedirect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next");
  const type = searchParams.get("type");

  // Determine recovery context:
  // Explicitly requested via next=/reset-password or next=/login?mode=reset or indicated by type=recovery
  const isRecovery =
    type === "recovery" ||
    next === "/reset-password" ||
    next?.startsWith("/reset-password") ||
    next === "/login?mode=reset" ||
    next?.startsWith("/login?mode=reset") ||
    next?.includes("mode=reset");

  // Always route password recovery directly to the login page in reset mode
  const targetNext = isRecovery ? "/login?mode=reset" : next;
  const safeNext = sanitizeNextPath(targetNext);

  // Resolve trusted destination origin
  const trustedOrigin = resolveRedirectOrigin(request);

  // Controlled HTTP 500 response without external redirect
  if (!trustedOrigin) {
    return new NextResponse(
      JSON.stringify({
        error: "ConfigurationError",
        message: "Invalid or unverified OAuth redirect origin configuration.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle OAuth provider error returned directly in query params
  if (error) {
    const redirectUrl = new URL("/login", trustedOrigin);
    redirectUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const targetUrl = new URL(safeNext, trustedOrigin);
      // Extra defense: verify origin match to prevent any scheme smuggling
      if (targetUrl.origin !== new URL(trustedOrigin).origin) {
        return NextResponse.redirect(new URL("/dashboard", trustedOrigin).toString());
      }

      const response = NextResponse.redirect(targetUrl.toString());

      // If this session exchange was for password recovery, set a short-lived recovery indicator cookie
      if (isRecovery || safeNext.startsWith("/login?mode=reset") || safeNext === "/reset-password") {
        response.cookies.set("sc_recovery_flow", "true", {
          path: "/",
          httpOnly: false, // Accessible by client JS so it can be verified and cleared after password reset
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 900, // 15 minutes
        });
      }

      return response;
    } else {
      const redirectUrl = new URL("/login", trustedOrigin);
      redirectUrl.searchParams.set("error", exchangeError.message || "Failed to exchange auth code");
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Fallback if no code and no error
  const fallbackUrl = new URL("/login", trustedOrigin);
  fallbackUrl.searchParams.set("error", "No authorization code provided");
  return NextResponse.redirect(fallbackUrl.toString());
}
