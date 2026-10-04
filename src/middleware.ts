import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Simple in-memory rate limit (Note: resets per Edge instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 200;

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    // --- SECURITY & FINGERPRINTING ---
    // Extract IP and headers
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const language = req.headers.get("accept-language") || "unknown";
    
    // Create a simple device fingerprint hash using Edge-compatible crypto
    const rawFingerprint = `${ip}-${userAgent}-${language}`;
    // (A real production app would use WebCrypto to hash this, we'll pass the raw string to be hashed by the API)
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-client-ip", ip);
    requestHeaders.set("x-device-fingerprint", rawFingerprint);

    // Rate Limiting Logic
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };
    
    if (now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
    }
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    // ---------------------------------

    const isAuthRoute = path.startsWith("/signup") || path.startsWith("/login") || path === "/";
    const isPublicRoute = isAuthRoute || path === "/about" || path.startsWith("/mentors") || path.startsWith("/companies");

    // We no longer forcefully redirect authenticated users away from public/auth routes here.
    // If a session is invalidated in the database, forcing a redirect here causes an infinite loop
    // because the middleware sees the stale JWT as valid, but getServerSession sees it as invalid.
    
    // Admin routes
    if (path.startsWith("/admin") && path !== "/admin-login") {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
    }

    // Mentor portal routes
    if (path.startsWith("/mentor") && path !== "/mentor/apply") {
      if (!token) return NextResponse.redirect(new URL("/signup?view=login&type=mentor", req.url));
      if (token.role === "JOB_SEEKER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (token.role !== "MENTOR" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/signup?view=login&type=mentor", req.url));
      }
    }

    // Job Seeker dashboard routes
    if (path === "/dashboard" || path.startsWith("/dashboard/")) {
      if (!token) return NextResponse.redirect(new URL("/signup?view=login", req.url));
      if (token.role === "MENTOR") {
        return NextResponse.redirect(new URL("/mentor/dashboard", req.url));
      }
      if (token.role !== "JOB_SEEKER" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/signup?view=login", req.url));
      }
    }

    // Booking routes (Premium required)
    if (path.startsWith("/book")) {
      if (!token) return NextResponse.redirect(new URL("/signup?view=login", req.url));
      if (!token.premium) {
        return NextResponse.redirect(new URL("/premium", req.url));
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_development",
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
