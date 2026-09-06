import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(rawNext: string | null): string {
  if (!rawNext) return "/dashboard";

  // Must be a relative path starting with single '/' and not '//'
  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/dashboard";
  }

  // Reject backslashes, schemes, path traversals, and encoded traversal variants
  if (
    rawNext.includes("\\") ||
    rawNext.includes("://") ||
    rawNext.includes("/..") ||
    rawNext.includes("/.") ||
    rawNext.toLowerCase().includes("%2f") ||
    rawNext.toLowerCase().includes("%5c")
  ) {
    return "/dashboard";
  }

  try {
    const parsed = new URL(rawNext, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return "/dashboard";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/dashboard";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next");
  const safeNext = sanitizeNextPath(next);

  // Handle OAuth provider error returned directly in query params
  if (error) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    } else {
      const redirectUrl = new URL("/login", origin);
      redirectUrl.searchParams.set("error", exchangeError.message || "Failed to exchange auth code");
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Fallback if no code and no error
  const fallbackUrl = new URL("/login", origin);
  fallbackUrl.searchParams.set("error", "No authorization code provided");
  return NextResponse.redirect(fallbackUrl.toString());
}
