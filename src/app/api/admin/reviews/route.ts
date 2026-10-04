import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

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
        newStatus = "PENDING";
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

    // Notify users
    try {
      await pusherServer.trigger("admin-channel", "mentor-status-changed", {
        mentorId,
        status: newStatus
      });

      if (newStatus === "VERIFIED") {
        await pusherServer.trigger("public-mentors", "mentor-verified", {
          mentorId
        });
        
        await prisma.notification.create({
          data: {
            userId: mentor.userId,
            type: "SYSTEM",
            message: "Your mentor application has been approved.",
            isRead: false
          }
        });
      } else if (newStatus === "REJECTED") {
        await prisma.notification.create({
          data: {
            userId: mentor.userId,
            type: "SYSTEM",
            message: "Your mentor application requires attention. Reason: " + (reason || ""),
            isRead: false
          }
        });
      }
    } catch (pushErr) {
      console.error("Pusher error:", pushErr);
    }

    // Send email notifications
    if (mentor.user?.email) {
      const email = mentor.user.email;
      const mentorName = mentor.name;
      
      try {
        if (newStatus === "VERIFIED") {
          await sendEmail({
            to: email,
            subject: "Welcome to CareerConnect as a Mentor!",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Congratulations ${mentorName}!</h2>
                <p>Your mentor application has been approved. You are now officially a verified mentor on CareerConnect.</p>
                <p>You can now start setting your availability, managing sessions, and helping job seekers advance their careers.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/mentor/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
              </div>
            `,
          });
        } else if (newStatus === "REJECTED") {
          await sendEmail({
            to: email,
            subject: "Update on your Mentor Application",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hi ${mentorName},</h2>
                <p>We've reviewed your mentor application. Unfortunately, it has been rejected at this time.</p>
                ${reason ? `<p><strong>Reason provided:</strong> ${reason}</p>` : ''}
                <p>You can log in to view more details and update your application if applicable.</p>
              </div>
            `,
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
