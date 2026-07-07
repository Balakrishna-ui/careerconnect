import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Mentor dashboard routes
    // For now, assuming anyone with role "MENTOR" is an approved mentor. 
    // Further granular checks (like applicationStatus = VERIFIED) could be done here or in the layout.
    if (path.startsWith("/mentor/dashboard") && token?.role !== "MENTOR" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/signup?view=login", req.url));
    }

    // Job Seeker dashboard routes
    if (path === "/dashboard" || path.startsWith("/dashboard/")) {
      if (token?.role !== "JOB_SEEKER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/signup?view=login", req.url));
      }
    }

    // Booking routes (Premium required)
    if (path.startsWith("/book") && !token?.premium) {
      // Redirect to premium unlock page
      return NextResponse.redirect(new URL("/premium", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
