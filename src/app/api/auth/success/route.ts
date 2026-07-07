import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.redirect(new URL("/signup?view=login", req.url));
    }

    const role = session.user.role;

    if (role === "MENTOR") {
      return NextResponse.redirect(new URL("/mentor/dashboard", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("Auth success route error:", error);
    return NextResponse.redirect(new URL("/signup?view=login&error=CallbackFailed", req.url));
  }
}
