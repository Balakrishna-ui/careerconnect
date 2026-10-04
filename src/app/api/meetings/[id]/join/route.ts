import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canJoinMeeting } from "@/lib/session-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        mentor: true,
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    // Security: Only the assigned mentor or the booked user can join
    const isMentor = booking.mentor.userId === session.user.id;
    const isUser = booking.userId === session.user.id;

    if (!isMentor && !isUser) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!booking.meetingLink) {
      return new NextResponse("Meeting link not available", { status: 404 });
    }

    // Time-based access check
    if (!canJoinMeeting(booking)) {
      return new NextResponse(
        "Meeting is not currently accessible. Please wait for the scheduled time.", 
        { status: 403 }
      );
    }

    // Redirect to the actual meeting link
    const targetUrl = booking.meetingLink.startsWith("http://") || booking.meetingLink.startsWith("https://")
      ? booking.meetingLink
      : `https://${booking.meetingLink}`;

    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error("[MEETING_JOIN_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
