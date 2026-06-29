import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/reviews — Admin reviews a mentor application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorId, adminId, action, reason } = body;

    if (!mentorId || !adminId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map action to status
    let newStatus: string;
    switch (action) {
      case "APPROVE":
        newStatus = "VERIFIED";
        break;
      case "REJECT":
        newStatus = "REJECTED";
        break;
      case "REQUEST_MORE_INFO":
        newStatus = "MORE_INFO_REQUIRED";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the current mentor status for audit
    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const previousStatus = mentor.applicationStatus;

    // Update mentor status
    await prisma.mentor.update({
      where: { id: mentorId },
      data: { applicationStatus: newStatus },
    });

    // Create admin review record
    await prisma.adminReview.create({
      data: {
        mentorId,
        adminId,
        statusGiven: newStatus,
        reason: reason || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId,
        action: `${action}_MENTOR`,
        entityType: "MENTOR",
        entityId: mentorId,
        details: JSON.stringify({
          previousStatus,
          newStatus,
          reason: reason || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      mentorId,
      previousStatus,
      newStatus,
    });
  } catch (error) {
    console.error("Admin review error:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}

// GET /api/admin/reviews — Get pending applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const mentors = await prisma.mentor.findMany({
      where: { applicationStatus: status },
      include: {
        skills: true,
        sessionTypes: true,
        socialProfiles: true,
        documents: true,
        adminReviews: {
          include: { admin: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        user: { select: { email: true, mobile: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ mentors: JSON.parse(JSON.stringify(mentors)) });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
