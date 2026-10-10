import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function sanitizeNextPath(rawNext: string | null): string {
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

/**
 * Validates whether a given host header/value belongs to an approved origin.
 * Protects against Host Header Injection and Open Redirects via x-forwarded-host.
 */
export function isAllowedRedirectHost(rawHost: string | null | undefined): boolean {
  if (!rawHost || typeof rawHost !== "string") {
    return false;
  }

  // In case of multiple proxies, take only the first (client-provided) host
  const firstHost = rawHost.split(",")[0].trim();
  if (!firstHost) {
    return false;
  }

  // Reject control characters, schemes, slashes, backslashes, @, spaces
  if (
    firstHost.includes(" ") ||
    firstHost.includes("/") ||
    firstHost.includes("\\") ||
    firstHost.includes("@") ||
    firstHost.includes("?") ||
    firstHost.includes("#") ||
    firstHost.includes(":") && (firstHost.match(/:/g) || []).length > 1 // Reject malformed multi-colon
  ) {
    return false;
  }

  const [hostname, port] = firstHost.split(":");
  const lowerHostname = hostname.toLowerCase();

  // Validate port if present (must be digits only)
  if (port && !/^\d+$/.test(port)) {
    return false;
  }

  // 1. Check explicitly configured application URL from environment
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredAppUrl) {
    try {
      const parsedConfig = new URL(configuredAppUrl);
      if (lowerHostname === parsedConfig.hostname.toLowerCase()) {
        if (!port || port === (parsedConfig.port || (parsedConfig.protocol === "https:" ? "443" : "80"))) {
          return true;
        }
      }
    } catch {
      // Ignore malformed env var
    }
  }

  // 2. Check custom allowlist from environment (comma-separated hosts)
  const envAllowlist = process.env.ALLOWED_REDIRECT_HOSTS;
  if (envAllowlist) {
    const allowedList = envAllowlist.split(",").map((h) => h.trim().toLowerCase());
    if (allowedList.includes(lowerHostname) || allowedList.includes(firstHost.toLowerCase())) {
      return true;
    }
  }

  // 3. Project-specific Vercel deployment hosts (preview & production)
  for (const vercelEnvHost of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (vercelEnvHost) {
      try {
        const parsedVercel = new URL(vercelEnvHost.startsWith("http") ? vercelEnvHost : `https://${vercelEnvHost}`);
        if (lowerHostname === parsedVercel.hostname.toLowerCase()) {
          return true;
        }
      } catch {
        // Ignore malformed env var
      }
    }
  }

  // 4. Verified canonical production domains for Skillscatalyst
  const CANONICAL_PRODUCTION_HOSTS = new Set([
    "skillscatalyst.in",
    "www.skillscatalyst.in",
  ]);
  if (CANONICAL_PRODUCTION_HOSTS.has(lowerHostname)) {
    // Only standard web ports allowed for production domain
    if (!port || port === "443" || port === "80") {
      return true;
    }
    return false;
  }

  // 5. Development and local origins
  const DEV_HOSTS = new Set(["localhost", "127.0.0.1"]);
  if (DEV_HOSTS.has(lowerHostname)) {
    return true;
  }

  return false;
}

export type DeploymentEnvironment = "production" | "staging" | "preview" | "development" | "invalid";

/**
 * Authoritatively classifies the current runtime deployment environment.
 * Executes prior to candidate origin evaluation.
 */
export function classifyDeploymentEnvironment(): DeploymentEnvironment {
  const rawAppEnv = (process.env.APP_ENV || "").trim().toLowerCase();
  const rawEnvironment = (process.env.ENVIRONMENT || "").trim().toLowerCase();
  const rawVercelEnv = (process.env.VERCEL_ENV || "").trim().toLowerCase();

  const VALID_APP_ENVS = new Set(["production", "staging", "preview", "development", "dev", "local", ""]);
  const VALID_VERCEL_ENVS = new Set(["production", "preview", "development", ""]);

  // Reject unknown explicit environment tokens
  if (!VALID_APP_ENVS.has(rawAppEnv) || !VALID_APP_ENVS.has(rawEnvironment) || !VALID_VERCEL_ENVS.has(rawVercelEnv)) {
    return "invalid";
  }

  // Conflict between APP_ENV and ENVIRONMENT
  if (rawAppEnv && rawEnvironment && rawAppEnv !== rawEnvironment) {
    const isDev1 = rawAppEnv === "development" || rawAppEnv === "dev" || rawAppEnv === "local";
    const isDev2 = rawEnvironment === "development" || rawEnvironment === "dev" || rawEnvironment === "local";
    if (!(isDev1 && isDev2)) {
      return "invalid";
    }
  }

  const effectiveAppEnv = rawAppEnv || rawEnvironment;

  const isProdApp = effectiveAppEnv === "production";
  const isProdVercel = rawVercelEnv === "production";
  const isNonProdApp = effectiveAppEnv === "staging" || effectiveAppEnv === "preview" || effectiveAppEnv === "development" || effectiveAppEnv === "dev" || effectiveAppEnv === "local";
  const isNonProdVercel = rawVercelEnv === "preview" || rawVercelEnv === "development";

  // Reject contradictory indicators between Vercel and application environment
  if ((isProdApp && isNonProdVercel) || (isProdVercel && isNonProdApp)) {
    return "invalid";
  }

  // Reject conflicts between development and deployed preview
  const isDevApp = effectiveAppEnv === "development" || effectiveAppEnv === "dev" || effectiveAppEnv === "local";
  if (isDevApp && rawVercelEnv && rawVercelEnv !== "development") {
    return "invalid";
  }
  if (rawVercelEnv === "development" && effectiveAppEnv && !isDevApp) {
    return "invalid";
  }

  if (isProdApp || isProdVercel) {
    return "production";
  }
  if (effectiveAppEnv === "staging") {
    return "staging";
  }
  if (rawVercelEnv === "preview" || effectiveAppEnv === "preview") {
    return "preview";
  }
  if (rawVercelEnv === "development" || isDevApp) {
    return "development";
  }

  // Missing or unverified environment: fail closed, never assume production
  return "invalid";
}

/**
 * Strictly parses, normalizes, and validates a complete candidate redirect origin.
 */
export function validateAndNormalizeOrigin(candidateUrl: string, environment: DeploymentEnvironment): string | null {
  try {
    const url = new URL(candidateUrl);
    const hostname = url.hostname.toLowerCase();
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    // 1. Credentials, query strings, and fragments are strictly forbidden
    if (url.username || url.password || url.search || url.hash) {
      return null;
    }

    // 2. Base redirect origin must not contain subpaths
    if (url.pathname !== "/" && url.pathname !== "") {
      return null;
    }

    // 3. Scheme validation
    if (isLocal) {
      if (environment !== "development") {
        return null; // Localhost origins are permitted ONLY for explicitly supported development
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
      }
    } else {
      if (url.protocol !== "https:") {
        // Public origins MUST strictly be HTTPS
        return null;
      }
    }

    // 4. Port validation
    if (!isLocal) {
      // For public domains, port must be empty (implied 443) or strictly "443"
      if (url.port && url.port !== "443") {
        return null;
      }
    } else if (url.port && !/^\d+$/.test(url.port)) {
      return null;
    }

    // 5. Hostname allowlist membership
    if (!isAllowedRedirectHost(url.host)) {
      return null;
    }

    // 6. Cross-environment boundary check:
    // Staging and preview environments cannot redirect to production canonical domains
    const isProdDomain = hostname === "skillscatalyst.in" || hostname === "www.skillscatalyst.in";
    if (environment !== "production" && isProdDomain) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Resolves a trusted base origin for redirect construction.
 * Evaluates x-forwarded-host, request origin, and configured fallbacks.
 * Returns null if the origin cannot be safely verified.
 */
export function resolveRedirectOrigin(request: Request): string | null {
  const env = classifyDeploymentEnvironment();
  if (env === "invalid") {
    return null;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  // 1. If forwardedHost is present, evaluate it
  if (forwardedHost) {
    const firstHost = forwardedHost.split(",")[0].trim();
    const hostname = firstHost.split(":")[0].toLowerCase();
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    // Reject untrusted forwarded protocol for public hosts
    if (!isLocal) {
      if (forwardedProto && forwardedProto.toLowerCase() !== "https") {
        // Insecure forwarded protocol on public host rejected
      } else {
        const candidate = `https://${firstHost}`;
        const validated = validateAndNormalizeOrigin(candidate, env);
        if (validated) return validated;
      }
    } else {
      const proto = (forwardedProto && forwardedProto.toLowerCase() === "https") ? "https" : "http";
      const candidate = `${proto}://${firstHost}`;
      const validated = validateAndNormalizeOrigin(candidate, env);
      if (validated) return validated;
    }
  }

  // 2. Otherwise check if request.url's origin is valid
  try {
    const reqOrigin = new URL(request.url).origin;
    const validated = validateAndNormalizeOrigin(reqOrigin, env);
    if (validated) return validated;
  } catch {
    // Ignore invalid request URL
  }

  // 3. Fallback to configured application URL if available
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredAppUrl) {
    const validated = validateAndNormalizeOrigin(configuredAppUrl, env);
    if (validated) return validated;
  }

  // 4. Fallback to project-specific Vercel preview host (preview mode only)
  if (env === "preview" && process.env.VERCEL_URL) {
    const candidate = `https://${process.env.VERCEL_URL}`;
    const validated = validateAndNormalizeOrigin(candidate, env);
    if (validated) return validated;
  }

  // 5. Canonical fallback strictly for positively identified production
  if (env === "production") {
    return "https://www.skillscatalyst.in";
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next");
  const safeNext = sanitizeNextPath(next);

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
      return NextResponse.redirect(targetUrl.toString());
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
