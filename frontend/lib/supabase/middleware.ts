import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/login";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isExplicitProtectedRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/") ||
    pathname === "/learning" || pathname.startsWith("/learning/") ||
    pathname === "/roadmaps" || pathname.startsWith("/roadmaps/") ||
    pathname === "/skillbits" || pathname.startsWith("/skillbits/") ||
    pathname === "/scholarships" || pathname.startsWith("/scholarships/") ||
    pathname === "/tech-news" || pathname.startsWith("/tech-news/") ||
    pathname === "/profile" || pathname.startsWith("/profile/") ||
    pathname === "/settings" || pathname.startsWith("/settings/") ||
    pathname === "/analytics" || pathname.startsWith("/analytics/") ||
    pathname === "/certificates" || pathname.startsWith("/certificates/") ||
    pathname === "/explore" || pathname.startsWith("/explore/") ||
    pathname === "/resume-review" || pathname.startsWith("/resume-review/") ||
    (pathname.startsWith("/career") && !pathname.startsWith("/career/resume-builder"));

  // Fast path: public pages and API routes do not require middleware session verification
  if (!isAdminRoute && !isExplicitProtectedRoute && !isAuthPage) {
    return supabaseResponse;
  }

  // Fast path: without a Supabase session cookie, no user can be authenticated
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasAuthCookie) {
    if (isAdminRoute || isExplicitProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables in middleware.");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Admin route protection: always verify authoritatively via getUser() on Supabase Auth server
  if (isAdminRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = (user.app_metadata?.role || "").toString().toLowerCase();
    const isAuthorized = userRole === "owner" || userRole === "admin";
    if (!isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // Verify JWT locally via cached ES256 JWKS (refreshes expiring tokens automatically, avoids remote network RTT per click)
  const { data: claimsData } = await supabase.auth.getClaims();
  const hasVerifiedSession = Boolean(claimsData?.claims?.sub);

  // 2. Protected route check: if unauthenticated and trying to access private application routes
  if (!hasVerifiedSession && isExplicitProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2b. Recovery containment check: contain active recovery sessions to password reset until completed
  if (hasVerifiedSession && isExplicitProtectedRoute && request.cookies.get("sc_recovery_flow")?.value === "true") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("mode", "reset");
    return NextResponse.redirect(url);
  }

  // 3. If already authenticated and accessing login page, redirect to dashboard UNLESS in recovery reset mode
  if (hasVerifiedSession && isAuthPage) {
    const isRecoveryMode =
      request.nextUrl.searchParams.get("mode") === "reset" ||
      request.cookies.get("sc_recovery_flow")?.value === "true";

    if (!isRecoveryMode) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
