import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;
    if (!isCronAuthorized) {
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    // 1. Mark PENDING sessions whose startTime has passed as EXPIRED
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        startTime: {
          lt: now,
        },
      },
    });

    if (expiredBookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: expiredBookings.map((b) => b.id) },
        },
        data: {
          status: "EXPIRED",
        },
      });
      // Optionally trigger notifications for EXPIRED sessions here
    }

    // 2. Mark CONFIRMED sessions whose endTime has passed (and weren't completed) as MISSED
    const missedBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        endTime: {
          lt: now,
        },
      },
    });

    if (missedBookings.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: missedBookings.map((b) => b.id) },
        },
        data: {
          status: "MISSED",
        },
      });
      // Optionally trigger notifications for MISSED sessions here
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredBookings.length,
      missedCount: missedBookings.length,
      message: "Session cleanup complete.",
    });
  } catch (error) {
    console.error("[CRON_CLEANUP_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
