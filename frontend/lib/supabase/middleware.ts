import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zzjxprhapptjoziwdcro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6anhwcmhhcHB0am96aXdkY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDgzODgsImV4cCI6MjEwMDg4NDM4OH0.-bweaY3kcKetY7PrW2FY78krtvMs34GSBWNaEWarXFo";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/support") ||
    isAuthPage ||
    isCallbackPage ||
    pathname.startsWith("/api/");

  // Protected route check: if unauthenticated and trying to access private application routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If already authenticated and accessing login page, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
