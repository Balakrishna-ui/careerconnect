import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Mentor dashboard routes
    if (path.startsWith("/mentor/dashboard")) {
      if (!token) return NextResponse.redirect(new URL("/signup?view=login", req.url));
      if (token.role !== "MENTOR" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/signup?view=login", req.url));
      }
    }

    // Job Seeker dashboard routes
    if (path === "/dashboard" || path.startsWith("/dashboard/")) {
      if (!token) return NextResponse.redirect(new URL("/signup?view=login", req.url));
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

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always return true so the middleware function can handle the redirects per-path
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/mentor/dashboard/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
