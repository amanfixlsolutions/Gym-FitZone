/**
 * Next.js 16 Proxy — Server-side route guards
 * (Renamed from middleware.ts → proxy.ts per Next.js 16 convention)
 *
 * Reads JWT from cookie, enforces role-based access,
 * redirects unauthorized users before the page renders.
 *
 * Runs on the Node.js runtime (Next.js 16+).
 */

import { NextRequest, NextResponse } from "next/server";

// ── Route → required roles map ─────────────────────────────────────
const PROTECTED_ROUTES: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/super-admin(\/.*)?$/, roles: ["super-admin"] },
  { pattern: /^\/gym-owner(\/.*)?$/,   roles: ["gym-owner"] },
  { pattern: /^\/finances(\/.*)?$/,    roles: ["gym-owner", "super-admin"] },
];

// ── Public routes — never redirect ────────────────────────────────
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/checkin",
  "/_next",
  "/favicon.ico",
  "/api",
];

// ── Minimal JWT decode (no verification — proxy runtime) ──────────
// We only need the payload claims for routing decisions.
// Actual signature verification happens on the backend for every API call.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json    = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Skip public routes ─────────────────────────────────────────
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── Find matching protected route ──────────────────────────────
  const match = PROTECTED_ROUTES.find((r) => r.pattern.test(pathname));
  if (!match) return NextResponse.next(); // unprotected page

  // ── Extract token from cookie ──────────────────────────────────
  // The frontend stores the token in localStorage/sessionStorage (client-side only).
  // For proxy we read a `fitzone_token` cookie if set.
  // If no cookie is present, let the client-side RoleGuard handle it
  // (avoids false redirects when token is only in sessionStorage).
  const tokenCookie = req.cookies.get("fitzone_token")?.value;

  if (!tokenCookie) {
    return NextResponse.next();
  }

  const payload = decodeJwtPayload(tokenCookie);

  if (!payload) {
    // Malformed token — redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "invalid_token");
    return NextResponse.redirect(loginUrl);
  }

  // ── Check expiry ───────────────────────────────────────────────
  const exp = payload.exp as number | undefined;
  if (exp && Date.now() / 1000 > exp) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "session_expired");
    return NextResponse.redirect(loginUrl);
  }

  // ── Check role ─────────────────────────────────────────────────
  const role = payload.role as string | undefined;
  if (!role || !match.roles.includes(role)) {
    // Wrong role — redirect to their correct dashboard
    const redirectUrl = req.nextUrl.clone();
    if (role === "super-admin") {
      redirectUrl.pathname = "/super-admin";
    } else if (role === "gym-owner") {
      redirectUrl.pathname = "/gym-owner";
    } else {
      redirectUrl.pathname = "/";
    }
    redirectUrl.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
