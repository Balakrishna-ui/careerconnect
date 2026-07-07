import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/reviews/logs?mentorId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId");

    if (!mentorId) {
      return NextResponse.json({ error: "Missing mentorId" }, { status: 400 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: "MENTOR",
        entityId: mentorId,
      },
      include: {
        admin: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
