import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    const isAuthRoute = path.startsWith("/signup") || path.startsWith("/login") || path === "/";
    const isPublicRoute = isAuthRoute || path === "/about" || path.startsWith("/mentors") || path.startsWith("/companies");

    if (token) {
      if (token.role === "MENTOR" && isPublicRoute) {
        return NextResponse.redirect(new URL("/mentor/dashboard", req.url));
      }
      if (token.role === "JOB_SEEKER" && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (token.role === "ADMIN" && (isPublicRoute || path === "/admin-login")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Admin routes
    if (path.startsWith("/admin") && path !== "/admin-login") {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
    }

    // Mentor dashboard routes
    if (path.startsWith("/mentor/dashboard") || path.startsWith("/mentor/profile") || path.startsWith("/mentor/availability") || path.startsWith("/mentor/bookings") || path.startsWith("/mentor/earnings") || path.startsWith("/mentor/reviews") || path.startsWith("/mentor/session-pricing")) {
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
    secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_development",
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
