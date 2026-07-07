import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// POST /api/admin/reviews — Admin reviews a mentor application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId, action, reason } = body;

    if (!mentorId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map action to status
    let newStatus: string;
    switch (action) {
      case "APPROVE":
        newStatus = "VERIFIED";
        break;
      case "REJECT":
        if (!reason || reason.trim().length < 20) {
          return NextResponse.json({ error: "Reject reason must be at least 20 characters long" }, { status: 400 });
        }
        newStatus = "REJECTED";
        break;
      case "REQUEST_MORE_INFO":
        newStatus = "MORE_INFO_REQUIRED";
        break;
      case "REOPEN":
        newStatus = "UNDER_REVIEW";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the current mentor status for audit
    const mentor = await prisma.mentor.findUnique({ 
      where: { id: mentorId },
      include: { user: true }
    });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const previousStatus = mentor.applicationStatus;

    // Update mentor status
    await prisma.mentor.update({
      where: { id: mentorId },
      data: { 
        applicationStatus: newStatus,
        ...(newStatus === "VERIFIED" ? { profileCompleted: true } : {})
      },
    });

    if (newStatus === "VERIFIED") {
      await prisma.user.update({
        where: { id: mentor.userId },
        data: { role: "MENTOR" },
      });
    }

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

    // Send email notifications
    if (mentor.user?.email) {
      const email = mentor.user.email;
      try {
        if (action === "REJECT") {
          await sendEmail({
            to: email,
            subject: "Update on your Mentor Application",
            html: `<p>Your mentor application has been rejected.</p><p><strong>Reason:</strong><br/>${reason}</p><p>You may update your information and reapply later.</p>`
          });
        } else if (action === "REOPEN") {
          await sendEmail({
            to: email,
            subject: "Your Mentor Application has been reopened",
            html: `<p>Your application has been reopened.</p><p>The admin is reviewing your application again.</p>`
          });
        } else if (action === "REQUEST_MORE_INFO") {
          let docsNeeded = "";
          let deadline = "";
          let msg = reason || "";
          try {
            const parsed = JSON.parse(reason || "{}");
            if (parsed.message) msg = parsed.message;
            if (parsed.documents) docsNeeded = parsed.documents;
            if (parsed.deadline) deadline = parsed.deadline;
          } catch(e) {}
          await sendEmail({
            to: email,
            subject: "Action Required: Update your Mentor Application",
            html: `<p>Additional information is required for your mentor application.</p><p><strong>Message:</strong><br/>${msg}</p>${docsNeeded ? `<p><strong>Documents Needed:</strong><br/>${docsNeeded}</p>` : ''}${deadline ? `<p><strong>Deadline:</strong><br/>${deadline}</p>` : ''}`
          });
        }
      } catch (err) {
        console.error("Failed to send notification email", err);
      }
    }

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

// DELETE /api/admin/reviews — Admin deletes a mentor application completely
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId");

    if (!mentorId) {
      return NextResponse.json({ error: "Missing mentorId" }, { status: 400 });
    }

    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Downgrade user role to USER
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { role: "USER" },
    });

    // Cascade delete mentor - relying on schema onDelete: Cascade for documents, reviews, logs (if linked)
    // Wait, AuditLog entityId is string but not foreign keyed. AdminReview is foreign keyed.
    await prisma.auditLog.deleteMany({
      where: { entityType: "MENTOR", entityId: mentorId }
    });

    await prisma.mentor.delete({
      where: { id: mentorId }
    });

    return NextResponse.json({ success: true, message: "Application deleted permanently" });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
