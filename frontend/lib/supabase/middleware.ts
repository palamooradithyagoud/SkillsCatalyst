
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // IMPORTANT: Avoid placing logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could cause users to be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/login";
  const isCallbackPage = pathname.startsWith("/auth/callback");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname.startsWith("/pricing/") ||
    pathname.startsWith("/ai-mentor") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/cookie") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/certificate-preview") ||
    pathname.startsWith("/career/resume-builder") ||
    pathname.startsWith("/practice") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/reset-password" ||
    isAuthPage ||
    isCallbackPage ||
    pathname.startsWith("/api/");

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

  // 1. Admin route protection: requires authenticated session with authoritative 'owner' role
  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const userRole = (user.app_metadata?.role || "").toString().toLowerCase();
    const isAuthorized = userRole === "owner" || userRole === "admin";
    if (!isAuthorized) {
      // Authenticated student or non-admin attempting /admin: redirect to student dashboard (NEVER log out)
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 2. Protected route check: if unauthenticated and trying to access private application routes
  if (!user && isExplicitProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2b. Recovery containment check: if an authenticated session is in recovery flow (sc_recovery_flow cookie is set),
  // prevent navigating to protected app routes (e.g. dashboard, learning) until the password has been reset.
  if (user && isExplicitProtectedRoute && request.cookies.get("sc_recovery_flow")?.value === "true") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("mode", "reset");
    return NextResponse.redirect(url);
  }

  // 3. If already authenticated and accessing login page, redirect to dashboard UNLESS in recovery reset mode
  if (user && isAuthPage) {
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
