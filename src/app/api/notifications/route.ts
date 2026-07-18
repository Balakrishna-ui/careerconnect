import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { mentorProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch notifications where userId matches OR mentorId matches
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.mentorProfile ? [{ mentorId: user.mentorProfile.id }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { mentorProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    const mentorId = user.mentorProfile?.id;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
            ...(mentorId ? [{ mentorId: mentorId }] : [])
          ],
          isRead: false
        },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (notificationId) {
      // Ensure the notification belongs to the user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
      });

      if (!notification || (notification.userId !== user.id && notification.mentorId !== mentorId)) {
        return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });

      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
